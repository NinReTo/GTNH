"use client";

import { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { BoxGeometry, type Texture } from "three";
import { EBF } from "@/lib/config";
import type { CardSpec } from "@/lib/cards";
import { findMachine } from "@/lib/machines";
import { findSingle, type Faces } from "@/lib/singles";
import type { BlockKind } from "@/lib/structure";
import {
  DETAIL_URLS,
  Structure3D,
  blockMaterial,
  setupDetailTexture,
  setupPixelTexture,
  type Detail,
} from "@/components/scene/Structure3D";

/** Металл корпуса — тот же материал, что у блоков построек. */
const HULL_KIND: BlockKind = { label: "Корпус машины", texture: "hull" };

const textureUrl = (name: string) => `/textures/gregtech/${name}.webp`;

/** Одноблочная машина — один куб: фасад со значком машины, остальные грани — её корпус. */
function Cube({ faces }: { faces: Faces }) {
  const textures = useTexture({
    front: textureUrl(faces.front),
    side: textureUrl(faces.side),
    top: textureUrl(faces.top),
    bottom: textureUrl(faces.bottom),
  }) as Record<keyof Faces, Texture>;
  const detail = useTexture(DETAIL_URLS) as Detail;
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    Object.values(textures).forEach(setupPixelTexture);
    Object.values(detail).forEach(setupDetailTexture);
    invalidate();
  }, [textures, detail, invalidate]);

  // Порядок граней куба в three.js: +x, −x, +y, −y, +z (фасад), −z.
  const materials = useMemo(() => {
    const side = blockMaterial(HULL_KIND, textures.side, detail);
    const top = blockMaterial(HULL_KIND, textures.top, detail);
    const bottom = blockMaterial(HULL_KIND, textures.bottom, detail);
    const front = blockMaterial(HULL_KIND, textures.front, detail);
    return [side, side, top, bottom, front, side];
  }, [textures, detail]);
  const geometry = useMemo(() => new BoxGeometry(EBF.blockSize, EBF.blockSize, EBF.blockSize), []);

  return <mesh position={[0, EBF.blockSize / 2, 0]} geometry={geometry} material={materials} />;
}

/** Куб одноблочной машины по её адресному имени. */
export function SingleCube({ slug }: { slug: string }) {
  const single = findSingle(slug);
  return single ? <Cube faces={single.faces} /> : null;
}

/** Что стоит в карточке: постройка (без теней — карточка маленькая) или куб одноблочной машины. */
export function CardContent({ spec }: { spec: CardSpec }) {
  if (spec.kind === "single") return <SingleCube slug={spec.slug} />;
  const machine = findMachine(spec.slug);
  return machine ? <Structure3D machine={machine} shadows={false} /> : null;
}
