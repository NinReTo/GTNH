import { ASSETS } from "./config";
import type { Guide } from "./guides";
import type { Machine } from "./machines";
import { BLACK_HOLE_LAYERS } from "./black-hole-layers";
import { HEARTH_LAYERS } from "./hearth-layers";
import { MEGA_CRACKER_LAYERS } from "./mega-cracker-layers";
import { MEGA_DISTILLATION_LAYERS } from "./mega-distillation-layers";
import { QFT_LAYERS } from "./qft-layers";
import { EYE_OF_HARMONY_LAYERS } from "./eye-of-harmony-layers";
import { FRIDGE_LAYERS } from "./fridge-layers";
import {
  CONDENSATE_CONTAINMENT_LAYERS,
  CONDENSATE_GENERATOR_LAYERS,
  CONDENSATE_MAXWELL_LAYERS,
  CONDENSATE_OBSERVATION_LAYERS,
  CONDENSATE_TELEPORTATION_LAYERS,
} from "./condensate-layers";
import { GODFORGE_LAYERS } from "./godforge-layers";
import { NANOCHIP_COMPLEX_LAYERS } from "./nanochip-layers";
import { PLASMA_FORGE_LAYERS } from "./plasma-forge-layers";

/**
 * Постройки ярусов EV, IV и ZPM. Схемы — из исходников GT5-Unofficial (в том же
 * репозитории лежат GT++, KekzTech и GoodGenerator, лицензия та же — LGPL-3.0).
 * Что постройка делает и зачем — со страниц вики GT New Horizons:
 * Extreme Voltage (EV), Insane Voltage (IV), Zero Point Module (ZPM).
 *
 * Если схема в исходнике записана срезами от фасада назад, здесь она
 * переложена в слои сверху вниз (ряды — от фасада назад).
 */

const SOURCES = `https://github.com/GTNewHorizons/GT5-Unofficial/blob/${ASSETS.gregtechCommit}/src/main/java`;
const MULTI = `${SOURCES}/gregtech/common/tileentities/machines/multi`;

/** Кольцо реактора синтеза (MTEFusionComputer): три слоя пятнадцать на пятнадцать, общее для всех моделей. */
const FUSION_RING: readonly (readonly string[])[] = [
  [
    "               ", "      hhh      ", "    hh   hh    ", "   h       h   ", "  h         h  ",
    "  h         h  ", " h           h ", " h           h ", " h           h ", "  h         h  ",
    "  h         h  ", "   h       h   ", "    hh   hh    ", "      hhh      ", "               ",
  ],
  [
    "      hhh      ", "    hhccchh    ", "   hcchhhcch   ", "  hchh   hhch  ", " hch       hch ",
    " hch       hch ", "hch         hch", "hch         hch", "hch         hch", " hch       hch ",
    " hch       hch ", "  hchh   hhch  ", "   hcch~hcch   ", "    hhccchh    ", "      hhh      ",
  ],
  [
    "               ", "      hhh      ", "    hh   hh    ", "   h       h   ", "  h         h  ",
    "  h         h  ", " h           h ", " h           h ", " h           h ", "  h         h  ",
    "  h         h  ", "   h       h   ", "    hh   hh    ", "      hhh      ", "               ",
  ],
];

/** Электрический имплозионный компрессор (MTEElectricImplosionCompressor): слои сверху вниз, ряды от фасада назад. */
const EIC_LAYERS: readonly (readonly string[])[] = [
  ["               ", "F F         F F", "F F         F F", "F F         F F", "F F         F F", "F F         F F"],
  ["F F         F F", "F F   FFF   F F", "FBF  FFCFF  FBF", "FBFFFFCCCFFFFBF", "FBF  FFCFF  FBF", "F F   FFF   F F"],
  ["F F         F F", "FBF  FFAFF  FBF", "F FFFEEEEEFFF F", "F FBBBEDEBBBF F", "F FFFEEEEEFFF F", "FBF  FFAFF  FBF"],
  ["F F         F F", "FBF  AAAAA  FBF", "F FAA     AAF F", "F F         F F", "F FAA     AAF F", "FBF  AAAAA  FBF"],
  ["F F         F F", "FBF  FFAFF  FBF", "F FFFEEEEEFFF F", "F FBBBEDEBBBF F", "F FFFEEEEEFFF F", "FBF  FFAFF  FBF"],
  ["F F         F F", "F F   F~F   F F", "FBF  FFCFF  FBF", "FBFFFFCCCFFFFBF", "FBF  FFCFF  FBF", "F F   FFF   F F"],
  ["               ", "F F         F F", "F F         F F", "F F         F F", "F F         F F", "F F         F F"],
];

/** Мега-плавильня сплавов (MTEMegaAlloyBlastSmelter): срезы исходника переложены в слои сверху вниз. */
const MEGA_ABS_LAYERS: readonly (readonly string[])[] = [
  ["           ", "   DDDDD   ", "  DDDDDDD  ", " DDDDDDDDD ", " DDDDDDDDD ", " DDDDFDDDD ", " DDDDDDDDD ", " DDDDDDDDD ", "  DDDDDDD  ", "   DDDDD   ", "           "],
  ["           ", "   AAAAA   ", "  ABBBBBA  ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", "  ABBBBBA  ", "   AAAAA   ", "           "],
  ["           ", "   AAAAA   ", "  ABBBBBA  ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", "  ABBBBBA  ", "   AAAAA   ", "           "],
  ["           ", "   AAAAA   ", "  ABBBBBA  ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", "  ABBBBBA  ", "   AAAAA   ", "           "],
  ["           ", "   AAAAA   ", "  ABBBBBA  ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", "  ABBBBBA  ", "   AAAAA   ", "           "],
  ["           ", "   AAAAA   ", "  ABBBBBA  ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", "  ABBBBBA  ", "   AAAAA   ", "           "],
  ["           ", "   AAAAA   ", "  ABBBBBA  ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", "  ABBBBBA  ", "   AAAAA   ", "           "],
  ["           ", "   AAAAA   ", "  ABBBBBA  ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", "  ABBBBBA  ", "   AAAAA   ", "           "],
  ["           ", "   AAAAA   ", "  ABBBBBA  ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", "  ABBBBBA  ", "   AAAAA   ", "           "],
  ["           ", "   AAAAA   ", "  ABBBBBA  ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", "  ABBBBBA  ", "   AAAAA   ", "           "],
  ["           ", "   AAAAA   ", "  ABBBBBA  ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", "  ABBBBBA  ", "   AAAAA   ", "           "],
  ["           ", "   AAAAA   ", "  ABBBBBA  ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", " AB     BA ", "  ABBBBBA  ", "   AAAAA   ", "           "],
  ["           ", "   DDDDD   ", "  DBBBBBD  ", " DB     BD ", " DB     BD ", " DB     BD ", " DB     BD ", " DB     BD ", "  DBBBBBD  ", "   DDDDD   ", "           "],
  ["   DDDDD   ", "  D     D  ", " D BBBBB D ", "D B     B D", "D B     B D", "D B     B D", "D B     B D", "D B     B D", " D BBBBB D ", "  D     D  ", "   DDDDD   "],
  ["   CCCCC   ", "  C     C  ", " C BBBBB C ", "C B     B C", "C B     B C", "C B     B C", "C B     B C", "C B     B C", " C BBBBB C ", "  C     C  ", "   CCCCC   "],
  ["   AEEEA   ", "  A     A  ", " A BBBBB A ", "A B     B A", "A B     B A", "A B     B A", "A B     B A", "A B     B A", " A BBBBB A ", "  A     A  ", "   AAAAA   "],
  ["   AE~EA   ", "  A     A  ", " A BBBBB A ", "A B     B A", "A B     B A", "A B     B A", "A B     B A", "A B     B A", " A BBBBB A ", "  A     A  ", "   AAAAA   "],
  ["   AEEEA   ", "  A     A  ", " A BBBBB A ", "A B     B A", "A B     B A", "A B     B A", "A B     B A", "A B     B A", " A BBBBB A ", "  A     A  ", "   AAAAA   "],
  ["   CCCCC   ", "  C     C  ", " C BBBBB C ", "C B     B C", "C B     B C", "C B     B C", "C B     B C", "C B     B C", " C BBBBB C ", "  C     C  ", "   CCCCC   "],
  ["   ZZZZZ   ", "  ZZZZZZZ  ", " ZZZZZZZZZ ", "ZZZZZZZZZZZ", "ZZZZZZZZZZZ", "ZZZZZZZZZZZ", "ZZZZZZZZZZZ", "ZZZZZZZZZZZ", " ZZZZZZZZZ ", "  ZZZZZZZ  ", "   ZZZZZ   "],
];

/** Трансцендентный плазменный смеситель (MTETranscendentPlasmaMixer): срезы исходника переложены в слои. */
const TPM_LAYERS: readonly (readonly string[])[] = [
  [" CAC ", "CBBBC", "ABBBA", "CBBBC", " CAC "],
  [" ABA ", "A   A", "B   B", "A   A", " ABA "],
  [" ABA ", "A   A", "B   B", "A   A", " ABA "],
  [" A~A ", "A   A", "B   B", "A   A", " ABA "],
  [" ABA ", "A   A", "B   B", "A   A", " ABA "],
  [" ABA ", "A   A", "B   B", "A   A", " ABA "],
  [" CAC ", "CBBBC", "ABBBA", "CBBBC", " CAC "],
];

/** Модуль Кузницы богов (MTEBaseModule): срезы исходника переложены в слои. Он стоит возле Кузницы, но собирается как своя постройка. */
const GODFORGE_MODULE_LAYERS: readonly (readonly string[])[] = [
  ["       ", "  CCC  ", "       ", "       ", "       ", "       ", "       ", "       ", "       ", "       ", "       ", "       ", "       "],
  ["  BBB  ", " CFFFC ", "       ", "       ", "       ", "       ", "       ", "       ", "       ", "       ", "       ", "       ", "       "],
  [" BBBBB ", "CFFFFFC", "   E   ", "   E   ", "   E   ", "   E   ", "   E   ", "       ", "       ", "       ", "       ", "       ", "       "],
  [" BB~BB ", "CFFFFFC", "  EAE  ", "  EAE  ", "  EAE  ", "  EAE  ", "  EAE  ", "   D   ", "   D   ", "   D   ", "   D   ", "   D   ", "   G   "],
  [" BBBBB ", "CFFFFFC", "   E   ", "   E   ", "   E   ", "   E   ", "   E   ", "       ", "       ", "       ", "       ", "       ", "       "],
  ["  BBB  ", " CFFFC ", "       ", "       ", "       ", "       ", "       ", "       ", "       ", "       ", "       ", "       ", "       "],
  ["       ", "  CCC  ", "       ", "       ", "       ", "       ", "       ", "       ", "       ", "       ", "       ", "       ", "       "],
];

/** Корпуса всех машин конденсата одни и те же; P, Q, R — корпуса, на место которых ставят люки. */
const CONDENSATE_KINDS = {
  A: "becConduit",
  B: "becCasing",
  C: "becManipulator",
  D: "becConflict",
  E: "becPeace",
  F: "becPrimaryCoil",
  G: "becSecondaryCoil",
  H: "becWaveguide",
} as const;

const CONDENSATE_LINE =
  "Конденсат Бозе-Эйнштейна — линия из четырёх построек UIV, соединённых трубами-кондуитами и люками конденсата: аппарат запутывания делает конденсат, поле удержания его хранит, матрица наблюдения собирает из него детали, а узел телепортации подаёт и забирает предметы. Затвор Максвелла — по желанию.";

const HATCHES = "Люки здесь не показаны: они ставятся на место обычных корпусов.";

