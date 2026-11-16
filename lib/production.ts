import { GAME, PRODUCTION } from "./config";
import { coilHeat, heatBonuses, voltageHeatBonus } from "./heat";

/** Рецепт: энергия за тик, время в тиках, сколько слитков даёт, нужный нагрев (0 — без нагрева). */
export interface Recipe {
  readonly eut: number;
  readonly ticks: number;
  readonly out: number;
  readonly heat?: number;
}

/** Постройка: сколько рецептов разом, множители времени и энергии, прибавка нагрева за напряжение. */
export interface MachineBonus {
  readonly parallel: number;
  readonly speed: number;
  readonly eu: number;
  readonly voltageHeat: boolean;
}

/** Чем постройку питают: напряжение одного ампера, сколько ампер, номер яруса (LV — 1) и нагрев катушек. */
export interface Power {
  readonly voltage: number;
  readonly amps: number;
  readonly tier: number;
  readonly coilHeat?: number;
}

export interface Run {
  /** Сколько EU/t постройка тянет, пока работает. */
  readonly eut: number;
  /** Сколько тиков идёт один цикл. */
  readonly ticks: number;
  /** Сколько рецептов разом. */
  readonly parallel: number;
  readonly overclocks: number;
  readonly perfectOverclocks: number;
  /** Слитков в минуту, если постройка работает без остановки. */
  readonly perMinute: number;
}

const TICKS_PER_MINUTE = PRODUCTION.ticksPerSecond * PRODUCTION.secondsPerMinute;

/**
 * Как быстро постройка ведёт рецепт (упрощённо по OverclockCalculator мода): сначала столько рецептов разом,
 * сколько позволяет ток всех люков, потом разгоны, пока вчетверо большая энергия ещё влезает в ток.
 * Первые разгоны за запас нагрева — идеальные (время ÷4), остальные — ÷2. Скидка −5 % за каждые 900 K запаса.
 */
export function runRecipe(recipe: Recipe, machine: MachineBonus, power: Power): Run {
  const capacity = (power.coilHeat ?? 0) + (machine.voltageHeat ? voltageHeatBonus(power.tier) : 0);
  const bonuses = recipe.heat ? heatBonuses(capacity, recipe.heat) : { canRun: true, perfectOverclocks: 0, energyFactor: 1 };
  if (!bonuses.canRun) throw new Error(`Нагрева ${capacity} K мало для рецепта на ${recipe.heat} K`);
  const budget = power.voltage * power.amps;
  const perRecipe = recipe.eut * machine.eu * bonuses.energyFactor;
  if (perRecipe > budget) throw new Error(`Рецепту нужно ${perRecipe} EU/t, а люки дают ${budget}`);
  const parallel = Math.min(machine.parallel, Math.floor(budget / perRecipe));

  let eut = perRecipe * parallel;
  let ticks = recipe.ticks * machine.speed;
  let overclocks = 0;
  while (eut * PRODUCTION.overclockPower <= budget && ticks > 1) {
    eut *= PRODUCTION.overclockPower;
    ticks /= overclocks < bonuses.perfectOverclocks ? PRODUCTION.perfectOverclockSpeed : PRODUCTION.overclockSpeed;
    overclocks += 1;
  }
  const wholeTicks = Math.max(1, Math.floor(ticks));
  return {
    eut: Math.round(eut),
    ticks: wholeTicks,
    parallel,
    overclocks,
    perfectOverclocks: Math.min(overclocks, bonuses.perfectOverclocks),
    perMinute: (parallel * recipe.out * TICKS_PER_MINUTE) / wholeTicks,
  };
}

/** Самая слабая катушка из списка сайта, которой хватает на рецепт. */
export function coilFor(heat: number): (typeof GAME.coils)[number] | undefined {
  return GAME.coils.find((coil) => coilHeat(coil.ordinal) >= heat);
}

