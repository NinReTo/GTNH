"use client";

import { useState } from "react";
import { DIAGRAM, GAME, THEME } from "@/lib/config";
import { Figure, formatNumber } from "./ui";

const { width, bars } = DIAGRAM;
const TIERS = GAME.voltageTiers;
const HEIGHT = TIERS.length * bars.rowHeight;
const TRACK = width - bars.labelWidth;
const MAX_LOG = Math.log(TIERS[TIERS.length - 1].voltage);

/** Шкала логарифмическая: на обычной первые ярусы были бы тоньше пикселя рядом с последним. */
function barWidth(voltage: number): number {
  return Math.max(bars.minBar, (Math.log(voltage) / MAX_LOG) * TRACK);
}

export function VoltageLadder() {
  const [selected, setSelected] = useState<number>(GAME.heatBonusBaseTier);
  const tier = TIERS[selected];
  const timesBase = GAME.voltageStep ** selected;

  return (
    <Figure caption="Наведите на ярус: каждый следующий ровно вчетверо мощнее предыдущего.">
      <svg viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label="Ярусы напряжения GregTech" className="w-full">
        {TIERS.map((candidate, index) => {
          const y = index * bars.rowHeight;
          const isSelected = index === selected;
          return (
            <g key={candidate.name} onMouseEnter={() => setSelected(index)} onClick={() => setSelected(index)} className="cursor-pointer">
              <rect x={0} y={y} width={width} height={bars.rowHeight} fill="transparent" />
              <text x={0} y={y + bars.rowHeight / 2} dominantBaseline="middle" fill={isSelected ? THEME.text1 : THEME.text2} fontSize={bars.fontSize} className="font-mono">
                {candidate.name}
              </text>
              <text x={bars.labelWidth - bars.gap} y={y + bars.rowHeight / 2} dominantBaseline="middle" textAnchor="end" fill={THEME.text3} fontSize={bars.fontSize} className="font-mono">
                {formatNumber(candidate.voltage)}
              </text>
              <rect
                x={bars.labelWidth}
                y={y + bars.gap}
                width={barWidth(candidate.voltage)}
                height={bars.rowHeight - bars.gap * 2}
                fill={index <= selected ? THEME.accent : THEME.line}
              />
            </g>
          );
        })}
      </svg>
      <p className="mt-4 font-mono text-sm text-text2">
        <span className="text-xl text-accent">{tier.name}</span> — {formatNumber(tier.voltage)} EU/t, в{" "}
        {formatNumber(timesBase)} раз выше {TIERS[0].name}
      </p>
    </Figure>
  );
}
