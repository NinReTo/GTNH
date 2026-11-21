import type { Index, Option } from "./planner";
import { CALC } from "../config";
import { isRawOre } from "./raw";
import type { Goods, RecipeIo } from "./repository";

const stackKey = ({ goods, kind, amount, probability }: RecipeIo) => [kind, amount, probability, ...goods];

const FORM = {
  tinyDust: ["Крошечная кучка пыли", "Tiny pile of dust"],
  smallDust: ["Маленькая кучка пыли", "Small pile of dust"],
  dust: ["Пыль", "Dust"],
  impureDust: ["Неочищенная кучка пыли", "Impure dust"],
  purifiedDust: ["Очищенная кучка пыли", "Purified dust"],
  crushed: ["Измельчённая руда", "Crushed ore"],
  purified: ["Очищенная руда", "Purified ore"],
  centrifuged: ["Центрифугированная руда", "Centrifuged ore"],
} as const;

/** Первые восемь форм из таблицы MetaGeneratedItem01 в GregTech. */
const GT_FORMS = [FORM.tinyDust, FORM.smallDust, FORM.dust, FORM.impureDust, FORM.purifiedDust, FORM.crushed, FORM.purified, FORM.centrifuged] as const;

/** Порядок от точных названий формы к общим нужен для пыли и обработанной руды. */
const FORMS = [
  [/^Centrifuged .+ (?:Ore|Crystals)$|^Thermally Centrifuged .+$/i, FORM.centrifuged],
  [/^Purified .+ (?:Ore|Crystals)$/i, FORM.purified],
  [/^(?:Crushed|Ground) .+ (?:Ore|Crystals)$| Crushed Ore$/i, FORM.crushed],
  [/^Raw .+ Ore$/i, ["Необработанная руда", "Raw ore"]],
  [/^Small .+ Ore$/i, ["Маленькая руда", "Small ore"]],
  [/^Impure (?:Pile of )?.+ (?:Dust|Powder)$/i, FORM.impureDust],
  [/^(?:Pure|Purified) (?:Pile of )?.+ (?:Dust|Powder)$/i, FORM.purifiedDust],
  [/^Tiny Pile of .+ (?:Dust|Powder)$/i, FORM.tinyDust],
  [/^Small Pile of .+ (?:Dust|Powder)$/i, FORM.smallDust],
  [/ (?:Dust|Powder)$/i, FORM.dust],
  [/^Raw .+ Chunk$| Ore (?:Chunk|Piece)$/i, ["Кусок руды", "Ore piece"]],
] as const;

export function ingredientForm(goods: Goods): readonly [string, string] | undefined {
  if (goods.kind !== "item") return undefined;
  if (goods.mod === "gregtech" && goods.internalName === "gt.blockores2") {
    const stone = Math.floor(goods.damage / CALC.gtMaterialIdsPerForm);
    // В первой таблице пород GregTech индексы 1 и 2 — адский камень и камень Края.
    if (stone === 1 || stone === 2) return ["Руда (Ад / Энд)", "Ore (Nether / End)"];
  }
  const encoded = goods.mod === "gregtech" && goods.internalName === "gt.metaitem.01"
    ? GT_FORMS[Math.floor(goods.damage / CALC.gtMaterialIdsPerForm)] : undefined;
  const form = encoded ?? FORMS.find(([pattern]) => pattern.test(goods.name))?.[1];
  if (form) return form;
  if (isRawOre(goods) || / Ore$/i.test(goods.name)) return ["Руда", "Ore"];
}

/** Объединяет рецепты с одинаковой формой ингредиентов и одинаковым результатом. */
export function groupOreOptions(index: Index, options: readonly Option[]): readonly (readonly Option[])[] {
  const groups = new Map<string, Option[]>();
  for (const option of options) {
    const { crafter, recipe, inputs } = option.choice;
    const forms = inputs.map((ptr) => ingredientForm(index.repository.goods(ptr)));
    const key = forms.some(Boolean) ? JSON.stringify([
      crafter.kind, crafter.label, crafter.machine?.slug, crafter.single?.slug,
      recipe.type, recipe.tier, recipe.voltage, recipe.amperage, recipe.ticks, recipe.heat,
      recipe.inputs.map((io, slot) => [io.kind, io.amount, forms[slot]?.[1] ?? inputs[slot]]),
      recipe.catalysts.map(stackKey),
      recipe.outputs.map(stackKey).sort(),
    ]) : String(recipe.ptr);
    const group = groups.get(key);
    if (group) group.push(option);
    else groups.set(key, [option]);
  }
  return [...groups.values()];
}
