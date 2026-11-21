"use client";

import { useMemo, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import type { FactoryMarker } from "@/lib/calc/factory";
import { EBF, FACTORY_LABELS as LABELS } from "@/lib/config";
import { pick, type Lang } from "@/lib/lang";

const BADGE: Record<FactoryMarker["kind"], string> = {
  row: "border-line bg-bg/90 text-text1",
  product: "border-accent bg-bg/95 text-accent",
  surplus: "border-red-400 bg-bg/95 text-red-300",
};
const PRIORITY: Record<FactoryMarker["kind"], number> = { product: 0, surplus: 1, row: 2 };

interface LabelGroup {
  readonly ids: number[];
  readonly compact: boolean;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

function placeLabel(node: HTMLDivElement, { x, y }: LabelGroup, size: { width: number; height: number }) {
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  const panelWidth = Math.min(size.width, LABELS.tooltipWidth);
  const offset = Math.max(0, Math.min(x - panelWidth / 2, size.width - panelWidth)) - x;
  node.style.setProperty("--panel-offset", `${offset}px`);
  node.style.setProperty("--panel-width", `${panelWidth}px`);
  node.dataset.below = String(y < size.height / 2);
}

export function FactoryMarkers({ markers, lang }: { markers: readonly FactoryMarker[]; lang: Lang }) {
  const [groups, setGroups] = useState<readonly LabelGroup[]>([]);
  const signature = useRef("");
  const nodes = useRef(new Map<number, HTMLDivElement>());
  const point = useRef(new Vector3());
  const size = useThree((state) => state.size);
  const ordered = useMemo(() => markers.map((marker, id) => ({ marker, id }))
    .sort((a, b) => PRIORITY[a.marker.kind] - PRIORITY[b.marker.kind]), [markers]);

  useFrame(({ camera, size }) => {
    const next: LabelGroup[] = [];
    const projected = point.current;
    const pixels = (camera.projectionMatrix.elements[5] * size.height) / 2;
    for (const { marker, id } of ordered) {
      projected.set(...marker.at).applyMatrix4(camera.matrixWorldInverse);
      const depth = -projected.z;
      if (depth <= 0) continue;
      const compact = pixels * EBF.blockSize / depth < LABELS.detailPerBlock;
      projected.applyMatrix4(camera.projectionMatrix);
      if (Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1 || Math.abs(projected.z) > 1) continue;
      const x = (projected.x + 1) * size.width / 2;
      const y = (1 - projected.y) * size.height / 2;
      const width = compact ? LABELS.overviewWidth : Math.min(LABELS.titleWidth, marker.title.length * LABELS.charWidth + LABELS.labelPadding);
      const height = compact ? LABELS.overviewHeight : LABELS.labelHeight;
      const group = next.find((other) => Math.abs(other.x - x) < (other.width + width) / 2 &&
        Math.abs(other.y - y) < (other.height + height) / 2);
      if (group) group.ids.push(id);
      else next.push({ ids: [id], compact, x, y, width, height });
    }

    for (const group of next) {
      const node = nodes.current.get(group.ids[0]);
      if (node) placeLabel(node, group, size);
    }
    // Координаты обновляются без перерисовки React. Меняем DOM только когда поменялся состав плашек.
    const key = next.map(({ ids, compact }) => `${ids.join(",")}:${compact}`).join(";");
    if (signature.current !== key) {
      signature.current = key;
      setGroups(next);
    }
  });

  return (
    <Html fullscreen calculatePosition={(_object, _camera, size) => [size.width / 2, size.height / 2]}
      onOcclude={() => {}} zIndexRange={[LABELS.layer, LABELS.layer]} style={{ pointerEvents: "none" }}>
      {groups.map((group) => {
        const { ids, compact } = group;
        const [id] = ids;
        const marker = markers[id];
        if (!marker) return null;
        const many = ids.length > 1;
        const title = many ? pick(lang, `Подписи поблизости (${ids.length})`, `Nearby labels (${ids.length})`) : marker.title;
        return (
          <div key={id} ref={(node) => {
            if (!node) { nodes.current.delete(id); return; }
            nodes.current.set(id, node);
            placeLabel(node, group, size);
          }} className="group absolute hover:z-20 focus-within:z-20">
            <button type="button" aria-label={title}
              className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 truncate rounded-sm border px-1 font-mono text-[10px] leading-4 ${BADGE[marker.kind]}`}
              style={{ maxWidth: LABELS.titleWidth }}>
              {many ? ids.length : compact ? "•" : marker.title}
            </button>
            <div className="absolute z-10 hidden pb-2 group-hover:block group-focus-within:block group-data-[below=true]:top-0 group-data-[below=true]:pb-0 group-data-[below=true]:pt-2 bottom-0 group-data-[below=true]:bottom-auto"
              style={{ left: "var(--panel-offset)", width: "var(--panel-width)" }}>
              <div className="pointer-events-auto max-h-48 overflow-auto border border-line bg-bg/95 px-2 py-1 font-mono text-[11px] leading-relaxed text-text2">
                {ids.map((member) => {
                  const item = markers[member];
                  if (!item) return null;
                  return (
                    <div key={member} className="border-b border-line py-1 last:border-b-0">
                      <div className="text-text1">{item.title}</div>
                      {item.lines.length > 0 && <div className="whitespace-pre-wrap break-words">{item.lines.join("\n")}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </Html>
  );
}
