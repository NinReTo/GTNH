"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import { formatNumber } from "@/components/landing/ui";
import { SceneSection } from "@/components/scene/SceneSection";
import { buildFactory, type BuildProgress, type Factory } from "@/lib/calc/factory";
import { optimizeSurplus, type OptimizeProgress } from "@/lib/calc/optimize";
import { STRUCTURE_READY } from "@/lib/structure";
import { loadIndex, reachOf } from "@/lib/calc/load";
import { plan as makePlan, type Choice, type Flow, type Index, type Plan } from "@/lib/calc/planner";
import type { Goods } from "@/lib/calc/repository";
import { CALC } from "@/lib/config";
import { CraftTree } from "./CraftTree";
import { Icon } from "./Icon";

const { searchLimit, defaultPerMinute, secondsPerMinute, maxTier, percent, buildShare } = CALC.ui;

/** Где сейчас сборка фабрики: считаем постройку, рисуем 3D или упали. */
type Building = { readonly stage: "build"; readonly progress: BuildProgress } | { readonly stage: "scene" } | { readonly stage: "error"; readonly message: string };

/** Полоска хода сборки: проценты и что делается сейчас. Загрузку 3D видно по текстурам three.js. */
function BuildBar({ building }: { building: Building }) {
  const textures = useProgress();
  // Текстуры грузятся пачками, и между пачками счётчик three.js обнуляется — полоска не должна ехать назад.
  const peak = useRef(0);
  if (building.stage === "error") return <p className="text-sm text-red-400">Фабрику собрать не удалось: {building.message}</p>;
  const isScene = building.stage === "scene";
  if (!isScene && building.progress.done === 0) peak.current = 0;
  const raw = isScene
    ? buildShare + ((percent - buildShare) * (textures.active ? textures.progress : 0)) / percent
    : (buildShare * building.progress.done) / building.progress.total;
  peak.current = Math.max(peak.current, raw);
  const value = peak.current;
  const label = isScene
    ? textures.active
      ? `Загружаю текстуры 3D: ${textures.loaded} из ${textures.total}`
      : "Рисую 3D-сцену"
    : building.progress.label;
  return (
    <div className="w-full max-w-md" role="status" aria-live="polite">
      <div className="flex justify-between font-mono text-xs text-text2">
        <span className="truncate">{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="mt-1 h-2 border border-line bg-bg" role="progressbar" aria-valuemin={0} aria-valuemax={percent} aria-valuenow={Math.round(value)}>
        <div className="h-full bg-accent transition-[width]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
const TIERS = CALC.tierNames.slice(0, maxTier + 1);
const FIELD = "border border-line bg-bg px-3 py-2 font-mono text-sm text-text1 focus:border-accent focus:outline-none";
const BUTTON = "border border-accent px-4 py-2 font-mono text-sm text-accent transition-colors hover:bg-accent hover:text-bg disabled:opacity-40";
const SMALL = "border border-line px-2 py-1 font-mono text-xs text-text2 hover:border-accent hover:text-accent";

const perMinute = (flow: Flow) => formatNumber(flow.perSecond * secondsPerMinute, [0, 0].length);
const unit = (goods: Goods) => (goods.kind === "fluid" ? "л/мин" : "шт/мин");

function FlowList({ flows }: { flows: readonly Flow[] }) {
  return (
    <ul className="space-y-1">
      {flows.map((flow) => (
        <li key={flow.goods.ptr} className="flex items-center gap-2">
          <Icon goods={flow.goods} />
          <span className="text-text1">{flow.goods.name}</span>
          <span className="text-text3">
            {perMinute(flow)} {unit(flow.goods)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function PlanTable({ plan }: { plan: Plan }) {
  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="font-mono text-xs uppercase tracking-widest text-text3">
          <tr>
            <th className="py-2 pr-4">Машина</th>
            <th className="py-2 pr-4">Сколько</th>
            <th className="py-2 pr-4">EU/t</th>
            <th className="py-2 pr-4">Берёт</th>
            <th className="py-2">Даёт</th>
          </tr>
        </thead>
        <tbody>
          {plan.steps.map((step) => (
            <tr key={step.recipe.ptr} className="border-t border-line align-top">
              <td className="py-3 pr-4">
                <p className="text-text1">{step.crafter.label}</p>
                {step.run.overclockTiers > 0 && <p className="text-xs text-text3">разгон: {step.run.overclockTiers}</p>}
              </td>
              <td className="py-3 pr-4 font-mono text-text1">
                {step.machines}
                <span className="block text-xs text-text3">занят {formatNumber(step.busy * percent)}%</span>
              </td>
              <td className="py-3 pr-4 font-mono text-text2">{formatNumber(step.eut)}</td>
              <td className="py-3 pr-4">
                <FlowList flows={step.inputs} />
              </td>
              <td className="py-3">
                <FlowList flows={step.outputs} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Калькулятор: товар, сколько в минуту и ярус → цепочка машин от сырья, и по кнопке — та же цепочка постройкой в 3D.
 * Расчёт идёт в браузере: выгрузка рецептов скачивается один раз (около 10 МБ).
 */
export function Calculator() {
  const [index, setIndex] = useState<Index>();
  const [error, setError] = useState<string>();
  const [tier, setTier] = useState(0);
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<Goods>();
  const [rate, setRate] = useState<number>(defaultPerMinute);
  const [factory, setFactory] = useState<Factory>();
  const [given, setGiven] = useState<ReadonlySet<number>>(new Set());
  const [picked, setPicked] = useState<ReadonlyMap<number, Choice>>(new Map());
  const choices = useMemo(() => ({ given, recipes: picked }), [given, picked]);
  const toggleGiven = (goods: number) => setGiven((old) => (old.has(goods) ? new Set([...old].filter((ptr) => ptr !== goods)) : new Set([...old, goods])));
  const pickRecipe = (goods: number, choice: Choice) => setPicked((old) => new Map([...old, [goods, choice]]));

  useEffect(() => {
    loadIndex().then(setIndex, (reason: unknown) => setError(reason instanceof Error ? reason.message : String(reason)));
  }, []);

  const reached = useMemo(() => (index ? reachOf(index, tier) : undefined), [index, tier]);
  // Минимальный ярус товара: после загрузки в фоне считаем ярусы по очереди (каждый ~0,5 с), между ними отдаём ход
  // браузеру. readyTiers — сколько ярусов, начиная с LV, уже посчитано.
  const [readyTiers, setReadyTiers] = useState(0);
  useEffect(() => {
    if (!index) return;
    let isCancelled = false;
    (async () => {
      for (let next = 0; next <= maxTier && !isCancelled; next += 1) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        if (isCancelled) return;
        reachOf(index, next);
        setReadyTiers(next + 1);
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, [index]);
  /** Первый ярус, на котором товар можно сделать; null — до UV нельзя; undefined — ещё считается. */
  const minTierOf = useCallback(
    (ptr: number): number | null | undefined => {
      if (!index) return undefined;
      for (let candidate = 0; candidate < readyTiers; candidate += 1) if (reachOf(index, candidate).cost.has(ptr)) return candidate;
      return readyTiers > maxTier ? null : undefined;
    },
    [index, readyTiers],
  );
  // Ищем по всем товарам, у которых есть рецепт, а не только по сделанным на этом ярусе: недоступные — ниже, с ярусом.
  const craftable = useMemo(() => (index ? [...index.producers.keys()].filter((ptr) => !index.raw.has(ptr)) : []), [index]);
  const search = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!index || !reached || needle.length < [0, 0].length) return { found: [], total: 0 };
    const rank = (ptr: number) => (reached.cost.has(ptr) ? -1 : (minTierOf(ptr) ?? maxTier + 1));
    const all = craftable
      .filter((ptr) => index.repository.goods(ptr).name.toLowerCase().includes(needle))
      .sort((a, b) => rank(a) - rank(b) || index.repository.goods(a).name.length - index.repository.goods(b).name.length);
    return { found: all.slice(0, searchLimit).map((ptr) => index.repository.goods(ptr)), total: all.length };
  }, [index, reached, query, craftable, minTierOf]);
  const matches = search.found;
  /** Подпись в списке: на этом ярусе можно — пусто, иначе с какого яруса. */
  const tierNote = (ptr: number): string => {
    if (reached?.cost.has(ptr)) return "";
    const least = minTierOf(ptr);
    if (least === undefined) return "ярус считается…";
    return least === null ? "до UV не сделать" : `нужен ярус ${TIERS[least]}`;
  };
  const plan = useMemo(
    () => (index && reached && target && rate > 0 ? makePlan(index, reached, target.ptr, rate / secondsPerMinute, choices) : undefined),
    [index, reached, target, rate, choices],
  );
  const [building, setBuilding] = useState<Building>();
  const factoryRef = useRef<HTMLElement>(null);
  // Номер сборки: план сменился посреди сборки — её результат уже не нужен.
  const run = useRef(0);
  // Другой план — старая фабрика уже не про него.
  useEffect(() => {
    run.current += 1;
    setFactory(undefined);
    setBuilding(undefined);
  }, [plan]);

  // Сцена нарисована — полоска больше не нужна, показываем фабрику. Слушаем всё время, а не с появления фабрики:
  // текстуры из кэша дают сигнал сразу, раньше, чем успел бы подписаться эффект.
  const awaited = useRef<string>(undefined);
  useEffect(() => {
    const handleReady = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== awaited.current) return;
      awaited.current = undefined;
      setBuilding(undefined);
      factoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener(STRUCTURE_READY, handleReady);
    return () => window.removeEventListener(STRUCTURE_READY, handleReady);
  }, []);

  const handleBuild = async () => {
    if (!plan) return;
    const mine = (run.current += 1);
    setFactory(undefined);
    try {
      // Номер сборки в имени — у каждой сборки своя сцена: повторное нажатие рисует фабрику заново.
      const built = await buildFactory(plan, `calc-${plan.target.ptr}-${plan.tier}-${mine}`, (progress) => {
        if (run.current === mine) setBuilding({ stage: "build", progress });
      });
      if (run.current !== mine) return;
      awaited.current = built.machine.slug;
      setBuilding({ stage: "scene" });
      setFactory(built);
    } catch (reason) {
      if (run.current === mine) setBuilding({ stage: "error", message: reason instanceof Error ? reason.message : String(reason) });
    }
  };
  const isBuilding = building?.stage === "build" || building?.stage === "scene";

  // «Меньше излишков»: подбор рецептов в фоне; итог — сколько было и стало лишнего и машин.
  const [optimizing, setOptimizing] = useState<OptimizeProgress>();
  const [optimized, setOptimized] = useState<{ before: number; after: number; machinesBefore: number; machinesAfter: number }>();
  useEffect(() => setOptimized(undefined), [target, tier, rate]);
  const machineCount = (result: Plan) => result.steps.reduce((sum, step) => sum + step.machines, 0);
  const handleOptimize = async () => {
    if (!index || !reached || !plan) return;
    setOptimizing({ pass: 0, done: 0, total: 1 });
    try {
      const result = await optimizeSurplus(index, reached, plan.target.ptr, plan.perSecond, choices, setOptimizing);
      const after = makePlan(index, reached, plan.target.ptr, plan.perSecond, { ...choices, recipes: result.recipes });
      setPicked(result.recipes);
      setOptimized({ before: result.before, after: result.after, machinesBefore: machineCount(plan), machinesAfter: machineCount(after) });
    } finally {
      setOptimizing(undefined);
    }
  };
  const targetLeast = plan ? minTierOf(plan.target.ptr) : undefined;
  const leastText =
    targetLeast === undefined
      ? "Ищу минимальный ярус…"
      : targetLeast === null
        ? "Ни на одном ярусе до UV: нужен ярус выше, магия или ручной крафт."
        : `Минимальный ярус — ${TIERS[targetLeast]}.`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
      <h1 className="font-mono text-3xl font-bold uppercase tracking-tight text-text1 sm:text-5xl">Калькулятор фабрики</h1>
      <p className="mt-4 max-w-2xl text-text2">
        Выберите, что делать, сколько в минуту и до какого яруса есть машины. Калькулятор подберёт самую дешёвую цепочку от
        сырья (руда, растения, жидкости из мира) и соберёт из неё фабрику в 3D. Названия товаров — английские, как в игре.
      </p>
      {error && <p className="mt-6 text-red-400">{error}. Запустите npm run calc-data и обновите страницу.</p>}
      {!index && !error && <p className="mt-6 font-mono text-sm text-text3">Загружаю рецепты…</p>}
      {index && (
        <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto_auto]">
          <label className="flex flex-col gap-1 text-sm text-text2">
            Товар
            <input className={FIELD} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="например, Steel Ingot" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text2">
            В минуту
            <input className={FIELD} type="number" min={0} value={rate} onChange={(event) => setRate(Number(event.target.value))} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text2">
            Ярус
            <select
              className={FIELD}
              value={tier}
              onChange={(event) => {
                // Выбранные рецепты — с машинами старого яруса; на новом подбираем заново.
                setPicked(new Map());
                setTier(Number(event.target.value));
              }}
            >
              {TIERS.map((name, value) => (
                <option key={name} value={value}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      {matches.length > 0 && (
        <p className="mt-2 font-mono text-xs text-text3">
          Найдено {search.total}
          {search.total > matches.length ? `, показаны первые ${matches.length} — уточните название` : ""}. Сначала — то, что можно сделать на ярусе {TIERS[tier]}.
        </p>
      )}
      {matches.length > 0 && (
        <ul className="mt-1 max-h-72 overflow-y-auto border border-line">
          {matches.map((goods) => (
            <li key={goods.ptr} className="flex items-center hover:bg-line">
              <button
                type="button"
                className="flex flex-1 items-center gap-3 px-3 py-1 text-left text-sm text-text1"
                onClick={() => {
                  setTarget(goods);
                  setQuery("");
                }}
              >
                <Icon goods={goods} />
                <span className={tierNote(goods.ptr) ? "text-text3" : undefined}>{goods.name}</span>
                <span className="text-text3">{goods.mod}</span>
                {tierNote(goods.ptr) && <span className="ml-auto font-mono text-xs text-red-400">{tierNote(goods.ptr)}</span>}
              </button>
              <button type="button" className={`${SMALL} mr-2`} onClick={() => toggleGiven(goods.ptr)}>
                {given.has(goods.ptr) ? "убрать из моих" : "есть у меня"}
              </button>
            </li>
          ))}
        </ul>
      )}
      {plan && (
        <section className="mt-10">
          <div className="flex flex-wrap items-center gap-4">
            <Icon goods={plan.target} />
            <h2 className="font-mono text-xl text-text1">
              {plan.target.name} — {formatNumber(rate)} {unit(plan.target)}, ярус {TIERS[plan.tier]}
            </h2>
            <button type="button" className={BUTTON} onClick={handleBuild} disabled={isBuilding}>
              {isBuilding ? "Собираю…" : "Собрать фабрику"}
            </button>
            {building && <BuildBar building={building} />}
          </div>
          {factory && !isBuilding && (
            <button type="button" className={`${SMALL} mt-2`} onClick={() => factoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
              Фабрика готова — показать ↓
            </button>
          )}
          <p className="mt-2 text-sm text-text2">
            Машин: {plan.steps.reduce((sum, step) => sum + step.machines, 0)}, в среднем {formatNumber(plan.averageEut)} EU/t.
          </p>
          {reached && !reached.cost.has(plan.target.ptr) && !given.has(plan.target.ptr) && (
            <div className="mt-3 flex flex-wrap items-center gap-3 border border-red-400/60 px-3 py-2 text-sm">
              <span className="text-red-400">
                На ярусе {TIERS[tier]} {plan.target.name} не сделать. {leastText}
              </span>
              {typeof targetLeast === "number" && (
                <button
                  type="button"
                  className={SMALL}
                  onClick={() => {
                    setPicked(new Map());
                    setTier(targetLeast);
                  }}
                >
                  Перейти на {TIERS[targetLeast]}
                </button>
              )}
            </div>
          )}
          {plan.missing.length > 0 && (
            <p className="mt-2 text-sm text-red-400">Не достать на этом ярусе: {plan.missing.map((goods) => goods.name).join(", ")}.</p>
          )}
          {given.size > 0 && (
            <div className="mt-6">
              <h3 className="font-mono text-sm uppercase tracking-widest text-text3">Есть у меня — не делаем</h3>
              <ul className="mt-3 flex flex-wrap gap-2 text-sm">
                {[...given].map((ptr) => {
                  const goods = index!.repository.goods(ptr);
                  return (
                    <li key={ptr} className="flex items-center gap-2 border border-line px-2 py-1">
                      <Icon goods={goods} />
                      <span className="text-text1">{goods.name}</span>
                      <button type="button" aria-label={`Убрать ${goods.name}`} className="text-text3 hover:text-accent" onClick={() => toggleGiven(ptr)}>
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <h3 className="font-mono text-sm uppercase tracking-widest text-text3">Ветка крафта</h3>
            {picked.size > 0 && (
              <button type="button" className={SMALL} onClick={() => setPicked(new Map())}>
                вернуть рецепты по умолчанию ({picked.size})
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-text3">Раскройте товар, чтобы выбрать другой рецепт, или отметьте «есть у меня» — тогда он придёт в фабрику готовым.</p>
          {reached && (
            <CraftTree index={index!} reached={reached} choices={choices} onPick={pickRecipe} onGiven={toggleGiven} target={plan.target.ptr} perSecond={plan.perSecond} />
          )}
          <PlanTable plan={plan} />
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button type="button" className={BUTTON} onClick={handleOptimize} disabled={optimizing !== undefined || plan.surplus.length === 0}>
              {optimizing ? `Подбираю рецепты: ${optimizing.done + 1} из ${optimizing.total}` : "Меньше излишков"}
            </button>
            {!optimizing && !optimized && (
              <p className="max-w-xl text-xs text-text3">
                {plan.surplus.length === 0
                  ? "Лишнего на выходе нет."
                  : "Переберу рецепты цепочки и оставлю те, после которых лишнего на выходе меньше. Машин при этом обычно становится больше."}
              </p>
            )}
            {optimized && (
              <p className="max-w-xl text-sm text-text2">
                {optimized.after < optimized.before - CALC.epsilon
                  ? `Лишнего было ${formatNumber(optimized.before * secondsPerMinute, 1)} шт/мин, стало ${formatNumber(optimized.after * secondsPerMinute, 1)} (жидкость — ведро за штуку). Машин: ${optimized.machinesBefore} → ${optimized.machinesAfter}.`
                  : "Рецептов с меньшим лишним не нашлось — эта цепочка уже самая чистая из тех, что я умею подобрать."}{" "}
                Вернуть как было — «вернуть рецепты по умолчанию» над веткой.
              </p>
            )}
          </div>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="font-mono text-sm uppercase tracking-widest text-text3">Сырьё</h3>
              <div className="mt-3 text-sm">
                <FlowList flows={plan.raw} />
              </div>
              {plan.given.length > 0 && (
                <>
                  <h3 className="mt-6 font-mono text-sm uppercase tracking-widest text-text3">Своё (подвозить)</h3>
                  <div className="mt-3 text-sm">
                    <FlowList flows={plan.given} />
                  </div>
                </>
              )}
            </div>
            {plan.surplus.length > 0 && (
              <div>
                <h3 className="font-mono text-sm uppercase tracking-widest text-text3">Лишнее на выходе</h3>
                <div className="mt-3 text-sm">
                  <FlowList flows={plan.surplus} />
                </div>
              </div>
            )}
          </div>
        </section>
      )}
      {factory && (
        <section ref={factoryRef} className="mt-12 scroll-mt-24">
          <SceneSection machine={factory.machine}>
            <p className="font-mono text-sm text-text1">Фабрика: {plan?.target.name}. Вращайте мышкой.</p>
          </SceneSection>
          {factory.notes.length > 0 && (
            <ul className="mt-4 list-disc pl-6 text-sm text-text2">
              {factory.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          )}
        </section>
      )}
      <p className="mt-16 text-xs text-text3">
        Рецепты и правила разгона машин — из калькулятора ShadowTheAge (github.com/ShadowTheAge/gtnh, лицензия MIT),
        выгрузка сборки {"GTNH 2.9.0"}. Выбор цепочки и фабрика в 3D — наши.
      </p>
    </div>
  );
}
