import { existsSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { beforeAll, describe, expect, test } from "vitest";
import { buildFactory } from "@/lib/calc/factory";
import { optimizeSurplus, surplusScore } from "@/lib/calc/optimize";
import { alternatives, buildIndex, plan, reach, type Index } from "@/lib/calc/planner";
import { Repository } from "@/lib/calc/repository";
import { CALC } from "@/lib/config";
import { kindsOf, structureOf } from "@/lib/machines";

const DATA = "public/calc/data.bin";

// Выгрузка не в git (npm run calc-data): без неё проверки пропускаются.
describe.skipIf(!existsSync(DATA))("калькулятор на выгрузке GTNH", () => {
  let index: Index;
  const find = (name: string) => [...index.repository.itemPtrs].find((ptr) => index.repository.goods(ptr).name === name)!;

  beforeAll(() => {
    const raw = gunzipSync(readFileSync(DATA));
    index = buildIndex(new Repository(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)));
  }, 60_000);

  test("сталь на LV — из доменной печи, сырьё — только руды из жил", () => {
    const steel = plan(index, reach(index, 0), find("Steel Ingot"), 1);
    expect(steel.missing).toEqual([]);
    expect(steel.steps.some((step) => step.crafter.kind === "multi" && step.crafter.label.includes("Blast Furnace"))).toBe(true);
    // «Roasted Iron Ore» — блок есть, но в жилах его нет: такое сырьё брать нельзя.
    expect(steel.raw.map((flow) => flow.goods.name)).not.toContain("Roasted Iron Ore");
    expect(steel.raw.length).toBeGreaterThan(0);
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

  test("постройки вне каталога сайта — только из правил машин и по ярусу рецепта", () => {
    const unlisted = (tier: number) => {
      const reached = reach(index, tier);
      return new Set(index.recipes.map((recipe) => reached.crafterOf(recipe)).filter((crafter) => crafter?.kind === "multi" && !crafter.machine).map((crafter) => crafter!.label));
    };
    expect([...unlisted(0)]).toEqual([]);
    const top = [...unlisted(CALC.ui.maxTier)];
    expect(top.some((label) => label.startsWith("Fusion Control Computer"))).toBe(true);
    expect(top.filter((label) => /cauldron|generator|reactor/i.test(label))).toEqual([]);
  });

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
    // Нарисованы все домны (их сотни — рядами по 16), а не первые 16.
    const furnaces = bbfPlan.steps.find((step) => step.crafter.label === "Bricked Blast Furnace")!.machines;
    expect(furnaces).toBeGreaterThan(CALC.factory.perBand);
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
  });

  test.each([
    ["Steel Ingot", 0],
    ["Aluminium Ingot", 1],
  ] as const)("фабрика для %s собирается из известных блоков, ход сборки идёт до конца", async (name, tier) => {
    const steps: number[] = [];
    const factory = await buildFactory(plan(index, reach(index, tier), find(name), 0.1), `calc-test-${name}`, (progress) => {
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
