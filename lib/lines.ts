import { tr, type Lang } from "./i18n";
import { MACHINES, SINGLE_BLOCKS, STEAM_TIERS, findMachine, type SingleBlock } from "./machines";
import { SINGLES, findSingle, steamSlug, type SingleGroup } from "./singles";
import type { TierId } from "./tiers";

/** Ступень прогрессии: одноблочная машина или постройка. */
export type LineStep =
  | { readonly kind: "single"; readonly slug: string }
  | { readonly kind: "machine"; readonly slug: string };

/**
 * Прогрессия — одна и та же работа на всё более сильных машинах: например,
 * бронзовый компрессор → стальной → большая постройка.
 */
export interface Line {
  readonly id: string;
  readonly tier: TierId;
  readonly title: string;
  readonly does: string;
  readonly steps: readonly LineStep[];
}

const single = (slug: string): LineStep => ({ kind: "single", slug });
const machine = (slug: string): LineStep => ({ kind: "machine", slug });

/** Прогрессии до паровых машин: пар, вода и сталь. */
const OPENING_LINES: readonly Line[] = [
  {
    id: "steam",
    tier: "steam",
    title: "Пар",
    does: "топливо и вода — в пар для всех машин",
    steps: [single("coal-boiler"), single("hp-coal-boiler"), single("hp-lava-boiler"), machine("railcraft-boiler")],
  },
  {
    id: "solar",
    tier: "steam",
    title: "Пар от солнца",
    does: "пар без топлива и без дыма",
    steps: [single("solar-boiler"), single("hp-solar-boiler")],
  },
  {
    id: "water",
    tier: "steam",
    title: "Вода",
    does: "вода для паровых котлов",
    steps: [machine("water-tank"), machine("steam-water-pump")],
  },
  {
    id: "steel",
    tier: "steam",
    title: "Сталь",
    does: "кокс из угля, из кокса и железа — сталь",
    steps: [machine("coke-oven"), machine("bricked-blast-furnace")],
  },
];

/** Паровые постройки, у которых нет одноблочной версии. */
const CLOSING_LINES: readonly Line[] = [
  { id: "mixer", tier: "steam", title: "Смеситель", does: "пыли в сплавы", steps: [machine("steam-blender")] },
  { id: "separator", tier: "steam", title: "Сепаратор", does: "делит пыли и смолу на части", steps: [machine("steam-separator")] },
  { id: "purifier", tier: "steam", title: "Очиститель", does: "моет дроблёную руду", steps: [machine("steam-purifier")] },
];

function singleLine(block: SingleBlock): Line {
  const versions = STEAM_TIERS.map((tier) => single(steamSlug(block.id, tier)));
  const multi = block.multiSlug ? [machine(block.multiSlug)] : [];
  return { id: block.id, tier: "steam", title: block.title, does: block.does, steps: [...versions, ...multi] };
}

/** Все прогрессии по порядку: пар, вода и сталь, потом паровые машины. */
export const LINES: readonly Line[] = [...OPENING_LINES, ...SINGLE_BLOCKS.map(singleLine), ...CLOSING_LINES];

export function linesOf(tier: TierId): readonly Line[] {
  return LINES.filter((line) => line.tier === tier);
}

export function isSameStep(a: LineStep, b: LineStep): boolean {
  return a.kind === b.kind && a.slug === b.slug;
}

/** Прогрессия, в которой стоит эта ступень. */
export function lineOf(step: LineStep): Line | undefined {
  return LINES.find((line) => line.steps.some((candidate) => isSameStep(candidate, step)));
}

/** Подпись ступени над карточкой: версия одноблочной машины или «Постройка». */
export function stepLabel(step: LineStep): string {
  return step.kind === "single" ? (findSingle(step.slug)?.label ?? "") : "Постройка";
}

/** Название ступени для ссылок «Дальше»: на русской версии — русское название из игры, на английской — английское. */
export function stepTitle(step: LineStep, lang: Lang = "ru"): string {
  if (step.kind === "machine") {
    const found = findMachine(step.slug);
    return found ? (lang === "ru" ? found.title : found.name) : step.slug;
  }
  const found = findSingle(step.slug);
  return found ? `${lang === "ru" ? found.title : found.name}, ${tr(lang, found.label).toLowerCase()}` : step.slug;
}

/** Адрес страницы ступени. */
export function stepHref(step: LineStep): string {
  return step.kind === "single" ? `/singles/${step.slug}` : `/machines/${step.slug}`;
}

/** На каком ярусе стоит ступень. */
export function stepTier(step: LineStep): TierId | undefined {
  return step.kind === "single" ? findSingle(step.slug)?.tier : findMachine(step.slug)?.tier;
}

/* ------------------------------------------------------------------ */
/* Каталог: всё, что не выстроено в прогрессии, по группам             */
/* ------------------------------------------------------------------ */

export interface CatalogGroup {
  readonly id: string;
  readonly title: string;
  readonly note: string;
  readonly steps: readonly LineStep[];
}

const GROUP_TITLES: readonly { readonly id: SingleGroup; readonly title: string; readonly note: string }[] = [
  { id: "generator", title: "Генераторы", note: "откуда берётся электричество" },
  { id: "lv-forging", title: "Ковка", note: "пластины, провода, стержни, детали по форме" },
  { id: "lv-processing", title: "Обработка", note: "сборка, смешивание, резка" },
  { id: "lv-separating", title: "Разделение", note: "разобрать вещество на части" },
  { id: "lv-chemistry", title: "Химия", note: "реакции и перегонка" },
  { id: "lv-heating", title: "Нагрев", note: "плавка и сплавы" },
  { id: "lv-ore", title: "Руда", note: "дробление, мойка и побочные продукты" },
  { id: "lv-other", title: "Упаковка и прочее", note: "розлив, утиль, насос и шахтёр" },
];

function isInLine(step: LineStep): boolean {
  return lineOf(step) !== undefined;
}

/** Группы яруса: сначала постройки, потом одноблочные машины по назначению. Без того, что уже стоит в прогрессиях. */
export function catalogOf(tier: TierId): readonly CatalogGroup[] {
  const buildings = MACHINES.filter((candidate) => candidate.tier === tier)
    .map((candidate) => machine(candidate.slug))
    .filter((step) => !isInLine(step));
  const groups = GROUP_TITLES.map((group) => ({
    ...group,
    steps: SINGLES.filter((candidate) => candidate.tier === tier && candidate.group === group.id)
      .map((candidate) => single(candidate.slug))
      .filter((step) => !isInLine(step)),
  }));
  const all: readonly CatalogGroup[] = [
    { id: "buildings", title: "Постройки", note: "многоблочные машины яруса", steps: buildings },
    ...groups,
  ];
  return all.filter((group) => group.steps.length > 0);
}

/** Все машины яруса в том порядке, в каком они идут на его странице. */
function tierOrder(tier: TierId): readonly LineStep[] {
  return [...linesOf(tier).flatMap((line) => line.steps), ...catalogOf(tier).flatMap((group) => group.steps)];
}

/** Следующая машина на странице яруса; после последней — ничего. */
export function nextStep(current: LineStep): LineStep | undefined {
  const tier = stepTier(current);
  if (!tier) return undefined;
  const order = tierOrder(tier);
  const position = order.findIndex((step) => isSameStep(step, current));
  return position < 0 ? undefined : order[position + 1];
}
