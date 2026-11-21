/** Языки сайта — отдельно от словаря (lib/i18n.ts), чтобы proxy.ts не тащил словарь за собой. */
export const LANGS = ["ru", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const isLang = (value: string): value is Lang => (LANGS as readonly string[]).includes(value);

/** Подпись интерфейса прямо в коде компонента: русский и английский рядом. */
export const pick = (lang: Lang, ru: string, en: string): string => (lang === "ru" ? ru : en);

/** Адрес страницы на языке lang: «/machines/x» → «/en/machines/x». */
export const href = (lang: Lang, path: string): string => `/${lang}${path === "/" ? "" : path}`;
