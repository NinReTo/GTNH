import { ASSETS, GAME } from "./config";
import type { GuideTip } from "./guides";
import { upgradedMachines } from "./mv";
import type { Single } from "./singles";

/**
 * Генераторы и одноблочные машины от EV до MAX. Одноблочных генераторов выше UV в моде нет. Числа генераторов — со страницы
 * Singleblock Generators вики GT New Horizons; что машинам даёт ярус — со страниц
 * Extreme Voltage (EV), Insane Voltage (IV) и Zero Point Module (ZPM).
 */

type HighTier = keyof typeof GAME.highTiers;

function voltageOf(tier: HighTier): string {
  return `${GAME.voltageTiers[GAME.highTiers[tier]].voltage} EU/t`;
}

const GENERATOR_WIKI = "Singleblock Generators";

const GENERATOR_TIP: GuideTip = {
  title: "Одноблочный — запасной",
  text: "На этих ярусах одноблочный генератор всегда слабее и прожорливее постройки. Его берут на другие планеты и в другие миры, где большую постройку ставить незачем.",
};

/** Чем отличаются генераторы одного вида на разных ярусах. */
interface Version {
  readonly tier: HighTier;
  /** Название в игре. */
  readonly name: string;
  readonly efficiency: string;
}

/** Общее у всех версий одного генератора. */
interface Kind {
  readonly id: string;
  readonly title: string;
  readonly label: string;
  readonly does: string;
  readonly fuel: string;
  readonly tank: string;
  readonly about: string;
  readonly tip: GuideTip;
  /** Какие грани у генератора свои: остальные — голый корпус яруса. */
  readonly faces: (prefix: string) => Partial<Single["faces"]>;
  readonly versions: readonly Version[];
}

const KINDS: readonly Kind[] = [
  {
    id: "gas-turbine",
    title: "Газовая турбина",
    label: "Газ",
    does: "горючий газ — в электричество",
    fuel: "нитробензол, бензол",
    tank: "16 000 л",
    about: "Одноблочная газовая турбина. С каждым ярусом её КПД падает, поэтому вместо неё строят большую газовую турбину.",
    tip: { title: "Нитробензол", text: "Лучшее газовое топливо: 1 600 EU за литр против 360 у бензола." },
    faces: (prefix) => ({ front: `${prefix}-energy-out`, side: `${prefix}-gas-turbine-side` }),
    versions: [
      { tier: "ev", name: "Turbo Gas Turbine II", efficiency: "60 %" },
      { tier: "iv", name: "Turbo Gas Turbine III", efficiency: "50 %" },
    ],
  },
  {
    id: "combustion-generator",
    title: "Дизельный генератор",
    label: "Дизель",
    does: "жидкое топливо — в электричество",
    fuel: "бензин, дизель с присадкой",
    tank: "16 000 л",
    about: "Одноблочный генератор на жидком топливе. КПД у него низкий: большой и экстремальный дизельные двигатели жгут то же топливо намного выгоднее.",
    tip: { title: "Высокооктановый бензин", text: "Лучшее жидкое топливо: 2 500 EU за литр." },
    faces: (prefix) => ({ front: `${prefix}-energy-out`, top: `${prefix}-combustion-top` }),
    versions: [
      { tier: "ev", name: "Turbo Supercharging Combustion Generator", efficiency: "65 %" },
      { tier: "iv", name: "Ultimate Chemical Energy Releaser", efficiency: "50 %" },
    ],
  },
  {
    id: "plasma-generator",
    title: "Плазменный генератор",
    label: "Плазма",
    does: "плазму — в электричество",
    fuel: "плазме из реактора синтеза",
    tank: "16 000 л",
    about: "Превращает в ток плазму из реактора синтеза. В отличие от турбин и дизелей, с каждым ярусом его КПД растёт. Многоблочная замена — большая плазменная турбина.",
    tip: { title: "Какая плазма", text: "Гелиевая плазма — 81 920 EU за литр. Плазма олова из реактора синтеза II заметно лучше." },
    faces: (prefix) => ({ front: `${prefix}-plasma-front`, side: `${prefix}-plasma-side`, top: `${prefix}-plasma-top` }),
    versions: [
      { tier: "ev", name: "Plasma Generator Mk-I", efficiency: "50 %" },
      { tier: "iv", name: "Plasma Generator Mk-II", efficiency: "60 %" },
      { tier: "luv", name: "Plasma Generator Mk-III", efficiency: "70 %" },
      { tier: "zpm", name: "Plasma Generator Mk-IV", efficiency: "80 %" },
      { tier: "uv", name: "Ultimate Pocket Sun", efficiency: "90 %" },
    ],
  },
  {
    id: "naquadah-reactor",
    title: "Наквадовый реактор",
    label: "Наквада",
    does: "наквадовые стержни — в электричество",
    fuel: "стержнях обогащённой наквады, наквадрии и тиберия",
    tank: "1 ячейка",
    about: "Одноблочный реактор: в него кладут стержень из обогащённой наквады, наквадрии или тиберия, и стержень медленно превращается в ток. Каждая модель берёт только два своих вида стержней.",
    tip: { title: "КПД растёт", text: "У первой модели КПД 80 %, у четвёртой — 200 %: один и тот же стержень в старшей модели даёт больше тока." },
    faces: (prefix) => ({ front: `${prefix}-naq-front`, side: `${prefix}-naq-side`, top: `${prefix}-naq-top` }),
    versions: [
      { tier: "ev", name: "Naquadah Reactor Mk-I", efficiency: "80 %" },
      { tier: "iv", name: "Naquadah Reactor Mk-II", efficiency: "100 %" },
      { tier: "luv", name: "Naquadah Reactor Mk-III", efficiency: "150 %" },
      { tier: "zpm", name: "Naquadah Reactor Mk-IV", efficiency: "200 %" },
      { tier: "uv", name: "Naquadah Reactor Mk-V", efficiency: "250 %" },
    ],
  },
];

