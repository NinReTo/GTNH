"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatNumber } from "@/components/landing/ui";
import { alternatives, timing, type Choice, type Index, type Reach } from "@/lib/calc/planner";
import type { Goods, RecipeIo } from "@/lib/calc/repository";
import { CALC } from "@/lib/config";
import { Icon } from "./Icon";

const { percent } = CALC.ui;
const CARD = "block w-full border-b border-line px-3 py-2 text-left transition-colors hover:bg-line";

/** Значок товара с количеством в углу, как в инвентаре; у выхода с шансом — процент. Имя — во всплывающей подсказке. */
function Stack({ goods, io }: { goods: Goods; io: RecipeIo }) {
  // На значке — голое число, как в инвентаре (1000 без пробела влезает в 32 пикселя); литры и имя — в подсказке.
  const badge = String(io.amount);
  const amount = io.kind === "fluid" ? `${formatNumber(io.amount)} л` : `${formatNumber(io.amount)} шт`;
  const chance = io.probability < 1 ? `${formatNumber(io.probability * percent)}%` : "";
  const title = `${goods.name}: ${io.amount > 0 ? amount : "не расходуется"}${chance ? `, шанс ${chance}` : ""}`;
  return (
    <span title={title} className="relative inline-flex shrink-0 border border-line bg-bg p-0.5">
      <Icon goods={goods} />
      {io.amount > 0 && <span className="absolute bottom-0 right-0.5 font-mono text-[10px] leading-none text-text1 [text-shadow:1px_1px_0_#000]">{badge}</span>}
      {chance && <span className="absolute left-0.5 top-0 font-mono text-[9px] leading-none text-accent [text-shadow:1px_1px_0_#000]">{chance}</span>}
    </span>
  );
}

/** Рецепт строкой значков: входы → машина → выходы. */
export function RecipeLine({ index, choice }: { index: Index; choice: Choice }) {
  const { recipe } = choice;
  const goods = (ptr: number) => index.repository.goods(ptr);
  return (
    <span className="flex flex-wrap items-center gap-1">
      {recipe.inputs.map((io, slot) => (
        <Stack key={`in-${slot}`} goods={goods(choice.inputs[slot] ?? io.goods[0])} io={io} />
      ))}
      <span className="px-1 font-mono text-xs text-text3" aria-hidden>
        →
      </span>
      {recipe.outputs.map((io, slot) => (
        <Stack key={`out-${slot}`} goods={goods(io.goods[0])} io={io} />
      ))}
    </span>
  );
}

/** Время и энергия рецепта одной строкой. */
function runInfo(choice: Choice): string {
  const { ticks, eut } = timing(choice.recipe);
  const seconds = formatNumber(ticks / CALC.ticksPerSecond, 1);
  return eut > 0 ? `${seconds} с · ${formatNumber(eut)} EU/t` : `${seconds} с · без энергии`;
}

interface PickerProps {
  readonly index: Index;
  readonly reached: Reach;
  readonly goods: number;
  readonly choice: Choice;
  readonly onPick: (choice: Choice) => void;
}

/**
 * Выбор рецепта, как в NEI: сейчас выбранный рецепт — строкой значков с машиной; по нажатию — панель со всеми рецептами
 * этого товара на ярусе. Карточка рецепта: машина, входы → выходы, время, энергия и во сколько раз он дороже лучшего.
 * Сверху поиск по машине и ингредиентам. Рецепты считаются только при открытии панели: у дерева сотни узлов.
 */
export function RecipePicker({ index, reached, goods, choice, onPick }: PickerProps) {
  const [isOpen, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const options = useMemo(() => (isOpen ? alternatives(index, reached, goods) : []), [isOpen, index, reached, goods]);
  const best = options[0]?.cost ?? 0;
  const shown = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return options;
    return options.filter(({ choice: option }) =>
      [option.crafter.label, ...option.inputs.map((ptr) => index.repository.goods(ptr).name)].some((text) => text.toLowerCase().includes(needle)),
    );
  }, [options, filter, index]);

  // Закрыть по щелчку мимо панели и по Escape.
  useEffect(() => {
    if (!isOpen) return;
    const handlePointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label={`Рецепт: ${choice.crafter.label}. Выбрать другой`}
        className="flex items-center gap-2 border border-line px-2 py-1 text-left transition-colors hover:border-accent"
        onClick={() => setOpen(!isOpen)}
      >
        <span className="font-mono text-xs text-text2">{choice.crafter.label}</span>
        <RecipeLine index={index} choice={choice} />
        <span className="font-mono text-xs text-text3" aria-hidden>
          ▾
        </span>
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-30 mt-1 w-[min(46rem,calc(100vw-2rem))] border border-line bg-bg shadow-2xl">
          <div className="flex items-center gap-3 border-b border-line p-2">
            <input
              autoFocus
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Машина или ингредиент"
              aria-label="Искать рецепт"
              className="flex-1 border border-line bg-bg px-2 py-1 font-mono text-xs text-text1 focus:border-accent focus:outline-none"
            />
            <span className="font-mono text-xs text-text3">
              {shown.length} из {options.length}
            </span>
          </div>
          {options.length <= 1 && <p className="p-3 text-sm text-text2">Других рецептов на этом ярусе нет.</p>}
          <ul className="max-h-[26rem] overflow-y-auto">
            {shown.map((option) => {
              const isCurrent = option.choice.recipe.ptr === choice.recipe.ptr;
              const ratio = best > 0 ? option.cost / best : 1;
              return (
                <li key={option.choice.recipe.ptr}>
                  <button
                    type="button"
                    aria-current={isCurrent}
                    className={isCurrent ? CARD + " border-l-2 border-l-accent bg-line" : CARD}
                    onClick={() => {
                      onPick(option.choice);
                      setOpen(false);
                    }}
                  >
                    <span className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm text-text1">{option.choice.crafter.label}</span>
                      <span className="font-mono text-xs text-text3">
                        {runInfo(option.choice)} ·{" "}
                        {ratio <= 1 ? <span className="text-accent">самый выгодный</span> : `дороже в ${formatNumber(ratio, 1)} раза`}
                      </span>
                    </span>
                    <span className="mt-1 block">
                      <RecipeLine index={index} choice={option.choice} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
