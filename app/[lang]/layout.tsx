import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { HERO, THEME } from "@/lib/config";
import { LANGS, isLang, pick } from "@/lib/i18n";
import { TierTabs } from "@/components/landing/TierTabs";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "cyrillic"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "cyrillic"] });

/** Обе версии сайта собираются заранее. */
export function generateStaticParams(): { lang: string }[] {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return {
    title: pick(lang, "Машины GregTech New Horizons — Minecraft 1.7.10", "GregTech New Horizons machines — Minecraft 1.7.10"),
    description: pick(
      lang,
      "Машины мода GregTech в сборке GT New Horizons по ярусам напряжения: трёхмерные постройки из настоящих блоков, разобранные по блокам.",
      "GregTech machines of the GT New Horizons modpack by voltage tier: 3D multiblocks built from the real mod blocks, taken apart block by block.",
    ),
  };
}

/**
 * Цвета темы и высота шапки уходят в CSS одной пачкой переменных —
 * прямо из lib/config.ts. Так у страницы и у шейдера перехода один источник цвета.
 */
const themeVariables = {
  "--bg": THEME.bg,
  "--text1": THEME.text1,
  "--text2": THEME.text2,
  "--text3": THEME.text3,
  "--accent": THEME.accent,
  "--line": THEME.line,
  "--hero-screens": HERO.screens,
} as CSSProperties;

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html lang={lang} className={`${geistSans.variable} ${geistMono.variable} antialiased`} style={themeVariables}>
      <body>
        <TierTabs />
        {children}
      </body>
    </html>
  );
}
