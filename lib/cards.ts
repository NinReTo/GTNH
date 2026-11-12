import { create } from "zustand";
import { HOVER, ICON } from "./config";
import { iconCameraSetup, type CameraSetup } from "./camera";
import type { Vec3 } from "./structure";
import { findMachine, structureOf, type Hull, type SteamTier } from "./machines";

/** Что изображает карточка: постройку или одноблочную машину в одной из версий. */
export type CardSpec =
  | { readonly kind: "machine"; readonly slug: string }
  | { readonly kind: "single"; readonly id: string; readonly tier: SteamTier; readonly hull: Hull };

/** Уникальное имя карточки: по нему хранится её снимок. */
export function specKey(spec: CardSpec): string {
  return spec.kind === "machine" ? ["machine", spec.slug].join(":") : ["single", spec.id, spec.tier].join(":");
}

/** Камера карточки: снимок и живая модель смотрят одинаково, поэтому подмена незаметна. */
export function specCamera(spec: CardSpec): CameraSetup {
  if (spec.kind === "single") return iconCameraSetup([1, 1, 1]);
  const machine = findMachine(spec.slug);
  if (!machine) throw new Error(`Неизвестная постройка «${spec.slug}»`);
  return iconCameraSetup(structureOf(machine).size);
}

/** Активная карточка: над ней лежит живая модель. */
export interface ActiveCard {
  readonly spec: CardSpec;
  readonly element: HTMLElement;
  /** Куда ведёт щелчок; у одноблочной машины своей страницы нет. */
  readonly href?: string;
}

interface CardState {
  /** Готовые снимки: имя карточки → картинка. */
  readonly images: Readonly<Record<string, string>>;
  /** Очередь на съёмку. Снимки делаются по одному. */
  readonly queue: readonly CardSpec[];
  readonly active: ActiveCard | null;
  /** Живая модель уже нарисовала кадр: теперь она закрывает снимок под собой целиком. */
  readonly isLiveReady: boolean;
  /** Мышка ушла: модель плавно возвращается в исходное положение, потом сменяется снимком. */
  readonly isLeaving: boolean;
  readonly request: (spec: CardSpec) => void;
  readonly done: (key: string, image: string) => void;
  readonly setActive: (active: ActiveCard | null) => void;
  readonly setLiveReady: (isLiveReady: boolean) => void;
  readonly setLeaving: (isLeaving: boolean) => void;
}

export const useCardStore = create<CardState>((set) => ({
  images: {},
  queue: [],
  active: null,
  isLiveReady: false,
  isLeaving: false,
  request: (spec) =>
    set((state) => {
      const key = specKey(spec);
      if (state.images[key] || state.queue.some((queued) => specKey(queued) === key)) return state;
      return { queue: [...state.queue, spec] };
    }),
  done: (key, image) =>
    set((state) => ({
      images: { ...state.images, [key]: image },
      queue: state.queue.filter((queued) => specKey(queued) !== key),
    })),
  // Новая карточка — живая модель ещё не готова, пока что виден снимок.
  setActive: (active) => set({ active, isLiveReady: false, isLeaving: false }),
  setLiveReady: (isLiveReady) => set({ isLiveReady }),
  setLeaving: (isLeaving) => set({ isLeaving }),
}));

export interface ReturnStep {
  readonly position: Vec3;
  /** Дошла ли точка до дома: тогда возврат закончен. */
  readonly isHome: boolean;
}

/**
 * Один шаг плавного возврата точки (камеры или её цели) домой. За каждый кадр
 * точка проходит долю оставшегося пути, поэтому возврат одинаково плавный при
 * любой частоте кадров. Почти дошла — встаёт ровно на место.
 */
export function returnStep(current: Vec3, home: Vec3, deltaSeconds: number): ReturnStep {
  const step = Math.min(Math.max(0, deltaSeconds), HOVER.maxStep);
  const share = 1 - Math.exp(-step / ICON.returnTime);
  const next = current.map((value, axis) => value + (home[axis] - value) * share);
  const distance = Math.hypot(...next.map((value, axis) => value - home[axis]));
  if (distance < ICON.returnEpsilon) return { position: home, isHome: true };
  return { position: [next[0], next[1], next[2]], isHome: false };
}
