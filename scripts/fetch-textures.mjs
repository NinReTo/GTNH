/**
 * Скачивает все текстуры проекта и переводит их в WebP.
 *
 *   node scripts/fetch-textures.mjs
 *
 * Источники:
 *  - блоки печи — оригинальные текстуры GT5-Unofficial (LGPL-3.0), с GitHub;
 *  - металл (нормали и шероховатость) — ambientCG (CC0);
 *  - бетонный пол и карта окружения — Poly Haven (CC0).
 *
 * Нормали берутся в варианте OpenGL (зелёный канал «вверх»): three.js ждёт
 * именно его, с вариантом DirectX рельеф выглядит вдавленным.
 *
 * Все числа — из lib/config.ts (Node запускает .ts напрямую).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { unzipSync } from "fflate";
import { ASSETS, GAME } from "../lib/config.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_GT = path.join(ROOT, "public", "textures", "gregtech");
const OUT_PBR = path.join(ROOT, "public", "textures", "pbr");
const OUT_HDRI = path.join(ROOT, "public", "hdri");

const GT_BASE = `https://raw.githubusercontent.com/GTNewHorizons/GT5-Unofficial/${ASSETS.gregtechCommit}/src/main/resources/assets/gregtech/textures/blocks/iconsets`;
const HEADERS = { "User-Agent": "texture-fetch-script" };

async function download(url) {
  const response = await fetch(url, { headers: HEADERS, redirect: "follow" });
  if (!response.ok) throw new Error(`Не удалось скачать ${url}: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

/** Текстура блока мода: верхний квадрат (у анимированных это первый кадр), строго 16×16. */
async function gtTexture(name) {
  const source = await download(`${GT_BASE}/${name}.png`);
  const meta = await sharp(source).metadata();
  const side = meta.width;
  return sharp(source)
    .extract({ left: 0, top: 0, width: side, height: side })
    .resize(ASSETS.blockTextureSize, ASSETS.blockTextureSize, { kernel: "nearest" })
    .ensureAlpha()
    .png()
    .toBuffer();
}

/** Пиксельные текстуры сохраняем без потерь: сжатие с потерями размазало бы пиксели 16×16. */
async function savePixel(buffer, file) {
  await sharp(buffer).webp({ lossless: true }).toFile(path.join(OUT_GT, file));
  console.log("  ✓", file);
}

/** Грань люка = корпус + накладки поверх, как это делает сам мод. */
async function composeFace(base, overlays, file) {
  const layers = [];
  for (const name of overlays) layers.push({ input: await gtTexture(name) });
  const composed = await sharp(base).composite(layers).png().toBuffer();
  await savePixel(composed, file);
}

async function fetchGregtech() {
  console.log("GregTech (LGPL-3.0):");
  const casing = await gtTexture("MACHINE_HEATPROOFCASING");
  await savePixel(casing, "casing.webp");

  await composeFace(casing, ["OVERLAY_FRONT_ELECTRIC_BLAST_FURNACE_ACTIVE"], "controller.webp");
  await composeFace(casing, ["OVERLAY_MUFFLER"], "muffler.webp");
  await composeFace(casing, ["OVERLAY_MAINTENANCE"], "maintenance.webp");
  await composeFace(casing, ["OVERLAY_PIPE_IN", "ITEM_IN_SIGN"], "input-bus.webp");
  await composeFace(casing, ["OVERLAY_PIPE_OUT", "ITEM_OUT_SIGN"], "output-bus.webp");
  await composeFace(casing, ["OVERLAY_PIPE_IN", "FLUID_IN_SIGN"], "input-hatch.webp");
  await composeFace(casing, ["OVERLAY_ENERGY_IN_MULTI_2A_LV"], "energy.webp");

  // Светящиеся пиксели экрана контроллера — на чёрном фоне, как карта свечения.
  const glow = await gtTexture("OVERLAY_FRONT_ELECTRIC_BLAST_FURNACE_ACTIVE_GLOW");
  const glowOnBlack = await sharp(glow).flatten({ background: "#000000" }).png().toBuffer();
  await savePixel(glowOnBlack, "controller-glow.webp");

  for (const coil of GAME.coils) {
    const texture = await gtTexture(`MACHINE_COIL_${coil.id.toUpperCase()}`);
    await savePixel(texture, `coil-${coil.id}.webp`);
  }
}

async function saveMap(buffer, file, size, { normal = false, grey = false } = {}) {
  let image = sharp(buffer).resize(size, size);
  if (grey) image = image.greyscale();
  await image
    .webp({ quality: normal ? ASSETS.webpNormalQuality : ASSETS.webpQuality })
    .toFile(path.join(OUT_PBR, file));
  console.log("  ✓", file);
}

async function fetchAmbientCg() {
  console.log("ambientCG (CC0): Metal038");
  const zip = await download("https://ambientcg.com/get?file=Metal038_2K-JPG.zip");
  const files = unzipSync(new Uint8Array(zip));
  const pick = (suffix) => {
    const key = Object.keys(files).find((name) => name.endsWith(suffix));
    if (!key) throw new Error(`В архиве ambientCG нет файла ${suffix}`);
    return Buffer.from(files[key]);
  };
  await saveMap(pick("_NormalGL.jpg"), "metal-normal.webp", ASSETS.metalTextureSize, { normal: true });
  await saveMap(pick("_Roughness.jpg"), "metal-roughness.webp", ASSETS.metalTextureSize, { grey: true });
}

async function fetchPolyHaven() {
  console.log("Poly Haven (CC0): concrete_floor_02, industrial_workshop_foundry");
  const floor = await (await fetch("https://api.polyhaven.com/files/concrete_floor_02", { headers: HEADERS })).json();
  await saveMap(await download(floor.Diffuse["2k"].jpg.url), "floor-color.webp", ASSETS.floorTextureSize);
  await saveMap(await download(floor.nor_gl["2k"].jpg.url), "floor-normal.webp", ASSETS.floorTextureSize, { normal: true });
  await saveMap(await download(floor.Rough["2k"].jpg.url), "floor-roughness.webp", ASSETS.floorTextureSize, { grey: true });

  const hdri = await (await fetch("https://api.polyhaven.com/files/industrial_workshop_foundry", { headers: HEADERS })).json();
  await writeFile(path.join(OUT_HDRI, "workshop_1k.hdr"), await download(hdri.hdri["1k"].hdr.url));
  console.log("  ✓ workshop_1k.hdr");
}

await mkdir(OUT_GT, { recursive: true });
await mkdir(OUT_PBR, { recursive: true });
await mkdir(OUT_HDRI, { recursive: true });
await fetchGregtech();
await fetchAmbientCg();
await fetchPolyHaven();
console.log("Готово.");
