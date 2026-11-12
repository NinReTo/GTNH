import { GAME } from "./config";

/** Ярус напряжения на сайте. Пар — до электричества; дальше — ярусы самого мода. */
export type TierId = "steam" | "lv";

/** Что показывает мини-шапка яруса: весь паровой цех или одну постройку. */
export type TierScene = { readonly kind: "workshop" } | { readonly kind: "machine"; readonly slug: string };

export interface Tier {
  readonly id: TierId;
  /** Короткое имя — как в игре. */
  readonly title: string;
  /** Подпись под именем. */
  readonly subtitle: string;
  readonly color: string;
  /** Пара фраз для мини-шапки. */
  readonly summary: string;
  readonly scene: TierScene;
}

export const TIERS: readonly Tier[] = [
  {
    id: "steam",
    title: "Пар",
    subtitle: "до электричества",
    color: GAME.tierColors.steam,
    summary:
      "Первые машины мода. Коксовые печи и кирпичная домна работают на одном угле, остальное — на паре из котлов: бронзовые машины, стальные и большие постройки.",
    scene: { kind: "workshop" },
  },
  {
    id: "lv",
    title: "LV",
    subtitle: `${GAME.voltageTiers[1].voltage} EU/t`,
    color: GAME.tierColors.lv,
    summary:
      "Первый ярус электричества. Его главная постройка — электрическая доменная печь: она плавит то, что кирпичной домне не по силам.",
    scene: { kind: "machine", slug: "electric-blast-furnace" },
  },
];

export function findTier(id: string): Tier | undefined {
  return TIERS.find((tier) => tier.id === id);
}
