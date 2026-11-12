import { describe, expect, test } from "vitest";
import { activeTier } from "@/components/landing/TierTabs";

describe("вкладки эр", () => {
  test("на главной ни одна вкладка не открыта", () => {
    expect(activeTier("/")).toBeNull();
  });

  test("на странице эры открыта её вкладка", () => {
    expect(activeTier("/tiers/steam")).toBe("steam");
    expect(activeTier("/tiers/lv")).toBe("lv");
  });

  test("на странице машины открыта вкладка её эры", () => {
    expect(activeTier("/machines/coke-oven")).toBe("steam");
    expect(activeTier("/machines/electric-blast-furnace")).toBe("lv");
  });

  test("неизвестный адрес не открывает вкладку", () => {
    expect(activeTier("/tiers/нет-такой")).toBeNull();
    expect(activeTier("/machines/нет-такой")).toBeNull();
    expect(activeTier("/что-то")).toBeNull();
  });
});
