import { GAME, PRODUCTION } from "./config";
import { coilHeat } from "./heat";
import { OPPOSITE, addHatch, boxOf, cellOf, keyOf, lay, move, placeMachine, route, row, toMachine, withCells, type Cell, type Grid } from "./layout";
import { KINDS, findMachine, kindsOf, type Fact, type KindId, type Machine } from "./machines";
import { bbfFarmRun, fuelChainRun, type FuelChainRun, type FuelStage, bronzeRun, coilFor, powerSupply, runRecipe, steamSteelRun, steamWater, steelPrepRun, type Recipe, type Run } from "./production";
import { SINGLES, findSingle, type Single } from "./singles";
import type { BlockKind, Face, Vec3 } from "./structure";
import { TIERS, type TierId } from "./tiers";

/** Вариант линии: тот же процесс, но на другом источнике пара или энергии. */
export interface LineOption {
  /** Адресное имя источника (котла или генератора) или «coke», если энергия не нужна. */
  readonly id: string;
  /** Подпись на переключателе. */
  readonly label: string;
  /** Ветка дерева источников: чем делают (печь, плавильня) или «Без электричества». */
  readonly group: string;
  /** Чем кормится источник — коротко, под кнопкой в дереве. */
  readonly via: string;
  /** Абзацы для страницы, простым языком. */
  readonly story: readonly string[];
  /** Что стоит в линии и зачем — по порядку, как идут предметы. */
  readonly parts: readonly { readonly title: string; readonly text: string }[];
  /** Сколько линия даёт и сколько ей нужно. */
  readonly facts: readonly Fact[];
  /** Линия как постройка: её рисует та же сцена, что и машины. */
  readonly setup: Machine;
}

/**
 * Главный материал яруса и линия, на которой его получают быстрее всего:
 * постройки вместе с воронками, сундуками, трубами, а если нужна энергия или пар — с генераторами,
 * котлами, кабелями и паропроводом. Выработка подобрана под потребление; источник можно выбрать
 * из тех, что есть на ярусе, — первый вариант показывается сразу.
 */
export interface Material {
  /** Адресное имя: /materials/<slug>. */
  readonly slug: string;
  readonly title: string;
  readonly tier: TierId;
  readonly summary: string;
  readonly options: readonly LineOption[];
}

const MULTI = "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi";

/** Паровые линии собраны вручную: у паровых построек нет шин, предметы идут воронками и вагонетками. */
const STEAM_BASES = {
  bronze: {
    slug: "setup-bronze",
    name: "Bronze line",
    title: "Линия бронзы",
    tier: "steam",
    summary: "Паровая плавильня сплавов с сундуками и воронками.",
    story: [],
    facts: [],
    source: `${MULTI}/steam/MTESteamAlloySmelter.java`,
    def: {
      layers: [
        ["S S", "   ", "   ", "   "],
        ["H H", "   ", "   ", "   "],
        ["CCC", "CCC", "CCC", "CCC"],
        ["CaC", "GPG", "GPG", "CCC"],
        ["CCC", "CCC", "CCC", "CCC"],
        ["B B", " H ", "   ", "B B"],
        ["B B", " S ", "   ", "B B"],
      ],
      kinds: { C: "bronzeBricks", G: "glass", P: "bronzePipe", a: "smelterController", S: "ownChest", H: "ownHopper", B: "ownBricks" },
    },
  },
  steel: {
    slug: "setup-steel",
    name: "Steel line",
    title: "Линия стали",
    tier: "steam",
    summary: "Коксовая печь и кирпичная домна с воронками, вагонетками и трубами.",
    story: [],
    facts: [],
    source: `${MULTI}/MTEBrickedBlastFurnace.java`,
    def: {
      layers: [
        [" S     ", "    ccc", "    c-c", "    ccc"],
        [" h   S ", "KiK ccc", "KKK clc", "KKK ccc"],
        ["    Ph ", "KkK cbc", "K-K clc", "KKK ccc"],
        ["    P  ", "KoK cNc", "KKK ccc", "KKK ccc"],
        [" PPPP  ", "BPB BgS", "BBB BBB", "BBB BBB"],
      ],
      // У коксовой печи — люки на месте кирпича (вход над контроллером, выход кокса снизу); у домны — вагонетка под контроллером.
      kinds: { K: "cokeBrick", k: "cokeController", i: "cokeHatchIn", o: "cokeHatchItems", c: "firebrick", b: "bbfController", S: "ownChest", h: "ownHopperBack", g: "ownHopperRight", P: "itemPipe", N: "firebrickCart", B: "ownBricks" },
      hollow: "l-",
    },
  },
} satisfies Record<string, Machine>;

function steelSteamMaterial(): Material {
  const run = steamSteelRun();
  // Люки печи смотрят туда, откуда приходит уголь (воронка спереди) и куда уходит кокс (труба снизу).
  const placed = placeMachine(new Map(), STEAM_BASES.steel, [0, 0, 0], KINDS, true).grid;
  const faced = withCells(
    placed,
    [...placed.entries()].flatMap(([key, value]): (readonly [Vec3, Cell])[] =>
      value.kind === "cokeHatchIn" ? [[cellOf(key), { ...value, face: "pz" }]] : value.kind === "cokeHatchItems" ? [[cellOf(key), { ...value, face: "ny" }]] : [],
    ),
  );
  // Печь работает, пока домне нужен кокс; креозот копится в её баке — без слива он наполнится за столько минут.
  const creosoteMinutes = PRODUCTION.cokeOven.tank / ((run.cokePerMinute / PRODUCTION.cokeOven.cokePerCoal) * PRODUCTION.cokeOven.creosotePerCoal);
  return {
    slug: "steel",
    title: "Сталь",
    tier: "steam",
    summary: "Коксовая печь и кирпичная домна в одной линии: уголь в кокс, железо с коксом — в сталь. Энергия не нужна.",
    options: [{
    id: "coke",
    label: "Кокс — энергия не нужна",
    group: "Кирпичная домна",
    via: "кокс из коксовой печи",
    story: [
      "Сталь — второй главный металл пара: из неё делают машины высокого давления и всё, что нужно для LV. В паровую эру её варит только кирпичная домна, и быстрее всего — на коксе: кокса на слиток уходит вдвое меньше, чем угля, а плавка идёт 4 минуты вместо 6.",
      `Одна домна даёт слиток за 4 минуты — ${format(run.perMinute * PRODUCTION.secondsPerMinute)} слитков в час — и тратит ${format(run.cokePerMinute, 2)} кокса в минуту. Коксовая печь делает ${format(run.ovenCokePerMinute, 2)} кокса в минуту, так что одной печи хватает с запасом. Энергия и пар здесь не нужны: топливо — сам кокс.`,
      "У коксовой печи есть свои люки — их ставят на место любого кирпича: через один печь берёт уголь, через другой отдаёт кокс прямо в трубу. У домны свободна только передняя сторона контроллера: предметы подают воронкой спереди, а сталь забирает вагонетка с воронкой прямо под контроллером, на месте нижнего блока постройки. Вся линия занимает 7 × 4 блока и помещается в один чанк.",
    ],
    parts: [
      { title: "Сундук и воронка у коксовой печи", text: "В сундук кладут уголь, воронка подаёт его во входной люк над контроллером печи." },
      { title: "Коксовая печь", text: `Пережигает уголь в кокс за 90 с, домне хватает её с запасом. Заодно даёт ${format(PRODUCTION.cokeOven.creosotePerCoal)} л креозота на уголь: он копится в баке печи на ${format(PRODUCTION.cokeOven.tank)} л, и без слива печь встанет через ${format(creosoteMinutes / PRODUCTION.secondsPerMinute, 1)} ч — его сливают в капсулы или ставят ещё один люк.` },
      { title: "Люк выхода кокса", text: "В дне печи под контроллером, смотрит вниз: раз в секунду выталкивает кокс в трубу под собой." },
      { title: "Трубы", text: "Несут кокс от люка понизу и вверх, к воронке домны." },
      { title: "Сундук и воронка у домны", text: "В сундук кладут железо, сбоку по трубе приходит кокс. Воронка подаёт всё в контроллер домны." },
      { title: "Кирпичная домна", text: "Варит железо с двумя коксами в сталь за 4 минуты." },
      { title: "Вагонетка, воронка и сундук у домны", text: "Вагонетка стоит в домне прямо под контроллером (серая нижняя половина кирпича) и забирает сталь; воронка под ней складывает слитки в сундук рядом." },
      { title: "Кирпичный фундамент", text: "Обе постройки подняты на один блок: под люком печи идёт труба, под вагонеткой домны стоит воронка." },
    ],
    facts: [
      { label: "Слитков в час", value: format(run.perMinute * PRODUCTION.secondsPerMinute) },
      { label: "Кокс", value: `${format(run.cokePerMinute, 2)} в минуту` },
      { label: "Коксовая печь даёт", value: `${format(run.ovenCokePerMinute, 2)} в минуту` },
      { label: "Креозот", value: `${format(run.cokePerMinute * PRODUCTION.cokeOven.creosotePerCoal)} л в минуту` },
      { label: "Энергия", value: "не нужна" },
    ],
    setup: toMachine(faced, STEAM_BASES.steel, {}),
    }],
  };
}

/* ------------------------------------------------------------------ */
/* Сборка линий: люки лицом к своим трубам, кабели и генераторы        */
/* ------------------------------------------------------------------ */

const tierRank = (tier: TierId): number => TIERS.findIndex((candidate) => candidate.id === tier);
const tierTitle = (tier: TierId): string => TIERS.find((candidate) => candidate.id === tier)?.title ?? tier;
const voltageOf = (tier: TierId): number => GAME.voltageTiers[tierRank(tier)].voltage;
/** Числа по-русски: пробел между тысячами, запятая в дробях. */
const format = (value: number, digits = 0): string => value.toLocaleString("ru-RU", { maximumFractionDigits: digits }).replace(/ /g, " ");
const seconds = (ticks: number): string => `${format(ticks / PRODUCTION.ticksPerSecond, 2)} с`;

/** Расстояние между постройками и запас вокруг для поиска пути труб и кабелей. */
const GAP = 3;
const MARGIN = 3;
/** Генераторы и котлы стоят рядом за линией: ряд на столько клеток позади самого заднего блока. */
const BEHIND = 3;

