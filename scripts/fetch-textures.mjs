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

/**
 * Блоки многоблочного котла Railcraft — по той же причине нарисованы заново.
 * Топка: чугунная рама с заклёпками, кирпич и дверца с решёткой, за которой огонь.
 * Бак: клёпаные стальные листы со швом посередине.
 */
const RC_FIREBOX_PIXELS = [
  "IIIIIIIIIIIIIIII",
  "IrbbBbbbBbbbBbrI",
  "IbbBbbbBbbbBbbbI",
  "IBbbbBbbbBbbbBbI",
  "IbbIIIIIIIIIIbbI",
  "IbBIiiiiiiiiIBbI",
  "IbbIifIfIfIfIbbI",
  "IBbIiFIFIFIFIbBI",
  "IbbIifIfIfIfIbbI",
  "IbBIiFIFIFIFIBbI",
  "IbbIiiiiiiiiIbbI",
  "IBbIIIIIIIIIIbBI",
  "IbbbBbbbBbbbBbbI",
  "IbBbbbBbbbBbbbBI",
  "IrbbbBbbbBbbbBrI",
  "IIIIIIIIIIIIIIII",
];

const RC_TANK_PIXELS = [
  "IIIIIIIIIIIIIIII",
  "IriiiiiIIiiiiirI",
  "IissssiIIissssiI",
  "IisSsSiIIisSsSiI",
  "IissSsiIIissSsiI",
  "IisSssiIIisSssiI",
  "IissssiIIissssiI",
  "IriiiiiIIiiiiirI",
  "IIIIIIIIIIIIIIII",
  "IriiiiiIIiiiiirI",
  "IissssiIIissssiI",
  "IisSsSiIIisSsSiI",
  "IissSsiIIissSsiI",
  "IisSssiIIisSssiI",
  "IriiiiiIIiiiiirI",
  "IIIIIIIIIIIIIIII",
];

/** Рисунок по буквам: каждая буква — цвет из палитры. */
async function drawPixels(pixels, palette, file) {
  const side = pixels.length;
  const channels = 3;
  const data = Buffer.alloc(side * side * channels);
  pixels.forEach((row, y) => {
    [...row].forEach((letter, x) => {
      const hex = palette[letter];
      if (!hex) throw new Error(`В рисунке ${file} буква «${letter}» без цвета`);
      const offset = (y * side + x) * channels;
      [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].forEach((pair, channel) => {
        data[offset + channel] = Number.parseInt(pair, 16);
      });
    });
  });
  await savePixel(await sharp(data, { raw: { width: side, height: side, channels } }).png().toBuffer(), file);
}

async function drawRailcraft() {
  console.log("Нарисовано для проекта: стенка водяного бака, топка и бак котла Railcraft");
  await drawPixels(WATER_TANK_PIXELS, ASSETS.waterTankPalette, "water-tank.webp");
  await drawPixels(RC_FIREBOX_PIXELS, ASSETS.boilerPalette, "rc-firebox.webp");
  await drawPixels(RC_TANK_PIXELS, ASSETS.boilerPalette, "rc-tank.webp");
}

/**
 * Грань одноблочной машины: корпус + накладка из её папки
 * (blocks/basicmachines/<папка>/OVERLAY_<ГРАНЬ>). Накладка есть не у каждой
 * грани — тогда остаётся голый корпус, как в игре.
 */
async function machineFace(hull, folder, face, file) {
  let overlay = null;
  try {
    overlay = await gtTexture(`OVERLAY_${face}`, `gregtech/textures/blocks/basicmachines/${folder}`);
  } catch {
    overlay = null;
  }
  const layers = overlay ? [{ input: overlay }] : [];
  await savePixel(await sharp(hull).composite(layers).png().toBuffer(), file);
}

