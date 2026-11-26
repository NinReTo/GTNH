import { CALC } from "../config";
import { FLUID_TEMPS } from "./fluid-temps";
import type { Goods, Repository } from "./repository";

/**
 * Трубы фабрики: какую трубу класть, чтобы она тянула поток. Ёмкости — из кода мода (gregtech 5.09.54,
 * gregtech/loaders/preload/LoaderMetaPipeEntities, MTEFluidPipe, MTEItemPipe), какие трубы можно сделать на ярусе и
 * почём — из калькулятора (reach по той же выгрузке рецептов).
 */

/** Предложение трубы: товар-труба из выгрузки, сколько она тянет в секунду и почём блок. */
export interface PipeOffer {
  readonly goods: Goods;
  readonly kind: "fluid" | "item";
  /** Литров в секунду (жидкостная) или предметов в секунду (предметная). */
  readonly perSecond: number;
  /** Цена блока по калькулятору (секунды машин и сырьё). */
  readonly cost: number;
  /** Жаростойкость жидкостной трубы, K (у предметной — без предела). */
  readonly heat: number;
  /** Некоторые трубы пропускают газ наружу. */
  readonly gasProof?: boolean;
}

/** Температура жидкости, K: плазма — 10 000, остальное — из кода мода (fluid-temps.ts), не найдена — комнатная. */
export const fluidTemperature = (name: string): number =>
  / Plasma$/.test(name) ? CALC.pipes.plasmaKelvin : (FLUID_TEMPS[name] ?? CALC.pipes.roomKelvin);

/** Размер трубы по первому слову имени: «Large Steel Fluid Pipe» — большая. У обычной слова нет. */
const SIZE = /^(Tiny|Small|Large|Huge) /;
const FLUID = / Fluid Pipe$/;
const ITEM = / Item Pipe$/;

/**
 * Пропускная способность трубы по её имени в выгрузке. Многоканальная труба требует отдельного учёта каналов.
 */
export function pipeCapacity(name: string): { readonly kind: "fluid" | "item"; readonly perSecond: number; readonly heat: number } | undefined {
  const size = SIZE.exec(name)?.[1] ?? "Normal";
  const material = name.replace(SIZE, "").replace(FLUID, "").replace(ITEM, "");
  const { fluidBase, fluidSize, itemHuge, itemSize, ticksPerSecond, stack, addonFluid, addonBaseMultiplier } = CALC.pipes;
  if (FLUID.test(name)) {
    if (material === "High Pressure") {
      const { sizes, heat } = CALC.pipes.highPressure;
      return sizes[size] === undefined ? undefined : { kind: "fluid", perSecond: sizes[size] * ticksPerSecond, heat };
    }
    if (material === "Wooden" && (size === "Tiny" || size === "Huge")) return undefined;
    const addon = addonFluid[material];
    const base = addon ? Math.floor(addon[0] / ticksPerSecond) * addonBaseMultiplier : fluidBase[material];
    const factor = fluidSize[size];
    if (base === undefined || factor === undefined) return undefined;
    // MTEFluidPipe: ёмкость — литров за тик (целочисленно, как в Java), в подсказке игры ×20 — литров в секунду.
    const [multiply, divide] = factor;
    return { kind: "fluid", perSecond: Math.floor((base * multiply) / divide) * ticksPerSecond, heat: addon?.[1] ?? CALC.pipes.fluidHeat[material] ?? 0 };
  }
  if (ITEM.test(name)) {
    const huge = itemHuge[material];
    const divider = itemSize[size];
    if (huge === undefined || divider === undefined) return undefined;
    // MTEItemPipe: ячеек max(1, огромная / делитель), раз в max(1, делитель / огромная) × 20 тиков; огромная — раз в 20 тиков.
    const slots = Math.max(1, Math.floor(huge / divider));
    const ticks = Math.max(1, Math.floor(divider / huge)) * ticksPerSecond;
    return { kind: "item", perSecond: (slots * stack * ticksPerSecond) / ticks, heat: Infinity };
  }
  return undefined;
}

/**
 * Все трубы из таблицы мода, которые можно сделать на ярусе. Цена берётся из той же цепочки, что видит игрок.
 */
export function pipeOffers(repository: Repository, cost: ReadonlyMap<number, number>): readonly PipeOffer[] {
  return [...repository.itemPtrs].flatMap((ptr) => {
    const price = cost.get(ptr);
    if (price === undefined) return [];
    const goods = repository.goods(ptr);
    if (goods.name.startsWith("Tiny ")) return [];
    const capacity = pipeCapacity(goods.name);
    return capacity ? [{ goods, ...capacity, cost: price, gasProof: !/\b(Wooden|Clay) Fluid Pipe$/.test(goods.name) }] : [];
  });
}

/**
 * Текстура трубы на сцене по материалу. shortcut: у сайта есть рисунки не всех материалов — остальные трубы
 * рисуются стальной (жидкостные) или латунной (предметные); имя и ёмкость у них свои. Когда понадобится —
 * взять рисунки из мода (pipe_side, окрашенный цветом материала).
 */
const PIPE_TEXTURES: Readonly<Record<string, string>> = {
  "Copper Fluid": "pipe-copper",
  "Bronze Fluid": "pipe-bronze",
  "Steel Fluid": "pipe-steel",
  "Titanium Fluid": "g-pipe-titanium",
  "Tungstensteel Fluid": "g-pipe-tungstensteel",
  "PBI Fluid": "g-pipe-polybenzimidazole",
  "PTFE Fluid": "ptfe-pipe",
  "Tin Item": "tin-pipe",
  "Brass Item": "pipe-brass",
  "Electrum Item": "g-item-pipe-electrum",
  "Black Plutonium Item": "g-item-pipe-black-pluton",
  "Quantium Item": "g-item-pipe-quantium",
};