function generator(kind: Kind, version: Version): Single {
  const { tier } = version;
  const voltage = voltageOf(tier);
  const hull = `hull-${tier}`;
  return {
    slug: `${kind.id}-${tier}`,
    name: version.name,
    title: kind.title,
    label: kind.label,
    tier,
    group: "generator",
    does: kind.does,
    // Низ у плазменного и наквадового в игре тоже с рисунком; здесь он гладкий — его не видно.
    faces: { front: `${hull}-side`, side: `${hull}-side`, top: `${hull}-top`, bottom: `${hull}-bottom`, ...kind.faces(`gen-${tier}`) },
    story: [kind.about, `Эта модель выдаёт ${voltage} при КПД ${version.efficiency}.`],
    facts: [
      { label: "Размер", value: "1 блок" },
      { label: "Выдаёт", value: `${voltage}, 1 A` },
      { label: "Работает на", value: kind.fuel },
      { label: "КПД", value: version.efficiency },
      { label: "Вмещает", value: kind.tank },
    ],
    guide: { wiki: GENERATOR_WIKI, tips: [kind.tip, GENERATOR_TIP] },
  };
}

function generatorsOf(tier: HighTier): readonly Single[] {
  return KINDS.flatMap((kind) => kind.versions.filter((version) => version.tier === tier).map((version) => generator(kind, version)));
}

const OVERCLOCK: GuideTip = {
  title: "Разгон",
  text: "Рецепт яруса ниже машина ведёт вдвое быстрее, но тратит вчетверо больше энергии.",
};

const EV_TIPS: readonly GuideTip[] = [
  { title: "Титан", text: "Корпуса и детали EV делают из титана. Сначала наладьте его постоянный выпуск, потом переводите машины на новый ярус." },
  { title: "Не спешите", text: "EV намного дороже HV по энергии и ресурсам. Делайте всё с запасом: титан, сталь, моторы — иначе придётся раз за разом возвращаться в шахту." },
  OVERCLOCK,
];

