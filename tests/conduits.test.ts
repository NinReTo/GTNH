import { describe, expect, test } from "vitest";
import { choosePipe, fluidTemperature, pipeCapacity, pipeChannels, type PipeOffer } from "@/lib/calc/conduits";
import type { Goods } from "@/lib/calc/repository";

describe("трубы GregTech: ёмкость как в игре", () => {
  test("подача объединяется только в пределах ёмкости канала", () => {
    expect(pipeChannels([6, 4, 6, 4, 11], 10)).toEqual([
      { indices: [4], rate: 11 },
      { indices: [0, 1], rate: 10 },
      { indices: [2, 3], rate: 10 },
    ]);
  });
  test("жидкостные: обычная медная — 20 л/тик, то есть 400 л/с; размеры делят и множат базу целочисленно", () => {
    expect(pipeCapacity("Copper Fluid Pipe")).toMatchObject({ kind: "fluid", perSecond: 400 });
    // 20 / 6 = 3 л/тик (целочисленно) — 60 л/с.
    expect(pipeCapacity("Tiny Copper Fluid Pipe")?.perSecond).toBe(60);
    expect(pipeCapacity("Huge Stainless Steel Fluid Pipe")?.perSecond).toBe(360 * 4 * 20);
    expect(pipeCapacity("Large Plastic Fluid Pipe")?.perSecond).toBe(360 * 2 * 20);
  });

  test("предметные: обычная оловянная — стопка за 2 секунды, огромная — 2 стопки в секунду", () => {
    expect(pipeCapacity("Tin Item Pipe")).toMatchObject({ kind: "item", perSecond: 32 });
    expect(pipeCapacity("Huge Tin Item Pipe")?.perSecond).toBe(128);
    expect(pipeCapacity("Tiny Tin Item Pipe")?.perSecond).toBe(8);
    expect(pipeCapacity("Brass Item Pipe")?.perSecond).toBe(64);
    expect(pipeCapacity("Large Quantium Item Pipe")?.perSecond).toBe(256 * 64);
  });

  test("трубы, которых нет в таблице мода, не предлагаются", () => {
    expect(pipeCapacity("Restrictive Tin Item Pipe")).toBeUndefined();
    expect(pipeCapacity("Quadruple Steel Fluid Pipe")).toBeUndefined();
  });

  test("трубы GT++ считают расход после деления на тики с округлением", () => {
    expect(pipeCapacity("Dark Steel Fluid Pipe")).toMatchObject({ perSecond: 27_840, heat: 2750 });
    expect(pipeCapacity("Huge Dark Steel Fluid Pipe")?.perSecond).toBe(111_360);
    expect(pipeCapacity("Small Lead Fluid Pipe")).toMatchObject({ perSecond: 1360, heat: 1200 });
    expect(pipeCapacity("Huge Inconel-690 Fluid Pipe")?.perSecond).toBe(720_000);
  });
});

describe("выбор трубы", () => {
  const offer = (name: string, perSecond: number, cost: number, heat = 2500): PipeOffer => ({ goods: { name } as Goods, kind: "fluid", perSecond, cost, heat });
  const offers = [offer("Copper", 400, 1), offer("Steel", 4800, 3), offer("Large Steel", 9600, 5)];

  test("самая маленькая из тех, что тянут поток; при равной ёмкости — дешевле", () => {
    expect(choosePipe(offers, "fluid", 300)?.offer.goods.name).toBe("Copper");
    expect(choosePipe(offers, "fluid", 1000)?.offer.goods.name).toBe("Steel");
    expect(choosePipe([...offers, offer("Cheap Steel", 4800, 2)], "fluid", 1000)?.offer.goods.name).toBe("Cheap Steel");
  });

  test("не тянет ни одна — самая ёмкая, несколько штук рядом", () => {
    expect(choosePipe(offers, "fluid", 20000)).toMatchObject({ offer: { goods: { name: "Large Steel" } }, parallel: 3 });
    expect(choosePipe(offers, "item", 1)).toBeUndefined();
  });

  test("горячая жидкость — только труба, что держит её жар: пар (375 K) прожигает полиэтилен (350 K)", () => {
    expect(fluidTemperature("Steam")).toBe(375);
    expect(fluidTemperature("Molten Steel")).toBe(1811);
    expect(fluidTemperature("Helium Plasma")).toBe(10_000);
    const withPlastic = [offer("Huge Plastic", 28_800, 1, 350), offer("Huge Bronze", 9_600, 5, 2000)];
    expect(choosePipe(withPlastic, "fluid", 5_000, fluidTemperature("Water"))?.offer.goods.name).toBe("Huge Bronze");
    expect(choosePipe(withPlastic, "fluid", 20_000, fluidTemperature("Water"))?.offer.goods.name).toBe("Huge Plastic");
    expect(choosePipe(withPlastic, "fluid", 20_000, fluidTemperature("Steam"))?.offer.goods.name).toBe("Huge Bronze");
  });
});
