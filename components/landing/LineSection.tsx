import Link from "next/link";
import { LineRow } from "@/components/landing/LineRow";
import { SectionHeading } from "@/components/landing/ui";
import { href, pick, tr, type Lang } from "@/lib/i18n";
import { nextStep, stepHref, stepTier, stepTitle, type Line, type LineStep } from "@/lib/lines";
import { findTier } from "@/lib/tiers";

/** Раздел страницы машины: её прогрессия, сама машина подсвечена. */
export function LineSection({ index, line, current, lang }: { index: string; line: Line; current: LineStep; lang: Lang }) {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-12 lg:py-32">
        <SectionHeading index={index} kicker={pick(lang, "Прогрессия", "Progression")} title={tr(lang, line.title)} />
        <div className="mt-12">
          <LineRow line={line} current={current} lang={lang} />
        </div>
      </div>
    </section>
  );
}

const link = "text-text1 underline decoration-accent underline-offset-4 hover:text-accent";

/** Низ страницы машины: назад к ярусу и дальше — к следующей машине на его странице. */
export function LineNav({ current, lang }: { current: LineStep; lang: Lang }) {
  const tierId = stepTier(current);
  const tier = tierId ? findTier(tierId) : undefined;
  const next = nextStep(current);
  return (
    <nav className="border-t border-line" aria-label={pick(lang, "Другие машины", "Other machines")}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-16 sm:px-12">
        <Link href={href(lang, tier ? `/tiers/${tier.id}` : "/")} className={`${link} font-mono text-sm uppercase tracking-[0.2em]`}>
          ← {tier ? pick(lang, `Все машины: ${tier.title}`, `All machines: ${tier.title}`) : pick(lang, "На главную", "Home")}
        </Link>
        {next && (
          <Link href={href(lang, stepHref(next))} className="group text-right">
            <span className="block font-mono text-xs uppercase tracking-[0.2em] text-text3">{pick(lang, "Дальше", "Next")}</span>
            <span className="font-mono text-2xl uppercase text-text1 transition-colors group-hover:text-accent">
              {stepTitle(next, lang)} →
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
