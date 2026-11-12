import { CAMERA } from "./config";
import { clamp } from "./math";
import type { Vec3 } from "./ebf";

/** На сколько отодвинуть камеру от цели на экране уже расчётного (телефон в портрете). */
export function pullback(aspect: number): number {
  if (!(aspect > 0)) return 1;
  return clamp(CAMERA.referenceAspect / aspect, 1, CAMERA.maxPortraitPullback);
}

/**
 * Где камера стоит в начале: заданная точка, отодвинутая от цели на узком
 * экране. Дальше камеру вращает пользователь — мышкой вокруг той же цели.
 */
export function initialCameraPosition(aspect: number = CAMERA.referenceAspect): Vec3 {
  const scale = pullback(aspect);
  const [x, y, z] = CAMERA.position.map((value, axis) => CAMERA.target[axis] + (value - CAMERA.target[axis]) * scale);
  return [x, y, z];
}