export const HIGH_MACHINES: readonly Machine[] = [
  /* ------------------------------ МАХ ----------------------------- */
  {
    slug: "stargate",
    name: "Stargate",
    title: "Звёздные врата",
    tier: "uxv",
    summary: "Последняя цель всей сборки: кольцо из восьми блоков и семи шевронов на основе. Ради него делают схемы и детали МАХ.",
    story: [
      "Финальное задание книги — «Что, как?»: собрать Звёздные врата. Книга называет это труднейшим испытанием GregTech: New Horizons, а за выполнение поздравляет вся команда сборки.",
      "Сами врата — блоки мода SGCraft: кольцо 5 × 5 из восьми блоков кольца и семи блоков шеврона, внизу посередине — основа. Перед вратами ставят наборное устройство, рядом — блок питания. Здесь врата показаны вместе с ними.",
      "В вики врата отнесены к UXV, но цена у них — и ярус МАХ: планковские МАХ-схемы, детали МАХ (по заданию «Ты это сделал!» — «последний этап игры»), экранирующая фольга, каркасы и сетки врат из универсиума.",
    ],
    facts: [
      { label: "Кольцо", value: "5 × 5" },
      { label: "Блоков кольца", value: "8 + 7 шевронов" },
      { label: "Задание", value: "«Что, как?» — последнее в книге" },
      { label: "Нужно", value: "МАХ-схемы и детали МАХ" },
    ],
    source: `https://github.com/GTNewHorizons/SGCraft/blob/${ASSETS.sgcraftCommit}/src/main/java/gcewing/sg/blocks/SGBaseBlock.java`,
    // Кольцо — шаблон SGBaseBlock.pattern (2 — шеврон, 1 — блок кольца, внизу посередине — основа).
    // Перед вратами — наборное устройство, за основой — блок питания.
    def: {
      layers: [
        ["     ", "     ", "CRCRC", "     "],
        ["     ", "     ", "R   R", "     "],
        ["     ", "     ", "C   C", "     "],
        ["     ", "     ", "R   R", "     "],
        ["  D  ", "     ", "CR~RC", "  P  "],
      ],
      kinds: { R: "sgRing", C: "sgChevron", D: "sgDhd", P: "sgPower", "~": "sgBase" },
    },
  },

  /* ------------------------------ UMV ----------------------------- */
  {
    slug: "endothermic-fridge",
    name: "Endothermic Fridge",
    title: "Эндотермический холодильник",
    tier: "zpm",
    summary: "Огромная вакуумная морозилка на 256 рецептов сразу. В UMV её улучшают до второго уровня — с идеальным разгоном.",
    story: [
      "В игре по-русски — «Эндотермический холодильник». Он делает то же, что вакуумная морозилка: охлаждает горячие слитки и сжижает газы, только по 256 рецептов сразу. Открывается он в ZPM (так в вики), в главе книги о массовом производстве; в GTNH 2.9 он заменил мега-морозилку.",
      "В UMV его улучшают: морозостойкие корпуса в середине меняют на корпуса с бесконечным охлаждением. После этого в холодильник можно лить расплавленную бесконечность, пространство-время или вечность — и рецепты идут с идеальным разгоном. Здесь он показан уже улучшенным.",
      "Постройка — круглая башня 23 × 16 × 23: внизу укреплённое основание, наверху купол из корпусов холодильника, а по кругу — рамы из льда Каллисто.",
    ],
    facts: [
      { label: "Размер", value: "23 × 16 × 23" },
      { label: "Блоков", value: "1 815" },
      { label: "Параллели", value: "256" },
      { label: "Прибавка скорости", value: "до 150 % через 5 минут" },
    ],
    source: `${MULTI}/MTEEndothermicFridge.java`,
    def: {
      layers: FRIDGE_LAYERS,
      kinds: {
        A: "glass",
        B: "coolantDuct",
        C: "fridgeCasing",
        D: "frostProof",
        E: "wsteelPipe",
        F: "wsteelCasing",
        G: "callistoFrame",
        H: "wsteelReinforced",
        I: "ledoxSheet",
        J: "infinityCooled",
        "~": "fridgeController",
      },
    },
  },

  /* ------------------------------ UXV ----------------------------- */
  {
    slug: "eye-of-harmony",
    name: "Eye of Harmony",
    title: "Глаз гармонии",
    tier: "umv",
    summary: "Последняя и самая дорогая постройка игры: перемалывает целые планеты и звёзды. Без неё нет универсиума и деталей UXV.",
    story: [
      "В игре по-русски — «Глаз гармонии». Это постройка UMV (так в вики и в главе UMV книги заданий), а UXV книга называет «эрой Глаза гармонии»: только он даёт сырую звёздную плазму, вещество белого и чёрного карликов и универсиум.",
      "Внутри — небесное тело: планета или звезда, которую Глаз разбирает на материалы, сжигая горы водорода и гелия. Рецепт может сорваться — тогда вместо материалов будет ток. Сама постройка — шар 33 × 33 × 33 из корпусов, укреплённых пространством-временем.",
      "Работу Глаза решают три вида генераторов полей по девять уровней: сжатие, замедление времени и стабилизация. Здесь все три стоят на последнем, галлифрейском уровне.",
    ],
    facts: [
      { label: "Размер", value: "33 × 33 × 33" },
      { label: "Блоков", value: "1 821" },
      { label: "Работает на", value: "водороде и гелии" },
      { label: "Делает", value: "универсиум, вещество карликов, звёздную плазму" },
    ],
    source: `${SOURCES}/tectech/thing/metaTileEntity/multi/MTEEyeOfHarmony.java`,
    def: {
      layers: EYE_OF_HARMONY_LAYERS,
      kinds: {
        A: "eohCompression",
        C: "eohSpatial",
        D: "eohTemporal",
        E: "eohDilation",
        H: "eohBoundary",
        S: "eohStabilisation",
        "~": "eohController",
      },
    },
  },

  /* ------------------------------ EV ------------------------------ */
  {
    slug: "large-combustion-engine",
    name: "Large Combustion Engine",
    title: "Большой дизельный двигатель",
    tier: "ev",
    summary: "Многоблочный дизель: 2 048 EU/t, а с кислородом — втрое больше.",
    story: [
      "Первый энергетический кризис EV обычно решают им. Двигатель жжёт то же жидкое топливо, что и одноблочные генераторы, но без потерь: 2 048 EU/t при КПД 100 %.",
      "Если подавать в него ещё и кислород, он выдаёт 6 144 EU/t при КПД 150 %. Поэтому двигатель держат на кислороде всегда. Ещё ему нужно немного смазки.",
      "Постройка лежит на боку. Слева — блок управления с контроллером в тефлоновых рамах, справа — длинный корпус: спереди воздухозаборники, внутри титановый редуктор, с торца — динамо-люк.",
      "Перед воздухозаборниками должно быть пусто.",
    ],
    facts: [
      { label: "Размер", value: "8 × 3 × 3" },
      { label: "Выдаёт", value: "2 048 EU/t, с кислородом 6 144" },
      { label: "Работает на", value: "жидком топливе и смазке" },
      { label: "Выдаёт ток", value: "через динамо-люк" },
    ],
    source: `${MULTI}/MTELargeCombustionEngine.java`,
    def: {
      // В исходнике перед двигателем есть ещё срез из воздуха — он здесь опущен.
      layers: [
        ["ETEIIIIE", "ETETTTTE", "ETETTTTE"],
        ["E~EIIIIE", "CTTGGGGD", "ETETTTTE"],
        ["ECECCCCE", "CCCCCCCC", "ECECCCCE"],
      ],
      kinds: {
        E: "ptfeFrame",
        T: "titaniumCasing",
        I: "engineIntake",
        G: "titaniumGearbox",
        C: "inertCasing",
        D: "lceDynamo",
        "~": "lceController",
      },
    },
  },
  {
    slug: "large-gas-turbine",
    name: "Large Gas Turbine",
    title: "Большая газовая турбина",
    tier: "ev",
    summary: "Многоблочная турбина на горючем газе. Её КПД зависит от ротора и легко уходит за 100 %.",
    story: [
      "Устроена так же, как большая паровая турбина, только собрана из нержавейки и жжёт газ: бензол, метан, нефтяной газ.",
      "В контроллер вставляют ротор. Газа нужно подавать столько, сколько ротору положено: если подать заметно больше или меньше, КПД упадёт.",
      "Спереди — стенка три на три с ротором, за ней вал в рамах из нержавейки, потом корпус, а в хвосте — динамо-люк. Перед ротором должно быть пусто.",
    ],
    facts: [
      { label: "Размер", value: "3 × 3 × 6" },
      { label: "Работает на", value: "горючем газе" },
      { label: "КПД", value: "задаёт ротор" },
      { label: "Выдаёт ток", value: "через динамо-люк" },
    ],
    source: `${MULTI}/turbines/MTELargeTurbineGas.java`,
    def: {
      // Та же схема, что у паровой турбины (MTELargeTurbineBase), — отличаются только блоки.
      layers: [
        ["abc", " B ", " B ", "ApA", "ApA", "B B"],
        ["def", "BAB", "BAB", "pAp", "pAp", "BDB"],
        ["ghi", " B ", " B ", "ApA", "ApA", "B B"],
      ],
      kinds: {
        a: "gasTurbine1",
        b: "gasTurbine2",
        c: "gasTurbine3",
        d: "gasTurbine4",
        e: "gasTurbine5",
        f: "gasTurbine6",
        g: "gasTurbine7",
        h: "gasTurbine8",
        i: "gasTurbine9",
        A: "tinPipe",
        B: "stainlessFrame",
        p: "stainlessTurbine",
        D: "gasDynamo",
      },
    },
  },
  {
    slug: "ore-drilling-plant",
    name: "Ore Drilling Plant",
    title: "Рудная буровая",
    tier: "ev",
    summary: "Сама выкапывает всю руду под собой — чанк за чанком.",
    story: [
      "Многоблочный шахтёр. Он опускает буровую трубу до самого дна мира и выбирает всю руду вокруг — не только под собой, но и в соседних чанках.",
      "Выглядит как нефтяная буровая из MV: основание три на три из цельной стали и вышка из стальных рам. Отличается контроллер.",
      "Кроме тока ей нужны буровые трубы и буровой раствор.",
    ],
    facts: [
      { label: "Размер", value: "3 × 7 × 3" },
      { label: "Работает на", value: "электричестве, от EV" },
      { label: "Расходует", value: "буровые трубы и раствор" },
      { label: "Выдаёт", value: "руду через выходную шину" },
    ],
    source: `${MULTI}/MTEOreDrillingPlant1.java`,
    def: {
      // Схема общая с буровой для жидкостей (MTEDrillerBase). Люки расставлены, как у неё.
      layers: [
        ["   ", " f ", "   "],
        ["   ", " f ", "   "],
        ["   ", " f ", "   "],
        [" f ", "fcf", " f "],
        [" f ", "fcf", " f "],
        [" f ", "fcf", " f "],
        ["E~M", "ccc", "ccc"],
      ],
      kinds: { f: "steelFrame", c: "solidSteel", "~": "oreDrillController", E: "drillEnergy", M: "drillMaintenance" },
    },
  },
  {
    slug: "industrial-centrifuge",
    name: "Industrial Centrifuge",
    title: "Промышленная центрифуга",
    tier: "ev",
    summary: "Многоблочная центрифуга: много рецептов сразу и намного быстрее одноблочной.",
    story: [
      "С EV привычные машины переработки руды получают многоблочные версии. Центрифуга — первая, которую советует вики: особенно тем, кто получает ресурсы от пчёл, — соты она крутит во много раз быстрее.",
      "Спереди — кольцо корпусов, за ним стенка с контроллером в рамах из стали Эглин, дальше барабан из решёток и задняя стенка в таких же рамах.",
      HATCHES,
    ],
    facts: [
      { label: "Размер", value: "5 × 5 × 5" },
      { label: "Работает на", value: "электричестве, от EV" },
      { label: "За один раз", value: "несколько рецептов" },
      { label: "Заменяет", value: "одноблочную центрифугу" },
    ],
    source: `${MULTI}/MTEIndustrialCentrifuge.java`,
    def: {
      layers: [
        [" CCC ", " AAA ", "  C  ", "  C  ", " AAA "],
        ["C   C", "ACCCA", " BBB ", " BBB ", "ACCCA"],
        ["C   C", "AC~CA", "CBBBC", "CBBBC", "ACCCA"],
        ["C   C", "ACCCA", " BBB ", " BBB ", "ACCCA"],
        [" CCC ", " AAA ", "  C  ", "  C  ", " AAA "],
      ],
      kinds: { A: "eglinFrame", B: "sieveGrate", C: "centrifugeCasing", "~": "centrifugeController" },
    },
  },
  {
    slug: "industrial-maceration-stack",
    name: "Industrial Maceration Stack",
    title: "Дробильная башня",
    tier: "ev",
    summary: "Многоблочная дробилка: дробит руду пачками.",
    story: [
      "Башня из титановых корпусов высотой в шесть блоков, пустая внутри. Она делает то же, что одноблочная дробилка, — только сразу много рецептов.",
      "Вместе с промышленной центрифугой и моечной установкой она превращает переработку руды из ряда одноблочных машин в несколько больших построек.",
      "Здесь показан первый ярус башни. У второго, более позднего, башня шире и со стеклом.",
      HATCHES,
    ],
    facts: [
      { label: "Размер", value: "3 × 6 × 3" },
      { label: "Работает на", value: "электричестве, от EV" },
      { label: "За один раз", value: "несколько рецептов" },
      { label: "Заменяет", value: "одноблочную дробилку" },
    ],
    source: `${MULTI}/MTEIndustrialMacerator.java`,
    def: {
      layers: [
        ["CCC", "CCC", "CCC"],
        ["CCC", "C-C", "CCC"],
        ["CCC", "C-C", "CCC"],
        ["CCC", "C-C", "CCC"],
        ["CCC", "C-C", "CCC"],
        ["C~C", "CCC", "CCC"],
      ],
      kinds: { C: "titaniumCasing", "~": "macStackController" },
      hollow: "-",
      interior: "water",
    },
  },
  {
    slug: "lapotronic-supercapacitor",
    name: "Lapotronic Supercapacitor",
    title: "Лапотронный суперконденсатор",
    tier: "ev",
    summary: "Огромная батарея для всей базы: копит ток генераторов и отдаёт его машинам.",
    story: [
      "Большие двигатели и реакторы жгут топливо постоянно — даже когда ток никому не нужен. Суперконденсатор копит этот ток, чтобы он не пропадал. Это второй энергетический кризис EV и его решение.",
      "Внизу — основание пять на пять в два слоя с контроллером. Над ним — стеклянная башня, внутри которой стоят конденсаторы три на три. Чем больше слоёв конденсаторов, тем больше ёмкость; здесь их три.",
      "Конденсаторам EV и IV хватает обычного боросиликатного стекла. Сам по себе он понемногу теряет ток — около 30 EU/t у самой маленькой башни.",
    ],
    facts: [
      { label: "Размер", value: "5 × 5, высота от 4 до 50" },
      { label: "Здесь показан", value: "5 × 6 × 5" },
      { label: "Хранит", value: "электричество" },
      { label: "Вход и выход", value: "люки в основании" },
    ],
    source: `${SOURCES}/kekztech/common/tileentities/MTELapotronicSuperCapacitor.java`,
    def: {
      layers: [
        ["ggggg", "ggggg", "ggggg", "ggggg", "ggggg"],
        ["ggggg", "gCCCg", "gCCCg", "gCCCg", "ggggg"],
        ["ggggg", "gCCCg", "gCCCg", "gCCCg", "ggggg"],
        ["ggggg", "gCCCg", "gCCCg", "gCCCg", "ggggg"],
        ["bbbbb", "bbbbb", "bbbbb", "bbbbb", "bbbbb"],
        ["bb~bb", "bbbbb", "bbbbb", "bbbbb", "bbbbb"],
      ],
      kinds: { g: "glass", C: "lscCapacitor", b: "lscBase", "~": "lscController" },
    },
  },

  /* ------------------------------ IV ------------------------------ */
  {
    slug: "assembly-line",
    name: "Assembly Line",
    title: "Сборочная линия",
    tier: "iv",
    summary: "Последняя постройка IV и ворота в следующий ярус: собирает самые сложные детали.",
    story: [
      "Длинный конвейер. Каждый его отрезок принимает свой предмет, а в конце выходит готовая деталь — моторы, насосы и корпуса следующих ярусов по-другому не собрать.",
      "Линия растёт в длину: от пяти до шестнадцати отрезков. Здесь показана самая короткая. Снизу — стальное основание с входными шинами, над ним — корпус линии за стеклом, выше — корпуса сборщика, а сверху — ряд стали с энергетическим люком.",
      "Даже для самой короткой линии нужно 90 схем яруса ZPM. Так игра проверяет, готова ли база к следующему ярусу.",
    ],
    facts: [
      { label: "Размер", value: "от 5 до 16 в длину, 3 × 4 в сечении" },
      { label: "Здесь показана", value: "5 × 4 × 3" },
      { label: "Работает на", value: "электричестве, от IV" },
      { label: "Рецепты", value: "по палочкам данных" },
    ],
    source: `${MULTI}/MTEAssemblyLine.java`,
    def: {
      // В исходнике линия собирается из отрезков шириной в один блок: первый — с контроллером, остальные одинаковые.
      layers: [
        ["     ", "sssss", "     "],
        ["~GGGG", "lllll", "GGGGG"],
        ["ggggg", "mmmmm", "ggggg"],
        ["sssss", "sssss", "sssss"],
      ],
      kinds: { s: "solidSteel", G: "grateCasing", l: "assemblerCasing", g: "glass", m: "asslineCasing", "~": "asslineController" },
    },
  },
  {
    slug: "volcanus",
    name: "Volcanus",
    title: "Вулканус",
    tier: "iv",
    summary: "Доменная печь GT++: вдвое быстрее обычной и ведёт до восьми плавок сразу.",
    story: [
      "В IV слитков нужно столько, что обычная электрическая доменная печь не справляется. Вулканус — та же печь, но больше чем вдвое быстрее, с восемью плавками сразу и скидкой в десять процентов на энергию.",
      "Форма та же, что у доменной печи: три на три, четыре в высоту, два слоя катушек и пустая середина. Отличается корпус.",
      "Работает он только на пылающем пиротеуме — десять литров в секунду, так что сначала нужно наладить его выпуск. И ещё: прибавки нагрева от напряжения у Вулкануса нет, поэтому редкие рецепты всё равно требуют обычную печь.",
    ],
    facts: [
      { label: "Размер", value: "3 × 4 × 3" },
      { label: "Катушек", value: "16" },
      { label: "За один раз", value: "до 8 плавок" },
      { label: "Расходует", value: "10 л пиротеума в секунду" },
    ],
    source: `${SOURCES}/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/processing/advanced/MTEAdvEBF.java`,
    def: {
      layers: [
        ["CCC", "CCC", "CCC"],
        ["HHH", "H-H", "HHH"],
        ["HHH", "H-H", "HHH"],
        ["C~C", "CCC", "CCC"],
      ],
      kinds: { C: "volcanusCasing", H: "coil", "~": "volcanusController" },
      hollow: "-",
    },
  },
  {
    slug: "alloy-blast-smelter",
    name: "Alloy Blast Smelter",
    title: "Доменная плавильня сплавов",
    tier: "iv",
    summary: "Плавит сплавы сразу в жидком виде. Без неё не открыть половину построек яруса.",
    story: [
      "Некоторые сплавы яруса нельзя получить никак иначе: плавильня смешивает металлы и выдаёт готовый расплав. Из него делают корпуса Вулкануса, криогенного морозильника и других построек IV.",
      "Форма — как у доменной печи, только вместо катушек два слоя топок из стабаллоя.",
      "В отличие от доменной печи, она не берёт рецепты яруса выше, чем её энергетический люк. Для рецептов IV нужен люк IV, а для него — иридий.",
    ],
    facts: [
      { label: "Размер", value: "3 × 4 × 3" },
      { label: "Топок", value: "16" },
      { label: "Выдаёт", value: "жидкие сплавы" },
      { label: "Загрязнение", value: "есть, нужен глушитель" },
    ],
    source: `${SOURCES}/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/production/MTEAlloyBlastSmelter.java`,
    def: {
      layers: [
        ["CCC", "CmC", "CCC"],
        ["HHH", "H-H", "HHH"],
        ["HHH", "H-H", "HHH"],
        ["C~C", "CCC", "CCC"],
      ],
      kinds: { C: "absCasing", H: "absFirebox", m: "muffler", "~": "absController" },
      hollow: "-",
    },
  },
  {
    slug: "extreme-combustion-engine",
    name: "Extreme Combustion Engine",
    title: "Экстремальный дизельный двигатель",
    tier: "iv",
    summary: "Старший брат большого двигателя: жжёт высокооктановый бензин.",
    story: [
      "Тем, кто строит энергетику на нефти, в IV нужен этот двигатель и новое топливо — высокооктановый бензин. Литр такого бензина даёт 2 500 EU — в два с половиной раза больше дизеля с присадкой.",
      "Двигатель заметно больше прежнего. На тефлоновых трубах стоят блок управления из вольфрамовой стали и длинный корпус: сверху усиленные воздухозаборники, под ними корпуса турбины, внизу топки, а по оси — стальной редуктор. С торца — динамо-люк.",
      "Над воздухозаборниками должно быть пусто.",
    ],
    facts: [
      { label: "Размер", value: "10 × 5 × 5" },
      { label: "Работает на", value: "высокооктановом бензине" },
      { label: "Ещё нужны", value: "смазка и жидкий кислород" },
      { label: "Выдаёт ток", value: "через динамо-люк" },
    ],
    source: `${MULTI}/MTEExtremeCombustionEngine.java`,
    def: {
      layers: [
        ["          ", "    H    H", "    H    H", "    H    H", "          "],
        ["    H    H", "H H CGGGGC", "H H CGGGGC", "H H CGGGGC", "    H    H"],
        ["H H H    H", "CCC CDDDDC", "CCCAAAAAAI", "CCC CDDDDC", "H H H    H"],
        ["H H H    H", "C~C CBBBBC", "CCC CBBBBC", "CCC CBBBBC", "H H H    H"],
        ["FEFEFEEEEF", "FEFEFEEEEF", "FEFEFEEEEF", "FEFEFEEEEF", "FEFEFEEEEF"],
      ],
      kinds: {
        A: "steelGearbox",
        B: "wsteelFirebox",
        C: "wsteelCasing",
        D: "wsteelTurbine",
        E: "inertCasing",
        F: "ptfePipe",
        G: "extremeIntake",
        H: "ptfeFrame",
        I: "eceDynamo",
        "~": "eceController",
      },
    },
  },

  /* ------------------------------ LuV ----------------------------- */
  {
    slug: "mega-chemical-reactor",
    name: "Mega Chemical Reactor",
    title: "Мега химический реактор",
    tier: "luv",
    summary: "256 рецептов большого химического реактора сразу — с идеальным разгоном.",
    story: [
      "В игре по-русски — «Мега химический реактор». Он берёт рецепты большого химического реактора, но ведёт до 256 сразу и разгоняет их идеально: вчетверо больше энергии — вчетверо быстрее.",
      "Постройка — коробка 5 × 5 × 9 из химически стойких корпусов со стеклянными стенками; внутри по всей длине тянутся тефлоновые трубы, а в сердцевине — катушки синтеза. Из-за них реактор открывается только в LuV.",
    ],
    facts: [
      { label: "Размер", value: "5 × 5 × 9" },
      { label: "Параллели", value: "256" },
      { label: "Разгон", value: "идеальный" },
      { label: "Открывается", value: "в LuV" },
    ],
    source: `${MULTI}/MTEMegaChemicalReactor.java`,
    def: {
      layers: [
        ["AAAAA", "ABABA", "ABABA", "ABABA", "ABABA", "ABABA", "ABABA", "ABABA", "AAAAA"],
        ["ADDDA", " DDD ", " DDD ", " DDD ", " DDD ", " DDD ", " DDD ", " DDD ", "AAAAA"],
        ["AD~DA", " DCD ", " DCD ", " DCD ", " DCD ", " DCD ", " DCD ", " DCD ", "AAAAA"],
        ["ADDDA", " DDD ", " DDD ", " DDD ", " DDD ", " DDD ", " DDD ", " DDD ", "AAAAA"],
        ["AAAAA", "ABABA", "ABABA", "ABABA", "ABABA", "ABABA", "ABABA", "ABABA", "AAAAA"],
      ],
      kinds: { A: "inertCasing", B: "ptfePipe", C: "fusionCoil", D: "glass", "~": "mcrController" },
    },
  },
  {
    slug: "fusion-reactor-1",
    name: "Fusion Reactor Mk I",
    title: "Реактор синтеза I",
    tier: "luv",
    summary: "Цель всего яруса: первый реактор синтеза. Он даёт европий — без него не собрать детали ZPM.",
    story: [
      "Реактор синтеза сливает лёгкие атомы в тяжёлые. Это кольцо шириной в пятнадцать блоков: внутри идёт сплошной виток сверхпроводящих катушек, снаружи он закрыт машинными корпусами LuV. Контроллер стоит во внутренней стенке и смотрит в центр кольца.",
      "Главный рецепт первой модели — европий. Он нужен для всех деталей следующего яруса и делается медленно: на один мотор ZPM уходит почти шесть минут. Поэтому под европий ставят отдельный реактор и не выключают его.",
      "Перед каждым новым рецептом реактору нужен разгон — сотни миллионов EU, которые он набирает несколько минут. Менять рецепты и останавливать его невыгодно.",
      "Люки для жидкостей и тока здесь не показаны: их места в кольце строго заданы.",
    ],
    facts: [
      { label: "Размер", value: "15 × 3 × 15" },
      { label: "Работает на", value: "электричестве, люки от LuV" },
      { label: "На разгон", value: "до 160 000 000 EU" },
      { label: "Главный продукт", value: "европий" },
    ],
    source: `${MULTI}/MTEFusionComputer1.java`,
    def: {
      layers: FUSION_RING,
      kinds: { h: "luvCasing", c: "superCoil", "~": "fusion1Controller" },
    },
  },
  {
    slug: "large-plasma-turbine",
    name: "Large Plasma Turbine",
    title: "Большая плазменная турбина",
    tier: "luv",
    summary: "Превращает плазму из реактора синтеза прямо в ток.",
    story: [
      "С реактором синтеза появляется новый способ получать энергию — плазма. Турбина пропускает её через ротор и выдаёт ток, а остывшая плазма выходит обычным газом или жидкостью, которые ещё пригодятся.",
      "Устроена турбина так же, как паровая и газовая, только собрана из вольфрамовой стали: спереди стенка с ротором, за ней вал в рамах, потом корпус, в хвосте — динамо-люк.",
      "Перед ротором должно быть пусто.",
    ],
    facts: [
      { label: "Размер", value: "3 × 3 × 6" },
      { label: "Работает на", value: "плазме" },
      { label: "КПД", value: "задаёт ротор" },
      { label: "Выдаёт ток", value: "через динамо-люк" },
    ],
    source: `${MULTI}/turbines/MTELargeTurbinePlasma.java`,
    def: {
      // Та же схема, что у паровой турбины (MTELargeTurbineBase), — отличаются только блоки.
      layers: [
        ["abc", " B ", " B ", "ApA", "ApA", "B B"],
        ["def", "BAB", "BAB", "pAp", "pAp", "BDB"],
        ["ghi", " B ", " B ", "ApA", "ApA", "B B"],
      ],
      kinds: {
        a: "plasmaTurbine1",
        b: "plasmaTurbine2",
        c: "plasmaTurbine3",
        d: "plasmaTurbine4",
        e: "plasmaTurbine5",
        f: "plasmaTurbine6",
        g: "plasmaTurbine7",
        h: "plasmaTurbine8",
        i: "plasmaTurbine9",
        A: "wsteelPipe",
        B: "wsteelFrame",
        p: "wsteelTurbine",
        D: "plasmaDynamo",
      },
    },
  },
  {
    slug: "neutron-activator",
    name: "Neutron Activator",
    title: "Активатор нейтронов",
    tier: "luv",
    summary: "Облучает вещества нейтронами. Без него не наладить переработку наквады.",
    story: [
      "Для люка энергии LuV нужна наквада, а получать её по-старому слишком медленно. Настоящая линия переработки наквады строится вокруг этой постройки.",
      "Это башня: внизу и вверху — плиты пять на пять из нержавейки с корпусами процессора внутри, между ними — стеклянная труба с ускоряющей трубой по оси и стальными рамами по углам.",
      "У активатора необычное правило: скорость рецептов зависит не от напряжения, а от высоты башни. Здесь показана башня в шесть блоков; строить можно намного выше.",
    ],
    facts: [
      { label: "Размер", value: "5 × 5, высота от 4" },
      { label: "Здесь показан", value: "5 × 6 × 5" },
      { label: "Скорость", value: "зависит от высоты" },
      { label: "Нужен для", value: "линии наквады" },
    ],
    source: `${SOURCES}/goodgenerator/blocks/tileEntity/MTENeutronActivator.java`,
    def: {
      layers: [
        ["CCCCC", "CDDDC", "CDDDC", "CDDDC", "CCCCC"],
        ["F   F", " GGG ", " GPG ", " GGG ", "F   F"],
        ["F   F", " GGG ", " GPG ", " GGG ", "F   F"],
        ["F   F", " GGG ", " GPG ", " GGG ", "F   F"],
        ["F   F", " GGG ", " GPG ", " GGG ", "F   F"],
        ["CC~CC", "CDDDC", "CDDDC", "CDDDC", "CCCCC"],
      ],
      kinds: { C: "stainlessCasing", D: "processorCasing", F: "steelFrame", G: "glass", P: "speedingPipe", "~": "naController" },
    },
  },
  {
    slug: "circuit-assembly-line",
    name: "Circuit Assembly Line",
    title: "Линия сборки схем",
    tier: "luv",
    summary: "Собирает схемы пачками. После реактора синтеза без неё не сделать новые схемы.",
    story: [
      "Младшая сестра сборочной линии, которая делает только схемы — зато быстро и часто дешевле, чем одноблочный сборщик.",
      "До реактора синтеза она только ускоряет работу. После — становится обязательной: кристаллические схемы и все следующие собирают только на ней.",
      "Линия растёт в длину от двух до семи отрезков; здесь показана самая длинная. Снизу — сталь с входными шинами, посередине — корпус линии за стеклом, сверху — решётчатые корпуса.",
    ],
    facts: [
      { label: "Размер", value: "от 2 до 7 в длину, 3 × 3 в сечении" },
      { label: "Здесь показана", value: "7 × 3 × 3" },
      { label: "Работает на", value: "электричестве" },
      { label: "Делает", value: "только схемы" },
    ],
    source: `${SOURCES}/bartworks/common/tileentities/multis/MTECircuitAssemblyLine.java`,
    def: {
      // В исходнике линия собирается из отрезков шириной в один блок: первый — с контроллером.
      layers: [
        ["~GGGGGG", "GGGGGGG", "GGGGGGG"],
        ["ggggggg", "mmmmmmm", "ggggggg"],
        ["sssssss", "sssssss", "sssssss"],
      ],
      kinds: { s: "solidSteel", G: "grateCasing", g: "glass", m: "asslineCasing", "~": "asslineController" },
    },
  },

  /* ------------------------------ ZPM ----------------------------- */
  {
    slug: "exothermic-hearth",
    name: "Exothermic Hearth",
    title: "Экзотермический горн",
    tier: "zpm",
    summary: "Мега-печь GTNH 2.9: рецепты доменной печи по 256 сразу, а разогревшись — по 512.",
    story: [
      "В игре по-русски — «Экзотермический горн». В GTNH 2.9 он заменил прежнюю мега-доменную печь: та осталась в моде только для старых миров. В книге заданий он открывается в главе о массовом производстве, вместе с остальными мега-машинами ZPM.",
      "Горн ведёт рецепты электрической доменной печи по 256 сразу. Пока он работает без остановки, он разогревается и через 30 минут удваивает число параллелей. Пиротеум ускоряет разогрев вшестеро.",
      "Это башня 23 × 43 × 23 и больше шести тысяч блоков: катушки, сияющий наквадовый сплав, рамы из призматической наквады и стеклянные стены. Ярус стекла решает, какие энергетические люки можно поставить.",
    ],
    facts: [
      { label: "Размер", value: "23 × 43 × 23" },
      { label: "Блоков", value: "6 022" },
      { label: "Параллели", value: "256, разогретый — 512" },
      { label: "Разогрев", value: "30 минут" },
    ],
    source: `${MULTI}/MTEExothermicHearth.java`,
    def: {
      layers: HEARTH_LAYERS,
      kinds: {
        A: "glass",
        B: "heatproof",
        C: "blackPlutoniumPipe",
        D: "wsteelPipe",
        E: "naquadahCoil",
        F: "radiantNaq",
        G: "prismaticFrame",
        H: "thermalContainment",
        I: "hearthCasing",
        J: "absFirebox",
        K: "hearthMuffler",
        "~": "hearthController",
      },
    },
  },
  {
    slug: "mega-oil-cracker",
    name: "Mega Oil Cracker",
    title: "Мега установка крекинга нефти",
    tier: "luv",
    summary: "256 рецептов крекинга сразу: для наквадового топлива и радокса нефти нужно очень много.",
    story: [
      "В игре по-русски — «Мега установка крекинга нефти». Она ведёт рецепты обычной установки крекинга по 256 сразу. Книга заданий советует её тем, кто гонит наквадовое топливо или радокс.",
      "Как и у обычной установки, водород или пар идут в средний люк, сырьё — в боковой, а продукт выходит с другой стороны. Чем лучше катушки, тем меньше энергии на рецепт.",
    ],
    facts: [
      { label: "Размер", value: "13 × 8 × 9" },
      { label: "Блоков", value: "509" },
      { label: "Параллели", value: "256" },
      { label: "Работает как", value: "установка крекинга" },
    ],
    source: `${MULTI}/MTEMegaOilCracker.java`,
    def: {
      layers: MEGA_CRACKER_LAYERS,
      kinds: {
        A: "glass",
        B: "naqDistill",
        C: "steelPipe",
        D: "stainlessCasing",
        E: "naquadahCoil",
        F: "naqSheet",
        L: "naqDistill",
        M: "naqDistill",
        R: "naqDistill",
        "~": "mocController",
      },
    },
  },
  {
    slug: "mega-distillation-tower",
    name: "Mega Distillation Tower",
    title: "Мега ректификационная колонна",
    tier: "zpm",
    summary: "Ректификационная колонна на 256 рецептов сразу. Высоту набирают секциями — до пяти.",
    story: [
      "В игре по-русски — «Мега ректификационная колонна». Она ведёт рецепты ректификационной колонны по 256 сразу; каждая жидкость выходит на своём слое, как у обычной колонны.",
      "Колонну собирают из основы, от одной до пяти средних секций и верха. Чем выше колонна, тем больше разных жидкостей она выдаёт. Здесь показана самая низкая — с одной секцией: 15 × 30 × 9.",
      "Отвёрткой её переключают в режим дистиллятора: тогда она выдаёт одну жидкость, зато ведёт от 512 до 1 024 рецептов сразу.",
    ],
    facts: [
      { label: "Размер", value: "15 × 30 × 9 (одна секция)" },
      { label: "Секций", value: "от 1 до 5" },
      { label: "Параллели", value: "256, дистиллятор — до 1 024" },
      { label: "Работает как", value: "ректификационная колонна" },
    ],
    source: `${MULTI}/MTEMegaDistillationTower.java`,
    def: {
      layers: MEGA_DISTILLATION_LAYERS,
      kinds: {
        A: "naqDistill",
        B: "solidSteel",
        C: "bronzePipe",
        D: "steelPipe",
        E: "stainlessCasing",
        F: "stainlessFrame",
        G: "naqSheet",
        H: "strongBronze",
        "~": "mdtController",
      },
    },
  },
  {
    slug: "fusion-reactor-2",
    name: "Fusion Reactor Mk II",
    title: "Реактор синтеза II",
    tier: "zpm",
    summary: "Главная цель яруса: сливает атомы в новые элементы. Без его америция не начать следующий ярус.",
    story: [
      "Реактор синтеза — кольцо шириной в пятнадцать блоков. Внутри кольца идёт сплошной виток катушек, снаружи он со всех сторон закрыт корпусами. Контроллер стоит во внутренней стенке и смотрит в центр кольца.",
      "Вторая модель нужна ради америция: его требуют детали следующего яруса, и требуют много. Один слиток реактор делает 43 секунды, поэтому его запускают заранее и не выключают.",
      "Рецепты первой модели вторая ведёт вдвое быстрее — и берёт за это вдвое больше энергии. Перед каждым запуском реактору нужен большой запас тока на разгон.",
      "Люки для жидкостей и тока здесь не показаны: их места в кольце строго заданы.",
    ],
    facts: [
      { label: "Размер", value: "15 × 3 × 15" },
      { label: "Работает на", value: "электричестве, люки от ZPM" },
      { label: "На разгон", value: "до 320 000 000 EU" },
      { label: "Главный продукт", value: "америций" },
    ],
    source: `${MULTI}/MTEFusionComputer.java`,
    def: {
      layers: FUSION_RING,
      kinds: { h: "fusionCasing", c: "fusionCoil", "~": "fusionController" },
    },
  },
  {
    slug: "large-naquadah-reactor",
    name: "Large Naquadah Reactor",
    title: "Большой наквадовый реактор",
    tier: "zpm",
    summary: "Самый мощный источник тока яруса: до 42,9 миллиона EU/t на наквадовом топливе.",
    story: [
      "В ZPM прежние генераторы перестают справляться. Наквадовое топливо — ответ на это: один такой реактор даёт до 42,9 миллиона EU/t на топливе первой ступени и до 101,2 миллиона на топливе второй.",
      "Топливо первой ступени делает реактор синтеза II, вторую получают из первой в большом химическом реакторе.",
      "Кроме топлива реактору нужны жидкий воздух, охладитель и возбуждающая жидкость — всё это придётся производить в больших количествах.",
      "Постройка тёмно-синяя и похожа на шар в клетке: в середине — ядро из корпусов удержания поля, вокруг — рёбра из корпусов реактора и рамы с защитой от излучения. Контроллер стоит внизу спереди.",
    ],
    facts: [
      { label: "Размер", value: "7 × 11 × 7" },
      { label: "Выдаёт", value: "до 42,9 млн EU/t" },
      { label: "Работает на", value: "наквадовом топливе" },
      { label: "Ещё нужны", value: "жидкий воздух, охладитель" },
    ],
    source: `${MULTI}/MTELargeNaquadahReactor.java`,
    def: {
      layers: [
        ["  AAA  ", " AAAAA ", "AAAAAAA", "AAAAAAA", "AAAAAAA", " AAAAA ", "  AAA  "],
        ["   A   ", "  ACA  ", " ACACA ", "ACAAACA", " ACACA ", "  ACA  ", "   A   "],
        ["   C   ", "       ", "   A   ", "C A A C", "   A   ", "       ", "   C   "],
        ["   C   ", "   A   ", "  BBB  ", "CABBBAC", "  BBB  ", "   A   ", "   C   "],
        ["   A   ", "  BBB  ", " BBBBB ", "ABBBBBA", " BBBBB ", "  BBB  ", "   A   "],
        ["  AAA  ", " ABBBA ", "ABBBBBA", "ABBBBBA", "ABBBBBA", " ABBBA ", "  AAA  "],
        ["   A   ", "  BBB  ", " BBBBB ", "ABBBBBA", " BBBBB ", "  BBB  ", "   A   "],
        ["   C   ", "   A   ", "  BBB  ", "CABBBAC", "  BBB  ", "   A   ", "   C   "],
        ["   C   ", "       ", "   A   ", "C A A C", "   A   ", "       ", "   C   "],
        ["   A   ", "  ACA  ", " ACACA ", "ACA ACA", " ACACA ", "  ACA  ", "   A   "],
        ["  A~A  ", " AAAAA ", "AAAAAAA", "AAAAAAA", "AAAAAAA", " AAAAA ", "  AAA  "],
      ],
      kinds: { A: "naqCasing", B: "fieldCasing", C: "radFrame", "~": "lnrController" },
    },
  },

  /* ------------------------------ UV ------------------------------ */
  {
    slug: "fusion-reactor-3",
    name: "Fusion Reactor Mk III",
    title: "Реактор синтеза III",
    tier: "uv",
    summary: "Третий реактор синтеза: америций в тринадцать раз быстрее, оганесон и конец цепочки плазм.",
    story: [
      "Кольцо то же, что у первых двух моделей, — пятнадцать блоков в ширину, — но собрано из корпусов третьей модели. Контроллер стоит во внутренней стенке и смотрит в центр кольца.",
      "Главное, что он даёт, — быстрый америций: из плутония-241 и водорода слиток выходит за 3,2 секунды вместо 43,2 у второй модели.",
      "Ещё он делает оганесон — лучший благородный газ для доменной печи и добытчика из пустоты — и висмутовую плазму для схем следующего яруса.",
      "Люки для жидкостей и тока здесь не показаны: их места в кольце строго заданы.",
    ],
    facts: [
      { label: "Размер", value: "15 × 3 × 15" },
      { label: "Работает на", value: "электричестве, люки от UV" },
      { label: "На разгон", value: "до 640 000 000 EU" },
      { label: "Главный продукт", value: "америций, оганесон" },
    ],
    source: `${MULTI}/MTEFusionComputer3.java`,
    def: {
      layers: FUSION_RING,
      kinds: { h: "fusion3Casing", c: "fusionCoil", "~": "fusion3Controller" },
    },
  },
  {
    slug: "bacterial-vat",
    name: "Bacterial Vat",
    title: "Бактериальный чан",
    tier: "hv",
    summary: "Растит бактерии в питательной жидкости. Без него не сделать органические схемы.",
    story: [
      "Чан открывается ещё в HV — так его ярус указан в вики. Главная его работа приходит позже, в UV: органические схемы растят, а не собирают, и питательную среду для них готовят бактерии в этом чане.",
      "Это стеклянный бак пять на пять: снизу и сверху — плиты из нержавейки, между ними два слоя стекла, внутри — жидкость. Культуру бактерий выводят в одноблочной биолаборатории и кладут прямо в контроллер.",
      "У чана необычное правило: выходной люк надо держать заполненным наполовину. Тогда чан работает быстрее всего и тратит меньше всего предметов.",
    ],
    facts: [
      { label: "Размер", value: "5 × 4 × 5" },
      { label: "Внутри", value: "питательная жидкость" },
      { label: "Нужна", value: "культура бактерий в контроллере" },
      { label: "Лучше всего", value: "выходной люк заполнен наполовину" },
    ],
    source: `${SOURCES}/bartworks/common/tileentities/multis/MTEBioVat.java`,
    def: {
      layers: [
        ["ccccc", "ccccc", "ccccc", "ccccc", "ccccc"],
        ["ggggg", "gaaag", "gaaag", "gaaag", "ggggg"],
        ["ggggg", "gaaag", "gaaag", "gaaag", "ggggg"],
        ["cc~cc", "ccccc", "ccccc", "ccccc", "ccccc"],
      ],
      // Контроллер в моде — тот же значок, что у ректификационной колонны, на том же корпусе.
      kinds: { c: "stainlessCasing", g: "glass", "~": "dtController" },
      hollow: "a",
      interior: "water",
    },
  },
  {
    slug: "mega-alloy-blast-smelter",
    name: "Mega Alloy Blast Smelter",
    title: "Мега-плавильня сплавов",
    tier: "uv",
    summary: "Гигантская доменная плавильня сплавов: ведёт сразу сотни плавок.",
    story: [
      "Старшая версия доменной плавильни сплавов из IV. Вики называет её среди построек UV, которые сильно улучшают производство.",
      "Это башня двадцать блоков в высоту: внизу — топка, над ней — восьмигранный ствол из стекла с двумя кольцами катушек внутри. Контроллер стоит в основании спереди, глушитель — в крышке.",
      "Постройка огромная — почти тысяча блоков. Поэтому на карточке в каталоге она только картинкой, а вертеть её можно здесь.",
    ],
    facts: [
      { label: "Размер", value: "11 × 20 × 11" },
      { label: "Блоков", value: "982" },
      { label: "Работает на", value: "электричестве, от UV" },
      { label: "Выдаёт", value: "жидкие сплавы" },
    ],
    source: `${SOURCES}/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/production/mega/MTEMegaAlloyBlastSmelter.java`,
    def: {
      layers: MEGA_ABS_LAYERS,
      // Глушитель (F) и люки ставятся на корпус; здесь на их местах корпус.
      kinds: { A: "glass", B: "coil", C: "absFirebox", D: "absCasing", E: "absCasing", F: "absCasing", Z: "absCasing", "~": "megaAbsController" },
    },
  },

  /* ------------------------------ UHV ----------------------------- */
  {
    slug: "electric-implosion-compressor",
    name: "Electric Implosion Compressor",
    title: "Электрический имплозионный компрессор",
    tier: "uhv",
    summary: "Сжимает током вместо взрывчатки — быстрее и без расхода динамита.",
    story: [
      "Делает то же, что имплозионный компрессор из HV, но вместо взрывчатки тратит немного энергии, и рецепты у него быстрее. Вики советует построить его до ракеты восьмого уровня.",
      "Постройка широкая: в середине — сжимающая камера, где навстречу друг другу ходят поршни из нейтрониума; вокруг — кольца из укреплённых наквадой блоков, стекла и тефлоновых труб, по бокам — две башни из рам.",
      "Поршни можно сделать из материалов лучше нейтрониума — тогда компрессор ведёт больше рецептов сразу. Здесь показаны первые, нейтрониевые.",
    ],
    facts: [
      { label: "Размер", value: "15 × 6 × 7" },
      { label: "Работает на", value: "электричестве, без взрывчатки" },
      { label: "Поршни", value: "нейтрониум и лучше" },
      { label: "Загрязнение", value: "нет" },
    ],
    source: `${MULTI}/MTEElectricImplosionCompressor.java`,
    def: {
      // В исходнике схема записана срезами от фасада назад; здесь она переложена в слои сверху вниз.
      layers: EIC_LAYERS,
      kinds: { A: "glass", B: "wsteelCasing", C: "ptfePipe", D: "naqFrame", E: "neutroniumBlock", F: "naqReinforced", "~": "eicController" },
    },
  },
  {
    slug: "neutronium-compressor",
    name: "Neutronium Compressor",
    title: "Нейтронный компрессор",
    tier: "uv",
    summary: "Сжимает вещество до сингулярностей. Через него идёт разумный рецепт катализатора бесконечности.",
    story: [
      "Компрессор открывается в UV (так его ярус указан в вики), а нужен больше всего в UHV, когда появляются слитки бесконечности. Катализатор для них можно сделать двумя способами, и вики называет разумным тот, что идёт через этот компрессор.",
      "Постройка — шар одиннадцать блоков в поперечнике. Внутри камера из нейтрониевых корпусов со стеклянной стенкой, вокруг — каркас из рам наквадового сплава.",
      "Ещё он сжимает огромные партии материалов в сингулярности — это тоже бывает нужно для катализатора.",
    ],
    facts: [
      { label: "Размер", value: "11 × 11 × 11" },
      { label: "Работает на", value: "электричестве, от UHV" },
      { label: "Делает", value: "сингулярности, катализатор бесконечности" },
      { label: "Загрязнение", value: "нет" },
    ],
    source: `${MULTI}/compressor/MTENeutroniumCompressor.java`,
    def: {
      layers: [
        ["  CEEEEEC  ", " CE     EC ", "CE       EC", "E         E", "E         E", "E         E", "E         E", "E         E", "CE       EC", " CE     EC ", "  CEEEEEC  "],
        [" CE     EC ", "C  BBBBB  C", "E BBBBBBB E", " BBCCCCCBB ", " BBCBBBCBB ", " BBCCCCCBB ", " BBCBBBCBB ", " BBCCCCCBB ", "E BBBBBBB E", "C  BBBBB  C", " CE     EC "],
        ["CE       EC", "E BBBBBBB E", " B       B ", " D       D ", " B       B ", " B       B ", " D       D ", " B       B ", " B       B ", "E BDDDBDB E", "CE       EC"],
        ["E         E", " BBAAAAABB ", " B       B ", " D       D ", " B       B ", " D       D ", " D       D ", " B       B ", " B       B ", " BBDBBBDBB ", "E         E"],
        ["E         E", " BBAAAAABB ", " B       B ", " D       D ", " B       B ", " B       B ", " D       D ", " D       D ", " D       D ", " BDDBDDDDB ", "E         E"],
        ["E         E", " BBAAAAABB ", " D       D ", " D       D ", " D       D ", " B       B ", " B       B ", " B       B ", " B       B ", " BBDBBBBDB ", "E         E"],
        ["E         E", " BBAAAAABB ", " B       B ", " B       B ", " D       D ", " B       B ", " B       B ", " D       D ", " B       B ", " BBDBBDBBB ", "E         E"],
        ["E         E", " BBAAAAABB ", " B       B ", " D       D ", " D       D ", " B       B ", " D       D ", " D       D ", " D       D ", " BBBBBDDDB ", "E         E"],
        ["CE       EC", "E BBBBBBB E", " B       B ", " D       D ", " B       B ", " B       B ", " D       D ", " B       B ", " B       B ", "E BDDBBBB E", "CE       EC"],
        [" CE     EC ", "C  BB~BB  C", "E BBBBBBB E", " BBBBBBBBB ", " BBBBBBBBB ", " BBBBBBBBB ", " BBBBBBBBB ", " BBBBBBBBB ", "E BBBBBBB E", "C  BBBBB  C", " CE     EC "],
        ["  CEEEEEC  ", " CE     EC ", "CE       EC", "E         E", "E         E", "E         E", "E         E", "E         E", "CE       EC", " CE     EC ", "  CEEEEEC  "],
      ],
      kinds: { A: "glass", B: "neutroniumCasing", C: "neutroniumStable", D: "neutroniumActive", E: "naqAlloyFrame", "~": "ncController" },
    },
  },

  /* ------------------------------ UEV ----------------------------- */
  {
    slug: "fusion-reactor-4",
    name: "Fusion Reactor Mk IV",
    title: "Реактор синтеза IV",
    tier: "uev",
    summary: "Четвёртый реактор синтеза (GT++). В UEV без него не обойтись: он даёт первый гипоген для кузницы.",
    story: [
      "То же кольцо пятнадцать блоков в ширину, что у первых трёх моделей, но собранное из корпусов GT++: снаружи корпуса реактора, внутри виток катушек второго поколения. Контроллер смотрит в центр кольца.",
      "В UHV он был по желанию, в UEV — обязателен. Гипоген быстрее и дешевле делать в плазменной кузнице, но её рецепт — петля: на первый запуск нужен слиток жидкого гипогена, а его даёт только этот реактор.",
      "Люки для жидкостей и тока здесь не показаны: их места в кольце строго заданы.",
    ],
    facts: [
      { label: "Размер", value: "15 × 3 × 15" },
      { label: "Работает на", value: "электричестве, люки от UHV" },
      { label: "На разгон", value: "до 5 120 000 000 EU" },
      { label: "Главный продукт", value: "гипоген" },
    ],
    source: `${SOURCES}/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/processing/advanced/MTEAdvFusionMk4.java`,
    def: {
      layers: FUSION_RING,
      kinds: { h: "fusion4Casing", c: "fusion4Coil", "~": "fusion4Controller" },
    },
  },
  {
    slug: "quantum-force-transformer",
    name: "Quantum Force Transformer",
    title: "Квантовый силовой преобразователь",
    tier: "uev",
    summary: "Делает целые линии переработки за один шаг: платину, пластики, кевлар — прямо из простых веществ.",
    story: [
      "В игре по-русски — «Квантовый силовой преобразователь», в книге заданий — QFT. Он открывается в UEV, после оптических мейнфреймов, и требует вечную сингулярность.",
      "Каждый его рецепт заменяет целую линию переработки или её большую часть: на вход идут простые вещества — углерод, водород, кислород, — а на выходе сразу три продукта и больше. Каждому рецепту нужен свой катализатор; он не тратится.",
      "Постройка — башня 15 × 21 × 15. Два вида корпусов улучшаются: нейтронные манипуляторы открывают более сложные линии, а защитные ядра позволяют сосредоточить выход на нужном продукте. Здесь оба стоят на первом уровне.",
    ],
    facts: [
      { label: "Размер", value: "15 × 21 × 15" },
      { label: "Блоков", value: "933" },
      { label: "Открывается", value: "в UEV" },
      { label: "Нужен для", value: "линий в один шаг" },
    ],
    source: `${SOURCES}/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/production/MTEQuantumForceTransformer.java`,
    def: {
      layers: QFT_LAYERS,
      kinds: {
        A: "qftManipulator",
        B: "qftShielding",
        C: "qftCoil",
        D: "qftCasing",
        E: "qftGlass",
        H: "qftCasing",
        T: "qftCasing",
        "~": "qftController",
      },
    },
  },
  {
    slug: "plasma-forge",
    name: "Dimensionally Transcendent Plasma Forge",
    title: "Плазменная кузница",
    tier: "uev",
    summary: "Цель всего яруса и сердце остальной игры: плавит то, что не может больше ничто.",
    story: [
      "В игре по-русски — «Пространственно-трансцендентная плазменная кузница». Это конец яруса UEV и центр всей игры дальше: из неё выходят трансцендентный металл для UIV, гипоген, бесконечность и многое другое — быстрее и дешевле, чем любым другим путём.",
      "Постройка огромная: 33 × 24 × 33 и больше пяти тысяч блоков. Внутри — 2 112 катушек; от них, как у доменной печи, зависит, какие рецепты ей по силам. Нужны катушки не хуже пробуждённого дракония. Контроллер спрятан в самой середине, на третьем слое снизу.",
      "Почти каждый рецепт ест топливо — катализатор из плазм реактора синтеза. Если кузница работает без остановки, она тратит его всё меньше: до половины после восьми часов.",
    ],
    facts: [
      { label: "Размер", value: "33 × 24 × 33" },
      { label: "Блоков", value: "5 627" },
      { label: "Катушек", value: "2 112, от пробуждённого дракония" },
      { label: "Расходует", value: "катализатор из плазм" },
    ],
    source: `${MULTI}/MTEPlasmaForge.java`,
    def: {
      layers: PLASMA_FORGE_LAYERS,
      kinds: { N: "dimTrans", b: "dimInjector", C: "awakenedCoil", s: "dimBridge", "~": "dtpfController" },
    },
  },
  {
    slug: "nanochip-assembly-complex",
    name: "Nanochip Assembly Complex",
    title: "Комплекс сборки наночипов",
    tier: "uev",
    summary: "Огромный цех, который сам собирает схемы всех линий: детали ходят между модулями по вакуумным конвейерам.",
    story: [
      "В игре по-русски — «Комплекс сборки наночипов» (в книге заданий — NAC). Посередине — пункт управления, вокруг — двенадцать мест под модули. Вся работа идёт в модулях, а детали схем передаются между ними по вакуумным конвейерам без ограничений по объёму.",
      "Модулей одиннадцать видов, и каждый — своя постройка со своим контроллером. Здесь показан сам комплекс без модулей: 63 × 49 × 63 и больше восьми тысяч блоков (в моде под ним оставлено место ещё на 31 слой — для модулей). Контроллер спрятан в середине пункта управления.",
      "Если долго собирать схемы одной линии, комплекс подстраивается под неё и даёт прибавку. Ток модулям он раздаёт сам — так же, как космический лифт.",
    ],
    facts: [
      { label: "Размер", value: "63 × 49 × 63" },
      { label: "Блоков", value: "8 715" },
      { label: "Мест под модули", value: "12" },
      { label: "Обслуживание", value: "не нужно" },
    ],
    source: `${MULTI}/nanochip/MTENanochipAssemblyComplex.java`,
    def: {
      layers: NANOCHIP_COMPLEX_LAYERS,
      kinds: {
        A: "nanoFirewall",
        B: "nanoMesh",
        C: "nanoReinforcement",
        D: "naqFrame",
        E: "nanoGlass",
        F: "nanoMesh",
        H: "nanoMesh",
        I: "nanoMesh",
        J: "nanoMatrix",
        "~": "nanoController",
      },
    },
  },

  /* ------------------------------ UIV ----------------------------- */
  {
    slug: "transcendent-plasma-mixer",
    name: "Transcendent Plasma Mixer",
    title: "Трансцендентный плазменный смеситель",
    tier: "uiv",
    summary: "Мешает катализатор для плазменной кузницы за один шаг и сколько угодно сразу.",
    story: [
      "Кузница ест катализатор, а в UEV его можно мешать только очень медленно. Смеситель делает каждый вид катализатора за один шаг, по пять секунд на рецепт, и ведёт столько рецептов сразу, сколько задашь в его окне.",
      "Обычного энергетического люка у него нет: ток он берёт из беспроводной сети в начале каждого рецепта. Поэтому хранилище энергии к этому времени нужно перенести в беспроводную сеть.",
      "Постройка небольшая: рама из мостов и трансцендентных корпусов с пустой серединой.",
    ],
    facts: [
      { label: "Размер", value: "5 × 7 × 5" },
      { label: "Работает на", value: "беспроводной энергии" },
      { label: "Рецепт", value: "5 секунд, сколько угодно сразу" },
      { label: "Делает", value: "катализатор, креон" },
    ],
    source: `${MULTI}/MTETranscendentPlasmaMixer.java`,
    def: {
      layers: TPM_LAYERS,
      kinds: { A: "dimTrans", B: "dimInjector", C: "dimBridge", "~": "tpmController" },
    },
  },
  {
    slug: "fusion-reactor-5",
    name: "Fusion Reactor Mk V",
    title: "Реактор синтеза V",
    tier: "uiv",
    summary: "Пятый и последний реактор синтеза. Нужен для плазм Кузницы богов.",
    story: [
      "Последний реактор синтеза — тот же круг в пятнадцать блоков из корпусов GT++ пятого поколения. Контроллер смотрит в центр кольца.",
      "В UEV он по желанию, в UIV важнее: только он даёт плазмы тория, свинца и плутония-241 — без них не построить Кузницу богов.",
      "Люки для жидкостей и тока здесь не показаны: их места в кольце строго заданы.",
    ],
    facts: [
      { label: "Размер", value: "15 × 3 × 15" },
      { label: "Работает на", value: "электричестве, люки от UEV" },
      { label: "На разгон", value: "до 20 480 000 000 EU" },
      { label: "Нужен для", value: "Кузницы богов" },
    ],
    source: `${SOURCES}/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/processing/advanced/MTEAdvFusionMk5.java`,
    def: {
      layers: FUSION_RING,
      kinds: { h: "fusion5Casing", c: "fusion5Coil", "~": "fusion5Controller" },
    },
  },
  {
    slug: "black-hole-compressor",
    name: "Pseudostable Black Hole Containment Field",
    title: "Компрессор чёрной дыры",
    tier: "uiv",
    summary: "Сжимает внутри чёрной дыры: быстрее и дешевле нейтронного компрессора, и только он делает вечную сингулярность для вечных катушек.",
    story: [
      "В игре по-русски — «Сдерживающее поле псевдостабильной чёрной дыры», в обиходе — компрессор чёрной дыры. Он ведёт рецепты и нейтронного компрессора, и горячего изостатического пресса — в пять раз быстрее, тратя 70 % энергии.",
      "Только он делает вечную сингулярность за 72 литра пространства-времени — она нужна для вечных катушек плазменной кузницы. На каждый рецепт с чёрной дырой в него кладут семя чёрной дыры, а потом — коллапсер, иначе рецепт пропадёт.",
      "Постройка — диск 35 × 35 из корпусов сверхплотного искривления с кольцом стекла и рамами, почти пять тысяч блоков.",
    ],
    facts: [
      { label: "Размер", value: "35 × 33 × 35" },
      { label: "Блоков", value: "4 868" },
      { label: "Скорость", value: "500 %, 70 % энергии" },
      { label: "Нужен для", value: "вечной сингулярности" },
    ],
    source: `${MULTI}/compressor/MTEBlackHoleCompressor.java`,
    def: {
      layers: BLACK_HOLE_LAYERS,
      kinds: { A: "hawkingGlass", B: "radiationAbsorbent", C: "extremeDensity", D: "naqAlloyFrame", E: "extremeDensity", "~": "bhcController" },
    },
  },
  {
    slug: "helioflare-power-forge",
    name: "Helioflare Power Forge",
    title: "Модуль Кузницы богов",
    tier: "uiv",
    summary: "Первый модуль Кузницы богов: доменная печь с тысячами плавок сразу.",
    story: [
      "Кузница богов сама ничего не плавит — работают модули вокруг её ствола. В игре по-русски этот модуль зовётся «Гелиовспывшковая кузня» (так в переводе мода), в книге заданий — «An Even More Mega EBF».",
      "Это доменная печь с тысячами параллелей и миллиардами EU/t на каждую: медленные рецепты вроде трансцендентного металла перестают быть узким местом. Только он делает насыщенный раствор фононных кристаллов — без него не работают остальные модули.",
      "Сам модуль небольшой: кольцо обшивки с контроллером и длинный стержень из катушек гипогена. Ток он берёт из беспроводной сети, как и вся Кузница. Здесь он показан отдельно — без самой Кузницы, которая слишком велика для страницы.",
    ],
    facts: [
      { label: "Размер", value: "7 × 7 × 13" },
      { label: "Работает на", value: "беспроводной энергии" },
      { label: "Параллели", value: "тысячи" },
      { label: "Стоит у", value: "Кузницы богов" },
    ],
    source: `${SOURCES}/tectech/thing/metaTileEntity/multi/godforge/MTEBaseModule.java`,
    def: {
      layers: GODFORGE_MODULE_LAYERS,
      kinds: {
        A: "hypogenCoil",
        B: "godforgeTrim",
        C: "godforgeTrim",
        D: "godforgeInner",
        E: "godforgeSupport",
        F: "godforgeOuter",
        G: "godforgeEnergy",
        "~": "godforgeModuleController",
      },
    },
  },
  {
    slug: "forge-of-the-gods",
    name: "Forge of the Gods",
    title: "Кузница богов",
    tier: "uiv",
    summary: "Самая большая постройка игры: три кольца и стержень почти в двести блоков. Сама не плавит — работают модули вокруг неё.",
    story: [
      "В игре по-русски — «Кузница Богов». Здесь показана полностью, со всеми тремя кольцами: 127 × 29 × 187 и почти двадцать тысяч блоков. Сначала камера стоит далеко, чтобы постройка влезла целиком; ближе можно подъехать колёсиком с Ctrl или Cmd.",
      "Сама Кузница ничего не обрабатывает: рецепты ведут модули, которые ставят вокруг узких колец перед большими. Первое кольцо даёт до 8 мест под модули, второе — ещё до 12, третье — ещё до 16.",
      "Энергетического люка нет — Кузница берёт ток прямо из беспроводной сети владельца. Чтобы достроить следующее кольцо, анимацию выключают отвёрткой: постройка разбирается, и уже стоящие кольца становятся видны.",
      "У Кузницы своё дерево улучшений: за вехи её работы дают осколки гравитонов. Чтобы попасть в UXV, нужно дойти до последнего улучшения — END.",
    ],
    facts: [
      { label: "Размер", value: "127 × 29 × 187" },
      { label: "Блоков", value: "19 851" },
      { label: "Мест под модули", value: "до 36 на трёх кольцах" },
      { label: "Работает на", value: "беспроводной энергии" },
    ],
    source: `${SOURCES}/tectech/thing/metaTileEntity/multi/godforge/MTEForgeOfGods.java`,
    def: {
      layers: GODFORGE_LAYERS,
      kinds: {
        A: "godforgeOuter",
        B: "godforgeTrim",
        C: "godforgeInner",
        D: "godforgeSupport",
        E: "godforgeOuter",
        F: "godforgeEnergy",
        G: "gravitonT1",
        H: "godforgeLens",
        I: "gravitonT3",
        J: "godforgeTrim",
        K: "gravitonT2",
        "~": "godforgeController",
      },
    },
  },
  {
    slug: "bec-entanglement-apparatus",
    name: "Bose-Einstein Condensate Entanglement Apparatus",
    title: "Аппарат запутывания конденсата",
    tier: "uiv",
    summary: "Первый шаг линии конденсата: превращает жидкости в запутанный конденсат за счёт энергии.",
    story: [
      "В игре по-русски — «Аппарат квантового запутывания конденсата Бозе-Эйнштейна».",
      CONDENSATE_LINE,
      "Жидкость заливают через входной люк спереди. Разгона у аппарата нет, зато параллелей сколько угодно — столько, на сколько хватит энергии. Готовый конденсат уходит через люк конденсата сзади.",
    ],
    facts: [
      { label: "Размер", value: "19 × 19 × 34" },
      { label: "Блоков", value: "1 279" },
      { label: "Параллели", value: "без предела" },
      { label: "Шаг линии", value: "первый" },
    ],
    source: `${SOURCES}/tectech/thing/metaTileEntity/multi/bec/MTEBECGenerator.java`,
    // У аппарата G — волновод, а не катушка отвода, а P и Q — изолированный корпус и манипулятор.
    def: { layers: CONDENSATE_GENERATOR_LAYERS, kinds: { ...CONDENSATE_KINDS, G: "becWaveguide", P: "becCasing", Q: "becManipulator", "~": "becGeneratorController" } },
  },
  {
    slug: "bec-containment-field",
    name: "Bose-Einstein Condensate Containment Field",
    title: "Поле удержания конденсата",
    tier: "uiv",
    summary: "Второй шаг линии: хранилище запутанного конденсата.",
    story: [
      "В игре по-русски — «Поле удержания конденсата Бозе-Эйнштейна».",
      CONDENSATE_LINE,
      "Ёмкость растёт с энергетическими люками: многоамперные и лазерные сильно её увеличивают. Особый люк-датчик подаёт сигнал красного камня по условию — например, когда конденсата бесконечности больше 100 000 литров.",
      "Контроллер стоит внутри поля, за кондуитом.",
    ],
    facts: [
      { label: "Размер", value: "45 × 17 × 45" },
      { label: "Блоков", value: "5 333" },
      { label: "Хранит", value: "запутанный конденсат" },
      { label: "Шаг линии", value: "второй" },
    ],
    source: `${SOURCES}/tectech/thing/metaTileEntity/multi/bec/MTEBECStorage.java`,
    def: { layers: CONDENSATE_CONTAINMENT_LAYERS, kinds: { ...CONDENSATE_KINDS, P: "becManipulator", "~": "becStorageController" } },
  },
  {
    slug: "bec-observation-array",
    name: "Bose-Einstein Condensate Observation Array",
    title: "Матрица наблюдения конденсата",
    tier: "uiv",
    summary: "Третий шаг линии: собирает детали из конденсата, подставляя нужные наниты на каждом шаге.",
    story: [
      "В игре по-русски — «Матрица наблюдения конденсата Бозе-Эйнштейна».",
      CONDENSATE_LINE,
      "Рецепты в NEI выглядят как рецепты сборочной линии, но строгого порядка у них нет: рецепт идёт шагами, и на каждом нужен свой нанит или лучше. Сами наниты не тратятся, но их надо быстро менять в матрице — автоматизация здесь требует точности.",
    ],
    facts: [
      { label: "Размер", value: "61 × 31 × 31" },
      { label: "Блоков", value: "7 994" },
      { label: "Нужны", value: "наниты по шагам рецепта" },
      { label: "Шаг линии", value: "третий" },
    ],
    source: `${SOURCES}/tectech/thing/metaTileEntity/multi/bec/MTEBECAssembler.java`,
    def: { layers: CONDENSATE_OBSERVATION_LAYERS, kinds: { ...CONDENSATE_KINDS, P: "becCasing", Q: "becManipulator", R: "becManipulator", "~": "becAssemblerController" } },
  },
  {
    slug: "bec-teleportation-node",
    name: "Bose-Einstein Condensate Teleportation Node",
    title: "Узел телепортации конденсата",
    tier: "uiv",
    summary: "Подаёт предметы в матрицу наблюдения и забирает готовое.",
    story: [
      CONDENSATE_LINE,
      "Узел — небольшая постройка рядом с матрицей наблюдения: через него идут предметы. Если нанит лучше требуемого, узел работает заметно медленнее — наниты нужно подбирать точно.",
    ],
    facts: [
      { label: "Размер", value: "7 × 23 × 13" },
      { label: "Блоков", value: "430" },
      { label: "Работает с", value: "матрицей наблюдения" },
      { label: "Шаг линии", value: "четвёртый" },
    ],
    source: `${SOURCES}/tectech/thing/metaTileEntity/multi/bec/MTEBECIONode.java`,
    def: { layers: CONDENSATE_TELEPORTATION_LAYERS, kinds: { ...CONDENSATE_KINDS, P: "becManipulator", "~": "becNodeController" } },
  },
  {
    slug: "bec-maxwell-gate",
    name: "Bose-Einstein Condensate Maxwell Gate",
    title: "Затвор Максвелла",
    tier: "uiv",
    summary: "Делит сеть конденсата на две: одна сторона видит другую, а обратно — нет.",
    story: [
      "В игре по-русски — «Затвор Максвелла конденсата Бозе-Эйнштейна». В линии он по желанию.",
      "Всё, что подключено к люку конденсата слева, видит то, что подключено справа, но не наоборот. Сам затвор конденсат не толкает, не тянет и не хранит, а потребляет ровно 1 ампер UIV, пока включён.",
    ],
    facts: [
      { label: "Размер", value: "17 × 11 × 11" },
      { label: "Блоков", value: "620" },
      { label: "Потребляет", value: "1 A UIV" },
      { label: "Шаг линии", value: "по желанию" },
    ],
    source: `${SOURCES}/tectech/thing/metaTileEntity/multi/bec/MTEBECDiode.java`,
    def: { layers: CONDENSATE_MAXWELL_LAYERS, kinds: { ...CONDENSATE_KINDS, P: "becManipulator", Q: "becManipulator", "~": "becGateController" } },
  },
];

