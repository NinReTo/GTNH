import { EBF, EXPLODE, HOVER } from "./config";
import { clamp01, smooth01 } from "./math";

/** Грань куба: p/n — плюс/минус, вторая буква — ось. Порядок как у граней куба в three.js. */
export type Face = "px" | "nx" | "py" | "ny" | "pz" | "nz";
export const FACES: readonly Face[] = ["px", "nx", "py", "ny", "pz", "nz"];

export type Vec3 = readonly [number, number, number];

/** Куда смотрит грань с рисунком: вперёд (экран контроллера), вверх (глушитель) или наружу от стены (люк). */
export type FaceRule = "front" | "up" | "outward";

/** Вид блока: как называется и чем нарисован. */
export interface BlockKind {
  readonly label: string;
  /** Имя файла текстуры в public/textures/gregtech без расширения. */
  readonly texture: string;
  /** Отдельная текстура одной грани (экран, люк); остальные грани рисуются текстурой base. */
  readonly face?: { readonly rule: FaceRule; readonly base: string };
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
}

/**
 * Описание постройки. layers — схема в том же виде, что в исходниках мода:
 * слои сверху вниз, строки от фасада назад, символы слева направо.
 * Пробел — пусто, символы из hollow — полость внутри (там светится нутро).
 */
export interface StructureDef {
  readonly layers: readonly (readonly string[])[];
  readonly kinds: Readonly<Record<string, string>>;
  readonly hollow?: string;
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
}

export interface Structure {
  readonly blocks: readonly Block[];
  /** Центры ячеек полости: там стоит светящийся сердечник. */
  readonly hollow: readonly Vec3[];
  /** Габариты в блоках: ширина, высота, глубина. */
  readonly size: Vec3;
  /** Где стоит источник света: середина полости, а если её нет — середина постройки. */
  readonly lightPosition: Vec3;
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
      face: faceOf(kinds[kind].face?.rule, cell.grid),
    };
  });

  const size: Vec3 = [
    Math.max(...def.layers.flatMap((rows) => rows.map((row) => row.length))),
    def.layers.length,
    Math.max(...def.layers.map((rows) => rows.length)),
  ];
  const middle: Vec3 = [0, (size[1] * EBF.blockSize) / 2, 0];
  const lightPosition: Vec3 = hollow.length
    ? [0, 1, 2].map((axis) => hollow.reduce((sum, point) => sum + point[axis], 0) / hollow.length) as unknown as Vec3
    : middle;

  return { blocks, hollow, size, lightPosition };
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
 * Насколько курсор раздвигает блок: distance — расстояние в метрах от центра
 * блока до луча из камеры через курсор. Прямо под курсором — 1, на краю
 * радиуса и дальше — 0, между ними плавно.
 */
export function cursorWeight(distance: number): number {
  if (!(distance >= 0)) return 0;
  return smooth01(1 - distance / HOVER.radius);
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
