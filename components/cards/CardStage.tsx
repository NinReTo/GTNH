"use client";

import { Suspense, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { CAMERA, ICON, LIGHT, THEME } from "@/lib/config";
import {
  returnStep,
  specCamera,
  specKey,
  useCardStore,
  type Box,
  type CardSpec,
  type LiveSlot,
  type ShotRequest,
} from "@/lib/cards";
import { PointerContext, toPointer, type Pointer } from "@/lib/store";
import { CardContent } from "./CardContent";

const ENVIRONMENT = "/hdri/workshop_1k.hdr";

/**
 * Плотность пикселей у снимков и у живых моделей одна и та же — родная для
 * экрана. Иначе при наведении живая модель оказывается чётче снимка, и это
 * видно как «вспышка качества».
 */
function useScreenDpr(): number {
  const [dpr] = useState(() => window.devicePixelRatio);
  return dpr;
}

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

/**
 * Один снимок: дождаться текстур и нужного размера холста, нарисовать кадр,
 * забрать картинку и уйти.
 */
function Shot({ shot }: { shot: ShotRequest }) {
  useCardCamera(shot.spec);
  const done = useCardStore((state) => state.done);
  const isTaken = useRef(false);

  useFrame((state) => {
    if (isTaken.current) return;
    // Холст ещё не успел принять размер этой карточки — ждём следующего кадра.
    if (Math.round(state.size.width) !== shot.size) {
      state.invalidate();
      return;
    }
    isTaken.current = true;
    state.gl.render(state.scene, state.camera);
    done(shot, state.gl.domElement.toDataURL("image/webp", 1));
  }, 1);

  return <CardContent spec={shot.spec} />;
}

/**
 * Невидимый холст для снимков. Карточки в покое — обычные картинки: они едут
 * вместе со страницей без отставания. Снимки делаются при загрузке по одному,
 * каждый — ровно в размер своей карточки.
 */
function SnapshotCanvas() {
  const next = useCardStore((state) => state.queue[0]);
  const dpr = useScreenDpr();
  const size = next?.size ?? ICON.snapshotSize;

  return (
    <Canvas
      frameloop="demand"
      dpr={dpr}
      gl={{ preserveDrawingBuffer: true, alpha: true, antialias: true }}
      camera={{ fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far }}
      // Холст стоит за левым краем окна: его не видно, но рисует он как обычно.
      style={{ position: "fixed", top: 0, right: "100%", width: size, height: size, pointerEvents: "none" }}
    >
      <Suspense fallback={null}>
        <CardLight />
        <Suspense fallback={null}>{next && <Shot key={[specKey(next.spec), next.size].join("@")} shot={next} />}</Suspense>
      </Suspense>
    </Canvas>
  );
}

/**
 * Сообщает, что живая модель нарисовала первый кадр нужного размера: только
 * теперь её можно показать поверх снимка. Пока холст не принял размер
 * карточки, кадр выходит сжатым и сдвинутым — его не показываем.
 */
function ReadySignal({ index, width }: { index: number; width: number }) {
  const setReady = useCardStore((state) => state.setReady);
  const isSent = useRef(false);
  useFrame((state) => {
    if (isSent.current) return;
    if (Math.round(state.size.width) !== Math.round(width)) {
      state.invalidate();
      return;
    }
    isSent.current = true;
    setReady(index);
  });
  return null;
}

/**
 * Плавный возврат домой. Мышка ушла — вращение мышкой выключается, камера и
 * её цель плавно едут в исходное положение (блоки тем временем сами
 * съезжаются: курсора больше нет). Дошли — холст освобождается, и снимок
 * встаёт на место незаметно: они совпадают.
 */
function ReturnHome({ index, spec, isLeaving }: { index: number; spec: CardSpec; isLeaving: boolean }) {
  const release = useCardStore((state) => state.release);
  const invalidate = useThree((state) => state.invalidate);
  const controls = useThree((state) => state.controls) as unknown as {
    enabled: boolean;
    target: { set: (x: number, y: number, z: number) => void; toArray: () => number[] };
  } | null;

  useEffect(() => {
    if (controls) controls.enabled = !isLeaving;
    if (isLeaving) invalidate();
  }, [controls, isLeaving, invalidate]);

  useFrame((state, delta) => {
    // Читаем свежее состояние, а не то, что было при последней отрисовке: мышка
    // могла вернуться на модель только что, в этот самый кадр.
    if (!controls || !useCardStore.getState().slots[index]?.isLeaving) return;
    const home = specCamera(spec);
    const [cx, cy, cz] = state.camera.position.toArray();
    const [tx, ty, tz] = controls.target.toArray();
    const camera = returnStep([cx, cy, cz], home.position, delta);
    const target = returnStep([tx, ty, tz], home.target, delta);
    state.camera.position.set(...camera.position);
    controls.target.set(...target.position);
    state.camera.lookAt(...target.position);
    if (camera.isHome && target.isHome) {
      release(index);
      return;
    }
    state.invalidate();
  });

  return null;
}

/** Живая модель: её вертят мышкой, блоки у курсора раздвигаются. */
function Live({ index, spec, width, isLeaving }: { index: number; spec: CardSpec; width: number; isLeaving: boolean }) {
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
        <ReadySignal index={index} width={width} />
      </Suspense>
      <ReturnHome index={index} spec={spec} isLeaving={isLeaving} />
    </>
  );
}

