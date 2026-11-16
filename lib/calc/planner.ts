import { CALC } from "../config";
import { crafterFor, type Crafter } from "./crafters";
import { isRaw } from "./raw";
import type { Goods, Recipe, RecipeIo, Repository } from "./repository";
import { machineRun, type MachineRun } from "./vendor/model";
import { Recipe as VendorRecipe, Repository as VendorRepository } from "./vendor/repository";

/**
 * Планировщик фабрики: от выбранного предмета и выработки — к цепочке рецептов, машинам и сырью.
 * В калькуляторе ShadowTheAge рецепты выбирает игрок; здесь их выбирает сам расчёт. У каждого товара есть «цена» —
 * секунды работы машин на штуку по всей цепочке (с разгоном на выбранном ярусе) плюс сырьё. Цены «закрепляются» по
 * возрастанию, как в алгоритме Дейкстры: рецепт учитывается, когда закреплены все его входы, и предлагает цену своим
 * выходам. Так выбранные рецепты никогда не ходят по кругу, а для каждого товара берётся самый дешёвый путь — быстрее,
 * компактнее, меньше сырья. Утилизация машин в слитки проигрывает сама: её входы дороже выхода. Машины — только те,
 * что в эту эру есть (lib/calc/crafters.ts); скорость в итоговом расчёте — по правилам ShadowTheAge (lib/calc/vendor).
 */

const SKIPPED_TYPES = new Set<string>(CALC.skippedTypes);

export interface Index {
  readonly repository: Repository;
  readonly vendor: VendorRepository;
  readonly recipes: readonly Recipe[];
  /** Какие рецепты едят товар (номера в recipes). */
  readonly consumers: ReadonlyMap<number, readonly number[]>;
  /** Какие рецепты дают товар (номера в recipes) — для выбора рецепта вручную. */
  readonly producers: ReadonlyMap<number, readonly number[]>;
  readonly raw: ReadonlySet<number>;
}

function append(map: Map<number, number[]>, key: number, value: number): void {
  const list = map.get(key) ?? [];
  if (list[list.length - 1] !== value) list.push(value);
  map.set(key, list);
}

/** Разбор данных один раз: рецепты фабрики, кто что ест, сырьё. */
export function buildIndex(repository: Repository): Index {
  // Инструмент (стопка в 1 штуку) — не сырьё для фабрики: разбивать пилы и серпы в пыль — не производство.
  const isTool = (input: RecipeIo): boolean => input.kind === "item" && input.goods.every((goods) => repository.goods(goods).stackSize === 1);
  // Рецепт без расходуемых входов (только катализаторы) — «бесплатный» выход вроде Ока Гармонии; тоже не годится.
  const recipes = repository
    .recipes()
    .filter((recipe) => !SKIPPED_TYPES.has(recipe.type) && recipe.outputs.length > 0 && recipe.inputs.length > 0 && !recipe.inputs.some(isTool) && !isRecycling(recipe, repository));
  const consumers = new Map<number, number[]>();
  const producers = new Map<number, number[]>();
  recipes.forEach((recipe, position) => {
    for (const input of recipe.inputs) for (const goods of input.goods) append(consumers, goods, position);
    for (const output of recipe.outputs) append(producers, output.goods[0], position);
  });
  const raw = new Set([...repository.itemPtrs, ...repository.fluidPtrs].filter((ptr) => isRaw(repository.goods(ptr))));
  return { repository, vendor: VendorRepository.load(repository.buffer), recipes, consumers, producers, raw };
}

/** Время и энергия рецепта: у печи Minecraft их нет в выгрузке — берём электропечь GregTech. */
export function timing(recipe: Recipe): { readonly ticks: number; readonly eut: number } {
  if (recipe.isGt) return { ticks: recipe.ticks, eut: recipe.voltage * recipe.amperage };
  if (recipe.type === CALC.furnace.type) return { ticks: CALC.furnace.ticks, eut: CALC.furnace.eut };
  return { ticks: CALC.handTicks, eut: 0 };
}

/** Сколько раз рецепт разгоняется в машине яруса tier: пока вчетверо большая энергия влезает в 1 ампер яруса. */
function overclocks(eut: number, tier: number): number {
  let count = 0;
  for (let energy = eut * CALC.overclockPower; eut > 0 && energy <= CALC.voltages[tier]; energy *= CALC.overclockPower) count += 1;
  return count;
}

