import type { BlockKind, Face, Interior, StructureDef, Vec3 } from "./structure";
import type { KindId, Machine } from "./machines";

/**
 * Сборка линий производства из построек: клетки мира (x — вправо, y — вверх, z — к фасаду),
 * люки с явным направлением, трубы и кабели с явными отростками. Готовая сетка превращается
 * в обычную схему постройки, и её рисует та же сцена, что и машины.
 */
export interface Cell {
  readonly kind: string;
  /** Куда смотрит грань с рисунком (люк, генератор, котёл, сундук). */
  readonly face?: Face;
  /** Отростки трубы или кабеля, носик воронки. */
  readonly links?: readonly Face[];
  readonly pipeOutputs?: readonly Face[];
  readonly itemOutput?: Face;
  readonly fluidOutput?: Face;
  readonly supplies?: readonly string[];
  /** Полость печи: там светится нутро. */
  readonly isHollow?: boolean;
}

export type Grid = ReadonlyMap<string, Cell>;

export const STEP: Readonly<Record<Face, Vec3>> = { px: [1, 0, 0], nx: [-1, 0, 0], py: [0, 1, 0], ny: [0, -1, 0], pz: [0, 0, 1], nz: [0, 0, -1] };
const SIDES = Object.keys(STEP) as Face[];
export const OPPOSITE: Readonly<Record<Face, Face>> = { px: "nx", nx: "px", py: "ny", ny: "py", pz: "nz", nz: "pz" };

export const keyOf = (cell: Vec3): string => cell.join(",");
export const cellOf = (key: string): Vec3 => key.split(",").map(Number) as unknown as Vec3;
export const move = (cell: Vec3, side: Face, steps = 1): Vec3 => [0, 1, 2].map((axis) => cell[axis] + STEP[side][axis] * steps) as unknown as Vec3;

/** Сторона, в которую надо шагнуть из from, чтобы попасть в соседнюю клетку to. */
export function sideTo(from: Vec3, to: Vec3): Face {
  const side = SIDES.find((candidate) => keyOf(move(from, candidate)) === keyOf(to));
  if (!side) throw new Error(`Клетки ${keyOf(from)} и ${keyOf(to)} не соседние`);
  return side;
}

export function withCells(grid: Grid, cells: readonly (readonly [Vec3, Cell])[]): Grid {
  const next = new Map(grid);
  for (const [cell, value] of cells) next.set(keyOf(cell), value);
  return next;
}

export interface Box {
  readonly min: Vec3;
  readonly max: Vec3;
}

export function boxOf(cells: readonly Vec3[]): Box {
  // Без Math.min(...клетки): у большой фабрики клеток миллионы — столько аргументов не влезает в стек.
  const pick = (choose: (a: number, b: number) => number, start: number) =>
    [0, 1, 2].map((axis) => cells.reduce((best, cell) => choose(best, cell[axis]), start)) as unknown as Vec3;
  return { min: pick(Math.min, Infinity), max: pick(Math.max, -Infinity) };
}

/** Стена бокса, на которой лежит клетка: сначала боковые (x), потом задняя и передняя, иначе — верх. */
export function wallOf(cell: Vec3, box: Box): Face {
  if (cell[0] === box.min[0]) return "nx";
  if (cell[0] === box.max[0]) return "px";
  if (cell[2] === box.min[2]) return "nz";
  if (cell[2] === box.max[2]) return "pz";
  return "py";
}

/**
 * Кладёт постройку в сетку: (x, y, z) — левый передний нижний угол, строки схемы идут от фасада назад (−z).
 * Люки, которые в схеме смотрят «наружу», получают явное направление — от стены своей постройки.
 */
