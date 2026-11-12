import { CAMERA, EBF, WORKSHOP } from "./config";
import { pullback, type CameraSetup } from "./camera";
import { findMachine, structureOf, type Machine } from "./machines";
import type { Vec3 } from "./structure";

/** Полный оборот в радианах: повороты в настройках заданы долями оборота. */
const TURN = Math.PI * 2;

export interface Placement {
  readonly key: string;
  readonly machine: Machine;
  readonly position: Vec3;
  readonly rotationY: number;
  /** Нужен ли постройке свой свет: только если внутри огонь. */
  readonly hasLight: boolean;
}

/** Постройки цеха с местами и поворотами — из настроек WORKSHOP.layout. */
export function workshopPlacements(): Placement[] {
  return WORKSHOP.layout.map((entry, index) => {
    const machine = findMachine(entry.slug);
    if (!machine) throw new Error(`В цехе указана неизвестная постройка «${entry.slug}»`);
    const structure = structureOf(machine);
    return {
      key: [entry.slug, index].join(":"),
      machine,
      position: [entry.x, 0, entry.z],
      rotationY: entry.turn * TURN,
      hasLight: structure.interior === "fire" && structure.hollow.length > 0,
    };
  });
}

export interface Footprint {
  readonly minX: number;
  readonly maxX: number;
  readonly minZ: number;
  readonly maxZ: number;
}

/**
 * Прямоугольник, который постройка занимает на полу, с учётом поворота.
 * Нужен тесту: между постройками должен оставаться запас на раздвижение блоков.
 */
export function footprint(placement: Placement): Footprint {
  const [width, , depth] = structureOf(placement.machine).size;
  const halfWidth = (width * EBF.blockSize) / 2;
  const halfDepth = (depth * EBF.blockSize) / 2;
  const cos = Math.abs(Math.cos(placement.rotationY));
  const sin = Math.abs(Math.sin(placement.rotationY));
  const extentX = halfWidth * cos + halfDepth * sin;
  const extentZ = halfWidth * sin + halfDepth * cos;
  const [x, , z] = placement.position;
  return { minX: x - extentX, maxX: x + extentX, minZ: z - extentZ, maxZ: z + extentZ };
}

/**
 * Камера цеха: общий план из настроек; на узком экране отъезжает, как и в
 * сцене машины. from — откуда смотреть: из большой шапки или из мини-шапки.
 */
export function workshopCamera(
  aspect: number = CAMERA.referenceAspect,
  from: readonly number[] = WORKSHOP.cameraPosition,
): CameraSetup {
  const reach = pullback(aspect);
  const target = WORKSHOP.cameraTarget;
  const position = from.map((value, axis) => target[axis] + (value - target[axis]) * reach);
  return {
    position: [position[0], position[1], position[2]],
    target: [target[0], target[1], target[2]],
  };
}
