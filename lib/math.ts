/** Зажимает число в отрезок [0, 1]. */
export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Зажимает число в отрезок [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Плавный старт и остановка на отрезке [0, 1] (классический smoothstep: t²·(3 − 2t)). */
export function smooth01(value: number): number {
  const t = clamp01(value);
  return t * t * (1 + 1 + 1 - (t + t));
}

/** Доля пути value между from и to, зажатая в [0, 1]. */
export function inverseLerp(from: number, to: number, value: number): number {
  if (to === from) return value >= to ? 1 : 0;
  return clamp01((value - from) / (to - from));
}
