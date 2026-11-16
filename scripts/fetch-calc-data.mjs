// Данные рецептов для калькулятора: выгрузка GTNH из открытого калькулятора ShadowTheAge (MIT,
// https://github.com/ShadowTheAge/gtnh). Сжатый gzip-файл кладём как есть — сайт распаковывает его сам.
// Выгрузка — GTNH 2.9.0: на сайте лежит ветка 2.9.0-v7 репозитория ShadowTheAge/gtnh-data (коммит «Import for 2.9.0»,
// 19.07.2026; хеш data.bin 4e15fde3… совпадает). Надпись «2.8.0» в их README устарела.
import { mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = "https://shadowtheage.github.io/gtnh/data";
const FILES = ["data.bin", "atlas.webp"];

const target = path.join(ROOT, "public", "calc");
await mkdir(target, { recursive: true });
for (const file of FILES) {
  const destination = path.join(target, file);
  const exists = await stat(destination).then(() => true, () => false);
  if (exists && !process.argv.includes("--force")) {
    console.log(`  = ${file} (уже есть)`);
    continue;
  }
  const response = await fetch(`${SOURCE}/${file}`);
  if (!response.ok) throw new Error(`${file}: ${response.status} ${response.statusText}`);
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
  console.log(`  ✓ ${file}`);
}
