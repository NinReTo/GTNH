import { CHUNK, EBF } from "./config";

/** Линии границ через каждый чанк от первой, first, до reach метров от центра. */
function bordersFrom(first: number, reach: number): readonly number[] {
  const step = CHUNK.side * EBF.blockSize;
  const borders: number[] = [];
  for (let at = first - Math.floor((first + reach) / step) * step; at <= reach; at += step) borders.push(at);
  return borders;
}

/**
 * Где проходят границы чанков вдоль одной оси, в метрах от центра постройки.
 * Постройка шириной side блоков стоит посередине стольких чанков, сколько ей нужно;
 * границы идут по граням блоков, поэтому при нечётном остатке лишний блок — с дальней стороны.
 * reach — как далеко от центра рисовать линии.
 */
export function chunkBorders(side: number, reach: number): readonly number[] {
  const span = Math.ceil(side / CHUNK.side) * CHUNK.side;
  return bordersFrom((-side / 2 - Math.floor((span - side) / 2)) * EBF.blockSize, reach);
}

/** Границы чанков, когда одна из них известна (origin, метры от центра): у фабрики калькулятора чанки от её начала. */
export function alignedBorders(origin: number, reach: number): readonly number[] {
  return bordersFrom(origin, reach);
}

/*
 * Дальше origin — клетка, с которой начинается чанк (по умолчанию 0): клетки origin…origin + 15 — чанк 0,
 * origin − 16…origin − 1 — чанк −1.
 */

/** Номер чанка клетки. */
export const chunkOf = (cell: number, origin = 0): number => Math.floor((cell - origin) / CHUNK.side);

/** Сколько чанков по одной оси занимают клетки от low до high. */
export const chunksBetween = (low: number, high: number, origin = 0): number => chunkOf(high, origin) - chunkOf(low, origin) + 1;

/**
 * x копий шириной width в ряд, начиная с 0: через gap блоков (1 — через блок, −1 — соседи делят общую стену).
 * Копия, которая легла бы на границу чанка, уходит в следующий чанк — постройка не делится между чанками.
 * Постройка шире чанка в него не влезет никак — её не двигаем.
 */
export function copiesAcross(width: number, copies: number, origin = 0, gap = 1): readonly number[] {
  const xs: number[] = [];
  let x = 0;
  for (let copy = 0; copy < copies; copy += 1) {
    if (width <= CHUNK.side && chunksBetween(x, x + width - 1, origin) > 1) x = (chunkOf(x, origin) + 1) * CHUNK.side + origin;
    xs.push(x);
    x += width + gap;
  }
  return xs;
}

/** Сколько копий шириной width влезает в ряд от 0 до конца его первого чанка. Шире чанка — одна. */
export function copiesPerChunk(width: number, origin = 0, gap = 1): number {
  if (width > CHUNK.side) return 1;
  return copiesAcross(width, CHUNK.side, origin, gap).filter((x) => chunkOf(x + width - 1, origin) === chunkOf(0, origin)).length;
}

/**
 * На сколько опустить (к −z) отрезок клеток от low до high, чтобы он лёг в один чанк: 0 — уже лежит или длиннее чанка.
 * Ряды фабрики идут к −z, поэтому сдвиг — вниз, к началу следующего чанка.
 */
export function shiftIntoChunk(low: number, high: number, origin = 0): number {
  if (high - low + 1 > CHUNK.side || chunksBetween(low, high, origin) === 1) return 0;
  return high - (chunkOf(high, origin) * CHUNK.side + origin - 1);
}
