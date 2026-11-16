// Разбор исходников GT5-Unofficial: какой блок стоит в схеме и какой картинкой он нарисован.
const fs = require("fs");
const path = require("path");
const SRC = path.join(__dirname, "../gt5src/src/main/java");

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".java")) files.push(full);
  }
})(SRC);
const source = new Map();
const byPath = new Map();
const fileOf = new Map();
/** Все файлы с одним именем класса (бывают одноимённые в разных подмодах). */
const allByName = new Map();
for (const file of files) {
  const name = path.basename(file, ".java");
  const rel = path.relative(SRC, file).replaceAll("\\", "/");
  const text = fs.readFileSync(file, "utf8");
  byPath.set(rel, text);
  allByName.set(name, [...(allByName.get(name) ?? []), rel]);
  if (!source.has(name)) {
    source.set(name, text);
    fileOf.set(name, rel);
  }
}
/** Путь класса с учётом импортов файла, где он упомянут. */
function classPath(name, fromPath) {
  const list = allByName.get(name) ?? [];
  if (list.length < 2 || !fromPath) return list[0];
  const from = byPath.get(fromPath) ?? "";
  const imported = from.match(new RegExp(`import\\s+([\\w.]+)\\.${name}\\s*;`))?.[1]?.replaceAll(".", "/");
  const dir = path.posix.dirname(fromPath);
  return list.find((p) => imported && p.startsWith(imported + "/")) ?? list.find((p) => path.posix.dirname(p) === dir) ?? list[0];
}

/** Текст в скобках, начиная с открывающей. */
function balanced(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"') {
      i = text.indexOf('"', i + 1);
      continue;
    }
    if (ch === "(" || ch === "{" || ch === "[") depth += 1;
    else if (ch === ")" || ch === "}" || ch === "]") {
      depth -= 1;
      if (depth === 0) return text.slice(open, i + 1);
    }
  }
  return text.slice(open);
}

