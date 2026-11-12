import { createContext } from "react";

/** Какие части картинки можно выключить для замеров: ?off=bloom,chromatic,shadows */
export type EffectName = "bloom" | "chromatic" | "shadows";
export const EFFECT_NAMES: readonly EffectName[] = ["bloom", "chromatic", "shadows"];

/** Курсор в координатах холста: x и y от −1 до 1, начало в центре, y вверх. */
export type Pointer = readonly [number, number];

/**
 * Откуда сцена узнаёт, где курсор. У каждой сцены на странице свой источник:
 * наведение на одну сцену не должно раздвигать блоки в другой. По умолчанию
 * курсора нет — так рисуются снимки карточек.
 */
export const PointerContext = createContext<() => Pointer | null>(() => null);

/** Положение курсора внутри прямоугольника холста → координаты от −1 до 1. */
export function toPointer(clientX: number, clientY: number, rect: Pick<DOMRect, "left" | "top" | "width" | "height">): Pointer | null {
  if (!(rect.width > 0) || !(rect.height > 0)) return null;
  const x = ((clientX - rect.left) / rect.width) * 2 - 1;
  const y = 1 - ((clientY - rect.top) / rect.height) * 2;
  return [x, y];
}

/** Разбирает ?off=… из адреса в набор выключенных эффектов. Незнакомые слова игнорирует. */
export function parseDisabledEffects(search: string): ReadonlySet<EffectName> {
  const raw = new URLSearchParams(search).get("off") ?? "";
  const requested = raw.split(",").map((part) => part.trim());
  return new Set(EFFECT_NAMES.filter((name) => requested.includes(name) || requested.includes("all")));
}
