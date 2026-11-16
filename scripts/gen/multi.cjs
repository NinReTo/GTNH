// Постройка по классу контроллера: схема (слои сверху вниз, ряды от фасада), блоки по буквам, контроллер.
const fs = require("fs");
const path = require("path");
const B = require("./blocks.cjs");

/** Все String[][] в выражении; склейка "a" + "b"; поддержка ссылок на поля String[][] класса. */
function parseShape(expr, text) {
  const at = expr.indexOf("new String[][]");
  let body;
  if (at >= 0) body = B.balanced(expr, expr.indexOf("{", at));
  else {
    // Поле этого класса или Класс.ПОЛЕ другого класса.
    const other = expr.match(/\b([A-Z]\w+)\.([A-Z_][A-Z0-9_]*)\b/);
    const source = other && B.source.has(other[1]) ? B.source.get(other[1]) : text;
    const names = other && B.source.has(other[1]) ? [other[2]] : expr.match(/\b([A-Z_a-z]\w*)\b(?!\s*\()/g) ?? [];
    const ref = names.find((name) => new RegExp(`String\\[\\]\\[\\]\\s+${name}\\s*=`).test(source));
    if (!ref) return null;
    const def = source.slice(source.search(new RegExp(`String\\[\\]\\[\\]\\s+${ref}\\s*=`)));
    body = B.balanced(def, def.indexOf("{"));
    text = source;
  }
  // Слои-переменные: { L0, L1, ... }, где String[] L0 = { "...", ... }.
  body = body.replace(/(^\{|,)\s*([A-Za-z_]\w*)\s*(?=,|\})/g, (all, lead, name) => {
    const def = text.match(new RegExp(`String\\[\\]\\s+${name}\\s*=\\s*(?:new\\s+String\\[\\]\\s*)?`));
    if (!def) return all;
    const from = text.indexOf("{", def.index);
    return `${lead}${B.balanced(text, from)}`;
  });
  const layers = [];
  let layer = null;
  let pending = null;
  let depth = 0;
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i];
    if (ch === '"') {
      const end = body.indexOf('"', i + 1);
      pending = (pending ?? "") + body.slice(i + 1, end);
      i = end;
      continue;
    }
    if (ch === "/" && body[i + 1] === "/") {
      i = body.indexOf("\n", i);
      continue;
    }
    if ((ch === "," || ch === "}") && pending !== null) {
      layer.push(pending);
      pending = null;
    }
    if (ch === "{") {
      depth += 1;
      if (depth === 2) layer = [];
    } else if (ch === "}") {
      if (depth === 2) layers.push(layer);
      depth -= 1;
    }
  }
  return layers;
}

function definitionText(text) {
  // Нужен тот .builder(), за которым сразу идёт .addShape (в файле бывают и другие билдеры).
  const start = [...text.matchAll(/\.builder\(\)|StructureDefinition\s*\.\s*<[^>]+>\s*builder\(\)/g)].map((m) => m.index).find((i) => /^[^;]{0,1500}?\.addShape\s*\(/.test(text.slice(i)));
  if (start === undefined) return null;
  // Конец определения — .build() вне вложенных скобок (внутри элементов бывают свои .build()).
  let depth = 0;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"') {
      i = text.indexOf('"', i + 1);
      continue;
    }
    if (ch === "(" || ch === "{") depth += 1;
    else if (ch === ")" || ch === "}") {
      depth -= 1;
      if (depth < 0) return text.slice(start, i);
    } else if (depth === 0 && text.startsWith(".build()", i)) return text.slice(start, i);
  }
  return text.slice(start);
}

/** Что возвращает метод без аргументов getX() в классе или его предках. */
function methodReturn(cls, name) {
  for (let c = cls, depth = 0; c && depth < 6; depth += 1) {
    const text = B.source.get(c);
    if (!text) return null;
    const m = text.match(new RegExp(`\\b${name}\\s*\\(\\s*\\)\\s*\\{\\s*return\\s+([^;]+);`));
    if (m) return m[1].trim();
    c = text.match(new RegExp(`class\\s+${c}\\b[^{]*?extends\\s+(\\w+)`))?.[1];
  }
  return null;
}