/** Самая сильная постройка из списка (от слабой к сильной), которая уже открыта на ярусе. */
function bestOf(slugs: readonly string[], tier: TierId): Machine {
  const open = slugs.flatMap((slug) => findMachine(slug) ?? []).filter((machine) => tierRank(machine.tier) <= tierRank(tier));
  const best = open.at(-1);
  if (!best) throw new Error(`Для яруса ${tier} нет постройки из списка: ${slugs.join(", ")}`);
  return best;
}

/** Блок для схемы из одноблочной машины сайта: передняя грань — её лицо, остальные — бока. */
export function singleKind(slug: string, label: string): BlockKind {
  const single = findSingle(slug);
  if (!single) throw new Error(`Нет машины ${slug}`);
  return { label, texture: single.faces.front, face: { rule: "front", base: single.faces.side }, top: single.faces.top, bottom: single.faces.bottom };
}

const isKind = (grid: Grid, cell: Vec3, kind: string): boolean => grid.get(keyOf(cell))?.kind === kind;

/**
 * Ряд генераторов (или котлов) за линией и общий кабель (или паропровод) вдоль них; от каждого люка
 * к этому ряду прокладывается свой путь в обход построек. Люк смотрит на начало своего пути.
 * Если задан under (вода для котлов), ряды стоят на блок выше, а под ними идёт эта труба — тоже с общей трубой сбоку.
 * Если задан over (лава), такая же труба идёт поверх рядов; её конец сбоку — вход от источника.
 */
function supplyRow(grid: Grid, hatches: readonly { readonly hatch: Vec3; readonly face: Face }[], count: number, sourceKind: string, sourceFace: Face, conduit: string, under?: string, over?: string, margin = MARGIN): Grid {
  const { min, max } = boxOf([...grid.keys()].map(cellOf));
  const perRow = Math.min(count, PRODUCTION.sourcesPerRow);
  const rows = Math.ceil(count / perRow);
  const left = Math.round((min[0] + max[0]) / [0, 0].length - (perRow - 1) / [0, 0].length);
  const y = under ? 1 : 0;
  // Ряды идут назад через клетку: перед каждым рядом — его общий участок трубы или кабеля.
  const busZ = (index: number) => min[2] - BEHIND + 1 - index * [0, 0].length;
  // Общий участок вдоль ряда: каждый отрезок тянет отросток к своему источнику (side).
  const line = (at: number, z: number, inRow: number, kind: string, side: Face): readonly (readonly [Vec3, Cell])[] =>
    Array.from({ length: inRow }, (_unused, column): readonly [Vec3, Cell] => [
      [left + column, at, z],
      { kind, links: [...(column > 0 ? ["nx" as const] : []), ...(column < inRow - 1 ? ["px" as const] : []), side].sort() },
    ]);
  // Сбоку от рядов — общая труба вдоль них, от неё — отвод к началу каждого ряда.
  const spine = (next: Grid, at: number, zOf: (index: number) => number, kind: string): Grid => {
    if (rows < [0, 0].length) return next;
    const along = Array.from({ length: zOf(0) - zOf(rows - 1) + 1 }, (_unused, step): Vec3 => [left - 1, at, zOf(0) - step]);
    return Array.from({ length: rows }, (_unused, index) => index).reduce((laid, index) => lay(laid, [[left - 1, at, zOf(index)], [left, at, zOf(index)]], kind), lay(next, along, kind));
  };
  let current = grid;
  for (let index = 0; index < rows; index += 1) {
    const inRow = Math.min(perRow, count - index * perRow);
    current = row(current, [left, y, busZ(index) - 1], inRow, sourceKind, sourceFace);
    current = withCells(current, [
      ...line(y, busZ(index), inRow, conduit, "nz"),
      ...(under ? line(0, busZ(index) - 1, inRow, under, "py") : []),
      ...(over ? line(y + 1, busZ(index) - 1, inRow, over, "ny") : []),
    ]);
  }
  current = spine(current, y, busZ, conduit);
  if (under) current = spine(current, 0, (index) => busZ(index) - 1, under);
  if (over) current = spine(lay(current, [[left - 1, y + 1, busZ(0) - 1], [left, y + 1, busZ(0) - 1]], over), y + 1, (index) => busZ(index) - 1, over);
  return hatches.reduce((next, { hatch, face }) => {
    const out = move(hatch, face);
    const goals = [...next.entries()].filter(([, value]) => value.kind === conduit).map(([key]) => cellOf(key));
    return lay(next, route(next, out, goals, margin), conduit, OPPOSITE[face]);
  }, current);
}

/** Все клетки постройки, которые сейчас занимает люк этого вида, с направлением их граней. */
function hatchesOf(grid: Grid, body: readonly Vec3[], kind: string): { readonly hatch: Vec3; readonly face: Face }[] {
  return body.flatMap((cell) => {
    const value = grid.get(keyOf(cell));
    return value?.kind === kind && value.face ? [{ hatch: cell, face: value.face }] : [];
  });
}

/** Ставит на постройку два энергетических люка (свой, если он есть в схеме, плюс недостающие — на стену wall, обычно заднюю). */
export function energyHatches(grid: Grid, body: readonly Vec3[], wall: Face = "nz"): { readonly grid: Grid; readonly hatches: readonly { readonly hatch: Vec3; readonly face: Face }[] } {
  let current = grid;
  for (let index = hatchesOf(current, body, "energy").length; index < PRODUCTION.hatchesPerMachine; index += 1) {
    const used = hatchesOf(current, body, "energy").map(({ hatch }) => keyOf(hatch));
    current = addHatch(current, body, "energy", wall, used).grid;
  }
  return { grid: current, hatches: hatchesOf(current, body, "energy") };
}

/* ------------------------------------------------------------------ */
/* Бронза: паровая плавильня, котлы и паропровод                       */
/* ------------------------------------------------------------------ */

const SMELTER_PARTS = new Set(["bronzeBricks", "glass", "bronzePipe", "smelterController"]);

/** Пар котла в литрах в секунду — из его карточки на сайте («300 л/с», у солнечных — «до 360 л/с», днём и без накипи). */
function steamOf(boiler: Single): number {
  const value = boiler.facts.find((fact) => fact.label === "Пар")?.value ?? "";
  const litres = Number(value.replace(/\D/g, ""));
  if (!litres) throw new Error(`У котла ${boiler.slug} нет выработки пара`);
  return litres;
}

interface SteamPlant {
  readonly grid: Grid;
  readonly count: number;
  readonly perBoiler: number;
  readonly totalSteam: number;
  readonly water: ReturnType<typeof steamWater>;
}

/**
 * Котельная для паровых потребителей: паровая помпа в точке pumpAt даёт воду, котлы стоят рядами на трубе с водой,
 * пар идёт по бронзовым трубам к каждому потребителю (клетка и сторона) и к самой помпе. Котлов — на пар потребителей
 * плюс пар помпы.
 */
function steamPlant(grid: Grid, consumers: readonly { readonly hatch: Vec3; readonly face: Face }[], lineSteam: number, boiler: Single, pumpAt: Vec3): SteamPlant {
  const pumpMachine = findMachine("steam-water-pump");
  if (!pumpMachine) throw new Error("Нет паровой помпы");
  const pump = placeMachine(grid, pumpMachine, pumpAt, KINDS, false);
  const pumpSteam = addHatch(pump.grid, pump.cells, "pumpSteamHatch", "nz");
  const pumpWater = addHatch(pumpSteam.grid, pump.cells, "pumpOutputHatch", "nz", [keyOf(pumpSteam.hatch)]);
  const water = steamWater(lineSteam);
  const totalSteam = lineSteam + water.pumpSteam;
  const perBoiler = steamOf(boiler);
  const count = Math.ceil(totalSteam / perBoiler);
  const isLava = /lava/.test(boiler.slug);
  // Котлы стоят дверцей топки назад, к паропроводу — тылом; под ними — труба с водой от помпы, у лавовых сверху — труба с лавой.
  const piped = supplyRow(pumpWater.grid, [...consumers, { hatch: pumpSteam.hatch, face: "nz" }], count, boiler.slug, "nz", "steamPipe", "waterPipe", isLava ? "lavaPipe" : undefined);
  const waterGoals = [...piped.entries()].filter(([, value]) => value.kind === "waterPipe").map(([key]) => cellOf(key));
  return { grid: lay(piped, route(piped, pumpWater.out, waterGoals, MARGIN), "waterPipe", "pz"), count, perBoiler, totalSteam, water };
}

