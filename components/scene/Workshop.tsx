"use client";

import { useState } from "react";
import { ContactShadows } from "@react-three/drei";
import { HERO, WORKSHOP } from "@/lib/config";
import { workshopCamera, workshopPlacements } from "@/lib/workshop";
import { SceneCanvas, readSettings } from "./SceneCanvas";
import { Structure3D } from "./Structure3D";

type WorkshopProps = {
  /** Соотношение сторон блока со сценой; по умолчанию — шапки во всю ширину окна. */
  aspect?: number;
  /** Мини-шапка: цех с другой стороны, чтобы не повторять большую шапку. */
  isBanner?: boolean;
};

/**
 * Паровой цех — все постройки паровой эры на одном полу. Мышкой его можно
 * повернуть, блоки у курсора раздвигаются, как на страницах машин.
 */
export default function Workshop({ aspect, isBanner = false }: WorkshopProps) {
  const [settings] = useState(readSettings);
  // Шапка во всю ширину окна и высотой HERO.screens экрана.
  const [windowAspect] = useState(() => window.innerWidth / (window.innerHeight * HERO.screens));
  const placements = workshopPlacements();

  return (
    <SceneCanvas
      settings={settings}
      camera={workshopCamera(aspect ?? windowAspect, isBanner ? WORKSHOP.bannerCameraPosition : WORKSHOP.cameraPosition)}
      fogNear={WORKSHOP.fogNear}
      fogFar={WORKSHOP.fogFar}
    >
      {placements.map((placement) => (
        <group key={placement.key} position={[...placement.position]} rotation-y={placement.rotationY}>
          {/* Тени от точечного света здесь выключены: их пришлось бы рисовать для каждой печи в шесть сторон. Вместо них — мягкая тень под постройками. */}
          <Structure3D machine={placement.machine} shadows={false} hasLight={placement.hasLight} />
        </group>
      ))}
      <ContactShadows
        frames={1}
        opacity={WORKSHOP.contactShadowOpacity}
        blur={WORKSHOP.contactShadowBlur}
        scale={WORKSHOP.contactShadowScale}
        far={WORKSHOP.contactShadowFar}
        resolution={WORKSHOP.contactShadowResolution}
      />
    </SceneCanvas>
  );
}
