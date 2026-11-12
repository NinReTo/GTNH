"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { HERO } from "@/lib/config";
import type { Tier } from "@/lib/tiers";

const Scene = dynamic(() => import("@/components/scene/Scene"), { ssr: false });
const Workshop = dynamic(() => import("@/components/scene/Workshop"), { ssr: false });

/**
 * Мини-шапка яруса напряжения: широкая полоса с живой сценой, как большая
 * шапка (мышкой вертится, блоки у курсора раздвигаются), и вход на страницу яруса.
 */
export function TierBanner({ tier }: { tier: Tier }) {
  const href = `/tiers/${tier.id}`;
  return (
    <article className="relative overflow-hidden border border-line" style={{ aspectRatio: HERO.bannerAspect }}>
      {tier.scene.kind === "workshop" ? (
        <Workshop aspect={HERO.bannerAspect} isBanner />
      ) : (
        <Scene slug={tier.scene.slug} aspect={HERO.bannerAspect} />
      )}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex w-full max-w-md flex-col justify-end bg-gradient-to-r from-bg via-bg/80 to-transparent p-6 sm:p-10">
        <span className="block h-1 w-12" style={{ backgroundColor: tier.color }} />
        <h3 className="mt-4 font-mono text-5xl font-bold uppercase leading-none" style={{ color: tier.color }}>
          {tier.title}
        </h3>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-text2">{tier.subtitle}</p>
        <p className="mt-4 text-sm leading-relaxed text-text2">{tier.summary}</p>
        <Link
          href={href}
          className="pointer-events-auto mt-6 inline-block self-start border px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] transition-colors hover:bg-text1 hover:text-bg"
          style={{ borderColor: tier.color, color: tier.color }}
        >
          Открыть {tier.title} →
        </Link>
      </div>
    </article>
  );
}
