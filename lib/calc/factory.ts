import { chunkOf, chunksBetween, copiesAcross, copiesPerChunk, shiftIntoChunk } from "../chunks";
import { CALC, CHUNK, EBF, GAME, PRODUCTION } from "../config";
import { addHatch, boxOf, cellOf, findPath, keyOf, lay, layInto, move, OPPOSITE, placeMachine, row, SERVICE_KIND, sideTo, toMachine, withCells, type Box, type Cell, type Grid } from "../layout";
import { findMachine, kindsOf, type Machine } from "../machines";
import { COKE_UNIT, energyHatches, generatorRows, generatorsOf, supplyFloorY, powerFor, rowAt, sharedRow, singleKind, withLink, type Energy, type SupplySpot } from "../setups";
import { cableLoss, cableReach, chooseCable, choosePipe, fluidTemperature, pipeChannels, pipeTexture, type CableOffer, type PipeOffer } from "./conduits";
import { steamPlantFor, fuelPerSecond, type Fuel, type PowerChoice } from "./power";
import type { BlockKind, Face, Vec3 } from "../structure";
import { TIERS, type TierId } from "../tiers";
import type { Crafter } from "./crafters";
import { furnaceCoilName, runningEut, type Flow, type Plan, type Step } from "./planner";
import type { Goods } from "./repository";

/**
 * Фабрика из плана калькулятора — постройка для той же трёхмерной сцены, что и машины сайта. Каждый шаг — ряд машин,
 * ряды идут от сырья (спереди) к цели (сзади). У ряда отдельные линии входа и выхода для предметов и жидкостей. Отводы от труб
 * идут только туда, где у машины правда есть вход или выход:
 * - одноблочные стоят на высоте блока, кабель снизу, предметы сзади, жидкости сверху, выход спереди;
 * - электрические постройки — входная шина и входной люк в нижнем слое задней стены, выход — шина или люк спереди внизу,
 *   энергетические люки — на крыше, чтобы кабели не путались с трубами;
 * - кирпичная домна — как ферма домн на сайте: воронка спереди в контроллер, под контроллером вагонетка с воронкой,
 *   из неё — в трубу выхода; домны стоят стенка к стенке на кирпичном фундаменте, без энергии;
 * - коксовая печь — через свои люки: вход сверху, кокс и креозот — сзади.
 * Выход каждого шага соединён трубой с рядами, которые его едят (эстакада над фабрикой). Сырьё-предметы приходят из
 * сундуков с воронкой, готовый товар уходит в сундук. Энергию дают генераторы яруса — как в линиях производства.
 */

/** Плашка над фабрикой: над рядом машин — его рецепт, над баком или сундуком — готовый товар или излишек. */
export interface FactoryMarker {
  readonly kind: "row" | "product" | "surplus";
  /** Точка в сцене (метры, как у блоков Structure3D). */
  readonly at: Vec3;
  readonly title: string;
  /** Строки, которые видны при наведении. */
  readonly lines: readonly string[];
}

/** Сколько чего в фабрике. */
export interface FactoryStats {
  /** Машин по плану и сколько из них нарисовано. */
  readonly machines: number;
  readonly drawn: number;
  readonly pipes: number;
  readonly tanks: number;
  readonly chests: number;
  readonly cables: number;
  /** Площадь всей раскладки и её стороны в чанках, по границам сетки сцены. */
  readonly chunks: number;
  readonly chunkSize: readonly [width: number, depth: number];
  /** В скольких чанках стоят машины, генераторы или котлы. */
  readonly productionChunks: number;
  /** Мощность поставленных генераторов, EU/t. */
  readonly generationEut: number;
}

export interface Factory {
  readonly machine: Machine;
  /** Что в фабрике не нарисовано: ручные шаги (автокрафт), лишние копии построек. */
  readonly notes: readonly string[];
  readonly markers: readonly FactoryMarker[];
  /** Где в сцене (метры по x и z) проходит граница чанков: чанки отсчитываются от начала фабрики, а не от её середины. */
  readonly chunkOrigin: readonly [number, number];
  /** Какие трубы и кабели нужны и сколько блоков — как число машин в сводке. */
  readonly conduits: readonly FactoryConduit[];
  readonly stats: FactoryStats;
  /** Число неподключённых участков и люков. */
  readonly missingConnections: number;
}

/** Бак для жидкостей фабрики — свой рисунок в духе Railcraft (текстуры Railcraft брать нельзя, см. NOTICE.md). */
const TANK = "calcTank";

type Hatch = { readonly hatch: Vec3; readonly face: Face };

/** Отвод от трубы: путь от клетки трубы до клетки перед входом машины и сторона, куда он упирается в машину. */
interface Spur {
  readonly path: readonly Vec3[];
  readonly end: Face;
}

/** Труба вдоль ряда и её отводы к машинам. Пустая — у ряда такого входа нет. */
interface Line {
  readonly startFace?: Face;
  readonly cells: readonly Vec3[];
  readonly spurs: readonly Spur[];
}

interface Placed {
  readonly step: Step;
  readonly itemIn: Line;
  readonly fluidIn: Line;
  readonly itemOut: Line;
  readonly fluidOut: Line;
  readonly consumers: readonly Hatch[];
}

/** Ряд шага на фабрике и z, с которого начинается следующий ряд. */
interface Slot {
  readonly grid: Grid;
  readonly placed: Placed;
  readonly nextZ: number;
}

const NO_LINE: Line = { cells: [], spurs: [] };
const outputLine = (row: Placed, isFluid: boolean): Line => isFluid ? row.fluidOut : row.itemOut;
const hasOutput = (step: Step, isFluid: boolean): boolean =>
  step.outputs.some(({ goods }) => (goods.kind === "fluid") === isFluid);
const mixedOutputs = (step: Step): boolean => hasOutput(step, false) && hasOutput(step, true);
/**
 * Клетка, с которой начинаются чанки по x. Ряды стоят с x = 0, а слева от них, на x = −1, — воронки сырья и баки
 * излишков: пусть они будут в том же чанке, что и ряды, а не задевают лишний столбец чанков.
 */
const WEST = -1;
const productionChunk = ([x, , z]: Vec3): string => `${chunkOf(x, WEST)},${chunkOf(z)}`;
const onChunkEdge = (cell: number, origin: number): boolean =>
  chunkOf(cell - 1, origin) !== chunkOf(cell + 1, origin);

/** Переход через границу возможен, ход вдоль её кромки — нет. */
export function pipeStepInsideChunk(from: Vec3, to: Vec3): boolean {
  if (from[0] !== to[0]) return !onChunkEdge(from[2], 0);
  if (from[2] !== to[2]) return !onChunkEdge(from[0], WEST);
  return true;
}
const PRIMITIVE = new Set<string>(CALC.primitiveMachines);

const span = (from: number, to: number): number[] => {
  const step = to >= from ? 1 : -1;
  return Array.from({ length: Math.abs(to - from) + 1 }, (_unused, index) => from + index * step);
};

/** Труба вдоль x на высоте y и глубине z от x=min до x=max; отводы — от клеток taps прямо в сторону side. */
function lineAt(min: number, max: number, y: number, z: number, taps: readonly Vec3[], side: Face): Line {
  return { cells: span(min, max).map((x): Vec3 => [x, y, z]), spurs: taps.map((tap) => ({ path: [tap], end: side })) };
}

/** Вид блока одноблочной машины: своя текстура сайта, а если её нет — корпус яруса с подписью. */
function singleBlock(step: Step, tierId: string): BlockKind {
  const { crafter } = step;
  if (crafter.single) return { ...singleKind(crafter.single.slug, crafter.label), gameName: crafter.single.name };
  return { label: crafter.label, texture: `hull-${tierId}-side`, top: `hull-${tierId}-top`, bottom: `hull-${tierId}-bottom` };
}

const kindId = (label: string): string => `calc-${label.toLowerCase().replace(/[^a-z\d]+/g, "-")}`;

/** Одноблочные — в ряд на высоте блока: снизу кабель, сверху вход жидкостей, спереди выход, сзади вход предметов. */
function singleRow(grid: Grid, step: Step, copies: number, z: number, kind: string): Slot {
  const mixed = mixedOutputs(step);
  const pitch = mixed ? 2 : 1;
  const row = rowAt(0, z, (copies - 1) * pitch + 1);
  const taps = (cells: readonly Vec3[]) => cells.filter((_cell, index) => index % pitch === 0);
  const each = (cells: readonly Vec3[], end: Face): Line => ({ cells, spurs: cells.map((cell) => ({ path: [cell], end })) });
  const front = (cells: readonly Vec3[], end: Face): Line => ({
    cells, spurs: taps(cells).map((cell) => ({ path: [cell], end })),
  });
  // В смешанном ряду зазор справа от машины нужен для жидкостного выхода, под лицевой трубой предметов.
  const liquidTaps = taps(row.cells).map((cell) => move(cell, "px"));
  const mixedFluidOut = mixed ? {
    cells: span(0, row.cells.length).map((x): Vec3 => [x, 0, z + 1]),
    spurs: liquidTaps.map((tap): Spur => ({ path: [move(move(tap, "ny"), "pz"), move(tap, "ny"), tap], end: "nx" })),
  } : NO_LINE;
  return {
    grid: withCells(grid, taps(row.cells).map((cell): readonly [Vec3, Cell] => [cell, { kind, face: "pz" }])),
    placed: {
      step,
      itemIn: front(row.back, "pz"),
      fluidIn: front(row.top, "ny"),
      itemOut: hasOutput(step, false) ? front(row.front, "nz") : NO_LINE,
      fluidOut: mixed ? mixedFluidOut : hasOutput(step, true) ? each(row.front, "nz") : NO_LINE,
      consumers: taps(row.cells).map((cell) => ({ hatch: cell, face: "ny" as const })),
    },
    nextZ: z - CALC.factory.rowGap - [0, 0].length,
  };
}

/**
 * Люк вида kind на передней (pz) или задней (nz) кромке нижнего слоя: свой люк из схемы постройки, если он там стоит
 * (в том числе в углу — addHatch считает угол боковой стеной), иначе новый на месте корпуса.
 */
function hatchOn(grid: Grid, bottom: readonly Vec3[], kind: string, wall: "pz" | "nz", skip: readonly string[]): ReturnType<typeof addHatch> {
  const box = boxOf(bottom);
  const edge = wall === "pz" ? box.max[2] : box.min[2];
  const own = bottom.find((cell) => cell[2] === edge && grid.get(keyOf(cell))?.kind === kind && !skip.includes(keyOf(cell)) && !grid.has(keyOf(move(cell, wall))));
  if (!own) return addHatch(grid, bottom, kind, wall, skip);
  return { grid: withCells(grid, [[own, { kind, face: wall }]]), hatch: own, out: move(own, wall) };
}

const SPARE_HATCHES = new Set(["inputBus", "outputBus", "inputHatch", "outputHatch"]);

/** Шины и люки из схемы постройки, к которым труба не подходит, — обратно в корпус (самый частый блок нижнего слоя). */
function withoutSpareHatches(grid: Grid, bottom: readonly Vec3[], used: readonly string[]): Grid {
  const counts = new Map<string, number>();
  for (const cell of bottom) {
    const kind = grid.get(keyOf(cell))?.kind ?? "";
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }
  // Корпус — не люк, не контроллер и не обслуживание (то же правило, что у addHatch).
  const casing = [...counts.entries()].filter(([kind]) => kind && !SERVICE_KIND.test(kind)).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!casing) return grid;
  const spare = bottom.filter((cell) => SPARE_HATCHES.has(grid.get(keyOf(cell))?.kind ?? "") && !used.includes(keyOf(cell)));
  return withCells(grid, spare.map((cell): readonly [Vec3, Cell] => [cell, { kind: casing }]));
}

/**
 * Энергетические люки постройки: на крышу, а если там места нет (глушитель, купол) — на боковую стену, в проход между
 * копиями. Задняя стена занята трубами входа.
 */
function poweredFrom(grid: Grid, cells: readonly Vec3[], avoid: readonly string[] = [], isPacked = false): ReturnType<typeof energyHatches> {
  // По очереди: крыша, задняя, передняя, боковые стены — первая, где люки встают (общие стены — в avoid). В ряду вплотную
  // боковых нет: стена либо общая, либо смотрит в узкую щель у границы чанка, куда кабелю не пройти.
  const walls: readonly Face[] = isPacked ? ["py", "nz", "pz"] : ["py", "nz", "pz", "nx", "px"];
  for (const wall of walls.slice(0, -1)) {
    try {
      return energyHatches(grid, cells, wall, avoid);
    } catch {
      // На этой стене места нет — пробуем следующую.
    }
  }
  return energyHatches(grid, cells, walls[walls.length - 1], avoid);
}

/**
 * Могут ли копии постройки стоять вплотную с общей боковой стеной. Мультиблоки GregTech делят стены — корпуса,
 * катушки, шины и люки (вики GTNH: Multiblock Machines, Electric Blast Furnace): соседняя доменная печь экономит
 * катушки. Делим, только если левая и правая стены совпадают блок в блок (люк на месте корпуса считается корпусом:
 * на общей стене он станет корпусом, а люки переедут — mergeSharedWalls) и на них нет контроллера и пустот.
 */
const canShareWalls = (building: Machine): boolean => !/railcraft|tinkers|tconstruct/i.test(building.source);
const canOverlap = (first: Cell, second: Cell): boolean =>
  !first.isHollow && !second.isHollow && !!first.kind && first.kind === second.kind &&
  (!SERVICE_KIND.test(first.kind) || (/maintenance/i.test(first.kind) && first.face === second.face));

export function sharesWalls(building: Machine): boolean {
  if (!canShareWalls(building)) return false;
  if (isQuad(building)) return true; // У домны есть проверенная схема собственного квадрата.
  const placed = placeMachine(new Map(), building, [0, 0, 0], kindsOf(building), true);
  const box = boxOf([...placed.grid.keys()].map(cellOf));
  const wall = (x: number) =>
    [...placed.grid.entries()]
      .filter(([key]) => cellOf(key)[0] === x)
      .map(([key, cell]) => [cellOf(key)[1], cellOf(key)[2], cell.isHollow ? "" : cell.kind] as const)
      .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const left = wall(box.min[0]);
  const right = wall(box.max[0]);
  const fits = (a: string, b: string) => canOverlap({ kind: a }, { kind: b });
  return (
    box.max[0] > box.min[0] &&
    left.length > 0 &&
    left.length === right.length &&
    left.every(([y, z, kind], index) => right[index][0] === y && right[index][1] === z && fits(kind, right[index][2]))
  );
}

/**
 * Общие стены ряда (копии вплотную, gap −1): люки на них становятся корпусом своего слоя (самый частый не-люк этого
 * слоя постройки), иначе соседи делили бы энергетический люк — его общий не тянет разгон. Люки ставятся заново:
 * шины и люки входа и выхода — hatchOn, энергетические — poweredFrom, люк обслуживания — withMaintenance.
 */
function mergeSharedWalls(grid: Grid, bodies: readonly (readonly Vec3[])[], sharedXs: ReadonlySet<number>): Grid {
  const cells: (readonly [Vec3, Cell])[] = [];
  for (const body of bodies) {
    const casingOf = new Map<number, string>();
    for (const y of new Set(body.map((cell) => cell[1]))) {
      const counts = new Map<string, number>();
      for (const cell of body.filter((part) => part[1] === y)) {
        const kind = grid.get(keyOf(cell))?.kind ?? "";
        if (kind && !SERVICE_KIND.test(kind)) counts.set(kind, (counts.get(kind) ?? 0) + 1);
      }
      const casing = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      if (casing) casingOf.set(y, casing);
    }
    for (const cell of body.filter((part) => sharedXs.has(part[0]))) {
      const casing = casingOf.get(cell[1]);
      if (casing && SERVICE_KIND.test(grid.get(keyOf(cell))?.kind ?? "")) cells.push([cell, { kind: casing }]);
    }
  }
  return withCells(grid, cells);
}

/** Люк обслуживания, если у копии его не осталось (стоял на общей стене): на крышу, заднюю или переднюю стену. */
function withMaintenance(grid: Grid, body: readonly Vec3[], avoid: readonly string[]): Grid {
  if (body.some((cell) => /aintenance/.test(grid.get(keyOf(cell))?.kind ?? ""))) return grid;
  for (const wall of ["py", "nz", "pz"] as const) {
    try {
      return addHatch(grid, body, "maintenance", wall, avoid).grid;
    } catch {
      // На этой стене места нет — пробуем следующую.
    }
  }
  return grid;
}

/** Шаг между копиями ряда: −1 — соседи делят стену, 1 — через блок. Считается раз на постройку. */
const gaps = new Map<string, number>();
const gapOf = (building: Machine): number => {
  const known = gaps.get(building.slug);
  if (known !== undefined) return known;
  const gap = sharesWalls(building) ? -1 : 1;
  gaps.set(building.slug, gap);
  return gap;
};

/** Ширина и глубина постройки в блоках, как она встаёт на фабрику. */
function sizeOf(building: Machine): { readonly width: number; readonly depth: number } {
  const size = boxOf(placeMachine(new Map(), building, [0, 0, 0], kindsOf(building), true).cells);
  return { width: size.max[0] - size.min[0] + 1, depth: size.max[2] - size.min[2] + 1 };
}

/**
 * Электрические постройки — в ряд через блок. Входы — в нижнем слое задней стены (там, где GregTech разрешает люки):
 * труба предметов идёт блоком выше и спускается к шине, труба жидкостей — блоком дальше и подходит к люку прямо.
 */
function electricRow(grid: Grid, step: Step, building: Machine, copies: number, start: number): Slot {
  const kinds = kindsOf(building);
  const { width, depth } = sizeOf(building);
  // Постройка не делится между чанками: ряд, который лёг бы на границу, опускаем в следующий чанк, а копии в ряду
  // расставляет copiesAcross — вплотную с общей стеной, если постройка это позволяет (sharesWalls), иначе через блок.
  const z = start - shiftIntoChunk(start - depth + 1, start);
  const xs = copiesAcross(width, copies, WEST, gapOf(building));
  const hasItems = step.inputs.some((flow) => flow.goods.kind === "item");
  const hasFluids = step.inputs.some((flow) => flow.goods.kind === "fluid");
  const itemOutput = hasOutput(step, false);
  const fluidOutput = hasOutput(step, true);
  const back = z - depth;
  let next = grid;
  const consumers: Hatch[] = [];
  const itemOutTaps: Vec3[] = [];
  const fluidOutTaps: Vec3[] = [];
  const itemSpurs: Spur[] = [];
  const fluidSpurs: Spur[] = [];
  // Сначала все копии, потом люки: у соседей общая стена, и копия, поставленная позже, стёрла бы люки предыдущей.
  const bodies: (readonly Vec3[])[] = [];
  for (const x of xs) {
    const one = placeMachine(next, building, [x, 0, z], kinds, true);
    next = one.grid;
    bodies.push(one.cells);
  }
  // Ряд вплотную (общие стены): боковые стены каждой копии — без люков из схемы. Даже не общая боковая стена здесь
  // упирается в соседа (у границы чанка копия перескакивает и встаёт к соседу впритык), и люк смотрел бы в него.
  const sharedXs = new Set(gapOf(building) < 0 ? xs.flatMap((x) => [x, x + width - 1]) : []);
  if (sharedXs.size > 0) next = mergeSharedWalls(next, bodies, sharedXs);
  // Занятые люки всего ряда: общий люк соседа берётся повторно (шины и люки делить можно), лишние — снова корпус.
  const used: string[] = [];
  const bottoms = bodies.map((cells) => cells.filter((cell) => cell[1] === 0));
  bottoms.forEach((bottom, index) => {
    if (itemOutput) {
      const bus = hatchOn(next, bottom, "outputBus", "pz", []);
      next = bus.grid;
      itemOutTaps.push(bus.out);
      used.push(keyOf(bus.hatch));
    }
    if (fluidOutput) {
      const level = itemOutput ? bodies[index].filter((cell) => cell[1] === 1) : bottom;
      const hatch = hatchOn(next, level, "outputHatch", "pz", []);
      next = hatch.grid;
      fluidOutTaps.push(hatch.out);
      used.push(keyOf(hatch.hatch));
    }
    if (hasItems) {
      const bus = hatchOn(next, bottom, "inputBus", "nz", used);
      next = bus.grid;
      used.push(keyOf(bus.hatch));
      itemSpurs.push({ path: [move(bus.out, "py"), bus.out], end: "pz" });
    }
    if (hasFluids) {
      const hatch = hatchOn(next, bottom, "inputHatch", "nz", used);
      next = hatch.grid;
      used.push(keyOf(hatch.hatch));
      fluidSpurs.push({ path: [move(hatch.out, "nz"), hatch.out], end: "pz" });
    }
  });
  next = withoutSpareHatches(next, bottoms.flat(), used);
  // Энергетический люк — только на своей стене: общий не тянет разгон (вики GTNH, Electric Blast Furnace).
  bodies.forEach((cells) => {
    const avoid = cells.filter((cell) => sharedXs.has(cell[0])).map(keyOf);
    const energy = poweredFrom(next, cells, avoid, sharedXs.size > 0);
    next = withMaintenance(energy.grid, cells, avoid);
    consumers.push(...energy.hatches);
  });
  const right = xs[xs.length - 1] + width - 1;
  return {
    grid: next,
    placed: {
      step,
      itemIn: hasItems ? { cells: span(0, right).map((x): Vec3 => [x, 1, back]), spurs: itemSpurs } : NO_LINE,
      fluidIn: hasFluids ? { cells: span(0, right).map((x): Vec3 => [x, 0, back - 1]), spurs: fluidSpurs } : NO_LINE,
      itemOut: itemOutput ? lineAt(0, right, 0, z + 1, itemOutTaps, "nz") : NO_LINE,
      fluidOut: fluidOutput ? lineAt(0, right, itemOutput ? 1 : 0, z + 1, fluidOutTaps, "nz") : NO_LINE,
      consumers,
    },
    nextZ: back - [0, 0].length - CALC.factory.rowGap,
  };
}

/**
 * Доменные печи квадратом 2 × 2 (схема игрока, «x4 EBF»): четыре печи 3 × 3 с общими стенами — 5 × 5, на 4 печи 42
 * катушки вместо 64. Строки r — от фасада назад, столбцы c — слева направо; печь A — строки 0–2, столбцы 0–2, B —
 * строки 0–2, столбцы 2–4, C — строки 2–4, столбцы 0–2, D — строки 2–4, столбцы 2–4.
 * Низ: контроллеры A и B спереди (r0), C и D сзади (r4); у каждой печи два энергетических люка — на дне у боковой
 * стены и внутри (общий люк разгон не тянет), оба лицом вниз; выходные шины на дне у пар A+C (r2 c1) и B+D (r2 c3); входная
 * шина — одна в центре дна. Люки обслуживания и жидкости — только в нижнем слое, на крыше только глушители и корпус.
 * Квадрат поднят на 2 блока, как в игре: снизу к нему подходят шины и внутренние энергетические люки — слой 0 под
 * кабели, слой 1 под предметные трубы. При жидкостном входе ответвления обходят друг друга под дном.
 */
