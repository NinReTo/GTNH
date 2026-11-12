import { beforeEach, describe, expect, test } from "vitest";
import { iconCameraSetup } from "@/lib/camera";
import { HOVER, ICON } from "@/lib/config";
import { returnStep, specCamera, specKey, useCardStore, type CardSpec } from "@/lib/cards";
import { findMachine, structureOf } from "@/lib/machines";

const furnace: CardSpec = { kind: "machine", slug: "electric-blast-furnace" };
const bronze: CardSpec = { kind: "single", id: "macerator", tier: "bronze", hull: "plain" };
const steel: CardSpec = { kind: "single", id: "macerator", tier: "steel", hull: "plain" };

describe("карточки", () => {
  beforeEach(() => {
    useCardStore.setState({ images: {}, queue: [], active: null, isLiveReady: false, isLeaving: false });
  });

  test("у каждой карточки своё имя, у бронзовой и стальной версии — разные", () => {
    expect(new Set([specKey(furnace), specKey(bronze), specKey(steel)]).size).toBe(3);
  });

  test("снимок и живая модель смотрят одной и той же камерой", () => {
    const machine = findMachine("electric-blast-furnace");
    expect(machine).toBeDefined();
    if (!machine) return;
    expect(specCamera(furnace)).toEqual(iconCameraSetup(structureOf(machine).size));
    expect(specCamera(bronze)).toEqual(iconCameraSetup([1, 1, 1]));
  });

  test("неизвестная постройка — ошибка, а не пустая карточка", () => {
    expect(() => specCamera({ kind: "machine", slug: "нет-такой" })).toThrow();
  });

  test("одна и та же карточка встаёт в очередь на снимок один раз", () => {
    const { request } = useCardStore.getState();
    request(furnace);
    request(furnace);
    request(bronze);
    expect(useCardStore.getState().queue.map(specKey)).toEqual([specKey(furnace), specKey(bronze)]);
  });

  test("готовый снимок уходит из очереди и больше в неё не встаёт", () => {
    const { request, done } = useCardStore.getState();
    request(furnace);
    done(specKey(furnace), "снимок");
    expect(useCardStore.getState().queue).toEqual([]);
    expect(useCardStore.getState().images[specKey(furnace)]).toBe("снимок");
    request(furnace);
    expect(useCardStore.getState().queue).toEqual([]);
  });
});

describe("плавный возврат домой", () => {
  const home = [0, 2, 10] as const;

  test("за кадр точка проходит часть пути, не перелетая дом", () => {
    const step = returnStep([4, 2, 10], home, 0.016);
    expect(step.position[0]).toBeGreaterThan(0);
    expect(step.position[0]).toBeLessThan(4);
    expect(step.isHome).toBe(false);
  });

  test("в конце концов точка встаёт ровно на место — возврат заканчивается", () => {
    let position: readonly [number, number, number] = [4, 5, 6];
    let frames = 0;
    let isHome = false;
    while (!isHome && frames < 1000) {
      const step = returnStep(position, home, 0.016);
      position = step.position;
      isHome = step.isHome;
      frames += 1;
    }
    expect(position).toEqual(home);
    expect(frames).toBeLessThan(200);
  });

  test("возврат длится не мгновенно, а дольше заданного времени", () => {
    let position: readonly [number, number, number] = [1, 2, 10];
    let elapsed = 0;
    let isHome = false;
    while (!isHome) {
      const step = returnStep(position, home, 0.016);
      position = step.position;
      isHome = step.isHome;
      elapsed += 0.016;
    }
    expect(elapsed).toBeGreaterThan(ICON.returnTime);
  });

  test("после долгой паузы кадр не перебрасывает точку домой одним скачком", () => {
    expect(returnStep([4, 2, 10], home, 30)).toEqual(returnStep([4, 2, 10], home, HOVER.maxStep));
    expect(returnStep([4, 2, 10], home, 30).isHome).toBe(false);
  });

  test("уже дома — стоит на месте", () => {
    expect(returnStep(home, home, 0.016)).toEqual({ position: home, isHome: true });
  });

  test("новая карточка под мышкой отменяет возврат прошлой и прячет холст до первого кадра", () => {
    const { setActive, setLeaving, setLiveReady } = useCardStore.getState();
    const element = {} as HTMLElement;
    setActive({ spec: bronze, element });
    setLiveReady(true);
    setLeaving(true);
    setActive({ spec: steel, element });
    expect(useCardStore.getState().isLeaving).toBe(false);
    expect(useCardStore.getState().isLiveReady).toBe(false);
  });
});
