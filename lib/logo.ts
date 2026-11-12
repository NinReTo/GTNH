import { CAMERA, LOGO, WINTER } from "./config";
import { pullback, type CameraSetup } from "./camera";

/** Полный оборот в радианах: углы эмблемы в настройках заданы долями оборота. */
const TURN = Math.PI * 2;

export type Point = readonly [number, number];

/** Прямая золотая перекладина эмблемы: от точки до точки, шириной в полосу кольца. */
export interface Bar {
  readonly id: string;
  readonly from: Point;
  readonly to: Point;
}

/** Дуга кольца: от угла до угла (радианы, от «трёх часов» против часовой). */
export interface Arc {
  readonly id: string;
  readonly start: number;
  readonly end: number;
}

/** Где и как повёрнута перекладина: середина, длина и угол к горизонтали. */
export interface BarPlacement {
  readonly center: Point;
  readonly length: number;
  readonly angle: number;
}

export function placeBar(bar: Pick<Bar, "from" | "to">): BarPlacement {
  const [x1, y1] = bar.from;
  const [x2, y2] = bar.to;
  return {
    center: [(x1 + x2) / 2, (y1 + y2) / 2],
    length: Math.hypot(x2 - x1, y2 - y1),
    angle: Math.atan2(y2 - y1, x2 - x1),
  };
}

function onCircle(radius: number, angle: number): Point {
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

/** Две дуги кольца: справа и слева. Сверху и снизу кольцо разомкнуто — там видна планета. */
export function logoArcs(): Arc[] {
  const end = LOGO.arcEnd * TURN;
  const half = Math.PI;
  return [
    { id: "arc-right", start: -end, end },
    { id: "arc-left", start: half - end, end: half + end },
  ];
}

/**
 * Перекладины эмблемы. Вертикальная черта общая у N и H, диагональ из
 * верхнего левого конца кольца — это N, перекладина вправо — это H.
 * На концах дуг — «зубцы» шестерни со шляпками, на «трёх» и «девяти часах» — отростки.
 */
export function logoBars(): Bar[] {
  const r = LOGO.ringRadius;
  const outer = r + LOGO.band / 2;
  const stem = r + LOGO.stemOverhang;
  const bars: Bar[] = [
    { id: "stem", from: [0, -stem], to: [0, stem] },
    { id: "cross", from: [0, 0], to: [r, 0] },
    { id: "diagonal", from: onCircle(r, Math.PI - LOGO.arcEnd * TURN), to: [0, -r] },
    { id: "stub-right", from: [r, 0], to: [outer + LOGO.sideStub, 0] },
    { id: "stub-left", from: [-r, 0], to: [-(outer + LOGO.sideStub), 0] },
  ];
  logoArcs()
    .flatMap((arc) => [arc.start, arc.end])
    .forEach((angle, index) => {
      const tip = onCircle(outer + LOGO.toothLength, angle);
      const across = angle + Math.PI / 2;
      const [dx, dy] = onCircle(LOGO.toothCap / 2, across);
      bars.push({ id: `tooth-${index}`, from: onCircle(r, angle), to: tip });
      bars.push({ id: `cap-${index}`, from: [tip[0] - dx, tip[1] - dy], to: [tip[0] + dx, tip[1] + dy] });
    });
  return bars;
}

/** Насколько перекладина отклонена от горизонтали, в радианах от 0 до π/2. */
export function tilt(angle: number): number {
  const folded = Math.abs(angle) % Math.PI;
  return Math.min(folded, Math.PI - folded);
}

/**
 * Куда ложится снег: на почти горизонтальные перекладины — вдоль всей верхней
 * грани, на вертикальную черту — шапкой на верхний торец.
 */
export interface SnowCap {
  readonly id: string;
  readonly center: Point;
  readonly width: number;
  readonly angle: number;
}

export function snowCaps(): SnowCap[] {
  const lift = (LOGO.band + LOGO.snowCap) / 2;
  return logoBars().flatMap((bar): SnowCap[] => {
    const place = placeBar(bar);
    const [cx, cy] = place.center;
    if (tilt(place.angle) <= LOGO.snowMaxTilt * TURN) {
      return [{ id: `snow-${bar.id}`, center: [cx, cy + lift], width: place.length, angle: 0 }];
    }
    if (bar.id === "stem") {
      const top = Math.max(bar.from[1], bar.to[1]);
      return [{ id: "snow-stem", center: [cx, top + LOGO.snowCap / 2], width: LOGO.band, angle: 0 }];
    }
    return [];
  });
}

/** Эмблема правее центра, если шапка широкая; на узком экране — по центру. */
export function logoOffsetX(aspect: number): number {
  return aspect > CAMERA.referenceAspect ? LOGO.offsetX : 0;
}

/** Камера зимней шапки; на узком экране отъезжает, как и остальные сцены. */
export function winterCamera(aspect: number): CameraSetup {
  const reach = pullback(aspect);
  const target = WINTER.cameraTarget;
  const position = WINTER.cameraPosition.map((value, axis) => target[axis] + (value - target[axis]) * reach);
  return { position: [position[0], position[1], position[2]], target: [target[0], target[1], target[2]] };
}
