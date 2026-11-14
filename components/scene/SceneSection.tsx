"use client";

import { useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./Scene"), { ssr: false });
const Workshop = dynamic(() => import("./Workshop"), { ssr: false });
const WinterLogo = dynamic(() => import("./WinterLogo"), { ssr: false });
const SingleScene = dynamic(() => import("./SingleScene"), { ssr: false });

/** Кнопка замера: видна только на странице с ?bench в адресе. */
function BenchButton() {
  const [result, setResult] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => setIsVisible(new URLSearchParams(window.location.search).has("bench")), []);
  if (!isVisible) return null;

  const handleClick = () => {
    const milliseconds = window.__ebfBench?.();
    setResult(milliseconds === undefined ? "сцена ещё не загрузилась" : `${milliseconds.toFixed(2)} мс на кадр`);
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
        Замерить кадр
      </button>
    </div>
  );
}

type SceneSectionProps = {
  /** Какую постройку показать: её адресное имя из lib/machines.ts. Без него показывается весь паровой цех. */
  slug?: string;
  /** Одноблочная машина вместо постройки: её адресное имя из lib/singles.ts. */
  single?: string;
  /** Зимняя шапка с эмблемой GT New Horizons вместо цеха — для главной. */
  isLogo?: boolean;
  /** Подписи поверх сцены: заголовок и пояснение. */
  children: ReactNode;
};

/**
 * Шапка страницы: неподвижный блок со сценой, ниже — сразу текст. Сцену
 * вертят перетаскиванием, блоки у курсора раздвигаются.
 */
export function SceneSection({ slug, single, isLogo = false, children }: SceneSectionProps) {
  const scene = single ? (
    <SingleScene slug={single} />
  ) : slug ? (
    <Scene slug={slug} />
  ) : isLogo ? (
    <WinterLogo />
  ) : (
    <Workshop />
  );
  return (
    <section className="hero relative w-full overflow-hidden" aria-label="Трёхмерная модель">
      {scene}
      <BenchButton />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 pt-24 sm:p-12 sm:pt-32">
        {children}
      </div>
    </section>
  );
}
