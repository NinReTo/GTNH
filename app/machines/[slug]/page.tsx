import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardStageLoader } from "@/components/cards/Cards";
import { HeatCalculator } from "@/components/landing/HeatCalculator";
import { LineNav, LineSection } from "@/components/landing/LineSection";
import { MachineDiagram } from "@/components/landing/MachineDiagram";
import { FactList, SectionHeading, formatNumber } from "@/components/landing/ui";
import { GuideSection } from "@/components/landing/GuideSection";
import { MACHINE_GUIDES } from "@/lib/guides";
import { lineOf, type LineStep } from "@/lib/lines";
import { SceneSection } from "@/components/scene/SceneSection";
import { DIAGRAM, GAME } from "@/lib/config";
import { coilHeat } from "@/lib/heat";
import { MACHINES, findMachine, structureOf } from "@/lib/machines";
import { findTier } from "@/lib/tiers";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** Страницы всех машин собираются заранее: список известен заранее. */
export function generateStaticParams(): { slug: string }[] {
  return MACHINES.map((machine) => ({ slug: machine.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const machine = findMachine((await params).slug);
  if (!machine) return {};
  return { title: `${machine.name} — ${machine.title}`, description: machine.summary };
}

const prose = "mt-6 max-w-xl text-base leading-relaxed text-text2";

export default async function MachinePage({ params }: PageProps) {
  const machine = findMachine((await params).slug);
  if (!machine) notFound();

  const structure = structureOf(machine);
  const tier = findTier(machine.tier);
  const hasCoils = structure.blocks.some((block) => block.kind === "coil");
  const step: LineStep = { kind: "machine", slug: machine.slug };
  const line = lineOf(step);
  const guide = MACHINE_GUIDES[machine.slug];
  // Номера разделов по порядку: гайд и прогрессия есть не у всех машин, нагрев — только у печей с катушками.
  const order = ["story", guide && "guide", line && "line", "structure", hasCoils && "heat"].filter(Boolean);
  const indexOf = (section: string) => String(order.indexOf(section) + 1).padStart(2, "0");

  return (
    <>
      {line && <CardStageLoader />}
      <SceneSection slug={machine.slug}>
        <p className="font-mono text-xs uppercase tracking-[0.3em]" style={{ color: tier?.color }}>
          {tier?.title} · {machine.title}
        </p>
        <h1 className="mt-4 max-w-3xl font-mono text-4xl font-bold uppercase leading-none tracking-tight text-text1 sm:text-6xl">
          {machine.name}
        </h1>
        <p className="mt-6 max-w-md text-base text-text2">
          {machine.summary}
        </p>
      </SceneSection>

      <main className="relative bg-bg">
        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:px-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:py-32">
          <div>
            <SectionHeading index={indexOf("story")} kicker="Зачем" title={machine.title} />
            {machine.story.map((paragraph) => (
              <p key={paragraph} className={prose}>
                {paragraph}
              </p>
            ))}
          </div>
          <FactList facts={machine.facts} total={{ label: "Всего блоков", value: structure.blocks.length }} />
        </section>

        {guide && <GuideSection index={indexOf("guide")} title="Главное за минуту" guide={guide} />}

        {line && <LineSection index={indexOf("line")} line={line} current={step} />}

        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-24 sm:px-12 lg:py-32">
            <SectionHeading index={indexOf("structure")} kicker="Структура" title="Из чего сложена" />
            <div className="mt-12">
              <MachineDiagram slug={machine.slug} />
            </div>
          </div>
        </section>

        {hasCoils && (
          <section className="border-t border-line">
            <div className="mx-auto max-w-6xl px-6 py-24 sm:px-12 lg:py-32">
              <SectionHeading index={indexOf("heat")} kicker="Нагрев" title="Катушки решают, что можно плавить" />
              <p className={prose}>
                У каждого рецепта есть минимальная температура. Катушки из купроникеля дают{" "}
                {formatNumber(coilHeat(GAME.coils[0].ordinal))} K — хватит на сталь и алюминий. Каждый следующий ярус
                катушек добавляет ещё {GAME.coilHeatStep} K, а каждый ярус напряжения выше MV — ещё{" "}
                {GAME.heatPerVoltageTier} K.
              </p>
              <p className={prose}>
                Запас нагрева не пропадает: каждые {GAME.heatDiscountThreshold} K сверх рецепта экономят{" "}
                {formatNumber((1 - GAME.heatDiscountFactor) * DIAGRAM.calculator.percent)} % энергии, а каждые{" "}
                {formatNumber(GAME.heatOverclockThreshold)} K делают один разгон «идеальным» — вчетверо быстрее за те же
                деньги вместо вдвое.
              </p>
              <div className="mt-12">
                <HeatCalculator />
              </div>
            </div>
          </section>
        )}

        <LineNav current={step} />
      </main>
    </>
  );
}
