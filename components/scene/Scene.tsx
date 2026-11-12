"use client";

import { Suspense, useEffect, useState, type PointerEvent } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { NoToneMapping } from "three";
import { CAMERA, FOG, LIGHT, POST, THEME } from "@/lib/config";
import { initialCameraPosition } from "@/lib/camera";
import { pickDpr } from "@/lib/perf";
import { parseDisabledEffects, toPointer, useSceneStore, type EffectName } from "@/lib/store";
import { Effects } from "./Effects";
import { Floor } from "./Floor";
import { Furnace } from "./Furnace";

/**
 * Кадр рисуется только когда что-то изменилось: прокрутка или положение
 * курсора. Вращение мышкой заказывает кадры само (OrbitControls), движение
 * блоков — тоже (Furnace). В покое видеокарта не работает вовсе.
 */
function RenderOnChange() {
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
  /** Ручки для замеров из адреса: ?msaa=0 и ?dpr=0.7. Без них берутся значения из настроек. */
  readonly multisampling: number;
  readonly dprScale: number;
  readonly cameraPosition: readonly [number, number, number];
}

function numberParam(params: URLSearchParams, name: string, fallback: number): number {
  const value = Number(params.get(name) ?? Number.NaN);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function readSettings(): SceneSettings {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  return {
    disabled: parseDisabledEffects(search),
    bench: params.has("bench"),
    multisampling: numberParam(params, "msaa", POST.multisampling),
    dprScale: numberParam(params, "dpr", 1),
    cameraPosition: initialCameraPosition(window.innerWidth / window.innerHeight),
  };
}

function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
  const pointer = toPointer(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());
  useSceneStore.getState().setPointer(pointer);
}

function handlePointerLeave(): void {
  useSceneStore.getState().setPointer(null);
}

export default function Scene() {
  const dpr = useCanvasDpr();
  // Компонент грузится только в браузере (ssr: false), поэтому окно и адрес читать можно сразу.
  const [settings] = useState(readSettings);
  const shadows = !settings.disabled.has("shadows");

  return (
    <div
      className="h-full w-full cursor-grab active:cursor-grabbing"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <Canvas
        frameloop="demand"
        dpr={dpr * settings.dprScale}
        shadows={shadows}
        gl={{ antialias: false, toneMapping: NoToneMapping, powerPreference: "high-performance" }}
        camera={{ fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far, position: [...settings.cameraPosition] }}
      >
        <color attach="background" args={[THEME.bg]} />
        <fog attach="fog" args={[THEME.bg, FOG.near, FOG.far]} />
        <ambientLight intensity={LIGHT.ambientIntensity} />
        <Suspense fallback={null}>
          <Environment files="/hdri/workshop_1k.hdr" environmentIntensity={LIGHT.environmentIntensity} />
          <Furnace shadows={shadows} />
          <Floor />
        </Suspense>
        {/* Готовое управление из drei: печь вертят перетаскиванием. Приближение и сдвиг выключены — колесо мышки остаётся прокрутке страницы. */}
        <OrbitControls
          makeDefault
          target={[...CAMERA.target]}
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={CAMERA.dampingFactor}
          rotateSpeed={CAMERA.rotateSpeed}
          minPolarAngle={CAMERA.minPolarAngle}
          maxPolarAngle={CAMERA.maxPolarAngle}
        />
        <RenderOnChange />
        <Effects disabled={settings.disabled} bench={settings.bench} multisampling={settings.multisampling} />
      </Canvas>
    </div>
  );
}
