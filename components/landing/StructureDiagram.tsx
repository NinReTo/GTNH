"use client";

import { useState } from "react";
import { DIAGRAM, EBF, THEME } from "@/lib/config";
import { BLOCKS, BLOCK_LABELS, countByType, explodedPosition, type BlockType, type Vec3 } from "@/lib/ebf";
import { phaseThresholds } from "@/lib/scroll";
import { Figure, Slider, formatNumber } from "./ui";

const { width, iso } = DIAGRAM;
const ANGLE = (iso.angle * Math.PI) / (iso.halfTurnDegrees);
const HALF = (EBF.blockSize * EBF.blockScale) / 2;

/** Изометрическая проекция: фасад (+z) смотрит влево-вниз, правая стена (+x) — вправо-вниз. */
function project([x, y, z]: Vec3): string {
  const screenX = width / 2 + (x - z) * Math.cos(ANGLE) * iso.scale;
  const screenY = iso.height - iso.originBottom + (x + z) * Math.sin(ANGLE) * iso.scale - y * iso.scale;
  return `${screenX.toFixed(1)},${screenY.toFixed(1)}`;
}

/** Три видимые грани куба: верх, фасад, правая стена. Углы заданы знаками смещения от центра. */
const CUBE_FACES: readonly { shade: number; corners: readonly Vec3[] }[] = [
  { shade: iso.shadeTop, corners: [[-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1]] },
  { shade: iso.shadeFront, corners: [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]] },
  { shade: iso.shadeSide, corners: [[1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1]] },
];

function facePoints(center: Vec3, corners: readonly Vec3[]): string {
  return corners
    .map(([dx, dy, dz]) => project([center[0] + dx * HALF, center[1] + dy * HALF, center[2] + dz * HALF]))
    .join(" ");
}

function colorOf(type: BlockType): string {
  if (type === "coil") return THEME.accent;
  if (type === "casing") return THEME.text3;
  return THEME.text1;
}

const TEXTURES: Record<BlockType, string> = {
  casing: "casing",
  coil: "coil-cupronickel",
  controller: "controller",
  muffler: "muffler",
  inputBus: "input-bus",
  outputBus: "output-bus",
  inputHatch: "input-hatch",
  energy: "energy",
  maintenance: "maintenance",
};

const COUNTS = countByType();
const LEGEND = (Object.keys(BLOCK_LABELS) as BlockType[]).filter((type) => COUNTS[type] > 0);

export function StructureDiagram() {
  const [explode, setExplode] = useState<number>(phaseThresholds().explodeEnd);
  const [highlighted, setHighlighted] = useState<BlockType | null>(null);

  // Те же блоки и та же функция раскладки, что в трёхмерной сцене.
  const placed = BLOCKS.map((block) => ({ block, position: explodedPosition(block.grid, explode) })).sort(
    (a, b) => a.position[0] + a.position[1] + a.position[2] - (b.position[0] + b.position[1] + b.position[2]),
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <Figure caption="Схема вызывает explodedPosition() из lib/ebf.ts — ту же функцию, что двигает блоки в сцене наверху.">
        <svg viewBox={`0 0 ${width} ${iso.height}`} role="img" aria-label="Разбор печи по блокам" className="w-full">
          {placed.map(({ block, position }) => (
            <g
              key={block.id}
              opacity={highlighted && highlighted !== block.type ? iso.dimOpacity : 1}
              onMouseEnter={() => setHighlighted(block.type)}
              onMouseLeave={() => setHighlighted(null)}
            >
              <title>{BLOCK_LABELS[block.type]}</title>
              {CUBE_FACES.map((face) => (
                <polygon
                  key={face.shade}
                  points={facePoints(position, face.corners)}
                  fill={colorOf(block.type)}
                  fillOpacity={face.shade}
                  stroke={THEME.bg}
                  strokeWidth={DIAGRAM.stroke}
                  strokeLinejoin="round"
                />
              ))}
            </g>
          ))}
        </svg>
        <Slider label="Разбор" value={explode} display={`${formatNumber(explode * iso.percent)} %`} onChange={setExplode} />
      </Figure>

      <ul className="self-center">
        {LEGEND.map((type) => (
          <li key={type}>
            <button
              type="button"
              className="flex w-full items-center gap-4 border-b border-line py-3 text-left transition-colors hover:bg-line/40"
              onMouseEnter={() => setHighlighted(type)}
              onMouseLeave={() => setHighlighted(null)}
              onFocus={() => setHighlighted(type)}
              onBlur={() => setHighlighted(null)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- текстуру 16×16 нельзя сглаживать, оптимизатор картинок её размоет */}
              <img
                src={`/textures/gregtech/${TEXTURES[type]}.webp`}
                alt=""
                width={iso.swatch}
                height={iso.swatch}
                className="pixelated shrink-0"
              />
              <span className="flex-1 text-text1">{BLOCK_LABELS[type]}</span>
              <span className="font-mono text-2xl text-accent">{COUNTS[type]}</span>
            </button>
          </li>
        ))}
        <li className="flex items-baseline justify-between pt-4 font-mono text-xs uppercase tracking-[0.2em] text-text3">
          <span>Всего блоков</span>
          <span className="text-2xl text-text1">{BLOCKS.length}</span>
        </li>
      </ul>
    </div>
  );
}