const IV_TIPS: readonly GuideTip[] = [
  { title: "Ручная сборка кончилась", text: "В IV всё нужно в таких количествах, что собирать руками уже нельзя. Без большой сети автосборки ярус не пройти." },
  { title: "Постройки вместо машин", text: "Как только появляются одноблочные машины IV, открываются многоблочные версии почти всех машин. Обычно ставят их." },
  OVERCLOCK,
];

const LUV_TIPS: readonly GuideTip[] = [
  { title: "Детали — на сборочной линии", text: "Моторы, насосы и остальные детали LuV собирает только сборочная линия. Рецепт для неё получают, просканировав такую же деталь яруса IV." },
  { title: "Только автосборка", text: "Деревья рецептов стали ещё больше. Всё, что нужно, должно заказываться и собираться само." },
  OVERCLOCK,
];

const LUV_NOTES: Readonly<Record<string, string>> = {
  autoclave: "Растит кристаллические чипы — сердце кристаллических схем. Чип проходит автоклав много раз подряд.",
  hammer: "Вторая половина того же круга: разбивает выращенный кристалл, и осколки снова идут в автоклав.",
};

const UV_TIPS: readonly GuideTip[] = [
  { title: "Исследования", text: "Рецепты сборочной линии теперь исследуют на исследовательской станции, а не в сканере. Ей нужны вычисления — их даёт квантовый компьютер." },
  { title: "Схемы растят", text: "Органические схемы требуют бактериальных чанов. Многие оставляют для схем ярусов LuV–UV кристаллические, а органические делают только для UHV." },
  OVERCLOCK,
];

/** Названия машин в игре по-русски — из ru_RU.lang мода (GTNH 2.9). */
const UV_RU: Readonly<Record<string, string>> = {
  assembler: "Совершенный конструктор сборки",
  circuitassembler: "Продвинутый сборщик электросхем VII",
  mixer: "Совершенный организатор материи",
  laser_engraver: "Совершенная точная фотонная пушка",
  cutter: "Совершенный разделитель объектов",
  autoclave: "Совершенный автоклав",
  chemical_reactor: "Эпический химический перфоратор",
  electrolyzer: "Совершенный ионизатор",
  centrifuge: "Совершенное молекулярное торнадо",
  macerator: "Совершенный измельчитель",
  extruder: "Совершенный формирующий драйвер",
  wiremill: "Совершенный проволочный трансфигуратор",
  fluid_solidifier: "Совершенный жидкостный отвердитель",
  hammer: "Совершенный кузнечный молот",
};

const UHV_RU: Readonly<Record<string, string>> = {
  assembler: "Эпический конструктор сборки",
  circuitassembler: "Совершенный сборщик электросхем",
  mixer: "Эпический организатор материи",
  laser_engraver: "Эпическая точная фотонная пушка",
  cutter: "Эпический разделитель объектов",
  autoclave: "Эпический автоклав",
  chemical_reactor: "Эпический химический перфоратор",
  electrolyzer: "Эпический ионизатор",
  centrifuge: "Эпическое молекулярное торнадо",
  macerator: "Эпический измельчитель",
  extruder: "Эпический формирующий драйвер",
  wiremill: "Эпический проволочный трансфигуратор",
  fluid_solidifier: "Эпический жидкостный отвердитель",
  hammer: "Эпический кузнечный молот",
};

/** Что машине даёт ярус: её русское имя в игре, предел рецептов и особое, если вики о нём пишет. */
function tierNotes(
  names: Readonly<Record<string, string>>,
  tier: HighTier,
  extra: Readonly<Record<string, string>>,
): Readonly<Record<string, string>> {
  const voltage = voltageOf(tier);
  return Object.fromEntries(
    Object.entries(names).map(([folder, name]) => [
      folder,
      [`В игре по-русски — «${name}».`, `Берёт рецепты до ${voltage}, а рецепты ярусов ниже ведёт с разгоном.`, extra[folder]]
        .filter(Boolean)
        .join(" "),
    ]),
  );
}