/** Сколько генераторов по одному амперу нужно на среднее потребление и какой толщины кабель их тянет. */
export function powerSupply(averageEut: number, voltage: number, cableAmps: number): { readonly generators: number; readonly cableSize: number } {
  const generators = Math.max(1, Math.ceil(averageEut / voltage));
  const cableSize = PRODUCTION.cableSizes.find((size) => size * cableAmps >= generators) ?? PRODUCTION.cableSizes[PRODUCTION.cableSizes.length - 1];
  return { generators, cableSize };
}

/** Бронза в паровой плавильне: слитков в минуту и пара в секунду. */
export function bronzeRun(): { readonly perMinute: number; readonly steamPerSecond: number; readonly boilers: number; readonly ticks: number } {
  const { eut, ticks, out, parallel, euFactor, durationFactor, steamPerEu } = PRODUCTION.bronze;
  const cycle = Math.floor(ticks * durationFactor);
  const steamPerSecond = eut * euFactor * parallel * steamPerEu * PRODUCTION.ticksPerSecond;
  return {
    perMinute: (out * parallel * TICKS_PER_MINUTE) / cycle,
    steamPerSecond,
    boilers: Math.ceil(steamPerSecond / PRODUCTION.boilerSteamPerSecond),
    ticks: cycle,
  };
}

/**
 * Вода для котлов от одной паровой помпы. Помпа сама тратит пар, а этот пар тоже варят котлы из воды:
 * вода = пар линии / (160 − пар помпы на литр её воды). Помпа работает только часть времени (busy).
 */
export function steamWater(lineSteam: number): { readonly water: number; readonly pumpWater: number; readonly pumpSteam: number; readonly busy: number } {
  const { waterPerSecond, steamPerSecond, frameTier, humidity, minWater } = PRODUCTION.waterPump;
  const pumpWater = Math.max(minWater, Math.floor(humidity * waterPerSecond * frameTier));
  const water = lineSteam / (PRODUCTION.steamPerWater - steamPerSecond / pumpWater);
  const busy = water / pumpWater;
  // shortcut: линия рассчитана на одну помпу; если воды надо больше, чем она даёт, — ставить вторую.
  if (busy > 1) throw new Error(`Одной помпы мало: нужно ${water} л/с воды, она даёт ${pumpWater}`);
  return { water, pumpWater, pumpSteam: steamPerSecond * busy, busy };
}

/**
 * Что нужно электрической печи стали сверх неё самой: одна дробилка на слитки и уголь, электролизёры на кислород,
 * вода для них. perMinute — слитков стали в минуту.
 */
export function steelPrepRun(perMinute: number): {
  readonly maceratorBusy: number;
  readonly electrolyzers: number;
  readonly averageEut: number;
  readonly waterPerSecond: number;
  readonly pumpPerSecond: number;
  readonly stackMinutes: number;
} {
  const prep = PRODUCTION.steelPrep;
  const perTick = perMinute / TICKS_PER_MINUTE;
  const maceratorBusy = perTick * (prep.ingotTicks + prep.coalTicks);
  // Сколько электролизёров работают без остановки: кислорода на слиток ÷ кислород за цикл × длину цикла.
  const electrolyzerLoad = (perTick * prep.oxygenPerSteel * prep.electrolyzerTicks) / prep.oxygenPerRun;
  const electrolyzers = Math.ceil(electrolyzerLoad);
  if (maceratorBusy > 1) throw new Error(`Одной дробилки мало: занята на ${maceratorBusy}`);
  return {
    maceratorBusy,
    electrolyzers,
    averageEut: maceratorBusy * prep.maceratorEut + electrolyzerLoad * prep.electrolyzerEut,
    waterPerSecond: (perMinute * prep.oxygenPerSteel) / PRODUCTION.secondsPerMinute,
    pumpPerSecond: (prep.litresPerBlock * PRODUCTION.ticksPerSecond) / prep.pumpTicksPerBlock,
    // Стопки пустых капсул в электролизёре хватает на столько минут.
    stackMinutes: ((prep.stack / prep.cellsPerRun) * prep.electrolyzerTicks) / TICKS_PER_MINUTE,
  };
}

