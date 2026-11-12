import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CardStageLoader, MachineCard, SingleCard } from "@/components/cards/Cards";
import { SectionHeading } from "@/components/landing/ui";
import { SceneSection } from "@/components/scene/SceneSection";
import { GAME } from "@/lib/config";
import { MACHINES, SINGLE_BLOCKS, STEAM_TIERS } from "@/lib/machines";
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
const grid = "mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4";

export default async function TierPage({ params }: PageProps) {
  const tier = findTier((await params).tier);
  if (!tier) notFound();

  const machines = MACHINES.filter((machine) => machine.tier === tier.id);
  const isSteam = tier.id === "steam";

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
        <section className="mx-auto max-w-6xl px-6 py-20 sm:px-12 lg:py-28">
          <SectionHeading index="01" kicker={tier.title} title="Постройки" />
          <p className={prose}>
            Наведите на постройку — её можно повернуть мышкой, а блоки у курсора раздвинутся. Щелчок открывает страницу
            постройки.
          </p>
          <div className={grid}>
            {machines.map((machine) => (
              <MachineCard key={machine.slug} slug={machine.slug} />
            ))}
          </div>
        </section>

        {isSteam && (
          <section className="border-t border-line">
            <div className="mx-auto max-w-6xl px-6 py-20 sm:px-12 lg:py-28">
              <SectionHeading index="02" kicker={tier.title} title="Одноблочные машины" />
              <p className={prose}>
                До больших построек каждая машина — один блок, в двух версиях. Бронзовая тратит на рецепт в{" "}
                {GAME.steam.bronzeDuration} раза больше времени, чем положено. Стальная, «высокого давления», работает с
                обычной скоростью, но ест в {GAME.steam.steelSteam} раза больше пара. Большая постройка того же назначения
                ведёт сразу {GAME.steam.multiParallel} рецептов.
              </p>
              <div className="mt-12 grid gap-10">
                {SINGLE_BLOCKS.map((single) => (
                  <div key={single.id} className="grid items-start gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                    <div>
                      <h3 className="font-mono text-lg uppercase tracking-[0.1em] text-text1">{single.title}</h3>
                      <p className="mt-1 text-sm text-text2">{single.does}</p>
                      {single.multiSlug && (
                        <Link href={`/machines/${single.multiSlug}`} className={`${link} mt-3 inline-block font-mono text-xs uppercase tracking-[0.2em]`}>
                          Большая постройка →
                        </Link>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:max-w-md">
                      {STEAM_TIERS.map((steamTier) => (
                        <SingleCard key={steamTier} id={single.id} tier={steamTier} hull={single.hull} title={single.title} />
                      ))}
                    </div>
                  </div>
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
