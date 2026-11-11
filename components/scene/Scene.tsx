"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { NoToneMapping } from "three";
import { CAMERA, FOG, LIGHT, THEME } from "@/lib/config";
import { cameraPose } from "@/lib/camera";
import { pickDpr } from "@/lib/perf";
import { parseDisabledEffects, useSceneStore, type EffectName } from "@/lib/store";
import { Effects } from "./Effects";
import { Floor } from "./Floor";
import { Furnace } from "./Furnace";

/** Камера едет по кривой и смотрит на цель с другой кривой — обе заданы одним числом прокрутки. */
function CameraRig() {
  useFrame(({ camera, size }) => {
    const pose = cameraPose(useSceneStore.getState().progress, size.width / size.height);
    camera.position.set(...pose.position);
    camera.lookAt(...pose.target);
  });
  return null;
}

/**
 * Кадр рисуется только когда изменилась прокрутка: сцена больше ни от чего
 * не зависит, а значит, в покое видеокарта не работает вовсе.
 */
function RenderOnScroll() {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => useSceneStore.subscribe(() => invalidate()), [invalidate]);
  return null;
}

function useCanvasDpr(): number {
  const [dpr, setDpr] = useState(1);
  useEffect(() => {
    const update = () => setDpr(pickDpr(window.innerWidth, window.innerHeight, window.devicePixelRatio));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return dpr;
}

interface SceneSettings {
  readonly disabled: ReadonlySet<EffectName>;
  readonly bench: boolean;
}

function readSettings(): SceneSettings {
  const search = window.location.search;
  return { disabled: parseDisabledEffects(search), bench: new URLSearchParams(search).has("bench") };
}

export default function Scene() {
  const dpr = useCanvasDpr();
  // Компонент грузится только в браузере (ssr: false), поэтому адрес читать можно сразу.
  const [settings] = useState(readSettings);
  const shadows = !settings.disabled.has("shadows");
  const startPose = cameraPose(0);

  return (
    <Canvas
      frameloop="demand"
      dpr={dpr}
      shadows={shadows}
      gl={{ antialias: false, toneMapping: NoToneMapping, powerPreference: "high-performance" }}
      camera={{ fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far, position: [...startPose.position] }}
    >
      <color attach="background" args={[THEME.bg]} />
      <fog attach="fog" args={[THEME.bg, FOG.near, FOG.far]} />
      <ambientLight intensity={LIGHT.ambientIntensity} />
      <Suspense fallback={null}>
        <Environment files="/hdri/workshop_1k.hdr" environmentIntensity={LIGHT.environmentIntensity} />
        <Furnace shadows={shadows} />
        <Floor />
      </Suspense>
      <CameraRig />
      <RenderOnScroll />
      <Effects disabled={settings.disabled} bench={settings.bench} />
    </Canvas>
  );
}
