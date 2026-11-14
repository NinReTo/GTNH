import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CardStageLoader, StepCard } from "@/components/cards/Cards";
import { LineRow } from "@/components/landing/LineRow";
import { SectionHeading } from "@/components/landing/ui";
import { SceneSection } from "@/components/scene/SceneSection";
import { GAME } from "@/lib/config";
import { catalogOf, linesOf, type CatalogGroup } from "@/lib/lines";
import { TIERS, findTier } from "@/lib/tiers";

type PageProps = {
  params: Promise<{ tier: string }>;
};

export function generateStaticParams(): { tier: string }[] {
  return TIERS.map((tier) => ({ tier: tier.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const tier = findTier((await params).tier);
  if (!tier) return {};
  return { title: `${tier.title} — GregTech New Horizons`, description: tier.summary };
}

const prose = "mt-6 max-w-2xl text-base leading-relaxed text-text2";
const link = "text-text1 underline decoration-accent underline-offset-4 hover:text-accent";
const HINT = "Наведите на машину — её можно повернуть мышкой. Щелчок открывает страницу со всем, что про неё известно.";

/** Группа каталога в рамке — в том же виде, что и прогрессия, только машины стоят сеткой, а не цепочкой. */
function CatalogRow({ group, color }: { group: CatalogGroup; color: string }) {
  return (
    <article className="border border-l-2 border-line p-5 sm:p-6" style={{ borderLeftColor: color }}>
      <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h3 className="font-mono text-lg uppercase tracking-[0.1em] text-text1">{group.title}</h3>
        <p className="text-sm text-text2">{group.note}</p>
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
  const tier = findTier((await params).tier);
  if (!tier) notFound();

  const lines = linesOf(tier.id);
  const catalog = catalogOf(tier.id);
  // Номера разделов по порядку: прогрессий или каталога у яруса может не быть.
  const order = [lines.length > 0 && "lines", catalog.length > 0 && "catalog"].filter(Boolean);
  const indexOf = (section: string) => String(order.indexOf(section) + 1).padStart(2, "0");

  return (
    <>
      <CardStageLoader />
      <SceneSection slug={tier.scene.kind === "machine" ? tier.scene.slug : undefined}>
        <span className="block h-1 w-12" style={{ backgroundColor: tier.color }} />
        <h1 className="mt-4 font-mono text-5xl font-bold uppercase leading-none tracking-tight sm:text-7xl" style={{ color: tier.color }}>
          {tier.title}
        </h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-text2">{tier.subtitle}</p>
        <p className="mt-6 max-w-md text-base text-text2">{tier.summary}</p>
      </SceneSection>

      <main className="relative bg-bg">
        {lines.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-20 sm:px-12 lg:py-28">
            <SectionHeading index={indexOf("lines")} kicker={tier.title} title="Прогрессия" />
            <p className={prose}>
              Каждая рамка — одна работа на всё более сильных машинах, слева направо: в каком порядке их строить. У
              паровых машин сначала идёт одноблочная бронзовая: она тратит на рецепт в {GAME.steam.bronzeDuration} раза
              больше времени, чем положено. Потом стальная, «высокого давления»: работает с обычной скоростью, но ест в{" "}
              {GAME.steam.steelSteam} раза больше пара. И в конце — большая постройка, которая ведёт сразу{" "}
              {GAME.steam.multiParallel} рецептов.
            </p>
            <p className={prose}>{HINT}</p>
            <div className="mt-12 grid gap-6">
              {lines.map((line) => (
                <LineRow key={line.id} line={line} />
              ))}
            </div>
          </section>
        )}

        {catalog.length > 0 && (
          <section className={lines.length > 0 ? "border-t border-line" : undefined}>
            <div className="mx-auto max-w-6xl px-6 py-20 sm:px-12 lg:py-28">
              <SectionHeading index={indexOf("catalog")} kicker={tier.title} title="Машины" />
              <p className={prose}>
                Всё, что открывается на этом ярусе, по назначению. {HINT}
              </p>
              <div className="mt-12 grid gap-6">
                {catalog.map((group) => (
                  <CatalogRow key={group.id} group={group} color={tier.color} />
                ))}
              </div>
            </div>
          </section>
        )}

        <nav className="border-t border-line" aria-label="Другие напряжения">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-6 py-16 sm:px-12">
            <Link href="/" className={`${link} font-mono text-sm uppercase tracking-[0.2em]`}>
              ← На главную
            </Link>
            {TIERS.filter((other) => other.id !== tier.id).map((other) => (
              <Link
                key={other.id}
                href={`/tiers/${other.id}`}
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