/** Котлы, недостающие паровые постройки и всё для LV. */
async function fetchBoilersAndLv() {
  console.log("GregTech (LGPL-3.0): котлы, паровые постройки, LV");

  // Одноблочные котлы — грани как в MTEBoilerBronze, MTEBoilerSolar и MTEBoilerLava: у всех
  // кирпичный корпус яруса. Угольный: дверца топки спереди, трубы на боках и сверху.
  // Солнечный: панель сверху, труба выхода пара на одной грани. Лавовый: слив сверху, трубы на боках.
  for (const [tier, name] of [["bronze", "BRONZE"], ["steel", "STEEL"]]) {
    const side = await gtTexture(`MACHINE_${name}BRICKS_SIDE`);
    const top = await gtTexture(`MACHINE_${name}BRICKS_TOP`);
    await composeFace(side, ["BOILER_FRONT"], `boiler-coal-${tier}-front.webp`);
    await composeFace(side, ["OVERLAY_PIPE"], `boiler-${tier}-pipe-side.webp`);
    await composeFace(top, ["OVERLAY_PIPE"], `boiler-${tier}-pipe-top.webp`);
    await composeFace(top, ["BOILER_SOLAR"], `boiler-solar-${tier}-top.webp`);
  }
  const steelBricks = await gtTexture("MACHINE_STEELBRICKS_SIDE");
  await composeFace(steelBricks, ["BOILER_LAVA_FRONT"], "boiler-lava-front.webp");
  await composeFace(steelBricks, ["OVERLAY_PIPE_OUT", "FLUID_IN_SIGN"], "boiler-lava-side.webp");
  await composeFace(await gtTexture("MACHINE_STEELBRICKS_TOP"), ["OVERLAY_DRAIN", "FLUID_IN_SIGN"], "boiler-lava-top.webp");

  // Контроллеры паровых построек. Смеситель в моде носит тот же значок, что и сепаратор.
  const plated = await gtTexture("MACHINE_BRONZEPLATEDBRICKS");
  await composeFace(plated, ["OVERLAY_FRONT_STEAM_CENTRIFUGE_ACTIVE"], "separator-controller.webp");
  await composeFace(plated, ["OVERLAY_FRONT_STEAM_WASHER_ACTIVE"], "purifier-controller.webp");

  // Корпуса LV и MV и грани одноблочных машин: значки у ярусов общие, отличается корпус.
  const hulls = {};
  const tiers = [["lv", ASSETS.lvMachineFolders], ["mv", ASSETS.mvMachineFolders], ["hv", ASSETS.hvMachineFolders]];
  for (const [tier, folders] of tiers) {
    const hull = {};
    for (const side of ["SIDE", "TOP", "BOTTOM"]) {
      hull[side] = await gtTexture(`MACHINE_${tier.toUpperCase()}_${side}`);
      await savePixel(hull[side], `hull-${tier}-${side.toLowerCase()}.webp`);
    }
    for (const folder of folders) {
      const id = ASSETS.lvMachineShortIds[folder] ?? folder.replaceAll("_", "-");
      await machineFace(hull.SIDE, folder, "FRONT", `single-${tier}-${id}.webp`);
      await machineFace(hull.SIDE, folder, "SIDE", `single-${tier}-${id}-side.webp`);
      await machineFace(hull.TOP, folder, "TOP", `single-${tier}-${id}-top.webp`);
    }
    // Генераторы: у паровой и газовой турбины рисунок на боках, у дизельного — сверху.
    // Спереди у всех — метка выхода энергии своего яруса (OVERLAYS_ENERGY_OUT[ярус + 1]).
    const prefix = tier === "lv" ? "gen" : `gen-${tier}`;
    await composeFace(hull.SIDE, [`OVERLAY_ENERGY_OUT_${tier.toUpperCase()}`], `${prefix}-energy-out.webp`);
    await composeFace(hull.SIDE, ["STEAM_TURBINE_SIDE"], `${prefix}-steam-turbine-side.webp`);
    await composeFace(hull.SIDE, ["GAS_TURBINE_SIDE"], `${prefix}-gas-turbine-side.webp`);
    await composeFace(hull.TOP, ["DIESEL_GENERATOR_TOP"], `${prefix}-combustion-top.webp`);
    hulls[tier] = hull;
  }
  const lv = hulls.lv;


  // Электрический воздушный фильтр: корпус турбины, вентиляция (трубный корпус), люки на его корпусе.
  const air = await gtTexture("MACHINE_CASING_TURBINE_STEEL");
  await savePixel(air, "air-casing.webp");
  await savePixel(await gtTexture("MACHINE_CASING_PIPE_STEEL"), "air-vent.webp");
  await composeFace(air, ["OVERLAY_FRONT_DIESEL_ENGINE"], "air-controller.webp");
  await composeFace(air, ["OVERLAY_MUFFLER"], "air-muffler.webp");
  await composeFace(air, ["OVERLAY_MAINTENANCE"], "air-maintenance.webp");
  await composeFace(air, ["OVERLAY_ENERGY_IN_MULTI_2A_LV"], "air-energy.webp");
  await composeFace(air, ["OVERLAY_PIPE_IN", "ITEM_IN_SIGN"], "air-input-bus.webp");

  await fetchMvBuildings();
  await fetchGtppAndHv();
  await fetchHighTiers();
}

/** Контроллер: корпус + накладка, плюс карта свечения, если она есть. */
async function controller(base, overlay, file, folder = ICONSETS) {
  const layer = await gtTexture(overlay, folder);
  await savePixel(await sharp(base).composite([{ input: layer }]).png().toBuffer(), file);
}

