"use client";

import { useState } from "react";
import { formatNumber } from "@/components/landing/ui";
import { choiceOf, type Choice, type Choices, type Index, type Reach } from "@/lib/calc/planner";
import { CALC } from "@/lib/config";
import { Icon } from "./Icon";
import { RecipePicker } from "./RecipePicker";

const { secondsPerMinute, treeOpenDepth } = CALC.ui;

/** Сколько в минуту: целые — без дробей, меньше единицы — с двумя знаками, чтобы 0,06 не превращалось в 0. */
const rateText = (value: number): string => formatNumber(value, value < 1 ? [0, 0].length : 0);

export interface TreeProps {
  readonly index: Index;
  readonly reached: Reach;
  readonly choices: Choices;
  /** Свой рецепт для товара. */
  readonly onPick: (goods: number, choice: Choice) => void;
  /** «Есть у меня» — включить или выключить. */
  readonly onGiven: (goods: number) => void;
}

interface NodeProps extends TreeProps {
  readonly goods: number;
  readonly perSecond: number;
  readonly depth: number;
  /** Товары выше по ветке — чтобы рецепт, выбранный по кругу, не раскрывался бесконечно. */
  readonly trail: readonly number[];
}

function Node(props: NodeProps) {
  const { index, reached, choices, onPick, onGiven, goods, perSecond, depth, trail } = props;
  const [isOpen, setOpen] = useState(depth < treeOpenDepth);
  const item = index.repository.goods(goods);
  const isRaw = index.raw.has(goods);
  const isGiven = choices.given.has(goods);
  const isLoop = trail.includes(goods);
  const choice = isLoop ? undefined : choiceOf(index, reached, choices, goods);
  const output = choice?.recipe.outputs.find((entry) => entry.goods[0] === goods);
  const runs = choice ? perSecond / ((output?.amount ?? 1) * (output?.probability ?? 1)) : 0;
  const unit = item.kind === "fluid" ? "л/мин" : "шт/мин";

  return (
    <li>
      <div className="flex flex-wrap items-center gap-2 py-1">
        <button
          type="button"
          aria-expanded={choice ? isOpen : undefined}
          aria-label={isOpen ? "Свернуть" : "Раскрыть"}
          disabled={!choice}
          className="w-5 font-mono text-text3 hover:text-accent disabled:invisible"
          onClick={() => setOpen(!isOpen)}
        >
          {isOpen ? "▾" : "▸"}
        </button>
        <Icon goods={item} />
        <span className="text-text1">{item.name}</span>
        <span className="font-mono text-xs text-text3">
          {rateText(perSecond * secondsPerMinute)} {unit}
        </span>
        {isRaw && <span className="font-mono text-xs text-text3">сырьё</span>}
        {isLoop && <span className="font-mono text-xs text-text3">по кругу — берётся со стороны</span>}
        {!isRaw && !isGiven && !isLoop && !choice && <span className="text-xs text-red-400">на ярусе не достать</span>}
        {choice && <RecipePicker index={index} reached={reached} goods={goods} choice={choice} onPick={(picked) => onPick(goods, picked)} />}
        {!isRaw && depth > 0 && (
          <label className="flex items-center gap-1 text-xs text-text2">
            <input type="checkbox" checked={isGiven} onChange={() => onGiven(goods)} />
            есть у меня
          </label>
        )}
      </div>
      {choice && isOpen && (
        <ul className="ml-2 border-l border-line pl-4">
          {choice.recipe.inputs.map((input, slot) => (
            <Node
              key={`${slot}-${choice.inputs[slot]}`}
              {...props}
              goods={choice.inputs[slot]}
              perSecond={runs * input.amount}
              depth={depth + 1}
              trail={[...trail, goods]}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * Ветка крафта: цель, под ней входы её рецепта и так до сырья. У раскрытого товара можно выбрать другой рецепт или
 * отметить «есть у меня» — тогда он не делается, а приходит в фабрику готовым.
 * shortcut: числа в ветке — без учёта побочных продуктов других шагов (таблица ниже их учитывает); хватает для выбора.
 */
export function CraftTree(props: TreeProps & { readonly target: number; readonly perSecond: number }) {
  return (
    <ul className="mt-4 text-sm">
      <Node {...props} goods={props.target} perSecond={props.perSecond} depth={0} trail={[]} />
    </ul>
  );
}
