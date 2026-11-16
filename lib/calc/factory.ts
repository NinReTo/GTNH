import { CALC } from "../config";
import { addHatch, boxOf, cellOf, keyOf, lay, move, placeMachine, toMachine, withCells, type Cell, type Grid } from "../layout";
import { kindsOf, type Machine } from "../machines";
import { COKE_UNIT, energyHatches, generatorsOf, powerFor, rowAt, sharedRow, singleKind, withLink } from "../setups";
import type { BlockKind, Face, Vec3 } from "../structure";
import { TIERS, type TierId } from "../tiers";
import type { Plan, Step } from "./planner";

/**
 * Фабрика из плана калькулятора — постройка для той же трёхмерной сцены, что и машины сайта. Каждый шаг — ряд машин,
 * ряды идут от сырья (спереди) к цели (сзади). У ряда три трубы: вход предметов, вход жидкостей и выход. Отводы от труб
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

export interface Factory {
  readonly machine: Machine;
  /** Что в фабрике не нарисовано: ручные шаги (автокрафт), лишние копии построек. */
  readonly notes: readonly string[];
}

type Hatch = { readonly hatch: Vec3; readonly face: Face };

/** Отвод от трубы: путь от клетки трубы до клетки перед входом машины и сторона, куда он упирается в машину. */
interface Spur {
  readonly path: readonly Vec3[];
  readonly end: Face;
}

/** Труба вдоль ряда и её отводы к машинам. Пустая — у ряда такого входа нет. */
interface Line {
  readonly cells: readonly Vec3[];
  readonly spurs: readonly Spur[];
}

interface Placed {
  readonly step: Step;
  readonly itemIn: Line;
  readonly fluidIn: Line;
  readonly out: Line;
  readonly consumers: readonly Hatch[];
}

/** Ряд шага на фабрике и z, с которого начинается следующий ряд. */
interface Slot {
  readonly grid: Grid;
  readonly placed: Placed;
  readonly nextZ: number;
}

const NO_LINE: Line = { cells: [], spurs: [] };
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
  if (crafter.single) return singleKind(crafter.single.slug, crafter.label);
  return { label: crafter.label, texture: `hull-${tierId}-side`, top: `hull-${tierId}-top`, bottom: `hull-${tierId}-bottom` };
}

const kindId = (label: string): string => `calc-${label.toLowerCase().replace(/[^a-z\d]+/g, "-")}`;

/** Одноблочные — в ряд на высоте блока: снизу кабель, сверху вход жидкостей, спереди выход, сзади вход предметов. */
function singleRow(grid: Grid, step: Step, copies: number, z: number, kind: string): Slot {
  const row = rowAt(0, z, copies);
  const each = (cells: readonly Vec3[], end: Face): Line => ({ cells, spurs: cells.map((cell) => ({ path: [cell], end })) });
  return {
    grid: withCells(grid, row.cells.map((cell): readonly [Vec3, Cell] => [cell, { kind, face: "pz" }])),
    placed: { step, itemIn: each(row.back, "pz"), fluidIn: each(row.top, "ny"), out: each(row.front, "nz"), consumers: row.cells.map((cell) => ({ hatch: cell, face: "ny" as const })) },
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
  const casing = [...counts.entries()].filter(([kind]) => kind && !/ontroller|Hatch|Bus|energy|muffler|maintenance/i.test(kind)).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!casing) return grid;
  const spare = bottom.filter((cell) => SPARE_HATCHES.has(grid.get(keyOf(cell))?.kind ?? "") && !used.includes(keyOf(cell)));
  return withCells(grid, spare.map((cell): readonly [Vec3, Cell] => [cell, { kind: casing }]));
}

/**
 * Энергетические люки постройки: на крышу, а если там места нет (глушитель, купол) — на боковую стену, в проход между
 * копиями. Задняя стена занята трубами входа.
 */
function poweredFrom(grid: Grid, cells: readonly Vec3[]): ReturnType<typeof energyHatches> {
  try {
    return energyHatches(grid, cells, "py");
  } catch {
    return energyHatches(grid, cells, "nx");
  }
}

/**
 * Электрические постройки — в ряд через блок. Входы — в нижнем слое задней стены (там, где GregTech разрешает люки):
 * труба предметов идёт блоком выше и спускается к шине, труба жидкостей — блоком дальше и подходит к люку прямо.
 */
