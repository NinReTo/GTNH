import { ASSETS, GAME } from "./config";
import type { GuideTip } from "./guides";
import { upgradedMachines } from "./mv";
import type { Faces, Single } from "./singles";

/**
 * Генераторы и одноблочные машины HV. Машины и советы — со страницы
 * High Voltage (HV) вики GT New Horizons; числа генераторов — со страницы
 * Singleblock Generators.
 */

const HV_VOLTAGE = `${GAME.voltageTiers[GAME.hvTier].voltage} EU/t`;

const HULL: Faces = { front: "hull-hv-side", side: "hull-hv-side", top: "hull-hv-top", bottom: "hull-hv-bottom" };
const ENERGY_OUT = "gen-hv-energy-out";

/** Главные заботы яруса: энергия и чистая комната. */
const HV_TIPS: readonly GuideTip[] = [
  {
    title: "Энергии нужно вчетверо больше",
    text: "Каждая машина HV ест вчетверо больше топлива, чем машина MV. Сначала расширьте и автоматизируйте энергетику, потом ставьте машины.",
  },
  {
    title: "Нержавейка",
    text: "Корпуса HV делают из нержавеющей стали, и её уходит очень много. Наладьте её плавку до перехода на ярус.",
  },
];

const GENERATOR_WIKI = "Singleblock Generators";

const GENERATORS: readonly Single[] = [
  {
    slug: "steam-turbine-hv",
    name: "Turbo Steam Turbine",
    title: "Паровая турбина",
    label: "Пар",
    tier: "hv",
    group: "generator",
    does: "пар — в электричество",
    faces: { ...HULL, front: ENERGY_OUT, side: "gen-hv-steam-turbine-side" },
    story: [
      `Последняя одноблочная паровая турбина: ${HV_VOLTAGE}.`,
      "КПД у неё всего 66 %, а пара нужно 31 272 литра в секунду. Вместо неё обычно строят большую паровую турбину — она намного выгоднее.",
    ],
    facts: [
      { label: "Размер", value: "1 блок" },
      { label: "Выдаёт", value: `${HV_VOLTAGE}, 1 A` },
      { label: "Ест", value: "31 272 л пара в секунду" },
      { label: "КПД", value: "66 %" },
      { label: "Бак", value: "72 000 л" },
    ],
    guide: {
      wiki: GENERATOR_WIKI,
      tips: [
        { title: "Лучше большая", text: "Одноблочных паровых турбин выше HV нет. Дальше пар крутит только большие турбины." },
        ...HV_TIPS,
      ],
    },
  },
  {
    slug: "combustion-generator-hv",
    name: "Turbo Combustion Generator",
    title: "Дизельный генератор",
    label: "Дизель",
    tier: "hv",
    group: "generator",
    does: "жидкое топливо — в электричество",
    faces: { ...HULL, front: ENERGY_OUT, top: "gen-hv-combustion-top" },
    story: [
      `Генератор на жидком топливе, ${HV_VOLTAGE}.`,
      "В HV дизельные генераторы получают лучшее топливо: дизель с цетановой присадкой. Литр даёт 1 000 EU — вдвое больше обычного дизеля.",
    ],
    facts: [
      { label: "Размер", value: "1 блок" },
      { label: "Выдаёт", value: `${HV_VOLTAGE}, 1 A` },
      { label: "Топливо", value: "дизель с присадкой, дизель" },
      { label: "КПД", value: "85 %" },
      { label: "Бак", value: "16 000 л" },
    ],
    guide: {
      wiki: GENERATOR_WIKI,
      tips: [
        { title: "Цетановая присадка", text: "Улучшенный дизель — самый простой способ пережить первый энергетический кризис яруса." },
        ...HV_TIPS,
      ],
    },
  },
  {
    slug: "gas-turbine-hv",
    name: "Turbo Gas Turbine",
    title: "Газовая турбина",
    label: "Газ",
    tier: "hv",
    group: "generator",
    does: "горючий газ — в электричество",
    faces: { ...HULL, front: ENERGY_OUT, side: "gen-hv-gas-turbine-side" },
    story: [
      `Генератор на горючем газе, ${HV_VOLTAGE}.`,
      "Бензол в HV добывать намного проще: ректификационная колонна и лучшие катушки пиролизной печи сильно ускоряют его выход. Колонна даёт ещё фенол и толуол — их тоже можно жечь.",
    ],
    facts: [
      { label: "Размер", value: "1 блок" },
      { label: "Выдаёт", value: `${HV_VOLTAGE}, 1 A` },
      { label: "Топливо", value: "бензол, фенол, толуол" },
      { label: "КПД", value: "85 %" },
      { label: "Бак", value: "16 000 л" },
    ],
    guide: {
      wiki: GENERATOR_WIKI,
      tips: [
        { title: "Что жечь", text: "Бензол — 360 EU за литр, толуол — 328, фенол — 288." },
        ...HV_TIPS,
      ],
    },
  },
];

const CLEANROOM = "Работает только внутри чистой комнаты.";

/** Что машине даёт ярус HV — по её папке в текстурах мода. */
const HV_NOTES: Readonly<Record<string, string>> = {
  chemical_reactor: "С него и со смесителя вики советует начинать ярус: на них стоит вся химия HV.",
  mixer: "Нужен в самом начале яруса — вместе с химическим реактором.",
  circuitassembler: `Собирает схемы яруса IV — они нужны для верстака NASA и первой ракеты. ${CLEANROOM}`,
  assembler: "Открывает рецепты HV. Для некоторых из них ему тоже нужна чистая комната.",
  laser_engraver: `Гравирует пластины для сложных микросхем. ${CLEANROOM}`,
  cutter: `Режет кремниевые пластины на чипы. ${CLEANROOM}`,
  macerator: "Наконец даёт побочные продукты: с HV дробилка возвращает из руды больше, чем один металл.",
  electrolyzer: "Разбирает на элементы вещества, которые версии MV не по силам.",
  centrifuge: "Делит на части материалы яруса HV.",
  autoclave: "Выращивает кристаллы, которым не хватало давления и напряжения MV.",
};

const MACHINE_TIPS: readonly GuideTip[] = [
  {
    title: "Чистая комната",
    text: "Внутри неё должны стоять только лазерный гравёр, резак, сборщик схем и иногда сборщик. Всё остальное работает снаружи.",
  },
  ...HV_TIPS,
  {
    title: "Пора на постройки",
    text: "В HV появляются многоблочные версии привычных машин. Они быстрее и выгоднее одноблочных — присмотритесь к ним, прежде чем множить одноблочные.",
  },
];

/** Все одноблочные HV: сначала генераторы, потом машины. */
export const HV_SINGLES: readonly Single[] = [
  ...GENERATORS,
  ...upgradedMachines({
    tier: "hv",
    voltage: HV_VOLTAGE,
    folders: ASSETS.hvMachineFolders,
    notes: HV_NOTES,
    tips: MACHINE_TIPS,
    wiki: "High Voltage (HV)",
  }),
];
