"use client";

import { useMemo } from "react";
import { BufferAttribute, BufferGeometry } from "three";
import { chunkBorders } from "@/lib/chunks";
import { CHUNK } from "@/lib/config";

type ChunkGridProps = {
  /** Ширина и глубина постройки в блоках. */
  footprint: readonly [number, number];
  /** Как далеко от центра рисовать сетку, в метрах. */
  reach: number;
};

/** Границы чанков Minecraft (16 × 16 блоков) на полу: постройка стоит посередине своих чанков. */
export function ChunkGrid({ footprint, reach }: ChunkGridProps) {
  const [width, depth] = footprint;
  const geometry = useMemo(() => {
    const points = [
      ...chunkBorders(width, reach).flatMap((x) => [x, CHUNK.lift, -reach, x, CHUNK.lift, reach]),
      ...chunkBorders(depth, reach).flatMap((z) => [-reach, CHUNK.lift, z, reach, CHUNK.lift, z]),
    ];
    const lines = new BufferGeometry();
    lines.setAttribute("position", new BufferAttribute(new Float32Array(points), [0, 0, 0].length));
    return lines;
  }, [width, depth, reach]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={CHUNK.color} transparent opacity={CHUNK.opacity} />
    </lineSegments>
  );
}
