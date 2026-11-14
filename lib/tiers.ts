import { GAME } from "./config";

/** Ярус напряжения на сайте. Пар — до электричества; дальше — ярусы самого мода. */
export type TierId = "steam" | "lv" | "mv" | "hv" | "ev" | "iv" | "luv" | "zpm" | "uv" | "uhv" | "uev" | "uiv" | "umv" | "uxv" | "max";

/** Что показывает шапка страницы яруса: весь паровой цех или одну постройку. */
export type TierScene = { readonly kind: "workshop" } | { readonly kind: "machine"; readonly slug: string };

export interface Tier {
  readonly id: TierId;
  /** Короткое имя — как в игре. */
  readonly title: string;
  /** Подпись под именем. */
  readonly subtitle: string;
  readonly color: string;
  /** Значок вкладки: текстура из public/textures/gregtech без расширения. */
  readonly icon: string;
  /** Пара фраз о ярусе. */
  readonly summary: string;
  readonly scene: TierScene;
}

export const TIERS: readonly Tier[] = [
  {
    id: "steam",
    title: "Пар",
    subtitle: "до электричества",
    color: GAME.tierColors.steam,
    // Фасад бронзовой паровой печи — самая узнаваемая машина пара.
    icon: "single-bronze-furnace",
    summary:
      "Первые машины мода. Коксовые печи и кирпичная домна работают на одном угле, остальное — на паре из котлов: бронзовые машины, стальные и большие постройки.",
    scene: { kind: "workshop" },
  },
  {
    id: "lv",
    title: "LV",
    subtitle: `${GAME.voltageTiers[1].voltage} EU/t`,
    color: GAME.tierColors.lv,
    // Энергетический люк LV — то, чем электричество входит в машину.
    icon: "energy",
    summary:
      "Первый ярус электричества. Пар крутит турбины, турбины кормят десятки новых машин, а главная постройка яруса — электрическая доменная печь: она плавит то, что кирпичной домне не по силам.",
    scene: { kind: "machine", slug: "electric-blast-furnace" },
  },
  {
    id: "mv",
    title: "MV",
    subtitle: `${GAME.voltageTiers[2].voltage} EU/t`,
    color: GAME.tierColors.mv,
    // Контроллер мультиплавильни — первая большая постройка яруса.
    icon: "multi-smelter-controller",
    summary:
      "Второй ярус электричества. Новых правил почти нет — зато всё знакомое становится больше и быстрее: нефть, пластик, алюминий и нержавеющая сталь.",
    scene: { kind: "machine", slug: "pyrolyse-oven" },
  },
  {
    id: "hv",
    title: "HV",
    subtitle: `${GAME.voltageTiers[GAME.hvTier].voltage} EU/t`,
    color: GAME.tierColors.hv,
    // Контроллер ректификационной колонны — главной постройки яруса.
    icon: "dt-controller",
    summary:
      "Третий ярус электричества. Появляются чистая комната, большие версии привычных машин и первые полёты в космос — а нержавеющей стали нужно очень много.",
    scene: { kind: "machine", slug: "distillation-tower" },
  },
  {
    id: "ev",
    title: "EV",
    subtitle: `${GAME.voltageTiers[GAME.highTiers.ev].voltage} EU/t`,
    color: GAME.tierColors.ev,
    // Контроллер большого дизельного двигателя — первый ответ на энергетический кризис яруса.
    icon: "lce-controller",
    summary:
      "Четвёртый ярус электричества. Всё держится на титане: большие двигатели и турбины, хранилище энергии, многоблочная переработка руды и полёт на Марс.",
    scene: { kind: "machine", slug: "large-combustion-engine" },
  },
  {
    id: "iv",
    title: "IV",
    subtitle: `${GAME.voltageTiers[GAME.highTiers.iv].voltage} EU/t`,
    color: GAME.tierColors.iv,
    // Контроллер сборочной линии — постройки, которая открывает следующий ярус.
    icon: "assline-controller",
    summary:
      "Пятый ярус и самый тяжёлый. Ручная сборка заканчивается: нужны платиновая линия, новые печи и сборочная линия — ворота в следующий ярус.",
    scene: { kind: "machine", slug: "assembly-line" },
  },
  {
    id: "luv",
    title: "LuV",
    subtitle: `${GAME.voltageTiers[GAME.highTiers.luv].voltage} EU/t`,
    color: GAME.tierColors.luv,
    // Контроллер реактора синтеза I — цель яруса.
    icon: "fusion1-controller",
    summary:
      "Шестой ярус. Он короче предыдущего, и у него одна цель — первый реактор синтеза: он даёт европий, без которого не собрать детали ZPM. Детали яруса впервые делает сборочная линия.",
    scene: { kind: "machine", slug: "fusion-reactor-1" },
  },
  {
    id: "zpm",
    title: "ZPM",
    subtitle: `${GAME.voltageTiers[GAME.highTiers.zpm].voltage} EU/t`,
    color: GAME.tierColors.zpm,
    // Контроллер реактора синтеза II — цель всего яруса.
    icon: "fusion-controller",
    summary:
      "Седьмой ярус, начало поздней игры. Цель — реактор синтеза второй модели: он даёт америций для следующего яруса. Энергию дают наквадовое топливо и плазма.",
    scene: { kind: "machine", slug: "fusion-reactor-2" },
  },
  {
    id: "uv",
    title: "UV",
    subtitle: `${GAME.voltageTiers[GAME.highTiers.uv].voltage} EU/t`,
    color: GAME.tierColors.uv,
    // Контроллер реактора синтеза III — цель яруса.
    icon: "fusion3-controller",
    summary:
      "Восьмой ярус. Появляются органические схемы — их растят в биочанах, — исследования вместо сканера и третий реактор синтеза: америций с ним идёт в тринадцать раз быстрее.",
    scene: { kind: "machine", slug: "fusion-reactor-3" },
  },
  {
    id: "uhv",
    title: "UHV",
    subtitle: `${GAME.voltageTiers[GAME.highTiers.uhv].voltage} EU/t`,
    color: GAME.tierColors.uhv,
    // Контроллер электрического имплозионного компрессора — первой большой постройки яруса.
    icon: "eic-controller",
    summary:
      "Девятый ярус. Бесконечность, биосхемы и материнский корабль, на котором летят к системе Амон-Ра — без неё не открыть следующий ярус. Ток дают только плазма и наквадовое топливо.",
    scene: { kind: "machine", slug: "electric-implosion-compressor" },
  },
  {
    id: "uev",
    title: "UEV",
    subtitle: `${GAME.voltageTiers[GAME.highTiers.uev].voltage} EU/t`,
    color: GAME.tierColors.uev,
    // Контроллер реактора синтеза IV — он становится обязательным на этом ярусе.
    icon: "fusion4-controller",
    summary:
      "Десятый ярус. Последняя линия схем — оптические, полёт к Сету за тенгамом и главная цель — пространственно-трансцендентная плазменная кузница: с ней идёт вся остальная игра.",
    scene: { kind: "machine", slug: "fusion-reactor-4" },
  },
  {
    id: "uiv",
    title: "UIV",
    subtitle: `${GAME.voltageTiers[GAME.highTiers.uiv].voltage} EU/t`,
    color: GAME.tierColors.uiv,
    // Контроллер трансцендентного плазменного смесителя — постройки, которая кормит кузницу.
    icon: "tpm-controller",
    summary:
      "Одиннадцатый ярус, переход к концу игры. Всё вертится вокруг плазменной кузницы: новые катушки из гипогена и пространства-времени, смеситель катализаторов и Кузница богов.",
    scene: { kind: "machine", slug: "transcendent-plasma-mixer" },
  },
  {
    id: "umv",
    title: "UMV",
    subtitle: `${GAME.voltageTiers[GAME.highTiers.umv].voltage} EU/t`,
    color: GAME.tierColors.umv,
    // Контроллер эндотермического холодильника — постройки, которую ярус улучшает.
    icon: "fridge-controller",
    summary:
      "Двенадцатый ярус, предпоследний. Новых построек почти нет — это ярус улучшений: второй уровень холодильника, второе кольцо Кузницы богов, модули лифта T2 и T3. Цель — Глаз гармонии.",
    scene: { kind: "machine", slug: "endothermic-fridge" },
  },
  {
    id: "uxv",
    title: "UXV",
    subtitle: `${GAME.voltageTiers[GAME.highTiers.uxv].voltage} EU/t`,
    color: GAME.tierColors.uxv,
    // Контроллер Глаза гармонии — постройки, по которой книга заданий и называет эту эру.
    icon: "eoh-controller",
    summary:
      "Тринадцатый и последний ярус GTNH 2.9. В книге заданий это «эра Глаза гармонии»: он делает универсиум, а из него — детали UXV и Звёздные врата.",
    scene: { kind: "machine", slug: "eye-of-harmony" },
  },
  {
    id: "max",
    title: "MAX",
    subtitle: `${GAME.voltageTiers[GAME.highTiers.max].voltage} EU/t`,
    color: GAME.tierColors.max,
    // Шеврон Звёздных врат — последней цели книги заданий.
    icon: "sg-chevron",
    summary:
      "Последнее напряжение мода, в книге заданий — «МАХ». Планковские МАХ-схемы, детали МАХ («Ты это сделал!» — последний этап игры) и главная цель всей сборки — Звёздные врата.",
    scene: { kind: "machine", slug: "stargate" },
  },
];

export function findTier(id: string): Tier | undefined {
  return TIERS.find((tier) => tier.id === id);
}
