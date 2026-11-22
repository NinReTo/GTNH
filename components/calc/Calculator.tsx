"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import { formatNumber } from "@/components/landing/ui";
import { SceneSection } from "@/components/scene/SceneSection";
import { cableOffers, goodsByName, pipeOffers } from "@/lib/calc/conduits";
import { buildFactory, type BuildProgress, type Factory } from "@/lib/calc/factory";
import { optimizeSurplus, type OptimizeProgress } from "@/lib/calc/optimize";
import { fuelInputs, fuelsOf, generatorChoices, tierIdOf, type Fuel } from "@/lib/calc/power";
import { STRUCTURE_READY } from "@/lib/structure";
import { loadIndex, reachOf } from "@/lib/calc/load";
import { plan as makePlan, runningEut, type Choice, type Flow, type Index, type Plan } from "@/lib/calc/planner";
import type { Goods } from "@/lib/calc/repository";
import { BlueprintExport } from "./BlueprintExport";
import { CALC, GAME } from "@/lib/config";
import { useLang } from "@/lib/use-lang";
import { CraftTree } from "./CraftTree";
import { CalcTextProvider, isCircuitSearch, makeText, useCalcText, useNames, type CalcText } from "./text";
import { Icon } from "./Icon";

const { searchLimit, defaultPerMinute, secondsPerMinute, maxTier, percent, buildShare } = CALC.ui;

/** Где сейчас сборка фабрики: считаем постройку, рисуем 3D или упали. */
type Building = { readonly stage: "build"; readonly progress: BuildProgress } | { readonly stage: "scene" } | { readonly stage: "error" };

