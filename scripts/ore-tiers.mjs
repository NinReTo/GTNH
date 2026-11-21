// С какого яруса калькулятора доступна руда каждого материала: по измерениям её рудных жил и мелких руд из кода мода
// (gregtech-*.jar: gregtech/api/enums/OreMixes и SmallOres, разбор байткода через javap). Ярус измерения —
// CALC.oreDimensionTiers (вики GTNH). Выключенные по умолчанию жилы (disabledByDefault) не считаются.
// Пишет lib/calc/ore-tiers.ts: номер материала (как у блока руды в выгрузке: номер % 1000; MaterialsIDMap) → ярус.
// Запуск: node scripts/ore-tiers.mjs "<папка игры>"
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { unzipSync } from "fflate";
import { CALC } from "../lib/config.ts";
import { ADDON_ORES } from "../lib/calc/ores.ts";

const game = process.argv[2];
if (!game || !existsSync(path.join(game, "mods"))) throw new Error("Укажите папку игры (в ней должна быть папка mods)");
const mods = path.join(game, "mods");
const jar = readdirSync(mods).find((name) => /^gregtech-[\d.]+\.jar$/i.test(name));
if (!jar) throw new Error("Нет gregtech-*.jar в папке mods");

const MIXES = "gregtech/api/enums/OreMixes.class";
const SMALL = "gregtech/api/enums/SmallOres.class";
const IDS = "gregtech/api/enums/MaterialsIDMap.class";
const WERKSTOFF = "bartworks/system/material/WerkstoffLoader.class";
const files = unzipSync(readFileSync(path.join(mods, jar)), { filter: (file) => [MIXES, SMALL, IDS, WERKSTOFF].includes(file.name) });
const temp = mkdtempSync(path.join(os.tmpdir(), "ore-tiers-"));
const javap = (name) => {
  const file = path.join(temp, path.basename(name));
  writeFileSync(file, files[name]);
  return execFileSync("javap", ["-c", "-p", file], { encoding: "utf8", maxBuffer: 1 << 28 }).split(/\r?\n/);
};

// Номера материалов: MaterialsIDMap кладёт число и материал подряд — r(int, Materials).
const ids = new Map();
let lastInt;
for (const line of javap(IDS)) {
  const push = /(?:bipush|sipush)\s+(-?\d+)/.exec(line)?.[1] ?? /\/\/ int (-?\d+)/.exec(line)?.[1] ?? /iconst_(\d)/.exec(line)?.[1];
  if (push !== undefined) lastInt = Number(push);
  const material = /Field gregtech\/api\/enums\/Materials\.([A-Za-z0-9_]+):/.exec(line)?.[1];
  if (material && lastInt !== undefined && !ids.has(material)) ids.set(material, lastInt);
}

// Жилы и мелкие руды: от создания построителя до записи в поле перечисления — измерения и материалы
// (primary, secondary, inBetween, sporadic, ore; материалы из setLocalizedName — только название).
const addonNames = new Map();
const normalize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
const oreNameByKey = new Map([...ADDON_ORES].map((ore) => [normalize(ore.replace(/ Ore$/, "")), ore]));
// Идентификаторы GT++ отличаются от названий самих блоков руды.
oreNameByKey.set("radiobarite", "Barite (Ra) Ore");
oreNameByKey.set("cryolite", "Cryolite (F) Ore");
oreNameByKey.set("fluorite", "Fluorite (F) Ore");
let addonName;
for (const line of javap(WERKSTOFF)) {
  if (/new .*\/Werkstoff$/.test(line)) addonName = undefined;
  const display = /\/\/ String (.+)$/.exec(line)?.[1];
  if (display && ADDON_ORES.has(`${display} Ore`)) addonName = `${display} Ore`;
  const field = /putstatic .*\/\/ Field (\w+):Lbartworks\/system\/material\/Werkstoff;/.exec(line)?.[1];
  if (field) {
    if (addonName) addonNames.set(field, addonName);
    addonName = undefined;
  }
}
const dimensionTiers = new Map(Object.entries(CALC.oreDimensionTiers).map(([name, tier]) => [name.toLowerCase(), tier]));
const tiers = new Map();
const addonTiers = new Map();
for (const name of [MIXES, SMALL]) {
  let dims = [];
  let materials = [];
  let disabled = false;
  let pendingMaterial;
  for (const line of javap(name)) {
    if (/Builder\."<init>"/.test(line)) {
      dims = [];
      materials = [];
      disabled = false;
      continue;
    }
    const dim = /DimensionDef\.([A-Za-z0-9]+):/.exec(line)?.[1] ?? /\/\/ String (.+)$/.exec(line)?.[1];
    const dimTier = dim && dimensionTiers.get(dim.toLowerCase());
    if (typeof dimTier === "number") dims.push(dimTier);
    const material = /Field gregtech\/api\/enums\/Materials\.(\w+):/.exec(line)?.[1];
    const addon = /Field (?:bartworks\/system\/material\/WerkstoffLoader|gtPlusPlus\/core\/material\/[\w$/]+)\.(\w+):/.exec(line)?.[1];
    if (material || addon) pendingMaterial = { material, addon };
    const method = /Builder\.([A-Za-z]+):/.exec(line)?.[1];
    if (method && pendingMaterial) {
      if (["primary", "secondary", "inBetween", "sporadic", "ore"].includes(method)) materials.push(pendingMaterial);
      pendingMaterial = undefined;
    }
    if (method === "disabledByDefault") disabled = true;
    if (/putstatic .*Lgregtech\/api\/enums\/(OreMixes|SmallOres);/.test(line)) {
      if (!disabled && dims.length > 0) {
        const tier = Math.min(...dims);
        for (const one of materials) {
          const id = ids.get(one.material);
          if (id !== undefined) tiers.set(id, Math.min(tiers.get(id) ?? Infinity, tier));
          const ore = one.addon && (addonNames.get(one.addon) ?? oreNameByKey.get(normalize(one.addon)));
          if (ore) addonTiers.set(ore, Math.min(addonTiers.get(ore) ?? Infinity, tier));
        }
      }
      dims = [];
      materials = [];
    }
  }
}

const entries = [...tiers].sort(([a], [b]) => a - b);
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "lib", "calc", "ore-tiers.ts");
writeFileSync(
  out,
  `/**
 * С какого яруса калькулятора (0 — LV) руду материала можно добывать: самое доступное измерение его рудных жил и мелких
 * руд в коде мода (${jar}), ярус измерения — CALC.oreDimensionTiers. Ключ — номер материала (MaterialsIDMap), как у
 * блока руды в выгрузке (номер % 1000). Создано скриптом scripts/ore-tiers.mjs — не править руками.
 */
export const ORE_TIERS: Readonly<Record<number, number>> = {
${entries.map(([id, tier]) => `  ${id}: ${tier},`).join("\n")}
};

export const ADDON_ORE_TIERS: Readonly<Record<string, number>> = {
${[...addonTiers].sort(([a], [b]) => a.localeCompare(b)).map(([ore, tier]) => `  ${JSON.stringify(ore)}: ${tier},`).join("\n")}
};
`,
);
console.log(`руд: ${entries.length}, не с LV: ${entries.filter(([, tier]) => tier > 0).length}, номеров материалов: ${ids.size}`);
