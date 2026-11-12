import { SNOW } from "./config";

/**
 * «Случайное» число от 0 до 1 по номеру снежинки. Снег одинаковый при каждой
 * загрузке: классическое перемешивание через синус, без Math.random.
 */
export function hash01(index: number, salt: number): number {
  const value = Math.sin((index + salt * SNOW.count) * SNOW.hashA) * SNOW.hashB;
  return value - Math.floor(value);
}

export interface Flake {
  /** Где снежинка была в момент 0 (метры): x, высота, z. */
  readonly x: number;
  readonly y: number;
  readonly z: number;
  /** Скорость падения, м/с. */
  readonly speed: number;
  /** Сдвиг фазы покачивания, радианы. */
  readonly phase: number;
}

/** Снежинки, равномерно рассыпанные по объёму SNOW.area над полом (пол — высота 0). */
export function makeFlakes(count: number = SNOW.count): Flake[] {
  const [width, height, depth] = SNOW.area;
  return Array.from({ length: count }, (_, index): Flake => {
    const spread = (hash01(index, SNOW.hashSalts.speed) * 2 - 1) * SNOW.speedSpread;
    return {
      x: (hash01(index, SNOW.hashSalts.x) - 1 / 2) * width,
      y: hash01(index, SNOW.hashSalts.y) * height,
      z: (hash01(index, SNOW.hashSalts.z) - 1 / 2) * depth,
      speed: SNOW.fallSpeed * (1 + spread),
      phase: hash01(index, SNOW.hashSalts.phase) * Math.PI * 2,
    };
  });
}

/**
 * Где снежинка в момент time (секунды). Чистая функция времени: снежинка
 * падает, покачиваясь, а долетев до пола, появляется снова наверху.
 */
export function flakePosition(flake: Flake, time: number): [number, number, number] {
  const height = SNOW.area[1];
  const fallen = flake.y - flake.speed * time;
  const y = ((fallen % height) + height) % height;
  const x = flake.x + Math.sin(time * SNOW.swayFrequency + flake.phase) * SNOW.swayAmplitude;
  return [x, y, flake.z];
}
