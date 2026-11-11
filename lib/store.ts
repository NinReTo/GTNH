import { create } from "zustand";

/** Какие части картинки можно выключить для замеров: ?off=bloom,chromatic,transition,shadows */
export type EffectName = "bloom" | "chromatic" | "transition" | "shadows";
export const EFFECT_NAMES: readonly EffectName[] = ["bloom", "chromatic", "transition", "shadows"];

interface SceneState {
  /** Положение прокрутки внутри блока сцены, от 0 до 1. Единственное, от чего зависит сцена. */
  readonly progress: number;
  readonly setProgress: (progress: number) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  progress: 0,
  setProgress: (progress) => set({ progress }),
}));

/** Разбирает ?off=… из адреса в набор выключенных эффектов. Незнакомые слова игнорирует. */
export function parseDisabledEffects(search: string): ReadonlySet<EffectName> {
  const raw = new URLSearchParams(search).get("off") ?? "";
  const requested = raw.split(",").map((part) => part.trim());
  return new Set(EFFECT_NAMES.filter((name) => requested.includes(name) || requested.includes("all")));
}
