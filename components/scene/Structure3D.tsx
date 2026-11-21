"use client";

import { useContext, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  BoxGeometry,
  type BufferGeometry,
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
import { kindsOf, structureOf, type Machine } from "@/lib/machines";
import {
  FACES,
  STRUCTURE_READY,
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
import { pipeLinks, shapeBoxes } from "@/lib/shapes";
import { PointerContext, type Pointer } from "@/lib/store";
import { shapeGeometry } from "./shapeGeometry";

const GT = "/textures/gregtech";
export const DETAIL_URLS = {
  metalNormal: "/textures/pbr/metal-normal.webp",
  metalRoughness: "/textures/pbr/metal-roughness.webp",
};

/** Какие файлы текстур нужны постройке: у каждого вида — своя, плюс основа и свечение грани. */
type Kinds = Readonly<Record<string, BlockKind>>;

function textureUrls(kindIds: readonly string[], kinds: Kinds): Record<string, string> {
  const names = new Set<string>();
  for (const id of kindIds) {
    const kind: BlockKind = kinds[id];
    names.add(kind.texture);
    if (kind.face) names.add(kind.face.base);
    if (kind.glow) names.add(kind.glow);
    if (kind.top) names.add(kind.top);
    if (kind.bottom) names.add(kind.bottom);
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
  /** Верх и низ одноблочной машины. */
  readonly top?: MeshPhysicalMaterial;
  readonly bottom?: MeshPhysicalMaterial;
}

function buildMaterials(kindIds: readonly string[], textures: Record<string, Texture>, detail: Detail, kinds: Kinds): Record<string, KindMaterials> {
  return Object.fromEntries(
    kindIds.map((id) => {
      const kind: BlockKind = kinds[id];
      if (!kind.face) return [id, { base: blockMaterial(kind, textures[kind.texture], detail) }];
      return [
        id,
        {
          base: blockMaterial(kind, textures[kind.face.base], detail),
          face: blockMaterial(kind, textures[kind.texture], detail, kind.glow ? textures[kind.glow] : undefined),
          top: kind.top ? blockMaterial(kind, textures[kind.top], detail) : undefined,
          bottom: kind.bottom ? blockMaterial(kind, textures[kind.bottom], detail) : undefined,
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

function buildBatches(blocks: readonly Block[], materials: Record<string, KindMaterials>, geometry: BoxGeometry, kinds: Kinds): Batches {
  const groups = new Map<string, number[]>();
  // Блоки неполной формы: у трубы форма зависит от соседей, поэтому трубы с разными отростками — разные наборы.
  const kindAt = new Map(blocks.map((block) => [block.grid.join(":"), block.kind]));
  const isBlockAt = (cell: Vec3) => kindAt.has(cell.join(":"));
  const isJoinableAt = (cell: Vec3) => {
    const id = kindAt.get(cell.join(":"));
    return id !== undefined && Boolean((kinds[id]).shape);
  };
  const linksOf = (block: Block): readonly string[] => {
    const kind: BlockKind = kinds[block.kind];
    if (block.links) return block.links;
    if (kind.shape === "pipe") return pipeLinks(block.grid, isBlockAt, isJoinableAt);
    return kind.spout ? [kind.spout] : [];
  };
  const shapes = new Map<string, BufferGeometry>();
  const geometryOf = (block: Block): BufferGeometry => {
    const { shape } = kinds[block.kind];
    if (!shape) return geometry;
    const links = linksOf(block);
    const key = [shape, ...links].join(":");
    const made = shapes.get(key) ?? shapeGeometry(shapeBoxes(shape, links), EBF.blockSize * EBF.blockScale);
    shapes.set(key, made);
    return made;
  };
  blocks.forEach((block, index) => {
    const key = [block.kind, materials[block.kind].face ? block.face : "", ...linksOf(block)].join(":");
    // Дописываем в тот же список, не копируя: у фабрики калькулятора в одном наборе десятки тысяч труб.
    const group = groups.get(key);
    if (group) group.push(index);
    else groups.set(key, [index]);
  });
  const matrix = new Matrix4();
  const slots: { mesh: InstancedMesh; instance: number }[] = [];
  const meshes = [...groups.values()].map((indices) => {
    const first = blocks[indices[0]];
    const mesh = new InstancedMesh(geometryOf(first), materialsFor(first, materials), indices.length);
    mesh.castShadow = !(kinds[first.kind]).isGlass;
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
  const { base, face, top, bottom } = materials[block.kind];
  if (!face || !block.face) return base;
  return FACES.map((side) => (side === block.face ? face : side === "py" && top ? top : side === "ny" && bottom ? bottom : base));
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
  /** Блоки стоят на месте и не раздвигаются под курсором — у фабрики калькулятора это только мешает её разглядывать. */
  readonly isStill?: boolean;
}

export function Structure3D({ machine, shadows, hasLight = true, isStill = false }: Structure3DProps) {
  /** Где курсор над этой сценой; у каждой сцены свой источник. */
  const getPointer = useContext(PointerContext);
  const structure = useMemo(() => structureOf(machine), [machine]);
  const kinds = useMemo(() => kindsOf(machine), [machine]);
  const kindIds = useMemo(() => [...new Set(structure.blocks.map((block) => block.kind))], [structure]);
  const textures = useTexture(useMemo(() => textureUrls(kindIds, kinds), [kindIds, kinds])) as Record<string, Texture>;
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
    window.dispatchEvent(new CustomEvent(STRUCTURE_READY, { detail: machine.slug }));
  }, [textures, detail, invalidate, machine.slug]);

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

  const materials = useMemo(() => buildMaterials(kindIds, textures, detail, kinds), [kindIds, textures, detail, kinds]);
  const geometry = useMemo(() => {
    const side = EBF.blockSize * EBF.blockScale;
    return new BoxGeometry(side, side, side);
  }, []);
  const batches = useMemo(() => buildBatches(structure.blocks, materials, geometry, kinds), [structure, materials, geometry, kinds]);
  useEffect(() => () => batches.meshes.forEach((mesh) => mesh.dispose()), [batches]);
  const matrix = useMemo(() => new Matrix4(), []);
  const coreColor = useMemo(() => new Color(CORE.color).multiplyScalar(CORE.intensity), []);
  const isWater = structure.interior === "water";
  // Огромные постройки раздвигаются шаром: блоки отходят от точки внутри постройки во все стороны.
  const isSphere = !isStill && structure.blocks.length >= HOVER.hugeBlocks;
  const domeSize = isSphere ? domeScale(structure.size) : 1;
  const radius = hoverRadius(structure.blocks.length) * domeSize;
  const dome = useMemo(() => (isSphere ? domeLayout(structure.blocks, structure.size) : []), [isSphere, structure]);
  const homeList = useMemo(() => structure.blocks.map((block) => block.home), [structure]);
  const pickBlock = useMemo(() => (isSphere ? createBlockPicker(homeList) : null), [isSphere, homeList]);
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
    if (isStill) return;
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

    const sphereTargets = isSphere && pointer ? domeWeights(dome, homeList, entry.current, radius) : null;
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
