"use client";

import { Suspense, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { MOUSE, NoToneMapping, Vector3 } from "three";
import { CAMERA, FLOOR, FOG, LIGHT, POST, THEME } from "@/lib/config";
import { sceneScale, zoomDistance, type CameraSetup } from "@/lib/camera";
import { pickDpr } from "@/lib/perf";
import { PointerContext, parseDisabledEffects, toPointer, type EffectName, type Pointer } from "@/lib/store";
import { Effects } from "./Effects";
import { ChunkGrid } from "./ChunkGrid";
import { Floor } from "./Floor";

/** Отдаёт наружу способ заказать кадр: сцена рисуется только когда что-то изменилось. */
function InvalidateBridge({ onReady }: { onReady: (invalidate: () => void) => void }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => onReady(invalidate), [invalidate, onReady]);
  return null;
}

/**
 * Приближение колёсиком мышки с зажатым Ctrl (Cmd на Mac) или щипком на тачпаде.
 * Без клавиши колёсико прокручивает страницу, как раньше. Камера едет вдоль
 * луча к точке вращения, в пределах CAMERA.zoomMin…zoomMax от начального расстояния.
 */
function ModifierZoom({ camera: setup }: { camera: CameraSetup }) {
  const { camera, controls, gl, invalidate } = useThree();
  useEffect(() => {
    const target = new Vector3(...setup.target);
    const initial = new Vector3(...setup.position).distanceTo(target);
    const offset = new Vector3();
    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      // Иначе браузер на Ctrl + колёсико увеличит всю страницу.
      event.preventDefault();
      const orbit = controls as unknown as { target: Vector3; update: () => void } | null;
      const center = orbit?.target ?? target;
      offset.copy(camera.position).sub(center);
      offset.setLength(zoomDistance(offset.length(), initial, event.deltaY));
      camera.position.copy(center).add(offset);
      orbit?.update();
      invalidate();
    };
    // OrbitControls с зажатым Ctrl/Cmd переключает левую кнопку на сдвиг, а сдвиг
    // выключен — и постройка не крутится, пока держишь клавишу для приближения.
    // Поэтому в такой момент левая кнопка становится «сдвигом»: с клавишей
    // OrbitControls трактует его наоборот — как вращение.
    const handlePointerDown = (event: globalThis.PointerEvent) => {
      const orbit = controls as unknown as { mouseButtons: { LEFT: MOUSE } } | null;
      if (orbit) orbit.mouseButtons.LEFT = event.ctrlKey || event.metaKey ? MOUSE.PAN : MOUSE.ROTATE;
    };
    const element = gl.domElement;
    element.addEventListener("wheel", handleWheel, { passive: false });
    // capture — чтобы успеть до обработчика самого OrbitControls.
    element.addEventListener("pointerdown", handlePointerDown, { capture: true });
    return () => {
      element.removeEventListener("wheel", handleWheel);
      element.removeEventListener("pointerdown", handlePointerDown, { capture: true });
    };
  }, [camera, controls, gl, invalidate, setup]);
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
  /** Ширина и глубина постройки в блоках: по ним на полу рисуются границы чанков. Без них сетки нет. */
  footprint?: readonly [number, number];
  /** Что стоит в сцене: постройки и их свет. Пол, окружение, управление и эффекты — общие. */
  children: ReactNode;
};

/**
 * Общая основа трёхмерной сцены: холст, пол, окружение цеха, вращение мышкой
 * и постобработка. Курсор у каждой сцены свой — наведение на одну сцену не
 * трогает другие на той же странице.
 */
export function SceneCanvas({ settings, camera, fogNear, fogFar, footprint, children }: SceneCanvasProps) {
  // Своя дымка у цеха подобрана под его камеру; у построек туман отодвигается вместе с камерой.
  const scale = sceneScale(camera);
  const near = fogNear ?? FOG.near * scale;
  const far = fogFar ?? FOG.far * scale;
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
          camera={{ fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far * scale, position: [...camera.position] }}
        >
          <color attach="background" args={[THEME.bg]} />
          <fog attach="fog" args={[THEME.bg, near, far]} />
          <ambientLight intensity={LIGHT.ambientIntensity} />
          {/* Каждая часть грузится сама по себе: постройка (её текстуры — пара килобайт)
              появляется сразу, не дожидаясь окружения и тяжёлых текстур пола. */}
          <Suspense fallback={null}>{children}</Suspense>
          <Suspense fallback={null}>
            <Environment files="/hdri/workshop_1k.hdr" environmentIntensity={LIGHT.environmentIntensity} />
          </Suspense>
          <Suspense fallback={null}>
            <Floor scale={scale} />
          </Suspense>
          {footprint && <ChunkGrid footprint={footprint} reach={(FLOOR.size * scale) / [0, 0].length} />}
          {/* Готовое управление из drei: сцену вертят перетаскиванием. Своё приближение drei выключено — оно забрало бы колёсико у прокрутки страницы; приближают с Ctrl или Cmd (ModifierZoom). */}
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
          <ModifierZoom camera={camera} />
          <InvalidateBridge onReady={handleReady} />
          <Effects disabled={settings.disabled} bench={settings.bench} multisampling={settings.multisampling} />
        </Canvas>
      </PointerContext.Provider>
    </div>
  );
}
