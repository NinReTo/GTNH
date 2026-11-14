import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardStageLoader } from "@/components/cards/Cards";
import { GuideSection } from "@/components/landing/GuideSection";
import { LineNav, LineSection } from "@/components/landing/LineSection";
import { FactList, SectionHeading } from "@/components/landing/ui";
import { SceneSection } from "@/components/scene/SceneSection";
import { lineOf, type LineStep } from "@/lib/lines";
import { SINGLES, findSingle } from "@/lib/singles";
import { findTier } from "@/lib/tiers";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** Страницы всех одноблочных машин собираются заранее. */
export function generateStaticParams(): { slug: string }[] {
  return SINGLES.map((single) => ({ slug: single.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const single = findSingle((await params).slug);
  if (!single) return {};
  return { title: `${single.name} — ${single.title}`, description: single.story[0] };
}

const prose = "mt-6 max-w-xl text-base leading-relaxed text-text2";

export default async function SinglePage({ params }: PageProps) {
  const single = findSingle((await params).slug);
  if (!single) notFound();

  const step: LineStep = { kind: "single", slug: single.slug };
  const line = lineOf(step);
  const tier = findTier(single.tier);

  return (
    <>
      <CardStageLoader />
      <SceneSection single={single.slug}>
        <p className="font-mono text-xs uppercase tracking-[0.3em]" style={{ color: tier?.color }}>
          {tier?.title} · {single.title}
        </p>
        <h1 className="mt-4 max-w-3xl font-mono text-4xl font-bold uppercase leading-none tracking-tight text-text1 sm:text-6xl">
          {single.name}
        </h1>
        <p className="mt-6 max-w-md text-base text-text2">
          {single.title} — {single.does}.
        </p>
      </SceneSection>

      <main className="relative bg-bg">
        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:px-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:py-32">
          <div>
            <SectionHeading index="01" kicker="Зачем" title={single.title} />
            {single.story.map((paragraph) => (
              <p key={paragraph} className={prose}>
                {paragraph}
              </p>
            ))}
          </div>
          <FactList facts={single.facts} />
        </section>

        <GuideSection index="02" title="Главное за минуту" guide={single.guide} />
        {line && <LineSection index="03" line={line} current={step} />}
        <LineNav current={step} />
      </main>
    </>
  );
}
