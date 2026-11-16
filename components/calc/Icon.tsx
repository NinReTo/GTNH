import { ATLAS_URL } from "@/lib/calc/load";
import type { Goods } from "@/lib/calc/repository";
import { CALC } from "@/lib/config";

const { iconsPerRow, iconSize } = CALC.ui;

/** Значок товара из атласа выгрузки. */
export function Icon({ goods }: { goods: Goods }) {
  const x = (goods.iconId % iconsPerRow) * iconSize;
  const y = Math.floor(goods.iconId / iconsPerRow) * iconSize;
  return (
    <span
      aria-hidden
      className="pixelated inline-block shrink-0 align-middle"
      style={{ width: iconSize, height: iconSize, background: `url(${ATLAS_URL}) -${x}px -${y}px` }}
    />
  );
}
