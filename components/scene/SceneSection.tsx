"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { sectionProgress } from "@/lib/scroll";
import { useSceneStore } from "@/lib/store";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

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
  /** Какую постройку показать: её адресное имя из lib/machines.ts. */
  slug: string;
  /** Подписи поверх сцены: заголовок и пояснение. */
  children: ReactNode;
};

/**
 * Блок со сценой: высотой в несколько экранов, холст внутри прилипает к верху.
 * Положение прокрутки превращается в одно число от 0 до 1 — оно ведёт переход
 * к странице. Постройку вертят перетаскиванием, блоки раздвигает курсор.
 */
export function SceneSection({ slug, children }: SceneSectionProps) {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => {
      const element = section.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      useSceneStore.getState().setProgress(sectionProgress(rect.top, rect.height, window.innerHeight));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section ref={section} className="scene-section relative" aria-label="Трёхмерная модель постройки">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <Scene slug={slug} />
        <BenchButton />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 sm:p-12">{children}</div>
      </div>
    </section>
  );
}
