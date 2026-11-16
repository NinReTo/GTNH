import { CHUNK, EBF } from "./config";

/**
 * Где проходят границы чанков вдоль одной оси, в метрах от центра постройки.
 * Постройка шириной side блоков стоит посередине стольких чанков, сколько ей нужно;
 * границы идут по граням блоков, поэтому при нечётном остатке лишний блок — с дальней стороны.
 * reach — как далеко от центра рисовать линии.
 */
export function chunkBorders(side: number, reach: number): readonly number[] {
  const span = Math.ceil(side / CHUNK.side) * CHUNK.side;
  const first = (-side / 2 - Math.floor((span - side) / 2)) * EBF.blockSize;
  const step = CHUNK.side * EBF.blockSize;
  const borders: number[] = [];
  for (let at = first - Math.floor((first + reach) / step) * step; at <= reach; at += step) borders.push(at);
  return borders;
}
