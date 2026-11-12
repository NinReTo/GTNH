"use client";

import { useRef, type PointerEvent } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { HERO, ICON } from "@/lib/config";
import type { Tier } from "@/lib/tiers";

const Scene = dynamic(() => import("@/components/scene/Scene"), { ssr: false });
const Workshop = dynamic(() => import("@/components/scene/Workshop"), { ssr: false });

/**
 * Мини-шапка яруса напряжения: маленькая живая сцена, как большая шапка
 * (мышкой вертится, блоки у курсора раздвигаются). Щелчок без поворота —
 * переход на страницу яруса.
 */
export function TierBanner({ tier }: { tier: Tier }) {
  const router = useRouter();
  const press = useRef<readonly [number, number] | null>(null);
  const href = `/tiers/${tier.id}`;

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    press.current = [event.clientX, event.clientY];
  };
  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    const start = press.current;
    press.current = null;
    if (!start) return;
    if (Math.hypot(event.clientX - start[0], event.clientY - start[1]) <= ICON.clickSlop) router.push(href);
  };

  return (
    <article
      className="group relative overflow-hidden border border-line bg-bg transition-colors hover:border-text3"
      style={{ aspectRatio: HERO.bannerAspect }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {tier.scene.kind === "workshop" ? (
        <Workshop aspect={HERO.bannerAspect} isBanner />
      ) : (
        <Scene slug={tier.scene.slug} aspect={HERO.bannerAspect} />
      )}
      <a
        href={href}
        className="pointer-events-auto absolute bottom-0 left-0 flex items-baseline gap-2 bg-gradient-to-r from-bg via-bg/80 to-transparent py-2 pl-3 pr-8"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.preventDefault();
          router.push(href);
        }}
      >
        <span className="block h-3 w-1" style={{ backgroundColor: tier.color }} />
        <span className="font-mono text-lg font-bold uppercase leading-none" style={{ color: tier.color }}>
          {tier.title}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text2">{tier.subtitle}</span>
      </a>
    </article>
  );
}
