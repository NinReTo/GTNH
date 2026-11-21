import EN from "./i18n/en.json";
import type { Lang } from "./lang";

/**
 * Два языка сайта. Тексты пишутся по-русски прямо в данных (lib/*.ts); английская версия переводит каждую русскую
 * строку по словарю lib/i18n/en.json. Ключ словаря — русская строка, в которой числа заменены метками {0}, {1}…:
 * так одна запись переводит и «нужно 6 домн», и «нужно 12 домн», которые сайт собирает из расчётов. В переводе метки
 * можно переставить; числа в английском тексте пишутся по-английски (1,234.5 вместо 1 234,5).
 * Строки без кириллицы (адреса, текстуры, названия на латинице) не трогаются.
 * Полноту словаря проверяет tests/i18n.test.ts (там же — сбор новых строк: EXTRACT=1).
 */

export { LANGS, href, isLang, pick, type Lang } from "./lang";

const CYRILLIC = /[А-Яа-яЁё]/;
/** Число в русской записи: 1 234 567,89 (группы через пробел или неразрывный пробел) или просто 12 / 1,5. */
const NUMBER = /\d{1,3}(?:[   ]\d{3})+(?:,\d+)?(?!\d)|\d+(?:,\d+)?/g;

const dictionary = EN as Readonly<Record<string, string>>;

/** Ключ словаря для строки и числа из неё по порядку. */
export function keyOf(text: string): { readonly key: string; readonly numbers: readonly string[] } {
  const numbers: string[] = [];
  const key = text.replace(NUMBER, (match) => `{${numbers.push(match) - 1}}`);
  return { key, numbers };
}

/** Русская запись числа → английская: группы через запятую, дробь через точку. */
function englishNumber(value: string): string {
  const [whole, fraction] = value.replace(/[   ]/g, "").split(",");
  const grouped = whole.length > [0, 0, 0, 0].length ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : whole;
  return fraction === undefined ? grouped : `${grouped}.${fraction}`;
}

export const hasCyrillic = (text: string): boolean => CYRILLIC.test(text);

/** Перевод строки на язык lang. Нет перевода — русская строка как есть (тест не даст такому попасть на сайт). */
export function tr(lang: Lang, text: string): string {
  if (lang === "ru" || !CYRILLIC.test(text)) return text;
  const { key, numbers } = keyOf(text);
  const found = dictionary[key];
  if (found === undefined) return text;
  return found.replace(/\{(\d+)\}/g, (_match, slot: string) => englishNumber(numbers[Number(slot)] ?? ""));
}

/** Перевод целого объекта данных: все строки внутри (в массивах и вложенных объектах), остальное — как есть. */
export function localize<T>(lang: Lang, value: T): T {
  if (lang === "ru") return value;
  if (typeof value === "string") return tr(lang, value) as T;
  if (Array.isArray(value)) return value.map((item) => localize(lang, item)) as T;
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([field, item]) => [field, localize(lang, item)])) as T;
  }
  return value;
}
