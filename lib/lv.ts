import { ASSETS, GAME } from "./config";
import type { GuideTip } from "./guides";
import type { Faces, Single, SingleGroup } from "./singles";

/**
 * Генераторы и одноблочные машины LV. Что делает каждая машина и что приходит
 * ей на смену — со страниц Singleblock Machines, Singleblock Generators и
 * Low Voltage (LV) вики GT New Horizons.
 */

const LV_VOLTAGE = `${GAME.voltageTiers[1].voltage} EU/t`;

/** Фасад генератора: метка выхода энергии, как в моде. */
const ENERGY_OUT = "gen-energy-out";

const HULL: Faces = { front: "hull-lv-side", side: "hull-lv-side", top: "hull-lv-top", bottom: "hull-lv-bottom" };

/* ------------------------------------------------------------------ */
/* Генераторы                                                          */
/* ------------------------------------------------------------------ */

const GENERATOR_TIPS: readonly GuideTip[] = [
  {
    title: "Выход",
    text: `Генератор отдаёт ток только через одну грань с точкой — её поворачивают ключом. Один генератор — это один ампер на ${LV_VOLTAGE}.`,
  },
  {
    title: "Кабели",
    text: "Оловянный кабель теряет 1 EU на каждый блок длины. Ставьте генераторы вплотную к машинам, а толщину кабеля берите по числу генераторов на нём — иначе он сгорит.",
  },
  {
    title: "Дождь",
    text: "Электрические машины взрываются, если на соседний блок попадает дождь. Всё электричество — под крышу.",
  },
];

const GENERATOR_WIKI = "Singleblock Generators";

const GENERATORS: readonly Single[] = [
  {
    slug: "steam-turbine-lv",
    name: "Basic Steam Turbine",
    title: "Паровая турбина",
    label: "Пар",
    tier: "lv",
    group: "generator",
    does: "пар — в электричество",
    faces: { ...HULL, front: ENERGY_OUT, side: "gen-steam-turbine-side" },
    story: [
      "С этой турбины начинается электричество: она крутится от того же пара, на котором работал весь паровой цех. Котлы и трубы остаются — к ним просто добавляется турбина.",
      `Турбина выдаёт ${LV_VOLTAGE}.`,
      "На это она съедает 1 552 литра пара в секунду — больше, чем даёт любой одноблочный котёл, кроме лавового. Поэтому к турбинам обычно строят котёл Railcraft.",
    ],
    facts: [
      { label: "Размер", value: "1 блок" },
      { label: "Выдаёт", value: `${LV_VOLTAGE}, 1 A` },
      { label: "Ест", value: "1 552 л пара в секунду" },
      { label: "КПД", value: "85 %" },
      { label: "Бак", value: "24 000 л" },
    ],
    guide: {
      wiki: GENERATOR_WIKI,
      tips: [
        { title: "Сколько нужно", text: "Для электрической доменной печи нужно 4 ампера сразу — это четыре турбины рядом с печью." },
        { title: "Лишнего не съест", text: "Когда внутренний запас энергии полон, турбина перестаёт тратить пар." },
        ...GENERATOR_TIPS,
      ],
    },
  },
  {
    slug: "combustion-generator-lv",
    name: "Basic Combustion Generator",
    title: "Дизельный генератор",
    label: "Дизель",
    tier: "lv",
    group: "generator",
    does: "жидкое топливо — в электричество",
    faces: { ...HULL, front: ENERGY_OUT, top: "gen-combustion-top" },
    story: [
      "Генератор на жидком топливе. Главное топливо в LV — лёгкое топливо из нефти: литр даёт 305 EU. Позже его сменяет дизель (480 EU за литр).",
      "Нефть качают одноблочным насосом и перегоняют — это одна из больших задач яруса.",
    ],
    facts: [
      { label: "Размер", value: "1 блок" },
      { label: "Выдаёт", value: `${LV_VOLTAGE}, 1 A` },
      { label: "Топливо", value: "лёгкое топливо, дизель" },
      { label: "КПД", value: "95 %" },
      { label: "Бак", value: "16 000 л" },
    ],
    guide: {
      wiki: GENERATOR_WIKI,
      tips: [
        { title: "Креозот", text: "Креозот из коксовых печей здесь даёт всего 8 EU за литр. В полужидкостном генераторе тот же литр даёт 48 EU — жгите его там." },
        { title: "Лишнего не съест", text: "Когда внутренний запас энергии полон, генератор перестаёт тратить топливо." },
        ...GENERATOR_TIPS,
      ],
    },
  },
  {
    slug: "gas-turbine-lv",
    name: "Basic Gas Turbine",
    title: "Газовая турбина",
    label: "Газ",
    tier: "lv",
    group: "generator",
    does: "горючий газ — в электричество",
    faces: { ...HULL, front: ENERGY_OUT, side: "gen-gas-turbine-side" },
    story: [
      "Генератор на горючем газе. Природный газ и водород дают по 20 EU за литр, метан — 104, а сжиженный газ из нефтепереработки — 320.",
      "Удобна, когда газ и так остаётся: например, водород после электролиза или природный газ из скважины.",
    ],
    facts: [
      { label: "Размер", value: "1 блок" },
      { label: "Выдаёт", value: `${LV_VOLTAGE}, 1 A` },
      { label: "Топливо", value: "природный газ, метан, водород" },
      { label: "КПД", value: "95 %" },
      { label: "Бак", value: "16 000 л" },
    ],
    guide: {
      wiki: GENERATOR_WIKI,
      tips: [
        { title: "Что жечь", text: "Чем плотнее газ, тем меньше его нужно: метана уходит в пять раз меньше, чем природного газа." },
        { title: "Лишнего не съест", text: "Когда внутренний запас энергии полон, турбина перестаёт тратить газ." },
        ...GENERATOR_TIPS,
      ],
    },
  },
];

