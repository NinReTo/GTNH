import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { CAMERA, FLOOR, FOG, GAME, HOVER, LIGHT, PERF, SCROLL, THEME } from "@/lib/config";
import { cameraSetup, iconCameraSetup, pullback, sizeScale } from "@/lib/camera";
import { coilHeat, heatBonuses, heatCapacity, voltageHeatBonus } from "@/lib/heat";
import { clamp, clamp01, inverseLerp, smooth01 } from "@/lib/math";
import { perfRows, pickDpr } from "@/lib/perf";
import { parseDisabledEffects, toPointer } from "@/lib/store";

describe("камера", () => {
  const reference = [3, CAMERA.referenceSize, 3] as const;

  test("для расчётной постройки на расчётном экране стоит в заданной точке", () => {
    const setup = cameraSetup(reference);
    setup.position.forEach((value, axis) => expect(value).toBeCloseTo(CAMERA.position[axis]));
    setup.target.forEach((value, axis) => expect(value).toBeCloseTo(CAMERA.target[axis]));
  });

  test("на узком экране отъезжает от цели, но не дальше потолка", () => {
    expect(pullback(CAMERA.referenceAspect)).toBe(1);
    expect(pullback(CAMERA.referenceAspect * 2)).toBe(1);
    expect(pullback(CAMERA.referenceAspect / 1.5)).toBeCloseTo(1.5);
    expect(pullback(0.1)).toBe(CAMERA.maxPortraitPullback);
    expect(pullback(0)).toBe(1);
  });

  test("отъезжает вдоль луча от цели: направление взгляда не меняется", () => {
    const near = cameraSetup(reference, CAMERA.referenceAspect);
    const far = cameraSetup(reference, CAMERA.referenceAspect / 1.5);
    const offset = (setup: typeof near) => setup.position.map((value, axis) => value - setup.target[axis]);
    offset(far).forEach((value, axis) => expect(value).toBeCloseTo(offset(near)[axis] * 1.5));
    expect(far.target).toEqual(near.target);
  });

  test("для постройки крупнее отодвигается пропорционально её наибольшей стороне", () => {
    expect(sizeScale(reference)).toBe(1);
    expect(sizeScale([5, 7, 5])).toBeCloseTo(7 / CAMERA.referenceSize);
    expect(sizeScale([3, 3, 7])).toBeCloseTo(7 / CAMERA.referenceSize);
    const big = cameraSetup([5, 7, 5]);
    big.position.forEach((value, axis) => expect(value).toBeCloseTo(CAMERA.position[axis] * (7 / CAMERA.referenceSize)));
  });

  test("камера значка смотрит в середину постройки по высоте с того же угла, что и большая сцена", () => {
    const icon = iconCameraSetup([3, 4, 3]);
    expect(icon.target).toEqual([0, 2, 0]);
    const iconDirection = icon.position.map((value, axis) => value - icon.target[axis]);
    const sceneDirection = CAMERA.position.map((value, axis) => value - CAMERA.target[axis]);
    const ratio = iconDirection[0] / sceneDirection[0];
    iconDirection.forEach((value, axis) => expect(value).toBeCloseTo(sceneDirection[axis] * ratio));
    expect(ratio).toBeGreaterThan(0);
  });

  test("камера значка отодвигается от крупной постройки", () => {
    const small = iconCameraSetup([3, 4, 3]);
    const big = iconCameraSetup([5, 7, 5]);
    const distance = (setup: typeof small) => Math.hypot(...setup.position.map((value, axis) => value - setup.target[axis]));
    expect(distance(big)).toBeGreaterThan(distance(small));
  });

  test("к постройке мельче расчётной не подъезжает", () => {
    expect(sizeScale([3, 3, 3])).toBe(1);
    expect(cameraSetup([3, 3, 3])).toEqual(cameraSetup(reference));
  });

  test("стоит над полом и снаружи постройки", () => {
    const [x, y, z] = CAMERA.position;
    expect(y).toBeGreaterThan(0);
    expect(Math.hypot(x, z)).toBeGreaterThan(5);
  });

  test("пределы наклона не дают заглянуть под пол", () => {
    expect(CAMERA.minPolarAngle).toBeGreaterThan(0);
    expect(CAMERA.maxPolarAngle).toBeLessThan(Math.PI / 2);
    expect(CAMERA.minPolarAngle).toBeLessThan(CAMERA.maxPolarAngle);
  });
});

