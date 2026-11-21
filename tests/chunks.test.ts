import { describe, expect, test } from "vitest";
import { alignedBorders, chunkBorders, chunkOf, chunksBetween, copiesAcross, copiesPerChunk, shiftIntoChunk } from "@/lib/chunks";

describe("границы чанков", () => {
  test("постройка 16 блоков занимает ровно один чанк", () => {
    expect(chunkBorders(16, 8)).toEqual([-8, 8]);
  });

  test("маленькая постройка стоит посередине чанка, границы — по граням блоков", () => {
    // 3 блока: слева 6 свободных блоков, справа 7.
    expect(chunkBorders(3, 10)).toEqual([-7.5, 8.5]);
  });

  test("постройка шире чанка стоит посередине двух", () => {
    expect(chunkBorders(20, 16)).toEqual([-16, 0, 16]);
  });

  test("линии идут через 16 блоков до самого края", () => {
    expect(chunkBorders(1, 40)).toEqual([-39.5, -23.5, -7.5, 8.5, 24.5]);
  });

  test("от известной границы — через каждые 16 блоков в обе стороны", () => {
    expect(alignedBorders(3, 20)).toEqual([-13, 3, 19]);
  });
});

describe("правила фабрики: постройка и группа не делятся между чанками", () => {
  test("номер чанка и сколько чанков занимает отрезок", () => {
    expect([chunkOf(0), chunkOf(15), chunkOf(16), chunkOf(-1), chunkOf(-16), chunkOf(-17)]).toEqual([0, 0, 1, -1, -1, -2]);
    expect(chunksBetween(0, 15)).toBe(1);
    expect(chunksBetween(-1, 0)).toBe(2);
  });

  test("копии в ряд не ложатся на границу чанка: та, что легла бы, уходит в следующий", () => {
    for (const width of [1, 3, 5, 7, 9, 16]) {
      const xs = copiesAcross(width, 20);
      expect(xs.every((x) => chunksBetween(x, x + width - 1) === 1)).toBe(true);
      // Через блок и без наложений.
      expect(xs.every((x, index) => index === 0 || x >= xs[index - 1] + width + 1)).toBe(true);
    }
    // Печь 3 блока: в чанк влезает 4 (3 + 1 + 3 + 1 + 3 + 1 + 3 = 15), пятая — с начала следующего чанка.
    expect(copiesPerChunk(3)).toBe(4);
    expect(copiesAcross(3, 5)).toEqual([0, 4, 8, 12, 16]);
    // Постройка шире чанка в него не влезет — её не двигаем.
    expect(copiesAcross(33, 2)).toEqual([0, 34]);
  });

  test("ряд, который лёг бы на границу, опускается в следующий чанк; длиннее чанка — не двигается", () => {
    expect(shiftIntoChunk(-4, -2)).toBe(0);
    // Клетки −18…−14 лежат на границе −16/−17: опускаем верх до −17.
    expect(shiftIntoChunk(-18, -14)).toBe(3);
    expect(shiftIntoChunk(-18 - 3, -14 - 3)).toBe(0);
    expect(shiftIntoChunk(-40, -2)).toBe(0);
  });
});