function bronzeMaterial(): Material {
  const run = bronzeRun();
  const base = STEAM_BASES.bronze;
  const placed = placeMachine(new Map(), base, [0, 0, 0], KINDS, false);
  const body = placed.cells.filter((cell) => SMELTER_PARTS.has(placed.grid.get(keyOf(cell))?.kind ?? ""));
  const steam = addHatch(placed.grid, body, "steamHatch", "nz");
  const water = steamWater(run.steamPerSecond);
  const totalSteam = run.steamPerSecond + water.pumpSteam;
  const boilers = SINGLES.filter((single) => single.group === "boiler" && single.tier === "steam");
  const options = boilers.map((boiler): LineOption => {
    // Помпа стоит справа от плавильни; паровой люк и люк с водой — на её задней стене, к котлам.
    const { grid, count, perBoiler } = steamPlant(steam.grid, [{ hatch: steam.hatch, face: "nz" }], run.steamPerSecond, boiler, [boxOf(body).max[0] + GAP, 0, 0]);
    const isSolar = /solar/.test(boiler.slug);
    const isLava = /lava/.test(boiler.slug);
    const fuelText = isSolar
      ? "Топливо не нужно, воду даёт помпа."
      : isLava
        ? `Лава приходит по стальной трубе поверх котлов: котёл сам берёт её сверху. Каждый тратит ${PRODUCTION.lavaPerBoiler} л лавы в секунду, все вместе — ${format(count * PRODUCTION.lavaPerBoiler)} л/с. Свободный конец трубы сбоку — вход от вашего бака или насоса с лавой. Остывшая лава становится обсидианом: его надо изредка вынимать, иначе котёл встанет.`
        : "В GTNH малые котлы нельзя кормить воронкой или трубой — это выключено в настройках сборки (allowSmallBoilerAutomation=false). Уголь кладут руками в дверцу топки: она смотрит назад, к проходу за котлами.";
    const fuel = boiler.facts.find((fact) => fact.label === "Топливо")?.value ?? "";
    return {
      id: boiler.slug,
      label: `${boiler.title}: ${count} шт.`,
      group: "Паровая плавильня сплавов",
      via: isSolar ? "солнце, топливо не нужно" : isLava ? `лава по трубе, ${format(count * PRODUCTION.lavaPerBoiler)} л/с` : "уголь, руками",
      story: [
        "Бронза — первый главный металл: из неё сделаны все паровые машины. Быстрее всего её плавит паровая плавильня сплавов — большая постройка, которая ведёт сразу восемь рецептов: три меди и одно олово дают четыре бронзы.",
        `За цикл в ${seconds(run.ticks)} выходит ${PRODUCTION.bronze.out * PRODUCTION.bronze.parallel} слитков — ${format(run.perMinute)} в минуту. Пара на это уходит ${format(run.steamPerSecond)} л в секунду: восемь рецептов по 15 EU/t, бронзовый ярус постройки тратит на четверть больше, а литр пара — это 1 EU.`,
        `Котлам нужна вода: литр на 160 л пара. Её качает паровая помпа на бронзовых рамах: на равнине — ${format(water.pumpWater)} л/с, а котлам надо ${format(water.water, 1)} л/с. Когда её люк полон, помпа стоит и пар не берёт, поэтому работает она примерно одну секунду из ${format(1 / water.busy)} и тратит в среднем ${format(water.pumpSteam, 1)} л/с пара. Всего котлам надо дать ${format(totalSteam, 1)} л/с.`,
        `${boiler.title} даёт ${boiler.facts.find((fact) => fact.label === "Пар")?.value}, поэтому их нужно ${count} — вместе ${format(count * perBoiler)} л/с.${isSolar ? " Солнечный котёл работает только днём и со временем зарастает накипью: ночью и с накипью пара меньше, и плавильня будет стоять." : ` Топливо: ${fuel}.`} Котлы стоят за плавильней на медной трубе с водой, пар идёт по бронзовым трубам в паровые люки плавильни и помпы.`,
      ],
      parts: [
        { title: "Сундуки сверху", text: "В один кладут медь, в другой олово. На три меди нужно одно олово." },
        { title: "Воронки под сундуками", text: "Спускают металл во входные шины в крыше плавильни." },
        { title: "Паровая плавильня сплавов", text: "Плавит медь с оловом в бронзу, восемь рецептов разом." },
        { title: "Паровой люк", text: "На задней стене плавильни, лицом к паропроводу." },
        { title: "Бронзовые трубы с паром", text: "Общая труба вдоль котлов и отводы от неё к паровым люкам плавильни и помпы. Пар горячий: деревянные трубы для него не годятся." },
        { title: `${boiler.title}: ${count} шт.`, text: `По ${format(perBoiler)} л/с${isSolar ? " в ясный день" : ""}. ${isSolar ? "" : `Топливо: ${fuel}; воду даёт помпа.`}` },
        ...(isSolar ? [] : [{ title: isLava ? "Стальная труба с лавой" : "Подача угля", text: fuelText }]),
        { title: "Паровая помпа", text: `Справа от плавильни. ${format(water.pumpWater)} л/с воды на равнине: в болоте больше, в пустыне — только 250. Паровой люк и люк с водой — на задней стене.` },
        { title: "Медные трубы с водой", text: "От люка помпы к трубе под котлами: каждый котёл стоит на ней и берёт воду снизу." },
        { title: "Воронка и сундук снизу", text: "Воронка забирает слитки из выходной шины в полу и складывает их в сундук." },
        { title: "Кирпичные столбики", text: "Опоры по углам, чтобы под постройкой было место для воронки." },
      ],
      facts: [
        { label: "Слитков в минуту", value: format(run.perMinute) },
        { label: "Пар нужен", value: `${format(run.steamPerSecond)} л/с` },
        { label: "Пар с помпой", value: `${format(totalSteam, 1)} л/с` },
        { label: "Котлы дают", value: `${count} × ${format(perBoiler)} л/с` },
        { label: "Вода", value: `${format(water.water, 1)} из ${format(water.pumpWater)} л/с помпы` },
        ...(isLava ? [{ label: "Лава", value: `${format(count * PRODUCTION.lavaPerBoiler)} л/с` }] : []),
        ...(!isSolar && !isLava ? [{ label: "Топливо", value: "руками" }] : []),
        { label: "Цикл", value: `${seconds(run.ticks)}, 8 рецептов` },
      ],
      setup: toMachine(grid, { ...base, slug: `${base.slug}--${boiler.slug}`, summary: `Паровая плавильня сплавов на котлах: ${boiler.title.toLowerCase()}.` }, { [boiler.slug]: singleKind(boiler.slug, boiler.title) }),
    };
  });
  return {
    slug: "bronze",
    title: "Бронза",
    tier: "steam",
    summary: `Паровая плавильня сплавов: ${format(run.perMinute)} слитков бронзы в минуту на ${format(run.steamPerSecond)} л пара в секунду.`,
    // Первым — котёл высокого давления на угле: самый ходовой в паровой эре.
    options: [...options.filter((option) => option.id === "hp-coal-boiler"), ...options.filter((option) => option.id !== "hp-coal-boiler")],
  };
}

/* ------------------------------------------------------------------ */
/* LV и выше: печь, морозильник, генераторы, кабели и трубы            */
/* ------------------------------------------------------------------ */

type RecipeId = keyof typeof PRODUCTION.recipes;

interface Smelt {
  readonly slug: string;
  readonly title: string;
  readonly tier: TierId;
  readonly recipe: RecipeId;
  /** Из чего плавят — одной фразой; только то, что известно точно. */
  readonly source: string;
  /** Показать подготовку сырья (дробилка, электролизёры) и вкладку с кирпичными домнами — только у стали LV. */
  readonly withPrep?: boolean;
}

const SMELTS: readonly Smelt[] = [
  { slug: "steel-ebf", title: "Сталь", tier: "lv", recipe: "steel", source: "В печь идут железная пыль и углерод (годится угольная пыль) и подаётся кислород (мод-ядро: самый быстрый рецепт стали для LV, 25 с).", withPrep: true },
  { slug: "aluminium", title: "Алюминий", tier: "mv", recipe: "aluminium", source: "В печь идёт алюминиевая пыль (60 с; с защитным газом быстрее)." },
  { slug: "stainless-steel", title: "Нержавеющая сталь", tier: "hv", recipe: "stainless", source: "Пыль заранее мешают в смесителе: железо, никель, марганец и хром; в печи нужен кислород (60 с)." },
  { slug: "titanium", title: "Титан", tier: "ev", recipe: "titanium", source: "В печь идут магний и тетрахлорид титана из химического реактора — это процесс Кролля (40 с); заодно выходит хлорид магния, из него магний возвращают." },
  { slug: "tungstensteel", title: "Вольфрамовая сталь", tier: "iv", recipe: "tungstensteel", source: "Пыль мешают из вольфрама и стали поровну (125 с)." },
  { slug: "rhodium-plated-palladium", title: "Палладий с родиевым покрытием", tier: "luv", recipe: "rhodiumPalladium", source: "Пыль из трёх палладия и одного родия; плавка долгая — 450 с." },
  { slug: "iridium", title: "Иридий", tier: "zpm", recipe: "iridium", source: "Иридиевая пыль с платиновой линии переработки руд (50 с)." },
  { slug: "osmium", title: "Осмий", tier: "uv", recipe: "osmium", source: "Осмиевая пыль с платиновой линии переработки руд (50 с)." },
];

/** Кабель яруса — из материала корпуса машины, ампер на 1x — из мода. Первым на переключателе — этот генератор. */
const POWER: Readonly<Record<string, { readonly firstGenerator: string; readonly cable: string; readonly cableAmps: number }>> = {
  lv: { firstGenerator: "combustion-generator-lv", cable: "cableLv", cableAmps: PRODUCTION.cableAmps.lv },
  mv: { firstGenerator: "combustion-generator-mv", cable: "cableMv", cableAmps: PRODUCTION.cableAmps.mv },
  hv: { firstGenerator: "combustion-generator-hv", cable: "cableHv", cableAmps: PRODUCTION.cableAmps.hv },
  ev: { firstGenerator: "combustion-generator-ev", cable: "cableEv", cableAmps: PRODUCTION.cableAmps.ev },
  iv: { firstGenerator: "combustion-generator-iv", cable: "cableIv", cableAmps: PRODUCTION.cableAmps.iv },
  luv: { firstGenerator: "naquadah-reactor-luv", cable: "cableLuv", cableAmps: PRODUCTION.cableAmps.luv },
  zpm: { firstGenerator: "naquadah-reactor-zpm", cable: "cableZpm", cableAmps: PRODUCTION.cableAmps.zpm },
  uv: { firstGenerator: "naquadah-reactor-uv", cable: "cableUv", cableAmps: PRODUCTION.cableAmps.uv },
};

/** Генераторы яруса с сайта: первым — привычный для яруса, остальные — в порядке каталога. */
export function generatorsOf(tier: TierId): readonly Single[] {
  const all = SINGLES.filter((single) => single.group === "generator" && single.tier === tier);
  const first = POWER[tier].firstGenerator;
  return [...all.filter((single) => single.slug === first), ...all.filter((single) => single.slug !== first)];
}

export interface Energy {
  readonly grid: Grid;
  /** Сколько генераторов стоит в линии. */
  readonly generators: number;
  readonly facts: readonly Fact[];
  readonly parts: readonly { readonly title: string; readonly text: string }[];
  readonly extraKinds: Readonly<Record<string, BlockKind>>;
}

