import { kindsOf, structureOf, type Machine } from "../machines";
import { FACES } from "../structure";

export const BLUEPRINT_PREFIX = "GTNH1.";
// Ограничения совпадают с модом. Лимит объёма защищает выделение памяти в Schematica.
const MAX_BLOCKS = 200_000;
const MAX_VOLUME = 4_000_000;
const MAX_SIDE = 4096;
const MAX_HEIGHT = 256;
const BASE64_CHUNK = 8192;

export function blueprintData(machine: Machine, title: string) {
  const { blocks, size } = structureOf(machine);
  if (!blocks.length || blocks.length > MAX_BLOCKS || size.some((side, axis) => side > (axis === 1 ? MAX_HEIGHT : MAX_SIDE)) ||
    size.reduce((volume, side) => volume * side, 1) > MAX_VOLUME) throw new Error("blueprint-size");
  const kinds = kindsOf(machine);
  const [first] = blocks;
  const min = [...first.grid];
  for (const block of blocks) block.grid.forEach((at, axis) => { min[axis] = Math.min(min[axis], at); });
  const index = new Map<string, number>();
  const palette: { kind: string; name: string; item?: string; damage?: number }[] = [];
  const entries = blocks.map((block) => {
    let id = index.get(block.kind);
    if (id === undefined) {
      id = palette.length;
      const spec = kinds[block.kind];
      const goods = spec?.gameItem;
      palette.push({ kind: block.kind, name: spec?.gameName ?? spec?.label ?? block.kind,
        item: goods ? `${goods.mod}:${goods.internalName}` : undefined, damage: goods?.damage });
      index.set(block.kind, id);
    }
    const face = block.face ? FACES.indexOf(block.face) : -1;
    const links = FACES.reduce((mask, side, i) => block.links?.includes(side) ? mask | (1 << i) : mask, 0);
    return [...block.grid.map((at, axis) => at - min[axis]), id, face, links];
  });
  return { title: title.trim(), tier: machine.tier, size, palette, blocks: entries };
}

export async function encodeBlueprint(machine: Machine, title: string): Promise<string> {
  const json = JSON.stringify(blueprintData(machine, title));
  const stream = new Blob([json]).stream().pipeThrough(new CompressionStream("gzip"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let binary = "";
  for (let at = 0; at < bytes.length; at += BASE64_CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(at, at + BASE64_CHUNK));
  }
  return BLUEPRINT_PREFIX + btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
