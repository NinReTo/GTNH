"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { cardRegistry, cssSize, devicePixels, isCardLit, specKey, useCardStore, type CardSpec } from "@/lib/cards";
import { useDevicePixelRatio } from "./useDevicePixelRatio";
import { stepHref, type LineStep } from "@/lib/lines";
import { findMachine, structureOf } from "@/lib/machines";
import { findSingle } from "@/lib/singles";
import { href as langHref } from "@/lib/lang";
import { tr } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";

/** Трёхмерное для карточек грузится только в браузере. */
export const CardStageLoader = dynamic(() => import("./CardStage"), { ssr: false });

/** Квадрат с моделью: в покое — снимок, под мышкой поверх него ложится живая модель. */
function CardPicture({ spec, href, label }: { spec: CardSpec; href?: string; label: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const element = useRef<HTMLDivElement>(null);
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [pixels, setPixels] = useState(0);
  const dpr = useDevicePixelRatio();
  const image = useCardStore((state) => state.images[specKey(spec)]);
  const request = useCardStore((state) => state.request);
  const isLit = useCardStore((state) => state.isPointerOver && isCardLit(state.slots, state.current, node));
  const key = specKey(spec);

  // Квадрат с моделью — ровно целое число экранных точек, и снимок заказываем ровно
  // в эти точки. Окно или масштаб страницы поменялись — переснимаем: растянутый или
  // ужатый снимок мылится.
  useEffect(() => {
    const box = outer.current;
    if (!box) return;
    setNode(element.current);
    const measure = () => {
      const next = devicePixels(box.getBoundingClientRect().width, dpr);
      setPixels(next);
      if (next > 0) request(spec, next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
    // spec пересоздаётся при каждой отрисовке, а смысл в нём один — имя карточки.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, key, dpr]);

  // Карточка вписывается в общий список: живую модель включает слежение за курсором (CardStage).
  useEffect(() => {
    if (!element.current) return;
    const entry = { spec, element: element.current, href };
    cardRegistry.add(entry);
    return () => {
      cardRegistry.delete(entry);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, href]);

  // Пока квадрат не замерен, он во всю ширину; потом — ровно в целые экранные точки.
  const side = pixels > 0 ? cssSize(pixels, dpr) : undefined;
  const isSharp = image !== undefined && image.size === pixels;

  return (
    <div ref={outer} className="relative aspect-square w-full">
      <div
        ref={element}
        data-lit={isLit}
        className="relative mx-auto aspect-square w-full"
        style={side === undefined ? undefined : { width: side, height: side }}
      >
        {image && (
          // eslint-disable-next-line @next/next/no-img-element -- снимок модели, сделанный в браузере; оптимизатору картинок он недоступен
          <img
            src={image.src}
            alt={label}
            className="absolute inset-0 h-full w-full"
            // Снимок под другой размер (пока переснимается) показываем сглаженным, свой — точка в точку.
            style={{ imageRendering: isSharp ? "pixelated" : "auto" }}
          />
        )}
      </div>
    </div>
  );
}

function Caption({ title, note }: { title: string; note: ReactNode }) {
  return (
    <span className="block border-t border-line px-3 py-2">
      <span className="block font-mono text-xs uppercase tracking-[0.15em] text-text1 transition-colors group-hover:text-accent group-has-[[data-lit=true]]:text-accent">
        {title}
      </span>
      <span className="block font-mono text-[11px] text-text3">{note}</span>
    </span>
  );
}

// Подсветка держится, пока над карточкой её живая модель (data-lit), — иначе она мигает,
// когда живой холст ложится поверх карточки и браузер решает, что мышь с неё ушла.
const frame =
  "group block border border-line transition-colors hover:border-accent focus-visible:border-accent has-[[data-lit=true]]:border-accent";

/** Рамка карточки; у машины, на странице которой мы сейчас, рамка горит всё время. */
function frameOf(isCurrent: boolean): string {
  return isCurrent ? frame.replace("border-line", "border-accent") : frame;
}

/** Карточка постройки: модель и подпись; щелчок открывает страницу постройки. */
export function MachineCard({ slug, isCurrent = false }: { slug: string; isCurrent?: boolean }) {
  const lang = useLang();
  const machine = findMachine(slug);
  if (!machine) return null;
  const { size } = structureOf(machine);
  const href = langHref(lang, stepHref({ kind: "machine", slug }));
  const title = lang === "ru" ? machine.title : machine.name;
  return (
    <Link href={href} className={frameOf(isCurrent)} aria-current={isCurrent ? "page" : undefined}>
      <CardPicture spec={{ kind: "machine", slug }} href={href} label={title} />
      <Caption title={title} note={size.join(" × ")} />
    </Link>
  );
}

/** Карточка одноблочной машины; щелчок открывает её страницу. */
export function SingleCard({ slug, isCurrent = false }: { slug: string; isCurrent?: boolean }) {
  const lang = useLang();
  const single = findSingle(slug);
  if (!single) return null;
  const href = langHref(lang, stepHref({ kind: "single", slug }));
  const title = lang === "ru" ? single.title : single.name;
  return (
    <Link href={href} className={frameOf(isCurrent)} aria-current={isCurrent ? "page" : undefined}>
      <CardPicture spec={{ kind: "single", slug }} href={href} label={`${title}, ${tr(lang, single.label).toLowerCase()}`} />
      <Caption title={title} note={tr(lang, single.does)} />
    </Link>
  );
}

/** Карточка ступени прогрессии: одноблочная машина или постройка. */
export function StepCard({ step, isCurrent = false }: { step: LineStep; isCurrent?: boolean }) {
  return step.kind === "machine" ? (
    <MachineCard slug={step.slug} isCurrent={isCurrent} />
  ) : (
    <SingleCard slug={step.slug} isCurrent={isCurrent} />
  );
}
