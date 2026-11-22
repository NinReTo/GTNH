"use client";

import { asset } from "@/lib/asset";
import { createContext, useContext, useEffect, useState } from "react";
import { formatNumber } from "@/components/landing/ui";
import type { Crafter } from "@/lib/calc/crafters";
import type { Goods } from "@/lib/calc/repository";
import { pick, type Lang } from "@/lib/lang";

/**
 * Тексты калькулятора на языке страницы. Названия товаров на русской версии — из файлов перевода игры
 * (public/i18n/calc-ru.json, его собирает tests/calc-names.test.ts); чего там нет — остаётся английским, как в игре.
 */
export interface CalcText {
  readonly lang: Lang;
  readonly t: (ru: string, en: string) => string;
  readonly number: (value: number, digits?: number) => string;
  /** Название товара. */
  readonly name: (goods: Goods) => string;
  /** Название машины рецепта: «Дробитель LV», «Электрическая доменная печь». */
  readonly crafter: (crafter: Crafter) => string;
  /** Подходит ли товар под поиск (на русской версии — и по русскому, и по английскому названию). */
  readonly matches: (goods: Goods, needle: string) => boolean;
}

export const NAMES_URL = asset("/i18n/calc-ru.json");
let namesPromise: Promise<Readonly<Record<string, string>>> | undefined;

/** Русские названия товаров: скачиваются один раз и только на русской версии. Нет файла — английские. */
export function useNames(lang: Lang): Readonly<Record<string, string>> | undefined {
  const [names, setNames] = useState<Readonly<Record<string, string>>>();
  useEffect(() => {
    if (lang !== "ru") return;
    namesPromise ??= fetch(NAMES_URL).then((response) => (response.ok ? response.json() : {}), () => ({}));
    let isCurrent = true;
    namesPromise.then((loaded) => isCurrent && setNames(loaded));
    return () => {
      isCurrent = false;
    };
  }, [lang]);
  return lang === "ru" ? names : undefined;
}

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

export function makeText(lang: Lang, names: Readonly<Record<string, string>> | undefined): CalcText {
  const ruName = (english: string): string => names?.[english] ?? english;
  return {
    lang,
    t: (ru, en) => pick(lang, ru, en),
    number: (value, digits = 0) => formatNumber(value, digits, lang),
    name: (goods) => (lang === "ru" ? ruName(goods.name) : goods.name),
    crafter: (crafter) => {
      if (lang !== "ru") return crafter.label;
      if (crafter.kind === "hand") return "Верстак";
      if (crafter.kind === "multi") return crafter.machine?.title ?? ruName(crafter.label);
      if (crafter.kind === "single" && crafter.baseName) {
        // «Базовый дробитель» — имя LV-машины в игре; ярус у нас свой, поэтому слово «Базовый» убираем.
        const basic = names?.[`Basic ${crafter.baseName}`];
        const tier = crafter.label.split(" ").pop() ?? "";
        return basic ? `${capitalize(basic.replace(/^Базов\S*\s+/, ""))} ${tier}` : crafter.label;
      }
      return ruName(crafter.label);
    },
    matches: (goods, needle) =>
      goods.name.toLowerCase().includes(needle) || (lang === "ru" && ruName(goods.name).toLowerCase().includes(needle)),
  };
}

const CalcTextContext = createContext<CalcText>(makeText("ru", undefined));
export const CalcTextProvider = CalcTextContext.Provider;
export const useCalcText = (): CalcText => useContext(CalcTextContext);
