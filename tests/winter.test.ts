import { describe, expect, test } from "vitest";
import { CAMERA, LOGO, SNOW } from "@/lib/config";
import { logoArcs, logoBars, logoOffsetX, placeBar, snowCaps, tilt, winterCamera } from "@/lib/logo";
import { flakePosition, hash01, makeFlakes } from "@/lib/snow";

describe("эмблема GT New Horizons", () => {
  const bars = logoBars();
  const byId = (id: string) => {
    const bar = bars.find((candidate) => candidate.id === id);
    if (!bar) throw new Error(`нет перекладины ${id}`);
    return bar;
  };

  test("кольцо из двух дуг, разомкнутых сверху и снизу, — зеркальных друг другу", () => {
    const [right, left] = logoArcs();
    expect(right.start).toBeCloseTo(-right.end);
    // Левая дуга — та же правая, развёрнутая на полоборота: её середина на «девяти часах» (π).
    expect((left.start + left.end) / 2).toBeCloseTo(Math.PI);
    expect(right.end - right.start).toBeCloseTo(left.end - left.start);
    expect(right.end).toBeLessThan(Math.PI / 2);
  });

  test("вертикальная черта общая у N и H и выходит за кольцо сверху и снизу", () => {
    const stem = placeBar(byId("stem"));
    expect(stem.center).toEqual([0, 0]);
    expect(stem.length / 2).toBeCloseTo(LOGO.ringRadius + LOGO.stemOverhang);
    expect(tilt(stem.angle)).toBeCloseTo(Math.PI / 2);
  });

  test("перекладина H идёт вправо от черты до кольца", () => {
    const cross = byId("cross");
    expect(cross.from).toEqual([0, 0]);
    expect(cross.to).toEqual([LOGO.ringRadius, 0]);
  });

  test("диагональ N идёт из верхнего левого конца кольца вниз к черте", () => {
    const diagonal = byId("diagonal");
    expect(diagonal.from[0]).toBeLessThan(0);
    expect(diagonal.from[1]).toBeGreaterThan(0);
    expect(Math.hypot(...diagonal.from)).toBeCloseTo(LOGO.ringRadius);
    expect(diagonal.to).toEqual([0, -LOGO.ringRadius]);
  });

  test("на четырёх концах дуг — зубцы со шляпками, симметрично", () => {
    const teeth = bars.filter((bar) => bar.id.startsWith("tooth-"));
    const caps = bars.filter((bar) => bar.id.startsWith("cap-"));
    expect(teeth).toHaveLength(4);
    expect(caps).toHaveLength(4);
    const tips = teeth.map((tooth) => tooth.to);
    for (const [x, y] of tips) expect(tips.some(([ox, oy]) => Math.abs(ox + x) < 1e-9 && Math.abs(oy - y) < 1e-9)).toBe(true);
    for (const cap of caps) expect(placeBar(cap).length).toBeCloseTo(LOGO.toothCap);
  });

  test("снег лежит на горизонтальной перекладине и на верхнем торце черты, но не на диагонали", () => {
    const caps = snowCaps().map((cap) => cap.id);
    expect(caps).toContain("snow-cross");
    expect(caps).toContain("snow-stem");
    expect(caps).not.toContain("snow-diagonal");
  });

  test("снег на перекладине — сверху от неё", () => {
    const cap = snowCaps().find((candidate) => candidate.id === "snow-cross");
    expect(cap?.center[1]).toBeGreaterThan(0);
  });

  test("наклон считается от горизонтали в обе стороны", () => {
    expect(tilt(0)).toBe(0);
    expect(tilt(Math.PI)).toBeCloseTo(0);
    expect(tilt(-Math.PI / 2)).toBeCloseTo(Math.PI / 2);
  });

  test("на широкой шапке эмблема правее центра, на узкой — по центру", () => {
    expect(logoOffsetX(CAMERA.referenceAspect * 2)).toBe(LOGO.offsetX);
    expect(logoOffsetX(CAMERA.referenceAspect / 2)).toBe(0);
  });

  test("камера шапки смотрит на эмблему и отъезжает на узком экране", () => {
    const wide = winterCamera(CAMERA.referenceAspect);
    const narrow = winterCamera(CAMERA.referenceAspect / 2);
    const distance = (setup: typeof wide) => Math.hypot(...setup.position.map((value, axis) => value - setup.target[axis]));
    expect(distance(narrow)).toBeCloseTo(distance(wide) * 2);
  });
});

describe("снегопад", () => {
  const flakes = makeFlakes();
  const [width, height, depth] = SNOW.area;

  test("снежинок столько, сколько задано, и все внутри объёма снегопада", () => {
    expect(flakes).toHaveLength(SNOW.count);
    for (const flake of flakes) {
      expect(Math.abs(flake.x)).toBeLessThanOrEqual(width / 2);
      expect(flake.y).toBeGreaterThanOrEqual(0);
      expect(flake.y).toBeLessThan(height);
      expect(Math.abs(flake.z)).toBeLessThanOrEqual(depth / 2);
      expect(flake.speed).toBeGreaterThan(0);
    }
  });

  test("снег одинаковый при каждой загрузке", () => {
    expect(makeFlakes()).toEqual(flakes);
    expect(hash01(7, 1)).toBe(hash01(7, 1));
  });

  test("«случайные» числа лежат от 0 до 1 и разные у разных снежинок", () => {
    const values = Array.from({ length: 50 }, (_, index) => hash01(index, 0));
    for (const value of values) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
    expect(new Set(values).size).toBe(values.length);
  });

  test("снежинка падает вниз", () => {
    const flake = { ...flakes[0], y: height / 2 };
    expect(flakePosition(flake, 1)[1]).toBeLessThan(flakePosition(flake, 0)[1]);
  });

  test("долетев до пола, снежинка появляется снова наверху и не уходит под пол", () => {
    const flake = flakes[0];
    for (let time = 0; time < 200; time += 7.3) {
      const [, y] = flakePosition(flake, time);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(height);
    }
  });

  test("снежинка покачивается не дальше заданного размаха", () => {
    const flake = flakes[0];
    for (let time = 0; time < 20; time += 0.37) {
      expect(Math.abs(flakePosition(flake, time)[0] - flake.x)).toBeLessThanOrEqual(SNOW.swayAmplitude + 1e-9);
    }
  });

  test("скорости снежинок разные, но в заданных пределах", () => {
    const speeds = flakes.map((flake) => flake.speed);
    expect(Math.min(...speeds)).toBeGreaterThanOrEqual(SNOW.fallSpeed * (1 - SNOW.speedSpread) - 1e-9);
    expect(Math.max(...speeds)).toBeLessThanOrEqual(SNOW.fallSpeed * (1 + SNOW.speedSpread) + 1e-9);
    expect(new Set(speeds).size).toBeGreaterThan(SNOW.count / 2);
  });
});
