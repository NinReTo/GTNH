"use client";

import { useState } from "react";
import { DIAGRAM, SCROLL, THEME } from "@/lib/config";
import { phaseThresholds } from "@/lib/scroll";
import { Figure, Slider, formatNumber } from "./ui";

const { width, timeline } = DIAGRAM;
const TRACK = width - timeline.padding * 2;
const BAR_TOP = (timeline.height - timeline.barHeight) / 2;

function at(progress: number): number {
  return timeline.padding + progress * TRACK;
}

type Segment = {
  label: string;
  from: number;
  to: number;
  fill: string;
  opacity: number;
};

export function ScrollDiagram() {
  const [overlap, setOverlap] = useState<number>(SCROLL.overlapScreens);
  // Те же пороги, по которым живёт сцена, — только с нахлёстом с ползунка.
  const phases = phaseThresholds(overlap);

  const segments: Segment[] = [
    { label: "облёт камеры", from: 0, to: phases.transitionStart, fill: THEME.accent, opacity: 1 },
    { label: "заливка", from: phases.transitionStart, to: phases.transitionEnd, fill: THEME.text1, opacity: 1 },
    { label: "под страницей", from: phases.coverStart, to: 1, fill: THEME.line, opacity: 1 },
  ];

  return (
    <Figure caption="Шкала вызывает phaseThresholds() из lib/scroll.ts. Меняйте нахлёст: все пороги сдвигаются вместе, заливка всегда заканчивается ровно там, где страница начинает закрывать кадр.">
      <svg viewBox={`0 0 ${width} ${timeline.height}`} role="img" aria-label="Фазы прокрутки" className="w-full">
        {segments.map((segment, index) => {
          const segmentWidth = Math.max(0, at(segment.to) - at(segment.from));
          const isAbove = index % 2 === 0;
          return (
            <g key={segment.label}>
              <rect x={at(segment.from)} y={BAR_TOP} width={segmentWidth} height={timeline.barHeight} fill={segment.fill} fillOpacity={segment.opacity} />
              {segmentWidth > timeline.minLabelWidth && (
                <text
                  x={at(segment.from)}
                  y={isAbove ? BAR_TOP - timeline.labelGap : BAR_TOP + timeline.barHeight + timeline.labelGap}
                  dominantBaseline={isAbove ? "auto" : "hanging"}
                  fill={THEME.text2}
                  fontSize={timeline.fontSize}
                  className="font-mono"
                >
                  {segment.label} · {formatNumber(segment.from, timeline.digits)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <p className="mb-6 font-mono text-sm text-text2">
        1 − {formatNumber(overlap, timeline.digits)} / ({SCROLL.sceneScreens} − 1) ={" "}
        <span className="text-xl text-accent">{formatNumber(phases.coverStart, timeline.digits)}</span>
      </p>
      <Slider
        label="Нахлёст, экранов"
        value={overlap}
        max={timeline.maxOverlap}
        display={formatNumber(overlap, timeline.digits)}
        onChange={setOverlap}
      />
    </Figure>
  );
}
