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
import { LANGS, isLang, localize, pick, type Lang } from "@/lib/i18n";
import { MACHINES, findMachine, structureOf } from "@/lib/machines";
import { findTier } from "@/lib/tiers";

type PageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

/** Страницы всех машин собираются заранее: список известен заранее. */
export function generateStaticParams(): { lang: string; slug: string }[] {
  return LANGS.flatMap((lang) => MACHINES.map((machine) => ({ lang, slug: machine.slug })));
}

/** Машина на языке страницы: на русской — русское название из игры, на английской — английское. */
function machineFor(lang: Lang, slug: string) {
  const machine = findMachine(slug);
  return machine && localize(lang, machine);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const machine = machineFor(lang, slug);
  if (!machine) return {};
  return { title: lang === "ru" ? `${machine.name} — ${machine.title}` : machine.name, description: machine.summary };
}

const prose = "mt-6 max-w-xl text-base leading-relaxed text-text2";

export default async function MachinePage({ params }: PageProps) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const machine = machineFor(lang, slug);
  if (!machine) notFound();

  const structure = structureOf(machine);
  const tier = localize(lang, findTier(machine.tier));
  const hasCoils = structure.blocks.some((block) => block.kind === "coil");
  const step: LineStep = { kind: "machine", slug: machine.slug };
  const line = localize(lang, lineOf(step));
  const guide = localize(lang, MACHINE_GUIDES[machine.slug]);
  // Номера разделов по порядку: гайд и прогрессия есть не у всех машин, нагрев — только у печей с катушками.
  const order = ["story", guide && "guide", line && "line", "structure", hasCoils && "heat"].filter(Boolean);
  const indexOf = (section: string) => String(order.indexOf(section) + 1).padStart(2, "0");
  const t = (ru: string, en: string) => pick(lang, ru, en);

  return (
    <>
      {line && <CardStageLoader />}
      <SceneSection slug={machine.slug}>
        <p className="font-mono text-xs uppercase tracking-[0.3em]" style={{ color: tier?.color }}>
          {tier?.title}
          {lang === "ru" && ` · ${machine.title}`}
        </p>
        <h1 className="mt-4 max-w-3xl font-mono text-4xl font-bold uppercase leading-none tracking-tight text-text1 sm:text-6xl">
          {lang === "ru" ? machine.title : machine.name}
        </h1>
        <p className="mt-6 max-w-md text-base text-text2">
          {machine.summary}
        </p>
      </SceneSection>

      <main className="relative bg-bg">
        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:px-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:py-32">
          <div>
            <SectionHeading index={indexOf("story")} kicker={t("Зачем", "Why")} title={lang === "ru" ? machine.title : machine.name} />
            {machine.story.map((paragraph) => (
              <p key={paragraph} className={prose}>
                {paragraph}
              </p>
            ))}
          </div>
          <FactList facts={machine.facts} total={{ label: t("Всего блоков", "Total blocks"), value: structure.blocks.length }} />
        </section>

        {guide && <GuideSection index={indexOf("guide")} title={t("Главное за минуту", "The key points in a minute")} guide={guide} lang={lang} />}

        {line && <LineSection index={indexOf("line")} line={line} current={step} lang={lang} />}

        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-24 sm:px-12 lg:py-32">
            <SectionHeading index={indexOf("structure")} kicker={t("Структура", "Structure")} title={t("Из чего сложена", "What it is built from")} />
            <div className="mt-12">
              <MachineDiagram slug={machine.slug} />
            </div>
          </div>
        </section>

        {hasCoils && (
          <section className="border-t border-line">
            <div className="mx-auto max-w-6xl px-6 py-24 sm:px-12 lg:py-32">
              <SectionHeading
                index={indexOf("heat")}
                kicker={t("Нагрев", "Heat")}
                title={t("Катушки решают, что можно плавить", "Coils decide what you can smelt")}
              />
              {lang === "ru" ? (
                <>
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
                </>
              ) : (
                <>
                  <p className={prose}>
                    Every recipe has a minimum temperature. Cupronickel coils give{" "}
                    {coilHeat(GAME.coils[0].ordinal).toLocaleString("en-US")} K — enough for steel and aluminium. Each next coil
                    tier adds another {GAME.coilHeatStep} K, and each voltage tier above MV adds {GAME.heatPerVoltageTier} K more.
                  </p>
                  <p className={prose}>
                    Spare heat is not wasted: every {GAME.heatDiscountThreshold} K above the recipe saves{" "}
                    {((1 - GAME.heatDiscountFactor) * DIAGRAM.calculator.percent).toLocaleString("en-US")} % of the energy, and every{" "}
                    {GAME.heatOverclockThreshold.toLocaleString("en-US")} K makes one overclock "perfect" — four times faster for the
                    same energy instead of twice.
                  </p>
                </>
              )}
              <div className="mt-12">
                <HeatCalculator />
              </div>
            </div>
          </section>
        )}

        <LineNav current={step} lang={lang} />
      </main>
    </>
  );
}