/** Постройки GT++ (те же репозиторий и лицензия LGPL-3.0, папка miscutils) и постройки HV. */
async function fetchGtppAndHv() {
  console.log("GregTech и GT++ (LGPL-3.0): постройки GT++ и HV");
  const faces = "miscutils/textures/blocks/iconsets/controllerFaces";
  const plated = await gtTexture("MACHINE_BRONZEPLATEDBRICKS");

  // Химический завод (GT++): первый ярус собран из бронзовых кирпичей и корпусов LV.
  await controller(plated, "chemicalPlantActive", "chem-plant-controller.webp", faces);

  // Ферма водорослей (GT++): корпус водорослей, фильтры, рамы из нержавейки.
  const algae = await gtTexture("ALGAE_CASING");
  await savePixel(algae, "algae-casing.webp");
  await controller(algae, "algaePondBaseActive", "algae-controller.webp", faces);
  await savePixel(await gtTexture("MACHINE_CASING_VENT"), "filter-casing.webp");
  await savePixel(await tinted("frameGt", GAME.materialColors.stainless), "stainless-frame.webp");

  // Вакуумный морозильник, имплозионный компрессор, большой химический реактор.
  const frost = await gtTexture("MACHINE_CASING_FROST_PROOF");
  await savePixel(frost, "frost-proof.webp");
  await controller(frost, "OVERLAY_FRONT_VACUUM_FREEZER_ACTIVE", "freezer-controller.webp");
  await controller(await gtTexture("MACHINE_CASING_SOLID_STEEL"), "OVERLAY_FRONT_IMPLOSION_COMPRESSOR_ACTIVE", "implosion-controller.webp");
  const inert = await gtTexture("MACHINE_CASING_CHEMICALLY_INERT");
  await savePixel(inert, "inert-casing.webp");
  await savePixel(await gtTexture("MACHINE_CASING_PIPE_POLYTETRAFLUOROETHYLENE"), "ptfe-pipe.webp");
  await controller(inert, "OVERLAY_FRONT_LARGE_CHEMICAL_REACTOR_ACTIVE", "lcr-controller.webp");

  // Ректификационная колонна и крекинг-установка: чистая нержавейка.
  const stainless = await gtTexture("MACHINE_CASING_CLEAN_STAINLESSSTEEL");
  await savePixel(stainless, "clean-stainless.webp");
  await controller(stainless, "OVERLAY_FRONT_DISTILLATION_TOWER_ACTIVE", "dt-controller.webp");
  await composeFace(stainless, ["OVERLAY_PIPE_OUT", "FLUID_OUT_SIGN"], "dt-output-hatch.webp");
  await controller(stainless, "OVERLAY_FRONT_OIL_CRACKER_ACTIVE", "cracker-controller.webp");

  // Большая паровая турбина: ротор нарисован девятью плитками на передней стенке.
  const turbine = await gtTexture("MACHINE_CASING_TURBINE_STEEL");
  for (const tile of ASSETS.turbineTiles) {
    await controller(turbine, `LARGETURBINE_NEW${tile}`, `turbine-${tile}.webp`);
  }
  await composeFace(turbine, ["OVERLAY_ENERGY_OUT_MULTI_2A_HV"], "turbine-dynamo.webp");
  await savePixel(await tinted("frameGt", GAME.materialColors.iron), "iron-frame.webp");

  // Чистая комната: пласкрит, фильтры в потолке, контроллер в его середине.
  const plascrete = await gtTexture("BLOCK_PLASCRETE");
  await savePixel(plascrete, "plascrete.webp");
  await controller(plascrete, "OVERLAY_TOP_CLEANROOM_ACTIVE", "cleanroom-controller.webp");
}

/** Всё для ярусов EV, IV и ZPM: корпуса, одноблочные машины, генераторы и постройки. */
/** Текстура SGCraft (GTNH-версия, лицензия MIT): верхний квадрат, сведённый к 16×16 без сглаживания. */
async function sgTexture(name) {
  const source = await download(`https://raw.githubusercontent.com/GTNewHorizons/SGCraft/${ASSETS.sgcraftCommit}/src/main/resources/assets/sgcraft/textures/blocks/${name}.png`);
  const { width } = await sharp(source).metadata();
  return sharp(source)
    .extract({ left: 0, top: 0, width, height: width })
    .resize(ASSETS.blockTextureSize, ASSETS.blockTextureSize, { kernel: "nearest" })
    .ensureAlpha()
    .png()
    .toBuffer();
}

/** Звёздные врата: узоры кольца, шеврона и основы — поверх гладкого блока врат, как в модели мода. */
async function fetchStargate() {
  console.log("SGCraft (MIT): Звёздные врата");
  const block = await sgTexture("stargateBlock");
  await savePixel(block, "sg-block.webp");
  for (const [name, file] of [["stargateRing", "sg-ring"], ["stargateChevron", "sg-chevron"], ["stargateBase_front", "sg-base"]]) {
    await savePixel(await sharp(block).composite([{ input: await sgTexture(name) }]).png().toBuffer(), `${file}.webp`);
  }
  for (const [name, file] of [["dhd_top", "sg-dhd-top"], ["dhd_side", "sg-dhd-side"], ["rfPowerUnit-top", "sg-power-top"], ["rfPowerUnit-side", "sg-power-side"]]) {
    await savePixel(await sgTexture(name), `${file}.webp`);
  }
}

