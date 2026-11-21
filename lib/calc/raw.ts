import { ADDON_ORE_TIERS, ORE_TIERS } from "./ore-tiers";
import { ADDON_ORES, GT_ORE_IDS } from "./ores";
import type { Goods } from "./repository";

/**
 * Сырьё — то, что добывают в мире, а не делают: руды GregTech, дерево, растения, блоки мира, добыча с мобов,
 * жидкости из насоса и буровой. От него калькулятор считает, сколько шагов нужно до каждого предмета.
 * Всё прочее без рецепта (добыча из сундуков, творческие предметы) сырьём не считается — иначе сталь «получилась бы»
 * из найденной наковальни.
 */
const RAW_FLUIDS = new Set(["Water", "Lava", "Oil", "Light Oil", "Heavy Oil", "Raw Oil", "Natural Gas", "Salt Water", "Air"]);
const VANILLA_ORES = new Set(["Coal Ore", "Iron Ore", "Gold Ore", "Diamond Ore", "Emerald Ore", "Redstone Ore", "Lapis Lazuli Ore", "Nether Quartz Ore"]);

const RAW_VANILLA = new Set([
  // Блоки мира.
  "Cobblestone", "Stone", "Dirt", "Sand", "Gravel", "Clay", "Netherrack", "Soul Sand", "End Stone", "Obsidian", "Ice", "Snowball", "Flint",
  // Дерево и растения: растут сами, их выращивают фермами.
  "Oak Wood", "Spruce Wood", "Birch Wood", "Jungle Wood", "Acacia Wood", "Dark Oak Wood", "Oak Sapling", "Sugar Canes", "Cactus",
  "Seeds", "Wheat", "Carrot", "Potato", "Pumpkin", "Melon", "Apple", "Cocoa Beans", "Vines", "Lily Pad", "Red Mushroom", "Brown Mushroom",
  // Добыча с мобов и животных.
  "Bone", "String", "Feather", "Leather", "Rotten Flesh", "Gunpowder", "Spider Eye", "Slimeball", "Ender Pearl", "Blaze Rod", "Ghast Tear",
  "Egg", "Raw Beef", "Raw Porkchop", "Raw Chicken", "Raw Fish", "Ink Sac", "Glowstone Dust",
]);

/** Номер блока руды GregTech: тысячи — порода, остаток — материал. */
const STONE_STEP = 1000;

export function isRawOre(goods: Goods): boolean {
  if (goods.kind !== "item") return false;
  // Руды GregTech: блоки gt.blockores2…7, номер — порода и материал; годятся материалы из рудных жил (lib/calc/ores.ts).
  if (goods.mod === "gregtech" && goods.internalName.startsWith("gt.blockores")) return GT_ORE_IDS.has(goods.damage % STONE_STEP);
  // Руды дополнений GregTech (bartworks, GT++) — из тех же жил, по названию.
  if (goods.mod === "bartworks" || goods.mod === "miscutils") return ADDON_ORES.has(goods.name);
  return goods.mod === "minecraft" && VANILLA_ORES.has(goods.name);
}

export function isRaw(goods: Goods): boolean {
  if (goods.kind === "fluid") return RAW_FLUIDS.has(goods.name);
  return isRawOre(goods) || (goods.mod === "minecraft" && RAW_VANILLA.has(goods.name));
}

/**
 * С какого яруса калькулятора (0 — LV) сырьё можно добыть: руда GregTech — по измерениям её жил (lib/calc/ore-tiers.ts:
 * руда адской звезды лежит только на дальних планетах — до UV её нет); всё прочее — с самого начала.
 * Для руд дополнений нужен подтверждённый ярус жилы.
 */
export function rawTier(goods: Goods): number {
  if (goods.mod === "gregtech" && goods.internalName.startsWith("gt.blockores")) return ORE_TIERS[goods.damage % STONE_STEP] ?? Infinity;
  if ((goods.mod === "bartworks" || goods.mod === "miscutils") && ADDON_ORES.has(goods.name)) {
    return ADDON_ORE_TIERS[goods.name] ?? Infinity;
  }
  return 0;
}
