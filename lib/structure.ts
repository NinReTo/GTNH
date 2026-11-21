import { EBF, EXPLODE, HOVER } from "./config";
import { clamp01, smooth01 } from "./math";

/** Грань куба: p/n — плюс/минус, вторая буква — ось. Порядок как у граней куба в three.js. */
/** Событие окна: постройка с адресным именем detail нарисована (текстуры загружены) — калькулятор ждёт его. */
export const STRUCTURE_READY = "structure-ready";

export type Face = "px" | "nx" | "py" | "ny" | "pz" | "nz";
export const FACES: readonly Face[] = ["px", "nx", "py", "ny", "pz", "nz"];

export type Vec3 = readonly [number, number, number];

/** Куда смотрит грань с рисунком: вперёд (экран контроллера), вверх (глушитель) или наружу от стены (люк). */
export type FaceRule = "front" | "up" | "outward";

/** Вид блока: как называется и чем нарисован. */
export interface BlockKind {
  readonly label: string;
  /** Предмет для чертежа из выгрузки игры. */
  readonly gameItem?: { readonly mod: string; readonly internalName: string; readonly damage: number };
  readonly gameName?: string;
  /** Блок занимает не весь куб (сундук, воронка, труба): рисуется своей формой из lib/shapes.ts. */
  readonly shape?: "chest" | "hopper" | "pipe";
  /** Куда смотрит носик воронки, если не вниз: сторона клетки (px, nx, pz, nz). */
  readonly spout?: "px" | "nx" | "pz" | "nz";
  /** Имя файла текстуры в public/textures/gregtech без расширения. */
  readonly texture: string;
  /** Отдельная текстура одной грани (экран, люк); остальные грани рисуются текстурой base. */
  readonly face?: { readonly rule: FaceRule; readonly base: string };
  /** Свои текстуры верха и низа (одноблочные машины): иначе верх и низ рисуются основой. */
  readonly top?: string;
  readonly bottom?: string;
  /** Карта свечения грани с рисунком. */
  readonly glow?: string;
  /** Не металл (кирпич, дерево): без металлического блеска. */
  readonly isMatte?: boolean;
  /** Блок светится сам (раскалённая катушка). */
  readonly isHot?: boolean;
  /** Решётчатый блок с дырами (рама): прозрачные пиксели текстуры не рисуются. */
  readonly isCutout?: boolean;
  /** Прозрачный блок (стекло). */
  readonly isGlass?: boolean;
  /** Холодный тёмный блок (наквада): без тёплого контурного свечения — иначе почти чёрный синий корпус выглядит рыжим. */
  readonly isCool?: boolean;
}

/**
 * Описание постройки. layers — схема в том же виде, что в исходниках мода:
 * слои сверху вниз, строки от фасада назад, символы слева направо.
 * Пробел — пусто, символы из hollow — полость внутри (там светится нутро).
 */
/** Что внутри полости: раскалённое нутро (светится) или вода (не светится). */
/** Что внутри постройки: огонь (светится и освещает её), вода или ничего. */
export type Interior = "fire" | "water" | "none";

export interface StructureDef {
  readonly layers: readonly (readonly string[])[];
  readonly kinds: Readonly<Record<string, string>>;
  readonly hollow?: string;
  /** Куда смотрит грань с рисунком у блоков этого символа — вместо общего правила вида (люки линий производства). */
  readonly faces?: Readonly<Record<string, Face>>;
  /** Отростки трубы или носик воронки у блоков этого символа: стороны клетки (px, nz…). */
  readonly links?: Readonly<Record<string, readonly string[]>>;
  /** Виды блоков, которых нет в общем справочнике: генераторы и котлы линий производства. */
  readonly extraKinds?: Readonly<Record<string, BlockKind>>;
  /** По умолчанию в полости огонь. */
  readonly interior?: Interior;
}

export interface Block {
  readonly id: string;
  /** Ключ вида блока в общем справочнике видов. */
  readonly kind: string;
  /** Место в сетке, метры: x — вправо, y — номер слоя снизу, z — к фасаду. Начало по x и z — на оси постройки. */
  readonly grid: Vec3;
  /** Центр блока в собранной постройке. */
  readonly home: Vec3;
  /** В какие стороны блок может отойти, не задев соседей: по каждой оси −1, 0 или 1. */
  readonly push: Vec3;
  /** Грань с рисунком, если она есть. */
  readonly face: Face | null;
  /** Отростки трубы или носик воронки, если схема задала их сама. */
  readonly links?: readonly string[];
}

