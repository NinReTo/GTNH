// Данные рецептов для калькулятора: выгрузка GTNH из открытого калькулятора ShadowTheAge (MIT,
// https://github.com/ShadowTheAge/gtnh). Сжатый gzip-файл кладём как есть — сайт распаковывает его сам.
// Импорт 2.9.0 от 19.07.2026. Рецепты и значки берём из одного коммита, чтобы их индексы совпадали.
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = "https://raw.githubusercontent.com/ShadowTheAge/gtnh-data/d200440ea31d0357068a294d7312acf1146de909";
const FILES = {
  "data.bin": "624c9a20c8476dc630c274145dc04c72d7c582e130a3599dc49ce9aee0a2fe73",
  "atlas.webp": "4079548e2e53a55b85d3809821ea11cfbf1bde898014979e9e6afea62204f185",
};
const checksum = (buffer) => createHash("sha256").update(buffer).digest("hex");

const target = path.join(ROOT, "public", "calc");
await mkdir(target, { recursive: true });
const downloads = [];
for (const [file, expected] of Object.entries(FILES)) {
  const destination = path.join(target, file);
  const cached = await readFile(destination).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
  if (cached && checksum(cached) === expected && !process.argv.includes("--force")) {
    console.log(`  = ${file} (контрольная сумма совпадает)`);
    continue;
  }
  const response = await fetch(`${SOURCE}/${file}`);
  if (!response.ok) throw new Error(`${file}: ${response.status} ${response.statusText}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (checksum(buffer) !== expected) throw new Error(`${file}: контрольная сумма выгрузки не совпадает`);
  downloads.push({ file, destination, buffer, temporary: `${destination}.${process.pid}.tmp` });
}
try {
  for (const { buffer, temporary } of downloads) await writeFile(temporary, buffer);
  for (const { file, destination, temporary } of downloads) {
    await rename(temporary, destination);
    console.log(`  ✓ ${file}`);
  }
} finally {
  await Promise.all(downloads.map(({ temporary }) => rm(temporary, { force: true })));
}
