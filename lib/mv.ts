import { ASSETS, GAME } from "./config";
import type { GuideTip } from "./guides";
import { LV_MACHINES, machineId } from "./lv";
import type { Faces, Single } from "./singles";
import type { TierId } from "./tiers";

/**
 * Генераторы и одноблочные машины MV. Машины — те, что вики GT New Horizons
 * (страница Medium Voltage) советует обновить в первую очередь; числа
 * генераторов — со страницы Singleblock Generators.
 */

const MV_VOLTAGE = `${GAME.voltageTiers[2].voltage} EU/t`;
const LV_VOLTAGE = `${GAME.voltageTiers[1].voltage} EU/t`;

const HULL: Faces = { front: "hull-mv-side", side: "hull-mv-side", top: "hull-mv-top", bottom: "hull-mv-bottom" };
const ENERGY_OUT = "gen-mv-energy-out";

/** Главное новое правило яруса: два напряжения в одной базе. */
const VOLTAGE_TIPS: readonly GuideTip[] = [
  {
    title: "Не смешивайте напряжения",
    text: `Ток MV сжигает кабели LV и взрывает машины LV. Держите линии ${MV_VOLTAGE} и ${LV_VOLTAGE} отдельно: разные комнаты, разная толщина или цвет кабелей.`,
  },
  {
    title: "Трансформатор",
    text: "Один ампер MV трансформатор превращает в четыре ампера LV — так старые машины кормят от новых генераторов. Режим переключают киянкой и только без тока: под напряжением трансформатор взорвётся.",
  },
];

const GENERATOR_WIKI = "Singleblock Generators";

const GENERATORS: readonly Single[] = [
  {
    slug: "steam-turbine-mv",
    name: "Advanced Steam Turbine",
    title: "Паровая турбина",
    label: "Пар",
    tier: "mv",
    group: "generator",
    does: "пар — в электричество",
    faces: { ...HULL, front: ENERGY_OUT, side: "gen-mv-steam-turbine-side" },
    story: [
      `Турбина MV выдаёт ${MV_VOLTAGE} — вчетверо больше турбины LV.`,
      "Но пара она ест в четыре с половиной раза больше: 6 993 литра в секунду, потому что КПД у неё ниже. На таком расходе одноблочные котлы не справляются — нужен большой котёл.",
    ],
    facts: [
      { label: "Размер", value: "1 блок" },
      { label: "Выдаёт", value: `${MV_VOLTAGE}, 1 A` },
      { label: "Ест", value: "6 993 л пара в секунду" },
      { label: "КПД", value: "75 %" },
      { label: "Бак", value: "48 000 л" },
    ],
    guide: {
      wiki: GENERATOR_WIKI,
      tips: [
        { title: "Стоит ли", text: "КПД падает с каждым ярусом: 85 % у LV, 75 % у MV. Многие остаются на турбинах LV с трансформатором или переходят на дизель и бензол." },
        ...VOLTAGE_TIPS,
      ],
    },
  },
  {
    slug: "combustion-generator-mv",
    name: "Advanced Combustion Generator",
    title: "Дизельный генератор",
    label: "Дизель",
    tier: "mv",
    group: "generator",
    does: "жидкое топливо — в электричество",
    faces: { ...HULL, front: ENERGY_OUT, top: "gen-mv-combustion-top" },
    story: [
      `Генератор на жидком топливе, ${MV_VOLTAGE}.`,
      "В MV появляется дизель: его мешают в смесителе MV из лёгкого и тяжёлого топлива. Литр дизеля даёт 480 EU против 305 у лёгкого топлива.",
    ],
    facts: [
      { label: "Размер", value: "1 блок" },
      { label: "Выдаёт", value: `${MV_VOLTAGE}, 1 A` },
      { label: "Топливо", value: "дизель, лёгкое топливо" },
      { label: "КПД", value: "90 %" },
      { label: "Бак", value: "16 000 л" },
    ],
    guide: {
      wiki: GENERATOR_WIKI,
      tips: [
        { title: "Дизель", text: "Переход с лёгкого топлива на дизель — одно из главных улучшений энергетики в MV." },
        ...VOLTAGE_TIPS,
      ],
    },
  },
  {
    slug: "gas-turbine-mv",
    name: "Advanced Gas Turbine",
    title: "Газовая турбина",
    label: "Газ",
    tier: "mv",
    group: "generator",
    does: "горючий газ — в электричество",
    faces: { ...HULL, front: ENERGY_OUT, side: "gen-mv-gas-turbine-side" },
    story: [
      `Генератор на горючем газе, ${MV_VOLTAGE}.`,
      "Главное топливо для неё в MV — бензол: 360 EU за литр. Его получают из жидкостей пиролизной печи, так что ферма деревьев превращается в электростанцию.",
    ],
    facts: [
      { label: "Размер", value: "1 блок" },
      { label: "Выдаёт", value: `${MV_VOLTAGE}, 1 A` },
      { label: "Топливо", value: "бензол, метан, сжиженный газ" },
      { label: "КПД", value: "90 %" },
      { label: "Бак", value: "16 000 л" },
    ],
    guide: {
      wiki: GENERATOR_WIKI,
      tips: [
        { title: "Бензол", text: "Фермы деревьев в MV переводят с пара на бензол — для этого и нужны газовые турбины." },
        ...VOLTAGE_TIPS,
      ],
    },
  },
];