export interface Structure {
  readonly blocks: readonly Block[];
  /** Центры ячеек полости: там стоит светящийся сердечник. */
  readonly hollow: readonly Vec3[];
  /** Габариты в блоках: ширина, высота, глубина. */
  readonly size: Vec3;
  /** Где стоит источник света: середина полости, а если её нет — середина постройки. */
  readonly lightPosition: Vec3;
  readonly interior: Interior;
}

const EMPTY = " ";

function cellKey(x: number, y: number, z: number): string {
  return [x, y, z].join(":");
}

interface Cell {
  readonly symbol: string;
  readonly grid: Vec3;
}

function readCells(def: StructureDef): Cell[] {
  const layerCount = def.layers.length;
  const cells: Cell[] = [];
  def.layers.forEach((rows, fromTop) => {
    const y = layerCount - 1 - fromTop;
    rows.forEach((row, rowIndex) => {
      const halfWidth = (row.length - 1) / 2;
      const halfDepth = (rows.length - 1) / 2;
      [...row].forEach((symbol, columnIndex) => {
        if (symbol === EMPTY) return;
        cells.push({ symbol, grid: [columnIndex - halfWidth, y, halfDepth - rowIndex] });
      });
    });
  });
  return cells;
}

function homeOf([x, y, z]: Vec3): Vec3 {
  return [x * EBF.blockSize, (y + 1 / 2) * EBF.blockSize, z * EBF.blockSize];
}

/**
 * Куда каждый блок может отодвинуться. Правило одно: блок уходит только туда,
 * где свободно — от оси постройки по x и z и вверх по y. Ячейки, в которые он
 * при этом заходит, он «занимает»: другой блок туда уже не поедет. Поэтому
 * раздвинутые блоки не въезжают ни в стоящих соседей, ни друг в друга.
 * Сначала раздаются сдвиги вбок, потом подъём — вбок важнее: он открывает нутро.
 */
function assignPushes(cells: readonly Cell[]): Vec3[] {
  const occupied = new Set(cells.map((cell) => cellKey(...cell.grid)));
  const claims = new Map<string, number>();

  const targets = ([x, y, z]: Vec3, dx: number, dy: number, dz: number): string[] => {
    const keys = new Set<string>();
    for (const stepX of new Set([0, dx])) {
      for (const stepY of new Set([0, dy])) {
        for (const stepZ of new Set([0, dz])) {
          if (stepX !== 0 || stepY !== 0 || stepZ !== 0) keys.add(cellKey(x + stepX, y + stepY, z + stepZ));
        }
      }
    }
    return [...keys];
  };
  const canTake = (keys: readonly string[], owner: number) =>
    keys.every((key) => !occupied.has(key) && (claims.get(key) ?? owner) === owner);
  const take = (keys: readonly string[], owner: number) => keys.forEach((key) => claims.set(key, owner));

  const sideways = cells.map((cell, owner): readonly [number, number] => {
    const [x, , z] = cell.grid;
    const options: (readonly [number, number])[] = [
      [Math.sign(x), Math.sign(z)],
      [Math.sign(x), 0],
      [0, Math.sign(z)],
    ];
    for (const [dx, dz] of options) {
      if (dx === 0 && dz === 0) continue;
      const keys = targets(cell.grid, dx, 0, dz);
      if (!canTake(keys, owner)) continue;
      take(keys, owner);
      return [dx, dz];
    }
    return [0, 0];
  });

  return cells.map((cell, owner): Vec3 => {
    const [dx, dz] = sideways[owner];
    const keys = targets(cell.grid, dx, 1, dz);
    if (!canTake(keys, owner)) return [dx, 0, dz];
    take(keys, owner);
    return [dx, 1, dz];
  });
}

