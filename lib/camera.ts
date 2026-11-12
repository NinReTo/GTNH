import { CAMERA } from "./config";
import { clamp } from "./math";
import type { Vec3 } from "./structure";

/** На сколько отодвинуть камеру от цели на экране уже расчётного (телефон в портрете). */
export function pullback(aspect: number): number {
  if (!(aspect > 0)) return 1;
  return clamp(CAMERA.referenceAspect / aspect, 1, CAMERA.maxPortraitPullback);
}

/** Во сколько раз постройка крупнее расчётной (по наибольшей стороне). Мельче расчётной не считаем — камера не подъезжает. */
export function sizeScale(size: Vec3): number {
  return Math.max(1, Math.max(...size) / CAMERA.referenceSize);
}

export interface CameraSetup {
  readonly position: Vec3;
  readonly target: Vec3;
}

/**
 * Где камера стоит в начале и вокруг какой точки вращается. Заданные точки
 * подобраны под печь 3×4×3; для постройки крупнее всё пропорционально
 * отодвигается, на узком экране камера отъезжает ещё. Дальше камеру вращает
 * пользователь — мышкой вокруг той же цели.
 */
export function cameraSetup(size: Vec3, aspect: number = CAMERA.referenceAspect): CameraSetup {
  const scale = sizeScale(size);
  const reach = scale * pullback(aspect);
  const target = CAMERA.target.map((value) => value * scale);
  const position = CAMERA.position.map((value, axis) => target[axis] + (value - CAMERA.target[axis]) * reach);
  return {
    position: [position[0], position[1], position[2]],
    target: [target[0], target[1], target[2]],
  };
}
