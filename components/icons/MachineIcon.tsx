"use client";

import { Suspense, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, PerspectiveCamera, View, useTexture } from "@react-three/drei";
import { BoxGeometry, type Group, type PerspectiveCamera as Camera, type Texture } from "three";
import { CAMERA, EBF, HOVER, ICON, LIGHT } from "@/lib/config";
import { iconCameraSetup, type CameraSetup } from "@/lib/camera";
import { findMachine, structureOf, type Hull } from "@/lib/machines";
import type { BlockKind } from "@/lib/structure";
import {
  DETAIL_URLS,
  Structure3D,
  blockMaterial,
  setupDetailTexture,
  setupPixelTexture,
  type Detail,
} from "@/components/scene/Structure3D";

type TurntableProps = {
  setup: CameraSetup;
  isHovered: boolean;
  children: ReactNode;
};

/** Общая часть любого значка: своя камера, свет цеха и поворотный стол — пока мышка на значке, он крутится. */
function Turntable({ setup, isHovered, children }: TurntableProps) {
  const camera = useRef<Camera>(null);
  const table = useRef<Group>(null);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    camera.current?.lookAt(...setup.target);
    invalidate();
  }, [setup.target, invalidate]);

  useFrame((state, delta) => {
    if (!isHovered || !table.current) return;
    table.current.rotation.y += Math.min(delta, HOVER.maxStep) * ICON.spinSpeed;
    // Пока мышка на значке — заказываем следующий кадр; ушла — вращение и рисование останавливаются.
    state.invalidate();
  });

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault fov={CAMERA.fov} near={CAMERA.near} far={CAMERA.far} position={[...setup.position]} />
      <ambientLight intensity={LIGHT.ambientIntensity} />
      <Suspense fallback={null}>
        <Environment files="/hdri/workshop_1k.hdr" environmentIntensity={LIGHT.environmentIntensity} />
        <group ref={table}>{children}</group>
      </Suspense>
    </>
  );
}

/** Подпись под значком. */
function Caption({ title, note }: { title: string; note: string }) {
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
      className={frame}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <View className="aspect-square w-full" index={ICON.renderPriority}>
        <Turntable setup={iconCameraSetup(size)} isHovered={isHovered}>
          <Structure3D machine={machine} shadows={false} isHovered={isHovered} />
        </Turntable>
      </View>
      <Caption title={label ?? machine.title} note={size.join(" × ")} />
    </Link>
  );
}

export type Tier = "bronze" | "steel";

const TIER_TITLES: Record<Tier, string> = { bronze: "Бронзовая", steel: "Стальная" };

/** Металл корпуса — тот же материал, что у блоков построек. */
const HULL_KIND: BlockKind = { label: "Корпус машины", texture: "hull" };

type SingleCubeProps = {
  id: string;
  tier: Tier;
  hull: Hull;
};

/** Одноблочная машина — один куб: фасад со значком машины, остальные грани — корпус её яруса. */
function SingleCube({ id, tier, hull }: SingleCubeProps) {
  const base = `/textures/gregtech/hull-${tier}-${hull}`;
  const textures = useTexture({
    front: `/textures/gregtech/single-${tier}-${id}.webp`,
    side: `${base}-side.webp`,
    top: `${base}-top.webp`,
    bottom: `${base}-bottom.webp`,
  }) as Record<"front" | "side" | "top" | "bottom", Texture>;
  const detail = useTexture(DETAIL_URLS) as Detail;
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    Object.values(textures).forEach(setupPixelTexture);
    Object.values(detail).forEach(setupDetailTexture);
    invalidate();
  }, [textures, detail, invalidate]);

  // Порядок граней куба в three.js: +x, −x, +y, −y, +z (фасад), −z.
  const materials = useMemo(() => {
    const side = blockMaterial(HULL_KIND, textures.side, detail);
    return [side, side, blockMaterial(HULL_KIND, textures.top, detail), blockMaterial(HULL_KIND, textures.bottom, detail), blockMaterial(HULL_KIND, textures.front, detail), side];
  }, [textures, detail]);
  const geometry = useMemo(() => new BoxGeometry(EBF.blockSize, EBF.blockSize, EBF.blockSize), []);

  return <mesh position={[0, EBF.blockSize / 2, 0]} geometry={geometry} material={materials} />;
}

type SingleBlockIconProps = SingleCubeProps & {
  title: string;
};

/** Трёхмерный значок одноблочной машины. Своей страницы у неё нет, поэтому это не ссылка: значок только поворачивается под мышкой. */
export function SingleBlockIcon({ id, tier, hull, title }: SingleBlockIconProps) {
  const [isHovered, setHovered] = useState(false);
  const setup = iconCameraSetup([1, 1, 1]);

  return (
    <div
      className={frame}
      tabIndex={0}
      role="img"
      aria-label={`${title}, ${TIER_TITLES[tier].toLowerCase()}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <View className="aspect-square w-full" index={ICON.renderPriority}>
        <Turntable setup={setup} isHovered={isHovered}>
          <SingleCube id={id} tier={tier} hull={hull} />
        </Turntable>
      </View>
      <Caption title={TIER_TITLES[tier]} note={`${title} · 1 блок`} />
    </div>
  );
}