/** Грань с рисунком: экран смотрит на фасад, глушитель вверх, люк — наружу от своей стены. */
function faceOf(rule: FaceRule | undefined, [x, , z]: Vec3): Face | null {
  if (!rule) return null;
  if (rule === "up") return "py";
  if (rule === "front" || z > 0) return "pz";
  if (x < 0) return "nx";
  if (x > 0) return "px";
  return "nz";
}

/** Разворачивает схему из исходников мода в список блоков. */
export function buildStructure(def: StructureDef, kinds: Readonly<Record<string, BlockKind>>): Structure {
  const hollowSymbols = def.hollow ?? "";
  const cells = readCells(def);
  const solid = cells.filter((cell) => !hollowSymbols.includes(cell.symbol));
  const hollow = cells.filter((cell) => hollowSymbols.includes(cell.symbol)).map((cell) => homeOf(cell.grid));
  const pushes = assignPushes(solid);

  const blocks = solid.map((cell, index): Block => {
    const kind = def.kinds[cell.symbol];
    if (!kind || !kinds[kind]) throw new Error(`В схеме есть символ «${cell.symbol}» без вида блока`);
    return {
      id: cellKey(...cell.grid),
      kind,
      grid: cell.grid,
      home: homeOf(cell.grid),
      push: pushes[index],
      face: def.faces?.[cell.symbol] ?? faceOf(kinds[kind].face?.rule, cell.grid),
      ...(def.links?.[cell.symbol] ? { links: def.links[cell.symbol] } : {}),
    };
  });

  // reduce, а не Math.max(...): у фабрики калькулятора строк схемы десятки тысяч — столько аргументов не влезает в стек.
  const size: Vec3 = [
    def.layers.reduce((widest, rows) => rows.reduce((wide, row) => Math.max(wide, row.length), widest), 0),
    def.layers.length,
    def.layers.reduce((deepest, rows) => Math.max(deepest, rows.length), 0),
  ];
  const middle: Vec3 = [0, (size[1] * EBF.blockSize) / 2, 0];
  const lightPosition: Vec3 = hollow.length
    ? [0, 1, 2].map((axis) => hollow.reduce((sum, point) => sum + point[axis], 0) / hollow.length) as unknown as Vec3
    : middle;

  // Без полости огню негде гореть: свет в середине сплошной или открытой постройки
  // (кольцо реактора синтеза) только просачивается пятнами на пол и блоки.
  return { blocks, hollow, size, lightPosition, interior: def.interior ?? (hollow.length > 0 ? "fire" : "none") };
}

/** Сколько блоков каждого вида в постройке. */
export function countByKind(blocks: readonly Block[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const block of blocks) counts[block.kind] = (counts[block.kind] ?? 0) + 1;
  return counts;
}

/**
 * ЕДИНСТВЕННАЯ функция раскладки: где центр блока при раздвижении weight
 * (0 — блок на своём месте, 1 — отодвинут полностью).
 * Её вызывают и трёхмерная сцена (там weight задаёт близость курсора),
 * и схема на странице (там weight — ползунок) — разойтись они не могут.
 */
export function explodedPosition(block: Pick<Block, "home" | "push">, weight: number): Vec3 {
  const local = smooth01(weight);
  return [
    block.home[0] + block.push[0] * EXPLODE.radialSpread * local,
    block.home[1] + block.push[1] * EXPLODE.lidLift * local,
    block.home[2] + block.push[2] * EXPLODE.radialSpread * local,
  ];
}

/**
 * Ищет первый блок постройки на луче (в её координатах; direction не обязан быть
 * единичным). Идёт по сетке клетка за клеткой от входа луча в габарит — так
 * точку под курсором берём на настоящем блоке, а не на стенке габаритной
 * коробки: у комплекса сборки наночипов коробка 63 × 49 × 63, а блоки занимают
 * малую её часть, и точка на коробке висела в воздухе за десятки метров от них.
 * Возвращает центр найденного блока или null, если луч прошёл мимо всех.
 */
