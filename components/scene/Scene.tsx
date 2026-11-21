"use client";

import { useState } from "react";
import { HERO } from "@/lib/config";
import { cameraSetup, startSetup } from "@/lib/camera";
import { structureOf, type Machine } from "@/lib/machines";
import { useLang } from "@/lib/use-lang";
import { findScene } from "@/lib/setups";
import { SceneCanvas, readSettings } from "./SceneCanvas";
import { Structure3D } from "./Structure3D";
import { FactoryMarkers } from "./FactoryMarkers";
import type { FactoryMarker } from "@/lib/calc/factory";

type SceneProps = {
  slug: string;
  /** Готовая постройка вместо поиска по имени — например, фабрика из калькулятора. */
  machine?: Machine;
  /** Соотношение сторон блока со сценой; по умолчанию — шапки во всю ширину окна. */
  aspect?: number;
  /** Плашки над фабрикой калькулятора. */
  markers?: readonly FactoryMarker[];
  /** Граница чанков фабрики калькулятора (её чанки — от начала фабрики). */
  chunkOrigin?: readonly [number, number];
};

/** Сцена одной постройки — для шапки страницы машины и мини-шапки напряжения. */
export default function Scene({ slug, machine: given, aspect, markers, chunkOrigin }: SceneProps) {
  const [settings] = useState(readSettings);
  const lang = useLang();
  // Шапка во всю ширину окна и высотой HERO.screens экрана.
  const [windowAspect] = useState(() => window.innerWidth / (window.innerHeight * HERO.screens));
  const machine = given ?? findScene(slug);
  if (!machine) return null;
  const { size } = structureOf(machine);
  const [width, , depth] = size;
  const sceneAspect = aspect ?? windowAspect;
  const camera = given ? startSetup(size, sceneAspect) : cameraSetup(size, sceneAspect);

  return (
    <SceneCanvas settings={settings} camera={camera} structureSize={size} centerRotation={Boolean(given)} footprint={[width, depth]} chunkOrigin={chunkOrigin}>
      <Structure3D machine={machine} shadows={!settings.disabled.has("shadows")} isStill={Boolean(given)} />
      {markers && <FactoryMarkers markers={markers} lang={lang} />}
    </SceneCanvas>
  );
}
