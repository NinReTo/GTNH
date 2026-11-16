import { describe, expect, test } from "vitest";
import { GAME, PRODUCTION } from "@/lib/config";
import { coilHeat } from "@/lib/heat";
import { bbfFarmRun, fuelChainRun, bronzeRun, coilFor, powerSupply, runRecipe, steamSteelRun, steamWater, steelPrepRun } from "@/lib/production";

const ebf = PRODUCTION.machines["electric-blast-furnace"];
const amps = PRODUCTION.hatchAmps * PRODUCTION.hatchesPerMachine;

describe("расчёт линий", () => {
  test("сталь в LV: 120 EU/t влезает только в два люка (4 А × 32), разгона нет, 25 с на слиток", () => {
    const run = runRecipe(PRODUCTION.recipes.steel, ebf, { voltage: 32, amps, tier: 1, coilHeat: coilHeat(GAME.coils[0].ordinal) });
    expect(run).toMatchObject({ eut: 120, ticks: 500, parallel: 1, overclocks: 0 });
    expect(run.perMinute).toBeCloseTo(2.4);
  });

  test("разгон: энергия ×4, время ÷2; запас нагрева 1800 K делает первый разгон идеальным (÷4)", () => {
    const recipe = { eut: 30, ticks: 800, out: 1, heat: 1000 };
    expect(runRecipe(recipe, ebf, { voltage: 128, amps: 1, tier: 2, coilHeat: 1000 })).toMatchObject({ eut: 120, ticks: 400, overclocks: 1 });
    const hot = runRecipe(recipe, ebf, { voltage: 128, amps: 1, tier: 2, coilHeat: 2800 });
    // Скидка −5 % дважды (1800 K запаса), разгон идеальный.
    expect(hot).toMatchObject({ ticks: 200, overclocks: 1, perfectOverclocks: 1 });
  });

  test("Вулканус ведёт 8 рецептов разом, если хватает тока", () => {
    const run = runRecipe(PRODUCTION.recipes.tungstensteel, PRODUCTION.machines.volcanus, { voltage: 8192, amps, tier: 5, coilHeat: 4501 });
    expect(run.parallel).toBe(8);
  });

  test("мало нагрева или тока — ошибка, а не выдуманные числа", () => {
    expect(() => runRecipe(PRODUCTION.recipes.aluminium, ebf, { voltage: 128, amps, tier: 2, coilHeat: 1801 })).toThrow();
    expect(() => runRecipe(PRODUCTION.recipes.steel, ebf, { voltage: 32, amps: 2, tier: 1, coilHeat: 1801 })).toThrow();
  });

  test("генераторы покрывают потребление, кабель — их ток", () => {
    expect(powerSupply(120, 32, 1)).toEqual({ generators: 4, cableSize: 4 });
    expect(powerSupply(100, 512, 3)).toEqual({ generators: 1, cableSize: 1 });
  });

  test("катушка — самая слабая, которой хватает", () => {
    expect(coilFor(1940)?.id).toBe("kanthal");
  });

  test("бронза: 32 слитка за 16 с, 3000 л пара в секунду — десять котлов по 300 л/с", () => {
    expect(bronzeRun()).toEqual({ perMinute: 120, steamPerSecond: 3000, boilers: 10, ticks: 320 });
  });

  test("вода: помпа на равнине даёт 600 л/с, котлам на 3000 л/с пара хватает её малой доли", () => {
    const water = steamWater(3000);
    expect(water.pumpWater).toBe(600);
    // Вода покрывает и пар самой помпы: (3000 + пар помпы) / 160 = вода.
    expect((3000 + water.pumpSteam) / PRODUCTION.steamPerWater).toBeCloseTo(water.water, 6);
    expect(water.water).toBeCloseTo(19.05, 2);
    expect(water.pumpSteam).toBeCloseTo(47.6, 1);
    expect(() => steamWater(PRODUCTION.steamPerWater * 600)).toThrow();
  });

  test("подготовка стали LV на 2,4 слитка в минуту: 4 электролизёра, 40 л воды, одна дробилка занята на 14 %", () => {
    const prep = steelPrepRun(2.4);
    expect(prep.electrolyzers).toBe(4);
    expect(prep.waterPerSecond).toBeCloseTo(40);
    expect(prep.maceratorBusy).toBeCloseTo(0.144);
    expect(prep.pumpPerSecond).toBe(250);
  });

  test("ферма домн на 2,4 слитка в минуту: 10 домн, 8 коксовых печей на 5 кокса в минуту, сундука угля — на 5,8 ч", () => {
    const farm = bbfFarmRun(2.4);
    expect(farm).toMatchObject({ furnaces: 10, ovens: 8 });
    expect(farm.coalChestMinutes).toBeCloseTo(345.6);
    expect(farm.ironChestMinutes).toBeCloseTo(6912);
    expect(farm.cokePerMinute).toBeCloseTo(5);
    expect(farm.ovenBusy).toBeCloseTo(0.9375);
    expect(farm.creosotePerMinute).toBeCloseTo(2500);
  });

  test("топливо для стали LV из тростника: биогаз — около 343 EU/t и 35 тростника в минуту, биодизель — около 268 EU/t", () => {
    // Посчитано вручную по рецептам из настроек: машины цепочки добавляют к 241 EU/t линии около 30 % (биогаз) и 10 % (биодизель).
    const biogas = fuelChainRun("biogas", 241);
    expect(biogas.totalEut).toBeCloseTo(343, -1);
    expect(biogas.canePerMinute).toBeCloseTo(35, -1);
    expect(biogas.stages.map((stage) => stage.id)).toEqual(["compressor", "macerator", "centrifuge", "brewery", "fermenter", "distillery"]);
    // Биогаз: 1800 л из 1000 л сброженной биомассы — дистилляторов почти столько же, сколько ферментеров.
    expect(biogas.fuelPerSecond).toBeCloseTo((biogas.totalEut * 20) / (40 * 0.95), 6);
    const biodiesel = fuelChainRun("biodiesel", 241);
    expect(biodiesel.totalEut).toBeCloseTo(268, -1);
    expect(biodiesel.seedsPerMinute).toBeCloseTo(106, -1);
  });

  test("сталь на коксе: слиток за 4 минуты, одной коксовой печи хватает", () => {
    const run = steamSteelRun();
    expect(run.perMinute).toBeCloseTo(0.25);
    expect(run.ovenCokePerMinute).toBeGreaterThanOrEqual(run.cokePerMinute);
  });
});