/** Генераторы яруса на среднее потребление и кабели от них к каждому энергетическому люку. */
/** margin — запас вокруг построек для поиска пути кабелей; большой фабрике калькулятора нужен шире. */
export function powerFor(grid: Grid, hatches: readonly { readonly hatch: Vec3; readonly face: Face }[], tier: TierId, average: number, generatorSlug: string, margin = MARGIN): Energy {
  const power = POWER[tier];
  const voltage = voltageOf(tier);
  const supply = powerSupply(average, voltage, power.cableAmps);
  const generator = findSingle(generatorSlug);
  const name = `${generator?.title ?? generatorSlug} ${tierTitle(tier)}`;
  const fuel = generator?.facts.find((fact) => /Топливо|Работает на|Ест/.test(fact.label));
  const cable = KINDS[power.cable as keyof typeof KINDS].label;
  return {
    grid: supplyRow(grid, hatches, supply.generators, generatorSlug, "pz", power.cable, undefined, undefined, margin),
    generators: supply.generators,
    facts: [
      { label: "Энергия", value: `${format(average)} EU/t` },
      { label: "Генераторы", value: `${supply.generators} × ${format(voltage)} EU/t` },
      { label: "Кабель", value: `${cable} ${supply.cableSize}x` },
    ],
    parts: [
      { title: `Генераторы: ${supply.generators} × ${name}`, text: `Каждый выдаёт ${format(voltage)} EU/t (1 А), вместе — ${format(supply.generators * voltage)} EU/t: это покрывает среднее потребление линии ${format(average)} EU/t. ${fuel ? ` ${fuel.label}: ${fuel.value}.` : ""} Подача топлива здесь не показана.` },
      { title: `${cable} ${supply.cableSize}x`, text: `Один такой кабель держит ${power.cableAmps} А, толщина ${supply.cableSize}x — ${power.cableAmps * supply.cableSize} А: хватает на ток всех генераторов. Общий кабель идёт вдоль генераторов, от него — отвод к каждому энергетическому люку.` },
    ],
    extraKinds: { [generatorSlug]: singleKind(generatorSlug, name) },
  };
}

/* Сталь LV: дробилка, электролизёры и насос перед печью; вкладка с кирпичными домнами на ту же выработку. */

interface Prep {
  readonly grid: Grid;
  /** Машины, которым тоже нужен кабель: клетка и сторона, к которой он подходит. */
  readonly consumers: readonly { readonly hatch: Vec3; readonly face: Face }[];
  readonly averageEut: number;
  readonly parts: readonly { readonly title: string; readonly text: string }[];
  readonly facts: readonly Fact[];
  readonly extraKinds: Readonly<Record<string, BlockKind>>;
}

/**
 * Перед печью стали: сундук со слитками железа и углём → воронка → дробилка, которая отдаёт пыль прямо во входную шину;
 * ряд электролизёров спереди гонит кислород по трубе во входной люк печи, воду им сверху даёт насос.
 */
function steelPrep(grid: Grid, body: readonly Vec3[], inputOut: Vec3, perMinute: number): Prep {
  const prep = steelPrepRun(perMinute);
  const box = boxOf(body);
  const rowZ = box.max[2] + GAP;
  const columns = Array.from({ length: prep.electrolyzers }, (_unused, index) => box.min[0] + index);
  const oxygenLine = columns.map((x): Vec3 => [x, 0, rowZ - 1]);
  let next = withCells(grid, [
    [inputOut, { kind: "macerator-lv", face: "px" }],
    [move(inputOut, "py"), { kind: "ownHopper", links: ["ny"] }],
    [move(inputOut, "py", [0, 0].length), { kind: "ownChest", face: "pz" }],
    ...columns.map((x): readonly [Vec3, Cell] => [[x, 0, rowZ], { kind: "electrolyzer-lv", face: "nz" }]),
    [[box.min[0] - 1, 1, rowZ], { kind: "pump-lv", face: "px" }],
  ]);
  // Вода — поверх электролизёров от насоса, кислород — общая труба перед ними; каждый отрезок ещё и отросток к машине.
  const waterLine = columns.map((x): Vec3 => [x, 1, rowZ]);
  next = withLink(lay(next, waterLine, "waterPipe", "nx"), waterLine, "ny");
  next = withLink(lay(next, oxygenLine, "oxygenPipe"), oxygenLine, "pz");
  const hatch = hatchesOf(next, body, "inputHatch")[0];
  if (!hatch) throw new Error("У печи нет входного люка для кислорода");
  const hatchOut = move(hatch.hatch, hatch.face);
  next = lay(next, route(next, hatchOut, oxygenLine, MARGIN), "oxygenPipe", OPPOSITE[hatch.face]);
  const electrolyzer = findSingle("electrolyzer-lv");
  const macerator = findSingle("macerator-lv");
  const pump = findSingle("pump-lv");
  if (!electrolyzer || !macerator || !pump) throw new Error("Нет одноблочных машин LV для подготовки стали");
  const p = PRODUCTION.steelPrep;
  return {
    grid: next,
    consumers: [{ hatch: inputOut, face: "nx" }, ...columns.map((x) => ({ hatch: [x, 0, rowZ] as Vec3, face: "pz" as const })), { hatch: [box.min[0] - 1, 1, rowZ], face: "nx" }],
    averageEut: prep.averageEut,
    parts: [
      { title: "Сундук, воронка и дробилка", text: `В сундук кладут слитки железа и уголь. Дробилка LV мелет слиток за ${seconds(p.ingotTicks)}, уголь — за ${seconds(p.coalTicks)} и сама отдаёт пыль во входную шину печи: на слиток стали она работает ${format(prep.maceratorBusy * PRODUCTION.secondsPerMinute / perMinute, 1)} с из каждых ${format(PRODUCTION.secondsPerMinute / perMinute)}. Паровая дробилка мелет быстрее, но ей нужны котлы, а скорость здесь не нужна — одной LV хватает. Угольная пыль годится печи как углерод.` },
      { title: `Электролизёры: ${prep.electrolyzers} × LV`, text: `Каждый разлагает 1000 л воды за ${seconds(p.electrolyzerTicks)} на ${format(p.oxygenPerRun)} л кислорода и водород в двух капсулах (схема 3). Печи нужно ${format(p.oxygenPerSteel)} л кислорода на слиток, поэтому их ${prep.electrolyzers}, и все работают без остановки. Кислород выходит из передней грани в общую трубу.` },
      { title: "Капсулы", text: `Пустые капсулы кладут в электролизёр руками: стопки из ${p.stack} хватает на ${format(prep.stackMinutes)} минуты; столько же копится капсул с водородом. Водород можно сжечь в газовой турбине. Подача капсул трубами здесь не показана.` },
      { title: "Труба с кислородом", text: "Идёт вдоль электролизёров и в обход печи — во входной люк на её задней стене." },
      { title: "Насос LV и медная труба с водой", text: `Насос ставят над большим водоёмом: он поднимает блок воды за ${seconds(p.pumpTicksPerBlock)} — до ${format(prep.pumpPerSecond)} л/с, а электролизёрам нужно ${format(prep.waterPerSecond)} л/с. Вода идёт по трубе поверх электролизёров, каждый берёт её сверху.` },
    ],
    facts: [
      { label: "Электролизёры", value: `${prep.electrolyzers} × ${format(p.electrolyzerEut)} EU/t` },
      { label: "Вода", value: `${format(prep.waterPerSecond)} л/с` },
    ],
    extraKinds: {
      "macerator-lv": singleKind(macerator.slug, `${macerator.title} LV`),
      "electrolyzer-lv": singleKind(electrolyzer.slug, `${electrolyzer.title} LV`),
      "pump-lv": singleKind(pump.slug, `${pump.title} LV`),
    },
  };
}

/** Ряд одинаковых построек 3 × 3 в плане, которые делят боковые стены (в моде так можно): схема одной → схема ряда. */
export function sharedRow(unit: readonly (readonly string[])[], count: number): string[][] {
  return unit.map((rows) => rows.map((row) => Array.from({ length: count * [0, 0].length + 1 }, (_unused, k) => (k % [0, 0].length ? row[1] : row[0])).join("")));
}

/** Добавляет трубам в этих клетках отросток в сторону side — к люку или машине рядом. */
export function withLink(laid: Grid, cells: readonly Vec3[], side: Face): Grid {
  return withCells(laid, cells.map((cell): readonly [Vec3, Cell] => [cell, { kind: laid.get(keyOf(cell))?.kind ?? "", links: [...new Set([...(laid.get(keyOf(cell))?.links ?? []), side])].sort() }]));
}

/** Коксовая печь с люками: вход угля сверху, выход кокса и креозота — в задней стене. */
export const COKE_UNIT = [
  ["CCC", "CiC", "CCC"],
  ["C~C", "C-C", "CoC"],
  ["CCC", "CCC", "CfC"],
];

/**
 * Кирпичные домны на коксе, которые догоняют электрическую печь (perMinute слитков в минуту). Число домн, коксовых печей,
 * угля и креозота — из рецептов (bbfFarmRun). Коксовые печи — через свои люки: уголь по трубе сверху, кокс и креозот —
 * по трубам сзади. Домны — как в паровой линии: воронка в контроллер спереди (железо из сундука над ней, кокс по трубе),
 * сталь забирает вагонетка под контроллером, воронка под ней отдаёт в общую трубу до сундука.
 */
