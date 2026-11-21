/**
 * Русские названия товаров калькулятора. В выгрузке рецептов названия английские; русские берутся из файлов перевода
 * игры (scripts/game-lang.json, собирает scripts/game-lang.mjs из папки GTNH). Порядок поиска:
 * 1) шаблон GregTech «%s Ingot» ↔ «[Слиток] %s» и русское имя материала — так их и показывает русификатор;
 * 2) точная пара «английское → русское» из lang-файлов (если английское имя не встречается у двух разных вещей);
 * 3) имя материала целиком (жидкости и газы: Oxygen → Кислород).
 * Не нашлось — остаётся английское.
 */

export interface GameLang {
  readonly pairs: readonly (readonly [string, string])[];
  readonly prefixes: Readonly<Record<string, readonly [string, string]>>;
  readonly materials: Readonly<Record<string, string>>;
}

const squash = (text: string): string => text.toLowerCase().replace(/[^a-z0-9]/g, "");
const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Функция перевода названия: английское → русское (или undefined). */
export function nameTranslator(lang: GameLang): (name: string) => string | undefined {
  const direct = new Map<string, string | null>();
  for (const [ru, en] of lang.pairs) direct.set(en, direct.has(en) && direct.get(en) !== ru ? null : ru);
  // Шаблоны с одним %s; длинные (точнее) — первыми, чтобы «Impure Pile of %s Dust» не съел «%s Dust».
  const templates = Object.values(lang.prefixes)
    .filter(([ru, en]) => en.split("%s").length === [0, 0].length && ru.includes("%s") && !en.includes("$"))
    .map(([ru, en]) => ({ ru, pattern: new RegExp(`^${escape(en).replace("%s", "(.+)")}$`), size: en.length }))
    .sort((a, b) => b.size - a.size);
  const material = (name: string): string | undefined => lang.materials[squash(name)];
  return (name) => {
    for (const template of templates) {
      const found = template.pattern.exec(name);
      const ru = found && material(found[1]);
      if (ru) return template.ru.replace("%s", ru);
    }
    return direct.get(name) ?? material(name);
  };
}