export function createBlockPicker(homes: readonly Vec3[]): (origin: Vec3, direction: Vec3) => Vec3 | null {
  if (homes.length === 0) return () => null;
  const size = EBF.blockSize;
  // Клетка i по каждой оси — полуинтервал [corner + i·size, corner + (i+1)·size); центры блоков ровно посередине.
  // reduce, а не Math.min(...): у фабрики калькулятора блоков миллионы — столько аргументов не влезает в стек.
  const corner = [0, 1, 2].map((axis) => homes.reduce((low, home) => Math.min(low, home[axis]), Infinity) - size / 2);
  const cellOf = (value: number, axis: number) => Math.floor((value - corner[axis]) / size);
  const counts = [0, 1, 2].map((axis) => homes.reduce((high, home) => Math.max(high, cellOf(home[axis], axis)), 0) + 1);
  const key = (x: number, y: number, z: number) => (x * counts[1] + y) * counts[2] + z;
  const occupied = new Map<number, Vec3>();
  homes.forEach((home) => occupied.set(key(cellOf(home[0], 0), cellOf(home[1], 1), cellOf(home[2], 2)), home));

  return (origin, direction) => {
    // Где луч входит в габарит и выходит из него (метод плит).
    let enter = 0;
    let leave = Number.POSITIVE_INFINITY;
    for (let axis = 0; axis < origin.length; axis += 1) {
      const low = corner[axis];
      const high = corner[axis] + counts[axis] * size;
      if (direction[axis] === 0) {
        if (origin[axis] < low || origin[axis] > high) return null;
        continue;
      }
      const first = (low - origin[axis]) / direction[axis];
      const second = (high - origin[axis]) / direction[axis];
      enter = Math.max(enter, Math.min(first, second));
      leave = Math.min(leave, Math.max(first, second));
    }
    if (enter > leave) return null;

    // Шаги по клеткам (Amanatides–Woo): каждый раз переходим через ближайшую грань клетки.
    const start = [0, 1, 2].map((axis) => origin[axis] + direction[axis] * enter);
    const cell = [0, 1, 2].map((axis) => Math.min(counts[axis] - 1, Math.max(0, cellOf(start[axis], axis))));
    const step = direction.map((value) => Math.sign(value));
    const delta = direction.map((value) => (value === 0 ? Number.POSITIVE_INFINITY : Math.abs(size / value)));
    const next = [0, 1, 2].map((axis) => {
      if (direction[axis] === 0) return Number.POSITIVE_INFINITY;
      const border = corner[axis] + (cell[axis] + (step[axis] > 0 ? 1 : 0)) * size;
      return enter + (border - start[axis]) / direction[axis];
    });
    while (cell.every((value, axis) => value >= 0 && value < counts[axis])) {
      const found = occupied.get(key(cell[0], cell[1], cell[2]));
      if (found) return found;
      const axis = next[0] < next[1] ? (next[0] < next[2] ? 0 : 2) : next[1] < next[2] ? 1 : 2;
      cell[axis] += step[axis];
      next[axis] += delta[axis];
    }
    return null;
  };
}

/** Как блок огромной постройки выходит наружу при раздвижении куполом. */
export interface DomeBlock {
  /** Ось (0 — X, 1 — Y, 2 — Z) и сторона, куда блок выходит. На самой середине — null: ему некуда. */
  readonly axis: 0 | 1 | 2 | null;
  readonly sign: number;
  /** Сколько метров от середины постройки до блока по этой оси: на эту долю он и выходит. */
  readonly reach: number;
  /**
   * Номер линии насквозь — блоков той же оси и стороны с теми же двумя другими
   * координатами. Сила у всей линии одна, поэтому её блоки выходят вместе и
   * внутренний никогда не обгоняет наружный. -1 — блоку некуда выходить.
   */
  readonly line: number;
}

/**
 * Раскладка купола: каждый блок выходит по той грани габарита постройки, к
 * которой он ближе всего (в долях полуширины): вверх или в одну из четырёх
 * сторон. Вниз — никогда: там пол. Нижние блоки выходят вбок.
 * Середина постройки — по X и Z ноль, по Y половина высоты.
 */
