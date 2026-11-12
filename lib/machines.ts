import { ASSETS } from "./config";
import { buildStructure, type BlockKind, type Structure, type StructureDef } from "./structure";

/**
 * Справочник видов блоков. texture — имя файла в public/textures/gregtech,
 * все файлы получены из текстур мода скриптом scripts/fetch-textures.mjs.
 */
export const KINDS = {
  // Электрическая доменная печь
  heatproof: { label: "Жаропрочный корпус", texture: "casing" },
  coil: { label: "Нагревательная катушка", texture: "coil-cupronickel", isHot: true },
  ebfController: { label: "Контроллер", texture: "controller", glow: "controller-glow", face: { rule: "front", base: "casing" } },
  muffler: { label: "Глушитель", texture: "muffler", face: { rule: "up", base: "casing" } },
  inputBus: { label: "Входная шина", texture: "input-bus", face: { rule: "outward", base: "casing" } },
  outputBus: { label: "Выходная шина", texture: "output-bus", face: { rule: "outward", base: "casing" } },
  inputHatch: { label: "Входной люк", texture: "input-hatch", face: { rule: "outward", base: "casing" } },
  energy: { label: "Энергетический люк", texture: "energy", face: { rule: "outward", base: "casing" } },
  maintenance: { label: "Люк обслуживания", texture: "maintenance", face: { rule: "outward", base: "casing" } },

  // Кирпичные печи
  firebrick: { label: "Огнеупорный кирпич", texture: "firebrick", isMatte: true },
  bbfController: { label: "Контроллер", texture: "bbf-controller", glow: "bbf-controller-glow", face: { rule: "front", base: "firebrick" }, isMatte: true },
  cokeBrick: { label: "Кирпич коксовой печи", texture: "coke-brick", isMatte: true },
  cokeController: { label: "Контроллер", texture: "coke-controller", glow: "coke-controller-glow", face: { rule: "front", base: "coke-brick" }, isMatte: true },

  // Паровые постройки, бронзовый ярус
  bronzeBricks: { label: "Бронзовые кирпичи", texture: "bronze-bricks", isMatte: true },
  bronzeGearbox: { label: "Бронзовый редуктор", texture: "bronze-gearbox" },
  bronzePipe: { label: "Бронзовый трубный корпус", texture: "bronze-pipe" },
  bronzeFirebox: { label: "Бронзовая топка", texture: "bronze-firebox" },
  bronzeFrame: { label: "Бронзовая рама", texture: "bronze-frame", isCutout: true },
  ironBlock: { label: "Блок железа", texture: "iron-block" },
  glass: { label: "Стекло", texture: "glass", isGlass: true },
  wood: { label: "Деревянный корпус", texture: "wood", isMatte: true },
  waterTankSiding: { label: "Стенка водяного бака", texture: "water-tank", isMatte: true },
  maceratorController: { label: "Контроллер", texture: "macerator-controller", face: { rule: "front", base: "bronze-bricks" }, isMatte: true },
  furnaceController: { label: "Контроллер", texture: "furnace-controller", face: { rule: "front", base: "bronze-bricks" }, isMatte: true },
  compressorController: { label: "Контроллер", texture: "compressor-controller", face: { rule: "front", base: "bronze-bricks" }, isMatte: true },
  smelterController: { label: "Контроллер", texture: "smelter-controller", face: { rule: "front", base: "bronze-bricks" }, isMatte: true },
  hammerController: { label: "Контроллер", texture: "hammer-controller", face: { rule: "front", base: "bronze-bricks" }, isMatte: true },
  pumpController: { label: "Контроллер", texture: "pump-controller", face: { rule: "front", base: "wood" }, isMatte: true },
} satisfies Record<string, BlockKind>;

export type KindId = keyof typeof KINDS;

export type MachineGroup = "primitive" | "steam" | "electric";

export interface Fact {
  readonly label: string;
  readonly value: string;
}

