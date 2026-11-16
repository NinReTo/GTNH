"use client";

import { useState } from "react";
import { HERO } from "@/lib/config";
import { cameraSetup } from "@/lib/camera";
import { structureOf, type Machine } from "@/lib/machines";
import { findScene } from "@/lib/setups";
import { SceneCanvas, readSettings } from "./SceneCanvas";
import { Structure3D } from "./Structure3D";

type SceneProps = {
  slug: string;
  /** Готовая постройка вместо поиска по имени — например, фабрика из калькулятора. */
  machine?: Machine;
  /** Соотношение сторон блока со сценой; по умолчанию — шапки во всю ширину окна. */
  aspect?: number;
};

/** Сцена одной постройки — для шапки страницы машины и мини-шапки напряжения. */
export default function Scene({ slug, machine: given, aspect }: SceneProps) {
  const [settings] = useState(readSettings);
  // Шапка во всю ширину окна и высотой HERO.screens экрана.
  const [windowAspect] = useState(() => window.innerWidth / (window.innerHeight * HERO.screens));
  const machine = given ?? findScene(slug);
  if (!machine) return null;
  const { size } = structureOf(machine);
  const [width, , depth] = size;

  return (
    <SceneCanvas settings={settings} camera={cameraSetup(size, aspect ?? windowAspect)} footprint={[width, depth]}>
      <Structure3D machine={machine} shadows={!settings.disabled.has("shadows")} />
    </SceneCanvas>
  );
}
