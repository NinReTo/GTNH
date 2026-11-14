import { Fragment } from "react";
import { StepCard } from "@/components/cards/Cards";
import { isSameStep, stepLabel, type Line, type LineStep } from "@/lib/lines";
import { findTier } from "@/lib/tiers";

type LineRowProps = {
  line: Line;
  /** Машина, на странице которой стоит линейка: её карточка подсвечена. */
  current?: LineStep;
};

/**
 * Линейка в рамке: одна и та же работа на всё более сильных машинах —
 * слева направо, от первой машины к большой постройке. Цветная полоса слева —
 * цвет яруса напряжения.
 */
export function LineRow({ line, current }: LineRowProps) {
  const color = findTier(line.tier)?.color;
  return (
    <article className="border border-l-2 border-line p-5 sm:p-6" style={{ borderLeftColor: color }}>
      <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h3 className="font-mono text-lg uppercase tracking-[0.1em] text-text1">{line.title}</h3>
        <p className="text-sm text-text2">{line.does}</p>
      </header>
      <ol className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {line.steps.map((step, index) => {
          const isCurrent = current !== undefined && isSameStep(step, current);
          return (
            <Fragment key={index}>
              {index > 0 && (
                <li aria-hidden className="text-center font-mono text-lg text-text3">
                  <span className="sm:hidden">↓</span>
                  <span className="hidden sm:inline">→</span>
                </li>
              )}
              <li className="mx-auto w-full max-w-52 sm:mx-0 sm:flex-1">
                <p className="mb-2 flex justify-between gap-2 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.2em] text-text3">
                  <span>
                    {index + 1} · {stepLabel(step)}
                  </span>
                  {isCurrent && <span className="text-accent">вы здесь</span>}
                </p>
                <StepCard step={step} isCurrent={isCurrent} />
              </li>
            </Fragment>
          );
        })}
      </ol>
    </article>
  );
}
