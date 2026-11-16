import { GEN_CRAFTS } from "./gen-crafts";
import type { TierId } from "./tiers";

/** Предмет в ячейке: значок — имя файла в public/textures/gregtech без расширения. */
export interface CraftItem {
  readonly icon: string;
  readonly label: string;
  /** Сколько штук, если больше одной (число в углу ячейки, как в игре). */
  readonly count?: number;
}

/** Один шаг цепочки: что кладут в машину (ряды сверху вниз, null — пустая ячейка) и что получают. */
export interface CraftStep {
  readonly title: string;
  /** В какой машине: «Химический реактор», «Электрическая доменная печь, 2140 K». */
  readonly station: string;
  readonly grid: readonly (readonly (CraftItem | null)[])[];
  readonly output: CraftItem;
  /** Время, ярус и откуда рецепт — одной-двумя фразами. */
  readonly note?: string;
}

/** Цепочка главного металла яруса: от сырья до слитка. */
export interface CraftLine {
  readonly tier: TierId;
  /** Главный металл яруса, по-русски. */
  readonly metal: string;
  /** Адресное имя страницы материала (/materials/<slug>), если у него есть линия производства. */
  readonly material?: string;
  readonly steps: readonly CraftStep[];
}

/** Линии яруса: у пара их две — бронза и сталь. */
export function craftLinesOf(tier: TierId): readonly CraftLine[] {
  return GEN_CRAFTS.filter((line) => line.tier === tier);
}
