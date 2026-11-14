"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void): () => void {
  // Масштаб страницы (Ctrl + колёсико) меняет плотность точек и всегда вызывает resize.
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

const read = () => window.devicePixelRatio;
const readOnServer = () => 1;

/**
 * Плотность экранных точек, живая: меняется при смене масштаба страницы.
 * Снимки и живые модели берут её отсюда, поэтому у них она всегда одна и та же.
 */
export function useDevicePixelRatio(): number {
  return useSyncExternalStore(subscribe, read, readOnServer);
}
