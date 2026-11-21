import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { describe, expect, test } from "vitest";
import { nameTranslator, type GameLang } from "@/lib/calc/names";
import { Repository } from "@/lib/calc/repository";

/**
 * Русские названия товаров калькулятора: public/i18n/calc-ru.json (английское название → русское).
 * Пересобрать после новой выгрузки или русификатора: NAMES=1 npx vitest run tests/calc-names.test.ts
 */
const DATA = "public/calc/data.bin";
const OUT = "public/i18n/calc-ru.json";

describe.skipIf(!existsSync(DATA))("русские названия товаров калькулятора", () => {
  const game = JSON.parse(readFileSync("scripts/game-lang.json", "utf8")) as GameLang;
  const translate = nameTranslator(game);

  test("шаблоны GregTech, точные пары и материалы", () => {
    expect(translate("Steel Ingot")).toBe("[Слиток] Сталь");
    expect(translate("Crushed Banded Iron Ore")).toBe("[Измельчённая руда] Полосчатое железо");
    expect(translate("Oxygen")).toBe("Кислород");
    expect(translate("Electric Blast Furnace")).toBe("Электрическая доменная печь");
    expect(translate("Something Unknown 123")).toBeUndefined();
  });

  test("словарь собран и покрывает большинство товаров", () => {
    const raw = gunzipSync(readFileSync(DATA));
    const repository = new Repository(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength));
    const names = [...new Set([...repository.itemPtrs, ...repository.fluidPtrs].map((ptr) => repository.goods(ptr).name))];
    const found = Object.fromEntries(names.flatMap((name) => {
      const ru = translate(name);
      return ru ? [[name, ru]] : [];
    }));
    if (process.env.NAMES) {
      mkdirSync("public/i18n", { recursive: true });
      writeFileSync(OUT, JSON.stringify(found));
    }
    console.log(`названий ${names.length}, по-русски ${Object.keys(found).length}`);
    expect(Object.keys(found).length).toBeGreaterThan(names.length / [0, 0].length);
    expect(existsSync(OUT)).toBe(true);
  }, 120_000);
});