/**
 * Влезает ли рецепт в ярус. Одноблочная машина берёт рецепты своего яруса и ниже. Постройка питается от нескольких
 * ампер: в GTNH сталь (120 EU/t, рецепт MV) варят в доменной печи на двух люках LV — поэтому постройке хватает,
 * если энергия рецепта влезает в ток её люков на этом ярусе.
 */
function fitsTier(recipe: Recipe, crafter: Crafter, tier: number): boolean {
  if (!recipe.isGt || recipe.tier <= tier) return true;
  return crafter.kind === "multi" && recipe.voltage * recipe.amperage <= CALC.voltages[tier] * CALC.multiblockAmps;
}

/**
 * Утилизация: переплавка, дробление или расплав готовой вещи обратно в металл. В выгрузке такие рецепты посчитаны не из
 * того крафта, что виден рядом (двигатель «содержит» нержавейку, которой в его рецепте нет), — для фабрики они дают
 * металл из ничего. Признак: машина утилизации, а металл выхода не назван во входе.
 */
const RECYCLING_TYPES = new Set<string>(CALC.recyclingTypes);
const MATERIAL_FORM = /^(?:Molten (.+)|(?:Tiny Pile of |Small Pile of )?(.+?) (?:Dust|Ingot|Nugget))$/;
function isRecycling(recipe: Recipe, repository: Repository): boolean {
  const main = recipe.outputs[0];
  if (!RECYCLING_TYPES.has(recipe.type) || !main) return false;
  const form = MATERIAL_FORM.exec(repository.goods(main.goods[0]).name);
  // Сравниваем по последнему слову материала: «Annealed Copper» из «Copper Dust» — не утилизация.
  const word = (form?.[1] ?? form?.[2] ?? "").split(" ").pop() ?? "";
  if (!word) return false;
  return !recipe.inputs.some((input) => input.goods.some((goods) => repository.goods(goods).name.includes(word)));
}

export interface Choice {
  readonly recipe: Recipe;
  readonly crafter: Crafter;
  /** Какой товар взят на каждый вход рецепта (у словаря руд — один из вариантов). */
  readonly inputs: readonly number[];
}

export interface Reach {
  readonly tier: number;
  /** Цена товара: секунды машин на штуку (литр) по всей цепочке плюс сырьё. */
  readonly cost: ReadonlyMap<number, number>;
  /** Выбранный рецепт для каждого достижимого товара. */
  readonly chosen: ReadonlyMap<number, Choice>;
  /** Машина для рецепта на этом ярусе; нет — рецепт на ярусе не сделать. */
  readonly crafterOf: (recipe: Recipe) => Crafter | undefined;
}

/** Свой выбор игрока: что у него уже есть (не делаем, берём как сырьё) и каким рецептом делать товар. */
export interface Choices {
  readonly given: ReadonlySet<number>;
  readonly recipes: ReadonlyMap<number, Choice>;
}

const NO_CHOICES: Choices = { given: new Set(), recipes: new Map() };

/** Рецепт товара с учётом выбора игрока; undefined — сырьё, своё или не достать. */
export function choiceOf(index: Index, reached: Reach, choices: Choices, goods: number): Choice | undefined {
  if (index.raw.has(goods) || choices.given.has(goods)) return undefined;
  return choices.recipes.get(goods) ?? reached.chosen.get(goods);
}

// Секунды машины на один запуск рецепта на ярусе (оценка: разгон ×2 к скорости за ярус).
function runSeconds(recipe: Recipe, crafter: Crafter, tier: number): number {
  const { ticks, eut } = timing(recipe);
  const speed = crafter.kind === "hand" ? 1 : CALC.overclockSpeed ** overclocks(eut, tier);
  return ticks / CALC.ticksPerSecond / speed + (crafter.kind === "hand" ? CALC.cost.handPenalty : 0);
}

export interface Option {
  readonly choice: Choice;
  /** Цена штуки товара этим рецептом — для порядка в списке. */
  readonly cost: number;
}

/** Делается ли товар from (по выбранной цепочке) из товара goods: блок стали — из стали, переплавлять его в сталь — круг. */
function madeFrom(reached: Reach, from: number, goods: number): boolean {
  const seen = new Set<number>();
  const stack = [from];
  while (stack.length > 0) {
    const next = stack.pop() as number;
    if (next === goods) return true;
    if (seen.has(next)) continue;
    seen.add(next);
    stack.push(...(reached.chosen.get(next)?.inputs ?? []));
  }
  return false;
}