function bbfFarm(perMinute: number): LineOption {
  const farm = bbfFarmRun(perMinute);
  const one = steamSteelRun();
  const bbf = findMachine("bricked-blast-furnace");
  const oven = findMachine("coke-oven");
  if (!bbf || !oven) throw new Error("Нет кирпичной домны или коксовой печи");
  const row = (machine: Machine, layers: string[][], kinds: Readonly<Record<string, KindId>>, slug: string): Machine => ({ ...machine, slug, def: { ...machine.def, layers, kinds: { ...machine.def.kinds, ...kinds } } });
  const ovens = row(oven, sharedRow(COKE_UNIT, farm.ovens), { i: "cokeHatchIn", o: "cokeHatchItems", f: "cokeHatchFluid" }, "coke-oven-row");
  const furnaces = row(bbf, sharedRow(bbf.def.layers, farm.furnaces), {}, "bbf-row");
  // Коксовые печи сзади, домны — перед ними через проход в два блока, лицом от печей, на кирпичном фундаменте.
  const ovenDepth = COKE_UNIT[0].length;
  const front = ovenDepth + [0, 0].length;
  let grid = placeMachine(new Map(), ovens, [0, 0, 0], KINDS, true).grid;
  grid = placeMachine(grid, furnaces, [0, 1, front], KINDS, true).grid;
  const width = farm.furnaces * [0, 0].length + 1;
  const furnaceCenters = Array.from({ length: farm.furnaces }, (_unused, index) => index * [0, 0].length + 1);
  grid = withCells(grid, [
    ...Array.from({ length: width * ovenDepth }, (_unused, index): readonly [Vec3, Cell] => [[index % width, 0, front - Math.floor(index / width)], { kind: "ownBricks" }]),
    ...furnaceCenters.flatMap((x): (readonly [Vec3, Cell])[] => [
      // Вагонетка — в самой домне под контроллером, воронка под ней; спереди — воронка в контроллер и сундук железа над ней.
      [[x, 1, front], { kind: "firebrickCart" }],
      [[x, 0, front], { kind: "ownHopperFront" }],
      [[x, [0, 0].length, front + 1], { kind: "ownHopperBack" }],
      [[x, [0, 0, 0].length, front + 1], { kind: "ownChest", face: "pz" }],
    ]),
  ]);
  // Сталь: воронки под вагонетками отдают в трубу перед фундаментом, она ведёт в сундук на конце ряда.
  const steelLine = Array.from({ length: width }, (_unused, x): Vec3 => [x, 0, front + 1]);
  grid = withLink(lay(grid, steelLine, "itemPipe", undefined, "px"), furnaceCenters.map((x): Vec3 => [x, 0, front + 1]), "nz");
  grid = withCells(grid, [[[width, 0, front + 1], { kind: "ownChest", face: "pz" }]]);
  // Кокс к домнам: труба перед воронками, отростки в каждую воронку.
  const cokeFeed = Array.from({ length: width }, (_unused, x): Vec3 => [x, [0, 0].length, front + [0, 0].length]);
  grid = withLink(lay(grid, cokeFeed, "itemPipe"), furnaceCenters.map((x): Vec3 => [x, [0, 0].length, front + [0, 0].length]), "nz");
  const centers = Array.from({ length: farm.ovens }, (_unused, index) => index * [0, 0].length + 1);
  const last = farm.ovens * [0, 0].length;
  const top = COKE_UNIT.length;
  const back = -ovenDepth;
  // Уголь: сундук → воронка → труба поверх печей, отростки вниз во входные люки.
  const coalLine = Array.from({ length: last }, (_unused, x): Vec3 => [x, top, -1]);
  grid = withCells(grid, [
    [[-1, top, -1], { kind: "ownHopperRight" }],
    [[-1, top + 1, -1], { kind: "ownChest", face: "pz" }],
  ]);
  grid = withLink(lay(grid, coalLine, "itemPipe", "nx"), centers.map((x): Vec3 => [x, top, -1]), "ny");
  // Кокс: труба за печами, от её конца — в обход ряда домн к трубе перед воронками; креозот: труба ниже, её конец — к своему баку.
  const cokeLine = Array.from({ length: last }, (_unused, index): Vec3 => [index + 1, 1, back]);
  grid = withLink(lay(grid, cokeLine, "itemPipe", undefined, "px"), centers.map((x): Vec3 => [x, 1, back]), "pz");
  grid = lay(grid, route(grid, [last + 1, 1, back], cokeFeed, MARGIN), "itemPipe", "nx");
  const creosoteLine = Array.from({ length: last + 1 }, (_unused, index): Vec3 => [index + 1, 0, back]);
  grid = withLink(lay(grid, creosoteLine, "creosotePipe", undefined, "px"), centers.map((x): Vec3 => [x, 0, back]), "pz");
  const thousand = 1000;
  const ebfEnergy = Math.round(((PRODUCTION.recipes.steel.eut + steelPrepRun(perMinute).averageEut) * PRODUCTION.recipes.steel.ticks) / thousand) * thousand;
  const hours = (minutes: number) => `${format(minutes / PRODUCTION.secondsPerMinute, 1)} ч`;
  const percent = (share: number) => `${format(share * 100)} %`;
  return {
    id: "coke",
    label: `Кирпичные домны: ${farm.furnaces} шт.`,
    group: "Без электричества",
    via: `кокс из ${farm.ovens} коксовых печей`,
    story: [
      `Та же выработка без электричества. Кирпичная домна плавит слиток железа с двумя коксами за 4 минуты — ${format(one.perMinute, 2)} слитка в минуту. Чтобы догнать электрическую печь (${format(perMinute, 1)} в минуту), нужно ${farm.furnaces} домн — вместе ${format(farm.steelPerMinute, 1)} в минуту.`,
      `Им нужно ${format(farm.cokePerMinute, 1)} кокса в минуту. Коксовая печь делает кокс из угля за 90 с — ${format(one.ovenCokePerMinute, 2)} в минуту, поэтому печей ${farm.ovens}: они заняты на ${percent(farm.ovenBusy)}. Угля уходит ${format(farm.coalPerMinute, 1)} в минуту, железа — ${format(farm.steelPerMinute, 1)}.`,
      `По ресурсам это выгоднее электрической печи: на слиток — железо и 2 угля, ни одного EU. Электрической печи с подготовкой нужны железо, 1 уголь, ${format(PRODUCTION.steelPrep.oxygenPerSteel)} л воды и около ${format(ebfEnergy)} EU, которые генераторы получают из топлива. Зато ферма намного больше.`,
      `Домны работают как в паровой линии: воронка подаёт в контроллер спереди железо из сундука над ней и кокс, который приходит по трубе от печей; сталь забирает вагонетка с воронкой прямо под контроллером, на месте нижнего блока, и по трубе всё сходится в один сундук. Руки нужны только на сундуки: полного сундука железа у домны хватает на ${hours(farm.ironChestMinutes)}, сундука угля у печей — на ${hours(farm.coalChestMinutes)}.`,
      `Коксовые печи, наоборот, работают сами — через свои люки на месте кирпича. Печи и домны можно ставить стенка к стенке, так ряд короче. Каждая печь копит креозот: ${format(PRODUCTION.cokeOven.creosotePerCoal)} л на уголь, вместе ${format(farm.creosotePerMinute)} л в минуту; без слива печь встанет через ${hours(farm.ovenTankMinutes)}, когда наполнится её бак на ${format(PRODUCTION.cokeOven.tank)} л.`,
    ],
    parts: [
      { title: "Сундук угля, воронка и труба поверх печей", text: `Уголь идёт по латунной трубе во входные люки сверху каждой печи — ${format(farm.coalPerMinute, 1)} в минуту на все.` },
      { title: `Коксовые печи: ${farm.ovens} шт. стенка к стенке`, text: "Каждая пережигает уголь в кокс за 90 с. Люк сверху — вход угля, в задней стене — выход кокса (выше) и креозота (у пола)." },
      { title: "Труба кокса", text: `Люки выхода раз в секунду выталкивают кокс в трубу за печами; она огибает ряд и идёт перед воронками домн — ${format(farm.cokePerMinute, 1)} кокса в минуту, по ${format(one.cokePerMinute, 1)} на домну.` },
      { title: "Медная труба с креозотом", text: `${format(farm.creosotePerMinute)} л в минуту. Её свободный конец подключают к своему баку.` },
      { title: "Сундуки железа и воронки", text: `Перед каждой домной: сундук железа сверху, воронка под ним подаёт железо и кокс в контроллер. Сундука хватает на ${hours(farm.ironChestMinutes)}.` },
      { title: `Кирпичные домны: ${farm.furnaces} шт. стенка к стенке`, text: "Перед печами через проход в два блока, лицом от них, на кирпичном фундаменте. Под каждым контроллером — вагонетка с воронкой (серая нижняя половина кирпича)." },
      { title: "Труба стали и сундук", text: `Воронки под вагонетками отдают сталь в трубу перед фундаментом, она несёт её в сундук на конце ряда — ${format(farm.steelPerMinute, 1)} в минуту.` },
    ],
    facts: [
      { label: "Слитков в минуту", value: format(farm.steelPerMinute, 1) },
      { label: "Кирпичных домн", value: String(farm.furnaces) },
      { label: "Коксовых печей", value: `${farm.ovens}, заняты на ${percent(farm.ovenBusy)}` },
      { label: "Уголь", value: `${format(farm.coalPerMinute, 1)} в минуту` },
      { label: "Железо", value: `${format(farm.steelPerMinute, 1)} в минуту` },
      { label: "Креозот", value: `${format(farm.creosotePerMinute)} л в минуту` },
      { label: "Сундук угля", value: `на ${hours(farm.coalChestMinutes)}` },
      { label: "Энергия", value: "не нужна" },
    ],
    setup: toMachine(grid, { ...STEAM_BASES.steel, slug: "setup-steel-ebf--bbf", title: "Линия: сталь в кирпичных домнах", tier: "lv", summary: `${farm.furnaces} кирпичных домн и ${farm.ovens} коксовых печей.` }, {}),
  };
}

/**
 * Пар для паровых турбин LV: турбина берёт (6 + ярус) литров пара на 3 EU, котлы — угольные высокого давления (кормят руками,
 * воронки к малым котлам в GTNH выключены), вода — от паровой помпы. Пар идёт к задней стороне каждой турбины:
 * спереди у неё выход энергии.
 */
