import { beforeEach, describe, expect, test } from "vitest";
import { iconCameraSetup } from "@/lib/camera";
import { specCamera, specKey, useCardStore, type CardSpec } from "@/lib/cards";
import { findMachine, structureOf } from "@/lib/machines";

const furnace: CardSpec = { kind: "machine", slug: "electric-blast-furnace" };
const bronze: CardSpec = { kind: "single", id: "macerator", tier: "bronze", hull: "plain" };
const steel: CardSpec = { kind: "single", id: "macerator", tier: "steel", hull: "plain" };

describe("карточки", () => {
  beforeEach(() => {
    useCardStore.setState({ images: {}, queue: [], active: null });
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
