// Картинка для сайта через OpenAI-совместимый сервис (например, посредник с моделями Gemini для картинок).
// Ключ — только из переменной окружения IMAGE_API_KEY (задаёт пользователь сам, в коде и в git его нет).
// Адрес сервиса — IMAGE_BASE_URL (по умолчанию https://tux-catalog.me/v1).
//
//   node scripts/gen-image.mjs --list                      — какие модели доступны по ключу
//   node scripts/gen-image.mjs --model <модель>            — нарисовать шапку стартовой страницы
//   node scripts/gen-image.mjs --model <модель> --prompt "…" --out public/images/x.webp
//
// Сначала пробует способ для картинок (/images/generations), если сервис его не знает — чат (/chat/completions),
// из ответа которого берёт картинку (data:image… или ссылку). Готовую картинку сохраняет в WebP шириной до 1920 px.
// Каждый запуск — одна платная генерация.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Шапка стартовой: мир из кубических блоков (как Minecraft с модом GregTech), машины — блочные, а не «стимпанк вообще».
const HOME_PROMPT = [
  "Wide cinematic 16:9 illustration of a blocky voxel world in the style of a heavily modded Minecraft industrial modpack (GregTech-like), painterly lighting, rich detailed environment.",
  "Everything is built from cube blocks with pixel-art 16x16 textures: machines are single cube blocks with a framed metal casing and a glowing machine front face, and huge multiblock structures made of casing blocks.",
  "Left to right the landscape passes through tech eras: first bronze and bricked steam machines (cube boilers with gauges, bronze pipes, a brick blast furnace with fire), steam puffs;",
  "then grey steel electric machines in rows connected by thick black cables and pipes, an electric blast furnace multiblock with glowing orange heating coils, cube energy hatches;",
  "then sleek high-tier machines of dark chrome and glowing purple and cyan blocks, a gigantic ring-shaped fusion reactor built of casing blocks, a space elevator column rising into the sky;",
  "at the far right a colossal block-built Stargate ring of dark metal casings, its center swirling with bright blue-white energy.",
  "All pipes and cables are straight cube-block segments running in straight lines, turning only at sharp 90-degree corners like in Minecraft — no curved, bent or hanging pipes or cables anywhere.",
  "No people, no characters, no creatures — only machines and the world.",
  "A dense, rich factory: many machines of every era packed in rows and clusters, stacked machine blocks, tanks, chests, conveyor-like pipe lines, multiblock towers, more machines in the middle and far distance.",
  "The world around is a real Minecraft-style generated terrain, not a flat plane: rolling blocky grass hills, stepped stone cliffs and mountains, oak and spruce block trees, a river and waterfall of block water,",
  "exposed ore veins in the cliffs, terraced dirt and stone layers, the factory built into this landscape, terrain continuing to the horizon.",
  "Rendered as Minecraft with high-end shaders (like a shaderpack): volumetric god rays through smoke and clouds, soft realistic shadows, ambient occlusion between blocks,",
  "reflective water with ripples, bloom on glowing machine fronts and coils, warm atmospheric fog and depth of field in the distance, still keeping the crisp cube shapes and 16x16 pixel textures.",
  "Sky changes with the eras: smoky amber sunset over the steam age, cloudy dusk over the electric age, deep space with stars, nebulae and a planet over the high-tech end.",
  "Accent color warm orange (#ff8a3c) in the lighting. Original design, no text, no logos, no letters, no known characters.",
  "Keep the lower left quarter slightly darker and less busy for a title overlay.",
].join(" ");

const args = process.argv.slice(2);
const option = (name) => {
  const at = args.indexOf(`--${name}`);
  return at >= 0 ? args[at + 1] : undefined;
};
const key = process.env.IMAGE_API_KEY;
const base = (process.env.IMAGE_BASE_URL ?? "https://tux-catalog.me/v1").replace(/\/$/, "");
if (!key) {
  console.error("Нет ключа: задайте переменную окружения IMAGE_API_KEY (в PowerShell: $env:IMAGE_API_KEY=\"ваш ключ\").");
  process.exit(1);
}
const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

async function call(route, body) {
  const response = await fetch(`${base}${route}`, body ? { method: "POST", headers, body: JSON.stringify(body) } : { headers });
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = undefined;
  }
  return { ok: response.ok, status: response.status, json, text };
}

if (args.includes("--list")) {
  const result = await call("/models");
  if (!result.ok) throw new Error(`Список моделей не получен: ${result.status} ${result.text.slice(0, 300)}`);
  const models = (result.json?.data ?? []).map((model) => model.id);
  console.log(models.length ? models.join("\n") : result.text.slice(0, 1000));
  // Полное описание моделей: у посредников там бывает, через какой адрес модель работает (картинки, чат, Gemini).
  if (args.includes("--full")) console.log(JSON.stringify(result.json, null, 2).slice(0, 4000));
  process.exit(0);
}

const model = option("model");
if (!model) {
  console.error("Укажите модель: --model <название> (список: --list).");
  process.exit(1);
}
const prompt = option("prompt") ?? HOME_PROMPT;
const out = option("out") ?? "public/images/home/stargate.webp";

/** Картинка из ответа: base64, data:image… или ссылка — где бы в ответе она ни лежала. */
async function imageFrom(json) {
  const found = [];
  const walk = (value) => {
    if (typeof value === "string") {
      if (value.startsWith("data:image")) found.push(value);
      else if (/^https?:\/\/\S+\.(png|jpe?g|webp)(\?\S*)?$/i.test(value)) found.push(value);
      else for (const match of value.matchAll(/data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+|https?:\/\/[^\s)"]+\.(?:png|jpe?g|webp)(?:\?[^\s)"]*)?/gi)) found.push(match[0]);
    } else if (value && typeof value === "object") {
      if (typeof value.b64_json === "string") found.push(`data:image/png;base64,${value.b64_json}`);
      for (const item of Object.values(value)) walk(item);
    }
  };
  walk(json);
  const first = found[0];
  if (!first) return undefined;
  if (first.startsWith("data:")) return Buffer.from(first.slice(first.indexOf(",") + 1), "base64");
  const response = await fetch(first);
  if (!response.ok) throw new Error(`Картинку по ссылке скачать не удалось: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

console.log(`Модель ${model}, сервис ${base}. Рисую…`);
let result = await call("/images/generations", { model, prompt, n: 1, size: "1792x1024" });
let image = result.ok ? await imageFrom(result.json) : undefined;
if (!image) {
  if (!result.ok) console.log(`/images/generations: ${result.status} ${result.text.slice(0, 400)}\n— пробую через чат.`);
  result = await call("/chat/completions", { model, messages: [{ role: "user", content: prompt }] });
  if (!result.ok) throw new Error(`Сервис ответил ошибкой ${result.status}: ${result.text.slice(0, 500)}`);
  image = await imageFrom(result.json);
}
if (!image) {
  console.error("В ответе нет картинки — вероятно, модель только текстовая. Начало ответа:");
  console.error(result.text.slice(0, 800));
  process.exit(1);
}
await mkdir(path.dirname(out), { recursive: true });
const raw = out.replace(/\.webp$/, ".original.png");
await writeFile(raw, await sharp(image).png().toBuffer());
await sharp(image).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 85 }).toFile(out);
const meta = await sharp(out).metadata();
console.log(`Готово: ${out} (${meta.width}×${meta.height}), оригинал — ${raw}.`);
