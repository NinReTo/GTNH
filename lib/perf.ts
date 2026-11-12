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