const UV_NOTES = tierNotes(UV_RU, "uv", {
  circuitassembler: "Им же копируют чертёж ракеты восьмого уровня: таких чертежей нужно два, а в подземелье Плутона лежит один.",
});

const UHV_NOTES = tierNotes(UHV_RU, "uhv", {
  circuitassembler: "Схемы UHV и выше собирают уже на сборочной линии, а не здесь: у них нет рецептов для сборщика.",
});

/** В UEV и UIV те же имена, что в UHV, с «II» и «III» на конце — так в ru_RU.lang мода (ярусы 10 и 11). */
const UEV_RU = Object.fromEntries(Object.entries(UHV_RU).map(([folder, name]) => [folder, `${name} II`]));
const UIV_RU = Object.fromEntries(Object.entries(UHV_RU).map(([folder, name]) => [folder, `${name} III`]));

const UEV_NOTES = tierNotes(UEV_RU, "uev", {
  circuitassembler: "Оптические схемы — последнюю линию — собирают на линии сборки схем и сборочных линиях; оптический процессор — самый медленный рецепт линии сборки схем в игре.",
});

const UIV_NOTES = tierNotes(UIV_RU, "uiv", {});

/** UMV — те же имена с «IV», сборщик схем UXV — с «V» (ru_RU.lang мода, ярусы 12 и 13). */
const UMV_RU = Object.fromEntries(Object.entries(UHV_RU).map(([folder, name]) => [folder, `${name} IV`]));
const UXV_RU = { circuitassembler: `${UHV_RU.circuitassembler} V` };

const UMV_NOTES = tierNotes(UMV_RU, "umv", {});
const UXV_NOTES = tierNotes(UXV_RU, "uxv", {});


const UMV_TIPS: readonly GuideTip[] = [
  { title: "Ярус улучшений", text: "Новых построек почти нет. Главное — улучшать старые: холодильник, Кузницу богов, космический лифт и сборочные линии деталей." },
  { title: "Медленные рецепты", text: "Дальше рецепты идут очень долго. Книга советует заранее улучшить или заменить старые постройки, чтобы не грузить сервер." },
  OVERCLOCK,
];

const UXV_TIPS: readonly GuideTip[] = [
  { title: "Универсиум", text: "Его делает только Глаз гармонии на девятом уровне генераторов. Детали UXV из него очень дороги, поэтому ставят фабрикатор астральных массивов." },
  { title: "Звёздные врата", text: "Последняя цель книги заданий — собрать Звёздные врата." },
  OVERCLOCK,
];

const UEV_TIPS: readonly GuideTip[] = [
  { title: "Тенгам", text: "Первым делом — материнский корабль к Сету: только там есть сырой тенгам, магнитный материал для моторов UEV–UMV." },
  { title: "Вода седьмой степени", text: "Оптические схемы требуют воды седьмой степени очистки — для неё нужен новый блок линии очистки воды." },
  OVERCLOCK,
];

const UIV_TIPS: readonly GuideTip[] = [
  { title: "Всё ради кузницы", text: "Главная работа яруса — новые катушки для плазменной кузницы: сначала из гипогена, потом вечные из пространства-времени." },
  { title: "Беспроводной ток", text: "Смеситель катализатора и модули Кузницы богов берут ток только из беспроводной сети." },
  OVERCLOCK,
];

const UHV_TIPS: readonly GuideTip[] = [
  { title: "Только плазма и наквада", text: "Из прежних источников тока в UHV остаются только плазменные турбины и наквадовое топливо." },
  { title: "Ракета восьмого уровня", text: "Последняя обычная ракета: она открывает экзопланеты, где растут водоросли для биосхем и лежит катализатор бесконечности." },
  OVERCLOCK,
];

