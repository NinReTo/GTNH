import { describe, expect, test } from "vitest";
import { chunkBorders } from "@/lib/chunks";

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
});