/** Что машине даёт ярус MV — по её папке в текстурах мода. */
const MV_NOTES: Readonly<Record<string, string>> = {
  electrolyzer: "Главная машина яруса: только с MV она разбирает глиняную пыль на алюминий, а заодно даёт кислород и кремний.",
  arc_furnace: "Быстрее переплавляет предметы обратно в слитки. По-прежнему тянет три ампера.",
  assembler: "Открывает рецепты MV: детали яруса, корпуса и машины.",
  circuitassembler: "Нужен для хороших схем, а к концу яруса — для первых схем HV на микросхемах.",
  chemical_reactor: "На нём стоит пластик: нафта, паровой крекинг и полиэтилен.",
  chemical_bath: "Вымывает побочные металлы из руды растворами, недоступными в LV.",
  cutter: "Режет кремниевые слитки на пластины — заготовки для микросхем.",
  extruder: "Наконец полезен: почти все его рецепты требуют MV. Стержни, трубы, шестерни — без потерь металла.",
  fluid_extractor: "Плавит в жидкость то, что версии LV не по силам.",
  fluid_solidifier: "Льёт детали из расплавов яруса MV.",
  laser_engraver: "Гравирует кремниевые пластины — первый шаг к микросхемам.",
  mixer: "Здесь мешают дизель из лёгкого и тяжёлого топлива и пыль нержавеющей стали.",
  miner: "В игре называется Good Miner: копает шире и с бонусом удачи. Тянет всего четверть ампера MV, так что работает и от одного генератора LV.",
};

const MACHINE_TIPS: readonly GuideTip[] = [
  {
    title: "Напряжение",
    text: `Машина MV тянет рецепты до ${MV_VOLTAGE}. Подать ей меньше — безопасно, она просто не возьмёт дорогой рецепт. Подать больше — взрыв.`,
  },
  ...VOLTAGE_TIPS,
  {
    title: "Разгон",
    text: "Рецепт яруса ниже машина ведёт вдвое быстрее, но тратит вчетверо больше энергии.",
  },
];

interface Upgrade {
  readonly tier: Exclude<TierId, "steam" | "lv">;
  readonly voltage: string;
  readonly folders: readonly string[];
  /** Что машине даёт этот ярус — по её папке в текстурах мода. */
  readonly notes: Readonly<Record<string, string>>;
  readonly tips: readonly GuideTip[];
  readonly wiki: string;
}

/** Машины яруса выше LV: та же машина на корпусе своего яруса и с рассказом, что ей даёт ярус. */
export function upgradedMachines({ tier, voltage, folders, notes, tips, wiki }: Upgrade): readonly Single[] {
  const label = tier.toUpperCase();
  return folders.map((folder) => {
    const machine = LV_MACHINES.find((candidate) => candidate.folder === folder);
    const note = notes[folder];
    if (!machine || !note) throw new Error(`Нет описания машины ${label} «${folder}»`);
    const id = machineId(folder);
    return {
      slug: `${id}-${tier}`,
      name: machine.name,
      title: machine.title,
      label,
      tier,
      group: machine.group,
      does: machine.does,
      faces: {
        front: `single-${tier}-${id}`,
        side: `single-${tier}-${id}-side`,
        top: `single-${tier}-${id}-top`,
        bottom: `hull-${tier}-bottom`,
      },
      story: [machine.about, note],
      facts: [
        { label: "Размер", value: "1 блок" },
        { label: "Напряжение", value: `${label}, ${voltage}` },
        { label: "Ток", value: `${machine.amps ?? 1} A` },
        ...(machine.next ? [{ label: "На смену", value: machine.next }] : []),
      ],
      guide: { wiki, tips },
    };
  });
}

const MACHINES = upgradedMachines({
  tier: "mv",
  voltage: MV_VOLTAGE,
  folders: ASSETS.mvMachineFolders,
  notes: MV_NOTES,
  tips: MACHINE_TIPS,
  wiki: "Medium Voltage (MV)",
});

/** Все одноблочные MV: сначала генераторы, потом машины. */
export const MV_SINGLES: readonly Single[] = [...GENERATORS, ...MACHINES];
