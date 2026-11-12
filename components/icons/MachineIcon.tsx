"use client";

import { Suspense, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, PerspectiveCamera, View } from "@react-three/drei";
import type { Group, PerspectiveCamera as Camera } from "three";
import { CAMERA, HOVER, ICON, LIGHT } from "@/lib/config";
import { iconCameraSetup } from "@/lib/camera";
import { findMachine, structureOf, type Machine } from "@/lib/machines";
import { Structure3D } from "@/components/scene/Structure3D";

type IconSceneProps = {
  machine: Machine;
  isHovered: boolean;
};

/** Что рисуется в квадрате значка: постройка, свет и своя камера. Пока мышка на значке — постройка поворачивается. */
function IconScene({ machine, isHovered }: IconSceneProps) {
  const setup = iconCameraSetup(structureOf(machine).size);
  const camera = useRef<Camera>(null);
  const turntable = useRef<Group>(null);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    camera.current?.lookAt(...setup.target);
    invalidate();
  }, [setup.target, invalidate]);

  useFrame((state, delta) => {
    if (!isHovered || !turntable.current) return;
    turntable.current.rotation.y += Math.min(delta, HOVER.maxStep) * ICON.spinSpeed;
    // Пока мышка на значке — заказываем следующий кадр; ушла — вращение и рисование останавливаются.
    state.invalidate();
  });

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault fov={CAMERA.fov} near={CAMERA.near} far={CAMERA.far} position={[...setup.position]} />
      <ambientLight intensity={LIGHT.ambientIntensity} />
      <Suspense fallback={null}>
        <Environment files="/hdri/workshop_1k.hdr" environmentIntensity={LIGHT.environmentIntensity} />
        <group ref={turntable}>
          <Structure3D machine={machine} shadows={false} isHovered={isHovered} />
        </group>
      </Suspense>
    </>
  );
}

type MachineIconProps = {
  slug: string;
  /** Подпись под значком; по умолчанию — русское название машины. */
  label?: string;
};

/**
 * Трёхмерный значок постройки: ссылка на её страницу. При наведении
 * постройка поворачивается и раздвигается, показывая, из чего сложена.
 * Сама картинка рисуется на общем холсте (IconStage) поверх этого квадрата.
 */
export function MachineIcon({ slug, label }: MachineIconProps) {
  const [isHovered, setHovered] = useState(false);
  const machine = findMachine(slug);
  if (!machine) return null;
  const { size } = structureOf(machine);

  return (
    <Link
      href={`/machines/${machine.slug}`}
      className="group block border border-line transition-colors hover:border-accent focus-visible:border-accent"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <View className="aspect-square w-full" index={ICON.renderPriority}>
        <IconScene machine={machine} isHovered={isHovered} />
      </View>
      <span className="block border-t border-line px-3 py-2">
        <span className="block font-mono text-xs uppercase tracking-[0.15em] text-text1 transition-colors group-hover:text-accent">
          {label ?? machine.title}
        </span>
        <span className="block font-mono text-[11px] text-text3">{size.join(" × ")}</span>
      </span>
    </Link>
  );
}
