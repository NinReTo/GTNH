"use client";

import { useState } from "react";
import { CAMERA, DIAGRAM, EBF, THEME } from "@/lib/config";
import { cameraPose } from "@/lib/camera";
import { BLOCKS, explodedPosition } from "@/lib/ebf";
import { explodeProgress, phaseThresholds } from "@/lib/scroll";
import { Figure, Slider, formatNumber } from "./ui";

const { width, plan } = DIAGRAM;

/** Вид сверху: x — вправо, z (в сторону фасада) — вниз. */
function toScreen(x: number, z: number): [number, number] {
  return [width * plan.originX + x * plan.scale, plan.height * plan.originY + z * plan.scale];
}

function polyline(points: readonly (readonly number[])[]): string {
  return points.map(([x, , z]) => toScreen(x, z).map((value) => value.toFixed(1)).join(",")).join(" ");
}

// Кривые строятся той же функцией cameraPose(), что ведёт настоящую камеру.
const SAMPLES = Array.from({ length: plan.samples + 1 }, (_, index) => cameraPose(index / plan.samples));
const CAMERA_PATH = polyline(SAMPLES.map((pose) => pose.position));
const TARGET_PATH = polyline(SAMPLES.map((pose) => pose.target));

export function CameraDiagram() {
  const [progress, setProgress] = useState<number>(phaseThresholds().explodeStart);
  const pose = cameraPose(progress);
  const [cameraX, cameraY] = toScreen(pose.position[0], pose.position[2]);
  const [targetX, targetY] = toScreen(pose.target[0], pose.target[2]);
  const distance = Math.hypot(...pose.position.map((value, axis) => value - pose.target[axis]));
  const explode = explodeProgress(progress);
  const blockSide = EBF.blockSize * EBF.blockScale * plan.scale;

  return (
    <Figure caption="Вид сверху. Линия пути — cameraPose() из lib/camera.ts, квадраты — блоки нижнего слоя из explodedPosition(): двиньте ползунок, и печь на плане разъедется вместе с камерой.">
      <svg viewBox={`0 0 ${width} ${plan.height}`} role="img" aria-label="Путь камеры вокруг печи" className="w-full">
        {BLOCKS.filter((block) => block.grid[1] === 0).map((block) => {
          const [x, , z] = explodedPosition(block.grid, explode);
          const [screenX, screenY] = toScreen(x, z);
          return (
            <rect
              key={block.id}
              x={screenX - blockSide / 2}
              y={screenY - blockSide / 2}
              width={blockSide}
              height={blockSide}
              fill={THEME.text3}
            />
          );
        })}

        <polyline points={CAMERA_PATH} fill="none" stroke={THEME.text2} strokeWidth={DIAGRAM.stroke} />
        <polyline points={TARGET_PATH} fill="none" stroke={THEME.accent} strokeWidth={DIAGRAM.stroke} />
        {CAMERA.positionPoints.map(([x, , z], index) => {
          const [screenX, screenY] = toScreen(x, z);
          return (
            <g key={index}>
              <circle cx={screenX} cy={screenY} r={DIAGRAM.marker} fill={THEME.bg} stroke={THEME.text2} strokeWidth={DIAGRAM.stroke} />
              <text x={screenX + DIAGRAM.marker * plan.labelOffset} y={screenY} fill={THEME.text3} fontSize={plan.fontSize} dominantBaseline="middle" className="font-mono">
                {index + 1}
              </text>
            </g>
          );
        })}

        <line x1={cameraX} y1={cameraY} x2={targetX} y2={targetY} stroke={THEME.accent} strokeWidth={DIAGRAM.stroke} strokeDasharray={plan.dash} />
        <circle cx={targetX} cy={targetY} r={DIAGRAM.marker} fill={THEME.accent} />
        <circle cx={cameraX} cy={cameraY} r={DIAGRAM.marker + DIAGRAM.stroke} fill={THEME.text1} />
      </svg>

      <dl className="mb-6 grid grid-cols-3 gap-4 font-mono text-xs uppercase tracking-[0.2em] text-text3">
        <div>
          <dt>Высота камеры</dt>
          <dd className="mt-1 text-xl text-text1">{formatNumber(pose.position[1], 1)} м</dd>
        </div>
        <div>
          <dt>До цели</dt>
          <dd className="mt-1 text-xl text-text1">{formatNumber(distance, 1)} м</dd>
        </div>
        <div>
          <dt>Высота цели</dt>
          <dd className="mt-1 text-xl text-text1">{formatNumber(pose.target[1], 1)} м</dd>
        </div>
      </dl>
      <Slider label="Прокрутка" value={progress} display={formatNumber(progress, plan.progressDigits)} onChange={setProgress} />
    </Figure>
  );
}
