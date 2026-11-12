"use client";

import { Suspense, useEffect, useState, type PointerEvent, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { NoToneMapping } from "three";
import { CAMERA, FOG, LIGHT, POST, THEME } from "@/lib/config";
import type { CameraSetup } from "@/lib/camera";
import { pickDpr } from "@/lib/perf";
import { parseDisabledEffects, toPointer, useSceneStore, type EffectName } from "@/lib/store";
import { Effects } from "./Effects";
import { Floor } from "./Floor";

/**
 * Кадр рисуется только когда что-то изменилось: прокрутка или положение
 * курсора. Вращение мышкой заказывает кадры само (OrbitControls), движение
 * блоков — тоже (Structure3D). В покое видеокарта не работает вовсе.
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

export interface SceneSettings {
  readonly disabled: ReadonlySet<EffectName>;
  readonly bench: boolean;
  /** Ручки для замеров из адреса: ?msaa=0 и ?dpr=0.7. Без них берутся значения из настроек. */
  readonly multisampling: number;
  readonly dprScale: number;
  readonly aspect: number;
}

function numberParam(params: URLSearchParams, name: string, fallback: number): number {
  const value = Number(params.get(name) ?? Number.NaN);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

/** Настройки из адреса и окна. Компоненты сцены грузятся только в браузере (ssr: false), поэтому читать их можно сразу. */
export function readSettings(): SceneSettings {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  return {
    disabled: parseDisabledEffects(search),
    bench: params.has("bench"),
    multisampling: numberParam(params, "msaa", POST.multisampling),
    dprScale: numberParam(params, "dpr", 1),
    aspect: window.innerWidth / window.innerHeight,
  };
}

function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
  const pointer = toPointer(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());
  useSceneStore.getState().setPointer(pointer);
}

function handlePointerLeave(): void {
  useSceneStore.getState().setPointer(null);
}

/** Пока камера облетает сцену сама, кадры нужны непрерывно; при остановке облёта рисование снова идёт только по требованию. */
function useIsSceneOnScreen(): boolean {
  const [isOnScreen, setOnScreen] = useState(true);
  useEffect(
    () => useSceneStore.subscribe(({ progress }) => setOnScreen(progress < 1)),
    [],
  );
  return isOnScreen;
}

type SceneCanvasProps = {
  settings: SceneSettings;
  camera: CameraSetup;
  /** Скорость облёта: если задана, камера сама медленно облетает сцену, пока та видна. */
  autoRotateSpeed?: number;
  fogNear?: number;
  fogFar?: number;
  /** Что стоит в сцене: постройки и их свет. Пол, окружение, управление и эффекты — общие. */
  children: ReactNode;
};

/** Общая основа трёхмерной сцены: холст, пол, окружение цеха, вращение мышкой и постобработка. */
export function SceneCanvas({
  settings,
  camera,
  autoRotateSpeed,
  fogNear = FOG.near,
  fogFar = FOG.far,
  children,
}: SceneCanvasProps) {
  const dpr = useCanvasDpr();
  const isOnScreen = useIsSceneOnScreen();
  const isAutoRotating = autoRotateSpeed !== undefined && isOnScreen;
  const shadows = !settings.disabled.has("shadows");

  return (
    <div
      className="h-full w-full cursor-grab active:cursor-grabbing"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <Canvas
        frameloop={isAutoRotating ? "always" : "demand"}
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
          autoRotate={isAutoRotating}
          autoRotateSpeed={autoRotateSpeed}
        />
        <RenderOnChange />
        <Effects disabled={settings.disabled} bench={settings.bench} multisampling={settings.multisampling} />
      </Canvas>
    </div>
  );
}
