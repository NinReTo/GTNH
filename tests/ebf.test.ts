import { describe, expect, test } from "vitest";
import { EBF, EXPLODE, HOVER } from "@/lib/config";
import { BLOCKS, LAYER_COUNT, approach, countByType, cursorWeight, explodedPosition } from "@/lib/ebf";

describe("структура печи", () => {
  test("состоит из 34 блоков: 3×3×4 без двух блоков воздуха внутри", () => {
    expect(BLOCKS).toHaveLength(34);
    expect(LAYER_COUNT).toBe(4);
  });

  test("содержит 16 катушек, один контроллер и один глушитель, как требует мод", () => {
    const counts = countByType();
    expect(counts.coil).toBe(16);
    expect(counts.controller).toBe(1);
    expect(counts.muffler).toBe(1);
  });

  test("корпусов не больше 12 и есть все обязательные люки", () => {
    const counts = countByType();
    expect(counts.casing).toBeLessThanOrEqual(12);
    expect(counts.energy).toBeGreaterThanOrEqual(1);
    expect(counts.maintenance).toBe(1);
    expect(counts.inputBus + counts.inputHatch).toBeGreaterThanOrEqual(1);
    expect(counts.outputBus).toBeGreaterThanOrEqual(1);
  });

  test("контроллер стоит спереди внизу по центру и смотрит вперёд", () => {
    const controller = BLOCKS.find((block) => block.type === "controller");
    expect(controller?.grid).toEqual([0, 0, 1]);
    expect(controller?.face).toBe("pz");
  });

  test("глушитель стоит в центре верхнего слоя и смотрит вверх", () => {
    const muffler = BLOCKS.find((block) => block.type === "muffler");
    expect(muffler?.grid).toEqual([0, 3, 0]);
    expect(muffler?.face).toBe("py");
  });

  test("катушки занимают только два средних слоя, а ось печи в них пуста", () => {
    const coils = BLOCKS.filter((block) => block.type === "coil");
    expect(new Set(coils.map((block) => block.grid[1]))).toEqual(new Set([1, 2]));
    expect(BLOCKS.some((block) => block.grid[0] === 0 && block.grid[2] === 0 && [1, 2].includes(block.grid[1]))).toBe(false);
  });

  test("каждый люк смотрит наружу, а не внутрь печи", () => {
    const outward = { px: [1, 0], nx: [-1, 0], pz: [0, 1], nz: [0, -1] } as const;
    for (const block of BLOCKS) {
      if (!block.face || block.face === "py" || block.face === "ny") continue;
      const [dx, dz] = outward[block.face];
      const isOnThatWall = dx !== 0 ? block.grid[0] === dx : block.grid[2] === dz;
      expect(isOnThatWall, `${block.type} ${block.id}`).toBe(true);
    }
  });
});

describe("раздвижение у курсора", () => {
  test("блок прямо под курсором раздвигается полностью", () => {
    expect(cursorWeight(0)).toBe(1);
  });

  test("блок на краю радиуса и дальше стоит на месте", () => {
    expect(cursorWeight(HOVER.radius)).toBe(0);
    expect(cursorWeight(HOVER.radius * 3)).toBe(0);
  });

  test("чем ближе курсор, тем сильнее раздвижение", () => {
    expect(cursorWeight(HOVER.radius / 4)).toBeGreaterThan(cursorWeight(HOVER.radius / 2));
    expect(cursorWeight(HOVER.radius / 2)).toBeCloseTo(0.5);
  });

  test("бессмысленное расстояние ничего не двигает", () => {
    expect(cursorWeight(Number.NaN)).toBe(0);
    expect(cursorWeight(-1)).toBe(0);
  });
});

describe("плавное движение блока", () => {
  test("идёт к цели и не перелетает её", () => {
    const next = approach(0, 1, 0.016);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(1);
  });

  test("возвращается назад, когда курсор ушёл", () => {
    expect(approach(0.8, 0, 0.016)).toBeLessThan(0.8);
  });

  test("в конце концов доезжает ровно до цели — анимация заканчивается", () => {
    let weight = 0;
    let frames = 0;
    while (weight !== 1 && frames < 1000) {
      weight = approach(weight, 1, 0.016);
      frames += 1;
    }
    expect(weight).toBe(1);
    expect(frames).toBeLessThan(120);
  });

  test("на месте стоит неподвижно", () => {
    expect(approach(0, 0, 0.016)).toBe(0);
    expect(approach(1, 1, 0.016)).toBe(1);
  });

  test("после долгого простоя кадр не перебрасывает блок одним скачком", () => {
    expect(approach(0, 1, 30)).toBe(approach(0, 1, HOVER.maxStep));
    expect(approach(0, 1, 30)).toBeLessThan(0.5);
  });

  test("отрицательное время ничего не двигает", () => {
    expect(approach(0.4, 1, -1)).toBe(0.4);
  });
});

describe("раскладка по блокам", () => {
  test("без раздвижения блоки стоят вплотную по сетке в один метр", () => {
    for (const block of BLOCKS) {
      const [x, y, z] = block.grid;
      expect(explodedPosition(block.grid, 0)).toEqual([x * EBF.blockSize, (y + 0.5) * EBF.blockSize, z * EBF.blockSize]);
    }
  });

  test("при полном раздвижении всех блоков никакие два не пересекаются", () => {
    const positions = BLOCKS.map((block) => explodedPosition(block.grid, 1));
    for (let first = 0; first < positions.length; first += 1) {
      for (let second = first + 1; second < positions.length; second += 1) {
        const gap = Math.max(...positions[first].map((value, axis) => Math.abs(value - positions[second][axis])));
        expect(gap).toBeGreaterThanOrEqual(EBF.blockSize);
      }
    }
  });

  test("раздвинутый блок не влезает в соседа, который остался на месте", () => {
    for (const moved of BLOCKS) {
      const position = explodedPosition(moved.grid, 1);
      for (const still of BLOCKS) {
        if (still.id === moved.id) continue;
        const home = explodedPosition(still.grid, 0);
        const gap = Math.max(...position.map((value, axis) => Math.abs(value - home[axis])));
        expect(gap, moved.id + " → " + still.id).toBeGreaterThanOrEqual(EBF.blockSize * EBF.blockScale);
      }
    }
  });

  test("под крышкой появляется просвет заданной высоты, остальные слои не поднимаются", () => {
    const coil = explodedPosition([0, 2, 1], 1);
    const lid = explodedPosition([0, 3, 1], 1);
    expect(lid[1] - coil[1]).toBeCloseTo(EBF.blockSize + EXPLODE.lidLift);
    expect(coil[1]).toBeCloseTo(explodedPosition([0, 2, 1], 0)[1]);
  });

  test("нижний слой не отрывается от пола", () => {
    for (const weight of [0, 0.3, 0.7, 1]) {
      expect(explodedPosition([1, 0, 1], weight)[1]).toBeCloseTo(EBF.blockSize / 2);
    }
  });

  test("блок движется только наружу и вверх, без возвратов", () => {
    let previous = explodedPosition([1, 3, 1], 0);
    for (let step = 1; step <= 20; step += 1) {
      const current = explodedPosition([1, 3, 1], step / 20);
      current.forEach((value, axis) => expect(value).toBeGreaterThanOrEqual(previous[axis]));
      previous = current;
    }
  });

  test("за пределами отрезка 0…1 раздвижение не растёт", () => {
    expect(explodedPosition([1, 2, 1], 5)).toEqual(explodedPosition([1, 2, 1], 1));
    expect(explodedPosition([1, 2, 1], -5)).toEqual(explodedPosition([1, 2, 1], 0));
  });
});