const QUAD = CALC.quadEbf;

type QuadPart = { readonly kind: string; readonly face?: Face; readonly owners: readonly number[] };

/**
 * Что стоит в клетке квадрата (строка, столбец, слой от дна 0…3) и для каких печей (номера в QUAD.furnaces): люк
 * ставится, если есть хоть одна его печь; корпус и катушки — без хозяина, они нужны любой печи, чья это клетка.
 */
function quadPart(row: number, column: number, layer: number, hasFluidIn: boolean, hasFluidOut: boolean): QuadPart | "hollow" {
  const center = Math.floor(QUAD.side / [0, 0].length);
  const inside = [1, QUAD.side - [0, 0].length];
  const top = QUAD.layers - 1;
  const isEdgeRow = row === 0 || row === QUAD.side - 1;
  // Печь, чей это средний столбец и чья строка рядом (контроллер, люк обслуживания, глушитель).
  const byMiddle = () => QUAD.furnaces.findIndex(([r0, c0]) => Math.abs(row - (r0 + 1)) <= 1 && column === c0 + 1);
  if (layer > 0 && layer < top) return inside.includes(row) && inside.includes(column) ? "hollow" : { kind: "coil", owners: [] };
  if (layer === top) {
    if (inside.includes(row) && inside.includes(column)) return { kind: "muffler", face: "py", owners: [byMiddle()] };
    return { kind: "heatproof", owners: [] };
  }
  if (isEdgeRow && inside.includes(column)) return { kind: "ebfController", face: row === 0 ? "pz" : "nz", owners: [byMiddle()] };
  if (isEdgeRow && (column === 0 || column === QUAD.side - 1)) {
    const owner = QUAD.furnaces.findIndex(([r0, c0]) => Math.abs(row - (r0 + 1)) === 1 && Math.abs(column - (c0 + 1)) === 1);
    return { kind: "maintenance", face: "ny", owners: [owner] };
  }
  if (column === center && ((hasFluidIn && inside.includes(row)) || (hasFluidOut && isEdgeRow))) {
    const owners = QUAD.furnaces.flatMap(([r0], index) => (r0 <= row && row <= r0 + 2 ? [index] : []));
    return isEdgeRow ? { kind: "outputHatch", face: row === 0 ? "pz" : "nz", owners } : { kind: "inputHatch", face: "ny", owners };
  }
  if (inside.includes(row) && column !== center) {
    const furnace = QUAD.furnaces.findIndex(([r0, c0]) => row === r0 + 1 && column >= c0 && column <= c0 + [0, 0].length);
    // Все люки — лицом вниз: квадрат поднят, дно открыто, кабель подходит снизу от земли. Боковой люк лицом вбок
    // заставлял кабель обходить трубу в щели и торчать стойкой у стены.
    return { kind: "energy", face: "ny", owners: [furnace] };
  }
  if (row === center && column === center) return { kind: "inputBus", face: "ny", owners: QUAD.furnaces.map((_furnace, index) => index) };
  if (row === center && inside.includes(column)) return { kind: "outputBus", face: "ny", owners: QUAD.furnaces.flatMap(([, c0], index) => (column === c0 + 1 ? [index] : [])) };
  return { kind: "heatproof", owners: [] };
}

/**
 * Ряд квадратов доменных печей (QUAD): копии — по 4 в квадрат, последний квадрат неполный (3 печи — без D, 2 — пара
 * A+B, 1 — одна печь A): ставятся только клетки печей, что есть, и люки только их. Квадраты — через щель в блок, по
 * два в чанк; щель общая у соседей. Трубы к шинам — в слое 1 под квадратом: вход — сзади по среднему столбцу, выходы —
 * по среднему ряду в щели и вперёд; жидкостный вход идёт ниже предметной трубы.
 */
export function quadRow(grid: Grid, step: Step, copies: number, start: number): Slot {
  // Квадрат не делится между чанками: ряд, что лёг бы на границу, опускаем в следующий чанк.
  const z = start - shiftIntoChunk(start - QUAD.side + 1, start);
  const perQuad = QUAD.furnaces.length;
  const unit = QUAD.side + 1;
  const quads = copiesAcross(unit, Math.ceil(copies / perQuad), WEST, 0);
  const pipeY = 1;
  const top = QUAD.floor + QUAD.layers;
  const middle = z - Math.floor(QUAD.side / [0, 0].length);
  const back = z - (copies <= 2 ? QUAD.floor + 1 : QUAD.side);
  const cells: (readonly [Vec3, Cell])[] = [];
  const consumers: Hatch[] = [];
  const outSpurs: Spur[] = [];
  const itemSpurs: Spur[] = [];
  const fluidSpurs: Spur[] = [];
  const fluidOutSpurs: Spur[] = [];
  const hasFluids = step.inputs.some((flow) => flow.goods.kind === "fluid");
  const fluidOutput = hasOutput(step, true);
  quads.forEach((gapX, quad) => {
    const present = new Set(Array.from({ length: Math.min(perQuad, copies - quad * perQuad) }, (_unused, index) => index));
    const x0 = gapX + 1;
    const covered = (row: number, column: number) =>
      [...present].some((index) => {
        const [r0, c0] = QUAD.furnaces[index];
        return row >= r0 && row <= r0 + [0, 0].length && column >= c0 && column <= c0 + [0, 0].length;
      });
    for (let row = 0; row < QUAD.side; row += 1)
      for (let column = 0; column < QUAD.side; column += 1) {
        if (!covered(row, column)) continue;
        for (let layer = 0; layer < QUAD.layers; layer += 1) {
          const cell: Vec3 = [x0 + column, QUAD.floor + layer, z - row];
          const part = quadPart(row, column, layer, hasFluids, fluidOutput);
          if (part === "hollow") {
            cells.push([cell, { kind: "", isHollow: true }]);
            continue;
          }
          const isOwned = part.owners.length === 0 || part.owners.some((owner) => present.has(owner));
          if (!isOwned || !part.face) {
            cells.push([cell, { kind: isOwned ? part.kind : "heatproof" }]);
            continue;
          }
          cells.push([cell, { kind: part.kind, face: part.face }]);
          if (part.kind === "energy") consumers.push({ hatch: cell, face: part.face });
          if (part.kind === "inputHatch") {
            const frontBranch = copies > 2 && row < Math.floor(QUAD.side / 2);
            const x = frontBranch ? cell[0] - 1 : cell[0];
            const path = span(back, cell[2]).map((cz): Vec3 => [x, 0, cz]);
            if (frontBranch) path.push([cell[0], 0, cell[2]]);
            fluidSpurs.push({ path: [...path, move(cell, "ny")], end: "py" });
          }
          if (part.kind === "outputHatch") {
            const out = move(cell, part.face);
            fluidOutSpurs.push({ path: [
              ...span(z + 1, out[2]).map((cz): Vec3 => [out[0], top, cz]),
              ...span(top - 1, out[1]).map((y): Vec3 => [out[0], y, out[2]]),
            ], end: OPPOSITE[part.face] });
          }
        }
      }
    // Выходные шины пар: A+C — столбец 1, выход в левую щель; B+D — столбец 3, в правую; оттуда — вперёд к линии.
    const toFront = (x: number) => [z + 1, z, z - 1, middle].map((cz): Vec3 => [x, pipeY, cz]);
    if (present.has(0) || present.has([0, 0].length)) outSpurs.push({ path: [...toFront(gapX), [x0, pipeY, middle], [x0 + 1, pipeY, middle]], end: "py" });
    if (present.has(1) || present.has(perQuad - 1)) outSpurs.push({ path: [...toFront(gapX + unit), [x0 + QUAD.side - 1, pipeY, middle], [x0 + QUAD.side - [0, 0].length, pipeY, middle]], end: "py" });
    const center = x0 + Math.floor(QUAD.side / [0, 0].length);
    // В полном квадрате предметы обходят задний жидкостный люк снизу, с противоположной стороны от подачи вперёд.
    const itemPath: Vec3[] = hasFluids && copies > 2
      ? [[center + 1, pipeY, back], [center + 1, pipeY, back + 1],
        ...span(back + 1, middle).map((cz): Vec3 => [center + 1, 0, cz]), [center, 0, middle], [center, pipeY, middle]]
      : span(back, middle).map((cz): Vec3 => [center, pipeY, cz]);
    itemSpurs.push({ path: itemPath, end: "py" });
  });
  const left = quads[0];
  const right = quads[quads.length - 1] + (copies % perQuad === 1 ? unit - QUAD.floor : unit);
  const hasItems = step.inputs.some((flow) => flow.goods.kind === "item");
  return {
    grid: withCells(grid, cells),
    placed: {
      step,
      itemIn: hasItems ? { cells: span(left, right).map((x): Vec3 => [x, pipeY, back]), spurs: itemSpurs } : NO_LINE,
      fluidIn: hasFluids ? { cells: span(left, right).map((x): Vec3 => [x, 0, back]), spurs: fluidSpurs } : NO_LINE,
      itemOut: { cells: span(left, right).map((x): Vec3 => [x, pipeY, z + 1]), spurs: outSpurs },
      fluidOut: fluidOutput ? { cells: span(left, right).map((x): Vec3 => [x, top, z + 1]), spurs: fluidOutSpurs } : NO_LINE,
      consumers,
    },
    nextZ: back - 1 - CALC.factory.rowGap,
  };
}

/** Доменная печь ставится квадратами 2 × 2 (QUAD). */
const isQuad = (building: Machine): boolean => building.slug === "electric-blast-furnace";

/** Постройка, у которой слои — общий ряд из count копий (стены между соседями общие). */
const rowOf = (building: Machine, unit: readonly (readonly string[])[], count: number, kinds: Readonly<Record<string, string>>): Machine => ({
  ...building,
  slug: `${building.slug}-row`,
  def: { ...building.def, layers: sharedRow(unit, count), kinds: { ...building.def.kinds, ...kinds } as Machine["def"]["kinds"] },
});

/**
 * Кирпичные домны — как ферма домн на сайте: стенка к стенке на кирпичном фундаменте, лицом вперёд. Вход — труба перед
 * воронками, воронка подаёт в контроллер спереди. Под контроллером, на месте нижнего блока, — вагонетка с воронкой,
 * она забирает сталь и отдаёт в трубу выхода перед фундаментом. Энергии домне не нужно.
 */
function brickedRow(grid: Grid, step: Step, building: Machine, copies: number, start: number): Slot {
  const unit = building.def.layers;
  const depth = unit[0].length;
  // Фундамент с домнами и воронками сзади занимают клетки от z − depth до z: пусть лягут в один чанк.
  const z = start - shiftIntoChunk(start - depth, start);
  const front = z - 1;
  const width = copies * [0, 0].length + 1;
  const centers = Array.from({ length: copies }, (_unused, index) => index * [0, 0].length + 1);
  let next = placeMachine(grid, rowOf(building, unit, copies, {}), [0, 1, front], kindsOf(building), true).grid;
  next = withCells(next, [
    ...span(0, width - 1).flatMap((x) => span(front - depth + 1, front).map((cz): readonly [Vec3, Cell] => [[x, 0, cz], { kind: "ownBricks" }])),
    ...centers.flatMap((x): (readonly [Vec3, Cell])[] => [
      [[x, 1, front], { kind: "firebrickCart" }],
      [[x, 0, front], { kind: "ownHopperFront" }],
      [[x, [0, 0].length, front + 1], { kind: "ownHopperBack" }],
    ]),
  ]);
  return {
    grid: next,
    placed: {
      step,
      itemIn: lineAt(0, width - 1, [0, 0].length, front + [0, 0].length, centers.map((x): Vec3 => [x, [0, 0].length, front + [0, 0].length]), "nz"),
      fluidIn: NO_LINE,
      itemOut: lineAt(0, width - 1, 0, front + 1, centers.map((x): Vec3 => [x, 0, front + 1]), "nz"),
      fluidOut: NO_LINE,
      consumers: [],
    },
    nextZ: front - depth - CALC.factory.rowGap,
  };
}

/** Коксовые печи — через свои люки, как на ферме домн: вход сверху, кокс сзади посередине, креозот сзади внизу. */
function cokeRow(grid: Grid, step: Step, building: Machine, copies: number, start: number): Slot {
  const depth = COKE_UNIT[0].length;
  const top = COKE_UNIT.length;
  // Печи занимают клетки от z − depth до z − 1: пусть лягут в один чанк.
  const z = start - shiftIntoChunk(start - depth, start - 1);
  const front = z - 1;
  const behind = front - depth;
  const width = copies * [0, 0].length + 1;
  const centers = Array.from({ length: copies }, (_unused, index) => index * [0, 0].length + 1);
  const next = placeMachine(grid, rowOf(building, COKE_UNIT, copies, { i: "cokeHatchIn", o: "cokeHatchItems", f: "cokeHatchFluid" }), [0, 0, front], kindsOf(building), true).grid;
  return {
    grid: next,
    placed: {
      step,
      itemIn: lineAt(0, width - 1, top, front - 1, centers.map((x): Vec3 => [x, top, front - 1]), "ny"),
      fluidIn: NO_LINE,
      itemOut: lineAt(0, width - 1, 1, behind, centers.map((x): Vec3 => [x, 1, behind]), "pz"),
      fluidOut: lineAt(0, width - 1, 0, behind, centers.map((x): Vec3 => [x, 0, behind]), "pz"),
      consumers: [],
    },
    nextZ: behind - 1 - CALC.factory.rowGap,
  };
}

/** Связь «выход одного ряда → вход другого»: с конца линии from к концу линии to. */
interface Link {
  readonly from: readonly Vec3[];
  readonly to: readonly Vec3[];
  readonly kind: string;
}

/**
 * Трубы между рядами. Правило: если есть путь короче, берём его. Для каждой связи сначала ищем обход рядом с её
 * концами (findPath, строго короче пути по эстакаде); не нашёлся — труба идёт по эстакаде: выходит из конца своей
 * линии вбок, поднимается над фабрикой, идёт вдоль рядов по своей дорожке и спускается к ряду-потребителю. Связи, чьи
 * отрезки вдоль рядов не пересекаются, делят дорожку — так эстакада узкая. Обход не занимает ни дорожки эстакады,
 * ни отрезки, по которым к ней выйдут другие связи, ни места под баки и сундуки (reserved) — иначе трубы замуровали бы
 * друг друга. На огромной фабрике обход ищем только в небольшой области (CALC.factory.shortcutVolume).
 */
async function rack(grid: Grid, links: readonly Link[], reserved: ReadonlySet<string>, cableExits: readonly Vec3[], within: Box, allows: (cell: Vec3) => boolean, unlinked: Link[], useFreeGround = false, nearEquipment?: (cell: Vec3) => boolean): Promise<Grid> {
  const usable = links.flatMap((link) => {
    const from = link.from.filter(allows);
    const to = link.to.filter(allows);
    if (from.length > 0 && to.length > 0) return [{ ...link, from, to, original: link }];
    unlinked.push(link);
    return [];
  });
  if (usable.length === 0) return grid;
  const cells = [...grid.keys()].map(cellOf);
  const east = boxOf(cells).max[0] + [0, 0].length;
  // Дорожки идут сбоку от рядов (x > east), поэтому им не нужно перелезать через постройки: хватает подняться на блок
  // над самой высокой из соединяемых труб — эстакада низкая и не обводит всю фабрику сверху.
  const top = Math.max(...usable.flatMap((link) => [link.from[link.from.length - 1][1], link.to[link.to.length - 1][1]])) + 1;
  const lanes: [number, number][][] = [];
  // Одна рабочая копия сетки на всю эстакаду: копия на каждое соединение у большой фабрики — минуты.
  const next = new Map(grid);
  const linkTo = (cell: Vec3, side: Face) => {
    const own = next.get(keyOf(cell));
    next.set(keyOf(cell), { ...own, kind: own?.kind ?? "", links: [...new Set([...(own?.links ?? []), side])].sort() });
  };
  // Отрезки от концов линий до эстакады: пока связь не проложена, её отрезки обещаны ей.
  const exitOf = (end: Vec3) => span(end[0] + 1, east - 1).map((cx) => keyOf([cx, end[1], end[2]]));
  const promised = new Map<string, number>();
  const promise = (end: Vec3, change: number) => exitOf(end).forEach((key) => promised.set(key, (promised.get(key) ?? 0) + change));
  usable.forEach((link) => [link.from[link.from.length - 1], link.to[link.to.length - 1]].forEach((end) => promise(end, 1)));
  // Земля (y = 0) — для кабелей: под одноблочными машинами и к генераторам они идут понизу, и обход трубы по земле
  // замуровывал бы их. Концы связей на земле достижимы всё равно — цель пути пропускается всегда.
  const isGround = (key: string) => key.includes(",0,");
  // Над выходом каждого энергетического люка — свободный столб до высоты эстакады: по нему кабель поднимается над
  // трубами (люк на боковой стене смотрит в щель между постройками, а спереди и сзади щели — линии труб).
  const columns = new Set(cableExits.flatMap((exit) => span(exit[1], top).map((y) => keyOf([exit[0], y, exit[2]]))));
  const { routeMargin, shortcutVolume, fullRouteVolume, routeBatchVolume } = CALC.factory;
  // Фабрика полками: справа от ряда может стоять другая группа, и выход к эстакаде вбок упёрся бы в неё. Поэтому, если
  // фабрика не огромная, путь, не найденный рядом, ищется по всей фабрике; эстакада — только для огромных.
  const whole = boxOf(cells);
  const all = { min: [within.min[0], 0, within.min[2]] as Vec3,
    max: [within.max[0], Math.max(top + 2, whole.max[1] + 1), within.max[2]] as Vec3 };
  const volumePerLink = Math.floor(routeBatchVolume / usable.length);
  const canSearchAll = [0, 1, 2].reduce((product, axis) => product * (all.max[axis] - all.min[axis] + 1), 1) <= Math.min(fullRouteVolume, volumePerLink);
  // Клетка, куда смотрит открытый конец уже лежащей трубы, — не для обхода: чужая труба там срослась бы с ней.
  const facing = new Set(
    [...grid.entries()].flatMap(([key, cell]) => (cell.links ?? []).map((side) => keyOf(move(cellOf(key), side))).filter((next) => !grid.has(next))),
  );
  const blocked = { has: (key: string) => reserved.has(key) || columns.has(key) || facing.has(key) ||
    (!canSearchAll && (promised.get(key) ?? 0) > 0) || (!useFreeGround && isGround(key)) };
  // Сеть одного ресурса: линии, связанные трубой того же вида, — одна сеть со всеми её клетками. Новая связь ведёт трубу
  // от входа потребителя к ближайшей клетке сети поставщика, а не тянет вторую трубу рядом с первой; уже связанные
  // линии второй раз не связываются.
  const parent = new Map<string, string>();
  const network = new Map<string, Vec3[]>();
  const lineId = (line: readonly Vec3[], kind: string) => `${kind}@${keyOf(line[0])}`;
  const root = (id: string): string => {
    const up = parent.get(id) ?? id;
    return up === id ? id : root(up);
  };
  const join = (a: string, b: string, path: readonly Vec3[]) => {
    const [ra, rb] = [root(a), root(b)];
    const merged = [...(network.get(ra) ?? []), ...(ra === rb ? [] : network.get(rb) ?? []), ...path];
    parent.set(rb, ra);
    network.set(ra, merged);
  };
  for (const [index, link] of usable.entries()) {
    if (index > 0 && index % CHUNK.side === 0) await yieldToBrowser();
    const start = link.from[link.from.length - 1];
    const goal = link.to[link.to.length - 1];
    promise(start, -1);
    promise(goal, -1);
    const [fromId, toId] = [lineId(link.from, link.kind), lineId(link.to, link.kind)];
    for (const [id, line] of [[fromId, link.from], [toId, link.to]] as const) if (!network.has(root(id))) network.set(root(id), [...line]);
    if (root(fromId) === root(toId)) continue;
    const sources = network.get(root(fromId)) ?? link.from;
    // Предметная шина принимает несколько материалов. Следующий поставщик может влиться в уже подведённую трубу.
    const sinks = /item/i.test(link.kind) ? network.get(root(toId)) ?? link.to : link.to;
    // Длина пути по эстакаде (по самой близкой дорожке): обход нужен строго короче.
    const viaRack = east - start[0] + Math.abs(top - start[1]) + Math.abs(goal[2] - start[2]) + Math.abs(top - goal[1]) + east - goal[0];
    const area = {
      min: [Math.min(start[0], goal[0]) - routeMargin, 0, Math.min(start[2], goal[2]) - routeMargin] as Vec3,
      max: [Math.min(Math.max(start[0], goal[0]) + routeMargin, east - 1), top, Math.max(start[2], goal[2]) + routeMargin] as Vec3,
    };
    const volume = [0, 1, 2].reduce((product, axis) => product * (area.max[axis] - area.min[axis] + 1), 1);
    // Конец линии на земле (жидкостная линия электрических построек) иначе недостижим: соседняя земля закрыта под кабели.
    // Шаг на землю вплотную к концам своей связи — можно.
    const ends = new Set([...sources, ...sinks].flatMap((end) => (["px", "nx", "pz", "nz"] as const).map((side) => keyOf(move(end, side)))));
    const own = { has: (key: string) => !(ends.has(key) && !reserved.has(key) && !columns.has(key)) && blocked.has(key) };
    // Трубы — низко: сперва путь не выше блока над верхним из концов связи, и только если так не пройти — выше.
    const lowWithin: Box = { min: within.min, max: [within.max[0], Math.max(start[1], goal[1]) + 1, within.max[2]] };
    const terminals = new Set([...link.from, ...link.to].map(keyOf));
    const portStep = (from: Vec3, to: Vec3) => pipeStepInsideChunk(from, to) || terminals.has(keyOf(from)) || terminals.has(keyOf(to));
    // Ищем от входа потребителя к любой клетке сети поставщика; путь потом разворачиваем (от сети к потребителю).
    const search = (box: Box, clamp: Box, maxSteps?: number) => findPath(next, goal, sources, 0, box, {
      starts: sinks, blocked: own, maxSteps, clamp, allows, allowsStep: pipeStepInsideChunk,
    })?.toReversed();
    const isNear = volume <= Math.min(shortcutVolume, volumePerLink);
    // Под машинами, над ними и в соседней клетке. При занятом проходе остаётся поиск по всему чанку.
    const close = isNear && nearEquipment ? findPath(next, goal, sources, 0, area, {
      starts: sinks, blocked: own, maxSteps: viaRack - 1, clamp: within,
      allows: (cell) => allows(cell) && (terminals.has(keyOf(cell)) || nearEquipment(cell)),
      allowsStep: pipeStepInsideChunk,
    })?.toReversed() : undefined;
    const shortcut =
      close ??
      (isNear ? search(area, lowWithin, viaRack - 1) : undefined) ??
      (canSearchAll ? search(all, lowWithin) : undefined) ??
      (isNear ? search(area, within, canSearchAll ? viaRack - 1 : undefined) : undefined) ??
      (canSearchAll ? search(all, within) : undefined) ??
      // Вход потребителя замурован (своя линия, земля, машина) — ищем наоборот: от конца линии поставщика к любой
      // клетке линии потребителя.
      (canSearchAll ? findPath(next, start, sinks, 0, all, { starts: sources, blocked: own, clamp: within, allows, allowsStep: portStep }) : undefined);
    if (shortcut) {
      layShortcut(next, shortcut, link.kind, linkTo);
      join(fromId, toId, [...link.to, ...shortcut]);
      continue;
    }
    // Фабрику целиком обойти можно, а пути нет (вход потребителя замурован соседними линиями) — эстакада прошла бы
    // сквозь постройки: трубу не кладём, фабрика об этом напишет.
    if (canSearchAll) {
      unlinked.push(link.original);
      continue;
    }
    const low = Math.min(start[2], goal[2]);
    const high = Math.max(start[2], goal[2]);
    let lane = lanes.findIndex((taken) => taken.every(([a, b]) => high < a - 1 || low > b + 1));
    if (lane === -1) lane = lanes.push([]) - 1;
    lanes[lane].push([low, high]);
    const x = east + lane;
    const path: Vec3[] = [
      ...span(start[0] + 1, x).map((cx): Vec3 => [cx, start[1], start[2]]),
      ...span(start[1] + 1, top).map((cy): Vec3 => [x, cy, start[2]]),
      ...span(start[2], goal[2]).slice(1).map((cz): Vec3 => [x, top, cz]),
      ...span(top - 1, goal[1]).map((cy): Vec3 => [x, cy, goal[2]]),
      ...span(x - 1, goal[0] + 1).map((cx): Vec3 => [cx, goal[1], goal[2]]),
    ];
    const route = [start, ...path, goal];
    if (!path.every((cell) => allows(cell) && !next.has(keyOf(cell))) ||
      !route.slice(1).every((cell, index) => pipeStepInsideChunk(route[index], cell))) {
      unlinked.push(link.original);
      continue;
    }
    linkTo(start, "px");
    linkTo(goal, "px");
    layInto(next, { path, kind: link.kind, startLink: "nx", endLink: "nx" });
    join(fromId, toId, [...link.to, ...path]);
  }
  return next;
}

