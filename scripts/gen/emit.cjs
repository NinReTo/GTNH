// Вывод сгенерированных построек в код сайта.
// Читает gen/batches/*.cjs (тексты и правки по каждой постройке), пишет:
//   lib/gen-kinds.ts, lib/gen-machines.ts, scripts/gen-textures.json
// и gen/untranslated.txt — подписи блоков без русского перевода.
const fs = require("fs");
const path = require("path");
const B = require("./blocks.cjs");
const { multi } = require("./multi.cjs");

const SITE = "C:/Users/iscri/AppData/Local/Claude-Data/claude_pzs8sxrjxfjjc/scratch-workspaces/e4b24103-59fe-4f9b-beb7-45306ad3026a/aa8c8623-bb2d-4cab-8727-f7fd9ed2dfee/scratch-2026-11-10-aa8784/gregtech-ebf";
const LANG = path.join(__dirname, "../lang");
const GAME_LANG = "C:/Users/iscri/AppData/Roaming/.minecraft/versions/GTNH - помогите/GregTech_ru_RU.lang";
const TAG = "5.09.54.265";

// ---------- Языковые файлы ----------
const ru = new Map();
const en = new Map();
for (const file of fs.readdirSync(LANG)) {
  const target = file.includes("ru_RU") ? ru : file.includes("en_US") ? en : null;
  if (!target) continue;
  for (const line of fs.readFileSync(path.join(LANG, file), "utf8").split(/\r?\n/)) {
    const at = line.indexOf("=");
    if (at > 0 && !line.startsWith("#")) target.set(line.slice(0, at).trim(), line.slice(at + 1).trim());
  }
}
for (const line of fs.readFileSync(GAME_LANG, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*S:"?([^=]+?)"?=(.*)$/);
  if (m) ru.set(m[1], m[2].trim());
}
const dictionary = fs.existsSync(path.join(__dirname, "labels-ru.json")) ? JSON.parse(fs.readFileSync(path.join(__dirname, "labels-ru.json"), "utf8")) : {};
const untranslated = new Set();
function russian(english) {
  if (!english) return english;
  if (/[а-яё]/i.test(english)) return english;
  if (dictionary[english]) return dictionary[english];
  untranslated.add(english);
  return english;
}

