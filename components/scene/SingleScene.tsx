"use client";

import { useState } from "react";
import { HERO } from "@/lib/config";
import { singleCameraSetup } from "@/lib/camera";
import { SingleCube } from "@/components/cards/CardContent";
import { SceneCanvas, readSettings } from "./SceneCanvas";

export type SingleSceneProps = {
  /** Адресное имя одноблочной машины. */
  slug: string;
};

/** Сцена одноблочной машины — для шапки её страницы: один куб на полу цеха. */
export default function SingleScene({ slug }: SingleSceneProps) {
  const [settings] = useState(readSettings);
  const [aspect] = useState(() => window.innerWidth / (window.innerHeight * HERO.screens));

  return (
    <SceneCanvas settings={settings} camera={singleCameraSetup(aspect)}>
      <SingleCube slug={slug} />
    </SceneCanvas>
  );
}