/**
 * Убирает тупики труб: кусок трубы, у которого одна связь (или ни одной), и та — к трубе, никуда не ведёт: ни к
 * машине, ни к люку, ни к ёмкости (например, начало линии ряда, где место под сундук сырья осталось пустым, а сырьё
 * пришло трубой). Убираем по одному, пока такие есть, и стираем у соседа связь в убранную клетку.
 */
function pruneStubs(grid: Grid): Grid {
  const next = new Map(grid);
  const isPipe = (cell: Cell | undefined) => cell !== undefined && /pipe/i.test(cell.kind);
  const isStub = (key: string) => {
    const cell = next.get(key);
    if (!isPipe(cell) || !cell) return false;
    const links = cell.links ?? [];
    return links.length <= 1 && links.every((side) => isPipe(next.get(keyOf(move(cellOf(key), side)))));
  };
  let queue = [...next.keys()].filter(isStub);
  while (queue.length > 0) {
    const touched: string[] = [];
    for (const key of queue) {
      const cell = next.get(key);
      if (!cell || !isStub(key)) continue;
      next.delete(key);
      for (const side of cell.links ?? []) {
        const neighbourKey = keyOf(move(cellOf(key), side));
        const neighbour = next.get(neighbourKey);
        if (!neighbour) continue;
        next.set(neighbourKey, { ...neighbour, links: (neighbour.links ?? []).filter((back) => keyOf(move(cellOf(neighbourKey), back)) !== key) });
        touched.push(neighbourKey);
      }
    }
    queue = touched.filter(isStub);
  }
  return next;
}

/** Кладёт обход: path идёт от клетки линии-источника к клетке линии-потребителя; концы — уже трубы, к ним отростки. */
function layShortcut(next: Map<string, Cell>, path: readonly Vec3[], kind: string, linkTo: (cell: Vec3, side: Face) => void): void {
  if (path.length <= 1) return;
  const start = path[0];
  const goal = path[path.length - 1];
  linkTo(start, sideTo(start, path[1]));
  linkTo(goal, sideTo(goal, path[path.length - [0, 0].length]));
  const inner = path.slice(1, -1);
  if (inner.length === 0) return;
  layInto(next, { path: inner, kind, startLink: sideTo(inner[0], start), endLink: sideTo(inner[inner.length - 1], goal) });
}

/** Сколько копий шага рисовать: не больше maxCopies и не больше maxBlocksPerStep блоков построек (CALC.factory). */
function drawnCopies(step: Step): number {
  const { maxCopies, maxBlocksPerStep } = CALC.factory;
  const blocks = step.crafter.machine ? step.crafter.machine.def.layers.flat().join("").replaceAll(" ", "").length : 1;
  return Math.min(step.machines, maxCopies, Math.max(1, Math.floor(maxBlocksPerStep / blocks)));
}

/**
 * Порядок рядов цепочкой: обход от цели к сырью, каждый шаг ставится сразу после тех, кто его снабжает. Так ресурс,
 * который сразу идёт на следующую обработку, переходит в соседний ряд, и труба между ними короткая. По уровню от сырья
 * между поставщиком и потребителем вклинивались чужие ряды.
 */
export function chainOrder(steps: readonly Step[], target: number): readonly Step[] {
  const makes = new Map<number, Step>();
  for (const step of steps) makes.set(step.goods, step);
  for (const step of steps) for (const output of step.outputs) if (!makes.has(output.goods.ptr)) makes.set(output.goods.ptr, step);
  const done = new Set<Step>();
  const order: Step[] = [];
  const visit = (step: Step): void => {
    if (done.has(step)) return;
    done.add(step);
    for (const input of step.inputs) {
      const source = makes.get(input.goods.ptr);
      if (source) visit(source);
    }
    order.push(step);
  };
  const last = makes.get(target);
  if (last) visit(last);
  steps.forEach(visit);
  return order;
}

/** Сколько копий шага влезает в чанк: одноблочные стоят вплотную, кирпичные — по 2 блока на печь плюс стенка. */
function perChunk(step: Step): number {
  const building = step.crafter.kind === "multi" ? step.crafter.machine : undefined;
  if (!building) return Math.floor((CHUNK.side + WEST) / (mixedOutputs(step) ? 2 : 1));
  if (PRIMITIVE.has(building.name)) return Math.floor((CHUNK.side + WEST - 1) / [0, 0].length);
  if (isQuad(building)) return copiesPerChunk(QUAD.side + 1, WEST, 0) * QUAD.furnaces.length;
  return copiesPerChunk(sizeOf(building).width, WEST, gapOf(building));
}

/**
 * На сколько опустить группу шага, чтобы она не делилась между чанками: пробно ставим её первый ряд в пустую сетку,
 * по нему считаем, сколько места займут все ряды. Группа длиннее чанка — 0 (её ряды выравнивает electricRow).
 */
function groupShift(step: Step, copies: number, perBand: number, z: number, tierId: string): number {
  const trial = slotFor(new Map(), step, Math.min(perBand, copies), z, tierId, {});
  if (trial.grid.size === 0) return 0;
  const box = boxOf([...trial.grid.keys()].map(cellOf));
  const rows = Math.ceil(copies / perBand);
  return shiftIntoChunk(box.min[2] - (rows - 1) * (z - trial.nextZ), box.max[2]);
}

/** Ход сборки: сколько этапов сделано из скольких и что делается сейчас. */
export interface BuildProgress {
  readonly done: number;
  readonly total: number;
  readonly label: string;
}

/** Отдать ход браузеру, чтобы он успел перерисовать полоску загрузки. */
const yieldToBrowser = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** Ряд для шага: какой раскладкой ставить его машины. */
function slotFor(grid: Grid, step: Step, copies: number, z: number, tierId: string, extraKinds: Record<string, BlockKind>): Slot {
  const building = step.crafter.kind === "multi" ? step.crafter.machine : undefined;
  if (!building) {
    const kind = kindId(step.crafter.label);
    extraKinds[kind] = singleBlock(step, tierId);
    return singleRow(grid, step, copies, z, kind);
  }
  Object.assign(extraKinds, building.def.extraKinds ?? {});
  if (isQuad(building)) return quadRow(grid, step, copies, z);
  if (!PRIMITIVE.has(building.name)) return electricRow(grid, step, building, copies, z);
  return building.slug === "coke-oven" ? cokeRow(grid, step, building, copies, z) : brickedRow(grid, step, building, copies, z);
}

/**
 * Строит фабрику по плану; slug — своё имя для сцены (план с другими числами — другая фабрика).
 * Считает по этапам (ряд за рядом, трубы, энергия) и между ними отдаёт ход браузеру — onProgress видит каждый этап.
 */
/** Подписи фабрики на языке страницы (их даёт калькулятор — components/calc/text.tsx). */
export interface FactoryText {
  readonly t: (ru: string, en: string) => string;
  readonly name: (goods: Goods) => string;
  readonly crafter: (crafter: Crafter) => string;
  readonly number: (value: number, digits?: number) => string;
}

const RUSSIAN: FactoryText = {
  t: (ru) => ru,
  name: (goods) => goods.name,
  crafter: (crafter) => crafter.label,
  number: (value, digits = 0) => value.toLocaleString("ru-RU", { minimumFractionDigits: digits, maximumFractionDigits: digits }),
};

/** Строка потока для плашки: «Кислород — 416,7 л/мин». */
function flowLine(flow: Flow, text: FactoryText): string {
  const unit = flow.goods.kind === "fluid" ? text.t("л/мин", "L/min") : text.t("шт/мин", "/min");
  return `${text.name(flow.goods)} — ${text.number(flow.perSecond * CALC.ui.secondsPerMinute, 1)} ${unit}`;
}

/** Строка сводки «Трубы и кабели»: какая труба или кабель, сколько блоков и почему такая. */
export interface FactoryConduit {
  readonly label: string;
  readonly blocks: number;
  readonly detail: string;
}

/**
 * Какой кабель класть: с наименьшей потерей из тех, что калькулятор умеет сделать на ярусе (conduits.ts); без списка
 * (тесты, сцены сайта) — кабель яруса из материала корпуса. label — название на языке страницы (как в игре).
 */
function cableSpec(cable: Energy["cable"], tierId: string, text: FactoryText, options: FactoryOptions) {
  const rankOf = (id: string) => TIERS.findIndex((tier) => tier.id === id);
  const choice = options.cables ? chooseCable(options.cables, rankOf, rankOf(tierId), cable.amps) : undefined;
  const material = choice?.offer.material ?? CALC.cableMaterials[tierId] ?? "";
  const form = choice?.offer.form ?? "Cable";
  const perAmp = choice?.offer.amps ?? PRODUCTION.cableAmps[tierId as keyof typeof PRODUCTION.cableAmps] ?? 1;
  const [, , tableLoss] = CALC.cables[material] ?? [];
  const loss = choice?.offer.loss ?? tableLoss ?? 0;
  const size = choice?.size ?? cable.size;
  const name = `${size}x ${material} ${form}`;
  const goods = options.goodsNamed?.(name);
  return { name, goods, label: goods ? text.name(goods) : name, perAmp, loss, size };
}

/** Труба на фабрике: сколько тянет и сколько нужно, сколько рядом, самая горячая жидкость в ней и её жаростойкость. */
interface PipeUse {
  readonly isFluid: boolean;
  readonly perSecond: number;
  readonly parallel: number;
  readonly capacity: number;
  readonly kelvin: number;
  readonly heat: number;
}

/** Сводка труб и кабелей: трубы — по тому, что выбрал pipeFor, кабель — по току генераторов (powerFor). */
function conduitList(
  pipeUse: ReadonlyMap<string, PipeUse>,
  cable: Energy["cable"] | undefined,
  kinds: readonly string[],
  extraKinds: Readonly<Record<string, BlockKind>>,
  tierId: string,
  text: FactoryText,
  options: FactoryOptions,
  average: number,
  run: CableRun | undefined,
): readonly FactoryConduit[] {
  const { t, number } = text;
  const blocks = new Map<string, number>();
  for (const kind of kinds) blocks.set(kind, (blocks.get(kind) ?? 0) + 1);
  const pipes = [...pipeUse.entries()].flatMap(([id, use]): FactoryConduit[] => {
    const unit = use.isFluid ? t("л/с", "L/s") : t("шт/с", "items/s");
    const side = use.parallel > 1 ? ` · ${t("нужно раздельных каналов", "separate channels needed")}: ${use.parallel}` : "";
    // Горячая жидкость — пишем, сколько градусов и сколько держит труба: тонкие пластиковые трубы пар прожигает.
    const hot = use.isFluid && use.kelvin > CALC.pipes.roomKelvin ? t(` · жидкость до ${number(use.kelvin)} K, труба держит ${number(use.heat)} K`, ` · fluid up to ${number(use.kelvin)} K, the pipe holds ${number(use.heat)} K`) : "";
    const detail = `${t("тянет", "carries")} ${number(use.capacity)} ${unit}, ${t("нужно до", "needs up to")} ${number(use.perSecond, 1)} ${unit}${side}${hot}`;
    return (blocks.get(id) ?? 0) > 0 ? [{ label: extraKinds[id]?.label ?? id, blocks: blocks.get(id) ?? 0, detail }] : [];
  });
  if (!cable) return pipes;
  const { name, label, perAmp, loss, size } = cableSpec(cable, tierId, text, options);
  // Один кабель держит толщина × ампер на жилу; не хватает — нужно несколько рядом.
  const carries = size * perAmp;
  const parallel = Math.ceil(cable.amps / carries);
  const side = parallel > 1 ? t(` · один держит ${carries} А — нужно рядом: ${parallel}`, ` · one carries ${carries} A — side by side: ${parallel}`) : "";
  const networks = cable.networks > 1
    ? t(
        `${cable.networks} отдельных сетей: у каждого ряда генераторов свой кабель, в сети до ${cable.amps} А при ${number(cable.voltage)} В (по амперу с генератора) — один кабель на все генераторы сгорел бы; машины поделены между сетями по их потреблению`,
        `${cable.networks} separate networks: each row of generators has its own cable, up to ${cable.amps} A at ${number(cable.voltage)} V per network (one amp per generator) — one cable for all generators would burn; machines are split between networks by their use`,
      )
    : t(
        `${cable.amps} А при ${number(cable.voltage)} В: по амперу с каждого генератора; отводы к люкам — тот же кабель`,
        `${cable.amps} A at ${number(cable.voltage)} V: one amp from each generator; branches to the hatches — the same cable`,
      );
  const detail = networks + side + lossText(loss, cable.voltage, average, run, text);
  return [...pipes, { label, blocks: blocks.get(cable.kind) ?? 0, detail }];
}

/** Сколько блоков кабеля от генераторов до машин: в среднем и до самой дальней. */
interface CableRun {
  readonly mean: number;
  readonly max: number;
}

/**
 * Потери в кабеле (вики GTNH, Electricity): каждый ампер теряет loss EU на блок. Ток фабрики — average / voltage ампер,
 * в среднем он проходит run.mean блоков; ампер доходит только на voltage / loss блоков.
 */
function lossText(loss: number, voltage: number, average: number, run: CableRun | undefined, text: FactoryText): string {
  const { t, number } = text;
  if (loss === 0) return t(" · без потерь", " · lossless");
  if (!run) return t(` · теряет ${loss} EU на блок на ампер`, ` · loses ${loss} EU per block per amp`);
  const lost = cableLoss(average / voltage, run.mean, loss);
  const reach = cableReach(voltage, loss);
  const share = number((lost / average) * CALC.ui.percent, 1);
  const extra = Math.ceil(lost / voltage);
  const base = t(
    ` · теряет ${loss} EU на блок на ампер: до машин в среднем ${number(run.mean)} блоков кабеля — уходит ≈${number(lost)} EU/t (${share}% потребления), это ещё ${extra} генер.; ампер доходит на ${number(reach)} блоков`,
    ` · loses ${loss} EU per block per amp: ${number(run.mean)} blocks of cable to the machines on average — ≈${number(lost)} EU/t lost (${share}% of use), ${extra} more generators; an amp reaches ${number(reach)} blocks`,
  );
  return run.max > reach ? base + t(` — до дальних машин (${number(run.max)} блоков) ток не дойдёт`, ` — the farthest machines (${number(run.max)} blocks) get no power`) : base;
}

/** Длина кабеля от генераторов до каждого выхода люка: поиск в ширину по клеткам кабеля от клеток рядом с генераторами. */
function cableRun(grid: Grid, cableKind: string, generatorKind: string, exits: readonly Vec3[]): CableRun | undefined {
  const distance = new Map<string, number>();
  const queue: Vec3[] = [];
  const visit = (cell: Vec3, value: number) => {
    const key = keyOf(cell);
    if (distance.has(key) || grid.get(key)?.kind !== cableKind) return;
    distance.set(key, value);
    queue.push(cell);
  };
  for (const [key, cell] of grid) if (cell.kind === generatorKind) FACES.forEach((side) => visit(move(cellOf(key), side), 0));
  for (let index = 0; index < queue.length; index += 1) {
    const value = (distance.get(keyOf(queue[index])) ?? 0) + 1;
    FACES.forEach((side) => visit(move(queue[index], side), value));
  }
  const lengths = exits.map((exit) => distance.get(keyOf(exit))).filter((value): value is number => value !== undefined);
  return lengths.length === 0 ? undefined : { mean: lengths.reduce((sum, value) => sum + value, 0) / lengths.length, max: Math.max(...lengths) };
}

const FACES: readonly Face[] = ["px", "nx", "py", "ny", "pz", "nz"];

/** Строка сводки про топливо генераторов: сколько литров в минуту при КПД генератора; без выбранного топлива — ничего. */
function fuelLine(peak: number, fuel: Fuel | undefined, text: FactoryText, steamPlant?: ReturnType<typeof steamPlantFor>): readonly FactoryConduit[] {
  if (!fuel) return [];
  const { t, number } = text;
  const perSecond = fuelPerSecond(peak, fuel);
  const perMinute = perSecond * CALC.ui.secondsPerMinute;
  if (fuel.steam && steamPlant) {
    const { boiler } = fuel.steam;
    const plant = steamPlant;
    const feed = plant.coalPerMinute !== undefined
      ? t(`, угля ${number(plant.coalPerMinute, 1)} в минуту`, `, ${number(plant.coalPerMinute, 1)} coal per minute`)
      : plant.lavaPerSecond !== undefined
        ? t(`, лавы ${number(plant.lavaPerSecond)} л/с`, `, ${number(plant.lavaPerSecond)} L/s of lava`)
        : t(", пар только днём и без накипи", ", steam only by day and without scale");
    const detail = t(
      `${number(perMinute)} л пара в минуту (${number(1 / fuel.euPerLitre, 2)} л на 1 EU): котлов ${plant.boilers} по ${number(fuel.steam.steamPerSecond)} л/с, воды ${number(plant.water, 1)} л/с${feed}`,
      `${number(perMinute)} L of steam per minute (${number(1 / fuel.euPerLitre, 2)} L per EU): ${plant.boilers} boilers at ${number(fuel.steam.steamPerSecond)} L/s, ${number(plant.water, 1)} L/s of water${feed}`,
    );
    return [{ label: `${t("Пар", "Steam")}: ${t(boiler.title, boiler.name)} × ${plant.boilers}`, blocks: 0, detail }];
  }
  const share = number(fuel.efficiency * CALC.ui.percent);
  const detail = fuel.isItem
    ? t(
        `${number(perMinute, 2)} шт/мин: ${number(fuel.euPerLitre)} EU со штуки, КПД ${share}%, на пике ${number(peak)} EU/t`,
        `${number(perMinute, 2)} per minute: ${number(fuel.euPerLitre)} EU per piece, efficiency ${share}%, ${number(peak)} EU/t at peak`,
      )
    : t(
        `${number(perMinute, 1)} л/мин: ${number(fuel.euPerLitre, 1)} EU с литра, КПД ${share}%, на пике ${number(peak)} EU/t`,
        `${number(perMinute, 1)} L/min: ${number(fuel.euPerLitre, 1)} EU per litre, efficiency ${share}%, ${number(peak)} EU/t at peak`,
      );
  return [{ label: `${t("Топливо", "Fuel")}: ${text.name(fuel.goods)}`, blocks: 0, detail }];
}

/** Что фабрике знать про трубы и кабели из калькулятора: какие трубы можно сделать на ярусе и товары по имени. */
export interface FactoryOptions {
  /** Трубы, которые калькулятор умеет сделать на ярусе плана, с ёмкостью и ценой (conduits.ts: pipeOffers). */
  readonly pipes?: readonly PipeOffer[];
  /** Товар выгрузки по английскому имени — для названия кабеля («2x Tin Cable») на языке страницы. */
  readonly goodsNamed?: (name: string) => Goods | undefined;
  /** Генератор и топливо, что выбрал игрок (power.ts); без выбора — привычный генератор яруса. */
  readonly power?: PowerChoice;
  /** Кабели, которые калькулятор умеет сделать на ярусе плана (conduits.ts: cableOffers). */
  readonly cables?: readonly CableOffer[];
}

/**
 * Собирает группу шага в своих координатах: ряды от z = −2 (первый ряд и его труба выхода — за границей чанка z = 0)
 * к −z, первый ряд — главный (с ним связаны другие шаги), остальные цепляются к предыдущему.
 */
function buildGroup(step: Step, copies: number, perBand: number, tierId: string, extraKinds: Record<string, BlockKind>): Group {
  let grid: Grid = new Map();
  let z = -[0, 0].length;
  z -= groupShift(step, copies, perBand, z, tierId);
  let head: Placed | undefined;
  let previous: Placed | undefined;
  const bands: { previous: Placed; band: Placed }[] = [];
  for (let first = 0; first < copies; first += perBand) {
    const slot = slotFor(grid, step, Math.min(perBand, copies - first), z, tierId, extraKinds);
    grid = slot.grid;
    z = slot.nextZ;
    if (previous) bands.push({ previous, band: slot.placed });
    else head = slot.placed;
    previous = slot.placed;
  }
  if (!head) throw new Error(`У шага ${step.crafter.label} нет машин`);
  return { grid, head, bands };
}

