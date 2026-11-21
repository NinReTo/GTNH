"use client";

import { useMemo } from "react";
import { BufferAttribute, BufferGeometry } from "three";
import { alignedBorders, chunkBorders } from "@/lib/chunks";
import { CHUNK } from "@/lib/config";

type ChunkGridProps = {
  /** Ширина и глубина постройки в блоках. */
  footprint: readonly [number, number];
  /** Как далеко от центра рисовать сетку, в метрах. */
  reach: number;
  /** Известная граница чанков (метры по x и z) — у фабрики калькулятора чанки от её начала. Без неё постройка посередине. */
  origin?: readonly [number, number];
};

/** Границы чанков Minecraft (16 × 16 блоков) на полу: постройка стоит посередине своих чанков или от заданной границы. */
export function ChunkGrid({ footprint, reach, origin }: ChunkGridProps) {
  const [width, depth] = footprint;
  const [originX, originZ] = origin ?? [];
  const geometry = useMemo(() => {
    const xs = originX === undefined ? chunkBorders(width, reach) : alignedBorders(originX, reach);
    const zs = originZ === undefined ? chunkBorders(depth, reach) : alignedBorders(originZ, reach);
    const points = [
      ...xs.flatMap((x) => [x, CHUNK.lift, -reach, x, CHUNK.lift, reach]),
      ...zs.flatMap((z) => [-reach, CHUNK.lift, z, reach, CHUNK.lift, z]),
    ];
    const lines = new BufferGeometry();
    lines.setAttribute("position", new BufferAttribute(new Float32Array(points), [0, 0, 0].length));
    return lines;
  }, [width, depth, reach, originX, originZ]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={CHUNK.color} transparent opacity={CHUNK.opacity} />
    </lineSegments>
  );
}
