import { PERF } from "./config";
import { clamp } from "./math";

/**
 * Плотность пикселей холста. Не даёт холсту вырасти больше PERF.maxPixels:
 * стоимость постобработки пропорциональна числу пикселей, а не полигонов.
 */
export function pickDpr(width: number, height: number, deviceDpr: number): number {
  if (!(width > 0) || !(height > 0) || !(deviceDpr > 0)) return 1;
  const budgetDpr = Math.sqrt(PERF.maxPixels / (width * height));
  const floor = Math.min(PERF.minDpr, deviceDpr);
  return clamp(Math.min(deviceDpr, budgetDpr), floor, deviceDpr);
}

export interface PerfRow {
  readonly label: string;
  readonly ms: number;
  /** Крайние строки (всё включено / всё выключено) — рисуются другим цветом. */
  readonly isTotal: boolean;
}

type MeasuredKey = Exclude<keyof typeof PERF.measured, "conditions">;
type Measured = { readonly [Key in MeasuredKey]: number | null };

/**
 * Строки для графика замеров: время кадра в каждой конфигурации, как измерено.
 * Разницы намеренно не считаются: на шумном замере они врут сильнее самих чисел.
 * Если хоть один замер не внесён — null: рисовать выдуманные столбики нельзя.
 */
export function perfRows(measured: Measured = PERF.measured): PerfRow[] | null {
  const { all, withoutBloom, withoutChromaticNoise, withoutTransition, withoutShadows, bare } = measured;
  if (
    all === null ||
    withoutBloom === null ||
    withoutChromaticNoise === null ||
    withoutTransition === null ||
    withoutShadows === null ||
    bare === null
  ) {
    return null;
  }
  return [
    { label: "Всё включено", ms: all, isTotal: true },
    { label: "Без свечения", ms: withoutBloom, isTotal: false },
    { label: "Без разъезда каналов и зерна", ms: withoutChromaticNoise, isTotal: false },
    { label: "Без шейдера перехода", ms: withoutTransition, isTotal: false },
    { label: "Без теней", ms: withoutShadows, isTotal: false },
    { label: "Без эффектов и теней", ms: bare, isTotal: true },
  ];
}