/**
 * Одноблочных машин много — сначала они заполняют чанк по глубине (ряды до 16 блоков), следующие ряды — этажом выше,
 * а не дальше по земле. Первый ряд этажа цепляется трубой к первому ряду этажа под ним.
 */
function singleFloor(step: Step, perBand: number, tierId: string, extraKinds: Record<string, BlockKind>) {
  const depthOf = (group: Group) => {
    const box = footprintOf(group);
    return box.max[2] - box.min[2] + 1;
  };
  const one = buildGroup(step, perBand, perBand, tierId, extraKinds);
  const band = depthOf(buildGroup(step, perBand * [0, 0].length, perBand, tierId, extraKinds)) - depthOf(one);
  const rows = Math.max(1, 1 + Math.floor((CHUNK.side - depthOf(one)) / Math.max(1, band)));
  const narrow = Math.max(1, perBand - 1);
  const height = footprintOf(one).max[1] + 1;
  return { wide: rows * perBand, narrow, perFloor: rows * narrow, height };
}

function buildFloors(step: Step, copies: number, perBand: number, tierId: string, extraKinds: Record<string, BlockKind>, floor?: ReturnType<typeof singleFloor>): Group {
  if (!floor || copies <= floor.wide) return buildGroup(step, copies, perBand, tierId, extraKinds);
  // Этажей несколько — в ряду на машину меньше: свободный столбец сбоку — шахта, по которой кабели и трубы спускаются
  // с верхних этажей (иначе этажи вплотную замуровывают их).
  const { narrow, perFloor, height } = floor;
  const floors: Group[] = [];
  for (let first = 0; first < copies; first += perFloor) floors.push(buildGroup(step, Math.min(perFloor, copies - first), narrow, tierId, extraKinds));
  // Этажи вплотную: машину сверху и снизу закрывают её же кабель и труба, а машины касаются друг друга только боками,
  // которые трубам не нужны.
  const lifted = floors.map((floor, level) => {
    const by: Vec3 = [0, level * height, 0];
    // Один поднятый ряд на каждый ряд этажа: связь «ряд → предыдущий» потом ищется по самому объекту ряда.
    const rows = new Map([floor.head, ...floor.bands.map(({ band }) => band)].map((row) => [row, shiftPlaced(row, by)]));
    const liftedRow = (row: Placed) => rows.get(row) ?? shiftPlaced(row, by);
    return {
      cells: [...floor.grid.entries()].map(([key, cell]): readonly [Vec3, Cell] => [shiftCell(cellOf(key), by), cell]),
      head: liftedRow(floor.head),
      bands: floor.bands.map((link) => ({ previous: liftedRow(link.previous), band: liftedRow(link.band) })),
    };
  });
  // Первый ряд этажа — прямо над первым рядом этажа под ним: трубу между ними кладём коротким столбиком.
  return {
    grid: withCells(new Map(), lifted.flatMap((floor) => floor.cells)),
    head: lifted[0].head,
    bands: lifted.flatMap((floor, level) => [...(level > 0 ? [{ previous: lifted[level - 1].head, band: floor.head }] : []), ...floor.bands]),
  };
}

/** Группа шага, собранная отдельно: её блоки, главный ряд и ряды, что цепляются к предыдущему. */
interface Group {
  readonly grid: Grid;
  readonly head: Placed;
  readonly bands: readonly { readonly previous: Placed; readonly band: Placed }[];
}

const shiftCell = (cell: Vec3, by: Vec3): Vec3 => [cell[0] + by[0], cell[1] + by[1], cell[2] + by[2]];
const shiftLine = (line: Line, by: Vec3): Line => ({
  ...line,
  cells: line.cells.map((cell) => shiftCell(cell, by)),
  spurs: line.spurs.map((spur) => ({ ...spur, path: spur.path.map((cell) => shiftCell(cell, by)) })),
});
const shiftPlaced = (row: Placed, by: Vec3): Placed => ({
  ...row,
  itemIn: shiftLine(row.itemIn, by),
  fluidIn: shiftLine(row.fluidIn, by),
  itemOut: shiftLine(row.itemOut, by),
  fluidOut: shiftLine(row.fluidOut, by),
  consumers: row.consumers.map((consumer) => ({ ...consumer, hatch: shiftCell(consumer.hatch, by) })),
});

const turnCell = ([x, y, z]: Vec3): Vec3 => [-z, y, x];
const TURN_FACE: Readonly<Record<Face, Face>> = { px: "pz", pz: "nx", nx: "nz", nz: "px", py: "py", ny: "ny" };

function turnGroup(group: Group): Group {
  const lineOf = (line: Line): Line => ({
    startFace: TURN_FACE[line.startFace ?? "nx"],
    cells: line.cells.map(turnCell),
    spurs: line.spurs.map(({ path, end }) => ({ path: path.map(turnCell), end: TURN_FACE[end] })),
  });
  const rows = new Map([group.head, ...group.bands.map(({ band }) => band)].map((row) => [row, {
    ...row, itemIn: lineOf(row.itemIn), itemOut: lineOf(row.itemOut), fluidIn: lineOf(row.fluidIn), fluidOut: lineOf(row.fluidOut),
    consumers: row.consumers.map(({ hatch, face }) => ({ hatch: turnCell(hatch), face: TURN_FACE[face] })),
  }]));
  return {
    grid: new Map([...group.grid].map(([key, cell]) => [keyOf(turnCell(cellOf(key))), {
      ...cell, face: cell.face && TURN_FACE[cell.face], links: cell.links?.map((face) => TURN_FACE[face]),
    }])),
    head: rows.get(group.head)!,
    bands: group.bands.map(({ previous, band }) => ({ previous: rows.get(previous)!, band: rows.get(band)! })),
  };
}

/**
 * Сколько места занимает группа: её блоки, линии труб, столбец слева (x = WEST) под воронки сырья и баки излишков и
 * всё от земли (y = 0): кабели одноблочных машин кладутся позже, под машинами.
 */
function footprintOf(group: Group): Box {
  const rows = [group.head, ...group.bands.map(({ band }) => band)];
  const cells = [...[...group.grid.keys()].map(cellOf), ...rows.flatMap((row) => [
    ...[row.itemIn, row.fluidIn, row.itemOut, row.fluidOut].flatMap((line) => [
      ...line.cells, ...line.spurs.flatMap(({ path }) => path),
    ]),
    ...row.consumers.map(({ hatch, face }) => move(hatch, face)),
  ])];
  const box = boxOf(cells);
  return { min: [Math.min(box.min[0], WEST), 0, box.min[2]], max: box.max };
}

/** Компактная группа одного рецепта. Общая стена допустима только из одинаковых сплошных блоков. */
export function sharedCluster(step: Step, building: Machine, count: number, otherSteps: readonly Step[] = [], separation: readonly [number, number] = [0, 0], alongDepth = false): Group | undefined {
  if (!canShareWalls(building)) return undefined;
  const independent = otherSteps.length > 0;
  const [sideOffset, rearOffset] = separation;
  const kinds = kindsOf(building);
  const model = placeMachine(new Map(), building, [0, 0, 0], kinds, true);
  const { min, max } = boxOf([...model.grid.keys()].map(cellOf));
  const shared = new Set<string>();
  const bodies: Vec3[][] = [];
  const cells = new Map<string, Cell>();
  for (const [r, c] of QUAD.furnaces.slice(0, count)) {
    const [row, column] = alongDepth ? [c, r] : [r, c];
    const body: Vec3[] = [];
    for (const [key, cell] of model.grid) {
      const [x, y, z] = cellOf(key);
      const rear = row > 0;
      const orientedX = rear ? min[0] + max[0] - x : x;
      const at: Vec3 = [orientedX + (column > 0 ? max[0] - min[0] + sideOffset : 0), y + QUAD.floor, rear ? min[2] * 2 - z - rearOffset : z];
      const id = keyOf(at);
      const other = cells.get(id);
      const original = cell.face ?? (kinds[cell.kind]?.face?.rule === "front" ? "pz" : undefined);
      const face = rear && original && original !== "py" && original !== "ny" ? OPPOSITE[original] : original;
      const oriented = face ? { ...cell, face } : cell;
      if (other) {
        if (!canOverlap(other, oriented)) return undefined;
        shared.add(id);
      } else {
        cells.set(id, oriented);
      }
      if (!cell.isHollow) body.push(at);
    }
    bodies.push(body);
  }
  if (shared.size === 0 && !independent) return undefined;
  for (const [key, cell] of cells) {
    if (!/controller|muffler/i.test(cell.kind)) continue;
    const face = cell.face ?? (/muffler/i.test(cell.kind) ? "py" : "pz");
    if (cells.has(keyOf(move(cellOf(key), face)))) return undefined;
  }
  let grid: Grid = cells;
  const rows: Placed[] = [];
  const exits = new Set<string>();
  const used = [...shared];
  // В этих двух схемах код мода разрешает обслуживание на нижнем корпусе.
  const maintenanceCasing = isQuad(building) ? "heatproof" : building.slug === "alloy-blast-smelter" ? "absCasing" : undefined;
  const serviced = new Set<number>();
  const commonPorts = new Map<string, { readonly line: Line; readonly owners: readonly number[] }[]>();
  const ownersOf = (key: string) => bodies.flatMap((body, index) => body.some((part) => keyOf(part) === key) ? [index] : []);
  if (maintenanceCasing) {
    for (const key of shared) {
      const cell = cellOf(key);
      const out = move(cell, "ny");
      if (cell[1] !== QUAD.floor || grid.get(key)?.kind !== maintenanceCasing || grid.has(keyOf(out))) continue;
      const owners = ownersOf(key);
      if (owners.length < 2 || owners.some((owner) => serviced.has(owner))) continue;
      grid = withCells(grid, [[cell, { kind: "maintenance", face: "ny" }]]);
      exits.add(keyOf(out));
      owners.forEach((owner) => serviced.add(owner));
    }
  }
  try {
    for (const [index, body] of bodies.entries()) {
      const recipe = index === 0 ? step : otherSteps[index - 1] ?? step;
      const bottom = body.filter((cell) => cell[1] === QUAD.floor);
      const port = (needed: boolean, kind: string): Line => {
        if (!needed) return NO_LINE;
        if (!independent && maintenanceCasing && kind !== "maintenance") {
          const existing = commonPorts.get(kind) ?? [];
          const samePort = existing.find(({ owners }) => owners.includes(index));
          if (samePort) return samePort.line;
          for (const cell of bottom) {
            const key = keyOf(cell);
            const out = move(cell, "ny");
            if (!shared.has(key) || grid.get(key)?.kind !== maintenanceCasing || exits.has(keyOf(out)) || grid.has(keyOf(out))) continue;
            const owners = ownersOf(key).filter((owner) => owner >= index);
            if (owners.length < 2) continue;
            const line: Line = { cells: [out], spurs: [{ path: [out], end: "py" }] };
            grid = withCells(grid, [[cell, { kind, face: "ny" }]]);
            exits.add(keyOf(out));
            commonPorts.set(kind, [...existing, { line, owners }]);
            return line;
          }
        }
        for (const wall of ["pz", "nz", "px", "nx"] as const) {
          try {
            const avoid = bottom.filter((cell) => exits.has(keyOf(move(cell, wall)))).map(keyOf);
            const hatch = addHatch(grid, bottom, kind, wall, [...used, ...avoid]);
            grid = hatch.grid;
            used.push(keyOf(hatch.hatch));
            exits.add(keyOf(hatch.out));
            return { cells: [hatch.out], spurs: [{ path: [hatch.out], end: OPPOSITE[wall] }] };
          } catch {
            // Пробуем следующую свободную стену.
          }
        }
        // У корпуса в углу квадрата двух наружных стен может не хватить. Тогда ставим шину в свободную клетку дна.
        const floor = bottom.find((cell) => {
          const key = keyOf(cell);
          const part = grid.get(key);
          return part && !used.includes(key) && !SERVICE_KIND.test(part.kind) && !exits.has(keyOf(move(cell, "ny")));
        });
        if (!floor) throw new Error("Нет свободной стороны для люка");
        const out = move(floor, "ny");
        grid = withCells(grid, [[floor, { kind, face: "ny" }]]);
        used.push(keyOf(floor));
        exits.add(keyOf(out));
        return { cells: [out], spurs: [{ path: [out], end: "py" }] };
      };
      const itemIn = port(recipe.inputs.some(({ goods }) => goods.kind === "item"), "inputBus");
      const fluidIn = port(recipe.inputs.some(({ goods }) => goods.kind === "fluid"), "inputHatch");
      const itemOut = port(hasOutput(recipe, false), "outputBus");
      const fluidOut = port(hasOutput(recipe, true), "outputHatch");
      if (isQuad(building) && !bottom.some((cell) => grid.get(keyOf(cell))?.kind === "maintenance")) port(true, "maintenance");
      grid = withoutSpareHatches(grid, bottom, used);
      const energy = independent ? {
        grid,
        hatches: bottom.filter((cell) => !used.includes(keyOf(cell)) && !SERVICE_KIND.test(grid.get(keyOf(cell))?.kind ?? ""))
          .slice(0, PRODUCTION.hatchesPerMachine).map((hatch) => ({ hatch, face: "ny" as const })),
      } : poweredFrom(grid, body, used, true);
      if (independent && energy.hatches.length !== PRODUCTION.hatchesPerMachine) return undefined;
      if (energy.hatches.some(({ hatch, face }) => {
        const exit = keyOf(move(hatch, face));
        return exits.has(exit) || grid.has(exit);
      })) return undefined;
      const powered = independent ? withCells(grid, energy.hatches.map(({ hatch, face }) => [hatch, { kind: "energy", face }] as const)) : energy.grid;
      grid = isQuad(building) ? powered : withMaintenance(powered, body, used);
      if (!body.some((cell) => /aintenance/.test(grid.get(keyOf(cell))?.kind ?? ""))) return undefined;
      for (const hatch of energy.hatches) {
        used.push(keyOf(hatch.hatch));
        exits.add(keyOf(move(hatch.hatch, hatch.face)));
      }
      rows.push({ step: recipe, itemIn, fluidIn, itemOut, fluidOut, consumers: energy.hatches });
    }
  } catch {
    return undefined;
  }
  const [head, ...rest] = rows;
  const group = { grid, head, bands: rest.map((band, index) => ({ previous: rows[index], band })) };
  const box = footprintOf(group);
  return box.max[0] - box.min[0] < CHUNK.side && box.max[2] - box.min[2] < CHUNK.side ? group : undefined;
}

const sharedLayouts = new WeakMap<Step, Map<number, Group | undefined>>();

function clusterFor(step: Step, count: number): Group | undefined {
  const building = step.crafter.machine;
  if (!building || count < 2 || isQuad(building) || PRIMITIVE.has(building.name) || !canShareWalls(building)) return undefined;
  const known = sharedLayouts.get(step) ?? new Map<number, Group | undefined>();
  if (!known.has(count)) {
    const candidates = count === 2
      ? [sharedCluster(step, building, count), sharedCluster(step, building, count, [], [0, 0], true)]
      : [sharedCluster(step, building, count), sharedCluster(step, building, count, [], [0, 1]), sharedCluster(step, building, count, [], [1, 0])];
    known.set(count, candidates.filter((candidate): candidate is Group => candidate !== undefined)
      .sort((a, b) => a.grid.size - b.grid.size)[0]);
  }
  sharedLayouts.set(step, known);
  return known.get(count);
}

/** Насосы делят только одинаковые рамы и корпуса; каждый сохраняет свои подключения. */
export function pumpGroup(machine: Machine, count: number, steamCapacity = Infinity) {
  const model = placeMachine(new Map(), machine, [0, 0, 0], kindsOf(machine), true);
  const box = boxOf([...model.grid.keys()].map(cellOf));
  const stride = box.max[0] - box.min[0];
  const cells = new Map<string, Cell>();
  const shared = new Set<string>();
  const bases: Vec3[][] = [];
  for (let copy = 0; copy < count; copy += 1) {
    const base: Vec3[] = [];
    for (const [key, cell] of model.grid) {
      const at = shiftCell(cellOf(key), [stride * copy, 0, 0]);
      const id = keyOf(at);
      const previous = cells.get(id);
      if (previous) {
        if (!canOverlap(previous, cell)) return undefined;
        shared.add(id);
      } else cells.set(id, cell);
      if (cell.kind === "wood" && at[1] === box.min[1]) base.push(at);
    }
    bases.push(base);
  }
  let grid: Grid = cells;
  const ports: { steam: Vec3; water: Vec3 }[] = [];
  const common = new Map<number, Vec3>();
  if (steamCapacity >= 2 * PRODUCTION.waterPump.steamPerSecond) {
    for (const key of shared) {
      const cell = cellOf(key);
      const out = move(cell, "nz");
      if (grid.get(key)?.kind !== "wood" || cell[1] !== box.min[1] || grid.has(keyOf(out))) continue;
      const owners = bases.flatMap((base, index) => base.some((part) => keyOf(part) === key) ? [index] : []);
      if (owners.length !== 2 || owners.some((owner) => common.has(owner))) continue;
      grid = withCells(grid, [[cell, { kind: "pumpSteamHatch", face: "nz" }]]);
      owners.forEach((owner) => common.set(owner, out));
    }
  }
  try {
    for (const [index, base] of bases.entries()) {
      const own = base.filter((cell) => !shared.has(keyOf(cell)));
      const steam = common.has(index) ? undefined : addHatch(grid, own, "pumpSteamHatch", "nz");
      const water = addHatch(steam?.grid ?? grid, own, "pumpOutputHatch", "nz", steam ? [keyOf(steam.hatch)] : []);
      grid = water.grid;
      ports.push({ steam: steam?.out ?? common.get(index)!, water: water.out });
    }
  } catch { return undefined; }
  const footprint = boxOf([...grid.keys()].map(cellOf).concat(ports.flatMap(({ steam, water }) => [steam, water])));
  return { grid, footprint, ports };
}

interface FurnacePlacement {
  readonly group: Group;
  at?: Vec3;
}

/** Сначала все возможные квадраты из одиночных домен. У каждого рецепта свои люки и шины. */
export function independentFurnaceGroups(order: readonly Step[]): ReadonlyMap<Step, FurnacePlacement> {
  let remaining = order.filter((step) => step.crafter.machine?.slug === "electric-blast-furnace" && drawnCopies(step) === 1);
  const result = new Map<Step, FurnacePlacement>();
  const model = remaining[0]?.crafter.machine;
  if (!model) return result;
  const layers = model.def.layers.map((rows, layer) => layer === model.def.layers.length - 1
    ? rows.map((row) => row.replace(/[IOEMF]/g, "b"))
    : rows);
  const building = { ...model, def: { ...model.def, layers } };
  for (const count of [QUAD.furnaces.length, 2, QUAD.furnaces.length - 1]) {
    const rest: Step[] = [];
    for (let index = 0; index < remaining.length;) {
      const batch = remaining.slice(index, index + count);
      const [first, ...others] = batch;
      // Если общая стенка отнимает место обязательных люков, оставляем отдельные стенки вплотную.
      const group = batch.length === count && others.every((step) => step.furnaceCoil === first.furnaceCoil)
        ? sharedCluster(first, building, count, others) ??
          (count > 2 ? sharedCluster(first, building, count, others, [0, 1]) : undefined) ??
          sharedCluster(first, building, count, others, [1, 1])
        : undefined;
      if (group) {
        const placement = { group };
        batch.forEach((step) => result.set(step, placement));
        index += count;
      } else {
        rest.push(first);
        index += 1;
      }
    }
    remaining = rest;
  }
  return result;
}

/** Котельная паровых турбин в своих координатах: где она стоит, где выход пара (снизу стояка) и где вход воды. */
interface BoilerBank {
  readonly grid: Grid;
  readonly footprint: Box;
  /** Свободная клетка под нижним концом стояка пара: от неё труба идёт к генераторам. */
  readonly steamOut: Vec3;
  /** Клетка у нижнего конца стояка воды: там встаёт бак с водой. */
  readonly waterIn: Vec3;
  readonly coalIn?: Vec3;
  readonly lavaIn?: Vec3;
  readonly towerStarts?: readonly number[];
}

/** В Railcraft трубы подходят к топкам и бакам, у GregTech — к шине и люкам на их местах. */
function multiBoilerBank(count: number, boiler: Machine, steamPipe: string, waterPipe: string, coalPipe: string, dedicatedSteam = false): BoilerBank {
  const { width, depth } = sizeOf(boiler);
  const height = boiler.def.layers.length;
  const isRailcraft = boiler.slug === "railcraft-boiler";
  const pitch = isRailcraft ? height : height + 1; // Над глушителем GregTech нужен свободный воздух.
  const front = -2;
  const frontPipe = front + 1;
  const rearPipe = front - depth;
  const vertical = (x: number, z: number, top: number) => span(0, top).map((y): Vec3 => [x, y, z]);
  const stack = CALC.equipmentHeight.multiblockStack;
  const towers = Math.ceil(count / stack);
  // Между корпусами достаточно двух клеток: стояк пара слева от них, стояк воды справа.
  const towerWidth = width + [0, 0].length;
  const towerStarts = copiesAcross(towerWidth, towers, 0, 0);
  const lastX = towerStarts[towerStarts.length - 1];
  const maxHeight = (Math.min(stack, count) - 1) * pitch + height;
  const across = (from: number, to: number, y: number, z: number): Vec3[] => span(from, to).map((x) => [x, y, z]);
  let grid: Grid = new Map();
  if (towers > 1) {
    grid = lay(grid, across(-1, lastX - 1, 0, frontPipe), waterPipe);
    grid = lay(grid, across(1, lastX + 1, 0, rearPipe), coalPipe);
    if (!dedicatedSteam) grid = lay(grid, across(width, lastX + width, 1, frontPipe + 1), steamPipe);
  }
  const kinds = kindsOf(boiler);
  for (const [tower, x] of towerStarts.entries()) {
    const inTower = Math.min(stack, count - tower * stack);
    const top = (inTower - 1) * pitch;
    const steamX = x + width;
    grid = lay(grid, vertical(x - 1, frontPipe, top), waterPipe);
    grid = lay(grid, vertical(x + 1, rearPipe, top), coalPipe);
    if (!dedicatedSteam) {
      grid = lay(grid, vertical(steamX, frontPipe, top + (isRailcraft ? height - 1 : 1)), steamPipe);
      if (towers > 1) grid = lay(grid, [[steamX, 1, frontPipe], [steamX, 1, frontPipe + 1]], steamPipe);
    }
    for (let copy = 0; copy < inTower; copy += 1) {
      const y = copy * pitch;
      grid = placeMachine(grid, boiler, [x, y, front], kinds, true).grid;
      grid = lay(grid, [[x - 1, y, frontPipe], [x, y, frontPipe]], waterPipe, undefined, "nz");
      grid = withLink(grid, [[x + 1, y, rearPipe]], "pz");
      if (!isRailcraft) {
        grid = withCells(grid, [
          [[x, y, front], { kind: "inputHatch", face: "pz" }],
          [[x + 1, y, rearPipe + 1], { kind: "inputBus", face: "nz" }],
          [[x, y + 1, front], { kind: "outputHatch", face: "pz" }],
          [[x + width - 1, y + 1, front], { kind: "maintenance", face: "pz" }],
          [[x + width - 2, y + height - 1, front - 1], { kind: "muffler", face: "py" }],
        ]);
      }
      const lastTap = isRailcraft ? y + height - 1 : y + 1;
      for (let tankY = y + 1; !dedicatedSteam && tankY <= lastTap; tankY += 1) {
        grid = lay(grid, across(x, steamX, tankY, frontPipe), steamPipe);
        grid = withLink(grid, across(x, isRailcraft ? x + width - 1 : x, tankY, frontPipe), "nz");
      }
    }
  }
  return {
    grid,
    footprint: { min: [-2, 0, rearPipe], max: [lastX + width + 1, maxHeight - 1, towers > 1 ? frontPipe + 1 : frontPipe] },
    steamOut: [lastX + width + 1, 0, frontPipe],
    waterIn: [-2, 0, frontPipe],
    coalIn: [0, 0, rearPipe],
    towerStarts,
  };
}

