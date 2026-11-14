"use client";

import { useContext, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  BoxGeometry,
  Color,
  DoubleSide,
  InstancedMesh,
  LinearMipmapLinearFilter,
  Matrix4,
  MeshPhysicalMaterial,
  NearestFilter,
  RepeatWrapping,
  SRGBColorSpace,
  Vector2,
  Vector3,
  type Group,
  type Material,
  type Ray,
  type Texture,
} from "three";
import { CORE, EBF, HOVER, LIGHT, MATERIAL } from "@/lib/config";
import { KINDS, structureOf, type KindId, type Machine } from "@/lib/machines";
import {
  FACES,
  approach,
  createBlockPicker,
  cursorWeight,
  explodedPosition,
  hoverRadius,
  domeLayout,
  domePosition,
  domeScale,
  domeWeights,
  type Block,
  type BlockKind,
  type Vec3,
} from "@/lib/structure";
import { PointerContext, type Pointer } from "@/lib/store";

const GT = "/textures/gregtech";
export const DETAIL_URLS = {
  metalNormal: "/textures/pbr/metal-normal.webp",
  metalRoughness: "/textures/pbr/metal-roughness.webp",
};

/** Какие файлы текстур нужны постройке: у каждого вида — своя, плюс основа и свечение грани. */
function textureUrls(kindIds: readonly string[]): Record<string, string> {
  const names = new Set<string>();
  for (const id of kindIds) {
    const kind: BlockKind = KINDS[id as KindId];
    names.add(kind.texture);
    if (kind.face) names.add(kind.face.base);
    if (kind.glow) names.add(kind.glow);
  }
  return Object.fromEntries([...names].map((name) => [name, `${GT}/${name}.webp`]));
}

/**
 * Текстуры мода 16×16: при увеличении — «ближайший сосед» (пиксели остаются
 * квадратами, как в игре), при уменьшении — обычные мип-уровни с анизотропией,
 * иначе дальние грани рябят.
 */
export function setupPixelTexture(texture: Texture): void {
  texture.magFilter = NearestFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.anisotropy = MATERIAL.anisotropy;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
}

/** Настоящие PBR-карты металла: линейная фильтрация, повтор, анизотропия. */
export function setupDetailTexture(texture: Texture): void {
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(MATERIAL.detailRepeat, MATERIAL.detailRepeat);
  texture.anisotropy = MATERIAL.anisotropy;
  texture.needsUpdate = true;
}

export interface Detail {
  readonly metalNormal: Texture;
  readonly metalRoughness: Texture;
}

/** Материал блока. Цвет — пиксельная текстура мода, блик и рельеф — настоящие карты металла. */
export function blockMaterial(kind: BlockKind, map: Texture, detail: Detail, glow?: Texture): MeshPhysicalMaterial {
  const material = new MeshPhysicalMaterial({
    map,
    normalMap: detail.metalNormal,
    normalScale: new Vector2(MATERIAL.detailNormalScale, MATERIAL.detailNormalScale),
    roughnessMap: detail.metalRoughness,
    metalness: kind.isMatte ? 0 : kind.isHot ? MATERIAL.coilMetalness : MATERIAL.casingMetalness,
    roughness: kind.isMatte ? MATERIAL.matteRoughness : kind.isHot ? MATERIAL.coilRoughness : MATERIAL.casingRoughness,
    sheen: kind.isCool ? 0 : MATERIAL.sheen,
    sheenRoughness: MATERIAL.sheenRoughness,
    sheenColor: new Color(MATERIAL.sheenColor),
  });
  if (kind.isHot) {
    material.emissiveMap = map;
    material.emissive = new Color(MATERIAL.coilEmissiveColor);
    material.emissiveIntensity = MATERIAL.coilEmissiveIntensity;
  }
  if (glow) {
    material.emissiveMap = glow;
    material.emissive = new Color(MATERIAL.controllerEmissiveColor);
    material.emissiveIntensity = MATERIAL.controllerEmissiveIntensity;
  }
  if (kind.isCutout) {
    material.alphaTest = MATERIAL.cutoutThreshold;
    material.side = DoubleSide;
  }
  if (kind.isGlass) {
    material.transparent = true;
    material.opacity = MATERIAL.glassOpacity;
    material.depthWrite = false;
  }
  return material;
}

interface KindMaterials {
  readonly base: MeshPhysicalMaterial;
  /** Материал грани с рисунком; у простых блоков его нет. */
  readonly face?: MeshPhysicalMaterial;
}

function buildMaterials(kindIds: readonly string[], textures: Record<string, Texture>, detail: Detail): Record<string, KindMaterials> {
  return Object.fromEntries(
    kindIds.map((id) => {
      const kind: BlockKind = KINDS[id as KindId];
      if (!kind.face) return [id, { base: blockMaterial(kind, textures[kind.texture], detail) }];
      return [
        id,
        {
          base: blockMaterial(kind, textures[kind.face.base], detail),
          face: blockMaterial(kind, textures[kind.texture], detail, kind.glow ? textures[kind.glow] : undefined),
        },
      ];
    }),
  );
}