/** Полоска хода сборки: проценты и что делается сейчас. Загрузку 3D видно по текстурам three.js. */
function BuildBar({ building }: { building: Building }) {
  const { t } = useCalcText();
  const textures = useProgress();
  // Текстуры грузятся пачками, и между пачками счётчик three.js обнуляется — полоска не должна ехать назад.
  const peak = useRef(0);
  if (building.stage === "error") return <p className="text-sm text-red-400">{t("Фабрику собрать не удалось", "Could not build the factory")}</p>;
  const isScene = building.stage === "scene";
  if (!isScene && building.progress.done === 0) peak.current = 0;
  const raw = isScene
    ? buildShare + ((percent - buildShare) * (textures.active ? textures.progress : 0)) / percent
    : (buildShare * building.progress.done) / building.progress.total;
  peak.current = Math.max(peak.current, raw);
  const value = peak.current;
  const label = isScene
    ? textures.active
      ? t(`Загружаю текстуры 3D: ${textures.loaded} из ${textures.total}`, `Loading 3D textures: ${textures.loaded} of ${textures.total}`)
      : t("Рисую 3D-сцену", "Drawing the 3D scene")
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

const perMinute = (flow: Flow, text: CalcText) => text.number(flow.perSecond * secondsPerMinute, [0, 0].length);
const unit = (goods: Goods, text: CalcText) => (goods.kind === "fluid" ? text.t("л/мин", "L/min") : text.t("шт/мин", "/min"));

function FlowList({ flows }: { flows: readonly Flow[] }) {
  const text = useCalcText();
  return (
    <ul className="space-y-1">
      {flows.map((flow) => (
        <li key={flow.goods.ptr} className="flex items-center gap-2">
          <Icon goods={flow.goods} />
          <span className="text-text1">{text.name(flow.goods)}</span>
          <span className="text-text3">
            {perMinute(flow, text)} {unit(flow.goods, text)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function PlanTable({ plan }: { plan: Plan }) {
  const text = useCalcText();
  const { t } = text;
  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="font-mono text-xs uppercase tracking-widest text-text3">
          <tr>
            <th className="py-2 pr-4">{t("Машина", "Machine")}</th>
            <th className="py-2 pr-4">{t("Сколько", "How many")}</th>
            <th className="py-2 pr-4">EU/t</th>
            <th className="py-2 pr-4">{t("Берёт", "Takes")}</th>
            <th className="py-2">{t("Даёт", "Gives")}</th>
          </tr>
        </thead>
        <tbody>
          {plan.steps.map((step) => (
            <tr key={step.recipe.ptr} className="border-t border-line align-top">
              <td className="py-3 pr-4">
                <p className="text-text1">{text.crafter(step.crafter)}</p>
                {step.run.overclockTiers > 0 && <p className="text-xs text-text3">{t("разгон", "overclock")}: {step.run.overclockTiers}</p>}
              </td>
              <td className="py-3 pr-4 font-mono text-text1">
                {step.machines}
                <span className="block text-xs text-text3">{t("занят", "busy")} {text.number(step.busy * percent)}%</span>
              </td>
              <td className="py-3 pr-4 font-mono text-text2">{text.number(step.eut)}</td>
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
  const lang = useLang();
  const names = useNames(lang);
  const text = useMemo(() => makeText(lang, names), [lang, names]);
  const { t, name } = text;
  const [index, setIndex] = useState<Index>();
  const [error, setError] = useState(false);
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
    loadIndex().then(setIndex, (reason: unknown) => {
      console.error(reason);
      setError(true);
    });
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
  /** Первый ярус, на котором товар можно сделать; null — нельзя ни на одном; undefined — ещё считается. */
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
      .filter((ptr) => text.matches(index.repository.goods(ptr), needle, index.repository.circuitTiers.get(ptr)))
      .sort((a, b) => rank(a) - rank(b) || name(index.repository.goods(a)).length - name(index.repository.goods(b)).length);
    const includeCircuits = isCircuitSearch(needle);
    const shown = all.filter((ptr, position) => position < searchLimit ||
      (includeCircuits && index.repository.circuitTiers.has(ptr)));
    return { found: shown.map((ptr) => index.repository.goods(ptr)), total: all.length };
  }, [index, reached, query, craftable, minTierOf, text, name]);
  const matches = search.found;
  /** Подпись в списке: на этом ярусе можно — пусто, иначе с какого яруса. */
  const tierNote = (ptr: number): string => {
    if (reached?.cost.has(ptr)) return "";
    const least = minTierOf(ptr);
    if (least === undefined) return t("ярус считается…", "working out the tier…");
    return least === null ? t("не сделать ни на одном ярусе", "not possible on any tier") : t(`нужен ярус ${TIERS[least]}`, `needs ${TIERS[least]}`);
  };
  const plan = useMemo(
    () => (index && reached && target && rate > 0 ? makePlan(index, reached, target.ptr, rate / secondsPerMinute, choices) : undefined),
    [index, reached, target, rate, choices],
  );
  // Генератор и топливо: генераторы яруса с сайта; топливо — то, что можно сделать на ярусе, по умолчанию самое дешёвое на 1 EU.
  const generators = useMemo(() => generatorChoices(tierIdOf(tier)), [tier]);
  const [generatorSlug, setGeneratorSlug] = useState<string>();
  const generator = generators.find((single) => single.slug === generatorSlug) ?? generators[0];
  const fuels = useMemo(() => {
    if (!index || !reached || !generator) return [];
    const price = (fuel: Fuel) => (reached.cost.get(fuel.goods.ptr) ?? Infinity) / (fuel.euPerLitre * fuel.efficiency);
    const all = fuelsOf(generator, index.repository, index.vendor, tierIdOf(tier));
    // Пар делают котлы — у него свой порядок (котлы сайта), а не цена товара.
    return all.some((fuel) => fuel.steam) ? all : all.filter((fuel) => reached.cost.has(fuel.goods.ptr)).sort((a, b) => price(a) - price(b));
  }, [index, reached, generator, tier]);
  // Ключ топлива: у пара — котёл (товар у всех вариантов один), у остальных — номер товара.
  const fuelKey = (each: Fuel) => each.steam?.boiler.slug ?? String(each.goods.ptr);
  const [fuelId, setFuelId] = useState<string>();
  const fuel = fuels.find((each) => fuelKey(each) === fuelId) ?? fuels[0];
  const fuelPlans = useMemo(() => {
    if (!index || !reached || !plan || !fuel) return [];
    const voltage = GAME.voltageTiers[plan.tier + 1].voltage;
    const peak = plan.steps.reduce((sum, step) =>
      sum + Math.ceil(runningEut(step) / voltage - CALC.epsilon) * voltage * step.machines, 0);
    return fuelInputs(peak, fuel, index.repository)
      .filter(({ goods }) => !fuel.steam || goods.name !== CALC.power.water)
      .map(({ goods, perSecond }) => makePlan(index, reached, goods.ptr, perSecond, choices));
  }, [index, reached, plan, fuel, choices]);
  const [building, setBuilding] = useState<Building>();
  const factoryRef = useRef<HTMLElement>(null);
  // Номер сборки: план сменился посреди сборки — её результат уже не нужен.
  const run = useRef(0);
  // Другой план или другой генератор — старая фабрика уже не про них.
  useEffect(() => {
    run.current += 1;
    setFactory(undefined);
    setBuilding(undefined);
  }, [plan, generator, fuel]);

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
      // Трубы — те, что калькулятор умеет сделать на ярусе плана, с их ценой; кабели — по имени из выгрузки.
      const repository = index?.repository;
      const power = generator ? { generatorSlug: generator.slug, fuel } : undefined;
      const options = repository && reached ? { pipes: pipeOffers(repository, reached.cost), cables: cableOffers(repository, reached.cost), goodsNamed: goodsByName(repository), power } : { power };
      const built = await buildFactory(
        plan,
        `calc-${plan.target.ptr}-${plan.tier}-${mine}`,
        text,
        (progress) => {
          if (run.current === mine) setBuilding({ stage: "build", progress });
        },
        options,
      );
      if (run.current !== mine) return;
      awaited.current = built.machine.slug;
      setBuilding({ stage: "scene" });
      setFactory(built);
    } catch (reason) {
      if (run.current === mine) {
        console.error(reason);
        setBuilding({ stage: "error" });
      }
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
      ? t("Ищу минимальный ярус…", "Looking for the lowest tier…")
      : targetLeast === null
        ? t("Ни на одном ярусе: нужны магия, ручной крафт или машины, которых калькулятор не знает.", "Not on any tier: it needs magic, hand crafting or machines the calculator does not know.")
        : t(`Минимальный ярус — ${TIERS[targetLeast]}.`, `Lowest tier: ${TIERS[targetLeast]}.`);

  return (
    <CalcTextProvider value={text}>
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
      <h1 className="font-mono text-3xl font-bold uppercase tracking-tight text-text1 sm:text-5xl">{t("Калькулятор фабрики", "Factory calculator")}</h1>
      <p className="mt-4 max-w-2xl text-text2">
        {t(
          "Выберите, что делать, сколько в минуту и до какого яруса есть машины. Калькулятор подберёт самую дешёвую цепочку от сырья (руда, растения, жидкости из мира) и соберёт из неё фабрику в 3D. Названия — как в игре с русификатором; искать можно и по-русски, и по-английски.",
          "Pick what to make, how many per minute and up to which tier you have machines. The calculator finds the cheapest chain from raw materials (ores, plants, fluids from the world) and builds a 3D factory from it. Item names are the in-game English ones.",
        )}
      </p>
      {error && <p className="mt-6 text-red-400">{t("Не удалось загрузить рецепты. Запустите npm run calc-data и обновите страницу.", "Could not load recipes. Run npm run calc-data and reload the page.")}</p>}
      {!index && !error && <p className="mt-6 font-mono text-sm text-text3">{t("Загружаю рецепты…", "Loading recipes…")}</p>}
      {index && (
        <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto_auto]">
          <label className="flex flex-col gap-1 text-sm text-text2">
            {t("Товар", "Item")}
            <input
              className={FIELD}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("например, Сталь или Steel Ingot", "e.g. Steel Ingot")}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text2">
            {t("В минуту", "Per minute")}
            <input className={FIELD} type="number" min={0} value={rate} onChange={(event) => setRate(Number(event.target.value))} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text2">
            {t("Ярус", "Tier")}
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
      {index && generator && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-text2">
            {t("Генератор", "Generator")}
            <select className={FIELD} value={generator.slug} onChange={(event) => setGeneratorSlug(event.target.value)}>
              {generators.map((single) => (
                <option key={single.slug} value={single.slug}>
                  {t(single.title, single.name)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-text2">
            {t("Топливо", "Fuel")}
            <select className={FIELD} value={fuel ? fuelKey(fuel) : ""} disabled={fuels.length === 0} onChange={(event) => setFuelId(event.target.value)}>
              {fuels.length === 0 && <option value="">{t("нет топлива на этом ярусе", "no fuel on this tier")}</option>}
              {fuels.map((each) => (
                <option key={fuelKey(each)} value={fuelKey(each)}>
                  {each.steam
                    ? `${name(each.goods)}: ${t(each.steam.boiler.title, each.steam.boiler.name)} — ${text.number(each.steam.steamPerSecond)} ${t("л/с", "L/s")}`
                    : `${name(each.goods)} — ${text.number(each.euPerLitre, 1)} EU/${each.isItem ? t("шт", "pc") : t("л", "L")}`}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      {matches.length > 0 && (
        <p className="mt-2 font-mono text-xs text-text3">
          {t(`Найдено ${search.total}`, `Found ${search.total}`)}
          {search.total > matches.length ? t(`, показаны первые ${matches.length} — уточните название`, `, showing the first ${matches.length} — refine the name`) : ""}.{" "}
          {t(`Сначала — то, что можно сделать на ярусе ${TIERS[tier]}.`, `Things you can make on ${TIERS[tier]} come first.`)}
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
                <span className={tierNote(goods.ptr) ? "text-text3" : undefined}>{name(goods)}</span>
                <span className="text-text3">{goods.mod}</span>
                {tierNote(goods.ptr) && <span className="ml-auto font-mono text-xs text-red-400">{tierNote(goods.ptr)}</span>}
              </button>
              <button type="button" className={`${SMALL} mr-2`} onClick={() => toggleGiven(goods.ptr)}>
                {given.has(goods.ptr) ? t("убрать из моих", "remove from mine") : t("есть у меня", "I have it")}
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
              {name(plan.target)} — {text.number(rate)} {unit(plan.target, text)}, {t("ярус", "tier")} {TIERS[plan.tier]}
            </h2>
            <button type="button" className={BUTTON} onClick={handleBuild} disabled={isBuilding}>
              {isBuilding ? t("Собираю…", "Building…") : t("Собрать фабрику", "Build the factory")}
            </button>
            {building && <BuildBar building={building} />}
          </div>
          {factory && !isBuilding && (
            <button type="button" className={`${SMALL} mt-2`} onClick={() => factoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
              {factory.missingConnections > 0
                ? t("Показать неполную схему ↓", "Show incomplete layout ↓")
                : t("Фабрика готова — показать ↓", "The factory is ready — show ↓")}
            </button>
          )}
          <p className="mt-2 text-sm text-text2">
            {t("Машин", "Machines")}: {plan.steps.reduce((sum, step) => sum + step.machines, 0)}, {t("в среднем", "on average")}{" "}
            {text.number(plan.averageEut)} EU/t, {t("при одновременной работе", "when running together")}{" "}
            {text.number(plan.steps.reduce((sum, step) => sum + runningEut(step) * step.machines, 0))} EU/t.
          </p>
          {reached && !reached.cost.has(plan.target.ptr) && !given.has(plan.target.ptr) && (
            <div className="mt-3 flex flex-wrap items-center gap-3 border border-red-400/60 px-3 py-2 text-sm">
              <span className="text-red-400">
                {t(`На ярусе ${TIERS[tier]} «${name(plan.target)}» не сделать.`, `${name(plan.target)} cannot be made on ${TIERS[tier]}.`)} {leastText}
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
                  {t("Перейти на", "Switch to")} {TIERS[targetLeast]}
                </button>
              )}
            </div>
          )}
          {plan.missing.length > 0 && (
            <p className="mt-2 text-sm text-red-400">
              {t("Не достать на этом ярусе", "Not available on this tier")}: {plan.missing.map((goods) => name(goods)).join(", ")}.
            </p>
          )}
          {given.size > 0 && (
            <div className="mt-6">
              <h3 className="font-mono text-sm uppercase tracking-widest text-text3">{t("Есть у меня — не делаем", "I have these — not made")}</h3>
              <ul className="mt-3 flex flex-wrap gap-2 text-sm">
                {[...given].map((ptr) => {
                  const goods = index!.repository.goods(ptr);
                  return (
                    <li key={ptr} className="flex items-center gap-2 border border-line px-2 py-1">
                      <Icon goods={goods} />
                      <span className="text-text1">{name(goods)}</span>
                      <button type="button" aria-label={t(`Убрать ${name(goods)}`, `Remove ${name(goods)}`)} className="text-text3 hover:text-accent" onClick={() => toggleGiven(ptr)}>
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <h3 className="font-mono text-sm uppercase tracking-widest text-text3">{t("Ветка крафта", "Crafting tree")}</h3>
            {picked.size > 0 && (
              <button type="button" className={SMALL} onClick={() => setPicked(new Map())}>
                {t("вернуть рецепты по умолчанию", "reset recipes to default")} ({picked.size})
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-text3">
            {t(
              "Раскройте товар, чтобы выбрать другой рецепт, или отметьте «есть у меня» — тогда он придёт в фабрику готовым.",
              "Open an item to pick another recipe, or tick “I have it” — then it comes into the factory ready-made.",
            )}
          </p>
          {reached && (
            <CraftTree index={index!} reached={reached} choices={choices} onPick={pickRecipe} onGiven={toggleGiven} target={plan.target.ptr} perSecond={plan.perSecond} />
          )}
          <PlanTable plan={plan} />
          {index && reached && (fuelPlans.length > 0 || (fuel?.steam && !!plan.averageEut)) && (
            <section className="mt-8 border-t border-line pt-4">
              <h3 className="font-mono text-sm uppercase tracking-widest text-text3">
                {t("Производство топлива", "Fuel production")}
              </h3>
              <p className="mt-2 text-sm text-text2">
                {t(
                  "Расход рассчитан для одновременной работы машин, с учётом целых ампер.",
                  "Demand is sized for all machines running together, rounded up to whole amps.",
                )}
              </p>
              {fuel?.steam && <p className="mt-2 text-sm text-text2">
                {t("Воду для котлов даёт паровой насос. Перед первым запуском нужно заполнить пусковой бак.",
                  "A steam-powered pump supplies the boilers with water. Fill the startup tank before first use.")}
              </p>}
              {fuelPlans.map((supply) => (
                <div key={supply.target.ptr} className="mt-4 border-b border-line pb-4">
                  <CraftTree index={index} reached={reached} choices={choices} onPick={pickRecipe} onGiven={toggleGiven} target={supply.target.ptr} perSecond={supply.perSecond} />
                  <PlanTable plan={supply} />
                </div>
              ))}
            </section>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button type="button" className={BUTTON} onClick={handleOptimize} disabled={optimizing !== undefined || plan.surplus.length === 0}>
              {optimizing
                ? t(`Подбираю рецепты: ${optimizing.done + 1} из ${optimizing.total}`, `Picking recipes: ${optimizing.done + 1} of ${optimizing.total}`)
                : t("Меньше излишков", "Less surplus")}
            </button>
            {!optimizing && !optimized && (
              <p className="max-w-xl text-xs text-text3">
                {plan.surplus.length === 0
                  ? t("Лишнего на выходе нет.", "There is no surplus at the output.")
                  : t(
                      "Переберу рецепты цепочки и оставлю те, после которых лишнего на выходе меньше. Машин при этом обычно становится больше.",
                      "I will try the chain's recipes and keep those that leave less surplus at the output. This usually takes more machines.",
                    )}
              </p>
            )}
            {optimized && (
              <p className="max-w-xl text-sm text-text2">
                {optimized.after < optimized.before - CALC.epsilon
                  ? t(
                      `Лишнего было ${text.number(optimized.before * secondsPerMinute, 1)} шт/мин, стало ${text.number(optimized.after * secondsPerMinute, 1)} (жидкость — ведро за штуку). Машин: ${optimized.machinesBefore} → ${optimized.machinesAfter}.`,
                      `Surplus was ${text.number(optimized.before * secondsPerMinute, 1)} items/min, now ${text.number(optimized.after * secondsPerMinute, 1)} (a bucket of fluid counts as one item). Machines: ${optimized.machinesBefore} → ${optimized.machinesAfter}.`,
                    )
                  : t(
                      "Рецептов с меньшим лишним не нашлось — эта цепочка уже самая чистая из тех, что я умею подобрать.",
                      "No recipes with less surplus were found — this chain is already the cleanest I can pick.",
                    )}{" "}
                {t("Вернуть как было — «вернуть рецепты по умолчанию» над веткой.", "To undo, use “reset recipes to default” above the tree.")}
              </p>
            )}
          </div>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="font-mono text-sm uppercase tracking-widest text-text3">{t("Сырьё", "Raw materials")}</h3>
              <div className="mt-3 text-sm">
                <FlowList flows={plan.raw} />
              </div>
              {plan.given.length > 0 && (
                <>
                  <h3 className="mt-6 font-mono text-sm uppercase tracking-widest text-text3">{t("Своё (подвозить)", "Your own (bring in)")}</h3>
                  <div className="mt-3 text-sm">
                    <FlowList flows={plan.given} />
                  </div>
                </>
              )}
            </div>
            {plan.surplus.length > 0 && (
              <div>
                <h3 className="font-mono text-sm uppercase tracking-widest text-text3">{t("Лишнее на выходе", "Surplus at the output")}</h3>
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
          <SceneSection machine={factory.machine} markers={factory.markers} chunkOrigin={factory.chunkOrigin}>
            <p className="font-mono text-sm text-text1">
              {t("Фабрика", "Factory")}: {plan && name(plan.target)}.{" "}
              {t(
                "Левая кнопка — вращение, правая — сдвиг. Ctrl или Cmd с колёсиком — приближение к курсору. Наведите на плашку, чтобы увидеть рецепт.",
                "Drag with the left button to rotate or the right button to pan. Hold Ctrl or Cmd and scroll to zoom toward the cursor. Hover over a label to see the recipe.",
              )}
            </p>
          </SceneSection>
          <BlueprintExport key={factory.machine.slug} machine={factory.machine} title={plan ? name(plan.target) : factory.machine.title} t={t} />
          <dl className="mt-4 grid grid-cols-2 gap-px border border-line bg-line font-mono text-sm sm:grid-cols-4 lg:grid-cols-7">
            {[
              [t("Чанков с машинами", "Chunks with machines"), `${factory.stats.productionChunks} (${factory.stats.chunkSize.join(" × ")})`],
              [t("Машин", "Machines"), factory.stats.drawn < factory.stats.machines ? `${factory.stats.machines} (${t("нарисовано", "drawn")} ${factory.stats.drawn})` : String(factory.stats.machines)],
              [t("Труб, блоков", "Pipe blocks"), String(factory.stats.pipes)],
              [t("Резервуаров", "Tanks"), String(factory.stats.tanks)],
              [t("Сундуков", "Chests"), String(factory.stats.chests)],
              [t("Кабелей, блоков", "Cable blocks"), String(factory.stats.cables)],
              [t("Генерация", "Generation"), `${text.number(factory.stats.generationEut)} EU/t`],
            ].map(([label, value]) => (
              <div key={label} className="bg-bg px-4 py-3">
                <dt className="text-xs uppercase tracking-widest text-text3">{label}</dt>
                <dd className="mt-1 text-lg text-text1">{value}</dd>
              </div>
            ))}
          </dl>
          {factory.conduits.length > 0 && (
            <div className="mt-6">
              <h3 className="font-mono text-xs uppercase tracking-widest text-text3">{t("Трубы и кабели", "Pipes and cables")}</h3>
              <ul className="mt-2 divide-y divide-line border border-line font-mono text-sm">
                {factory.conduits.map((conduit) => (
                  <li key={conduit.label} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 bg-bg px-4 py-2">
                    <span className="text-text1">{conduit.label}</span>
                    {conduit.blocks > 0 && (
                      <span className="text-accent">
                        {conduit.blocks} {t("блоков", "blocks")}
                      </span>
                    )}
                    <span className="text-xs text-text3">{conduit.detail}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-text3">
                {t(
                  "Калькулятор выбирает самую маленькую трубу, которая доступна на ярусе и выдерживает поток и температуру. При равной пропускной способности он выбирает более дешёвую. Чтобы посмотреть рецепт, найдите трубу по названию в поле «Товар».",
                  "The calculator picks the smallest pipe available at this tier that can handle the flow and temperature. If capacities match, it picks the cheaper pipe. To see the recipe, search for the pipe by name in Product.",
                )}
              </p>
            </div>
          )}
          <p className="mt-2 text-xs text-text3">
            {t(
              "Плашки: оранжевая — готовый товар, красные — излишки (жидкость в резервуаре, предметы в сундуке), остальные — ряды машин.",
              "Labels: orange — the product, red — surplus (fluids in a tank, items in a chest), the rest — rows of machines.",
            )}
          </p>
          {factory.missingConnections > 0 && (
            <p role="status" className="mt-4 text-sm text-red-400">
              {t("Калькулятор не смог собрать полностью подключённую фабрику.", "The calculator could not build a fully connected factory.")}
            </p>
          )}
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
        {t(
          "Рецепты и правила разгона машин — из калькулятора ShadowTheAge (github.com/ShadowTheAge/gtnh, лицензия MIT), выгрузка сборки GTNH 2.9.0. Русские названия — из русификатора сборки. Выбор цепочки и фабрика в 3D — наши.",
          "Recipes and machine overclock rules come from the ShadowTheAge calculator (github.com/ShadowTheAge/gtnh, MIT license), GTNH 2.9.0 export. Chain picking and the 3D factory are ours.",
        )}
      </p>
    </div>
    </CalcTextProvider>
  );
}
