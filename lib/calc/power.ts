import { BOILERS } from "../boilers";
import { CALC, PRODUCTION } from "../config";
import { findMachine, type Machine } from "../machines";
import { generatorsOf } from "../setups";
import type { Single } from "../singles";
import { TIERS, type TierId } from "../tiers";
import type { Goods, Repository } from "./repository";
import { Recipe as VendorRecipe, type Repository as VendorRepository } from "./vendor/repository";

/**
 * Генераторы фабрики и их топливо. Генераторы — одноблочные генераторы яруса с сайта (их КПД — в карточке), топливо —
 * рецепты топлива из выгрузки: у GregTech энергия литра лежит в specialValue рецепта (бензин 576 EU/л, бензол 360,
 * водород 20). Паровой турбине топливо — пар из котлов сайта: турбина берёт (6 + ярус) литров пара на 3 EU.
 */

/** Откуда пар: котёл и сколько пара он даёт в секунду. */
export interface SteamSource {
  readonly boiler: Single | Machine;
  readonly steamPerSecond: number;
}

/** Топливо: товар выгрузки, сколько EU даёт литр и какая доля доходит до кабеля (КПД генератора). */
export interface Fuel {
  readonly goods: Goods;
  readonly euPerLitre: number;
  readonly efficiency: number;
  /** У пара — котлы, которые его делают. */
  readonly steam?: SteamSource;
  /** Топливо — предметы (стержни и болты наквадовых реакторов): euPerLitre тогда — EU за штуку. */
  readonly isItem?: boolean;
}

/** Тип рецептов топлива в выгрузке по виду генератора (по началу его адресного имени на сайте). */
const FUEL_TYPES: readonly (readonly [string, string])[] = [
  ["combustion-generator", "Combustion Generator Fuels"],
  ["gas-turbine", "Gas Turbine Fuel"],
  ["plasma-generator", "Plasma Generator Fuels"],
  ["semifluid-generator", "Semifluid Generator Fuels"],
];

const isSteam = (generator: Single) => generator.slug.startsWith("steam-turbine");

/** КПД генератора из его карточки («85 %» → 0,85); без карточки — 1. */
export function efficiencyOf(generator: Single): number {
  const value = generator.facts.find((fact) => fact.label === "КПД")?.value ?? "";
  const percent = Number(value.replace(/[^\d,.]/g, "").replace(",", "."));
  return percent > 0 ? percent / CALC.ui.percent : 1;
}

/** Ярус постройки фабрики по ярусу плана калькулятора (0 — LV): тот же, что берёт factory.ts. */
export const tierIdOf = (planTier: number): TierId => TIERS[Math.min(planTier + 1, TIERS.length - 1)].id;

/** Генераторы, которые можно поставить на ярусе (первый — тот, что сайт ставит по умолчанию); выше IV на сайте их нет. */
export const generatorChoices = (tier: TierId): readonly Single[] =>
  (CALC.factory.generatorTiers as readonly string[]).includes(tier) ? generatorsOf(tier) : [];

/** Выбор игрока: какой генератор и на каком топливе. */
export interface PowerChoice {
  readonly generatorSlug: string;
  readonly fuel?: Fuel;
}

/** Пар котла в секунду из его карточки («300 л/с», у солнечных — «до 360 л/с»: днём и без накипи). */
const steamOf = (boiler: Single): number => Number((boiler.facts.find((fact) => fact.label === "Пар")?.value ?? "").replace(/\D/g, ""));

/**
 * Пар для паровой турбины — по котлу на каждый способ: турбина яруса берёт (6 + ярус) литров пара на 3 EU
 * (PRODUCTION.steamTurbine — то же, что у линий сайта), это уже с её КПД.
 */
function steamFuels(generator: Single, repository: Repository, tier: TierId): readonly Fuel[] {
  const ptr = [...repository.fluidPtrs].find((each) => repository.goods(each).name === CALC.power.steam);
  if (ptr === undefined) return [];
  const { litresBase, euPerOperation } = PRODUCTION.steamTurbine;
  const rank = TIERS.findIndex((tier) => tier.id === generator.tier);
  const euPerLitre = euPerOperation / (litresBase + rank);
  // Первым — угольный котёл высокого давления: его ставят линии сайта, он самый ходовой.
  const boilers = BOILERS.filter((boiler) => steamOf(boiler) > 0).toSorted((a, b) => Number(b.slug === "hp-coal-boiler") - Number(a.slug === "hp-coal-boiler"));
  const sources: SteamSource[] = boilers.map((boiler) => ({ boiler, steamPerSecond: steamOf(boiler) }));
  const railcraft = findMachine("railcraft-boiler");
  const maxRank = TIERS.findIndex((each) => each.id === tier);
  if (railcraft && TIERS.findIndex((each) => each.id === railcraft.tier) <= maxRank) {
    sources.push({ boiler: railcraft, steamPerSecond: CALC.power.railcraft.tanks * PRODUCTION.steamPerWater * CALC.ticksPerSecond });
  }
  const bronze = findMachine("large-bronze-boiler");
  if (bronze && TIERS.findIndex((each) => each.id === bronze.tier) <= maxRank) {
    sources.push({ boiler: bronze, steamPerSecond: CALC.power.bronzeBoiler.steamPerTick * CALC.ticksPerSecond });
  }
  return sources.map((steam) => ({
    goods: repository.goods(ptr),
    euPerLitre,
    efficiency: 1,
    steam,
  }));
}