function turbineSteam(energy: Energy, generatorSlug: string, tier: TierId, average: number): Omit<Prep, "consumers" | "averageEut"> {
  const turbines = [...energy.grid.entries()].filter(([, value]) => value.kind === generatorSlug).map(([key]) => ({ hatch: cellOf(key), face: "nz" as const }));
  const { litresBase, euPerOperation } = PRODUCTION.steamTurbine;
  const litresPerEu = (litresBase + tierRank(tier)) / euPerOperation;
  const steam = average * PRODUCTION.ticksPerSecond * litresPerEu;
  const boiler = findSingle("hp-coal-boiler");
  if (!boiler) throw new Error("Нет угольного котла высокого давления");
  const box = boxOf([...energy.grid.keys()].map(cellOf));
  const plant = steamPlant(energy.grid, turbines, steam, boiler, [box.max[0] + GAP, 0, box.max[2]]);
  const coalPerMinute = (plant.count * PRODUCTION.secondsPerMinute) / PRODUCTION.hpCoalBoilerSecondsPerCoal;
  const stackHours = (PRODUCTION.bbf.stack * PRODUCTION.hpCoalBoilerSecondsPerCoal) / PRODUCTION.secondsPerMinute / PRODUCTION.secondsPerMinute;
  return {
    grid: plant.grid,
    parts: [
      { title: "Пар для турбин", text: `Турбина ${tierTitle(tier)} берёт ${litresBase + tierRank(tier)} л пара на ${euPerOperation} EU — ${format(litresPerEu, 2)} л на 1 EU. Линия тянет в среднем ${format(average)} EU/t, это ${format(steam)} л пара в секунду, с паром помпы — ${format(plant.totalSteam)}.` },
      { title: `${boiler.title}: ${plant.count} шт.`, text: `По ${format(plant.perBoiler)} л/с. Ряды по ${PRODUCTION.sourcesPerRow} за турбинами, паропровод — к задней стороне каждой турбины (спереди у неё выход энергии). Уголь кладут руками: в GTNH малые котлы не берут топливо воронкой. Раскалённый котёл сжигает уголь за ${PRODUCTION.hpCoalBoilerSecondsPerCoal} с — стопки хватает на ${format(stackHours, 1)} ч; все котлы вместе — ${format(coalPerMinute, 1)} угля в минуту.` },
      { title: "Паровая помпа и медные трубы с водой", text: `Справа от линии. Котлам нужно ${format(plant.water.water, 1)} л воды в секунду, помпа на равнине даёт ${format(plant.water.pumpWater)} — работает одну секунду из ${format(1 / plant.water.busy)}. Вода идёт по трубе под котлами.` },
    ],
    facts: [
      { label: "Пар", value: `${format(plant.totalSteam)} л/с` },
      { label: "Котлы", value: `${plant.count} × ${format(plant.perBoiler)} л/с` },
      { label: "Уголь в котлы", value: `${format(coalPerMinute, 1)} в минуту` },
    ],
    extraKinds: { [boiler.slug]: singleKind(boiler.slug, boiler.title) },
  };
}

/* ------------------------------------------------------------------ */
/* Топливо для дизельного генератора и газовой турбины LV              */
/* ------------------------------------------------------------------ */

/** Одноблочная машина LV, которой нет в каталоге сайта: грани из её текстур, верх и низ — корпус LV. */
function lvKind(id: string, label: string, top = `single-lv-${id}-top`): BlockKind {
  return { label, texture: `single-lv-${id}`, face: { rule: "front", base: `single-lv-${id}-side` }, top, bottom: "hull-lv-bottom" };
}

const FUEL_KINDS: Readonly<Record<FuelStage["id"], { readonly kind: string; readonly block: () => BlockKind; readonly title: string }>> = {
  compressor: { kind: "compressor-lv", block: () => singleKind("compressor-lv", "Компрессор LV"), title: "Компрессор" },
  // Свой вид блока: дробилка подготовки стали (macerator-lv) — отдельная машина.
  macerator: { kind: "plant-macerator-lv", block: () => singleKind("macerator-lv", "Дробилка LV"), title: "Дробилка" },
  centrifuge: { kind: "centrifuge-lv", block: () => singleKind("centrifuge-lv", "Центрифуга LV"), title: "Центрифуга" },
  brewery: { kind: "brewery-lv", block:() => lvKind("brewery", "Пивоварня LV", "hull-lv-top"), title: "Пивоварня" },
  fermenter: { kind: "fermenter-lv", block: () => singleKind("fermenter-lv", "Ферментер LV"), title: "Ферментеры" },
  distillery: { kind: "distillery-lv", block: () => singleKind("distillery-lv", "Дистиллятор LV"), title: "Дистилляторы" },
  extractor: { kind: "fluid-extractor-lv", block: () => singleKind("fluid-extractor-lv", "Экстрактор жидкостей LV"), title: "Экстракторы жидкостей" },
  canner: { kind: "fluid-canner-lv", block: () => lvKind("fluid-canner", "Консервный автомат для жидкостей LV"), title: "Консервный автомат для жидкостей" },
  reactor: { kind: "chemical-reactor-lv", block: () => singleKind("chemical-reactor-lv", "Химический реактор LV"), title: "Химический реактор" },
};

export interface Row {
  readonly cells: readonly Vec3[];
  /** Труба сверху (вход жидкости), впереди (выход), сзади (вход предметов). */
  readonly top: readonly Vec3[];
  readonly front: readonly Vec3[];
  readonly back: readonly Vec3[];
}

/** Ряд одинаковых машин на высоте 1 блок, лицом вперёд; под каждой — место для кабеля. */
export function rowAt(x: number, z: number, count: number): Row {
  const xs = Array.from({ length: count }, (_unused, index) => x + index);
  return {
    cells: xs.map((cx): Vec3 => [cx, 1, z]),
    top: xs.map((cx): Vec3 => [cx, [0, 0].length, z]),
    front: xs.map((cx): Vec3 => [cx, 1, z + 1]),
    back: xs.map((cx): Vec3 => [cx, 1, z - 1]),
  };
}

/** Труба вдоль ряда с отростком к каждой машине. */
export function rowPipe(grid: Grid, cells: readonly Vec3[], kind: string, side: Face, startLink?: Face): Grid {
  return withLink(lay(grid, cells, kind, startLink), cells, side);
}

/** Соединяет конец трубы from (её последнюю клетку) с клетками goals той же трубой в обход всего, что уже стоит. */
export function joinPipe(grid: Grid, from: readonly Vec3[], goals: readonly Vec3[], kind: string): Grid {
  const end = from[from.length - 1];
  const start = move(end, "px");
  const linked = withLink(grid, [end], "px");
  return lay(linked, route(linked, start, goals, MARGIN), kind, "nx");
}

interface FuelPlant {
  readonly grid: Grid;
  readonly consumers: readonly { readonly hatch: Vec3; readonly face: Face }[];
  /** Вид трубы с готовым топливом: от неё — отводы к генераторам. */
  readonly fuelPipe: string;
  readonly parts: readonly { readonly title: string; readonly text: string }[];
  readonly facts: readonly Fact[];
  readonly extraKinds: Readonly<Record<string, BlockKind>>;
}

/**
 * Цепочка топлива справа от линии, ряд за рядом назад. Тростник из сундука → компрессор → дробилка → центрифуга
 * (предметы по латунной трубе сзади) → пивоварня (+ вода от насоса) → ферментеры → дистилляторы (жидкость сверху,
 * выход спереди). Для биодизеля — ещё консервный автомат (этанол в капсулы), экстракторы масла из семян и реактор.
 * Каждая машина берёт энергию снизу.
 */
