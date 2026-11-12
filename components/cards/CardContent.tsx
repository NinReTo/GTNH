"use client";

import { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { BoxGeometry, type Texture } from "three";
import { EBF } from "@/lib/config";
import type { CardSpec } from "@/lib/cards";
import { findMachine, type Hull, type SteamTier } from "@/lib/machines";
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

type SingleCubeProps = {
  id: string;
  tier: SteamTier;
  hull: Hull;
};

/** Одноблочная машина — один куб: фасад со значком машины, остальные грани — корпус её версии. */
function SingleCube({ id, tier, hull }: SingleCubeProps) {
  const base = `/textures/gregtech/hull-${tier}-${hull}`;
  const textures = useTexture({
    front: `/textures/gregtech/single-${tier}-${id}.webp`,
    side: `${base}-side.webp`,
    top: `${base}-top.webp`,
    bottom: `${base}-bottom.webp`,
  }) as Record<"front" | "side" | "top" | "bottom", Texture>;
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

/** Что стоит в карточке: постройка (без теней — карточка маленькая) или куб одноблочной машины. */
export function CardContent({ spec }: { spec: CardSpec }) {
  if (spec.kind === "single") return <SingleCube id={spec.id} tier={spec.tier} hull={spec.hull} />;
  const machine = findMachine(spec.slug);
  return machine ? <Structure3D machine={machine} shadows={false} /> : null;
}
