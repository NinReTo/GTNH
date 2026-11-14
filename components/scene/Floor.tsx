"use client";

import { useLayoutEffect } from "react";
import { useTexture } from "@react-three/drei";
import { RepeatWrapping, SRGBColorSpace, type Texture } from "three";
import { FLOOR, MATERIAL } from "@/lib/config";

const PBR = "/textures/pbr";

function setupFloorTexture(texture: Texture, repeats: number): void {
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(repeats, repeats);
  // Пол всегда виден под острым углом — без анизотропии он первым превращается в «мыло».
  texture.anisotropy = MATERIAL.anisotropy;
  texture.needsUpdate = true;
}

/** scale — во сколько раз пол больше обычного: у крупных построек камера дальше, и край пола иначе виден. */
export function Floor({ scale = 1 }: { scale?: number }) {
  const size = FLOOR.size * scale;
  // Сколько раз текстура повторяется на всём полу: плитка остаётся того же размера в метрах.
  const repeats = size / FLOOR.metersPerRepeat;
  const textures = useTexture({
    map: `${PBR}/floor-color.webp`,
    normalMap: `${PBR}/floor-normal.webp`,
    roughnessMap: `${PBR}/floor-roughness.webp`,
  });

  useLayoutEffect(() => {
    Object.values(textures).forEach((texture) => setupFloorTexture(texture, repeats));
    textures.map.colorSpace = SRGBColorSpace;
  }, [textures, repeats]);

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial
        {...textures}
        color={FLOOR.color}
        normalScale={[FLOOR.normalScale, FLOOR.normalScale]}
        metalness={FLOOR.metalness}
      />
    </mesh>
  );
}
