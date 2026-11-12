import { GAME } from "./config";

/** Ярус напряжения на сайте. Пар — до электричества; дальше — ярусы самого мода. */
export type TierId = "steam" | "lv";

/** Что показывает шапка страницы яруса: весь паровой цех или одну постройку. */
export type TierScene = { readonly kind: "workshop" } | { readonly kind: "machine"; readonly slug: string };

export interface Tier {
  readonly id: TierId;
  /** Короткое имя — как в игре. */
  readonly title: string;
  /** Подпись под именем. */
  readonly subtitle: string;
  readonly color: string;
  /** Значок вкладки: текстура из public/textures/gregtech без расширения. */
  readonly icon: string;
  /** Пара фраз о ярусе. */
  readonly summary: string;
  readonly scene: TierScene;
}

export const TIERS: readonly Tier[] = [
  {
    id: "steam",
    title: "Пар",
    subtitle: "до электричества",
    color: GAME.tierColors.steam,
    // Фасад бронзовой паровой печи — самая узнаваемая машина пара.
    icon: "single-bronze-furnace",
    summary:
      "Первые машины мода. Коксовые печи и кирпичная домна работают на одном угле, остальное — на паре из котлов: бронзовые машины, стальные и большие постройки.",
    scene: { kind: "workshop" },
  },
  {
    id: "lv",
    title: "LV",
    subtitle: `${GAME.voltageTiers[1].voltage} EU/t`,
    color: GAME.tierColors.lv,
    // Энергетический люк LV — то, чем электричество входит в машину.
    icon: "energy",
    summary:
      "Первый ярус электричества. Его главная постройка — электрическая доменная печь: она плавит то, что кирпичной домне не по силам.",
    scene: { kind: "machine", slug: "electric-blast-furnace" },
  },
];

export function findTier(id: string): Tier | undefined {
  return TIERS.find((tier) => tier.id === id);
}
