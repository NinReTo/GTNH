import { create } from "zustand";
import { HOVER, ICON } from "./config";
import { iconCameraSetup, type CameraSetup } from "./camera";
import type { Vec3 } from "./structure";
import { findMachine, structureOf } from "./machines";

/** Что изображает карточка: постройку или одноблочную машину (обе — по адресному имени). */
export type CardSpec = { readonly kind: "machine"; readonly slug: string } | { readonly kind: "single"; readonly slug: string };

/** Уникальное имя карточки: по нему хранится её снимок. */
export function specKey(spec: CardSpec): string {
  return [spec.kind, spec.slug].join(":");
}

/** Камера карточки: снимок и живая модель смотрят одинаково, поэтому подмена незаметна. */
export function specCamera(spec: CardSpec): CameraSetup {
  if (spec.kind === "single") return iconCameraSetup([1, 1, 1]);
  const machine = findMachine(spec.slug);
  if (!machine) throw new Error(`Неизвестная постройка «${spec.slug}»`);
  return iconCameraSetup(structureOf(machine).size);
}

/** Прямоугольник карточки в окне: левый, верхний, правый и нижний край в CSS-пикселях. */
export interface Rect {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

/**
 * Какую карточку оживить: ближайшую к курсору, если до её края не дальше reach
 * (над самой карточкой расстояние — ноль). Ни одной рядом — -1.
 */
export function nearestCard(x: number, y: number, rects: readonly Rect[], reach: number): number {
  let best = -1;
  let bestDistance = Number.POSITIVE_INFINITY;
  rects.forEach((rect, index) => {
    const dx = Math.max(rect.left - x, 0, x - rect.right);
    const dy = Math.max(rect.top - y, 0, y - rect.bottom);
    const distance = Math.hypot(dx, dy);
    if (distance <= reach && distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}

/** Карточка на странице, которую можно оживить: её квадрат с моделью, что в нём и куда ведёт щелчок. */
export interface CardEntry {
  readonly spec: CardSpec;
  readonly element: HTMLElement;
  readonly href?: string;
}

/** Все карточки страницы. Карточка сама вписывается сюда, когда появляется, и выписывается, когда исчезает. */
export const cardRegistry = new Set<CardEntry>();

/** Где лежит карточка на странице (а не в окне): живой холст прокручивается вместе со страницей. */
export interface Box {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

export function boxOf(element: HTMLElement): Box {
  const rect = element.getBoundingClientRect();
  return { top: rect.top + window.scrollY, left: rect.left + window.scrollX, width: rect.width, height: rect.height };
}

/** Карточка под мышкой: над ней лежит живая модель. */
export interface ActiveCard {
  readonly spec: CardSpec;
  readonly element: HTMLElement;
  /**
   * Место карточки, замеренное в момент наведения. Живой холст сразу встаёт
   * ровно сюда и ровно этого размера — без кадра «не того размера».
   */
  readonly box: Box;
  /** Куда ведёт щелчок; у одноблочной машины своей страницы нет. */
  readonly href?: string;
}

/**
 * Сколько целых экранных точек займёт квадрат с моделью в карточке шириной
 * cssWidth. Карточки в сетке бывают дробной ширины (272.66), а экран рисует
 * только целые точки: картинку пришлось бы ужимать, и она мылится. Поэтому
 * квадрат с моделью делаем ровно целым числом экранных точек.
 */
export function devicePixels(cssWidth: number, dpr: number): number {
  return Math.max(0, Math.floor(cssWidth * dpr + ICON.pixelEpsilon));
}

/** Ширина в CSS для ровно pixels экранных точек (с запасом на округление). */
export function cssSize(pixels: number, dpr: number): number {
  return (pixels + ICON.pixelEpsilon) / dpr;
}

/** Заказ на снимок: какая карточка и сколько экранных точек в её квадрате. */
export interface ShotRequest {
  readonly spec: CardSpec;
  readonly size: number;
}

/**
 * Живой холст. Их два: пока одна модель плавно возвращается домой на своём
 * холсте, следующая карточка включается на другом и прошлую не трогает.
 */
export interface LiveSlot {
  readonly card: ActiveCard;
  /** Модель уже нарисовала первый кадр: теперь её можно показать поверх снимка. */
  readonly isReady: boolean;
  /** Мышка ушла: модель плавно возвращается в исходное положение, потом холст освобождается. */
  readonly isLeaving: boolean;
}

export type Slots = readonly [LiveSlot | null, LiveSlot | null];

/** Какой холст свободен для новой карточки: не тот, что сейчас под мышкой. */
export function otherSlot(index: number): number {
  return 1 - index;
}

/** Готовый снимок и размер карточки (точки), под который он сделан. */
export interface Snapshot {
  readonly src: string;
  readonly size: number;
}

/**
 * Карточка «горит» (рамка и подпись), пока под мышкой её живая модель. Обычное
 * :hover тут не годится: живой холст ложится поверх карточки, браузер считает,
 * что мышь ушла с карточки, и подсветка мигает.
 */
export function isCardLit(slots: Slots, current: number, element: HTMLElement | null): boolean {
  const slot = slots[current];
  return Boolean(element) && slot !== null && slot.card.element === element && !slot.isLeaving;
}

interface CardState {
  /** Готовые снимки: имя карточки → картинка. */
  readonly images: Readonly<Record<string, Snapshot>>;
  /** Очередь на съёмку. Снимки делаются по одному. */
  readonly queue: readonly ShotRequest[];
  readonly slots: Slots;
  /** Номер холста карточки под мышкой. */
  readonly current: number;
  /**
   * Курсор сейчас над живой моделью. Модель включается заранее, за ICON.nearReach до
   * карточки, а рамка должна загораться только под самим курсором.
   */
  readonly isPointerOver: boolean;
  readonly setPointerOver: (isOver: boolean) => void;
  readonly request: (spec: CardSpec, size: number) => void;
  readonly done: (shot: ShotRequest, src: string) => void;
  /** Мышка зашла на карточку. */
  readonly activate: (card: ActiveCard) => void;
  /** Мышка ушла с живой модели: начинается возврат домой. */
  readonly leave: () => void;
  /** Мышка вернулась на ту же модель посреди возврата: возврат прерывается. */
  readonly stay: () => void;
  readonly setReady: (index: number) => void;
  /** Модель дошла домой: холст освобождается, снова виден снимок. */
  readonly release: (index: number) => void;
  /** Убрать все живые модели сразу (окно поменяло размер — карточки сдвинулись). */
  readonly clear: () => void;
}

function withSlot(slots: Slots, index: number, slot: LiveSlot | null): Slots {
  return index === 0 ? [slot, slots[1]] : [slots[0], slot];
}

export const useCardStore = create<CardState>((set) => ({
  images: {},
  queue: [],
  slots: [null, null],
  current: 0,
  isPointerOver: false,
  setPointerOver: (isOver) => set((state) => (state.isPointerOver === isOver ? state : { isPointerOver: isOver })),
  request: (spec, size) =>
    set((state) => {
      const key = specKey(spec);
      // Снимок уже есть ровно такого размера — переснимать незачем.
      if (state.images[key]?.size === size) return state;
      const queued = state.queue.find((shot) => specKey(shot.spec) === key);
      if (!queued) return { queue: [...state.queue, { spec, size }] };
      // Карточка поменяла размер, пока ждала очереди: снимем сразу в новом.
      if (queued.size === size) return state;
      return { queue: state.queue.map((shot) => (shot === queued ? { spec, size } : shot)) };
    }),
  done: (shot, src) =>
    set((state) => ({
      images: { ...state.images, [specKey(shot.spec)]: { src, size: shot.size } },
      queue: state.queue.filter((queued) => !(specKey(queued.spec) === specKey(shot.spec) && queued.size === shot.size)),
    })),
  activate: (card) =>
    set((state) => {
      const present = state.slots[state.current];
      // Та же карточка (мышка вернулась посреди возврата) — просто остаёмся.
      if (present && present.card.element === card.element) {
        return { slots: withSlot(state.slots, state.current, { ...present, isLeaving: false }) };
      }
      // Прошлая модель доигрывает возврат на своём холсте; новая карточка — на другом.
      const leaving = present ? withSlot(state.slots, state.current, { ...present, isLeaving: true }) : state.slots;
      const next = otherSlot(state.current);
      const waiting = state.slots[next];
      // На другом холсте ещё возвращается домой эта же карточка — она просто остаётся жить там.
      if (waiting && waiting.card.element === card.element) {
        return { slots: withSlot(leaving, next, { ...waiting, isLeaving: false }), current: next };
      }
      return { slots: withSlot(leaving, next, { card, isReady: false, isLeaving: false }), current: next };
    }),
  leave: () =>
    set((state) => {
      const present = state.slots[state.current];
      return present ? { slots: withSlot(state.slots, state.current, { ...present, isLeaving: true }) } : state;
    }),
  stay: () =>
    set((state) => {
      const present = state.slots[state.current];
      return present ? { slots: withSlot(state.slots, state.current, { ...present, isLeaving: false }) } : state;
    }),
  setReady: (index) =>
    set((state) => {
      const slot = state.slots[index];
      return slot ? { slots: withSlot(state.slots, index, { ...slot, isReady: true }) } : state;
    }),
  // Убираем, только если модель всё ещё возвращается: мышка могла вернуться на неё
  // в тот же кадр, когда она дошла домой, — тогда холст должен остаться.
  release: (index) =>
    set((state) => (state.slots[index]?.isLeaving ? { slots: withSlot(state.slots, index, null) } : state)),
  clear: () => set({ slots: [null, null] }),
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
/** Какую долю оставшегося пути пройти за кадр длиной deltaSeconds. */
function returnShare(deltaSeconds: number): number {
  const step = Math.min(Math.max(0, deltaSeconds), HOVER.maxStep);
  return 1 - Math.exp(-step / ICON.returnTime);
}

export function returnStep(current: Vec3, home: Vec3, deltaSeconds: number): ReturnStep {
  const share = returnShare(deltaSeconds);
  const next = current.map((value, axis) => value + (home[axis] - value) * share);
  const distance = Math.hypot(...next.map((value, axis) => value - home[axis]));
  if (distance < ICON.returnEpsilon) return { position: home, isHome: true };
  return { position: [next[0], next[1], next[2]], isHome: false };
}

/** Точка относительно центра в сферических координатах: расстояние, поворот вокруг вертикали, угол от вертикали. */
function toSpherical(point: Vec3, center: Vec3) {
  const [x, y, z] = point.map((value, axis) => value - center[axis]);
  const radius = Math.hypot(x, y, z);
  return { radius, theta: Math.atan2(x, z), phi: Math.acos(Math.min(1, Math.max(-1, y / radius))) };
}

/**
 * Шаг возврата камеры, которая вращается вокруг center. Камера едет по дуге
 * на своём расстоянии, а не по прямой: прямая от повёрнутой камеры к дому
 * проходит сквозь модель, и на полпути модель резко вырастала во весь холст.
 */
export function orbitReturnStep(current: Vec3, home: Vec3, center: Vec3, deltaSeconds: number): ReturnStep {
  const share = returnShare(deltaSeconds);
  const from = toSpherical(current, center);
  const to = toSpherical(home, center);
  // Поворачиваем коротким путём: из 350° в 10° — через 0°, а не назад через 180°.
  const turn = Math.atan2(Math.sin(to.theta - from.theta), Math.cos(to.theta - from.theta));
  const radius = from.radius + (to.radius - from.radius) * share;
  const theta = from.theta + turn * share;
  const phi = from.phi + (to.phi - from.phi) * share;
  const next: Vec3 = [
    center[0] + radius * Math.sin(phi) * Math.sin(theta),
    center[1] + radius * Math.cos(phi),
    center[2] + radius * Math.sin(phi) * Math.cos(theta),
  ];
  const distance = Math.hypot(...next.map((value, axis) => value - home[axis]));
  if (distance < ICON.returnEpsilon) return { position: home, isHome: true };
  return { position: next, isHome: false };
}
