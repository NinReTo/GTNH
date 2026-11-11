import { EBF, EXPLODE } from "./config";
import { clamp01, smooth01 } from "./math";

/**
 * Форма печи — дословно из исходника мода
 * (GT5-Unofficial, MTEElectricBlastFurnace.java, STRUCTURE_DEFINITION).
 * Слои идут сверху вниз, строки — от фасада назад, символы — слева направо.
 *   f — корпус или выходной люк, m — глушитель, C — катушка,
 *   - — обязательный воздух, b — корпус или любой люк, ~ — контроллер.
 */
export const STRUCTURE_SHAPE: readonly (readonly string[])[] = [
  ["fff", "fmf", "fff"],
  ["CCC", "C-C", "CCC"],
  ["CCC", "C-C", "CCC"],
  ["b~b", "bbb", "bbb"],
];

/**
 * Наш выбор люков для нижнего слоя (мод разрешает любой люк на любом месте «b»).
 *   I — входная шина, O — выходная шина, E — энерголюк (их два: на LV иначе
 *   не запустить ни одного рецепта), M — люк обслуживания, F — входной люк
 *   для жидкостей, b — просто корпус.
 */
export const BOTTOM_HATCHES: readonly string[] = ["I~O", "EbM", "EFb"];

export type BlockType =
  | "casing"
  | "coil"
  | "controller"
  | "muffler"
  | "inputBus"
  | "outputBus"
  | "inputHatch"
  | "energy"
  | "maintenance";

/** Грань куба: p/n — плюс/минус, вторая буква — ось. Порядок как у граней куба в three.js. */
export type Face = "px" | "nx" | "py" | "ny" | "pz" | "nz";
export const FACES: readonly Face[] = ["px", "nx", "py", "ny", "pz", "nz"];

export type Vec3 = readonly [number, number, number];

export interface Block {
  readonly id: string;
  readonly type: BlockType;
  /** Место в сетке: x и z от −1 до 1 (фасад — в сторону +z), y — номер слоя снизу, с нуля. */
  readonly grid: Vec3;
  /** Грань с рисунком (экран, люк). У корпуса и катушек её нет. */
  readonly face: Face | null;
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  casing: "Жаропрочный корпус",
  coil: "Нагревательная катушка",
  controller: "Контроллер",
  muffler: "Глушитель",
  inputBus: "Входная шина",
  outputBus: "Выходная шина",
  inputHatch: "Входной люк",
  energy: "Энергетический люк",
  maintenance: "Люк обслуживания",
};

const HATCH_TYPES: Record<string, BlockType> = {
  I: "inputBus",
  O: "outputBus",
  E: "energy",
  M: "maintenance",
  F: "inputHatch",
  b: "casing",
  "~": "controller",
};

const AIR = "-";

function typeOf(symbol: string, hatchSymbol: string | null): BlockType {
  if (symbol === "C") return "coil";
  if (symbol === "m") return "muffler";
  if (symbol === "~") return "controller";
  if (symbol === "b" && hatchSymbol) return HATCH_TYPES[hatchSymbol] ?? "casing";
  return "casing";
}

/** Люк смотрит наружу: с фасадного ряда — вперёд, иначе в сторону своей стены. */
function outwardFace(x: number, z: number): Face {
  if (z > 0) return "pz";
  if (x < 0) return "nx";
  if (x > 0) return "px";
  return "nz";
}

function faceOf(type: BlockType, x: number, z: number): Face | null {
  if (type === "casing" || type === "coil") return null;
  if (type === "muffler") return "py";
  return outwardFace(x, z);
}

/** Разворачивает строковую форму мода в список блоков. Воздух пропускается. */
export function buildBlocks(): Block[] {
  const layerCount = STRUCTURE_SHAPE.length;
  const blocks: Block[] = [];
  STRUCTURE_SHAPE.forEach((rows, fromTop) => {
    const y = layerCount - 1 - fromTop;
    rows.forEach((row, rowIndex) => {
      const half = (row.length - 1) / 2;
      [...row].forEach((symbol, columnIndex) => {
        if (symbol === AIR) return;
        const x = columnIndex - half;
        const z = (rows.length - 1) / 2 - rowIndex;
        const hatchSymbol = y === 0 ? BOTTOM_HATCHES[rowIndex][columnIndex] : null;
        const type = typeOf(symbol, hatchSymbol);
        blocks.push({ id: [x, y, z].join(":"), type, grid: [x, y, z], face: faceOf(type, x, z) });
      });
    });
  });
  return blocks;
}

export const BLOCKS: readonly Block[] = buildBlocks();
export const LAYER_COUNT = STRUCTURE_SHAPE.length;

/** Сколько блоков каждого вида в печи. */
export function countByType(blocks: readonly Block[] = BLOCKS): Record<BlockType, number> {
  const counts = Object.fromEntries(Object.keys(BLOCK_LABELS).map((key) => [key, 0])) as Record<BlockType, number>;
  for (const block of blocks) counts[block.type] += 1;
  return counts;
}

/**
 * Продвижение одного слоя при общем продвижении разбора explode (0…1).
 * Верхний слой стартует первым, каждый следующий — с задержкой.
 */
export function layerProgress(layer: number, explode: number): number {
  const fromTop = LAYER_COUNT - 1 - layer;
  const delay = fromTop * EXPLODE.layerStagger;
  const window = 1 - (LAYER_COUNT - 1) * EXPLODE.layerStagger;
  return smooth01(clamp01((explode - delay) / window));
}

/**
 * ЕДИНСТВЕННАЯ функция раскладки: где центр блока при продвижении разбора explode.
 * Её вызывают и трёхмерная сцена, и схема на лендинге — разойтись они не могут.
 * При explode = 0 печь собрана, при 1 — слои разнесены по высоте, а блоки
 * отодвинуты от оси.
 */
export function explodedPosition(grid: Vec3, explode: number): Vec3 {
  const [x, y, z] = grid;
  const local = layerProgress(y, explode);
  const spread = 1 + EXPLODE.radialSpread * local;
  return [
    x * EBF.blockSize * spread,
    (y + 1 / 2) * EBF.blockSize + y * EXPLODE.layerGap * local,
    z * EBF.blockSize * spread,
  ];
}
