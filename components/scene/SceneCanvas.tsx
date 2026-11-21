"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { Box3, NoToneMapping, Vector3 } from "three";
import { CAMERA, FLOOR, FOG, LIGHT, POST, THEME } from "@/lib/config";
import { factoryOrbitRadius, sceneScale, structureView, type CameraSetup } from "@/lib/camera";
import type { Vec3 } from "@/lib/structure";
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

/** Колёсико без Ctrl/Cmd прокручивает страницу, с клавишей — управляет сценой. */
function CameraLimits({ structureSize, centerRotation }: { structureSize?: Vec3; centerRotation: boolean }) {
  const { camera, controls, gl, invalidate } = useThree();
  const aspect = useThree(({ size }) => size.width / size.height);
  const width = structureSize?.[0];
  const height = structureSize?.[1];
  const depth = structureSize?.[2];

  useEffect(() => {
    const element = gl.domElement;
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) event.stopImmediatePropagation();
    };
    element.addEventListener("wheel", wheel, { capture: true });
    return () => element.removeEventListener("wheel", wheel, { capture: true });
  }, [gl]);

  useEffect(() => {
    if (!controls || width === undefined || height === undefined || depth === undefined) return;
    const orbit = controls as unknown as {
      target: Vector3;
      update: () => void;
      addEventListener: (event: "change", listener: () => void) => void;
      removeEventListener: (event: "change", listener: () => void) => void;
    };
    const { min, max, margin } = structureView([width, height, depth]);
    const box = new Box3(new Vector3(...min), new Vector3(...max));
    const structureCenter = box.getCenter(new Vector3());
    const edge = new Vector3();
    const offset = new Vector3();
    const overviewRadius = centerRotation ? factoryOrbitRadius([width, height, depth], aspect) : 0;
    const fromCenter = new Vector3();
    const constrain = (preserveFocus: boolean) => {
      const centered = centerRotation && orbit.target.equals(structureCenter);
      // При сдвиге камера может опуститься ниже пола даже при ограниченном угле вращения.
      // Оставляем место для ближней плоскости, иначе она срезает текстуру пола.
      const lift = Math.max(0, CAMERA.near * 2 - camera.position.y);
      camera.position.y += lift;
      if (!preserveFocus && !centered) orbit.target.y += lift;
      else if (lift > 0) camera.lookAt(orbit.target);
      box.clampPoint(camera.position, edge);
      offset.subVectors(camera.position, edge);
      const distance = offset.length();
      fromCenter.subVectors(camera.position, structureCenter);
      const radialDistance = fromCenter.length();
      if (distance <= margin || Math.fround(radialDistance) <= Math.fround(overviewRadius)) return;
      // Круг общего обзора может выходить за границу в три чанка у длинной фабрики.
      if (radialDistance - overviewRadius < distance - margin) {
        offset.copy(fromCenter).multiplyScalar(overviewRadius / radialDistance - 1);
      } else {
        offset.multiplyScalar(margin / distance - 1);
      }
      // На границе сдвигаем обе точки одинаково, чтобы камера не меняла угол.
      camera.position.add(offset);
      if (!preserveFocus) orbit.target.add(offset);
    };
    const afterMovement = () => constrain(false);
    if (centerRotation) {
      camera.position.sub(orbit.target).setLength(overviewRadius).add(structureCenter);
      orbit.target.copy(structureCenter);
    }
    constrain(true);
    orbit.update();
    let beforeZoom: { target: Vector3; distance: number } | undefined;
    let frame = 0;
    const rememberBeforeZoom = (event: WheelEvent) => {
      if ((!event.ctrlKey && !event.metaKey) || event.deltaY === 0) return;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      const distance = camera.position.distanceTo(orbit.target);
      if (beforeZoom && Math.fround(distance) >= Math.fround(beforeZoom.distance)) beforeZoom = undefined;
      if (event.deltaY < 0) beforeZoom ??= { target: orbit.target.clone(), distance };
    };
    const restoreBeforeRotate = (event: globalThis.PointerEvent) => {
      if (event.pointerType === "touch" || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const saved = beforeZoom;
      beforeZoom = undefined;
      const distance = camera.position.distanceTo(orbit.target);
      const zoomed = saved && Math.fround(distance) < Math.fround(saved.distance);
      const target = centerRotation ? structureCenter : zoomed ? saved.target : undefined;
      if (!target) return;
      const shift = target.clone().sub(orbit.target);
      const destination = centerRotation ? overviewRadius : zoomed ? saved.distance : distance;
      if (Math.fround(destination) === Math.fround(distance) && shift.lengthSq() === 0) return;
      const distanceChange = destination - distance;
      const direction = new Vector3();
      const start = performance.now();
      let previous = 0;
      const animate = (now: number) => {
        const progress = Math.min(1, (now - start) / CAMERA.returnFromZoomMs);
        const eased = 1 - (1 - progress) ** 2;
        const step = eased - previous;
        previous = eased;
        // Меняем расстояние вдоль текущего ракурса, чтобы уже начатый поворот продолжался.
        direction.subVectors(camera.position, orbit.target).normalize();
        orbit.target.addScaledVector(shift, step);
        camera.position.addScaledVector(shift, step).addScaledVector(direction, distanceChange * step);
        if (progress === 1) {
          camera.position.add(shift.subVectors(target, orbit.target));
          orbit.target.copy(target);
          if (centerRotation) camera.position.addScaledVector(direction, destination - camera.position.distanceTo(target));
        }
        constrain(false);
        orbit.update();
        invalidate();
        frame = progress < 1 ? requestAnimationFrame(animate) : 0;
      };
      frame = requestAnimationFrame(animate);
    };
    const element = gl.domElement;
    orbit.addEventListener("change", afterMovement);
    element.addEventListener("wheel", rememberBeforeZoom, { capture: true });
    element.addEventListener("pointerdown", restoreBeforeRotate, { capture: true });
    return () => {
      orbit.removeEventListener("change", afterMovement);
      element.removeEventListener("wheel", rememberBeforeZoom, { capture: true });
      element.removeEventListener("pointerdown", restoreBeforeRotate, { capture: true });
      cancelAnimationFrame(frame);
    };
  }, [aspect, camera, centerRotation, controls, gl, invalidate, width, height, depth]);

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
  /** Камера, с которой видно постройку целиком, если начальная ближе (огромная фабрика): по ней туман, пол и отдаление. */
  overview?: CameraSetup;
  /** Размер постройки: включает сдвиг обзора и задаёт границы движения камеры. */
  structureSize?: Vec3;
  /** При вращении фабрики ось возвращается в центр её объёма. */
  centerRotation?: boolean;
  fogNear?: number;
  fogFar?: number;
  /** Ширина и глубина постройки в блоках: по ним на полу рисуются границы чанков. Без них сетки нет. */
  footprint?: readonly [number, number];
  /** Граница чанков, если она известна (фабрика калькулятора): иначе постройка посередине своих чанков. */
  chunkOrigin?: readonly [number, number];
  /** Что стоит в сцене: постройки и их свет. Пол, окружение, управление и эффекты — общие. */
  children: ReactNode;
};

