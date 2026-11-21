// Названия из игры на двух языках — для перевода сайта и калькулятора.
// Английский — стандартные en_US.lang из jar-файлов модов сборки, русский — русификатор из config/txloader
// (он перекрывает ru_RU.lang из jar). Строки соединяются по ключу перевода.
// Пишет scripts/game-lang.json: { pairs: [[ru, en], ...], prefixes: {key: [ru, en]} } — пары без форматирования (§),
// одинаковые русские названия с разными английскими пропускаются.
// Запуск: node scripts/game-lang.mjs "<папка игры>"
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const game = process.argv[2];
if (!game || !existsSync(path.join(game, "mods"))) throw new Error("Укажите папку игры (в ней должна быть папка mods)");

/** Разбор lang: key=value; ключи вида S:"x"=y (старый формат GregTech) тоже. */
function parse(text) {
  const map = new Map();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim().replace(/^S:/, "");
    const at = line.indexOf("=");
    if (at <= 0 || line.startsWith("#")) continue;
    map.set(line.slice(0, at).replace(/^"|"$/g, ""), line.slice(at + 1));
  }
  return map;
}

const en = new Map();
const ru = new Map();
const add = (target, text) => parse(text).forEach((value, key) => target.set(key, value));

// Jar-файлы: en_US и ru_RU внутри assets/*/lang.
const jars = [];
const walkJars = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walkJars(full);
    else if (/\.(jar|zip)$/i.test(name)) jars.push(full);
  }
};
walkJars(path.join(game, "mods"));
for (const jar of jars) {
  let list = "";
  try {
    list = execFileSync("unzip", ["-Z1", jar], { encoding: "utf8", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    continue;
  }
  for (const entry of list.split(/\r?\n/).filter((name) => /assets\/[^/]+\/lang\/(en_US|ru_RU)\.lang$/i.test(name))) {
    const text = execFileSync("unzip", ["-p", jar, entry], { encoding: "utf8", maxBuffer: 1 << 28 });
    add(/en_US/i.test(entry) ? en : ru, text);
  }
}
// Русификатор поверх: config/txloader/load/<мод>/lang/ru_RU.lang и старый GregTech_ru_RU.lang в корне.
const txloader = path.join(game, "config", "txloader", "load");
const walkLang = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walkLang(full);
    else if (name === "ru_RU.lang") add(ru, readFileSync(full, "utf8"));
  }
};
if (existsSync(txloader)) walkLang(txloader);
const oldGt = path.join(game, "GregTech_ru_RU.lang");
if (existsSync(oldGt)) add(ru, readFileSync(oldGt, "utf8"));

const clean = (text) => text.replace(/§./g, "").trim();
const byRu = new Map();
const prefixes = {};
for (const [key, ruText] of ru) {
  const enText = en.get(key);
  if (!enText) continue;
  const pair = [clean(ruText), clean(enText)];
  if (key.startsWith("gt.oreprefix.")) prefixes[key] = pair;
  if (!/\.name$|^gt\.blockmachines\.|^Material\.|material\./i.test(key) || !pair[0] || pair[0].length > 80) continue;
  const known = byRu.get(pair[0]);
  if (known === undefined) byRu.set(pair[0], pair[1]);
  else if (known !== pair[1]) byRu.set(pair[0], null);
}
const pairs = [...byRu].filter(([, enText]) => enText);
// Материалы GregTech: русское имя есть только по ключу (Material.stainlesssteel, gtpp.material.StainlessSteel), английское
// игра собирает из кода. Ключ без пробелов и знаков в нижнем регистре сравнивается с английским именем так же сжатым.
const squash = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, "");
const materials = {};
for (const [key, ruText] of ru) {
  const found = /^(?:Material|gtpp\.material|bw\.werkstoff)\.([^.]+)$/i.exec(key);
  if (found && !materials[squash(found[1])]) materials[squash(found[1])] = clean(ruText);
}
writeFileSync(new URL("./game-lang.json", import.meta.url), JSON.stringify({ pairs, prefixes, materials }));
console.log(`jar ${jars.length}, en ${en.size}, ru ${ru.size}, пар ${pairs.length}, шаблонов ${Object.keys(prefixes).length}, материалов ${Object.keys(materials).length}`);