export interface Machine {
  readonly slug: string;
  /** Название в игре. */
  readonly name: string;
  /** Короткое русское название. */
  readonly title: string;
  readonly group: MachineGroup;
  /** Одна строка для каталога. */
  readonly summary: string;
  /** Абзацы для страницы машины, простым языком. */
  readonly story: readonly string[];
  readonly facts: readonly Fact[];
  /** Откуда взята схема: ссылка на файл в исходниках мода или на страницу вики. */
  readonly source: string;
  readonly def: StructureDef & { readonly kinds: Readonly<Record<string, KindId>> };
}

const STEAM_FACTS: readonly Fact[] = [
  { label: "Работает на", value: "паре" },
  { label: "За один раз", value: "до 8 предметов" },
  { label: "Ярусы", value: "бронза и сталь" },
];

const STEAM_NOTE =
  "У постройки два яруса. Бронзовый показан здесь. Стальной (высокого давления) собирается точно так же, только из стальных блоков — он работает быстрее и ест больше пара. Паровой люк и шины для предметов ставятся на место любого обычного кирпича.";

const MULTI = `https://github.com/GTNewHorizons/GT5-Unofficial/blob/${ASSETS.gregtechCommit}/src/main/java/gregtech/common/tileentities/machines/multi`;

export const MACHINES: readonly Machine[] = [
  {
    slug: "bricked-blast-furnace",
    name: "Bricked Blast Furnace",
    title: "Кирпичная домна",
    group: "primitive",
    summary: "Первая сталь в игре. Ни пара, ни электричества — только кирпич, уголь и терпение.",
    story: [
      "С этой печи начинается сталь. Она сложена из огнеупорных кирпичей, а внутри, пока идёт плавка, стоит столб лавы высотой в два блока.",
      "В крыше оставлена дыра ровно по центру — через неё выходит дым. Закрыть её нельзя: печь перестанет считаться собранной.",
      "Домне не нужны ни пар, ни электричество — в неё кладут железо и уголь и ждут. Долго. Поэтому таких печей обычно строят сразу несколько.",
    ],
    facts: [
      { label: "Размер", value: "3 × 4 × 3" },
      { label: "Огнеупорных кирпичей", value: "32" },
      { label: "Работает на", value: "угле, без пара" },
      { label: "Внутри", value: "2 блока лавы" },
    ],
    source: `${MULTI}/MTEBrickedBlastFurnace.java`,
    def: {
      layers: [
        ["ccc", "c-c", "ccc"],
        ["ccc", "clc", "ccc"],
        ["c~c", "clc", "ccc"],
        ["ccc", "ccc", "ccc"],
      ],
      kinds: { c: "firebrick", "~": "bbfController" },
      hollow: "l-",
    },
  },
  {
    slug: "coke-oven",
    name: "Coke Oven",
    title: "Коксовая печь",
    group: "primitive",
    summary: "Пережигает уголь в кокс, а дерево — в древесный уголь. Заодно даёт креозот.",
    story: [
      "Самая простая постройка в игре: куб три на три на три из кирпичей коксовой печи с одним пустым блоком внутри.",
      "Печь медленно пережигает уголь в кокс — топливо, которое горит дольше и нужно для домны. Побочный продукт — креозот, им пропитывают дерево.",
      "Ей не нужна никакая энергия. Чтобы подавать и забирать предметы автоматически, на место любого кирпича ставят специальный люк.",
    ],
    facts: [
      { label: "Размер", value: "3 × 3 × 3" },
      { label: "Кирпичей", value: "до 25" },
      { label: "Работает на", value: "собственном жаре" },
      { label: "Внутри", value: "1 блок воздуха" },
    ],
    source: `${MULTI}/MTECokeOven.java`,
    def: {
      layers: [
        ["CCC", "CCC", "CCC"],
        ["C~C", "C-C", "CCC"],
        ["CCC", "CCC", "CCC"],
      ],
      kinds: { C: "cokeBrick", "~": "cokeController" },
      hollow: "-",
    },
  },
  {
    slug: "water-tank",
    name: "Water Tank",
    title: "Водяной бак",
    group: "primitive",
    summary: "Собирает воду прямо из воздуха. Медленно, зато бесплатно — до парового насоса другого способа нет.",
    story: [
      "Паровым котлам нужна вода, и первая вода в игре берётся из воздуха. Водяной бак — это полый куб три на три на три из двадцати шести стенок, а внутри копится вода.",
      "У бака нет ни контроллера, ни люков: его просто ставят и ждут. Чем влажнее место, тем быстрее он наполняется; дождь ускоряет втрое, а крыша над баком — замедляет вдвое.",
      "Бак — из соседнего мода Railcraft. Его текстуры распространять нельзя, поэтому стенка здесь нарисована заново, в том же духе. Позже бак сменяет паровой насос: он даёт воды в десятки раз больше.",
    ],
    facts: [
      { label: "Размер", value: "3 × 3 × 3" },
      { label: "Стенок", value: "26" },
      { label: "Работает на", value: "влажности воздуха" },
      { label: "Даёт воды", value: "до 30 л/с" },
    ],
    source: "https://wiki.gtnewhorizons.com/wiki/Water_Tank",
    def: {
      layers: [
        ["TTT", "TTT", "TTT"],
        ["TTT", "T-T", "TTT"],
        ["TTT", "TTT", "TTT"],
      ],
      kinds: { T: "waterTankSiding" },
      hollow: "-",
      interior: "water",
    },
  },
  {
    slug: "steam-furnace",
    name: "Steam Furnace",
    title: "Паровая печь",
    group: "steam",
    summary: "Большая печь на пару: плавит по восемь предметов сразу.",
    story: [
      "Многоблочная версия обычной печи. Внизу — трубные корпуса, по которым идёт пар, в середине — три топки, сверху — кольцо из четырёх редукторов.",
      "Одна такая постройка заменяет восемь одноблочных паровых печей: она плавит до восьми предметов за раз.",
      STEAM_NOTE,
    ],
    facts: [{ label: "Размер", value: "3 × 3 × 3" }, ...STEAM_FACTS],
    source: `${MULTI}/steam/MTESteamFurnaceMulti.java`,
    def: {
      layers: [
        [" B ", "B B", " B "],
        ["A~A", "D D", "ADA"],
        ["ACA", "CAC", "ACA"],
      ],
      kinds: { A: "bronzeBricks", B: "bronzeGearbox", C: "bronzePipe", D: "bronzeFirebox", "~": "furnaceController" },
    },
  },
  {
    slug: "steam-alloy-smelter",
    name: "Steam Alloy Smelter",
    title: "Паровая плавильня сплавов",
    group: "steam",
    summary: "Сплавляет два металла в один — например, медь и олово в бронзу.",
    story: [
      "Плавильня соединяет два металла в сплав. Именно в ней делают бронзу, из которой собрана вся паровая эра.",
      "Постройка вытянута в глубину. По бокам в неё вставлены четыре стекла, а внутри идут два трубных корпуса — через стекло их видно.",
      STEAM_NOTE,
    ],
    facts: [{ label: "Размер", value: "3 × 3 × 4" }, ...STEAM_FACTS],
    source: `${MULTI}/steam/MTESteamAlloySmelter.java`,
    def: {
      layers: [
        ["CCC", "CCC", "CCC", "CCC"],
        ["C~C", "GPG", "GPG", "CCC"],
        ["CCC", "CCC", "CCC", "CCC"],
      ],
      kinds: { C: "bronzeBricks", G: "glass", P: "bronzePipe", "~": "smelterController" },
    },
  },
  {
    slug: "steam-macerator",
    name: "Steam Macerator",
    title: "Паровая дробилка",
    group: "steam",
    summary: "Дробит руду в пыль: из одного куска руды выходит больше металла.",
    story: [
      "Дробилка перемалывает руду в пыль. Из пыли при плавке получается больше металла, чем из руды напрямую, — поэтому дробилку строят одной из первых.",
      "По углам постройки стоят восемь рам — решётчатых блоков, сквозь которые видно нутро. На самом верху, в центре, — редуктор.",
      // В исходнике эта схема записана срезами от фасада назад; здесь она переложена в слои сверху вниз.
      STEAM_NOTE,
    ],
    facts: [{ label: "Размер", value: "3 × 4 × 3" }, ...STEAM_FACTS],
    source: `${MULTI}/steam/MTESteamMacerator.java`,
    def: {
      layers: [
        [" A ", "ABA", " A "],
        ["CAC", "A A", "CAC"],
        ["C~C", "A A", "CAC"],
        ["AAA", "AAA", "AAA"],
      ],
      kinds: { A: "bronzeBricks", B: "bronzeGearbox", C: "bronzeFrame", "~": "maceratorController" },
    },
  },
  {
    slug: "steam-compressor",
    name: "Steam Compressor",
    title: "Паровой компрессор",
    group: "steam",
    summary: "Сжимает: девять слитков в блок, пыль в пластины.",
    story: [
      "Компрессор сжимает предметы — например, превращает девять слитков в один блок.",
      "Это самая длинная паровая постройка: семь блоков в глубину. Спереди контроллер окружён трубными корпусами, а в середине стоит пресс из шести блоков железа.",
      // В исходнике эта схема записана срезами от фасада назад; здесь она переложена в слои сверху вниз.
      STEAM_NOTE,
    ],
    facts: [{ label: "Размер", value: "3 × 3 × 7" }, ...STEAM_FACTS],
    source: `${MULTI}/steam/MTESteamCompressor.java`,
    def: {
      layers: [
        ["CCC", "AAA", "   ", "   ", "EEE", "   ", "AAA"],
        ["C~C", "AAA", " C ", " C ", "EEE", "   ", "AAA"],
        ["CCC", "AAA", "AAA", "AAA", "AAA", "AAA", "AAA"],
      ],
      kinds: { A: "bronzeBricks", C: "bronzePipe", E: "ironBlock", "~": "compressorController" },
    },
  },
  {
    slug: "steam-forge-hammer",
    name: "Steam Forge Hammer",
    title: "Паровой молот",
    group: "steam",
    summary: "Расплющивает слитки в пластины. Самая высокая постройка паровой эры.",
    story: [
      "Молот бьёт по слиткам и превращает их в пластины — а из пластин делается почти всё остальное.",
      "Постройка похожа на настоящий паровой молот: широкое основание пять на пять, две стойки по бокам и боёк из двух блоков железа, который висит между ними.",
      STEAM_NOTE,
    ],
    facts: [{ label: "Размер", value: "5 × 7 × 5" }, ...STEAM_FACTS],
    source: `${MULTI}/steam/MTESteamForgeHammer.java`,
    def: {
      layers: [
        ["     ", "     ", "  B  ", "     ", "     "],
        ["     ", "  A  ", "AABAA", "  A  ", "     "],
        ["     ", "     ", "A C A", "     ", "     "],
        ["     ", "     ", "A C A", "     ", "     "],
        ["     ", "     ", "A   A", "     ", "     "],
        ["     ", " A~A ", "AA AA", " AAA ", "     "],
        [" AAA ", "AAAAA", "AAAAA", "AAAAA", " AAA "],
      ],
      kinds: { A: "bronzeBricks", B: "bronzePipe", C: "ironBlock", "~": "hammerController" },
    },
  },
  {
    slug: "steam-water-pump",
    name: "Steam Water Pump",
    title: "Паровой насос",
    group: "steam",
    summary: "Качает воду для котлов. Чем влажнее место, тем больше воды.",
    story: [
      "Паровым котлам постоянно нужна вода, и носить её вёдрами быстро надоедает. Насос качает воду сам.",
      "Основание — деревянные корпуса, над ними — вышка из десяти бронзовых рам. Сколько воды насос даёт, зависит от влажности места, где он стоит: в болоте больше, в пустыне почти ничего.",
      "Насос сменяет водяной бак: тот собирает воду из воздуха бесплатно, но в десятки раз медленнее. У насоса тоже два яруса — с бронзовыми рамами и со стальными. Паровой люк ставится на место любого деревянного корпуса.",
    ],
    facts: [
      { label: "Размер", value: "3 × 3 × 4" },
      { label: "Бронзовых рам", value: "10" },
      { label: "Деревянных корпусов", value: "9" },
      { label: "Работает на", value: "паре" },
    ],
    source: `${MULTI}/steam/MTESteamWaterPump.java`,
    def: {
      layers: [
        [" A ", " A ", "AAA", " A "],
        [" A ", "   ", "A A", " A "],
        ["C~C", "CCC", "CCC", "CCC"],
      ],
      kinds: { A: "bronzeFrame", C: "wood", "~": "pumpController" },
    },
  },
  {
    slug: "electric-blast-furnace",
    name: "Electric Blast Furnace",
    title: "Электрическая доменная печь",
    group: "electric",
    summary: "Что идёт после пара: первая большая печь на электричестве.",
    story: [
      "Этой печью паровая эра заканчивается. Она плавит то, что кирпичной домне не по силам: алюминий, а позже — нержавеющую сталь и титан.",
      "Низ и верх — жаропрочный корпус, в который врезаны люки. Середина — два кольца нагревательных катушек, всего шестнадцать. Внутри обязательно пусто: если туда попадёт хоть один блок, печь не соберётся.",
      "Контроллер стоит строго спереди внизу по центру, глушитель — в центре крыши. Остальные люки можно ставить в нижнем слое в любом порядке; здесь показан один из вариантов.",
    ],
    facts: [
      { label: "Размер", value: "3 × 4 × 3" },
      { label: "Катушек", value: "16" },
      { label: "Работает на", value: "электричестве, от LV" },
      { label: "Загрязнение", value: "400 в секунду" },
    ],
    source: `${MULTI}/MTEElectricBlastFurnace.java`,
    def: {
      // В исходнике нижний слой — «b~b / bbb / bbb»: на место «b» мод разрешает любой люк. Здесь люки расставлены.
      layers: [
        ["fff", "fmf", "fff"],
        ["CCC", "C-C", "CCC"],
        ["CCC", "C-C", "CCC"],
        ["I~O", "EbM", "EFb"],
      ],
      kinds: {
        f: "heatproof",
        b: "heatproof",
        m: "muffler",
        C: "coil",
        "~": "ebfController",
        I: "inputBus",
        O: "outputBus",
        E: "energy",
        M: "maintenance",
        F: "inputHatch",
      },
      hollow: "-",
    },
  },
];

