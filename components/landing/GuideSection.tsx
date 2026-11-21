import { SectionHeading } from "@/components/landing/ui";
import { wikiUrl, type Guide } from "@/lib/guides";
import { pick, type Lang } from "@/lib/i18n";

const link = "text-text1 underline decoration-accent underline-offset-4 hover:text-accent";

/**
 * Гайд по машине: главное со страницы вики GT New Horizons, сжатое до
 * нескольких советов. Каждый совет — в своей ячейке с номером.
 */
export function GuideSection({ index, title, guide, lang }: { index: string; title: string; guide: Guide; lang: Lang }) {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-12 lg:py-32">
        <SectionHeading index={index} kicker={pick(lang, "Гайд", "Guide")} title={title} />
        <ol className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {guide.tips.map((tip, position) => (
            <li key={tip.title} className="bg-bg p-6">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                {String(position + 1).padStart(2, "0")} · {tip.title}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-text2">{tip.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-text3">
          {pick(lang, "Подробнее —", "More —")}{" "}
          <a href={wikiUrl(guide.wiki)} target="_blank" rel="noopener noreferrer" className={link}>
            {guide.wiki} {pick(lang, "на вики GTNH", "on the GTNH wiki")}
          </a>
        </p>
      </div>
    </section>
  );
}