/** Все рецепты, которыми товар можно сделать на ярусе: входы достижимы и не делаются из него же, машина есть. Дешёвые — первыми. */
export function alternatives(index: Index, reached: Reach, goods: number): Option[] {
  const options: Option[] = [];
  for (const position of index.producers.get(goods) ?? []) {
    const recipe = index.recipes[position];
    const output = recipe.outputs.find((entry) => entry.goods[0] === goods);
    const made = (output?.amount ?? 0) * (output?.probability ?? 0);
    const crafter = reached.crafterOf(recipe);
    if (!crafter || made <= 0) continue;
    const inputs = recipe.inputs.map((input) => input.goods.filter((variant) => reached.cost.has(variant)).sort((a, b) => (reached.cost.get(a) ?? 0) - (reached.cost.get(b) ?? 0))[0]);
    // Вход недостижим или делается из самого товара (переплавка по кругу) — такой рецепт не предлагаем.
    if (inputs.some((input) => input === undefined || madeFrom(reached, input, goods))) continue;
    const total = recipe.inputs.reduce((sum, input, slot) => sum + input.amount * (reached.cost.get(inputs[slot]) ?? 0), runSeconds(recipe, crafter, reached.tier));
    options.push({ choice: { recipe, crafter, inputs }, cost: total / made });
  }
  return options.sort((a, b) => a.cost - b.cost);
}

function rawCost(goods: Goods): number {
  if (goods.kind === "item") return CALC.cost.rawItem;
  return goods.name === "Water" ? CALC.cost.water : CALC.cost.rawFluidPerLitre;
}

/** Минимальная куча пар [цена, товар]. */
class Heap {
  private readonly items: [number, number][] = [];
  get size(): number {
    return this.items.length;
  }
  push(cost: number, goods: number): void {
    const items = this.items;
    items.push([cost, goods]);
    for (let index = items.length - 1; index > 0; ) {
      const parent = (index - 1) >> 1;
      if (items[parent][0] <= items[index][0]) break;
      [items[parent], items[index]] = [items[index], items[parent]];
      index = parent;
    }
  }
  pop(): [number, number] {
    const items = this.items;
    const top = items[0];
    const last = items.pop() as [number, number];
    if (items.length > 0) {
      items[0] = last;
      for (let index = 0; ; ) {
        const left = index * 2 + 1;
        const right = left + 1;
        let smallest = index;
        if (left < items.length && items[left][0] < items[smallest][0]) smallest = left;
        if (right < items.length && items[right][0] < items[smallest][0]) smallest = right;
        if (smallest === index) break;
        [items[smallest], items[index]] = [items[index], items[smallest]];
        index = smallest;
      }
    }
    return top;
  }
}

/** Цены и выбранные рецепты на ярусе tier (0 — LV). */
export function reach(index: Index, tier: number): Reach {
  const { repository, recipes } = index;
  const settled = new Map<number, number>();
  const tentative = new Map<number, number>();
  const offers = new Map<number, Choice>();
  const heap = new Heap();
  for (const goods of index.raw) {
    const price = rawCost(repository.goods(goods));
    tentative.set(goods, price);
    heap.push(price, goods);
  }
  const crafters = new Map<number, Crafter | null>();
  const crafterOf = (recipe: Recipe): Crafter | undefined => {
    if (!crafters.has(recipe.ptr)) {
      const crafter = crafterFor(recipe, tier, () => index.vendor.GetObject(recipe.ptr, VendorRecipe));
      crafters.set(recipe.ptr, crafter && fitsTier(recipe, crafter, tier) ? crafter : null);
    }
    return crafters.get(recipe.ptr) ?? undefined;
  };
  // Сколько входов рецепта ещё ждут закрепления цены.
  const waiting = new Map<number, number>();
  while (heap.size > 0) {
    const [price, goods] = heap.pop();
    if (settled.has(goods) || price > (tentative.get(goods) ?? Infinity)) continue;
    settled.set(goods, price);
    for (const position of index.consumers.get(goods) ?? []) {
      const recipe = recipes[position];
      const crafter = crafterOf(recipe);
      if (!crafter) continue;
      // Вход закрыт, когда закреплён хотя бы один его вариант; считаем закрытые входы заново — их немного.
      const open = recipe.inputs.filter((input) => !input.goods.some((variant) => settled.has(variant))).length;
      const before = waiting.get(position) ?? recipe.inputs.length;
      if (open === before && waiting.has(position)) continue;
      waiting.set(position, open);
      if (open > 0) continue;
      const inputs = recipe.inputs.map((input) => input.goods.filter((variant) => settled.has(variant)).sort((a, b) => (settled.get(a) ?? 0) - (settled.get(b) ?? 0))[0]);
      const total = recipe.inputs.reduce((sum, input, slot) => sum + input.amount * (settled.get(inputs[slot]) ?? 0), runSeconds(recipe, crafter, tier));
      for (const output of recipe.outputs) {
        if (output.probability < 1 || output.amount <= 0) continue;
        const target = output.goods[0];
        if (settled.has(target) || index.raw.has(target)) continue;
        const offer = total / output.amount;
        if (offer >= (tentative.get(target) ?? Infinity)) continue;
        tentative.set(target, offer);
        offers.set(target, { recipe, crafter, inputs });
        heap.push(offer, target);
      }
    }
  }
  return { tier, cost: settled, chosen: offers, crafterOf };
}

