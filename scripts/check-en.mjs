// Проверка английской версии после сборки: есть ли кириллица в видимом тексте и подписях готовых страниц /en.
// Скрипты и стили не смотрим — там лежат данные для браузера. Запуск: npm run build, затем npm run check-en.
// Выход с ошибкой, если нашлась хоть одна русская строка (и список первых 40 — какие и на какой странице).
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = path.join(".next", "server", "app", "en");
const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (name.endsWith(".html")) files.push(full);
  }
};
walk(root);

const hits = new Map();
for (const file of files) {
  const html = readFileSync(file, "utf8").replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "");
  const texts = [
    ...[...html.matchAll(/>([^<]+)</g)].map((match) => match[1]),
    ...[...html.matchAll(/(?:title|alt|aria-label|placeholder|content)="([^"]*)"/g)].map((match) => match[1]),
  ];
  for (const text of texts.filter((candidate) => /[А-Яа-яЁё]/.test(candidate))) {
    const key = text.trim().slice(0, 140);
    hits.set(key, hits.get(key) ?? path.relative(root, file));
  }
}
console.log(`страниц ${files.length}, русских строк ${hits.size}`);
for (const [text, file] of [...hits].slice(0, 40)) console.log(`${file}\t${text}`);
process.exit(hits.size > 0 ? 1 : 0);
