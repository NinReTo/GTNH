import { create } from "zustand";

/** Какие части картинки можно выключить для замеров: ?off=bloom,chromatic,transition,shadows */
export type EffectName = "bloom" | "chromatic" | "transition" | "shadows";
export const EFFECT_NAMES: readonly EffectName[] = ["bloom", "chromatic", "transition", "shadows"];

/** Курсор в координатах холста: x и y от −1 до 1, начало в центре, y вверх. */
export type Pointer = readonly [number, number];

interface SceneState {
  /** Положение прокрутки внутри блока сцены, от 0 до 1: ведёт переход к странице. */
  readonly progress: number;
  /** Где курсор над холстом; null — курсор ушёл со сцены, блоки возвращаются на место. */
  readonly pointer: Pointer | null;
  readonly setProgress: (progress: number) => void;
  readonly setPointer: (pointer: Pointer | null) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  progress: 0,
  pointer: null,
  setProgress: (progress) => set({ progress }),
  setPointer: (pointer) => set({ pointer }),
}));

/** Положение курсора внутри прямоугольника холста → координаты от −1 до 1. */
export function toPointer(clientX: number, clientY: number, rect: Pick<DOMRect, "left" | "top" | "width" | "height">): Pointer | null {
  if (!(rect.width > 0) || !(rect.height > 0)) return null;
  const x = ((clientX - rect.left) / rect.width) * 2 - 1;
  const y = 1 - ((clientY - rect.top) / rect.height) * 2;
  return [x, y];
}

/** Разбирает ?off=… из адреса в набор выключенных эффектов. Незнакомые слова игнорирует. */
export function parseDisabledEffects(search: string): ReadonlySet<EffectName> {
  const raw = new URLSearchParams(search).get("off") ?? "";
  const requested = raw.split(",").map((part) => part.trim());
  return new Set(EFFECT_NAMES.filter((name) => requested.includes(name) || requested.includes("all")));
}
