import { describe, expect, test } from "vitest";
import { EBF, EXPLODE } from "@/lib/config";
import { BLOCKS, LAYER_COUNT, countByType, explodedPosition, layerProgress } from "@/lib/ebf";

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

describe("раскладка по блокам", () => {
  test("при нулевом разборе блоки стоят вплотную по сетке в один метр", () => {
    for (const block of BLOCKS) {
      const [x, y, z] = block.grid;
      expect(explodedPosition(block.grid, 0)).toEqual([x * EBF.blockSize, (y + 0.5) * EBF.blockSize, z * EBF.blockSize]);
    }
  });

  test("при полном разборе никакие два блока не пересекаются", () => {
    const positions = BLOCKS.map((block) => explodedPosition(block.grid, 1));
    for (let first = 0; first < positions.length; first += 1) {
      for (let second = first + 1; second < positions.length; second += 1) {
        const gap = Math.max(...positions[first].map((value, axis) => Math.abs(value - positions[second][axis])));
        expect(gap).toBeGreaterThanOrEqual(EBF.blockSize);
      }
    }
  });

  test("при полном разборе между слоями появляется просвет заданной высоты", () => {
    const lower = explodedPosition([0, 1, 1], 1);
    const upper = explodedPosition([0, 2, 1], 1);
    expect(upper[1] - lower[1]).toBeCloseTo(EBF.blockSize + EXPLODE.layerGap);
  });

  test("нижний слой не отрывается от пола", () => {
    for (const explode of [0, 0.3, 0.7, 1]) {
      expect(explodedPosition([1, 0, 1], explode)[1]).toBeCloseTo(EBF.blockSize / 2);
    }
  });

  test("верхний слой трогается раньше нижнего", () => {
    const early = EXPLODE.layerStagger / 2;
    expect(layerProgress(LAYER_COUNT - 1, early)).toBeGreaterThan(0);
    expect(layerProgress(0, early)).toBe(0);
  });

  test("к концу разбора все слои доезжают до места", () => {
    for (let layer = 0; layer < LAYER_COUNT; layer += 1) {
      expect(layerProgress(layer, 1)).toBe(1);
      expect(layerProgress(layer, 0)).toBe(0);
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
});