export interface Flow {
  readonly goods: Goods;
  /** Штук или литров в секунду. */
  readonly perSecond: number;
}

export interface Step {
  /** Товар, ради которого шаг выбран (у рецепта может быть несколько выходов). */
  readonly goods: number;
  readonly recipe: Recipe;
  readonly crafter: Crafter;
  readonly run: MachineRun;
  /** Сколько раз в секунду идёт рецепт по всей фабрике. */
  readonly runsPerSecond: number;
  readonly machines: number;
  /** Доля времени, которую машины работают: 0,8 — каждая стоит пятую часть времени. */
  readonly busy: number;
  /** Средняя энергия шага, EU/t. */
  readonly eut: number;
  readonly inputs: readonly Flow[];
  readonly outputs: readonly Flow[];
  /** Уровень от сырья: 1 + наибольший уровень входов (для порядка рядов фабрики). */
  readonly level: number;
}

export interface Plan {
  readonly target: Goods;
  readonly perSecond: number;
  readonly tier: number;
  /** Шаги от сырья к цели. */
  readonly steps: readonly Step[];
  readonly raw: readonly Flow[];
  /** Что игрок даёт сам (отмечено «есть у меня») — не делается, приходит как сырьё. */
  readonly given: readonly Flow[];
  /** Побочные продукты, которые никуда не пошли. */
  readonly surplus: readonly Flow[];
  /** Товары, до которых на ярусе не дотянуться. */
  readonly missing: readonly Goods[];
  /** Средняя энергия всей фабрики, EU/t. */
  readonly averageEut: number;
}

/**
 * Порядок товаров от цели к сырью (каждый — после всех потребителей) и уровни от сырья. У выбора Дейкстры круга нет;
 * круг может дать только рецепт, выбранный вручную, — его обратное ребро здесь пропускается.
 */
function order(pick: (goods: number) => Choice | undefined, target: number): { readonly sequence: readonly number[]; readonly level: ReadonlyMap<number, number> } {
  const post: number[] = [];
  const level = new Map<number, number>();
  const visiting = new Set<number>();
  const visit = (goods: number): number => {
    const known = level.get(goods);
    if (known !== undefined) return known;
    if (visiting.has(goods)) return 0;
    visiting.add(goods);
    const depth = (pick(goods)?.inputs ?? []).reduce((deepest, input) => Math.max(deepest, visit(input) + 1), 0);
    level.set(goods, depth);
    post.push(goods);
    return depth;
  };
  visit(target);
  return { sequence: post.reverse(), level };
}

