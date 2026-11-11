"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  BoxGeometry,
  Color,
  LinearMipmapLinearFilter,
  MeshPhysicalMaterial,
  NearestFilter,
  RepeatWrapping,
  SRGBColorSpace,
  Vector2,
  type Material,
  type Mesh,
  type PointLight,
  type Texture,
} from "three";
import { CORE, EBF, LIGHT, MATERIAL } from "@/lib/config";
import { BLOCKS, FACES, explodedPosition, type Block, type BlockType } from "@/lib/ebf";
import { explodeProgress } from "@/lib/scroll";
import { useSceneStore } from "@/lib/store";

const GT = "/textures/gregtech";
const PBR = "/textures/pbr";

const TEXTURE_URLS = {
  casing: `${GT}/casing.webp`,
  coil: `${GT}/coil-cupronickel.webp`,
  controller: `${GT}/controller.webp`,
  controllerGlow: `${GT}/controller-glow.webp`,
  muffler: `${GT}/muffler.webp`,
  inputBus: `${GT}/input-bus.webp`,
  outputBus: `${GT}/output-bus.webp`,
  inputHatch: `${GT}/input-hatch.webp`,
  energy: `${GT}/energy.webp`,
  maintenance: `${GT}/maintenance.webp`,
  metalNormal: `${PBR}/metal-normal.webp`,
  metalRoughness: `${PBR}/metal-roughness.webp`,
};

type TextureSet = Record<keyof typeof TEXTURE_URLS, Texture>;

/**
 * Текстуры мода 16×16: при увеличении — «ближайший сосед» (пиксели остаются
 * квадратами, как в игре), при уменьшении — обычные мип-уровни с анизотропией,
 * иначе дальние грани рябят.
 */
function setupPixelTexture(texture: Texture): void {
  texture.magFilter = NearestFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.anisotropy = MATERIAL.anisotropy;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
}

/** Настоящие PBR-карты металла: линейная фильтрация, повтор, анизотропия. */
function setupDetailTexture(texture: Texture): void {
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(MATERIAL.detailRepeat, MATERIAL.detailRepeat);
  texture.anisotropy = MATERIAL.anisotropy;
  texture.needsUpdate = true;
}

function metalMaterial(textures: TextureSet, map: Texture, metalness: number, roughness: number): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    map,
    normalMap: textures.metalNormal,
    normalScale: new Vector2(MATERIAL.detailNormalScale, MATERIAL.detailNormalScale),
    roughnessMap: textures.metalRoughness,
    metalness,
    roughness,
    sheen: MATERIAL.sheen,
    sheenRoughness: MATERIAL.sheenRoughness,
    sheenColor: new Color(MATERIAL.sheenColor),
  });
}

interface FurnaceMaterials {
  readonly casing: MeshPhysicalMaterial;
  readonly coil: MeshPhysicalMaterial;
  readonly faces: Partial<Record<BlockType, MeshPhysicalMaterial>>;
}

function buildMaterials(textures: TextureSet): FurnaceMaterials {
  const face = (map: Texture) => metalMaterial(textures, map, MATERIAL.casingMetalness, MATERIAL.casingRoughness);

  const coil = metalMaterial(textures, textures.coil, MATERIAL.coilMetalness, MATERIAL.coilRoughness);
  coil.emissiveMap = textures.coil;
  coil.emissive = new Color(MATERIAL.coilEmissiveColor);
  coil.emissiveIntensity = MATERIAL.coilEmissiveIntensity;

  const controller = face(textures.controller);
  controller.emissiveMap = textures.controllerGlow;
  controller.emissive = new Color(MATERIAL.controllerEmissiveColor);
  controller.emissiveIntensity = MATERIAL.controllerEmissiveIntensity;

  return {
    casing: face(textures.casing),
    coil,
    faces: {
      controller,
      muffler: face(textures.muffler),
      inputBus: face(textures.inputBus),
      outputBus: face(textures.outputBus),
      inputHatch: face(textures.inputHatch),
      energy: face(textures.energy),
      maintenance: face(textures.maintenance),
    },
  };
}

/** Шесть материалов куба: рисунок люка — только на грани, смотрящей наружу, остальное — корпус. */
function materialsFor(block: Block, materials: FurnaceMaterials): Material | Material[] {
  if (block.type === "coil") return materials.coil;
  const special = materials.faces[block.type];
  if (!special || !block.face) return materials.casing;
  return FACES.map((face) => (face === block.face ? special : materials.casing));
}

/** Середина между двумя слоями катушек: там живут свет и сердечник, и поднимаются вместе с разбором. */
function coreHeight(explode: number): number {
  const [lowerCoil, upperCoil] = [explodedPosition([0, 1, 0], explode), explodedPosition([0, 1 + 1, 0], explode)];
  return (lowerCoil[1] + upperCoil[1]) / 2;
}

interface FurnaceProps {
  readonly shadows: boolean;
}

export function Furnace({ shadows }: FurnaceProps) {
  const textures = useTexture(TEXTURE_URLS) as TextureSet;
  const meshes = useRef<(Mesh | null)[]>([]);
  const core = useRef<Mesh>(null);
  const light = useRef<PointLight>(null);

  useLayoutEffect(() => {
    const { metalNormal, metalRoughness, ...pixel } = textures;
    Object.values(pixel).forEach(setupPixelTexture);
    [metalNormal, metalRoughness].forEach(setupDetailTexture);
  }, [textures]);

  const materials = useMemo(() => buildMaterials(textures), [textures]);
  const geometry = useMemo(() => {
    const side = EBF.blockSize * EBF.blockScale;
    return new BoxGeometry(side, side, side);
  }, []);
  const coreColor = useMemo(() => new Color(CORE.color).multiplyScalar(CORE.intensity), []);

  // Сцена зависит только от прокрутки: каждый кадр позиции считаются заново из одного числа.
  useFrame(() => {
    const explode = explodeProgress(useSceneStore.getState().progress);
    BLOCKS.forEach((block, index) => {
      const [x, y, z] = explodedPosition(block.grid, explode);
      meshes.current[index]?.position.set(x, y, z);
    });
    const height = coreHeight(explode);
    core.current?.position.set(LIGHT.position[0], height, LIGHT.position[2]);
    light.current?.position.set(LIGHT.position[0], height, LIGHT.position[2]);
  });

  return (
    <group>
      {BLOCKS.map((block, index) => (
        <mesh
          key={block.id}
          ref={(mesh) => {
            meshes.current[index] = mesh;
          }}
          geometry={geometry}
          material={materialsFor(block, materials)}
          castShadow
          receiveShadow
        />
      ))}

      {/* Самосветящийся сердечник: ничего не освещает, но виден в щели и даёт ореол. */}
      <mesh ref={core}>
        <boxGeometry args={[...CORE.size]} />
        <meshBasicMaterial color={coreColor} toneMapped={false} />
      </mesh>

      <pointLight
        ref={light}
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
    </group>
  );
}
