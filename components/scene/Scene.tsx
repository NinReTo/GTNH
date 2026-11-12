"use client";

import { useState } from "react";
import { HERO } from "@/lib/config";
import { cameraSetup } from "@/lib/camera";
import { findMachine, structureOf } from "@/lib/machines";
import { SceneCanvas, readSettings } from "./SceneCanvas";
import { Structure3D } from "./Structure3D";

type SceneProps = {
  slug: string;
  /** Соотношение сторон блока со сценой; по умолчанию — шапки во всю ширину окна. */
  aspect?: number;
};

/** Сцена одной постройки — для шапки страницы машины и мини-шапки напряжения. */
export default function Scene({ slug, aspect }: SceneProps) {
  const [settings] = useState(readSettings);
  // Шапка во всю ширину окна и высотой HERO.screens экрана.
  const [windowAspect] = useState(() => window.innerWidth / (window.innerHeight * HERO.screens));
  const machine = findMachine(slug);
  if (!machine) return null;

  return (
    <SceneCanvas settings={settings} camera={cameraSetup(structureOf(machine).size, aspect ?? windowAspect)}>
      <Structure3D machine={machine} shadows={!settings.disabled.has("shadows")} />
    </SceneCanvas>
  );
}