function electricRow(grid: Grid, step: Step, building: Machine, copies: number, z: number): Slot {
  const kinds = kindsOf(building);
  const size = boxOf(placeMachine(new Map(), building, [0, 0, 0], kinds, true).cells);
  const width = size.max[0] - size.min[0] + 1;
  const depth = size.max[2] - size.min[2] + 1;
  const hasItems = step.inputs.some((flow) => flow.goods.kind === "item");
  const hasFluids = step.inputs.some((flow) => flow.goods.kind === "fluid");
  const outKind = step.outputs[0]?.goods.kind === "fluid" ? "outputHatch" : "outputBus";
  const back = z - depth;
  let next = grid;
  const consumers: Hatch[] = [];
  const outTaps: Vec3[] = [];
  const itemSpurs: Spur[] = [];
  const fluidSpurs: Spur[] = [];
  for (let copy = 0; copy < copies; copy += 1) {
    const one = placeMachine(next, building, [copy * (width + 1), 0, z], kinds, true);
    next = one.grid;
    const bottom = one.cells.filter((cell) => cell[1] === 0);
    const out = hatchOn(next, bottom, outKind, "pz", []);
    next = out.grid;
    outTaps.push(out.out);
    const used = [keyOf(out.hatch)];
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
    next = withoutSpareHatches(next, bottom, used);
    const energy = poweredFrom(next, one.cells);
    next = energy.grid;
    consumers.push(...energy.hatches);
  }
  const right = copies * (width + 1) - [0, 0].length;
  return {
    grid: next,
    placed: {
      step,
      itemIn: hasItems ? { cells: span(0, right).map((x): Vec3 => [x, 1, back]), spurs: itemSpurs } : NO_LINE,
      fluidIn: hasFluids ? { cells: span(0, right).map((x): Vec3 => [x, 0, back - 1]), spurs: fluidSpurs } : NO_LINE,
      out: lineAt(0, right, 0, z + 1, outTaps, "nz"),
      consumers,
    },
    nextZ: back - [0, 0].length - CALC.factory.rowGap,
  };
}

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
function brickedRow(grid: Grid, step: Step, building: Machine, copies: number, z: number): Slot {
  const unit = building.def.layers;
  const depth = unit[0].length;
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
      out: lineAt(0, width - 1, 0, front + 1, centers.map((x): Vec3 => [x, 0, front + 1]), "nz"),
      consumers: [],
    },
    nextZ: front - depth - CALC.factory.rowGap,
  };
}

