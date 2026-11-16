import { BoxGeometry, type BufferGeometry } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { SHAPES } from "@/lib/config";
import type { Box } from "@/lib/shapes";

/**
 * Геометрия блока неполной формы: бруски в клетке со стороной side. Текстура
 * ложится как в игре — проекцией на клетку: брусок в полблока показывает половину картинки,
 * а не сжатую целую.
 */
export function shapeGeometry(boxes: readonly Box[], side: number): BufferGeometry {
  const unit = side / SHAPES.pixels;
  const parts = boxes.map(([from, to]) => {
    const size = from.map((start, axis) => (to[axis] - start) * unit);
    const middle = from.map((start, axis) => ((start + to[axis]) / 2) * unit - side / 2);
    return new BoxGeometry(size[0], size[1], size[2]).translate(middle[0], middle[1], middle[2]);
  });
  // Один брусок (сундук) не склеиваем: у него остаются шесть групп граней, и передней можно дать свою текстуру.
  const [single] = parts;
  const merged = parts.length === 1 ? single : mergeGeometries(parts);
  if (parts.length > 1) parts.forEach((part) => part.dispose());

  const { position, normal, uv } = merged.attributes;
  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index) / side + 1 / 2;
    const y = position.getY(index) / side + 1 / 2;
    const z = position.getZ(index) / side + 1 / 2;
    // Грань смотрит вдоль одной оси — две другие дают место на картинке.
    if (Math.abs(normal.getX(index)) > 1 / 2) uv.setXY(index, z, y);
    else if (Math.abs(normal.getY(index)) > 1 / 2) uv.setXY(index, x, z);
    else uv.setXY(index, x, y);
  }
  uv.needsUpdate = true;
  return merged;
}
