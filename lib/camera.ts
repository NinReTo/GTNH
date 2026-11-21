import { CAMERA, CHUNK, EBF, ICON } from "./config";
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

/**
 * Новое расстояние камеры до цели после прокрутки колёсиком: вниз — дальше,
 * вверх — ближе. Не ближе zoomMin и не дальше zoomMax от начального расстояния.
 */
export function zoomDistance(current: number, initial: number, deltaY: number, farthest: number = initial): number {
  const next = current * Math.exp(deltaY * CAMERA.zoomPerPixel);
  return clamp(next, Math.min(initial * CAMERA.zoomMin, CAMERA.zoomNearest), Math.max(initial, farthest) * CAMERA.zoomMax);
}

/** Расстояние от камеры до точки, вокруг которой она вращается. */
function reachOf(setup: CameraSetup): number {
  return Math.hypot(...setup.position.map((value, axis) => value - setup.target[axis]));
}

/**
 * Во сколько раз камера дальше расчётной (печь 3×4×3 на широком экране).
 * Туман, пол и дальняя плоскость растягиваются во столько же раз — иначе
 * крупная постройка (реактор синтеза, 15 блоков в ширину) целиком тонет в тумане.
 */
export function sceneScale(setup: CameraSetup): number {
  return Math.max(1, reachOf(setup) / reachOf({ position: CAMERA.position, target: CAMERA.target }));
}

export interface CameraSetup {
  readonly position: Vec3;
  readonly target: Vec3;
}

/** Границы постройки и допустимый отступ камеры, в координатах сцены. */
export function structureView(size: Vec3): { readonly min: Vec3; readonly max: Vec3; readonly margin: number } {
  const [width, height, depth] = size.map((side) => side * EBF.blockSize);
  return {
    min: [-width / 2, 0, -depth / 2],
    max: [width / 2, height, depth / 2],
    margin: CAMERA.structureViewChunks * CHUNK.side * EBF.blockSize,
  };
}

/**
 * Камера трёхмерного значка: смотрит в середину постройки по высоте (над
 * значком нет текста, который надо обходить) с того же угла, что и большая
 * сцена, и чуть ближе — значок квадратный и маленький.
 */
export function iconCameraSetup(size: Vec3): CameraSetup {
  // Без нижнего предела, как у большой сцены: одиночный куб в значке должен быть крупным.
  const scale = Math.max(ICON.minScale, Math.max(...size) / CAMERA.referenceSize);
  const reach = scale * pullback(ICON.aspect) * ICON.distance;
  const target: Vec3 = [0, (size[1] * EBF.blockSize) / 2, 0];
  const position = CAMERA.position.map((value, axis) => target[axis] + (value - CAMERA.target[axis]) * reach);
  return { position: [position[0], position[1], position[2]], target };
}

/**
 * Где камера стоит в начале и вокруг какой точки вращается. Заданные точки
 * подобраны под печь 3×4×3; для постройки крупнее всё пропорционально
 * отодвигается, на узком экране камера отъезжает ещё. Дальше камеру вращает
 * пользователь — мышкой вокруг той же цели.
 */
export function cameraSetup(size: Vec3, aspect: number = CAMERA.referenceAspect): CameraSetup {
  return scaledSetup(sizeScale(size), aspect);
}

/**
 * Радиус обзора: вся сфера, охватывающая фабрику, помещается даже вдоль короткой стороны кадра.
 */
export function factoryOrbitRadius(size: Vec3, aspect: number): number {
  const halfFov = CAMERA.fov * Math.PI / CAMERA.degreesPerTurn;
  const viewportAspect = aspect > 0 ? aspect : CAMERA.referenceAspect;
  const halfFrame = Math.min(halfFov, Math.atan(Math.tan(halfFov) * viewportAspect));
  const sphereRadius = Math.hypot(...size) * EBF.blockSize / 2;
  return CAMERA.near + sphereRadius / Math.sin(halfFrame) * CAMERA.overviewPadding;
}

export function startSetup(size: Vec3, aspect: number = CAMERA.referenceAspect): CameraSetup {
  const reference = reachOf({ position: CAMERA.position, target: CAMERA.target });
  const reach = factoryOrbitRadius(size, aspect) / reference;
  const target: Vec3 = [0, size[1] * EBF.blockSize / 2, 0];
  const position = CAMERA.position.map((value, axis) => target[axis] + (value - CAMERA.target[axis]) * reach);
  return { position: [position[0], position[1], position[2]], target };
}

/** Камера шапки одноблочной машины: тот же угол, что у построек, но ближе — иначе один блок теряется. */
export function singleCameraSetup(aspect: number = CAMERA.referenceAspect): CameraSetup {
  return scaledSetup(CAMERA.singleScale, aspect);
}

function scaledSetup(scale: number, aspect: number): CameraSetup {
  const reach = scale * pullback(aspect);
  const target = CAMERA.target.map((value) => value * scale);
  const position = CAMERA.position.map((value, axis) => target[axis] + (value - CAMERA.target[axis]) * reach);
  return {
    position: [position[0], position[1], position[2]],
    target: [target[0], target[1], target[2]],
  };
}