/** Коксовые печи — через свои люки, как на ферме домн: вход сверху, кокс сзади посередине, креозот сзади внизу. */
function cokeRow(grid: Grid, step: Step, building: Machine, copies: number, z: number): Slot {
  const depth = COKE_UNIT[0].length;
  const top = COKE_UNIT.length;
  const front = z - 1;
  const behind = front - depth;
  const width = copies * [0, 0].length + 1;
  const centers = Array.from({ length: copies }, (_unused, index) => index * [0, 0].length + 1);
  let next = placeMachine(grid, rowOf(building, COKE_UNIT, copies, { i: "cokeHatchIn", o: "cokeHatchItems", f: "cokeHatchFluid" }), [0, 0, front], kindsOf(building), true).grid;
  // Креозот — своя труба вдоль задней стены; калькулятор считает его лишним, труба кончается баком игрока.
  next = withLink(lay(next, span(0, width - 1).map((x): Vec3 => [x, 0, behind]), "creosotePipe"), centers.map((x): Vec3 => [x, 0, behind]), "pz");
  return {
    grid: next,
    placed: {
      step,
      itemIn: lineAt(0, width - 1, top, front - 1, centers.map((x): Vec3 => [x, top, front - 1]), "ny"),
      fluidIn: NO_LINE,
      out: lineAt(0, width - 1, 1, behind, centers.map((x): Vec3 => [x, 1, behind]), "pz"),
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
 * Трубная эстакада: каждая связь выходит из конца своей линии вбок, поднимается над фабрикой, идёт вдоль рядов
 * по своей дорожке и спускается к ряду-потребителю. Связи, чьи отрезки вдоль рядов не пересекаются, делят дорожку —
 * так эстакада узкая. Поиск пути здесь не годится: на большой фабрике обходные трубы замуровывают друг друга.
 */
function rack(grid: Grid, links: readonly Link[]): Grid {
  if (links.length === 0) return grid;
  const cells = [...grid.keys()].map(cellOf);
  const east = Math.max(...cells.map((cell) => cell[0])) + [0, 0].length;
  const top = Math.max(...cells.map((cell) => cell[1])) + [0, 0].length;
  const lanes: [number, number][][] = [];
  let next = grid;
  for (const link of links) {
    const start = link.from[link.from.length - 1];
    const goal = link.to[link.to.length - 1];
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
    next = lay(withLink(withLink(next, [start], "px"), [goal], "px"), path, link.kind, "nx", "nx");
  }
  return next;
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
  if (!PRIMITIVE.has(building.name)) return electricRow(grid, step, building, copies, z);
  return building.slug === "coke-oven" ? cokeRow(grid, step, building, copies, z) : brickedRow(grid, step, building, copies, z);
}

/**
 * Строит фабрику по плану; slug — своё имя для сцены (план с другими числами — другая фабрика).
 * Считает по этапам (ряд за рядом, трубы, энергия) и между ними отдаёт ход браузеру — onProgress видит каждый этап.
 */
export async function buildFactory(plan: Plan, slug: string, onProgress: (progress: BuildProgress) => void = () => {}): Promise<Factory> {
  const total = plan.steps.length + [0, 0].length;
  let done = 0;
  const report = async (label: string) => {
    onProgress({ done, total, label });
    await yieldToBrowser();
    done += 1;
  };
  const tierId: TierId = TIERS[plan.tier + 1]?.id ?? "lv";
  const notes: string[] = [];
  const extraKinds: Record<string, BlockKind> = {};
  let grid: Grid = new Map();
  let z = 0;
  const { perBand, maxCopies } = CALC.factory;
  const placed: Placed[] = [];
  /** Ряды шага после первого: каждый соединяется с предыдущим рядом того же шага. */
  const bands: { readonly previous: Placed; readonly band: Placed }[] = [];
  for (const step of plan.steps) {
    await report(`Ставлю машины: ${step.crafter.label}`);
    if (step.crafter.kind === "hand") {
      notes.push(`${step.outputs[0]?.goods.name ?? step.recipe.type}: верстак — делают автокрафтом, в фабрике не нарисован.`);
      continue;
    }
    const copies = Math.min(step.machines, maxCopies);
    if (copies < step.machines) notes.push(`${step.crafter.label}: нарисовано ${copies} из ${step.machines} — остальные такие же, а столько блоков браузер уже не тянет.`);
    // Копии шага — рядами по perBand; первый ряд — главный (с ним связаны другие шаги), остальные цепляются к предыдущему.
    let previous: Placed | undefined;
    for (let first = 0; first < copies; first += perBand) {
      const slot = slotFor(grid, step, Math.min(perBand, copies - first), z, tierId, extraKinds);
      grid = slot.grid;
      z = slot.nextZ;
      if (previous) bands.push({ previous, band: slot.placed });
      else placed.push(slot.placed);
      previous = slot.placed;
    }
  }

  // Трубы: выход ряда — к входам рядов, которые его едят.
  await report("Прокладываю трубы");
  const producer = new Map<number, Placed>();
  for (const row of placed) for (const output of row.step.outputs) if (!producer.has(output.goods.ptr)) producer.set(output.goods.ptr, row);
  const laid = new Set<Line>();
  const ensure = (line: Line, kind: string) => {
    if (laid.has(line) || line.cells.length === 0) return;
    grid = lay(grid, line.cells, kind);
    for (const spur of line.spurs) grid = lay(grid, spur.path, kind, undefined, spur.end);
    laid.add(line);
  };
  const pipeOf = (isFluid: boolean) => (isFluid ? "calcFluidPipe" : "itemPipe");
  const isFree = (cell: Vec3) => !grid.has(keyOf(cell));
  const links: Link[] = [];
  const linked = new Set<string>();
  for (const row of placed) {
    row.step.inputs.forEach((input) => {
      const isFluid = input.goods.kind === "fluid";
      const kind = pipeOf(isFluid);
      const line = isFluid ? row.fluidIn : row.itemIn;
      if (line.cells.length === 0) return;
      const source = producer.get(input.goods.ptr);
      if (source && source !== row) {
        ensure(source.out, pipeOf(source.step.outputs[0]?.goods.kind === "fluid"));
        ensure(line, kind);
        // Между двумя рядами — одна труба на вид (предметы или жидкости), сколько бы товаров по ней ни шло.
        const key = `${placed.indexOf(source)}>${placed.indexOf(row)}:${kind}`;
        if (!linked.has(key)) links.push({ from: source.out.cells, to: line.cells, kind });
        linked.add(key);
        return;
      }
      if (!isFluid && !source) {
        // Сырьё-предмет: сундук и воронка в начале линии входа.
        ensure(line, kind);
        const hopper = move(line.cells[0], "nx");
        if (isFree(hopper) && isFree(move(hopper, "py"))) {
          grid = withCells(lay(grid, [line.cells[0]], kind, "nx"), [[hopper, { kind: "ownHopperRight" }], [move(hopper, "py"), { kind: "ownChest", face: "pz" }]]);
        }
      }
    });
  }
  // Выход цели проложен всегда — в его конец встанет сундук с товаром.
  const last = placed.find((row) => row.step.outputs.some((output) => output.goods.ptr === plan.target.ptr));
  if (last) ensure(last.out, pipeOf(plan.target.kind === "fluid"));
  // Ряды одного шага: выход к выходу, вход к входу — одна общая труба на шаг, как у одного длинного ряда.
  for (const { previous, band } of bands) {
    const outKind = pipeOf(band.step.outputs[0]?.goods.kind === "fluid");
    const pairs: [Line, Line, string][] = [
      [previous.out, band.out, outKind],
      [previous.itemIn, band.itemIn, "itemPipe"],
      [previous.fluidIn, band.fluidIn, "calcFluidPipe"],
    ];
    for (const [from, to, kind] of pairs) {
      // Трубу ряда тянем, только если у предыдущего ряда она проложена (к ней что-то подходит или от неё что-то берут).
      if (to.cells.length === 0 || !laid.has(from)) continue;
      ensure(from, kind);
      ensure(to, kind);
      links.push({ from: from.cells, to: to.cells, kind });
    }
  }
  grid = rack(grid, links);
  // Готовый товар — в сундук на конце выхода последнего шага.
  if (last && last.out.cells.length > 0) {
    const tail = last.out.cells[last.out.cells.length - 1];
    const end = move(tail, "px");
    if (isFree(end)) grid = withCells(lay(grid, [tail], pipeOf(plan.target.kind === "fluid"), "px"), [[end, { kind: "ownChest", face: "pz" }]]);
  }

  // Энергия: генераторы яруса и кабели к каждой машине. Кирпичным постройкам энергия не нужна.
  await report("Ставлю генераторы и тяну кабели");
  const consumers = [...placed, ...bands.map(({ band }) => band)].flatMap((row) => row.consumers);
  const hasGenerators = (CALC.factory.generatorTiers as readonly string[]).includes(tierId);
  const generator = hasGenerators ? generatorsOf(tierId)[0] : undefined;
  if (consumers.length > 0 && plan.averageEut > 0) {
    if (!generator) notes.push(`Генераторов яруса ${CALC.tierNames[plan.tier]} на сайте пока нет — энергия не показана.`);
    else {
      try {
        const energy = powerFor(grid, consumers, tierId, Math.max(1, Math.round(plan.averageEut)), generator.slug, CALC.factory.routeMargin);
        grid = energy.grid;
        Object.assign(extraKinds, energy.extraKinds);
      } catch {
        notes.push("Кабели к машинам проложить не удалось — генераторы не показаны.");
      }
    }
  }

  // Пустой фабрики не бывает: если рисовать нечего (одни ручные шаги), ставим сундук с товаром.
  if (grid.size === 0) grid = withCells(grid, [[[0, 0, 0], { kind: "ownChest", face: "pz" }]]);
  return {
    machine: toMachine(grid, { slug, name: "Factory", title: `Фабрика: ${plan.target.name}`, tier: tierId, summary: "", story: [], facts: [], source: "" }, extraKinds),
    notes,
  };
}
