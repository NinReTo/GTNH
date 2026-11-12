"use client";

import { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { pickDpr } from "@/lib/perf";

/**
 * Значки рисуются только когда это нужно. Холст прибит к окну, а значки
 * едут вместе со страницей — поэтому при прокрутке и смене размера окна
 * надо перерисовать кадр, иначе значки останутся на старом месте.
 */
function RedrawOnScroll() {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const redraw = () => invalidate();
    // capture: true — ловим прокрутку не только окна, но и любого блока внутри страницы.
    window.addEventListener("scroll", redraw, { passive: true, capture: true });
    window.addEventListener("resize", redraw);
    // Страница может сдвинуться и без прокрутки — догрузился шрифт или картинка. Тогда тоже перерисовываем.
    const layout = new ResizeObserver(redraw);
    layout.observe(document.body);
    return () => {
      window.removeEventListener("scroll", redraw, { capture: true });
      window.removeEventListener("resize", redraw);
      layout.disconnect();
    };
  }, [invalidate]);
  return null;
}

/**
 * Один общий холст для всех трёхмерных значков на странице. Готовый
 * компонент View из drei рисует каждую постройку в квадрате её значка:
 * у браузера ограничено число холстов с 3D, а один холст на всё — дешевле.
 * Холст прозрачный и пропускает мышь насквозь: наведение и клики ловят
 * сами значки — обычные ссылки на странице.
 */
export default function IconStage() {
  const [dpr, setDpr] = useState(1);
  useEffect(() => {
    const update = () => setDpr(pickDpr(window.innerWidth, window.innerHeight, window.devicePixelRatio));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <Canvas
      frameloop="demand"
      dpr={dpr}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      // Свой стиль холста перекрывает встроенный (position: relative): холст прибит к окну.
      style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
      className="z-20"
    >
      <View.Port />
      <RedrawOnScroll />
    </Canvas>
  );
}
