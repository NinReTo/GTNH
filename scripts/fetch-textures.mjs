/**
 * Скачивает все текстуры проекта и переводит их в WebP.
 *
 *   node scripts/fetch-textures.mjs            — всё
 *   node scripts/fetch-textures.mjs gregtech   — только текстуры мода
 *   node scripts/fetch-textures.mjs winter     — только зимняя шапка
 *
 * Источники:
 *  - блоки машин — оригинальные текстуры GT5-Unofficial (LGPL-3.0), с GitHub;
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

const ASSETS_BASE = `https://raw.githubusercontent.com/GTNewHorizons/GT5-Unofficial/${ASSETS.gregtechCommit}/src/main/resources/assets`;
const ICONSETS = "gregtech/textures/blocks/iconsets";
const MATERIAL_ICONS = "gregtech/textures/blocks/materialicons/NONE";
const HEADERS = { "User-Agent": "texture-fetch-script" };

async function download(url) {
  const response = await fetch(url, { headers: HEADERS, redirect: "follow" });
  if (!response.ok) throw new Error(`Не удалось скачать ${url}: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

/** Текстура блока мода: верхний квадрат (у анимированных это первый кадр), строго 16×16. */
async function gtTexture(name, folder = ICONSETS) {
  const source = await download(`${ASSETS_BASE}/${folder}/${name}.png`);
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

/** Грань = основа + накладки поверх, как это делает сам мод при отрисовке. */
async function composeFace(base, overlays, file) {
  const layers = [];
  for (const name of overlays) layers.push({ input: await gtTexture(name) });
  const composed = await sharp(base).composite(layers).png().toBuffer();
  await savePixel(composed, file);
  return composed;
}

/** Светящиеся пиксели — на чёрном фоне, как карта свечения. */
async function saveGlow(name, file) {
  const glow = await gtTexture(name);
  await savePixel(await sharp(glow).flatten({ background: "#000000" }).png().toBuffer(), file);
}

/**
 * Серая текстура материала, умноженная на его цвет: так мод красит рамы и
 * блоки металлов. Прозрачность сохраняется — у рамы она и есть «дыры».
 */
async function tinted(name, [red, green, blue]) {
  const { data, info } = await sharp(await gtTexture(name, MATERIAL_ICONS)).raw().toBuffer({ resolveWithObject: true });
  const factors = [red, green, blue].map((channel) => channel / ASSETS.colorMax);
  for (let offset = 0; offset < data.length; offset += info.channels) {
    factors.forEach((factor, channel) => {
      data[offset + channel] = Math.round(data[offset + channel] * factor);
    });
  }
  return sharp(data, { raw: info }).png().toBuffer();
}

async function fetchEbf() {
  console.log("GregTech (LGPL-3.0): электрическая доменная печь");
  const casing = await gtTexture("MACHINE_HEATPROOFCASING");
  await savePixel(casing, "casing.webp");

  await composeFace(casing, ["OVERLAY_FRONT_ELECTRIC_BLAST_FURNACE_ACTIVE"], "controller.webp");
  await composeFace(casing, ["OVERLAY_MUFFLER"], "muffler.webp");
  await composeFace(casing, ["OVERLAY_MAINTENANCE"], "maintenance.webp");
  await composeFace(casing, ["OVERLAY_PIPE_IN", "ITEM_IN_SIGN"], "input-bus.webp");
  await composeFace(casing, ["OVERLAY_PIPE_OUT", "ITEM_OUT_SIGN"], "output-bus.webp");
  await composeFace(casing, ["OVERLAY_PIPE_IN", "FLUID_IN_SIGN"], "input-hatch.webp");
  await composeFace(casing, ["OVERLAY_ENERGY_IN_MULTI_2A_LV"], "energy.webp");
  await saveGlow("OVERLAY_FRONT_ELECTRIC_BLAST_FURNACE_ACTIVE_GLOW", "controller-glow.webp");

  for (const coil of GAME.coils) {
    await savePixel(await gtTexture(`MACHINE_COIL_${coil.id.toUpperCase()}`), `coil-${coil.id}.webp`);
  }
}

async function fetchSteamAge() {
  console.log("GregTech (LGPL-3.0): паровая эра");
  const plain = {
    firebrick: "MACHINE_CASING_DENSEBRICKS",
    "coke-brick": "COKE_OVEN_CASING",
    "bronze-bricks": "MACHINE_BRONZEPLATEDBRICKS",
    "bronze-gearbox": "MACHINE_CASING_GEARBOX_BRONZE",
    "bronze-pipe": "MACHINE_CASING_PIPE_BRONZE",
    "bronze-firebox": "MACHINE_CASING_FIREBOX_BRONZE",
    wood: "PRIMITIVE_WOODEN_CASING_SIDE",
  };
  const bases = {};
  for (const [file, name] of Object.entries(plain)) {
    bases[file] = await gtTexture(name);
    await savePixel(bases[file], `${file}.webp`);
  }

  await composeFace(bases.firebrick, ["MACHINE_CASING_BRICKEDBLASTFURNACE_ACTIVE"], "bbf-controller.webp");
  await saveGlow("MACHINE_CASING_BRICKEDBLASTFURNACE_ACTIVE_GLOW", "bbf-controller-glow.webp");
  await composeFace(bases["coke-brick"], ["COKE_OVEN_OVERLAY_ACTIVE"], "coke-controller.webp");
  await saveGlow("COKE_OVEN_OVERLAY_ACTIVE_GLOW", "coke-controller-glow.webp");

  const controllers = {
    macerator: "OVERLAY_TOP_STEAM_MACERATOR_ACTIVE",
    furnace: "OVERLAY_FRONT_STEAM_FURNACE_MULTI_ACTIVE",
    compressor: "OVERLAY_FRONT_STEAM_COMPRESSOR_ACTIVE",
    smelter: "OVERLAY_FRONT_STEAM_ALLOY_SMELTER_MULTI_ACTIVE",
    hammer: "OVERLAY_FRONT_STEAM_FORGE_HAMMER_ACTIVE",
  };
  for (const [file, overlay] of Object.entries(controllers)) {
    await composeFace(bases["bronze-bricks"], [overlay], `${file}-controller.webp`);
  }
  await composeFace(bases.wood, ["OVERLAY_FRONT_WATER_PUMP_ACTIVE"], "pump-controller.webp");

  await savePixel(await tinted("frameGt", GAME.materialColors.bronze), "bronze-frame.webp");
  await savePixel(await tinted("block1", GAME.materialColors.iron), "iron-block.webp");
  await savePixel(await gtTexture("BoronSilicateGlassBlock", "bartworks/textures/blocks"), "glass.webp");

  // Фасады одноблочных машин для иерархии на главной: корпус яруса + значок машины.
  const hulls = {
    bronze: { plain: await gtTexture("MACHINE_BRONZE_SIDE"), bricked: await gtTexture("MACHINE_BRONZEBRICKS_SIDE") },
    steel: { plain: await gtTexture("MACHINE_STEEL_SIDE"), bricked: await gtTexture("MACHINE_STEELBRICKS_SIDE") },
  };
  const singles = {
    macerator: { overlay: "OVERLAY_FRONT_STEAM_MACERATOR", hull: "plain" },
    furnace: { overlay: "OVERLAY_FRONT_STEAM_FURNACE", hull: "bricked" },
    "alloy-smelter": { overlay: "OVERLAY_FRONT_STEAM_ALLOY_SMELTER", hull: "bricked" },
    hammer: { overlay: "OVERLAY_FRONT_STEAM_HAMMER", hull: "plain" },
    compressor: { overlay: "OVERLAY_FRONT_STEAM_COMPRESSOR", hull: "plain" },
    extractor: { overlay: "OVERLAY_FRONT_STEAM_EXTRACTOR", hull: "plain" },
  };
  for (const [tier, hull] of Object.entries(hulls)) {
    for (const [id, single] of Object.entries(singles)) {
      await composeFace(hull[single.hull], [single.overlay], `single-${tier}-${id}.webp`);
    }
  }

  // Остальные грани одноблочной машины: бока, верх и низ корпуса её яруса (как в MTEBasicMachineBronze/Steel).
  for (const tier of ["BRONZE", "STEEL"]) {
    for (const [hull, infix] of [["plain", ""], ["bricked", "BRICKS"]]) {
      for (const side of ["SIDE", "TOP", "BOTTOM"]) {
        const file = `hull-${tier.toLowerCase()}-${hull}-${side.toLowerCase()}.webp`;
        await savePixel(await gtTexture(`MACHINE_${tier}${infix}_${side}`), file);
      }
    }
  }
}

/**
 * Стенка водяного бака. Это блок Railcraft, а его лицензия разрешает
 * использовать текстуры только в текстурпаках для самого Railcraft, — поэтому
 * стенка нарисована заново: доски, железная обвязка с заклёпками, железный
 * пояс посередине. Буквы — цвета из ASSETS.waterTankPalette.
 */
const WATER_TANK_PIXELS = [
  "IIIIIIIIIIIIIIII",
  "IrwWwdwWwwdwWwrI",
  "IwwWwdwwWwdwWwwI",
  "IwWwwdWwwWdwwWwI",
  "IwwWwdwWwwdWwwwI",
  "IwWwwdwwWwdwwWwI",
  "IiiiiiiiiiiiiiiI",
  "IrIIIIIIIIIIIIrI",
  "IwwWwdwWwwdwWwwI",
  "IwWwwdwwWwdwwWwI",
  "IwwWwdWwwWdwWwwI",
  "IwWwwdwWwwdwwWwI",
  "IwwWwdwwWwdWwwwI",
  "IwWwwdwWwwdwWwwI",
  "IrwWwdwwWwdwwWrI",
  "IIIIIIIIIIIIIIII",
];

async function drawWaterTank() {
  console.log("Нарисовано для проекта: стенка водяного бака");
  const side = WATER_TANK_PIXELS.length;
  const channels = 3;
  const data = Buffer.alloc(side * side * channels);
  WATER_TANK_PIXELS.forEach((row, y) => {
    [...row].forEach((letter, x) => {
      const hex = ASSETS.waterTankPalette[letter];
      if (!hex) throw new Error(`В рисунке бака буква «${letter}» без цвета`);
      const offset = (y * side + x) * channels;
      [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].forEach((pair, channel) => {
        data[offset + channel] = Number.parseInt(pair, 16);
      });
    });
  });
  await savePixel(await sharp(data, { raw: { width: side, height: side, channels } }).png().toBuffer(), "water-tank.webp");
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

/**
 * Зимняя шапка: снег под эмблемой и зимний вечер для отражений (Poly Haven,
 * CC0), планета — карта Земли из примеров three.js (лицензия MIT, снимок NASA).
 * Планету делаем светлее и бледнее: зимой на тёмном фоне она так и выглядит.
 */
async function fetchWinter() {
  console.log("Зима: Poly Haven (CC0) snow_02, winter_evening; three.js (MIT) earth_atmos_2048");
  const snow = await (await fetch("https://api.polyhaven.com/files/snow_02", { headers: HEADERS })).json();
  await saveMap(await download(snow.Diffuse["1k"].jpg.url), "snow-color.webp", ASSETS.snowTextureSize);
  await saveMap(await download(snow.nor_gl["1k"].jpg.url), "snow-normal.webp", ASSETS.snowTextureSize, { normal: true });
  await saveMap(await download(snow.Rough["1k"].jpg.url), "snow-roughness.webp", ASSETS.snowTextureSize, { grey: true });

  const hdri = await (await fetch("https://api.polyhaven.com/files/winter_evening", { headers: HEADERS })).json();
  await writeFile(path.join(OUT_HDRI, "winter_evening_1k.hdr"), await download(hdri.hdri["1k"].hdr.url));
  console.log("  ✓ winter_evening_1k.hdr");

  const earth = await download(`https://cdn.jsdelivr.net/gh/mrdoob/three.js@${ASSETS.threeExamplesTag}/examples/textures/planets/earth_atmos_2048.jpg`);
  await sharp(earth)
    .modulate({ saturation: ASSETS.earthSaturation, brightness: ASSETS.earthBrightness })
    .webp({ quality: ASSETS.webpQuality })
    .toFile(path.join(OUT_PBR, "earth.webp"));
  console.log("  ✓ earth.webp");
}

await mkdir(OUT_GT, { recursive: true });
await mkdir(OUT_PBR, { recursive: true });
await mkdir(OUT_HDRI, { recursive: true });
const only = process.argv[2];
if (only !== "winter") {
  await fetchEbf();
  await fetchSteamAge();
  await drawWaterTank();
}
if (only !== "gregtech" && only !== "winter") {
  await fetchAmbientCg();
  await fetchPolyHaven();
}
// Отдельно зиму можно докачать так: node scripts/fetch-textures.mjs winter
if (only !== "gregtech") await fetchWinter();
console.log("Готово.");
