import { BOILERS } from "./boilers";
import { CALC, GAME } from "./config";
import { singleGuide, type Guide } from "./guides";
import { LV_SINGLES } from "./lv";
import { HIGH_SINGLES } from "./high";
import { HV_SINGLES } from "./hv";
import { MV_SINGLES } from "./mv";
import { SINGLE_BLOCKS, STEAM_TIERS, STEAM_TIER_TITLES, findMachine, type Fact, type SingleBlock, type SteamTier } from "./machines";
import type { TierId } from "./tiers";

/** Текстуры граней куба: имена файлов в public/textures/gregtech без расширения. */
export interface Faces {
  readonly front: string;
  readonly side: string;
  readonly top: string;
  readonly bottom: string;
}

/** К какой группе относится одноблочная машина: по группам они разложены на странице яруса. */
export type SingleGroup =
  | "steam"
  | "boiler"
  | "generator"
  | "lv-processing"
  | "lv-forging"
  | "lv-separating"
  | "lv-chemistry"
  | "lv-heating"
  | "lv-ore"
  | "lv-other";

/** Одноблочная машина со всем, что нужно её странице. */
export interface Single {
  /** Адресное имя: /singles/<slug>. */
  readonly slug: string;
  /** Название в игре. */
  readonly name: string;
  /** Короткое русское название. */
  readonly title: string;
  /** Подпись версии на карточке: «Бронзовая», «Уголь», «LV». */
  readonly label: string;
  readonly tier: TierId;
  readonly group: SingleGroup;
  /** Что делает — в двух-трёх словах. */
  readonly does: string;
  readonly faces: Faces;
  /** Абзацы для страницы, простым языком. */
  readonly story: readonly string[];
  readonly facts: readonly Fact[];
  readonly guide: Guide;
}

/* ------------------------------------------------------------------ */
/* Паровые машины: каждая — в бронзовой и стальной версии              */
/* ------------------------------------------------------------------ */

export function steamSlug(id: string, tier: SteamTier): string {
  return [id, tier].join("-");
}

function steamStory(single: SingleBlock, tier: SteamTier): readonly string[] {
  const version =
    tier === "bronze"
      ? `Бронзовая версия — первая: её собирают сразу после первого котла. Рецепт она ведёт в ${GAME.steam.bronzeDuration} раза дольше положенного, зато пара ест немного.`
      : `Стальная версия — «высокого давления». Рецепты идут с обычной скоростью, но пара уходит в ${GAME.steam.steelSteam} раза больше. Её собирают, когда из кирпичной домны пошла сталь.`;
  const multi = single.multiSlug ? findMachine(single.multiSlug) : undefined;
  const next = multi
    ? `Дальше — большая постройка «${multi.title}»: она ведёт сразу ${GAME.steam.multiParallel} рецептов.`
    : "Большой паровой постройки у этой машины нет: на смену ей приходит электрическая версия.";
  return [
    single.about,
    version,
    "Пар подают трубой из котла. Отработанный пар машина выпускает через отдельную грань — её нельзя закрывать блоком, иначе машина встанет.",
    next,
  ];
}

function steamFacts(tier: SteamTier): readonly Fact[] {
  const isBronze = tier === "bronze";
  return [
    { label: "Размер", value: "1 блок" },
    { label: "Работает на", value: "паре" },
    { label: "Скорость", value: isBronze ? `в ${GAME.steam.bronzeDuration} раза медленнее` : "обычная" },
    { label: "Расход пара", value: isBronze ? "обычный" : `в ${GAME.steam.steelSteam} раза больше` },
    { label: "За один раз", value: "1 рецепт" },
  ];
}

function steamSingle(single: SingleBlock, tier: SteamTier): Single {
  const hull = `hull-${tier}-${single.hull}`;
  const guide = singleGuide(single.id);
  if (!guide) throw new Error(`У паровой машины «${single.id}» нет гайда`);
  return {
    slug: steamSlug(single.id, tier),
    // Название в игре: бронзовая — «Steam …», стальная — «High Pressure Steam …».
    name: tier === "bronze" ? `Steam ${single.name}` : `High Pressure Steam ${single.name}`,
    title: single.title,
    label: STEAM_TIER_TITLES[tier],
    tier: "steam",
    group: "steam",
    does: single.does,
    faces: { front: `single-${tier}-${single.id}`, side: `${hull}-side`, top: `${hull}-top`, bottom: `${hull}-bottom` },
    story: steamStory(single, tier),
    facts: steamFacts(tier),
    guide,
  };
}

const STEAM_SINGLES: readonly Single[] = SINGLE_BLOCKS.flatMap((single) =>
  STEAM_TIERS.map((tier) => steamSingle(single, tier)),
);

const ELECTRIC_SINGLES = [...LV_SINGLES, ...MV_SINGLES, ...HV_SINGLES, ...HIGH_SINGLES];

const SEMIFLUID_MODELS = [
  ["lv", "Базовый полужидкостный генератор", "Basic Semifluid Generator"],
  ["mv", "Продвинутый полужидкостный генератор", "Advanced Semifluid Generator"],
  ["hv", "Турбо полужидкостный генератор", "Turbo Semifluid Generator"],
  ["ev", "Турбо полужидкостный генератор II", "Turbo Semifluid Generator II"],
  ["iv", "Турбо полужидкостный генератор III", "Turbo Semifluid Generator III"],
] as const;

const SEMIFLUID_GENERATORS: readonly Single[] = SEMIFLUID_MODELS.map(([tier, title, name], index) => {
  const diesel = ELECTRIC_SINGLES.find((each) => each.slug === `combustion-generator-${tier}`)!;
  const efficiency = CALC.ui.percent - (index + 1) * CALC.power.semifluidEfficiencyPenalty;
  return {
    slug: `semifluid-generator-${tier}`,
    name, title, tier,
    label: "Полужидкое топливо",
    group: "generator",
    does: "полужидкое топливо — в электричество",
    faces: diesel.faces, // В игре используются те же рисунки дизельного генератора.
    story: ["Генератор GT++ превращает полужидкое топливо в электричество."],
    facts: [diesel.facts.find(({ label }) => label === "Выдаёт")!, { label: "КПД", value: `${efficiency} %` }],
    guide: {
      wiki: "Singleblock Generators",
      tips: [
        { title: "Топливо", text: "Подавайте топливо трубой и проверяйте совместимость по списку топлива в калькуляторе." },
        { title: "Выход", text: "Кабель подключайте к грани с меткой выхода энергии." },
      ],
    },
  };
});

/** Все одноблочные машины сайта — по странице на каждую. */
export const SINGLES: readonly Single[] = [...BOILERS, ...STEAM_SINGLES, ...ELECTRIC_SINGLES, ...SEMIFLUID_GENERATORS];

export function findSingle(slug: string): Single | undefined {
  return SINGLES.find((single) => single.slug === slug);
}
