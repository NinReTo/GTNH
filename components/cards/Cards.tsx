"use client";

import { useEffect, useRef, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { specKey, useCardStore, type CardSpec } from "@/lib/cards";
import { STEAM_TIER_TITLES, findMachine, structureOf, type Hull, type SteamTier } from "@/lib/machines";

/** Трёхмерное для карточек грузится только в браузере. */
export const CardStageLoader = dynamic(() => import("./CardStage"), { ssr: false });

/** Квадрат с моделью: в покое — снимок, под мышкой поверх него ложится живая модель. */
function CardPicture({ spec, href, label }: { spec: CardSpec; href?: string; label: string }) {
  const element = useRef<HTMLDivElement>(null);
  const image = useCardStore((state) => state.images[specKey(spec)]);
  const request = useCardStore((state) => state.request);
  const setActive = useCardStore((state) => state.setActive);

  useEffect(() => request(spec), [request, spec]);

  const activate = () => {
    if (element.current) setActive({ spec, element: element.current, href });
  };

  return (
    <div ref={element} className="relative aspect-square w-full" onPointerEnter={activate}>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element -- снимок модели, сделанный в браузере; оптимизатору картинок он недоступен
        <img src={image} alt={label} className="absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}

function Caption({ title, note }: { title: string; note: ReactNode }) {
  return (
    <span className="block border-t border-line px-3 py-2">
      <span className="block font-mono text-xs uppercase tracking-[0.15em] text-text1 transition-colors group-hover:text-accent">
        {title}
      </span>
      <span className="block font-mono text-[11px] text-text3">{note}</span>
    </span>
  );
}

const frame = "group block border border-line transition-colors hover:border-accent focus-visible:border-accent";

/** Карточка постройки: модель и подпись; щелчок открывает страницу постройки. */
export function MachineCard({ slug }: { slug: string }) {
  const machine = findMachine(slug);
  if (!machine) return null;
  const { size } = structureOf(machine);
  const href = `/machines/${machine.slug}`;
  return (
    <Link href={href} className={frame}>
      <CardPicture spec={{ kind: "machine", slug }} href={href} label={machine.title} />
      <Caption title={machine.title} note={size.join(" × ")} />
    </Link>
  );
}

/** Карточка одноблочной машины. Своей страницы у неё нет: модель можно только покрутить. */
export function SingleCard({ id, tier, hull, title }: { id: string; tier: SteamTier; hull: Hull; title: string }) {
  return (
    <div className={frame}>
      <CardPicture spec={{ kind: "single", id, tier, hull }} label={`${title}, ${STEAM_TIER_TITLES[tier].toLowerCase()}`} />
      <Caption title={title} note={STEAM_TIER_TITLES[tier]} />
    </div>
  );
}
