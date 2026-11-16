import { CALC } from "../config";
import { alternatives, plan, type Choice, type Choices, type Index, type Plan, type Reach } from "./planner";

/**
 * «Меньше излишков»: подбор рецептов, при которых на выходе фабрики остаётся меньше лишнего. Перебор по очереди: для
 * каждого товара цепочки пробуем другие его рецепты и оставляем замену, если излишков стало меньше, а того, что «не
 * достать», — не больше. Так рецепт, который ест чужой побочный продукт или не даёт своего, вытесняет прежний.
 * shortcut: жадный перебор по одному товару за раз — пару замен, выгодных только вместе, он не найдёт; для этого нужен
 * линейный решатель (как у ShadowTheAge), заводить его ради одной кнопки рано.
 */

const { litresPerItem, optionsPerGoods, costLimit, passes } = CALC.optimize;

/** Излишки плана в штуках: предметы как есть, жидкость — по ведру за штуку. */
export function surplusScore(result: Plan): number {
  return result.surplus.reduce((sum, flow) => sum + flow.perSecond / (flow.goods.kind === "fluid" ? litresPerItem : 1), 0);
}

export interface OptimizeProgress {
  readonly pass: number;
  readonly done: number;
  readonly total: number;
}

export interface Optimized {
  readonly recipes: ReadonlyMap<number, Choice>;
  /** Излишки в штуках в секунду: до подбора и после. */
  readonly before: number;
  readonly after: number;
}

const yieldToBrowser = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

export async function optimizeSurplus(
  index: Index,
  reached: Reach,
  target: number,
  perSecond: number,
  choices: Choices,
  onProgress: (progress: OptimizeProgress) => void = () => {},
): Promise<Optimized> {
  let recipes = new Map(choices.recipes);
  let best = plan(index, reached, target, perSecond, { ...choices, recipes });
  const before = surplusScore(best);
  let score = before;
  for (let pass = 0; pass < passes; pass += 1) {
    let isImproved = false;
    const goodsList = [...new Set(best.steps.map((step) => step.goods))];
    for (const [done, goods] of goodsList.entries()) {
      onProgress({ pass, done, total: goodsList.length });
      await yieldToBrowser();
      const current = best.steps.find((step) => step.goods === goods)?.recipe.ptr;
      const options = alternatives(index, reached, goods);
      const cheapest = options[0]?.cost ?? 0;
      for (const option of options.slice(0, optionsPerGoods)) {
        if (option.choice.recipe.ptr === current || option.cost > cheapest * costLimit) continue;
        const trialRecipes = new Map([...recipes, [goods, option.choice]]);
        const trial = plan(index, reached, target, perSecond, { ...choices, recipes: trialRecipes });
        const trialScore = surplusScore(trial);
        if (trial.missing.length > best.missing.length || trialScore >= score - CALC.epsilon) continue;
        recipes = trialRecipes;
        best = trial;
        score = trialScore;
        isImproved = true;
      }
    }
    if (!isImproved) break;
  }
  return { recipes, before, after: score };
}
