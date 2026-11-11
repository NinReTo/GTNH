import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SCROLL, THEME } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "cyrillic"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Electric Blast Furnace — GregTech для Minecraft 1.7.10",
  description:
    "Электрическая доменная печь из мода GregTech, разобранная по блокам: из чего сложена, как греется и зачем нужна.",
};

/**
 * Цвета темы и размеры блока сцены уходят в CSS одной пачкой переменных —
 * прямо из lib/config.ts. Так у страницы и у шейдера перехода один источник цвета.
 */
const themeVariables = {
  "--bg": THEME.bg,
  "--text1": THEME.text1,
  "--text2": THEME.text2,
  "--text3": THEME.text3,
  "--accent": THEME.accent,
  "--line": THEME.line,
  "--scene-screens": SCROLL.sceneScreens,
  "--overlap-screens": SCROLL.overlapScreens,
} as CSSProperties;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable} antialiased`} style={themeVariables}>
      <body>{children}</body>
    </html>
  );
}