/**
 * Котельная: по глубине чередуются труба пара, ряд котлов, труба воды, ряд котлов, труба пара… — каждая труба
 * обслуживает два ряда сразу, спереди и сзади (котёл берёт воду с любой стороны, пар отдаёт любой стороной, кроме
 * лица и низа; лицом котлы смотрят друг на друга вдоль ряда). Этажи — вплотную друг на друге. Ряд — до 12 котлов:
 * слева общая труба воды (x = 0) и бак (x = −1), справа общая труба пара и выход из неё к генераторам.
 */
function boilerBank(count: number, boiler: string, steamPipe: string, waterPipe: string, heightLimit: number, fuel?: { readonly pipe: string; readonly isLava: boolean }): BoilerBank {
  const pair = [0, 0].length;
  // В чанке 16 клеток от x = −1: бак, общая труба воды, котлы, общая труба пара и выход пара — котлов 12.
  const perRow = Math.min(count, CHUNK.side - [0, 0, 0, 0].length);
  const rows = Math.ceil(count / perRow);
  const pitch = fuel ? pair : 1;
  const levels = Math.floor((heightLimit - 1) / pitch) + 1;
  const rowsPerFloor = Math.min(rows, Math.max(Math.floor((CHUNK.side - 1) / pair), Math.ceil(rows / levels)));
  const floors = Math.ceil(rows / rowsPerFloor);
  const steamX = perRow + 1;
  // Трубы — на нечётной глубине: z = −1 (пар), −3 (вода), −5 (пар)…; ряд i — на z = −2 − 2i, между двумя трубами.
  const lineZ = (line: number) => -1 - line * pair;
  const isSteam = (line: number) => line % pair === 0;
  let grid: Grid = new Map();
  for (let level = 0; level < floors; level += 1) {
    const floor = level * pitch;
    const inFloor = Math.min(rowsPerFloor, rows - level * rowsPerFloor);
    const rowCount = (local: number) => Math.min(perRow, count - (level * rowsPerFloor + local) * perRow);
    for (let local = 0; local < inFloor; local += 1) grid = row(grid, [1, floor, -pair - local * pair], rowCount(local), boiler, "px");
    for (let line = 0; line <= inFloor; line += 1) {
      const z = lineZ(line);
      // Сколько котлов по обе стороны трубы: впереди (ряд line − 1) и сзади (ряд line).
      const reach = Math.max(line > 0 ? rowCount(line - 1) : 0, line < inFloor ? rowCount(line) : 0);
      const kind = isSteam(line) ? steamPipe : waterPipe;
      const cells = Array.from({ length: reach }, (_unused, column): Vec3 => [1 + column, floor, z]);
      const toSpine: Vec3 = isSteam(line) ? [steamX, floor, z] : [0, floor, z];
      // Труба пара доходит до общей трубы справа и у неполного ряда — через пустые клетки.
      const toRight = Array.from({ length: steamX - reach - 1 }, (_unused, step): Vec3 => [reach + 1 + step, floor, z]);
      grid = lay(grid, isSteam(line) ? [...cells, ...toRight, toSpine] : [toSpine, ...cells], kind);
      grid = withLink(grid, cells.filter((_cell, column) => line > 0 && column < rowCount(line - 1)), "pz");
      grid = withLink(grid, cells.filter((_cell, column) => line < inFloor && column < rowCount(line)), "nz");
    }
    // Общие трубы этажа: вода слева, пар справа — через все свои трубы.
    const along = (x: number, from: number, to: number): Vec3[] => Array.from({ length: from - to + 1 }, (_unused, step): Vec3 => [x, floor, from - step]);
    const lastLine = inFloor;
    const lastSteam = isSteam(lastLine) ? lastLine : lastLine - 1;
    const lastWater = isSteam(lastLine) ? lastLine - 1 : lastLine;
    if (lastSteam > 0) grid = lay(grid, along(steamX, lineZ(0), lineZ(lastSteam)), steamPipe);
    if (lastWater > 1) grid = lay(grid, along(0, lineZ(1), lineZ(lastWater)), waterPipe);
    if (fuel) {
      const y = floor + 1;
      const lastRow = 0 - inFloor * pair;
      grid = lay(grid, span(lastRow, lineZ(0)).map((z): Vec3 => [0, y, z]), fuel.pipe);
      for (let local = 0; local < inFloor; local += 1) {
        const z = 0 - (local + 1) * pair;
        const taps = span(1, rowCount(local)).map((x): Vec3 => [x, y, z]);
        grid = withLink(lay(grid, [[0, y, z], ...taps], fuel.pipe), taps, "ny");
      }
    }
  }
  // Этажи соединяют стояки: пар — у первой трубы пара справа, вода — у первой трубы воды слева.
  const height = (floors - 1) * pitch;
  grid = lay(grid, span(0, height).map((y): Vec3 => [steamX, y, lineZ(0)]), steamPipe);
  grid = lay(grid, span(0, height).map((y): Vec3 => [0, y, lineZ(1)]), waterPipe);
  if (fuel) grid = lay(grid, span(0, height + 1).map((y): Vec3 => [0, y, lineZ(0)]), fuel.pipe);
  const depth = rowsPerFloor * pair + 1;
  return {
    grid,
    footprint: { min: [-1, 0, -depth], max: [steamX + 1, height + pitch, -1] },
    // Пар выходит из стояка вбок, на клетку правее: оттуда труба идёт к генераторам.
    steamOut: [steamX + 1, 0, lineZ(0)],
    waterIn: [-1, 0, lineZ(1)],
    coalIn: fuel && !fuel.isLava ? [-1, 0, lineZ(0)] : undefined,
    lavaIn: fuel?.isLava ? [-1, 0, lineZ(0)] : undefined,
  };
}

/**
 * Укладка групп шагов полками: слева направо, пока полка не займёт width чанков, потом новая полка дальше по −z.
 * Так десяток маленьких шагов ложится в один-два чанка, а не тянется полосой. Правила чанков: группа не шире
 * (не глубже) чанка не ложится на его границу; широкая (глубокая) встаёт с границы и сдвигается на целое число чанков —
 * так её ряды, выровненные по чанкам при сборке, остаются выровненными.
 * Группы одноблочных машин (stackable) ставятся ещё и друг на друга: такая группа — кабель, машины и жидкостная труба,
 * 3 слоя, и такая же группа встаёт над ней с 4-го слоя; сначала — на машины того же вида (label), потом — на любые
 * одноблочные того же размера.
 */
function shelfPacker(widthChunks: number, fillGaps = false, heightLimit = Infinity, gap: number = CALC.factory.rowGap, shareChunks = false) {
  const side = CHUNK.side;
  const limit = WEST + widthChunks * side - 1;
  let cx = WEST;
  let top = -1;
  let bottom = 0;
  const nextBorder = (x: number, origin: number) => (chunkOf(x, origin) + 1) * side + origin;
  /** Места, куда можно поставить группу сверху: размер, вид машин и сдвиг нижней группы. */
  const roofs: { label: string; x: number; z: number; width: number; depth: number; height: number; multi: boolean }[] = [];
  const rectangles: { readonly min: Vec3; readonly max: Vec3; readonly label: string }[] = [];
  const occupied = new Map<string, { readonly x: number; readonly z: number; readonly labels: Set<string>; singles: number; multis: number }>();
  return (footprint: Box, stackable: boolean, label: string, turn?: { box: Box; used: boolean }, multi = false): Vec3 => {
    const width = footprint.max[0] - footprint.min[0] + 1;
    const depth = footprint.max[2] - footprint.min[2] + 1;
    const height = footprint.max[1] - footprint.min[1] + 1;
    const clearance = multi ? CALC.equipmentHeight.upperAccess : 0;
    const onRoof = (roof: (typeof roofs)[number], box: Box): Vec3 => {
      roofs.splice(roofs.indexOf(roof), 1);
      const y = roof.height + clearance;
      if (!multi) {
        const w = box.max[0] - box.min[0] + 1;
        const d = box.max[2] - box.min[2] + 1;
        roofs.push({ ...roof, label, width: w, depth: d, height: y + height });
        // На прежней высоте остаются две непересекающиеся части крыши.
        if (shareChunks && roof.width > w + gap)
          roofs.push({ ...roof, x: roof.x + w + gap, width: roof.width - w - gap, depth: d });
        if (shareChunks && roof.depth > d + gap)
          roofs.push({ ...roof, z: roof.z - d - gap, depth: roof.depth - d - gap });
      }
      return [roof.x - box.min[0], y - box.min[1], roof.z - box.max[2]];
    };
    const available = (one: (typeof roofs)[number]) => one.multi === multi && (!multi || one.label === label) &&
      one.height + clearance + height <= heightLimit;
    const exact = roofs.filter((one) => available(one) && one.width === width && one.depth === depth);
    const roof = stackable && (exact.find((one) => one.label === label) ?? exact[0]);
    if (roof && !fillGaps) return onRoof(roof, footprint);
    const fitsX = (x: number) => (width <= side ? chunksBetween(x, x + width - 1, WEST) === 1 : (x - WEST) % side === 0);
    const obstruction = (x: number, z: number, w = width, d = depth) => rectangles.find(({ min, max, label: other }) => {
      // В блоке генераторов уже отведено место под стояк, кабель и боковую шахту.
      const spacing = label === "generators" && other === label ? 0 : gap;
      return x <= max[0] + spacing && x + w - 1 >= min[0] - spacing &&
        z - d + 1 <= max[2] + spacing && z >= min[2] - spacing;
    });
    const place = (x: number, z: number, box = footprint, w = width, d = depth): Vec3 => {
      const at: Vec3 = [x - box.min[0], 0, z - box.max[2]];
      const min: Vec3 = [x, 0, z - d + 1];
      const max: Vec3 = [x + w - 1, 0, z];
      rectangles.push({ min, max, label });
      bottom = Math.min(bottom, min[2]);
      for (let cx = chunkOf(min[0], WEST); cx <= chunkOf(max[0], WEST); cx += 1) {
        for (let cz = chunkOf(min[2]); cz <= chunkOf(max[2]); cz += 1) {
          const key = `${cx},${cz}`;
          const chunk = occupied.get(key) ?? { x: WEST + cx * side, z: (cz + 1) * side - 1, labels: new Set<string>(), singles: 0, multis: 0 };
          const overlap = (Math.min(max[0], chunk.x + side - 1) - Math.max(min[0], chunk.x) + 1) *
            (Math.min(max[2], chunk.z) - Math.max(min[2], chunk.z - side + 1) + 1);
          if (multi) chunk.multis += overlap;
          if (stackable && !multi) chunk.singles += overlap;
          chunk.labels.add(label);
          occupied.set(key, chunk);
        }
      }
      if (stackable) roofs.push({ label, x, z, width: w, depth: d, height, multi });
      return at;
    };
    // При повторной раскладке короткие ряды сначала закрывают дыры внутри текущих границ.
    if (width <= side && depth <= side) {
      const gaps: { x: number; z: number }[] = [];
      if (fillGaps && occupied.size > 0) {
        const right = Math.min(limit, Math.max(...Array.from(occupied.values(), ({ x }) => x)));
        for (let z = -1; z >= bottom; z -= side) {
          for (let x = WEST; x <= right; x += side) {
            if (!occupied.has(productionChunk([x, 0, z]))) gaps.push({ x, z });
          }
        }
      }
      const family = [...occupied.values()].filter((chunk) => chunk.labels.has(label));
      const distance = ({ x, z }: { x: number; z: number }) => Math.min(...family.map((chunk) => Math.abs(chunk.x - x) + Math.abs(chunk.z - z)));
      const chunks = [...occupied.values()];
      if (family.length > 0) chunks.sort((a, b) => distance(a) - distance(b));
      const isSingle = stackable && !multi;
      // Продолжаем уже начатый чанк одиночных машин. Новый открываем, когда группа больше нигде не помещается.
      const fitsSingles = (chunk: (typeof chunks)[number]) =>
        shareChunks || chunk.multis === 0 || chunk.multis >= chunk.singles + width * depth;
      const destinations = isSingle
        ? [...chunks.filter(fitsSingles).sort((a, b) => b.singles - a.singles || b.multis - a.multis), ...gaps]
        : [...gaps, ...chunks];
      for (const chunk of destinations) {
        for (const box of turn ? [footprint, turn.box] : [footprint]) {
          const w = box.max[0] - box.min[0] + 1;
          const d = box.max[2] - box.min[2] + 1;
          for (let z = chunk.z; z >= chunk.z - side + d; z -= 1) {
            for (let x = chunk.x; x <= Math.min(limit, chunk.x + side - 1) - w + 1; x += 1) {
              if (obstruction(x, z, w, d)) continue;
              if (turn) turn.used = box === turn.box;
              return place(x, z, box, w, d);
            }
          }
        }
      }
    }
    if (roof) return onRoof(roof, footprint);
    if (stackable) {
      for (const box of turn ? [footprint, turn.box] : [footprint]) {
        const w = box.max[0] - box.min[0] + 1;
        const d = box.max[2] - box.min[2] + 1;
        const base = roofs.find((one) => available(one) && one.width >= w && one.depth >= d);
        if (!base) continue;
        if (turn) turn.used = box === turn.box;
        return onRoof(base, box);
      }
    }
    let x = cx;
    for (;;) {
      if (!fitsX(x)) x = nextBorder(x, WEST);
      if (x > WEST && x + width - 1 > limit) {
        top = bottom - 1 - gap;
        x = WEST;
      }
      // Широкая группа сохраняет границы чанков, по которым расставлены её копии.
      const z = depth <= side ? top - shiftIntoChunk(top - depth + 1, top) : footprint.max[2] + Math.floor((top - footprint.max[2]) / side) * side;
      const hit = obstruction(x, z);
      if (hit) {
        x = hit.max[0] + 1 + gap;
        continue;
      }
      cx = x + width + gap;
      return place(x, z);
    }
  };
}