export function pipeTexture(name: string): string {
  const key = name.replace(SIZE, "").replace(/ Pipe$/, "");
  return PIPE_TEXTURES[key] ?? (FLUID.test(name) ? "pipe-steel" : "pipe-brass");
}

/** Поиск предмета выгрузки по английскому имени (первый с таким именем) — для названий кабелей. */
export function goodsByName(repository: Repository): (name: string) => Goods | undefined {
  const byName = new Map<string, number>();
  for (const ptr of repository.itemPtrs) {
    const { name } = repository.goods(ptr);
    if (!byName.has(name)) byName.set(name, ptr);
  }
  return (name) => {
    const ptr = byName.get(name);
    return ptr === undefined ? undefined : repository.goods(ptr);
  };
}

/**
 * Выбор трубы: самая маленькая из тех, что тянут поток (при равной ёмкости — дешевле); не тянет ни одна — самая
 * ёмкая, и тогда их нужно несколько рядом. «Самая дешёвая» не годится: в цене калькулятора жидкости из нефти почти
 * бесплатны, и на LV выигрывали пластиковые трубы.
 */
export interface PipeChoice {
  readonly offer: PipeOffer;
  /** Сколько таких труб нужно параллельно (1 — одной хватает). */
  readonly parallel: number;
}

export function choosePipe(offers: readonly PipeOffer[], kind: "fluid" | "item", perSecond: number, kelvin = 0, mayBeGas = true): PipeChoice | undefined {
  // Труба горячее своей жаростойкости горит (MTEFluidPipe) — такие не берём.
  const own = offers.filter((offer) => offer.kind === kind && offer.heat >= kelvin && (!mayBeGas || offer.gasProof !== false));
  const enough = own.filter((offer) => offer.perSecond >= perSecond).sort((a, b) => a.perSecond - b.perSecond || a.cost - b.cost);
  if (enough.length > 0) return { offer: enough[0], parallel: 1 };
  const widest = [...own].sort((a, b) => b.perSecond - a.perSecond || a.cost - b.cost)[0];
  return widest ? { offer: widest, parallel: Math.ceil(perSecond / widest.perSecond) } : undefined;
}

/** Потоки одного ресурса делят канал, пока суммарный расход помещается в трубу. */
export function pipeChannels(rates: readonly number[], capacity: number): readonly { readonly indices: readonly number[]; readonly rate: number }[] {
  const channels: { indices: number[]; rate: number }[] = [];
  for (const { rate, index } of rates.map((rate, index) => ({ rate, index })).sort((a, b) => b.rate - a.rate)) {
    const channel = channels.find((one) => one.rate + rate <= capacity);
    if (channel) {
      channel.indices.push(index);
      channel.rate += rate;
    } else channels.push({ indices: [index], rate });
  }
  return channels;
}

/** Кабель, который можно сделать на ярусе: материал, его числа из таблицы вики и цена 1x. */
export interface CableOffer {
  readonly material: string;
  /** Наибольший ярус напряжения (id яруса). */
  readonly tier: string;
  readonly amps: number;
  /** Потеря EU на блок на ампер. */
  readonly loss: number;
  /** «Cable» или «Wire» — как предмет называется в выгрузке. */
  readonly form: "Cable" | "Wire";
  readonly cost: number;
}

/** Все кабели из таблицы CALC.cables, которые калькулятор умеет сделать на ярусе (1x — по цене калькулятора). */
export function cableOffers(repository: Repository, cost: ReadonlyMap<number, number>): readonly CableOffer[] {
  const named = goodsByName(repository);
  return Object.entries(CALC.cables).flatMap(([material, [tier, amps, loss]]) =>
    (["Cable", "Wire"] as const).flatMap((form) => {
      const goods = named(`1x ${material} ${form}`);
      const price = goods ? cost.get(goods.ptr) : undefined;
      return price === undefined ? [] : [{ material, tier, amps, loss, form, cost: price }];
    }).slice(0, 1),
  );
}

/** Выбранный кабель: материал, толщина и сколько таких нужно рядом. */
export interface CableChoice {
  readonly offer: CableOffer;
  readonly size: number;
  readonly parallel: number;
}

/**
 * Кабель на ток amps при напряжении яруса rank (номер в списке ярусов): из тех, что держат напряжение, — с наименьшей
 * потерей (потери съедают энергию дальних машин), при равной — дешевле; толщина — самая тонкая, что несёт ток.
 */
export function chooseCable(offers: readonly CableOffer[], rankOf: (tier: string) => number, rank: number, amps: number): CableChoice | undefined {
  const offer = offers.filter((one) => rankOf(one.tier) >= rank).sort((a, b) => a.loss - b.loss || a.cost - b.cost)[0];
  if (!offer) return undefined;
  const size = CALC.cableSizes.find((one) => one * offer.amps >= amps);
  const widest = CALC.cableSizes[CALC.cableSizes.length - 1];
  return size ? { offer, size, parallel: 1 } : { offer, size: widest, parallel: Math.ceil(amps / (widest * offer.amps)) };
}

/**
 * Потери в кабеле: amps ампер по length блоков теряют amps × length × loss EU/t (вики GTNH). Ампер напряжения voltage
 * доходит только на voltage / loss блоков — дальше машина энергии не получает.
 */
export const cableLoss = (amps: number, length: number, loss: number): number => amps * length * loss;
export const cableReach = (voltage: number, loss: number): number => (loss > 0 ? voltage / loss : Infinity);