export function placeMachine(grid: Grid, machine: Machine, at: Vec3, kinds: Readonly<Record<string, BlockKind>>, keepHollow: boolean): { readonly grid: Grid; readonly cells: readonly Vec3[] } {
  const { layers, hollow = "" } = machine.def;
  const placed: (readonly [Vec3, Cell])[] = [];
  layers.forEach((rows, fromTop) =>
    rows.forEach((row, rowIndex) =>
      [...row].forEach((symbol, column) => {
        if (symbol === " ") return;
        const cell: Vec3 = [at[0] + column, at[1] + layers.length - 1 - fromTop, at[2] - rowIndex];
        if (hollow.includes(symbol)) {
          if (keepHollow) placed.push([cell, { kind: "", isHollow: true }]);
          return;
        }
        placed.push([cell, { kind: machine.def.kinds[symbol] }]);
      }),
    ),
  );
  const cells = placed.map(([cell]) => cell);
  const box = boxOf(cells);
  const faced = placed.map(([cell, value]): readonly [Vec3, Cell] =>
    kinds[value.kind]?.face?.rule === "outward" ? [cell, { ...value, face: wallOf(cell, box) }] : [cell, value],
  );
  return { grid: withCells(grid, faced), cells: placed.filter(([, value]) => !value.isHollow).map(([cell]) => cell) };
}

/**
 * Служебный блок — люк, шина, контроллер, обслуживание: по слову в имени вида (camelCase), а не по куску —
 * «inputBus», «cokeHatchIn», но не корпус «gRobustTungstensteel».
 */
export const SERVICE_KIND = /(?:[Cc]ontroller|[Hh]atch|[Bb]us|[Ee]nergy|[Dd]ynamo|[Mm]uffler|[Mm]aintenance)(?![a-z])/;

/**
 * Ставит люк на стену постройки: берёт уже стоящий люк этого вида или блок корпуса на этой стене —
 * пониже (high — повыше) и поближе к середине стены. Грань люка смотрит наружу, клетка перед ней должна быть свободна.
 */
export function addHatch(
  grid: Grid,
  body: readonly Vec3[],
  kind: string,
  wall: Face,
  skip: readonly string[] = [],
  high = false,
): { readonly grid: Grid; readonly hatch: Vec3; readonly out: Vec3 } {
  const box = boxOf(body);
  const middle = [0, 1, 2].map((axis) => (box.min[axis] + box.max[axis]) / 2);
  const isFree = (cell: Vec3) => !grid.has(keyOf(cell));
  const existing = body.find((cell) => grid.get(keyOf(cell))?.kind === kind && !skip.includes(keyOf(cell)) && isFree(move(cell, wall)) && wallOf(cell, box) === wall);
  const candidates = body
    .filter((cell) => {
      const value = grid.get(keyOf(cell));
      return value && !value.isHollow && !SERVICE_KIND.test(value.kind) && !skip.includes(keyOf(cell)) && isFree(move(cell, wall));
    })
    .filter((cell) => wallOf(cell, box) === wall || (wall === "nz" && cell[2] === box.min[2]) || (wall === "pz" && cell[2] === box.max[2]))
    .sort((a, b) => (high ? b[1] - a[1] : a[1] - b[1]) || Math.abs(a[0] - middle[0]) + Math.abs(a[2] - middle[2]) - (Math.abs(b[0] - middle[0]) + Math.abs(b[2] - middle[2])));
  const hatch = existing ?? candidates[0];
  if (!hatch) throw new Error(`Нет места для люка ${kind} на стене ${wall}`);
  return { grid: withCells(grid, [[hatch, { kind, face: wall }]]), hatch, out: move(hatch, wall) };
}

/**
 * Путь по свободным клеткам от from до любой клетки-цели (поиск в ширину): так трубы и кабели
 * обходят постройки и друг друга. Цели могут быть заняты — например, уже проложенным кабелем.
 */
export function route(grid: Grid, from: Vec3, goals: readonly Vec3[], margin: number, area?: Box, clamp?: Box): readonly Vec3[] {
  const path = findPath(grid, from, goals, margin, area, { clamp });
  if (!path) throw new Error(`Не нашёл пути от ${keyOf(from)}`);
  return path;
}

