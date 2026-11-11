import { CatmullRomCurve3, Vector3 } from "three";
import { CAMERA } from "./config";
import { clamp, clamp01 } from "./math";
import type { Vec3 } from "./ebf";

function curveThrough(points: readonly (readonly number[])[]): CatmullRomCurve3 {
  return new CatmullRomCurve3(points.map(([x, y, z]) => new Vector3(x, y, z)));
}

/** Кривая Катмулла–Рома пути камеры и отдельная такая же — цели взгляда. */
const positionCurve = curveThrough(CAMERA.positionPoints);
const targetCurve = curveThrough(CAMERA.targetPoints);

export interface CameraPose {
  readonly position: Vec3;
  readonly target: Vec3;
}

/** На сколько отодвинуть камеру от цели на экране уже расчётного (телефон в портрете). */
export function pullback(aspect: number): number {
  if (!(aspect > 0)) return 1;
  return clamp(CAMERA.referenceAspect / aspect, 1, CAMERA.maxPortraitPullback);
}

/**
 * ЕДИНСТВЕННАЯ функция камеры: где она и куда смотрит при прокрутке progress.
 * Её вызывают и сцена, и схема пути на лендинге.
 */
export function cameraPose(progress: number, aspect: number = CAMERA.referenceAspect): CameraPose {
  const t = clamp01(progress);
  const target = targetCurve.getPoint(t);
  const position = positionCurve.getPoint(t);
  const scaled = position.sub(target).multiplyScalar(pullback(aspect)).add(target);
  return {
    position: [scaled.x, scaled.y, scaled.z],
    target: [target.x, target.y, target.z],
  };
}