function fuelPlant(grid: Grid, fuel: "biogas" | "biodiesel", run: FuelChainRun): FuelPlant {
  const box = boxOf([...grid.keys()].map(cellOf));
  const x0 = box.max[0] + GAP + [0, 0].length;
  const machinesOf = (id: FuelStage["id"]) => run.stages.find((stage) => stage.id === id)?.machines ?? 0;
  const rowStep = [0, 0, 0, 0, 0].length;
  const rows: Partial<Record<FuelStage["id"], Row>> = {};
  let next = grid;
  let z = box.max[2];
  for (const stage of run.stages) {
    const row = rowAt(x0, z, stage.machines);
    rows[stage.id] = row;
    next = withCells(next, row.cells.map((cell): readonly [Vec3, Cell] => [cell, { kind: FUEL_KINDS[stage.id].kind, face: "pz" }]));
    z -= rowStep;
  }
  const at = (id: FuelStage["id"]): Row => {
    const row = rows[id];
    if (!row) throw new Error(`Нет ряда ${id}`);
    return row;
  };
  // Подача предметов: сундук, под ним воронка с носиком вправо — в трубу за рядом.
  const feed = (laid: Grid, row: Row): Grid => {
    const hopper = move(row.back[0], "nx");
    return rowPipe(withCells(laid, [[hopper, { kind: "ownHopperRight" }], [move(hopper, "py"), { kind: "ownChest", face: "pz" }]]), row.back, "itemPipe", "pz", "nx");
  };
  // Предметы с выхода одного ряда — по трубе в трубу за следующим.
  const items = (laid: Grid, from: FuelStage["id"], to: FuelStage["id"], isFed = false): Grid => {
    const withBack = isFed ? laid : rowPipe(laid, at(to).back, "itemPipe", "pz");
    return joinPipe(rowPipe(withBack, at(from).front, "itemPipe", "nz"), at(from).front, at(to).back, "itemPipe");
  };
  // Жидкость с выхода одного ряда — в трубу поверх следующего.
  const fluid = (laid: Grid, from: FuelStage["id"], to: FuelStage["id"], kind: string): Grid =>
    joinPipe(rowPipe(rowPipe(laid, at(from).front, kind, "nz"), at(to).top, kind, "ny"), at(from).front, at(to).top, kind);

  next = feed(next, at("compressor"));
  next = items(next, "compressor", "macerator");
  next = items(next, "macerator", "centrifuge");
  next = items(next, "centrifuge", "brewery");
  // Вода от насоса LV слева над пивоварней.
  const pump: Vec3 = move(at("brewery").top[0], "nx");
  next = withCells(next, [[pump, { kind: "pump-lv", face: "px" }]]);
  next = rowPipe(next, at("brewery").top, "waterPipe", "ny", "nx");
  next = fluid(next, "brewery", "fermenter", "biomassPipe");
  next = fluid(next, "fermenter", "distillery", "fermentedPipe");
  let fuelPipe = "biogasPipe";
  if (fuel === "biogas") {
    next = rowPipe(next, at("distillery").front, "biogasPipe", "nz");
  } else {
    // Этанол → консервный автомат (капсулы сзади) → капсулы этанола по трубе к реактору; масло из семян — сверху реактора.
    next = fluid(next, "distillery", "canner", "ethanolPipe");
    next = feed(next, at("canner"));
    next = feed(next, at("reactor"));
    next = items(next, "canner", "reactor", true);
    next = feed(next, at("extractor"));
    next = fluid(next, "extractor", "reactor", "seedOilPipe");
    next = rowPipe(next, at("reactor").front, "biodieselPipe", "nz");
    fuelPipe = "biodieselPipe";
  }
  const c = PRODUCTION.fuelChain;
  const stage = (id: FuelStage["id"]) => run.stages.find((candidate) => candidate.id === id);
  const busy = (id: FuelStage["id"]) => `${machinesOf(id)} шт., заняты на ${format(((stage(id)?.load ?? 0) / machinesOf(id)) * 100)} %`;
  const fertilizerHours = (PRODUCTION.bbf.stack * c.distillery.ticks) / PRODUCTION.ticksPerSecond / PRODUCTION.secondsPerMinute / PRODUCTION.secondsPerMinute;
  const value = fuel === "biogas" ? c.biogasValue : c.biodieselValue;
  const glycerolHours = fuel === "biodiesel" ? PRODUCTION.bbf.stack / run.cellsPerMinute / PRODUCTION.secondsPerMinute : 0;
  return {
    grid: next,
    consumers: [...run.stages.flatMap((s) => at(s.id).cells.map((cell) => ({ hatch: cell, face: "ny" as const }))), { hatch: pump, face: "nx" }],
    fuelPipe,
    parts: [
      {
        title: "Почему так",
        text:
          fuel === "biogas"
            ? `Из 1000 л сброженной биомассы дистиллятор даёт ${c.distillery.biogas} л биогаза по ${c.biogasValue} EU — 72 000 EU, а метана (схема 7) — 600 л по 104 EU, всего 62 400. Сырьё — сахарный тростник: он растёт сам, сажать заново не нужно. Еда в центрифуге даёт метан слишком медленно, а водород из воды тратит больше энергии, чем даёт.`
            : "В LV дизельному генератору годится только биодизель: лёгкое топливо делают из нефти на ярусе HV, креозот этот генератор не жжёт. Этанол для биодизеля — из того же тростника, масло — из семян пшеницы.",
      },
      { title: "Топливо", text: `${fuel === "biogas" ? "Биогаз" : "Биодизель"} даёт ${format(value)} EU на литр, генератор LV берёт ${format(c.efficiency * 100)} % — ${format(value * c.efficiency, 1)} EU. Генераторам нужно ${format(run.totalEut)} EU/t: линия плюс машины этой цепочки. Это ${format(run.fuelPerSecond, 1)} л в секунду.` },
      { title: "Сундук тростника, компрессор, дробилка, центрифуга", text: `Компрессор жмёт 8 тростника в растительный комок за ${seconds(c.compressor.ticks)} (${busy("compressor")}); дробилка делает из двух комков в среднем 2,75 измельчённой массы за ${seconds(c.macerator.ticks)} (${busy("macerator")}); центрифуга — из массы биомякину за ${seconds(c.centrifuge.ticks)} (${busy("centrifuge")}). Тростника нужно ${format(run.canePerMinute)} в минуту. Рецепты — из мода-ядра GTNH.` },
      { title: "Насос LV и пивоварня", text: `Пивоварня варит биомякину с водой в биомассу: 1000 л за ${seconds(c.brewery.ticks)} — ${busy("brewery")}. Воды нужно ${format(run.waterPerSecond, 1)} л/с, насос даёт до 250.` },
      { title: `${FUEL_KINDS.fermenter.title}: ${machinesOf("fermenter")}`, text: `Сбраживают биомассу: ${c.fermenter.litres} л за ${seconds(c.fermenter.ticks)} — ${busy("fermenter")}.` },
      { title: `${FUEL_KINDS.distillery.title}: ${machinesOf("distillery")}`, text: `Из 1000 л сброженной биомассы — ${fuel === "biogas" ? `${c.distillery.biogas} л биогаза за ${seconds(c.distillery.biogasTicks)} (схема 17)` : `${c.distillery.ethanol} л этанола за ${seconds(c.distillery.ticks)} (схема 3)`}; ${busy("distillery")}. Заодно в слот выхода падает удобрение: стопка набирается за ${format(fertilizerHours, 1)} ч, потом его вынимают.` },
      ...(fuel === "biodiesel"
        ? [
            { title: FUEL_KINDS.canner.title, text: `Разливает этанол по капсулам: 1000 л за ${seconds(c.canner.ticks)}. Пустые капсулы — в сундук за ним, ${format(run.cellsPerMinute, 2)} в минуту.` },
            { title: `${FUEL_KINDS.extractor.title}: ${machinesOf("extractor")}`, text: `Выжимают из семян пшеницы по ${c.extractor.litres} л масла за ${seconds(c.extractor.ticks)} — ${busy("extractor")}. Семян нужно ${format(run.seedsPerMinute)} в минуту: это ферма пшеницы.` },
            { title: FUEL_KINDS.reactor.title, text: `Щепоть едкого натра, капсула этанола и 6000 л масла дают 6000 л биодизеля за ${seconds(c.reactor.ticks)}; заодно капсула глицерина — её стопка набирается за ${format(glycerolHours, 1)} ч. Едкий натр — в сундук за реактором.` },
          ]
        : []),
      { title: "Трубы", text: "Жидкость входит в машину сверху и выходит спереди; предметы — по латунной трубе сзади. Готовое топливо идёт к задней стороне каждого генератора: спереди у него выход энергии. Каждая машина цепочки берёт энергию снизу, от того же кабеля." },
    ],
    facts: [
      { label: fuel === "biogas" ? "Биогаз" : "Биодизель", value: `${format(run.fuelPerSecond, 1)} л/с` },
      { label: "Генераторам нужно", value: `${format(run.totalEut)} EU/t с цепочкой` },
      { label: "Тростник", value: `${format(run.canePerMinute)} в минуту` },
      ...(fuel === "biodiesel" ? [{ label: "Семена", value: `${format(run.seedsPerMinute)} в минуту` }] : []),
    ],
    extraKinds: {
      ...Object.fromEntries(run.stages.map((s) => [FUEL_KINDS[s.id].kind, FUEL_KINDS[s.id].block()])),
      "pump-lv": singleKind("pump-lv", "Насос LV"),
    },
  };
}

/** Отводы от трубы с топливом к задней стороне каждого генератора. */
function fuelToGenerators(grid: Grid, generatorSlug: string, fuelPipe: string): Grid {
  const generators = [...grid.entries()].filter(([, value]) => value.kind === generatorSlug).map(([key]) => cellOf(key));
  return generators.reduce((laid, cell) => {
    const goals = [...laid.entries()].filter(([, value]) => value.kind === fuelPipe).map(([key]) => cellOf(key));
    return lay(laid, route(laid, move(cell, "nz"), goals, MARGIN), fuelPipe, "pz");
  }, grid);
}

function runFacts(label: string, run: Run): Fact {
  const overclocks = run.overclocks ? `, разгонов ${run.overclocks}${run.perfectOverclocks ? ` (идеальных ${run.perfectOverclocks})` : ""}` : "";
  return { label, value: `${seconds(run.ticks)} × ${run.parallel}${overclocks}` };
}

