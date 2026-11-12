"use client";

import { useState } from "react";
import { cameraSetup } from "@/lib/camera";
import { findMachine, structureOf } from "@/lib/machines";
import { SceneCanvas, readSettings } from "./SceneCanvas";
import { Structure3D } from "./Structure3D";

type SceneProps = {
  slug: string;
};

/** Сцена одной постройки — для страницы машины. */
export default function Scene({ slug }: SceneProps) {
  const [settings] = useState(readSettings);
  const machine = findMachine(slug);
  if (!machine) return null;

  return (
    <SceneCanvas settings={settings} camera={cameraSetup(structureOf(machine).size, settings.aspect)}>
      <Structure3D machine={machine} shadows={!settings.disabled.has("shadows")} />
    </SceneCanvas>
  );
}