/** Ограничения поиска пути. */
export interface PathLimits {
  /** Дополнительные точки старта. Поиск находит один кратчайший путь от любой из них. */
  readonly starts?: readonly Vec3[];
  /** Предпочтение соседней клетки при одинаковой длине пути. */
  readonly preference?: (cell: Vec3) => number;
  /** Клетки, свободные сейчас, но обещанные другим (их не занимаем). */
  readonly blocked?: { has(key: string): boolean };
  /** Путь длиннее стольких шагов не нужен. */
  readonly maxSteps?: number;
  /** Жёсткая рамка поверх запаса margin: например, фабрика не выходит за свои чанки. */
  readonly clamp?: Box;
  /** Допустимые клетки внутри рамки, например только чанки с машинами. */
  readonly allows?: (cell: Vec3) => boolean;
  /** Допустимое направление между соседними клетками. */
  readonly allowsStep?: (from: Vec3, to: Vec3) => boolean;
}

/** Как route, но без пути — undefined (нет прохода или он длиннее maxSteps шагов). */
export function findPath(
  grid: Grid,
  from: Vec3,
  goals: readonly Vec3[],
  margin: number,
  area?: Box,
  { blocked, maxSteps = Infinity, clamp, allows, allowsStep, starts = [], preference }: PathLimits = {},
): readonly Vec3[] | undefined {
  const origins = [from, ...starts].filter((cell) => !allows || allows(cell));
  if (origins.length === 0) return undefined;
  const goalKeys = new Set(goals.filter((cell) => !allows || allows(cell)).map(keyOf));
  if (goalKeys.size === 0) return undefined;
  // area — уже посчитанные границы сетки: у большой фабрики обходить все клетки на каждый путь — минуты.
  const box = boxOf([...(area ? [area.min, area.max] : [...grid.keys()].map(cellOf)), ...origins, ...goals]);
  const low = [0, 1, 2].map((axis) => Math.max(box.min[axis] - margin, clamp?.min[axis] ?? -Infinity));
  const high = [0, 1, 2].map((axis) => Math.min(box.max[axis] + margin, clamp?.max[axis] ?? Infinity));
  const inside = (cell: Vec3) => cell[1] >= 0 && [0, 1, 2].every((axis) => cell[axis] >= low[axis] && cell[axis] <= high[axis]);
  const previous = new Map<string, string | null>(origins.map((cell) => [keyOf(cell), null]));
  const queue = [...origins];
  const steps = origins.map(() => 0);
  for (let index = 0; index < queue.length; index += 1) {
    const cell = queue[index];
    if (goalKeys.has(keyOf(cell))) {
      const path: Vec3[] = [];
      for (let key: string | null = keyOf(cell); key; key = previous.get(key) ?? null) path.unshift(cellOf(key));
      return path;
    }
    if (steps[index] >= maxSteps) continue;
    const directions = preference ? [...SIDES].sort((a, b) => preference(move(cell, b)) - preference(move(cell, a))) : SIDES;
    for (const side of directions) {
      const next = move(cell, side);
      const key = keyOf(next);
      if (previous.has(key) || !inside(next) || (allows && !allows(next)) || (allowsStep && !allowsStep(cell, next)) ||
        ((grid.has(key) || blocked?.has(key)) && !goalKeys.has(key))) continue;
      previous.set(key, keyOf(cell));
      queue.push(next);
      steps.push(steps[index] + 1);
    }
  }
  return undefined;
}

/** Кладёт трубу или кабель по пути. Отростки — к соседям по пути и к концам; с уже лежащим участком того же вида они срастаются. */
export function lay(grid: Grid, path: readonly Vec3[], kind: string, startLink?: Face, endLink?: Face): Grid {
  return layAll(grid, [{ path, kind, startLink, endLink }]);
}

export interface Piece {
  readonly path: readonly Vec3[];
  readonly kind: string;
  readonly startLink?: Face;
  readonly endLink?: Face;
}

/**
 * Несколько труб по очереди, как lay одна за другой, но с одной копией сетки: у большой фабрики сетка — сотни тысяч
 * клеток, и копировать её на каждый отросток (их тысячи) — минуты.
 */
export function layAll(grid: Grid, pieces: readonly Piece[]): Grid {
  const next = new Map(grid);
  for (const piece of pieces) layInto(next, piece);
  return next;
}