async function placeFactory(
  plan: Plan,
  slug: string,
  text: FactoryText,
  onProgress: ((progress: BuildProgress) => void) | undefined,
  bandChunks: number,
  options: FactoryOptions,
  order: readonly Step[],
  fillGaps = false,
  serviceSpace = false,
  closeFit = false,
  sharedAisle = false,
): Promise<{ readonly size: FactoryStats["chunkSize"]; readonly occupied: number; readonly singleChunks: number; readonly leastFilled: number; readonly familySpread: number; readonly wallSavings: number; readonly finish: (notify: (progress: BuildProgress) => void) => Promise<Factory> }> {
  const { t } = text;
  const total = plan.steps.length + [0, 0].length;
  let done = 0;
  let notify = onProgress;
  const report = async (label: string) => {
    if (notify) {
      notify({ done, total, label });
      await yieldToBrowser();
    }
    done += 1;
  };
  // Ярусы сайта — до UXV; у MAX своего корпуса нет — берём последний, UXV (генераторов там нет, энергия не рисуется).
  const tierId: TierId = TIERS[Math.min(plan.tier + 1, TIERS.length - 1)].id;
  const notes: string[] = [];
  const extraKinds: Record<string, BlockKind> = {};
  let grid: Grid = new Map();
  const boilerMachine = options.power?.fuel?.steam?.boiler;
  const pumpMachine = boilerMachine ? findMachine("steam-water-pump") : undefined;
  const tallest = Math.max(1, pumpMachine?.def.layers.length ?? 0,
    boilerMachine && "def" in boilerMachine ? boilerMachine.def.layers.length : 0,
    ...order.map((step) => step.crafter.machine?.def.layers.length ?? 0));
  const heightLimit = tallest * CALC.equipmentHeight.base;
  const gap = sharedAisle ? CALC.factory.rowGap
    : closeFit && !serviceSpace ? 0 : serviceSpace ? CALC.factory.serviceGap : CALC.factory.rowGap;
  // При повторной прокладке оставляем блок под оборудованием для трасс в том же чанке.
  const cableFloor = Number(serviceSpace && closeFit);
  const pack = shelfPacker(bandChunks, fillGaps, heightLimit - cableFloor, gap, closeFit);
  const placed: Placed[] = [];
  /** Ряды шага после первого: каждый соединяется с предыдущим рядом того же шага. */
  const bands: { readonly previous: Placed; readonly band: Placed }[] = [];
  /** Плашки в клетках сетки; в точки сцены переводятся в конце, когда известны границы фабрики. */
  const marks: { readonly kind: FactoryMarker["kind"]; readonly cell: Vec3; readonly title: string; readonly lines: readonly string[] }[] = [];
  const multiFamilies = new Map<string, Box>();
  const singleChunks = new Set<string>();
  let drawn = 0;
  let wallSavings = 0;
  let missingAmps = 0;
  // Генераторы — блоками рядом со своими машинами: после шагов, что их едят, на той же полке. Мелкие шаги копятся в
  // один блок, пока не наберётся ряд генераторов; большой шаг получает свой блок. Машины шага берут энергию только из
  // своего блока — кабели короткие, без жгута через всю фабрику.
  const hasGenerators = (CALC.factory.generatorTiers as readonly string[]).includes(tierId);
  const generator = hasGenerators ? (generatorsOf(tierId).find((single) => single.slug === options.power?.generatorSlug) ?? generatorsOf(tierId)[0]) : undefined;
  const fuel = generator ? options.power?.fuel : undefined;
  const voltage = GAME.voltageTiers[TIERS.findIndex((tier) => tier.id === tierId)].voltage;
  let generatorFloors = CALC.factory.blockFloors;
  while (generatorFloors > 1 && (fuel ? supplyFloorY(generatorFloors - 1) : generatorFloors - 1) >= heightLimit) generatorFloors -= 1;
  const blockGens = generator ? generatorRows(tierId, CHUNK.side * voltage, fuel !== undefined).perRow *
    Math.floor(CHUNK.side / 2) * generatorFloors : 1;
  const supplyCells: Vec3[] = [];
  const reserve = (footprint: Box, by: Vec3) => {
    for (let x = footprint.min[0]; x <= footprint.max[0]; x += 1)
      for (let y = footprint.min[1]; y <= footprint.max[1]; y += 1)
        for (let z = footprint.min[2]; z <= footprint.max[2]; z += 1) supplyCells.push(shiftCell([x, y, z], by));
  };
  const powerBlocks: { readonly loads: readonly { readonly hatch: Hatch; readonly amps: number }[]; readonly peak: number; readonly spot: Required<Omit<SupplySpot, "amps">> }[] = [];
  const powerRequests: { readonly rows: readonly Placed[]; readonly eut: number }[] = [];
  let pending: { readonly rows: readonly Placed[]; readonly eut: number } = { rows: [], eut: 0 };
  /** Ток каждого люка при одновременной работе всех машин ряда. */
  const hatchCurrent = new Map<Placed, readonly number[]>();
  const furnaceGroups = independentFurnaceGroups(order);
  const flushPower = () => {
    if (pending.rows.length === 0) return;
    powerRequests.push(pending);
    pending = { rows: [], eut: 0 };
  };
  const placePower = (loads: (typeof powerBlocks)[number]["loads"], peak: number) => {
    const { perRow: widest } = generatorRows(tierId, peak, fuel !== undefined);
    const count = Math.ceil(peak / voltage);
    const pair = [0, 0].length;
    const fullMachine = CALC.factory.hatchAmps * PRODUCTION.hatchesPerMachine;
    // Округляем ширину вверх до чётной, чтобы ряд мог целиком принять пары ампер от люков.
    const perRow = fuel ? Math.min(widest, Math.max(fullMachine, pair * Math.ceil(count / (pair * pair)))) : widest;
    const rows = Math.ceil(count / perRow);
    // Два слоя по обе стороны трубы топлива занимают меньше места на земле.
    const rowsPerFloor = Math.min(Math.floor(CHUNK.side / pair), fuel ? Math.ceil(rows / pair) : rows);
    const floors = Math.ceil(rows / rowsPerFloor);
    // Ряд генераторов: общий кабель вдоль ряда (z = −1) и генераторы за ним; с топливом левее — его стояк (x = −1).
    const footprint: Box = { min: [fuel ? -1 : 0, 0, -rowsPerFloor * [0, 0].length], max: [perRow + 1, fuel ? supplyFloorY(floors - 1) + 1 : floors, -1] };
    const by = pack(footprint, false, "generators");
    powerBlocks.push({ loads, peak, spot: { left: 1 + by[0], busZ: -1 + by[2], perRow, rowsPerFloor,
      joinFloors: rows === 2 && rowsPerFloor === 1 && count <= generatorRows(tierId, CHUNK.side * voltage, fuel !== undefined).perRow } });
    reserve(footprint, by);
  };
  const produced = new Set(plan.steps.flatMap((step) => step.outputs.map(({ goods }) => goods.ptr)));
  const processWaterOf = (step: Step): Flow | undefined => {
    const fluids = step.inputs.filter(({ goods }) => goods.kind === "fluid");
    const [water] = fluids;
    return fluids.length === 1 && water.goods.name === CALC.power.water && !produced.has(water.goods.ptr) ? water : undefined;
  };
  const processWater = order.reduce((sum, step) => sum + (step.crafter.kind === "hand" ? 0 : processWaterOf(step)?.perSecond ?? 0), 0);
  const placeSteamSupply = (peak: number) => {
    // Клетка в углу чанка не выпускает трубу горизонтально ни по одной оси.
    const access = (box: Box): Box => ({
      min: [box.min[0] - 1, box.min[1], box.min[2] - 1],
      max: [box.max[0] + 1, box.max[1], box.max[2] + 1],
    });
    const steamPlant = fuel?.steam && peak > 0 ? steamPlantFor(fuelPerSecond(peak, fuel), fuel.steam, processWater) : undefined;
    const pumpPorts: { readonly steam: Vec3; readonly water: Vec3 }[] = [];
    const boilerCells: Vec3[] = [];
    let boilers: { readonly count: number; readonly at: Vec3 } | undefined;
    if (!fuel?.steam || !steamPlant) return { steamPlant, pumpPorts, boilers, boilerCells };
    const { boiler } = fuel.steam;
    const count = steamPlant.boilers;
    const hasFuel = steamPlant.coalPerMinute !== undefined || steamPlant.lavaPerSecond !== undefined;
    const bank = "def" in boiler ? multiBoilerBank(count, boiler, "", "", "") : boilerBank(count, boiler.slug, "", "", heightLimit,
      hasFuel ? { pipe: "", isLava: steamPlant.lavaPerSecond !== undefined } : undefined);
    // Насосы и котлы укладываем одним узлом, чтобы им не пришлось искать путь через соседние цеха.
    const utility = shelfPacker(1, false, heightLimit);
    const bankBounds = access(bank.footprint);
    const bankAt = utility(bankBounds, false, "steam");
    const bounds = [shiftCell(bankBounds.min, bankAt), shiftCell(bankBounds.max, bankAt)];
    const pumps: { group: NonNullable<ReturnType<typeof pumpGroup>>; at: Vec3 }[] = [];
    if (pumpMachine) {
      const steamCapacity = options.pipes ? choosePipe(options.pipes, "fluid", Infinity, fluidTemperature(fuel.goods.name))?.offer.perSecond : undefined;
      // При раздельной подаче два насоса могут использовать остатки пара разных котлов.
      const sharedSteamCapacity = boiler.slug === "railcraft-boiler" && steamCapacity !== undefined && steamPlant.steam > steamCapacity ? 0 : steamCapacity;
      Object.assign(extraKinds, pumpMachine.def.extraKinds ?? {});
      for (let copy = 0; copy < steamPlant.pumps;) {
        const size = Math.min(QUAD.furnaces.length, steamPlant.pumps - copy);
        const group = pumpGroup(pumpMachine, size, sharedSteamCapacity) ??
          (size > 2 ? pumpGroup(pumpMachine, 2, sharedSteamCapacity) : undefined) ?? pumpGroup(pumpMachine, 1, sharedSteamCapacity);
        if (!group) throw new Error("У парового насоса нет мест для люков");
        const footprint = access(group.footprint);
        const at = utility(footprint, false, "steam");
        bounds.push(shiftCell(footprint.min, at), shiftCell(footprint.max, at));
        pumps.push({ group, at });
        copy += group.ports.length;
      }
    }
    const by = pack(boxOf(bounds), false, "steam", undefined, "def" in boiler || pumps.length > 0);
    const boilerAt = shiftCell(bankAt, by);
    boilers = { count, at: boilerAt };
    reserve(bank.footprint, boilerAt);
    for (const [key, cell] of bank.grid) {
      if (cell.kind && !cell.isHollow) boilerCells.push(shiftCell(cellOf(key), boilerAt));
    }
    for (const { group, at } of pumps) {
      const offset = shiftCell(at, by);
      grid = withCells(grid, [...group.grid].map(([key, cell]) => [shiftCell(cellOf(key), offset), cell]));
      for (const { steam, water } of group.ports) pumpPorts.push({ steam: shiftCell(steam, offset), water: shiftCell(water, offset) });
      marks.push({ kind: "row", cell: shiftCell(move(group.footprint.max, "py"), offset), title: `${t(pumpMachine!.title, pumpMachine!.name)} × ${group.ports.length}`, lines: [
        `${t("Вход пара", "Steam inlet")}: ${text.number(PRODUCTION.waterPump.steamPerSecond * group.ports.length)} ${t("л/с", "L/s")}`,
        `${t("Выход воды на равнине", "Water output in plains")}: ${text.number(steamPlant.waterPerPump * group.ports.length)} ${t("л/с", "L/s")}`,
      ] });
    }
    return { steamPlant, pumpPorts, boilers, boilerCells };
  };
  const requiredAmpsOf = (step: Step): number => {
    const eut = runningEut(step);
    return eut > 0 ? Math.max(1, Math.ceil(eut / voltage - CALC.epsilon)) : 0;
  };
  // У одноблочной модели один вход энергии на копию. Считаем его до укладки, чтобы котельная заняла место первой.
  const singlePeak = generator ? order.reduce((sum, step) => step.crafter.machine || step.crafter.kind === "hand" ? sum
    : sum + Math.min(requiredAmpsOf(step), CALC.factory.hatchAmps) * voltage * drawnCopies(step), 0) : 0;
  const placeSupply = () => placeSteamSupply(powerRequests.reduce((sum, block) => sum + block.eut, pending.eut) + singlePeak);
  let supply: ReturnType<typeof placeSteamSupply> | undefined;
  // Сохраняем порядок цепочки внутри каждой группы. Сами связи определяются отдельно по рецептам.
  const priority = (step: Step) => Number(Boolean(step.crafter.machine));
  const placementOrder = order.toSorted((a, b) => priority(b) - priority(a) ||
    (priority(a) > 0 || (closeFit && serviceSpace) ? drawnCopies(b) - drawnCopies(a) : 0));
  for (const step of placementOrder) {
    if (!step.crafter.machine) supply ??= placeSupply();
    const label = text.crafter(step.crafter);
    await report(t(`Ставлю машины: ${label}`, `Placing machines: ${label}`));
    if (step.crafter.kind === "hand") {
      const product = step.outputs[0] ? text.name(step.outputs[0].goods) : step.recipe.type;
      notes.push(t(`${product}: верстак — делают автокрафтом, в фабрике не нарисован.`, `${product}: crafting table — made by autocrafting, not drawn in the factory.`));
      continue;
    }
    const copies = drawnCopies(step);
    if (copies < step.machines) {
      notes.push(
        t(
          `${label}: нарисовано ${copies} из ${step.machines} — остальные такие же, а столько блоков браузер уже не тянет.`,
          `${label}: ${copies} of ${step.machines} drawn — the rest are the same, and the browser can't handle that many blocks.`,
        ),
      );
    }
    // Группа шага собирается отдельно (copies рядами по perBand — bandChunks чанков в длину) и встаёт на полку.
    // Одноблочные — всегда в один чанк шириной: заполнили чанк — пошли этажом выше (buildFloors), а не в соседний чанк.
    // Шагу нужно больше генераторов, чем помещается в один блок, — он ставится частями, и у каждой части свой блок
    // генераторов вплотную: кабели короткие, без жгута вдоль всего шага. Части связаны трубами, как ряды шага.
    // В плотной раскладке короткие ряды оставляют место для соседних рецептов и их отводов в том же чанке.
    const perBand = step.crafter.machine ? perChunk(step) * bandChunks
      : closeFit ? Math.ceil(perChunk(step) / 2) : perChunk(step);
    // Сколько шаг может взять: люк — не больше 2 А, у мультиблока их PRODUCTION.hatchesPerMachine, у одноблочной — один.
    const hatchesPerMachine = step.crafter.machine ? PRODUCTION.hatchesPerMachine : 1;
    const requiredAmps = requiredAmpsOf(step);
    const machineAmps = Math.min(requiredAmps, hatchesPerMachine * CALC.factory.hatchAmps);
    const stepDraw = machineAmps * voltage * copies;
    const pieces = generator && stepDraw > 0 ? Math.min(Math.ceil(copies / perBand), Math.max(1, Math.ceil(stepDraw / voltage / blockGens))) : 1;
    const floor = !step.crafter.machine && copies > perBand ? singleFloor(step, perBand, tierId, extraKinds) : undefined;
    const floorCapacity = floor ? Math.max(floor.wide, floor.perFloor * Math.floor(heightLimit / floor.height)) : Infinity;
    const perPiece = Math.min(floorCapacity, Math.ceil(copies / pieces / perBand) * perBand);
    const stepCells: Vec3[] = [];
    let last: Placed | undefined;
    let overdraw = 0;
    for (let first = 0; first < copies;) {
      const available = Math.min(perPiece, copies - first);
      const building = step.crafter.machine;
      const shared = furnaceGroups.get(step);
      const clusterSize = Math.min(available, QUAD.furnaces.length);
      const cluster = clusterFor(step, clusterSize) ?? (clusterSize > 2 ? clusterFor(step, 2) : undefined);
      const completeQuads = Math.floor(available / QUAD.furnaces.length) * QUAD.furnaces.length;
      const pieceCopies = cluster ? 1 + cluster.bands.length : building && isQuad(building) && completeQuads > 0 ? completeQuads : available;
      first += pieceCopies;
      if (cluster) Object.assign(extraKinds, building?.def.extraKinds ?? {});
      let group = shared ? {
        grid: shared.group.grid,
        head: [shared.group.head, ...shared.group.bands.map(({ band }) => band)].find((row) => row.step === step)!,
        bands: [],
      } : cluster ?? buildFloors(step, pieceCopies, perBand, tierId, extraKinds, floor);
      const shape = footprintOf(shared?.group ?? group);
      const marginX = Number(serviceSpace && shape.max[0] - shape.min[0] + 2 < CHUNK.side);
      const marginZ = Number(serviceSpace && shape.max[2] - shape.min[2] + 2 < CHUNK.side);
      const footprint: Box = {
        min: sharedAisle ? shape.min : [shape.min[0] - marginX, shape.min[1], shape.min[2] - marginZ],
        max: [shape.max[0] + marginX, shape.max[1], shape.max[2] + marginZ],
      };
      const canTurn = !step.crafter.machine || (isQuad(step.crafter.machine) && !shared && pieceCopies < QUAD.furnaces.length);
      const turn = !canTurn ? undefined : { box: {
        min: turnCell([footprint.min[0], footprint.min[1], footprint.max[2]]),
        max: turnCell([footprint.max[0], footprint.max[1], footprint.min[2]]),
      }, used: false };
      const by = shared?.at ?? move(
        pack(footprint, !serviceSpace || closeFit, step.crafter.machine?.slug ?? text.crafter(step.crafter), turn, Boolean(building)),
        "py", cableFloor,
      );
      if (turn?.used) group = turnGroup(group);
      if (building) {
        const kinds = kindsOf(building);
        for (const { kind } of group.grid.values()) {
          if (/controller$/i.test(kind) && kinds[kind] && !extraKinds[kind]?.gameName) {
            extraKinds[kind] = { ...kinds[kind], gameName: building.name, gameItem: options.goodsNamed?.(building.name) };
          }
        }
      }
      const coil = step.furnaceCoil;
      const coilKind = coil && coil !== GAME.coils[0] ? `coil-${coil.id}` : undefined;
      if (coil && coilKind) {
        const english = furnaceCoilName(coil);
        const goods = options.goodsNamed?.(english);
        extraKinds[coilKind] = { label: goods ? text.name(goods) : t(`Нагревательная катушка — ${coil.name}`, english), gameItem: goods, gameName: english,
          texture: coilKind, isHot: true };
      }
      const moved = [...group.grid.entries()].map(([key, cell]): readonly [Vec3, Cell] =>
        [shiftCell(cellOf(key), by), coilKind && cell.kind === "coil" ? { ...cell, kind: coilKind } : cell]);
      if (!shared?.at) {
        grid = withCells(grid, moved);
        if (building) {
          const copiesInGroup = shared ? 1 + shared.group.bands.length : pieceCopies;
          const standalone = building.def.layers.flat().join("").replaceAll(" ", "").length;
          wallSavings += Math.max(0, copiesInGroup * standalone - group.grid.size);
        }
      }
      if (shared) shared.at = by;
      stepCells.push(...(shared ? group.head.consumers.map(({ hatch }) => shiftCell(hatch, by)) : moved.map(([cell]) => cell)));
      if (!building) for (const [cell] of moved) singleChunks.add(productionChunk(cell));
      const head = shiftPlaced(group.head, by);
      if (last) bands.push({ previous: last, band: head });
      else placed.push(head);
      const rowsOfGroup = new Map<Placed, Placed>([[group.head, head]]);
      for (const { previous, band } of group.bands) {
        const shifted = shiftPlaced(band, by);
        rowsOfGroup.set(band, shifted);
        bands.push({ previous: rowsOfGroup.get(previous) ?? head, band: shifted });
      }
      const pieceRows = [...rowsOfGroup.values()];
      last = pieceRows[pieceRows.length - 1];
      if (generator && requiredAmps > 0 && pieceRows.some((row) => row.consumers.length > 0)) {
        let current = 0;
        let hatchIndex = 0;
        for (const row of pieceRows) {
          const amps = row.consumers.map(() => {
            const index = hatchIndex % hatchesPerMachine;
            hatchIndex += 1;
            return Math.floor(machineAmps / hatchesPerMachine) + Number(index < machineAmps % hatchesPerMachine);
          });
          hatchCurrent.set(row, amps);
          current += amps.reduce((sum, value) => sum + value, 0);
        }
        overdraw += Math.max(0, requiredAmps * pieceCopies - current);
        pending = { rows: [...pending.rows, ...pieceRows], eut: pending.eut + current * voltage };
        const generatorGroup = closeFit && serviceSpace ? blockGens : CHUNK.side - [0, 0, 0].length;
        if (pieces > 1 || Math.ceil(pending.eut / voltage) >= generatorGroup) flushPower();
      }
    }
    drawn += copies;
    if (overdraw > 0) {
      missingAmps += overdraw;
      notes.push(t(
        `${label}: при одновременной работе нарисованных машин энергетическим люкам не хватает ${text.number(overdraw)} А.`,
        `${label}: the energy hatches are short by ${text.number(overdraw)} A when all displayed machines run at once.`,
      ));
    }
    // Плашка над рядами шага: машина и сколько их, при наведении — рецепт.
    const box = boxOf(stepCells);
    const building = step.crafter.machine;
    if (building) {
      const family = multiFamilies.get(building.slug);
      multiFamilies.set(building.slug, family ? boxOf([family.min, family.max, box.min, box.max]) : box);
    }
    marks.push({
      kind: "row",
      cell: [(box.min[0] + box.max[0]) / [0, 0].length, box.max[1] + 1, (box.min[2] + box.max[2]) / [0, 0].length],
      title: `${label} × ${step.machines}`,
      lines: [
        `${t("Берёт", "Takes")}:`,
        ...step.inputs.map((flow) => `  ${flowLine(flow, text)}`),
        ...(step.inputs.length === 0 && step.recipe.type === "Compressor"
          ? [t("  Воздух из атмосферы. Пустая колба возвращается в оборот.", "  Ambient air. The empty cell is reused.")] : []),
        `${t("Даёт", "Gives")}:`,
        ...step.outputs.map((flow) => `  ${flowLine(flow, text)}`),
        `${text.number(step.eut)} EU/t · ${t("занят", "busy")} ${text.number(step.busy * CALC.ui.percent)}%`,
      ],
    });
  }

  flushPower();
  const { steamPlant, pumpPorts, boilers, boilerCells } = supply ?? placeSupply();
  // shortcut: раздельные выходы пока только у баков Railcraft, для остальных котлов нужны допустимые места выходных люков.
  const fuelCapacity = fuel && options.pipes
    ? choosePipe(options.pipes, fuel.isItem ? "item" : "fluid", Infinity, fuel.isItem ? 0 : fluidTemperature(fuel.goods.name))?.offer.perSecond : undefined;
  const railcraftCapacity = fuel?.steam?.boiler.slug === "railcraft-boiler" ? fuelCapacity : undefined;
  const splitSteam = railcraftCapacity !== undefined && (steamPlant?.steam ?? 0) > railcraftCapacity;
  const ampsPerSteamChannel = splitSteam && fuel?.steam
    ? Math.floor(Math.min(railcraftCapacity, fuel.steam.steamPerSecond) / fuelPerSecond(voltage, fuel))
    : Infinity;
  for (const request of powerRequests) {
    const machines = request.rows.flatMap((row) => {
      const width = row.step.crafter.machine ? PRODUCTION.hatchesPerMachine : 1;
      const amps = hatchCurrent.get(row) ?? [];
      return Array.from({ length: Math.ceil(row.consumers.length / width) }, (_unused, index) =>
        row.consumers.slice(index * width, (index + 1) * width)
          .map((hatch, slot) => ({ hatch, amps: amps[index * width + slot] ?? 0 })).filter((load) => load.amps > 0));
    });
    const currents = machines.map((loads) => loads.reduce((sum, load) => sum + load.amps, 0));
    const splitFuel = fuel && !fuel.steam && fuelCapacity !== undefined && fuelPerSecond(request.eut, fuel) > fuelCapacity;
    const channelAmps = splitFuel ? Math.floor(fuelCapacity / fuelPerSecond(voltage, fuel)) : ampsPerSteamChannel;
    const capacity = Math.min(channelAmps, blockGens);
    const channels = request.eut / voltage > capacity ? pipeChannels(currents, capacity)
      : [{ indices: machines.map((_one, index) => index), rate: request.eut / voltage }];
    for (const channel of channels) {
      if (channel.rate > 0) placePower(channel.indices.flatMap((index) => machines[index]), channel.rate * voltage);
    }
  }
  const peak = powerBlocks.reduce((sum, block) => sum + block.peak, 0);
  const columns = new Map<string, Set<string>>();
  const productionCells: Vec3[] = [];
  const productionAt = (cell: Vec3) => {
    productionCells.push(cell);
    const chunk = productionChunk(cell);
    const filled = columns.get(chunk) ?? new Set<string>();
    filled.add(`${cell[0]},${cell[2]}`);
    columns.set(chunk, filled);
  };
  for (const [key, cell] of grid) {
    if (!cell.isHollow && !/pipe|^cable|^ownChest$|hopper/i.test(cell.kind)) productionAt(cellOf(key));
  }
  const machineChunks = new Set(columns.keys());
  const boilerChunks = new Set(boilerCells.map(productionChunk));
  boilerCells.forEach(productionAt);
  for (const { spot, peak } of powerBlocks) {
    const perRow = spot.perRow;
    const rows = Math.ceil(peak / voltage / perRow);
    const rowsPerFloor = spot.rowsPerFloor;
    for (let row = 0; row < Math.min(rows, rowsPerFloor); row += 1) {
      for (let column = 0; column < Math.min(perRow, Math.ceil(peak / voltage) - row * perRow); column += 1) {
        productionAt([spot.left + column, 0, spot.busZ - 1 - row * 2]);
      }
    }
  }
  const used = boxOf(productionCells);
  const size: FactoryStats["chunkSize"] = productionCells.length > 0
    ? [chunksBetween(used.min[0], used.max[0], WEST), chunksBetween(used.min[2], used.max[2])]
    : [1, 1];
  // Трубы и кабели считаем только для выбранного расположения машин и генераторов.
  const finish = async (onReady: (progress: BuildProgress) => void): Promise<Factory> => {
    notify = onReady;
    const mufflerAir = new Set([...grid].flatMap(([key, cell]) =>
      cell.kind === "muffler" && cell.face === "py" ? [keyOf(move(cellOf(key), "py"))] : []));
    const allows = (cell: Vec3) => columns.has(productionChunk(cell)) && !mufflerAir.has(keyOf(cell));
    const onEquipment = (cell: Vec3) => columns.get(productionChunk(cell))?.has(`${cell[0]},${cell[2]}`) ?? false;
    const nearEquipment = (cell: Vec3) => onEquipment(cell) ||
      (["px", "nx", "pz", "nz"] as const).some((face) => onEquipment(move(cell, face)));
    let boilerRunning = false;
    const within: Box = {
      min: [WEST, 0, chunkOf(used.min[2]) * CHUNK.side],
      max: [(chunkOf(used.max[0], WEST) + 1) * CHUNK.side + WEST - 1, Infinity, -1],
    };

    // Трубы: выход ряда — к входам рядов, которые его едят.
    await report(t("Прокладываю трубы", "Laying pipes"));
    const producer = new Map<number, Placed>();
    const byStep = new Map(placed.map((row) => [row.step, row]));
    for (const step of chainOrder(plan.steps, plan.target.ptr)) {
      const row = byStep.get(step);
      if (row) for (const output of step.outputs) if (!producer.has(output.goods.ptr)) producer.set(output.goods.ptr, row);
    }
    const laid = new Set<Line>();
    const machineCells = grid;
    // Линии одного прохода меняют одну рабочую сетку. Исходные клетки машин остаются отдельно.
    let lineGrid = new Map(grid);
    grid = lineGrid;
    const obstructed = new Set<Line>();
    const overCapacity = new Set<Line>();
    const markPipeOutlet = (next: Map<string, Cell>, at: Vec3, side: Face) => {
      const key = keyOf(at);
      const pipe = next.get(key);
      if (pipe) next.set(key, { ...pipe, pipeOutputs: [...new Set([...(pipe.pipeOutputs ?? []), side])] });
    };
    const ensure = (line: Line, kind: string, rate: number, fluidOutlet = false, machineOutput?: "itemOutput" | "fluidOutput") => {
      if (laid.has(line)) return true;
      if (line.cells.length === 0 || obstructed.has(line)) return false;
      const capacity = pipeUse.get(kind)?.capacity;
      if (capacity !== undefined && rate > capacity) {
        overCapacity.add(line);
        return false;
      }
      const occupied = (cell: Vec3) => {
        const key = keyOf(cell);
        const previous = grid.get(key);
        return machineCells.has(key) || (previous !== undefined && previous.kind !== kind);
      };
      if ([line.cells, ...line.spurs.map(({ path }) => path)].some((path) => path.some(occupied))) {
        obstructed.add(line);
        return false;
      }
      if (grid !== lineGrid) lineGrid = new Map(grid);
      const next = lineGrid;
      layInto(next, { path: line.cells, kind });
      for (const { path, end } of line.spurs) {
        layInto(next, { path, kind, endLink: end });
        const tail = path[path.length - 1];
        if (fluidOutlet) markPipeOutlet(next, tail, end);
        if (machineOutput) {
          const machineKey = keyOf(move(tail, end));
          const machine = next.get(machineKey);
          if (machine) next.set(machineKey, { ...machine, [machineOutput]: OPPOSITE[end] });
        }
      }
      grid = next;
      laid.add(line);
      return true;
    };
    // Какую трубу класть: по потоку шага (литров или предметов в секунду) — самая дешёвая из тех, что его тянут
    // (conduits.ts). Без списка труб (тесты, сцены сайта) — общие жидкостная и предметная трубы.
    const pipeUse = new Map<string, PipeUse>();
    const pipeFor = (isFluid: boolean, perSecond: number, kelvin = 0, mayBeGas = true): string => {
      const choice = options.pipes ? choosePipe(options.pipes, isFluid ? "fluid" : "item", perSecond, kelvin, mayBeGas) : undefined;
      if (!choice) return isFluid ? "calcFluidPipe" : "itemPipe";
      const id = kindId(choice.offer.goods.name);
      extraKinds[id] = { label: text.name(choice.offer.goods), gameItem: choice.offer.goods, texture: pipeTexture(choice.offer.goods.name), shape: "pipe" };
      const used = pipeUse.get(id);
      if (!used || used.perSecond < perSecond) pipeUse.set(id, { isFluid, perSecond, parallel: choice.parallel, capacity: choice.offer.perSecond, kelvin: Math.max(kelvin, used?.kelvin ?? 0), heat: choice.offer.heat });
      else pipeUse.set(id, { ...used, kelvin: Math.max(kelvin, used.kelvin) });
      return id;
    };
    const flowOf = (flows: readonly Flow[], isFluid: boolean) => flows.filter((flow) => (flow.goods.kind === "fluid") === isFluid).reduce((sum, flow) => sum + flow.perSecond, 0);
    // Самая горячая жидкость в трубе шага: по ней — жаростойкость трубы.
    const hottest = (flows: readonly Flow[]) => Math.max(0, ...flows.filter((flow) => flow.goods.kind === "fluid").map((flow) => fluidTemperature(flow.goods.name)));
    // Для неизвестной среды берём герметичную трубу. Вода и лава заведомо жидкости.
    const mayBeGas = (flows: readonly Flow[]) => flows.some(({ goods }) =>
      goods.kind === "fluid" && goods.name !== CALC.power.water && goods.name !== CALC.power.lava);
    const waterPipe = steamPlant ? pipeFor(true, steamPlant.water + processWater, fluidTemperature(CALC.power.water), false) : undefined;
    const inPipe = (step: Step, isFluid: boolean) => isFluid && waterPipe && processWaterOf(step) ? waterPipe
      : pipeFor(isFluid, flowOf(step.inputs, isFluid), isFluid ? hottest(step.inputs) : 0, isFluid && mayBeGas(step.inputs));
    const outPipe = (step: Step, isFluid: boolean) => pipeFor(isFluid, flowOf(step.outputs, isFluid), isFluid ? hottest(step.outputs) : 0, isFluid && mayBeGas(step.outputs));
    const isFree = (cell: Vec3) => allows(cell) && !grid.has(keyOf(cell));
    const links: Link[] = [];
    const linked = new Set<string>();
    const missingOutputs = new Set<number>();
    for (const row of placed) {
      row.step.inputs.forEach((input) => {
        const isFluid = input.goods.kind === "fluid";
        const kind = inPipe(row.step, isFluid);
        const line = isFluid ? row.fluidIn : row.itemIn;
        if (line.cells.length === 0) return;
        const source = producer.get(input.goods.ptr);
        if (source && source !== row) {
          const out = outputLine(source, isFluid);
          if (out.cells.length === 0) {
            missingOutputs.add(input.goods.ptr);
            return;
          }
          if (!ensure(out, outPipe(source.step, isFluid), flowOf(source.step.outputs, isFluid), false, isFluid ? "fluidOutput" : "itemOutput") ||
              !ensure(line, kind, flowOf(row.step.inputs, isFluid), isFluid)) return;
          // Общий участок забирает поток нескольких ответвлений. Выбираем трубу по всему выходу поставщика.
          const trunk = pipeFor(isFluid, Math.max(flowOf(source.step.outputs, isFluid), flowOf(row.step.inputs, isFluid)),
            isFluid ? Math.max(hottest(source.step.outputs), hottest(row.step.inputs)) : 0,
            isFluid && (mayBeGas(source.step.outputs) || mayBeGas(row.step.inputs)));
          const key = `${placed.indexOf(source)}>${placed.indexOf(row)}:${trunk}`;
          if (!linked.has(key)) links.push({ from: out.cells, to: line.cells, kind: trunk });
          linked.add(key);
          return;
        }
        if (!isFluid && !source) {
          // Сырьё-предмет: сундук и воронка в начале линии входа.
          if (!ensure(line, kind, flowOf(row.step.inputs, isFluid))) return;
          const side = line.startFace ?? "nx";
          const hopper = move(line.cells[0], side);
          if (isFree(hopper) && isFree(move(hopper, "py"))) {
            const hopperKind = side === "nx" ? "ownHopperRight" : "ownHopperForward";
            if (side !== "nx") extraKinds[hopperKind] = { label: t("Воронка", "Hopper"), texture: "own-hopper", shape: "hopper", spout: "pz" };
            grid = withCells(lay(grid, [line.cells[0]], kind, side), [[hopper, { kind: hopperKind }], [move(hopper, "py"), { kind: "ownChest", face: "pz" }]]);
          }
        }
        if (isFluid && !source && processWaterOf(row.step)) {
          if (!ensure(line, kind, flowOf(row.step.inputs, isFluid), true)) return;
          if (waterPipe) return;
          const tail = line.cells.find((cell) => FACES.some((face) => face !== "ny" && isFree(move(cell, face))));
          const face = tail && FACES.find((side) => side !== "ny" && isFree(move(tail, side)));
          if (tail && face) {
            const tank = move(tail, face);
            grid = withCells(withLink(grid, [tail], face), [[tank, { kind: TANK }]]);
            marks.push({ kind: "row", cell: move(tank, "py"), title: t("Вода из внешнего источника", "External water supply"), lines: [flowLine(input, text)] });
          }
        }
      });
    }
    // Выход цели проложен всегда — в его конец встанет сундук с товаром.
    const last = producer.get(plan.target.ptr);
    const productIsFluid = plan.target.kind === "fluid";
    const productLine = last ? outputLine(last, productIsFluid) : NO_LINE;
    if (last) {
      if (productLine.cells.length === 0) missingOutputs.add(plan.target.ptr);
      else ensure(productLine, outPipe(last.step, productIsFluid), flowOf(last.step.outputs, productIsFluid), false, productIsFluid ? "fluidOutput" : "itemOutput");
    }
    const surplusOf = new Map<Placed, Flow[]>();
    for (const flow of plan.surplus) {
      const row = producer.get(flow.goods.ptr);
      if (!row) continue;
      const isFluid = flow.goods.kind === "fluid";
      const line = outputLine(row, isFluid);
      if (line.cells.length === 0) {
        missingOutputs.add(flow.goods.ptr);
        continue;
      }
      if (!ensure(line, outPipe(row.step, isFluid), flowOf(row.step.outputs, isFluid), false, isFluid ? "fluidOutput" : "itemOutput")) continue;
      surplusOf.set(row, [...(surplusOf.get(row) ?? []), flow]);
    }
    if (missingOutputs.size > 0) notes.push(t(
      `Для части продуктов не предусмотрен выход в схеме ряда: ${missingOutputs.size}.`,
      `Some products have no output port in the row layout: ${missingOutputs.size}.`,
    ));
    // Ряды одного шага: выход к выходу, вход к входу — одна общая труба на шаг, как у одного длинного ряда.
    for (const { previous, band } of bands) {
      const pairs: [Line, Line, string, number][] = [
        [previous.itemOut, band.itemOut, outPipe(band.step, false), flowOf(band.step.outputs, false)],
        [previous.fluidOut, band.fluidOut, outPipe(band.step, true), flowOf(band.step.outputs, true)],
        [previous.itemIn, band.itemIn, inPipe(band.step, false), flowOf(band.step.inputs, false)],
        [previous.fluidIn, band.fluidIn, inPipe(band.step, true), flowOf(band.step.inputs, true)],
      ];
      for (const [from, to, kind, rate] of pairs) {
        // Трубу ряда тянем, только если у предыдущего ряда она проложена (к ней что-то подходит или от неё что-то берут).
        if (to.cells.length === 0 || !laid.has(from)) continue;
        if (!ensure(to, kind, rate, to === band.fluidIn,
          to === band.itemOut ? "itemOutput" : to === band.fluidOut ? "fluidOutput" : undefined)) continue;
        links.push({ from: from.cells, to: to.cells, kind });
      }
    }
    if (overCapacity.size > 0) notes.push(t(
      `Пропущено линий с потоком выше ёмкости одной трубы: ${overCapacity.size}. Для них нужно разделить подачу между портами машин.`,
      `Lines skipped because the flow exceeds one pipe: ${overCapacity.size}. Split those flows across machine ports.`,
    ));
    if (obstructed.size > 0) notes.push(t(
      `Труб у машин пропущено: ${obstructed.size}. Линии пересекались с корпусами или другими блоками.`,
      `Pipe lines skipped at machines: ${obstructed.size}. Their routes crossed machine bodies or other blocks.`,
    ));
    // Места под баки излишков (два в высоту слева от выхода ряда) и под сундук с товаром — обход труб их не занимает;
    // перед энергетическими люками ему не даёт встать сама эстакада (столб под кабель).
    const rows = [...placed, ...bands.map(({ band }) => band)];
    const outs = [...surplusOf].flatMap(([row, flows]) =>
      [false, true].filter((isFluid) => flows.some(({ goods }) => (goods.kind === "fluid") === isFluid))
        .map((isFluid) => outputLine(row, isFluid).cells),
    );
    const reserved = new Set([
      ...outs.map((cells) => keyOf(move(cells[0], "nx"))),
      ...(productLine.cells.length > 0 ? [keyOf(move(productLine.cells[productLine.cells.length - 1], "px"))] : []),
    ]);
    supplyCells.forEach((cell) => reserved.add(keyOf(cell)));
    const pumpPortKeys = new Set(pumpPorts.flatMap(({ steam, water }) =>
      [steam, water, move(steam, "py"), move(water, "py")].map(keyOf)));
    pumpPortKeys.forEach((key) => reserved.add(key));
    const fuelSourceKeys = new Set(powerBlocks.map(({ spot: { left, busZ } }) => keyOf([left - 2, 0, busZ])));
    // В плотной раскладке каждая отдельная линия должна иметь выход вверх даже после укладки соседних труб.
    const supplyShafts = new Map<string, string>();
    const protectShaft = (port: Vec3) => {
      for (let y = port[1] + 1; y <= heightLimit; y += 1) {
        supplyShafts.set(keyOf([port[0], y, port[2]]), keyOf(port));
      }
    };
    for (const { steam, water } of pumpPorts) {
      protectShaft(steam);
      protectShaft(water);
    }
    if (fuel) for (const { spot: { left, busZ } } of powerBlocks) protectShaft([left - 2, 0, busZ - 1]);
    for (const key of supplyShafts.keys()) reserved.add(key);
    const containerOf = (isFluid: boolean): Cell => (isFluid ? { kind: TANK } : { kind: "ownChest", face: "pz" });
    const placeOutputContainer = (tail: Vec3, kind: string, side: Face, isFluid: boolean) => {
      const next = new Map(grid);
      layInto(next, { path: [tail], kind, endLink: side });
      if (isFluid) markPipeOutlet(next, tail, side);
      next.set(keyOf(move(tail, side)), containerOf(isFluid));
      grid = next;
    };
    // Готовый товар — в сундук (жидкость — в бак) на конце выхода последнего шага.
    const product = plan.steps.find((step) => step.outputs.some((flow) => flow.goods.ptr === plan.target.ptr))?.outputs.find((flow) => flow.goods.ptr === plan.target.ptr);
    if (last && laid.has(productLine)) {
      const tail = productLine.cells[productLine.cells.length - 1];
      const side = (["px", "py", "pz", "nz"] as const).find((face) => isFree(move(tail, face)));
      if (side && allows(tail)) {
        const end = move(tail, side);
        placeOutputContainer(tail, outPipe(last.step, productIsFluid), side, productIsFluid);
        marks.push({ kind: "product", cell: move(end, "py"), title: `${t("Готовый товар", "Product")}: ${text.name(plan.target)}`, lines: product ? [flowLine(product, text)] : [] });
      }
    }
    // Излишки — в начале своего выхода: жидкости в один бак, предметы в один сундук. Над ёмкостью одна плашка:
    // у Глаза гармонии излишков под восемьдесят, и плашка на каждый складывалась в башню на полэкрана.
    for (const [row, flows] of surplusOf) {
      const groups = [true, false].map((isFluid) => ({ isFluid, flows: flows.filter((flow) => (flow.goods.kind === "fluid") === isFluid) })).filter((group) => group.flows.length > 0);
      groups.forEach(({ isFluid, flows: group }) => {
        const start = outputLine(row, isFluid).cells[0];
        const side = (["nx", "py", "pz", "nz"] as const).find((face) => isFree(move(start, face)));
        if (!side || !allows(start)) return;
        const spot = move(start, side);
        placeOutputContainer(start, outPipe(row.step, isFluid), side, isFluid);
        const title = group.length === 1 ? `${t("Излишек", "Surplus")}: ${text.name(group[0].goods)}` : `${t("Излишки", "Surplus")}: ${group.length}`;
        marks.push({ kind: "surplus", cell: move(spot, "py"), title, lines: group.map((flow) => flowLine(flow, text)) });
      });
    }
    extraKinds[TANK] = { label: t("Резервуар", "Tank"), texture: "rc-tank", isMatte: true };

    /**
     * Подача топлива ко всем блокам генераторов одной сетью труб: снизу стояка каждого блока (supplyRow, x = left − 2) —
     * вход. Жидкое топливо — из одного бака у первого блока (стержни и болты — из сундука), пар — из котельной; от
     * источника труба идёт к каждому следующему блоку, к ближайшей клетке уже проложенной сети.
     */
    let missingSupply = 0;
    const feedGenerators = (laid: Grid, chosen: Fuel, fuelPipe: string, risers: readonly Vec3[], perSecond: number, bank: typeof boilers, clamp: Box,
      steamRates?: readonly number[]): Grid => {
      const network: Vec3[] = [];
      let next = laid;
      let rest = risers;
      const blockedAt = (start: Vec3) => {
        const ownAbove = keyOf(move(start, "py"));
        const own = keyOf(start);
        return { has: (key: string) => (pumpPortKeys.has(key) && key !== ownAbove) ||
          (supplyShafts.has(key) && supplyShafts.get(key) !== own) || fuelSourceKeys.has(key) };
      };
      const connectedPipes = (start: Vec3, kind: string) => {
        const cells = [start];
        const seen = new Set(cells.map(keyOf));
        for (const entry of cells) {
          for (const side of next.get(keyOf(entry))?.links ?? []) {
            const cell = move(entry, side);
            const key = keyOf(cell);
            const pipe = next.get(key);
            if (seen.has(key) || pipe?.kind !== kind || !pipe.links?.includes(OPPOSITE[side])) continue;
            seen.add(key);
            cells.push(cell);
          }
        }
        return cells;
      };
      const connect = (start: Vec3, goals: Vec3[], kind: string, startLink?: Face) => {
        const top = goals.reduce((highest, cell) => Math.max(highest, cell[1]), start[1]) + 1;
        const low: Box = { min: clamp.min, max: [clamp.max[0], top, clamp.max[2]] };
        const route = (box: Box) => findPath(next, start, goals, CALC.factory.routeMargin, used, { blocked: blockedAt(start), clamp: box, allows, allowsStep: pipeStepInsideChunk });
        const path = route(low) ?? route(clamp);
        if (!path) return false;
        next = lay(next, path, kind, startLink);
        goals.push(...path);
        return path[path.length - 1];
      };
      if (!chosen.steam || !bank || !steamPlant) {
        const source = risers.find((riser) => {
          const tank = move(riser, "pz");
          return allows(tank) && !next.has(keyOf(tank));
        });
        if (!source) {
          missingSupply += risers.length;
          notes.push(t("В канале топлива нет места для бака или сундука у генераторов.", "The fuel channel has no room for a tank or chest near the generators."));
          return next;
        }
        const tank = move(source, "pz");
        const unit = chosen.isItem ? t("шт/мин", "/min") : t("л/мин", "L/min");
        marks.push({ kind: "row", cell: move(tank, "py"), title: `${t("Топливо", "Fuel")}: ${text.name(chosen.goods)}`, lines: [`${text.number(perSecond * CALC.ui.secondsPerMinute, 1)} ${unit}`] });
        next = withCells(withLink(next, [source], "pz"), [[tank, chosen.isItem ? { kind: "ownChest", face: "pz" } : { kind: TANK }]]);
        network.push(...connectedPipes(source, fuelPipe));
        rest = risers.filter((riser) => riser !== source);
      } else {
        const { boiler } = chosen.steam;
        const plant = steamPlant;
        const boilerWaterPipe = waterPipe ?? pipeFor(true, plant.water, fluidTemperature(CALC.power.water), false);
        const lavaPipe = plant.lavaPerSecond === undefined ? undefined
          : pipeFor(true, plant.lavaPerSecond, fluidTemperature(CALC.power.lava), false);
        const coalPipe = plant.coalPerMinute === undefined ? undefined : pipeFor(false, plant.coalPerMinute / CALC.ui.secondsPerMinute);
        const boilerFuel = lavaPipe ?? coalPipe;
        const built = "def" in boiler
          ? multiBoilerBank(bank.count, boiler, fuelPipe, boilerWaterPipe, coalPipe ?? "itemPipe", steamRates !== undefined)
          : boilerBank(bank.count, boiler.slug, fuelPipe, boilerWaterPipe, heightLimit,
            boilerFuel ? { pipe: boilerFuel, isLava: lavaPipe !== undefined } : undefined);
        const at = (cell: Vec3) => shiftCell(cell, bank.at);
        if (!("def" in boiler)) extraKinds[boiler.slug] = singleKind(boiler.slug, t(boiler.title, boiler.name));
        next = withCells(next, [...built.grid.entries()].map(([key, cell]): readonly [Vec3, Cell] => [at(cellOf(key)), cell]));
        boilerRunning = true;
        const water = at(built.waterIn);
        next = withCells(withLink(next, [move(water, "px")], "nx"), [[water, { kind: TANK }]]);
        marks.push({ kind: "row", cell: move(water, "py"), title: t("Пусковой бак воды", "Startup water tank"), lines: [
          t("Заполните перед пуском: насос начинает качать после подачи пара.", "Fill before startup: the pump needs steam to start."),
        ] });
        if (built.coalIn) {
          const coal = at(built.coalIn);
          next = withCells(withLink(next, [move(coal, "px")], "nx"), [[coal, { kind: "ownChest", face: "pz" }]]);
          marks.push({ kind: "row", cell: move(coal, "py"), title: t("Уголь для котлов", "Boiler coal"), lines: [
            `${text.number(plant.coalPerMinute ?? 0, 1)} ${t("шт/мин", "items/min")}`,
            t("Подача из сундука в предметную трубу через конвейер.", "A conveyor feeds coal from the chest into the item pipe."),
          ] });
        }
        if (built.lavaIn) {
          const lava = at(built.lavaIn);
          next = withCells(withLink(next, [move(lava, "px")], "nx"), [[lava, { kind: TANK }]]);
          marks.push({ kind: "row", cell: move(lava, "py"), title: t("Лава для котлов", "Boiler lava"), lines: [
            `${text.number(plant.lavaPerSecond ?? 0, 1)} ${t("л/с", "L/s")}`,
            t("Подача из бака в жидкостную трубу через помпу.", "A pump feeds lava from the tank into the fluid pipe."),
          ] });
        }
        // Выход пара котельной — клетка у её общей трубы пара: от неё сеть идёт к блокам генераторов.
        const out = at(built.steamOut);
        if (!steamRates) {
          next = withLink(lay(next, [out], fuelPipe, "nx"), [move(out, "nx")], "px");
          network.push(...connectedPipes(out, fuelPipe));
        }
        // У Railcraft пар выходит из блоков бака. Каждый канал занимает свою грань
        // и расходует часть мощности именно того котла, к которому подключён.
        const availableSteam = Array.from({ length: bank.count }, () => chosen.steam!.steamPerSecond);
        const taps = steamRates && "def" in boiler ? [...built.grid].flatMap(([key, block]) => {
          if (block.kind !== "rcTank") return [];
          const cell = cellOf(key);
          const tower = built.towerStarts!.findLastIndex((x) => x <= cell[0]);
          const copy = tower * CALC.equipmentHeight.multiblockStack + Math.floor(cell[1] / boiler.def.layers.length);
          return (["pz", "px", "nz", "nx"] as const).flatMap((side) => {
            const port = move(cell, side);
            return built.grid.has(keyOf(port)) ? [] : [{ copy, port: at(port), face: OPPOSITE[side] }];
          });
        }) : [];
        const nearSteam = new Set<string>();
        const channelToBoiler = (rate: number, starts: readonly Vec3[], startLink?: Face) => {
          if (railcraftCapacity === undefined || rate > railcraftCapacity) return false;
          const candidates = taps.filter(({ copy, port }) => availableSteam[copy] >= rate && !next.has(keyOf(port)) && !pumpPortKeys.has(keyOf(port)));
          const [start, ...others] = starts;
          const goals = candidates.map(({ port }) => port);
          const terminals = new Set([...starts, ...goals].map(keyOf));
          const routing = { starts: others, blocked: blockedAt(start), clamp, allows,
            preference: (cell: Vec3) => Number(nearSteam.has(keyOf(cell))) };
          const path = findPath(next, start, goals, CALC.factory.routeMargin, used, { ...routing, allowsStep: pipeStepInsideChunk }) ??
            findPath(next, start, goals, CALC.factory.routeMargin, used, {
              ...routing,
              allowsStep: (from, to) => pipeStepInsideChunk(from, to) || terminals.has(keyOf(from)) || terminals.has(keyOf(to)),
            });
          if (!path) return false;
          const end = path[path.length - 1];
          const tap = candidates.find(({ port }) => keyOf(port) === keyOf(end))!;
          next = lay(next, path, fuelPipe, startLink, tap.face);
          for (const cell of path) for (const side of FACES) nearSteam.add(keyOf(move(cell, side)));
          availableSteam[tap.copy] -= rate;
          return true;
        };
        // Можно врезаться и выше бака, если нижнее колено закрыто корпусом или другой трубой.
        const waterNetwork = connectedPipes(move(water, "px"), boilerWaterPipe);
        const pumpSteam = new Map<string, number>();
        for (const { steam } of pumpPorts) pumpSteam.set(keyOf(steam), (pumpSteam.get(keyOf(steam)) ?? 0) + PRODUCTION.waterPump.steamPerSecond);
        if (steamRates) {
          const channels = risers.map((riser, index) => ({ riser, rate: steamRates[index] })).sort((a, b) => b.rate - a.rate);
          let failed = 0;
          for (const { riser, rate } of channels) {
            // Большие нагрузки получают выход котла первыми; меньшие входят в оставшуюся ёмкость.
            if (!channelToBoiler(rate, connectedPipes(riser, fuelPipe))) failed += 1;
          }
          missingSupply += failed;
          if (failed > 0) notes.push(t(`Трубу пара к ${failed} блокам турбин проложить не удалось.`, `Could not run steam pipes to ${failed} turbine blocks.`));
          rest = [];
        }
        for (const [key, rate] of pumpSteam) {
          const steam = cellOf(key);
          const connected = steamRates ? channelToBoiler(rate, [steam], "pz") : connect(steam, network, fuelPipe, "pz");
          if (!connected) {
            missingSupply += 1;
            notes.push(t("Не удалось соединить паровой насос с котельной: подача пара.", "Could not connect the water pump to the boiler bank: steam supply."));
          }
        }
        for (const pump of pumpPorts) {
          const waterConnected = connect(pump.water, waterNetwork, boilerWaterPipe, "pz");
          if (!waterConnected) {
            missingSupply += 1;
            notes.push(t("Не удалось соединить паровой насос с котельной: выход воды.", "Could not connect the water pump to the boiler bank: water outlet."));
          }
        }
        for (const row of placed) {
          if (!processWaterOf(row.step) || !row.fluidIn.cells.some((cell) => next.get(keyOf(cell))?.kind === boilerWaterPipe)) continue;
          if (!row.fluidIn.cells.some((cell) => connect(cell, waterNetwork, boilerWaterPipe))) {
            missingSupply += 1;
            notes.push(t(`Не удалось подвести воду: ${text.crafter(row.step.crafter)}.`, `Could not supply water: ${text.crafter(row.step.crafter)}.`));
          }
        }
        marks.push({
          kind: "row",
          cell: move(at([CHUNK.side / [0, 0].length, built.footprint.max[1], -1]), "py"),
          title: `${t(boiler.title, boiler.name)} × ${bank.count}`,
          lines: [
            `${t("Пар", "Steam")}: ${text.number(perSecond * CALC.ui.secondsPerMinute)} ${t("л/мин", "L/min")}`,
            ...(steamRates ? [`${t("Раздельных паровых линий запланировано", "Separate steam lines planned")}: ${text.number(steamRates.length + pumpSteam.size)}`] : []),
            `${t("Вода от насосов", "Water from pumps")}: ${text.number(plant.water, 1)} ${t("л/с", "L/s")}`,
            ...(plant.coalPerMinute !== undefined ? [`${t("Уголь", "Coal")}: ${text.number(plant.coalPerMinute, 1)} ${t("в минуту", "per minute")}`] : []),
            ...(plant.lavaPerSecond !== undefined ? [`${t("Лава", "Lava")}: ${text.number(plant.lavaPerSecond)} ${t("л/с", "L/s")}`] : []),
          ],
        });
      }
      let failed = 0;
      for (const riser of rest) {
        const [start, ...starts] = connectedPipes(riser, fuelPipe);
        const path = findPath(next, start, network, CALC.factory.routeMargin, used, {
          starts, blocked: blockedAt(start), clamp, allows, allowsStep: pipeStepInsideChunk,
        });
        if (!path) { failed += 1; continue; }
        next = lay(next, path, fuelPipe);
        network.push(...path);
      }
      missingSupply += failed;
      if (failed > 0) notes.push(t(`Трубу топлива к ${failed} блокам генераторов проложить не удалось.`, `Could not run the fuel pipe to ${failed} generator blocks.`));
      return next;
    };

    // Энергия: генераторы яруса и кабели к каждой машине. Кирпичным постройкам энергия не нужна.
    await report(t("Ставлю генераторы и тяну кабели", "Placing generators and running cables"));
    let missingPower = 0;
    const consumers = [...placed, ...bands.map(({ band }) => band)].flatMap((row) =>
      row.consumers.filter((_hatch, index) => !generator || (hatchCurrent.get(row)?.[index] ?? 0) > 0));
    let cable: Energy["cable"] | undefined;
    let run: CableRun | undefined;
    if (consumers.length > 0 && plan.averageEut > 0) {
      if (!generator) {
        missingPower = consumers.length;
        const tierName = CALC.tierNames[plan.tier];
        notes.push(t(`Генераторов яруса ${tierName} на сайте пока нет — энергия не показана.`, `The site has no ${tierName} generators yet — power is not shown.`));
      }
      else {
        try {
          const fuelRate = fuel ? steamPlant?.steam ?? fuelPerSecond(peak, fuel) : 0;
          const kelvin = fuel && !fuel.isItem ? fluidTemperature(fuel.goods.name) : 0;
          const capacity = fuel && options.pipes ? choosePipe(options.pipes, fuel.isItem ? "item" : "fluid", fuelRate, kelvin)?.offer.perSecond : undefined;
          const channels = fuel
            ? !fuel.steam && capacity !== undefined && fuelRate > capacity
              ? pipeChannels(powerBlocks.map((block) => fuelPerSecond(block.peak, fuel)), capacity)
              : [{ indices: powerBlocks.map((_block, index) => index), rate: fuelRate }]
            : [];
          const steamRates = splitSteam && fuel ? powerBlocks.map((block) => fuelPerSecond(block.peak, fuel)) : undefined;
          const fuelLines = fuel ? channels.map((channel) => ({ ...channel, kind: pipeFor(!fuel.isItem,
            steamRates ? Math.max(PRODUCTION.waterPump.steamPerSecond, ...steamRates) : channel.rate, kelvin) })) : [];
          const fuelPipes = new Map(fuelLines.flatMap(({ indices, kind }) => indices.map((index) => [index, kind] as const)));
          // Люки распределяются между сетями по целым амперам при одновременной работе.
          const energies: Energy[] = [];
          for (const [index, block] of powerBlocks.entries()) {
            const loads = block.loads;
            const energy = powerFor(grid, loads.map(({ hatch }) => hatch), tierId, block.peak, generator.slug,
              CALC.factory.routeMargin, within, { ...block.spot, amps: loads.map(({ amps }) => amps) }, fuelPipes.get(index),
              (cell) => allows(cell) && !pumpPortKeys.has(keyOf(cell)) && !fuelSourceKeys.has(keyOf(cell)) && !supplyShafts.has(keyOf(cell)));
            grid = energy.grid;
            energies.push(energy);
            const { left, busZ, perRow, rowsPerFloor } = block.spot;
            const floors = Math.ceil(energy.generators / perRow / rowsPerFloor);
            const top = fuel ? supplyFloorY(floors - 1) : floors - 1;
            marks.push({ kind: "row", cell: [left + Math.floor((perRow - 1) / 2), top + 1, busZ - 1],
              title: `${t(generator.title, generator.name)} × ${energy.generators}`, lines: [
                `${t("Выход через кабель", "Cable output")}: ${text.number(block.peak)} EU/t · ${text.number(block.peak / voltage)} A`,
                ...(fuel ? [`${t("Вход через трубу", "Pipe inlet")}: ${text.name(fuel.goods)}`] : []),
              ] });
          }
          if (fuel && powerBlocks.length > 0) {
            for (const channel of fuelLines) {
              const overloaded = !steamRates && capacity !== undefined && channel.rate > capacity;
              if (overloaded) missingSupply += channel.indices.length;
              if (overloaded) notes.push(t(
                "Поток топлива выше ёмкости трубы. Нужны раздельные стояки или выходы котельной.",
                "Fuel flow exceeds pipe capacity. Separate risers or boiler outlets are required.",
              ));
              if (overloaded && !fuel.steam) continue;
              const risers = overloaded ? [] : channel.indices.map((index): Vec3 => {
                const { left, busZ } = powerBlocks[index].spot;
                return [left - 2, 0, busZ - 1];
              });
              grid = feedGenerators(grid, fuel, channel.kind, risers, fuelPerSecond(
                channel.indices.reduce((sum, index) => sum + powerBlocks[index].peak, 0), fuel), boilers, within, steamRates);
            }
          }
          const [first] = energies;
          if (!first) throw new Error("Нет блоков генераторов");
          // Сводка кабеля — по всем блокам: сетей сколько всего, ток сети — наибольший.
          const energy: Energy = {
            ...first,
            generators: energies.reduce((sum, one) => sum + one.generators, 0),
            cable: {
              ...first.cable,
              amps: Math.max(...energies.map((one) => one.cable.amps)),
              size: Math.max(...energies.map((one) => one.cable.size)),
              networks: energies.reduce((sum, one) => sum + one.cable.networks, 0),
            },
          };
          cable = energy.cable;
          const cut = consumers.filter(({ hatch, face }) => grid.get(keyOf(move(hatch, face)))?.kind !== energy.cable.kind).length;
          missingPower = cut;
          run = cableRun(grid, energy.cable.kind, generator.slug, consumers.map(({ hatch, face }) => move(hatch, face)));
          // Блок кабеля на сцене — выбранный материал: изолированный кабель снаружи тёмная изоляция, голый провод
          // (сверхпроводники) — провод. shortcut: провод рисуется одним рисунком сверхпроводника UV, цвет материала —
          // когда понадобится, по таблице цветов материалов мода.
          const spec = cableSpec(energy.cable, tierId, text, options);
          extraKinds[energy.cable.kind] = { label: spec.label, gameItem: spec.goods, gameName: spec.name, texture: / Wire$/.test(spec.name) ? "i-cable-superconductoruv" : "cable-insulated", shape: "pipe" };
          Object.assign(extraKinds, energy.extraKinds);
        } catch {
          missingPower = consumers.length;
          notes.push(t("Кабели к машинам проложить не удалось — генераторы не показаны.", "Could not run cables to the machines — generators are not shown."));
        }
      }
    }

    // Сначала проводим отдельные линии топлива: общие производственные трубы могут войти в сеть с разных сторон.
    const cableExits = rows.flatMap((row) => row.consumers.map(({ hatch, face }) => move(hatch, face)));
    const unlinked: Link[] = [];
    let routed = await rack(grid, links, reserved, cableExits, within, allows, unlinked, false, closeFit ? nearEquipment : undefined);
    let missingRoutes = unlinked.length;
    if (missingRoutes > 0 && size[0] * size[1] <= CALC.factoryRouteRetryChunks) {
      // Простая труба может перекрыть узкий проход. Перекладываем трубы, начиная с непроложенных.
      const priority = new Set(unlinked);
      const failed: Link[] = [];
      const pendingCableExits = cableExits.filter((exit) => !/^cable/i.test(grid.get(keyOf(exit))?.kind ?? ""));
      const reordered = await rack(grid, [...priority, ...links.filter((link) => !priority.has(link))],
        reserved, pendingCableExits, within, allows, failed, missingPower === 0);
      if (failed.length < missingRoutes) {
        routed = reordered;
        missingRoutes = failed.length;
      }
      if (closeFit && serviceSpace && missingPower === 0 && missingRoutes > 0) {
        const reversedFailures: Link[] = [];
        const reversed = await rack(grid, links.toReversed(), reserved, pendingCableExits, within, allows, reversedFailures, true);
        if (reversedFailures.length < missingRoutes) {
          routed = reversed;
          missingRoutes = reversedFailures.length;
        }
      }
    }
    grid = routed;

    // Готовые отводы ряда и ёмкости тоже могут выглянуть за край. Оставляем только чанки, где реально стоят машины.
    const liveChunks = new Set(machineChunks);
    if (boilerRunning) boilerChunks.forEach((chunk) => liveChunks.add(chunk));
    if (generator) for (const [key, cell] of grid) {
      if (cell.kind === generator.slug) liveChunks.add(productionChunk(cellOf(key)));
    }
    if (liveChunks.size > 0) {
      const inside = (cell: Vec3) => liveChunks.has(productionChunk(cell));
      const compact = new Map<string, Cell>();
      for (const [key, cell] of grid) {
        const at = cellOf(key);
        if (!inside(at)) continue;
        compact.set(key, cell.links ? { ...cell, links: cell.links.filter((side) => inside(move(at, side))) } : cell);
      }
      grid = compact;
    }
    grid = pruneStubs(grid);
    // Пустой фабрики не бывает: если рисовать нечего (одни ручные шаги), ставим сундук с товаром.
    if (grid.size === 0) grid = withCells(grid, [[[0, 0, 0], { kind: "ownChest", face: "pz" }]]);

    // Клетка сетки → точка сцены: так же, как toMachine и buildStructure раскладывают блоки (середина по x и z, низ по y).
    const all = boxOf([...grid.keys()].map(cellOf));
    const chunkWidth = chunksBetween(all.min[0], all.max[0], WEST);
    const chunkDepth = chunksBetween(all.min[2], all.max[2]);
    const toScene = ([x, y, cz]: Vec3): Vec3 => [
      (x - (all.min[0] + all.max[0]) / [0, 0].length) * EBF.blockSize,
      (y - all.min[1] + 1 / [0, 0].length) * EBF.blockSize,
      (cz - (all.min[2] + all.max[2]) / [0, 0].length) * EBF.blockSize,
    ];
    const kinds = [...grid.values()].map((cell) => cell.kind);
    const count = (test: (kind: string) => boolean) => kinds.filter(test).length;
    const conduits = [...conduitList(pipeUse, cable, kinds, extraKinds, tierId, text, options, peak, run), ...(cable && generator ? fuelLine(peak, options.power?.fuel, text, steamPlant) : [])];
    return {
      machine: toMachine(grid, { slug, name: "Factory", title: `${t("Фабрика", "Factory")}: ${text.name(plan.target)}`, tier: tierId, summary: "", story: [], facts: [], source: "" }, extraKinds),
      notes,
      missingConnections: missingRoutes + missingPower + missingOutputs.size + overCapacity.size + obstructed.size + missingAmps + missingSupply,
      markers: marks.map(({ cell, ...mark }) => ({ ...mark, at: toScene(cell) })),
      // Граница чанков перед клеткой WEST (грань блока — полблока до его середины): по ней сцена рисует сетку чанков.
      chunkOrigin: [toScene([WEST, 0, 0])[0] - EBF.blockSize / [0, 0].length, toScene([WEST, 0, 0])[2] - EBF.blockSize / [0, 0].length],
      conduits,
      stats: {
        machines: plan.steps.filter((step) => step.crafter.kind !== "hand").reduce((sum, step) => sum + step.machines, 0),
        drawn,
        pipes: count((kind) => /pipe/i.test(kind)),
        tanks: count((kind) => kind === TANK),
        chests: count((kind) => kind === "ownChest"),
        cables: count((kind) => /^cable/i.test(kind)),
        chunks: chunkWidth * chunkDepth,
        chunkSize: [chunkWidth, chunkDepth],
        productionChunks: liveChunks.size,
        generationEut: generator ? count((kind) => kind === generator.slug) * voltage : 0,
      },
    };
  };
  const leastFilled = columns.size > 0 ? Math.min(...Array.from(columns.values(), (filled) => filled.size)) : 0;
  const familySpread = [...multiFamilies.values()].reduce((sum, { min, max }) =>
    sum + chunksBetween(min[0], max[0], WEST) * chunksBetween(min[2], max[2]), 0);
  return { size, occupied: columns.size, singleChunks: singleChunks.size, leastFilled, familySpread, wallSavings, finish };
}

