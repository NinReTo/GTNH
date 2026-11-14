import { describe, expect, test } from "vitest";
import { MACHINE_GUIDES, singleGuide, wikiUrl } from "@/lib/guides";
import { MACHINES, SINGLE_BLOCKS } from "@/lib/machines";

describe("гайды по машинам", () => {
  test("у каждой постройки есть гайд", () => {
    for (const machine of MACHINES) expect(MACHINE_GUIDES[machine.slug], machine.slug).toBeDefined();
  });

  test("у каждой одноблочной машины есть гайд, и в нём есть общие советы про паровые машины", () => {
    for (const single of SINGLE_BLOCKS) {
      const guide = singleGuide(single.id);
      expect(guide, single.id).toBeDefined();
      expect(guide?.tips.map((tip) => tip.title)).toContain("Не закрывайте выхлоп");
    }
  });

  test("гайд короткий: от 2 до 8 советов, заголовки внутри гайда не повторяются", () => {
    const guides = [...Object.values(MACHINE_GUIDES), ...SINGLE_BLOCKS.map((single) => singleGuide(single.id))];
    for (const guide of guides) {
      const titles = guide?.tips.map((tip) => tip.title) ?? [];
      expect(titles.length).toBeGreaterThanOrEqual(2);
      expect(titles.length).toBeLessThanOrEqual(8);
      expect(new Set(titles).size).toBe(titles.length);
    }
  });

  test("у больших паровых построек гайд объясняет, чем они лучше одноблочных", () => {
    for (const slug of ["steam-furnace", "steam-alloy-smelter", "steam-macerator", "steam-compressor", "steam-forge-hammer"]) {
      expect(MACHINE_GUIDES[slug].tips.map((tip) => tip.title)).toContain("Зачем строить");
    }
  });

  test("ссылка на вики собирается из названия страницы", () => {
    expect(wikiUrl("Bricked Blast Furnace")).toBe("https://wiki.gtnewhorizons.com/wiki/Bricked_Blast_Furnace");
  });

  test("игровые имена паровых построек — как на вики GTNH", () => {
    const names = Object.fromEntries(MACHINES.map((machine) => [machine.slug, machine.name]));
    expect(names["steam-furnace"]).toBe("Steam Hearth");
    expect(names["steam-macerator"]).toBe("Steam Grinder");
    expect(names["steam-compressor"]).toBe("Steam Squasher");
  });
});