/** Кладёт трубу в рабочую копию сетки (её завёл вызывающий — так сетка не копируется на каждую трубу). */
export function layInto(next: Map<string, Cell>, { path, kind, startLink, endLink }: Piece): void {
  path.forEach((cell, index) => {
    const own = next.get(keyOf(cell));
    const links = new Set<Face>(own?.kind === kind ? (own.links ?? []) : []);
    if (index > 0) links.add(sideTo(cell, path[index - 1]));
    if (index < path.length - 1) links.add(sideTo(cell, path[index + 1]));
    if (index === 0 && startLink) links.add(startLink);
    if (index === path.length - 1 && endLink) links.add(endLink);
    next.set(keyOf(cell), { ...(own?.kind === kind ? own : undefined), kind, links: [...links].sort() });
  });
}

/** Ряд одинаковых блоков (генераторы, котлы) вдоль x, лицом в одну сторону. */
export function row(grid: Grid, start: Vec3, count: number, kind: string, face: Face): Grid {
  return withCells(grid, Array.from({ length: count }, (_unused, index): readonly [Vec3, Cell] => [move(start, "px", index), { kind, face }]));
}

/** Буквы схемы берутся из дальней части таблицы символов: их много, и они не пересекаются с буквами построек. */
const FIRST_SYMBOL = "Ā".charCodeAt(0);

/** Превращает сетку в обычную постройку сайта. */
export function toMachine(grid: Grid, base: Omit<Machine, "def">, extraKinds: Readonly<Record<string, BlockKind>>, interior?: Interior): Machine {
  const cells = [...grid.keys()].map(cellOf);
  const { min, max } = boxOf(cells);
  const symbols = new Map<string, string>();
  const kinds: Record<string, KindId> = {};
  const faces: Record<string, Face> = {};
  const links: Record<string, readonly Face[]> = {};
  const pipeOutputs: Record<string, readonly Face[]> = {};
  const itemOutputs: Record<string, Face> = {};
  const fluidOutputs: Record<string, Face> = {};
  const supplies: Record<string, readonly string[]> = {};
  let hollow = "";
  const symbolOf = (value: Cell): string => {
    const signature = JSON.stringify([value.isHollow ? "hollow" : value.kind, value.face, value.links, value.pipeOutputs, value.supplies, value.itemOutput, value.fluidOutput]);
    const known = symbols.get(signature);
    if (known) return known;
    const symbol = String.fromCharCode(FIRST_SYMBOL + symbols.size);
    symbols.set(signature, symbol);
    if (value.isHollow) hollow += symbol;
    // Виды из extraKinds в общий справочник не входят — сцена берёт их из самой постройки (kindsOf).
    else kinds[symbol] = value.kind as KindId;
    if (value.face) faces[symbol] = value.face;
    if (value.links) links[symbol] = value.links;
    if (value.pipeOutputs) pipeOutputs[symbol] = value.pipeOutputs;
    if (value.itemOutput) itemOutputs[symbol] = value.itemOutput;
    if (value.fluidOutput) fluidOutputs[symbol] = value.fluidOutput;
    if (value.supplies) supplies[symbol] = value.supplies;
    return symbol;
  };
  // Идём по занятым клеткам, а не по всему объёму коробки: у большой фабрики коробка — десятки миллионов клеток, почти
  // все пустые. Пустая строка схемы — одна общая строка пробелов.
  const width = max[0] - min[0] + 1;
  const depth = max[2] - min[2] + 1;
  const blank = " ".repeat(width);
  const filled = new Map<number, string[]>();
  for (const [key, value] of grid) {
    const [x, y, z] = cellOf(key);
    const row = (max[1] - y) * depth + (max[2] - z);
    const symbols = filled.get(row) ?? Array.from(blank);
    symbols[x - min[0]] = symbolOf(value);
    filled.set(row, symbols);
  }
  const layers = Array.from({ length: max[1] - min[1] + 1 }, (_layer, fromTop) =>
    Array.from({ length: depth }, (_row, fromFront) => filled.get(fromTop * depth + fromFront)?.join("") ?? blank),
  );
  const def: StructureDef & { readonly kinds: Readonly<Record<string, KindId>> } = {
    layers,
    kinds,
    faces,
    links,
    pipeOutputs,
    itemOutputs,
    fluidOutputs,
    supplies,
    extraKinds,
    ...(hollow ? { hollow } : {}),
    ...(interior ? { interior } : {}),
  };
  return { ...base, def };
}
