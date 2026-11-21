"use client";

import { useState } from "react";
import { DIAGRAM, EBF, HOVER, THEME } from "@/lib/config";
import { kindsOf, structureOf } from "@/lib/machines";
import { findScene } from "@/lib/setups";
import { countByKind, explodedPosition, type BlockKind, type Vec3 } from "@/lib/structure";
import { Figure, Slider, formatNumber } from "./ui";
import { pick, tr } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";

const { width, iso } = DIAGRAM;
const ANGLE = (iso.angle * Math.PI) / iso.halfTurnDegrees;
const HALF = (EBF.blockSize * EBF.blockScale) / 2;

/** Изометрия в метрах: фасад (+z) смотрит влево-вниз, правая стена (+x) — вправо-вниз, высота — вверх. */
function flatten([x, y, z]: Vec3): readonly [number, number] {
  return [(x - z) * Math.cos(ANGLE), (x + z) * Math.sin(ANGLE) - y];
}

/** Три видимые грани куба: верх, фасад, правая стена. Углы заданы знаками смещения от центра. */
const CUBE_FACES: readonly { shade: number; corners: readonly Vec3[] }[] = [
  { shade: iso.shadeTop, corners: [[-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1]] },
  { shade: iso.shadeFront, corners: [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]] },
  { shade: iso.shadeSide, corners: [[1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1]] },
];

function colorOf(kind: BlockKind): string {
  if (kind.isHot) return THEME.accent;
  if (kind.face) return THEME.text1;
  return THEME.text3;
}

type MachineDiagramProps = {
  slug: string;
};

export function MachineDiagram({ slug }: MachineDiagramProps) {
  const [weight, setWeight] = useState<number>(iso.initialExplode);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const lang = useLang();
  const machine = findScene(slug);
  if (!machine) return null;

  const { blocks } = structureOf(machine);
  const kinds = kindsOf(machine);
  const counts = countByKind(blocks);
  const legend = Object.keys(counts);

  const list = (
    <ul className="self-center">
      {legend.map((id) => {
        const kind: BlockKind = kinds[id];
        return (
          <li key={id}>
            <button
              type="button"
              className="flex w-full items-center gap-4 border-b border-line py-3 text-left transition-colors hover:bg-line/40"
              onMouseEnter={() => setHighlighted(id)}
              onMouseLeave={() => setHighlighted(null)}
              onFocus={() => setHighlighted(id)}
              onBlur={() => setHighlighted(null)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- текстуру 16×16 нельзя сглаживать, оптимизатор картинок её размоет */}
              <img
                src={`/textures/gregtech/${kind.texture}.webp`}
                alt=""
                width={iso.swatch}
                height={iso.swatch}
                className="pixelated shrink-0"
              />
              <span className="flex-1 text-text1">{tr(lang, kind.label)}</span>
              <span className="font-mono text-2xl text-accent">{formatNumber(counts[id])}</span>
            </button>
          </li>
        );
      })}
      <li className="flex items-baseline justify-between pt-4 font-mono text-xs uppercase tracking-[0.2em] text-text3">
        <span>{pick(lang, "Всего блоков", "Total blocks")}</span>
        <span className="text-2xl text-text1">{formatNumber(blocks.length)}</span>
      </li>
    </ul>
  );

  // Огромную постройку рисунок из многоугольников раздул бы страницу до мегабайтов (по три на блок) —
  // её разбирают в трёхмерной шапке, а здесь только состав.
  if (blocks.length >= HOVER.hugeBlocks) {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <p className="self-center text-base text-text2">
          {pick(
            lang,
            "Постройка слишком большая для плоского рисунка. Разберите её в трёхмерной модели в начале страницы: наведите курсор — блоки разойдутся куполом, а колёсиком с Ctrl или Cmd можно подъехать ближе.",
            "This multiblock is too big for a flat drawing. Take it apart in the 3D model at the top of the page: hover over it and the blocks spread out in a dome; zoom in with the wheel while holding Ctrl or Cmd.",
          )}
        </p>
        {list}
      </div>
    );
  }

  // Те же блоки и та же функция раскладки, что в трёхмерной сцене.
  const placed = blocks
    .map((block) => ({ block, position: explodedPosition(block, weight) }))
    .sort((a, b) => a.position[0] + a.position[1] + a.position[2] - (b.position[0] + b.position[1] + b.position[2]));

  // Масштаб подбирается под полностью раздвинутую постройку, чтобы она не прыгала при движении ползунка.
  const corners = blocks.flatMap((block) => {
    const center = explodedPosition(block, 1);
    return CUBE_FACES.flatMap((face) =>
      face.corners.map(([dx, dy, dz]) => flatten([center[0] + dx * HALF, center[1] + dy * HALF, center[2] + dz * HALF])),
    );
  });
  const xs = corners.map(([x]) => x);
  const ys = corners.map(([, y]) => y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const room = { x: width - iso.padding * 2, y: iso.height - iso.padding * 2 };
  const scale = Math.min(iso.scale, room.x / (maxX - minX), room.y / (maxY - minY));
  const offsetX = (width - (maxX + minX) * scale) / 2;
  const offsetY = (iso.height - (maxY + minY) * scale) / 2;

  const points = (center: Vec3, faceCorners: readonly Vec3[]) =>
    faceCorners
      .map(([dx, dy, dz]) => {
        const [x, y] = flatten([center[0] + dx * HALF, center[1] + dy * HALF, center[2] + dz * HALF]);
        return `${(offsetX + x * scale).toFixed(1)},${(offsetY + y * scale).toFixed(1)}`;
      })
      .join(" ");

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <Figure caption={pick(lang, "Двигайте ползунок — блоки раздвинутся. Наведите на строку справа, чтобы найти такие блоки в постройке.", "Move the slider to spread the blocks apart. Hover over a row on the right to find those blocks in the multiblock.")}>
        <svg viewBox={`0 0 ${width} ${iso.height}`} role="img" aria-label={`${pick(lang, "Разбор по блокам", "Block breakdown")}: ${lang === "ru" ? machine.title : machine.name}`} className="w-full">
          {placed.map(({ block, position }) => {
            const kind: BlockKind = kinds[block.kind];
            return (
              <g
                key={block.id}
                opacity={highlighted && highlighted !== block.kind ? iso.dimOpacity : 1}
                onMouseEnter={() => setHighlighted(block.kind)}
                onMouseLeave={() => setHighlighted(null)}
              >
                <title>{tr(lang, kind.label)}</title>
                {CUBE_FACES.map((face) => (
                  <polygon
                    key={face.shade}
                    points={points(position, face.corners)}
                    fill={colorOf(kind)}
                    fillOpacity={kind.isGlass || kind.isCutout ? face.shade * iso.seeThrough : face.shade}
                    stroke={THEME.bg}
                    strokeWidth={DIAGRAM.stroke}
                    strokeLinejoin="round"
                  />
                ))}
              </g>
            );
          })}
        </svg>
        <Slider label={pick(lang, "Раздвинуть", "Spread")} value={weight} display={`${formatNumber(weight * iso.percent)} %`} onChange={setWeight} />
      </Figure>

      {list}
    </div>
  );
}
