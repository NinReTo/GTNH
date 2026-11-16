// Часть RecipeModel и расчёт скорости машины из калькулятора ShadowTheAge (page.ts и PreProcessRecipe в solver.ts,
// https://github.com/ShadowTheAge/gtnh, ветка 2.9; MIT License, Copyright (c) 2025 ShadowTheAge, текст — в LICENSE рядом).
// Здесь — только то, что нужно правилам машин (machines.ts), без страницы и без решателя.
import { GetParameter, machines, notImplementedMachine, singleBlockMachine, type Choice, type Machine } from "./machines";
import { RecipeIoType, type Item, type Recipe, type RecipeInOut } from "./repository";
import { voltageTier } from "./utils";

export type OverclockResult = {
  overclockSpeed: number;
  overclockPower: number;
  perfectOverclocks?: number;
  overclockName?: string;
};

export class RecipeModel {
  recipe?: Recipe;
  voltageTier = 0;
  choices: { [key: string]: number } = {};
  overclockFactor = 1;
  powerFactor = 1;
  parallels = 0;
  overclockName: string | undefined;
  overclockTiers = 0;
  machineInfo: Machine = singleBlockMachine;
  multiblockCrafter: Item | null = null;
  recipeItems: RecipeInOut[] = [];

  ValidateChoices(machineInfo: Machine, recipe: RecipeModel): void {
    if (!machineInfo.choices) {
      this.choices = {};
      return;
    }
    const validated: { [key: string]: number } = {};
    for (const [key, choice] of Object.entries(machineInfo.choices)) {
      const typed = choice as Choice;
      const min = typed.min ?? 0;
      const max = typed.choices ? typed.choices.length - 1 : (typed.max ?? Number.POSITIVE_INFINITY);
      validated[key] = Math.min(Math.max(this.choices[key] ?? min, min), max);
    }
    if (machineInfo.enforceChoiceConstraints) machineInfo.enforceChoiceConstraints(recipe, validated);
    this.choices = validated;
  }

  getInputCount(): number {
    return this.recipeItems.filter((entry) => [RecipeIoType.FluidInput, RecipeIoType.ItemInput, RecipeIoType.OreDictInput].includes(entry.type)).length;
  }

  getOutputCount(): number {
    return this.recipeItems.length - this.getInputCount();
  }

  getItemInputCount(): number {
    return this.recipeItems.filter((entry) => [RecipeIoType.ItemInput, RecipeIoType.OreDictInput].includes(entry.type)).length;
  }
}

export interface MachineRun {
  /** Во сколько раз быстрее рецепта по выгрузке (разгон, скорость постройки, параллели). */
  readonly speedFactor: number;
  /** Множитель энергии к рецепту: EU/t машины = EU/t рецепта × powerFactor. */
  readonly powerFactor: number;
  readonly parallels: number;
  readonly overclockTiers: number;
  readonly overclockName: string;
  /** Правило этой машины в калькуляторе не описано — посчитано как одноблочная. */
  readonly isUnknown: boolean;
}

/**
 * Скорость и энергия рецепта в машине crafterName (null — одноблочная) на ярусе tier (0 — LV): как PreProcessRecipe
 * в решателе ShadowTheAge — параллели по току, разгоны, скорость и энергия постройки, округление тиков вниз.
 */
export function machineRun(recipe: Recipe, crafterName: string | null, tier: number, choices: { [key: string]: number } = {}): MachineRun {
  const model = new RecipeModel();
  model.recipe = recipe;
  model.voltageTier = tier;
  model.choices = { ...choices };
  model.recipeItems = recipe.items;
  const isSingleblock = crafterName === null;
  const known = crafterName === null ? singleBlockMachine : machines[crafterName];
  const machineInfo = known ?? notImplementedMachine;
  model.machineInfo = machineInfo;
  const gtRecipe = recipe.gtRecipe;
  if (!gtRecipe || gtRecipe.durationTicks <= 0) {
    return { speedFactor: 1, powerFactor: 1, parallels: 1, overclockTiers: 0, overclockName: "", isUnknown: !known };
  }
  if (machineInfo.fixedVoltageTier) model.voltageTier = GetParameter(machineInfo.fixedVoltageTier, model);
  model.ValidateChoices(machineInfo, model);
  const amperage = gtRecipe.amperage;
  const actualVoltage = voltageTier[model.voltageTier].voltage;
  const machineParallels = Math.max(1, GetParameter(machineInfo.parallels, model));
  const energyModifier = GetParameter(machineInfo.power, model);
  const maxParallels = machineInfo.ignoreParallelLimit ? machineParallels : Math.max(1, Math.floor(actualVoltage / (gtRecipe.voltage * energyModifier * amperage)));
  const parallels = Math.min(maxParallels, machineParallels);
  const tierDifference = model.voltageTier - gtRecipe.voltageTier;
  const overclockTiers = isSingleblock ? tierDifference : Math.min(tierDifference, Math.floor(Math.log2(maxParallels / parallels) / 2));
  model.overclockTiers = overclockTiers;
  const overclock = GetParameter(machineInfo.overclocker, model).calculate(model, overclockTiers);
  const speedModifier = GetParameter(machineInfo.speed, model);
  const durationForRounding = machineInfo.roundAfterParallels ? gtRecipe.durationTicks / parallels : gtRecipe.durationTicks;
  const estimated = durationForRounding / (overclock.overclockSpeed * speedModifier);
  const correction = estimated > 1 ? estimated / Math.floor(estimated) : 1;
  return {
    speedFactor: overclock.overclockSpeed * speedModifier * correction * parallels,
    powerFactor: (amperage * overclock.overclockPower * energyModifier) / speedModifier / correction,
    parallels,
    overclockTiers,
    overclockName: overclock.overclockName ?? "",
    isUnknown: !known,
  };
}