function smeltLine({ slug, title, tier, recipe: recipeId, source, withPrep }: Smelt): Material {
  const recipe: Recipe & { readonly freeze?: { readonly eut: number; readonly ticks: number } } = PRODUCTION.recipes[recipeId];
  const furnace = bestOf(["electric-blast-furnace", "volcanus"], tier);
  const freezer = recipe.freeze ? bestOf(["vacuum-freezer", "cryogenic-freezer"], tier) : undefined;
  const coil = coilFor(recipe.heat ?? 0);
  if (!coil) throw new Error(`Нет катушки на ${recipe.heat} K`);
  const voltage = voltageOf(tier);
  const amps = PRODUCTION.hatchAmps * PRODUCTION.hatchesPerMachine;
  const furnaceRun = runRecipe(recipe, PRODUCTION.machines[furnace.slug as keyof typeof PRODUCTION.machines], { voltage, amps, tier: tierRank(tier), coilHeat: coilHeat(coil.ordinal) });
  const freezeRun = freezer && recipe.freeze ? runRecipe({ ...recipe.freeze, out: 1 }, PRODUCTION.machines[freezer.slug as keyof typeof PRODUCTION.machines], { voltage, amps, tier: tierRank(tier) }) : undefined;
  // Морозильник работает только пока есть что морозить: доля его времени — выход печи к его скорости.
  const busy = freezeRun ? Math.min(1, furnaceRun.perMinute / freezeRun.perMinute) : 0;
  const prepEut = withPrep ? steelPrepRun(furnaceRun.perMinute).averageEut : 0;
  const average = Math.round(furnaceRun.eut + (freezeRun ? freezeRun.eut * busy : 0) + prepEut);

  // Раскладка: печь слева, морозильник справа через проход; сундук с воронкой — у входной шины печи.
  const first = placeMachine(new Map(), furnace, [0, 0, 0], kindsOf(furnace), true);
  const furnaceWidth = boxOf(first.cells).max[0] + 1;
  const second = freezer ? placeMachine(first.grid, freezer, [furnaceWidth + GAP, 0, 0], kindsOf(freezer), false) : undefined;
  let grid = second?.grid ?? first.grid;

  const input = addHatch(grid, first.cells, "inputBus", "nx");
  // С подготовкой у шины стоит дробилка (её ставит steelPrep), иначе — воронка под сундуком.
  grid = withPrep
    ? input.grid
    : withCells(input.grid, [
        [input.out, { kind: "ownHopper", links: [OPPOSITE.nx] }],
        [move(input.out, "py"), { kind: "ownChest", face: "pz" }],
      ]);
  const furnaceOut = addHatch(grid, first.cells, "outputBus", "px");
  grid = furnaceOut.grid;
  let lastOut = furnaceOut;
  if (second) {
    const freezerIn = addHatch(grid, second.cells, "inputBus", "nx");
    grid = lay(freezerIn.grid, route(freezerIn.grid, furnaceOut.out, [freezerIn.out], MARGIN), "itemPipe", OPPOSITE.px, OPPOSITE.nx);
    lastOut = addHatch(grid, second.cells, "outputBus", "px");
    grid = lastOut.grid;
  }
  grid = withCells(grid, [[lastOut.out, { kind: "ownChest", face: "pz" }]]);

  const furnaceEnergy = energyHatches(grid, first.cells);
  const freezerEnergy = second ? energyHatches(furnaceEnergy.grid, second.cells) : undefined;
  const prep = withPrep ? steelPrep(freezerEnergy?.grid ?? furnaceEnergy.grid, first.cells, input.out, furnaceRun.perMinute) : undefined;
  const hatches = [...furnaceEnergy.hatches, ...(freezerEnergy?.hatches ?? []), ...(prep?.consumers ?? [])];
  const withHatches = prep?.grid ?? freezerEnergy?.grid ?? furnaceEnergy.grid;

  const furnaceBonus = furnace.slug === "volcanus" ? "8 рецептов разом, время ÷2,2, энергия 90 %" : "1 рецепт, к нагреву катушек +100 K за ярус выше MV";
  const option = (generator: Single): LineOption => {
    // Топливо для дизельного генератора и газовой турбины строится на LV: биодизель и биогаз из сахарного тростника.
    const fuelKind = tier !== "lv" ? undefined : generator.slug.startsWith("combustion-generator") ? "biodiesel" : generator.slug.startsWith("gas-turbine") ? "biogas" : undefined;
    const fuelRun = fuelKind ? fuelChainRun(fuelKind, average) : undefined;
    const plant = fuelKind && fuelRun ? fuelPlant(withHatches, fuelKind, fuelRun) : undefined;
    const powered = powerFor(plant?.grid ?? withHatches, [...hatches, ...(plant?.consumers ?? [])], tier, fuelRun ? Math.round(fuelRun.totalEut) : average, generator.slug);
    const energy = plant ? { ...powered, grid: fuelToGenerators(powered.grid, generator.slug, plant.fuelPipe), extraKinds: { ...powered.extraKinds, ...plant.extraKinds } } : powered;
    // shortcut: пар к турбинам строится только на LV; выше котлов вышло бы сотни — там нужны большие котлы, это следующий шаг.
    const fuel = tier === "lv" && generator.slug.startsWith("steam-turbine") ? turbineSteam(energy, generator.slug, tier, average) : undefined;
    return {
    id: generator.slug,
    label: `${generator.title}: ${energy.generators} шт.`,
    group: furnace.title,
    via: fuel ? `пар от ${fuel.facts.find((fact) => fact.label === "Котлы")?.value.split(" ")[0]} угольных котлов` : fuelKind ? (fuelKind === "biogas" ? "биогаз из сахарного тростника" : "биодизель: семена и этанол из тростника") : (generator.facts.find((fact) => /Топливо|Работает на|Ест/.test(fact.label))?.value ?? "топливо не показано"),
    story: [
      `${title} — главный металл яруса ${tierTitle(tier)}: из него делают корпуса машин. ${source} Рецепт: ${format(recipe.eut)} EU/t, ${seconds(recipe.ticks)}, нагрев ${format(recipe.heat ?? 0)} K — катушки не слабее таких: ${coil.name} (${format(coilHeat(coil.ordinal))} K).`,
      `${furnace.title} (${furnaceBonus}) питается от двух энергетических люков по ${PRODUCTION.hatchAmps} А — это ${format(voltage * amps)} EU/t. На столько хватает ${furnaceRun.parallel > 1 ? `${furnaceRun.parallel} рецептов разом` : "одного рецепта"}${furnaceRun.overclocks ? ` и ${furnaceRun.overclocks} разгона` : " без разгона"}: цикл ${seconds(furnaceRun.ticks)} на ${format(furnaceRun.eut)} EU/t, ${format(furnaceRun.perMinute, 1)} слитков в минуту.`,
      freezer && freezeRun
        ? `Слиток выходит раскалённым, поэтому рядом стоит ${freezer.title.toLowerCase()}: он морозит ${format(freezeRun.perMinute)} слитков в минуту на ${format(freezeRun.eut)} EU/t и поспевает за печью с запасом — работает ${format(busy * 100, 1)} % времени. В среднем вся линия тянет ${format(average)} EU/t.`
        : `Слиток выходит обычным, не раскалённым — морозильник здесь не нужен. Линия тянет ${format(average)} EU/t.`,
      "Расчёт упрощённый — по правилам разгона мода, но без учёта потерь в кабеле и обслуживания. Откуда берётся сырьё — в цепочке ниже.",
    ],
    parts: [
      ...(prep ? prep.parts : [{ title: "Сундук и воронка", text: "В сундук кладут сырьё, воронка подаёт его во входную шину печи — шина смотрит на воронку." }]),
      { title: furnace.title, text: `Плавит при ${format(recipe.heat ?? 0)} K: ${furnaceBonus}. Люки смотрят каждый на свою трубу, воронку или кабель.` },
      ...(freezer
        ? [
            { title: "Предметная труба", text: "Выходная шина печи смотрит на трубу, труба несёт раскалённые слитки во входную шину морозильника." },
            { title: freezer.title, text: "Остужает раскалённые слитки до обычных; его выходная шина смотрит на сундук." },
          ]
        : []),
      { title: "Сундук на выходе", text: "Сюда приходят готовые слитки." },
      { title: "Энергетические люки", text: `По два на постройку, по ${PRODUCTION.hatchAmps} А ${tierTitle(tier)}; каждый смотрит на свой кабель.` },
      ...energy.parts,
      ...(fuel?.parts ?? []),
      ...(plant?.parts ?? []),
    ],
    facts: [
      { label: "Слитков в минуту", value: format(furnaceRun.perMinute, 1) },
      runFacts("Печь: цикл × рецептов", furnaceRun),
      ...(freezeRun ? [runFacts("Морозильник: цикл × рецептов", freezeRun)] : []),
      { label: "Катушки", value: coil.name },
      ...(prep?.facts ?? []),
      ...energy.facts,
      ...(fuel?.facts ?? []),
      ...(plant?.facts ?? []),
    ],
    setup: toMachine(
      fuel?.grid ?? energy.grid,
      { slug: `setup-${slug}--${generator.slug}`, name: `${title} line`, title: `Линия: ${title.toLowerCase()}`, tier, summary: `${furnace.title}${freezer ? ` и ${freezer.title.toLowerCase()}` : ""} с генераторами и кабелями.`, story: [], facts: [], source: furnace.source },
      { ...energy.extraKinds, ...prep?.extraKinds, ...fuel?.extraKinds },
      furnace.def.interior,
    ),
    };
  };
  return {
    slug,
    title,
    tier,
    summary: `${furnace.title}${freezer ? ` и ${freezer.title.toLowerCase()}` : ""}: ${format(furnaceRun.perMinute, 1)} слитков в минуту на ${format(average)} EU/t.`,
    // Кирпичные домны на ту же выработку — первыми: по ресурсам они выгоднее (см. bbfFarm).
    options: [...(withPrep ? [bbfFarm(furnaceRun.perMinute)] : []), ...generatorsOf(tier).map(option)],
  };
}

/* ------------------------------------------------------------------ */
/* UHV: нейтроний из реактора синтеза                                  */
/* ------------------------------------------------------------------ */

function neutroniumMaterial(): Material {
  const reactor = bestOf(["fusion-reactor-3"], "uhv");
  const recipe = PRODUCTION.neutronium;
  // Третью модель реактора питают люки UV — генераторы и кабели тоже UV.
  const powerTier: TierId = reactor.tier;
  const placed = placeMachine(new Map(), reactor, [0, 0, 0], kindsOf(reactor), false);
  const { grid, hatches } = energyHatches(placed.grid, placed.cells);
  const perMinute = (PRODUCTION.ticksPerSecond * PRODUCTION.secondsPerMinute) / recipe.ticks;
  const option = (generator: Single): LineOption => {
    const energy = powerFor(grid, hatches, powerTier, recipe.eut, generator.slug);
    return {
    id: generator.slug,
    label: `${generator.title}: ${energy.generators} шт.`,
    group: reactor.title,
    via: generator.facts.find((fact) => /Топливо|Работает на|Ест/.test(fact.label))?.value ?? "топливо не показано",
    story: [
      "Нейтроний — главный металл UHV. В доменной печи его не получить: в моде нет такого рецепта. Его даёт реактор синтеза третьей модели из жидких америция и наквадрии — по слитку жидкого нейтрония (144 л) за 12 с.",
      `Реактор тянет ${format(recipe.eut)} EU/t, а для запуска один раз копит ${format(recipe.startupEu / 1_000_000)} млн EU в своих энергетических люках. Здесь показаны два люка UV; в игре их нужно больше, чтобы вместить запуск.`,
      "Жидкий нейтроний потом отливают в слитки в жидкостном отвердителе — он и подача жидкостей здесь не показаны; откуда берутся америций и наквадрия — в цепочке ниже.",
    ],
    parts: [
      { title: reactor.title, text: "Кольцо пятнадцать блоков в ширину; энергетические люки — на задней стороне кольца, лицом к кабелям." },
      ...energy.parts,
    ],
    facts: [
      { label: "Слитков в минуту", value: format(perMinute) },
      { label: "Запуск", value: `${format(recipe.startupEu / 1_000_000)} млн EU` },
      ...energy.facts,
    ],
    setup: toMachine(
      energy.grid,
      { slug: `setup-neutronium--${generator.slug}`, name: "Neutronium line", title: "Линия: нейтроний", tier: "uhv", summary: "Реактор синтеза с генераторами и кабелями.", story: [], facts: [], source: reactor.source },
      energy.extraKinds,
    ),
    };
  };
  return {
    slug: "neutronium",
    title: "Нейтроний",
    tier: "uhv",
    summary: `Нейтроний не плавят в печи: его даёт ${reactor.title.toLowerCase()} — ${format(perMinute)} слитков в минуту.`,
    options: generatorsOf(powerTier).map(option),
  };
}

export const MATERIALS: readonly Material[] = [bronzeMaterial(), steelSteamMaterial(), ...SMELTS.map(smeltLine), neutroniumMaterial()];

export function findMaterial(slug: string): Material | undefined {
  return MATERIALS.find((material) => material.slug === slug);
}

/** Что показать в сцене по адресному имени: постройку из каталога или линию производства. */
export function findScene(slug: string): Machine | undefined {
  return findMachine(slug) ?? MATERIALS.flatMap((material) => material.options).find((option) => option.setup.slug === slug)?.setup;
}
