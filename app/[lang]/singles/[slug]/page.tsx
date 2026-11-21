import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardStageLoader } from "@/components/cards/Cards";
import { GuideSection } from "@/components/landing/GuideSection";
import { LineNav, LineSection } from "@/components/landing/LineSection";
import { FactList, SectionHeading } from "@/components/landing/ui";
import { SceneSection } from "@/components/scene/SceneSection";
import { LANGS, isLang, localize, pick, type Lang } from "@/lib/i18n";
import { lineOf, type LineStep } from "@/lib/lines";
import { SINGLES, findSingle } from "@/lib/singles";
import { findTier } from "@/lib/tiers";

type PageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

/** Страницы всех одноблочных машин собираются заранее. */
export function generateStaticParams(): { lang: string; slug: string }[] {
  return LANGS.flatMap((lang) => SINGLES.map((single) => ({ lang, slug: single.slug })));
}

function singleFor(lang: Lang, slug: string) {
  const single = findSingle(slug);
  return single && localize(lang, single);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const single = singleFor(lang, slug);
  if (!single) return {};
  return { title: lang === "ru" ? `${single.title} — ${single.name}` : single.name, description: single.story[0] };
}

const prose = "mt-6 max-w-xl text-base leading-relaxed text-text2";

export default async function SinglePage({ params }: PageProps) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const single = singleFor(lang, slug);
  if (!single) notFound();

  const step: LineStep = { kind: "single", slug: single.slug };
  const line = localize(lang, lineOf(step));
  const tier = localize(lang, findTier(single.tier));
  const heading = lang === "ru" ? single.title : single.name;

  return (
    <>
      <CardStageLoader />
      <SceneSection single={single.slug}>
        <p className="font-mono text-xs uppercase tracking-[0.3em]" style={{ color: tier?.color }}>
          {tier?.title}
          {lang === "ru" && ` · ${single.name}`}
        </p>
        <h1 className="mt-4 max-w-3xl font-mono text-4xl font-bold uppercase leading-none tracking-tight text-text1 sm:text-6xl">
          {heading}
        </h1>
        <p className="mt-6 max-w-md text-base text-text2">
          {heading} — {single.does}.
        </p>
      </SceneSection>

      <main className="relative bg-bg">
        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:px-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:py-32">
          <div>
            <SectionHeading index="01" kicker={pick(lang, "Зачем", "Why")} title={heading} />
            {single.story.map((paragraph) => (
              <p key={paragraph} className={prose}>
                {paragraph}
              </p>
            ))}
          </div>
          <FactList facts={single.facts} />
        </section>

        <GuideSection index="02" title={pick(lang, "Главное за минуту", "The key points in a minute")} guide={single.guide} lang={lang} />
        {line && <LineSection index="03" line={line} current={step} lang={lang} />}
        <LineNav current={step} lang={lang} />
      </main>
    </>
  );
}
