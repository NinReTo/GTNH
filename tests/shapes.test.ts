import { describe, expect, test } from "vitest";
import { SHAPES } from "@/lib/config";
import { pipeLinks, shapeBoxes } from "@/lib/shapes";
import type { Vec3 } from "@/lib/structure";

const at = (cells: readonly Vec3[]) => (cell: Vec3) => cells.some((other) => other.join() === cell.join());

describe("формы блоков", () => {
  test("ни один брусок не выходит за клетку", () => {
    for (const boxes of [shapeBoxes("chest"), shapeBoxes("hopper"), shapeBoxes("hopper", ["pz"]), shapeBoxes("hopper", ["nx"]), shapeBoxes("pipe", ["px", "nx", "py", "ny", "pz", "nz"])]) {
      for (const [from, to] of boxes) {
        from.forEach((start, axis) => {
          expect(start).toBeGreaterThanOrEqual(0);
          expect(to[axis]).toBeLessThanOrEqual(SHAPES.pixels);
          expect(to[axis]).toBeGreaterThan(start);
        });
      }
    }
  });

  test("носик воронки смотрит вниз, а у боковой — доходит до края клетки с нужной стороны", () => {
    expect(shapeBoxes("hopper").at(-1)?.[0][1]).toBe(0);
    const right = shapeBoxes("hopper", ["px"]).at(-1);
    expect(right?.[1][0]).toBe(SHAPES.pixels);
    const back = shapeBoxes("hopper", ["nz"]).at(-1);
    expect(back?.[0][2]).toBe(0);
    expect(back?.[0][1]).toBeGreaterThan(0);
  });

  test("труба без соседей — только середина; с соседом справа — отросток до края клетки", () => {
    expect(shapeBoxes("pipe")).toHaveLength(1);
    const [, arm] = shapeBoxes("pipe", ["px"]);
    expect(arm[1][0]).toBe(SHAPES.pixels);
  });

  test("труба тянется к трубам и сундукам, а не к стене за ней", () => {
    const pipes: Vec3[] = [[-1, 0, 0], [1, 0, 0]];
    const wall: Vec3[] = [[0, 0, -1]];
    expect(pipeLinks([0, 0, 0], at([...pipes, ...wall]), at(pipes))).toEqual(["px", "nx"]);
  });

  test("труба между двумя постройками тянется к их стенкам", () => {
    const walls: Vec3[] = [[-1, 0, 0], [1, 0, 0]];
    expect(pipeLinks([0, 0, 0], at(walls), at([]))).toEqual(["px", "nx"]);
  });
});
