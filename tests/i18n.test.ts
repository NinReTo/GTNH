import { readdirSync, writeFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { hasCyrillic, keyOf, localize, tr } from "@/lib/i18n";
import EN from "@/lib/i18n/en.json";

/**
 * РђРЅРіР»РёР№СЃРєР°СЏ РІРµСЂСЃРёСЏ СЃР°Р№С‚Р° РЅРµ РґРѕР»Р¶РЅР° РѕСЃС‚Р°С‚СЊСЃСЏ РЅР°РїРѕР»РѕРІРёРЅСѓ СЂСѓСЃСЃРєРѕР№: РєР°Р¶РґР°СЏ СЂСѓСЃСЃРєР°СЏ СЃС‚СЂРѕРєР° РґР°РЅРЅС‹С… (РІСЃС‘, С‡С‚Рѕ Р»РµР¶РёС‚ РІ
 * СЌРєСЃРїРѕСЂС‚Р°С… lib/*.ts вЂ” РјР°С€РёРЅС‹, СЏСЂСѓСЃС‹, РіР°Р№РґС‹, Р»РёРЅРёРё, РїРѕРґРїРёСЃРё Р±Р»РѕРєРѕРІ) РґРѕР»Р¶РЅР° Р±С‹С‚СЊ РІ СЃР»РѕРІР°СЂРµ lib/i18n/en.json.
 * EXTRACT=1 npx vitest run tests/i18n.test.ts вЂ” Р·Р°РїРёСЃР°С‚СЊ РєР»СЋС‡Рё Р±РµР· РїРµСЂРµРІРѕРґР° РІ lib/i18n/missing.json.
 * РќРµ РѕР±С…РѕРґРёРј: РєР°Р»СЊРєСѓР»СЏС‚РѕСЂ (lib/calc вЂ” РЅР°Р·РІР°РЅРёСЏ С‚РѕРІР°СЂРѕРІ Р±РµСЂСѓС‚СЃСЏ РёР· С„Р°Р№Р»РѕРІ РёРіСЂС‹) Рё СЃР°Рј СЃР»РѕРІР°СЂСЊ.
 */

const SKIP = new Set(["i18n.ts"]);

async function collect(): Promise<Set<string>> {
  const keys = new Set<string>();
  const seen = new WeakSet<object>();
  const walk = (value: unknown, depth: number): void => {
    if (typeof value === "string") {
      if (hasCyrillic(value)) keys.add(keyOf(value).key);
      return;
    }
    if (!value || typeof value !== "object" || depth > 40 || seen.has(value)) return;
    seen.add(value);
    if (value instanceof Map) value.forEach((item, key) => (walk(key, depth + 1), walk(item, depth + 1)));
    else if (Array.isArray(value) || value instanceof Set) for (const item of value) walk(item, depth + 1);
    else for (const item of Object.values(value)) walk(item, depth + 1);
  };
  for (const file of readdirSync("lib").filter((name) => name.endsWith(".ts") && !SKIP.has(name))) {
    const module = (await import(`@/lib/${file.replace(/\.ts$/, "")}.ts`)) as Record<string, unknown>;
    for (const value of Object.values(module)) walk(value, 0);
  }
  // РўРµРєСЃС‚С‹, РєРѕС‚РѕСЂС‹Рµ СЃС‚СЂР°РЅРёС†С‹ СЃРѕР±РёСЂР°СЋС‚ С„СѓРЅРєС†РёСЏРјРё: РєР°С‚Р°Р»РѕРі Рё РїСЂРѕРіСЂРµСЃСЃРёРё СЏСЂСѓСЃРѕРІ, С†РµРїРѕС‡РєРё РјРµС‚Р°Р»Р»РѕРІ, РїРѕРґРїРёСЃРё СЃС‚СѓРїРµРЅРµР№.
  const { TIERS } = await import("@/lib/tiers");
  const { catalogOf, linesOf, stepLabel } = await import("@/lib/lines");
  const { craftLinesOf } = await import("@/lib/crafts");
  for (const tier of TIERS) {
    const steps = [...linesOf(tier.id), ...catalogOf(tier.id)].flatMap((group) => group.steps);
    walk([catalogOf(tier.id), linesOf(tier.id), craftLinesOf(tier.id), steps.map(stepLabel)], 0);
  }
  return keys;
}

describe("Р°РЅРіР»РёР№СЃРєР°СЏ РІРµСЂСЃРёСЏ СЃР°Р№С‚Р°", () => {
  test("С‡РёСЃР»Р° РІ РєР»СЋС‡Рµ вЂ” РјРµС‚РєРё, РІ РїРµСЂРµРІРѕРґРµ вЂ” Р°РЅРіР»РёР№СЃРєР°СЏ Р·Р°РїРёСЃСЊ", () => {
    expect(keyOf("РќСѓР¶РЅРѕ 1 234,5 Р» Р·Р° 12 СЃ").key).toBe("РќСѓР¶РЅРѕ {0} Р» Р·Р° {1} СЃ");
    expect(localize("ru", { a: ["РЎС‚Р°Р»СЊ"] })).toEqual({ a: ["РЎС‚Р°Р»СЊ"] });
    expect(tr("en", "Steel Ingot")).toBe("Steel Ingot");
  });

  test("Сѓ РєР°Р¶РґРѕР№ СЂСѓСЃСЃРєРѕР№ СЃС‚СЂРѕРєРё РґР°РЅРЅС‹С… РµСЃС‚СЊ РїРµСЂРµРІРѕРґ", async () => {
    const keys = await collect();
    const dictionary = EN as Record<string, string>;
    const missing = [...keys].filter((key) => dictionary[key] === undefined).sort();
    if (process.env.EXTRACT) writeFileSync("lib/i18n/missing.json", JSON.stringify(missing, null, 1));
    expect(missing.slice(0, 20)).toEqual([]);
  }, 120_000);
});
