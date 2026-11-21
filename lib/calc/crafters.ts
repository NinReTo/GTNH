import { CALC } from "../config";
import { MACHINES, type Machine } from "../machines";
import { SINGLES, type Single } from "../singles";
import { TIERS, type TierId } from "../tiers";
import type { Recipe } from "./repository";
import { machines as vendorMachines, singleBlockMachine } from "./vendor/machines";
import type { Recipe as VendorRecipe } from "./vendor/repository";

/**
 * Какая машина ведёт рецепт на выбранном ярусе. В выгрузке у типа рецепта один список машин: одноблочные
 * («Basic Macerator», «Advanced Macerator II»), паровые и постройки вперемешку. Одноблочные GregTech узнаём по
 * машине «Basic …» в списке: они есть на каждом ярусе. Постройку ищем по имени в каталоге сайта — у неё там есть ярус,
 * с которого её можно собрать, и трёхмерная схема. Постройки, которых на сайте нет, не берём: про них неизвестно,
 * когда они доступны, и нарисовать их нечем. Паровые машины с LV не берём: пара калькулятор пока не считает.
 */

export type CrafterKind = "single" | "multi" | "hand" | "vanilla";

export interface Crafter {
  readonly kind: CrafterKind;
  /** Имя для подписи: «Macerator LV», «Electric Blast Furnace», «Crafting (Shaped)». */
  readonly label: string;
  /** Постройка из каталога сайта (схема для 3D). */
  readonly machine?: Machine;
  /** Одноблочная машина сайта, если она там есть на этом ярусе. */
  readonly single?: Single;
  /** Имя одноблочной машины без «Basic»: «Macerator». */
  readonly baseName?: string;
}

const SINGLE_PREFIX = "Basic ";
const HAND_TYPES = new Set<string>(CALC.handTypes);
const PRIMITIVE = new Set<string>(CALC.primitiveMachines);
/** Модуль постройки конца игры доступен с яруса своей постройки из каталога. */
const isModuleOpen = (name: string, tier: number): boolean => {
  const parent = byName.get(CALC.endgameMultis[name] ?? "");
  return parent !== undefined && dataTier(parent.tier) <= tier;
};
/** Ярус выгрузки по ярусу сайта: пар — −1, LV — 0. */
const dataTier = (tier: TierId): number => TIERS.findIndex((candidate) => candidate.id === tier) - 1;
const byName = new Map(MACHINES.map((machine) => [machine.name, machine]));
/** Паровые и кирпичные машины (без каталога сайта их ярус и пар не посчитать) и реакторы (это топливо, а не цех) — не берём. */
const STEAM = /steam|high pressure|bricked|coke oven|primitive|reactor/i;

/** Одноблочная машина сайта с этим именем на этом ярусе (сайт знает LV–HV и часть высших). */
function siteSingle(baseName: string, tier: number): Single | undefined {
  const tierId = TIERS[tier + 1]?.id;
  return SINGLES.find((single) => single.name === baseName && single.tier === tierId);
}

/**
 * Машина для рецепта на ярусе tier (0 — LV) или undefined, если в эту эру его вести нечем.
 * vendor — тот же рецепт в разборе ShadowTheAge: по нему правила машин исключают рецепты (сжатие, сборщики космоса).
 */
export function crafterFor(recipe: Recipe, tier: number, vendor: () => VendorRecipe): Crafter | undefined {
  if (HAND_TYPES.has(recipe.type)) return { kind: "hand", label: recipe.type };
  const names = recipe.multiblocks;
  const basic = names.find((name) => name.startsWith(SINGLE_PREFIX));
  // Правила исключений ShadowTheAge читают данные GregTech рецепта — у рецептов без них (печь Minecraft) их не зовём.
  const excludes = (rule: ((recipe: VendorRecipe) => boolean) | undefined): boolean => recipe.isGt && rule !== undefined && rule(vendor());
  if (basic && !excludes(singleBlockMachine.excludesRecipe)) {
    const baseName = basic.slice(SINGLE_PREFIX.length);
    return { kind: "single", label: `${baseName} ${CALC.tierNames[tier]}`, baseName, single: siteSingle(baseName, tier) };
  }
  const hasFluid = recipe.inputs.some((input) => input.kind === "fluid");
  const fits = (machine: Machine): boolean => {
    if (dataTier(machine.tier) > tier) return false;
    if (tier >= 0 && machine.tier === "steam" && !PRIMITIVE.has(machine.name)) return false;
    // Коксовая печь и кирпичная домна — без люков и без энергии: рецепты с жидкостями или с EU/t не для них.
    if (PRIMITIVE.has(machine.name) && (hasFluid || recipe.voltage > 0)) return false;
    return !excludes(vendorMachines[machine.name]?.excludesRecipe);
  };
  // Постройки из каталога, доступные на ярусе: берём самую раннюю — её проще собрать.
  const available = names
    .map((name) => byName.get(name))
    .filter((machine): machine is Machine => machine !== undefined && fits(machine))
    .sort((a, b) => dataTier(a.tier) - dataTier(b.tier));
  if (available.length > 0) return { kind: "multi", label: available[0].name, machine: available[0] };
  // Постройка, которой нет в каталоге сайта: ярус её сборки неизвестен, поэтому доступность — по ярусу самого рецепта
  // (fitsTier в planner.ts), а в 3D она стоит блоком корпуса с подписью. Паровые и кирпичные — только из каталога.
  // shortcut: постройка может собираться позже, чем ярус её рецепта; точнее — завести её в каталог сайта.
  // Берём только постройки из правил машин ShadowTheAge (там нет котла, генераторов и реакторов) и только рецепты не выше
  // яруса — без надбавки за ток, как у построек каталога.
  const isKnown = (name: string): boolean => (vendorMachines[name] !== undefined && !excludes(vendorMachines[name].excludesRecipe)) || isModuleOpen(name, tier);
  const unlisted = names.find((name) => !byName.has(name) && !STEAM.test(name) && isKnown(name));
  if (unlisted && recipe.isGt && recipe.tier <= tier) return { kind: "multi", label: unlisted };
  // Печь Minecraft: в GregTech её рецепты ведёт электропечь (одноблочная «Basic Electric Furnace» уже выше).
  if (!recipe.isGt && names.length > 0 && !hasFluid && recipe.type === CALC.furnace.type) return { kind: "vanilla", label: names[0] };
  return undefined;
}