/* ------------------------------------------------------------------ */
/* Одноблочные машины                                                  */
/* ------------------------------------------------------------------ */

/** Общее для всех электрических одноблочных машин. */
const MACHINE_TIPS: readonly GuideTip[] = [
  {
    title: "Фасад и выход",
    text: "Через фасад в машину ничего не подать и не забрать. Сама она выталкивает готовое через одну грань — её поворачивают ключом, а автовыдачу включают кнопкой в окне машины.",
  },
  {
    title: "Напряжение",
    text: `Машина LV тянет рецепты не дороже ${LV_VOLTAGE}. Рецепты MV ей недоступны, а напряжение выше своего её взорвёт.`,
  },
  {
    title: "Дождь",
    text: "Электрические машины взрываются, если на соседний блок попадает дождь. Ставьте их под крышей.",
  },
];

export interface LvMachine {
  /** Папка со значками машины в текстурах мода. */
  readonly folder: string;
  readonly name: string;
  readonly title: string;
  readonly does: string;
  readonly about: string;
  readonly group: SingleGroup;
  /** Какая постройка приходит на смену. */
  readonly next?: string;
  /** Сколько ампер тянет, если больше одного. */
  readonly amps?: number;
  /** Совет именно про эту машину. */
  readonly tip?: GuideTip;
}

const PRIORITY = "В первую очередь";

