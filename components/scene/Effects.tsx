"use client";

import { useEffect, useRef, type ReactElement } from "react";
import { useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode, type EffectComposer as ComposerImpl } from "postprocessing";
import { PERF, POST } from "@/lib/config";
import type { EffectName } from "@/lib/store";

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

/** Вся постобработка — готовые эффекты из @react-three/postprocessing, своих шейдеров нет. */
export function Effects({ disabled, bench, multisampling }: EffectsProps) {
  const composer = useRef<ComposerImpl>(null);
  const gl = useThree((state) => state.gl);

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
  // Разъезд цветовых каналов и зерно убраны по просьбе: они размывали края пиксельных текстур.
  passes.push(<ToneMapping key="tone" mode={ToneMappingMode.ACES_FILMIC} />);

  return (
    <EffectComposer ref={composer} multisampling={multisampling}>
      {passes}
    </EffectComposer>
  );
}
