"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { SCROLL } from "@/lib/config";
import { BLOCKS } from "@/lib/ebf";
import { inverseLerp } from "@/lib/math";
import { explodeProgress, sectionProgress } from "@/lib/scroll";
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
    <div className="absolute right-4 top-4 z-10 flex items-center gap-3 font-mono text-xs">
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

/**
 * Блок со сценой: высотой в несколько экранов, холст внутри прилипает к верху.
 * Положение прокрутки превращается в одно число от 0 до 1 — и больше сцена
 * ни от чего не зависит.
 */
export function SceneSection() {
  const section = useRef<HTMLElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const update = () => {
      const element = section.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const progress = sectionProgress(rect.top, rect.height, window.innerHeight);
      useSceneStore.getState().setProgress(progress);

      // Заголовок уходит с началом разбора, подпись слоёв появляется к его концу.
      const explode = explodeProgress(progress);
      if (hero.current) hero.current.style.opacity = String(1 - inverseLerp(0, SCROLL.heroFadeEnd, explode));
      if (caption.current) caption.current.style.opacity = String(inverseLerp(SCROLL.captionFadeStart, 1, explode));
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
    <section ref={section} className="scene-section relative" aria-label="Трёхмерная модель печи">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <Scene />
        <BenchButton />

        <div ref={hero} className="pointer-events-none absolute inset-x-0 bottom-0 p-6 sm:p-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">GregTech · Minecraft 1.7.10</p>
          <h1 className="mt-4 max-w-3xl font-mono text-4xl font-bold uppercase leading-none tracking-tight text-text1 sm:text-7xl">
            Electric
            <br />
            Blast Furnace
          </h1>
          <p className="mt-6 max-w-md text-base text-text2">
            Первая большая печь мода: {BLOCKS.length} блока, которые вместе плавят сталь. Крутите вниз — она разберётся по
            блокам.
          </p>
        </div>

        <p
          ref={caption}
          className="pointer-events-none absolute inset-x-0 bottom-0 p-6 font-mono text-xs uppercase leading-relaxed tracking-[0.2em] text-text2 opacity-0 sm:p-12"
        >
          Сверху вниз: глушитель и корпус
          <br />
          два слоя нагревательных катушек
          <br />
          контроллер, люки и шины
        </p>
      </div>
    </section>
  );
}