export const LV_MACHINES: readonly LvMachine[] = [
  // Обработка
  { folder: "assembler", name: "Assembler", title: "Сборщик", group: "lv-processing", does: "собирает детали и машины", next: "Large Scale Auto-Assembler", about: "Собирает почти всё: детали, корпуса, схемы, целые машины.", tip: { title: "Зачем", text: "Рецепты сборщика заметно дешевле верстака: например, для баков Railcraft больше не нужны винты." } },
  { folder: "circuitassembler", name: "Circuit Assembler", title: "Сборщик схем", group: "lv-processing", does: "собирает электронные схемы", next: "Circuit Assembly Line", about: "Собирает электронные схемы из платы, деталей и припоя — быстрее и дешевле, чем на верстаке." },
  { folder: "mixer", name: "Mixer", title: "Смеситель", group: "lv-processing", does: "мешает пыли и жидкости", next: "Industrial Mixing Machine", about: "Мешает пыли и жидкости в сплавы и смеси. В паровую эру такой одноблочной машины не было.", tip: { title: "Что мешать", text: "Красный сплав из редстоуна, потин для труб, паяльный сплав для схем." } },
  { folder: "laser_engraver", name: "Laser Engraver", title: "Лазерный гравёр", group: "lv-processing", does: "гравирует линзой", next: "Hyper-Intensity Laser Engraver", about: "Гравирует заготовки лучом через цветную линзу. По-настоящему нужен позже — для микросхем." },
  { folder: "cutter", name: "Cutting Machine", title: "Резак", group: "lv-processing", does: "режет блоки и пластины", next: "Industrial Cutting Factory", about: "Режет блоки на плиты, а стержни — на болты. Для работы ему нужна вода или смазка.", tip: { title: "Смазка", text: "Со смазкой резак работает быстрее, чем на воде. Смазку гонят из креозота." } },
  { folder: "compressor", name: "Compressor", title: "Компрессор", group: "lv-processing", does: "сжимает", next: "Large Electric Compressor", about: "Сжимает предметы: слитки в блоки, пыль в пластины. Быстрее парового и не требует пара." },
  { folder: "autoclave", name: "Autoclave", title: "Автоклав", group: "lv-processing", does: "выращивает кристаллы", next: "Industrial Autoclave", about: "Под давлением и с жидкостью выращивает кристаллы из пыли — например, кварц и самоцветы." },

  // Ковка
  { folder: "bender", name: "Bending Machine", title: "Гибочный станок", group: "lv-forging", does: "слитки в пластины", next: "Industrial Bending Machine", about: "Гнёт слитки в пластины, а стержни — в пружины.", tip: { title: PRIORITY, text: "Один слиток — одна пластина. Молот давал две пластины из трёх слитков, так что станок экономит треть металла. Стройте одним из первых." } },
  { folder: "press", name: "Forming Press", title: "Формовочный пресс", group: "lv-forging", does: "штампует по форме", next: "Industrial Forming Press", about: "Вдавливает пластины и пыль в форму: монеты, детали, заготовки схем." },
  { folder: "hammer", name: "Forge Hammer", title: "Кузнечный молот", group: "lv-forging", does: "куёт и дробит", next: "Industrial Sledgehammer", about: "Куёт металл и дробит дроблёную руду в пыль. Электрическая версия парового молота." },
  { folder: "extruder", name: "Extruder", title: "Экструдер", group: "lv-forging", does: "выдавливает детали по форме", next: "Industrial Extrusion Machine", about: "Продавливает металл через форму: стержни, трубы, шестерни — без потерь.", tip: { title: "Позже", text: "Почти все полезные рецепты экструдера требуют MV. В LV хватит гибочного станка и токарного." } },
  { folder: "lathe", name: "Lathe", title: "Токарный станок", group: "lv-forging", does: "точит стержни и винты", next: "Industrial Precision Lathe", about: "Вытачивает из слитка стержень, а из болта — винт." },
  { folder: "wiremill", name: "Wiremill", title: "Проволочный стан", group: "lv-forging", does: "тянет провода", next: "Industrial Wire Factory", about: "Тянет из слитков провода и тонкую проволоку.", tip: { title: PRIORITY, text: "Из одного слитка выходит два провода — вдвое больше, чем руками. Проводов в LV нужно очень много." } },
  { folder: "fluid_solidifier", name: "Fluid Solidifier", title: "Отвердитель", group: "lv-forging", does: "льёт жидкость в форму", next: "Mass Solidifier", about: "Заливает расплав в форму и получает готовую деталь.", tip: { title: "Пара к экстрактору", text: "Экстрактор жидкостей плавит слитки, отвердитель льёт из расплава трубы и детали — так выходит быстрее, чем гнуть." } },

  // Разделение
  { folder: "extractor", name: "Extractor", title: "Экстрактор", group: "lv-separating", does: "вытягивает твёрдое", next: "Dissection Apparatus", about: "Вытягивает из предметов твёрдое содержимое: резину из смолы, краски из цветов." },
  { folder: "fluid_extractor", name: "Fluid Extractor", title: "Экстрактор жидкостей", group: "lv-separating", does: "вытягивает и плавит в жидкость", next: "Large Fluid Extractor", about: "Вытягивает из предметов жидкость и плавит металлы в расплав." },
  { folder: "centrifuge", name: "Centrifuge", title: "Центрифуга", group: "lv-separating", does: "делит вращением", next: "Industrial Centrifuge", about: "Раскручивает предметы и жидкости и делит их на части: пыль — на металлы, смолу — на резину и клей." },
  { folder: "electrolyzer", name: "Electrolyzer", title: "Электролизёр", group: "lv-separating", does: "делит током на элементы", next: "Industrial Electrolyzer", about: "Током разбирает вещества на элементы — например, воду на водород и кислород.", tip: { title: "Не всё сразу", text: "Алюминий из глиняной пыли требует 120 EU/t — это уже MV. В LV берите кислород из магнетита и лимонита, галлий — из сфалерита." } },
  { folder: "electromagnetic_separator", name: "Electromagnetic Separator", title: "Магнитный сепаратор", group: "lv-separating", does: "отделяет магнитное", next: "Magnetic Flux Exhibitor", about: "Вытягивает магнитом из очищенной руды побочные металлы — железо, золото, неодим." },
  { folder: "polarizer", name: "Electromagnetic Polarizer", title: "Намагничиватель", group: "lv-separating", does: "намагничивает", next: "Magnetic Flux Exhibitor", about: "Намагничивает железные и стальные стержни. Магнитные стержни нужны для моторов." },

  // Химия
  { folder: "chemical_reactor", name: "Chemical Reactor", title: "Химический реактор", group: "lv-chemistry", does: "проводит реакции", next: "Large Chemical Reactor", about: "Проводит химические реакции: из одних веществ получает другие.", tip: { title: "Зачем", text: "Здесь делают полиэтилен из нефти — без него не собрать хорошие схемы — и резину." } },
  { folder: "distillery", name: "Distillery", title: "Дистиллятор", group: "lv-chemistry", does: "перегоняет жидкости", next: "Distillation Tower", about: "Перегоняет жидкость и достаёт из неё одну составную часть за раз.", tip: { title: "Нефть", text: "Из нефти здесь получают лёгкое топливо для дизельного генератора, из креозота — смазку." } },
  { folder: "fermenter", name: "Fermenter", title: "Ферментер", group: "lv-chemistry", does: "сбраживает", next: "Bacterial Vat", about: "Сбраживает жидкости: из биомассы получает сброженную биомассу — сырьё для биотоплива." },

  // Нагрев
  { folder: "electric_furnace", name: "Electric Furnace", title: "Электропечь", group: "lv-heating", does: "плавит", next: "Multi Smelter", about: "Обычная печь на электричестве: один предмет за 6,4 секунды против 10 у каменной." },
  { folder: "microwave", name: "Microwave", title: "Микроволновка", group: "lv-heating", does: "готовит еду", next: "Multi Smelter", about: "Быстро готовит еду.", tip: { title: "Без металла", text: "Положите в неё металл — она взорвётся." } },
  { folder: "alloy_smelter", name: "Alloy Smelter", title: "Плавильня сплавов", group: "lv-heating", does: "сплавляет металлы", next: "Zyngen", about: "Сплавляет два металла в один и отливает детали в формах. Электрическая версия паровой плавильни." },
  { folder: "fluid_heater", name: "Fluid Heater", title: "Нагреватель жидкостей", group: "lv-heating", does: "греет жидкости", next: "Thermic Heating Device", about: "Нагревает жидкости — например, воду в пар или сырьё перед реакцией." },
  { folder: "arc_furnace", name: "Arc Furnace", title: "Дуговая печь", group: "lv-heating", does: "переплавляет дугой", next: "Industrial Arc Furnace", amps: GAME.lvAmps.arcFurnace, about: "Электрической дугой с кислородом переплавляет предметы обратно в слитки и делает кованое железо.", tip: { title: "Три ампера", text: "Печи нужно минимум 3 ампера, а взять она может до 7. Один генератор её не потянет." } },

  // Руда
  { folder: "macerator", name: "Macerator", title: "Дробилка", group: "lv-ore", does: "руду в пыль", next: "Industrial Maceration Stack", about: "Дробит руду и предметы в пыль.", tip: { title: "Побочка — позже", text: "Побочные продукты при дроблении дают только дробилки от HV. До того их берут из мойки и сепаратора." } },
  { folder: "simple_washer", name: "Simple Washer", title: "Простая мойка", group: "lv-ore", does: "моет руду быстро", next: "Ore Washing Plant", about: "Быстро моет дроблёную руду и грязную пыль. Побочных продуктов не даёт." },
  { folder: "ore_washer", name: "Ore Washer", title: "Мойка руды", group: "lv-ore", does: "моет руду с побочкой", next: "Ore Washing Plant", about: "Моет дроблёную руду медленно, зато с побочными продуктами." },
  { folder: "chemical_bath", name: "Chemical Bath", title: "Химическая ванна", group: "lv-ore", does: "купает в растворе", next: "Industrial Chemical Bath", about: "Купает руду и предметы в растворе: вымывает побочные металлы, красит, пропитывает." },
  { folder: "sifter", name: "Sifter", title: "Просеиватель", group: "lv-ore", does: "отсеивает самоцветы", next: "Large Sifter", about: "Просеивает очищенную руду самоцветов и достаёт из неё камни разного качества." },
  { folder: "thermal_centrifuge", name: "Thermal Centrifuge", title: "Термоцентрифуга", group: "lv-ore", does: "делит жаром и вращением", next: "Large Thermal Refinery", amps: GAME.lvAmps.thermalCentrifuge, about: "Нагревает и раскручивает очищенную руду: выходит центрифугированная руда и побочная пыль.", tip: { title: "Два ампера", text: "Тянет 2 ампера — следите, чтобы хватило генераторов и толщины кабеля." } },

  // Упаковка и прочее
  { folder: "canner", name: "Canner", title: "Консервный автомат", group: "lv-other", does: "заполняет банки и батареи", next: "TurboCan Pro", about: "Раскладывает содержимое по ёмкостям: еду — в банки, пыль — в корпуса батарей." },
  { folder: "fluid_canner", name: "Fluid Canner", title: "Автомат розлива", group: "lv-other", does: "наливает и сливает жидкости", about: "Наливает жидкости в капсулы и вёдра и сливает их обратно." },
  { folder: "unboxinator", name: "Unpackager", title: "Распаковщик", group: "lv-other", does: "распаковывает", next: "Amazon Warehousing Depot", about: "Достаёт предметы из упаковок и разбирает собранные наборы обратно." },
  { folder: "recycler", name: "Recycler", title: "Утилизатор", group: "lv-other", does: "ненужное — в утиль", next: "Matter Fabrication CPU", about: "Перемалывает любые ненужные предметы в утиль." },
  { folder: "pump", name: "Pump", title: "Насос", group: "lv-other", does: "качает жидкости из мира", next: "Fluid Drilling Rig", about: "Выкачивает жидкость из мира вокруг и под собой.", tip: { title: "Нефть", text: "Насосом в LV добывают нефть — она идёт на полиэтилен и лёгкое топливо." } },
  { folder: "miner", name: "Miner", title: "Шахтёр", group: "lv-other", does: "сам копает руду", next: "Ore Drilling Plant", about: "Сам выкапывает руду под собой в небольшом радиусе и складывает в соседний сундук." },
];

