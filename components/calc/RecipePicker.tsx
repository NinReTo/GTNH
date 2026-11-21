"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { alternatives, timing, type Choice, type Index, type Option, type Reach } from "@/lib/calc/planner";
import { groupOreOptions, ingredientForm } from "@/lib/calc/recipe-groups";
import type { Goods, RecipeIo } from "@/lib/calc/repository";
import { CALC } from "@/lib/config";
import { Icon } from "./Icon";
import { useCalcText, type CalcText } from "./text";

const { percent } = CALC.ui;
const CARD = "block w-full border-b border-line px-3 py-2 text-left transition-colors hover:bg-line";

/** Значок товара с количеством в углу, как в инвентаре; у выхода с шансом — процент. Имя — во всплывающей подсказке. */
function Stack({ goods, io }: { goods: Goods; io: RecipeIo }) {
  const { t, number, name } = useCalcText();
  // На значке — голое число, как в инвентаре (1000 без пробела влезает в 32 пикселя); литры и имя — в подсказке.
  const badge = String(io.amount);
  const amount = io.kind === "fluid" ? `${number(io.amount)} ${t("л", "L")}` : `${number(io.amount)} ${t("шт", "pcs")}`;
  const chance = io.probability < 1 ? `${number(io.probability * percent)}%` : "";
  const title = `${name(goods)}: ${io.amount > 0 ? amount : t("не расходуется", "not consumed")}${chance ? `, ${t("шанс", "chance")} ${chance}` : ""}`;
  return (
    <span title={title} className="relative inline-flex shrink-0 border border-line bg-bg p-0.5">
      <Icon goods={goods} />
      {io.amount > 0 && <span className="absolute bottom-0 right-0.5 font-mono text-[10px] leading-none text-text1 [text-shadow:1px_1px_0_#000]">{badge}</span>}
      {chance && <span className="absolute left-0.5 top-0 font-mono text-[9px] leading-none text-accent [text-shadow:1px_1px_0_#000]">{chance}</span>}
    </span>
  );
}

/** Рецепт строкой значков: входы → машина → выходы. */
export function RecipeLine({ index, choice, showForms = false }: { index: Index; choice: Choice; showForms?: boolean }) {
  const { recipe } = choice;
  const { t } = useCalcText();
  const goods = (ptr: number) => index.repository.goods(ptr);
  return (
    <span className="flex flex-wrap items-center gap-1">
      {recipe.inputs.map((io, slot) => {
        const input = goods(choice.inputs[slot] ?? io.goods[0]);
        const form = showForms ? ingredientForm(input) : undefined;
        return <span key={`in-${slot}`} className="inline-flex items-center gap-1">
          <Stack goods={input} io={io} />
          {form && <span className="font-mono text-xs text-text2">{t(...form)}</span>}
        </span>;
      })}
      {choice.crafter.kind === "hand" && recipe.catalysts.length > 0 && (
        <span className="inline-flex items-center gap-1">
          <span className="font-mono text-xs text-text2">{t("Инструменты", "Tools")}</span>
          {recipe.catalysts.map((io, slot) => <Stack key={slot} goods={goods(io.goods[0])} io={io} />)}
        </span>
      )}
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
function runInfo(choice: Choice, { t, number }: CalcText): string {
  const { ticks, eut } = timing(choice.recipe);
  const seconds = `${number(ticks / CALC.ticksPerSecond, 1)} ${t("с", "s")}`;
  return eut > 0 ? `${seconds} · ${number(eut)} EU/t` : `${seconds} · ${t("без энергии", "no power")}`;
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
  const [frame, setFrame] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const text = useCalcText();
  const { t } = text;
  const options = useMemo(() => (isOpen ? alternatives(index, reached, goods) : []), [isOpen, index, reached, goods]);
  const groups = useMemo(() => groupOreOptions(index, options), [index, options]);
  const best = options[0]?.cost ?? 0;
  const shown = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return groups;
    return groups.map((group) => group.filter(({ choice: option }) =>
        [option.crafter.label, text.crafter(option.crafter)].some((label) => label.toLowerCase().includes(needle)) ||
        option.inputs.some((ptr) => text.matches(index.repository.goods(ptr), needle)),
    )).filter((group) => group.length > 0);
  }, [groups, filter, index, text]);

  const animated = shown.some((group) => group.length > 1);
  useEffect(() => {
    if (!animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setFrame((previous) => previous + 1), CALC.ingredientCycleMs);
    return () => window.clearInterval(timer);
  }, [animated]);

  const recipeButton = (option: Option, preview: Choice) => {
    const isCurrent = option.choice.recipe.ptr === choice.recipe.ptr;
    const ratio = best > 0 ? option.cost / best : 1;
    return (
      <button key={option.choice.recipe.ptr} type="button" aria-current={isCurrent}
        className={isCurrent ? CARD + " border-l-2 border-l-accent bg-line" : CARD}
        onClick={() => { onPick(option.choice); setOpen(false); }}>
        <span className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm text-text1">{text.crafter(option.choice.crafter)}</span>
          <span className="font-mono text-xs text-text3">
            {runInfo(option.choice, text)} ·{" "}
            {ratio <= 1 ? <span className="text-accent">{t("самый выгодный", "the cheapest")}</span>
              : t(`дороже в ${text.number(ratio, 1)} раза`, `${text.number(ratio, 1)}× more expensive`)}
          </span>
        </span>
        <span className="mt-1 block"><RecipeLine index={index} choice={preview} showForms /></span>
      </button>
    );
  };

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
        aria-label={t(`Рецепт: ${text.crafter(choice.crafter)}. Выбрать другой`, `Recipe: ${text.crafter(choice.crafter)}. Pick another`)}
        className="flex items-center gap-2 border border-line px-2 py-1 text-left transition-colors hover:border-accent"
        onClick={() => setOpen(!isOpen)}
      >
        <span className="font-mono text-xs text-text2">{text.crafter(choice.crafter)}</span>
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
              placeholder={t("Машина или ингредиент", "Machine or ingredient")}
              aria-label={t("Искать рецепт", "Search recipes")}
              className="flex-1 border border-line bg-bg px-2 py-1 font-mono text-xs text-text1 focus:border-accent focus:outline-none"
            />
            <span className="font-mono text-xs text-text3">
              {shown.length} {t("из", "of")} {groups.length}
            </span>
          </div>
          {options.length <= 1 && <p className="p-3 text-sm text-text2">{t("Других рецептов на этом ярусе нет.", "No other recipes on this tier.")}</p>}
          <ul className="max-h-[26rem] overflow-y-auto">
            {shown.map((group) => {
              const preferred = group.find((option) => option.choice.recipe.ptr === choice.recipe.ptr) ?? group[0];
              return <li key={group[0].choice.recipe.ptr}>{recipeButton(preferred, group[frame % group.length].choice)}</li>;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
