import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { CAMERA, EBF, FLOOR, FOG, GAME, HERO, HOVER, ICON, LIGHT, PERF, THEME, WORKSHOP } from "@/lib/config";
import { cameraSetup, iconCameraSetup, pullback, sceneScale, sizeScale, startSetup, zoomDistance } from "@/lib/camera";
import { coilHeat, heatBonuses, heatCapacity, voltageHeatBonus } from "@/lib/heat";
import { clamp, clamp01, inverseLerp, smooth01 } from "@/lib/math";
import { packLayers, unpackLayers } from "@/lib/packed-layers";
import { pickDpr } from "@/lib/perf";
import { EFFECT_NAMES, parseDisabledEffects, toPointer } from "@/lib/store";
import { footprint, workshopCamera, workshopPlacements } from "@/lib/workshop";

describe("сжатые схемы огромных построек", () => {
  test("распаковка возвращает схему ровно как была", () => {
    const layers = [["  AAA ", "B~B", "   "], ["CCCCCCCCCCCC", "D D", "   "]];
    expect(unpackLayers(packLayers(layers))).toEqual(layers);
  });
});

describe("туман у крупных построек", () => {
  test("у расчётной постройки туман на своём месте", () => {
    expect(sceneScale(cameraSetup([3, CAMERA.referenceSize, 3]))).toBeCloseTo(1);
  });

  test("реактор синтеза (15 блоков) не тонет в тумане: камера ближе, чем туман закрывает всё", () => {
    const setup = cameraSetup([15, 3, 15]);
    const reach = Math.hypot(...setup.position.map((value, axis) => value - setup.target[axis]));
    expect(reach).toBeLessThan(FOG.near * sceneScale(setup));
  });
});

