"use client";

import { useState } from "react";
import { ContactShadows } from "@react-three/drei";
import { WORKSHOP } from "@/lib/config";
import { workshopCamera, workshopPlacements } from "@/lib/workshop";
import { SceneCanvas, readSettings } from "./SceneCanvas";
import { Structure3D } from "./Structure3D";

/**
 * Шапка главной: паровой цех — все постройки паровой эры на одном полу.
 * Камера медленно облетает цех сама; мышкой его можно повернуть, а блоки
 * у курсора раздвигаются, как на страницах машин.
 */
export default function Workshop() {
  const [settings] = useState(readSettings);
  const placements = workshopPlacements();

  return (
    <SceneCanvas
      settings={settings}
      camera={workshopCamera(settings.aspect)}
      autoRotateSpeed={WORKSHOP.autoRotateSpeed}
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