/**
 * Не даём отсутствию пустых чанков перевесить форму фабрики: длинная полоса проигрывает компактному блоку.
 */
export async function buildFactory(
  plan: Plan,
  slug: string,
  text: FactoryText = RUSSIAN,
  onProgress: (progress: BuildProgress) => void = () => {},
  options: FactoryOptions = {},
): Promise<Factory> {
  const [first] = CALC.factory.bandChunks;
  // Порядок рядов — цепочкой (поставщик рядом с потребителем) или по уровню от сырья: что выйдет компактнее.
  const chain = chainOrder(plan.steps, plan.target.ptr);
  const sameOrder = (a: readonly Step[], b: readonly Step[]) => a.every((step, position) => step === b[position]);
  const biggest = new Map<string, number>();
  for (const step of chain) {
    const machine = step.crafter.machine;
    if (machine) biggest.set(machine.slug, Math.max(biggest.get(machine.slug) ?? 0, drawnCopies(step)));
  }
  const sizeOfFamily = (step: Step) => biggest.get(step.crafter.machine?.slug ?? "") ?? 0;
  const grouped = chain.toSorted((a, b) => sizeOfFamily(b) - sizeOfFamily(a) ||
    (sizeOfFamily(a) > 0 ? drawnCopies(b) - drawnCopies(a) : 0));
  const orders = [chain, plan.steps, grouped].filter((order, position, all) =>
    !all.slice(0, position).some((earlier) => sameOrder(order, earlier)));
  let best = await placeFactory(plan, slug, text, onProgress, first, options, chain);
  // Для большой фабрики прикидываем ширину квадрата по площади первой раскладки и пробуем соседнюю ширину.
  const area = ([width, depth]: FactoryStats["chunkSize"]) => width * depth;
  const emptyChunks = ({ size, occupied }: typeof best) => occupied > 0 ? area(size) - occupied : 0;
  const overhang = ([width, depth]: FactoryStats["chunkSize"]) => Math.max(0, Math.max(width, depth) - 2 * Math.min(width, depth));
  const estimate = Math.ceil(Math.sqrt(area(best.size)));
  const widths = [...new Set([...CALC.factory.bandChunks, estimate, estimate + 1])].filter((width) => width <= Math.max(...best.size));
  const rank = (candidate: typeof best) => {
    const { size, singleChunks, leastFilled, familySpread, wallSavings } = candidate;
    return [overhang(size), area(size), emptyChunks(candidate), singleChunks, Math.max(...size), -wallSavings, familySpread, -leastFilled];
  };
  const compare = (a: typeof best, b: typeof best) => {
    const other = rank(b);
    return rank(a).map((value, index) => value - other[index]).find((value) => value !== 0) ?? 0;
  };
  let runnerUp: typeof best | undefined;
  for (const [position, order] of orders.entries()) {
    for (const bandChunks of widths) {
      if (position === 0 && bandChunks === first) continue;
      await yieldToBrowser();
      const candidate = await placeFactory(plan, slug, text, undefined, bandChunks, options, order);
      if (compare(candidate, best) < 0) {
        runnerUp = best;
        best = candidate;
      } else if (!runnerUp || compare(candidate, runnerUp) < 0) runnerUp = candidate;
    }
  }
  if (emptyChunks(best) > 0 || overhang(best.size) > 0) {
    for (const order of orders) {
      for (const bandChunks of widths) {
        await yieldToBrowser();
        const candidate = await placeFactory(plan, slug, text, undefined, bandChunks, options, order, true);
        if (compare(candidate, best) >= 0) continue;
        runnerUp = best;
        best = candidate;
      }
      if (emptyChunks(best) === 0 && overhang(best.size) === 0) break;
    }
  }
  const factory = await best.finish(onProgress);
  const actualHoles = ({ stats }: Factory) => stats.chunks - stats.productionChunks;
  // На любом ярусе пробуем убрать зазор между группами, если фабрику ещё можно уменьшить.
  // Лимит сравнения числа блоков труб не ограничивает поиск меньшей площадки.
  if (factory.stats.chunks > 1 || factory.missingConnections > 0) {
    let compact = best;
    let compactFactory: Factory | undefined;
    for (const order of orders) {
      for (const width of widths) {
        await yieldToBrowser();
        const current = compactFactory ?? factory;
        const hasHoles = actualHoles(current) > 0;
        const candidate = await placeFactory(plan, slug, text, undefined, width, options, order, hasHoles, false, true);
        if (overhang(candidate.size) > overhang(compact.size)) continue;
        const areaDifference = area(candidate.size) - area(compact.size);
        const fillsHoles = hasHoles && area(candidate.size) <= current.stats.chunks &&
          emptyChunks(candidate) < actualHoles(current);
        const gathersSingles = candidate.singleChunks < compact.singleChunks && area(candidate.size) <= current.stats.chunks;
        if (!fillsHoles && areaDifference === 0 && candidate.singleChunks > compact.singleChunks) continue;
        if (!fillsHoles && !gathersSingles && (areaDifference > 0 || (areaDifference === 0 && compare(candidate, compact) >= 0 &&
          (compactFactory !== undefined || factory.missingConnections === 0)))) continue;
        const alternative = await candidate.finish(() => {});
        const holeDifference = actualHoles(alternative) - actualHoles(current);
        if (alternative.missingConnections !== 0 || holeDifference > 0 ||
          (holeDifference === 0 && (alternative.stats.chunks > current.stats.chunks ||
          (alternative.stats.chunks === current.stats.chunks && current.missingConnections === 0 &&
            candidate.singleChunks >= compact.singleChunks &&
            candidate.leastFilled <= compact.leastFilled &&
            alternative.stats.pipes + alternative.stats.cables >= current.stats.pipes + current.stats.cables))) ||
          alternative.notes.some((note) => !factory.notes.includes(note))) continue;
        if (alternative.stats.chunks === 1) return alternative;
        compact = candidate;
        compactFactory = alternative;
      }
    }
    if (compactFactory) return compactFactory;
  }
  if (factory.missingConnections > 0 && area(best.size) <= CALC.factoryRouteRetryChunks) {
    let connected = factory;
    if (runnerUp && area(runnerUp.size) <= CALC.factoryRouteRetryChunks) {
      const alternative = await runnerUp.finish(() => {});
      if (alternative.missingConnections < connected.missingConnections && actualHoles(alternative) <= actualHoles(connected)) connected = alternative;
    }
    const band = Math.max(2, Math.min(...best.size));
    const retries: (typeof best)[] = [];
    for (const [closeFit, sharedAisle] of [[true, true], [true, false], [false, false]]) {
      for (const width of [band, band + 1]) {
        retries.push(await placeFactory(plan, slug, text, undefined, width, options, chain, true, true, closeFit, sharedAisle));
      }
    }
    // Сначала сравниваем площадки. Дорогой поиск путей запускаем с самой компактной.
    for (const spaced of retries.sort(compare)) {
      if (connected.missingConnections === 0 && area(spaced.size) >= connected.stats.chunks) continue;
      const alternative = await spaced.finish(() => {});
      // Рабочая раскладка важнее пустот внутри её прямоугольных границ.
      // Через такие чанки трубы и кабели всё равно не прокладываются.
      if (alternative.missingConnections > 0 && actualHoles(alternative) > actualHoles(connected)) continue;
      if (alternative.missingConnections < connected.missingConnections ||
        (alternative.missingConnections === connected.missingConnections && alternative.stats.chunks < connected.stats.chunks)) connected = alternative;
    }
    return connected;
  }
  const blocks = ({ stats }: Factory) => stats.pipes + stats.cables;
  if (!runnerUp || runnerUp.singleChunks !== best.singleChunks || runnerUp.wallSavings !== best.wallSavings || area(best.size) > CALC.conduitComparisonChunks || Math.max(...best.size) !== Math.max(...runnerUp.size) ||
    area(best.size) !== area(runnerUp.size) || best.occupied !== runnerUp.occupied ||
    blocks(factory) > CALC.conduitComparisonBlocks) return factory;
  const alternative = await runnerUp.finish(() => {});
  const sameWarnings = alternative.notes.length <= factory.notes.length && alternative.notes.every((note) => factory.notes.includes(note));
  return sameWarnings && alternative.missingConnections <= factory.missingConnections &&
    actualHoles(alternative) <= actualHoles(factory) && blocks(alternative) < blocks(factory)
    ? alternative : factory;
}
