import { asset } from "@/lib/asset";
import { buildIndex, reach, type Index, type Reach } from "./planner";
import { Repository } from "./repository";

/** Выгрузка рецептов GTNH (scripts/fetch-calc-data.mjs кладёт её в public/calc). */
export const DATA_URL = asset("/calc/data.bin");
export const ATLAS_URL = asset("/calc/atlas.webp");

let loading: Promise<Index> | undefined;
const reached = new Map<number, Reach>();

/** Скачивает и разбирает выгрузку один раз на вкладку: файл в gzip, распаковывает сам браузер. */
export function loadIndex(): Promise<Index> {
  loading ??= (async () => {
    const response = await fetch(DATA_URL);
    if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);
    const buffer = await new Response(response.body.pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
    return buildIndex(new Repository(buffer));
  })();
  // Сбой не запоминаем — следующая попытка скачает заново.
  loading.catch(() => (loading = undefined));
  return loading;
}

/** Что достижимо на ярусе — считается раз на ярус (полсекунды). */
export function reachOf(index: Index, tier: number): Reach {
  const known = reached.get(tier);
  if (known) return known;
  const result = reach(index, tier);
  reached.set(tier, result);
  return result;
}
