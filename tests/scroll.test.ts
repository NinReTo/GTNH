import { describe, expect, test } from "vitest";
import { SCROLL } from "@/lib/config";
import { coverStart, phaseThresholds, sectionProgress, transitionProgress } from "@/lib/scroll";

describe("положение прокрутки", () => {
  test("равно нулю, пока блок сцены не начал уходить вверх", () => {
    expect(sectionProgress(0, 4000, 1000)).toBe(0);
    expect(sectionProgress(200, 4000, 1000)).toBe(0);
  });

  test("равно единице, когда прокручены все экраны кроме одного", () => {
    expect(sectionProgress(-3000, 4000, 1000)).toBe(1);
    expect(sectionProgress(-5000, 4000, 1000)).toBe(1);
  });

  test("растёт линейно между началом и концом", () => {
    expect(sectionProgress(-1500, 4000, 1000)).toBeCloseTo(0.5);
  });

  test("не делит на ноль, если блок не выше окна", () => {
    expect(sectionProgress(-100, 1000, 1000)).toBe(0);
  });
});

describe("нахлёст лендинга", () => {
  test("страница начинает закрывать кадр на отметке 1 − нахлёст / (экраны − 1)", () => {
    expect(coverStart(0.5, 4)).toBeCloseTo(1 - 0.5 / 3);
    expect(coverStart(1, 4)).toBeCloseTo(2 / 3);
  });

  test("без нахлёста доступна вся прокрутка", () => {
    expect(coverStart(0, 4)).toBe(1);
  });

  test("не уходит ниже нуля при слишком большом нахлёсте", () => {
    expect(coverStart(10, 4)).toBe(0);
  });

  test("не ломается, если блок сцены высотой в один экран", () => {
    expect(coverStart(0.5, 1)).toBe(0);
  });
});

describe("пороги фаз", () => {
  test("заливка начинается раньше, чем заканчивается", () => {
    const phases = phaseThresholds();
    expect(phases.transitionStart).toBeGreaterThan(0);
    expect(phases.transitionStart).toBeLessThan(phases.transitionEnd);
  });

  test("заливка заканчивается не позже, чем страница начинает закрывать кадр", () => {
    for (const overlap of [0, 0.25, 0.5, 1, 1.5]) {
      const phases = phaseThresholds(overlap);
      expect(phases.transitionEnd).toBeLessThanOrEqual(phases.coverStart);
    }
  });

  test("сдвигаются вместе с нахлёстом в одной пропорции", () => {
    const base = phaseThresholds(0);
    const shifted = phaseThresholds(1);
    const ratio = shifted.coverStart / base.coverStart;
    expect(shifted.transitionStart).toBeCloseTo(base.transitionStart * ratio);
    expect(shifted.transitionEnd).toBeCloseTo(base.transitionEnd * ratio);
  });

  test("по умолчанию берут нахлёст из настроек", () => {
    expect(phaseThresholds()).toEqual(phaseThresholds(SCROLL.overlapScreens));
  });
});

describe("продвижение заливки", () => {
  test("в начале прокрутки заливки нет", () => {
    expect(transitionProgress(0)).toBe(0);
    expect(transitionProgress(phaseThresholds().transitionStart)).toBe(0);
  });

  test("кадр залит целиком к моменту, когда приходит страница", () => {
    const phases = phaseThresholds();
    expect(transitionProgress(phases.coverStart)).toBe(1);
    expect(transitionProgress(1)).toBe(1);
  });

  test("на середине фазы продвижение равно половине", () => {
    const phases = phaseThresholds();
    expect(transitionProgress((phases.transitionStart + phases.transitionEnd) / 2)).toBeCloseTo(0.5);
  });
});
