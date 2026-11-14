import Link from "next/link";
import { LineRow } from "@/components/landing/LineRow";
import { SectionHeading } from "@/components/landing/ui";
import { nextStep, stepHref, stepTier, stepTitle, type Line, type LineStep } from "@/lib/lines";
import { findTier } from "@/lib/tiers";

/** Раздел страницы машины: её прогрессия, сама машина подсвечена. */
export function LineSection({ index, line, current }: { index: string; line: Line; current: LineStep }) {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-12 lg:py-32">
        <SectionHeading index={index} kicker="Прогрессия" title={line.title} />
        <div className="mt-12">
          <LineRow line={line} current={current} />
        </div>
      </div>
    </section>
  );
}

const link = "text-text1 underline decoration-accent underline-offset-4 hover:text-accent";

/** Низ страницы машины: назад к ярусу и дальше — к следующей машине на его странице. */
export function LineNav({ current }: { current: LineStep }) {
  const tierId = stepTier(current);
  const tier = tierId ? findTier(tierId) : undefined;
  const next = nextStep(current);
  return (
    <nav className="border-t border-line" aria-label="Другие машины">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-16 sm:px-12">
        <Link href={tier ? `/tiers/${tier.id}` : "/"} className={`${link} font-mono text-sm uppercase tracking-[0.2em]`}>
          ← {tier ? `Все машины: ${tier.title}` : "На главную"}
        </Link>
        {next && (
          <Link href={stepHref(next)} className="group text-right">
            <span className="block font-mono text-xs uppercase tracking-[0.2em] text-text3">Дальше</span>
            <span className="font-mono text-2xl uppercase text-text1 transition-colors group-hover:text-accent">
              {stepTitle(next)} →
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
