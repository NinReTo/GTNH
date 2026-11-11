import { GAME } from "./config";

/** Нагрев катушки по её номеру в моде: 1 + 900 × номер (HeatingCoilLevel.getHeat). */
export function coilHeat(ordinal: number): number {
  if (ordinal <= 0) return 0;
  return GAME.coilHeatBase + GAME.coilHeatStep * ordinal;
}

/** Надбавка за напряжение: +100 K за каждый ярус выше MV. */
export function voltageHeatBonus(voltageTier: number): number {
  return GAME.heatPerVoltageTier * Math.max(0, voltageTier - GAME.heatBonusBaseTier);
}

/** Нагрев печи: катушки плюс надбавка за ярус напряжения (MTEElectricBlastFurnace.checkMachine). */
export function heatCapacity(coilOrdinal: number, voltageTier: number): number {
  return coilHeat(coilOrdinal) + voltageHeatBonus(voltageTier);
}

export interface HeatBonuses {
  /** Хватает ли нагрева на рецепт. */
  readonly canRun: boolean;
  /** Сколько раз применяется скидка −5 % на энергию. */
  readonly discounts: number;
  /** Сколько разгонов становятся идеальными. */
  readonly perfectOverclocks: number;
  /** Итоговый множитель расхода энергии от скидок. */
  readonly energyFactor: number;
}

/** Что даёт запас нагрева над рецептом (OverclockCalculator: пороги 900 K и 1800 K). */
export function heatBonuses(capacity: number, recipeHeat: number): HeatBonuses {
  const surplus = capacity - recipeHeat;
  if (surplus < 0) return { canRun: false, discounts: 0, perfectOverclocks: 0, energyFactor: 1 };
  const discounts = Math.floor(surplus / GAME.heatDiscountThreshold);
  return {
    canRun: true,
    discounts,
    perfectOverclocks: Math.floor(surplus / GAME.heatOverclockThreshold),
    energyFactor: GAME.heatDiscountFactor ** discounts,
  };
}
