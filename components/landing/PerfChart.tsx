import { DIAGRAM, PERF, THEME } from "@/lib/config";
import { perfRows } from "@/lib/perf";
import { Figure, formatNumber } from "./ui";

const { width, bars } = DIAGRAM;
const TRACK = width - bars.labelWidth - bars.valueWidth;

/** Замеры из lib/config.ts. Пока их нет — честно пишем, что не измерено, а не рисуем выдуманные столбики. */
export function PerfChart() {
  const rows = perfRows();
  if (!rows) {
    return (
      <Figure caption="Замеры ещё не внесены в lib/config.ts (PERF.measured).">
        <p className="font-mono text-sm text-text2">Не измерено. Как измерить — в README, раздел «Как повторить замеры».</p>
      </Figure>
    );
  }

  const scaleMax = Math.max(PERF.frameBudgetMs, ...rows.map((row) => row.ms));
  const height = rows.length * bars.rowHeight;
  const budgetX = bars.labelWidth + (PERF.frameBudgetMs / scaleMax) * TRACK;

  return (
    <Figure caption={`${PERF.measured.conditions} Пунктир — бюджет кадра при 60 Гц.`}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Время кадра в миллисекундах" className="w-full">
        {rows.map((row, index) => {
          const y = index * bars.rowHeight;
          const barWidth = Math.max(bars.minBar, (Math.max(0, row.ms) / scaleMax) * TRACK);
          return (
            <g key={row.label}>
              <text x={0} y={y + bars.rowHeight / 2} dominantBaseline="middle" fill={row.isTotal ? THEME.text1 : THEME.text2} fontSize={bars.fontSize}>
                {row.label}
              </text>
              <rect x={bars.labelWidth} y={y + bars.gap} width={barWidth} height={bars.rowHeight - bars.gap * 2} fill={row.isTotal ? THEME.text3 : THEME.accent} />
              <text x={bars.labelWidth + barWidth + bars.gap} y={y + bars.rowHeight / 2} dominantBaseline="middle" fill={THEME.text1} fontSize={bars.fontSize} className="font-mono">
                {formatNumber(row.ms, 1)} мс
              </text>
            </g>
          );
        })}
        <line x1={budgetX} y1={0} x2={budgetX} y2={height} stroke={THEME.text2} strokeWidth={DIAGRAM.stroke} strokeDasharray={DIAGRAM.plan.dash} />
      </svg>
    </Figure>
  );
}
