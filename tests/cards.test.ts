import { beforeEach, describe, expect, test } from "vitest";
import { iconCameraSetup } from "@/lib/camera";
import { HOVER, ICON } from "@/lib/config";
import { otherSlot, returnStep, specCamera, specKey, useCardStore, type CardSpec } from "@/lib/cards";
import { findMachine, structureOf } from "@/lib/machines";

const furnace: CardSpec = { kind: "machine", slug: "electric-blast-furnace" };
const bronze: CardSpec = { kind: "single", id: "macerator", tier: "bronze", hull: "plain" };
const steel: CardSpec = { kind: "single", id: "macerator", tier: "steel", hull: "plain" };

describe("карточки", () => {
  beforeEach(() => {
    useCardStore.setState({ images: {}, queue: [], slots: [null, null], current: 0 });
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
    request(furnace, 250);
    request(furnace, 250);
    request(bronze, 180);
    expect(useCardStore.getState().queue.map((shot) => specKey(shot.spec))).toEqual([specKey(furnace), specKey(bronze)]);
  });

  test("снимок заказывается в размер карточки на странице — без растяжения", () => {
    useCardStore.getState().request(furnace, 263);
    expect(useCardStore.getState().queue[0]).toEqual({ spec: furnace, size: 263 });
  });

  test("готовый снимок уходит из очереди и больше в неё не встаёт", () => {
    const { request, done } = useCardStore.getState();
    request(furnace, 250);
    done(specKey(furnace), "снимок");
    expect(useCardStore.getState().queue).toEqual([]);
    expect(useCardStore.getState().images[specKey(furnace)]).toBe("снимок");
    request(furnace, 250);
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

});

describe("два живых холста", () => {
  const first = { spec: bronze, element: { id: "a" } as unknown as HTMLElement };
  const second = { spec: steel, element: { id: "b" } as unknown as HTMLElement };
  const state = () => useCardStore.getState();

  beforeEach(() => {
    useCardStore.setState({ images: {}, queue: [], slots: [null, null], current: 0 });
  });

  test("холстов два, и новый всегда другой", () => {
    expect(otherSlot(0)).toBe(1);
    expect(otherSlot(1)).toBe(0);
  });

  test("новая модель скрыта, пока не нарисует первый кадр", () => {
    state().activate(first);
    const slot = state().slots[state().current];
    expect(slot?.card).toBe(first);
    expect(slot?.isReady).toBe(false);
    state().setReady(state().current);
    expect(state().slots[state().current]?.isReady).toBe(true);
  });

  test("быстрый переход: прошлая модель доигрывает возврат на своём холсте, новая — на другом", () => {
    state().activate(first);
    const firstSlot = state().current;
    state().setReady(firstSlot);
    state().activate(second);
    const secondSlot = state().current;
    expect(secondSlot).not.toBe(firstSlot);
    expect(state().slots[firstSlot]).toMatchObject({ card: first, isLeaving: true, isReady: true });
    expect(state().slots[secondSlot]).toMatchObject({ card: second, isLeaving: false, isReady: false });
  });

  test("мышка ушла — возврат; вернулась посреди возврата — возврат прерван", () => {
    state().activate(first);
    state().leave();
    expect(state().slots[state().current]?.isLeaving).toBe(true);
    state().stay();
    expect(state().slots[state().current]?.isLeaving).toBe(false);
  });

  test("вернулись на ту же карточку посреди возврата — она не перезапускается", () => {
    state().activate(first);
    const slot = state().current;
    state().setReady(slot);
    state().leave();
    state().activate(first);
    expect(state().current).toBe(slot);
    expect(state().slots[slot]).toMatchObject({ card: first, isLeaving: false, isReady: true });
  });

  test("ушли на соседнюю и сразу вернулись — прошлая модель продолжает жить на своём холсте", () => {
    state().activate(first);
    const firstSlot = state().current;
    state().setReady(firstSlot);
    state().activate(second);
    state().activate(first);
    expect(state().current).toBe(firstSlot);
    expect(state().slots[firstSlot]).toMatchObject({ card: first, isLeaving: false, isReady: true });
    expect(state().slots[otherSlot(firstSlot)]?.isLeaving).toBe(true);
  });

  test("модель дошла домой — холст освобождается", () => {
    state().activate(first);
    state().release(state().current);
    expect(state().slots).toEqual([null, null]);
  });
});
