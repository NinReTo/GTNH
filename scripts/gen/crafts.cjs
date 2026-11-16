// Цепочки главного металла яруса: от сырья до слитка, по машинам. Цвета — из MaterialsInit.java и WerkstoffLoader.java.
// Пишет lib/gen-crafts.ts и scripts/gen-items.json (значки предметов для scripts/fetch-textures.mjs).
const fs = require("fs");
const path = require("path");
const SITE = process.argv[2] ?? path.join(__dirname, "../..");
const SRC = path.join(__dirname, "../gt5src/src/main/java");
const TAG = "5.09.54.265";
const loader = fs.readFileSync(path.join(SRC, "gregtech/loaders/load/MTERecipeLoader.java"), "utf8");
const init = fs.readFileSync(path.join(SRC, "gregtech/loaders/materials/MaterialsInit.java"), "utf8");
const jar = new Set(fs.readFileSync(path.join(__dirname, "../jar-pngs.txt"), "utf8").split(/\r?\n/));

function color(name) {
  const fn = init.match(new RegExp(`Materials\\.${name}\\s*=\\s*(\\w+)\\(\\)`))?.[1];
  const body = fn ? init.slice(init.indexOf(`Materials ${fn}()`)).slice(0, 1500) : "";
  const argb = body.match(/setARGB\(\s*0x([0-9a-fA-F]{6,8})/)?.[1];
  if (argb) return [0, 2, 4].map((i) => parseInt(argb.slice(-6).slice(i, i + 2), 16));
  const rgb = body.match(/setRGBA?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) return rgb.slice(1, 4).map(Number);
  throw new Error(`нет цвета: ${name}`);
}

// Имя материала в коде → [русское имя, чей цвет брать].
const NAMES = {
  Bronze: "бронза", Steel: "сталь", Aluminium: "алюминий", StainlessSteel: "нержавеющая сталь", Titanium: "титан",
  TungstenSteel: "вольфрамовая сталь", RhodiumPlatedPalladium: "палладий с родиевым покрытием", Iridium: "иридий",
  Osmium: "осмий", Neutronium: "нейтроний", Tin: "олово", AnyCopper: "медь", Gold: "золото", Tungsten: "вольфрам",
  VanadiumGallium: "ванадий-галлий", Naquadah: "наквада", NaquadahAlloy: "сплав наквады", SuperconductorUV: "сверхпроводник UV",
  WroughtIron: "кованое железо", CastIron: "чугун", Copper: "медь", Iron: "железо", Lead: "свинец", Wood: "дерево", PolyvinylChloride: "ПВХ", Epoxid: "эпоксидная смола", Plastic: "полиэтилен", AnyIron: "железо", Polyethylene: "полиэтилен", Polytetrafluoroethylene: "тефлон",
  Polybenzimidazole: "полибензимидазол", Polyvinylchloride: "ПВХ",
};
// Цвет палладия с родиевым покрытием в моде — цвет хрома (WerkstoffLoader.RhodiumPlatedPalladium).
const COLOR_OF = { RhodiumPlatedPalladium: "Chrome", AnyCopper: "Copper", AnyIron: "Iron" };
const russian = (name) => NAMES[name] ?? (() => { throw new Error(`нет имени: ${name}`); })();

const items = {};
const pick = (...candidates) => candidates.find((c) => jar.has(c)) ?? (() => { throw new Error(`нет значка: ${candidates[0]}`); })();
const ICONS = {
  plate: pick("gregtech/textures/items/materialicons/METALLIC/plate"),
  ingot: pick("gregtech/textures/items/materialicons/METALLIC/ingot"),
  cable: pick("gregtech/textures/blocks/materialicons/NONE/wire"),
  wrench: pick("gregtech/textures/items/materialicons/NONE/toolWrench"),
  hammer: pick("gregtech/textures/items/materialicons/NONE/toolHeadHammer"),
};
const WORDS = { plate: "Пластина", ingot: "Слиток", cable: "Кабель" };
function item(kind, material) {
  const file = `i-${kind}-${material.toLowerCase()}`.slice(0, 30);
  items[file] = { src: ICONS[kind], tint: color(COLOR_OF[material] ?? material) };
  return { icon: file, label: `${WORDS[kind]}: ${russian(material)}` };
}
function tool(kind, label) {
  items[`i-${kind}`] = { src: ICONS[kind], tint: color("Steel") };
  return { icon: `i-${kind}`, label };
}
const block = (icon, label) => ({ icon, label });

/** Материал из 'X', OrePrefixes.prefix.get(Materials.Name) или WerkstoffLoader.Name. */
function materialOf(body, letter) {
  const m = body.match(new RegExp(`'${letter}',\\s*(?:OrePrefixes\\.\\w+\\s*\\.get\\(\\s*)?(?:Materials|WerkstoffLoader)\\.(\\w+)`));
  if (!m) throw new Error(`нет материала ${letter}: ${body.slice(0, 200)}`);
  return m[1];
}
const recipe = (name) => {
  const at = loader.indexOf(`ItemList.${name}.get(1L),`);
  if (at < 0) throw new Error(`нет рецепта ${name}`);
  return loader.slice(at, loader.indexOf("});", at));
};
const rows = (pattern, map) => pattern.map((row) => [...row].map((ch) => map[ch] ?? null));

const TIERS = [
  ["lv", "LV"], ["mv", "MV"], ["hv", "HV"], ["ev", "EV"], ["iv", "IV"], ["luv", "LuV"], ["zpm", "ZPM"], ["uv", "UV"], ["uhv", "MAX"],
];
// Кабели из рецептов корпусов машин нужны линиям производства (lib/machines.ts: cableLv…cableUv).
for (const [, code] of TIERS.slice(0, -1)) item("cable", materialOf(recipe(`Hull_${code}`), "C"));

// Цепочки «от сырья до слитка». Рецепты — из исходников GT5-Unofficial (вместе с bartworks, gtnhlanth,
// goodgenerator) и BlastFurnaceRecipes.java мода-ядра GTNH; в скобках у шагов — файл, где рецепт.
const FORMS = {
  dust: ["gregtech/textures/items/materialicons/METALLIC/dust"],
  ingot: ["gregtech/textures/items/materialicons/METALLIC/ingot"],
  hot: ["gregtech/textures/items/materialicons/NONE/ingotHot"],
  crushed: ["gregtech/textures/items/materialicons/NONE/crushedPurified"],
  ore: ["gregtech/textures/blocks/materialicons/METALLIC/ore"],
  gem: ["gregtech/textures/items/materialicons/LIGNITE/gem"],
  cell: ["gregtech/textures/items/materialicons/FLUID/cell", "gregtech/textures/items/materialicons/FLUID/cell_OVERLAY"],
};
const hex = (value) => [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
/** Значок вещества: форма (пыль, слиток, капсула…) в цвет материала мода; colour — имя в MaterialsInit или "#rrggbb". */
function stuff(form, id, colour, label) {
  const file = `c-${form}-${id}`;
  const [src, overlay] = FORMS[form].map(pick);
  items[file] = { src, tint: colour.startsWith("#") ? hex(colour.slice(1)) : color(colour), ...(overlay ? { overlay } : {}) };
  return (count, note) => ({ icon: file, label: `${label}${note ? ` ${note}` : count > 1 ? ` × ${count}` : ""}`, ...(count > 1 ? { count } : {}) });
}
/** Шаг цепочки: входы по три в ряд, как в окне машины. */
function step(title, station, inputs, output, note) {
  const grid = [];
  for (let i = 0; i < inputs.length; i += 3) grid.push(inputs.slice(i, i + 3));
  return { title, station, grid, output, ...(note ? { note } : {}) };
}
const S = {
  copper: stuff("ingot", "copper", "Copper", "Медь"), tin: stuff("ingot", "tin", "Tin", "Олово"), bronze: stuff("ingot", "bronze", "Bronze", "Бронза"),
  coal: stuff("gem", "coal", "Coal", "Уголь"), coke: stuff("gem", "coke", "#404040", "Кокс") /* кокс — предмет Railcraft, своего цвета в GregTech нет */, iron: stuff("ingot", "iron", "Iron", "Железо"),
  steel: stuff("ingot", "steel", "Steel", "Сталь"), ironDust: stuff("dust", "iron", "Iron", "Железная пыль"), carbon: stuff("dust", "carbon", "Carbon", "Углерод"),
  oxygen: stuff("cell", "oxygen", "Oxygen", "Кислород"), ruby: stuff("dust", "ruby", "Ruby", "Рубиновая пыль"), alumina: stuff("dust", "alumina", "#EBFFFF", "Оксид алюминия"),
  aluminium: stuff("ingot", "aluminium", "Aluminium", "Алюминий"), nickel: stuff("dust", "nickel", "Nickel", "Никель"), invar: stuff("dust", "invar", "Invar", "Инвар"),
  manganese: stuff("dust", "manganese", "Manganese", "Марганец"), chrome: stuff("dust", "chrome", "Chrome", "Хром"), stainlessDust: stuff("dust", "stainless", "StainlessSteel", "Пыль нержавеющей стали"),
  stainless: stuff("ingot", "stainless", "StainlessSteel", "Нержавеющая сталь"), ilmenite: stuff("crushed", "ilmenite", "#463732", "Очищенный дроблёный ильменит"),
  sulfuric: stuff("cell", "sulfuric", "SulfuricAcid", "Серная кислота"), rutile: stuff("dust", "rutile", "#D40D5C", "Рутил"), chlorine: stuff("cell", "chlorine", "Chlorine", "Хлор"),
  ticl4: stuff("cell", "ticl4", "#D40D5C", "Тетрахлорид титана"), magnesium: stuff("dust", "magnesium", "Magnesium", "Магний"), mgcl2: stuff("dust", "mgcl2", "#D40D5C", "Хлорид магния"),
  sodium: stuff("dust", "sodium", "Sodium", "Натрий"), hotTitanium: stuff("hot", "titanium", "Titanium", "Раскалённый титан"), titanium: stuff("ingot", "titanium", "Titanium", "Титан"),
  scheelite: stuff("dust", "scheelite", "#C88C14", "Шеелит"), hcl: stuff("cell", "hcl", "HydrochloricAcid", "Соляная кислота"), tungsticAcid: stuff("dust", "tungstic", "#F5F116", "Вольфрамовая кислота"),
  wo3: stuff("dust", "wo3", "#0F0516", "Триоксид вольфрама"), hydrogen: stuff("cell", "hydrogen", "Hydrogen", "Водород"), tungsten: stuff("dust", "tungsten", "Tungsten", "Вольфрам"),
  steelDust: stuff("dust", "steel", "Steel", "Стальная пыль"), wsteelDust: stuff("dust", "wsteel", "TungstenSteel", "Пыль вольфрамовой стали"),
  hotWsteel: stuff("hot", "wsteel", "TungstenSteel", "Раскалённая вольфрамовая сталь"), wsteel: stuff("ingot", "wsteel", "TungstenSteel", "Вольфрамовая сталь"),
  ore: stuff("crushed", "chalcopyrite", "Chalcopyrite", "Очищенная дроблёная руда: халькопирит, пентландит, тетраэдрит или куперит"),
  aquaRegia: stuff("cell", "aquaregia", "#FFB132", "Царская водка"), ptConcentrate: stuff("cell", "ptconc", "#FFFFC8", "Платиновый концентрат"),
  nh4cl: stuff("cell", "nh4cl", "#FFFFFF", "Хлорид аммония"), pdAmmonia: stuff("cell", "pdammonia", "#B1B1B1", "Палладий в аммиаке"), pdRaw: stuff("dust", "pdraw", "#B1B1B1", "Осаждённый палладий"),
  formic: stuff("cell", "formic", "#FFAA77", "Муравьиная кислота"), palladium: stuff("dust", "palladium", "Palladium", "Палладий"), ptResidue: stuff("dust", "ptresidue", "#64632E", "Платиновый остаток"),
  rhSulfate: stuff("cell", "rhsulfate", "#EEAA55", "Сульфат родия"), rhodium: stuff("dust", "rhodium", "#F4F4F4", "Родий"), rppDust: stuff("dust", "rpp", "#FFE6E6", "Пыль палладия с родиевым покрытием"),
  hotRpp: stuff("hot", "rpp", "#FFE6E6", "Раскалённый палладий с родиевым покрытием"), rpp: stuff("ingot", "rpp", "#FFE6E6", "Палладий с родиевым покрытием"),
  leach: stuff("dust", "leach", "#644629", "Выщелоченный остаток"), saltpeter: stuff("dust", "saltpeter", "Saltpeter", "Селитра"), saltWater: stuff("cell", "saltwater", "SaltWater", "Солёная вода"),
  rarest: stuff("dust", "rarest", "#644629", "Остаток редчайших металлов"), irResidue: stuff("dust", "irresidue", "#846649", "Иридиевый остаток"),
  osAcid: stuff("cell", "osacid", "#846649", "Кислый раствор осмия"), osSolution: stuff("cell", "ossolution", "#846649", "Раствор осмия"), osmium: stuff("dust", "osmium", "Osmium", "Осмий"),
  hotOsmium: stuff("hot", "osmium", "Osmium", "Раскалённый осмий"), osmiumIngot: stuff("ingot", "osmium", "Osmium", "Осмий"),
  irO2: stuff("dust", "iro2", "#846649", "Диоксид иридия"), irAcid: stuff("cell", "iracid", "#846649", "Кислый раствор иридия"), irCl: stuff("dust", "ircl", "#846649", "Хлорид иридия"),
  calcium: stuff("dust", "calcium", "Calcium", "Кальций"), iridium: stuff("dust", "iridium", "Iridium", "Иридий"), hotIridium: stuff("hot", "iridium", "Iridium", "Раскалённый иридий"),
  iridiumIngot: stuff("ingot", "iridium", "Iridium", "Иридий"), lutetium: stuff("cell", "lutetium", "Lutetium", "Жидкий лютеций"), chromeFluid: stuff("cell", "chrome", "Chrome", "Жидкий хром"),
  americium: stuff("cell", "americium", "Americium", "Жидкий америций"), nqEarth: stuff("dust", "nqearth", "#4D4D55", "Наквадриевая земля"), phosphoric: stuff("cell", "phosphoric", "PhosphoricAcid", "Фосфорная кислота"),
  nqPhosphate: stuff("dust", "nqphosphate", "#4D4D55", "Фосфат наквадрии"), nqSolution: stuff("cell", "nqsolution", "#1F1E33", "Раствор, богатый наквадрией"), nqSulphate: stuff("dust", "nqsulphate", "#1F1E33", "Сульфат наквадрии"),
  naquadria: stuff("cell", "naquadria", "Naquadria", "Жидкая наквадрия"), neutroniumFluid: stuff("cell", "neutronium", "Neutronium", "Жидкий нейтроний"), neutronium: stuff("ingot", "neutronium", "Neutronium", "Нейтроний"),
};
Object.assign(S, {
  coalDust: stuff("dust", "coal", "Coal", "Угольная пыль"),
  water: stuff("cell", "water", "#0000FF", "Вода"), emptyCell: stuff("cell", "empty", "#FFFFFF", "Пустая капсула"),
});
/** Сколько машин на одну печь стали: время шага на слиток ÷ 25 с цикла печи, с округлением вверх. */
const need = (seconds) => Math.ceil(seconds / 25);
const L = (litres) => `${litres.toLocaleString("ru-RU").replace(/\s/g, " ")} л`;
const BC = "BotRecipes.java"; const PSR = "PlatinumSludgeRecipes.java"; const CORE = "мод-ядро, BlastFurnaceRecipes.java";
const freeze = (hot, ingot) => step("Остудить", "Вакуумный морозильник", [hot(1)], ingot(1));
// Общие шаги платиновой линии: от руды до остатков, из которых идут палладий, родий, иридий и осмий.
const platinumStart = [
  step("Растворить руду", "Химический реактор", [S.ore(1), S.aquaRegia(1, L(300))], S.ptConcentrate(1, L(300)), `Царскую водку мешают в смесителе: 3 соляной кислоты на 1 азотную (${PSR}).`),
];
const residues = [
  ...platinumStart,
  step("Платиновый остаток", "Химический реактор", [S.ore(9), stuff("dust", "ptmetal", "#FFFFC8", "Металлический порошок платины")(9), S.aquaRegia(1, L(20700))], S.ptResidue(1), "Порошок платины получают из того же концентрата: центрифуга, просеиватель и печь на 900 K. Вместе с рудой его снова растворяют — остаётся платиновый остаток."),
  step("Выщелочить", "Электрическая доменная печь, 775 K", [S.ptResidue(1), stuff("cell", "k2s2o7", "#FBBB66", "Расплав дисульфата калия")(1, L(360))], S.leach(1), "Заодно выходит 360 л сульфата родия."),
  step("Остаток редчайших металлов", "Электрическая доменная печь, 775 K", [S.leach(10), S.saltpeter(10), S.saltWater(1, L(1000))], S.rarest(6)),
  step("Разделить иридий и осмий", "Электрическая доменная печь, 775 K", [S.rarest(2), S.hcl(1, L(500))], S.irResidue(1), "Заодно выходит 1000 л кислого раствора осмия."),
];
const CHAINS = {
  bronze: [
    step("Сплавить", "Паровая плавильня сплавов", [S.copper(3), S.tin(1)], S.bronze(4), "Медь и олово плавят в печи из руды или пыли (AlloySmelterRecipes.java)."),
  ],
  steel: [
    step("Кокс", "Коксовая печь", [S.coal(1)], S.coke(1), "90 с, заодно даёт креозот."),
    step("Сталь", "Кирпичная домна", [S.iron(1), S.coke(2)], S.steel(1), "4 минуты."),
  ],
  // Сталь LV начинается со слитков железа и угля. Время дробления — GTRecipeRegistrator.registerReverseMacerating
  // (масса, но не меньше 16 тиков), электролиз — ElectrolyzerRecipes (схема 3), насос — MTEPump. Печь делает слиток за 25 с.
  "steel-ebf": [
    step("Железная пыль", "Дробилка LV", [S.iron(1)], S.ironDust(1), "2,8 с, 4 EU/t."),
    step("Углерод", "Та же дробилка", [S.coal(1)], S.coalDust(1), "0,8 с. Угольная (и древесно-угольная) пыль годится печи как углерод. Вместе со слитком — 3,6 с работы на каждые 25 с печи: одной дробилки хватает, паровая не нужна."),
    step("Кислород", "Электролизёр LV", [S.water(1, L(1000)), S.emptyCell(2)], S.oxygen(1, L(1000)), `100 с, 30 EU/t; заодно 2 капсулы водорода. Воду качает насос LV над водоёмом — до 250 л/с, нужно 40 л/с. Печи нужно 1000 л на слиток каждые 25 с — это ${need(100)} электролизёра без остановки.`),
    step("Сталь", "Электрическая доменная печь, 1000 K", [S.ironDust(1), S.coalDust(1), S.oxygen(1, L(1000))], S.steel(1), "25 с, 120 EU/t (мод-ядро); заодно 250 л углекислого газа и изредка зола. Без электричества ту же сталь дают 10 кирпичных домн — вкладка на странице стали."),
  ],
  aluminium: [
    step("Оксид алюминия", "Электрическая доменная печь, 1200 K", [S.ruby(3)], S.alumina(1), `60 с, MV. Годится и сапфир, а на HV — бокситовая линия (${CORE}).`),
    step("Алюминий", "Электрическая доменная печь, 2054 K", [S.alumina(10), S.carbon(3)], S.aluminium(4), "60 с, MV; выходят сразу холодные слитки. Сама линия ниже плавит алюминиевую пыль — это второй путь."),
  ],
  "stainless-steel": [
    step("Инвар", "Смеситель", [S.ironDust(2), S.nickel(1)], S.invar(3), "15 с (MixerRecipes.java)."),
    step("Пыль нержавейки", "Смеситель", [S.ironDust(4), S.invar(3), S.manganese(1), S.chrome(1)], S.stainlessDust(9), "45 с, MV."),
    step("Нержавеющая сталь", "Электрическая доменная печь, 1700 K", [S.stainlessDust(1), S.oxygen(1, L(1000))], S.stainless(1), "60 с, HV; слиток выходит холодным."),
  ],
  titanium: [
    step("Рутил", "Химическая ванна", [S.ilmenite(1), S.sulfuric(1, L(1000))], S.rutile(2), "21 с. Рутил даёт и бокситовая линия (ChemicalBathRecipes.java)."),
    step("Тетрахлорид титана", "Химический реактор", [S.rutile(3), S.carbon(2), S.chlorine(1, L(4000))], S.ticl4(1, L(1000)), "20 с, HV (ChemicalRecipes.java)."),
    step("Вернуть магний", "Химический реактор", [S.sodium(4), S.mgcl2(6)], S.magnesium(2), "20 с, HV; заодно 8 соли. Хлорид магния выходит из печи на следующем шаге — так магний ходит по кругу."),
    step("Титан (процесс Кролля)", "Электрическая доменная печь, 2140 K", [S.magnesium(2), S.ticl4(1, L(1000))], S.hotTitanium(1), `40 с — это шаг линии ниже; заодно 6 хлорида магния (${CORE}).`),
    freeze(S.hotTitanium, S.titanium),
  ],
  tungstensteel: [
    step("Вольфрамовая кислота", "Химический реактор", [S.scheelite(6), S.hcl(1, L(2000))], S.tungsticAcid(7), `2,5 с, EV (${BC}).`),
    step("Триоксид вольфрама", "Электрическая доменная печь, 1200 K", [S.tungsticAcid(7)], S.wo3(4), "10 с, HV."),
    step("Вольфрам", "Электрическая доменная печь, 1000 K", [S.wo3(4), S.hydrogen(1, L(6000))], S.tungsten(1), "5 с, HV; заодно пар."),
    step("Пыль вольфрамовой стали", "Смеситель", [S.tungsten(1), S.steelDust(1)], S.wsteelDust(2), "2,5 с, EV."),
    step("Вольфрамовая сталь", "Электрическая доменная печь, 4000 K", [S.wsteelDust(1)], S.hotWsteel(1), "125 с — это шаг линии ниже."),
    freeze(S.hotWsteel, S.wsteel),
  ],
  "rhodium-plated-palladium": [
    ...platinumStart,
    step("Палладий в аммиаке", "Центрифуга", [S.ptConcentrate(4), S.nh4cl(1, L(400))], S.pdAmmonia(1, L(400)), "64 с; заодно сырая соль платины."),
    step("Осаждённый палладий", "Химический реактор и просеиватель", [S.pdAmmonia(1, L(1000))], S.pdRaw(2), "Три шага: реактор делает соль палладия, просеиватель — металлический порошок, реактор с аммиаком палладия — осаждённый палладий."),
    step("Палладий", "Химический реактор", [S.pdRaw(4), S.formic(1, L(4000))], S.palladium(2), `12,5 с (${PSR}).`),
    step("Родий", "Печь, реакторы, смеситель, просеиватель", [S.rhSulfate(1)], S.rhodium(1), "Сульфат родия выходит при выщелачивании платинового остатка. Дальше: вода, цинк, печь с солью и хлором, селитра, просеиватель, вода и соляная кислота — около десяти шагов."),
    step("Смешать", "Смеситель", [S.palladium(3), S.rhodium(1)], S.rppDust(4), "EV."),
    step("Плавка", "Электрическая доменная печь, 4500 K", [S.rppDust(1)], S.hotRpp(1), "450 с — это шаг линии ниже."),
    freeze(S.hotRpp, S.rpp),
  ],
  iridium: [
    ...residues,
    step("Диоксид иридия", "Электрическая доменная печь, 775 K", [S.irResidue(1)], S.irO2(1), "10 с, MV."),
    step("Кислый раствор", "Химический реактор", [S.irO2(1), S.hcl(1, L(1000))], S.irAcid(1, L(1000))),
    step("Хлорид иридия", "Химический реактор", [S.irAcid(1, L(1000)), S.nh4cl(3, L(3000))], S.irCl(1)),
    step("Иридий", "Химический реактор", [S.irCl(1), S.calcium(1)], S.iridium(1), `15 с, EV (${PSR}).`),
    step("Плавка", "Электрическая доменная печь, 4500 K", [S.iridium(1)], S.hotIridium(1), "Шаг линии ниже."),
    freeze(S.hotIridium, S.iridiumIngot),
  ],
  osmium: [
    ...residues,
    step("Раствор осмия", "Дистилляционная колонна", [S.osAcid(1, L(1000))], S.osSolution(1, L(100)), "7,5 с, IV; остальное — вода."),
    step("Осмий", "Химический реактор", [S.osSolution(1), S.hcl(6)], S.osmium(1), `15 с (${PSR}).`),
    step("Плавка", "Электрическая доменная печь, 4500 K", [S.osmium(1)], S.hotOsmium(1), "Шаг линии ниже."),
    freeze(S.hotOsmium, S.osmiumIngot),
  ],
  neutronium: [
    step("Америций", "Термоядерный реактор", [S.lutetium(1, L(16)), S.chromeFluid(1, L(16))], S.americium(1, L(16)), "4,8 с (FusionReactorRecipes.java)."),
    step("Фосфат наквадрии", "Центрифуга", [S.nqEarth(4), S.phosphoric(1, L(4000))], S.nqPhosphate(4), "20 с, ZPM. Наквадриевую землю дают перемолотые массы наквады (NaquadahRecipeLoader.java)."),
    step("Раствор наквадрии", "Химический реактор", [S.nqPhosphate(10), S.sulfuric(30)], S.nqSolution(1, L(9000)), "50 с, IV."),
    step("Сульфат наквадрии", "Нейтронный активатор", [S.nqSolution(1, L(9000))], S.nqSulphate(44), "5 с при 1050–1100 МэВ."),
    step("Наквадрия", "Электрическая доменная печь, 9100 K", [S.nqSulphate(11), S.magnesium(2)], S.naquadria(1, L(144)), "Выходит раскалённый слиток: его остужают в морозильнике и плавят в жидкость."),
    step("Нейтроний", "Реактор синтеза III", [S.americium(1, L(144)), S.naquadria(1, L(144))], S.neutroniumFluid(1, L(144)), "12 с — это шаг линии ниже."),
    step("Отлить слиток", "Жидкостный отвердитель", [S.neutroniumFluid(1, L(144))], S.neutronium(1)),
  ],
};
const METALS = [
  ["steam", "бронза", "bronze"], ["steam", "сталь", "steel"], ["lv", "сталь", "steel-ebf"], ["mv", "алюминий", "aluminium"], ["hv", "нержавеющая сталь", "stainless-steel"],
  ["ev", "титан", "titanium"], ["iv", "вольфрамовая сталь", "tungstensteel"], ["luv", "палладий с родиевым покрытием", "rhodium-plated-palladium"],
  ["zpm", "иридий", "iridium"], ["uv", "осмий", "osmium"], ["uhv", "нейтроний", "neutronium"],
];
const lines = METALS.map(([tier, metal, material]) => ({ tier, metal, material, steps: CHAINS[material] }));

fs.writeFileSync(
  path.join(SITE, "lib/gen-crafts.ts"),
  `import type { CraftLine } from "./crafts";

/**
 * Цепочки главного металла каждого яруса: от сырья до слитка, по машинам. Рецепты и цвета — из исходников
 * GT5-Unofficial ${TAG} и мода-ядра GTNH. Файл собирается заново — правки вносить в scripts/gen/crafts.cjs.
 */
export const GEN_CRAFTS: readonly CraftLine[] = ${JSON.stringify(lines, null, 1)};
`,
);
// Латунная предметная труба для линий производства (lib/setups.ts): боковая текстура трубы в цвет латуни.
items["pipe-bronze"] = { src: pick("gregtech/textures/blocks/materialicons/NONE/pipeSide"), tint: color("Bronze") };
items["pipe-brass"] = { src: pick("gregtech/textures/blocks/materialicons/NONE/pipeSide"), tint: color("Brass") };
// Вода от паровой помпы к котлам — медная жидкостная труба, чтобы не путать с паровой бронзовой.
// Люки коксовой печи: кирпич печи и знаки мода (MTEHatchCokeOven: TEXTURE_IN / TEXTURE_OUT_INDICATOR).
for (const [file, layers] of [["coke-hatch-in", ["OVERLAY_PIPE_IN", "ITEM_IN_SIGN"]], ["coke-hatch-items", ["OVERLAY_PIPE_OUT", "ITEM_OUT_SIGN"]], ["coke-hatch-fluid", ["OVERLAY_PIPE_OUT", "FLUID_OUT_SIGN"]]]) {
  items[file] = { src: pick("gregtech/textures/blocks/iconsets/COKE_OVEN_CASING"), overlay: layers.map((name) => pick(`gregtech/textures/blocks/iconsets/${name}`)) };
}
// Пивоварня LV (MTEPotionBrewer): корпус LV и значки из папки potionbrewer — у неё свои имена накладок.
for (const [file, face] of [["single-lv-brewery", "FRONT"], ["single-lv-brewery-side", "SIDE"]]) {
  items[file] = { src: pick("gregtech/textures/blocks/iconsets/MACHINE_LV_SIDE"), overlay: pick(`gregtech/textures/blocks/basicmachines/potionbrewer/OVERLAY_${face}_POTIONBREWER`) };
}
// Лава к лавовым котлам — стальная жидкостная труба.
items["pipe-steel"] = { src: pick("gregtech/textures/blocks/materialicons/NONE/pipeSide"), tint: color("Steel") };
items["pipe-copper"] ={ src: pick("gregtech/textures/blocks/materialicons/NONE/pipeSide"), tint: color("Copper") };
// Выходной люк помпы: деревянный корпус, отверстие и знак «жидкость наружу».
items["pump-output-hatch"] = { src: pick("gregtech/textures/blocks/iconsets/PRIMITIVE_WOODEN_CASING_SIDE"), overlay: ["OVERLAY_PIPE_OUT", "FLUID_OUT_SIGN"].map((name) => pick(`gregtech/textures/blocks/iconsets/${name}`)) };
fs.writeFileSync(path.join(SITE, "scripts/gen-items.json"), JSON.stringify(items, null, 1));
console.log("линий", lines.length, "значков", Object.keys(items).length);
for (const l of lines) console.log(l.tier, l.metal, "|", l.steps.at(-1).grid.flat().filter(Boolean).map((i) => i.label).join("; "));
