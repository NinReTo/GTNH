"use client";

import { useContext, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  BoxGeometry,
  Color,
  DoubleSide,
  LinearMipmapLinearFilter,
  MeshPhysicalMaterial,
  NearestFilter,
  RepeatWrapping,
  SRGBColorSpace,
  Vector2,
  Vector3,
  type Group,
  type Material,
  type Mesh,
  type Ray,
  type Texture,
} from "three";
import { CORE, EBF, LIGHT, MATERIAL } from "@/lib/config";
import { KINDS, structureOf, type KindId, type Machine } from "@/lib/machines";
import { FACES, approach, cursorWeight, explodedPosition, type Block, type BlockKind } from "@/lib/structure";
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
    sheen: MATERIAL.sheen,
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

  const meshes = useRef<(Mesh | null)[]>([]);
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
  const coreColor = useMemo(() => new Color(CORE.color).multiplyScalar(CORE.intensity), []);
  const isWater = structure.interior === "water";

  /** Насколько раздвинуть блок: по близости его места к лучу из камеры через курсор. */
  const targetWeight = (home: Vector3, pointer: Pointer | null, ray: Ray): number => {
    if (!pointer || !root.current) return 0;
    worldHome.copy(home).applyMatrix4(root.current.matrixWorld);
    return cursorWeight(Math.sqrt(ray.distanceSqToPoint(worldHome)));
  };

  // Блоки раздвигаются только рядом с курсором: чем ближе центр блока к лучу
  // из камеры через курсор, тем дальше он отходит.
  useFrame((state, delta) => {
    const pointer = getPointer();
    if (pointer) state.raycaster.setFromCamera(cursor.set(...pointer), state.camera);

    let hasMoved = false;
    structure.blocks.forEach((block, index) => {
      const target = targetWeight(homes[index], pointer, state.raycaster.ray);
      const current = weights.current[index] ?? 0;
      const weight = approach(current, target, delta);
      if (weight === current) return;
      weights.current[index] = weight;
      meshes.current[index]?.position.set(...explodedPosition(block, weight));
      hasMoved = true;
    });

    if (!hasMoved) return;
    if (shadows) gl.shadowMap.needsUpdate = true;
    // Блоки ещё не доехали — заказываем следующий кадр; доедут — рисование остановится само.
    state.invalidate();
  });

  return (
    <group ref={root}>
      {structure.blocks.map((block, index) => (
        <mesh
          key={block.id}
          ref={(mesh) => {
            meshes.current[index] = mesh;
          }}
          position={homes[index]}
          geometry={geometry}
          material={materialsFor(block, materials)}
          castShadow={!(KINDS[block.kind as KindId] as BlockKind).isGlass}
          receiveShadow
        />
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

      {hasLight && !isWater && (
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