export function domeLayout(blocks: readonly Pick<Block, "home">[], size: Vec3): readonly DomeBlock[] {
  const center: Vec3 = [0, (size[1] * EBF.blockSize) / 2, 0];
  const half = size.map((side) => (side * EBF.blockSize) / 2);
  const directions = blocks.map(({ home }) => {
    const offsets = home.map((value, axis) => value - center[axis]);
    const scores = offsets.map((offset, axis) => Math.abs(offset) / half[axis]);
    // Нижняя половина вверх не выходит, а вниз нельзя — для неё ось Y не годится.
    if (offsets[1] < 0) scores[1] = 0;
    const axis = ([0, 2, 1] as const).reduce((best, candidate) => (scores[candidate] > scores[best] ? candidate : best));
    if (scores[axis] === 0) return { axis: null, sign: 0, reach: 0 };
    return { axis, sign: Math.sign(offsets[axis]), reach: Math.abs(offsets[axis]) };
  });
  // Линия насквозь — блоки с той же осью и стороной и теми же двумя другими координатами.
  const lines = new Map<string, number>();
  return blocks.map(({ home }, index) => {
    const { axis, sign, reach } = directions[index];
    if (axis === null) return { axis, sign, reach, line: -1 };
    const key = [axis, sign, ...home.filter((_, other) => other !== axis)].join(":");
    if (!lines.has(key)) lines.set(key, lines.size);
    return { axis, sign, reach, line: lines.get(key) ?? -1 };
  });
}

/**
 * Насколько курсор раздвигает каждый блок. hit — блок под курсором. Сила линии
 * насквозь — по её блоку, ближайшему к курсору: если брать наружный блок линии,
 * у узкой башни посреди широкой постройки (комплекс наночипов) вся колонна
 * получала силу по верхнему блоку в 15 м от курсора — ноль, и ничего не двигалось.
 */
export function domeWeights(layout: readonly DomeBlock[], homes: readonly Vec3[], hit: Vec3, radius: number): readonly number[] {
  const byLine = new Map<number, number>();
  layout.forEach((dome, index) => {
    if (dome.line < 0) return;
    const weight = cursorWeight(Math.hypot(...homes[index].map((value, axis) => value - hit[axis])), radius);
    if (weight > (byLine.get(dome.line) ?? 0)) byLine.set(dome.line, weight);
  });
  return layout.map((dome) => byLine.get(dome.line) ?? 0);
}

/**
 * Где блок при раздвижении куполом: выходит по своей оси на EXPLODE.domePush
 * метров при полном раздвижении. Вся линия насквозь выходит вместе (сила у неё
 * одна), а соседи по грани только сдвигаются вдоль друг друга — налезть они не могут.
 */
export function domePosition(home: Vec3, dome: DomeBlock, weight: number, scale = 1): Vec3 {
  if (dome.axis === null) return home;
  const position: [number, number, number] = [home[0], home[1], home[2]];
  position[dome.axis] += dome.sign * EXPLODE.domePush * scale * smooth01(weight);
  return position;
}

/** Во сколько раз крупнее купол у очень длинной постройки: см. EXPLODE.domeReferenceSide. */
export function domeScale(size: Vec3): number {
  return Math.max(1, Math.max(...size) / EXPLODE.domeReferenceSide);
}

/**
 * Насколько курсор раздвигает блок: distance — расстояние в метрах от центра
 * блока до луча из камеры через курсор. Прямо под курсором — 1, на краю
 * радиуса (radius, метры) и дальше — 0, между ними плавно.
 */
export function cursorWeight(distance: number, radius: number = HOVER.radius): number {
  if (!(distance >= 0)) return 0;
  return smooth01(1 - distance / radius);
}

/** Радиус раздвижения постройки: у огромных — шире, чтобы блоки отходили крупными кусками. */
export function hoverRadius(blockCount: number): number {
  return blockCount >= HOVER.hugeBlocks ? HOVER.radius * HOVER.hugeRadiusScale : HOVER.radius;
}

/**
 * Плавное приближение к цели: за каждый кадр блок проходит долю оставшегося
 * пути, поэтому движение не зависит от частоты кадров. Когда остаётся меньше
 * HOVER.settleEpsilon, возвращает саму цель — чтобы анимация заканчивалась.
 */
export function approach(current: number, target: number, deltaSeconds: number): number {
  const step = Math.min(Math.max(0, deltaSeconds), HOVER.maxStep);
  const next = current + (target - current) * (1 - Math.exp(-step / HOVER.smoothTime));
  return Math.abs(target - next) < HOVER.settleEpsilon ? target : clamp01(next);
}