/**
 * Ферма кирпичных домн на коксе, которая догоняет perMinute слитков в минуту: домн — по скорости одной домны,
 * коксовых печей — по коксу для всех домн (а не по печи на домну), сколько угля, железа и креозота в минуту
 * и на сколько хватает полного сундука железа у домны и угля у печей.
 */
export function bbfFarmRun(perMinute: number): {
  readonly furnaces: number;
  readonly ovens: number;
  readonly steelPerMinute: number;
  readonly cokePerMinute: number;
  readonly coalPerMinute: number;
  readonly ovenBusy: number;
  readonly creosotePerMinute: number;
  readonly ovenTankMinutes: number;
  readonly ironChestMinutes: number;
  readonly coalChestMinutes: number;
} {
  const one = steamSteelRun();
  const { cokePerSteel, chestSlots, stack } = PRODUCTION.bbf;
  const { cokePerCoal, creosotePerCoal, tank } = PRODUCTION.cokeOven;
  const furnaces = Math.ceil(perMinute / one.perMinute);
  const steelPerMinute = furnaces * one.perMinute;
  const cokePerMinute = steelPerMinute * cokePerSteel;
  const ovens = Math.ceil(cokePerMinute / one.ovenCokePerMinute);
  const coalPerMinute = cokePerMinute / cokePerCoal;
  const chest = chestSlots * stack;
  return {
    furnaces,
    ovens,
    steelPerMinute,
    cokePerMinute,
    coalPerMinute,
    ovenBusy: cokePerMinute / (ovens * one.ovenCokePerMinute),
    creosotePerMinute: coalPerMinute * creosotePerCoal,
    // Без слива креозота печь встанет, когда наполнится её ёмкость.
    ovenTankMinutes: tank / ((coalPerMinute / ovens) * creosotePerCoal),
    // Полный сундук железа у каждой домны и общий сундук угля у печей — на столько минут.
    ironChestMinutes: chest / one.perMinute,
    coalChestMinutes: chest / coalPerMinute,
  };
}

/** Шаг топливной цепочки: какая машина, сколько её нужно и насколько она занята в среднем. */
export interface FuelStage {
  readonly id: "compressor" | "macerator" | "centrifuge" | "brewery" | "fermenter" | "distillery" | "extractor" | "canner" | "reactor";
  readonly machines: number;
  /** Сумма долей занятости всех машин шага: 2,5 — значит, две с половиной машины работают без остановки. */
  readonly load: number;
}

export interface FuelChainRun {
  /** Сколько EU/t должны дать генераторы: линия плюс машины самой цепочки. */
  readonly totalEut: number;
  /** Литров топлива в секунду. */
  readonly fuelPerSecond: number;
  readonly stages: readonly FuelStage[];
  readonly waterPerSecond: number;
  /** Сахарного тростника в минуту: из него через растительные комки делают биомякину. */
  readonly canePerMinute: number;
  readonly biochaffPerMinute: number;
  /** Семян пшеницы в минуту (только биодизель). */
  readonly seedsPerMinute: number;
  /** Капсул этанола (и щепотей едкого натра) в минуту — только биодизель. */
  readonly cellsPerMinute: number;
}

/**
 * Топливо для генераторов LV из сахарного тростника: биогаз для газовой турбины или биодизель (масло семян + этанол)
 * для дизельного генератора. Тростник растёт сам; из него — растительные комки, масса, биомякина, биомасса, сброженная
 * биомасса и в дистилляторе биогаз (выгоднее метана: 1800 л по 40 EU против 600 л по 104 EU) или этанол.
 * Машины цепочки тоже берут энергию от тех же генераторов, поэтому расход считается по кругу, пока не сойдётся.
 */
