"use client";

import { useLayoutEffect } from "react";
import { useTexture } from "@react-three/drei";
import { RepeatWrapping, SRGBColorSpace, type Texture } from "three";
import { FLOOR, MATERIAL } from "@/lib/config";

const PBR = "/textures/pbr";

/** Сколько раз текстура повторяется на всём полу: его размер, делённый на метры одного повтора. */
const REPEATS = FLOOR.size / FLOOR.metersPerRepeat;

function setupFloorTexture(texture: Texture): void {
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(REPEATS, REPEATS);
  // Пол всегда виден под острым углом — без анизотропии он первым превращается в «мыло».
  texture.anisotropy = MATERIAL.anisotropy;
  texture.needsUpdate = true;
}

export function Floor() {
  const textures = useTexture({
    map: `${PBR}/floor-color.webp`,
    normalMap: `${PBR}/floor-normal.webp`,
    roughnessMap: `${PBR}/floor-roughness.webp`,
  });

  useLayoutEffect(() => {
    Object.values(textures).forEach(setupFloorTexture);
    textures.map.colorSpace = SRGBColorSpace;
  }, [textures]);

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[FLOOR.size, FLOOR.size]} />
      <meshStandardMaterial
        {...textures}
        color={FLOOR.color}
        normalScale={[FLOOR.normalScale, FLOOR.normalScale]}
        metalness={FLOOR.metalness}
      />
    </mesh>
  );
}
