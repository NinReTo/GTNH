import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CardStageLoader, StepCard } from "@/components/cards/Cards";
import { CraftLine } from "@/components/landing/CraftLine";
import { LineRow } from "@/components/landing/LineRow";
import { SectionHeading } from "@/components/landing/ui";
import { SceneSection } from "@/components/scene/SceneSection";
import { GAME } from "@/lib/config";
import { craftLinesOf } from "@/lib/crafts";
import { catalogOf, linesOf, type CatalogGroup } from "@/lib/lines";
import { LANGS, href, isLang, localize, pick, type Lang } from "@/lib/i18n";
import { TIERS, findTier } from "@/lib/tiers";

type PageProps = {
  params: Promise<{ lang: string; tier: string }>;
};

export function generateStaticParams(): { lang: string; tier: string }[] {
  return LANGS.flatMap((lang) => TIERS.map((tier) => ({ lang, tier: tier.id })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, tier: id } = await params;
  const tier = isLang(lang) ? localize(lang, findTier(id)) : undefined;
  if (!tier) return {};
  return { title: `${tier.title} — GregTech New Horizons`, description: tier.summary };
}

const prose = "mt-6 max-w-2xl text-base leading-relaxed text-text2";
const link = "text-text1 underline decoration-accent underline-offset-4 hover:text-accent";
const HINT = {
  ru: "Наведите на машину — её можно повернуть мышкой. Щелчок открывает страницу со всем, что про неё известно.",
  en: "Hover over a machine to turn it with the mouse. Click it to open a page with everything known about it.",
};

/** Группа каталога в рамке — в том же виде, что и прогрессия, только машины стоят сеткой, а не цепочкой. */
function CatalogRow({ group, color, lang }: { group: CatalogGroup; color: string; lang: Lang }) {
  return (
    <article className="border border-l-2 border-line p-5 sm:p-6" style={{ borderLeftColor: color }}>
      <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h3 className="font-mono text-lg uppercase tracking-[0.1em] text-text1">{localize(lang, group.title)}</h3>
        <p className="text-sm text-text2">{localize(lang, group.note)}</p>
      </header>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {group.steps.map((step) => (
          <li key={step.slug}>
            <StepCard step={step} />
          </li>
        ))}
      </ul>
    </article>
  );
}

export default async function TierPage({ params }: PageProps) {
  const { lang, tier: id } = await params;
  if (!isLang(lang)) notFound();
  const tier = localize(lang, findTier(id));
  if (!tier) notFound();
  const t = (ru: string, en: string) => pick(lang, ru, en);

  const lines = localize(lang, linesOf(tier.id));
  const catalog = localize(lang, catalogOf(tier.id));
  // Номера разделов по порядку: прогрессий или каталога у яруса может не быть.
  const crafts = localize(lang, craftLinesOf(tier.id));
  const order = [crafts.length > 0 && "craft", lines.length > 0 && "lines", catalog.length > 0 && "catalog"].filter(Boolean);
  const indexOf = (section: string) => String(order.indexOf(section) + 1).padStart(2, "0");

  return (
    <>
      <CardStageLoader />
      <SceneSection
        slug={tier.scene.kind === "machine" ? tier.scene.slug : undefined}
        single={tier.scene.kind === "single" ? tier.scene.slug : undefined}
      >
        <span className="block h-1 w-12" style={{ backgroundColor: tier.color }} />
        <h1 className="mt-4 font-mono text-5xl font-bold uppercase leading-none tracking-tight sm:text-7xl" style={{ color: tier.color }}>
          {tier.title}
        </h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-text2">{tier.subtitle}</p>
        <p className="mt-6 max-w-md text-base text-text2">{tier.summary}</p>
      </SceneSection>

      <main className="relative bg-bg">
        {crafts.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 pt-20 sm:px-12 lg:pt-28">
            <SectionHeading index={indexOf("craft")} kicker={tier.title} title={crafts.length > 1 ? t("Главные металлы", "Main metals") : t("Главный металл", "Main metal")} />
            <p className={prose}>
              {t(
                "Из главного металла яруса делают корпуса всех машин. Здесь — как его получить: от сырья до слитка, шаг за шагом, и в какой машине идёт каждый шаг. Число в углу ячейки — сколько штук. Наведите курсор на ячейку, чтобы увидеть название.",
                "The tier's main metal goes into the hulls of all its machines. Here is how to make it: from raw materials to the ingot, step by step, and which machine does each step. The number in the corner of a cell is how many you need. Hover over a cell to see its name.",
              )}
            </p>
            {crafts.map((craft) => (
              <div key={craft.metal} className="mt-12">
                <h3 className="font-mono text-lg uppercase tracking-[0.1em] text-text1">
                  {craft.material ? (
                    <Link href={href(lang, `/materials/${craft.material}`)} className={link}>
                      {craft.metal} — {t("как получить", "how to make it")} →
                    </Link>
                  ) : (
                    craft.metal
                  )}
                </h3>
                <CraftLine line={craft} />
              </div>
            ))}
          </section>
        )}
        {lines.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-20 sm:px-12 lg:py-28">
            <SectionHeading index={indexOf("lines")} kicker={tier.title} title={t("Прогрессия", "Progression")} />
            {lang === "ru" ? (
              <p className={prose}>
                Каждая рамка — одна работа на всё более сильных машинах, слева направо: в каком порядке их строить. У
                паровых машин сначала идёт одноблочная бронзовая: она тратит на рецепт в {GAME.steam.bronzeDuration} раза
                больше времени, чем положено. Потом стальная, «высокого давления»: работает с обычной скоростью, но ест в{" "}
                {GAME.steam.steelSteam} раза больше пара. И в конце — большая постройка, которая ведёт сразу{" "}
                {GAME.steam.multiParallel} рецептов.
              </p>
            ) : (
              <p className={prose}>
                Each frame is one job on ever stronger machines, left to right: the order to build them in. For steam
                machines the single-block bronze one comes first: it takes {GAME.steam.bronzeDuration} times longer per
                recipe than normal. Then the steel "high pressure" one: it runs at normal speed but eats{" "}
                {GAME.steam.steelSteam} times more steam. And last, the big multiblock that runs{" "}
                {GAME.steam.multiParallel} recipes at once.
              </p>
            )}
            <p className={prose}>{HINT[lang]}</p>
            <div className="mt-12 grid gap-6">
              {lines.map((line) => (
                <LineRow key={line.id} line={line} lang={lang} />
              ))}
            </div>
          </section>
        )}

        {catalog.length > 0 && (
          <section className={lines.length > 0 ? "border-t border-line" : undefined}>
            <div className="mx-auto max-w-6xl px-6 py-20 sm:px-12 lg:py-28">
              <SectionHeading index={indexOf("catalog")} kicker={tier.title} title={t("Машины", "Machines")} />
              <p className={prose}>
                {t("Всё, что открывается на этом ярусе, по назначению.", "Everything this tier unlocks, grouped by purpose.")} {HINT[lang]}
              </p>
              <div className="mt-12 grid gap-6">
                {catalog.map((group) => (
                  <CatalogRow key={group.id} group={group} color={tier.color} lang={lang} />
                ))}
              </div>
            </div>
          </section>
        )}

        <nav className="border-t border-line" aria-label={t("Другие напряжения", "Other voltages")}>
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-6 py-16 sm:px-12">
            <Link href={href(lang, "/machines")} className={`${link} font-mono text-sm uppercase tracking-[0.2em]`}>
              ← {t("Все машины", "All machines")}
            </Link>
            {TIERS.filter((other) => other.id !== tier.id).map((other) => (
              <Link
                key={other.id}
                href={href(lang, `/tiers/${other.id}`)}
                className="font-mono text-sm uppercase tracking-[0.2em] underline underline-offset-4"
                style={{ color: other.color }}
              >
                {other.title} →
              </Link>
            ))}
          </div>
        </nav>
      </main>
    </>
  );
}
