import { existsSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { activeTier } from "@/components/landing/TierTabs";
import { cameraSetup, singleCameraSetup } from "@/lib/camera";
import { ASSETS, GAME } from "@/lib/config";
import {
  LINES,
  catalogOf,
  isSameStep,
  lineOf,
  linesOf,
  nextStep,
  stepHref,
  stepLabel,
  stepTier,
  stepTitle,
  type LineStep,
} from "@/lib/lines";
import { LV_MACHINE_FOLDERS, machineId } from "@/lib/lv";
import { KINDS, MACHINES, SINGLE_BLOCKS } from "@/lib/machines";
import { SINGLES, findSingle } from "@/lib/singles";
import { findTier } from "@/lib/tiers";

const single = (slug: string): LineStep => ({ kind: "single", slug });
const machine = (slug: string): LineStep => ({ kind: "machine", slug });
const stepsOf = (predicate: (step: LineStep) => boolean) => LINES.flatMap((line) => line.steps.filter(predicate));

describe("прогрессии", () => {
  // Ветряк и угольная яма — не паровые машины из прогрессий, они стоят в каталоге яруса.
  const STEAM_CATALOG = ["windmill", "charcoal-pile-igniter"];

  test("каждая паровая постройка стоит ровно в одной прогрессии", () => {
    for (const candidate of MACHINES.filter((entry) => entry.tier === "steam" && !STEAM_CATALOG.includes(entry.slug))) {
      expect(stepsOf((step) => isSameStep(step, machine(candidate.slug))), candidate.slug).toHaveLength(1);
    }
  });

  test("каждая паровая одноблочная машина и каждый котёл стоят ровно в одной прогрессии", () => {
    for (const candidate of SINGLES.filter((entry) => entry.tier === "steam")) {
      expect(stepsOf((step) => isSameStep(step, single(candidate.slug))), candidate.slug).toHaveLength(1);
    }
  });

  test("каждая ступень ведёт на существующую машину", () => {
    for (const step of LINES.flatMap((line) => line.steps)) {
      expect(stepTier(step), step.slug).toBeDefined();
    }
  });

  test("в прогрессии сначала бронзовая, потом стальная, потом большая постройка", () => {
    expect(LINES.find((line) => line.id === "compressor")?.steps).toEqual([
      single("compressor-bronze"),
      single("compressor-steel"),
      machine("steam-compressor"),
    ]);
  });

  test("пар: от угольного котла к многоблочному котлу", () => {
    const steps = LINES.find((line) => line.id === "steam")?.steps ?? [];
    expect(steps[0]).toEqual(single("coal-boiler"));
    expect(steps[steps.length - 1]).toEqual(machine("railcraft-boiler"));
  });

  test("у экстрактора большой постройки нет — в его прогрессии две ступени", () => {
    expect(LINES.find((line) => line.id === "extractor")?.steps).toHaveLength(2);
  });

  test("первой идёт прогрессия пара: без него ничего не работает", () => {
    expect(linesOf("steam")[0].id).toBe("steam");
  });

  test("имена прогрессий не повторяются", () => {
    expect(new Set(LINES.map((line) => line.id)).size).toBe(LINES.length);
  });

  test("у каждой ступени своя страница и своя подпись", () => {
    expect(stepHref(single("compressor-steel"))).toBe("/singles/compressor-steel");
    expect(stepHref(machine("steam-compressor"))).toBe("/machines/steam-compressor");
    expect(stepLabel(single("compressor-steel"))).toBe("Стальная");
    expect(stepLabel(machine("steam-compressor"))).toBe("Постройка");
    expect(stepTitle(single("compressor-steel"))).toBe("Компрессор, стальная");
  });
});

describe("каталог яруса", () => {
  test("на паре в каталоге только ветряк и угольная яма — остальное в прогрессиях", () => {
    expect(catalogOf("steam").flatMap((group) => group.steps)).toEqual([machine("windmill"), machine("charcoal-pile-igniter")]);
  });

  test("в LV — постройки, генераторы и машины по группам, без пустых групп", () => {
    const groups = catalogOf("lv");
    expect(groups[0].id).toBe("buildings");
    expect(groups[0].steps).toEqual([machine("electric-blast-furnace"), machine("electric-air-filter")]);
    expect(groups.map((group) => group.id)).toContain("generator");
    for (const group of groups) expect(group.steps.length).toBeGreaterThan(0);
  });

  test("каждая машина LV попала в каталог ровно один раз", () => {
    const steps = catalogOf("lv").flatMap((group) => group.steps);
    const lvSingles = SINGLES.filter((entry) => entry.tier === "lv");
    for (const entry of lvSingles) {
      expect(steps.filter((step) => isSameStep(step, single(entry.slug))), entry.slug).toHaveLength(1);
    }
  });
});

describe("ярус MV", () => {
  test("в каталоге — четыре постройки, три генератора и машины по группам", () => {
    const groups = catalogOf("mv");
    expect(groups[0].steps.slice(0, 4)).toEqual([
      machine("multi-smelter"),
      machine("pyrolyse-oven"),
      machine("fluid-drilling-rig"),
      machine("large-bronze-boiler"),
    ]);
    expect(groups.find((group) => group.id === "generator")?.steps).toHaveLength(3);
    const singles = SINGLES.filter((entry) => entry.tier === "mv");
    expect(singles).toHaveLength(3 + ASSETS.mvMachineFolders.length);
  });

  test("генераторы MV выдают напряжение своего яруса, вчетверо выше LV", () => {
    const [, lv, mv] = GAME.voltageTiers;
    expect(mv.voltage).toBe(lv.voltage * GAME.voltageStep);
    for (const entry of SINGLES.filter((candidate) => candidate.tier === "mv" && candidate.group === "generator")) {
      expect(entry.facts.find((fact) => fact.label === "Выдаёт")?.value).toContain(String(mv.voltage));
    }
  });

  test("вкладка MV горит на страницах её машин", () => {
    expect(activeTier("/machines/pyrolyse-oven")).toBe("mv");
    expect(activeTier("/singles/electrolyzer-mv")).toBe("mv");
  });
});

describe("ярус HV и постройки GT++", () => {
  test("в каталоге HV — семнадцать построек (с биочаном и постройками из вики 2.9), три генератора и машины", () => {
    const groups = catalogOf("hv");
    expect(groups[0].steps).toHaveLength(17);
    expect(groups[0].steps).toContainEqual(machine("cleanroom"));
    expect(groups[0].steps).toContainEqual(machine("bacterial-vat"));
    expect(groups.find((group) => group.id === "generator")?.steps).toHaveLength(3);
    expect(SINGLES.filter((entry) => entry.tier === "hv")).toHaveLength(3 + ASSETS.hvMachineFolders.length);
  });

  test("генераторы HV выдают напряжение своего яруса", () => {
    const voltage = String(GAME.voltageTiers[3].voltage);
    for (const entry of SINGLES.filter((candidate) => candidate.tier === "hv" && candidate.group === "generator")) {
      expect(entry.facts.find((fact) => fact.label === "Выдаёт")?.value).toContain(voltage);
    }
  });

  test("у каждой машины HV есть версия LV", () => {
    for (const folder of ASSETS.hvMachineFolders) expect(LV_MACHINE_FOLDERS, folder).toContain(folder);
  });

  test("постройки GT++ стоят в MV, и вкладки горят на страницах машин", () => {
    expect(catalogOf("mv")[0].steps).toContainEqual(machine("chemical-plant"));
    expect(catalogOf("mv")[0].steps).toContainEqual(machine("algae-farm"));
    expect(activeTier("/machines/distillation-tower")).toBe("hv");
    expect(activeTier("/singles/macerator-hv")).toBe("hv");
  });
});

describe("ярусы от EV до MAX", () => {
  const expected = [
    { tier: "ev", buildings: 22, generators: 4, folders: ASSETS.evMachineFolders, scene: "large-combustion-engine" },
    { tier: "iv", buildings: 42, generators: 4, folders: ASSETS.ivMachineFolders, scene: "assembly-line" },
    { tier: "luv", buildings: 21, generators: 2, folders: ASSETS.luvMachineFolders, scene: "fusion-reactor-1" },
    { tier: "uv", buildings: 18, generators: 2, folders: ASSETS.uvMachineFolders, scene: "fusion-reactor-3" },
    { tier: "uhv", buildings: 5, generators: 0, folders: ASSETS.uhvMachineFolders, scene: "electric-implosion-compressor" },
    { tier: "uev", buildings: 7, generators: 0, folders: ASSETS.uevMachineFolders, scene: "fusion-reactor-4" },
    { tier: "uiv", buildings: 13, generators: 0, folders: ASSETS.uivMachineFolders, scene: "transcendent-plasma-mixer" },
    { tier: "umv", buildings: 1, generators: 0, folders: ASSETS.umvMachineFolders, scene: "eye-of-harmony" },
    { tier: "uxv", buildings: 1, generators: 0, folders: ASSETS.uxvMachineFolders, scene: "stargate" },
    { tier: "zpm", buildings: 20, generators: 2, folders: ASSETS.zpmMachineFolders, scene: "fusion-reactor-2" },
  ] as const;

  test.each(expected)("в каталоге $tier — постройки, генераторы и машины", ({ tier, buildings, generators, folders, scene }) => {
    const groups = catalogOf(tier);
    expect(groups[0].steps).toHaveLength(buildings);
    expect(groups[0].steps).toContainEqual(machine(scene));
    expect(groups.find((group) => group.id === "generator")?.steps ?? []).toHaveLength(generators);
    expect(SINGLES.filter((entry) => entry.tier === tier)).toHaveLength(generators + folders.length);
  });

  test.each(expected)("генераторы $tier выдают напряжение своего яруса", ({ tier }) => {
    const voltage = String(GAME.voltageTiers[GAME.highTiers[tier]].voltage);
    for (const entry of SINGLES.filter((candidate) => candidate.tier === tier && candidate.group === "generator")) {
      expect(entry.facts.find((fact) => fact.label === "Выдаёт")?.value).toContain(voltage);
    }
  });

  test.each(expected)("у каждой машины $tier есть версия LV, и вкладка яруса горит на её странице", ({ tier, folders, scene }) => {
    for (const folder of folders) expect(LV_MACHINE_FOLDERS, folder).toContain(folder);
    expect(activeTier(`/machines/${scene}`)).toBe(tier);
    const [first] = folders as readonly string[];
    if (first) expect(activeTier(`/singles/${machineId(first)}-${tier}`)).toBe(tier);
  });
});


describe("следующая машина", () => {
  test("внутри прогрессии — следующая ступень", () => {
    expect(nextStep(single("compressor-bronze"))).toEqual(single("compressor-steel"));
  });

  test("после большой постройки — первая машина следующей прогрессии", () => {
    expect(nextStep(machine("steam-compressor"))).toEqual(single("extractor-bronze"));
  });

  test("в каталоге LV — следующая машина каталога", () => {
    expect(nextStep(machine("electric-blast-furnace"))).toEqual(machine("electric-air-filter"));
  });

  test("после последней машины яруса дальше ничего нет", () => {
    const lines = linesOf("steam");
    const final = lines[lines.length - 1];
    expect(nextStep(final.steps[final.steps.length - 1])).toEqual(machine("windmill"));
    expect(nextStep(machine("charcoal-pile-igniter"))).toBeUndefined();
    expect(nextStep(single("нет-такой"))).toBeUndefined();
  });
});

describe("одноблочные машины", () => {
  test("адреса не повторяются", () => {
    const slugs = SINGLES.map((entry) => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("паровые машины — в бронзовой и стальной версии, плюс пять котлов", () => {
    const steam = SINGLES.filter((entry) => entry.tier === "steam");
    expect(steam.filter((entry) => entry.group === "steam")).toHaveLength(SINGLE_BLOCKS.length * 2);
    expect(steam.filter((entry) => entry.group === "boiler")).toHaveLength(5);
  });

  test("неизвестный адрес — нет страницы", () => {
    expect(findSingle("compressor-gold")).toBeUndefined();
  });

  test("названия паровых машин как в игре", () => {
    expect(findSingle("macerator-bronze")?.name).toBe("Steam Macerator");
    expect(findSingle("macerator-steel")?.name).toBe("High Pressure Steam Macerator");
  });

  test("бронзовая медленнее, стальная ест больше пара — числа берутся из настроек игры", () => {
    const value = (slug: string, label: string) => findSingle(slug)?.facts.find((fact) => fact.label === label)?.value;
    expect(value("hammer-bronze", "Скорость")).toContain(String(GAME.steam.bronzeDuration));
    expect(value("hammer-steel", "Расход пара")).toContain(String(GAME.steam.steelSteam));
  });

  test("рассказ упоминает большую постройку, если она есть, и говорит, что её нет, если нет", () => {
    expect(findSingle("furnace-bronze")?.story.join(" ")).toContain("Паровая печь");
    expect(findSingle("extractor-steel")?.story.join(" ")).toContain("нет");
  });

  test("у каждой машины есть рассказ, факты и гайд из нескольких советов без повторов", () => {
    for (const entry of SINGLES) {
      expect(entry.story.length, entry.slug).toBeGreaterThan(0);
      expect(entry.facts.length, entry.slug).toBeGreaterThan(0);
      const titles = entry.guide.tips.map((tip) => tip.title);
      expect(titles.length, entry.slug).toBeGreaterThanOrEqual(2);
      expect(new Set(titles).size, entry.slug).toBe(titles.length);
    }
  });

  test("в LV генераторы выдают напряжение яруса, а прожорливые машины помечены амперами", () => {
    const voltage = String(GAME.voltageTiers[1].voltage);
    for (const entry of SINGLES.filter((candidate) => candidate.tier === "lv" && candidate.group === "generator")) {
      expect(entry.facts.find((fact) => fact.label === "Выдаёт")?.value).toContain(voltage);
    }
    expect(findSingle("arc-furnace-lv")?.facts.find((fact) => fact.label === "Ток")?.value).toBe("3 A");
    expect(findSingle("bender-lv")?.facts.find((fact) => fact.label === "Ток")?.value).toBe("1 A");
  });

  test("вкладка яруса горит и на странице одноблочной машины", () => {
    expect(activeTier("/singles/compressor-steel")).toBe("steam");
    expect(activeTier("/singles/bender-lv")).toBe("lv");
    expect(activeTier("/singles/нет-такой")).toBeNull();
  });
});

describe("текстуры", () => {
  const exists = (name: string) => existsSync(`public/textures/gregtech/${name}.webp`);

  test("у каждой грани каждой одноблочной машины есть файл текстуры", () => {
    for (const entry of SINGLES) {
      for (const name of Object.values(entry.faces)) expect(exists(name), `${entry.slug}: ${name}`).toBe(true);
    }
  });

  test("у каждого вида блока построек есть файлы текстур", () => {
    for (const [id, kind] of Object.entries(KINDS)) {
      expect(exists(kind.texture), `${id}: ${kind.texture}`).toBe(true);
      if ("face" in kind) expect(exists(kind.face.base), `${id}: ${kind.face.base}`).toBe(true);
    }
  });

  test("скрипт качает фасады ровно для тех машин LV, что есть на сайте", () => {
    expect([...ASSETS.lvMachineFolders].sort()).toEqual([...LV_MACHINE_FOLDERS].sort());
  });

  test("у каждой машины MV есть версия LV: в MV машины обновляют, а не открывают заново", () => {
    for (const folder of ASSETS.mvMachineFolders) expect(LV_MACHINE_FOLDERS, folder).toContain(folder);
  });
});

describe("камера шапки одноблочной машины", () => {
  test("ближе, чем у постройки: один блок не теряется в кадре", () => {
    const distance = ({ position, target }: { position: readonly number[]; target: readonly number[] }) =>
      Math.hypot(...position.map((value, axis) => value - target[axis]));
    expect(distance(singleCameraSetup())).toBeLessThan(distance(cameraSetup([3, 4, 3])));
  });
});

describe("прогрессия ведёт на свою страницу", () => {
  test("ступень находит свою прогрессию", () => {
    expect(lineOf(machine("steam-compressor"))?.id).toBe("compressor");
    expect(lineOf(single("bender-lv"))).toBeUndefined();
  });
});
