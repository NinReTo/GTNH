import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { CAMERA, EXPLODE, FLOOR, FOG, GAME, LIGHT, PERF, SCROLL, THEME } from "@/lib/config";
import { cameraPose, pullback } from "@/lib/camera";
import { LAYER_COUNT } from "@/lib/ebf";
import { coilHeat, heatBonuses, heatCapacity, voltageHeatBonus } from "@/lib/heat";
import { clamp, clamp01, inverseLerp, smooth01 } from "@/lib/math";
import { perfRows, pickDpr } from "@/lib/perf";
import { parseDisabledEffects } from "@/lib/store";

describe("камера", () => {
  test("кривая проходит через первую и последнюю заданные точки", () => {
    const expectClose = (actual: readonly number[], expected: readonly number[]) =>
      actual.forEach((value, axis) => expect(value).toBeCloseTo(expected[axis]));
    expectClose(cameraPose(0).position, CAMERA.positionPoints[0]);
    expectClose(cameraPose(1).position, CAMERA.positionPoints[CAMERA.positionPoints.length - 1]);
    expectClose(cameraPose(0).target, CAMERA.targetPoints[0]);
  });

  test("кривая проходит через промежуточные точки на третях пути", () => {
    const pose = cameraPose(1 / 3);
    pose.position.forEach((value, axis) => expect(value).toBeCloseTo(CAMERA.positionPoints[1][axis]));
  });

  test("за пределами отрезка 0…1 камера стоит на концах пути", () => {
    expect(cameraPose(-1)).toEqual(cameraPose(0));
    expect(cameraPose(2)).toEqual(cameraPose(1));
  });

  test("никогда не опускается под пол и не заходит внутрь печи", () => {
    for (let step = 0; step <= 50; step += 1) {
      const [x, y, z] = cameraPose(step / 50).position;
      expect(y).toBeGreaterThan(0);
      expect(Math.hypot(x, z)).toBeGreaterThan(5);
    }
  });

  test("на узком экране отъезжает от цели, но не дальше потолка", () => {
    expect(pullback(CAMERA.referenceAspect)).toBe(1);
    expect(pullback(CAMERA.referenceAspect * 2)).toBe(1);
    expect(pullback(CAMERA.referenceAspect / 1.5)).toBeCloseTo(1.5);
    expect(pullback(0.1)).toBe(CAMERA.maxPortraitPullback);
    expect(pullback(0)).toBe(1);
  });

  test("отъезд не сдвигает цель взгляда", () => {
    expect(cameraPose(0.5, 0.5).target).toEqual(cameraPose(0.5).target);
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
  test("задержки слоёв оставляют время на сам разбор", () => {
    expect((LAYER_COUNT - 1) * EXPLODE.layerStagger).toBeLessThan(1);
  });

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

  test("путь камеры и путь цели заданы четырьмя точками каждый", () => {
    expect(CAMERA.positionPoints).toHaveLength(4);
    expect(CAMERA.targetPoints).toHaveLength(4);
  });

  test("цвета темы записаны как #rrggbb", () => {
    for (const color of Object.values(THEME)) expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe("правило «все числа в lib/config.ts»", () => {
  const files = [
    "components/scene/Scene.tsx",
    "components/scene/Furnace.tsx",
    "components/scene/Floor.tsx",
    "components/scene/Effects.tsx",
    "components/scene/TransitionEffect.ts",
    "lib/ebf.ts",
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
