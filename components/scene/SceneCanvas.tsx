"use client";

import { Suspense, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { NoToneMapping } from "three";
import { CAMERA, FOG, LIGHT, POST, THEME } from "@/lib/config";
import type { CameraSetup } from "@/lib/camera";
import { pickDpr } from "@/lib/perf";
import { PointerContext, parseDisabledEffects, toPointer, type EffectName, type Pointer } from "@/lib/store";
import { Effects } from "./Effects";
import { Floor } from "./Floor";

/** Отдаёт наружу способ заказать кадр: сцена рисуется только когда что-то изменилось. */
function InvalidateBridge({ onReady }: { onReady: (invalidate: () => void) => void }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => onReady(invalidate), [invalidate, onReady]);
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

export interface SceneSettings {
  readonly disabled: ReadonlySet<EffectName>;
  readonly bench: boolean;
  /** Ручки для замеров из адреса: ?msaa=0 и ?dpr=0.7. Без них берутся значения из настроек. */
  readonly multisampling: number;
  readonly dprScale: number;
}

function numberParam(params: URLSearchParams, name: string, fallback: number): number {
  const value = Number(params.get(name) ?? Number.NaN);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

/** Настройки из адреса. Компоненты сцены грузятся только в браузере (ssr: false), поэтому читать их можно сразу. */
export function readSettings(): SceneSettings {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  return {
    disabled: parseDisabledEffects(search),
    bench: params.has("bench"),
    multisampling: numberParam(params, "msaa", POST.multisampling),
    dprScale: numberParam(params, "dpr", 1),
  };
}

type SceneCanvasProps = {
  settings: SceneSettings;
  camera: CameraSetup;
  fogNear?: number;
  fogFar?: number;
  /** Что стоит в сцене: постройки и их свет. Пол, окружение, управление и эффекты — общие. */
  children: ReactNode;
};

/**
 * Общая основа трёхмерной сцены: холст, пол, окружение цеха, вращение мышкой
 * и постобработка. Курсор у каждой сцены свой — наведение на одну сцену не
 * трогает другие на той же странице.
 */
export function SceneCanvas({ settings, camera, fogNear = FOG.near, fogFar = FOG.far, children }: SceneCanvasProps) {
  const dpr = useCanvasDpr();
  const shadows = !settings.disabled.has("shadows");
  const pointer = useRef<Pointer | null>(null);
  const invalidate = useRef<() => void>(() => undefined);
  const [getPointer] = useState(() => () => pointer.current);
  const [handleReady] = useState(() => (next: () => void) => {
    invalidate.current = next;
  });

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    pointer.current = toPointer(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());
    invalidate.current();
  };
  const handlePointerLeave = () => {
    pointer.current = null;
    invalidate.current();
  };

  return (
    <div className="h-full w-full cursor-grab active:cursor-grabbing" onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
      <PointerContext.Provider value={getPointer}>
        <Canvas
          frameloop="demand"
          dpr={dpr * settings.dprScale}
          shadows={shadows}
          gl={{ antialias: false, toneMapping: NoToneMapping, powerPreference: "high-performance" }}
          camera={{ fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far, position: [...camera.position] }}
        >
          <color attach="background" args={[THEME.bg]} />
          <fog attach="fog" args={[THEME.bg, fogNear, fogFar]} />
          <ambientLight intensity={LIGHT.ambientIntensity} />
          <Suspense fallback={null}>
            <Environment files="/hdri/workshop_1k.hdr" environmentIntensity={LIGHT.environmentIntensity} />
            {children}
            <Floor />
          </Suspense>
          {/* Готовое управление из drei: сцену вертят перетаскиванием. Приближение и сдвиг выключены — колесо мышки остаётся прокрутке страницы. */}
          <OrbitControls
            makeDefault
            target={[...camera.target]}
            enableZoom={false}
            enablePan={false}
            enableDamping
            dampingFactor={CAMERA.dampingFactor}
            rotateSpeed={CAMERA.rotateSpeed}
            minPolarAngle={CAMERA.minPolarAngle}
            maxPolarAngle={CAMERA.maxPolarAngle}
          />
          <InvalidateBridge onReady={handleReady} />
          <Effects disabled={settings.disabled} bench={settings.bench} multisampling={settings.multisampling} />
        </Canvas>
      </PointerContext.Provider>
    </div>
  );
}
