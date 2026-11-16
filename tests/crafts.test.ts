import { existsSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { craftLinesOf } from "@/lib/crafts";
import { GEN_CRAFTS } from "@/lib/gen-crafts";

describe("линии крафта", () => {
  test("у LV главный металл — сталь; каждая цепочка кончается слитком, а не корпусом машины", () => {
    expect(craftLinesOf("lv")[0]?.metal).toBe("сталь");
    for (const line of GEN_CRAFTS) expect(line.steps.at(-1)?.output.icon, line.metal).toMatch(/^c-ingot-/);
  });

  test("выше HV цепочка начинается с сырья и проходит через несколько машин", () => {
    for (const tier of ["ev", "iv", "luv", "zpm", "uv", "uhv"] as const) {
      const [line] = craftLinesOf(tier);
      expect(line?.steps.length, tier).toBeGreaterThanOrEqual(4);
      expect(new Set(line?.steps.map((step) => step.station)).size, tier).toBeGreaterThanOrEqual(3);
    }
  });

  test("на паре два главных металла — бронза и сталь, у обоих есть страница", () => {
    expect(craftLinesOf("steam").map((line) => [line.metal, line.material])).toEqual([["бронза", "bronze"], ["сталь", "steel"]]);
  });

  test("сетка не больше верстака: три ряда по три ячейки", () => {
    for (const step of GEN_CRAFTS.flatMap((line) => line.steps)) {
      expect(step.grid.length, step.title).toBeLessThanOrEqual(3);
      for (const row of step.grid) expect(row.length, step.title).toBeLessThanOrEqual(3);
    }
  });

  test("у каждого предмета есть значок", () => {
    const items = GEN_CRAFTS.flatMap((line) => line.steps).flatMap((step) => [...step.grid.flat(), step.output]);
    for (const item of items) {
      if (item) expect(existsSync(`public/textures/gregtech/${item.icon}.webp`), item.icon).toBe(true);
    }
  });
});
