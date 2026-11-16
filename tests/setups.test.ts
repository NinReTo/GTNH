import { existsSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { CHUNK } from "@/lib/config";
import { MACHINES, kindsOf, structureOf } from "@/lib/machines";
import { MATERIALS, findMaterial, findScene } from "@/lib/setups";
import { SINGLES } from "@/lib/singles";

const variants = MATERIALS.flatMap((material) => material.options.map((option) => [`${material.title}: ${option.label}`, material, option] as const));

describe.each(variants)("линия производства: %s", (_title, material, option) => {
  const structure = structureOf(option.setup);

  // Паровые линии обязаны влезать в чанк; линии выше — две большие постройки подряд.
  test.skipIf(material.tier !== "steam")("помещается в один чанк", () => {
    const [width, , depth] = structure.size;
    expect(width).toBeLessThanOrEqual(CHUNK.side);
    expect(depth).toBeLessThanOrEqual(CHUNK.side);
  });

  test("каждая шина, энергетический и паровой люк смотрит прямо на свою воронку, трубу, сундук или кабель", () => {
    const at = new Map(structure.blocks.map((block) => [block.grid.join(), block]));
    const step = { px: [1, 0, 0], nx: [-1, 0, 0], py: [0, 1, 0], ny: [0, -1, 0], pz: [0, 0, 1], nz: [0, 0, -1] } as const;
    // Каждый люк — к трубе своего вида: пар к пару, вода к воде.
    const partner: Record<string, RegExp> = { steamHatch: /^steamPipe$/, pumpSteamHatch: /^steamPipe$/, pumpOutputHatch: /^waterPipe$/, energy: /^cable/ };
    for (const block of structure.blocks.filter((candidate) => ["inputBus", "outputBus", ...Object.keys(partner)].includes(candidate.kind))) {
      expect(block.face, block.kind).not.toBeNull();
      const [dx, dy, dz] = step[block.face ?? "py"];
      const next = at.get([block.grid[0] + dx, block.grid[1] + dy, block.grid[2] + dz].join());
      expect(next?.kind, `${block.kind} в ${block.grid.join()}`).toMatch(partner[block.kind] ?? /^(ownHopper|ownChest|itemPipe|macerator-lv)/);
    }
  });

  test("у каждого блока есть вид и текстура", () => {
    for (const block of structure.blocks) {
      const kind = kindsOf(option.setup)[block.kind];
      expect(kind, block.kind).toBeDefined();
      expect(existsSync(`public/textures/gregtech/${kind.texture}.webp`), kind.texture).toBe(true);
    }
  });

  test("в линии стоят именно выбранные котлы или генераторы", () => {
    if (option.id === "coke") return;
    expect(structure.blocks.some((block) => block.kind === option.id)).toBe(true);
  });

  test("сцена находит линию по имени, но в каталог машин она не входит", () => {
    expect(findScene(option.setup.slug)).toBe(option.setup);
    expect(MACHINES).not.toContain(option.setup);
  });
});

describe("материалы", () => {
  const firstParts = (slug: string) => findMaterial(slug)?.options[0].parts ?? [];
  const sourcesIn = (slug: string, id: string) => {
    const option = findMaterial(slug)?.options.find((candidate) => candidate.id === id);
    return option ? structureOf(option.setup).blocks.filter((block) => block.kind === id).length : 0;
  };

  test("у каждого яруса от LV до UHV — одна линия; с титана начинается морозильник", () => {
    for (const tier of ["lv", "mv", "hv", "ev", "iv", "luv", "zpm", "uv", "uhv"]) {
      expect(MATERIALS.filter((material) => material.tier === tier), tier).toHaveLength(1);
    }
    expect(firstParts("aluminium").some((part) => part.title.includes("морозильник"))).toBe(false);
    expect(firstParts("titanium").some((part) => part.title.includes("морозильник"))).toBe(true);
  });

  test("бронзу можно греть любым паровым котлом эры, и котлов столько, чтобы хватило пара", () => {
    const boilers = SINGLES.filter((single) => single.group === "boiler" && single.tier === "steam").map((single) => single.slug);
    const options = findMaterial("bronze")?.options ?? [];
    expect(options.map((option) => option.id).sort()).toEqual([...boilers].sort());
    expect(options[0].id).toBe("hp-coal-boiler");
    // 3000 л/с плавильне + ~48 л/с помпе: угольных по 120 — 26, лавовых по 600 — 6, солнечных высокого давления по 360 — 9.
    expect(sourcesIn("bronze", "coal-boiler")).toBe(26);
    expect(sourcesIn("bronze", "hp-lava-boiler")).toBe(6);
    expect(sourcesIn("bronze", "hp-solar-boiler")).toBe(9);
  });

  test("воду котлам качает одна паровая помпа: под каждым котлом — труба с водой", () => {
    for (const option of findMaterial("bronze")?.options ?? []) {
      const blocks = structureOf(option.setup).blocks;
      const at = new Map(blocks.map((block) => [block.grid.join(), block]));
      expect(blocks.filter((block) => block.kind === "pumpController"), option.id).toHaveLength(1);
      for (const boiler of blocks.filter((block) => block.kind === option.id)) {
        expect(at.get([boiler.grid[0], boiler.grid[1] - 1, boiler.grid[2]].join())?.kind, option.id).toBe("waterPipe");
      }
    }
  });

  test("лаву лавовым котлам несёт труба поверх них, угольные кормят руками", () => {
    const option = findMaterial("bronze")?.options.find((candidate) => candidate.id === "hp-lava-boiler");
    const blocks = option ? structureOf(option.setup).blocks : [];
    const at = new Map(blocks.map((block) => [block.grid.join(), block]));
    const boilers = blocks.filter((block) => block.kind === "hp-lava-boiler");
    expect(boilers.length).toBeGreaterThan(0);
    for (const boiler of boilers) expect(at.get([boiler.grid[0], boiler.grid[1] + 1, boiler.grid[2]].join())?.kind).toBe("lavaPipe");
    const coal = findMaterial("bronze")?.options.find((candidate) => candidate.id === "coal-boiler");
    expect(coal ? structureOf(coal.setup).blocks.some((block) => block.kind === "lavaPipe") : true).toBe(false);
    expect(coal?.parts.some((part) => part.text.includes("руками"))).toBe(true);
  });

  test("сталь LV: дробилка отдаёт пыль в шину, электролизёры гонят кислород во входной люк, у каждой машины — кабель", () => {
    const option = findMaterial("steel-ebf")?.options.find((candidate) => candidate.id === "combustion-generator-lv");
    const blocks = option ? structureOf(option.setup).blocks : [];
    const at = new Map(blocks.map((block) => [block.grid.join(), block]));
    const step = { px: [1, 0, 0], nx: [-1, 0, 0], py: [0, 1, 0], ny: [0, -1, 0], pz: [0, 0, 1], nz: [0, 0, -1] } as const;
    const ahead = (block: (typeof blocks)[number], face: keyof typeof step = block.face ?? "py") => at.get(block.grid.map((value, axis) => value + step[face][axis]).join());
    const macerator = blocks.find((block) => block.kind === "macerator-lv");
    expect(macerator && ahead(macerator)?.kind).toBe("inputBus");
    const electrolyzers = blocks.filter((block) => block.kind === "electrolyzer-lv");
    expect(electrolyzers).toHaveLength(4);
    for (const block of electrolyzers) {
      expect(ahead(block)?.kind).toBe("oxygenPipe");
      expect(ahead(block, "py")?.kind).toBe("waterPipe");
    }
    const hatch = blocks.find((block) => block.kind === "inputHatch");
    expect(hatch && ahead(hatch)?.kind).toBe("oxygenPipe");
    for (const block of [macerator, ...electrolyzers, blocks.find((candidate) => candidate.kind === "pump-lv")]) {
      const sides = Object.keys(step) as (keyof typeof step)[];
      expect(sides.some((side) => ahead(block!, side)?.kind.startsWith("cable")), block?.kind).toBe(true);
    }
  });

  test("та же выработка стали без энергии: 10 домн и 8 коксовых печей стенка к стенке, у печей — люки, у домн — воронки и вагонетки, вкладка первая", () => {
    const [first] = findMaterial("steel-ebf")?.options ?? [];
    expect(first?.id).toBe("coke");
    const blocks = first ? structureOf(first.setup).blocks : [];
    const at = new Map(blocks.map((block) => [block.grid.join(), block]));
    const ahead = (block: (typeof blocks)[number]) => {
      const step = { px: [1, 0, 0], nx: [-1, 0, 0], py: [0, 1, 0], ny: [0, -1, 0], pz: [0, 0, 1], nz: [0, 0, -1] } as const;
      return at.get(block.grid.map((value, axis) => value + step[block.face ?? "py"][axis]).join());
    };
    expect(blocks.filter((block) => block.kind === "bbfController")).toHaveLength(10);
    expect(blocks.filter((block) => block.kind === "cokeController")).toHaveLength(8);
    // Стенка к стенке: ряд из восьми печей — 17 блоков, а не 24.
    const ovenXs = blocks.filter((block) => block.kind.startsWith("coke") && block.grid[2] <= 0).map((block) => block.grid[0]);
    expect(Math.max(...ovenXs) - Math.min(...ovenXs) + 1).toBe(17);
    const partner: Record<string, string> = { cokeHatchIn: "itemPipe", cokeHatchItems: "itemPipe", cokeHatchFluid: "creosotePipe" };
    for (const kind of Object.keys(partner)) {
      const hatches = blocks.filter((block) => block.kind === kind);
      expect(hatches, kind).toHaveLength(8);
      for (const hatch of hatches) expect(ahead(hatch)?.kind, kind).toBe(partner[kind]);
    }
    // Домны — как в паровой линии: воронка в контроллер спереди с сундуком над ней, вагонетка под контроллером, воронка под ней.
    for (const controller of blocks.filter((block) => block.kind === "bbfController")) {
      const [x, y, z] = controller.grid;
      expect(at.get([x, y, z + 1].join())?.kind).toBe("ownHopperBack");
      expect(at.get([x, y + 1, z + 1].join())?.kind).toBe("ownChest");
      expect(at.get([x, y - 1, z].join())?.kind).toBe("firebrickCart");
      expect(at.get([x, y - 2, z].join())?.kind).toBe("ownHopperFront");
      expect(at.get([x, y - 2, z + 1].join())?.kind).toBe("itemPipe");
      // Кокс приходит по трубе к воронке спереди.
      expect(at.get([x, y, z + 2].join())?.kind).toBe("itemPipe");
    }
  });

  test("паровые турбины LV получают пар: котлы на трубе с водой, помпа, к задней стороне каждой турбины — паропровод", () => {
    const option = findMaterial("steel-ebf")?.options.find((candidate) => candidate.id === "steam-turbine-lv");
    const blocks = option ? structureOf(option.setup).blocks : [];
    const at = new Map(blocks.map((block) => [block.grid.join(), block]));
    // 241 EU/t × 20 × 7/3 ≈ 11 250 л/с пара плюс пар помпы — по 300 л/с на котёл.
    const boilers = blocks.filter((block) => block.kind === "hp-coal-boiler");
    expect(boilers.length).toBe(39);
    for (const boiler of boilers) expect(at.get([boiler.grid[0], boiler.grid[1] - 1, boiler.grid[2]].join())?.kind).toBe("waterPipe");
    expect(blocks.filter((block) => block.kind === "pumpController")).toHaveLength(1);
    const turbines = blocks.filter((block) => block.kind === "steam-turbine-lv");
    expect(turbines.length).toBeGreaterThan(0);
    for (const turbine of turbines) expect(at.get([turbine.grid[0], turbine.grid[1], turbine.grid[2] - 1].join())?.kind).toBe("steamPipe");
  });

  test.each([
    ["gas-turbine-lv", "biogasPipe", { "plant-macerator-lv": 1, "brewery-lv": 1 }],
    ["combustion-generator-lv", "biodieselPipe", { "compressor-lv": 1, "plant-macerator-lv": 1, "centrifuge-lv": 1, "brewery-lv": 1, "fermenter-lv": 2, "distillery-lv": 2, "fluid-extractor-lv": 3, "fluid-canner-lv": 1, "chemical-reactor-lv": 1 }],
  ] as const)("сталь LV, %s: цепочка топлива из биомассы, топливо — к задней стороне каждого генератора, у машин — кабель снизу", (id, pipe, counts) => {
    const option = findMaterial("steel-ebf")?.options.find((candidate) => candidate.id === id);
    const blocks = option ? structureOf(option.setup).blocks : [];
    const at = new Map(blocks.map((block) => [block.grid.join(), block]));
    for (const [kind, count] of Object.entries(counts)) {
      const machines = blocks.filter((block) => block.kind === kind);
      expect(machines, kind).toHaveLength(count);
      for (const machine of machines) expect(at.get([machine.grid[0], machine.grid[1] - 1, machine.grid[2]].join())?.kind, kind).toMatch(/^cable/);
    }
    const generators = blocks.filter((block) => block.kind === id);
    expect(generators.length).toBeGreaterThan(0);
    for (const generator of generators) expect(at.get([generator.grid[0], generator.grid[1], generator.grid[2] - 1].join())?.kind).toBe(pipe);
  });

  test("на EU-линиях — все генераторы яруса и только они", () => {
    for (const material of MATERIALS.filter((candidate) => !["steam", "uhv"].includes(candidate.tier))) {
      const generators = SINGLES.filter((single) => single.group === "generator" && single.tier === material.tier).map((single) => single.slug);
      // У стали LV первой идёт вкладка с кирпичными домнами (id «coke») — без генераторов.
      expect(material.options.map((option) => option.id).filter((id) => id !== "coke").sort(), material.slug).toEqual([...generators].sort());
    }
    // Реактор синтеза III питают люки UV — и генераторы UV.
    expect(findMaterial("neutronium")?.options.every((option) => option.id.endsWith("-uv"))).toBe(true);
  });

  test("у пара есть бронза и сталь; в линии стали кокс идёт через люки печи, сталь — вагонеткой с воронкой под домной", () => {
    expect(findMaterial("bronze")?.tier).toBe("steam");
    const steel = findMaterial("steel");
    const blocks = steel ? structureOf(steel.options[0].setup).blocks : [];
    const at = (cell: readonly number[]) => blocks.find((block) => block.grid.join() === cell.join());
    // Коксовая печь: люк входа смотрит на воронку, люк выхода — на трубу под собой.
    const hatchIn = blocks.find((block) => block.kind === "cokeHatchIn");
    const hatchOut = blocks.find((block) => block.kind === "cokeHatchItems");
    expect(hatchIn?.face).toBe("pz");
    expect(at([hatchIn!.grid[0], hatchIn!.grid[1], hatchIn!.grid[2] + 1])?.kind).toBe("ownHopperBack");
    expect(hatchOut?.face).toBe("ny");
    expect(at([hatchOut!.grid[0], hatchOut!.grid[1] - 1, hatchOut!.grid[2]])?.kind).toBe("itemPipe");
    // Домна: вагонетка прямо под контроллером, под ней — воронка.
    const carts = blocks.filter((block) => block.kind.endsWith("Cart"));
    expect(carts.map((cart) => cart.kind)).toEqual(["firebrickCart"]);
    const [x, y, z] = carts[0].grid;
    expect(at([x, y + 1, z])?.kind).toBe("bbfController");
    expect(at([x, y - 1, z])?.kind.startsWith("ownHopper")).toBe(true);
  });
});