describe("курсор над холстом", () => {
  const rect = { left: 100, top: 50, width: 800, height: 600 };

  test("центр холста — начало координат", () => {
    expect(toPointer(500, 350, rect)).toEqual([0, 0]);
  });

  test("левый верхний угол — (−1, 1), правый нижний — (1, −1)", () => {
    expect(toPointer(100, 50, rect)).toEqual([-1, 1]);
    expect(toPointer(900, 650, rect)).toEqual([1, -1]);
  });

  test("у холста без размеров курсора нет", () => {
    expect(toPointer(10, 10, { left: 0, top: 0, width: 0, height: 0 })).toBeNull();
  });
});

describe("нагрев", () => {
  test("купроникелевые катушки дают 1801 K, как в моде", () => {
    expect(coilHeat(2)).toBe(1801);
  });

  test("каждый следующий ярус катушек добавляет 900 K", () => {
    expect(coilHeat(3) - coilHeat(2)).toBe(900);
    expect(coilHeat(4)).toBe(3601);
  });

  test("без катушек нагрева нет", () => {
    expect(coilHeat(0)).toBe(0);
  });

  test("надбавка за напряжение начинается выше MV: +100 K за ярус", () => {
    expect(voltageHeatBonus(2)).toBe(0);
    expect(voltageHeatBonus(1)).toBe(0);
    expect(voltageHeatBonus(3)).toBe(100);
    expect(voltageHeatBonus(5)).toBe(300);
  });

  test("нихром на HV даёт 3701 K — пример из вики GTNH", () => {
    expect(heatCapacity(4, 3)).toBe(3701);
  });

  test("алюминий на нихроме и HV: две скидки и один идеальный разгон — пример из вики GTNH", () => {
    const bonus = heatBonuses(3701, 1300);
    expect(bonus).toMatchObject({ canRun: true, discounts: 2, perfectOverclocks: 1 });
    expect(bonus.energyFactor).toBeCloseTo(0.95 * 0.95);
  });

  test("рецепт горячее печи не запускается и бонусов не даёт", () => {
    expect(heatBonuses(1801, 2273)).toEqual({ canRun: false, discounts: 0, perfectOverclocks: 0, energyFactor: 1 });
  });

  test("ровно на пороге рецепт запускается без бонусов", () => {
    expect(heatBonuses(1300, 1300)).toMatchObject({ canRun: true, discounts: 0, perfectOverclocks: 0 });
  });

  test("ярусы напряжения растут ровно вчетверо", () => {
    GAME.voltageTiers.slice(1).forEach((tier, index) => {
      expect(tier.voltage).toBe(GAME.voltageTiers[index].voltage * GAME.voltageStep);
    });
  });
});

describe("плотность пикселей", () => {
  test("на обычном экране остаётся родной", () => {
    expect(pickDpr(1280, 720, 1)).toBe(1);
  });

  test("на экране Retina снижается так, чтобы уложиться в бюджет пикселей", () => {
    const dpr = pickDpr(1728, 1117, 2);
    expect(dpr).toBeLessThan(2);
    expect(1728 * 1117 * dpr * dpr).toBeLessThanOrEqual(PERF.maxPixels + 1);
  });

  test("не опускается ниже минимума даже на огромном экране", () => {
    expect(pickDpr(3840, 2160, 1)).toBe(PERF.minDpr);
  });

  test("не поднимается выше плотности самого экрана", () => {
    expect(pickDpr(320, 480, 3)).toBe(3);
    expect(pickDpr(320, 480, 0.5)).toBe(0.5);
  });

  test("при бессмысленных размерах возвращает единицу", () => {
    expect(pickDpr(0, 0, 2)).toBe(1);
    expect(pickDpr(100, 100, Number.NaN)).toBe(1);
  });
});