describe("приближение колёсиком", () => {
  test("вверх — ближе, вниз — дальше", () => {
    expect(zoomDistance(10, 10, -100)).toBeLessThan(10);
    expect(zoomDistance(10, 10, 100)).toBeGreaterThan(10);
  });

  test("не подходит ближе и не отходит дальше пределов", () => {
    expect(zoomDistance(10, 10, -100000)).toBeCloseTo(10 * CAMERA.zoomMin);
    expect(zoomDistance(10, 10, 100000)).toBeCloseTo(10 * CAMERA.zoomMax);
  });

  test("к огромной постройке можно подъехать до zoomNearest метров, хотя это меньше 35 %", () => {
    expect(zoomDistance(700, 700, -1e6)).toBeCloseTo(CAMERA.zoomNearest);
  });

  test("ближний предел меньше начального расстояния, дальний — больше", () => {
    expect(CAMERA.zoomMin).toBeLessThan(1);
    expect(CAMERA.zoomMax).toBeGreaterThan(1);
  });

  test("длинная фабрика целиком помещается в обзор на узком и широком экранах", () => {
    const size: [number, number, number] = [348, 76, 464];
    const reachOf = (setup: ReturnType<typeof cameraSetup>) => Math.hypot(...setup.position.map((value, axis) => value - setup.target[axis]));
    const setup = startSetup(size);
    expect(setup.target).toEqual([0, size[1] * EBF.blockSize / 2, 0]);
    const sphere = Math.hypot(...size) * EBF.blockSize / 2;
    const halfFov = CAMERA.fov * Math.PI / CAMERA.degreesPerTurn;
    for (const aspect of [0.5, 2]) {
      const halfFrame = Math.min(halfFov, Math.atan(Math.tan(halfFov) * aspect));
      expect(reachOf(startSetup(size, aspect)) * Math.sin(halfFrame)).toBeGreaterThan(sphere);
    }
  });
});

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

  test("камера значка одиночного куба подъезжает ближе, но не ближе нижнего предела", () => {
    const cube = iconCameraSetup([1, 1, 1]);
    const furnace = iconCameraSetup([3, 4, 3]);
    const distance = (setup: typeof cube) => Math.hypot(...setup.position.map((value, axis) => value - setup.target[axis]));
    expect(distance(cube)).toBeLessThan(distance(furnace));
    expect(distance(cube) / distance(furnace)).toBeCloseTo(ICON.minScale);
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

describe("паровой цех в шапке", () => {
  const placements = workshopPlacements();

  test("все постройки цеха есть в каталоге", () => {
    expect(placements.length).toBe(WORKSHOP.layout.length);
  });

  test("между любыми двумя постройками остаётся метр на раздвижение блоков", () => {
    const boxes = placements.map(footprint);
    for (let first = 0; first < boxes.length; first += 1) {
      for (let second = first + 1; second < boxes.length; second += 1) {
        const a = boxes[first];
        const b = boxes[second];
        const gapX = Math.max(b.minX - a.maxX, a.minX - b.maxX);
        const gapZ = Math.max(b.minZ - a.maxZ, a.minZ - b.maxZ);
        expect(Math.max(gapX, gapZ), `${placements[first].key} и ${placements[second].key}`).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test("весь цех стоит на полу и не выходит за его край", () => {
    for (const box of placements.map(footprint)) {
      for (const edge of [box.minX, box.maxX, box.minZ, box.maxZ]) expect(Math.abs(edge)).toBeLessThan(FLOOR.size / 2);
    }
  });

  test("свой свет только у построек с огнём внутри", () => {
    const lit = placements.filter((placement) => placement.hasLight).map((placement) => placement.machine.slug);
    expect(new Set(lit)).toEqual(new Set(["bricked-blast-furnace", "coke-oven"]));
  });

  test("поворот в долях оборота переводится в радианы", () => {
    const turned = placements.find((placement) => placement.machine.slug === "steam-compressor");
    expect(turned?.rotationY).toBeCloseTo(Math.PI / 2);
  });

  test("камера цеха смотрит на цех сверху и отъезжает на узком экране", () => {
    const wide = workshopCamera();
    const narrow = workshopCamera(CAMERA.referenceAspect / 2);
    expect(wide.position[1]).toBeGreaterThan(wide.target[1]);
    const distance = (setup: typeof wide) => Math.hypot(...setup.position.map((value, axis) => value - setup.target[axis]));
    expect(distance(narrow)).toBeCloseTo(distance(wide) * 2);
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

  test("ярусы напряжения растут ровно вчетверо (кроме MAX — он на 8 EU/t меньше) и доходят до MAX", () => {
    const tiers = GAME.voltageTiers;
    expect(tiers[tiers.length - 1]).toEqual({ name: "MAX", voltage: 2 ** 31 - 8 });
    tiers.slice(1, -1).forEach((tier, index) => {
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

describe("выключение эффектов через адрес", () => {
  test("разбирает список из ?off=", () => {
    expect([...parseDisabledEffects("?off=bloom,shadows")]).toEqual(["bloom", "shadows"]);
  });

  test("слово all выключает всё", () => {
    expect(parseDisabledEffects("?off=all").size).toBe(EFFECT_NAMES.length);
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

  test("шапка ниже экрана: под ней сразу видно продолжение", () => {
    expect(HERO.screens).toBeGreaterThan(0);
    expect(HERO.screens).toBeLessThan(1);
  });

  test("щелчок по карточке отличается от поворота", () => {
    expect(ICON.clickSlop).toBeGreaterThan(0);
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
    "components/cards/CardStage.tsx",
    "components/cards/CardContent.tsx",
    "components/cards/Cards.tsx",
    "components/landing/TierTabs.tsx",
    "lib/cards.ts",
    "lib/tiers.ts",
    "components/scene/SceneCanvas.tsx",
    "components/scene/Workshop.tsx",
    "lib/workshop.ts",
    "components/scene/Floor.tsx",
    "components/scene/Effects.tsx",
    "lib/structure.ts",
    "lib/camera.ts",
    "lib/heat.ts",
    "lib/perf.ts",
    "lib/lines.ts",
    "lib/guides.ts",
    "lib/singles.ts",
    "lib/boilers.ts",
    "lib/lv.ts",
    "lib/mv.ts",
    "lib/hv.ts",
    "lib/high.ts",
    "components/landing/GuideSection.tsx",
    "components/landing/LineRow.tsx",
    "components/landing/LineSection.tsx",
    "components/scene/SingleScene.tsx",
    "lib/calc/factory.ts",
    "lib/calc/load.ts",
    "components/calc/Calculator.tsx",
    "components/calc/CraftTree.tsx",
    "components/calc/RecipePicker.tsx",
    "components/calc/Icon.tsx",
    "lib/calc/planner.ts",
    "lib/calc/optimize.ts",
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