/**
 * Блоки одного вида и с рисунком на одной и той же грани рисуются одним
 * вызовом видеокарты (InstancedMesh): у плазменной кузницы больше пяти тысяч
 * блоков, и по вызову на блок кадр стоил 54 мс. Для каждого блока — в каком
 * наборе он лежит и под каким номером.
 */
interface Batches {
  readonly meshes: readonly InstancedMesh[];
  readonly slots: readonly { readonly mesh: InstancedMesh; readonly instance: number }[];
}

function buildBatches(blocks: readonly Block[], materials: Record<string, KindMaterials>, geometry: BoxGeometry): Batches {
  const groups = new Map<string, number[]>();
  blocks.forEach((block, index) => {
    const key = [block.kind, materials[block.kind].face ? block.face : ""].join(":");
    groups.set(key, [...(groups.get(key) ?? []), index]);
  });
  const matrix = new Matrix4();
  const slots: { mesh: InstancedMesh; instance: number }[] = [];
  const meshes = [...groups.values()].map((indices) => {
    const first = blocks[indices[0]];
    const mesh = new InstancedMesh(geometry, materialsFor(first, materials), indices.length);
    mesh.castShadow = !(KINDS[first.kind as KindId] as BlockKind).isGlass;
    mesh.receiveShadow = true;
    // Блоки разъезжаются за рамку, посчитанную по их домашним местам, — без этого их бы отсекало.
    mesh.frustumCulled = false;
    indices.forEach((blockIndex, instance) => {
      mesh.setMatrixAt(instance, matrix.makeTranslation(...blocks[blockIndex].home));
      slots[blockIndex] = { mesh, instance };
    });
    return mesh;
  });
  return { meshes, slots };
}

/** Шесть материалов куба: рисунок — только на одной грани, остальное — основа. */
function materialsFor(block: Block, materials: Record<string, KindMaterials>): Material | Material[] {
  const { base, face } = materials[block.kind];
  if (!face || !block.face) return base;
  return FACES.map((side) => (side === block.face ? face : base));
}

interface Structure3DProps {
  readonly machine: Machine;
  readonly shadows: boolean;
  /**
   * Свой точечный свет внутри постройки. По умолчанию есть. В цехе, где построек
   * много, свет оставлен только у тех, в ком горит огонь: каждый источник света
   * пересчитывается для каждого пикселя, и десяток источников заметно тормозит.
   */
  readonly hasLight?: boolean;
}

