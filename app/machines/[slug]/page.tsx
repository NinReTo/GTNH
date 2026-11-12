import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HeatCalculator } from "@/components/landing/HeatCalculator";
import { MachineDiagram } from "@/components/landing/MachineDiagram";
import { SectionHeading, formatNumber } from "@/components/landing/ui";
import { SceneSection } from "@/components/scene/SceneSection";
import { ASSETS, DIAGRAM, GAME } from "@/lib/config";
import { coilHeat } from "@/lib/heat";
import { GROUP_TITLES, MACHINES, findMachine, structureOf } from "@/lib/machines";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** Страницы всех машин собираются заранее: список известен из lib/machines.ts. */
export function generateStaticParams(): { slug: string }[] {
  return MACHINES.map((machine) => ({ slug: machine.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const machine = findMachine((await params).slug);
  if (!machine) return {};
  return { title: `${machine.name} — ${machine.title}`, description: machine.summary };
}

const prose = "mt-6 max-w-xl text-base leading-relaxed text-text2";
const link = "text-text1 underline decoration-accent underline-offset-4 hover:text-accent";
const SOURCE_BASE = `https://github.com/GTNewHorizons/GT5-Unofficial/blob/${ASSETS.gregtechCommit}/src/main/java`;

export default async function MachinePage({ params }: PageProps) {
  const machine = findMachine((await params).slug);
  if (!machine) notFound();

  const structure = structureOf(machine);
  const index = MACHINES.indexOf(machine);
  const next = MACHINES[(index + 1) % MACHINES.length];
  const isElectric = machine.group === "electric";

  return (
    <>
      <SceneSection slug={machine.slug}>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
          {GROUP_TITLES[machine.group]} · {machine.title}
        </p>
        <h1 className="mt-4 max-w-3xl font-mono text-4xl font-bold uppercase leading-none tracking-tight text-text1 sm:text-6xl">
          {machine.name}
        </h1>
        <p className="mt-6 max-w-md text-base text-text2">
          {machine.summary} Тяните мышкой — постройка повернётся. Наведите на блоки — они раздвинутся.
        </p>
      </SceneSection>

      <main className="landing relative z-10 bg-bg">
        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:px-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:py-36">
          <div>
            <SectionHeading index="01" kicker="Зачем" title={machine.title} />
            {machine.story.map((paragraph) => (
              <p key={paragraph} className={prose}>
                {paragraph}
              </p>
            ))}
          </div>
          <dl className="self-start border border-line">
            {machine.facts.map((fact) => (
              <div key={fact.label} className="flex items-baseline justify-between gap-6 border-b border-line px-5 py-4 last:border-b-0">
                <dt className="font-mono text-xs uppercase tracking-[0.2em] text-text3">{fact.label}</dt>
                <dd className="text-right font-mono text-lg text-text1">{fact.value}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-6 px-5 py-4">
              <dt className="font-mono text-xs uppercase tracking-[0.2em] text-text3">Блоков на схеме</dt>
              <dd className="font-mono text-lg text-accent">{structure.blocks.length}</dd>
            </div>
          </dl>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-24 sm:px-12 lg:py-36">
            <SectionHeading index="02" kicker="Структура" title="Из чего сложена" />
            <p className={prose}>
              Схема взята из исходного кода мода дословно — теми же строками, какими её описали авторы. Наведите на
              строку справа, чтобы найти такие блоки в постройке.
            </p>
            <div className="mt-12">
              <MachineDiagram slug={machine.slug} />
            </div>
            <p className="mt-8 font-mono text-xs text-text3">
              Источник:{" "}
              <a className={link} href={`${SOURCE_BASE}/${machine.source}`} target="_blank" rel="noopener noreferrer">
                {machine.source.split("/").pop()}
              </a>
            </p>
          </div>
        </section>

        {isElectric && (
          <section className="border-t border-line">
            <div className="mx-auto max-w-6xl px-6 py-24 sm:px-12 lg:py-36">
              <SectionHeading index="03" kicker="Нагрев" title="Катушки решают, что можно плавить" />
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

        <nav className="border-t border-line" aria-label="Другие машины">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-16 sm:px-12">
            <Link href="/" className={`${link} font-mono text-sm uppercase tracking-[0.2em]`}>
              ← Все машины
            </Link>
            <Link href={`/machines/${next.slug}`} className="group text-right">
              <span className="block font-mono text-xs uppercase tracking-[0.2em] text-text3">Дальше</span>
              <span className="font-mono text-2xl uppercase text-text1 transition-colors group-hover:text-accent">
                {next.title} →
              </span>
            </Link>
          </div>
        </nav>
      </main>
    </>
  );
}