const ZPM_TIPS: readonly GuideTip[] = [
  { title: "Вода высокой очистки", text: "Пластины с европием режут только на воде третьей степени очистки и выше. Без них не сделать люки ZPM." },
  { title: "Схемы на ярус вперёд", text: "Органические схемы начинают собирать здесь, но четвёртую из них — только на следующем ярусе." },
  OVERCLOCK,
];

const EV_NOTES: Readonly<Record<string, string>> = {
  chemical_bath: "С неё начинается титан: ванна EV вымывает его из дроблёного ильменита серной кислотой.",
  electrolyzer: "Возвращает серную кислоту из отходов титановой ванны. Круг замыкается, и на вход идёт только ильменит.",
  circuitassembler: "Собирает наносхемы. Для компьютера второй ракеты нужно восемь таких мейнфреймов.",
  autoclave: "Первый шаг вольфрамовой линии: отделяет литий от вольфраматной пыли.",
  mixer: "Мешает вольфрамовую сталь из вольфрама и стали, а из неё — быстрорежущую сталь HSS-G.",
  assembler: "Открывает рецепты EV: детали яруса, части второй ракеты и первые блоки сети хранения.",
};

const IV_NOTES: Readonly<Record<string, string>> = {
  assembler: "С него начинается ярус: он открывает катушки из стали HSS-G для доменной печи и детали третьей ракеты.",
  circuitassembler: "Собирает квантовые схемы — новую линию схем. Им нужно много платины и радона. Сборщиков ставят несколько сразу: схем в IV нужно очень много.",
};

const ZPM_NOTES: Readonly<Record<string, string>> = {
  circuitassembler: "Собирает первые три органические схемы и лучшие кристаллические. Заодно открывает метеорит с лютецием — он нужен для америция.",
};

/** Один ярус: сначала генераторы, потом машины. */
function tierSingles(tier: HighTier, folders: readonly string[], notes: Readonly<Record<string, string>>, tips: readonly GuideTip[], wiki: string): readonly Single[] {
  return [...generatorsOf(tier), ...upgradedMachines({ tier, voltage: voltageOf(tier), folders, notes, tips, wiki })];
}

/** Все одноблочные от EV до MAX. */
export const HIGH_SINGLES: readonly Single[] = [
  ...tierSingles("ev", ASSETS.evMachineFolders, EV_NOTES, EV_TIPS, "Extreme Voltage (EV)"),
  ...tierSingles("iv", ASSETS.ivMachineFolders, IV_NOTES, IV_TIPS, "Insane Voltage (IV)"),
  ...tierSingles("luv", ASSETS.luvMachineFolders, LUV_NOTES, LUV_TIPS, "Ludicrous Voltage (LuV)"),
  ...tierSingles("zpm", ASSETS.zpmMachineFolders, ZPM_NOTES, ZPM_TIPS, "Zero Point Module (ZPM)"),
  ...tierSingles("uv", ASSETS.uvMachineFolders, UV_NOTES, UV_TIPS, "Ultimate Voltage (UV)"),
  ...tierSingles("uhv", ASSETS.uhvMachineFolders, UHV_NOTES, UHV_TIPS, "Highly Ultimate Voltage (UHV)"),
  ...tierSingles("uev", ASSETS.uevMachineFolders, UEV_NOTES, UEV_TIPS, "Extremely Ultimate Voltage (UEV)"),
  ...tierSingles("uiv", ASSETS.uivMachineFolders, UIV_NOTES, UIV_TIPS, "Insanely Ultimate Voltage (UIV)"),
  ...tierSingles("umv", ASSETS.umvMachineFolders, UMV_NOTES, UMV_TIPS, "Mega Ultimate Voltage (UMV)"),
  ...tierSingles("uxv", ASSETS.uxvMachineFolders, UXV_NOTES, UXV_TIPS, "Extended Mega Ultimate Voltage (UXV)"),
];