/**
 * Общая основа трёхмерной сцены: холст, пол, окружение цеха, вращение мышкой
 * и постобработка. Курсор у каждой сцены свой — наведение на одну сцену не
 * трогает другие на той же странице.
 */
export function SceneCanvas({ settings, camera, overview = camera, structureSize, centerRotation = false, fogNear, fogFar, footprint, chunkOrigin, children }: SceneCanvasProps) {
  // Своя дымка у цеха подобрана под его камеру; у построек туман отодвигается вместе с камерой (обзорной, если она дальше).
  const scale = sceneScale(overview);
  const near = fogNear ?? FOG.near * scale;
  const far = fogFar ?? FOG.far * scale;
  const [x, y, z] = camera.position;
  const [aimX, aimY, aimZ] = camera.target;
  const canvasCamera = useMemo(
    () => ({ fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far * scale, position: [x, y, z] as [number, number, number] }),
    [scale, x, y, z],
  );
  const target = useMemo((): [number, number, number] => [aimX, aimY, aimZ], [aimX, aimY, aimZ]);
  const initialDistance = Math.hypot(x - aimX, y - aimY, z - aimZ);
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
          camera={canvasCamera}
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
          {footprint && <ChunkGrid footprint={footprint} reach={(FLOOR.size * scale) / [0, 0].length} origin={chunkOrigin} />}
          <OrbitControls
            makeDefault
            target={target}
            zoomToCursor={Boolean(structureSize)}
            minDistance={Math.min(initialDistance * CAMERA.zoomMin, CAMERA.zoomNearest)}
            maxDistance={structureSize ? Infinity : initialDistance * CAMERA.zoomMax}
            enablePan={Boolean(structureSize)}
            screenSpacePanning
            enableDamping={!structureSize}
            dampingFactor={CAMERA.dampingFactor}
            rotateSpeed={CAMERA.rotateSpeed}
            minPolarAngle={CAMERA.minPolarAngle}
            maxPolarAngle={CAMERA.maxPolarAngle}
          />
          <CameraLimits structureSize={structureSize} centerRotation={centerRotation} />
          <InvalidateBridge onReady={handleReady} />
          <Effects disabled={settings.disabled} bench={settings.bench} multisampling={settings.multisampling} />
        </Canvas>
      </PointerContext.Provider>
    </div>
  );
}
