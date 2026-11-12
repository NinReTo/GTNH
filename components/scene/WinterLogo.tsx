"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, RoundedBox, useTexture } from "@react-three/drei";
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  Color,
  ExtrudeGeometry,
  NoToneMapping,
  RepeatWrapping,
  SRGBColorSpace,
  Shape,
  type Mesh,
  type Points,
  type Texture,
} from "three";
import { CAMERA, HERO, LOGO, MATERIAL, SNOW, THEME, WINTER, WORKSHOP } from "@/lib/config";
import { logoArcs, logoBars, logoOffsetX, placeBar, snowCaps, winterCamera, type Arc } from "@/lib/logo";
import { pickDpr } from "@/lib/perf";
import { flakePosition, makeFlakes } from "@/lib/snow";
import { Effects } from "./Effects";
import { readSettings } from "./SceneCanvas";

/** Координат на одну снежинку: x, y, z. */
const POSITION_SIZE = ["x", "y", "z"].length;

/** Полный оборот в радианах: пределы поворота в настройках заданы долями оборота. */
const TURN = Math.PI * 2;

/** Дуга кольца: полоса между двумя окружностями, вытянутая в толщину со скосом рёбер. */
function arcGeometry(arc: Arc): ExtrudeGeometry {
  const inner = LOGO.ringRadius - LOGO.band / 2;
  const outer = LOGO.ringRadius + LOGO.band / 2;
  const shape = new Shape();
  shape.absarc(0, 0, outer, arc.start, arc.end, false);
  shape.absarc(0, 0, inner, arc.end, arc.start, true);
  shape.closePath();
  const body = LOGO.depth - LOGO.bevel * 2;
  const geometry = new ExtrudeGeometry(shape, {
    depth: body,
    bevelEnabled: true,
    bevelThickness: LOGO.bevel,
    bevelSize: LOGO.bevel,
    curveSegments: LOGO.curveSegments,
  });
  geometry.translate(0, 0, -body / 2);
  return geometry;
}

function Gold() {
  return (
    <meshPhysicalMaterial
      color={LOGO.gold}
      metalness={LOGO.goldMetalness}
      roughness={LOGO.goldRoughness}
      sheen={MATERIAL.sheen}
      sheenColor={LOGO.snowColor}
      sheenRoughness={MATERIAL.sheenRoughness}
    />
  );
}

/** Золотая эмблема: две дуги, перекладины N и H, зубцы шестерни и снег на всём горизонтальном. */
function Emblem() {
  const arcs = useMemo(() => logoArcs().map((arc) => ({ id: arc.id, geometry: arcGeometry(arc) })), []);
  const bars = useMemo(() => logoBars().map((bar) => ({ id: bar.id, ...placeBar(bar) })), []);
  const caps = useMemo(() => snowCaps(), []);

  return (
    <group>
      {arcs.map((arc) => (
        <mesh key={arc.id} geometry={arc.geometry}>
          <Gold />
        </mesh>
      ))}
      {bars.map((bar) => (
        <RoundedBox
          key={bar.id}
          args={[bar.length, LOGO.band, LOGO.depth]}
          radius={LOGO.bevel}
          position={[bar.center[0], bar.center[1], 0]}
          rotation-z={bar.angle}
        >
          <Gold />
        </RoundedBox>
      ))}
      {caps.map((cap) => (
        <RoundedBox
          key={cap.id}
          args={[cap.width, LOGO.snowCap, LOGO.depth]}
          radius={LOGO.snowRound}
          position={[cap.center[0], cap.center[1], 0]}
          rotation-z={cap.angle}
        >
          <meshStandardMaterial color={LOGO.snowColor} roughness={1} />
        </RoundedBox>
      ))}
    </group>
  );
}

/** Планета за эмблемой — зимняя, бледная, медленно вращается; вокруг голубое свечение атмосферы. */
function Globe() {
  const map = useTexture("/textures/pbr/earth.webp");
  const globe = useRef<Mesh>(null);
  const atmosphere = useMemo(() => new Color(LOGO.atmosphereColor).multiplyScalar(LOGO.atmosphereIntensity), []);

  useLayoutEffect(() => {
    map.colorSpace = SRGBColorSpace;
    map.anisotropy = MATERIAL.anisotropy;
    map.needsUpdate = true;
  }, [map]);

  useFrame((_, delta) => {
    if (globe.current) globe.current.rotation.y += delta * LOGO.globeSpin;
  });

  return (
    <group>
      <mesh ref={globe}>
        <sphereGeometry args={[LOGO.globeRadius, LOGO.globeSegments, LOGO.globeSegments]} />
        <meshStandardMaterial
          map={map}
          color={LOGO.globeTint}
          roughness={1}
          emissive={LOGO.globeGlowColor}
          emissiveIntensity={LOGO.globeGlow}
        />
      </mesh>
      <mesh scale={LOGO.atmosphereScale}>
        <sphereGeometry args={[LOGO.globeRadius, LOGO.globeSegments, LOGO.globeSegments]} />
        <meshBasicMaterial
          color={atmosphere}
          transparent
          opacity={LOGO.atmosphereOpacity}
          side={BackSide}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Снежный пол: настоящие карты снега, повторённые по площади. */
function SnowGround() {
  const textures = useTexture({
    map: "/textures/pbr/snow-color.webp",
    normalMap: "/textures/pbr/snow-normal.webp",
    roughnessMap: "/textures/pbr/snow-roughness.webp",
  }) as Record<"map" | "normalMap" | "roughnessMap", Texture>;

  useLayoutEffect(() => {
    const repeats = WINTER.groundSize / WINTER.groundMetersPerRepeat;
    Object.values(textures).forEach((texture) => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.repeat.set(repeats, repeats);
      texture.anisotropy = MATERIAL.anisotropy;
      texture.needsUpdate = true;
    });
    textures.map.colorSpace = SRGBColorSpace;
  }, [textures]);

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[WINTER.groundSize, WINTER.groundSize]} />
      <meshStandardMaterial {...textures} />
    </mesh>
  );
}