// Textures.BlockIcons.X = create("ФАЙЛ") → gregtech/textures/blocks/iconsets/ФАЙЛ
const iconFile = new Map();
for (const m of byPath.get("gregtech/api/enums/Textures.java").matchAll(/(\w+)\s*=\s*create(?:Optional)?\("([^"]+)"\)/g)) iconFile.set(m[1], `gregtech/textures/blocks/iconsets/${m[2]}`);
// TexturesGtBlock.X = new CustomIcon("путь") → miscutils/textures/blocks/путь
const gtppFile = new Map();
for (const m of source.get("TexturesGtBlock").matchAll(/(\w+)\s*=\s*new CustomIcon\(\s*"([^"]+)"\s*\)/g)) gtppFile.set(m[1], `miscutils/textures/blocks/${m[2]}`);

const constants = new Map();
// Строковые константы: X = "значение" (в том числе списком через запятую) и X = Y / X = A.B.Y (раскрываем цепочкой).
const aliases = new Map();
for (const [, text] of byPath) {
  for (const m of text.matchAll(/\b([A-Z][A-Z0-9_]*)\s*=\s*"([\w.-]+)"\s*[;,]/g)) if (!constants.has(m[1])) constants.set(m[1], m[2]);
  for (const m of text.matchAll(/String\s+([A-Z][A-Z0-9_]*)\s*=\s*(?:[\w]+\.)*([A-Z][A-Z0-9_]*)\s*;/g)) if (!aliases.has(m[1])) aliases.set(m[1], m[2]);
}
for (let pass = 0; pass < 4; pass += 1) for (const [name, target] of aliases) if (!constants.has(name) && constants.has(target)) constants.set(name, constants.get(target));
/** Склейка ИМЯ_КОНСТАНТЫ + ":путь" → "мод:путь". */
/** Значение константы: сначала в названном классе (Класс.ИМЯ), там же раскрываем ссылки на другие константы. */
function constantValue(owner, name, depth = 0) {
  if (depth > 5) return null;
  const text = owner && source.get(owner);
  if (text) {
    const literal = text.match(new RegExp(`\\b${name}\\s*=\\s*"([\\w.-]+)"`));
    if (literal) return literal[1];
    const ref = text.match(new RegExp(`\\b${name}\\s*=\\s*(?:([A-Z]\\w*)\\.)*?([A-Z_][A-Z0-9_]*)\\s*;`));
    if (ref) return constantValue(ref[1] ?? owner, ref[2], depth + 1) ?? constants.get(ref[2]) ?? null;
  }
  return constants.get(name) ?? null;
}
function joinConstants(expr) {
  return expr
    .replace(/(?:([A-Z]\w*)\.)?(?:[\w.]+\.)?([A-Z_][A-Z0-9_]*)\s*\+\s*"/g, (all, owner, name) => {
      const value = constantValue(owner, name);
      return value ? `"${value.toLowerCase()}` : all;
    })
    .replace(/"\s*\+\s*"/g, "");
}
/** Файл картинки по выражению вида Textures.BlockIcons.X.getIcon() / TexturesGtBlock.X / registerIcon("gregtech:iconsets/X"). */
function resolveIcon(expr, cls) {
  let m = expr.match(/BlockIcons\.(\w+)/);
  if (m && iconFile.has(m[1])) return iconFile.get(m[1]);
  m = expr.match(/TexturesGtBlock\.(\w+)/);
  if (m && gtppFile.has(m[1])) return gtppFile.get(m[1]);
  m = expr.match(/"(\w+):([\w/]+)"/);
  if (m) return `${m[1]}/textures/blocks/${m[2]}`;
  // Поле самого класса блока: X = aIconRegister.registerIcon("мод:путь")
  m = expr.match(/^\s*(\w+)\s*(?:\[\s*(\d+)\s*\])?\s*;?\s*$/);
  if (m && cls) {
    const text = joinConstants(byPath.get(cls) ?? source.get(cls) ?? "");
    const reg = text.match(new RegExp(`${m[1]}\\s*(?:\\[\\s*${m[2] ?? "\\d+"}\\s*\\])?\\s*=\\s*\\w+\\s*\\.registerIcon\\(\\s*"([\\w.-]+):([\\w/.-]+)"\\s*\\)`));
    if (reg) return `${reg[1]}/textures/blocks/${reg[2]}`;
  }
  return null;
}

// Переменная блока → класс и файл: sBlockCasings1 = new BlockCasings1(...); "имя" — первый строковый аргумент.
const blockClass = new Map();
for (const [file, text] of byPath) {
  for (const m of text.matchAll(/(?:\w+\.)?(\w+)\s*=\s*new\s+(\w+)\s*\(\s*(?:"([^"]+)")?/g)) {
    const clsPath = classPath(m[2], file);
    if (!clsPath || blockClass.has(m[1])) continue;
    if (/getIcon\(|setBlockTextureName|registerBlockIcons/.test(byPath.get(clsPath))) blockClass.set(m[1], { cls: m[2], path: clsPath, arg: m[3] });
  }
  // Блоки, созданные фабрикой: X = Класс.registerBlock()
  for (const m of text.matchAll(/(?:\w+\.)?(\w+)\s*=\s*(\w+)\.registerBlock\(/g)) {
    const clsPath = classPath(m[2], file);
    if (clsPath && !blockClass.has(m[1])) blockClass.set(m[1], { cls: m[2], path: clsPath });
  }
}

/** Тело метода (int, int) getIcon; если он лишь вызывает другой метод — тело того. */
function iconMethodBody(text) {
  const at = text.search(/public\s+(?:static\s+)?IIcon\s+getIcon\s*\(\s*(?:final\s+)?int\s+\w+\s*,\s*(?:final\s+)?int/);
  if (at < 0) return null;
  let body = balanced(text, text.indexOf("{", at));
  const call = !/case\s/.test(body) && body.match(/return\s+(\w+)\s*\(/);
  if (call) {
    const helper = text.search(new RegExp(`IIcon\\s+${call[1]}\\s*\\(`));
    if (helper >= 0) body = balanced(text, text.indexOf("{", helper));
  }
  return body;
}

/** Картинка блока с номером meta: ищем ветку switch в getIcon класса (боковая грань). */
function blockTexture(blockVar, meta) {
  const entry = blockClass.get(blockVar.split(".").pop());
  if (!entry) return { file: null, why: `класс блока ${blockVar} не найден` };
  const { cls, path: clsPath } = entry;
  const text = byPath.get(clsPath);
  // Блок без своего getIcon: setBlockTextureName(МОД + ":casing." + name), имя — в конструкторе.
  const named = joinConstants(text).match(/setBlockTextureName\(\s*"([\w.-]+):([\w/.-]*)"\s*\+\s*name\s*\)/);
  if (named && !/IIcon\s+getIcon\s*\(\s*(?:final\s+)?int/.test(text) && entry.arg) {
    return { file: `${named[1]}/textures/blocks/${named[2]}${entry.arg}`, cls };
  }
  // Имена текстур переданы массивом в конструктор: new Класс("имя", new String[] { "мод:путь", ... }).
  const varName = blockVar.split(".").pop();
  for (const [, t] of byPath) {
    const decl = t.match(new RegExp(`\\b${varName}\\s*=\\s*new\\s+${cls}\\(\\s*"[^"]*"\\s*,\\s*new\\s+String\\[\\]\\s*\\{([^}]*)\\}`));
    if (!decl) continue;
    const names = [...joinConstants(decl[1]).matchAll(/"([\w.-]+):([\w/.-]+)"/g)];
    const pick = names[meta] ?? names[0];
    if (pick) return { file: `${pick[1]}/textures/blocks/${pick[2]}`, cls };
  }
  // Картинки по массиву имён: names = { "A", "B" }, registerIcon(ПРЕФИКС + ":папка/" + names[i] + "_Side").
  const namesList = text.match(/\bnames\s*=\s*\{([^}]*)\}/)?.[1].match(/"([^"]+)"/g)?.map((s) => s.slice(1, -1));
  if (namesList?.[meta]) {
    const calls = [...joinConstants(text).matchAll(/registerIcon\(\s*"([\w.-]+):([\w/.-]*)"\s*\+\s*names\[\s*i\s*\](?:\s*\+\s*"([\w.-]*)")?\s*\)/g)];
    const side = calls.find((c) => c[3]) ?? calls[0];
    if (side) return { file: `${side[1]}/textures/blocks/${side[2]}${namesList[meta]}${side[3] ?? ""}`, cls };
  }
  // Имя текстуры задано прямо: setBlockTextureName("мод:имя").
  const literal = joinConstants(text).match(/setBlockTextureName\(\s*"([\w.-]+):([\w/.-]+)"\s*\)/);
  if (literal && !/IIcon\s+getIcon\s*\(\s*(?:final\s+)?int/.test(text)) return { file: `${literal[1]}/textures/blocks/${literal[2]}`, cls };
  // Бетон: Textures.BlockIcons.CONCRETES[meta].
  if (/CONCRETES\s*\[/.test(text)) {
    const list = byPath.get("gregtech/api/enums/Textures.java").match(/CONCRETES\s*=\s*\{([^}]*)\}/)?.[1].split(",").map((s) => s.trim());
    if (list?.[meta] && iconFile.has(list[meta])) return { file: iconFile.get(list[meta]), cls };
  }
  const body = iconMethodBody(text);
  if (!body) return { file: null, why: `${cls}: нет getIcon` };
  // Корпуса машин ярусов (BlockCasings1, 0–9): картинка MACHINE_<ярус>_SIDE.
  const TIERS = ["ULV", "LV", "MV", "HV", "EV", "IV", "LuV", "ZPM", "UV", "UHV"];
  // Ярусные корпуса GT++ (GregtechMetaTieredCasingBlocks): тоже корпус машины яруса.
  if (/TieredCasing/.test(cls) && meta < TIERS.length) return { file: `gregtech/textures/blocks/iconsets/MACHINE_${TIERS[meta]}_SIDE`, cls };
  if (cls === "BlockCasings1" && meta < TIERS.length) return { file: `gregtech/textures/blocks/iconsets/MACHINE_${TIERS[meta]}_SIDE`, cls };
  // case 10, 14 -> … — несколько номеров в одной ветке.
  let caseAt = body.search(new RegExp(`case\\s+(?:\\d+\\s*,\\s*)*${meta}(?:\\s*,\\s*\\d+)*\\s*(->|:)`));
  if (caseAt < 0) caseAt = body.search(/default\s*(->|:)/);
  // getIcon без switch — одна картинка на все номера.
  if (caseAt < 0 && !/case\s/.test(body)) {
    const one = body.match(/BlockIcons\.\w+|TexturesGtBlock\.\w+/)?.[0];
    const file = one && resolveIcon(one, clsPath);
    if (file) return { file, cls };
  }
  if (caseAt < 0) return { file: null, why: `${cls}: нет case ${meta}` };
  const rest = body.slice(caseAt);
  // Ветка с вложенным switch по стороне: берём весь вложенный блок целиком.
  const inner = rest.slice(0, 80).match(/^[^;{]*?(?:->\s*)?(?:\{\s*)?(?:return\s+)?switch\s*\([^)]*\)\s*\{/);
  const next = inner ? -1 : rest.slice(4).search(/case\s+\d+\s*(->|:)|default\s*(->|:)/);
  const branch = inner ? balanced(rest, rest.indexOf("{", rest.indexOf("switch"))) : next < 0 ? rest : rest.slice(0, next + 4);
  // Боковая грань: последнее выражение ветки (условия обычно сначала про верх и низ).
  const icons = [...branch.matchAll(/(BlockIcons\.\w+|TexturesGtBlock\.\w+|"\w+:[\w/]+"|(?:->|return|yield|:)\s*(\w+)\s*(?:\[\s*\d+\s*\])?\s*;)/g)].map((m) => m[0]);
  for (const expr of icons.reverse()) {
    const file = resolveIcon(expr.replace(/^(->|return|yield|:)\s*/, ""), clsPath);
    if (file) return { file, cls };
  }
  return { file: null, why: `${cls} case ${meta}: картинка не распознана: ${branch.slice(0, 120).replace(/\s+/g, " ")}` };
}

// Casings.ИМЯ → (блок, номер)
const casings = new Map();
for (const m of byPath.get("gregtech/api/casing/Casings.java").matchAll(/^\s*(\w+)\s*\n?\s*\(\s*\(\)\s*->\s*([\w.]+)\s*,\s*(\d+)/gm)) casings.set(m[1], { block: m[2], meta: Number(m[3]) });

module.exports = { byPath, classPath, source, fileOf, balanced, blockTexture, casings, resolveIcon, iconFile, gtppFile, blockClass };

if (require.main === module) {
  for (const name of ["FridgeCasing", "HearthCasing", "ThermalContainmentCasing", "RadiantNaquadahAlloyCasing", "HeatProofMachineCasing", "ChemicallyInertMachineCasing", "FusionCoilBlock", "InfiniteSpacetimeEnergyBoundaryCasing"]) {
    const c = casings.get(name);
    console.log(name, c, c && blockTexture(c.block, c.meta));
  }
  console.log("блоков-классов", blockClass.size, "Casings", casings.size);
}