/** Цепочка для выработки perSecond штук (литров) товара target в секунду; choices — что у игрока есть и какие рецепты он выбрал. */
export function plan(index: Index, reached: Reach, target: number, perSecond: number, choices: Choices = NO_CHOICES): Plan {
  const { repository } = index;
  const pick = (goods: number) => choiceOf(index, reached, choices, goods);
  const { sequence, level } = order(pick, target);
  const demand = new Map<number, number>([[target, perSecond]]);
  const pool = new Map<number, number>();
  const raw = new Map<number, number>();
  const given = new Map<number, number>();
  const missing = new Set<number>();
  const runs = new Map<number, { choice: Choice; runs: number; goods: number }>();
  const done = new Set<number>();
  const addDemand = (goods: number, amount: number) => {
    // shortcut: спрос по кругу (рецепт выбран вручную) на уже посчитанный товар берём как сырьё, без петли в цепочке.
    if (done.has(goods)) raw.set(goods, (raw.get(goods) ?? 0) + amount);
    else demand.set(goods, (demand.get(goods) ?? 0) + amount);
  };
  for (const goods of sequence) {
    done.add(goods);
    let need = demand.get(goods) ?? 0;
    // Сначала — побочные продукты тех шагов, что уже посчитаны.
    const spare = pool.get(goods) ?? 0;
    const used = Math.min(spare, need);
    pool.set(goods, spare - used);
    need -= used;
    if (need <= CALC.epsilon) continue;
    if (choices.given.has(goods)) {
      given.set(goods, (given.get(goods) ?? 0) + need);
      continue;
    }
    if (index.raw.has(goods)) {
      raw.set(goods, (raw.get(goods) ?? 0) + need);
      continue;
    }
    const choice = pick(goods);
    if (!choice) {
      missing.add(goods);
      continue;
    }
    const output = choice.recipe.outputs.find((entry) => entry.goods[0] === goods);
    const count = need / ((output?.amount ?? 1) * (output?.probability ?? 1));
    const entry = runs.get(choice.recipe.ptr) ?? { choice, runs: 0, goods };
    entry.runs += count;
    runs.set(choice.recipe.ptr, entry);
    choice.recipe.inputs.forEach((input, slot) => addDemand(choice.inputs[slot], count * input.amount));
    for (const out of choice.recipe.outputs) {
      if (out.goods[0] !== goods) pool.set(out.goods[0], (pool.get(out.goods[0]) ?? 0) + count * out.amount * out.probability);
    }
  }
  const flows = (entries: readonly RecipeIo[], count: number, picked?: readonly number[]): Flow[] =>
    entries.map((io, slot) => ({
      goods: repository.goods(picked?.[slot] ?? io.goods[0]),
      perSecond: count * io.amount * (picked ? 1 : io.probability),
    }));
  const steps: Step[] = [...runs.values()].map(({ choice, runs: count, goods }) => {
    const { recipe, crafter } = choice;
    const { ticks, eut } = timing(recipe);
    // Рецепт выше яруса (постройка на нескольких амперах) идёт без разгона — как на ярусе самого рецепта.
    const runTier = recipe.isGt ? Math.max(reached.tier, recipe.tier) : reached.tier;
    const vendorRun = machineRun(index.vendor.GetObject(recipe.ptr, VendorRecipe), crafter.kind === "multi" ? crafter.label : null, runTier);
    // Рецепты печи без времени в выгрузке разгоняем сами, как одноблочную машину; остальное — по правилам ShadowTheAge.
    const extra = recipe.isGt || crafter.kind === "hand" ? 0 : overclocks(eut, reached.tier);
    const run: MachineRun = recipe.isGt
      ? vendorRun
      : { ...vendorRun, speedFactor: CALC.overclockSpeed ** extra, powerFactor: CALC.overclockSpeed ** extra, overclockTiers: extra, overclockName: extra > 0 ? `OC x${extra}` : "" };
    const seconds = ticks / CALC.ticksPerSecond;
    const load = (count * seconds) / run.speedFactor;
    const machines = Math.max(1, Math.ceil(load - CALC.epsilon));
    return {
      goods,
      recipe,
      crafter,
      run,
      runsPerSecond: count,
      machines,
      busy: load / machines,
      eut: count * seconds * eut * run.powerFactor,
      inputs: flows(recipe.inputs, count, choice.inputs),
      outputs: flows(recipe.outputs, count),
      level: level.get(goods) ?? 0,
    };
  });
  steps.sort((a, b) => a.level - b.level);
  return {
    target: repository.goods(target),
    perSecond,
    tier: reached.tier,
    steps,
    raw: [...raw.entries()].map(([goods, amount]) => ({ goods: repository.goods(goods), perSecond: amount })),
    given: [...given.entries()].map(([goods, amount]) => ({ goods: repository.goods(goods), perSecond: amount })),
    surplus: [...pool.entries()].filter(([, amount]) => amount > CALC.epsilon).map(([goods, amount]) => ({ goods: repository.goods(goods), perSecond: amount })),
    missing: [...missing].map((goods) => repository.goods(goods)),
    averageEut: steps.reduce((sum, step) => sum + step.eut, 0),
  };
}
