"use client";

import { Suspense, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { CAMERA, ICON, LIGHT } from "@/lib/config";
import { specCamera, specKey, useCardStore, type CardSpec } from "@/lib/cards";
import { pickDpr } from "@/lib/perf";
import { PointerContext, toPointer, type Pointer } from "@/lib/store";
import { CardContent } from "./CardContent";

const ENVIRONMENT = "/hdri/workshop_1k.hdr";

/** Свет карточки — тот же, что в шапке: рассеянный и снимок цеха. */
function CardLight() {
  return (
    <>
      <ambientLight intensity={LIGHT.ambientIntensity} />
      <Environment files={ENVIRONMENT} environmentIntensity={LIGHT.environmentIntensity} />
    </>
  );
}

/** Ставит камеру карточки. */
function useCardCamera(spec: CardSpec): void {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  useLayoutEffect(() => {
    const setup = specCamera(spec);
    camera.position.set(...setup.position);
    camera.lookAt(...setup.target);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, spec, invalidate]);
}

/** Один снимок: дождаться текстур, нарисовать кадр, забрать картинку и уйти. */
function Shot({ spec }: { spec: CardSpec }) {
  useCardCamera(spec);
  const done = useCardStore((state) => state.done);
  const isTaken = useRef(false);

  useFrame((state) => {
    if (isTaken.current) return;
    isTaken.current = true;
    state.gl.render(state.scene, state.camera);
    done(specKey(spec), state.gl.domElement.toDataURL("image/webp"));
  }, 1);

  return <CardContent spec={spec} />;
}

/**
 * Невидимый холст для снимков. Карточки в покое — обычные картинки: они едут
 * вместе со страницей без отставания. Снимки делаются при загрузке по одному.
 */
function SnapshotCanvas() {
  const next = useCardStore((state) => state.queue[0]);
  const [dpr] = useState(() => window.devicePixelRatio);

  return (
    <Canvas
      frameloop="demand"
      dpr={dpr}
      gl={{ preserveDrawingBuffer: true, alpha: true, antialias: true }}
      camera={{ fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far }}
      // Холст стоит за левым краем окна: его не видно, но рисует он как обычно.
      style={{ position: "fixed", top: 0, right: "100%", width: ICON.snapshotSize, height: ICON.snapshotSize, pointerEvents: "none" }}
    >
      <Suspense fallback={null}>
        <CardLight />
        <Suspense fallback={null}>{next && <Shot key={specKey(next)} spec={next} />}</Suspense>
      </Suspense>
    </Canvas>
  );
}

/** Живая модель активной карточки: её вертят мышкой, блоки у курсора раздвигаются. */
function Live({ spec }: { spec: CardSpec }) {
  useCardCamera(spec);
  const target = specCamera(spec).target;
  return (
    <>
      <OrbitControls
        makeDefault
        target={[...target]}
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={CAMERA.dampingFactor}
        rotateSpeed={CAMERA.rotateSpeed}
        minPolarAngle={CAMERA.minPolarAngle}
        maxPolarAngle={CAMERA.maxPolarAngle}
      />
      <Suspense fallback={null}>
        <CardLight />
        <CardContent spec={spec} />
      </Suspense>
    </>
  );
}

interface Box {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

/** Где лежит карточка на странице (а не в окне): живой слой прокручивается вместе со страницей. */
function boxOf(element: HTMLElement): Box {
  const rect = element.getBoundingClientRect();
  return { top: rect.top + window.scrollY, left: rect.left + window.scrollX, width: rect.width, height: rect.height };
}

/**
 * Живой слой: один холст на страницу, лежит прямо поверх карточки под мышкой.
 * Он часть страницы, а не прибит к окну, поэтому при прокрутке едет вместе с
 * карточкой и не отстаёт от неё.
 */
function LiveLayer() {
  const router = useRouter();
  const active = useCardStore((state) => state.active);
  const setActive = useCardStore((state) => state.setActive);
  const [box, setBox] = useState<Box | null>(null);
  const [dpr] = useState(() => pickDpr(window.innerWidth, window.innerHeight, window.devicePixelRatio));
  const pointer = useRef<Pointer | null>(null);
  const press = useRef<readonly [number, number] | null>(null);
  const [getPointer] = useState(() => () => pointer.current);

  useLayoutEffect(() => {
    setBox(active ? boxOf(active.element) : null);
  }, [active]);

  // Окно поменяло размер — карточки сдвинулись; живую модель убираем, останется снимок.
  useEffect(() => {
    const reset = () => setActive(null);
    window.addEventListener("resize", reset);
    return () => window.removeEventListener("resize", reset);
  }, [setActive]);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    pointer.current = toPointer(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());
  };
  const handlePointerLeave = () => {
    pointer.current = null;
    setActive(null);
  };
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    press.current = [event.clientX, event.clientY];
  };
  // Щелчок без поворота открывает страницу машины; поворот мышкой — нет.
  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = press.current;
    press.current = null;
    if (!start || !active?.href) return;
    const moved = Math.hypot(event.clientX - start[0], event.clientY - start[1]);
    if (moved <= ICON.clickSlop) router.push(active.href);
  };

  return createPortal(
    <div
      style={{
        position: "absolute",
        top: box?.top ?? 0,
        left: box?.left ?? 0,
        width: box?.width ?? ICON.snapshotSize,
        height: box?.height ?? ICON.snapshotSize,
        visibility: active ? "visible" : "hidden",
      }}
      className="z-20 cursor-grab active:cursor-grabbing"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <PointerContext.Provider value={getPointer}>
        <Canvas frameloop="demand" dpr={dpr} gl={{ alpha: true, antialias: true }} camera={{ fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far }}>
          {active && <Live key={specKey(active.spec)} spec={active.spec} />}
        </Canvas>
      </PointerContext.Provider>
    </div>,
    document.body,
  );
}

/** Всё трёхмерное для карточек страницы: съёмка снимков и живой слой. Ставится на страницу один раз. */
export default function CardStage() {
  return (
    <>
      <SnapshotCanvas />
      <LiveLayer />
    </>
  );
}
