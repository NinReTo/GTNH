import { SHAPES } from "./config";
import type { Vec3 } from "./structure";

/**
 * Форма блока, который в игре занимает не весь куб. Блок остаётся блоком:
 * стоит в своей клетке и раздвигается как все, просто рисуется не кубом.
 */
export type Shape = "chest" | "hopper" | "pipe";

/** Брусок внутри клетки: два противоположных угла, в пикселях блока (0…16), x — вправо, y — вверх, z — к фасаду. */
export type Box = readonly [Vec3, Vec3];

/** Шесть сторон клетки: куда смотрит и на сколько клеток сдвигает. */
export const SIDES: readonly { readonly id: string; readonly step: Vec3 }[] = [
  { id: "px", step: [1, 0, 0] },
  { id: "nx", step: [-1, 0, 0] },
  { id: "py", step: [0, 1, 0] },
  { id: "ny", step: [0, -1, 0] },
  { id: "pz", step: [0, 0, 1] },
  { id: "nz", step: [0, 0, -1] },
];

/** Из каких брусков сложен блок. links — стороны, в которые труба тянет отросток. */
export function shapeBoxes(shape: Shape, links: readonly string[] = []): readonly Box[] {
  if (shape === "chest") return [SHAPES.chest];
  if (shape === "hopper") {
    // links[0] — куда смотрит носик: вниз или в соседний блок сбоку.
    const side = SIDES.find((candidate) => candidate.id === links[0] && candidate.step[1] === 0);
    if (!side) return [...SHAPES.hopper, SHAPES.spoutDown];
    const { reach, low: from, high: to, bottom, top } = SHAPES.spoutSide;
    const along = (move: number, isEnd: boolean) => (move > 0 ? (isEnd ? SHAPES.pixels : SHAPES.pixels - reach) : move < 0 ? (isEnd ? reach : 0) : isEnd ? to : from);
    const [x, , z] = side.step;
    return [...SHAPES.hopper, [[along(x, false), bottom, along(z, false)], [along(x, true), top, along(z, true)]]];
  }
  const { low, high } = SHAPES.pipe;
  const arms = SIDES.filter((side) => links.includes(side.id)).map(({ step }): Box => [
    step.map((move, axis) => (move > 0 ? high : move < 0 ? 0 : low)) as unknown as Vec3,
    step.map((move, axis) => (move > 0 ? SHAPES.pixels : move < 0 ? low : high)) as unknown as Vec3,
  ]);
  return [[[low, low, low], [high, high, high]], ...arms];
}

/**
 * В какие стороны труба тянет отростки. К трубам, сундукам и воронкам — всегда (к вагонетке труба не подключается: под ней ставят воронку).
 * Если таких соседей меньше двух (труба между двумя постройками), — ко всем соседним блокам.
 */
export function pipeLinks(grid: Vec3, isBlockAt: (cell: Vec3) => boolean, isJoinableAt: (cell: Vec3) => boolean): readonly string[] {
  const next = (step: Vec3): Vec3 => [grid[0] + step[0], grid[1] + step[1], grid[2] + step[2]];
  const joined = SIDES.filter((side) => isJoinableAt(next(side.step)));
  const chosen = joined.length >= 2 ? joined : SIDES.filter((side) => isBlockAt(next(side.step)));
  return chosen.map((side) => side.id);
}
