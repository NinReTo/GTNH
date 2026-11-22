import { existsSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { beforeAll, describe, expect, test } from "vitest";
import { cableOffers, goodsByName, pipeOffers } from "@/lib/calc/conduits";
import { buildFactory, pipeStepInsideChunk } from "@/lib/calc/factory";
import { optimizeSurplus, surplusScore } from "@/lib/calc/optimize";
import { boilerPlant, fuelInputs, fuelPerSecond, fuelsOf, generatorChoices, tierIdOf } from "@/lib/calc/power";
import { alternatives, buildIndex, plan, reach, runningEut, type Index } from "@/lib/calc/planner";
import { Repository } from "@/lib/calc/repository";
import { groupOreOptions, ingredientForm } from "@/lib/calc/recipe-groups";
import { CALC, CHUNK } from "@/lib/config";
import { findMachine, kindsOf, structureOf } from "@/lib/machines";
import { makeText } from "@/components/calc/text";

const DATA = "public/calc/data.bin";

test("труба пересекает границу чанка поперёк и обходит её кромку", () => {
  expect(pipeStepInsideChunk([0, 1, -1], [1, 1, -1])).toBe(false);
  expect(pipeStepInsideChunk([0, 1, -1], [0, 1, 0])).toBe(true);
  expect(pipeStepInsideChunk([-1, 1, 1], [-1, 1, 2])).toBe(false);
  expect(pipeStepInsideChunk([-2, 1, 1], [-1, 1, 1])).toBe(true);
  expect(pipeStepInsideChunk([0, 1, 1], [1, 1, 1])).toBe(true);
});

// Выгрузка не в git (npm run calc-data): без неё проверки пропускаются.
describe.skipIf(!existsSync(DATA))("калькулятор на выгрузке GTNH", () => {
  let index: Index;
  const find = (name: string) => [...index.repository.itemPtrs].find((ptr) => index.repository.goods(ptr).name === name)!;

  beforeAll(() => {
    const raw = gunzipSync(readFileSync(DATA));
    index = buildIndex(new Repository(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)));
  }, 60_000);

  test("поиск MV электросхем находит конкретные модели из словаря", () => {
    const names = JSON.parse(readFileSync("public/i18n/calc-ru.json", "utf8"));
    const { matches } = makeText("ru", names);
    const results = [...index.producers.keys()].filter((ptr) => !index.raw.has(ptr))
      .map((ptr) => index.repository.goods(ptr))
      .filter((goods) => matches(goods, "mv эле", index.repository.circuitTiers.get(goods.ptr)))
      .map(({ name }) => name);
    expect(results).toEqual(expect.arrayContaining(["Good Electronic Circuit", "Good Integrated Circuit", "Integrated Processor"]));
    expect(results.some((name) => /\bUMV\b/.test(name))).toBe(false);
  });

  test("общий поиск находит схемы всех ярусов и принимает ярус в любом порядке", () => {
    const ru = makeText("ru", undefined);
    const en = makeText("en", undefined);
    const { repository } = index;
    expect(new Set(repository.circuitTiers.values()).size).toBe(15);
    for (const [ptr, tier] of repository.circuitTiers) {
      const goods = repository.goods(ptr);
      expect(ru.matches(goods, "электросхемы", tier)).toBe(true);
      expect(ru.matches(goods, `схемы ${tier}`, tier)).toBe(true);
      expect(ru.matches(goods, `${tier} эле`, tier)).toBe(true);
      expect(en.matches(goods, `circuits ${tier}`, tier)).toBe(true);
    }
    const results = [...index.producers.keys()].filter((ptr) => !index.raw.has(ptr))
      .map((ptr) => repository.goods(ptr))
      .filter((goods) => ru.matches(goods, "ev эле", repository.circuitTiers.get(goods.ptr)))
      .map(({ name }) => name);
    expect(results).toEqual(expect.arrayContaining(["Quantum Processor", "Nano Assembly", "Workstation"]));
    expect(results.some((name) => /\bUEV\b/.test(name))).toBe(false);
  });

  test("угольные руды группируются только при одинаковом выходе и режиме работы", () => {
    const coal = find("Coal");
    const options = alternatives(index, reach(index, 0), coal);
    const groups = groupOreOptions(index, options);
    const grouped = groups.filter((group) => group.length > 1);
    expect(grouped.length).toBeGreaterThan(0);
    expect(groups.flat()).toHaveLength(options.length);
    const yields = grouped.filter(([option]) => option.choice.recipe.type === "Forge Hammer")
      .map(([option]) => option.choice.recipe.outputs.find((output) => output.goods[0] === coal)?.amount);
    expect(yields).toContain(2);
    expect(groups.some(([option]) => option.choice.recipe.type === "Forge Hammer" &&
      option.choice.recipe.outputs.some((output) => output.goods[0] === coal && output.amount === 4))).toBe(true);
  });

  test("в переплавке железа группы сохраняют формы пыли и обработанной руды", () => {
    const options = alternatives(index, reach(index, 0), find("Iron Ingot"));
    const groups = groupOreOptions(index, options);
    const form = ({ choice }: (typeof options)[number]) => ingredientForm(index.repository.goods(choice.inputs[0]))?.[1];
    const groupedForms = groups.filter((group) => group.length > 1).map((group) => {
      const forms = new Set(group.map(form));
      expect(forms.size).toBe(1);
      return form(group[0]);
    });
    expect(groupedForms).toContain("Dust");
    expect(groupedForms).toContain("Crushed ore");
    const doubleSmelts = groups.filter(([option]) => option.choice.crafter.label === "Electric Furnace LV" &&
      option.choice.recipe.outputs.some((output) => output.amount === 2));
    expect(doubleSmelts).toHaveLength(1);
    expect(doubleSmelts[0]).toHaveLength(14);
    expect(doubleSmelts[0].every((option) => form(option) === "Ore (Nether / End)")).toBe(true);
    for (const [prefix, expected] of [
      ["", "Dust"],
      ["Impure Pile of ", "Impure dust"],
      ["Purified Pile of ", "Purified dust"],
      ["Ground ", "Crushed ore"],
      ["Purified ", "Purified ore"],
      ["Centrifuged ", "Centrifuged ore"],
    ]) {
      expect(groups.some((group) => group.length > 1 && group.some((option) => {
        const ingredient = index.repository.goods(option.choice.inputs[0]);
        return ingredient.internalName === "gt.metaitem.01" &&
          ingredient.name === `${prefix}Basaltic Mineral Sand` && form(option) === expected;
      })), expected).toBe(true);
    }
  });

  test("паровая турбина LV принимает пар из многоблочного котла Railcraft", async () => {
    const tier = tierIdOf(0);
    const turbine = generatorChoices(tier).find(({ slug }) => slug.startsWith("steam-turbine"))!;
    const fuel = fuelsOf(turbine, index.repository, index.vendor).find((each) => each.steam?.boiler.slug === "railcraft-boiler")!;
    const reached = reach(index, 0);
    const steel = plan(index, reached, find("Steel Ingot"), 0.1);
    const inputs = fuelInputs(steel.averageEut, fuel, index.repository);
    expect(inputs.map(({ goods }) => goods.name)).toEqual(["Water", "Coal"]);
    expect(inputs.every(({ perSecond }) => perSecond > 0)).toBe(true);
    expect(boilerPlant(1, fuel.steam!).boilers).toBe(1);
    const factory = await buildFactory(steel, "calc-test-railcraft", undefined, undefined, { power: { generatorSlug: turbine.slug, fuel } });
    const blocks = structureOf(factory.machine).blocks;
    expect(blocks.filter(({ kind }) => kind === "rcFirebox")).toHaveLength(9);
    expect(blocks.filter(({ kind }) => kind === "rcTank")).toHaveLength(27);
    const at = new Map(blocks.map((block) => [block.grid.join(","), block]));
    const firebox = blocks.find(({ kind, grid: [x, y, z] }) => kind === "rcFirebox" && at.get([x, y, z - 1].join(","))?.links?.includes("pz"));
    expect(firebox).toBeDefined();
    expect(blocks.some(({ kind }) => kind === "pumpSteamHatch")).toBe(true);
    expect(blocks.some(({ kind }) => kind === "pumpOutputHatch")).toBe(true);
    expect(factory.markers.some(({ lines }) => lines.some((line) => line.includes("Выход через кабель")))).toBe(true);
    expect(factory.notes.join(" ")).not.toMatch(/Could not connect the water pump|Не удалось соединить паровой насос/);
    expect(factory.notes).not.toContainEqual(expect.stringMatching(/Трубу топлива к .* проложить не удалось/));
  });

  test("сжатый воздух даёт компрессор с затратами энергии", () => {
    const air = [...index.repository.fluidPtrs].find((ptr) => index.repository.goods(ptr).name === "Air")!;
    const reached = reach(index, 0);
    const supply = plan(index, reached, air, 1);
    expect(index.raw.has(air)).toBe(false);
    expect(supply.steps.map(({ recipe }) => recipe.type)).toEqual(["Compressor"]);
    expect(supply.averageEut).toBeGreaterThan(0);
  });

  test("котельная питает все блоки турбин фабрики тёмной стали с кислородом на LV", async () => {
    const turbine = generatorChoices(tierIdOf(0)).find(({ slug }) => slug.startsWith("steam-turbine"))!;
    const fuel = fuelsOf(turbine, index.repository, index.vendor).find((each) => each.steam?.boiler.slug === "railcraft-boiler")!;
    const reached = reach(index, 0);
    const metal = find("Dark Steel");
    const steel = plan(index, reached, metal, 20 / CALC.ui.secondsPerMinute);
    const furnace = steel.steps.find((step) => step.outputs.some(({ goods }) => goods.name === "Dark Steel"));
    expect(furnace?.furnaceCoil?.id).toBe("cupronickel");
    const placement: string[] = [];
    const factory = await buildFactory(steel, "calc-test-dark-steel-steam", undefined, ({ label }) => {
      if (label.startsWith("Ставлю машины:")) placement.push(label);
    }, {
      pipes: pipeOffers(index.repository, reached.cost),
      cables: cableOffers(index.repository, reached.cost),
      goodsNamed: goodsByName(index.repository),
      power: { generatorSlug: turbine.slug, fuel },
    });
    const firstSingle = placement.findIndex((label) => /Compressor/.test(label));
    const lastFurnace = placement.findLastIndex((label) => /Electric Blast Furnace/.test(label));
    expect(lastFurnace).toBeGreaterThanOrEqual(0);
    expect(firstSingle).toBeGreaterThan(lastFurnace);
    expect(factory.stats.productionChunks).toBe(factory.stats.chunks);
    const fireboxes = new Map<string, number>();
    const turbineLevels = new Set<number>();
    const boilerHeight = findMachine("railcraft-boiler")!.def.layers.length;
    for (const { kind, grid: [x, y, z] } of structureOf(factory.machine).blocks) {
      if (kind === turbine.slug) {
        turbineLevels.add(y);
        expect(y).toBeLessThan(boilerHeight * CALC.equipmentHeight.base);
      }
      if (kind === "rcFirebox") {
        const column = `${x},${z}`;
        fireboxes.set(column, (fireboxes.get(column) ?? 0) + 1);
      }
    }
    expect(turbineLevels.size, factory.notes.join(" ")).toBeGreaterThan(1);
    expect(Math.max(...fireboxes.values())).toBeLessThanOrEqual(CALC.equipmentHeight.multiblockStack);
    expect(factory.markers.filter(({ title }) => title.startsWith("Паровая турбина ×")).length).toBeGreaterThan(1);
    expect(factory.notes.join(" ")).not.toMatch(/энергетическим люкам не хватает/);
    expect(factory.missingConnections, factory.notes.join(" ")).toBe(0);
    expect(factory.notes.join(" ")).not.toMatch(/Трубу топлива к|Трубу пара к|Поток топлива выше ёмкости|Не удалось соединить паровой насос/);
  }, 45_000);

  test("блоки генераторов получают топливо из разных баков при перегрузке общего канала", async () => {
    const reached = reach(index, 0);
    const generator = generatorChoices(tierIdOf(0)).find(({ slug }) => slug.startsWith("combustion-generator"))!;
    const fuel = fuelsOf(generator, index.repository, index.vendor).find(({ goods }) => goods.name === "Oil")!;
    const steel = plan(index, reached, find("Dark Steel"), 20 / CALC.ui.secondsPerMinute);
    const pipe = pipeOffers(index.repository, reached.cost).find(({ goods }) => goods.name === "Copper Fluid Pipe")!;
    const factory = await buildFactory(steel, "calc-test-parallel-fuel", undefined, undefined, {
      pipes: [{ ...pipe, perSecond: fuelPerSecond(2400, fuel) }],
      power: { generatorSlug: generator.slug, fuel },
    });
    expect(factory.markers.filter(({ title }) => title === "Топливо: Oil").length, factory.notes.join(" ")).toBeGreaterThan(1);
    expect(factory.notes.join(" ")).not.toContain("Поток топлива выше ёмкости трубы");
  }, 30_000);

  test.each([
    ["hp-coal-boiler", "Уголь для котлов", "itemPipe"],
    ["hp-lava-boiler", "Лава для котлов", "calcFluidPipe"],
  ])("котёл %s получает топливо по отдельной трубе", async (slug, label, pipe) => {
    const turbine = generatorChoices(tierIdOf(0)).find(({ slug }) => slug.startsWith("steam-turbine"))!;
    const fuel = fuelsOf(turbine, index.repository, index.vendor).find((each) => each.steam?.boiler.slug === slug)!;
    const steel = plan(index, reach(index, 0), find("Steel Ingot"), 0.1);
    const factory = await buildFactory(steel, `calc-test-${slug}`, undefined, undefined, { power: { generatorSlug: turbine.slug, fuel } });
    const blocks = structureOf(factory.machine).blocks;
    const at = new Map(blocks.map((block) => [block.grid.join(","), block]));
    const boilers = blocks.filter(({ kind }) => kind === slug);
    expect(boilers.length).toBeGreaterThan(0);
    expect(boilers.every(({ grid: [x, y, z] }) => {
      const feed = at.get([x, y + 1, z].join(","));
      return feed?.kind === pipe && feed.links?.includes("ny");
    })).toBe(true);
    expect(factory.markers.some(({ title }) => title === label)).toBe(true);
  });

  test("генераторы и топливо: у генератора внутреннего сгорания есть топлива с EU на литр, фабрика пишет расход", async () => {
    const reached = reach(index, 0);
    const [generator] = generatorChoices(tierIdOf(0));
    const fuels = fuelsOf(generator, index.repository, index.vendor);
    const gasoline = fuels.find((fuel) => fuel.goods.name === "Gasoline");
    expect(gasoline?.euPerLitre).toBe(576);
    // Паровой турбине топливо — пар из котлов сайта: LV-турбина берёт 7 л пара на 3 EU; первым — котёл высокого давления.
    const turbine = generatorChoices(tierIdOf(0)).find((single) => single.slug.startsWith("steam-turbine"))!;
    const steamFuels = fuelsOf(turbine, index.repository, index.vendor);
    expect(steamFuels[0]?.steam?.boiler.slug).toBe("hp-coal-boiler");
    expect(steamFuels[0]?.euPerLitre).toBeCloseTo(3 / 7);
    expect(steamFuels.map((fuel) => fuel.steam?.boiler.slug)).toContain("hp-lava-boiler");
    const steelPlan = plan(index, reached, find("Steel Ingot"), 1);
    const factory = await buildFactory(steelPlan, "calc-test-fuel", undefined, undefined, { power: { generatorSlug: generator.slug, fuel: gasoline } });
    const line = factory.conduits.find((conduit) => conduit.label === "Топливо: Gasoline");
    expect(line?.detail).toMatch(/л\/мин/);
    const steamFactory = await buildFactory(steelPlan, "calc-test-steam", undefined, undefined, { power: { generatorSlug: turbine.slug, fuel: steamFuels[0] } });
    const boilers = steamFactory.conduits.find((conduit) => conduit.label.startsWith("Пар: Угольный котёл высокого давления"));
    expect(boilers?.detail).toMatch(/угля .* в минуту/);
    // Котельная нарисована: столько котлов, сколько в сводке, и плашка над ними.
    const boilerCount = Number(/× (\d+)/.exec(boilers?.label ?? "")?.[1]);
    expect(structureOf(steamFactory.machine).blocks.filter((block) => block.kind === "hp-coal-boiler")).toHaveLength(boilerCount);
    expect(steamFactory.markers.some((marker) => marker.title.startsWith("Угольный котёл высокого давления ×"))).toBe(true);
    // Тупиков нет: у каждой трубы больше одной связи или её единственная связь — к машине, люку или ёмкости.
    const steamBlocks = structureOf(steamFactory.machine).blocks;
    const byCell = new Map(steamBlocks.map((block) => [block.grid.join(","), block]));
    const shift: Record<string, readonly number[]> = { px: [1, 0, 0], nx: [-1, 0, 0], py: [0, 1, 0], ny: [0, -1, 0], pz: [0, 0, 1], nz: [0, 0, -1] };
    const stubs = steamBlocks.filter((block) => /pipe/i.test(block.kind) && (block.links ?? []).length <= 1 && (block.links ?? []).every((side) => /pipe/i.test(byCell.get(block.grid.map((value, axis) => value + shift[side][axis]).join(","))?.kind ?? "pipe")));
    expect(stubs).toEqual([]);
    // Каждая турбина стоит у кабеля: генераторов столько, сколько берут люки, лишних рядов без кабеля нет.
    const turbines = steamBlocks.filter((block) => block.kind === turbine.slug);
    expect(turbines.every((block) => Object.values(shift).some((delta) => /^cable/.test(byCell.get(block.grid.map((value, axis) => value + delta[axis]).join(","))?.kind ?? "")))).toBe(true);
    // Одна труба котельной — на два ряда котлов: отростки и вперёд, и назад.
    expect(structureOf(steamFactory.machine).blocks.some((block) => /pipe/i.test(block.kind) && block.links?.includes("pz") && block.links?.includes("nz"))).toBe(true);
    // Наквадовому реактору топливо — стержни и болты (штуки), они идут из сундука.
    const reactor = generatorChoices("ev").find((single) => single.slug.startsWith("naquadah-reactor"))!;
    expect(fuelsOf(reactor, index.repository, index.vendor).every((fuel) => fuel.isItem && fuel.euPerLitre > 0)).toBe(true);
  }, 120_000);

  test("три машины на 10 % загрузки получают по амперу одновременно", async () => {
    const full = plan(index, reach(index, 0), find("Steel Ingot"), 0.1);
    const voltage = 32;
    const source = full.steps.find((step) => step.crafter.kind === "single" && runningEut(step) > 0 && runningEut(step) <= voltage)!;
    const machines = 3;
    const busy = 0.1;
    const step = { ...source, machines, busy, eut: runningEut(source) * machines * busy };
    const factory = await buildFactory({
      ...full, target: step.outputs[0].goods, steps: [step], averageEut: step.eut, surplus: [],
    }, "calc-test-peak-amps");
    expect(step.eut).toBeLessThan(voltage);
    expect(factory.stats.generationEut).toBe(machines * voltage);
    expect(factory.conduits.some(({ detail }) => detail.includes("3 А при 32 В"))).toBe(true);
  });

  test("кабель — без потерь, если такой можно сделать; у оловянного считаются потери по длине", async () => {
    const reached = reach(index, 0);
    const steelPlan = plan(index, reached, find("Steel Ingot"), 1);
    const named = goodsByName(index.repository);
    const lossless = await buildFactory(steelPlan, "calc-test-cable", undefined, undefined, { cables: cableOffers(index.repository, reached.cost), goodsNamed: named });
    expect(lossless.conduits.find((conduit) => /Redstone Alloy Cable$/.test(conduit.label))?.detail).toMatch(/без потерь/);
    // Генераторов 41, а кабель держит 16 А: у каждого ряда генераторов своя сеть, ток сети не больше, чем держит кабель.
    const networks = /(\d+) отдельных сетей.*?до (\d+) А/.exec(lossless.conduits.find((conduit) => /Cable$/.test(conduit.label))?.detail ?? "");
    expect(Number(networks?.[1])).toBeGreaterThan(1);
    expect(Number(networks?.[2])).toBeLessThanOrEqual(16);
    // Без списка — оловянный кабель яруса: 1 EU на блок на ампер, ампер LV доходит на 32 блока.
    const tin = await buildFactory(steelPlan, "calc-test-tin", undefined, undefined, { goodsNamed: named });
    expect(tin.conduits.find((conduit) => /Tin Cable$/.test(conduit.label))?.detail).toMatch(/в среднем \d+ блоков кабеля.*ампер доходит на 32 блоков/);
    // Генераторы — во весь чанк и вверх: их кабель не длиннее нескольких чанков.
    expect(tin.stats.chunks).toBeLessThanOrEqual(CHUNK.side);
  }, 120_000);

  test("трубы и кабели фабрики: подобраны по потоку, предметная не стыкуется с жидкостной, печи делят стены", async () => {
    const reached = reach(index, 0);
    const steelPlan = plan(index, reached, find("Steel Ingot"), 1);
    const factory = await buildFactory(steelPlan, "calc-test-conduits", undefined, undefined, {
      pipes: pipeOffers(index.repository, reached.cost),
      goodsNamed: goodsByName(index.repository),
    });
    // Сводка: трубы с ёмкостью не меньше нужной и кабель яруса LV (олово).
    const pipes = factory.conduits.filter((conduit) => / Pipe$/.test(conduit.label));
    expect(pipes.length).toBeGreaterThan(0);
    expect(pipes.every((conduit) => conduit.blocks > 0)).toBe(true);
    expect(factory.conduits.some((conduit) => /Tin Cable$/.test(conduit.label))).toBe(true);
    // Ни один отросток трубы не упирается в трубу другого вида (предметную в жидкостную и наоборот).
    const blocks = structureOf(factory.machine).blocks;
    const kinds = kindsOf(factory.machine);
    const isFluid = (kind: string) => / Fluid Pipe$/.test(kinds[kind]?.label ?? "");
    const at = new Map(blocks.map((block) => [block.grid.join(","), block]));
    const step: Record<string, readonly number[]> = { px: [1, 0, 0], nx: [-1, 0, 0], py: [0, 1, 0], ny: [0, -1, 0], pz: [0, 0, 1], nz: [0, 0, -1] };
    const mixed = blocks.filter((block) =>
      (block.links ?? []).some((side) => {
        const other = at.get(block.grid.map((value, axis) => value + step[side][axis]).join(","));
        return other?.links !== undefined && / Pipe$/.test(kinds[other.kind]?.label ?? "") && / Pipe$/.test(kinds[block.kind]?.label ?? "") && isFluid(other.kind) !== isFluid(block.kind);
      }),
    );
    expect(mixed).toEqual([]);
    // Доменные печи стоят вплотную с общими стенами: катушек меньше, чем у стольких отдельных печей.
    const furnaces = steelPlan.steps.find((one) => one.crafter.label === "Electric Blast Furnace")!.machines;
    const perFurnace = structureOf(findMachine("electric-blast-furnace")!).blocks.filter((block) => block.kind === "coil").length;
    expect(furnaces).toBeGreaterThan(1);
    expect(blocks.filter((block) => block.kind === "coil").length).toBeLessThan(furnaces * perFurnace);
  }, 60_000);

  test.each([
    ["Dark Steel", 0, true, 1],
    ["Steel Gear Box Casing", 0, false, 2],
    ["Aluminium Ingot", 1, false, 1],
    ["Stainless Steel Ingot", 2, false, 1],
    ["Electric Motor (MV)", 1, true, 4],
  ] as const)("малый выпуск %s занимает мало чанков со всеми подключениями", async (name, tier, steam, chunks) => {
    const reached = reach(index, tier);
    const generators = generatorChoices(tierIdOf(tier));
    const generator = steam ? generators.find(({ slug }) => slug.startsWith("steam-turbine"))! : generators[0];
    const fuels = fuelsOf(generator, index.repository, index.vendor);
    const fuel = steam ? fuels.find((each) => each.steam?.boiler.slug === "railcraft-boiler") : fuels[0];
    const options = {
      pipes: pipeOffers(index.repository, reached.cost),
      cables: cableOffers(index.repository, reached.cost),
      goodsNamed: goodsByName(index.repository),
      power: { generatorSlug: generator.slug, fuel },
    };
    const smallPlan = plan(index, reached, find(name), 1 / CALC.ui.secondsPerMinute);
    expect(smallPlan.steps.length).toBeGreaterThan(0);
    const small = await buildFactory(smallPlan, `calc-test-small-${name}`, undefined, undefined, options);
    expect(small.missingConnections).toBe(0);
    expect(small.stats.chunks).toBeLessThanOrEqual(chunks);
  }, 60_000);

  test("одноблочные машины тёмной стали с дизельным питанием собраны в одном чанке", async () => {
    const reached = reach(index, 0);
    const diesel = generatorChoices(tierIdOf(0))[0];
    const fuel = fuelsOf(diesel, index.repository, index.vendor)[0];
    const steel = plan(index, reached, find("Dark Steel"), 10 / CALC.ui.secondsPerMinute);
    const factory = await buildFactory(steel, "calc-test-single-chunk", undefined, undefined, {
      pipes: pipeOffers(index.repository, reached.cost),
      cables: cableOffers(index.repository, reached.cost),
      goodsNamed: goodsByName(index.repository),
      power: { generatorSlug: diesel.slug, fuel },
    });
    const labels = new Set(steel.steps.filter(({ crafter }) => crafter.kind === "single").map(({ crafter }) => crafter.label));
    const kinds = kindsOf(factory.machine);
    const blocks = structureOf(factory.machine).blocks.filter(({ kind }) => labels.has(kinds[kind]?.label));
    const chunks = new Set(blocks.map(({ home: [x, , z] }) =>
      [x, z].map((at, axis) => Math.floor((at - factory.chunkOrigin[axis]) / CHUNK.side)).join(",")));
    expect(blocks.length).toBeGreaterThan(1);
    expect(chunks.size).toBe(1);
    expect(factory.missingConnections, factory.notes.join(" ")).toBe(0);
  }, 60_000);

  test("много маленьких шагов — полками в чанк, а не полосой; одноблочные машины стоят друг на друге", async () => {
    // Дамасская сталь — 30 с лишним шагов по одной машине. Компактная раскладка помещается в квадрат 2 × 2.
    const damascus = plan(index, reach(index, 1), find("Damascus Steel Ingot"), 1 / CALC.ui.secondsPerMinute);
    expect(damascus.steps.length).toBeGreaterThan(CHUNK.side);
    const factory = await buildFactory(damascus, "calc-test-shelves");
    expect(Math.max(...factory.stats.chunkSize)).toBeLessThanOrEqual(2);
    const kinds = kindsOf(factory.machine);
    const singles = structureOf(factory.machine).blocks.filter((block) => /^calc-/.test(block.kind) && !/pipe/.test(block.kind) && kinds[block.kind]);
    // Машина второго этажа стоит выше кабеля и жидкостной трубы первого (слои 0–2).
    expect(singles.some((block) => block.grid[1] > [0, 0].length)).toBe(true);
  }, 60_000);

  test("стальной редуктор укладывается в несколько рядов чанков вместо длинной полосы", async () => {
    const gearbox = plan(index, reach(index, 0), find("Steel Gear Box Casing"), 0.1);
    const factory = await buildFactory(gearbox, "calc-test-gearbox-square");
    const [width, depth] = factory.stats.chunkSize;
    expect(Math.min(width, depth)).toBeGreaterThan(1);
    expect(Math.max(width, depth)).toBeLessThanOrEqual(2 * Math.min(width, depth));
    const blocks = structureOf(factory.machine).blocks;
    const chunk = ({ home: [x, , z] }: (typeof blocks)[number]) =>
      [x, z].map((at, axis) => Math.floor((at - factory.chunkOrigin[axis]) / CHUNK.side)).join(",");
    const production = new Set(blocks.filter(({ kind }) => !/pipe|cable|calcTank|ownChest|hopper/i.test(kind)).map(chunk));
    expect([...new Set(blocks.map(chunk))].filter((key) => !production.has(key))).toEqual([]);
  }, 60_000);

  test("руды с других планет — только с яруса, на котором туда долетают", () => {
    const star = find("Nether Star");
    // Жилы адской звезды — на дальних планетах (ракета 7-го уровня, UV): на LV её нет, а значит и труб из неё.
    expect(reach(index, 0).cost.has(star)).toBe(false);
    expect(reach(index, 7).cost.has(star)).toBe(true);
    expect(pipeOffers(index.repository, reach(index, 0).cost).some((offer) => /Nether Star/.test(offer.goods.name))).toBe(false);
    // Титан — с Марса (EV) или из ильменита с Луны (HV); на LV его не сделать.
    expect(plan(index, reach(index, 0), find("Titanium Ingot"), 1).missing.length).toBeGreaterThan(0);
    const first = reach(index, 0);
    const bart = find("BArTiMaEuSNeK Ore");
    expect(index.rawTier.get(bart)).toBe(CALC.oreDimensionTiers.Ross128ba);
    expect(plan(index, first, bart, 1).missing.map(({ ptr }) => ptr)).toEqual([bart]);
    expect(first.cost.has(find("Europium Ingot"))).toBe(false);
    expect(pipeOffers(index.repository, first.cost).some(({ goods }) => goods.name.includes("Europium"))).toBe(false);
  });

  test("рецепт тёмной стали без кислорода открывается вместе с канталовыми катушками на MV", () => {
    const lv = reach(index, 0);
    const reached = reach(index, 1);
    const metal = find("Dark Steel");
    const coil = find("Kanthal Coil Block");
    const tube = find("Dark Steel Fluid Pipe");
    expect(lv.cost.has(coil)).toBe(false);
    expect(alternatives(index, lv, metal).map(({ choice }) => choice.recipe.heat)).toEqual([1800]);
    expect(plan(index, lv, metal, 1).steps.some((step) => step.goods === metal &&
      step.inputs.some(({ goods }) => goods.name === "Oxygen"))).toBe(true);
    expect(reached.cost.has(coil)).toBe(true);
    expect(reached.cost.has(metal)).toBe(true);
    const hot = alternatives(index, reached, metal).find(({ choice }) => choice.recipe.heat === 2200)?.choice;
    expect(hot).toBeDefined();
    const furnace = plan(index, reached, metal, 1, { given: new Set(), recipes: new Map([[metal, hot!]]) }).steps.find((step) => step.goods === metal);
    expect(furnace?.furnaceCoil?.id).toBe("kanthal");
    expect(furnace && runningEut(furnace)).toBeCloseTo(120);
    const recipe = alternatives(index, lv, tube).find(({ choice }) => choice.crafter.kind === "hand")?.choice.recipe;
    expect(recipe?.type).toBe("Crafting (Shaped)");
    expect(recipe?.inputs.reduce((sum, input) => sum + input.amount, 0)).toBe(6);
    expect(recipe?.catalysts.map((io) => index.repository.goods(io.goods[0]).name)).toEqual(["Single Use Wrench", "Single Use Hard Hammer"]);
    expect(plan(index, lv, tube, 1).missing).toEqual([]);
    expect(pipeOffers(index.repository, lv.cost).some(({ goods }) => goods.ptr === tube)).toBe(true);
  });

  test("сталь на LV — из доменной печи, сырьё — только руды из жил", () => {
    const steel = plan(index, reach(index, 0), find("Steel Ingot"), 1);
    expect(steel.missing).toEqual([]);
    expect(steel.steps.some((step) => step.crafter.kind === "multi" && step.crafter.label.includes("Blast Furnace"))).toBe(true);
    // «Roasted Iron Ore» — блок есть, но в жилах его нет: такое сырьё брать нельзя.
    expect(steel.raw.map((flow) => flow.goods.name)).not.toContain("Roasted Iron Ore");
    expect(steel.raw.length).toBeGreaterThan(0);
  });

  test("пустых колб нет ни в рецептах, ни в цепочке: жидкости идут трубами", () => {
    const isCell = (ptr: number) => index.repository.goods(ptr).name === "Empty Cell";
    expect(index.recipes.some((recipe) => [...recipe.inputs, ...recipe.outputs].some((io) => io.goods.every(isCell)))).toBe(false);
    const aluminium = plan(index, reach(index, 1), find("Aluminium Ingot"), 1);
    expect(aluminium.steps.flatMap((step) => [...step.inputs, ...step.outputs]).some((flow) => isCell(flow.goods.ptr))).toBe(false);
  });

  test("«меньше излишков» уменьшает лишнее на выходе и ничего не делает недоставаемым", async () => {
    const reached = reach(index, 2);
    const stainless = find("Stainless Steel Ingot");
    const none = { given: new Set<number>(), recipes: new Map() };
    const result = await optimizeSurplus(index, reached, stainless, 1, none);
    expect(result.after).toBeLessThan(result.before / 2);
    const after = plan(index, reached, stainless, 1, { ...none, recipes: result.recipes });
    expect(after.missing).toEqual([]);
    expect(surplusScore(after)).toBeCloseTo(result.after);
  });

  test("плашки фабрики: над каждым рядом рецепт, готовый товар и излишки в ёмкостях; сводка сходится с блоками", async () => {
    const steelPlan = plan(index, reach(index, 0), find("Steel Ingot"), 1);
    expect(steelPlan.surplus.length).toBeGreaterThan(0);
    const factory = await buildFactory(steelPlan, "calc-test-markers");
    const rows = steelPlan.steps.filter((step) => step.crafter.kind !== "hand").length;
    expect(factory.markers.filter((marker) => marker.kind === "row" && marker.lines.includes("Берёт:"))).toHaveLength(rows);
    expect(factory.markers.filter((marker) => marker.kind === "product")).toHaveLength(1);
    const surplus = factory.markers.filter((marker) => marker.kind === "surplus");
    expect(surplus.length).toBeGreaterThan(0);
    const kinds = structureOf(factory.machine).blocks.map((block) => block.kind);
    expect(factory.stats.tanks + factory.stats.chests).toBe(kinds.filter((kind) => kind === "calcTank" || kind === "ownChest").length);
    expect(factory.stats.pipes).toBeGreaterThan(0);
    expect(factory.markers.every((marker) => marker.at.every(Number.isFinite))).toBe(true);
    // Чанки — от начала фабрики, как их рисует сетка сцены (chunkOrigin).
    const blocks = structureOf(factory.machine).blocks;
    const chunkAt = (block: (typeof blocks)[number]) => [0, [0, 0].length].map((axis, index) => Math.floor((block.home[axis] - factory.chunkOrigin[index]) / CHUNK.side));
    const across = (index: number) => new Set(blocks.map((block) => chunkAt(block)[index])).size;
    expect(factory.stats.chunks).toBe(across(0) * across(1));
  });

  test("кокс и креозот выходят из своих люков в сундук и бак в одном чанке", async () => {
    const reached = reach(index, 0);
    const coke = find("Coal Coke");
    const oven = alternatives(index, reached, coke).find(({ choice }) => choice.crafter.machine?.slug === "coke-oven")!;
    const full = plan(index, reached, coke, 0.01, { given: new Set(), recipes: new Map([[coke, oven.choice]]) });
    const step = full.steps.find(({ crafter }) => crafter.machine?.slug === "coke-oven")!;
    const fluid = step.outputs.find(({ goods }) => goods.kind === "fluid")!;
    const factory = await buildFactory({ ...full, steps: [{ ...step, machines: 1 }], surplus: [fluid] }, "calc-test-coke-outputs");
    const blocks = structureOf(factory.machine).blocks;
    const at = new Map(blocks.map((block) => [block.grid.join(","), block]));
    const checkOutput = (kind: string, container: string, dx: number) => {
      const hatch = blocks.find((block) => block.kind === kind)!;
      const [x, y, z] = hatch.grid;
      const pipe = at.get([x, y, z - 1].join(","))!;
      expect(pipe.links).toContain("pz");
      expect(at.get([x + dx, y, z - 1].join(","))?.kind).toBe(container);
      return pipe.kind;
    };
    expect(checkOutput("cokeHatchItems", "ownChest", 2)).not.toBe(checkOutput("cokeHatchFluid", "calcTank", -2));
    expect(factory.stats.chunks).toBe(1);
  });

  test("правила чанков: постройка и группа одинаковых машин не делятся между чанками, чанков — поменьше", async () => {
    const stainless = plan(index, reach(index, 2), find("Stainless Steel Ingot"), 1);
    const factory = await buildFactory(stainless, "calc-test-chunks");
    expect(factory.stats.chunks).toBeGreaterThan(0);
    // Куски из соседних блоков машин (без труб, кабелей, ёмкостей и воронок): постройка, ряд одноблочных машин, ряд
    // кирпичных печей. Каждый кусок не шире чанка лежит в одном чанке.
    const blocks = structureOf(factory.machine).blocks.filter((block) => !/pipe|cable|calcTank|ownChest|hopper/i.test(block.kind));
    const at = new Map(blocks.map((block) => [block.home.join(","), block]));
    const seen = new Set<string>();
    const pieces: (typeof blocks)[] = [];
    for (const block of blocks) {
      if (seen.has(block.home.join(","))) continue;
      const piece = [block];
      seen.add(block.home.join(","));
      for (let next = 0; next < piece.length; next += 1) {
        for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
          const key = [piece[next].home[0] + dx, piece[next].home[1] + dy, piece[next].home[2] + dz].join(",");
          const neighbour = at.get(key);
          if (neighbour && !seen.has(key)) {
            seen.add(key);
            piece.push(neighbour);
          }
        }
      }
      pieces.push(piece);
    }
    const chunk = (value: number, axis: 0 | 1) => Math.floor((value - factory.chunkOrigin[axis]) / CHUNK.side);
    const fits = pieces.filter((piece) => [0, [0, 0].length].every((axis) => Math.max(...piece.map((b) => b.home[axis])) - Math.min(...piece.map((b) => b.home[axis])) < CHUNK.side));
    expect(fits.length).toBeGreaterThan(1);
    for (const piece of fits) {
      expect(new Set(piece.map((b) => chunk(b.home[0], 0))).size).toBe(1);
      expect(new Set(piece.map((b) => chunk(b.home[[0, 0].length], 1))).size).toBe(1);
    }
    // Три раскладки фабрики с сотней машин — несколько секунд, дольше обычного предела теста.
  }, 60_000);

  test("постройки вне каталога сайта — только из правил машин и по ярусу рецепта", () => {
    const unlisted = (tier: number) => {
      const reached = reach(index, tier);
      return new Set(index.recipes.map((recipe) => reached.crafterOf(recipe)).filter((crafter) => crafter?.kind === "multi" && !crafter.machine).map((crafter) => crafter!.label));
    };
    expect([...unlisted(0)]).toEqual([]);
    const top = [...unlisted(CALC.ui.maxTier)];
    expect(top.some((label) => label.startsWith("Fusion Control Computer"))).toBe(true);
    expect(top.filter((label) => /cauldron|generator|reactor/i.test(label))).toEqual([]);
    // Ярусы до MAX, а магматерию делают модули Кузницы богов — без них она недоставаема.
    expect(CALC.tierNames[CALC.ui.maxTier]).toBe("MAX");
    const atMax = reach(index, CALC.ui.maxTier);
    expect(atMax.cost.has(find("Magmatter Ingot"))).toBe(true);
    // Универсиум даёт только Глаз гармонии, сжигая водород и гелий, — из него катушки UXV.
    const universium = [...index.repository.fluidPtrs].find((ptr) => index.repository.goods(ptr).name === "Molten Universium")!;
    const eye = atMax.chosen.get(universium)!;
    expect(eye.crafter.label).toBe(CALC.eyeOfHarmony.machine);
    expect(eye.recipe.inputs.map((io) => index.repository.goods(io.goods[0]).name).sort()).toEqual([...CALC.eyeOfHarmony.fluids].sort());
    // Газа — как в коде мода: тело яруса 0 (рецепт на 360 000 тиков) жжёт по 1 млрд л, дальние тела — больше.
    const eyeRecipes = index.recipes.filter((recipe) => recipe.multiblocks.includes(CALC.eyeOfHarmony.machine));
    const nearest = eyeRecipes.find((recipe) => recipe.ticks === CALC.eyeOfHarmony.baseTicks)!;
    expect(nearest.inputs.every((io) => io.amount === CALC.eyeOfHarmony.fluidPerTier)).toBe(true);
    expect(eyeRecipes.some((recipe) => recipe.inputs[0].amount > CALC.eyeOfHarmony.fluidPerTier)).toBe(true);
    expect(atMax.cost.has(find("Extended Mega Ultimate Voltage Coil"))).toBe(true);
    // Ярус MAX считается дважды (выше — для построек вне каталога) — дольше обычных 5 секунд теста.
  }, 60_000);

  test("фабрика MAX: Глазов гармонии рисуется не больше предела блоков, генераторов LV нет", async () => {
    const universium = [...index.repository.fluidPtrs].find((ptr) => index.repository.goods(ptr).name === "Molten Universium")!;
    const universiumPlan = plan(index, reach(index, CALC.ui.maxTier), universium, CALC.factory.maxBlocksPerStep);
    const eyes = universiumPlan.steps.find((step) => step.crafter.label === CALC.eyeOfHarmony.machine)!;
    expect(eyes.machines).toBeGreaterThan(1);
    const factory = await buildFactory(universiumPlan, "calc-test-eye");
    expect(factory.stats.drawn).toBeLessThan(universiumPlan.steps.reduce((sum, step) => sum + step.machines, 0));
    expect(factory.notes.join(" ")).toContain("MAX");
    expect(factory.stats.cables).toBe(0);
    // У Глаза излишков под восемьдесят, но плашек излишков — не больше двух на ряд (бак и сундук).
    const surplusMarks = factory.markers.filter((marker) => marker.kind === "surplus");
    expect(universiumPlan.surplus.length).toBeGreaterThan(surplusMarks.length);
    expect(surplusMarks.length).toBeLessThanOrEqual(universiumPlan.steps.length * [0, 0].length);
  }, 300_000);

  test("своё сырьё и свой рецепт меняют цепочку", () => {
    const reached = reach(index, 0);
    const steel = find("Steel Ingot");
    const iron = find("Iron Ingot");
    // Железо «есть у меня» — его не делают, оно в списке своего.
    const withIron = plan(index, reached, steel, 1, { given: new Set([iron]), recipes: new Map() });
    expect(withIron.given.map((flow) => flow.goods.name)).toContain("Iron Ingot");
    expect(withIron.steps.some((step) => step.outputs.some((flow) => flow.goods.ptr === iron))).toBe(false);
    // Другой рецепт стали — в плане именно он.
    const options = alternatives(index, reached, steel);
    expect(options.length).toBeGreaterThan(1);
    // Переплавка блока стали в сталь — круг, её в списке нет.
    expect(options.some((option) => option.choice.inputs.some((ptr) => index.repository.goods(ptr).name === "Block of Steel"))).toBe(false);
    const other = options.find((option) => option.choice.recipe.ptr !== reached.chosen.get(steel)?.recipe.ptr)!;
    const picked = plan(index, reached, steel, 1, { given: new Set(), recipes: new Map([[steel, other.choice]]) });
    expect(picked.steps.some((step) => step.recipe.ptr === other.choice.recipe.ptr)).toBe(true);
  });

  test("кирпичные домны — без энергии, с вагонетками; у электрической печи шина и люк там, где к ним подходит труба", async () => {
    const reached = reach(index, 0);
    const steel = find("Steel Ingot");
    const bricked = alternatives(index, reached, steel).find((option) => option.choice.crafter.label === "Bricked Blast Furnace")!;
    const bbfPlan = plan(index, reached, steel, 1, { given: new Set(), recipes: new Map([[steel, bricked.choice]]) });
    const factory = await buildFactory(bbfPlan, "calc-test-bricked");
    const blocks = structureOf(factory.machine).blocks;
    const kinds = kindsOf(factory.machine);
    const labelOf = (kind: string) => kinds[kind]?.label ?? kind;
    const domnaRow = blocks.filter((block) => block.kind === "firebrickCart");
    // Нарисованы все домны (их сотни — рядами по чанку и длиннее), а не первый ряд.
    const furnaces = bbfPlan.steps.find((step) => step.crafter.label === "Bricked Blast Furnace")!.machines;
    expect(furnaces).toBeGreaterThan(CHUNK.side);
    expect(domnaRow.length).toBe(furnaces);
    expect(factory.notes.join(" ")).not.toContain("нарисовано");
    // Энергетические люки могут быть только у электрических машин цепочки, не у домн: их ряд — без люков.
    const energy = blocks.filter((block) => labelOf(block.kind) === "Энергетический люк");
    expect(energy.every((hatch) => !domnaRow.some((cart) => Math.abs(cart.home[2] - hatch.home[2]) < 1))).toBe(true);

    const electric = await buildFactory(plan(index, reached, steel, 0.1), "calc-test-ebf");
    const ebfKinds = kindsOf(electric.machine);
    const ebfBlocks = structureOf(electric.machine).blocks.map((block) => ebfKinds[block.kind]?.label);
    expect(ebfBlocks).toContain("Входная шина");
    expect(ebfBlocks).toContain("Входной люк");
    expect(electric.notes.join(" ")).not.toContain("Кабели к машинам проложить не удалось");
    // Сотни домн раскладываются трижды (ряды в 1, 2 и 4 чанка) — дольше обычных 5 секунд теста.
  }, 60_000);

  test.each([
    ["Steel Ingot", 0],
    ["Aluminium Ingot", 1],
  ] as const)("фабрика для %s собирается из известных блоков, ход сборки идёт до конца", async (name, tier) => {
    const steps: number[] = [];
    const factory = await buildFactory(plan(index, reach(index, tier), find(name), 0.1), `calc-test-${name}`, undefined, (progress) => {
      steps.push(progress.done);
      expect(progress.done).toBeLessThan(progress.total);
      expect(progress.label).not.toBe("");
    });
    // Каждый этап отчитался по разу, по порядку: ряды машин, трубы, энергия.
    expect(steps).toEqual(steps.map((_value, position) => position));
    const kinds = kindsOf(factory.machine);
    const blocks = structureOf(factory.machine).blocks;
    expect(blocks.length).toBeGreaterThan(10);
    expect([...new Set(blocks.map((block) => block.kind))].filter((kind) => !kinds[kind])).toEqual([]);
  });
});