export function Structure3D({ machine, shadows, hasLight = true }: Structure3DProps) {
  /** Где курсор над этой сценой; у каждой сцены свой источник. */
  const getPointer = useContext(PointerContext);
  const structure = useMemo(() => structureOf(machine), [machine]);
  const kindIds = useMemo(() => [...new Set(structure.blocks.map((block) => block.kind))], [structure]);
  const textures = useTexture(useMemo(() => textureUrls(kindIds), [kindIds])) as Record<string, Texture>;
  const detail = useTexture(DETAIL_URLS) as Detail;

  /** Текущее раздвижение каждого блока, от 0 до 1. Плавно идёт за курсором. */
  const weights = useRef<number[]>([]);
  const homes = useMemo(() => structure.blocks.map((block) => new Vector3(...block.home)), [structure]);
  const cursor = useMemo(() => new Vector2(), []);
  const root = useRef<Group>(null);
  /** Место блока в мире: постройка может стоять не в начале координат и быть повёрнута (цех). */
  const worldHome = useMemo(() => new Vector3(), []);
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  // Кадры рисуются только по требованию, поэтому после настройки текстур кадр
  // надо заказать явно — иначе постройка появится только при первом движении мыши.
  useLayoutEffect(() => {
    Object.values(textures).forEach(setupPixelTexture);
    Object.values(detail).forEach(setupDetailTexture);
    invalidate();
  }, [textures, detail, invalidate]);

  // Тени зависят только от положения блоков. Пока блоки стоят (а при вращении
  // движется одна камера), карту теней перерисовывать незачем — это была самая
  // дорогая часть кадра.
  useEffect(() => {
    weights.current = structure.blocks.map(() => 0);
    if (!shadows) return;
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    invalidate();
    return () => {
      gl.shadowMap.autoUpdate = true;
    };
  }, [gl, structure, invalidate, shadows]);

  const materials = useMemo(() => buildMaterials(kindIds, textures, detail), [kindIds, textures, detail]);
  const geometry = useMemo(() => {
    const side = EBF.blockSize * EBF.blockScale;
    return new BoxGeometry(side, side, side);
  }, []);
  const batches = useMemo(() => buildBatches(structure.blocks, materials, geometry), [structure, materials, geometry]);
  useEffect(() => () => batches.meshes.forEach((mesh) => mesh.dispose()), [batches]);
  const matrix = useMemo(() => new Matrix4(), []);
  const coreColor = useMemo(() => new Color(CORE.color).multiplyScalar(CORE.intensity), []);
  const isWater = structure.interior === "water";
  // Огромные постройки раздвигаются шаром: блоки отходят от точки внутри постройки во все стороны.
  const isSphere = structure.blocks.length >= HOVER.hugeBlocks;
  const domeSize = isSphere ? domeScale(structure.size) : 1;
  const radius = hoverRadius(structure.blocks.length) * domeSize;
  const dome = useMemo(() => (isSphere ? domeLayout(structure.blocks, structure.size) : []), [isSphere, structure]);
  const pickBlock = useMemo(() => (isSphere ? createBlockPicker(structure.blocks.map((block) => block.home)) : null), [isSphere, structure]);
  const localOrigin = useMemo(() => new Vector3(), []);
  const localTarget = useMemo(() => new Vector3(), []);
  /** Первый блок под курсором — в координатах постройки. От него расходится купол. */
  const entry = useRef<Vec3>([0, 0, 0]);

  /** Насколько раздвинуть блок: по близости его места к лучу из камеры через курсор. */
  const targetWeight = (home: Vector3, pointer: Pointer | null, ray: Ray): number => {
    if (!pointer || !root.current) return 0;
    worldHome.copy(home).applyMatrix4(root.current.matrixWorld);
    return cursorWeight(Math.sqrt(ray.distanceSqToPoint(worldHome)), radius);
  };

  // Блоки раздвигаются только рядом с курсором: чем ближе центр блока к лучу
  // из камеры через курсор, тем дальше он отходит.
  useFrame((state, delta) => {
    let pointer = getPointer();
    if (pointer) state.raycaster.setFromCamera(cursor.set(...pointer), state.camera);
    if (isSphere && pickBlock && pointer && root.current) {
      const { ray } = state.raycaster;
      // Луч — в координаты постройки: две его точки переводим обратно из мира.
      root.current.worldToLocal(localOrigin.copy(ray.origin));
      root.current.worldToLocal(localTarget.copy(ray.origin).add(ray.direction));
      const found = pickBlock([localOrigin.x, localOrigin.y, localOrigin.z], [
        localTarget.x - localOrigin.x,
        localTarget.y - localOrigin.y,
        localTarget.z - localOrigin.z,
      ]);
      if (found) {
        entry.current = found;
      } else {
        // Луч прошёл мимо всех блоков — раздвигать нечего.
        pointer = null;
      }
    }

    const homesList = structure.blocks.map((block) => block.home);
    const sphereTargets = isSphere && pointer ? domeWeights(dome, homesList, entry.current, radius) : null;
    const moved = new Set<InstancedMesh>();
    structure.blocks.forEach((block, index) => {
      const target = isSphere
        ? pointer
          ? (sphereTargets?.[index] ?? 0)
          : 0
        : targetWeight(homes[index], pointer, state.raycaster.ray);
      const current = weights.current[index] ?? 0;
      const weight = approach(current, target, delta);
      if (weight === current) return;
      weights.current[index] = weight;
      const position = isSphere ? domePosition(block.home, dome[index], weight, domeSize) : explodedPosition(block, weight);
      const slot = batches.slots[index];
      slot.mesh.setMatrixAt(slot.instance, matrix.makeTranslation(...position));
      moved.add(slot.mesh);
    });

    if (moved.size === 0) return;
    moved.forEach((mesh) => {
      mesh.instanceMatrix.needsUpdate = true;
    });
    if (shadows) gl.shadowMap.needsUpdate = true;
    // Блоки ещё не доехали — заказываем следующий кадр; доедут — рисование остановится само.
    state.invalidate();
  });

  return (
    <group ref={root}>
      {batches.meshes.map((mesh) => (
        <primitive key={mesh.uuid} object={mesh} />
      ))}

      {/* Самосветящееся нутро: ничего не освещает, но видно в щели и даёт ореол. У бака внутри вода — она не светится. */}
      {structure.hollow.map((position) =>
        isWater ? (
          <mesh key={position.join(":")} position={[...position]}>
            <boxGeometry args={[EBF.blockSize * EBF.blockScale, EBF.blockSize * EBF.blockScale, EBF.blockSize * EBF.blockScale]} />
            <meshStandardMaterial color={CORE.waterColor} transparent opacity={CORE.waterOpacity} roughness={0} />
          </mesh>
        ) : (
          <mesh key={position.join(":")} position={[...position]}>
            <boxGeometry args={[CORE.width, EBF.blockSize, CORE.width]} />
            <meshBasicMaterial color={coreColor} toneMapped={false} />
          </mesh>
        ),
      )}

      {hasLight && structure.interior === "fire" && (
      <pointLight
        position={[...structure.lightPosition]}
        color={LIGHT.color}
        intensity={LIGHT.intensity}
        distance={LIGHT.distance}
        decay={LIGHT.decay}
        castShadow={shadows}
        shadow-mapSize={[LIGHT.shadowMapSize, LIGHT.shadowMapSize]}
        shadow-bias={LIGHT.shadowBias}
        shadow-normalBias={LIGHT.shadowNormalBias}
        shadow-camera-near={LIGHT.shadowNear}
        shadow-camera-far={LIGHT.distance}
      />
      )}
    </group>
  );
}