/**
 * Снегопад: квадратные снежинки, как частицы снега в Minecraft. Все — одна
 * группа точек, рисуется за один раз; каждый кадр пересчитываются только
 * их места — чистой функцией времени.
 */
function Snowfall() {
  const flakes = useMemo(() => makeFlakes(), []);
  const points = useRef<Points>(null);
  const positions = useMemo(() => new Float32Array(flakes.length * POSITION_SIZE), [flakes]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    flakes.forEach((flake, index) => {
      positions.set(flakePosition(flake, time), index * POSITION_SIZE);
    });
    const attribute = points.current?.geometry.getAttribute("position");
    if (attribute) attribute.needsUpdate = true;
  });

  useLayoutEffect(() => {
    points.current?.geometry.setAttribute("position", new BufferAttribute(positions, POSITION_SIZE));
  }, [positions]);

  return (
    <points ref={points}>
      <bufferGeometry />
      <pointsMaterial color={SNOW.color} size={SNOW.size} sizeAttenuation transparent opacity={SNOW.opacity} depthWrite={false} />
    </points>
  );
}

/** Пока шапка на экране — кадры идут непрерывно (падает снег); ушла с экрана — рисование останавливается. */
function useIsOnScreen(element: RefObject<HTMLDivElement | null>): boolean {
  const [isOnScreen, setOnScreen] = useState(true);
  useEffect(() => {
    if (!element.current) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(element.current);
    return () => observer.disconnect();
  }, [element]);
  return isOnScreen;
}

/** Главная шапка: 3D-эмблема GT New Horizons над снегом, идёт снег. Мышкой эмблему можно немного повернуть. */
export default function WinterLogo() {
  const wrapper = useRef<HTMLDivElement>(null);
  const isOnScreen = useIsOnScreen(wrapper);
  // Разъезд цветовых каналов расщепляет крошечные снежинки на красную и синюю точки — в зимней шапке он выключен.
  const [settings] = useState(() => {
    const base = readSettings();
    return { ...base, disabled: new Set([...base.disabled, "chromatic" as const]) };
  });
  const [aspect] = useState(() => window.innerWidth / (window.innerHeight * HERO.screens));
  const [dpr] = useState(() => pickDpr(window.innerWidth, window.innerHeight, window.devicePixelRatio));
  const camera = winterCamera(aspect);
  const offset = logoOffsetX(aspect);

  return (
    <div ref={wrapper} className="h-full w-full cursor-grab active:cursor-grabbing">
      <Canvas
        frameloop={isOnScreen ? "always" : "demand"}
        dpr={dpr * settings.dprScale}
        gl={{ antialias: false, toneMapping: NoToneMapping, powerPreference: "high-performance" }}
        camera={{ fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far, position: [...camera.position] }}
      >
        <color attach="background" args={[THEME.bg]} />
        <fog attach="fog" args={[THEME.bg, WINTER.fogNear, WINTER.fogFar]} />
        <directionalLight position={[...WINTER.keyLightPosition]} color={WINTER.keyLightColor} intensity={WINTER.keyLightIntensity} />
        <Suspense fallback={null}>
          <Environment files="/hdri/winter_evening_1k.hdr" environmentIntensity={WINTER.environmentIntensity} />
          <group position={[offset, LOGO.height, 0]}>
            <Globe />
            <group position-z={LOGO.frontOffset}>
              <Emblem />
            </group>
          </group>
          <SnowGround />
          <ContactShadows
            frames={1}
            position={[offset, 0, 0]}
            opacity={WORKSHOP.contactShadowOpacity}
            blur={WORKSHOP.contactShadowBlur}
            scale={WORKSHOP.contactShadowScale}
            far={WORKSHOP.contactShadowFar}
            resolution={WORKSHOP.contactShadowResolution}
          />
        </Suspense>
        <Snowfall />
        <OrbitControls
          makeDefault
          target={[...camera.target]}
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={CAMERA.dampingFactor}
          rotateSpeed={CAMERA.rotateSpeed}
          minAzimuthAngle={-WINTER.maxTurn * TURN}
          maxAzimuthAngle={WINTER.maxTurn * TURN}
          minPolarAngle={CAMERA.minPolarAngle}
          maxPolarAngle={CAMERA.maxPolarAngle}
        />
        <Effects disabled={settings.disabled} bench={settings.bench} multisampling={settings.multisampling} />
      </Canvas>
    </div>
  );
}