/** Гайды построек EV, IV и ZPM — по их адресному имени. */
export const HIGH_GUIDES: Readonly<Record<string, Guide>> = {
  "mega-chemical-reactor": {
    wiki: "Mega Chemical Reactor",
    tips: [
      { title: "Катушки синтеза", text: "В сердцевине семь катушек синтеза — поэтому реактор открывается только в LuV." },
      { title: "Стекло решает", text: "Ярус стекла ограничивает ярус энергетических люков. Для лазерных люков нужно стекло не ниже UV." },
    ],
  },
  "exothermic-hearth": {
    wiki: "Exothermic Hearth",
    tips: [
      { title: "Разогрев", text: "Чем дольше горн работает без остановки, тем больше параллелей: за 30 минут их число удваивается. Без работы он быстро остывает." },
      { title: "Пиротеум", text: "Пиротеум ускоряет разогрев вшестеро; расход растёт вместе с множителем." },
      { title: "Как у доменной печи", text: "Те же правила нагрева: лишние кельвины дают скидку на энергию и идеальные разгоны." },
    ],
  },
  "mega-oil-cracker": {
    wiki: "Mega Oil Cracker",
    tips: [
      { title: "Два люка", text: "Водород или пар заливают в средний люк, а то, что крекируют, — в боковой. Выход — в люк с другой стороны." },
      { title: "Катушки", text: "Чем лучше катушки, тем меньше энергии уходит на рецепт." },
    ],
  },
  "mega-distillation-tower": {
    wiki: "Mega Distillation Tower",
    tips: [
      { title: "Высота", text: "Средних секций может быть от одной до пяти. Каждая секция — ещё одна жидкость на выходе. Здесь показана самая низкая колонна." },
      { title: "Два режима", text: "Отвёрткой колонну переключают в режим дистиллятора: тогда она выдаёт одну жидкость, зато параллелей вдвое–вчетверо больше." },
    ],
  },
  "quantum-force-transformer": {
    wiki: "Quantum Force Transformer",
    tips: [
      { title: "Катализатор", text: "Каждому рецепту нужен свой катализатор в особом люке. Он не тратится, а каждый катализатор даёт ещё одну параллель." },
      { title: "Уровни", text: "Манипуляторы решают, какие рецепты доступны, защитные ядра — насколько сильно можно сосредоточить выход на нужном продукте." },
      { title: "Фокус", text: "Схема в контроллере выбирает нужный продукт; нептуниевая плазма повышает его долю, фермиевая — поднимает все выходы." },
    ],
  },
  stargate: {
    wiki: "Stargate",
    tips: [
      { title: "Сначала — МАХ", text: "Для врат нужны планковские МАХ-схемы, детали МАХ и горы универсиума. Без квантового комплекса сборки наночипов схемы не начать." },
      { title: "Из чего", text: "Восемь блоков кольца, семь шевронов, основа, наборное устройство и блок питания. Кольцо и шевроны делают из каркасов, сеток и экранирующей фольги врат." },
      { title: "Вторые врата", text: "За финальное задание «Что, как?» дают вторые врата — их можно связать с первыми." },
      { title: "Дальше", text: "После врат книга предлагает собрать ещё пять пар как можно быстрее или пройти сборку заново." },
    ],
  },
  "endothermic-fridge": {
    wiki: "Endothermic Fridge",
    tips: [
      { title: "Разогрев наоборот", text: "Чем дольше холодильник работает без остановки, тем он холоднее: за 5 минут скорость вырастает до 150 %. Выключенный — снова теплеет." },
      { title: "Криотеум", text: "Если подавать криотеум, холодильник остывает впятеро быстрее. Расход растёт вместе с прибавкой скорости." },
      { title: "Второй уровень", text: "Морозостойкие корпуса внутри меняют на корпуса с бесконечным охлаждением. Тогда 20 литров в секунду расплавленной бесконечности дают один идеальный разгон, пространства-времени — два, вечности — три." },
    ],
  },
  "eye-of-harmony": {
    wiki: "Eye of Harmony",
    tips: [
      { title: "Три вида генераторов", text: "У каждого девять уровней. Сжатие решает, какие небесные тела можно перерабатывать, замедление ускоряет рецепт, но рецепт чаще срывается, стабилизация делает срывы реже, зато выход меньше." },
      { title: "Водород и гелий", text: "Глаз берёт их огромными количествами. Лишний газ на входе — наказание: рецепт может сорваться." },
      { title: "Подстраховка", text: "Если рецепт много раз подряд сорвался, следующий обязательно удастся. Работает, только пока параллель одна." },
      { title: "Читайте подсказку", text: "В подсказке контроллера расписано всё, вплоть до формул, — она занимает несколько страниц." },
    ],
  },
  "large-combustion-engine": {
    wiki: "Large Combustion Engine",
    tips: [
      { title: "Всегда с кислородом", text: "Без кислорода — 2 048 EU/t при КПД 100 %, с кислородом — 6 144 EU/t при КПД 150 %. Держите подачу кислорода постоянной." },
      { title: "Топливо", text: "Если ещё не перешли на дизель с цетановой присадкой — самое время: литр даёт 1 000 EU." },
      { title: "Смазка", text: "Двигателю нужно немного смазки. Без неё он не работает." },
      { title: "Цена", text: "На постройку уходит около четырёх стаков титана." },
    ],
  },
  "large-gas-turbine": {
    wiki: "Large Gas Turbine",
    tips: [
      { title: "Ротор", text: "КПД задаёт ротор в контроллере. С хорошим ротором турбина легко выходит за 100 %." },
      { title: "Ровный поток", text: "Подавайте газа столько, сколько ротору положено. Больше или меньше — КПД падает." },
      { title: "Воздух спереди", text: "Перед ротором должно быть свободно три на три блока." },
    ],
  },
  "ore-drilling-plant": {
    wiki: "Ore Drilling Plant",
    tips: [
      { title: "Что нужно", text: "Ток, буровые трубы и буровой раствор. Трубы уходят вниз, пока буровая не дойдёт до дна." },
      { title: "Следующие модели", text: "Вторая модель буровой открывается в IV — она копает шире и быстрее." },
      { title: "Куда девать руду", text: "Руды выходит много. Сначала наладьте её переработку, потом ставьте буровую." },
    ],
  },
  "industrial-centrifuge": {
    wiki: "Industrial Centrifuge",
    tips: [
      { title: "Кому в первую очередь", text: "Если ресурсы идут от пчёл, стройте центрифугу раньше остальных построек: соты она перерабатывает во много раз быстрее." },
      { title: "Цена", text: "Многоблочные машины переработки руды требуют много титана и лучших катушек в доменной печи, поэтому их строят ближе к середине яруса." },
      { title: "Вместо обычной центрифуги", text: "Если платиновую линию ведёте в большом химическом реакторе, центрифуга для неё не нужна." },
    ],
  },
  "industrial-maceration-stack": {
    wiki: "Industrial Maceration Stack",
    tips: [
      { title: "Переработка руды", text: "Вместе с центрифугой и моечной установкой башня заменяет целый ряд одноблочных машин." },
      { title: "Два яруса", text: "Башню можно улучшить: второй ярус шире и ведёт больше рецептов сразу." },
      { title: "Цена", text: "Корпуса титановые — сначала наладьте постоянный выпуск титана." },
    ],
  },
  "lapotronic-supercapacitor": {
    wiki: "Lapotronic Supercapacitor",
    tips: [
      { title: "Зачем", text: "Большие генераторы жгут топливо, даже когда ток не нужен. Батарея копит его, а генераторы можно включать только когда она пустеет." },
      { title: "Стекло", text: "Конденсаторам EV и IV хватает обычного боросиликатного стекла. Лучшим нужно стекло лучше." },
      { title: "Потери", text: "Суперконденсатор понемногу теряет ток сам по себе — около 30 EU/t у башни из одного слоя конденсаторов IV." },
      { title: "Силовая шина", text: "В IV от него тянут один толстый кабель высокого напряжения через всю базу, а у машин ток понижают трансформаторами." },
    ],
  },
  "assembly-line": {
    wiki: "Assembly Line",
    tips: [
      { title: "Цена входа", text: "Даже самой короткой линии нужно 90 схем яруса ZPM. Сначала постройте производство схем." },
      { title: "Длина", text: "От 5 до 16 отрезков. Длинные рецепты требуют длинной линии — оставьте место для роста." },
      { title: "Палочки данных", text: "Рецепт линии сначала исследуют и записывают на палочку данных, потом вставляют в люк данных." },
      { title: "Порядок", text: "Каждый предмет рецепта кладут в свою шину, по порядку от контроллера." },
    ],
  },
  volcanus: {
    wiki: "Volcanus",
    tips: [
      { title: "Чем лучше печи", text: "Больше чем вдвое быстрее, до 8 плавок сразу и на 10 % меньше энергии." },
      { title: "Пиротеум", text: "Нужно 10 литров пылающего пиротеума в секунду. Его дают пчёлы или смесь угольной пыли, серы, огненного порошка и редстоуна." },
      { title: "Нет прибавки нагрева", text: "Напряжение не добавляет Вулканусу жара. Рецепты, которым не хватает катушек, по-прежнему плавят в обычной печи." },
    ],
  },
  "alloy-blast-smelter": {
    wiki: "Alloy Blast Smelter",
    tips: [
      { title: "Зачем", text: "Сплавы из неё нужны для Вулкануса, криогенного морозильника, резака, лазерного гравёра и других построек IV." },
      { title: "Ярус люка", text: "Рецепт яруса IV она возьмёт только с энергетическим люком IV. Несколько люков послабее не помогут." },
      { title: "Иридий", text: "Для люка IV нужен иридий: либо платиновая линия целиком, либо немного иридия вручную." },
    ],
  },
  "extreme-combustion-engine": {
    wiki: "Extreme Combustion Engine",
    tips: [
      { title: "Топливо", text: "Высокооктановый бензин: 2 500 EU за литр. Готовить его быстрее в ректификационной колонне GT++." },
      { title: "Кому строить", text: "Тем, чья энергетика стоит на нефти. Остальным в IV подойдут реакторы или турбины." },
      { title: "Воздух сверху", text: "Над воздухозаборниками ничего не ставят." },
    ],
  },
  "fusion-reactor-1": {
    wiki: "Fusion Reactor",
    tips: [
      { title: "Европий", text: "Главный рецепт. Делается медленно, поэтому под него ставят отдельный реактор и не выключают." },
      { title: "Цена", text: "На один реактор уходит больше 4 000 сверхпроводников LuV. Готовьте производство заранее." },
      { title: "Разгон", text: "Каждый новый рецепт требует сотен миллионов EU на запуск, а ток реактор берёт медленно. Не меняйте рецепты без нужды и заказывайте большими партиями." },
      { title: "Гелиевая плазма", text: "Топливо для плазменной турбины уже сейчас, а в ZPM она нужна для плавки нейтрониума." },
      { title: "Дюраниум", text: "Отличный материал для роторов турбин. В ZPM из него делают тритан." },
    ],
  },
  "large-plasma-turbine": {
    wiki: "Large Plasma Turbine",
    tips: [
      { title: "Откуда плазма", text: "Из реактора синтеза. Гелиевая плазма — самая простая; дальше по цепочке идут плазмы сильнее." },
      { title: "Ротор", text: "Как и у других турбин, КПД и расход задаёт ротор в контроллере." },
      { title: "Что остаётся", text: "Остывшая плазма выходит обычным газом или жидкостью — её можно пустить обратно в дело." },
    ],
  },
  "neutron-activator": {
    wiki: "Neutron Activator",
    tips: [
      { title: "Высота вместо напряжения", text: "Скорость рецептов задаёт высота башни, а не ярус тока. Выше башня — быстрее работа." },
      { title: "Как собрать", text: "Сам активатор и его детали собирают в точном сборщике с корпусами первой модели." },
      { title: "Три линии", text: "На нём стоят переработка наквады, обогащённой наквады и наквадрии. Первая нужна сейчас, две другие — в ZPM." },
    ],
  },
  "circuit-assembly-line": {
    wiki: "Circuit Assembly Line",
    tips: [
      { title: "Когда строить", text: "До реактора синтеза — по желанию, ради скорости. После него — обязательно: кристаллические схемы делают только здесь." },
      { title: "Длина", text: "От 2 до 7 отрезков: по одному на каждый предмет рецепта." },
      { title: "Кристаллические чипы", text: "Их растят в автоклаве и разбивают молотом по кругу — заранее поставьте промышленный автоклав." },
    ],
  },
  "forge-of-the-gods": {
    wiki: "Forge of the Gods",
    tips: [
      { title: "Кольца", text: "Строят до трёх колец. Перед новым кольцом выключите анимацию отвёрткой — постройка разберётся; потом включите киянкой." },
      { title: "Люки", text: "Ровно по одному входному и выходному люку на особых корпусах у контроллера; выходная шина — только ME." },
      { title: "Беспроводной ток", text: "Энергетического люка нет: столько энергии обычным люком не провести." },
      { title: "Улучшения", text: "Осколки гравитонов дают за вехи работы Кузницы. Для UXV нужно последнее улучшение — END." },
    ],
  },
  "bec-entanglement-apparatus": {
    wiki: "Bose-Einstein Condensate Line",
    tips: [
      { title: "Без разгона", text: "Разгона нет, но параллелей сколько угодно — ровно на сколько хватит энергии." },
      { title: "Люки", text: "Входные люки — на изолированных корпусах у контроллера, люк конденсата — сзади по центру." },
      { title: "Кондуиты", text: "Постройки линии соединяют кондуитами — они гнутся и ветвятся как угодно, красить их не нужно." },
      { title: "Энергия", text: "Многоамперные и лазерные энергетические люки поддерживаются." },
    ],
  },
  "bec-containment-field": {
    wiki: "Bose-Einstein Condensate Line",
    tips: [
      { title: "Датчик", text: "Люк-датчик подаёт сигнал красного камня по условию: тип конденсата, сравнение и порог." },
      { title: "Ёмкость", text: "Многоамперные и лазерные люки сильно увеличивают ёмкость поля." },
      { title: "Кондуиты", text: "Постройки линии соединяют кондуитами — они гнутся и ветвятся как угодно, красить их не нужно." },
      { title: "Энергия", text: "Многоамперные и лазерные энергетические люки поддерживаются." },
    ],
  },
  "bec-observation-array": {
    wiki: "Bose-Einstein Condensate Line",
    tips: [
      { title: "Наниты", text: "На каждом шаге рецепта нужен свой нанит или лучше. Наниты не тратятся, но их надо быстро менять." },
      { title: "Кондуиты", text: "Постройки линии соединяют кондуитами — они гнутся и ветвятся как угодно, красить их не нужно." },
      { title: "Энергия", text: "Многоамперные и лазерные энергетические люки поддерживаются." },
    ],
  },
  "bec-teleportation-node": {
    wiki: "Bose-Einstein Condensate Line",
    tips: [
      { title: "Точные наниты", text: "Нанит намного лучше требуемого сильно замедляет узел — подбирайте точно." },
      { title: "Кондуиты", text: "Постройки линии соединяют кондуитами — они гнутся и ветвятся как угодно, красить их не нужно." },
      { title: "Энергия", text: "Многоамперные и лазерные энергетические люки поддерживаются." },
    ],
  },
  "bec-maxwell-gate": {
    wiki: "Bose-Einstein Condensate Line",
    tips: [
      { title: "В одну сторону", text: "Левая сторона видит правую, правая левую — нет. Так делят одну сеть конденсата на две." },
      { title: "Кондуиты", text: "Постройки линии соединяют кондуитами — они гнутся и ветвятся как угодно, красить их не нужно." },
      { title: "Энергия", text: "Многоамперные и лазерные энергетические люки поддерживаются." },
    ],
  },
  "nanochip-assembly-complex": {
    wiki: "Nanochip Assembly Complex",
    tips: [
      { title: "Модули", text: "Одиннадцать видов модулей, двенадцать мест. Модуль ставят вместо корпуса сетевого интерфейса на верхнем краю места и собирают проектором, как обычную постройку." },
      { title: "Конвейеры", text: "Детали ходят между модулями по вакуумным конвейерам — объём и скорость у них не ограничены." },
      { title: "Ток", text: "Один энергетический люк — внутри или под пунктом управления. Комплекс сам раздаёт ток модулям." },
      { title: "Калибровка", text: "Чем больше схем одной линии собрано, тем лучше комплекс под неё настроен и тем больше прибавка." },
    ],
  },
  "black-hole-compressor": {
    wiki: "Pseudostable Black Hole Containment Field",
    tips: [
      { title: "Вечная сингулярность", text: "Лучший рецепт — 72 литра пространства-времени. Без него на вечные катушки кузницы уйдут десятки тысяч слитков." },
      { title: "Семя и коллапсер", text: "Для каждого рецепта с чёрной дырой кладите семя, а через время — коллапсер, иначе рецепт пропадёт." },
      { title: "Разгон", text: "Только на один ярус выше люка: с люком UIV — рецепты до UMV." },
      { title: "Сервисный люк", text: "Подаёт сигнал красного камня, пока чёрная дыра открыта, — так проще автоматизировать." },
    ],
  },
  "helioflare-power-forge": {
    wiki: "Forge of the Gods",
    tips: [
      { title: "Первым делом", text: "Только этот модуль делает насыщенный раствор фононных кристаллов — без него не работают остальные модули Кузницы." },
      { title: "Беспроводной ток", text: "Модули Кузницы берут ток из беспроводной сети — перенесите туда хранилище энергии." },
      { title: "Улучшения", text: "Улучшения Кузницы покупают за осколки гравитонов — их дают вехи её работы. Для UXV нужно дойти до улучшения END." },
    ],
  },
  "fusion-reactor-4": {
    wiki: "Fusion Reactor",
    tips: [
      { title: "Первый гипоген", text: "Рецепт гипогена в кузнице — петля, и на первый запуск ей нужен слиток жидкого гипогена. Его даёт только этот реактор." },
      { title: "Нептуний и фермий", text: "Плазмы нептуния и фермия из него нужны для дальнейшего развития кузницы." },
      { title: "Разгон", text: "Перед каждым новым рецептом — до 5,12 миллиарда EU на запуск. Не меняйте рецепты без нужды." },
    ],
  },
  "fusion-reactor-5": {
    wiki: "Fusion Reactor",
    tips: [
      { title: "Для Кузницы богов", text: "Креон (из плазмы тория), плазма свинца и плазма плутония-241 есть только здесь — а без них Кузницу богов не построить." },
      { title: "Компактная версия", text: "Компактный реактор пятой модели ускоряет все старые рецепты синтеза минимум вчетверо — это особенно важно для медленных рецептов четвёртой модели." },
      { title: "Разгон", text: "Перед каждым новым рецептом — до 20,48 миллиарда EU на запуск." },
    ],
  },
  "plasma-forge": {
    wiki: "Dimensionally Transcendent Plasma Forge",
    tips: [
      { title: "Катушки", text: "Нужны катушки не хуже пробуждённого дракония. С катушками из бесконечности открываются тессеракты и гипоген — без них дальше не пройти." },
      { title: "Катализатор", text: "Пять ступеней катализатора, каждую мешают из плазм реактора синтеза. В UEV — только медленно; плазмы и смешивание держите в работе постоянно." },
      { title: "Не выключайте", text: "За непрерывную работу кузница тратит всё меньше катализатора — до 50 % после восьми часов." },
      { title: "Сборка корпусов", text: "Корпуса кузницы требуют UIV в сборочной линии: ставьте несколько линий параллельно." },
    ],
  },
  "transcendent-plasma-mixer": {
    wiki: "Transcendent Plasma Mixer",
    tips: [
      { title: "Беспроводной ток", text: "Энергетического люка нет — смеситель берёт ток из беспроводной сети в начале каждого рецепта." },
      { title: "Параллели", text: "Сколько рецептов сразу — задаёте в окне контроллера. Ограничение одно: хватит ли энергии в сети." },
      { title: "Цена", text: "На постройку уходит по 2 048 000 литров каждого из первых четырёх катализаторов." },
    ],
  },
  "fusion-reactor-3": {
    wiki: "Fusion Reactor",
    tips: [
      { title: "Америций", text: "Плутоний-241 и водород дают слиток за 3,2 секунды — в 13,5 раза быстрее второй модели. Сразу переводите америций на этот рецепт." },
      { title: "Оганесон", text: "Два шага: калифорний из бериллия и плутония-239, потом к нему кальций. Лучший газ для доменной печи и добытчика из пустоты." },
      { title: "Разгон старых рецептов", text: "Рецепты второй модели идут вдвое быстрее, первой — вчетверо." },
      { title: "Вода пятой степени", text: "Для пластин с америцием, без которых не собрать сам реактор, нужна вода пятой степени очистки." },
    ],
  },
  "bacterial-vat": {
    wiki: "Bacterial Vat",
    tips: [
      { title: "Наполовину", text: "Выходной люк держите заполненным наполовину: так чан работает быстрее всего и тратит меньше предметов." },
      { title: "Культуры", text: "Культуры выводят в одноблочной биолаборатории. Многие её рецепты требуют класть предметы точно в те ячейки, что показаны в NEI." },
      { title: "Питательная среда", text: "Из трёх рецептов лучший — с мутагеном, если пчёлы уже дают мутаген: он дешевле и пропускает несколько шагов." },
    ],
  },
  "mega-alloy-blast-smelter": {
    wiki: "Mega Alloy Blast Smelter",
    tips: [
      { title: "Зачем", text: "Те же жидкие сплавы, что у доменной плавильни из IV, но очень много сразу." },
      { title: "Катушки", text: "Катушки внутри ствола задают, какие сплавы ей по силам, как у доменной печи." },
      { title: "Глушитель", text: "Нужен глушитель в крышке — постройка загрязняет воздух." },
    ],
  },
  "neutronium-compressor": {
    wiki: "Neutronium Compressor",
    tips: [
      { title: "Бесконечность", text: "Из двух рецептов катализатора бесконечности вики советует тот, что идёт через этот компрессор." },
      { title: "Что ещё нужно", text: "Катализатор сильно поднимает спрос на алмазы, звёзды Нижнего мира и космический нейтрониум — наладьте их заранее." },
      { title: "Где пригодится", text: "Слитки бесконечности нужны понемногу в UHV и очень много — со следующего яруса." },
    ],
  },
  "electric-implosion-compressor": {
    wiki: "Electric Implosion Compressor",
    tips: [
      { title: "Без взрывчатки", text: "Тратит немного энергии вместо динамита, а рецепты у него быстрее, чем у старого компрессора." },
      { title: "Когда строить", text: "Не обязателен, но вики советует поставить его до ракеты восьмого уровня." },
      { title: "Поршни", text: "Поршни из материалов лучше нейтрониума позволяют вести больше рецептов сразу." },
    ],
  },
  "fusion-reactor-2": {
    wiki: "Fusion Reactor",
    tips: [
      { title: "Америций", text: "Слиток — 43 секунды, а на один мотор следующего яруса уходит 34 минуты работы. Запускайте реактор заранее или стройте несколько." },
      { title: "Лютеций", text: "Для америция нужен лютеций — руды с ним нет. Его дают монацит, наквадовое топливо, пчёлы или отработанные ториевые стержни." },
      { title: "Тритан", text: "Реактор делает тритан из дюраниума и титана. Он открывает добытчик из пустоты и ракету шестого уровня." },
      { title: "Старые рецепты", text: "Рецепты первой модели идут вдвое быстрее за вдвое больший ток." },
      { title: "Плазма", text: "Плазма олова из реактора — топливо лучше гелиевой плазмы для плазменных турбин." },
    ],
  },
  "large-naquadah-reactor": {
    wiki: "Large Naquadah Reactor",
    tips: [
      { title: "Мощность", text: "До 42,9 млн EU/t на топливе первой ступени и до 101,2 млн на топливе второй." },
      { title: "Четыре жидкости", text: "Топливо, жидкий воздух, охладитель (ледяной криотеум) и возбуждающая жидкость. Наладьте выпуск всех четырёх." },
      { title: "Откуда топливо", text: "Первую ступень даёт реактор синтеза II, вторую — большой химический реактор из первой." },
      { title: "Лазеры", text: "Такой ток кабелями не увести: в ZPM появляются лазерные люки и трубы." },
    ],
  },
};