export function fuelChainRun(fuel: "biogas" | "biodiesel", baseEut: number): FuelChainRun {
  const c = PRODUCTION.fuelChain;
  const perSecond = (amount: number, ticks: number) => (amount * PRODUCTION.ticksPerSecond) / ticks;
  const solve = (total: number) => {
    const value = fuel === "biogas" ? c.biogasValue : c.biodieselValue;
    const fuelPerSecond = (total * PRODUCTION.ticksPerSecond) / (value * c.efficiency);
    // Этанол на биодизель: одна капсула (1000 л) на 6000 л масла.
    const ethanol = fuel === "biodiesel" ? (fuelPerSecond * c.canner.litres) / c.reactor.litres : 0;
    const distilled = fuel === "biogas" ? fuelPerSecond : ethanol;
    const distilleryOut = fuel === "biogas" ? c.distillery.biogas : c.distillery.ethanol;
    const distilleryTicks = fuel === "biogas" ? c.distillery.biogasTicks : c.distillery.ticks;
    const fermented = (distilled * c.distillery.litres) / distilleryOut;
    // Биомякина: одна на 1000 л биомассы; на неё — одна масса, на 2,75 массы — 2 комка, на комок — 8 тростника.
    const biochaff = fermented / c.brewery.litres;
    const balls = (biochaff * c.macerator.balls) / c.macerator.plantmass;
    const loads: [FuelStage["id"], number][] = [
      ["compressor", balls / perSecond(1, c.compressor.ticks)],
      ["macerator", balls / perSecond(c.macerator.balls, c.macerator.ticks)],
      ["centrifuge", biochaff / perSecond(1, c.centrifuge.ticks)],
      ["brewery", fermented / perSecond(c.brewery.litres, c.brewery.ticks)],
      ["fermenter", fermented / perSecond(c.fermenter.litres, c.fermenter.ticks)],
      ["distillery", distilled / perSecond(distilleryOut, distilleryTicks)],
      ...(fuel === "biodiesel"
        ? ([
            ["canner", ethanol / perSecond(c.canner.litres, c.canner.ticks)],
            ["extractor", fuelPerSecond / perSecond(c.extractor.litres, c.extractor.ticks)],
            ["reactor", fuelPerSecond / perSecond(c.reactor.litres, c.reactor.ticks)],
          ] as [FuelStage["id"], number][])
        : []),
    ];
    const chainEut = loads.reduce((sum, [id, load]) => sum + load * c[id].eut, 0);
    return { fuelPerSecond, ethanol, fermented, biochaff, balls, loads, chainEut };
  };
  // Расход машин цепочки — доля от линии, поэтому круг сходится за несколько десятков шагов.
  let total = baseEut;
  for (let step = 0; step < PRODUCTION.secondsPerMinute; step += 1) total = baseEut + solve(total).chainEut;
  const run = solve(total);
  return {
    totalEut: total,
    fuelPerSecond: run.fuelPerSecond,
    stages: run.loads.map(([id, load]) => ({ id, load, machines: Math.max(1, Math.ceil(load)) })),
    waterPerSecond: run.fermented,
    canePerMinute: run.balls * c.compressor.cane * PRODUCTION.secondsPerMinute,
    biochaffPerMinute: run.biochaff * PRODUCTION.secondsPerMinute,
    seedsPerMinute: fuel === "biodiesel" ? (run.fuelPerSecond / c.extractor.litres) * PRODUCTION.secondsPerMinute : 0,
    cellsPerMinute: fuel === "biodiesel" ? (run.ethanol / c.canner.litres) * PRODUCTION.secondsPerMinute : 0,
  };
}

/** Сталь в кирпичной домне на коксе: слитков в минуту и хватает ли одной коксовой печи. */
export function steamSteelRun(): { readonly perMinute: number; readonly cokePerMinute: number; readonly ovenCokePerMinute: number } {
  const perMinute = TICKS_PER_MINUTE / PRODUCTION.bbf.ticks;
  return {
    perMinute,
    cokePerMinute: perMinute * PRODUCTION.bbf.cokePerSteel,
    ovenCokePerMinute: (PRODUCTION.cokeOven.cokePerCoal * TICKS_PER_MINUTE) / PRODUCTION.cokeOven.ticks,
  };
}