/** Блок, который стоит на месте буквы. */
function resolveElement(expr, text, cls) {
  const chain = expr.match(/buildAndChain\(([\s\S]*)\)\s*$/);
  const core = (chain ? chain[1] : expr)
    // getCasingBlock() → то, что метод возвращает (в классе или предках).
    .replace(/(?:\b\w\.|this\.)?(get\w+)\(\)/g, (all, name) => methodReturn(cls, name) ?? all)
    // Поле-константа класса: CASING.asElement(), где CASING = Casings.X.
    .replace(/\b([A-Z][A-Z0-9_]*)\b(?=\s*\.asElement)/g, (all, name) => B.source.get(cls)?.match(new RegExp(`\\b${name}\\s*=\\s*(Casings\\.\\w+)\\s*;`))?.[1] ?? all)
    .replace(/\(\s*(?:byte|int|short)\s*\)\s*/g, "")
    .replace(/ofBlockAnyMeta\(\s*([\w.]+)\s*\)/g, "ofBlock($1, 0)")
    .replace(/ofBlockAnyMeta\(\s*([\w.]+)\s*,\s*(\d+)\s*\)/g, "ofBlock($1, $2)");
  let m;
  if (/chainItemPipeCasings|ofItemPipe/.test(core)) return { type: "pipe" };
  // Ванильные блоки (лава, вода, земля, лампа): их текстуры брать нельзя — на сайте свои рисунки (scripts/own-blocks.mjs).
  if (/\bBlocks\.(?:lava|flowing_lava|water|flowing_water|dirt|farmland|grass|redstone_lamp|lit_redstone_lamp|glowstone|stone|cobblestone|sand|gravel|obsidian|iron_block|air|leaves|leaves2|log|log2|sapling)\b|TILLED_DIRT_BLOCK/.test(core)) return { type: "own", name: core.match(/\bBlocks\.(\w+)/)?.[1] ?? "farmland" };
  if (/Glass|glass/.test(core) && !/Casings\.\w*Glass\w*/.test(core)) return { type: "glass" };
  // ItemList.Casing_X → блок и номер, которыми его регистрирует класс блока.
  if ((m = core.match(/ItemList\.(Casing_\w+)/))) {
    for (const [file, t] of B.byPath) {
      const reg =
        t.match(new RegExp(`ItemList\\.${m[1]}\\.set\\(\\s*new\\s+ItemStack\\(\\s*this\\s*,\\s*1\\s*,\\s*(\\d+)\\s*\\)`)) ??
        t.match(new RegExp(`register\\(\\s*(\\d+)\\s*,\\s*ItemList\\.${m[1]}\\b`));
      if (!reg) continue;
      const entry = [...B.blockClass.entries()].find(([, v]) => v.path === file);
      if (entry) return { type: "block", block: entry[0], meta: Number(reg[1]), ...B.blockTexture(entry[0], Number(reg[1])) };
    }
  }
  if ((m = core.match(/ofFrame\(\s*(?:\w+\.)?(?:Materials|MaterialsAlloy|MaterialsElements)\.(?:getInstance\(\)\.)?(\w+)/))) return { type: "frame", material: m[1] };
  if (/sBlockFrames|FrameBox/.test(core)) return { type: "frame", material: "Steel" };
  // Блок металла: sBlockMetalN, номер — индекс в списке материалов при регистрации.
  if ((m = core.match(/(sBlockMetal\d+)\s*,\s*(\d+)/))) {
    const reg = B.byPath.get("gregtech/loaders/preload/LoaderGTBlockFluid.java")?.match(new RegExp(`${m[1]}\\s*=\\s*new\\s+BlockMetal\\([^{]*\\{([^}]*)\\}`));
    const material = reg?.[1].match(/Materials\.(\w+)/g)?.[Number(m[2])]?.split(".")[1];
    if (material) return { type: "metal", material };
  }
  // Корпус материала bartworks: общая картинка, окрашенная в цвет материала (цвет — в ручных правках).
  if ((m = core.match(/WerkstoffLoader\.(BWBlockCasings(Advanced)?)/))) return { type: "bwcasing", advanced: Boolean(m[2]) };
  if (/ofCoil|HEATING_COIL|activeCoils\(\s*ofCoil/.test(core)) return { type: "coil" };
  if (/ofSolenoidCoil|SOLENOID/.test(core)) return { type: "solenoid" };
  if ((m = core.match(/Casings\.(\w+)/)) && B.casings.has(m[1])) {
    const c = B.casings.get(m[1]);
    return { type: "block", block: c.block, meta: c.meta, name: m[1], ...B.blockTexture(c.block, c.meta) };
  }
  if ((m = core.match(/ofFrame\(\s*Materials\.(\w+)/))) return { type: "frame", material: m[1] };
  if ((m = core.match(/ofSheetMetal\(\s*(?:Materials|\w+)\.(\w+)/))) return { type: "sheet", material: m[1] };
  if ((m = core.match(/(?:ofBlock|Pair\.of)\(\s*([\w.]+)\s*,\s*(\d+)\s*\)/))) return { type: "block", block: m[1], meta: Number(m[2]), ...B.blockTexture(m[1], Number(m[2])) };
  if ((m = core.match(/ofBlock\(\s*([\w.]+)\s*,\s*(\w+)\s*\)/))) {
    const meta = text.match(new RegExp(`int\\s+${m[2]}\\s*=\\s*(\\d+)`))?.[1];
    if (meta) return { type: "block", block: m[1], meta: Number(meta), ...B.blockTexture(m[1], Number(meta)) };
  }
  if ((m = core.match(/([\w.]*(?:[Bb]lock|Casing)\w*)\s*,\s*(\d+)\s*\)?\s*$/)) && !/Texture|Index/.test(m[1])) return { type: "block", block: m[1], meta: Number(m[2]), ...B.blockTexture(m[1], Number(m[2])) };
  // Только люк: корпус под ним — ((BlockCasingsN) sBlockCasingsN).getTextureIndex(M).
  if ((m = core.match(/\(\s*\(\s*\w+\s*\)\s*([\w.]+)\s*\)\s*\.getTextureIndex\(\s*(\d+)\s*\)/))) return { type: "block", block: m[1], meta: Number(m[2]), ...B.blockTexture(m[1], Number(m[2])) };
  if (/isAir|ofChar|air/i.test(core)) return { type: "air" };
  return { type: "unknown", expr: core.replace(/\s+/g, " ").slice(0, 200) };
}

function controllerOverlay(text) {
  const names = [...text.matchAll(/\b(OVERLAY_\w+?_ACTIVE)\b(?!_GLOW)/g)].map((m) => m[1]);
  for (const name of names) if (B.iconFile.has(name)) return B.iconFile.get(name);
  const gtpp = [...text.matchAll(/TexturesGtBlock\.(\w+Active)\b/g)].map((m) => m[1]);
  for (const name of gtpp) if (B.gtppFile.has(name)) return B.gtppFile.get(name);
  const custom = text.match(/\.custom\([^,]+,\s*"(iconsets\/\w+_ACTIVE)"\s*\)/);
  if (custom) return `gregtech/textures/blocks/${custom[1]}`;
  if (/extends\s+TTMultiblockBase|package\s+tectech\./.test(text)) return "gregtech/textures/blocks/iconsets/EM_CONTROLLER_ACTIVE";
  const any = [...text.matchAll(/\b(OVERLAY_[A-Z0-9_]+)\b/g)].map((m) => m[1]).find((name) => B.iconFile.has(name) && !/GLOW/.test(name));
  return any ? B.iconFile.get(any) : null;
}

function multi(cls, { piece } = {}) {
  const text = B.source.get(cls);
  if (!text) throw new Error(`нет класса ${cls}`);
  // Схема бывает объявлена в родительском классе (XL-турбины, буровые).
  let def = definitionText(text);
  let defText = text;
  for (let c = cls, depth = 0; !def && c && depth < 5; depth += 1) {
    c = B.source.get(c)?.match(new RegExp(`class\\s+${c}\\b[^{]*?extends\\s+(\\w+)`))?.[1];
    if (c && B.source.has(c)) {
      def = definitionText(B.source.get(c));
      defText = B.source.get(c);
    }
  }
  if (!def) return { cls, error: "нет StructureDefinition" };
  const shapes = [];
  for (const m of def.matchAll(/\.addShape\(/g)) {
    const call = B.balanced(def, m.index + ".addShape".length);
    const name = call.slice(1, call.indexOf(",")).trim();
    const expr = call.slice(call.indexOf(",") + 1);
    // Схема из поля: String[][] ПОЛЕ = transpose(...) — поворот смотрим в объявлении поля.
    const field = !expr.includes("new String[][]") && expr.match(/\b([A-Za-z_]\w*)\b/g)?.find((n) => new RegExp(`String\\[\\]\\[\\]\\s+${n}\\s*=`).test(text));
    const fieldDef = field ? defText.slice(defText.search(new RegExp(`String\\[\\]\\[\\]\\s+${field}\\s*=`))).slice(0, 200) : "";
    shapes.push({ name, transposed: /transpose\s*\(/.test(expr) || /=\s*(?:\w+\.)?transpose\s*\(/.test(fieldDef), layers: parseShape(expr, defText) });
  }
  const fresh = shapes.filter((s) => !/LEGACY|OLD|HINT/i.test(s.name));
  const chosen = (piece && shapes.find((s) => s.name.includes(piece))) || fresh.find((s) => /MAIN|main/.test(s.name)) || fresh[0] || shapes[0];
  if (!chosen?.layers) return { cls, error: "схема не разобрана", shapes: shapes.map((s) => s.name) };
  const elements = {};
  for (const m of def.matchAll(/\.addElement\(\s*'(.)'\s*,/g)) {
    const call = B.balanced(def, m.index + ".addElement".length);
    elements[m[1]] = resolveElement(call.slice(call.indexOf(",") + 1, -1).trim(), text, cls);
  }
  // Слои каждой части — для построек, собираемых из нескольких частей.
  // Срезы бывают разной высоты и ширины — недостающее заполняем пробелами.
  const pad = (layers) => {
    const width = Math.max(...layers.flat().map((r) => r.length));
    const depth = Math.max(...layers.map((l) => l.length));
    return layers.map((l) => Array.from({ length: depth }, (_, i) => (l[i] ?? "").padEnd(width, " ")));
  };
  const toLayers = (s) => {
    if (!s.layers || !s.layers.length) return null;
    if (s.transposed) return pad(s.layers);
    const height = Math.max(...s.layers.map((slice) => slice.length));
    return pad(Array.from({ length: height }, (_, y) => s.layers.map((slice) => slice[y] ?? "")));
  };
  const layers = toLayers(chosen);
  const pieceLayers = Object.fromEntries(shapes.map((s) => [s.name, toLayers(s)]));
  const used = new Set(Object.values(pieceLayers).filter(Boolean).flat(2).join("").replace(/[\s~-]/g, ""));
  return {
    cls,
    file: B.fileOf.get(cls),
    piece: chosen.name,
    pieces: shapes.map((s) => s.name),
    size: [layers[0][0].length, layers.length, layers[0].length],
    blocks: layers.flat().join("").replace(/[\s-]/g, "").length,
    layers,
    pieceLayers,
    elements: Object.fromEntries(Object.entries(elements).filter(([ch]) => used.has(ch))),
    missing: [...used].filter((ch) => !elements[ch]),
    overlay: controllerOverlay(text),
  };
}

module.exports = { multi };

if (require.main === module) {
  for (const cls of process.argv.slice(2)) {
    const r = multi(cls);
    console.log(JSON.stringify({ ...r, layers: undefined }, null, 1).slice(0, 2500));
  }
}