export function machineId(folder: string): string {
  return ASSETS.lvMachineShortIds[folder] ?? folder.replaceAll("_", "-");
}

function toSingle(machine: LvMachine): Single {
  const id = machineId(machine.folder);
  const amps = machine.amps ?? 1;
  return {
    slug: `${id}-lv`,
    name: machine.name,
    title: machine.title,
    label: "LV",
    tier: "lv",
    group: machine.group,
    does: machine.does,
    faces: { front: `single-lv-${id}`, side: `single-lv-${id}-side`, top: `single-lv-${id}-top`, bottom: HULL.bottom },
    story: [
      machine.about,
      machine.next
        ? `Машина одноблочная: её ярус не повышается, и для рецептов MV её придётся заменить. Позже на смену одноблочным приходит постройка ${machine.next}.`
        : "Машина одноблочная: её ярус не повышается, и для рецептов MV её придётся заменить.",
    ],
    facts: [
      { label: "Размер", value: "1 блок" },
      { label: "Напряжение", value: `LV, ${LV_VOLTAGE}` },
      { label: "Ток", value: `${amps} A` },
      ...(machine.next ? [{ label: "На смену", value: machine.next }] : []),
    ],
    guide: { wiki: "Singleblock Machines", tips: [...(machine.tip ? [machine.tip] : []), ...MACHINE_TIPS] },
  };
}

/** Все одноблочные LV: сначала генераторы, потом машины по группам. */
export const LV_SINGLES: readonly Single[] = [...GENERATORS, ...LV_MACHINES.map(toSingle)];

/** Папки машин, для которых скрипт должен собрать текстуры: тест сверяет их с настройками. */
export const LV_MACHINE_FOLDERS: readonly string[] = LV_MACHINES.map((machine) => machine.folder);
