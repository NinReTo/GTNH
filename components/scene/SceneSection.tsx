"use client";

import { useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { Machine } from "@/lib/machines";
import type { FactoryMarker } from "@/lib/calc/factory";
import { pick } from "@/lib/lang";
import { useLang } from "@/lib/use-lang";

const Scene = dynamic(() => import("./Scene"), { ssr: false });
const Workshop = dynamic(() => import("./Workshop"), { ssr: false });
const SingleScene = dynamic(() => import("./SingleScene"), { ssr: false });

/** Кнопка замера: видна только на странице с ?bench в адресе. */
function BenchButton() {
  const lang = useLang();
  const [result, setResult] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => setIsVisible(new URLSearchParams(window.location.search).has("bench")), []);
  if (!isVisible) return null;

  const handleClick = () => {
    const milliseconds = window.__ebfBench?.();
    setResult(milliseconds === undefined ? pick(lang, "сцена ещё не загрузилась", "the scene has not loaded yet") : `${milliseconds.toFixed(2)} ${pick(lang, "мс на кадр", "ms per frame")}`);
  };

  return (
    <div className="absolute right-4 top-16 z-10 flex items-center gap-3 font-mono text-xs">
      {result && (
        <output data-bench-result className="text-text1">
          {result}
        </output>
      )}
      <button
        type="button"
        onClick={handleClick}
        className="border border-accent px-3 py-2 text-accent transition-colors hover:bg-accent hover:text-bg"
      >
        {pick(lang, "Замерить кадр", "Measure a frame")}
      </button>
    </div>
  );
}

type SceneSectionProps = {
  /** Какую постройку показать: её адресное имя из lib/machines.ts. Без него показывается весь паровой цех. */
  slug?: string;
  /** Готовая постройка (фабрика калькулятора) — её адресное имя должно быть своим у каждой. */
  machine?: Machine;
  /** Плашки над фабрикой калькулятора (рецепты рядов, готовый товар, излишки). */
  markers?: readonly FactoryMarker[];
  /** Граница чанков фабрики калькулятора (её чанки — от начала фабрики). */
  chunkOrigin?: readonly [number, number];
  /** Одноблочная машина вместо постройки: её адресное имя из lib/singles.ts. */
  single?: string;
  /** Подписи поверх сцены: заголовок и пояснение. */
  children: ReactNode;
};

/**
 * Шапка страницы: неподвижный блок со сценой, ниже — сразу текст. Сцену
 * вертят перетаскиванием, блоки у курсора раздвигаются.
 */
export function SceneSection({ slug, machine, markers, chunkOrigin, single, children }: SceneSectionProps) {
  const lang = useLang();
  const scene = single ? (
    <SingleScene slug={single} />
  ) : machine ? (
    <Scene key={machine.slug} slug={machine.slug} machine={machine} markers={markers} chunkOrigin={chunkOrigin} />
  ) : slug ? (
    <Scene slug={slug} />
  ) : (
    <Workshop />
  );
  return (
    <section className="hero relative w-full overflow-hidden" aria-label={pick(lang, "Трёхмерная модель", "3D model")}>
      {scene}
      <BenchButton />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 pt-24 sm:p-12 sm:pt-32">
        {children}
      </div>
    </section>
  );
}