export const GROUP_TITLES: Record<MachineGroup, string> = {
  primitive: "Без энергии",
  steam: "На пару",
  electric: "Что дальше",
};

export function findMachine(slug: string): Machine | undefined {
  return MACHINES.find((machine) => machine.slug === slug);
}

const structureCache = new Map<string, Structure>();

/** Постройка машины, развёрнутая в блоки. Считается один раз на машину. */
export function structureOf(machine: Machine): Structure {
  const cached = structureCache.get(machine.slug);
  if (cached) return cached;
  const structure = buildStructure(machine.def, KINDS);
  structureCache.set(machine.slug, structure);
  return structure;
}

/** Корпус одноблочной машины: гладкий металл или металл с кирпичом (у печей). */
export type Hull = "plain" | "bricked";

/** Одноблочная паровая машина для иерархии на главной: что делает и какой у неё фасад. */
export interface SingleBlock {
  readonly id: string;
  readonly hull: Hull;
  readonly title: string;
  readonly does: string;
  /** Многоблочная версия, если она есть. */
  readonly multiSlug?: string;
  /** Бывает только постройкой: одноблочной версии в моде нет. */
  readonly isMultiOnly?: boolean;
}

export const SINGLE_BLOCKS: readonly SingleBlock[] = [
  { id: "macerator", hull: "plain", title: "Дробилка", does: "руду в пыль", multiSlug: "steam-macerator" },
  { id: "furnace", hull: "bricked", title: "Печь", does: "пыль в слитки", multiSlug: "steam-furnace" },
  { id: "alloy-smelter", hull: "bricked", title: "Плавильня сплавов", does: "два металла в сплав", multiSlug: "steam-alloy-smelter" },
  { id: "hammer", hull: "plain", title: "Молот", does: "слитки в пластины", multiSlug: "steam-forge-hammer" },
  { id: "compressor", hull: "plain", title: "Компрессор", does: "сжимает в блоки", multiSlug: "steam-compressor" },
  { id: "extractor", hull: "plain", title: "Экстрактор", does: "вытягивает резину и краски" },
  {
    id: "water-pump",
    hull: "plain",
    title: "Насос",
    does: "качает воду для котлов; до него воду даёт водяной бак",
    multiSlug: "steam-water-pump",
    isMultiOnly: true,
  },
];
