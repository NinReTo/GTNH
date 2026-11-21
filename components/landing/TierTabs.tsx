"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/config";
import { LANGS, href, pick } from "@/lib/lang";
import { findSingle } from "@/lib/singles";
import { findMachine } from "@/lib/machines";
import { TIERS, type TierId } from "@/lib/tiers";
import { useLang } from "@/lib/use-lang";

const TAB = "flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors";
/** Открытая вкладка: жирный текст, черта снизу — цвета эры (задаётся отдельно). */
const TAB_ACTIVE = TAB + " font-semibold text-text1";
/** Остальные: без черты, под мышкой — серая черта, как на GitHub. */
const TAB_IDLE = TAB + " border-transparent text-text2 hover:border-line hover:text-text1";

/** Разделы сайта в верхней строке. К «Машинам» относятся и страницы эр, машин и материалов — там видны вкладки эр. */
const SECTIONS = [
  { path: "/machines", ru: "Машины", en: "Machines", pages: ["/machines", "/tiers", "/singles", "/materials"] },
  { path: "/calculator", ru: "Калькулятор", en: "Calculator", pages: ["/calculator"] },
] as const;

const isIn = (path: string, pages: readonly string[]): boolean => pages.some((page) => path === page || path.startsWith(`${page}/`));
const SECTION = "border px-3 py-1 transition-colors";
const SECTION_ACTIVE = SECTION + " border-accent text-accent";
const SECTION_IDLE = SECTION + " border-transparent text-text2 hover:border-line hover:text-text1";

/** Адрес страницы без языка: «/en/machines/x» → «/machines/x». */
export function pagePath(pathname: string): string {
  const rest = pathname.split("/").slice(2).join("/");
  return `/${rest}`;
}

/** Какая эра открыта: страница эры или страница машины этой эры. На главной — никакая. */
export function activeTier(pathname: string): TierId | null {
  const [, section, slug] = pathname.split("/");
  if (section === "tiers") return TIERS.find((tier) => tier.id === slug)?.id ?? null;
  if (section === "machines") return findMachine(slug ?? "")?.tier ?? null;
  if (section === "singles") return findSingle(slug ?? "")?.tier ?? null;
  return null;
}

/**
 * Верхняя полоса сайта, как у GitHub: название, калькулятор и язык, под ними вкладки эр со значками.
 * У открытой вкладки снизу черта цвета её эры. Названия эр (Steam, LV, MV…) одинаковы в обоих языках.
 */
export function TierTabs() {
  const lang = useLang();
  const path = pagePath(usePathname());
  const active = activeTier(path);
  const isMachines = isIn(path, SECTIONS[0].pages);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className={isMachines ? "flex items-center gap-6 pt-3 font-mono text-sm" : "flex items-center gap-6 py-3 font-mono text-sm"}>
          <Link href={href(lang, "/")} className="shrink-0 font-bold uppercase tracking-[0.15em] text-text1 hover:text-accent">
            GT New Horizons
          </Link>
          <nav aria-label={pick(lang, "Разделы", "Sections")} className="flex gap-1">
            {SECTIONS.map((section) => {
              const isActive = isIn(path, section.pages);
              return (
                <Link
                  key={section.path}
                  href={href(lang, section.path)}
                  aria-current={isActive ? "page" : undefined}
                  className={isActive ? SECTION_ACTIVE : SECTION_IDLE}
                >
                  {pick(lang, section.ru, section.en)}
                </Link>
              );
            })}
          </nav>
          <nav aria-label={pick(lang, "Язык", "Language")} className="ml-auto flex border border-line text-xs uppercase">
            {LANGS.map((other) => (
              <Link
                key={other}
                href={href(other, path)}
                hrefLang={other}
                aria-current={other === lang ? "true" : undefined}
                className={other === lang ? "bg-text1 px-2 py-1 font-bold text-bg" : "px-2 py-1 text-text3 transition-colors hover:text-text1"}
              >
                {other}
              </Link>
            ))}
          </nav>
        </div>
        {isMachines && (
        <nav aria-label={pick(lang, "Эры", "Eras")} className="-mb-px mt-2 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TIERS.map((tier) => {
            const isActive = tier.id === active;
            return (
              <Link
                key={tier.id}
                href={href(lang, `/tiers/${tier.id}`)}
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
              </Link>
            );
          })}
        </nav>
        )}
      </div>
    </header>
  );
}
