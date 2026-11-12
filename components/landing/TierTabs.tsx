"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/config";
import { findMachine } from "@/lib/machines";
import { TIERS, type TierId } from "@/lib/tiers";

const TAB = "flex items-center gap-2 border-b-2 px-3 py-2 text-sm transition-colors";
/** Открытая вкладка: жирный текст, черта снизу — цвета эры (задаётся отдельно). */
const TAB_ACTIVE = TAB + " font-semibold text-text1";
/** Остальные: без черты, под мышкой — серая черта, как на GitHub. */
const TAB_IDLE = TAB + " border-transparent text-text2 hover:border-line hover:text-text1";

/** Какая эра открыта: страница эры или страница машины этой эры. На главной — никакая. */
export function activeTier(pathname: string): TierId | null {
  const [, section, slug] = pathname.split("/");
  if (section === "tiers") return TIERS.find((tier) => tier.id === slug)?.id ?? null;
  if (section === "machines") return findMachine(slug ?? "")?.tier ?? null;
  return null;
}

/**
 * Верхняя полоса сайта, как у GitHub: название, под ним вкладки эр со значками.
 * У открытой вкладки снизу черта цвета её эры.
 */
export function TierTabs() {
  const pathname = usePathname();
  const active = activeTier(pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <Link href="/" className="inline-block pt-3 font-mono text-sm text-text1 hover:text-accent">
          <span className="text-text3">GT New Horizons /</span> <span className="font-bold">Машины</span>
        </Link>
        <nav aria-label="Эры" className="-mb-px mt-2 flex gap-1 overflow-x-auto">
          {TIERS.map((tier) => {
            const isActive = tier.id === active;
            return (
              <Link
                key={tier.id}
                href={`/tiers/${tier.id}`}
                aria-current={isActive ? "page" : undefined}
                className={isActive ? TAB_ACTIVE : TAB_IDLE}
                style={isActive ? { borderColor: tier.color } : undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- значок 16×16 из текстур мода, сглаживать нельзя */}
                <img
                  src={`/textures/gregtech/${tier.icon}.webp`}
                  alt=""
                  width={NAV.iconSize}
                  height={NAV.iconSize}
                  className="pixelated"
                />
                <span>{tier.title}</span>
                <span className="rounded-full bg-line px-2 font-mono text-[11px] text-text2">{tier.subtitle}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