async function fetchHighTiers() {
  await fetchStargate();
  console.log("GregTech, GT++, KekzTech, GoodGenerator (LGPL-3.0): EV, IV, ZPM");
  const gtpp = "miscutils/textures/blocks/TileEntities";
  const faces = "miscutils/textures/blocks/iconsets/controllerFaces";

  // Одноблочные: корпус яруса + значок машины; генераторы — как в MTEPlasmaGenerator и MTENaquadahReactor.
  const tiers = [["ev", "EV", ASSETS.evMachineFolders], ["iv", "IV", ASSETS.ivMachineFolders], ["luv", "LuV", ASSETS.luvMachineFolders], ["zpm", "ZPM", ASSETS.zpmMachineFolders], ["uv", "UV", ASSETS.uvMachineFolders], ["uhv", "UHV", ASSETS.uhvMachineFolders], ["uev", "UEV", ASSETS.uevMachineFolders], ["uiv", "UIV", ASSETS.uivMachineFolders], ["umv", "UMV", ASSETS.umvMachineFolders], ["uxv", "UXV", ASSETS.uxvMachineFolders], ["max", "MAX", ASSETS.maxMachineFolders]];
  for (const [tier, name, folders] of tiers) {
    const hull = {};
    for (const side of ["SIDE", "TOP", "BOTTOM"]) {
      hull[side] = await gtTexture(`MACHINE_${name}_${side}`);
      await savePixel(hull[side], `hull-${tier}-${side.toLowerCase()}.webp`);
    }
    for (const folder of folders) {
      const id = ASSETS.lvMachineShortIds[folder] ?? folder.replaceAll("_", "-");
      await machineFace(hull.SIDE, folder, "FRONT", `single-${tier}-${id}.webp`);
      await machineFace(hull.SIDE, folder, "SIDE", `single-${tier}-${id}-side.webp`);
      await machineFace(hull.TOP, folder, "TOP", `single-${tier}-${id}-top.webp`);
    }
    const energyOut = `OVERLAY_ENERGY_OUT_${name}`;
    await composeFace(hull.SIDE, ["MACHINE_CASING_FUSION_GLASS", energyOut], `gen-${tier}-plasma-front.webp`);
    await composeFace(hull.SIDE, ["MACHINE_CASING_FUSION_GLASS"], `gen-${tier}-plasma-side.webp`);
    await composeFace(hull.TOP, ["MACHINE_CASING_FUSION_GLASS"], `gen-${tier}-plasma-top.webp`);
    await composeFace(hull.SIDE, ["NAQUADAH_REACTOR_SOLID_FRONT"], `gen-${tier}-naq-front.webp`);
    await composeFace(hull.SIDE, ["NAQUADAH_REACTOR_SOLID_SIDE"], `gen-${tier}-naq-side.webp`);
    await composeFace(hull.TOP, ["NAQUADAH_REACTOR_SOLID_TOP"], `gen-${tier}-naq-top.webp`);
    // Одноблочных газовых турбин и дизелей выше IV нет.
    if (!["ev", "iv"].includes(tier)) continue;
    await composeFace(hull.SIDE, [energyOut], `gen-${tier}-energy-out.webp`);
    await composeFace(hull.SIDE, ["GAS_TURBINE_SIDE"], `gen-${tier}-gas-turbine-side.webp`);
    await composeFace(hull.TOP, ["DIESEL_GENERATOR_TOP"], `gen-${tier}-combustion-top.webp`);
  }

  // Простые блоки: имя файла на сайте — имя текстуры в моде.
  const plain = {
    "stable-titanium": "MACHINE_CASING_STABLE_TITANIUM",
    "titanium-gearbox": "MACHINE_CASING_GEARBOX_TITANIUM",
    "engine-intake": "MACHINE_CASING_ENGINE_INTAKE",
    "stainless-turbine": "MACHINE_CASING_TURBINE_STAINLESSSTEEL",
    "tin-pipe": "MACHINE_CASING_ITEM_PIPE_TIN",
    "sieve-grate": "LARGE_SIEVE_GRATE",
    "assembler-casing": "MACHINE_CASING_ASSEMBLER",
    "grate-casing": "MACHINE_CASING_GRATE",
    // Корпус сборочной линии в моде рисуется текстурой редуктора из вольфрамовой стали (BlockCasings2, мета 5).
    "assline-casing": "MACHINE_CASING_GEARBOX_TUNGSTENSTEEL",
    "wsteel-casing": "MACHINE_CASING_ROBUST_TUNGSTENSTEEL",
    "wsteel-firebox": "MACHINE_CASING_FIREBOX_TUNGSTENSTEEL",
    "wsteel-turbine": "MACHINE_CASING_TURBINE_TUNGSTENSTEEL",
    "steel-gearbox": "MACHINE_CASING_GEARBOX_STEEL",
    "extreme-intake": "MACHINE_CASING_EXTREME_ENGINE_INTAKE",
    "fusion-casing": "MACHINE_CASING_FUSION",
    "fusion3-casing": "MACHINE_CASING_FUSION_2",
    "naq-reinforced": "BLOCK_NAQUADAHPREIN",
    "neutronium-casing": "NEUTRONIUM_CASING",
    "neutronium-active": "NEUTRONIUM_ACTIVE_CASING",
    "neutronium-stable": "NEUTRONIUM_STABLE_CASING",
    "dim-trans": "MACHINE_DIM_TRANS_CASING",
    "dim-injector": "MACHINE_DIM_INJECTOR",
    "dim-bridge": "MACHINE_DIM_BRIDGE",
    "coil-awakened": "MACHINE_COIL_AWAKENEDDRACONIUM",
    "nano-firewall": "NANOCHIP_FIREWALL_PROJECTION_CASING",
    "nano-mesh": "NANOCHIP_MESH_INTERFACE_CASING",
    "nano-reinforcement": "NANOCHIP_REINFORCEMENT_CASING",
    "nano-matrix": "NANOCHIP_COMPUTATIONAL_MATRIX_CASING",
    "nano-glass": "NANOCHIP_GLASS",
    "extreme-density": "EXTREME_DENSITY_CASING",
    "radiation-absorbent": "RADIATION_ABSORBENT_CASING",
    "hawking-glass": "HAWKING_GLASS",
    "godforge-trim": "GODFORGE_TRIM",
    "godforge-inner": "GODFORGE_INNER",
    "godforge-support": "GODFORGE_SUPPORT",
    "godforge-outer": "GRAVITON_TOP_BOTTOM",
    "godforge-energy": "GODFORGE_ENERGY",
    "coil-hypogen": "MACHINE_COIL_HYPOGEN",
    "bec-conduit": "BEC_CONDUIT",
    "bec-casing": "BEC_CASING",
    "bec-manipulator": "BEC_MANIPULATOR",
    "bec-conflict": "BEC_CONFLICTCASING",
    "bec-peace": "BEC_PEACECASING",
    "bec-primary-coil": "BEC_PRIMARYCOIL",
    "bec-secondary-coil": "BEC_SECONDARYCOIL",
    "bec-glass": "BEC_GLASS",
    "graviton-1": "GRAVITON_CASING_2",
    "graviton-2": "GRAVITON_CASING_1",
    "graviton-3": "GRAVITON_CASING_0",
    "fusion-coil": "MACHINE_CASING_FUSION_COIL",
    "naq-casing": "NAQUADAH_REACTOR_CASING",
    "super-coil": "MACHINE_COIL_SUPERCONDUCTOR",
    "wsteel-pipe": "MACHINE_CASING_PIPE_TUNGSTENSTEEL",
    "processor-casing": "MACHINE_CASING_PROCESSOR",
    "fridge-casing": "MACHINE_CASING_FRIDGE_SIDE",
    "naq-distill": "MACHINE_CASING_NAQUADAH_REINFORCED_DISTILLATION",
    "hearth-casing": "MACHINE_CASING_HEARTH_SIDE",
    "black-plutonium-pipe": "MACHINE_CASING_ITEM_PIPE_BLACK_PLUTONIUM",
    "radiant-naq": "MACHINE_CASING_RADIANT_NAQUADAH_ALLOY",
    // Квантовый силовой преобразователь: манипулятор и ядро — первого уровня (мета 7 и 11).
    "qft-manipulator": "NeutronPulseManipulator",
    "qft-shielding": "NeutronShieldingCore",
    "qft-coil": "MACHINE_CASING_QFT_COIL",
    "qft-glass": "ForceFieldGlass",
    "coolant-duct": "COOLANT_DUCT_CASING",
    "infinity-cooled": "INFINITY_COOLED_CASING",
    "wsteel-reinforced": "BLOCK_TSREIN",
    "eoh-temporal": "EM_INNER_SPACETIME_REINFORCED_EOH_CASING",
    "eoh-spatial": "EM_OUTER_SPACETIME_REINFORCED_EOH_CASING",
    "eoh-boundary": "EM_POWER_INFINITE",
    // Генераторы полей Глаза гармонии — девятый, галлифрейский уровень (мета 8).
    "eoh-compression": "EM_DIM_8",
    "eoh-dilation": "EM_FIELD_8",
    "eoh-stabilisation": "STABILITY_CASING_8",
  };
  const bases = {};
  for (const [file, name] of Object.entries(plain)) {
    bases[file] = await gtTexture(name);
    await savePixel(bases[file], `${file}.webp`);
  }
  const other = {
    "centrifuge-casing": ["MACHINE_CASING_CENTRIFUGE", gtpp],
    "volcanus-casing": ["MACHINE_CASING_ADVANCED_VOLCANUS", gtpp],
    "abs-casing": ["MACHINE_CASING_STABLE_ZIRCONIUM_CARBIDE", gtpp],
    "abs-firebox": ["MACHINE_CASING_FIREBOX_STABALLOY", gtpp],
    "lsc-base": ["LSCBase_side", "kekztech/textures/blocks"],
    "lsc-capacitor": ["LapotronicEnergyUnit1_side", "kekztech/textures/blocks"],
    "field-casing": ["MAR_Casing", "goodgenerator/textures/blocks"],
    "rad-frame": ["radiationProtectionSteelFrame", "goodgenerator/textures/blocks"],
    "speeding-pipe": ["speedingPipe_SIDE", "goodgenerator/textures/blocks"],
    "fusion4-casing": ["MACHINE_CASING_FUSION_3", "miscutils/textures/blocks/iconsets"],
    "godforge-lens": ["blockSpatiallyTranscendentGravitationalLens", "tectech/textures/blocks"],
    "fusion4-coil": ["MACHINE_CASING_FUSION_COIL_II", "miscutils/textures/blocks/iconsets"],
    "fusion5-casing": ["MACHINE_CASING_FUSION_4", "miscutils/textures/blocks/iconsets"],
    "fusion5-coil": ["MACHINE_CASING_FUSION_COIL_III", "miscutils/textures/blocks/iconsets"],
    // Термоизолирующий корпус и структурный корпус горна в GT++ рисуются текстурой тантоллоя-61.
    "thermal-containment": ["MACHINE_CASING_STABLE_TANTALLOY61", gtpp],
    "qft-casing": ["machine_top", gtpp],
  };
  for (const [file, [name, folder]] of Object.entries(other)) {
    bases[file] = await gtTexture(name, folder);
    await savePixel(bases[file], `${file}.webp`);
  }
  await savePixel(await tinted("frameGt", GAME.materialColors.ptfe), "ptfe-frame.webp");
  await savePixel(await tinted("frameGt", GAME.materialColors.eglin), "eglin-frame.webp");

  // Контроллеры и динамо-люки.
  const steel = await gtTexture("MACHINE_CASING_SOLID_STEEL");
  const inert = await gtTexture("MACHINE_CASING_CHEMICALLY_INERT");
  await controller(bases["stable-titanium"], "OVERLAY_FRONT_DIESEL_ENGINE_ACTIVE", "lce-controller.webp");
  await composeFace(inert, ["OVERLAY_ENERGY_OUT_MULTI_2A_EV"], "lce-dynamo.webp");
  for (const tile of ASSETS.turbineTiles) {
    await controller(bases["stainless-turbine"], `LARGETURBINE_NEW${tile}`, `gas-turbine-${tile}.webp`);
  }
  await composeFace(bases["stainless-turbine"], ["OVERLAY_ENERGY_OUT_MULTI_2A_EV"], "gas-dynamo.webp");
  await controller(steel, "OVERLAY_FRONT_ORE_DRILL_ACTIVE", "ore-drill-controller.webp");
  // Значок центрифуги в моде — середина ротора турбины (LARGETURBINE_NEW5).
  await controller(bases["centrifuge-casing"], "LARGETURBINE_NEW5", "centrifuge-controller.webp");
  await controller(bases["stable-titanium"], "adv_machine_matterfab_active", "mac-stack-controller.webp", gtpp);
  await controller(bases["lsc-base"], "MACHINE_CASING_FUSION_GLASS", "lsc-controller.webp");
  await controller(steel, "OVERLAY_FRONT_ASSEMBLY_LINE_ACTIVE", "assline-controller.webp");
  await controller(bases["volcanus-casing"], "advancedEBFActive", "volcanus-controller.webp", faces);
  await controller(bases["abs-casing"], "alloyBlastSmelterActive", "abs-controller.webp", faces);
  await controller(bases["wsteel-casing"], "OVERLAY_FRONT_EXTREME_DIESEL_ENGINE_ACTIVE", "ece-controller.webp");
  await composeFace(bases["wsteel-casing"], ["OVERLAY_ENERGY_OUT_MULTI_2A_IV"], "ece-dynamo.webp");
  await composeFace(bases["fusion-casing"], ["MACHINE_CASING_FUSION_GLASS", "OVERLAY_FUSION2"], "fusion-controller.webp");
  await composeFace(bases["fusion3-casing"], ["MACHINE_CASING_FUSION_GLASS", "OVERLAY_FUSION3"], "fusion3-controller.webp");
  // UHV: электрический имплозионный компрессор.
  await savePixel(await tinted("block1", GAME.materialColors.neutronium), "neutronium-block.webp");
  await savePixel(await tinted("frameGt", GAME.materialColors.naquadah), "naq-frame.webp");
  await controller(bases["naq-reinforced"], "OVERLAY_FRONT_IMPLOSION_COMPRESSOR_ACTIVE", "eic-controller.webp");
  await savePixel(await tinted("frameGt", GAME.materialColors.naquadahAlloy), "naq-alloy-frame.webp");
  await controller(bases["neutronium-casing"], "OVERLAY_MULTI_NEUTRONIUM_ACTIVE", "nc-controller.webp");
  await controller(bases["abs-casing"], "megaAlloyBlastSmelterActive", "mega-abs-controller.webp", faces);
  // UEV и UIV: реакторы синтеза IV и V (GT++), плазменная кузница, плазменный смеситель.
  await controller(bases["fusion4-casing"], "adv_machine_screen_random3", "fusion4-controller.webp", gtpp);
  await controller(bases["fusion5-casing"], "overlay_rainbowscreen", "fusion5-controller.webp", gtpp);
  await controller(bases["dim-injector"], "OVERLAY_DTPF_ON", "dtpf-controller.webp");
  await controller(bases["dim-injector"], "OVERLAY_DTPF_ON", "tpm-controller.webp");
  await controller(bases["nano-mesh"], "OVERLAY_FRONT_NANOCHIP_ASSEMBLY_COMPLEX_ACTIVE", "nano-controller.webp");
  await controller(bases["radiation-absorbent"], "OVERLAY_MULTI_BLACKHOLE_ACTIVE", "bhc-controller.webp");
  await controller(bases["godforge-trim"], "GODFORGE_MODULE_ACTIVE", "godforge-module-controller.webp");
  await controller(bases["godforge-trim"], "GODFORGE_CONTROLLER", "godforge-controller.webp");
  for (const [file, overlay] of [["generator", "BEC_GENERATOR_ACTIVE"], ["storage", "BEC_STORAGE_ACTIVE"], ["assembler", "BEC_ASSEMBLER_ACTIVE"], ["node", "BEC_IONODE_ACTIVE"], ["gate", "BEC_MAXWELL_GATE_ACTIVE"]]) {
    await controller(bases["bec-casing"], overlay, `bec-${file}-controller.webp`);
  }
  await controller(bases["naq-casing"], "NAQUADAH_REACTOR_SOLID_FRONT_ACTIVE", "lnr-controller.webp");
  // UMV и UXV: эндотермический холодильник и Глаз гармонии (экран контроллера TecTech).
  await savePixel(await tinted("frameGt", GAME.materialColors.callistoIce), "callisto-frame.webp");
  await savePixel(await tinted("sheetmetal", GAME.materialColors.ledox), "ledox-sheet.webp");
  await controller(bases["fridge-casing"], "OVERLAY_FRONT_FRIDGE_ACTIVE", "fridge-controller.webp");
  await controller(bases["eoh-boundary"], "EM_CONTROLLER_ACTIVE", "eoh-controller.webp");
  // Мега-машины и квантовый силовой преобразователь.
  await controller(inert, "OVERLAY_FRONT_MEGA_CHEMICAL_REACTOR_ACTIVE", "mcr-controller.webp");
  await controller(bases["naq-distill"], "OVERLAY_FRONT_MEGA_OIL_CRACKER_ACTIVE", "moc-controller.webp");
  await controller(bases["naq-distill"], "OVERLAY_FRONT_MEGA_DISTILLATION_TOWER_ACTIVE", "mdt-controller.webp");
  await controller(bases["hearth-casing"], "OVERLAY_FRONT_HEARTH_ACTIVE", "hearth-controller.webp");
  await composeFace(bases["thermal-containment"], ["OVERLAY_MUFFLER"], "hearth-muffler.webp");
  await controller(bases["qft-casing"], "quantumForceTransformerActive", "qft-controller.webp", faces);
  await savePixel(await tinted("sheetmetal", GAME.materialColors.naquadah), "naq-sheet.webp");
  await savePixel(await tinted("frameGt", GAME.materialColors.prismaticNaquadah), "prismatic-frame.webp");

  // LuV: реактор синтеза I, большая плазменная турбина, активатор нейтронов.
  const luv = await gtTexture("MACHINE_LuV_SIDE");
  await composeFace(luv, ["MACHINE_CASING_FUSION_GLASS", "OVERLAY_FUSION1"], "fusion1-controller.webp");
  for (const tile of ASSETS.turbineTiles) {
    await controller(bases["wsteel-turbine"], `LARGETURBINE_NEW${tile}`, `plasma-turbine-${tile}.webp`);
  }
  await composeFace(bases["wsteel-turbine"], ["OVERLAY_ENERGY_OUT_MULTI_2A_LuV"], "plasma-dynamo.webp");
  await savePixel(await tinted("frameGt", GAME.materialColors.tungstensteel), "wsteel-frame.webp");
  const stainless = await gtTexture("MACHINE_CASING_CLEAN_STAINLESSSTEEL");
  await controller(stainless, "NeutronActivator_On", "na-controller.webp", "gregtech/textures/blocks/icons");
}

