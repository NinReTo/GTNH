import { ADDON_ORES, GT_ORE_IDS } from "./ores";
import type { Goods } from "./repository";

/**
 * Сырьё — то, что добывают в мире, а не делают: руды GregTech, дерево, растения, блоки мира, добыча с мобов,
 * жидкости из насоса и буровой. От него калькулятор считает, сколько шагов нужно до каждого предмета.
 * Всё прочее без рецепта (добыча из сундуков, творческие предметы) сырьём не считается — иначе сталь «получилась бы»
 * из найденной наковальни.
 */
const RAW_FLUIDS = new Set(["Water", "Lava", "Oil", "Light Oil", "Heavy Oil", "Raw Oil", "Natural Gas", "Salt Water", "Air"]);

const RAW_VANILLA = new Set([
  // Блоки мира.
  "Cobblestone", "Stone", "Dirt", "Sand", "Gravel", "Clay", "Netherrack", "Soul Sand", "End Stone", "Obsidian", "Ice", "Snowball", "Flint",
  // Дерево и растения: растут сами, их выращивают фермами.
  "Oak Wood", "Spruce Wood", "Birch Wood", "Jungle Wood", "Acacia Wood", "Dark Oak Wood", "Oak Sapling", "Sugar Canes", "Cactus",
  "Seeds", "Wheat", "Carrot", "Potato", "Pumpkin", "Melon", "Apple", "Cocoa Beans", "Vines", "Lily Pad", "Red Mushroom", "Brown Mushroom",
  // Руды ванили, которые не входят в руды GregTech.
  "Coal Ore", "Iron Ore", "Gold Ore", "Diamond Ore", "Emerald Ore", "Redstone Ore", "Lapis Lazuli Ore", "Nether Quartz Ore",
  // Добыча с мобов и животных.
  "Bone", "String", "Feather", "Leather", "Rotten Flesh", "Gunpowder", "Spider Eye", "Slimeball", "Ender Pearl", "Blaze Rod", "Ghast Tear",
  "Egg", "Raw Beef", "Raw Porkchop", "Raw Chicken", "Raw Fish", "Ink Sac", "Glowstone Dust",
]);

/** Номер блока руды GregTech: тысячи — порода, остаток — материал. */
const STONE_STEP = 1000;

export function isRaw(goods: Goods): boolean {
  if (goods.kind === "fluid") return RAW_FLUIDS.has(goods.name);
  // Руды GregTech: блоки gt.blockores2…7, номер — порода и материал; годятся материалы из рудных жил (lib/calc/ores.ts).
  if (goods.mod === "gregtech" && goods.internalName.startsWith("gt.blockores")) return GT_ORE_IDS.has(goods.damage % STONE_STEP);
  // Руды дополнений GregTech (bartworks, GT++) — из тех же жил, по названию.
  if (goods.mod === "bartworks" || goods.mod === "miscutils") return ADDON_ORES.has(goods.name);
  return goods.mod === "minecraft" && RAW_VANILLA.has(goods.name);
}