/** Все топлива генератора из выгрузки (у паровой турбины — пар из каждого котла), без повторов. */
export function fuelsOf(generator: Single, repository: Repository, vendor: VendorRepository, tier = generator.tier): readonly Fuel[] {
  if (isSteam(generator)) return steamFuels(generator, repository, tier);
  // Наквадовые реакторы GT++: рецепты топлива — по марке реактора («Naquadah Reactor Mk-I» → «Naquadah Reactor MkI»).
  const type = FUEL_TYPES.find(([prefix]) => generator.slug.startsWith(prefix))?.[1] ?? (generator.slug.startsWith("naquadah-reactor") ? generator.name.replace("Mk-", "Mk") : undefined);
  if (!type) return [];
  const efficiency = efficiencyOf(generator);
  const fuels = new Map<number, Fuel>();
  for (const recipe of repository.recipes()) {
    if (recipe.type !== type) continue;
    const input = [...recipe.inputs, ...recipe.catalysts].find((io) => io.kind === "fluid") ?? recipe.inputs[0];
    const value = vendor.GetObject(recipe.ptr, VendorRecipe).gtRecipe?.specialValue ?? 0;
    const ptr = input?.goods[0];
    if (ptr === undefined || value <= 0 || fuels.has(ptr)) continue;
    fuels.set(ptr, { goods: repository.goods(ptr), euPerLitre: value, efficiency, isItem: input.kind === "item" });
  }
  return [...fuels.values()];
}

/** Литров топлива в секунду на среднюю энергию average (EU/t). */
export const fuelPerSecond = (average: number, fuel: Fuel): number => (average * CALC.ticksPerSecond) / fuel.efficiency / fuel.euPerLitre;

/** Котельная под пар: сколько котлов, воды и топлива котлов (уголь — штук в минуту, лава — литров в секунду). */
export function boilerPlant(steamPerSecond: number, source: SteamSource): { readonly boilers: number; readonly water: number; readonly coalPerMinute?: number; readonly lavaPerSecond?: number } {
  const boilers = Math.ceil(steamPerSecond / source.steamPerSecond);
  const water = steamPerSecond / PRODUCTION.steamPerWater;
  const { slug } = source.boiler;
  if (slug === "railcraft-boiler") {
    const { burnPerCycle, ticksPerCycle, coalBurnTime } = CALC.power.railcraft;
    return { boilers, water: boilers * source.steamPerSecond / PRODUCTION.steamPerWater, coalPerMinute: boilers * burnPerCycle / coalBurnTime / ticksPerCycle * CALC.ticksPerSecond * CALC.ui.secondsPerMinute };
  }
  if (slug === "large-bronze-boiler") {
    return {
      boilers,
      water: boilers * source.steamPerSecond / PRODUCTION.steamPerWater,
      coalPerMinute: boilers * CALC.ticksPerSecond * CALC.ui.secondsPerMinute / CALC.power.bronzeBoiler.coalTicks,
    };
  }
  if (slug === "coal-boiler") return { boilers, water, coalPerMinute: (boilers * CALC.ui.secondsPerMinute) / CALC.power.coalBoilerSecondsPerCoal };
  if (slug === "hp-coal-boiler") return { boilers, water, coalPerMinute: (boilers * CALC.ui.secondsPerMinute) / PRODUCTION.hpCoalBoilerSecondsPerCoal };
  if (slug === "hp-lava-boiler") return { boilers, water, lavaPerSecond: boilers * PRODUCTION.lavaPerBoiler };
  return { boilers, water };
}

/** Потребность в топливе и воде; каждая позиция ведёт к своей цепочке рецептов. */
export function steamPlantFor(turbineSteam: number, source: SteamSource, processWater = 0) {
  const pump = PRODUCTION.waterPump;
  const waterPerPump = Math.max(pump.minWater, pump.waterPerSecond * pump.humidity);
  let pumps = 0;
  for (;;) {
    const steam = turbineSteam + pumps * pump.steamPerSecond;
    const plant = boilerPlant(steam, source);
    const required = Math.ceil((plant.water + processWater) / waterPerPump);
    if (required <= pumps) return { ...plant, pumps, steam, waterPerPump };
    pumps = required;
  }
}

export function fuelInputs(average: number, fuel: Fuel, repository: Repository): readonly { readonly goods: Goods; readonly perSecond: number }[] {
  const perSecond = fuelPerSecond(average, fuel);
  if (perSecond <= 0) return [];
  if (!fuel.steam) return [{ goods: fuel.goods, perSecond }];
  const plant = steamPlantFor(perSecond, fuel.steam);
  const flow = (pointers: Iterable<number>, name: string, rate: number) => {
    const ptr = [...pointers].find((each) => repository.goods(each).name === name);
    return ptr === undefined || rate <= 0 ? [] : [{ goods: repository.goods(ptr), perSecond: rate }];
  };
  return [
    ...flow(repository.fluidPtrs, CALC.power.water, plant.water),
    ...flow(repository.itemPtrs, CALC.power.coal, (plant.coalPerMinute ?? 0) / CALC.ui.secondsPerMinute),
    ...flow(repository.fluidPtrs, CALC.power.lava, plant.lavaPerSecond ?? 0),
  ];
}
