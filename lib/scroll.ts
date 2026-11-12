import { SCROLL } from "./config";
import { clamp01, inverseLerp } from "./math";

/**
 * Положение прокрутки внутри блока сцены → число от 0 до 1.
 * top — верх блока относительно окна, height — его высота, viewport — высота окна.
 */
export function sectionProgress(top: number, height: number, viewport: number): number {
  const scrollable = height - viewport;
  if (scrollable <= 0) return 0;
  return clamp01(-top / scrollable);
}

/**
 * Отметка, на которой лендинг начинает закрывать кадр:
 * 1 − нахлёст / (высота секции в экранах − 1).
 */
export function coverStart(
  overlapScreens: number = SCROLL.overlapScreens,
  sceneScreens: number = SCROLL.sceneScreens,
): number {
  const scrollableScreens = sceneScreens - 1;
  if (scrollableScreens <= 0) return 0;
  return clamp01(1 - overlapScreens / scrollableScreens);
}

export interface PhaseThresholds {
  readonly coverStart: number;
  readonly transitionStart: number;
  readonly transitionEnd: number;
}

/** Пороги фаз в долях всей прокрутки. Сдвигаются вместе с нахлёстом. */
export function phaseThresholds(overlapScreens: number = SCROLL.overlapScreens): PhaseThresholds {
  const usable = coverStart(overlapScreens);
  return {
    coverStart: usable,
    transitionStart: SCROLL.phases.transitionStart * usable,
    transitionEnd: SCROLL.phases.transitionEnd * usable,
  };
}

/** Продвижение заливки перехода (0…1) при положении прокрутки progress. */
export function transitionProgress(progress: number, overlapScreens?: number): number {
  const phases = phaseThresholds(overlapScreens);
  return inverseLerp(phases.transitionStart, phases.transitionEnd, progress);
}