// ---------- Цвета и имена материалов ----------
const materialsInit = B.byPath.get("gregtech/loaders/materials/MaterialsInit.java") ?? "";
function materialColor(name) {
  const fn = materialsInit.match(new RegExp(`Materials\\.${name}\\s*=\\s*(\\w+)\\(\\)`))?.[1];
  const body = fn ? materialsInit.slice(materialsInit.indexOf(`Materials ${fn}()`)).slice(0, 1500) : "";
  const argb = body.match(/setARGB\(\s*0x([0-9a-fA-F]{6,8})/)?.[1];
  if (argb) {
    const hex = argb.slice(-6);
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  }
  const rgb = body.match(/setRGB(?:A)?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) return rgb.slice(1, 4).map(Number);
  return gtppMaterial(name)?.color ?? [128, 128, 128];
}
/** Сплав GT++: new Material("Имя", ..., new short[] { r, g, b, ...}). */
function gtppMaterial(name) {
  for (const [file, text] of B.byPath) {
    if (!file.startsWith("gtPlusPlus")) continue;
    const m = text.match(new RegExp(`\\b${name}\\s*=\\s*new\\s+Material\\(\\s*"([^"]+)"[\\s\\S]{0,300}?new\\s+short\\[\\]\\s*\\{\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)`));
    if (m) return { name: m[1], color: m.slice(2, 5).map(Number) };
  }
  return null;
}
function materialName(name) {
  const display = gtppMaterial(name)?.name ?? name;
  return ru.get(`Material.${display.replace(/[^A-Za-z0-9]/g, "").toLowerCase()}`) ?? russian(display.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2"));
}

// ---------- Имя блока ----------
function blockLabel(blockVar, meta, casingName) {
  const entry = B.blockClass.get(blockVar.split(".").pop());
  const text = entry ? B.byPath.get(entry.path) : "";
  const base = text.match(/super\([^;]*?"((?:gt|gtplusplus|tt|bw|gg|kekztech|gtnh\w*)[\w.]*)"/)?.[1] ?? text.match(/"(gt\.blockcasings\d*|gtplusplus\.blockcasings\.\d+)"/)?.[1];
  const key = base ? `${base}.${meta}.name` : null;
  if (key && ru.get(key)) return ru.get(key);
  const english = (key && en.get(key)) ?? (casingName ?? "").replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return russian(english || `${blockVar} ${meta}`);
}

// ---------- Виды блоков ----------
const kinds = new Map(); // id → { label, texture, src, tint?, overlay?, base?, flags }
const textures = new Map(); // texture → { src, tint?, overlay?, base? }
// Имена файлов короткие: путь к папке проекта и так длинный, а Windows не пишет пути длиннее 260 знаков.
const slugOf = (src) =>
  src
    .split("/")
    .pop()
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/^(machine-)?casing-|^machine-|-casing$/g, "")
    .replace(/^-|-$/g, "")
    .slice(0, 22)
    .replace(/-$/, "");
const idOf = (texture) => texture.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
function addKind(spec) {
  const texture = spec.texture ?? `g-${slugOf(spec.src)}${spec.tint ? `-${spec.tint.join("-")}` : ""}`;
  const id = spec.id ?? idOf(texture);
  if (!kinds.has(id)) {
    kinds.set(id, { label: spec.label, texture, ...(spec.face ? { face: spec.face } : {}), ...spec.flags });
    if (spec.src) textures.set(texture, { src: spec.src, ...(spec.tint ? { tint: spec.tint } : {}), ...(spec.overlay ? { overlay: spec.overlay, base: spec.baseSrc } : {}) });
  }
  return id;
}

const COILS = { steam: "coil", lv: "coil", mv: "coil", hv: "kanthal", ev: "nichrome", iv: "tungstensteel", luv: "hssg", zpm: "naquadah", uv: "naquadahalloy", uhv: "trinium", uev: "trinium", uiv: "trinium", umv: "trinium", uxv: "trinium" };
const COIL_NAMES = { coil: "мельхиора", kanthal: "кантала", nichrome: "нихрома", tungstensteel: "TPV-сплава", hssg: "HSS-G", naquadah: "наквады", naquadahalloy: "сплава наквады", trinium: "триниума" };
function coilKind(tier) {
  const id = COILS[tier] ?? "coil";
  if (id === "coil") return "coil";
  return addKind({ id: `gCoil${id[0].toUpperCase()}${id.slice(1)}`, texture: `coil-${id}`, label: `Катушка из ${COIL_NAMES[id]}`, flags: { isHot: true } });
}

// Блоки Minecraft: свой рисунок (scripts/own-blocks.mjs). Чего здесь нет — пустое место.
const OWN = {
  lava: ["lava", "Лава", { isHot: true }], flowing_lava: ["lava", "Лава", { isHot: true }],
  water: ["water", "Вода", { isGlass: true }], flowing_water: ["water", "Вода", { isGlass: true }],
  dirt: ["dirt", "Земля"], grass: ["dirt", "Земля"], farmland: ["farmland", "Грядка"],
  redstone_lamp: ["lamp", "Лампа", { isHot: true }], lit_redstone_lamp: ["lamp", "Лампа", { isHot: true }], glowstone: ["lamp", "Лампа", { isHot: true }],
  planks: ["planks", "Доски"], bricks: ["bricks", "Кирпичи"], clay: ["clay", "Обожжённая глина"], hive: ["hive", "Блок пасеки (мод Forestry)"],
  leaves: ["leaves", "Листья"], leaves2: ["leaves", "Листья"], log: ["log", "Бревно"], log2: ["log", "Бревно"],
};

function kindOf(element, tier) {
  if (!element) return null;
  if (element.kind) return element.kind; // ручная правка: готовый вид сайта
  if (element.casing) {
    const c = B.casings.get(element.casing);
    const t = c && B.blockTexture(c.block, c.meta);
    return t?.file ? addKind({ src: t.file, label: element.label ?? blockLabel(c.block, c.meta, element.casing) }) : null;
  }
  switch (element.type) {
    case "own": {
      const own = OWN[element.name];
      return own ? addKind({ texture: `own-${own[0]}`, label: own[1], flags: own[2] }) : null;
    }
    case "glass":
      return "glass";
    case "coil":
      return coilKind(tier);
    case "metal": {
      const tint = materialColor(element.material);
      return addKind({ src: "gregtech/textures/blocks/materialicons/NONE/block1", tint, texture: `g-block-${element.material.toLowerCase()}`.slice(0, 26), label: `Блок: ${materialName(element.material).toLowerCase()}` });
    }
    case "bwcasing": {
      const tint = element.color ?? [160, 160, 170];
      const name = element.advanced ? "blockCasingAdvanced" : "blockCasing";
      return addKind({ src: `gregtech/textures/blocks/materialicons/NONE/${name}`, tint, texture: `g-bw${element.advanced ? "adv" : ""}-${tint.join("-")}`, label: element.label ?? (element.advanced ? "Укреплённый корпус из материала" : "Корпус из материала") });
    }
    case "pipe": {
      // Предметный трубный корпус (BlockCasings11): уровень — по ярусу постройки.
      const meta = { steam: 0, lv: 0, mv: 0, hv: 0, ev: 1, iv: 2, luv: 3, zpm: 4, uv: 5, uhv: 6 }[tier] ?? 7;
      const t = B.blockTexture("GregTechAPI.sBlockCasings11", meta);
      return t.file ? addKind({ src: t.file, label: blockLabel("GregTechAPI.sBlockCasings11", meta) }) : null;
    }
    case "solenoid": {
      // Соленоидная катушка яруса постройки (MV…UMV), как ставят по умолчанию.
      const name = { steam: "MV", lv: "MV", mv: "MV", hv: "HV", ev: "EV", iv: "IV", luv: "LuV", zpm: "ZPM", uv: "UV", uhv: "UHV", uev: "UEV", uiv: "UIV", umv: "UMV", uxv: "UMV" }[tier] ?? "MV";
      return addKind({ src: `gregtech/textures/blocks/iconsets/${name}_SIDE_CYCLOTRON_SOLENOID`, texture: `g-solenoid-${name.toLowerCase()}`, label: `Сверхпроводящая соленоидная катушка ${name}` });
    }
    case "frame": {
      const tint = materialColor(element.material);
      return addKind({ src: "gregtech/textures/blocks/materialicons/NONE/frameGt", tint, texture: `g-frame-${element.material.toLowerCase()}`, label: `Рама: ${materialName(element.material).toLowerCase()}`, flags: { isCutout: true } });
    }
    case "sheet": {
      const tint = materialColor(element.material);
      return addKind({ src: "gregtech/textures/blocks/materialicons/NONE/sheetmetal", tint, texture: `g-sheet-${element.material.toLowerCase()}`, label: `Листовой металл: ${materialName(element.material).toLowerCase()}` });
    }
    case "block":
      // Стекло без своей картинки в коде (BlockShieldedAccGlass и т. п.) — обычное стекло.
      if (!element.file) return /Glass/.test(element.why ?? "") ? "glass" : null;
      return addKind({ src: element.file, label: element.label ?? blockLabel(element.block ?? "", element.meta ?? 0, element.name), flags: /glass/i.test(element.file) ? { isGlass: true } : {} });
    default:
      return null;
  }
}

// ---------- Постройки ----------
const batchDir = path.join(__dirname, "batches");
const entries = fs.readdirSync(batchDir).filter((f) => f.endsWith(".cjs")).sort().flatMap((f) => require(path.join(batchDir, f)));
const machines = [];
const guides = {};
const problems = [];
const wiki = JSON.parse(fs.readFileSync(path.join(__dirname, "../audit-wiki.json"), "utf8"));
const TYPE_RU = { Imperfect: "обычный", Perfect: "идеальный", Mixed: "смешанный", Unique: "особый", None: "нет" };

for (const e of entries) {
  let m = multi(e.cls, { piece: e.piece });
  if (m.error) {
    // Ручная схема в пакете — генератору хватит её и букв из пакета.
    if (!e.layers) {
      problems.push(`${e.slug}: ${m.error}`);
      continue;
    }
    m = { elements: {}, pieceLayers: {}, file: B.fileOf.get(e.cls), overlay: null };
  }
  // Постройка из частей: compose — список { piece, repeat } сверху вниз.
  const pieceOf = (piece) => m.pieceLayers[Object.keys(m.pieceLayers).find((n) => n.includes(piece))];
  // place: части по смещениям из construct() мода — buildPiece(часть, h, v, d).
  // Клетка части (x, слой L сверху, ряд r) стоит относительно контроллера в (x − h, −(L − v), r − d).
  if (e.place) {
    const cells = new Map();
    for (const { piece, h, v, d } of e.place) {
      const p = pieceOf(piece);
      if (!p) throw new Error(`${e.slug}: нет части ${piece}`);
      p.forEach((rows, L) => rows.forEach((row, r) => [...row].forEach((ch, x) => {
        if (ch === " " || ch === "-") return;
        cells.set((e.facingUp ? [x - h, d - r, v - L] : [x - h, v - L, r - d]).join(","), ch);
      })));
    }
    const pts = [...cells.keys()].map((k) => k.split(",").map(Number));
    const [minX, minY, minZ] = [0, 1, 2].map((i) => Math.min(...pts.map((pt) => pt[i])));
    const [maxX, maxY, maxZ] = [0, 1, 2].map((i) => Math.max(...pts.map((pt) => pt[i])));
    e.layers = Array.from({ length: maxY - minY + 1 }, (_, iy) =>
      Array.from({ length: maxZ - minZ + 1 }, (_, iz) =>
        Array.from({ length: maxX - minX + 1 }, (_, ix) => cells.get([minX + ix, maxY - iy, minZ + iz].join(",")) ?? " ").join(""),
      ),
    );
  }
  const parts = e.compose ? e.compose.flatMap(({ piece, repeat = 1 }) => Array.from({ length: repeat }, () => pieceOf(piece))) : null;
  // composeAxis "z": части идут от фасада назад (бак TFFT), иначе — сверху вниз.
  let layers = e.layers ?? (parts ? (e.composeAxis === "z" ? parts[0].map((_, y) => parts.flatMap((p) => p[y])) : e.composeAxis === "x" ? parts[0].map((rows, y) => rows.map((_, z) => parts.map((p) => p[y][z]).join(""))) : parts.flat()) : m.layers);
  // Пустые слои сверху и снизу не нужны: постройка должна стоять на полу.
  while (layers.length && layers[layers.length - 1].every((r) => !r.trim() || /^[\s-]*$/.test(r))) layers = layers.slice(0, -1);
  while (layers.length && layers[0].every((r) => /^[\s-]*$/.test(r))) layers = layers.slice(1);
  layers = layers.map((rows) => rows.map((row) => row.replace(/-/g, " ")));
  // Все ряды одной ширины, все слои одной глубины.
  {
    const width = Math.max(...layers.flat().map((r) => r.length));
    const depth = Math.max(...layers.map((l) => l.length));
    layers = layers.map((l) => Array.from({ length: depth }, (_, i) => (l[i] ?? "").padEnd(width, " ")));
  }

  const elements = { ...m.elements, ...(e.elements ?? {}) };
  const charKinds = {};
  for (const [ch, el] of Object.entries(elements)) charKinds[ch] = kindOf(el, e.tier);

  // Основа контроллера: самый частый сосед «~».
  const counts = {};
  layers.forEach((rows, y) =>
    rows.forEach((row, z) =>
      [...row].forEach((ch, x) => {
        if (ch !== "~") return;
        for (const [dy, dz, dx] of [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]]) {
          const n = layers[y + dy]?.[z + dz]?.[x + dx];
          if (n && n !== " " && n !== "~" && charKinds[n]) counts[n] = (counts[n] ?? 0) + 1;
        }
      }),
    ),
  );
  const baseChar = e.controllerBase ?? Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  // controllerBase может быть и самим блоком (объектом), если рядом с контроллером такого блока нет.
  const baseKind = typeof e.controllerBase === "object" ? kindOf(e.controllerBase, e.tier) : baseChar && charKinds[baseChar];
  const baseSpec = baseKind && kinds.get(baseKind);
  // Свой рисунок (own-*) тоже годится в основу: скрипт текстур берёт его из scripts/own-blocks.mjs.
  const baseSrc = baseSpec && (textures.get(baseSpec.texture)?.src ?? (baseSpec.texture.startsWith("own-") ? baseSpec.texture : undefined));
  // Пустые буквы (люки, воздух внутри) — тем же корпусом, что вокруг контроллера.
  for (const ch of new Set(layers.flat().join(""))) {
    if (ch === " " || ch === "~") continue;
    if (!charKinds[ch]) {
      if (["air", "own"].includes(elements[ch]?.type)) layers = layers.map((rows) => rows.map((row) => row.replaceAll(ch, " ")));
      else if (baseKind) charKinds[ch] = baseKind;
      else problems.push(`${e.slug}: буква ${ch} не разобрана`);
    }
  }
  // Без своей накладки — экран контроллера, чтобы контроллер было видно.
  const overlay = e.overlay ?? m.overlay ?? "gregtech/textures/blocks/iconsets/OVERLAY_SCREEN";
  if (layers.flat().join("").includes("~")) {
    if (!baseSrc || !overlay) problems.push(`${e.slug}: контроллер без ${baseSrc ? "накладки" : "основы"}`);
    else charKinds["~"] = addKind({ id: `g${idOf(e.slug)[0].toUpperCase()}${idOf(e.slug).slice(1)}Controller`, texture: `g-${e.slug.slice(0, 20)}-ctl`, label: "Контроллер", src: baseSrc, overlay, baseSrc, face: { rule: e.facingUp ? "up" : "front", base: baseSpec.texture } });
  }
  // Цифры в схеме мешают сжатию — заменяем их свободными буквами.
  const used = new Set(layers.flat().join(""));
  const free = [..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"].filter((c) => !used.has(c));
  for (const d of [...used].filter((c) => /\d/.test(c))) {
    const c = free.shift();
    layers = layers.map((rows) => rows.map((row) => row.replaceAll(d, c)));
    charKinds[c] = charKinds[d];
    delete charKinds[d];
  }
  const present = new Set(layers.flat().join(""));
  const kindsUsed = Object.fromEntries(Object.entries(charKinds).filter(([ch, k]) => present.has(ch) && k));
  const blocks = layers.flat().join("").replace(/\s/g, "").length;
  const size = [layers[0][0].length, layers.length, layers[0].length];
  const w = wiki.find((x) => x.cls === e.cls) ?? {};
  const box = (w.size ?? "") && w;
  const facts = [
    { label: "Размер", value: size.join(" × ") },
    { label: "Блоков", value: blocks.toLocaleString("ru-RU").replace(/\u00a0/g, " ") },
    ...(e.facts ?? []),
  ];
  if (facts.length < 3) facts.push({ label: "Ярус в вики", value: w.tier || e.tier.toUpperCase() });
  machines.push({
    slug: e.slug,
    name: e.name ?? w.title,
    title: e.title,
    tier: e.tier,
    summary: e.summary,
    story: e.story,
    facts,
    source: `https://github.com/GTNewHorizons/GT5-Unofficial/blob/${TAG}/src/main/java/${m.file}`,
    packed: layers.map((rows) => rows.map((row) => row.replace(/(.)\1*/g, (run, s) => (run.length > 1 ? run.length : "") + s)).join("|")).join("/"),
    kinds: kindsUsed,
    ...(e.interior ? { interior: e.interior } : {}),
  });
  guides[e.slug] = { wiki: e.wiki ?? w.title, tips: e.tips };
  void box;
  void TYPE_RU;
}

// ---------- Запись ----------
const q = JSON.stringify;
const kindLines = [...kinds].map(([id, k]) => `  ${id}: ${q(k).replace(/"(\w+)":/g, "$1: ")},`);
fs.writeFileSync(
  path.join(SITE, "lib/gen-kinds.ts"),
  `import type { BlockKind } from "./structure";

/**
 * Виды блоков построек, выведенных генератором из исходников GT5-Unofficial ${TAG}
 * (сборка GTNH 2.9). Файл собирается заново — правки вносить в генератор.
 */
export const GEN_KINDS = {
${kindLines.join("\n")}
} satisfies Record<string, BlockKind>;
`,
);
const machineLines = machines.map((mm) => {
  const { packed, kinds: k, interior, ...rest } = mm;
  const body = Object.entries(rest).map(([key, value]) => `    ${key}: ${q(value)},`).join("\n");
  return `  {\n${body}\n    def: { layers: unpackLayers(${q(packed)}), kinds: ${q(k)}${interior ? `, interior: ${q(interior)}` : ""} },\n  },`;
});
fs.writeFileSync(
  path.join(SITE, "lib/gen-machines.ts"),
  `import type { Guide } from "./guides";
import type { Machine } from "./machines";
import { unpackLayers } from "./packed-layers";

/**
 * Постройки GTNH 2.9, выведенные генератором: схемы — из исходников GT5-Unofficial ${TAG}
 * (LGPL-3.0), ярусы — из карточек вики GTNH, тексты — по вики и книге заданий.
 * Файл собирается заново — правки вносить в генератор.
 */
export const GEN_MACHINES: readonly Machine[] = [
${machineLines.join("\n")}
];

export const GEN_GUIDES: Readonly<Record<string, Guide>> = ${q(guides, null, 2)};
`,
);
// Каждая картинка должна быть в архиве мода (список — jar-pngs.txt).
const jar = new Set(fs.readFileSync(path.join(__dirname, "../jar-pngs.txt"), "utf8").split(/\r?\n/));
for (const [file, t] of textures) for (const p of [t.src, t.overlay, t.base].filter(Boolean)) if (!jar.has(p) && !p.startsWith("own-")) problems.push(`${file}: нет картинки ${p}`);
fs.writeFileSync(path.join(SITE, "scripts/gen-textures.json"), q(Object.fromEntries(textures), null, 1));
fs.writeFileSync(path.join(__dirname, "untranslated.txt"), [...untranslated].join("\n"));
console.log("построек", machines.length, "видов", kinds.size, "текстур", textures.size, "без перевода", untranslated.size);
if (problems.length) console.log("ПРОБЛЕМЫ:\n" + problems.join("\n"));
