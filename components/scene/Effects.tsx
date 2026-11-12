"use client";

import { useEffect, useMemo, useRef, type ReactElement } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Bloom, ChromaticAberration, EffectComposer, Noise, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode, type EffectComposer as ComposerImpl } from "postprocessing";
import { Vector2 } from "three";
import { PERF, POST } from "@/lib/config";
import { transitionProgress } from "@/lib/scroll";
import { useSceneStore, type EffectName } from "@/lib/store";
import { TransitionEffect } from "./TransitionEffect";

declare global {
  interface Window {
    /** Замер: среднее время кадра в миллисекундах. Доступен только на странице с ?bench. */
    __ebfBench?: () => number;
  }
}

interface EffectsProps {
  readonly disabled: ReadonlySet<EffectName>;
  readonly bench: boolean;
  readonly multisampling: number;
}

/**
 * Вся постобработка — готовые эффекты; свой здесь один (переход).
 * Порядок важен: тональная компрессия идёт ДО перехода, иначе заливка
 * исказится и перестанет совпадать с цветом страницы.
 */
export function Effects({ disabled, bench, multisampling }: EffectsProps) {
  const composer = useRef<ComposerImpl>(null);
  const gl = useThree((state) => state.gl);
  const transition = useMemo(() => new TransitionEffect(), []);
  const chromaticOffset = useMemo(() => new Vector2(POST.chromaticOffset, POST.chromaticOffset), []);

  useFrame(() => {
    transition.setProgress(transitionProgress(useSceneStore.getState().progress));
  });

  // Честный замер: рисуем кадры подряд и после каждого читаем один пиксель —
  // это заставляет видеокарту закончить работу, а не просто принять команды.
  // Тени перерисовываются на каждом кадре, как при движении блоков: меряем худший случай.
  useEffect(() => {
    if (!bench) return;
    const run = (frames: number): number => {
      const context = gl.getContext();
      // Один пиксель RGBA — столько же байт, сколько в одном 32-битном числе.
      const pixel = new Uint8Array(Uint32Array.BYTES_PER_ELEMENT);
      const start = performance.now();
      for (let frame = 0; frame < frames; frame += 1) {
        gl.shadowMap.needsUpdate = true;
        composer.current?.render();
        context.readPixels(0, 0, 1, 1, context.RGBA, context.UNSIGNED_BYTE, pixel);
      }
      return (performance.now() - start) / frames;
    };
    window.__ebfBench = () => {
      run(PERF.benchWarmupFrames);
      return run(PERF.benchFrames);
    };
    return () => {
      delete window.__ebfBench;
    };
  }, [bench, gl]);

  const passes: ReactElement[] = [];
  if (!disabled.has("bloom")) {
    passes.push(
      <Bloom
        key="bloom"
        mipmapBlur
        intensity={POST.bloom.intensity}
        luminanceThreshold={POST.bloom.luminanceThreshold}
        luminanceSmoothing={POST.bloom.luminanceSmoothing}
        radius={POST.bloom.radius}
        levels={POST.bloom.levels}
      />,
    );
  }
  if (!disabled.has("chromatic")) {
    passes.push(
      <ChromaticAberration key="chromatic" offset={chromaticOffset} radialModulation={false} modulationOffset={0} />,
      <Noise key="noise" premultiply opacity={POST.noiseOpacity} />,
    );
  }
  passes.push(<ToneMapping key="tone" mode={ToneMappingMode.ACES_FILMIC} />);
  if (!disabled.has("transition")) {
    passes.push(<primitive key="transition" object={transition} />);
  }

  return (
    <EffectComposer ref={composer} multisampling={multisampling}>
      {passes}
    </EffectComposer>
  );
}