/**
 * Один живой холст. Лежит прямо поверх своей карточки и является частью
 * страницы, поэтому при прокрутке едет вместе с ней. Мышь ловит только холст
 * карточки под мышкой; второй в это время доигрывает возврат и мышь пропускает.
 */
function LiveCanvas({ index }: { index: number }) {
  const router = useRouter();
  const slot: LiveSlot | null = useCardStore((state) => state.slots[index]);
  const isCurrent = useCardStore((state) => state.current === index);
  const leave = useCardStore((state) => state.leave);
  const stay = useCardStore((state) => state.stay);
  const dpr = useScreenDpr();
  const pointer = useRef<Pointer | null>(null);
  const press = useRef<readonly [number, number] | null>(null);
  const [getPointer] = useState(() => () => pointer.current);
  const isInteractive = Boolean(slot) && isCurrent;
  // Свободный холст сохраняет последний размер: следующей карточке не придётся
  // ждать, пока он перестроится из запасного размера.
  const [lastBox, setLastBox] = useState<Box | null>(null);
  const currentBox = slot?.card.box ?? null;
  if (currentBox && currentBox !== lastBox) setLastBox(currentBox);
  const box = currentBox ?? lastBox;

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    pointer.current = toPointer(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());
  };
  // Мышка ушла — модель не убираем сразу, а даём ей плавно вернуться домой.
  const handlePointerLeave = () => {
    pointer.current = null;
    if (isInteractive) leave();
  };
  // Мышка вернулась на ту же модель посреди возврата — возврат прерывается.
  const handlePointerEnter = () => {
    if (isInteractive) stay();
  };
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    press.current = [event.clientX, event.clientY];
  };
  // Щелчок без поворота открывает страницу машины; поворот мышкой — нет.
  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = press.current;
    press.current = null;
    const href = slot?.card.href;
    if (!start || !href) return;
    if (Math.hypot(event.clientX - start[0], event.clientY - start[1]) <= ICON.clickSlop) router.push(href);
  };

  const isShown = Boolean(slot?.isReady);

  return (
    <div
      style={{
        position: "absolute",
        top: box?.top ?? 0,
        left: box?.left ?? 0,
        width: box?.width ?? ICON.snapshotSize,
        height: box?.height ?? ICON.snapshotSize,
        visibility: slot ? "visible" : "hidden",
        pointerEvents: isInteractive ? "auto" : "none",
        // Пока модель не нарисовалась, сквозь пустой холст виден снимок. Нарисовалась —
        // закрываем снимок фоном, иначе повёрнутая модель и снимок видны вместе.
        backgroundColor: isShown ? THEME.bg : "transparent",
        // Модель под мышкой — поверх той, что доигрывает возврат.
        zIndex: isCurrent ? 1 : 0,
      }}
      className="cursor-grab active:cursor-grabbing"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <PointerContext.Provider value={getPointer}>
        {/*
          Холст показывается, только когда новая модель нарисовала свой первый кадр.
          До этого на холсте может оставаться последний кадр прошлой карточки — если
          его показать, две разные машины наложатся друг на друга.
        */}
        <div className="h-full w-full" style={{ opacity: isShown ? 1 : 0 }}>
          <Canvas frameloop="demand" dpr={dpr} gl={{ alpha: true, antialias: true }} camera={{ fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far }}>
            {slot && (
              <Live
                key={specKey(slot.card.spec)}
                index={index}
                spec={slot.card.spec}
                width={slot.card.box.width}
                isLeaving={slot.isLeaving}
              />
            )}
          </Canvas>
        </div>
      </PointerContext.Provider>
    </div>
  );
}

/** Два живых холста: под мышкой и доигрывающий возврат. Окно поменяло размер — оба убираем. */
function LiveLayer() {
  const clear = useCardStore((state) => state.clear);
  useEffect(() => {
    window.addEventListener("resize", clear);
    return () => window.removeEventListener("resize", clear);
  }, [clear]);

  return createPortal(
    <div className="absolute left-0 top-0 z-20">
      <LiveCanvas index={0} />
      <LiveCanvas index={1} />
    </div>,
    document.body,
  );
}

/** Всё трёхмерное для карточек страницы: съёмка снимков и живые холсты. Ставится на страницу один раз. */
export default function CardStage() {
  return (
    <>
      <SnapshotCanvas />
      <LiveLayer />
    </>
  );
}
