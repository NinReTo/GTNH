import { create } from "zustand";
import { iconCameraSetup, type CameraSetup } from "./camera";
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
  readonly request: (spec: CardSpec) => void;
  readonly done: (key: string, image: string) => void;
  readonly setActive: (active: ActiveCard | null) => void;
  readonly setLiveReady: (isLiveReady: boolean) => void;
}

export const useCardStore = create<CardState>((set) => ({
  images: {},
  queue: [],
  active: null,
  isLiveReady: false,
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
  setActive: (active) => set({ active, isLiveReady: false }),
  setLiveReady: (isLiveReady) => set({ isLiveReady }),
}));