describe("замеры", () => {
  const full = {
    conditions: "тест",
    all: 10,
    withoutBloom: 7,
    withoutChromaticNoise: 8,
    withoutTransition: 9.5,
    withoutShadows: 9,
    bare: 3,
  };

  test("показывает время кадра каждой конфигурации как измерено, без вычитаний", () => {
    const rows = perfRows(full);
    expect(rows).toHaveLength(6);
    expect(rows?.[0]).toEqual({ label: "Всё включено", ms: 10, isTotal: true });
    expect(rows?.find((row) => row.label === "Без свечения")?.ms).toBe(7);
    expect(rows?.[5]).toEqual({ label: "Без эффектов и теней", ms: 3, isTotal: true });
  });

  test("пока не внесён хоть один замер, строк нет — выдумывать столбики нельзя", () => {
    expect(perfRows({ ...full, withoutShadows: null })).toBeNull();
  });
});

describe("выключение эффектов через адрес", () => {
  test("разбирает список из ?off=", () => {
    expect([...parseDisabledEffects("?off=bloom,shadows")]).toEqual(["bloom", "shadows"]);
  });

  test("слово all выключает всё", () => {
    expect(parseDisabledEffects("?off=all").size).toBe(4);
  });

  test("незнакомые слова и пустой адрес ничего не выключают", () => {
    expect(parseDisabledEffects("?off=что-то").size).toBe(0);
    expect(parseDisabledEffects("").size).toBe(0);
  });
});

describe("математика", () => {
  test("зажим в отрезок", () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(clamp(5, 1, 3)).toBe(3);
  });

  test("плавная кривая совпадает с линейной на концах и в середине", () => {
    expect(smooth01(0)).toBe(0);
    expect(smooth01(0.5)).toBeCloseTo(0.5);
    expect(smooth01(1)).toBe(1);
    expect(smooth01(0.25)).toBeLessThan(0.25);
  });

  test("доля пути не делит на ноль при совпавших концах", () => {
    expect(inverseLerp(1, 1, 0.5)).toBe(0);
    expect(inverseLerp(1, 1, 1)).toBe(1);
    expect(inverseLerp(2, 4, 3)).toBeCloseTo(0.5);
  });
});

describe("согласованность настроек", () => {
  test("у точечного света ограничена дальность, и она не дальше тумана", () => {
    expect(LIGHT.distance).toBeGreaterThan(0);
    expect(LIGHT.distance).toBeLessThanOrEqual(FOG.far);
  });

  test("туман скрывает край пола", () => {
    expect(FOG.far).toBeLessThan(FLOOR.size);
  });

  test("нахлёст меньше прокрутки сцены", () => {
    expect(SCROLL.overlapScreens).toBeLessThan(SCROLL.sceneScreens - 1);
  });

  test("шаг времени за кадр короче времени сглаживания: движение не дёргается", () => {
    expect(HOVER.maxStep).toBeLessThan(HOVER.smoothTime);
  });

  test("радиус курсора меньше самой печи — раздвигается часть, а не всё", () => {
    expect(HOVER.radius).toBeGreaterThan(0);
    expect(HOVER.radius).toBeLessThan(3);
  });

  test("цвета темы записаны как #rrggbb", () => {
    for (const color of Object.values(THEME)) expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe("правило «все числа в lib/config.ts»", () => {
  const files = [
    "components/scene/Scene.tsx",
    "lib/store.ts",
    "components/scene/Structure3D.tsx",
    "components/icons/IconStage.tsx",
    "components/icons/MachineIcon.tsx",
    "components/scene/Floor.tsx",
    "components/scene/Effects.tsx",
    "components/scene/TransitionEffect.ts",
    "lib/structure.ts",
    "lib/scroll.ts",
    "lib/camera.ts",
    "lib/heat.ts",
    "lib/perf.ts",
  ];

  /** Убирает комментарии и строки (в них числа — это текст и классы, а не настройки). */
  function codeOnly(source: string): string {
    return source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "")
      .replace(/(["'])(?:\\.|(?!\1).)*\1/g, '""');
  }

  test.each(files)("в %s нет чисел, кроме 0, 1 и 2", (file) => {
    const code = codeOnly(readFileSync(file, "utf8"));
    const numbers = code.match(/(?<![\w.$])\d+(?:\.\d+)?(?![\w$])/g) ?? [];
    const allowed = new Set(["0", "1", "2", "0.0", "1.0"]);
    expect(numbers.filter((value) => !allowed.has(value))).toEqual([]);
  });
});