/** Постройки MV: мультиплавильня, пиролизная печь, буровая и большой бронзовый котёл. */
async function fetchMvBuildings() {
  console.log("GregTech (LGPL-3.0): постройки MV");
  const energy = "OVERLAY_ENERGY_IN_MULTI_2A_MV";

  // Мультиплавильня: тот же жаропрочный корпус, что у доменной печи.
  const heatproof = await gtTexture("MACHINE_HEATPROOFCASING");
  await composeFace(heatproof, ["OVERLAY_FRONT_MULTI_SMELTER_ACTIVE"], "multi-smelter-controller.webp");
  await saveGlow("OVERLAY_FRONT_MULTI_SMELTER_ACTIVE_GLOW", "multi-smelter-controller-glow.webp");

  // Пиролизная печь: её корпус в моде рисуется текстурой корпуса ULV (BlockCasingsNH, мета 2).
  const pyro = await gtTexture("MACHINE_ULV_SIDE");
  await savePixel(pyro, "pyro-casing.webp");
  await composeFace(pyro, ["OVERLAY_FRONT_PYROLYSE_OVEN_ACTIVE"], "pyro-controller.webp");
  await saveGlow("OVERLAY_FRONT_PYROLYSE_OVEN_ACTIVE_GLOW", "pyro-controller-glow.webp");
  await composeFace(pyro, ["OVERLAY_MUFFLER"], "pyro-muffler.webp");
  await composeFace(pyro, ["OVERLAY_MAINTENANCE"], "pyro-maintenance.webp");
  await composeFace(pyro, [energy], "pyro-energy.webp");
  await composeFace(pyro, ["OVERLAY_PIPE_OUT", "ITEM_OUT_SIGN"], "pyro-output-bus.webp");
  await savePixel(await gtTexture("MACHINE_CASING_FIREBOX_STEEL"), "steel-firebox.webp");
  await savePixel(await tinted("frameGt", GAME.materialColors.steel), "steel-frame.webp");

  // Буровая: корпус из цельной стали.
  const steel = await gtTexture("MACHINE_CASING_SOLID_STEEL");
  await savePixel(steel, "solid-steel.webp");
  await composeFace(steel, ["OVERLAY_FRONT_OIL_DRILL_ACTIVE"], "drill-controller.webp");
  await composeFace(steel, ["OVERLAY_MAINTENANCE"], "drill-maintenance.webp");
  await composeFace(steel, [energy], "drill-energy.webp");
  await composeFace(steel, ["OVERLAY_PIPE_OUT", "FLUID_OUT_SIGN"], "drill-output-hatch.webp");

  // Большой бронзовый котёл: контроллер на бронзовых кирпичах.
  const plated = await gtTexture("MACHINE_BRONZEPLATEDBRICKS");
  await composeFace(plated, ["OVERLAY_FRONT_LARGE_BOILER_ACTIVE"], "large-boiler-controller.webp");
  await saveGlow("OVERLAY_FRONT_LARGE_BOILER_ACTIVE_GLOW", "large-boiler-controller-glow.webp");
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
  await saveMap(await download(floor.nor_gl["2k"].jpg.url), "floor-normal.webp", ASSETS.floorDetailTextureSize, { normal: true });
  await saveMap(await download(floor.Rough["2k"].jpg.url), "floor-roughness.webp", ASSETS.floorDetailTextureSize, { grey: true });

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
// Только новое (котлы, постройки, LV) можно докачать так: node scripts/fetch-textures.mjs lv
// Только ярусы от EV до UHV: node scripts/fetch-textures.mjs high
if (only === "high") {
  await fetchHighTiers();
  console.log("Готово.");
  process.exit(0);
}
if (only === "lv") {
  await drawRailcraft();
  await fetchBoilersAndLv();
  console.log("Готово.");
  process.exit(0);
}
if (only !== "winter") {
  await fetchEbf();
  await fetchSteamAge();
  await drawRailcraft();
  await fetchBoilersAndLv();
}
if (only !== "gregtech" && only !== "winter") {
  await fetchAmbientCg();
  await fetchPolyHaven();
}
// Отдельно зиму можно докачать так: node scripts/fetch-textures.mjs winter
if (only !== "gregtech") await fetchWinter();
console.log("Готово.");
