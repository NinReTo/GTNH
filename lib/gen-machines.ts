import type { Guide } from "./guides";
import type { Machine } from "./machines";
import { unpackLayers } from "./packed-layers";

/**
 * Постройки GTNH 2.9, выведенные генератором: схемы — из исходников GT5-Unofficial 5.09.54.265
 * (LGPL-3.0), ярусы — из карточек вики GTNH, тексты — по вики и книге заданий.
 * Файл собирается заново — правки вносить в генератор.
 */
export const GEN_MACHINES: readonly Machine[] = [
  {
    slug: "big-barrel-brewery",
    name: "Big Barrel Brewery",
    title: "Промышленная варочная машина",
    tier: "hv",
    summary: "Варочная машина на 4 рецепта за ярус: главным образом — биомасса и бактерии для биочана.",
    story: ["В игре по-русски — «Промышленная варочная машина», в вики — Big Barrel Brewery. Она ведёт рецепты одноблочной варочной машины в полтора раза быстрее и по 4 сразу за каждый ярус напряжения.","Чаще всего в ней варят биомассу и бактериальные культуры для бактериального чана."],
    facts: [{"label":"Размер","value":"3 × 5 × 3"},{"label":"Блоков","value":"38"},{"label":"Ярус в вики","value":"HV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIndustrialBrewery.java",
    def: { layers: unpackLayers("3B|3B|3B/3B|A A|BAB/B~B|A A|BAB/3B|3B|3B/C C|3 |C C"), kinds: {"B":"gReinforcedWoodTop","A":"glass","C":"gFrameSteel","~":"gBigBarrelBreweryController"} },
  },
  {
    slug: "dissection-apparatus",
    name: "Dissection Apparatus",
    title: "Промышленный экстрактор",
    tier: "hv",
    summary: "Экстрактор втрое быстрее одноблочного, по 8 рецептов за уровень трубных корпусов.",
    story: ["В игре по-русски — «Промышленный экстрактор», в вики — Dissection Apparatus. Он вынимает твёрдые вещества из предметов: работает втрое быстрее одноблочного экстрактора и тратит 85 % энергии.","Число рецептов сразу зависит не от напряжения, а от предметных трубных корпусов внутри: 8 за каждый их уровень."],
    facts: [{"label":"Размер","value":"5 × 5 × 5"},{"label":"Блоков","value":"89"},{"label":"Ярус в вики","value":"HV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIndustrialExtractor.java",
    def: { layers: unpackLayers("5C|5C|5C|5C|5C/C3 C| 3B | 3B | 3B |C3 C/C3 C| 3A | ABA | 3A |C3 C/C3 C| 3B | 3B | 3B |C3 C/2C~2C|5C|5C|5C|5C"), kinds: {"C":"gCleanStainlesssteel","B":"gItemPipeTin","A":"glass","~":"gDissectionApparatusController"} },
  },
  {
    slug: "microwave-grinder",
    name: "Microwave Grinder",
    title: "Совершенная микроволновая печь",
    tier: "hv",
    summary: "Ферма мобов: бьёт всех внутри и сверху сквозь броню и сразу отправляет добычу в выходную шину.",
    story: ["В игре по-русски — «Совершенная микроволновая печь», в вики — Microwave Grinder. Пока она работает, она каждую секунду бьёт мобов (и игроков!) внутри и на крыше постройки, не глядя на броню, и сразу жарит то, что можно пожарить.","Мощность в окне контроллера задаёт и расход энергии, и урон. Таймер обязателен: не больше 3 000 секунд за раз."],
    facts: [{"label":"Размер","value":"5 × 4 × 5"},{"label":"Блоков","value":"73"},{"label":"Ярус в вики","value":"HV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/tectech/thing/metaTileEntity/multi/MTEMicrowave.java",
    def: { layers: unpackLayers("5A|A3 A|A3 A|A3 A|5A/5A|A3 A|A3 A|A3 A|5A/2A~2A|A3 A|A3 A|A3 A|5A/A3BA|B3AB|B3AB|B3AB|A3BA"), kinds: {"A":"gCleanStainlesssteel","B":"gCleanStainlesssteel","~":"gMicrowaveGrinderController"} },
  },
  {
    slug: "large-sifter",
    name: "Large Sifter",
    title: "Большой просеиватель",
    tier: "hv",
    summary: "Просеиватель в пять раз быстрее одноблочного: камни и минералы — в самоцветы.",
    story: ["В игре по-русски — «Большой просеиватель». Он ведёт рецепты одноблочного просеивателя в пять раз быстрее, тратит 75 % энергии и делает по 4 рецепта сразу за каждый ярус.","Вики советует держать его в работе постоянно: просеивать пыль и жидкости, которым больше некуда деваться."],
    facts: [{"label":"Размер","value":"5 × 6 × 5"},{"label":"Блоков","value":"100"},{"label":"Ярус в вики","value":"HV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIndustrialSifter.java",
    def: { layers: unpackLayers("5B|B3 B|B3 B|B3 B|5B/A3BA|B3CB|B3CB|B3CB|A3BA/A3 A| 3C | 3C | 3C |A3 A/A3 A|5 |2 C2 |5 |A3 A/AB~BA|B3 B|B3 B|B3 B|A3BA/5B|5B|5B|5B|5B"), kinds: {"A":"gFrameSteel","B":"gIndustrialSieve","C":"gLargeSieveGrate","~":"gLargeSifterController"} },
  },
  {
    slug: "latex",
    name: "LATEX",
    title: "Л.А.Т.Э.К.С.",
    tier: "hv",
    summary: "Покрывает кабели резиной вдвое быстрее сборщика и экономит резину.",
    story: ["В игре по-русски — «Л.А.Т.Э.К.С.», в вики — LATEX. Это постройка для одной работы: покрывать провода изоляцией. Она вдвое быстрее сборщика, тратит 85 % энергии и делает по 8 рецептов за ярус.","Предметные трубные корпуса дают скидку на резину, а эластичная сингулярность в контроллере удваивает параллели и открывает многоамперные и лазерные люки."],
    facts: [{"label":"Размер","value":"5 × 8 × 5"},{"label":"Блоков","value":"96"},{"label":"Ярус в вики","value":"HV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTELatex.java",
    def: { layers: unpackLayers(" 3C |5C|5C|5C| 3C /5 | 3D | DBD | 3D |5 /5 | 3A | ABA | 3A |5 /5 | 3A | ABA | 3A |5 /5 | 3A | ABA | 3A |5 /5 | 3A | ABA | 3A |5 /5 | 3D | DBD | 3D |5 / C~C |5C|5C|5C| 3C "), kinds: {"A":"glass","B":"gItemPipeTin","C":"gChemicallyInert","D":"gFramePolyvinylchloride","~":"gLatexController"} },
  },
  {
    slug: "tesla-tower",
    name: "Tesla Tower",
    title: "Башня теслы",
    tier: "hv",
    summary: "Передаёт энергию без проводов машинам с крышкой катушки теслы — на любое расстояние в одном мире.",
    story: ["В игре по-русски — «Башня теслы». Она передаёт энергию без проводов: машинам, энергетическим люкам и буферам с крышкой катушки теслы. Дальность не ограничена, но между мирами ток не идёт.","Напряжение задают первичные обмотки и конденсаторы в люках, силу тока — число конденсаторов. Даже без проводов теряется 1 EU на блок за каждый ампер."],
    facts: [{"label":"Размер","value":"7 × 17 × 7"},{"label":"Блоков","value":"193"},{"label":"Ярус в вики","value":"HV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/tectech/thing/metaTileEntity/multi/MTETeslaTower.java",
    def: { layers: unpackLayers("7 |7 |2 3B2 |2 3B2 |2 3B2 |7 |7 /7 |2 3B2 | 5B | 5B | 5B |2 3B2 |7 /7 |2 3B2 | 5B | 5B | 5B |2 3B2 |7 /7 |2 3B2 | 5B | 5B | 5B |2 3B2 |7 /7 |7 |2 3B2 |2 BCB2 |2 3B2 |7 |7 /7 |7 |7 |3 C3 |7 |7 |7 /7 |2 3B2 | B F B | BFCFB | B F B |2 3B2 |7 /7 |7 |7 |3 C3 |7 |7 |7 /7 |2 3B2 | B F B | BFCFB | B F B |2 3B2 |7 /7 |7 |7 |3 C3 |7 |7 |7 /7 |2 3B2 | B F B | BFCFB | B F B |2 3B2 |7 /7 |7 |7 |3 C3 |7 |7 |7 /7 |2 3B2 | B F B | BFCFB | B F B |2 3B2 |7 /7 |7 |7 |3 C3 |7 |7 |7 /7 |7 |7 |3 C3 |7 |7 |7 /7 |7 |7 |3 C3 |7 |7 |7 / 2E~2E |E5AE|EA3 AE|EA A AE|EA3 AE|E5AE| 5E "), kinds: {"A":"gTmTeslaBaseSides","B":"gTmTeslaToroid","C":"gTmTeslaWindingSecon","E":"gTmTeslaBaseSides","F":"gFrameTitanium","~":"gTeslaTowerController"} },
  },
  {
    slug: "solar-factory",
    name: "Solar Factory",
    title: "Солнечная фабрика",
    tier: "hv",
    summary: "Собирает солнечные панели и облучённые пластины — больше их не делает ничто.",
    story: ["В игре по-русски — «Солнечная фабрика». Только она собирает солнечные панели и облучённые укреплённые пластины. У неё три уровня с одним контроллером, но разными постройками.","Здесь показан первый уровень: только обычные энергетические люки, панели от LV. Второй и третий уровни дают многоамперные и лазерные люки, больше выхода и параллелей."],
    facts: [{"label":"Размер","value":"5 × 5 × 5"},{"label":"Блоков","value":"86"},{"label":"Ярус в вики","value":"HV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTESolarFactory.java",
    def: { layers: unpackLayers("E3AE|5A|5A|5A|E3AE/E3 E| 3G | G G | 3G |E3 E/E3 E| 3G | G G | 3G |E3 E/E3 E| 3G | G G | 3G |E3 E/EA~AE|5A|5A|5A|E3AE"), kinds: {"A":"gCleanStainlesssteel","E":"gFrameDamascussteel","G":"glass","~":"gSolarFactoryController"} },
  },
  {
    slug: "turbocan-pro",
    name: "TurboCan Pro",
    title: "Промышленный наполнитель",
    tier: "hv",
    summary: "Наполнитель и жидкостный наполнитель в одной постройке: вдвое быстрее, по 8 рецептов за ярус.",
    story: ["В игре по-русски — «Промышленный наполнитель», в вики — TurboCan Pro. Он ведёт рецепты наполнителя и жидкостного наполнителя вдвое быстрее одноблочных и по 8 сразу за каждый ярус.","Улучшаемых деталей в постройке нет: собрали один раз — и всё."],
    facts: [{"label":"Размер","value":"7 × 5 × 7"},{"label":"Блоков","value":"122"},{"label":"Ярус в вики","value":"HV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEMultiCanner.java",
    def: { layers: unpackLayers("2 3A2 | 5A |7A|7A|7A| 5A |2 3A2 /7 |2 B B2 | B3AB |2 A A2 | B3AB |2 B B2 |7 /7 |2 B B2 | BA~AB |2 A A2 | B3AB |2 B B2 |7 /7 |2 B B2 | B3AB |2 A A2 | B3AB |2 B B2 |7 /2 3A2 | 5A |7A|7A|7A| 5A |2 3A2 "), kinds: {"A":"gSolidSteel","B":"gPipeSteel","~":"gTurbocanProController"} },
  },
  {
    slug: "tfft",
    name: "T.F.F.T",
    title: "Многожидкостное хранилище T.F.F.T",
    tier: "hv",
    summary: "Огромный бак на 25 разных жидкостей, который подключается к сети AE2 как ячейка хранения.",
    story: ["TFFT хранит огромные объёмы жидкостей — до 25 разных видов — и подключается к сети AE2 как большая ячейка для жидкостей. Объём задают число и уровень блоков поля хранения внутри.","Бак тянется назад от контроллера: спереди — торец с контроллером, дальше — от одного до тринадцати слоёв стекла с полями хранения, сзади — второй торец. Здесь показаны три слоя."],
    facts: [{"label":"Размер","value":"5 × 5 × 5"},{"label":"Блоков","value":"125"},{"label":"Видов жидкости","value":"до 25"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/kekztech/common/tileentities/MTETankTFFT.java",
    def: { layers: unpackLayers("5c|g3Gg|g3Gg|g3Gg|5c/c3Cc|G3fG|G3fG|G3fG|c3Cc/cC~Cc|G3fG|G3fG|G3fG|c3Cc/c3Cc|G3fG|G3fG|G3fG|c3Cc/5c|g3Gg|g3Gg|g3Gg|5c"), kinds: {"c":"gTfftcasing","C":"gTfftcasing","G":"glass","g":"glass","f":"gTfftstorageFieldBloc","~":"gTfftController"} },
  },
  {
    slug: "coolant-tower",
    name: "Coolant Tower",
    title: "Охладительная башня",
    tier: "ev",
    summary: "Превращает пар обратно в дистиллированную воду — без энергии и сколько угодно пара сразу.",
    story: ["Охладительная башня конденсирует пар обратно в дистиллированную воду. Энергии она не тратит и каждую секунду перерабатывает весь пар во входных люках — предела нет.","Работает только с обычным паром GregTech: перегретый, сверхкритический и плотный пар ей не подходят. По сути это большая паровая турбина без ротора и без выработки энергии."],
    facts: [{"label":"Размер","value":"11 × 13 × 11"},{"label":"Блоков","value":"308"},{"label":"Ярус в вики","value":"EV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/goodgenerator/blocks/tileEntity/MTECoolantTower.java",
    def: { layers: unpackLayers("11 |11 |4 3B4 |3 B3 B3 |2 B5 B2 |2 B5 B2 |2 B5 B2 |3 B3 B3 |4 3B4 |11 |11 /11 |11 |4 3B4 |3 5B3 |2 2B3 2B2 |2 2B3 2B2 |2 2B3 2B2 |3 5B3 |4 3B4 |11 |11 /11 |11 |11 |4 3B4 |3 B3 B3 |3 B3 B3 |3 B3 B3 |4 3B4 |11 |11 |11 /11 |11 |11 |4 3B4 |3 B3 B3 |3 B3 B3 |3 B3 B3 |4 3B4 |11 |11 |11 /11 |11 |11 |4 3B4 |3 B3 B3 |3 B3 B3 |3 B3 B3 |4 3B4 |11 |11 |11 /11 |11 |4 3B4 |3 5B3 |2 2B3 2B2 |2 2B3 2B2 |2 2B3 2B2 |3 5B3 |4 3B4 |11 |11 /11 |11 |4 3B4 |3 B3 B3 |2 B5 B2 |2 B5 B2 |2 B5 B2 |3 B3 B3 |4 3B4 |11 |11 /11 |11 |4 3B4 |3 B3 B3 |2 B5 B2 |2 B5 B2 |2 B5 B2 |3 B3 B3 |4 3B4 |11 |11 /11 |4 3B4 |3 5B3 |2 2B3 2B2 | 2B5 2B | 2B5 2B | 2B5 2B |2 2B3 2B2 |3 5B3 |4 3B4 |11 /11 |4 3B4 |3 B3 B3 |2 B5 B2 | B7 B | B7 B | B7 B |2 B5 B2 |3 B3 B3 |4 3B4 |11 /11 |3 5B3 |2 2B3 2B2 | 2B5 2B | B7 B | B7 B | B7 B | 2B5 2B |2 2B3 2B2 |3 5B3 |11 /3 2H~2H3 |2 H5BH2 | HB5 BH |HB7 BH|HB7 BH|HB7 BH|HB7 BH|HB7 BH| HB5 BH |2 H5BH2 |3 5H3 /3 5C3 |2 C5 C2 | C7 C |C9 C|C9 C|C9 C|C9 C|C9 C| C7 C |2 C5 C2 |3 5C3 "), kinds: {"B":"gConcreteLightStone","C":"gFrameTungstencarbide","H":"gConcreteLightStone","~":"gCoolantTowerController"} },
  },
  {
    slug: "extreme-entity-crusher",
    name: "Extreme Entity Crusher",
    title: "Экстремальный дробитель мобов",
    tier: "ev",
    summary: "Ферма мобов без самих мобов: добыча идёт по таблице выпадения, а в мире никто не появляется.",
    story: ["Экстремальный дробитель мобов собирает добычу с мобов, не создавая их в мире, — поэтому не нагружает сервер. Это прямое улучшение совершенной микроволновой печи.","Какой моб, задаёт заряженный спаунер в контроллере, а выход зависит от таблицы выпадения, напряжения и уровня «Добычи» на мече в контроллере."],
    facts: [{"label":"Размер","value":"5 × 7 × 5"},{"label":"Блоков","value":"130"},{"label":"Ярус в вики","value":"EV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/kubatech/tileentity/gregtech/multiblock/MTEExtremeEntityCrusher.java",
    def: { layers: unpackLayers("5c|5c|5c|5c|5c/f3gf|g3 g|g3 g|g3 g|f3gf/f3gf|g3 g|g3 g|g3 g|f3gf/f3gf|g3 g|g3 g|g3 g|f3gf/f3gf|g3 g|g3 g|g3 g|f3gf/f3gf|g3 g|g3 g|g3 g|f3gf/2C~2C|5C|5C|5C|5C"), kinds: {"c":"gSolidSteel","C":"gSolidSteel","g":"glass","f":"gFrameSteel","~":"gExtremeEntityCrusherController"} },
  },
  {
    slug: "dissolution-tank",
    name: "Dissolution Tank",
    title: "Бак растворения",
    tier: "ev",
    summary: "Разбавляет растворы редких земель водой или кислотой в строгом соотношении.",
    story: ["Бак растворения разбавляет растворы редких земель водой или кислотой. Он нужен только в линиях монацита, бастнезита и призмарина и обычно стоит после дигестора.","Соотношение жидкостей должно быть ровно как в NEI — иначе машина выключится, а рецепт пропадёт."],
    facts: [{"label":"Размер","value":"5 × 5 × 5"},{"label":"Блоков","value":"82"},{"label":"Ярус в вики","value":"EV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtnhlanth/common/tileentity/MTEDissolutionTank.java",
    def: { layers: unpackLayers(" 3s |5s|5s|5s| 3s /s3gs|g3 g|g3 g|g3 g|s3gs/s3gs|g3 g|g3 g|g3 g|s3gs/2s~2s|s3hs|s3hs|s3hs|5s/s3 s|5 |5 |5 |s3 s"), kinds: {"s":"gCleanStainlesssteel","h":"gHeatproofcasing","g":"glass","~":"gDissolutionTankController"} },
  },
  {
    slug: "large-heat-exchanger",
    name: "Large Heat Exchanger",
    title: "Большой теплообменник",
    tier: "ev",
    summary: "Кипятит дистиллированную воду жаром лавы, горячего хладагента или солнечной соли.",
    story: ["В игре по-русски — «Большой теплообменник». Он испаряет дистиллированную воду в пар за счёт тепла лавы, горячего хладагента или горячей солнечной соли. Если горячей жидкости подавать больше порога, выходит перегретый пар.","Энергии и топлива он не тратит, вся горячая жидкость остывает и возвращается. Но без воды он взрывается."],
    facts: [{"label":"Размер","value":"3 × 4 × 3"},{"label":"Блоков","value":"36"},{"label":"Ярус в вики","value":"EV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEHeatExchanger.java",
    def: { layers: unpackLayers("3c|cCc|3c/3c|cPc|3c/3c|cPc|3c/c~c|cHc|3c"), kinds: {"P":"gPipeTitanium","C":"gStableTitanium","H":"gStableTitanium","c":"gStableTitanium","~":"gLargeHeatExchangerController"} },
  },
  {
    slug: "industrial-3d-copying-machine",
    name: "Industrial 3D Copying Machine",
    title: "Промышленный 3D копировальный механизм",
    tier: "ev",
    summary: "Автодолото на постройку: втрое быстрее, по 16 блоков за ярус.",
    story: ["В игре по-русски — «Промышленный 3D копировальный механизм». Он превращает блоки в любые их декоративные варианты, как автодолото, только втрое быстрее, за 75 % энергии и по 16 рецептов за ярус.","Нужный вариант задают призрачным предметом в шине долота, шаблоном или программной схемой."],
    facts: [{"label":"Размер","value":"7 × 5 × 5"},{"label":"Блоков","value":"129"},{"label":"Ярус в вики","value":"EV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIndustrialChisel.java",
    def: { layers: unpackLayers(" 2H4F| 2H3DF| 2H3CF| 2H3DF| 2H4F/ 2H3AF|H H3 D|H H B C|H H3 D| 2H3AF/ ~H3AF|H H3 D|H H3 C|H H3 D| 2H3AF/ 2H3AF|H H3 D|H H3 C|H H3 D| 2H3AF/7F|F5HF|F3HEHF|F5HF|7F"), kinds: {"A":"glass","B":"gBlockIronFence","C":"gGearboxSteel","D":"gPipeSteel","E":"gCoilCupronickelBackg","F":"gFrameSteel","H":"gSturdyPrinter","~":"gIndustrial3dCopyingMachineController"} },
  },
  {
    slug: "industrial-coke-oven",
    name: "Industrial Coke Oven",
    title: "Промышленная коксовая печь",
    tier: "ev",
    summary: "Жжёт брёвна в уголь и одну жидкость: 32 рецепта сразу и больше с каждой секцией.",
    story: ["В игре по-русски — «Промышленная коксовая печь». Она пережигает брёвна в древесный уголь и одну жидкость — угольный или древесный газ, уксус, смолу. Из них потом делают этилен, бензол и толуол.","Это улучшение пиролизной печи: 32 рецепта сразу и ещё 16 за каждую добавленную секцию. Здесь показана самая короткая печь."],
    facts: [{"label":"Размер","value":"6 × 7 × 5"},{"label":"Блоков","value":"87"},{"label":"Ярус в вики","value":"EV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIndustrialCokeOven.java",
    def: { layers: unpackLayers("6 |6 | 3A2 |6 |6 /3 C2 |3 E2 | A A2 |3 E2 |3 C2 /3 C2 |2 DBD | AD D |2 DBD |3 C2 /3 C2 | 2DBD | AE E | 2DBD |3 C2 /3 C2 |3DBD |D E E |3DBD |3 C2 /3 C2 |D~DBD |D E E |3DBD |3 C2 /3 3D|6D|6D|6D|3 3D"), kinds: {"D":"gStableTantalloy61","A":"gPipeSteel","B":"gCoilNichrome","C":"gFrameSteel","E":"gFireboxBronze","~":"gIndustrialCokeOvenController"} },
  },
  {
    slug: "large-electric-compressor",
    name: "Large Electric Compressor",
    title: "Большой электрический компрессор",
    tier: "ev",
    summary: "Компрессор вдвое быстрее одноблочного; в ZPM его сменяет изостатический пресс.",
    story: ["В игре по-русски — «Большой электрический компрессор». Он сжимает материалы вдвое быстрее одноблочного, тратит 90 % энергии и делает по 2 рецепта за ярус.","В ZPM его заменяет установка горячего изостатического прессования."],
    facts: [{"label":"Размер","value":"7 × 8 × 7"},{"label":"Блоков","value":"175"},{"label":"Ярус в вики","value":"EV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/compressor/MTEIndustrialCompressor.java",
    def: { layers: unpackLayers("7 |2 3D2 | 5D | 5D | 5D |2 3D2 |7 /2 3B2 | 5B |7B|7B|7B| 5B |2 3B2 /2 3D2 | B3 B |B5 B|B5 B|B5 B| B3 B |2 3D2 /2 DAD2 | B3 B |C5 C|C5 C|C5 C| B3 B |2 DAD2 /2 DAD2 | B3 B |C5 C|C5 C|C5 C| B3 B |2 DAD2 /2 DAD2 | B3 B |C5 C|C5 C|C5 C| B3 B |2 DAD2 /2 3D2 | B3 B |B5 B|B5 B|B5 B| B3 B |2 3D2 /2 B~B2 | 5B |7B|7B|7B| 5B |2 3B2 "), kinds: {"C":"gCompressorPipe","B":"gCompressor","A":"glass","D":"gCompressorPipe","~":"gLargeElectricCompressorController"} },
  },
  {
    slug: "large-fluid-extractor",
    name: "Large Fluid Extractor",
    title: "Большой жидкостный экстрактор",
    tier: "ev",
    summary: "Плавит металлы в жидкость: по 8 рецептов за уровень соленоидов, катушки ускоряют.",
    story: ["В игре по-русски — «Большой жидкостный экстрактор». Он плавит твёрдые металлы в жидкость в полтора раза быстрее одноблочного и за 80 % энергии.","Параллели дают соленоидные катушки — 8 за уровень, а нагревательные катушки добавляют по 10 % скорости и экономии за уровень."],
    facts: [{"label":"Размер","value":"5 × 9 × 5"},{"label":"Блоков","value":"149"},{"label":"Ярус в вики","value":"EV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTELargeFluidExtractor.java",
    def: { layers: unpackLayers("5 | 3c | 3c | 3c |5 /5 | f f |2 s2 | f f |5 /5 | f f |2 s2 | f f |5 /5 | f f |2 s2 | f f |5 /5c|5c|2cs2c|5c|5c/f3gf|g3hg|ghshg|g3hg|f3gf/f3gf|g3hg|ghshg|g3hg|f3gf/f3gf|g3hg|ghshg|g3hg|f3gf/2c~2c|5c|5c|5c|5c"), kinds: {"c":"gRobustTungstensteel","g":"glass","h":"gCoilNichrome","s":"gSolenoidEv","f":"gFrameBlacksteel","~":"gLargeFluidExtractorController"} },
  },
  {
    slug: "industrial-precision-lathe",
    name: "Industrial Precision Lathe",
    title: "Промышленный прецизионный токарный станок",
    tier: "ev",
    summary: "Токарный станок вчетверо быстрее одноблочного, по 8 рецептов за уровень трубных корпусов.",
    story: ["В игре по-русски — «Промышленный прецизионный токарный станок». Он точит стержни и болты вчетверо быстрее одноблочного станка и за 80 % энергии.","Параллели дают предметные трубные корпуса: по 8 за уровень. Спереди — контроллер, за ним — корпус станка."],
    facts: [{"label":"Размер","value":"7 × 5 × 5"},{"label":"Блоков","value":"105"},{"label":"Ярус в вики","value":"EV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEMultiLathe.java",
    def: { layers: unpackLayers("7 |7 |7A|7 |7 /7 |AB4CA|AB4CA|AB4CA|7 /7 |AB4CA|AB4FA|AB4CA|7 /7 |AB4CA|AB4CA|AB4CA|7 /3A~3A|7A|7A|7A|7A"), kinds: {"A":"gSolidSteel","B":"gGrate","C":"glass","F":"gItemPipeTin","~":"gIndustrialPrecisionLatheController"} },
  },
  {
    slug: "industrial-bending-machine",
    name: "Industrial Bending Machine",
    title: "Промышленный гибочный станок",
    tier: "ev",
    summary: "Гнёт слитки в пластины в шесть раз быстрее одноблочного.",
    story: ["В игре по-русски — «Промышленный гибочный станок». Он гнёт слитки в пластины в шесть раз быстрее одноблочного и делает по 6 рецептов за ярус.","Если в одной машине нужны разные программные схемы, включите разделение входов."],
    facts: [{"label":"Размер","value":"6 × 3 × 3"},{"label":"Блоков","value":"39"},{"label":"Ярус в вики","value":"EV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIndustrialBendingMachine.java",
    def: { layers: unpackLayers("2C3 C|DB3AD|2C3 C/D~3 D|2D3 D|2D3 D/DB3AD|6D|DB3AD"), kinds: {"A":"gFormingCore","B":"gGearboxTitanium","C":"gFrameTitanium","D":"gStableTitanium","~":"gIndustrialBendingMachineController"} },
  },
  {
    slug: "industrial-forming-press",
    name: "Industrial Forming Press",
    title: "Промышленный формовочный пресс",
    tier: "ev",
    summary: "Формовочный пресс в шесть раз быстрее одноблочного.",
    story: ["В игре по-русски — «Промышленный формовочный пресс». Он прессует металлы в формы в шесть раз быстрее одноблочного пресса и делает по 6 рецептов за ярус.","Чтобы держать в одной машине разные формы и схемы, включите разделение входов."],
    facts: [{"label":"Размер","value":"5 × 5 × 3"},{"label":"Блоков","value":"44"},{"label":"Ярус в вики","value":"EV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIndustrialFormingPress.java",
    def: { layers: unpackLayers("5 |2FC2F|5 /F3EF|2 A2 |F3EF/F3 F|5B|F3 F/F3 F|5 |F3 F/2F~2F|5A|5F"), kinds: {"A":"gPipeSteel","B":"gFormingCore","F":"gStableTitanium","E":"gFrameTitanium","C":"gGearboxTitanium","~":"gIndustrialFormingPressController"} },
  },
  {
    slug: "large-neutralization-engine",
    name: "Large Neutralization Engine",
    title: "Большой нейтрализационный генератор",
    tier: "ev",
    summary: "Вырабатывает энергию из кислот; с основаниями — до 500 % выхода.",
    story: ["В игре по-русски — «Большой нейтрализационный генератор». Он делает энергию из кислот, гораздо выгоднее одноблочных кислотных генераторов, и верхнего предела у него нет.","Основания разгоняют его с 100 % до 500 % выработки и КПД. Сложность — в том, что при этом копятся токсичные остатки."],
    facts: [{"label":"Размер","value":"11 × 7 × 3"},{"label":"Блоков","value":"96"},{"label":"Ярус в вики","value":"EV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTELargeNeutralizationEngine.java",
    def: { layers: unpackLayers("11 |3 5P3 |11 /3 2C~2C3 |2 P5 P2 |3 5C3 /2 2C3F2C2 | P2 3C2 P |2 2C3F2C2 / 2CF3 F2C |P2 C3 C2 P| 2CF3 F2C / CF5 FC |P CF3 FC P| CF5 FC / CF5 FC |P CF3 FC P| CF5 FC / F F3 F F | CFCF FCFC | F F3 F F "), kinds: {"C":"gPreciseStationary","F":"gFramePolytetrafluoroethylene","P":"gPipePolytetrafluoroet","~":"gLargeNeutralizationEngineController"} },
  },
  {
    slug: "large-thermal-refinery",
    name: "Large Thermal Refinery",
    title: "Промышленная термальная центрифуга",
    tier: "ev",
    summary: "Термоцентрифуга до 320 % скорости: дроблёные руды и отработанные топливные стержни.",
    story: ["В игре по-русски — «Промышленная термальная центрифуга», в вики — Large Thermal Refinery. Она очищает дроблёные руды и перерабатывает отработанные топливные стержни — до 320 % скорости и за 39 % энергии.","Параллели: 8 за ярус и 2 за уровень соленоидов. Нагревательные катушки добавляют по 5 % скорости и экономии за уровень."],
    facts: [{"label":"Размер","value":"5 × 8 × 6"},{"label":"Блоков","value":"150"},{"label":"Ярус в вики","value":"EV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIndustrialThermalCentrifuge.java",
    def: { layers: unpackLayers(" 3F |5F|5F|5F|5F| 3F / 3F |FBDBF|FDCDF|F D F|EFAFE|5 /5 |2 D2 |FDCDF|F D F|EFAFE|5 /5 |2 E2 | ECE |F E F|EFAFE|5 /5 |2 E2 |FECEF|F E F|EFAFE|5 /5 |F D F|FDCDF|F D F|EFAFE|5 / 3F |FBDBF|FDCDF|F D F|EFAFE|5 / F~F |5F|5F|5F|5F| 3F "), kinds: {"F":"gStableRedSteel","A":"glass","B":"gHeatproofcasing","C":"gSolenoidEv","D":"gCoilNichrome","E":"gFrameRedsteel","~":"gLargeThermalRefineryController"} },
  },
  {
    slug: "ore-washing-plant",
    name: "Ore Washing Plant",
    title: "Рудопромывочная машина",
    tier: "ev",
    summary: "Промывка и простая промывка руд в одной постройке, в пять раз быстрее.",
    story: ["В игре по-русски — «Рудопромывочная машина». Она ведёт и обычную промывку руд, и простую: простая намного быстрее, но не даёт побочных продуктов.","Машина работает в пять раз быстрее одноблочной промывалки и делает по 4 рецепта за ярус."],
    facts: [{"label":"Размер","value":"5 × 4 × 9"},{"label":"Блоков","value":"114"},{"label":"Ярус в вики","value":"EV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEOreWashingPlant.java",
    def: { layers: unpackLayers("5 |3 B |2 B2 | B3 |C3 C|C2 BC|C B C|CB2 C| 3C / 3C |C A C|C A C|C A C|CBABC|C A C|C A C|C A C| 3C / C~C |CB2 C|C B C|C2 BC|C B C|CB2 C|C B C|C2 BC| 3C / 3C |5C|5C|5C|5C|5C|5C|5C| 3C "), kinds: {"A":"gGearboxSteel","B":"gFrameSteel","C":"gStableGrisium","~":"gOreWashingPlantController"} },
  },
  {
    slug: "large-semifluid-burner",
    name: "Large Semifluid Burner",
    title: "Большая полужидкостная горелка",
    tier: "ev",
    summary: "Сжигает полужидкое топливо; со смазкой обязательно, с кислородом — втрое мощнее.",
    story: ["В игре по-русски — «Большая полужидкостная горелка». Она делает энергию из полужидкого топлива, гораздо выгоднее одноблочных генераторов, и может выдавать больше одного ампера.","Ей обязательно нужна смазка — 2 000 литров в час, а кислород (80 литров в секунду) втрое поднимает выработку и даёт 150 % КПД."],
    facts: [{"label":"Размер","value":"3 × 3 × 4"},{"label":"Блоков","value":"36"},{"label":"Ярус в вики","value":"EV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/production/MTELargeSemifluidGenerator.java",
    def: { layers: unpackLayers("3I|3C|3C|3C/I~I|CGC|CGC|CMC/3I|3C|3C|3C"), kinds: {"C":"gStableTitanium","G":"gGearboxSteel","I":"gEngineIntake","M":"gEngineIntake","~":"gLargeSemifluidBurnerController"} },
  },
  {
    slug: "solid-oxide-fuel-cell",
    name: "Solid-Oxide Fuel Cell",
    title: "Твёрдооксидный топливный элемент",
    tier: "ev",
    summary: "Окисляет газовое топливо в энергию и пар — без загрязнения и со 100 % КПД.",
    story: ["Твёрдооксидный топливный элемент окисляет газовое топливо и даёт сразу энергию и пар — без загрязнения. После разогрева его КПД — 100 %.","Первая модель тратит 100 литров кислорода в секунду и выдаёт 2 048 EU/t плюс 20 000 литров пара в секунду для паровой турбины."],
    facts: [{"label":"Размер","value":"3 × 3 × 5"},{"label":"Блоков","value":"45"},{"label":"Ярус в вики","value":"EV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/kekztech/common/tileentities/MTESOFuelCellMK1.java",
    def: { layers: unpackLayers("3c|3c|3c|3c|3c/c~c|geg|geg|geg|cdc/3c|3c|3c|3c|3c"), kinds: {"c":"gCleanStainlesssteel","d":"gCleanStainlesssteel","g":"gReinforcedGlass","e":"gYszceramicElectrolyte","~":"gSolidOxideFuelCellController"} },
  },
  {
    slug: "amazon-warehousing-depot",
    name: "Amazon Warehousing Depot",
    title: "Складское депо Amazon",
    tier: "iv",
    summary: "Упаковщик и распаковщик в одной постройке: до 900 % скорости, 16 рецептов за ярус.",
    story: ["В игре по-русски — «Складское депо Amazon». Оно ведёт рецепты и упаковщика, и распаковщика: до девяти раз быстрее одноблочных, за 75 % энергии и по 16 рецептов за ярус.","Если в одной машине нужны разные схемы упаковки, включите разделение входов."],
    facts: [{"label":"Размер","value":"5 × 3 × 3"},{"label":"Блоков","value":"29"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIndustrialPackager.java",
    def: { layers: unpackLayers("5 |5D|5 /D3 ~|D3AD|D3 D/2DC2D|D3BD|2DC2D"), kinds: {"A":"glass","B":"gItemPipeElectrum","C":"gFrameIron","D":"gAmazon","~":"gAmazonWarehousingDepotController"} },
  },
  {
    slug: "boldarnator",
    name: "Boldarnator",
    title: "Болдарнатор",
    tier: "iv",
    summary: "Камнедробилка-постройка: булыжник, камень, базальт — бесплатно и втрое быстрее.",
    story: ["В игре по-русски — «Болдарнатор». Он делает простые камни втрое быстрее одноблочной камнедробилки, за 75 % энергии и по 8 штук за ярус. Булыжник, камень, базальт и глубинный сланец — бесплатно.","Обсидиан тратит пыль красного камня, адский камень — светопыль. Внутри постройки — лава и вода."],
    facts: [{"label":"Размер","value":"7 × 5 × 5"},{"label":"Блоков","value":"111"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIndustrialRockBreaker.java",
    def: { layers: unpackLayers("2 ACA2 |CA3CAC|7C|CA3CAC|2 ACA2 /7 |ABACABA|C C CDC|ABACABA|7 /7 |ABA~ABA|C C CDC|ABACABA|7 /7 |ABACABA|C C CDC|ABACABA|7 /2 ACA2 |7C|7C|7C|2 ACA2 "), kinds: {"A":"gFrameTungsten","B":"glass","C":"gStableRedSteel","D":"ownLava","~":"gBoldarnatorController"} },
  },
  {
    slug: "cryogenic-freezer",
    name: "Cryogenic Freezer",
    title: "Криогенный морозильник",
    tier: "iv",
    summary: "Вакуумная морозилка втрое быстрее, 16 рецептов сразу — но на криотеуме.",
    story: ["В игре по-русски — «Криогенный морозильник». Он охлаждает горячие слитки и жидкости втрое быстрее вакуумной морозилки, за 90 % энергии и по 16 рецептов сразу.","Ему нужен гелидный криотеум — 10 литров в секунду через особый люк. Если криотеум кончится, машина сразу встанет и получит поломку."],
    facts: [{"label":"Размер","value":"5 × 4 × 7"},{"label":"Блоков","value":"87"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTECryogenicFreezer.java",
    def: { layers: unpackLayers("5 | ABA |2 B2 | ABA |2 B2 | ABA |5 / 3B |A3BA| 3B |A3BA| 3B |A3BA| 3B / B~B |AB BA| B B |AB BA| B B |AB BA| 3B / 3B |A3BA| 3B |A3BA| 3B |A3BA| 3B "), kinds: {"A":"gFrameLeagrisium","B":"gAdvancedCryogenic","~":"gCryogenicFreezerController"} },
  },
  {
    slug: "dangote-distillus",
    name: "Dangote Distillus",
    title: "Данготе Дистиллус",
    tier: "iv",
    summary: "Ректификационная колонна втрое быстрее и на 12 рецептов сразу.",
    story: ["В игре по-русски — «Данготе Дистиллус». Он разделяет жидкости на все фракции сразу, как ректификационная колонна, но втрое быстрее и по 12 рецептов.","Колонна собирается слоями: внизу вход, а каждый слой выше — свой выход в порядке NEI. Здесь показана колонна из четырёх слоёв."],
    facts: [{"label":"Размер","value":"3 × 4 × 3"},{"label":"Блоков","value":"34"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/processing/advanced/MTEAdvDistillationTower.java",
    def: { layers: unpackLayers("3t|3t|3t/3l|l l|3l/3l|l l|3l/b~b|3b|3b"), kinds: {"b":"gCleanStainlesssteel","l":"gCleanStainlesssteel","t":"gCleanStainlesssteel","~":"gDangoteDistillusController"} },
  },
  {
    slug: "advanced-assembly-line",
    name: "Advanced Assembly Line",
    title: "Продвинутая сборочная линия",
    tier: "iv",
    summary: "Сборочная линия с параллелями: детали идут по линии срез за срезом.",
    story: ["В игре по-русски — «Продвинутая сборочная линия». Она ведёт рецепты сборочной линии сразу несколько: ингредиенты расходуются по срезам, как на настоящем конвейере, поэтому параллелей столько, сколько твёрдых ингредиентов в рецепте.","Многоамперные и лазерные энергетические люки подходят, но рецепты через ярус, как обычная линия, она не пропускает. Здесь показана линия из пяти срезов."],
    facts: [{"label":"Размер","value":"5 × 4 × 3"},{"label":"Блоков","value":"50"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/ggfab/mte/MTEAdvAssLine.java",
    def: { layers: unpackLayers("5 |5e|5 /~4d|5l|G4d/5g|5m|5g/5b|i4I|5b"), kinds: {"G":"gGrate","l":"gAssembler","m":"gGearboxTungstensteel","g":"glass","e":"gSolidSteel","d":"gGrate","b":"gSolidSteel","I":"gGrate","i":"gGrate","~":"gAdvancedAssemblyLineController"} },
  },
  {
    slug: "deep-earth-heating-pump",
    name: "Deep Earth Heating Pump",
    title: "Глубинный геотермальный насос",
    tier: "iv",
    summary: "Греет воду в перегретый пар теплом недр, тратя всего 480 EU/t.",
    story: ["Глубинный геотермальный насос опускает трубу до коренной породы и берёт тепло ядра планеты: кипятит дистиллированную воду в перегретый пар или греет хладагент.","Своей энергии он тратит всего 480 EU/t — малая доля того, что даст пар в турбине."],
    facts: [{"label":"Размер","value":"3 × 7 × 3"},{"label":"Блоков","value":"27"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/bartworks/common/tileentities/multis/MTEDeepEarthHeatingPump.java",
    def: { layers: unpackLayers("3 | f |3 /3 | f |3 /3 | f |3 / f |fcf| f / f |fcf| f / f |fcf| f /b~b|3b|3b"), kinds: {"f":"gFrameTungsten","c":"gHeatproofcasing","b":"gHeatproofcasing","~":"gDeepEarthHeatingPumpController"} },
  },
  {
    slug: "decay-warehouse",
    name: "Decay Warehouse",
    title: "Промышленное радиоизотопное хранилище",
    tier: "iv",
    summary: "Ускоряет распад радиоактивных изотопов — тем быстрее, чем их больше внутри.",
    story: ["В игре по-русски — «Промышленное радиоизотопное хранилище», в вики — Decay Warehouse. Это улучшение ящика со свинцовой обшивкой: изотопов в нём помещается намного больше, и чем их больше, тем быстрее они распадаются.","Объём задаёт сундук в середине постройки. Энергия тратится, только когда предметы входят или выходят."],
    facts: [{"label":"Размер","value":"5 × 3 × 5"},{"label":"Блоков","value":"75"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEDecayWarehouse.java",
    def: { layers: unpackLayers("5B|B3CB|B3CB|B3CB|5B/2B~2B|B3CB|BCACB|B3CB|5B/5B|5B|5B|5B|5B"), kinds: {"B":"gRadiationproof","A":"gRadiationproof","C":"ownWater","~":"gDecayWarehouseController"} },
  },
  {
    slug: "density-squared",
    name: "Density^2",
    title: "Плотность^2",
    tier: "iv",
    summary: "Имплозионный компрессор вдвое быстрее и с половиной загрязнения.",
    story: ["В игре по-русски — «Плотность^2», в вики — Density^2. Он сжимает пластины и пыль взрывчаткой вдвое быстрее имплозионного компрессора и вдвое меньше загрязняет.","Параллель — одна за каждые два яруса. В UHV его сменяет электрический имплозионный компрессор."],
    facts: [{"label":"Размер","value":"7 × 9 × 7"},{"label":"Блоков","value":"178"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEAdvImplosionCompressor.java",
    def: { layers: unpackLayers("7 |7 |2 CEC2 |2 E E2 |2 CEC2 |7 |7 /7 |2 3A2 | 2A 2A | A3 A | 2A 2A |2 3A2 |7 /3 A3 | 2A 2A | A3 A |A5 A| A3 A | 2A 2A |3 A3 /2 A A2 | A3 A |A5 A|7 |A5 A| A3 A |2 A A2 /3 A3 | 2A 2A | A3 A |A5 A| A3 A | 2A 2A |3 A3 /3 D3 | D3AD | 2A 2A |DA3 AD| 2A 2A | D3AD |3 D3 /2 D D2 |7 |D2 A2 D|2 A A2 |D2 A2 D|7 |2 D D2 /2 B~B2 | 5B |7B|7B|7B| 5B |2 3B2 /2 BDB2 | D3BD |7B|D5BD|7B| D3BD |2 BDB2 "), kinds: {"A":"gRefinedGraphite","B":"gRobustTungstensteel","C":"gFrameGold","D":"gFrameTungstensteel","E":"gSheetGold","~":"gDensitySquaredController"} },
  },
  {
    slug: "digester",
    name: "Digester",
    title: "Дигестор",
    tier: "iv",
    summary: "Разлагает сырую руду на растворы редких земель — начало линий монацита и бастнезита.",
    story: ["Дигестор разлагает сырую руду на растворы редких земель и хлоридные концентраты. Его ставят в линиях монацита и бастнезита рядом с баком растворения.","Он нужен и для нано-смол лантаноидов, например гольмия и лютеция. У него идеальный разгон, так что хватает одного-двух."],
    facts: [{"label":"Размер","value":"7 × 4 × 7"},{"label":"Блоков","value":"101"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtnhlanth/common/tileentity/MTEDigester.java",
    def: { layers: unpackLayers("7 | 5t | t3 t | t3 t | t3 t | 5t |7 /2 3t2 | t3 t |t5 t|t5 t|t5 t| t3 t |2 3t2 / t3ct |tc3 ct|c5 c|c5 c|c5 c|tc3 ct| t3ct / 2t~2t |t5ht|th3sht|th3sht|th3sht|t5ht| 5t "), kinds: {"t":"gRobustTungstensteel","h":"gHeatproofcasing","s":"gCleanStainlesssteel","c":"gCoilTungstensteel","~":"gDigesterController"} },
  },
  {
    slug: "drone-centre",
    name: "Drone Centre",
    title: "Центр дронов",
    tier: "iv",
    summary: "Дроны чинят соседние постройки бесплатно и дают управлять ими издалека.",
    story: ["Центр дронов рассылает дронов к постройкам вокруг, у которых вместо люка обслуживания стоит модуль связи с дронами. Дроны бесплатно чинят поломки, а постройками можно управлять издалека.","Сам центр энергии не тратит, но каждую секунду есть малый шанс, что дрон разобьётся и пропадёт."],
    facts: [{"label":"Размер","value":"11 × 4 × 11"},{"label":"Блоков","value":"194"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/drone/MTEDroneCentre.java",
    def: { layers: unpackLayers("4 3C4 |2 2C3 2C2 | C7 C | C7 C |C9 C|C9 C|C9 C| C7 C | C7 C |2 2C3 2C2 |4 3C4 /11 |5 D5 |3 2DE2D3 |2 D5ED2 |2 D5ED2 | D7ED |2 D5ED2 |2 D5ED2 |3 2DE2D3 |5 D5 |11 /11 |4 D D4 |2 D 3D D2 |3 D3 D3 | 2D5 2D |2 D5 D2 | 2D5 2D |3 D3 D3 |2 D 3D D2 |4 D D4 |11 /4 A~A4 |2 2A3B2A2 | A7BA | A7BA |A9BA|A9BA|A9BA| A7BA | A7BA |2 2A3B2A2 |4 3A4 "), kinds: {"A":"gSolidSteel","B":"gPipeSteel","C":"gFrameIron","D":"gFrameSteel","E":"gSheetSteel","~":"gDroneCentreController"} },
  },
  {
    slug: "extreme-industrial-greenhouse",
    name: "Extreme Industrial Greenhouse",
    title: "Экстремальная промышленная теплица",
    tier: "iv",
    summary: "Тысячи растений без фермы: всё растёт внутри контроллера.",
    story: ["В игре по-русски — «Экстремальная промышленная теплица». Она выращивает и собирает тысячи растений, не сажая их в мир, — это бережёт сервер и упрощает логистику.","Вместимость задаёт ярус энергетического люка, а значит и стекла. Вода нужна всегда. Внутри — грядки и лампы."],
    facts: [{"label":"Размер","value":"7 × 7 × 9"},{"label":"Блоков","value":"250"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/kubatech/tileentity/gregtech/multiblock/MTEExtremeIndustrialGreenhouse.java",
    def: { layers: unpackLayers("2 3f2 |2 3g2 |2 3g2 |2 3g2 |2 3f2 |2 3g2 |2 3g2 |2 3g2 |2 3f2 / f3gf | g3 g | g3 g | g3 g | f3lf | g3 g | g3 g | g3 g | f3gf /f5gf|g5 g|g5 g|g5 g|f5 f|g5 g|g5 g|g5 g|f5gf/f5gf|g5 g|g5 g|g5 g|f5 f|g5 g|g5 g|g5 g|f5gf/f5gf|g5 g|g5 g|g5 g|f5 f|g5 g|g5 g|g5 g|f5gf/7a|a 3d a|a 3d a|a 3d a|a 3d a|a 3d a|a 3d a|a 3d a|7a/3a~3a|7a|7a|7a|7a|7a|7a|7a|7a"), kinds: {"a":"gSterile","f":"gFrameSteel","l":"ownLamp","g":"glass","d":"ownFarmland","~":"gExtremeIndustrialGreenhouseController"} },
  },
  {
    slug: "htgr",
    name: "High Temperature Gas-Cooled Reactor",
    title: "Высокотемпературный газоохлаждаемый реактор",
    tier: "iv",
    summary: "Распадает шарики TRISO ради ценных побочных продуктов.",
    story: ["Высокотемпературный газоохлаждаемый реактор (HTGR) делит шарики топлива TRISO ради ценных продуктов распада. Для пуска нужно хотя бы 100 шариков и 51 200 литров гелия.","Меньше максимума — 10 000 шариков и 512 000 литров гелия — значит ниже КПД и выше расход энергии. Хладагент и вода ускоряют распад."],
    facts: [{"label":"Размер","value":"29 × 15 × 18"},{"label":"Блоков","value":"1 087"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/kubatech/tileentity/gregtech/multiblock/MTEHighTempGasCooledReactor.java",
    def: { layers: unpackLayers("29 |29 |29 |29 |29 |29 |29 |29 |29 |17 C11 |16 3C10 |15 3ChC9 |16 3C10 |17 C11 |29 |29 |29 |29 /29 |29 |29 |29 |29 |29 |29 |29 |29 |16 3C10 |15 C3 C9 |15 C2 MC9 |15 C3 C9 |16 3C10 |29 |29 |29 |29 /29 |29 |29 |29 |29 |29 |29 |29 |29 |16 3C10 |5 3G7 C2 MC9 |5 GfG 7FN MC9 |5 3G7 CN2 C9 |16 3C10 |29 |29 |29 |29 /29 |29 |29 |29 |29 |29 |29 |29 |5 3G21 |4 5G7 3C10 |3 2G3E2G5 C2M C9 |3 2GE EGF5 CM NC9 |3 2G3E2G5 C 2NC9 |4 5G7 3C10 |5 3G21 |29 |29 |29 /29 |29 |29 |29 |29 |29 |29 |5 3G21 |4 G3EG20 |3 G2EH2EG6 3C10 |2 G2E3 2EG4 C3NC9 |2 GEH3 HFG4 C3 C9 |2 G2E3 2EG4 C3MC9 |3 G2EH2EG6 3C10 |4 G3EG20 |5 3G21 |29 |29 /29 |29 |29 |29 |29 |29 |5 3G21 |3 2G3E2G19 |2 2GE3 E2G18 |2 GE2 H2 EG5 3C6 C3 | GE7 EG3 C 2MC4 3C2 | GE H3 H EG3 CN MC3 5C | GE7 EG3 C2N C4 3C2 |2 GE2 H2 EG5 3C6 C3 |2 2GE3 E2G18 |3 2G3E2G19 |5 3G21 |29 /29 |29 |29 |29 |29 |29 |5 3G21 |3 2G3E2G19 |2 2GE3 E2G18 |2 GE2 H2 EG5 3C5 3C2 | GE7 EG3 CM NC3 C3 C | GE H3 H EG3 CM NC3 C2 Lw | GE7 EG3 CM NC3 C2 LC |2 GE2 H2 EG5 3C5 3C2 |2 2GE3 E2G18 |3 2G3E2G19 |5 3G21 |29 /29 |29 |29 |29 |29 |29 |5 3G21 |3 2G3E2G15 F3 |2 2GE3 E2G14 F3 |2 GE2 H2 EG5 3C5 CFC2 | GE7 EG3 C2N C3 C 2NC | GE H3 H EG3 CN MC3 CL2 C | GE7 EG3 C 2MC3 C2L C |2 GE2 H2 EG5 3C5 3C2 |2 2GE3 E2G18 |3 2G3E2G19 |5 3G21 |29 /29 |29 |29 |29 |29 |29 |5 3G21 |3 2G3E2G15 F3 |2 2GE3 E2G18 |2 GE2 H2 EG5 3C5 3C2 | GE7 EG3 C3MC3 C3LC | GE H3 H EG3 C3 C3 C2 NC | GE7 EG3 C3NC3 C 2NC |2 GE2 H2 EG5 3C5 3C2 |2 2GE3 E2G18 |3 2G3E2G19 |5 3G21 |29 /29 |29 |29 |29 |29 |29 |5 3G21 |3 2G3E2G15 F3 |2 2GE3 E2G18 |2 GE5 EG5 3C5 3C2 | GE7 EG3 C 2NC3 C2N C | GE7 EG3 CM NC3 CN LC | GE7 EG3 C2M C3 C 2LC |2 GE5 EG5 3C5 3C2 |2 2GE3 E2G18 |3 2G3E2G19 |5 3G21 |29 /29 |29 |29 |29 |29 |29 |2 9P18 | 4P3G4P13 F3 | 2P2G3E2G2P17 | 2PG2E 2EG2P3 P3CP4 3C2 | PG2E3 2EGP3 CN MC3 CL NC | PGE5 FGP3 CN MC3 CL NC | PG2E3 2EGP3 CN MC3 CL NC | 2PG2E 2EG2P3 P3CP4 3C2 | 2P2G3E2G2P17 | 4P3G4P17 |2 9P18 |29 /29 |29 |29 |29 |29 |29 |2 2P5 2P18 | P9 P13 F3 | P3 GDG3 P17 |4 2GE2G6 P3CP3 P3CP |3 2GE E2G5 C2M C3 C 2LC |3 GE3 EF5 cM 2N3F2N Ls |3 2GE E2G5 C 2NC3 C2N C |4 2GE2G6 P3CP3 P3CP | P3 3G3 P17 | P9 P17 |2 2P5 2P18 |29 /29 |15 3A11 |15 3A11 |15 3A11 |29 |29 |2 P7 P18 | P9 P3 3e7 F3 |6 D22 |6 G8 P3CP3 P3CP |5 3G7 5C3 5C |4 2Gv2GF5 5C3 5C |5 3G7 5C3 5C |6 G8 P3CP3 P3CP |29 | P9 P17 |2 P7 P18 |29 /29 |15 A~A11 |15 AIA11 |15 3A11 |29 |29 |2 P7 P18 | P9 P 2F3J8F3 |6 D6 F15 |13 F 5P3 5P |13 F P3 P3 P3 P |9 5F P3 P3 P3 P |15 P3 P3 P3 P |15 5P3 5P |29 | P9 P17 |2 P7 P18 |29 /29 |15 3A11 |6 10D2A11 |6 D8 ADA11 |6 D9 D12 |6 D9 D12 |2 2P2 D2 2P5 D12 | P4 D4 P C KDK C2 C2 C3 | P4 D4 P17 |13 C P3 P3 P3 P |29 |9 C C C15 |29 |15 P3 P3 P3 P | P9 P17 | P9 P17 |2 2P5 2P18 |29 "), kinds: {"A":"gIvSide","C":"gAutoclave","D":"gCable","E":"gGraphiteModerator","F":"gInsulatedFluidPipe","G":"gBerylliumIntegratedR","H":"gRefinedGraphite","I":"gProcessor","J":"gPump","K":"gMotor","L":"gPipeSteel","M":"gPipeTitanium","N":"gPipeTungstensteel","P":"gFrameSteel","e":"gMotor","f":"gBerylliumIntegratedR","v":"gBerylliumIntegratedR","h":"gAutoclave","c":"gAutoclave","w":"gAutoclave","s":"gAutoclave","~":"gHtgrController"} },
  },
  {
    slug: "industrial-electrolyzer",
    name: "Industrial Electrolyzer",
    title: "Промышленный электролизёр",
    tier: "iv",
    summary: "Электролизёр почти втрое быстрее, по 4 рецепта за ярус.",
    story: ["В игре по-русски — «Промышленный электролизёр». Он раскладывает пыль и жидкости на составные части — например, метан на углерод и водород — в 2,8 раза быстрее одноблочного и за 90 % энергии.","Параллели — по 4 за ярус."],
    facts: [{"label":"Размер","value":"5 × 5 × 5"},{"label":"Блоков","value":"69"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIndustrialElectrolyzer.java",
    def: { layers: unpackLayers(" 3D |5D|DCDBD|5D| 3D /5 | ADA | CDB | ADA |5 /5 | A~A | CDB | ADA |5 /5 | ADA | CDB | ADA |5 / 3D |5D|5D|5D| 3D "), kinds: {"A":"gFramePotin","B":"gItemPipeBrass","C":"gItemPipeTin","D":"gStablePotin","~":"gIndustrialElectrolyzerController"} },
  },
  {
    slug: "industrial-extrusion-machine",
    name: "Industrial Extrusion Machine",
    title: "Промышленный экструдер",
    tier: "iv",
    summary: "Экструдер в 3,5 раза быстрее; форма — своя в каждой шине.",
    story: ["В игре по-русски — «Промышленный экструдер». Он выдавливает металлы в нужные формы в 3,5 раза быстрее одноблочного и по 6 рецептов за ярус.","У шин экструзии есть призрачный слот формы, свой для каждой шины, — одна машина справляется со всеми рецептами."],
    facts: [{"label":"Размер","value":"9 × 4 × 4"},{"label":"Блоков","value":"87"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIndustrialExtruder.java",
    def: { layers: unpackLayers("9 |A A5BA|3A5 A|A A5BA/9 |3A5 A|3A5 A|3A5 A/5 3C~|A A5BA|3A5 A|A A5BA/5 4C|8DA|8DA|8DA"), kinds: {"A":"gTensionResistantMach","B":"gFormingCore","C":"gExtruderMachine","D":"gSheetTungsten","~":"gIndustrialExtrusionMachineController"} },
  },
  {
    slug: "industrial-mixing-machine",
    name: "Industrial Mixing Machine",
    title: "Промышленный миксер",
    tier: "iv",
    summary: "Миксер до 900 % скорости и 8 рецептов за ярус.",
    story: ["В игре по-русски — «Промышленный миксер». Он мешает сплавы и смеси пыли до девяти раз быстрее одноблочного миксера и по 8 рецептов за ярус.","Стекло UIV и выше позволяет поставить один многоамперный энергетический люк вместо обычных."],
    facts: [{"label":"Размер","value":"5 × 7 × 5"},{"label":"Блоков","value":"120"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIndustrialMixer.java",
    def: { layers: unpackLayers(" 3D |D3ED|D3ED|D3ED| 3D / 3E |E3AE|EBCBE|E3AE| 3E /5 | 3A |EBCBE| 3A |2 E2 /5 | 3A |EBCBE| 3A |2 E2 /5 | 3A |EBCBE| 3A |2 E2 / E~E |E3AE|EBCBE|E3AE| 3E / 3D |D3ED|D3ED|D3ED| 3D "), kinds: {"A":"glass","B":"gItemPipeElectrum","C":"gTurbineTitanium","D":"gSheetTungsten","E":"gMixing","~":"gIndustrialMixingMachineController"} },
  },
  {
    slug: "industrial-sledgehammer",
    name: "Industrial Sledgehammer",
    title: "Промышленный кузнечный молот",
    tier: "iv",
    summary: "Кузнечный молот вдвое быстрее: параллели — ярус × соленоиды × 6, до 1 080.",
    story: ["В игре по-русски — «Промышленный кузнечный молот», в вики — Industrial Sledgehammer. Он куёт металлы на наковальне вдвое быстрее одноблочного молота.","Параллелей — ярус напряжения, умноженный на уровень соленоидов и на 6, но не больше 1 080."],
    facts: [{"label":"Размер","value":"5 × 9 × 5"},{"label":"Блоков","value":"60"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIndustrialForgeHammer.java",
    def: { layers: unpackLayers("5 |5 |2 D2 |5 |5 /5 |2 E2 | 3D |2 E2 |5 /5 | 3E | DAD | 3E |5 /5 |5 |2DA2D|5 |5 /5 |5 |D A D|5 |5 /5 |5 |D B D|5 |5 /5 |5 |D3 D|5 |5 /5 | C~C |DCBCD| 3C |5 / 3C |5C|D3CD|5C| 3C "), kinds: {"A":"gSolenoidIv","B":"gRefinedGraphite","C":"gForge","D":"gBwadv176176186","E":"gForge","~":"gIndustrialSledgehammerController"} },
  },
  {
    slug: "hyper-intensity-laser-engraver",
    name: "Hyper-Intensity Laser Engraver",
    title: "Сверх-интенсивный лазерный гравировщик",
    tier: "iv",
    summary: "Гравирует пластины и кристаллы лазером: параллели — от силы лазерного люка-источника.",
    story: ["В игре по-русски — «Сверх-интенсивный лазерный гравировщик». Он гравирует пластины, кристаллы и другие тонкие вещи в 3,5 раза быстрее одноблочного гравировщика и за 80 % энергии.","Параллелей столько, сколько кубический корень из силы тока лазерного люка-источника; ярус люка задаёт и предельный ярус рецепта."],
    facts: [{"label":"Размер","value":"5 × 5 × 5"},{"label":"Блоков","value":"77"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIndustrialLaserEngraver.java",
    def: { layers: unpackLayers("2 f2 | fsf |f3af|5a|5a/5 |2 g2 |f3 f|a a a|5a/5 |2 g2 |f3 f|a a a|5a/5 |a g a|a3 a|a a a|5a/ a~a |2ar2a|5a|5a|5a"), kinds: {"a":"gLaser","f":"gFrameTungstensteel","g":"glass","r":"gLaserPlate","s":"gLaser","~":"gHyperIntensityLaserEngraverController"} },
  },
  {
    slug: "large-molecular-assembler",
    name: "Large Molecular Assembler",
    title: "Большой молекулярный сборщик",
    tier: "iv",
    summary: "Автокрафт AE2 до 1 024 предметов в секунду.",
    story: ["В игре по-русски — «Большой молекулярный сборщик». Он собирает предметы для сети AE2 до 256 раз за четверть секунды — до 1 024 крафтов в секунду, в сто раз быстрее обычного сборщика с ускорителями.","Шаблоны подают через входную шину или поставщик шаблонов."],
    facts: [{"label":"Размер","value":"5 × 5 × 5"},{"label":"Блоков","value":"98"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTELargeMolecularAssembler.java",
    def: { layers: unpackLayers("5C|C3GC|C3GC|C3GC|5C/C3GC|G3 G|G3 G|G3 G|C3GC/C3GC|G3 G|G3 G|G3 G|C3GC/C3GC|G3 G|G3 G|G3 G|C3GC/2C~2C|C3GC|C3GC|C3GC|5C"), kinds: {"C":"gRobustTungstensteel","G":"glass","~":"gLargeMolecularAssemblerController"} },
  },
  {
    slug: "industrial-wire-factory",
    name: "Industrial Wire Factory",
    title: "Промышленная фабрика проводов",
    tier: "iv",
    summary: "Волочильный станок до 400 % скорости, по 4 рецепта за ярус.",
    story: ["В игре по-русски — «Промышленная фабрика проводов». Она тянет провода из металлов до четырёх раз быстрее одноблочного станка, за 75 % энергии и по 4 рецепта за ярус.","Для разных схем в одной машине включите разделение входов."],
    facts: [{"label":"Размер","value":"7 × 3 × 3"},{"label":"Блоков","value":"59"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIndustrialWireMill.java",
    def: { layers: unpackLayers(" C3BC |2C3B2C| C3BC /2C3B2C|2C3A2C|2C3B2C/3C~3C|7C|7C"), kinds: {"B":"glass","A":"gItemPipeElectrum","C":"gStableMaragingsteel","~":"gIndustrialWireFactoryController"} },
  },
  {
    slug: "industrial-cutting-factory",
    name: "Industrial Cutting Factory",
    title: "Промышленный режущий станок",
    tier: "iv",
    summary: "Режет стержни, пластины и блоки: до 450 % скорости, бонусы — от пилы в контроллере.",
    story: ["В игре по-русски — «Промышленный режущий станок», в вики — Industrial Cutting Factory. Он режет стержни, пластины, блоки и другое до 4,5 раза быстрее одноблочного станка и тратит от 60 % энергии.","Точные бонусы и предельный ярус энергетических люков зависят от пилы в контроллере — нужна одна, четырёх уровней."],
    facts: [{"label":"Размер","value":"9 × 4 × 3"},{"label":"Блоков","value":"83"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIndustrialCuttingMachine.java",
    def: { layers: unpackLayers("2 D5B |B2C5D |2 D5B / 2D4ADB|CD5 C | 2D4ADB/ D~4ADB|CDB4 C | 2D4ADB/ 7DB|CD6C | 7DB"), kinds: {"A":"glass","B":"gFrameTantalum_carbide","C":"gSheetBlacksteel","D":"gCuttingFactoryFrame","~":"gIndustrialCuttingFactoryController"} },
  },
  {
    slug: "industrial-chemical-bath",
    name: "Industrial Chemical Bath",
    title: "Промышленная химическая ванна",
    tier: "iv",
    summary: "Химическая ванна в пять раз быстрее, по 4 рецепта за ярус.",
    story: ["В игре по-русски — «Промышленная химическая ванна». Она ведёт рецепты химической ванны в пять раз быстрее одноблочной и по 4 рецепта за ярус.","Первая в этой эре версия ванны в виде постройки — удобна для промывки руд в ртути и персульфате натрия."],
    facts: [{"label":"Размер","value":"5 × 4 × 5"},{"label":"Блоков","value":"73"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIndustrialChemicalBath.java",
    def: { layers: unpackLayers("2AB2A|2 B2 |5 |2 B2 |2AB2A/A3EA|E D E|E3 E|E C E|A3EA/AE~EA|E D E|E3 E|E C E|A3EA/A3EA|5E|5E|5E|A3EA"), kinds: {"A":"gFrameAquatic_steel","B":"gChemicallyInert","C":"gBlockCopper","D":"gBlockZinc","E":"gStableGrisium","~":"gIndustrialChemicalBathController"} },
  },
  {
    slug: "magnetic-flux-exhibitor",
    name: "Magnetic Flux Exhibitor",
    title: "Генератор магнитного потока",
    tier: "iv",
    summary: "Поляризатор и магнитный сепаратор в одной постройке, до 256 рецептов.",
    story: ["В игре по-русски — «Генератор магнитного потока», в вики — Magnetic Flux Exhibitor. Он и намагничивает металлы, и разделяет металлическую пыль: до 2,5 раза быстрее, от 50 % энергии и до 256 рецептов сразу.","Бонусы задаёт электромагнит в люке электромагнита — нужен ровно один."],
    facts: [{"label":"Размер","value":"7 × 6 × 7"},{"label":"Блоков","value":"128"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIndustrialElectromagneticSeparator.java",
    def: { layers: unpackLayers("2 3C2 | 2C 2C |2C3 2C|C5 C|2C3 2C| 2C 2C |2 3C2 /7 |7 |7 |C5 C|7 |7 |3 C3 /7 |2 3B2 | 5B |C5BC| 5B |2 3B2 |3 C3 /7 |2 3A2 | A3 A |CA C AC| A3 A |2 3A2 |3 C3 /7 |2 BEB2 | 5B |C5BC| 5B |2 3B2 |3 C3 /2 B~B2 | 5B |7B|7B|7B| 5B |2 3B2 "), kinds: {"A":"glass","B":"gEms","C":"gFrameNeodymiummagnetic","E":"gEms","~":"gMagneticFluxExhibitorController"} },
  },
  {
    slug: "lftr",
    name: "Liquid Fluoride Thorium Reactor",
    title: "Ториевый реактор [ЖФТР]",
    tier: "iv",
    summary: "Жидкосолевой ториевый реактор: топливо 1 литр в секунду — по 16 ампер EV, IV или LuV.",
    story: ["В игре по-русски — «Ториевый реактор [ЖФТР]», в вики — Liquid Fluoride Thorium Reactor. Он делает энергию из бета-распада. Три вида топлива варят на заводе переработки реакторного топлива и тратят по 1 литру в секунду.","Ещё нужен тетрафторобериллат лития — 2 литра в секунду. Топливо даёт 16 ампер EV, IV или LuV."],
    facts: [{"label":"Размер","value":"7 × 4 × 7"},{"label":"Блоков","value":"146"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/production/MTENuclearReactor.java",
    def: { layers: unpackLayers("7C|C5OC|CO3XOC|CO3XOC|CO3XOC|C5OC|7C/7G|G5 G|G5 G|G5 G|G5 G|G5 G|7G/7G|G5 G|G5 G|G5 G|G5 G|G5 G|7G/3C~3C|C5OC|C5OC|C5OC|C5OC|C5OC|7C"), kinds: {"C":"gStableStellite","X":"gStableStellite","O":"gStableStellite","G":"gStableZeron100","~":"gLftrController"} },
  },
  {
    slug: "nuclear-salt-processing-plant",
    name: "Nuclear Salt Processing Plant",
    title: "Завод по переработке ядерной соли",
    tier: "iv",
    summary: "Перерабатывает отработанные соли реактора ЖФТР и гексафториды урана.",
    story: ["В игре по-русски — «Завод по переработке ядерной соли». Он конденсирует летучие гексафториды урана и перерабатывает отработанные соли реактора ЖФТР — в 2,5 раза быстрее одноблочных машин, по 2 рецепта за ярус.","Постройка — две половины: входы слева, выходы справа."],
    facts: [{"label":"Размер","value":"9 × 5 × 3"},{"label":"Блоков","value":"98"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/processing/MTENuclearSaltProcessingPlant.java",
    def: { layers: unpackLayers("3A3 3A|ADA3 ADA|3A3 3A/A2BA A2CA|B2 3A2 C|A2BA A2CA/A3B~3CA|B7 C|A3BF3CA/A2BA A2CA|B2 3A2 C|A2BA A2CA/3A3 3A|AEA3 AEA|3A3 3A"), kinds: {"A":"gIvSide","B":"gTop","C":"gTop","D":"gTop","E":"gTop","F":"gTop","~":"gNuclearSaltProcessingPlantController"} },
  },
  {
    slug: "mass-solidifier",
    name: "Mass Solidifier",
    title: "Массовый отвердитель",
    tier: "iv",
    summary: "Отливает жидкие металлы в формы: разгоняется до 300 %, 10 рецептов за ярус.",
    story: ["В игре по-русски — «Массовый отвердитель». Он отливает жидкий металл в формы за 80 % энергии и по 10 рецептов за ярус.","Скорость растёт на 5 % в секунду, пока он работает, до 300 %, и падает на 10 % в секунду в простое. У люков отвердителя — свой призрачный слот формы."],
    facts: [{"label":"Размер","value":"5 × 6 × 9"},{"label":"Блоков","value":"177"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEMassSolidifier.java",
    def: { layers: unpackLayers(" 3b |2 b2 |2 b2 |2 b2 |2 b2 |2 b2 |2 b2 |2 b2 | 3b /b3db| dfd | dfd | dfd | dfd | dfd | dfd | dfd |b3db/5b|a3 a|a e a|a3 a|a e a|a3 a|a e a|a3 a|5b/5b|a3 a|a3 a|a3 a|a3 a|a3 a|a3 a|a3 a|5b/b3db|a c a|a3ca|a c a|a3ca|a c a|a3ca|a c a|b3db/2b~2b|bdbdb|5b|bdbdb|5b|bdbdb|5b|bdbdb|5b"), kinds: {"a":"glass","b":"gMassSolidifier","c":"gHeatproofcasing","d":"gMassSolidifierRadiat","e":"gPipeSteel","f":"gCleanStainlesssteel","~":"gMassSolidifierController"} },
  },
  {
    slug: "reactor-fuel-processing-plant",
    name: "Reactor Fuel Processing Plant",
    title: "Завод по переработке реакторного топлива",
    tier: "iv",
    summary: "Готовит три вида топлива для реактора ЖФТР.",
    story: ["В игре по-русски — «Завод по переработке реакторного топлива». Он варит из фторидов и урана топливо для реактора ЖФТР — всего три вида, у второго и третьего есть более короткие рецепты.","Рецепты очень долгие, а энергетический люк разрешён только один, поэтому реакторов обычно больше, чем заводов."],
    facts: [{"label":"Размер","value":"3 × 8 × 3"},{"label":"Блоков","value":"44"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/production/MTERefinery.java",
    def: { layers: unpackLayers("3 | N |3 / N |NIN| N / N |NIN| N / N |NIN| N / Z |ZIZ| Z / N |NIN| N /3X|3X|3X/X~X|3X|3X"), kinds: {"X":"gStableHastelloyN","I":"gFluidIncoloyDs","N":"gStableHastelloyX","Z":"gStableZeron100","~":"gReactorFuelProcessingPlantController"} },
  },
  {
    slug: "rocketdyne-f1a",
    name: "Rocketdyne F-1A Engine",
    title: "Двигатель Rocketdyne F-1A",
    tier: "iv",
    summary: "Огромный генератор на ракетном топливе; ему нужен воздух через воздухозаборные люки.",
    story: ["В игре по-русски — «Двигатель Rocketdyne F-1A». Он делает энергию из ракетного топлива; жёсткого предела выработки нет, но чем больше топлива, тем ниже его КПД.","Ему нужно 1 000 литров углекислого газа в час и воздух — 1 % текущей выработки в секунду, только через воздухозаборные люки. Жидкий водород ускоряет его."],
    facts: [{"label":"Размер","value":"3 × 3 × 10"},{"label":"Блоков","value":"90"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/production/MTELargeRocketEngine.java",
    def: { layers: unpackLayers("CTC|CTC|CTC|CTC|CTC|CTC|CTC|CTC|CTC|CTC/C~C|SIS|SIS|SIS|SIS|SIS|SIS|SIS|SIS|CMC/3C|CSC|CSC|CSC|CSC|CSC|CSC|CSC|CSC|3C"), kinds: {"C":"gRocketdyne","I":"gInconelReinforced","S":"gRocketdyne","T":"gRocketdyne","M":"gRocketdyne","~":"gRocketdyneF1aController"} },
  },
  {
    slug: "solar-tower",
    name: "Solar Tower",
    title: "Солнечная башня",
    tier: "iv",
    summary: "Греет солнечную соль даром: кольца отражателей вокруг башни собирают солнечный свет.",
    story: ["В игре по-русски — «Солнечная башня». Она бесплатно, циклами по 10 секунд, нагревает холодную солнечную соль. Тепло зависит от числа отражателей, которые видят небо, и от числа их колец вокруг башни.","В дождь тепла вдвое меньше, ночью — нет совсем. Здесь показана башня с первым кольцом; контроллер смотрит вверх."],
    facts: [{"label":"Размер","value":"15 × 28 × 15"},{"label":"Блоков","value":"476"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/production/MTESolarTower.java",
    def: { layers: unpackLayers("15 |15 |15 |15 |15 |15 |15 |7 ~7 |15 |15 |15 |15 |15 |15 |15 /15 |15 |15 |15 |15 |15 |7 s7 |6 3s6 |7 s7 |15 |15 |15 |15 |15 |15 /15 |15 |15 |15 |15 |7 c7 |6 3c6 |5 2cs2c5 |6 3c6 |7 c7 |15 |15 |15 |15 |15 /15 |15 |15 |15 |15 |7 c7 |6 3c6 |5 2cs2c5 |6 3c6 |7 c7 |15 |15 |15 |15 |15 /15 |15 |15 |15 |15 |7 c7 |6 3c6 |5 2cs2c5 |6 3c6 |7 c7 |15 |15 |15 |15 |15 /15 |15 |15 |15 |15 |7 c7 |6 3c6 |5 2cs2c5 |6 3c6 |7 c7 |15 |15 |15 |15 |15 /15 |15 |15 |15 |15 |7 c7 |6 3c6 |5 2cs2c5 |6 3c6 |7 c7 |15 |15 |15 |15 |15 /15 |15 |15 |15 |15 |15 |7 i7 |6 isi6 |7 i7 |15 |15 |15 |15 |15 |15 /15 |15 |15 |15 |15 |15 |7 i7 |6 isi6 |7 i7 |15 |15 |15 |15 |15 |15 /15 |15 |15 |15 |15 |15 |7 i7 |6 isi6 |7 i7 |15 |15 |15 |15 |15 |15 /15 |15 |15 |15 |15 |15 |7 i7 |6 isi6 |7 i7 |15 |15 |15 |15 |15 |15 /15 |15 |15 |15 |15 |15 |7 i7 |6 isi6 |7 i7 |15 |15 |15 |15 |15 |15 /15 |15 |15 |15 |15 |15 |7 i7 |6 isi6 |7 i7 |15 |15 |15 |15 |15 |15 /15 |15 |15 |15 |15 |15 |7 i7 |6 isi6 |7 i7 |15 |15 |15 |15 |15 |15 /15 |15 |15 |15 |15 |15 |7 i7 |6 isi6 |7 i7 |15 |15 |15 |15 |15 |15 /15 |15 |15 |15 |15 |15 |7 i7 |6 isi6 |7 i7 |15 |15 |15 |15 |15 |15 /15 |15 |15 |15 |15 |15 |7 i7 |6 isi6 |7 i7 |15 |15 |15 |15 |15 |15 /15 |15 |15 |15 |15 |15 |7 i7 |6 isi6 |7 i7 |15 |15 |15 |15 |15 |15 /15 |15 |15 |15 |15 |15 |7 i7 |6 isi6 |7 i7 |15 |15 |15 |15 |15 |15 /15 |15 |15 |15 |15 |15 |7 i7 |6 isi6 |7 i7 |15 |15 |15 |15 |15 |15 /15 |15 |15 |15 |15 |15 |7 i7 |6 isi6 |7 i7 |15 |15 |15 |15 |15 |15 /15 |15 |15 |15 |15 |15 |7 i7 |6 isi6 |7 i7 |15 |15 |15 |15 |15 |15 /15 |15 |15 |15 |7 t7 |6 3t6 |5 2ts2t5 |4 2t3s2t4 |5 2ts2t5 |6 3t6 |7 t7 |15 |15 |15 |15 /15 |15 |15 |15 |7 t7 |6 3t6 |5 t3st5 |4 2t3s2t4 |5 t3st5 |6 3t6 |7 t7 |15 |15 |15 |15 /15 |15 |15 |7 t7 |6 3t6 |5 5t5 |4 2t3s2t4 |3 3t3s3t3 |4 2t3s2t4 |5 5t5 |6 3t6 |7 t7 |15 |15 |15 /15 |15 |15 |7 t7 |6 3t6 |5 5t5 |4 2t3s2t4 |3 3t3s3t3 |4 2t3s2t4 |5 5t5 |6 3t6 |7 t7 |15 |15 |15 /15 |15 |6 3h6 |5 5t5 |4 7t4 |3 9t3 |2 h3t3s3th2 |2 h3t3s3th2 |2 h3t3s3th2 |3 9t3 |4 7t4 |5 5t5 |6 3h6 |15 |15 /5 5g5 |4 g5 g4 |3 g2 3h2 g3 |2 g2 5t2 g2 | g2 7t2 g |g2 9t2 g|g h9th g|g h9th g|g h9th g|g2 9t2 g| g2 7t2 g |2 g2 5t2 g2 |3 g2 3h2 g3 |4 g5 g4 |5 5g5 "), kinds: {"g":"gStableStellite","t":"gStableMaragingsteel","i":"gTop","s":"gStableStellite","c":"gStableTantalloy61","h":"gStableMaragingsteel","~":"gSolarTowerController"} },
  },
  {
    slug: "precise-auto-assembler",
    name: "Precise Auto-Assembler MT-3662",
    title: "Точный автосборщик MT-3662",
    tier: "iv",
    summary: "Сборщик вдвое быстрее и до 256 рецептов, плюс точная сборка.",
    story: ["Точный автосборщик MT-3662 ведёт рецепты сборщика вдвое быстрее и до 256 сразу — в зависимости от уровня корпусов точных электронных блоков. Он же — единственная машина точной сборки.","Многоамперные и лазерные люки подходят, но рецепты через ярус он не пропускает."],
    facts: [{"label":"Размер","value":"9 × 5 × 5"},{"label":"Блоков","value":"141"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/goodgenerator/blocks/tileEntity/MTEPreciseAssembler.java",
    def: { layers: unpackLayers("9C|9C|9C|9C|9C/F7 F|C7GC|C7 C|C7GC|F7 F/F7 F|C7GC|C7 C|C7GC|F7 F/F7 F|C7GC|C7 C|C7GC|F7 F/4C~4C|C7 C|C7 C|C7 C|9C"), kinds: {"C":"g0","F":"gFrameTungstensteel","G":"glass","~":"gPreciseAutoAssemblerController"} },
  },
  {
    slug: "zyngen",
    name: "Zyngen",
    title: "Промышленная плавильная печь Zyngen",
    tier: "iv",
    summary: "Сплавы с идеальным разгоном за каждые 900 K нагрева катушек.",
    story: ["В игре по-русски — «Промышленная плавильная печь Zyngen». Она плавит сплавы: каждый уровень катушек даёт 5 % скорости, а каждые 900 K нагрева — один идеальный разгон.","Параллелей — ярус напряжения, умноженный на уровень катушек. Чаще всего в ней делают слюдяную фольгу и укреплённое стекло."],
    facts: [{"label":"Размер","value":"3 × 5 × 3"},{"label":"Блоков","value":"42"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/processing/MTEIndustrialAlloySmelter.java",
    def: { layers: unpackLayers("3C|3C|3C/3H|H H|3H/3V|V V|3V/3H|H H|3H/C~C|3C|3C"), kinds: {"C":"gInconelReinforced","H":"gCoilTungstensteel","V":"gEvSide","~":"gZyngenController"} },
  },
  {
    slug: "thermal-boiler",
    name: "Thermal Boiler",
    title: "Тепловой бойлер",
    tier: "iv",
    summary: "Кипятит воду теплом лавы или горячих жидкостей; с фильтром — ещё и побочные продукты.",
    story: ["В игре по-русски — «Тепловой бойлер». Он кипятит воду в пар теплом лавы, лавы пахоэхоэ, горячего хладагента или горячей солнечной соли — без энергии и топлива.","С фильтром лавы в контроллере он собирает из лавы немного побочных продуктов. Без воды он взрывается."],
    facts: [{"label":"Размер","value":"5 × 5 × 5"},{"label":"Блоков","value":"90"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEThermalBoiler.java",
    def: { layers: unpackLayers("5 |D A E|2CF2B|D A E|5 /D3 E|D3FE|D3FE|D3FE|D3 E/C3 B|DF~FE|DF FE|D3FE|C3 B/D3 E|D3FE|D3FE|D3FE|D3 E/2A 2A|D3AE|2CF2B|D3AE|2A 2A"), kinds: {"A":"gFrameMaraging350","B":"gPipeBronze","C":"gPipeTungstensteel","D":"gRobustTungstensteel","E":"gStableRedSteel","F":"gStableTantalloy61","~":"gThermalBoilerController"} },
  },
  {
    slug: "tree-growth-simulator",
    name: "Tree Growth Simulator",
    title: "Симулятор роста деревьев",
    tier: "iv",
    summary: "Растит и рубит деревья внутри контроллера: саженец, инструмент и энергия.",
    story: ["В игре по-русски — «Симулятор роста деревьев». Он растит и рубит деревья, не сажая их в мир, — намного быстрее ферм EnderIO и без нагрузки на сервер.","Нужны саженец в контроллере, инструмент GregTech во входной шине — он решает, что собирать: пила даёт брёвна, ножницы — листья, — и энергия."],
    facts: [{"label":"Размер","value":"7 × 7 × 7"},{"label":"Блоков","value":"211"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTETreeFarm.java",
    def: { layers: unpackLayers("7 |2 3A2 | A3BA | A3BA | A3BA |2 3A2 |7 /2 3A2 | A3 A |A5 A|A2 F2 A|A5 A| A3 A |2 3A2 / A3BA |A5 A|B2 F2 B|B FGF B|B2 F2 B|A5 A| A3BA /CA3BAC|A5 A|B5 B|B2 G2 B|B5 B|A5 A|CA3BAC/CA3BAC|A5 A|B5 B|B2 G2 B|B5 B|A5 A|CA3BAC/CA3BAC|A5DA|B5DB|B5DB|B5DB|A5DA|CA3BAC/3C~3C|7C|7C|7C|7C|7C|7C"), kinds: {"A":"gFrameSteel","B":"glass","C":"gSterile","D":"ownDirt","F":"ownLeaves","G":"ownLog","~":"gTreeGrowthSimulatorController"} },
  },
  {
    slug: "zhuhai-fishing-port",
    name: "Zhuhai Fishing Port",
    title: "Рыболовная станция Чжухай",
    tier: "iv",
    summary: "Рыба, мусор или сокровища — только за энергию.",
    story: ["В игре по-русски — «Рыболовная станция Чжухай». Она ловит рыбу и прочую добычу намного быстрее одноблочного рыболова; параллелей — 2 × (ярус + 1).","На вход нужна только энергия и вода внутри, выход случайный. Три рецепта — рыба, мусор или сокровища — у каждого своя таблица добычи."],
    facts: [{"label":"Размер","value":"11 × 4 × 11"},{"label":"Блоков","value":"196"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIndustrialFishingPond.java",
    def: { layers: unpackLayers("11 |11 |11 |11 |4 3C4 |4 3C4 |4 3C4 |11 |11 |11 |11 /4 3C4 |2 2C A 2C2 | C3 A3 C | C3 A3 C |C3 3C3 C|C3A3C3AC|C3 3C3 C| C3 A3 C | C3 A3 C |2 2C A 2C2 |4 3C4 /4 C~C4 |2 2C B 2C2 | C3 B3 C | C3 B3 C |C3 3C3 C|C3B3C3BC|C3 3C3 C| C3 B3 C | C3 B3 C |2 2C B 2C2 |4 3C4 /4 3C4 |2 7C2 | 9C | 9C |11C|11C|11C| 9C | 9C |2 7C2 |4 3C4 "), kinds: {"C":"gAquatic","A":"gFrameStainlesssteel","B":"gSheetStainlesssteel","~":"gZhuhaiFishingPortController"} },
  },
  {
    slug: "xl-turbo-steam-turbine",
    name: "XL Turbo Steam Turbine",
    title: "XL Турбопаровая турбина",
    tier: "iv",
    summary: "Паровая турбина с 12 роторами и в 16 раз мощнее большой.",
    story: ["В игре по-русски — «XL Турбопаровая турбина». У неё в 16 раз больше пропускная способность, чем у большой паровой турбины, всего с 12 турбинами; она берёт обычный и плотный пар и не взрывается, если сломать динамо-люк на ходу.","Зато все турбины должны быть одинаковыми, а штрафы за неточность строже."],
    facts: [{"label":"Размер","value":"9 × 9 × 29"},{"label":"Блоков","value":"651"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/xlturbines/MTEXLTurbineSteam.java",
    def: { layers: unpackLayers("9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |3 3F3 |2 2FD2F2 |2 2FD2F2 | 3FD3F | 3FD3F |2 5F2 |4 F4 |9 |4 F4 |2 5F2 | 3FD3F | 3FD3F |2 2FD2F2 |2 2FD2F2 |3 3F3 |9 /9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |3 3F3 |2 5F2 |2 F3 F2 | F5 F | FC3 CF |F7 F|F C3 C F| F5 F |2 2F 2F2 |3 3F3 |2 2F 2F2 | F5 F |F7 F|F7 F| FC2 2CF | F5 F |2 F3 F2 |3 3F3 /9 |9 |9 |4 F4 |4 F4 |3 3F3 |3 3F3 |3 3A3 |3 3A3 |3 3A3 |3 3F3 |2 F3 F2 | F5 F | F5 F |F7 F|F2C2 3CF|F7 F|F3C2 2CF|F7 F| F C3 F |2 F3 F2 | F3 C F |F7 F|F2 C4 F|F7 F|F2C2 3CF|F7 F| F5 F |2 F3 F2 /4 F4 |3 3F3 |3 3F3 |3 F F3 |3 FCF3 |2 F B F2 |2 F B F2 |2 A B A2 |2 A3 A2 |2 A B A2 |2 F B F2 | F5 F | F5 F |F3 C3 F|F7 F|F 2C C2 F|F7 F|F2 C 2C F|F7 F| F2 C CF | F5 F | FC C2 F |F7 F|F3 C C F|F7 F|F 2C C2 F|F7 F|F7 F| F5 F /3 F~F3 |3 FDF3 |3 FDF3 |2 F3 F2 |2 FCECF2 |2 FBEBF2 |2 FBEBF2 |2 ABEBA2 |2 A E A2 |2 ABEBA2 |2 FBEBF2 | F2 E2 F | F2 E2 F |F2 3C2 F|D3 E3 D|D3 C3 D|D3 E3 D|D3 C3 D|F3 E3 F|F2 3C2 F| F2 E2 F |F2 3C2 F|F3 E3 F|D2 3C2 D|D3 E3 D|D3 C3 D|D3 E3 D|F7 F| F5 F /4 F4 |3 3F3 |3 3F3 |3 F F3 |3 FCF3 |2 F B F2 |2 F B F2 |2 A B A2 |2 A3 A2 |2 A B A2 |2 F B F2 | F5 F | F5 F |F3 C3 F|F7 F|F2 C 2C F|F7 F|F 2C C2 F|F7 F| FC C2 F | F5 F | F2 C CF |F7 F|F C C3 F|F7 F|F2 C 2C F|F7 F|F7 F| F5 F /9 |9 |9 |4 F4 |4 F4 |3 3F3 |3 3F3 |3 3A3 |3 3A3 |3 3A3 |3 3F3 |2 F3 F2 | F5 F | F5 F |F7 F|F3C2 2CF|F7 F|F2C2 3CF|F7 F| F3 C F |2 F3 F2 | F C3 F |F7 F|F4 C2 F|F7 F|F3C2 2CF|F7 F| F5 F |2 F3 F2 /9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |3 3F3 |2 5F2 |2 F3 F2 | F5 F | FC3 CF |F7 F|F C3 C F| F5 F |2 2F 2F2 |3 3F3 |2 2F 2F2 | F5 F |F7 F|F7 F| FC3 CF | F5 F |2 F3 F2 |3 3F3 /9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |3 3F3 |2 2FD2F2 |2 2FD2F2 | 3FD3F | 3FD3F |2 5F2 |4 F4 |9 |4 F4 |2 5F2 | 3FD3F | 3FD3F |2 2FD2F2 |2 2FD2F2 |3 3F3 |9 "), kinds: {"A":"glass","B":"gMvSideCyclotronSole","C":"gPipeSteel","D":"gFrameSteel","E":"gRedoxEv","F":"gTurbineSteel","~":"gXlTurboSteamTurbineController"} },
  },
  {
    slug: "thtr",
    name: "Thorium High Temperature Reactor",
    title: "Высокотемпературный ториевый реактор",
    tier: "iv",
    summary: "Делит топливные шарики TRISO ради тепла: с хладагентом — горы горячего хладагента.",
    story: ["Высокотемпературный ториевый реактор (THTR) делит шарики TRISO ради тепла. Для пуска нужно 100 000 шариков и 730 000 литров гелия; меньше максимума в 675 000 шариков — ниже КПД.","С хладагентом он даёт огромное количество горячего хладагента для выработки энергии."],
    facts: [{"label":"Размер","value":"11 × 12 × 11"},{"label":"Блоков","value":"538"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/bartworks/common/tileentities/multis/MTEThoriumHighTempReactor.java",
    def: { layers: unpackLayers("2 7B2 | 9B |11B|11B|11B|11B|11B|11B|11B| 9B |2 7B2 /2 7c2 | c7 c |c9 c|c9 c|c9 c|c9 c|c9 c|c9 c|c9 c| c7 c |2 7c2 /2 7c2 | c7 c |c9 c|c9 c|c9 c|c9 c|c9 c|c9 c|c9 c| c7 c |2 7c2 /2 7c2 | c7 c |c9 c|c9 c|c9 c|c9 c|c9 c|c9 c|c9 c| c7 c |2 7c2 /2 7c2 | c7 c |c9 c|c9 c|c9 c|c9 c|c9 c|c9 c|c9 c| c7 c |2 7c2 /2 7c2 | c7 c |c9 c|c9 c|c9 c|c9 c|c9 c|c9 c|c9 c| c7 c |2 7c2 /2 7c2 | c7 c |c9 c|c9 c|c9 c|c9 c|c9 c|c9 c|c9 c| c7 c |2 7c2 /2 7c2 | c7 c |c9 c|c9 c|c9 c|c9 c|c9 c|c9 c|c9 c| c7 c |2 7c2 /2 7c2 | c7 c |c9 c|c9 c|c9 c|c9 c|c9 c|c9 c|c9 c| c7 c |2 7c2 /2 7c2 | c7 c |c9 c|c9 c|c9 c|c9 c|c9 c|c9 c|c9 c| c7 c |2 7c2 /2 7c2 | c7 c |c9 c|c9 c|c9 c|c9 c|c9 c|c9 c|c9 c| c7 c |2 7c2 /2 3b~3b2 | 9b |11b|11b|11b|11b|11b|11b|11b| 9b |2 7b2 "), kinds: {"c":"gRadiationproof","b":"gRadiationproof","B":"gRadiationproof","~":"gThtrController"} },
  },
  {
    slug: "yottank",
    name: "YOTTank",
    title: "Хранилище YOTTank",
    tier: "iv",
    summary: "Огромный бак на одну жидкость; подключается к AE2, не тратит энергию.",
    story: ["YOTTank хранит огромный объём одной жидкости и подключается к сети AE2. Объём растёт с числом и уровнем блоков жидкостных ячеек внутри.","В отличие от T.F.F.T, ему не нужны энергия и обслуживание. Здесь показан бак высотой в три ячейки."],
    facts: [{"label":"Размер","value":"5 × 7 × 5"},{"label":"Блоков","value":"150"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/goodgenerator/blocks/tileEntity/MTEYottaFluidTank.java",
    def: { layers: unpackLayers("5F|F3 F|F3 F|F3 F|5F/5C|C3IC|C3IC|C3IC|5C/5G|G3RG|G3RG|G3RG|5G/5G|G3RG|G3RG|G3RG|5G/5G|G3RG|G3RG|G3RG|5G/2C~2C|5C|5C|5C|5C/5 | 3O | 3O | 3O |5 "), kinds: {"C":"gYottaFluidTankCasin","G":"glass","R":"g1","F":"gFrameSteel","I":"gYottaFluidTankCasin","O":"gYottaFluidTankCasin","~":"gYottankController"} },
  },
  {
    slug: "thermic-heating-device",
    name: "Thermic Heating Device",
    title: "Термическая нагревательная установка",
    tier: "iv",
    summary: "Нагреватель жидкостей в 2,2 раза быстрее, по 8 рецептов за ярус.",
    story: ["В игре по-русски — «Термическая нагревательная установка». Она греет жидкости в 2,2 раза быстрее одноблочного нагревателя, за 90 % энергии и по 8 рецептов за ярус.","Чаще всего в ней греют среды для катализаторов роста и биокатализаторов и цианоакрилат — суперклей."],
    facts: [{"label":"Размер","value":"5 × 6 × 5"},{"label":"Блоков","value":"90"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/processing/MTEIndustrialFluidHeater.java",
    def: { layers: unpackLayers(" 3T |5T|5T|5T| 3T / 3X |X3 X|X3 X|X3 X| 3X / 3X |X3 X|X3 X|X3 X| 3X / 3X |X3 X|X3 X|X3 X| 3X / X~X |X3 X|X3 X|X3 X| 3X / 3B |5B|5B|5B| 3B "), kinds: {"B":"gMultiUse","X":"gStableTantalloy61","T":"gMultiUse","~":"gThermicHeatingDeviceController"} },
  },
  {
    slug: "universal-chemical-fuel-engine",
    name: "Universal Chemical Fuel Engine",
    title: "Универсальный двигатель на химическом топливе",
    tier: "iv",
    summary: "Жжёт любое жидкое топливо с промоутером: чем больше промоутера, тем выше КПД.",
    story: ["Универсальный двигатель на химическом топливе сжигает дизельное и газовое топливо вместе с промоутером. Чем больше промоутера, тем выше КПД, до 150 %.","Выработку ограничивает динамо-люк: если выдавать близко к его пределу, КПД падает."],
    facts: [{"label":"Размер","value":"7 × 7 × 13"},{"label":"Блоков","value":"273"},{"label":"Ярус в вики","value":"IV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEUniversalChemicalFuelEngine.java",
    def: { layers: unpackLayers("7 |B5 B|7 |B5 B|7 |B5 B|7 |B5 B|7 |B5 B|7 |B5 B|7 /7 |FB3 BF| D3 D |FB3 BF| D3 D |FB3 BF| D3 D |FB3 BF| D3 D |FB3 BF| D3 D |FB3 BF|7 /7 |FAFEFAF| D3 D |FAFEFAF| D3 D |FAFEFAF| D3 D |FAFEFAF| D3 D |FAFEFAF| D3 D |FAFEFAF|7 /2 3B2 | F3BF |2 3B2 | F3BF |2 3B2 | F3BF |2 3B2 | F3BF |2 3B2 | F3BF |2 3B2 | F3BF |2 3B2 /2 B~B2 | EB BE |2 B B2 | EB BE |2 B B2 | EB BE |2 B B2 | EB BE |2 B B2 | EB BE |2 B B2 | EB BE |2 BGB2 /2 3B2 | F3BF |2 CBC2 | F3BF |2 CBC2 | F3BF |2 CBC2 | F3BF |2 CBC2 | F3BF |2 CBC2 | F3BF |2 3B2 /7 |2 FEF2 |2 3E2 |2 FEF2 |2 3E2 |2 FEF2 |2 3E2 |2 FEF2 |2 3E2 |2 FEF2 |2 3E2 |2 FEF2 |7 "), kinds: {"A":"gPipeTitanium","B":"gStableTitanium","C":"gFireboxTitanium","D":"gEngineIntake","E":"gChemicallyInert","F":"gFramePolytetrafluoroethylene","G":"gStableTitanium","~":"gUniversalChemicalFuelEngineController"} },
  },
  {
    slug: "clarifier-purification-unit",
    name: "Clarifier Purification Unit",
    title: "Установка грубой фильтрации воды",
    tier: "luv",
    summary: "Первый шаг линии очистки воды: фильтр из активированного угля.",
    story: ["В игре по-русски — «Установка грубой фильтрации воды», в вики — Clarifier Purification Unit. Это первый шаг линии очистки воды.","Задача простая: ей нужен фильтр из активированного угля, и с вероятностью 20 % за цикл он расходуется, так что фильтры надо делать постоянно."],
    facts: [{"label":"Размер","value":"11 × 4 × 12"},{"label":"Блоков","value":"180"},{"label":"Ярус в вики","value":"LuV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/purification/MTEPurificationUnitClarifier.java",
    def: { layers: unpackLayers("11 |11 |11 |11 |11 |4 3D4 |5DBD4 |4 3D4 |11 |11 |11 |11 /11 |3 5A3 |2 A5 A2 | A7 A |A9 A|A9 A|A4 B4 A|A9 A|A9 A| A7 A |2 A5 A2 |3 5A3 /11 |3 AH~HA3 |2 A5 A2 | A7 A |A3 3C3 A|H2 C3 C2 H|A2 C B C2 A|H2 C3 C2 H|A3 3C3 A| A7 A |2 A5 A2 |3 AHAHA3 /11 |3 5A3 |2 7A2 | 9A |4A3F4A|3A5F3A|3A5F3A|3A5F3A|4A3F4A| 9A |2 7A2 |3 5A3 "), kinds: {"H":"gWaterPlantConcrete","A":"gWaterPlantConcrete","B":"gPipePolytetrafluoroet","C":"gFrameIridium","D":"gFrameDamascussteel","F":"gVent","~":"gClarifierPurificationUnitController"} },
  },
  {
    slug: "compact-fusion-reactor",
    name: "Compact Fusion Computer MK-I",
    title: "Компактный реактор синтеза MK-I",
    tier: "luv",
    summary: "Реактор синтеза GoodGenerator: те же рецепты, но много рецептов сразу и мощнее.",
    story: ["Компактный реактор синтеза из GoodGenerator ведёт рецепты реактора синтеза, но держит намного больше энергии на разгон и ведёт рецепты параллельно.","Это кольцо 47 × 7 × 47 — почти две с половиной тысячи блоков. Контроллер стоит в кольце, как у обычного реактора синтеза. Есть пять моделей, по одной на ярус от LuV до UEV."],
    facts: [{"label":"Размер","value":"47 × 7 × 47"},{"label":"Блоков","value":"2 480"},{"label":"Ярус в вики","value":"LUV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/goodgenerator/blocks/tileEntity/MTELargeFusionComputer1.java",
    def: { layers: unpackLayers("47 |47 |20 F5CF20 |20 FCIBICF20 |20 F5CF20 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |2 3F37 3F2 |2 3C37 3C2 |2 CIC37 CIC2 |2 CBC37 CBC2 |2 CIC37 CIC2 |2 3C37 3C2 |2 3F37 3F2 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |20 F5CF20 |20 FCIBICF20 |20 F5CF20 |47 |47 /47 |20 FC3BCF20 |19 2C5 2C19 |16 5C5 5C16 |14 7C5 7C14 |12 7C FC3BCF 7C12 |11 5C15 5C11 |10 4C19 4C10 |9 3C23 3C9 |8 3C25 3C8 |7 3C27 3C7 |6 3C29 3C6 |5 3C31 3C5 |5 3C31 3C5 |4 3C33 3C4 |4 3C33 3C4 |3 3C35 3C3 |3 3C35 3C3 |3 3C35 3C3 |2 3C37 3C2 | F3CF35 F3CF | C3 C35 C3 C | B3 B35 B3 B | B3 B35 B3 B | B3 B35 B3 B | C3 C35 C3 C | F3CF35 F3CF |2 3C37 3C2 |3 3C35 3C3 |3 3C35 3C3 |3 3C35 3C3 |4 3C33 3C4 |4 3C33 3C4 |5 3C31 3C5 |5 3C31 3C5 |6 3C29 3C6 |7 3C27 3C7 |8 3C25 3C8 |9 3C23 3C9 |10 4C19 4C10 |11 5C15 5C11 |12 7C FC3BCF 7C12 |14 7C5 7C14 |16 5C5 5C16 |19 2C5 2C19 |20 FC3BCF20 |47 /20 F5CF20 |19 2C5 2C19 |16 5C5 5C16 |14 5C9H5C14 |12 4C3H2C5 2C3H4C12 |11 3C2H5C5 5C2H3C11 |10 EC2H5C F5CF 5C2HCE10 |9 2CH4C15 4CH2C9 |8 2CH3C19 3CH2C8 |7 2CHCE23 ECH2C7 |6 ECH2C25 2CHCE6 |5 2CHCE27 ECH2C5 |4 2CH2C29 2CH2C4 |4 2CH2C29 2CH2C4 |3 2CH2C31 2CH2C3 |3 2CH2C31 2CH2C3 |2 2CH2C33 2CH2C2 |2 2CH2C33 2CH2C2 |2 2CH2C33 2CH2C2 | 2CH2C35 2CH2C |F2CH2CF33 F2CH2CF|C2 H2 C33 C2 H2 C|C2 H2 C33 C2 H2 C|C2 H2 C33 C2 H2 C|C2 H2 C33 C2 H2 C|C2 H2 C33 C2 H2 C|F2CH2CF33 F2CH2CF| 2CH2C35 2CH2C |2 2CH2C33 2CH2C2 |2 2CH2C33 2CH2C2 |2 2CH2C33 2CH2C2 |3 2CH2C31 2CH2C3 |3 2CH2C31 2CH2C3 |4 2CH2C29 2CH2C4 |4 2CH2C29 2CH2C4 |5 2CHCE27 ECH2C5 |6 ECH2C25 2CHCE6 |7 2CHCE23 ECH2C7 |8 2CH3C19 3CH2C8 |9 2CH4C15 4CH2C9 |10 EC2H5C F2CD2CF 5C2HCE10 |11 3C2H5C5 5C2H3C11 |12 4C3H2C5 2C3H4C12 |14 5C9H5C14 |16 5C5 5C16 |19 2C5 2C19 |20 F5CF20 /20 FCIBICF20 |19 2C5 2C19 |16 3C9H3C16 |14 2C15H2C14 |12 2C19H2C12 |11 C7H2C5 2C7HC11 |10 C5H3C FCIBICF 3C5HC10 |9 C4H2C15 2C4HC9 |8 C3H2C19 2C3HC8 |7 C3HC23 C3HC7 |6 C3HC25 C3HC6 |5 C3HC27 C3HC5 |4 C3HC29 C3HC4 |4 C3HC29 C3HC4 |3 C3HC31 C3HC3 |3 C3HC31 C3HC3 |2 C3HC33 C3HC2 |2 C3HC33 C3HC2 |2 C3HC33 C3HC2 | C3HC35 C3HC |FC3HCF33 FC3HCF|C 3H C33 C 3H C|I 3H I33 I 3H I|B 3H B33 B 3H B|I 3H I33 I 3H I|C 3H C33 C 3H C|FC3HCF33 FC3HCF| C3HC35 C3HC |2 C3HC33 C3HC2 |2 C3HC33 C3HC2 |2 C3HC33 C3HC2 |3 C3HC31 C3HC3 |3 C3HC31 C3HC3 |4 C3HC29 C3HC4 |4 C3HC29 C3HC4 |5 C3HC27 C3HC5 |6 C3HC25 C3HC6 |7 C3HC23 C3HC7 |8 C3H2C19 2C3HC8 |9 C4H2C15 2C4HC9 |10 C5H3C FCI~ICF 3C5HC10 |11 C7H2C5 2C7HC11 |12 2C19H2C12 |14 2C15H2C14 |16 3C9H3C16 |19 2C5 2C19 |20 FCIBICF20 /20 F5CF20 |19 2C5 2C19 |16 5C5 5C16 |14 5C9H5C14 |12 4C3H2C5 2C3H4C12 |11 3C2H5C5 5C2H3C11 |10 EC2H5C F5CF 5C2HCE10 |9 2CH4C15 4CH2C9 |8 2CH3C19 3CH2C8 |7 2CHCE23 ECH2C7 |6 ECH2C25 2CHCE6 |5 2CHCE27 ECH2C5 |4 2CH2C29 2CH2C4 |4 2CH2C29 2CH2C4 |3 2CH2C31 2CH2C3 |3 2CH2C31 2CH2C3 |2 2CH2C33 2CH2C2 |2 2CH2C33 2CH2C2 |2 2CH2C33 2CH2C2 | 2CH2C35 2CH2C |F2CH2CF33 F2CH2CF|C2 H2 C33 C2 H2 C|C2 H2 C33 C2 H2 C|C2 H2 C33 C2 H2 C|C2 H2 C33 C2 H2 C|C2 H2 C33 C2 H2 C|F2CH2CF33 F2CH2CF| 2CH2C35 2CH2C |2 2CH2C33 2CH2C2 |2 2CH2C33 2CH2C2 |2 2CH2C33 2CH2C2 |3 2CH2C31 2CH2C3 |3 2CH2C31 2CH2C3 |4 2CH2C29 2CH2C4 |4 2CH2C29 2CH2C4 |5 2CHCE27 ECH2C5 |6 ECH2C25 2CHCE6 |7 2CHCE23 ECH2C7 |8 2CH3C19 3CH2C8 |9 2CH4C15 4CH2C9 |10 EC2H5C F2CD2CF 5C2HCE10 |11 3C2H5C5 5C2H3C11 |12 4C3H2C5 2C3H4C12 |14 5C9H5C14 |16 5C5 5C16 |19 2C5 2C19 |20 F5CF20 /47 |20 FC3BCF20 |19 2C5 2C19 |16 5C5 5C16 |14 7C5 7C14 |12 7C FC3BCF 7C12 |11 5C15 5C11 |10 4C19 4C10 |9 3C23 3C9 |8 3C25 3C8 |7 3C27 3C7 |6 3C29 3C6 |5 3C31 3C5 |5 3C31 3C5 |4 3C33 3C4 |4 3C33 3C4 |3 3C35 3C3 |3 3C35 3C3 |3 3C35 3C3 |2 3C37 3C2 | F3CF35 F3CF | C3 C35 C3 C | B3 B35 B3 B | B3 B35 B3 B | B3 B35 B3 B | C3 C35 C3 C | F3CF35 F3CF |2 3C37 3C2 |3 3C35 3C3 |3 3C35 3C3 |3 3C35 3C3 |4 3C33 3C4 |4 3C33 3C4 |5 3C31 3C5 |5 3C31 3C5 |6 3C29 3C6 |7 3C27 3C7 |8 3C25 3C8 |9 3C23 3C9 |10 4C19 4C10 |11 5C15 5C11 |12 7C FC3BCF 7C12 |14 7C5 7C14 |16 5C5 5C16 |19 2C5 2C19 |20 FC3BCF20 |47 /47 |47 |20 F5CF20 |20 FCIBICF20 |20 F5CF20 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |2 3F37 3F2 |2 3C37 3C2 |2 CIC37 CIC2 |2 CBC37 CBC2 |2 CIC37 CIC2 |2 3C37 3C2 |2 3F37 3F2 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |47 |20 F5CF20 |20 FCIBICF20 |20 F5CF20 |47 |47 "), kinds: {"H":"g1","C":"gLuVSide","B":"glass","I":"glass","E":"gLuVSide","F":"gFrameNaquadahalloy","D":"gLuVSide","~":"gCompactFusionReactorController"} },
  },
  {
    slug: "flotation-cell-regulator",
    name: "Flotation Cell Regulator",
    title: "Регулятор флотационной камеры",
    tier: "luv",
    summary: "Делает пену металлов из размолотой руды — одну руду навсегда.",
    story: ["В игре по-русски — «Регулятор флотационной камеры». Он делает пену металлов из размолотой руды, соснового масла и ксантогената; потом пена идёт в вакуумную печь или Утупу-Танури.","Камера навсегда запоминает первый рецепт и больше ничего не делает, зато хорошо масштабируется благодаря идеальному разгону."],
    facts: [{"label":"Размер","value":"11 × 5 × 11"},{"label":"Блоков","value":"185"},{"label":"Ярус в вики","value":"LuV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEFrothFlotationCell.java",
    def: { layers: unpackLayers("11 |11 |11 |11 |3 5E3 | 9E |3 5E3 |11 |11 |11 |11 /11 |11 |7 2B2 |6 3B2 | AE2 3BEA | E2 BEB2 E | AE3B2 EA |2 3B6 |2 2B7 |11 |11 /11 |11 |11 |7 B3 |A9 A|5 E5 |A9 A|3 B7 |11 |11 |11 /4 D~D4 |2 2D3 2D2 | D7 D | D7 D |D4 D4 D|D3 DED3 D|D4 D4 D| D7 D | D7 D |2 2D3 2D2 |4 3D4 /3 5C3 |2 7C2 | 9C |11C|11C|11C|11C|11C| 9C |2 7C2 |3 5C3 "), kinds: {"C":"gInconelReinforced","D":"gStableTalonite","E":"gInconelReinforced","A":"gFrameInconel_690","B":"gFrameStaballoy","~":"gFlotationCellRegulatorController"} },
  },
  {
    slug: "extreme-heat-exchanger",
    name: "Extreme Heat Exchanger",
    title: "Экстремальный теплообменник",
    tier: "luv",
    summary: "Теплообменник, который даёт сверхкритический пар, а из плазмы — плотный.",
    story: ["Экстремальный теплообменник кипятит дистиллированную воду в перегретый пар теплом лавы, хладагента, солнечной соли или плазмы. Выше порога выходит сверхкритический пар, а плазма всегда даёт плотный сверхкритический.","Энергии и топлива он не тратит, но без воды взрывается."],
    facts: [{"label":"Размер","value":"5 × 6 × 11"},{"label":"Блоков","value":"306"},{"label":"Ярус в вики","value":"LuV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/goodgenerator/blocks/tileEntity/MTEExtremeHeatExchanger.java",
    def: { layers: unpackLayers(" 3C |5T|5T|5T|5T|5T|5T|5T|5T|5T| 3C / 3C |G3PG|G3WG|G3PG|G3WG|G3PG|G3WG|G3PG|G3WG|G3PG| 3C / CFC |G3PG|G3WG|G3PG|G3WG|G3PG|G3WG|G3PG|G3WG|G3PG| CEC / 3C |G3PG|G3WG|G3PG|G3WG|G3PG|G3WG|G3PG|G3WG|G3PG| 3C / 3C |G3PG|G3WG|G3PG|G3WG|G3PG|G3WG|G3PG|G3WG|G3PG| 3C / C~C |5B|5B|5B|5B|5B|5B|5B|5B|5B| 3C "), kinds: {"B":"gRobustTungstensteel","T":"gRobustTungstensteel","F":"gRobustTungstensteel","E":"gRobustTungstensteel","C":"gRobustTungstensteel","G":"glass","P":"gPipeTungstensteel","W":"gPressureResistantWal","~":"gExtremeHeatExchangerController"} },
  },
  {
    slug: "industrial-arc-furnace",
    name: "Industrial Arc Furnace",
    title: "Промышленная дуговая печь",
    tier: "luv",
    summary: "Дуговая печь до 1 000 % скорости и до 1 024 рецептов — по электроду в люке.",
    story: ["В игре по-русски — «Промышленная дуговая печь». Она плавит и разбирает материалы электрической дугой до десяти раз быстрее одноблочной печи и до 1 024 рецептов сразу.","Бонусы задаёт электрод в люке электрода; он постепенно изнашивается и требует замены."],
    facts: [{"label":"Размер","value":"17 × 11 × 19"},{"label":"Блоков","value":"612"},{"label":"Ярус в вики","value":"LuV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/kubatech/tileentity/gregtech/multiblock/MTEIndustrialArcFurnace.java",
    def: { layers: unpackLayers("17 |17 |17 |17 |5 3D9 |4 D3 D8 |4 D3 D8 |4 D3 D8 |5 3D9 |5 D D9 |5 D D9 |5 D D9 |5 D D9 |5 D D9 |5 D D9 |5 D D9 |5 D D9 |5 3D9 |17 /17 |17 |17 |17 |17 |5 IDI9 |5 D D9 |5 DID9 |6 D10 |6 D10 |6 D10 |6 D10 |6 D10 |6 D10 |6 D10 |4 A D A8 |4 AD DA8 |17 |5 D D9 /17 |17 |17 |17 |17 |5 I I9 |17 |6 I10 |17 |17 |17 |17 |14 E2 |13 EDE |14 E2 |4 A3 A8 |4 2D 2D8 |4 A3 A8 |5 DHD9 /17 |17 |17 |17 |17 |5 I I9 |17 |6 I10 |17 |17 |17 |6 F10 |6 2F6 E2 |7 6FE E |14 E2 |4 A3 A8 |4 2D 2D8 |4 A3 A8 |5 3H9 /17 |17 |17 |6 B10 |4 5B8 |4 BI IB8 |3 2B3 2B7 |4 2BI2B8 |4 5B8 |17 |6 F10 |6 F10 |13 DED |13 E E |13 DED |4 A3 A8 |4 2D 2D8 |4 A3 A8 |5 3H9 /17 |4 5E8 |3 2E3B2E7 |2 E3B 3BE6 | 2EB5 B2E5 | E2B I I 2BE5 | EB7 BE5 | E2B2 I2 2BE5 | 2EB5 B2E5 |2 E7BE6 |3 2EBFB2E7 |4 5E8 |13 DED |13 E E |13 DED |4 A3 A8 |4 2D 2D8 |4 A3 A8 |5 3H9 /4 D3 D8 |3 2ABAB2A7 |2 A7 A6 | A9 A5 |DA9 AD4 | B9 B5 | C9 C5 | B9 B5 |DA9 AD4 | A9 A5 |2 A7 A6 |3 2ABCB2A7 |4 D3 D4 DED |13 E E |13 DED |4 A3 A8 |4 2D 2D8 |4 A3 A8 |5 3H9 /4 D3 D8 |3 GAB~BAG7 |2 G7 G6 | G9 G5 |DA9 AD4 | B9 B5 | C9 C5 | B9 B5 |DA9 AD4 | G9 G5 |2 G7 G6 |3 GABCBAG7 |4 D3 D4 DED |13 E E |13 DED |4 A3 A8 |4 2D 2D8 |4 A3 A8 |5 3H9 /4 D3 D8 |3 2ABAB2A7 |2 A7 A6 | A9 A5 |DA9 AD4 | B9 B5 | C9 C5 | B9 B5 |DA9 AD4 | A9 A5 |2 A7 A6 |3 2ABCB2A7 |4 D3 D4 DED |13 E E |4 A3 A4 DED |4 A3 A8 |4 2D 2D8 |4 A3 A8 |5 DHD9 /4 D3 D8 |4 A3 A8 |3 7A7 |2 4A 4A6 |D4AC C4AD4 |2 2A2C 2C2A6 |2 3C3 3C6 |2 2A2C 2C2A6 |D4A3C4AD4 |2 4AC4A6 |3 3AC3A7 |4 A3 A4 3B |4 D3 D3 B3EB|12 BE EB|4 A3 A3 B3EB|4 A3 A4 3B |4 2D 2D8 |4 A3 A8 |4 A3DA8 /4 D3 D8 |2 2DA3 A2D6 | D3 3A3 D5 | D4 A4 D5 |DA4 A4 AD4 |D5 A5 D4 |D4 3A4 D4 |D5 A5 D4 |DA9 AD4 | D9 D5 | D9 D5 |2 2DA3 A2D2 3B |4 D3 D3 B3 B|12 B3 B|4 A3 A3 B3 B|4 A3 A4 3B |4 AD DA8 |4 A3 A8 |4 A3DA8 "), kinds: {"A":"gSolidSteel","B":"gPipeSteel","C":"gCoilHssg","D":"gFrameSteel","E":"gBw176176186","F":"gInsulatedFluidPipe","G":"gFireboxSteel","H":"gFireboxStaballoy","I":"gRefinedGraphite","~":"gIndustrialArcFurnaceController"} },
  },
  {
    slug: "isamill",
    name: "IsaMill Grinding Machine",
    title: "IsaMill шлифовальная установка",
    tier: "luv",
    summary: "Размалывает руду в тонкий порошок для флотационной камеры.",
    story: ["В игре по-русски — «IsaMill шлифовальная установка». Она размалывает руду — блоками, сырой или дроблёной — в тонкий порошок для регулятора флотационной камеры.","Ей нужен хотя бы один размольный шар в корпусе для шаров; шары изнашиваются, поэтому включайте пакетный режим."],
    facts: [{"label":"Размер","value":"3 × 3 × 7"},{"label":"Блоков","value":"63"},{"label":"Ярус в вики","value":"LuV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/processing/MTEIsaMill.java",
    def: { layers: unpackLayers("3D|3C|3C|3C|3C|3C|3C/D~D|CGC|CGC|CGC|CGC|CGC|3C/3D|3C|3C|3C|3C|3C|3C"), kinds: {"C":"gPipeT1","D":"gGrindingFactory","G":"gGearboxT1","~":"gIsamillController"} },
  },
  {
    slug: "industrial-autoclave",
    name: "Industrial Autoclave",
    title: "Промышленный автоклав",
    tier: "luv",
    summary: "Автоклав, который ускоряют катушки, а трубные корпуса дают экономию и параллели.",
    story: ["В игре по-русски — «Промышленный автоклав». Каждый уровень катушек даёт ему 25 % скорости, каждый уровень трубных корпусов — 8,33 % экономии энергии, а предметные трубные корпуса — по 12 параллелей за уровень.","Для разных схем в одной машине включите разделение входов."],
    facts: [{"label":"Размер","value":"7 × 7 × 9"},{"label":"Блоков","value":"265"},{"label":"Ярус в вики","value":"LuV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEMultiAutoclave.java",
    def: { layers: unpackLayers("2 3A2 |2 AFA2 |2 AFA2 |2 AFA2 |2 AFA2 |2 AFA2 |2 AFA2 |2 AFA2 |2 3A2 / A3BA | 2A 2A | A3 A | A3 A | A3 A | A3 A | A3 A | 2A 2A | A3BA /A5BA|A C C A|A C C A|A C C A|A C C A|A C C A|A C C A|A C C A|A5BA/A5BA|ACDEDCA|ACDEDCA|ACDEDCA|ACDEDCA|ACDEDCA|ACDEDCA|ACDEDCA|A5BA/A5BA|A C C A|A C C A|A C C A|A C C A|A C C A|A C C A|A C C A|A5BA/2A3B2A| 2A 2A | A3 A | A3 A | A3 A | A3 A | A3 A | 2A 2A |2A3B2A/A A~A A|2 3A2 |2 3A2 |2 3A2 |2 3A2 |2 3A2 |2 3A2 |2 3A2 |A 3A A"), kinds: {"A":"gAutoclave","B":"glass","C":"gFramePolytetrafluoroethylene","D":"gPipeBronze","E":"gItemPipeTin","F":"gCoilHssg","~":"gIndustrialAutoclaveController"} },
  },
  {
    slug: "molecular-transformer",
    name: "Molecular Transformer",
    title: "Молекулярный преобразователь",
    tier: "luv",
    summary: "Перестраивает молекулы: 18 рецептов «один в один», только за энергию.",
    story: ["В игре по-русски — «Молекулярный преобразователь». Он меняет молекулярное строение предметов: у него 18 рецептов, каждый превращает один предмет в другой и требует только энергии.","Чаще всего в нём делают санарий из светопыли, хотя пчёлы и реакторы — источники куда лучше."],
    facts: [{"label":"Размер","value":"7 × 9 × 7"},{"label":"Блоков","value":"189"},{"label":"Ярус в вики","value":"LuV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIndustrialMolecularTransformer.java",
    def: { layers: unpackLayers("2 3C2 | 5C |7C|7C|7C| 5C |2 3C2 /3 C3 |2 3C2 | 2CD2C |CB3DBC| 2CD2C |2 3C2 |3 C3 /7 |3 A3 |2 ADA2 | B3DB |2 ADA2 |3 A3 |7 /7 |3 A3 |2 ADA2 | B3DB |2 ADA2 |3 A3 |7 /7 |3 A3 |2 ADA2 | B3DB |2 ADA2 |3 A3 |7 /7 |3 A3 |2 ADA2 | B3DB |2 ADA2 |3 A3 |7 /7 |3 A3 |2 ADA2 | B3DB |2 ADA2 |3 A3 |7 /3 ~3 |2 3C2 | 2CD2C |CB3DBC| 2CD2C |2 3C2 |3 C3 /2 3C2 | 5C |7C|7C|7C| 5C |2 3C2 "), kinds: {"C":"gMolecularContainment","A":"glass","B":"gIridium","D":"gSpeedingPipeSide","~":"gMolecularTransformerController"} },
  },
  {
    slug: "ozonation-purification-unit",
    name: "Ozonation Purification Unit",
    title: "Установка очистки воды озонированием",
    tier: "luv",
    summary: "Второй шаг линии очистки воды: много озона на каждый цикл.",
    story: ["В игре по-русски — «Установка очистки воды озонированием». Это второй шаг линии очистки воды.","Ей нужно очень много озона, и производить его надо быстрее, чем идёт её цикл в 120 секунд."],
    facts: [{"label":"Размер","value":"9 × 10 × 5"},{"label":"Блоков","value":"149"},{"label":"Ярус в вики","value":"LuV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/purification/MTEPurificationUnitOzonation.java",
    def: { layers: unpackLayers("9 |6 A2 |5 3A |6 A2 |9 /9 |6 A2 |5 A A |6 A2 |9 /6 A2 |5 A A |4 A3 A|5 A A |6 A2 /6 A2 |5 A A |4 A3 A|5 A A |6 A2 /5 3A |4BA3 A|B2DBA3 A|4BA3 A|5 3A /5 3A |B2DBA3 A|O2 BA3 A|B2DBA3 A|5 3A /5 A A |4BA D A|4BA3 A|4BA3 A|5 3A /5 A A |E3 A D A|2 C A3 A|E3 A3 A|5 3A /5 A A |E3 A D A|2 2CA3 A|E3 A3 A|5 3A /5 A~A |E3 5A|4 5A|E3 5A|5 3A "), kinds: {"A":"gOzone","B":"gHighPressureResistan","C":"gPipePolytetrafluoroet","D":"glass","E":"gFrameTungstensteel","O":"gHighPressureResistan","~":"gOzonationPurificationUnitController"} },
  },
  {
    slug: "planetary-gas-siphon",
    name: "Planetary Gas Siphon",
    title: "Планетарный газовый сифон",
    tier: "luv",
    summary: "Бесконечно качает газы газовых гигантов с космической станции.",
    story: ["Планетарный газовый сифон бесконечно добывает газ из газовых гигантов — Юпитера, Сатурна, Урана и Нептуна. Он похож на нефтяную вышку, только работает с космической станции над планетой.","У каждого гиганта четыре газа; один сифон качает один, газ выбирают программной схемой."],
    facts: [{"label":"Размер","value":"13 × 23 × 13"},{"label":"Блоков","value":"300"},{"label":"Ярус в вики","value":"LuV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtnhintergalactic/tile/multi/MTEPlanetaryGasSiphon.java",
    def: { layers: unpackLayers("13 |13 |4 5C4 |3 C2 B2 C3 |2 C3 B3 C2 |2 C3 B3 C2 |2 C7BC2 |2 C3 B3 C2 |2 C3 B3 C2 |3 C2 B2 C3 |4 5C4 |13 |13 /13 |13 |13 |13 |13 |6 C6 |5 3C5 |6 C6 |13 |13 |13 |13 |13 /13 |13 |13 |13 |13 |6 C6 |5 3C5 |6 C6 |13 |13 |13 |13 |13 /13 |13 |13 |13 |13 |5 3C5 |5 C C5 |5 3C5 |13 |13 |13 |13 |13 /13 |13 |13 |13 |13 |5 3C5 |5 C C5 |5 3C5 |13 |13 |13 |13 |13 /13 |13 |13 |13 |13 |5 3C5 |5 C C5 |5 3C5 |13 |13 |13 |13 |13 /13 |13 |13 |13 |4 B3 B4 |5 3C5 |5 C C5 |5 3C5 |4 B3 B4 |13 |13 |13 |13 /6 C6 |13 |13 |13 |4 B3 B4 |5 C~C5 |C4 C C4 C|5 3C5 |4 B3 B4 |13 |13 |13 |6 C6 /6 C6 |13 |13 |13 |4 B3 B4 |5 3C5 |C4 C C4 C|5 3C5 |4 B3 B4 |13 |13 |13 |6 C6 /3 3CA3C3 |2 C3 B3 C2 | C4 B4 C |C5 B5 C|C3 B B B3 C|C4 3C4 C|A4BC C4BA|C4 3C4 C|C3 B B B3 C|C5 B5 C| C4 B4 C |2 C3 B3 C2 |3 3CA3C3 /5 CAC5 |13 |13 |13 |4 B3 B4 |C4 BCB4 C|A4 3C4 A|C4 BCB4 C|4 B3 B4 |13 |13 |13 |5 CAC5 /5 CAC5 |13 |13 |13 |4 B3 B4 |C4 BCB4 C|A4 3C4 A|C4 BCB4 C|4 B3 B4 |13 |13 |13 |5 CAC5 /6 C6 |13 |13 |13 |4 B3 B4 |5 BCB5 |C4 3C4 C|5 BCB5 |4 B3 B4 |13 |13 |13 |6 C6 /6 C6 |13 |13 |13 |4 B3 B4 |6 C6 |C4 3C4 C|6 C6 |4 B3 B4 |13 |13 |13 |6 C6 /13 |13 |13 |13 |4 B3 B4 |6 C6 |5 3C5 |6 C6 |4 B3 B4 |13 |13 |13 |13 /13 |13 |13 |13 |4 B3 B4 |6 C6 |5 3C5 |6 C6 |4 B3 B4 |13 |13 |13 |13 /13 |13 |13 |13 |13 |6 C6 |5 3C5 |6 C6 |13 |13 |13 |13 |13 /13 |13 |13 |13 |13 |6 B6 |5 BDB5 |6 B6 |13 |13 |13 |13 |13 /13 |13 |13 |13 |13 |6 B6 |5 BDB5 |6 B6 |13 |13 |13 |13 |13 /13 |13 |13 |13 |13 |6 B6 |5 BDB5 |6 B6 |13 |13 |13 |13 |13 /13 |13 |13 |13 |13 |13 |6 D6 |13 |13 |13 |13 |13 |13 /13 |13 |13 |13 |13 |13 |6 D6 |13 |13 |13 |13 |13 |13 /13 |13 |13 |13 |13 |13 |6 D6 |13 |13 |13 |13 |13 |13 "), kinds: {"B":"gFrameTungstensteel","D":"gBwadv160160170","C":"gSiphon","A":"gCoilHssg","~":"gPlanetaryGasSiphonController"} },
  },
  {
    slug: "sparge-tower",
    name: "Sparge Tower",
    title: "Барботажная башня",
    tier: "luv",
    summary: "Извлекает редкие газы из отработанных солей реактора ЖФТР.",
    story: ["В игре по-русски — «Барботажная башня». Она извлекает редкие жидкости из отработанных расплавленных солей реактора ЖФТР — как ректификационная колонна фиксированной высоты: входы внизу, по выходу на каждом слое выше.","U-соль продувают гелием — выходят все благородные газы; T-соль — фтором."],
    facts: [{"label":"Размер","value":"3 × 8 × 3"},{"label":"Блоков","value":"66"},{"label":"Ярус в вики","value":"LuV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/processing/MTESpargeTower.java",
    def: { layers: unpackLayers("3l|3l|3l/3l|l l|3l/3l|l l|3l/3l|l l|3l/3l|l l|3l/3l|l l|3l/3l|l l|3l/b~b|3b|3b"), kinds: {"b":"gSpargeTowerExterior","l":"gSpargeTowerExterior","~":"gSpargeTowerController"} },
  },
  {
    slug: "utupu-tanuri",
    name: "Utupu-Tanuri",
    title: "Утупу-Танури",
    tier: "luv",
    summary: "Вакуумная печь-сушилка: идеальные разгоны за каждые 1 800 K нагрева.",
    story: ["В игре по-русски — «Утупу-Танури». Он сушит продукты, выделяет кристаллы минералов и выпаривает воду из жидкостей в 2,2 раза быстрее одноблочного дегидратора и за половину энергии, по 4 рецепта сразу.","Каждые 900 K нагрева сверх рецепта дают 5 % экономии, каждые 1 800 K — идеальный разгон."],
    facts: [{"label":"Размер","value":"3 × 5 × 3"},{"label":"Блоков","value":"42"},{"label":"Ярус в вики","value":"LuV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/processing/MTEIndustrialDehydrator.java",
    def: { layers: unpackLayers("3C|3C|3C/3H|H H|3H/3H|H H|3H/3H|H H|3H/C~C|3C|3C"), kinds: {"C":"gVacuumCasingSide","H":"gCoilHssg","~":"gUtupuTanuriController"} },
  },
  {
    slug: "whakawhiti-wera-xl",
    name: "Whakawhiti Wera XL",
    title: "XL Теплообменник",
    tier: "luv",
    summary: "Большой теплообменник в виде башни — для энергии из горячих жидкостей.",
    story: ["В игре по-русски — «XL Теплообменник», в вики — Whakawhiti Wera XL. Он кипятит дистиллированную воду в пар теплом лавы, хладагента или солнечной соли; выше порога выходит перегретый пар.","Энергии и топлива он не тратит, вся горячая жидкость возвращается остывшей. Без воды взрывается."],
    facts: [{"label":"Размер","value":"5 × 9 × 5"},{"label":"Блоков","value":"163"},{"label":"Ярус в вики","value":"LuV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/processing/advanced/MTEAdvHeatExchanger.java",
    def: { layers: unpackLayers(" 3c |c3Cc|c3Cc|c3Cc| 3c / 3c |c3Pc|c3Pc|c3Pc| 3c / 3c |c3Pc|c3Pc|c3Pc| 3c / 3c |c3Pc|c3Pc|c3Pc| 3c / 3c |c3Pc|c3Pc|c3Pc| 3c / c~c |c3Pc|c3Pc|c3Pc| 3c / 3h |h3Hh|h3Hh|h3Hh| 3h / f f |f3 f|5 |f3 f| f f / f f |f3 f|5 |f3 f| f f "), kinds: {"P":"gPipeTungstensteel","f":"gStableTalonite","C":"gStableTalonite","H":"gStableTalonite","h":"gStableTalonite","c":"gStableTalonite","~":"gWhakawhitiWeraXlController"} },
  },
  {
    slug: "xl-turbo-gas-turbine",
    name: "XL Turbo Gas Turbine",
    title: "XL Турбогазовая турбина",
    tier: "luv",
    summary: "Газовая турбина с 12 роторами и в 16 раз мощнее большой.",
    story: ["В игре по-русски — «XL Турбогазовая турбина». Она пропускает в 16 раз больше газа, чем большая газовая турбина, всего с 12 турбинами, берёт многоамперные и лазерные динамо-люки и не взрывается, если сломать динамо-люк на ходу.","Все турбины должны быть одинаковыми, а штрафы за неточный поток строже."],
    facts: [{"label":"Размер","value":"9 × 9 × 26"},{"label":"Блоков","value":"657"},{"label":"Ярус в вики","value":"LuV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/xlturbines/MTEXLTurbineGas.java",
    def: { layers: unpackLayers("9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |3 G G3 |3 3G3 |2 5G2 |2 2GA2G2 |2 G3AG2 |2 G3AG2 |2 G3AG2 |2 G3AG2 |2 G3AG2 |2 2GA2G2 |2 5G2 | 7G | 7G /3 3G3 |3 3G3 |4 G4 |9 |9 |9 |9 |9 |3 3G3 |3 G G3 |3 G G3 |3 G G3 |3 3G3 |2 G G G2 | 2G3 2G | E5 E | E5 E | E5 E | E5 E | E5 E | ED3 DE | E5 E | ED3 DE | E5 E |G7 G|G7 G/2 G3EG2 |2 GD2 G2 |3 3G3 |3 3G3 |3 3A3 |3 3A3 |3 3A3 |3 3G3 |2 5G2 |2 E E E2 |2 E E E2 |2 E E E2 |2 G3 G2 | G5 G | G5 G |G7 G|G2 D4 G|G7 G|G4 D2 G|G7 G|G3D2 2DG|G7 G|G2D2 3DG|G7 G|G7 G|G7 G/ G5EG | G2 D DG |2 G B G2 |2 G B G2 |2 A B A2 |2 A3 A2 |2 A B A2 |2 G B G2 | 2G3 2G | G5 G | G2 D2 G | G5 G | G2 D2 G |G7 G|G3 D3 G|G7 G|G3 D D G|A7 A|A D D3 A|A7 A|A2 D 2D A|A7 A|G 2D D2 G|G7 G|G7 G|G7 G/ G2E~2EG | G DFD G | 2GBFB2G |2 GBFBG2 |2 ABFBA2 |2 A F A2 |2 ABFBA2 |2 GBFBG2 | 2G F 2G |2 E F E2 |2 EDCDE2 |2 E F E2 | G DCD G | G2 F2 G |G2 DCD2 G|G3 F3 G|A2 DCD2 A|A3 F3 A|A2 DCD2 A|A3 F3 A|A3 C3 A|A3 F3 A|A3 C3 A|G3 F3 G|G7 G|G7 G/ G5EG | GD D2 G |2 G B G2 |2 G B G2 |2 A B A2 |2 A3 A2 |2 A B A2 |2 G B G2 | 2G3 2G | G5 G | G2 D2 G | G5 G | G2 D2 G |G7 G|G3 D3 G|G7 G|G D D3 G|A7 A|A3 D D A|A7 A|A 2D D2 A|A7 A|G2 D 2D G|G7 G|G7 G|G7 G/2 G3EG2 |2 G2 DG2 |2 4G3 |3 3G3 |3 3A3 |3 3A3 |3 3A3 |3 3G3 |2 5G2 |2 E E E2 |2 E E E2 |2 E E E2 |2 G3 G2 | G5 G | G5 G |G7 G|G4 D2 G|G7 G|G2 D4 G|G7 G|G2D2 3DG|G7 G|G3D2 2DG|G7 G|G7 G|G7 G/3 3G3 |3 3G3 |4 G4 |9 |9 |9 |9 |9 |3 3G3 |3 G G3 |3 G G3 |3 G G3 |3 3G3 |2 G G G2 | 2G3 2G | E5 E | E5 E | E5 E | E5 E | E5 E | ED3 DE | E5 E | ED3 DE | E5 E |G7 G|G7 G/9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |3 G G3 |3 3G3 |2 5G2 |2 2GA2G2 |2 G3AG2 |2 G3AG2 |2 G3AG2 |2 G3AG2 |2 G3AG2 |2 2GA2G2 |2 5G2 | 7G | 7G "), kinds: {"A":"glass","B":"gMvSideCyclotronSole","C":"gGearboxSteel","D":"gPipeSteel","E":"gFrameStainlesssteel","F":"gRedoxEv","G":"gTurbineStainlesssteel","~":"gXlTurboGasTurbineController"} },
  },
  {
    slug: "water-purification-plant",
    name: "Water Purification Plant",
    title: "Водоочистная станция",
    tier: "luv",
    summary: "Сердце линии очистки воды: раздаёт энергию установкам и синхронизирует их циклы.",
    story: ["В игре по-русски — «Водоочистная станция». Сама она рецептов не ведёт: раздаёт энергию установкам очистки и запускает их всех одним циклом в 120 секунд.","Установки привязывают к станции, и вода проходит через них ступень за ступенью — от грубой фильтрации до барионного совершенства."],
    facts: [{"label":"Размер","value":"7 × 9 × 8"},{"label":"Блоков","value":"244"},{"label":"Ярус в вики","value":"LuV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/purification/MTEPurificationPlant.java",
    def: { layers: unpackLayers("7 |7 | G3 G |2 3B2 |2 B B2 |2 3B2 | G3 G |7 /7 |7 | G3 G |2 3B2 |2 B B2 |2 3B2 | G3 G |7 /7 |7 | G3 G |2 3B2 |2 B B2 |2 3B2 | G3 G |7 /2 GBG2 |2 GBG2 | 2GB2G |2 3B2 |2 B B2 |2 3B2 | G3 G |7 /2 GHG2 |7B|B5CB|B5CB|B5CB|B5CB|B5CB|7B/2 GHG2 |B5CB|C5 C|C5 C|C5 C|C5 C|C5 C|B5CB/2 G~G2 |B5CB|C5 C|D5 C|D5 C|D6 |C5 C|BC3DCB/2 GHG2 |B5CB|C5 C|C5 C|C5 C|C6 |C5 C|B5CB/7A|7A|7A|7A|7A|7A|7A|7A"), kinds: {"A":"gIndustrialStrengthCo","B":"gIndustrialWaterPlant","C":"gWaterPlantConcrete","D":"glass","G":"gFrameTungsten","H":"gIndustrialWaterPlant","~":"gWaterPurificationPlantController"} },
  },
  {
    slug: "active-transformer",
    name: "Active Transformer",
    title: "Активный трансформатор",
    tier: "zpm",
    summary: "Переводит энергию с любого напряжения на любое — почти без предела по току.",
    story: ["В игре по-русски — «Активный трансформатор». Он переводит энергию с любого яруса напряжения на любой другой, и сила тока у него почти не ограничена: подходят многоамперные и лазерные люки.","Единственный минус — теряется 0,004 % проходящей энергии."],
    facts: [{"label":"Размер","value":"3 × 3 × 3"},{"label":"Блоков","value":"27"},{"label":"Ярус в вики","value":"ZPM"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/tectech/thing/metaTileEntity/multi/MTEActiveTransformer.java",
    def: { layers: unpackLayers("3a|3a|3a/a~a|aba|3a/3a|3a|3a"), kinds: {"~":"gActiveTransformerController","a":"gEmPower","b":"gSolidSteel"} },
  },
  {
    slug: "data-bank",
    name: "Data Bank",
    title: "Банк данных",
    tier: "zpm",
    summary: "Хранит флешки рецептов для сборочных линий и раздаёт их по оптоволокну.",
    story: ["В игре по-русски — «Банк данных». Он раздаёт флешки с рецептами сборочным линиям по оптоволоконным кабелям через приёмные разъёмы.","Обычная постройка держит 14 люков доступа к данным — 224 флешки, а цепочкой банков можно сколько угодно. При таком числе рецептов сборочной линии банк практически обязателен."],
    facts: [{"label":"Размер","value":"5 × 3 × 3"},{"label":"Блоков","value":"45"},{"label":"Ярус в вики","value":"ZPM"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/tectech/thing/metaTileEntity/multi/MTEDataBank.java",
    def: { layers: unpackLayers("B3CB|B3DB|B3DB/BC~CB|B3AB|B3DB/B3CB|B3DB|B3DB"), kinds: {"A":"gEmPc","B":"gEmPcVent","C":"gEmPower","D":"gEmPc","~":"gDataBankController"} },
  },
  {
    slug: "energy-infuser",
    name: "Energy Infuser",
    title: "Наполнитель энергии",
    tier: "zpm",
    summary: "Заряжает и чинит снаряжение сразу; починка — за энергию и UU-материю.",
    story: ["В игре по-русски — «Наполнитель энергии». Он одновременно заряжает и чинит снаряжение. Зарядка идёт так быстро, как позволяют энергетические люки, и без потерь.","Починка — до 1 000 единиц прочности за тик, за 1 000 EU и 1 литр UU-материи на каждую единицу."],
    facts: [{"label":"Размер","value":"3 × 5 × 3"},{"label":"Блоков","value":"45"},{"label":"Ярус в вики","value":"ZPM"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/tectech/thing/metaTileEntity/multi/MTEEnergyInfuser.java",
    def: { layers: unpackLayers("3C|3C|3C/3B|BAB|3B/A~A|3A|3A/3B|BAB|3B/3C|3C|3C"), kinds: {"A":"gEm","B":"gEmCoil","C":"gEmPower","~":"gEnergyInfuserController"} },
  },
  {
    slug: "flocculation-purification-unit",
    name: "Flocculation Purification Unit",
    title: "Установка флоккуляционной очистки воды",
    tier: "zpm",
    summary: "Третий шаг очистки воды: точная дозировка полиалюминия хлорида.",
    story: ["В игре по-русски — «Установка флоккуляционной очистки воды». Это третий шаг линии очистки воды: она постоянно тратит полиалюминия хлорид, и дозировка должна быть точной, иначе шанс успеха резко падает.","Весь израсходованный хлорид превращается в отходы флокуляции, которые можно переработать обратно."],
    facts: [{"label":"Размер","value":"9 × 5 × 8"},{"label":"Блоков","value":"139"},{"label":"Ярус в вики","value":"ZPM"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/purification/MTEPurificationUnitFlocculation.java",
    def: { layers: unpackLayers("9 |9 |9 |9 |9 |9 |D7 D|2D5 2D/9 |9 |9 |9 |9 | 2E3 2E |D2E3 2ED|2D5 2D/ 7B | B5 B | B5 B | B5 B | B5 B | BE3 EB |D7BD|2D5 2D/ 3B~3B | B5 B | G5 G | G5 G | G5 G | BE3 EB |D7BD|2D5 2D/ 7B | B5CB | BC3ACB | BC3ACB | BC3ACB | B5CB |D7BD|2D5 2D"), kinds: {"A":"gVent","B":"gFlocculation","C":"gWaterPlantConcrete","D":"gIndustrialWaterPlant","E":"gFrameAdamantium","G":"glass","~":"gFlocculationPurificationUnitController"} },
  },
  {
    slug: "elemental-duplicator",
    name: "Elemental Duplicator",
    title: "Элементальный дубликатор",
    tier: "zpm",
    summary: "Репликатор вдвое быстрее, с бесконечными идеальными разгонами.",
    story: ["В игре по-русски — «Элементальный дубликатор». Он копирует редкие материалы из UU-материи вдвое быстрее одноблочного репликатора и по 8 рецептов за ярус.","Разгоны у него идеальные и без предела, так что он хорошо масштабируется."],
    facts: [{"label":"Размер","value":"9 × 9 × 6"},{"label":"Блоков","value":"278"},{"label":"Ярус в вики","value":"ZPM"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/production/MTEElementalDuplicator.java",
    def: { layers: unpackLayers("3 3c3 |3 cac3 |3 cec3 |3 cec3 |3 cac3 |3 3c3 /2 5c2 |2 abfba2 |2 e3 e2 |2 e3 e2 |2 abfba2 |2 5c2 / 7c | abfgfba | e5 e | e5 e | abfgfba | 7c /9c|cbfgdgfbc|c3 d3 c|c3 d3 c|cbfgdgfbc|9c/4c~4c|afg3dgfa|e2 3d2 e|e2 3d2 e|afg3dgfa|9c/9c|cbfgdgfbc|c3 d3 c|c3 d3 c|cbfgdgfbc|9c/ 7c | abfgfba | e5 e | e5 e | abfgfba | 7c /2 5c2 |2 abfba2 |2 e3 e2 |2 e3 e2 |2 abfba2 |2 5c2 /3 3c3 |3 cac3 |3 cec3 |3 cec3 |3 cac3 |3 3c3 "), kinds: {"a":"gMatterFabricator","b":"gMatterGenerationCoil","d":"gRedoxUv","e":"gParticleContainment","f":"gResonanceChamberIii","g":"gModulator3","c":"gElementalConfinement","~":"gElementalDuplicatorController"} },
  },
  {
    slug: "hot-isostatic-pressurization-unit",
    name: "Hot Isostatic Pressurization Unit",
    title: "Установка для горячей изостатической опрессовки",
    tier: "zpm",
    summary: "Компрессор с жаром: в 3,5 раза быстрее, но может перегреться.",
    story: ["В игре по-русски — «Установка для горячей изостатической опрессовки» (HIP). Она сжимает материалы с сильным нагревом в 3,5 раза быстрее большого компрессора, за 75 % энергии и по 4 рецепта за ярус.","В работе она нагревается, в простое остывает. Если работать слишком долго, установка перегревается и замедляется."],
    facts: [{"label":"Размер","value":"15 × 10 × 7"},{"label":"Блоков","value":"265"},{"label":"Ярус в вики","value":"ZPM"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/compressor/MTEHIPCompressor.java",
    def: { layers: unpackLayers("15 |15 |15 | 6C 6D |15 |15 |15 /15 |15 |15 | C4 C D4 D |15 |15 |15 /15 |6 3H6 |5 5H5 | C3 5H3 D |5 5H5 |6 3H6 |15 /6 3B6 |5 5B5 |4 7B4 | C2 7B2 D |4 7B4 |5 5B5 |6 3B6 /6 3H6 |5 B3 B5 |4 BF3 FB4 | C2 BF3 FB2 D |4 BF3 FB4 |5 B3 B5 |6 3H6 /6 HAH6 |5 B3 B5 |4 GF3 FG4 | C2 GF3 FG2 D |4 GF3 FG4 |5 B3 B5 |6 HAH6 /6 HAH6 |5 B3 B5 | B2 GF3 FG2 B |3B GF3 FG 3B| B2 GF3 FG2 B |5 B3 B5 |6 HAH6 /6 HAH6 |5 B3 B5 | A2 GF3 FG2 A |A A GF3 FG A A| A2 GF3 FG2 A |5 B3 B5 |6 HAH6 /6 3H6 |5 B3 B5 | A2 BF3 FB2 A |A A BF3 FB A A| A2 BF3 FB2 A |5 B3 B5 |6 3H6 /6 B~B6 |5 5B5 | B2 7B2 B |3B 7B 3B| B2 7B2 B |5 5B5 |6 3B6 "), kinds: {"A":"glass","B":"gCompressor","C":"gCoolantDuct","D":"gHeatingDuct","F":"gCoilNaquadah","G":"gCompressorPipe","H":"gCompressorPipe","~":"gHotIsostaticPressurizationUnitController"} },
  },
  {
    slug: "large-scale-auto-assembler",
    name: "Large Scale Auto-Assembler v1.01",
    title: "Крупномасштабный авто-сборщик v1.01",
    tier: "zpm",
    summary: "Сборщик втрое быстрее, умеет пропускать ярусы рецепта.",
    story: ["В игре по-русски — «Крупномасштабный авто-сборщик v1.01». Он ведёт рецепты сборщика втрое быстрее одноблочного и по 2 за ярус.","По объёму он уступает точному автосборщику MT-3662; его плюс — рецепты можно вести с энергией через ярус."],
    facts: [{"label":"Размер","value":"3 × 3 × 3"},{"label":"Блоков","value":"26"},{"label":"Ярус в вики","value":"ZPM"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/production/MTEAutoCrafter.java",
    def: { layers: unpackLayers("3C|3C|3C/C~C|C C|3C/3C|3C|3C"), kinds: {"C":"gTop","~":"gLargeScaleAutoAssemblerController"} },
  },
  {
    slug: "linear-accelerator",
    name: "Linear Accelerator",
    title: "Линейный ускоритель",
    tier: "zpm",
    summary: "Разгоняет пучок частиц электрическим полем: длиннее — сильнее.",
    story: ["Линейный ускоритель разгоняет пучок частиц, пропуская его через электрическое поле: энергия пучка сильно растёт, фокус чуть падает, скорость не меняется.","Чем длиннее ускоритель и больше энергии, тем сильнее разгон. Длина — нечётная, от 19 до 83 блоков; здесь показана самая короткая."],
    facts: [{"label":"Размер","value":"7 × 7 × 19"},{"label":"Блоков","value":"914"},{"label":"Ярус в вики","value":"ZPM"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtnhlanth/common/tileentity/MTELINAC.java",
    def: { layers: unpackLayers("7g|7g|7c|2c3k2c|2c3k2c|2c3k2c|2c3k2c|2ckhk2c|2c3k2c|2c3k2c|2c3k2c|2ckhk2c|2c3k2c|2c3k2c|2c3k2c|2c3k2c|7c|7c|7c/g5bg|g5cg|c5vc|c5dc|cd3vdc|c5dc|cd3vdc|c5dc|cd3vdc|c5dc|cd3vdc|c5dc|cd3vdc|c5dc|cd3vdc|c5dc|c5vc|7c|c5bc/g5bg|g5cg|k5vk|kd3ydk|k5vk|kd3ydk|k5vk|kd3ydk|k5vk|kd3ydk|k5vk|kd3ydk|k5vk|kd3ydk|k5vk|kd3ydk|k5vk|7c|c5bc/g2bi2bg|g2c 2cg|k2v 2vk|kdy ydk|kdv vdk|kdy ydk|kdv vdk|kdy ydk|kdv vdk|kdy ydk|kdv vdk|kdy ydk|kdv vdk|kdy ydk|kdv vdk|kdy ydk|k2v 2vk|3c 3c|c2bo2bc/g5bg|g5cg|k5vk|kd3ydk|k5vk|kd3ydk|k5vk|kd3ydk|k5vk|kd3ydk|k5vk|kd3ydk|k5vk|kd3ydk|k5vk|kd3ydk|k5vk|7c|c5bc/g5bg|g5cg|c5vc|c5dc|cd3vdc|c5dc|cd3vdc|c5dc|cd3vdc|c5dc|cd3vdc|c5dc|cd3vdc|c5dc|cd3vdc|c5dc|c5vc|7c|c5bc/3g~3g|7g|j5cj|j5cj|j5cj|j5cj|j5cj|j5cj|7c|7c|7c|7c|7c|7c|7c|7c|7c|7c|7c"), kinds: {"c":"gShieldedAccelerator","g":"gGrate","b":"glass","i":"gGrate","o":"gGrate","v":"gElectrode","k":"glass","d":"gCoolantDelivery","y":"gSolidSteel","h":"gGrate","j":"gShieldedAccelerator","~":"gLinearAcceleratorController"} },
  },
  {
    slug: "source-chamber",
    name: "Source Chamber",
    title: "Камера источника",
    tier: "zpm",
    summary: "Первая постройка линии пучков: из особого сырья рождается пучок частиц.",
    story: ["Камера источника рождает пучок субатомных частиц из особых твёрдых или жидких веществ. Сырьё решает всё: тип частиц, энергию, фокус и интенсивность пучка.","Камера же и разгоняет пучок — тем сильнее, чем выше напряжение. Дальше пучок идёт в линейный ускоритель."],
    facts: [{"label":"Размер","value":"5 × 5 × 6"},{"label":"Блоков","value":"130"},{"label":"Ярус в вики","value":"ZPM"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtnhlanth/common/tileentity/MTESourceChamber.java",
    def: { layers: unpackLayers("5c|c3kc|c3kc|c3kc|c3kc|5c/c3kc|k3ek|k3 k|k3 k|k3ek|c3kc/ckikc|ke ek|k3 k|k3 k|ke ek|ckbkc/c3kc|k3ek|k3 k|k3 k|k3ek|c3kc/2d~2d|2co2c|5c|5c|5c|5c"), kinds: {"c":"gShieldedAccelerator","k":"glass","e":"gElectrode","b":"gShieldedAccelerator","i":"gShieldedAccelerator","o":"gShieldedAccelerator","d":"gShieldedAccelerator","~":"gSourceChamberController"} },
  },
  {
    slug: "synchrotron",
    name: "Synchrotron",
    title: "Синхротрон",
    tier: "zpm",
    summary: "Разгоняет пучок по кругу, пока он не начнёт излучать фотоны.",
    story: ["Синхротрон разгоняет пучок частиц по кольцу, пока быстрые частицы не начнут излучать фотоны. Получается фотонный пучок — именно он нужен всем рецептам линии пучков, и его интенсивность задаёт скорость рецептов.","Лучшие антенные корпуса держат энергию пучка высокой."],
    facts: [{"label":"Размер","value":"36 × 7 × 34"},{"label":"Блоков","value":"1 904"},{"label":"Ярус в вики","value":"ZPM"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtnhlanth/common/tileentity/MTESynchrotron.java",
    def: { layers: unpackLayers("36 |36 |36 |11 11c14 |9 15c12 |2 3c2 18c11 |2 12c5 7c10 |2 9c11 5c9 |2 8c13 5c8 |2 7c15 5c7 |2 6c17 5c6 |2 5c19 4c6 |2 4c21 3c6 |2 4c21 4c5 |2 4c21 4c5 |2 3c23 3c5 |2 cec23 cec5 |2 cic23 cic5 |2 cec23 cec5 |2 3c23 3c5 |2 4c21 4c5 |2 4c21 4c5 |3 3c21 3c6 |3 4c19 4c6 |3 5c17 5c6 |4 5c15 5c7 |5 5c13 6c7 |6 5c11 7c7 |7 7c5 10c7 |8 20c8 |9 19c8 |12 15c9 |36 |36 /2 3c31 |2 3c31 |2 3c6 11c14 |2 3c4 2c11 2c12 |2 3c2 2c15 2c10 | c3k3c17 2c9 | c3d2c7 5c7 2c8 | c3kc5 4c3 4c5 2c7 | c8 2c9 2c5 2c6 | c7 c13 c5 c6 | c6 c15 c5 c5 | c5 c17 c4 c5 | c4 2c17 2c3 2c4 | c3 2c19 c4 c4 | c3 2c19 c4 c4 | c3k2c19 2c3kc4 | cnanc21 cnanc4 | cndnc21 cndnc4 | cnanc21 cnanc4 | c3k2c19 2c3kc4 | c4 c19 c4 c4 | c4 c19 c4 c4 | 2c3 2c17 2c3 2c4 |2 c4 c17 c4 c5 |2 c5 c15 c5 c5 |3 c5 c13 c5 c6 |4 c5 2c9 2c6 c6 |4 2c5 4c3 4c5 3c6 |5 2c7 5c8 4c5 |6 2c19 9c|7 2c17 10c|9 3c13 11c|11 18c7 |36 / c3gc30 | 5c7 c5jc16 | c3 c4 3c7 3c13 | c3 c2 2c13 2c11 | c3 3c17 c10 |ck3 kc19 2c8 |cd3 d22 c7 |ck3 k7 7c8 c7 |c10 2c7 2c7 c6 |c9 c11 c7 c5 |c8 c13 c6 c5 |c7 c15 c6 c4 |c6 c17 c5 c4 |c6 c17 c5 c4 |c5 c19 c4 2c3 |ck3 kc19 ck3 kc3 |cn3 nc19 cn3 nc3 |cn3 nc19 cn3 nc3 |cn3 nc19 cn3 nc3 |ck3 kc19 ck3 kc3 |2c4 c19 c4 2c3 | c5 c17 c5 c4 | c5 c17 c5 c4 | c6 c15 c6 c4 |2 c6 c13 c6 c5 |2 c7 c11 c7 c5 |3 c7 2c7 2c7 2c5 |4 c8 7c8 4c4 |4 c9 kdkdk8 9c|5 2c27 cg|7 c26 cg|8 2c24 cg|10 3c kdkdk6 11c|13 16c7 / cgvgc30 | 2c 2c6 c2jc~c2jc15 | c3 c4 3c7 3c13 | c3 c2 2c13 2c11 | c3 3c17 2c9 |ck3 kc20 c8 |cd3 d22 c7 |ck3 k7 7c9 c6 |c10 2c7 2c7 c6 |c9 c11 c7 c5 |c8 c13 c6 c5 |c7 c15 c6 c4 |c6 c17 c5 c4 |c6 c17 c5 2c3 |c5 c19 c4 2c3 |ck3 kc19 ck3 kc3 |cn3 nc19 cn3 nc3 |cn3 nc19 cn3 nc3 |cn3 nc19 cn3 nc3 |ck3 kc19 ck3 kc3 |2c4 c19 c4 2c3 |2c5 c17 c5 2c3 | c5 c17 c5 c4 | c6 c15 c6 c4 |2 c6 c13 c6 c5 |2 c7 c11 c7 c5 |3 c7 2c7 2c7 2c5 |4 c8 7c8 4c4 |4 c9 kdkdk8 9c|5 c28 cg|6 2c27 b|8 2c24 cg|10 2c2 kdkdk6 11c|12 17c7 / c3gc30 | 5c7 c5jc16 | c3 c4 3c7 3c13 | c3 c2 2c13 2c11 | c3 3c17 c10 |ck3 kc19 2c8 |cd3 d22 c7 |ck3 k7 7c8 c7 |c10 2c7 2c7 c6 |c9 c11 c7 c5 |c8 c13 c6 c5 |c7 c15 c6 c4 |c6 c17 c5 c4 |c6 c17 c5 c4 |c5 c19 c4 2c3 |ck3 kc19 ck3 kc3 |cn3 nc19 cn3 nc3 |cn3 nc19 cn3 nc3 |cn3 nc19 cn3 nc3 |ck3 kc19 ck3 kc3 |2c4 c19 c4 2c3 | c5 c17 c5 c4 | c5 c17 c5 c4 | c6 c15 c6 c4 |2 c6 c13 c6 c5 |2 c7 c11 c7 c5 |3 c7 2c7 2c7 2c5 |4 c8 7c8 4c4 |4 c9 kdkdk8 9c|5 2c27 cg|7 c26 cg|8 2c24 cg|10 3c kdkdk6 11c|13 16c7 /2 3c31 |2 3c31 |2 3c6 11c14 |2 3c4 3c9 3c12 |2 3c2 2c15 2c10 | c3k3c17 2c9 | c3d2c7 5c7 2c8 | c3kc5 4c3 4c5 2c7 | c8 2c9 2c5 2c6 | c7 c13 c5 c6 | c6 c15 c5 c5 | c5 c17 c4 c5 | c4 2c17 2c3 2c4 | c3 2c19 2c3 c4 | c3 2c19 2c3 c4 | c3k2c19 2c3kc4 | c3nc21 c3nc4 | cndnc21 cndnc4 | c3nc21 c3nc4 | c3k2c19 2c3kc4 | c3 2c19 2c3 c4 | c3 2c19 2c3 c4 | 2c3 2c17 2c3 2c4 |2 c4 c17 c4 c5 |2 c5 c15 c5 c5 |3 c5 c13 c5 c6 |4 c5 2c9 2c6 c6 |4 2c5 4c3 4c6 2c6 |5 2c7 5c8 4c5 |6 2c19 9c|7 2c17 10c|9 3c13 11c|11 18c7 |36 /36 |36 |36 |11 11c14 |9 15c12 |2 3c2 18c11 |2 12c5 7c10 |2 9c11 5c9 |2 8c13 5c8 |2 7c15 5c7 |2 6c17 5c6 |2 5c19 4c6 |2 4c21 3c6 |2 4c21 4c5 |2 4c21 4c5 |2 3c23 3c5 |2 3c23 3c5 |2 coc23 coc5 |2 3c23 3c5 |2 3c23 3c5 |2 4c21 4c5 |2 4c21 4c5 |3 3c21 3c6 |3 4c19 4c6 |3 5c17 5c6 |4 5c15 5c7 |5 5c13 6c7 |6 5c11 7c7 |7 7c5 10c7 |8 20c8 |9 19c8 |12 15c9 |36 |36 "), kinds: {"c":"gShieldedAccelerator","k":"gSolidSteel","d":"gCoolantDelivery","e":"gShieldedAccelerator","n":"gNiobiumCavity","a":"gAntennaT1","i":"gShieldedAccelerator","o":"gShieldedAccelerator","v":"gShieldedAccelerator","b":"gShieldedAccelerator","g":"glass","j":"gShieldedAccelerator","~":"gSynchrotronController"} },
  },
  {
    slug: "target-chamber",
    name: "Target Chamber",
    title: "Камера мишени",
    tier: "zpm",
    summary: "Ловит фотонный пучок и гравирует им легированные пластины.",
    story: ["Камера мишени ловит фотонный пучок и гравирует им легированные пластины. Сам пучок она не меняет — только проверяет, что его энергия и фокус подходят рецепту.","Длительность рецепта зависит от интенсивности пучка; лишняя энергия ничего не ускоряет."],
    facts: [{"label":"Размер","value":"5 × 5 × 6"},{"label":"Блоков","value":"124"},{"label":"Ярус в вики","value":"ZPM"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtnhlanth/common/tileentity/MTETargetChamber.java",
    def: { layers: unpackLayers("5g|cslsc|c3sc|c3sc|cstsc|5g/g3jg|s r s|s3 s|s3 s|s u s|g3jg/gjbjg|srhrs|s3 s|s3 s|suius|gjojg/g3jg|s r s|s3 s|s3 s|s u s|g3jg/2f~2f|5c|5c|5c|5c|5g"), kinds: {"g":"gGrate","f":"gGrate","j":"glass","b":"gGrate","c":"gShieldedAccelerator","l":"gGrate","t":"gGrate","s":"glass","r":"gFocusManipulator","h":"gFocusHolder","u":"gTargetReceptacle","i":"gTargetHolder","o":"gGrate","~":"gTargetChamberController"} },
  },
  {
    slug: "ph-neutralization-purification-unit",
    name: "PH Neutralization Purification Unit",
    title: "Установка pH нейтрализации воды",
    tier: "zpm",
    summary: "Четвёртый шаг очистки воды: довести случайный pH ровно до 7,0.",
    story: ["В игре по-русски — «Установка pH нейтрализации воды». Это четвёртый шаг линии очистки воды.","При запуске она получает случайный pH, и его надо довести ровно до 7,0 щёлочью или кислотой — иначе рецепт не удастся."],
    facts: [{"label":"Размер","value":"15 × 6 × 5"},{"label":"Блоков","value":"222"},{"label":"Ярус в вики","value":"ZPM"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/purification/MTEPurificationUnitPhAdjustment.java",
    def: { layers: unpackLayers("E3 E5 E3 E| 3A7 3A | AXA7 AYA | 3A7 3A |E3 E5 E3 E/E3AE5 E3AE|A3 A5 A3 A|A3 A5 A3 A|A3 A5 A3 A|E3AE5 E3AE/EAGAE5 EAHAE|A3 A5 A3 A|G3 A5 A3 H|A3 A5 A3 A|EAGAE5 EAHAE/EAGAE5 EAHAE|A3 A5 A3 A|G3 A5BA3 H|A3 A5 A3 A|EAGAE5 EAHAE/EAGAE5 EAHAE|A3 A2B~2BA3 A|G13 H|A3 A5IA3 A|EAGAE5 EAHAE/E3AE5 E3AE|5A5 5A|5ABRBRB5A|5A5 5A|E3AE5 E3AE"), kinds: {"A":"gExtremeCorrosionResi","B":"gNaquadahReinforcedWa","E":"gFrameNaquadahalloy","G":"glass","H":"glass","I":"gNaquadahReinforcedWa","R":"gNaquadahReinforcedWa","X":"gNaquadahReinforcedWa","Y":"gNaquadahReinforcedWa","~":"gPhNeutralizationPurificationUnitController"} },
  },
  {
    slug: "spinmatron-2737",
    name: "Spinmatron-2737",
    title: "Спинматрон-2737",
    tier: "zpm",
    summary: "Огромная центрифуга: параллели — от суммы уровней турбин в роторах.",
    story: ["В игре по-русски — «Спинматрон-2737». Это огромная центрифуга: она раскладывает пыль, жидкости и предметы на составные части втрое быстрее промышленной центрифуги и за 70 % энергии.","Параллелей — 4 × сумма уровней турбин в роторных люках; огромные турбины дают больше. Здесь показан первый уровень постройки."],
    facts: [{"label":"Размер","value":"17 × 17 × 17"},{"label":"Блоков","value":"1 517"},{"label":"Ярус в вики","value":"ZPM"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTESpinmatron.java",
    def: { layers: unpackLayers("6 5A6 |4 9A4 |2 13A2 |2 13A2 | 15A | 15A |17A|17A|17A|17A|17A| 15A | 15A |2 13A2 |2 13A2 |4 9A4 |6 5A6 /17 |7 3G7 |6 A3GA6 |4 BA 3G AB4 |3 B3 3G3 B3 |3 A4 B4 A3 |2 A4 BEB4 A2 | 4G B3EB 4G | 4GB5EB4G | 4G B3EB 4G |2 A4 BEB4 A2 |3 A4 B4 A3 |3 B3 3G3 B3 |4 BA 3G AB4 |6 A3GA6 |7 3G7 |17 /17 |7 GHG7 |6 AG GA6 |4 BA G G AB4 |3 B3 3G3 B3 |3 A4 F4 A3 |2 A4 BFB4 A2 | 4G BEFEB 4G | H2 G3FE3FG2 H | 4G BEFEB 4G |2 A4 BFB4 A2 |3 A4 F4 A3 |3 B3 3G3 B3 |4 BA G G AB4 |6 AG GA6 |7 GHG7 |17 /17 |7 3G7 |6 A3GA6 |4 BA 3G AB4 |3 B3 3G3 B3 |3 A3 3a3 A3 |2 A3 5a3 A2 | 4G2a3E2a4G | 4G2a3E2a4G | 4G2a3E2a4G |2 A3 5a3 A2 |3 A3 3a3 A3 |3 B3 3G3 B3 |4 BA 3G AB4 |6 A3GA6 |7 3G7 |17 /17 |17 |6 5A6 |4 BA5 AB4 |3 B9 B3 |3 A3 3C3 A3 |2 A3 C3 C3 A2 |2 A2 C5 C2 A2 |2 A2 C2 b2 C2 A2 |2 A2 C5 C2 A2 |2 A3 C3 C3 A2 |3 A3 3C3 A3 |3 B9 B3 |4 BA5 AB4 |6 5A6 |17 |17 /17 |17 |6 A3DA6 |4 BA5 AB4 |3 B9 B3 |3 A3 3C3 A3 |2 A3 C3 C3 A2 |2 D2 C5 C2 D2 |2 D2 C2 b2 C2 D2 |2 D2 C5 C2 D2 |2 A3 C3 C3 A2 |3 A3 3C3 A3 |3 B9 B3 |4 BA5 AB4 |6 A3DA6 |17 |17 /17 |17 |6 A3DA6 |4 BA5 AB4 |3 B9 B3 |3 A3 3C3 A3 |2 A3 C3 C3 A2 |2 D2 C5 C2 D2 |2 D2 C2 b2 C2 D2 |2 D2 C5 C2 D2 |2 A3 C3 C3 A2 |3 A3 3C3 A3 |3 B9 B3 |4 BA5 AB4 |6 A3DA6 |17 |17 /17 |17 |6 A3DA6 |4 BA5 AB4 |3 B9 B3 |3 A3 3C3 A3 |2 A3 C3 C3 A2 |2 D2 C5 C2 D2 |2 D2 C2 b2 C2 D2 |2 D2 C5 C2 D2 |2 A3 C3 C3 A2 |3 A3 3C3 A3 |3 B9 B3 |4 BA5 AB4 |6 A3DA6 |17 |17 /17 |17 |6 2A~2A6 |4 BA5 AB4 |3 B9 B3 |3 A3 3C3 A3 |2 A3 C3 C3 A2 |2 D2 C5 C2 D2 |2 D2 C2 b2 C2 D2 |2 D2 C5 C2 D2 |2 A3 C3 C3 A2 |3 A3 3C3 A3 |3 B9 B3 |4 BA5 AB4 |6 A3DA6 |17 |17 /17 |17 |6 A3DA6 |4 BA5 AB4 |3 B9 B3 |3 A3 3C3 A3 |2 A3 C3 C3 A2 |2 D2 C5 C2 D2 |2 D2 C2 b2 C2 D2 |2 D2 C5 C2 D2 |2 A3 C3 C3 A2 |3 A3 3C3 A3 |3 B9 B3 |4 BA5 AB4 |6 A3DA6 |17 |17 /17 |17 |6 A3DA6 |4 BA5 AB4 |3 B9 B3 |3 A3 3C3 A3 |2 A3 C3 C3 A2 |2 D2 C5 C2 D2 |2 D2 C2 b2 C2 D2 |2 D2 C5 C2 D2 |2 A3 C3 C3 A2 |3 A3 3C3 A3 |3 B9 B3 |4 BA5 AB4 |6 A3DA6 |17 |17 /17 |17 |6 A3DA6 |4 BA5 AB4 |3 B9 B3 |3 A3 3C3 A3 |2 A3 C3 C3 A2 |2 D2 C5 C2 D2 |2 D2 C2 b2 C2 D2 |2 D2 C5 C2 D2 |2 A3 C3 C3 A2 |3 A3 3C3 A3 |3 B9 B3 |4 BA5 AB4 |6 A3DA6 |17 |17 /17 |17 |6 5A6 |4 BA5 AB4 |3 B9 B3 |3 A3 3C3 A3 |2 A3 C3 C3 A2 |2 A2 C5 C2 A2 |2 A2 C2 b2 C2 A2 |2 A2 C5 C2 A2 |2 A3 C3 C3 A2 |3 A3 3C3 A3 |3 B9 B3 |4 BA5 AB4 |6 5A6 |17 |17 /17 |7 3G7 |6 A3GA6 |4 BA 3G AB4 |3 B3 3G3 B3 |3 A3 3a3 A3 |2 A3 5a3 A2 | 4G2a3E2a4G | 4G2a3E2a4G | 4G2a3E2a4G |2 A3 5a3 A2 |3 A3 3a3 A3 |3 B3 3G3 B3 |4 BA 3G AB4 |6 A3GA6 |7 3G7 |17 /17 |7 GHG7 |6 AG GA6 |4 BA G G AB4 |3 B3 3G3 B3 |3 A4 F4 A3 |2 A4 BFB4 A2 | 4G BEFEB 4G | H2 G3FE3FG2 H | 4G BEFEB 4G |2 A4 BFB4 A2 |3 A4 F4 A3 |3 B3 3G3 B3 |4 BA G G AB4 |6 AG GA6 |7 GHG7 |17 /17 |7 3G7 |6 A3GA6 |4 BA 3G AB4 |3 B3 3G3 B3 |3 A4 B4 A3 |2 A4 BEB4 A2 | 4G B3EB 4G | 4GB5EB4G | 4G B3EB 4G |2 A4 BEB4 A2 |3 A4 B4 A3 |3 B3 3G3 B3 |4 BA 3G AB4 |6 A3GA6 |7 3G7 |17 /6 5A6 |4 9A4 |2 13A2 |2 13A2 | 15A | 15A |17A|17A|17A|17A|17A| 15A | 15A |2 13A2 |2 13A2 |4 9A4 |6 5A6 "), kinds: {"A":"gSpinmatron","B":"gPipePolybenzimidazole","C":"glass","D":"glass","E":"gGearboxT1","F":"gRedoxEv","G":"gSupercriticalFluidTu","H":"gSpinmatron","a":"gBlockNaquadahalloy","b":"gFrameSteel","~":"gSpinmatron2737Controller"} },
  },
  {
    slug: "xl-turbo-plasma-turbine",
    name: "XL Turbo Plasma Turbine",
    title: "XL Турбоплазменная турбина",
    tier: "zpm",
    summary: "Плазменная турбина с 12 роторами и в 16 раз мощнее большой.",
    story: ["В игре по-русски — «XL Турбоплазменная турбина». Она пропускает в 16 раз больше плазмы, чем большая плазменная турбина, всего с 12 турбинами, берёт многоамперные и лазерные динамо-люки и не взрывается, если сломать динамо-люк на ходу.","Турбины должны быть одинаковыми, штрафы за неточный поток строже."],
    facts: [{"label":"Размер","value":"9 × 9 × 26"},{"label":"Блоков","value":"620"},{"label":"Ярус в вики","value":"ZPM"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/xlturbines/MTEXLTurbinePlasma.java",
    def: { layers: unpackLayers("9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |4 G4 |4 G4 |3 G G3 |3 G G3 |3 G G3 |2 5G2 |2 5G2 |2 DGDGD2 |2 DGDGD2 |2 DGDGD2 |2 5G2 |2 5G2 |4 G4 /9 |9 |9 |9 |9 |9 |9 |9 |9 |4 G4 |4 G4 |3 G G3 |3 G G3 |2 5G2 | 7G | EDGDGDE | EDGDGDE | EDGDGDE | G5 G | G5 G | D5 D | DC3 CD | D5 D | GC3 CG | G5 G |2 2G 2G2 /3 3G3 |3 GEG3 |3 GEG3 |3 GEG3 |3 3G3 |3 3A3 |3 3A3 |3 3A3 |3 3G3 |2 2G 2G2 |2 2G 2G2 |2 D D D2 |2 D D D2 | 2G3 2G | 2G3 2G | D5 D | D5 D | D C3 D |G7 G|G4 C2 G|D7 D|D3C2 2CD|D7 D|G2C2 3CG|G7 G| G5 G /2 G3 G2 |2 G3EG2 |2 G C G2 |2 G3 G2 |2 G3 G2 |2 A3 A2 |2 A3 A2 |2 A3 A2 |2 G3 G2 |2 G3 G2 |2 G3 G2 | G2 C2 G | G5 G | G2 C2 G | G5 G |2G2 C2 2G|2G5 2G|2G2 C C2G|G7 G|G C C3 G|G7 G|G2 C 2C G|G7 G|G 2C C2 G|G7 G| G5 G /2 G3 G2 |2 2E~2E2 |2 ECFCE2 |2 E F E2 |2 G F G2 |2 A F A2 |2 A F A2 |2 A F A2 |2 G F G2 | G2 F2 G | G2 F2 G |2 DCBCD2 |2 D F D2 |2G CBC 2G|2G2 F2 2G| D CBC D | D2 F2 D | D CBC D |G3 F3 G|G2 CBC2 G|D3 F3 D|D3 B3 D|D3 F3 D|G3 B3 G|G3 F3 G|G7 G/2 G3 G2 |2 G3EG2 |2 G C G2 |2 G3 G2 |2 G3 G2 |2 A3 A2 |2 A3 A2 |2 A3 A2 |2 G3 G2 |2 G3 G2 |2 G3 G2 | G2 C2 G | G5 G | G2 C2 G | G5 G |2G2 C2 2G|2G5 2G|2GC C2 2G|G7 G|G3 C C G|G7 G|G 2C C2 G|G7 G|G2 C 2C G|G7 G| G5 G /3 3G3 |3 GEG3 |3 GEG3 |3 GEG3 |3 3G3 |3 3A3 |3 3A3 |3 3A3 |3 3G3 |2 2G 2G2 |2 2G 2G2 |2 D D D2 |2 D D D2 | 2G3 2G | 2G3 2G | D5 D | D5 D | D3 C D |G7 G|G2 C4 G|D7 D|D2C2 3CD|D7 D|G3C2 2CG|G7 G| G5 G /9 |9 |9 |9 |9 |9 |9 |9 |9 |4 G4 |4 G4 |3 G G3 |3 G G3 |2 5G2 | 7G | EDGDGDE | EDGDGDE | EDGDGDE | G5 G | G5 G | D5 D | DC3 CD | D5 D | GC3 CG | G5 G |2 2G 2G2 /9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |9 |4 G4 |4 G4 |3 G G3 |3 G G3 |3 G G3 |2 5G2 |2 5G2 |2 DGDGD2 |2 DGDGD2 |2 DGDGD2 |2 5G2 |2 5G2 |4 G4 "), kinds: {"A":"glass","B":"gGearboxSteel","C":"gPipeTungstensteel","D":"gCoilNaquadahBackgrou","E":"gFrameTungstensteel","F":"gRedoxEv","G":"gTurbineTungstensteel","~":"gXlTurboPlasmaTurbineController"} },
  },
  {
    slug: "void-miner",
    name: "Void Miner",
    title: "Бурильщик пустоты",
    tier: "zpm",
    summary: "Бесконечно добывает руду любого мира — без труб и без переездов.",
    story: ["Бурильщик пустоты бесконечно добывает руду любой планеты или измерения. Это улучшение рудной буровой: трубы не нужны, переезжать не надо, а выход намного больше.","Каждые 10 тиков он выбирает случайную руду из жил и мелких руд этого мира. Чем выше напряжение, тем больше руды."],
    facts: [{"label":"Размер","value":"7 × 9 × 7"},{"label":"Блоков","value":"75"},{"label":"Ярус в вики","value":"ZPM"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/bwcrossmod/galacticgreg/MTEVoidMiners.java",
    def: { layers: unpackLayers("7 |7 |7 |3 B3 |7 |7 |7 /7 |7 |7 |3 B3 |7 |7 |7 /7 |7 |7 |3 B3 |7 |7 |7 /7 |7 |3 B3 |2 BCB2 |3 B3 |7 |7 /7 |7 |3 B3 |2 BCB2 |3 B3 |7 |7 /7 |7 |3 B3 |2 BCB2 |3 B3 |7 |7 /7 | B3 B |2 DAD2 |2 ACA2 |2 DAD2 | B3 B |7 /2 D D2 | BA~AB | A3 A | B C B | A3 A | BABAB |7 /2 E E2 | 5B |EB3 BE| B C B |EB3 BE| 5B |2 E E2 "), kinds: {"A":"gMiningOsmiridium","B":"gFrameOsmiridium","C":"gBwadv176176186","D":"gBw176176186","E":"gMiningOsmiridium","~":"gVoidMinerController"} },
  },
  {
    slug: "component-assembly-line",
    name: "Component Assembly Line",
    title: "Сборочная линия деталей",
    tier: "uv",
    summary: "Массово собирает моторы, насосы и генераторы поля — без флешек и без порядка ингредиентов.",
    story: ["Сборочная линия деталей (в книге заданий — CoAL) массово собирает детали: моторы, насосы, вплоть до генераторов поля. Несмотря на название, порядок ингредиентов не важен — всё можно сложить в одну шину; флешки и оптика не нужны.","Ярус корпусов линии задаёт, какие детали можно собирать: их улучшают с каждой эрой, вплоть до UXV."],
    facts: [{"label":"Размер","value":"9 × 10 × 33"},{"label":"Блоков","value":"1 270"},{"label":"Ярус в вики","value":"UV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/goodgenerator/blocks/tileEntity/MTEComponentAssemblyLine.java",
    def: { layers: unpackLayers("9 |9 |3 H H3 |3 H H3 |9 |3 H H3 |3 H H3 |3 H H3 |9 |3 H H3 |3 H H3 |3 H H3 |9 |3 H H3 |3 H H3 |3 H H3 |9 |3 H H3 |3 H H3 |3 H H3 |9 |3 H H3 |3 H H3 |3 H H3 |9 |3 H H3 |3 H H3 |3 H H3 |9 |3 H H3 |3 H H3 |9 |9 /3 3I3 | EL3HLE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3 LE | EL3HLE |9 / 2HI~I2H |E7 E|E7 E|E7 E|E 2GD2G E|E7 E|E7 E|E7 E|E 2GD2G E|E7 E|E7 E|E7 E|E 2GD2G E|E7 E|E7 E|E7 E|E 2GD2G E|E7 E|E7 E|E7 E|E 2GD2G E|E7 E|E7 E|E7 E|E 2GD2G E|E7 E|E7 E|E7 E|E 2GD2G E|E7 E|E7 E|E7 E| 7H /2H 3I 2H|H7 H|HC5 CH|H7 H|H2G D 2GH|H7 H|HC5 CH|H7 H|H2G D 2GH|H7 H|HC5 CH|H7 H|H2G D 2GH|H7 H|HC5 CH|H7 H|H2G D 2GH|H7 H|HC5 CH|H7 H|H2G D 2GH|H7 H|HC5 CH|H7 H|H2G D 2GH|H7 H|HC5 CH|H7 H|H2G D 2GH|H7 H|HC5 CH|H7 H|2H5 2H/H7 H|A7 A|AC5 CA|A7 A|AG2 C2 GA|A7 A|AC5 CA|A7 A|HG2 C2 GH|A7 A|AC5 CA|A7 A|AG2 C2 GA|A7 A|AC5 CA|A7 A|HG2 C2 GH|A7 A|AC5 CA|A7 A|AG2 C2 GA|A7 A|AC5 CA|A7 A|HG2 C2 GH|A7 A|AC5 CA|A7 A|AG2 C2 GA|A7 A|AC5 CA|A7 A|H7 H/H7 H|A7 A|AC5 CA|A7 A|AG5 GA|A7 A|AC5 CA|A7 A|HG5 GH|A7 A|AC5 CA|A7 A|AG5 GA|A7 A|AC5 CA|A7 A|HG5 GH|A7 A|AC5 CA|A7 A|AG5 GA|A7 A|AC5 CA|A7 A|HG5 GH|A7 A|AC5 CA|A7 A|AG5 GA|A7 A|AC5 CA|A7 A|H7 H/H2 3J2 H|A7 A|A D3 D A|A7 A|AG5 GA|A7 A|A D3 D A|A7 A|HG5 GH|A7 A|A D3 D A|A7 A|AG5 GA|A7 A|A D3 D A|A7 A|HG5 GH|A7 A|A D3 D A|A7 A|AG5 GA|A7 A|A D3 D A|A7 A|HG5 GH|A7 A|A D3 D A|A7 A|AG5 GA|A7 A|A D3 D A|A7 A|H7 H/H2 3J2 H|A2 3H2 A|A2 3H2 A|A2 3H2 A|AG 3H GA|A2 3H2 A|A2 3H2 A|A2 3H2 A|HG 3H GH|A2 3H2 A|A2 3H2 A|A2 3H2 A|AG 3H GA|A2 3H2 A|A2 3H2 A|A2 3H2 A|HG 3H GH|A2 3H2 A|A2 3H2 A|A2 3H2 A|AG 3H GA|A2 3H2 A|A2 3H2 A|A2 3H2 A|HG 3H GH|A2 3H2 A|A2 3H2 A|A2 3H2 A|AG 3H GA|A2 3H2 A|A2 3H2 A|A2 3H2 A|H7 H/H2 N N2 H|A7 A|A7 A|A7 A|AG5 GA|A7 A|A7 A|A7 A|HG5 GH|A7 A|A7 A|A7 A|AG5 GA|A7 A|A7 A|A7 A|HG5 GH|A7 A|A7 A|A7 A|AG5 GA|A7 A|A7 A|A7 A|HG5 GH|A7 A|A7 A|A7 A|AG5 GA|A2 n n2 A|A7 A|A7 A|H2 3K2 H/9H|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|M7HM|9H"), kinds: {"A":"glass","H":"gIridium","C":"gGearboxTungstensteel","D":"gAssembler","G":"gPipePolybenzimidazole","E":"gVentT2","J":"gIridium","N":"gFrameTungstensteel","K":"gIridium","L":"gIridium","I":"gIridium","M":"gIridium","n":"gFrameTungstensteel","~":"gComponentAssemblyLineController"} },
  },
  {
    slug: "beam-mirror",
    name: "Beam Mirror",
    title: "Лучевое зеркало",
    tier: "uv",
    summary: "Поворачивает пучок частиц на 90° или 180° — без энергии и потерь.",
    story: ["В игре по-русски — «Лучевое зеркало». Оно поворачивает пучок частиц на 90° или 180°: один вход, один выход, ни энергии, ни обслуживания.","Пучок при этом ничего не теряет."],
    facts: [{"label":"Размер","value":"3 × 5 × 5"},{"label":"Блоков","value":"48"},{"label":"Ярус в вики","value":"UV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/beamcrafting/MTEBeamMirror.java",
    def: { layers: unpackLayers("3 |3 |3 |EDE|3E/3 |3 |3 |BAB|3B/3 |3 |3 |BAB|3B/ECE|BAB|BAB|BAB|3B/E~E|3B|3B|3B|3B"), kinds: {"B":"gShieldedAccelerator","A":"glass","C":"gGrate","D":"gGrate","E":"gGrate","~":"gBeamMirrorController"} },
  },
  {
    slug: "beam-splitter",
    name: "Beam Splitter",
    title: "Лучевой разветвитель",
    tier: "uv",
    summary: "Делит и фильтрует пучок частиц на четыре выхода.",
    story: ["В игре по-русски — «Лучевой разветвитель». Он фильтрует и делит пучок частиц: один вход и четыре выхода с фильтрами, без энергии и обслуживания.","Энергия и фокус пучка не теряются — делится только его интенсивность."],
    facts: [{"label":"Размер","value":"9 × 3 × 9"},{"label":"Блоков","value":"84"},{"label":"Ярус в вики","value":"UV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/beamcrafting/MTEBeamSplitter.java",
    def: { layers: unpackLayers("3 3E3 |4 B4 |4 B4 |4 B4 |4 B4 |3 BAB3 |3 BAB3 |2 B3AB2 |9E/3 ECE3 |3 B B3 |3 A A3 |3 A A3 |3 B B3 |2 B3 B2 | 2B3 2B |2B5 2B|EDBDBDBDE/3 E~E3 |4 B4 |4 B4 |4 B4 |4 B4 |3 3B3 |3 3B3 |2 5B2 |9E"), kinds: {"B":"gShieldedAccelerator","A":"glass","C":"gGrate","D":"gGrate","E":"gGrate","~":"gBeamSplitterController"} },
  },
  {
    slug: "beam-stabilizer",
    name: "Beam Stabilizer",
    title: "Лучевой стабилизатор",
    tier: "uv",
    summary: "Копит пучок частиц и выпускает его с нужной интенсивностью.",
    story: ["В игре по-русски — «Лучевой стабилизатор». Он на время копит пучок частиц и выпускает его с заданной интенсивностью: один вход, один выход, без энергии и обслуживания.","Энергия и фокус пучка при этом не теряются."],
    facts: [{"label":"Размер","value":"7 × 7 × 11"},{"label":"Блоков","value":"122"},{"label":"Ярус в вики","value":"UV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/beamcrafting/MTEBeamStabilizer.java",
    def: { layers: unpackLayers("7 |7 |7 |7 |7 |7 |7 |2 3B2 |7 |7 |7 /7 |7 |7 |2 3B2 |7 |7 |7 | B B B |7 |7 |7 /2 3E2 |2 BAB2 |2 BAB2 | 2BA2B |2 BAB2 |2 BAB2 |2 BAB2 |B BAB B|2 BAB2 |2 BAB2 |2 3E2 /2 ECE2 |2 B B2 |2 B B2 | 2B 2B |2 B B2 |2 B B2 |2 B B2 |3B 3B|2 B B2 |2 B B2 |2 EDE2 /2 E~E2 |2 3B2 |2 3B2 | 5B |2 3B2 |2 3B2 |2 3B2 |B 3B B|2 3B2 |2 3B2 |2 3E2 /7 |7 |7 |2 3B2 |7 |7 |7 | B B B |7 |7 |7 /7 |7 |7 |7 |7 |7 |7 |2 3B2 |7 |7 |7 "), kinds: {"B":"gShieldedAccelerator","A":"glass","C":"gGrate","D":"gGrate","E":"gGrate","~":"gBeamStabilizerController"} },
  },
  {
    slug: "beam-crafter",
    name: "Beam Crafter",
    title: "Лучевой сборщик",
    tier: "uv",
    summary: "Ловит пучки частиц и тратит их на рецепты: копит до 2 миллиардов каждого вида.",
    story: ["В игре по-русски — «Лучевой сборщик». Он ловит пучки частиц и расходует их на рецепты: хранит до 2 миллиардов частиц каждого вида, и они не распадаются.","Неважно, через какой входной люк пришли частицы; рецепт начинается сразу, как всё есть."],
    facts: [{"label":"Размер","value":"17 × 5 × 11"},{"label":"Блоков","value":"276"},{"label":"Ярус в вики","value":"UV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/beamcrafting/MTEBeamCrafter.java",
    def: { layers: unpackLayers("17 | 3B9 3B | 3B9 3B | 3B9 3B | 3B9 3B |2 3B7 3B2 |2 4B5 4B2 |3 11B3 |4 9B4 |6 5B6 |17 / 3D9 3D |B3 B7 B3 B|B3 B7 B3 B|B3 B7 B3 B|B3 2B5 2B3 B| B3 2B3 2B3 B | B4 5B4 B |2 B11 B2 |3 B9 B3 |4 2B5 2B4 |6 5B6 / DCD9 DCD |B3 B7 B3 B|B3 A7 A3 B|B3 A7 A3 B|B3 2A5 2A3 B| A3 2A3 2A3 A | A4 AB~BA4 A |2 A11 A2 |3 A9 A3 |4 2A5 2A4 |6 5B6 / 3D9 3D |B3 B7 B3 B|B3 B7 B3 B|B3 B7 B3 B|B3 2B5 2B3 B| B3 2B3 2B3 B | B4 5B4 B |2 B11 B2 |3 B9 B3 |4 2B5 2B4 |6 5B6 /17 | 3B9 3B | 3B9 3B | 3B9 3B | 3B9 3B |2 3B7 3B2 |2 4B5 4B2 |3 11B3 |4 9B4 |6 5B6 |17 "), kinds: {"B":"gShieldedAccelerator","A":"glass","C":"gShieldedAccelerator","D":"gGrate","~":"gBeamCrafterController"} },
  },
  {
    slug: "temperature-fluctuation-purification-unit",
    name: "Extreme Temperature Fluctuation Purification Unit",
    title: "Установка циклической термической очистки воды",
    tier: "uv",
    summary: "Пятый шаг очистки воды: нагреть плазмой и остудить хладагентом.",
    story: ["В игре по-русски — «Установка циклической термической очистки воды». Это пятый шаг линии очистки воды: воду сначала нагревают плазмой до огромной температуры, потом остужают хладагентом.","Она нужна в UV — для пластин, легированных америцием."],
    facts: [{"label":"Размер","value":"23 × 15 × 15"},{"label":"Блоков","value":"843"},{"label":"Ярус в вики","value":"UV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/purification/MTEPurificationUnitPlasmaHeater.java",
    def: { layers: unpackLayers("13 5D5 |11 2D5 2D3 |10 D9 D2 |9 D11 D |9 D11 D |8 D13 D|8 D13 D|8 D13 D|8 D13 D|8 D13 D|9 D11 D |9 D11 D |10 D9 D2 |11 2D5 2D3 |13 5D5 /23 |13 5D5 |11 2D5 2D3 |10 D9 D2 |10 D9 D2 |9 D11 D |9 D11 D |9 D11 D |9 D11 D |9 D11 D |10 D9 D2 |10 D9 D2 |11 2D5 2D3 |13 5D5 |23 /23 |23 |13 5D5 |11 2D5 2D3 |11 D7 D3 |10 D9 D2 |10 D9 D2 |10 D9 D2 |10 D9 D2 |10 D9 D2 |11 D7 D3 |11 2D5 2D3 |13 5D5 |23 |23 /23 |23 |13 5D5 |11 2D5 2D3 |11 D7 D3 |10 D9 D2 |10 D9 D2 |10 D9 D2 |10 D9 D2 |10 D9 D2 |11 D7 D3 |11 2D5 2D3 |13 5D5 |23 |23 /23 |23 |13 5D5 |11 2D5 2D3 |11 D7 D3 |10 D9 D2 | 3B6 D9 D2 | 3B6 D9 D2 | 3B6 D9 D2 |10 D9 D2 |11 D7 D3 |11 2D5 2D3 |13 5D5 |23 |23 /23 |23 |13 5D5 |11 2D5 2D3 |11 D7 D3 |G3BG5 D9 D2 |5B5 D9 D2 |5B5 D9 D2 |5B5 D9 D2 |G3BG5 D9 D2 |11 D7 D3 |11 2D5 2D3 |13 5D5 |23 |23 /23 |23 |13 5D5 |11 2D5 2D3 |11 D7 D3 |G3 G5 D9 D2 | 3E6 D9 D2 | E E6 D9 D2 | 3E6 D9 D2 |G3 G5 D9 D2 |11 D7 D3 |11 2D5 2D3 |13 5D5 |23 |23 /23 |23 |13 5D5 |11 2D5 2D3 |11 D7 D3 |G3 G5 D9 D2 | 3E6 D9 D2 | E E6 D9 D2 | 3E6 D9 D2 |G3 G5 D9 D2 |11 D7 D3 |11 2D5 2D3 |13 5D5 |23 |23 /23 |13 5D5 |11 2D5 2D3 |10 D9 D2 |10 D9 D2 |G3 G4 D11 D | 3E5 D11 D | E E5 D11 D | 3E5 D11 D |G3 G4 D11 D |10 D9 D2 |10 D9 D2 |11 2D5 2D3 |13 5D5 |23 /23 |13 5D5 |11 2D5 2D3 |10 D9 D2 |10 D9 D2 |G3 G4 D11 D | 3E5 D11 D | E E5 D11 D | 3E5 D11 D |G3 G4 D11 D |10 D9 D2 |10 D9 D2 |11 2D5 2D3 |13 5D5 |23 /23 |13 5D5 |11 2D5 2D3 |10 D9 D2 |10 D9 D2 |G3 G4 D11 D | 3E5 D11 D | E E5 D11 D | 3E5 D11 D |G3 G4 D11 D |10 D9 D2 |10 D9 D2 |11 2D5 2D3 |13 5D5 |23 /13 5D5 |11 2D5 2D3 |10 D9 D2 |9 D11 D |9 D11 D |G3 G3 D13 D| 3E4 D13 D| E E4 D13 D| 3E4 D13 D|G3 G3 D13 D|9 D11 D |9 D11 D |10 D9 D2 |11 2D5 2D3 |13 5D5 /13 5D5 |11 2D5 2D3 |10 D9 D2 |9 D11 D |9 D11 D |G3 G3 D13 D| 3E4 D13 D| E E4BD13 D| 3E4 D13 D|G3 G3 D13 D|9 D11 D |9 D11 D |10 D9 D2 |11 2D5 2D3 |13 5D5 /13 5D5 |11 2D5 2D3 |10 D9 D2 |9 D11 D |9 D11 D |G3 G3 D13 D| 3E4BD13 D| E E4 D13 D| 3E4BD13 D|G3 G3 D13 D|9 D11 D |9 D11 D |10 D9 D2 |11 2D5 2D3 |13 5D5 /13 2DK2D5 |11 9D3 |10 11D2 |9 13D |9 13D |GB~BG3 15D|B3AB3 15D|P3A4B15D|B3AB3 15D|G3BG3 15D|9 13D |9 13D |10 11D2 |11 9D3 |13 5D5 "), kinds: {"A":"gSolidSteel","B":"gPlasmaHeater","D":"gWaterPlantConcrete","E":"glass","G":"gFrameSuperconductorzpmbase","K":"gPlasmaHeater","P":"gPlasmaHeater","~":"gTemperatureFluctuationPurificationUnitController"} },
  },
  {
    slug: "laser-purification-unit",
    name: "High Energy Laser Purification Unit",
    title: "Установка высокоэнергетической лазерной очистки воды",
    tier: "uv",
    summary: "Шестой шаг очистки воды: чередовать цветные линзы.",
    story: ["В игре по-русски — «Установка высокоэнергетической лазерной очистки воды». Это шестой шаг линии очистки воды: воду очищают фотонными пучками разной длины волны.","Для этого в корпусе линз по очереди меняют набор цветных линз."],
    facts: [{"label":"Размер","value":"13 × 9 × 9"},{"label":"Блоков","value":"387"},{"label":"Ярус в вики","value":"UV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/purification/MTEPurificationUnitUVTreatment.java",
    def: { layers: unpackLayers("13 |5 3A5 |3 7A3 | 11A | 5AL5A | 11A |3 7A3 |5 AIA5 |13 /5 3D5 |3 2D3A2D3 | 2D2A3C2A2D |D2A7C2AD|DA9CAD|D2A7C2AD| 2D2A3C2A2D |3 2D3A2D3 |5 3D5 /13 |5 3B5 |3 2B3 2B3 | 2B7 2B | B9 B | 2B7 2B |3 2B3 2B3 |5 3B5 |13 /13 |5 3B5 |3 2B3 2B3 | 2B7 2B | B9 B | 2B7 2B |3 2B3 2B3 |5 3B5 |13 /13 |5 3B5 |3 2B3 2B3 | 2B7 2B | B9 B | 2B7 2B |3 2B3 2B3 |5 3B5 |13 /13 |5 3B5 |3 2B3 2B3 | 2B7 2B | B9 B | 2B7 2B |3 2B3 2B3 |5 3B5 |13 /13 |5 3B5 |3 2B3 2B3 | 2B7 2B | B9 B | 2B7 2B |3 2B3 2B3 |5 3B5 |13 /5 3D5 |3 2D3B2D3 | 2D2B3 2B2D |D2B7 2BD|DB9 BD|D2B7 2BD| 2D2B3 2B2D |3 2D3B2D3 |5 3D5 /5 H~H5 |3 7A3 | 11A |H11AH|H11AH|H11AH| 11A |3 7A3 |5 3H5 "), kinds: {"A":"gNaquadriaReinforcedW","B":"glass","C":"gUvBacklightSterilize","D":"gFrameStellaralloy","L":"gNaquadriaReinforcedW","I":"gNaquadriaReinforcedW","H":"gNaquadriaReinforcedW","~":"gLaserPurificationUnitController"} },
  },
  {
    slug: "large-hadron-collider",
    name: "Large Hadron Collider",
    title: "Большой адронный коллайдер",
    tier: "uv",
    summary: "Разгоняет частицы и сталкивает их, рождая новые. Кольцо больше ста блоков в поперечнике.",
    story: ["В игре по-русски — «Большой адронный коллайдер». Он получает пучок из камеры источника, разгоняет его до нужной энергии, а потом сталкивает частицы, рождая новые.","Это одна из самых больших построек игры: кольцо 109 × 13 × 122 и почти шесть тысяч блоков. Новые частицы выходят через четыре люка — по одному на каждое фундаментальное взаимодействие."],
    facts: [{"label":"Размер","value":"109 × 13 × 122"},{"label":"Блоков","value":"5 704"},{"label":"Ярус в вики","value":"UV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/beamcrafting/MTELargeHadronCollider.java",
    def: { layers: unpackLayers("109 |109 |109 |61 13C35 |61 C3 C3 C3 C35 |61 13C35 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 /109 |109 |60 14C35 |59 13CA36 |59 13CA36 |59 13CA36 |60 14C35 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 /109 |59 15C35 |50 10C12 A36 |46 17C9 D36 |44 6C7 8C7 D36 |42 5C11 2C2 5C5 D36 |41 4C14 C4 4C4 A36 |39 4C17 14C35 |38 4C25 4C38 |37 4C27 4C37 |37 3C29 3C37 |36 3C31 3C36 |35 3C33 3C35 |35 2C35 2C35 |34 3C35 3C34 |33 3C37 2C34 |33 3C37 3C33 |33 2C39 2C33 |32 3C39 2C33 |32 3C39 2C33 |32 2C41 2C32 |32 2C41 2C32 |32 2C41 2C32 |32 2C41 2C32 |32 2C41 2C32 |32 2C41 2C32 |32 2C41 2C32 |32 2C41 2C32 |32 2C41 2C32 |33 2C39 4C31 |33 2C39 4C31 |33 2C39 4C31 |33 3C37 4C32 |34 2C37 2C34 |34 3C35 3C34 |35 2C35 2C35 |35 3C33 3C35 |36 3C31 3C36 |37 3C29 3C37 |37 4C27 4C37 |38 4C25 4C38 |39 4C23 4C39 |41 4C19 4C41 |42 5C15 5C42 |44 6C9 6C44 |46 17C46 |50 9C50 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 /59 15C35 |50 22CA36 |46 4C9 4C9 D36 |44 2C17 2C7 D36 |42 2C6 9C6 2C5 D36 |41 C5 3C6 2C 3C5 C4 D36 |39 2C4 2C11 2C2 2C4 3C D36 |38 C4 2C15 6C4 2CA36 |37 C4 C23 C4 3C35 |36 C4 C25 C4 C36 |35 2C3 C27 C3 C36 |34 2C3 C29 C3 C35 |33 2C3 C31 C3 C34 |33 2C2 C33 C2 C34 |32 2C3 C33 C3 C33 |32 C3 C35 C2 C33 |32 C3 C35 C3 C32 |31 2C2 C37 C2 C32 |31 C3 C37 C2 C32 |31 C3 C37 C2 C32 |31 C2 C39 C2 C31 |31 C2 C39 C2 C31 |31 C2 C39 C2 C31 |31 C2 C39 C2 C31 |31 C2 C39 C2 C31 |31 C2 C39 C2 C31 |31 C2 C39 C2 C31 |31 C2 C39 C2 C31 |31 C2 C39 C2 C31 |32 C2 C37 C4 2C29 |32 C2 C37 C4 2C29 |32 C2 C37 C4 C30 |32 C3 C35 C3 2C31 |33 C2 C35 C2 2C32 |33 C3 C33 C3 C33 |34 C2 C33 C2 C34 |34 C3 C31 C3 C34 |35 C3 C29 C3 C35 |36 C3 C27 C3 C36 |36 C4 C25 C4 C36 |37 C4 C23 C4 C37 |38 C4 2C19 2C4 C38 |39 2C4 2C15 2C4 2C39 |41 C5 3C9 3C5 C41 |42 2C6 9C6 2C42 |44 2C17 2C44 |46 4C9 4C46 |50 9C50 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 /59 3C3 C3 C3 C35 |50 C3 ~3 14CA36 |46 4C9 4C9 D36 |44 2C17 2C7 D36 |42 2C6 C4 4C6 2C5 F36 |41 C5 3C6 2C 3C5 C4 D36 |39 2C4 2C11 2C2 2C4 3C D36 |38 C4 2C15 2C3 C4 2CA36 |37 C4 C23 C4 3C35 |36 C4 C25 C4 C36 |35 2C3 C27 C3 C36 |34 2C3 C29 C3 C35 |33 2C3 C31 C3 C34 |32 C C2 C33 C2 C34 |31 3C3 C33 C3 C33 |31 2C3 C35 C2 C33 |30 2C4 C35 C3 C32 |30 C4 C37 C2 C32 |30 C4 C37 C2 C32 |30 2C3 C37 C2 C32 |31 C2 C39 C2 C31 |109 |109 |109 |109 |109 |109 |109 |31 C2 C39 C2 6C26 |32 C2 C37 C6 3C26 |32 C2 C37 C6 2C27 |32 C2 C37 C5 2C28 |32 C3 C35 C3 3C30 |33 C2 C35 C2 2C32 |33 C3 C33 C3 C33 |34 C2 C33 C2 C34 |34 C3 C31 C3 C34 |35 C3 C29 C3 C35 |36 C3 C27 C3 C36 |36 C4 C25 C4 C36 |37 C4 C23 C4 C37 |38 C4 2C19 2C4 C38 |39 2C4 2C15 2C4 2C39 |41 C5 3C9 3C5 C41 |42 2C6 C7 C6 2C42 |44 2C17 2C44 |46 4C9 4C46 |50 C7 C50 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 /59 15C35 |50 22CA36 |46 4C9 4C9 D36 |44 2C17 2C7 D36 |42 2C6 9C6 2C5 D36 |41 C5 3C6 2C 3C5 C4 D36 |39 2C4 2C11 2C2 2C4 3C D36 |38 C4 2C15 6C4 2CA36 |37 C4 C23 C4 3C35 |36 C4 C25 C4 C36 |35 2C3 C27 C3 C36 |34 2C3 C29 C3 C35 |33 2C3 C31 C3 C34 |32 C C2 C33 C2 C34 |31 C C3 C33 C3 C33 |30 C5 C35 C2 C33 |29 C6 C35 C3 C32 |29 C5 C37 C2 C32 |29 C5 C37 C2 C32 |29 C C3 C37 C2 C32 |29 3C2 C39 C2 C31 |31 C2 C39 C2 C31 |31 C2 C39 C2 C31 |31 C2 C39 C2 C31 |31 C2 C39 C2 C31 |31 C2 C39 C2 C31 |31 C2 C39 C2 C31 |31 C2 C39 C2 C2 4C25 |31 C2 C39 C2 3C3 2C24 |32 C2 C37 C9 2C24 |32 C2 C37 C7 2C26 |32 C2 C37 C5 3C27 |32 C3 C35 C3 3C30 |33 C2 C35 C2 2C32 |33 C3 C33 C3 C33 |34 C2 C33 C2 C34 |34 C3 C31 C3 C34 |35 C3 C29 C3 C35 |36 C3 C27 C3 C36 |36 C4 C25 C4 C36 |37 C4 C23 C4 C37 |38 C4 2C19 2C4 C38 |39 2C4 2C15 2C4 2C39 |41 C5 3C9 3C5 C41 |42 2C6 9C6 2C42 |44 2C17 2C44 |46 4C9 4C46 |50 9C50 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 /109 |59 15C35 |50 10C12 A36 |46 17C9 D36 |44 6C7 8C7 D36 |42 5C11 2C2 5C5 D36 |41 4C14 C4 4C4 A36 |39 4C17 14C35 |38 4C25 4C38 |37 4C27 4C37 |37 3C29 3C37 |36 3C31 3C36 |35 3C33 3C35 |32 5C35 2C35 |31 C2 3C35 3C34 |30 C4 C37 2C34 |29 C5 C37 3C33 |28 C5 C39 2C33 |27 2C4 2C39 2C33 |27 2C2 4C39 2C33 |26 8C41 2C32 |26 8C41 2C32 |27 2C3 2C41 2C32 |32 2C41 2C32 |32 2C41 2C32 |32 2C41 2C32 |32 2C41 2C5 3C24 |32 2C41 2C3 2C2 3C22 |32 2C41 5C5 2C22 |33 2C39 3C8 2C22 |33 2C39 3C4 4C24 |33 2C39 8C27 |33 3C37 3C33 |34 2C37 2C34 |34 3C35 3C34 |35 2C35 2C35 |35 3C33 3C35 |36 3C31 3C36 |37 3C29 3C37 |37 4C27 4C37 |38 4C25 4C38 |39 4C23 4C39 |41 4C19 4C41 |42 5C15 5C42 |44 6C9 6C44 |46 17C46 |50 9C50 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 /109 |109 |59 15C35 |59 13CA36 |59 13CA36 |59 13CA36 |60 14C35 |109 |109 |109 |109 |109 |109 |109 |31 4C74 |30 C3 C74 |29 C4 C74 |28 C5 C74 |27 C4 2C75 |26 C4 C77 |25 C4 2C77 |25 C3 3C77 |24 3C2 C79 |24 5C80 |25 2C82 |109 |82 5C22 |80 2C5 2C20 |78 2C7 3C19 |77 3C7 3C19 |77 12C20 |78 3C28 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 /109 |109 |109 |60 14C35 |60 14C35 |60 14C35 |109 |109 |109 |109 |109 |109 |109 |109 |47 15C47 |30 4C8 25C42 |29 C4 C3 33C38 |28 C5 13C15 12C35 |27 C4 10C25 9C33 |26 C5 7C31 8C31 |25 C5 5C37 7C29 |24 2C4 4C41 7C27 |23 2C4 3C45 7C25 |23 2C3 2C49 6C24 |22 3C2 C53 6C22 |21 6C56 5C21 |20 5C57 3C2 3C19 |19 5C58 C5 3C18 |17 5C58 3C4 5C17 |16 5C58 4C4 6C16 |15 5C59 2C2 11C15 |15 4C69 6C15 |14 4C72 5C14 |13 4C75 4C13 |12 4C77 4C12 |11 4C79 4C11 |11 4C79 4C11 |10 4C81 4C10 |9 4C83 4C9 |9 3C85 3C9 |8 4C85 4C8 |8 3C87 3C8 |7 4C87 4C7 |7 3C89 3C7 |6 4C89 4C6 |6 3C91 3C6 |5 4C91 4C5 |5 3C93 3C5 |4 4C93 4C4 |4 3C95 3C4 |4 3C95 3C4 |3 4C95 4C3 |3 3C97 3C3 |3 3C97 3C3 |3 3C97 3C3 |2 3C99 3C2 |2 3C99 3C2 |2 3C99 3C2 |2 3C99 3C2 |2 3C99 3C2 | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C |2 3C99 3C2 |2 3C99 3C2 |2 3C99 3C2 |2 3C99 3C2 |2 3C99 3C2 |3 3C97 3C3 |3 3C97 3C3 |3 3C97 3C3 |3 4C95 4C3 |4 3C95 3C4 |4 3C95 3C4 |4 4C93 4C4 |5 3C93 3C5 |5 4C91 4C5 |6 3C91 3C6 |6 4C89 4C6 |7 3C89 3C7 |7 4C87 4C7 |8 3C87 3C8 |8 4C85 4C8 |9 3C85 3C9 |9 4C83 4C9 |10 4C81 4C10 |11 4C79 4C11 |11 4C79 4C11 |12 4C77 4C12 |13 4C75 4C13 |14 4C73 4C14 |15 4C71 4C15 |15 5C69 5C15 |16 5C67 5C16 |17 5C65 5C17 |19 5C61 5C19 |20 5C59 5C20 |21 5C57 5C21 |22 6C53 6C22 |24 6C49 6C24 |25 7C45 7C25 |27 7C41 7C27 |29 7C37 7C29 |31 8C31 8C31 |33 9C25 9C33 |35 12C15 12C35 |38 33C38 |42 25C42 |47 15C47 |109 /109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |47 15C47 |42 5C15 5C42 |38 4C25 4C38 |30 4C 3C33 3C35 |28 7C12 15C12 2C33 |27 C4 C9 5C15 5C9 2C31 |26 C12 3C25 3C8 2C29 |25 C10 3C31 3C7 2C27 |24 2C8 2C37 2C7 2C25 |23 2C7 2C41 2C7 C24 |22 2C6 2C45 2C6 2C22 |21 C6 2C49 2C6 C21 |20 C5 2C53 2C5 C20 |19 C5 C57 C5 C19 |17 2C5 C58 C6 2C17 |16 C5 2C59 2C7 C16 |15 C5 C61 2C2 C5 C15 |14 C5 C64 4C5 C14 |14 C4 C69 C4 C14 |13 C4 C71 C4 C13 |12 C4 C72 2C4 C12 |11 C4 C75 C4 C11 |10 C4 C77 C4 C10 |10 C4 C77 C4 C10 |9 C4 C79 C4 C9 |8 C4 C81 C4 C8 |8 C3 C83 C3 C8 |7 C4 C83 C4 C7 |7 C3 C85 C3 C7 |6 C4 C85 C4 C6 |6 C3 C87 C3 C6 |5 C4 C87 C4 C5 |5 C3 C89 C3 C5 |4 C4 C89 C4 C4 |4 C3 C91 C3 C4 |3 C4 C91 C4 C3 |3 C3 C93 C3 C3 |3 C3 C93 C3 C3 |2 C4 C93 C4 C2 |2 C3 C95 C3 C2 |2 C3 C95 C3 C2 |2 C3 C95 C3 C2 | C3 C97 C3 C | C3 C97 C3 C | C3 C97 C3 C | C3 C97 C3 C | C3 C97 C3 C |C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C| C3 C97 C3 C | C3 C97 C3 C | C3 C97 C3 C | C3 C97 C3 C | C3 C97 C3 C |2 C3 C95 C3 C2 |2 C3 C95 C3 C2 |2 C3 C95 C3 C2 |2 C4 C93 C4 C2 |3 C3 C93 C3 C3 |3 C3 C93 C3 C3 |3 C4 C91 C4 C3 |4 C3 C91 C3 C4 |4 C4 C89 C4 C4 |5 C3 C89 C3 C5 |5 C4 C87 C4 C5 |6 C3 C87 C3 C6 |6 C4 C85 C4 C6 |7 C3 C85 C3 C7 |7 C4 C83 C4 C7 |8 C3 C83 C3 C8 |8 C4 C81 C4 C8 |9 C4 C79 C4 C9 |10 C4 C77 C4 C10 |10 C4 C77 C4 C10 |11 C4 C75 C4 C11 |12 C4 C73 C4 C12 |13 C4 C71 C4 C13 |14 C4 C69 C4 C14 |14 C5 C67 C5 C14 |15 C5 C65 C5 C15 |16 C5 2C61 2C5 C16 |17 2C5 C59 C5 2C17 |19 C5 C57 C5 C19 |20 C5 2C53 2C5 C20 |21 C6 2C49 2C6 C21 |22 2C6 2C45 2C6 2C22 |24 C7 2C41 2C7 C24 |25 2C7 2C37 2C7 2C25 |27 2C7 3C31 3C7 2C27 |29 2C8 3C25 3C8 2C29 |31 2C9 5C15 5C9 2C31 |33 2C12 15C12 2C33 |35 3C33 3C35 |38 4C25 4C38 |42 5C15 5C42 |47 15C47 /109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |47 15C47 |42 5C15 5C42 |38 4C25 4C38 |35 3C33 3C35 |33 2C12 15C12 2C33 |28 5C9 5C15 5C9 2C31 |27 2C10 3C25 3C8 2C29 |26 C9 3C31 3C7 2C27 |24 2C8 2C37 2C7 2C25 |23 2C7 2C41 2C7 C24 |22 2C6 2C45 2C6 2C22 |21 C6 2C49 2C6 C21 |20 C5 2C53 2C5 C20 |19 C5 C57 C5 C19 |17 2C5 C59 C5 2C17 |16 C5 2C61 C6 C16 |15 C5 C63 3C5 C15 |14 C5 C67 C5 C14 |14 C4 C69 C4 C14 |13 C4 C71 C4 C13 |12 C4 C72 2C4 C12 |11 C4 C75 C4 C11 |10 C4 C77 C4 C10 |10 C4 C77 C4 C10 |9 C4 C79 C4 C9 |8 C4 C81 C4 C8 |8 C3 C83 C3 C8 |7 C4 C83 C4 C7 |7 C3 C85 C3 C7 |6 C4 C85 C4 C6 |6 C3 C87 C3 C6 |5 C4 C87 C4 C5 |5 C3 C89 C3 C5 |4 C4 C89 C4 C4 |4 C3 C91 C3 C4 |3 C4 C91 C4 C3 |3 C3 C93 C3 C3 |3 C3 C93 C3 C3 |2 C4 C93 C4 C2 |2 C3 C95 C3 C2 |2 C3 C95 C3 C2 |2 C3 C95 C3 C2 | C3 C97 C3 C | C3 C97 C3 C | C3 C97 C3 C | C3 C97 C3 C | C3 C97 C3 C |C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C| C3 C97 C3 C | C3 C97 C3 C | C3 C97 C3 C | C3 C97 C3 C | C3 C97 C3 C |2 C3 C95 C3 C2 |2 C3 C95 C3 C2 |2 C3 C95 C3 C2 |2 C4 C93 C4 C2 |3 C3 C93 C3 C3 |3 C3 C93 C3 C3 |3 C4 C91 C4 C3 |4 C3 C91 C3 C4 |4 C4 C89 C4 C4 |5 C3 C89 C3 C5 |5 C4 C87 C4 C5 |6 C3 C87 C3 C6 |6 C4 C85 C4 C6 |7 C3 C85 C3 C7 |7 C4 C83 C4 C7 |8 C3 C83 C3 C8 |8 C4 C81 C4 C8 |9 C4 C79 C4 C9 |10 C4 C77 C4 C10 |10 C4 C77 C4 C10 |11 C4 C75 C4 C11 |12 C4 C73 C4 C12 |13 C4 C71 C4 C13 |14 C4 C69 C4 C14 |14 C5 C67 C5 C14 |15 C5 C65 C5 C15 |16 C5 2C61 2C5 C16 |17 2C5 C59 C5 2C17 |19 C5 C57 C5 C19 |20 C5 2C53 2C5 C20 |21 C6 2C49 2C6 C21 |22 2C6 2C45 2C6 2C22 |24 C7 2C41 2C7 C24 |25 2C7 2C37 2C7 2C25 |27 2C7 3C31 3C7 2C27 |29 2C8 3C25 3C8 2C29 |31 2C9 5C15 5C9 2C31 |33 2C12 15C12 2C33 |35 3C33 3C35 |38 4C25 4C38 |42 5C15 5C42 |47 15C47 /109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |47 15C47 |42 5C15 5C42 |38 4C25 4C38 |35 3C33 3C35 |33 2C12 15C12 2C33 |31 2C9 5C15 5C9 2C31 |29 2C8 3C25 3C8 2C29 |27 2C7 3C31 3C7 2C27 |24 3C7 2C37 2C7 2C25 |23 2C7 2C41 2C7 C24 |22 2C6 2C45 2C6 2C22 |21 C6 2C49 2C6 C21 |20 C5 2C53 2C5 C20 |19 C5 C57 C5 C19 |17 2C5 C59 C5 2C17 |16 C5 2C61 2C5 C16 |15 C5 C65 C5 C15 |14 C5 C67 C5 C14 |14 C4 C69 C4 C14 |13 C4 C71 C4 C13 |12 C4 C72 2C4 C12 |11 C4 C75 C4 C11 |10 C4 C77 C4 C10 |10 C4 C77 C4 C10 |9 C4 C79 C4 C9 |8 C4 C81 C4 C8 |8 C3 C83 C3 C8 |7 C4 C83 C4 C7 |7 C3 C85 C3 C7 |6 C4 C85 C4 C6 |6 C3 C87 C3 C6 |5 C4 C87 C4 C5 |5 C3 C89 C3 C5 |4 C4 C89 C4 C4 |4 C3 C91 C3 C4 |3 C4 C91 C4 C3 |3 C3 C93 C3 C3 |3 C3 C93 C3 C3 |2 C4 C93 C4 C2 |2 C3 C95 C3 C2 |2 C3 C95 C3 C2 |2 C3 C95 C3 C2 | C3 C97 C3 C | C3 C97 C3 C | C3 C97 C3 C | C3 C97 C3 C | C3 C97 C3 C |C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C|C3 C99 C3 C| C3 C97 C3 C | C3 C97 C3 C | C3 C97 C3 C | C3 C97 C3 C | C3 C97 C3 C |2 C3 C95 C3 C2 |2 C3 C95 C3 C2 |2 C3 C95 C3 C2 |2 C4 C93 C4 C2 |3 C3 C93 C3 C3 |3 C3 C93 C3 C3 |3 C4 C91 C4 C3 |4 C3 C91 C3 C4 |4 C4 C89 C4 C4 |5 C3 C89 C3 C5 |5 C4 C87 C4 C5 |6 C3 C87 C3 C6 |6 C4 C85 C4 C6 |7 C3 C85 C3 C7 |7 C4 C83 C4 C7 |8 C3 C83 C3 C8 |8 C4 C81 C4 C8 |9 C4 C79 C4 C9 |10 C4 C77 C4 C10 |10 C4 C77 C4 C10 |11 C4 C75 C4 C11 |12 C4 C73 C4 C12 |13 C4 C71 C4 C13 |14 C4 C69 C4 C14 |14 C5 C67 C5 C14 |15 C5 C65 C5 C15 |16 C5 2C61 2C5 C16 |17 2C5 C59 C5 2C17 |19 C5 C57 C5 C19 |20 C5 2C53 2C5 C20 |21 C6 2C49 2C6 C21 |22 2C6 2C45 2C6 2C22 |24 C7 2C41 2C7 C24 |25 2C7 2C37 2C7 2C25 |27 2C7 3C31 3C7 2C27 |29 2C8 3C25 3C8 2C29 |31 2C9 5C15 5C9 2C31 |33 2C12 15C12 2C33 |35 3C33 3C35 |38 4C25 4C38 |42 5C15 5C42 |47 15C47 /109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |109 |47 15C47 |42 25C42 |38 33C38 |35 12C15 12C35 |33 9C25 9C33 |31 8C31 8C31 |29 7C37 7C29 |27 7C41 7C27 |25 7C45 7C25 |24 6C49 6C24 |22 6C53 6C22 |21 5C57 5C21 |20 5C59 5C20 |19 5C61 5C19 |17 5C65 5C17 |16 5C67 5C16 |15 5C69 5C15 |15 4C71 4C15 |14 4C73 4C14 |13 4C75 4C13 |12 4C77 4C12 |11 4C79 4C11 |11 4C79 4C11 |10 4C81 4C10 |9 4C83 4C9 |9 3C85 3C9 |8 4C85 4C8 |8 3C87 3C8 |7 4C87 4C7 |7 3C89 3C7 |6 4C89 4C6 |6 3C91 3C6 |5 4C91 4C5 |5 3C93 3C5 |4 4C93 4C4 |4 3C95 3C4 |4 3C95 3C4 |3 4C95 4C3 |3 3C97 3C3 |3 3C97 3C3 |3 3C97 3C3 |2 3C99 3C2 |2 3C99 3C2 |2 3C99 3C2 |2 3C99 3C2 |2 3C99 3C2 | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C | 3C101 3C |2 3C99 3C2 |2 3C99 3C2 |2 3C99 3C2 |2 3C99 3C2 |2 3C99 3C2 |3 3C97 3C3 |3 3C97 3C3 |3 3C97 3C3 |3 4C95 4C3 |4 3C95 3C4 |4 3C95 3C4 |4 4C93 4C4 |5 3C93 3C5 |5 4C91 4C5 |6 3C91 3C6 |6 4C89 4C6 |7 3C89 3C7 |7 4C87 4C7 |8 3C87 3C8 |8 4C85 4C8 |9 3C85 3C9 |9 4C83 4C9 |10 4C81 4C10 |11 4C79 4C11 |11 4C79 4C11 |12 4C77 4C12 |13 4C75 4C13 |14 4C73 4C14 |15 4C71 4C15 |15 5C69 5C15 |16 5C67 5C16 |17 5C65 5C17 |19 5C61 5C19 |20 5C59 5C20 |21 5C57 5C21 |22 6C53 6C22 |24 6C49 6C24 |25 7C45 7C25 |27 7C41 7C27 |29 7C37 7C29 |31 8C31 8C31 |33 9C25 9C33 |35 12C15 12C35 |38 33C38 |42 25C42 |47 15C47 |109 "), kinds: {"C":"gCollider","A":"gShieldedAccelerator","D":"glass","F":"gCollider","~":"gLargeHadronColliderController"} },
  },
  {
    slug: "matter-fabrication-cpu",
    name: "Matter Fabrication CPU",
    title: "ЦПУ генератора материи",
    tier: "uv",
    summary: "Массово делает UU-усилитель и UU-материю: 8 рецептов за ярус.",
    story: ["В игре по-русски — «ЦПУ генератора материи». Он массово делает UU-усилитель, UU-материю и утиль: за 80 % энергии и по 8 рецептов за ярус.","Рядом обычно ставят элементальный дубликатор — он тратит UU-материю."],
    facts: [{"label":"Размер","value":"5 × 4 × 5"},{"label":"Блоков","value":"82"},{"label":"Ярус в вики","value":"UV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/production/MTEMassFabricator.java",
    def: { layers: unpackLayers("5C|5C|5C|5C|5C/C3GC|G3 G|G3 G|G3 G|C3GC/C3GC|G3 G|G3 G|G3 G|C3GC/2C~2C|C3HC|C3HC|C3HC|5C"), kinds: {"C":"gMatterFabricator","H":"gMatterGenerationCoil","G":"gContainment","~":"gMatterFabricationCpuController"} },
  },
  {
    slug: "pcb-factory",
    name: "PCB Factory",
    title: "Завод печатных плат",
    tier: "uv",
    summary: "Платы за один шаг и дешевле; только он делает оптические платы.",
    story: ["В игре по-русски — «Завод печатных плат». Он делает платы намного выгоднее большого химического реактора: в один шаг, а на биоплаты уходит гораздо меньше ресурсов.","Только он умеет делать оптические платы. У завода три уровня постройки и улучшения — биокамера и башня охлаждения. Здесь показан первый уровень."],
    facts: [{"label":"Размер","value":"7 × 6 × 7"},{"label":"Блоков","value":"189"},{"label":"Ярус в вики","value":"UV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/pcb/MTEPCBFactory.java",
    def: { layers: unpackLayers("7 |E5 E|E5 E|7E|E5 E|E5 E|7 /7E|C5AC|C5AC|7C|7C|7C|E5 E/E5AE|C5 C|C5 C|C5 C|C5 C|C5 C|E5CE/E5AE|C5 C|B5 B|B5 B|B5 B|C5 C|E5CE/E5AE|C5 C|B 3F B|B 3F B|B 3F B|C5 C|E5PE/E2C~2CE|C5DC|C5DC|C5DC|C5DC|C5DC|E5PE"), kinds: {"A":"glass","B":"gGrate","C":"gPcbTier1","D":"gBlockPlascrete","E":"gFrameDamascussteel","F":"gFrameVibrantalloy","P":"gPcbTier1","~":"gPcbFactoryController"} },
  },
  {
    slug: "nano-forge",
    name: "Nano Forge",
    title: "Нано кузница",
    tier: "uv",
    summary: "Единственная машина, которая делает наниты.",
    story: ["В игре по-русски — «Нано кузница». Только она делает наниты — микроскопических роботов. У неё четыре уровня; каждому нужен свой нанит в контроллере.","Второй и третий уровни пристраивают вокруг первой постройки, четвёртый — совсем другой. Здесь показан первый уровень."],
    facts: [{"label":"Размер","value":"9 × 38 × 10"},{"label":"Блоков","value":"698"},{"label":"Ярус в вики","value":"UV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTENanoForge.java",
    def: { layers: unpackLayers("9 |9 |4 F4 |4 C4 |4 C4 |4 C4 |4 C4 |4 F4 |9 |9 /9 |9 |4 F4 |4 C4 |4 C4 |4 C4 |4 C4 |4 F4 |9 |9 /9 |9 |4 F4 |4 C4 |4 C4 |4 C4 |4 C4 |4 F4 |9 |9 /9 |9 |4 F4 |4 C4 |4 C4 |4 C4 |4 C4 |4 F4 |9 |9 /9 |9 |4 F4 |4 C4 |4 C4 |4 C4 |4 C4 |4 F4 |9 |9 /9 |9 |3 FCF3 |3 C C3 |3 C C3 |3 C C3 |3 C C3 |3 FCF3 |9 |9 /9 |9 |3 FCF3 |3 C C3 |3 C C3 |3 C C3 |3 C C3 |3 FCF3 |9 |9 /9 |9 |3 FCF3 |3 C C3 |3 C C3 |3 C C3 |3 C C3 |3 FCF3 |9 |9 /9 |9 |3 FCF3 |3 C C3 |3 C C3 |3 C C3 |3 C C3 |3 FCF3 |9 |9 /9 |9 |3 FCF3 |3 C C3 |3 C C3 |3 C C3 |3 C C3 |3 FCF3 |9 |9 /9 |9 |3 FCF3 |3 C C3 |3 C C3 |3 C C3 |3 C C3 |3 FCF3 |9 |9 /9 |9 |3 FCF3 |3 C C3 |3 C C3 |3 C C3 |3 C C3 |3 FCF3 |9 |9 /9 |9 |3 FCF3 |3 C C3 |3 C C3 |3 C C3 |3 C C3 |3 FCF3 |9 |9 /9 |9 |3 FCF3 |3 C C3 |3 C C3 |3 C C3 |3 C C3 |3 FCF3 |9 |9 /9 |3 FCF3 |2 FC CF2 |3 C C3 |3 C C3 |3 C C3 |3 C C3 |2 FC CF2 |3 FCF3 |9 /9 |3 FCF3 |2 FC CF2 |3 C C3 |3 C C3 |3 C C3 |3 C C3 |2 FC CF2 |3 FCF3 |9 /9 |3 FCF3 |2 FC CF2 |2 C3 C2 |2 C3 C2 |2 C3 C2 |2 C3 C2 |2 FC CF2 |3 FCF3 |9 /9 |3 FCF3 |2 FC CF2 |2 C3 C2 |2 C3 C2 |2 C3 C2 |2 C3 C2 |2 FC CF2 |3 FCF3 |9 /4 C4 |3 FCF3 |2 2C 2C2 |2 C3 C2 |2 C3 C2 |2 C3 C2 |2 C3 C2 |2 2C 2C2 |3 FCF3 |4 C4 /4 C4 |3 FCF3 |2 2C 2C2 |2 C3 C2 |2 C3 C2 |2 C3 C2 |2 C3 C2 |2 2C 2C2 |3 FCF3 |4 C4 /4 C4 |3 FCF3 |2 2C 2C2 |2 C3 C2 |2 C3 C2 |2 C3 C2 |2 C3 C2 |2 2C 2C2 |3 FCF3 |4 C4 /4 C4 |3 FCF3 |2 2C 2C2 | 2C3 2C | 2C3 2C | 2C3 2C | 2C3 2C |2 2C 2C2 |3 FCF3 |4 C4 /4 C4 |3 FCF3 |2 2C 2C2 | 2C3 2C | 2C3 2C | 2C3 2C | 2C3 2C |2 2C 2C2 |3 FCF3 |4 C4 /4 C4 |3 FCF3 |2 2C 2C2 |2 C3 C2 |2 C3 C2 |2 C3 C2 |2 C3 C2 |2 2C 2C2 |3 FCF3 |4 C4 /4 C4 |3 FCF3 |2 2C 2C2 |2 C3 C2 |2 C3 C2 |2 C3 C2 |2 C3 C2 |2 2C 2C2 |3 FCF3 |4 C4 /4 C4 |3 FCF3 |2 2C 2C2 |2 C3 C2 |2 C3 C2 |2 C3 C2 |2 C3 C2 |2 2C 2C2 |3 FCF3 |4 C4 /9 |3 FCF3 |2 FC CF2 |2 C3 C2 |2 C3 C2 |2 C3 C2 |2 C3 C2 |2 FC CF2 |3 FCF3 |9 /9 |3 FCF3 |2 FC CF2 |2 C3 C2 |2 C3 C2 |2 C3 C2 |2 C3 C2 |2 FC CF2 |3 FCF3 |9 /9 |3 FCF3 |2 FC CF2 |3 C C3 |3 C C3 |3 C C3 |3 C C3 |2 FC CF2 |3 FCF3 |9 /9 |3 FCF3 |2 FC CF2 |3 C C3 |3 C C3 |3 C C3 |3 C C3 |2 FC CF2 |3 FCF3 |9 /9 |9 |3 FCF3 |3 C C3 |3 C C3 |3 C C3 |3 C C3 |3 FCF3 |9 |9 /9 |9 |3 FCF3 |3 C C3 |3 C C3 |3 C C3 |3 C C3 |3 FCF3 |9 |9 /9 |9 |3 FCF3 |3 C C3 |3 C C3 |3 C C3 |3 C C3 |3 FCF3 |9 |9 /9 |9 |3 FCF3 |3 C C3 |3 C C3 |3 C C3 |3 C C3 |3 FCF3 |9 |9 /9 |9 |3 FCF3 |3 C C3 |3 C C3 |3 C C3 |3 C C3 |3 FCF3 |9 |9 /9 |9 |3 FCF3 |3 C C3 |3 C C3 |3 C C3 |3 C C3 |3 FCF3 |9 |9 /9 |9 |3 FCF3 |3 C C3 |3 C C3 |3 C C3 |3 C C3 |3 FCF3 |9 |9 /9 |2 2B~2B2 | 7B |9B|9B|9B|9B| 7B |2 5B2 |9 "), kinds: {"F":"gFrameStellaralloy","C":"gRadiantNaquadahAlloy","B":"gRadiantNaquadahAlloy","~":"gNanoForgeController"} },
  },
  {
    slug: "research-station",
    name: "Research Station",
    title: "Исследовательская станция",
    tier: "uv",
    summary: "Исследует рецепты сборочной линии на флешки — за энергию и вычисления.",
    story: ["В игре по-русски — «Исследовательская станция». Она записывает на флешки рецепты сборочных линий, как сканер, но кроме энергии требует вычисления от квантового компьютера.","У неё два режима, которые переключает игрок: исследование и сканирование."],
    facts: [{"label":"Размер","value":"3 × 7 × 7"},{"label":"Блоков","value":"100"},{"label":"Ярус в вики","value":"UV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/tectech/thing/metaTileEntity/multi/MTEResearchStation.java",
    def: { layers: unpackLayers("3 | A | A |3A|3A|3A|3A/3A|ACA|ACA|ACA|BCB|BCB|3B/3 | C |3 |3 |AFA|3C|3D/3 | E |3 |3 |A~A|3C|3D/3 | C |3 |3 |AFA|3C|3D/3A|ACA|ACA|ACA|BCB|BCB|3B/3 | A | A |3A|3A|3A|3A"), kinds: {"A":"gEmPc","B":"gEmPcVent","C":"gEmPcAdv","D":"gEmPc","E":"gEmPc","F":"gEmPcAdv","~":"gResearchStationController"} },
  },
  {
    slug: "quantum-computer",
    name: "Quantum Computer",
    title: "Квантовый компьютер",
    tier: "uv",
    summary: "Даёт вычисления исследовательской станции; главное — не перегреть.",
    story: ["В игре по-русски — «Квантовый компьютер». Он производит вычисления для исследовательской станции и ещё нескольких построек. Впервые нужен для флешки мейнфрейма UHV и остаётся нужным до UXV.","Компьютер набирают срезами со стойками — до двенадцати. Здесь показаны два среза. Стойки греются: без охлаждения детали сгорят."],
    facts: [{"label":"Размер","value":"2 × 4 × 6"},{"label":"Блоков","value":"48"},{"label":"Ярус в вики","value":"UV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/tectech/thing/metaTileEntity/multi/MTEQuantumComputer.java",
    def: { layers: unpackLayers("2A|CB|CB|CB|CB|2A/2A|2D|ED|ED|2D|2A/~A|2D|ED|ED|2D|2A/2A|CB|CB|CB|CB|2A"), kinds: {"B":"gEmPc","C":"gEmPcVent","D":"gEmPcAdv","A":"gEmPc","E":"gEmPcAdv","~":"gQuantumComputerController"} },
  },
  {
    slug: "space-elevator",
    name: "Space Elevator",
    title: "Космический лифт",
    tier: "uv",
    summary: "Башня с тросом в космос: до 24 модулей добывают руду и жидкости с других планет.",
    story: ["Космический лифт принимает до 24 модулей: они добывают руду и качают жидкости с других планет и собирают предметы в космосе. Лифт даже мгновенно перевозит игрока на другие планеты — без ракетного топлива.","У лифта пять уровней моторов; каждый открывает больше мест под модули. Модули T2 и T3 появляются в UMV и UXV. Здесь показано основание лифта."],
    facts: [{"label":"Размер","value":"35 × 43 × 35"},{"label":"Блоков","value":"2 711"},{"label":"Ярус в вики","value":"UV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtnhintergalactic/tile/multi/elevator/TileEntitySpaceElevator.java",
    def: { layers: unpackLayers("35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |16 3F16 |15 F D F15 |14 F5 F14 |14 FD3 DF14 |14 F5 F14 |15 F D F15 |16 3F16 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |17 E17 |17 D17 |35 |14 ED3 DE14 |35 |17 D17 |17 E17 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |17 E17 |17 D17 |35 |14 ED3 DE14 |35 |17 D17 |17 E17 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |17 E17 |17 D17 |35 |14 ED3 DE14 |35 |17 D17 |17 E17 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |17 E17 |17 D17 |35 |14 ED3 DE14 |35 |17 D17 |17 E17 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |17 E17 |17 D17 |35 |14 ED3 DE14 |35 |17 D17 |17 E17 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |16 3F16 |15 F3 F15 |14 F2 D2 F14 |13 F7 F13 |13 F D3 D F13 |13 F7 F13 |14 F2 D2 F14 |15 F3 F15 |16 3F16 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |16 E E16 |35 |14 E5 E14 |17 D17 |12 E9 E12 |15 D3 D15 |12 E9 E12 |17 D17 |14 E5 E14 |35 |16 E E16 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |15 DE ED15 |35 |14 E5 E14 |12 D4 D4 D12 |12 E9 E12 |15 D3 D15 |12 E9 E12 |12 D4 D4 D12 |14 E5 E14 |35 |15 DE ED15 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |15 DE ED15 |35 |14 E5 E14 |12 D4 D4 D12 |12 E9 E12 |15 D3 D15 |12 E9 E12 |12 D4 D4 D12 |14 E5 E14 |35 |15 DE ED15 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |15 DE ED15 |35 |14 E5 E14 |12 D4 D4 D12 |12 E9 E12 |15 D3 D15 |12 E9 E12 |12 D4 D4 D12 |14 E5 E14 |35 |15 DE ED15 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |15 DE ED15 |35 |14 E5 E14 |12 D4 D4 D12 |12 E9 E12 |15 D3 D15 |12 E9 E12 |12 D4 D4 D12 |14 E5 E14 |35 |15 DE ED15 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |15 DE ED15 |35 |14 E5 E14 |12 D4 D4 D12 |12 E9 E12 |15 D3 D15 |12 E9 E12 |12 D4 D4 D12 |14 E5 E14 |35 |15 DE ED15 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |15 DE ED15 |35 |14 E5 E14 |12 D4 D4 D12 |12 E9 E12 |15 D3 D15 |12 E9 E12 |12 D4 D4 D12 |14 E5 E14 |35 |15 DE ED15 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |16 E E16 |15 DE ED15 |13 E7 E13 |14 E5 E14 |12 D4 D4 D12 |11 2E9 2E11 |15 D3 D15 |11 2E9 2E11 |12 D4 D4 D12 |14 E5 E14 |13 E7 E13 |15 DE ED15 |16 E E16 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |15 DE ED15 |15 DE ED15 |13 E7 E13 |14 E5 E14 |11 2D4 D4 2D11 |11 2E9 2E11 |15 D3 D15 |11 2E9 2E11 |11 2D4 D4 2D11 |14 E5 E14 |13 E7 E13 |15 DE ED15 |15 DE ED15 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |15 DE ED15 |35 |13 E7 E13 |35 |11 D5 D5 D11 |11 E11 E11 |15 D3 D15 |11 E11 E11 |11 D5 D5 D11 |35 |13 E7 E13 |35 |15 DE ED15 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |15 DE ED15 |35 |13 E7 E13 |35 |11 D5 D5 D11 |11 E11 E11 |15 D B D15 |11 E11 E11 |11 D5 D5 D11 |35 |13 E7 E13 |35 |15 DE ED15 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |15 DE ED15 |35 |13 E7 E13 |16 3F16 |11 D3 F D F3 D11 |11 E2 F5 F2 E11 |14 FD3 DF14 |11 E2 F5 F2 E11 |11 D3 F D F3 D11 |16 3F16 |13 E7 E13 |35 |15 DE ED15 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |15 DE ED15 |35 |13 E7 E13 |35 |11 D5 C5 D11 |11 E11 E11 |15 C3 C15 |11 E11 E11 |11 D5 C5 D11 |35 |13 E7 E13 |35 |15 DE ED15 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |15 DE ED15 |35 |13 E7 E13 |35 |11 D5 C5 D11 |11 E11 E11 |15 C3 C15 |11 E11 E11 |11 D5 C5 D11 |35 |13 E7 E13 |35 |15 DE ED15 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |15 DE ED15 |13 2H5 2H13 |12 HE7 EH12 |12 H9 H12 |11 D5 C5 D11 |11 E11 E11 |15 C3 C15 |11 E11 E11 |11 D5 C5 D11 |12 H9 H12 |12 HE7 EH12 |13 2H5 2H13 |15 DE ED15 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |16 E E16 |15 DE ED15 |12 E9 E12 |13 E7 E13 |35 |11 D5 C5 D11 |10 2E11 2E10 |15 C3 C15 |10 2E11 2E10 |11 D5 C5 D11 |35 |13 E7 E13 |12 E9 E12 |15 DE ED15 |16 E E16 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |15 DE ED15 |15 DE ED15 |12 E9 E12 |13 E7 E13 |35 |10 2D5 C5 2D10 |10 2E11 2E10 |15 C3 C15 |10 2E11 2E10 |10 2D5 C5 2D10 |35 |13 E7 E13 |12 E9 E12 |15 DE ED15 |15 DE ED15 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |15 DE ED15 |35 |12 E9 E12 |35 |35 |10 D6 C6 D10 |10 E13 E10 |15 C3 C15 |10 E13 E10 |10 D6 C6 D10 |35 |35 |12 E9 E12 |35 |15 DE ED15 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |15 DE ED15 |35 |12 E9 E12 |35 |35 |10 D6 C6 D10 |10 E13 E10 |15 C3 C15 |10 E13 E10 |10 D6 C6 D10 |35 |35 |12 E9 E12 |35 |15 DE ED15 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |16 E E16 |15 DE ED15 |11 E11 E11 |12 E9 E12 |35 |35 |10 D6 C6 D10 |9 2E13 2E9 |15 C3 C15 |9 2E13 2E9 |10 D6 C6 D10 |35 |35 |12 E9 E12 |11 E11 E11 |15 DE ED15 |16 E E16 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |15 DE ED15 |15 DE ED15 |11 E11 E11 |12 E9 E12 |35 |35 |9 2D6 C6 2D9 |9 2E13 2E9 |15 C3 C15 |9 2E13 2E9 |9 2D6 C6 2D9 |35 |35 |12 E9 E12 |11 E11 E11 |15 DE ED15 |15 DE ED15 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |15 DE ED15 |10 E13 E10 |11 E11 E11 |35 |35 |16 3F16 |9 D5 FDCDF5 D9 |9 E4 FD3 DF4 E9 |14 FC3 CF14 |9 E4 FD3 DF4 E9 |9 D5 FDCDF5 D9 |16 3F16 |35 |35 |11 E11 E11 |10 E13 E10 |15 DE ED15 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |16 E E16 |15 DE ED15 |10 E13 E10 |11 E11 E11 |35 |35 |35 |9 D6 DCD6 D9 |8 2E5 D3 D5 2E8 |15 C3 C15 |8 2E5 D3 D5 2E8 |9 D6 DCD6 D9 |35 |35 |35 |11 E11 E11 |10 E13 E10 |15 DE ED15 |16 E E16 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |15 DE ED15 |15 DE ED15 |10 E13 E10 |11 E11 E11 |35 |35 |35 |8 2D6 DCD6 2D8 |8 2E5 D3 D5 2E8 |15 C3 C15 |8 2E5 D3 D5 2E8 |8 2D6 DCD6 2D8 |35 |35 |35 |11 E11 E11 |10 E13 E10 |15 DE ED15 |15 DE ED15 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |15 DE ED15 |35 |10 E13 E10 |35 |35 |35 |35 |8 D7 DCD7 D8 |8 E6 D3 D6 E8 |15 C3 C15 |8 E6 D3 D6 E8 |8 D7 DCD7 D8 |35 |35 |35 |35 |10 E13 E10 |35 |15 DE ED15 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |16 E E16 |15 DE ED15 |9 E15 E9 |10 E13 E10 |35 |35 |35 |35 |8 D7 DCD7 D8 |7 2E6 D3 D6 2E7 |15 C3 C15 |7 2E6 D3 D6 2E7 |8 D7 DCD7 D8 |35 |35 |35 |35 |10 E13 E10 |9 E15 E9 |15 DE ED15 |16 E E16 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |14 HDE EDH14 |12 2H DE ED 2H12 |9 E2H11 2HE9 |9 HE13 EH9 |9 H15 H9 |8 H17 H8 |8 H17 H8 |7 H19 H7 |7 2D6 2DC2D6 2D7 |7 2E6 D3 D6 2E7 |15 C3 C15 |7 2E6 D3 D6 2E7 |7 2D6 2DC2D6 2D7 |7 H19 H7 |8 H17 H8 |8 H17 H8 |9 H15 H9 |9 HE13 EH9 |9 E2H11 2HE9 |12 2H DE ED 2H12 |14 HDE EDH14 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |15 DE ED15 |35 |9 E15 E9 |35 |35 |35 |35 |35 |7 D7 D C D7 D7 |7 E19 E7 |15 C3 C15 |7 E19 E7 |7 D7 D C D7 D7 |35 |35 |35 |35 |35 |9 E15 E9 |35 |15 DE ED15 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |16 E E16 |15 DE ED15 |35 |9 E15 E9 |35 |35 |35 |35 |35 |7 D7 D C D7 D7 |6 2E19 2E6 |15 C3 C15 |6 2E19 2E6 |7 D7 D C D7 D7 |35 |35 |35 |35 |35 |9 E15 E9 |35 |15 DE ED15 |16 E E16 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |15 DE ED15 |15 DE ED15 |35 |9 E15 E9 |35 |35 |35 |35 |35 |6 2D7 D C D7 2D6 |6 2E19 2E6 |15 C3 C15 |6 2E19 2E6 |6 2D7 D C D7 2D6 |35 |35 |35 |35 |35 |9 E15 E9 |35 |15 DE ED15 |15 DE ED15 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |16 E E16 |15 DE ED15 |35 |35 |9 E15 E9 |35 |35 |35 |35 |35 |6 D8 D C D8 D6 |5 2E21 2E5 |15 C3 C15 |5 2E21 2E5 |6 D8 D C D8 D6 |35 |35 |35 |35 |35 |9 E15 E9 |35 |35 |15 DE ED15 |16 E E16 |35 |35 |35 |35 |35 /35 |35 |35 |35 |16 E E16 |15 DE ED15 |15 DE ED15 |35 |15 M M M15 |9 E5 M M M5 E9 |35 |35 |35 |35 |16 3X16 |5 2D 2M5 XDCDX5 2M 2D5 |4 3E7 XD3 DX7 3E4 |8 2M4 XC3 CX4 2M8 |4 3E7 XD3 DX7 3E4 |5 2D 2M5 XDCDX5 2M 2D5 |16 3X16 |35 |35 |35 |35 |9 E5 M M M5 E9 |15 M M M15 |35 |15 DE ED15 |15 DE ED15 |16 E E16 |35 |35 |35 |35 /35 |35 |35 |16 E E16 |15 DE ED15 |15 DE ED15 |35 |35 |15 M M M15 |9 E5 I I I5 E9 |35 |35 |35 |35 |16 X~X16 |4 2D2 MI5 XDCDX5 IM2 2D4 |3 3E8 XD3 DX8 3E3 |8 MI4 XC3 CX4 IM8 |3 3E8 XD3 DX8 3E3 |4 2D2 MI5 XDCDX5 IM2 2D4 |16 3X16 |35 |35 |35 |35 |9 E5 I I I5 E9 |15 M M M15 |35 |35 |15 DE ED15 |15 DE ED15 |16 E E16 |35 |35 |35 /35 |15 D3 D15 |12 4DE E4D12 |10 2D3 DE ED3 2D10 |15 D3 D15 |35 |35 |35 |15 M M M15 |9 E5 M M M5 E9 |3 D27 D3 |3 D27 D3 |2 D29 D2 |2 D29 D2 |2 D13 3X13 D2 | 4D3 2M5 XDCDX5 2M3 4D |2 2E10 XD3 DX10 2E2 |8 2M4 XC3 CX4 2M8 |2 2E10 XD3 DX10 2E2 | 4D3 2M5 XDCDX5 2M3 4D |2 D13 3X13 D2 |2 D29 D2 |2 D29 D2 |3 D27 D3 |3 D27 D3 |9 E5 M M M5 E9 |15 M M M15 |35 |35 |35 |15 D3 D15 |10 2D3 DE ED3 2D10 |12 4DE E4D12 |15 D3 D15 |35 /15 2F 2F15 |12 5F 5F12 |10 7F 7F10 |9 6FD3 D6F9 |9 3F11 3F9 |35 |35 |35 |15 M M M15 |3 2F4 E5 M M M5 E4 2F3 |2 3F10 F F F10 3F2 |2 3F10 F F F10 3F2 | 3F10 7F10 3F | 3F9 9F9 3F | 3F8 11F8 3F |3FD4 2M5F5D5F2M4 D3F|3F9 3F5D3F9 3F|8 2M5F5D5F2M8 |3F9 3F5D3F9 3F|3FD4 2M5F5D5F2M4 D3F| 3F8 11F8 3F | 3F9 9F9 3F | 3F10 7F10 3F |2 3F10 F F F10 3F2 |2 3F10 F F F10 3F2 |3 2F4 E5 M M M5 E4 2F3 |15 M M M15 |35 |35 |35 |9 3F11 3F9 |9 6FD3 D6F9 |10 7F 7F10 |12 5F 5F12 |15 2F 2F15 /15 5A15 |12 11A12 |10 15A10 |8 19A8 |7 21A7 |6 23A6 |5 25A5 |4 27A4 |3 12AM M M12A3 |3 12AM M M12A3 |2 13A5 13A2 |2 13A5 13A2 | 33A | 33A | 33A |8A2M2 3A5X3A2 2M8A|8A4 3A5X3A4 8A|8A2M2 3A5X3A2 2M8A|8A4 3A5X3A4 8A|8A2M2 3A5X3A2 2M8A| 33A | 33A | 33A |2 13A5 13A2 |2 13A5 13A2 |3 12AM M M12A3 |3 12AM M M12A3 |4 27A4 |5 25A5 |6 23A6 |7 21A7 |8 19A8 |10 15A10 |12 11A12 |15 5A15 "), kinds: {"E":"gSupportStructureSide","B":"gCable","X":"gBase","M":"gBase","H":"gFrameNeutronium","F":"gInternalStructureSid","C":"gMotorT1Side","A":"gFloorSide","D":"gBase","I":"gBase","~":"gSpaceElevatorController"} },
  },
  {
    slug: "concrete-backfiller",
    name: "Concrete Backfiller",
    title: "Бетонный заполнитель",
    tier: "mv",
    summary: "Заливает пустоты под собой светлым бетоном, чтобы там не появлялись мобы.",
    story: ["В игре по-русски — «Бетонный заполнитель». Он заливает область под собой светлым бетоном — от коренной породы до слоя под машиной, в радиусе до 64 блоков, — чтобы в пустотах не появлялись мобы.","Постройка — как у буровой: вышка три на три. Есть две модели; у второй радиус больше."],
    facts: [{"label":"Размер","value":"3 × 7 × 3"},{"label":"Блоков","value":"27"},{"label":"Ярус в вики","value":"MV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEConcreteBackfiller1.java",
    def: { layers: unpackLayers("3 | f |3 /3 | f |3 /3 | f |3 / f |fcf| f / f |fcf| f / f |fcf| f /b~b|3b|3b"), kinds: {"f":"gFrameSteel","c":"gSolidSteel","b":"gSolidSteel","~":"gConcreteBackfillerController"} },
  },
  {
    slug: "draconic-fusion-crafter",
    name: "Draconic Evolution Fusion Crafter",
    title: "Draconic Evolution термоядерный крафтер",
    tier: "uhv",
    summary: "Собирает детали Draconic Evolution и расплавленную драконью кровь.",
    story: ["В игре по-русски — «Draconic Evolution термоядерный крафтер». Он собирает детали мода Draconic Evolution и расплавленную драконью кровь. Вики называет его вершиной магических модов сборки: для постройки нужны алтарь крови пятого уровня, слитки духа Гайи, первозданная жемчужина и горы ихория.","Уровень корпусов ядра решает, какие рецепты доступны. Здесь показан первый уровень."],
    facts: [{"label":"Размер","value":"5 × 10 × 5"},{"label":"Блоков","value":"122"},{"label":"Ярус в вики","value":"UHV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/kubatech/tileentity/gregtech/multiblock/MTEDEFusionCrafter.java",
    def: { layers: unpackLayers("5n|5n|5n|5n|5n/5 |2 F2 | FfF |2 F2 |5 /5 |2 F2 | FfF |2 F2 |5 /5R|R F R|RFfFR|R F R|5R/5 |2 F2 | FfF |2 F2 |5 /5 |2 F2 | FfF |2 F2 |5 /5R|R F R|RFfFR|R F R|5R/5 |2 F2 | FfF |2 F2 |5 /5 |2 F2 | FfF |2 F2 |5 /2N~2N|5N|5N|5N|5N"), kinds: {"N":"gDefc0","n":"gDefc0","f":"gFusionCoil","F":"gFusion","R":"gDefc1","~":"gDraconicFusionCrafterController"} },
  },
  {
    slug: "integrated-ore-factory",
    name: "Integrated Ore Factory",
    title: "Фабрика полной рудопереработки",
    tier: "uhv",
    summary: "Вся переработка руды за один шаг — вместо целых цехов.",
    story: ["В игре по-русски — «Фабрика полной рудопереработки». Она делает всю переработку руды за один шаг: заменяет прежние цеха, даёт больше выхода и не нагружает сервер.","Открывается вскоре после космического лифта — как раз когда руды с других планет становится слишком много."],
    facts: [{"label":"Размер","value":"15 × 9 × 13"},{"label":"Блоков","value":"878"},{"label":"Ярус в вики","value":"UHV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEIntegratedOreFactory.java",
    def: { layers: unpackLayers("15 | 3F7 3F | 3F7 3F | 3F7 3F |15 | 3F7 3F | 3F7 3F | 3F7 3F |15 | 3F7 3F | 3F7 3F | 3F7 3F |15 /15 | FAF7 FAF | AEF7 FBA | FAF7 FAF |15 | FAF7 FAF | A F7 FCA | FAF7 FAF |15 | FAF7 FAF | AHF7 FIA | FAF7 FAF |15 /15 | FA2F5 2FAF | AEFJ5 JFBA | FA2F5 2FAF |15 | FA2F5 2FAF | A FJ5 JFCA | FA2F5 2FAF |15 | FA2F5 2FAF | AHFJ5 JFIA | FA2F5 2FAF |15 /15 | FA4F 4FAF | AE2F2JG2J2FBA | FA4F 4FAF |15 | FA4F 4FAF | A 2F2JG2J2FCA | FA4F 4FAF |15 | FA4F 4FAF | AH2F2JG2J2FIA | FA4F 4FAF |15 /5 5D5 | FA2F5D2FAF | AE2F5D2FBA | FA2F5D2FAF |4 7D4 | FA2F5D2FAF | A 2F5D2FCA | FA2F5D2FAF |4 7D4 | FA2F5D2FAF | AH2F5D2FIA | FA2F5D2FAF |5 5D5 /4 2G3 2G4 | FA2F5D2FAF | AEF7 FBA | FA2F5 2FAF |4 D5 D4 | FA2F5 2FAF | A F7 FCA | FA2F5 2FAF |4 D5 D4 | FA2F5 2FAF | AHF7 FIA | FA2F5D2FAF |4 2G3 2G4 /4 G5 G4 | 4F2D~2D4F | FEF7 FBF | 4F5 4F |4 D5 D4 | 4F5 4F | F F7 FCF | 4F5 4F |4 D5 D4 | 4F5 4F | FHF7 FIF | 4F5D4F |4 G5 G4 /2 J G5 G J2 | 4F5D4F |JFEFJ5 JFBFJ| 4F5 4F |2 J D5 D J2 | 4F5 4F |JF FJ5 JFCFJ| 4F5 4F |2 J D5 D J2 | 4F5 4F |JFHFJ5 JFIFJ| 4F5D4F |2 J G5 G J2 / 3JG5 G3J |J3FJ5DJ3FJ|J3FJ5DJ3FJ|J3FJ5DJ3FJ| 3J7D3J |J3FJ5DJ3FJ|J3FJ5DJ3FJ|J3FJ5DJ3FJ| 3J7D3J |J3FJ5DJ3FJ|J3FJ5DJ3FJ|J3FJ5DJ3FJ| 3JG5 G3J "), kinds: {"A":"glass","B":"gGearboxTitanium","C":"gGrate","D":"gCleanStainlesssteel","E":"gCoilAwakeneddraconium","F":"gIridium","G":"gFrameStainlesssteel","J":"gSheetIridium","I":"gCentrifuge","H":"gLargeSieveGrate","~":"gIntegratedOreFactoryController"} },
  },
  {
    slug: "miniature-wormhole-generator",
    name: "Miniature Wormhole Generator",
    title: "Миниатюрный генератор червоточин",
    tier: "uhv",
    summary: "Передаёт огромный ток мгновенно, даже между мирами; потери — 0,5 %.",
    story: ["В игре по-русски — «Миниатюрный генератор червоточин». Он передаёт большие токи мгновенно на любое расстояние и между измерениями — за счёт квантовой запутанности.","Потери — всего 0,5 %, намного меньше, чем 5 % у P2P-туннелей."],
    facts: [{"label":"Размер","value":"7 × 7 × 7"},{"label":"Блоков","value":"144"},{"label":"Ярус в вики","value":"UHV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTEWormholeGenerator.java",
    def: { layers: unpackLayers("7 |3 F3 |2 3E2 | FEtEF |2 3E2 |3 F3 |7 /3 F3 | 2AD2A | A B A |FD3BDF| A B A | 2AD2A |3 F3 /2 3E2 | A B A |E5 E|EB3 BE|E5 E| A B A |2 3E2 / FE~EF |FA B AF|E5 E|lB3 Br|E5 E|FA B AF| F3EF /2 3E2 | A B A |E5 E|EB3 BE|E5 E| A B A |2 3E2 /3 F3 | 2AD2A | A B A |FD3BDF| A B A | 2AD2A |3 F3 /7 |3 F3 |2 3E2 | FEbEF |2 3E2 |3 F3 |7 "), kinds: {"E":"gEmPower","A":"glass","D":"gAdvancedradiationproof","B":"gFusionCoil","F":"gEm","t":"gEmPower","b":"gEmPower","l":"gEmPower","r":"gEmPower","~":"gMiniatureWormholeGeneratorController"} },
  },
  {
    slug: "naquadah-fuel-refinery",
    name: "Naquadah Fuel Refinery",
    title: "Завод наквадового топлива",
    tier: "uhv",
    summary: "Делает наквадовое топливо третьей модели и выше для большого наквадового реактора.",
    story: ["Завод наквадового топлива делает жидкое наквадовое топливо Mk-III и выше — почти всё оно идёт в большой наквадовый реактор. У каждого топлива есть более выгодный рецепт из более дорогих материалов.","Напряжением его не разогнать: скорость и доступные рецепты задаёт уровень катушек ограничения поля."],
    facts: [{"label":"Размер","value":"27 × 27 × 5"},{"label":"Блоков","value":"942"},{"label":"Ярус в вики","value":"UHV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTENaquadahFuelRefinery.java",
    def: { layers: unpackLayers("27 |10 7A10 |10 7C10 |10 7A10 |27 /10 7A10 |8 2A7C2A8 |8 2C7B2C8 |8 2A7C2A8 |10 7A10 /8 2A7 2A8 |6 2A2CE5AE2C2A6 |6 2C2B3AB3A2B2C6 |6 2A2CE5AE2C2A6 |8 2A7 2A8 /6 2A11 2A6 |5 A2C2E3 A3 2E2CA5 |5 C2B2E FAFAF 2E2BC5 |5 A2C2E3 A3 2E2CA5 |6 2A11 2A6 /5 A15 A5 |4 AF2E5 A5 2EFA4 |4 CB2E3 FAFAF3 2EBC4 |4 AF2E5 A5 2EFA4 |5 A15 A5 /4 A17 A4 |3 AFE15 EFA3 |3 CBE5 F A F5 EBC3 |3 AFE15 EFA3 |4 A17 A4 /3 A19 A3 |2 ACE17 ECA2 |2 CBE8 A8 EBC2 |2 ACE17 ECA2 |3 A19 A3 /3 A19 A3 |2 ACE17 ECA2 |2 CBE8 A8 EBC2 |2 ACE17 ECA2 |3 A19 A3 /2 A21 A2 | ACE19 ECA | CBE9 A9 EBC | ACE19 ECA |2 A21 A2 /2 A21 A2 | ACE9 A9 ECA | CBE8 AFA8 EBC | ACE9 A9 ECA |2 A21 A2 / A11 A11 A |ACE9 A A9 ECA|CBA8 AF FA8 ABC|ACE9 A A9 ECA| A11 A11 A / A10 3A10 A |ACA8 A3 A8 ACA|CBA3F4 AF3 FA4 3FABC|ACA8 A3 A8 ACA| A10 3A10 A / A9 5A9 A |ACA7 A5 A7 ACA|CB3A4 AF5 FA4 3ABC|ACA7 A5 A7 ACA| A9 5A9 A / A8 3A~3A8 A |AC3A4 A7 A4 3ACA|C2B2F4AF7 F4A2F2BC|AC3A4 A7 A4 3ACA| A8 7A8 A / A9 5A9 A |ACA7 A5 A7 ACA|CB3A4 AF5 FA4 3ABC|ACA7 A5 A7 ACA| A9 5A9 A / A10 3A10 A |ACA8 A3 A8 ACA|CBA3F4 AF3 FA4 3FABC|ACA8 A3 A8 ACA| A10 3A10 A / A11 A11 A |ACE9 A A9 ECA|CBA8 AF FA8 ABC|ACE9 A A9 ECA| A11 A11 A /2 A21 A2 | ACE9 A9 ECA | CBE8 AFA8 EBC | ACE9 A9 ECA |2 A21 A2 /2 A21 A2 | ACE19 ECA | CBE9 A9 EBC | ACE19 ECA |2 A21 A2 /3 A19 A3 |2 ACE17 ECA2 |2 CBE8 A8 EBC2 |2 ACE17 ECA2 |3 A19 A3 /3 A19 A3 |2 ACE17 ECA2 |2 CBE8 A8 EBC2 |2 ACE17 ECA2 |3 A19 A3 /4 A17 A4 |3 AFE15 EFA3 |3 CBE5 F A F5 EBC3 |3 AFE15 EFA3 |4 A17 A4 /5 A15 A5 |4 AF2E5 A5 2EFA4 |4 CB2E3 FAFAF3 2EBC4 |4 AF2E5 A5 2EFA4 |5 A15 A5 /6 2A11 2A6 |5 A2C2E3 A3 2E2CA5 |5 C2B2E FAFAF 2E2BC5 |5 A2C2E3 A3 2E2CA5 |6 2A11 2A6 /8 2A7 2A8 |6 2A2CE5AE2C2A6 |6 2C2B3AB3A2B2C6 |6 2A2CE5AE2C2A6 |8 2A7 2A8 /10 7A10 |8 2A7C2A8 |8 2C7B2C8 |8 2A7C2A8 |10 7A10 /27 |10 7A10 |10 7C10 |10 7A10 |27 "), kinds: {"A":"gMiningBlackplutonium","C":"gFieldRestrictingGlas","B":"g1","E":"gAdvancedradiationproof","F":"gFrameSteel","~":"gNaquadahFuelRefineryController"} },
  },
  {
    slug: "degasser-purification-unit",
    name: "Residual Decontaminant Degasser Purification Unit",
    title: "Установка остаточной дегазации и деконтаминации воды",
    tier: "uev",
    summary: "Седьмой шаг очистки воды: по сигналу подать одну из семи жидкостей.",
    story: ["В игре по-русски — «Установка остаточной дегазации и деконтаминации воды». Это седьмой шаг линии очистки воды: каждый цикл она выдаёт сигнал, какую из семи жидкостей нужно подать, чтобы убрать остатки прежних ступеней.","Получается вода седьмой степени очистки — она нужна в начале UEV для оптических схем."],
    facts: [{"label":"Размер","value":"17 × 25 × 17"},{"label":"Блоков","value":"1 549"},{"label":"Ярус в вики","value":"UEV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/purification/MTEPurificationUnitDegasser.java",
    def: { layers: unpackLayers("6 5A6 |4 9A4 |2 13A2 |2 13A2 | 15A | 15A |17A|17A|17A|17A|17A| 15A | 15A |2 13A2 |2 13A2 |4 9A4 |6 5A6 /17 |6 5A6 |3 C9A4 |3 11AC2 |2 13A2 |2 13A2 | 15A | 15A | 15A | 15A | 15A |2 13A2 |2 13A2 |2 C11A3 |4 9AC3 |6 5A6 |17 /17 |17 |6 5B 2C3 |2 C 2B5 2B4 |2 CB9 B3 |3 B9 B3 |2 B11 B2 |2 B11 B2 |2 B11 B2 |2 B11 B2 |2 B11 B2 |3 B9 B3 |3 B9 BC2 |4 2B5 2B C2 |3 2C 5B6 |17 |17 /17 |11 C5 |6 5B6 |4 2B5 2B4 |3 B9 B3 | C B9 B3 |2 B11 B2 |2 B11 B2 |2 B11 B2 |2 B11 B2 |2 B11 B2 |3 B9 B C |3 B9 B3 |4 2B5 2B4 |6 5B6 |5 C11 |17 /17 |9 2C6 |6 5B6 |5 B5 B5 |4 B7 B4 |3 B9 B3 | CB11 B2 | CB11 B2 |2 B11 B2 |2 B11 BC |2 B11 BC |3 B9 B3 |4 B7 B4 |5 B5 B5 |6 5B6 |6 2C9 |17 /17 |8 C8 |7 3B7 |5 2B3 2B5 |4 B7 B4 |3 B9 B3 |3 B9 B3 |2 B11 B2 | CB11 BC |2 B11 B2 |3 B9 B3 |3 B9 B3 |4 B7 B4 |5 2B3 2B5 |7 3B7 |8 C8 |17 /17 |6 2C9 |8 B8 |5 3B 3B5 |4 B7 B4 |3 B9 B3 |3 B9 B C |3 B9 B C |2 B11 B2 | C B9 B3 | C B9 B3 |3 B9 B3 |4 B7 B4 |5 3B 3B5 |8 B8 |9 2C6 |17 /17 |5 C11 |17 |6 5B6 |4 2B5 2B4 |4 B7 B2 C |3 B9 B3 |3 B9 B3 |3 B9 B3 |3 B9 B3 |3 B9 B3 | C2 B7 B4 |4 2B5 2B4 |6 5B6 |17 |11 C5 |17 /17 |17 |4 C12 |7 3B7 |5 2B3 2B2 C2 |4 B7 B4 |4 B7 B4 |3 B9 B3 |3 B9 B3 |3 B9 B3 |4 B7 B4 |4 B7 B4 |2 C2 2B3 2B5 |7 3B7 |12 C4 |17 |17 /17 |17 |17 |3 C9 C3 |6 5B6 |5 B5 B5 |4 B7 B4 |4 B7 B4 |4 B7 B4 |4 B7 B4 |4 B7 B4 |5 B5 B5 |6 5B6 |3 C9 C3 |17 |17 |17 /17 |17 |12 C4 |17 |2 C4 3B7 |6 B3 B6 |5 B5 B5 |4 B7 B4 |4 B7 B4 |4 B7 B4 |5 B5 B5 |6 B3 B6 |7 3B4 C2 |17 |4 C12 |17 |17 /17 |11 C5 |17 |17 |17 | C5 3B7 |6 5B6 |5 2B3 2B5 |5 2B3 2B5 |5 2B3 2B5 |6 5B6 |7 3B5 C |17 |17 |17 |5 C11 |17 /17 |9 2C6 |17 |17 |17 |17 | C5 3B7 | C4 5B6 |6 5B6 |6 5B4 C |7 3B5 C |17 |17 |17 |17 |6 2C9 |17 /17 |8 C8 |17 |17 |17 |7 3B7 |6 5B6 |5 2B3 2B5 | C3 2B3 2B3 C |5 2B3 2B5 |6 5B6 |7 3B7 |17 |17 |17 |8 C8 |17 /17 |6 2C9 |17 |17 |7 3B7 |6 B3 B6 |5 B5 B3 C |4 B7 B2 C |4 B7 B4 | C2 B7 B4 | C3 B5 B5 |6 B3 B6 |7 3B7 |17 |17 |9 2C6 |17 /17 |5 C11 |17 |17 |6 5B6 |5 B5 B3 C |4 B7 B4 |4 B7 B4 |4 B7 B4 |4 B7 B4 |4 B7 B4 | C3 B5 B5 |6 5B6 |17 |17 |11 C5 |17 /17 |17 |4 C12 |7 3B7 |5 2B3 2B2 C2 |4 B7 B4 |4 B7 B4 |3 B9 B3 |3 B9 B3 |3 B9 B3 |4 B7 B4 |4 B7 B4 |2 C2 2B3 2B5 |7 3B7 |12 C4 |17 |17 /17 |17 |17 |3 C2 5B2 C3 |4 2B5 2B4 |4 B7 B4 |3 B9 B3 |3 B9 B3 |3 B9 B3 |3 B9 B3 |3 B9 B3 |4 B7 B4 |4 2B5 2B4 |3 C2 5B2 C3 |17 |17 |17 /17 |17 |8 B3 C4 |5 3B 3B5 |2 C B7 B4 |3 B9 B3 |3 B9 B3 |3 B9 B3 |2 B11 B2 |3 B9 B3 |3 B9 B3 |3 B9 B3 |4 B7 B C2 |5 3B 3B5 |4 C3 B8 |17 |17 /17 |11 C5 |7 3B7 |5 2B3 2B5 |4 B7 B4 | C B9 B3 |3 B9 B3 |2 B11 B2 |2 B11 B2 |2 B11 B2 |3 B9 B3 |3 B9 B C |4 B7 B4 |5 2B3 2B5 |7 3B7 |5 C11 |17 /17 |9 2C6 |6 5B6 |5 B5 B5 |4 B7 B4 |3 B9 B3 | CB11 B2 | CB11 B2 |2 B11 B2 |2 B11 BC |2 B11 BC |3 B9 B3 |4 B7 B4 |5 B5 B5 |6 5B6 |6 2C9 |17 /17 |8 C8 |6 5B6 |4 2B5 2B4 |3 B9 B3 |3 B9 B3 |2 B11 B2 |2 B11 B2 | CB11 BC |2 B11 B2 |2 B11 B2 |3 B9 B3 |3 B9 B3 |4 2B5 2B4 |6 5B6 |8 C8 |17 /17 |6 2C9 |6 5B6 |4 2B5 2B4 |3 B9 B3 |3 B9 B3 |2 B11 BC |2 B11 BC |2 B11 B2 | CB11 B2 | CB11 B2 |3 B9 B3 |3 B9 B3 |4 2B5 2B4 |6 5B6 |9 2C6 |17 /17 |4 2C2A~2A6 |4 9A4 |3 11A3 |2 13AC |2 13AC | 15A | 15A | 15A | 15A | 15A | C13A2 | C13A2 |3 11A3 |4 9A4 |6 5A2C4 |17 /6 5A6 |4 9A4 |2 13A2 |2 13A2 | 15A | 15A |17A|17A|17A|17A|17A| 15A | 15A |2 13A2 |2 13A2 |4 9A4 |6 5A6 "), kinds: {"A":"gPlasmaHeater","B":"glass","C":"gFrameBedrockium","~":"gDegasserPurificationUnitController"} },
  },
  {
    slug: "baryonic-perfection-purification-unit",
    name: "Absolute Baryonic Perfection Purification Unit",
    title: "Установка субатомной очистки воды",
    tier: "uev",
    summary: "Восьмой и последний шаг очистки воды: сверхтекучая жидкость вместо смазки.",
    story: ["В игре по-русски — «Установка субатомной очистки воды». Это восьмой и последний шаг линии очистки воды; открывается в конце UEV, после плазменной кузницы.","Она делает пространственно-сдвинутую сверхтекучую жидкость: с UIV та заменяет смазку в рецептах и работает лучше воды седьмой степени везде, где та нужна."],
    facts: [{"label":"Размер","value":"17 × 17 × 17"},{"label":"Блоков","value":"825"},{"label":"Ярус в вики","value":"UEV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/purification/MTEPurificationUnitBaryonicPerfection.java",
    def: { layers: unpackLayers("17 |17 |17 |17 |17 |17 |6 5A6 |6 5A6 |6 5A6 |6 5A6 |6 5A6 |17 |17 |17 |17 |17 |17 /17 |8 E8 |8 E8 |8 E8 |8 E8 |8 E8 |6 5A6 |6 5A6 | 5E5A5E |6 5A6 |6 5A6 |8 E8 |8 E8 |8 E8 |8 E8 |8 E8 |17 /17 |8 E8 |17 |17 |17 |17 |6 5C6 |6 C3DC6 | E4 CDBDC4 E |6 C3DC6 |6 5C6 |17 |17 |17 |17 |8 E8 |17 /17 |8 E8 |17 |17 |17 |17 |17 |7 3D7 | E5 DBD5 E |7 3D7 |17 |17 |17 |17 |17 |8 E8 |17 /17 |8 E8 |17 |17 |17 |17 |17 |7 3D7 | E5 DBD5 E |7 3D7 |17 |17 |17 |17 |17 |8 E8 |17 /17 |8 E8 |17 |17 |17 |17 |17 |7 3D7 | E5 DBD5 E |7 3D7 |17 |17 |17 |17 |17 |8 E8 |17 /6 5A6 |6 5A6 |6 5C6 |17 |17 |17 |2AC3 5A3 C2A|2AC3 A3DA3 C2A|2AC3 ADBDA3 C2A|2AC3 A3DA3 C2A|2AC3 5A3 C2A|17 |17 |17 |6 5C6 |6 5A6 |6 5A6 /6 5A6 |6 5A6 |6 C3DC6 |7 3D7 |7 3D7 |7 3D7 |2AC3 A3DA3 C2A|2A5D3 5D2A|2A5D B 5D2A|2A5D3 5D2A|2AC3 A3DA3 C2A|7 3D7 |7 3D7 |7 3D7 |6 C3DC6 |6 5A6 |6 5A6 /6 2A~2A6 | 5E5A5E | E4 CDBDC4 E | E5 DBD5 E | E5 DBD5 E | E5 DBD5 E |2AC3 ADBDA3 C2A|2A5D B 5D2A|2A13B2A|2A5D B 5D2A|2AC3 ADBDA3 C2A| E5 DBD5 E | E5 DBD5 E | E5 DBD5 E | E4 CDBDC4 E | 5E5A5E |6 5A6 /6 5A6 |6 5A6 |6 C3DC6 |7 3D7 |7 3D7 |7 3D7 |2AC3 A3DA3 C2A|2A5D3 5D2A|2A5D B 5D2A|2A5D3 5D2A|2AC3 A3DA3 C2A|7 3D7 |7 3D7 |7 3D7 |6 C3DC6 |6 5A6 |6 5A6 /6 5A6 |6 5A6 |6 5C6 |17 |17 |17 |2AC3 5A3 C2A|2AC3 A3DA3 C2A|2AC3 ADBDA3 C2A|2AC3 A3DA3 C2A|2AC3 5A3 C2A|17 |17 |17 |6 5C6 |6 5A6 |6 5A6 /17 |8 E8 |17 |17 |17 |17 |17 |7 3D7 | E5 DBD5 E |7 3D7 |17 |17 |17 |17 |17 |8 E8 |17 /17 |8 E8 |17 |17 |17 |17 |17 |7 3D7 | E5 DBD5 E |7 3D7 |17 |17 |17 |17 |17 |8 E8 |17 /17 |8 E8 |17 |17 |17 |17 |17 |7 3D7 | E5 DBD5 E |7 3D7 |17 |17 |17 |17 |17 |8 E8 |17 /17 |8 E8 |17 |17 |17 |17 |6 5C6 |6 C3DC6 | E4 CDBDC4 E |6 C3DC6 |6 5C6 |17 |17 |17 |17 |8 E8 |17 /17 |8 E8 |8 E8 |8 E8 |8 E8 |8 E8 |6 5A6 |6 5A6 | 5E5A5E |6 5A6 |6 5A6 |8 E8 |8 E8 |8 E8 |8 E8 |8 E8 |17 /17 |17 |17 |17 |17 |17 |6 5A6 |6 5A6 |6 5A6 |6 5A6 |6 5A6 |17 |17 |17 |17 |17 |17 "), kinds: {"A":"gBlockQuarkContainmen","B":"gBlockQuarkPipe","C":"gBlockQuarkReleaseCh","D":"glass","E":"gFrameBedrockium","~":"gBaryonicPerfectionPurificationUnitController"} },
  },
  {
    slug: "exo-foundry",
    name: "Exo-Foundry",
    title: "Экзо-литейный завод",
    tier: "uev",
    summary: "Отливает жидкие металлы в формы в огромных объёмах; свойства задают модули.",
    story: ["В игре по-русски — «Экзо-литейный завод». Это улучшение массового отвердителя: он отливает жидкие металлы в формы намного быстрее, дешевле и по многу рецептов сразу.","Точные числа зависят от установленных модулей — их семь видов. Здесь показана башня завода без модулей. В UXV её улучшают до третьего уровня."],
    facts: [{"label":"Размер","value":"15 × 55 × 15"},{"label":"Блоков","value":"2 172"},{"label":"Ярус в вики","value":"UEV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/foundry/MTEExoFoundry.java",
    def: { layers: unpackLayers("5 5H5 |3 2D2HB2H2D3 |2 D2 2HB2H2 D2 | D2 3HB3H2 D | D 3HBHB3H D |6HBHB6H|4H2B3H2B4H|H3B3HB3H3BH|4H2B3H2B4H|6HBHB6H| D 3HBHB3H D | D2 3HB3H2 D |2 D2 2HB2H2 D2 |3 2D2HB2H2D3 |5 5H5 /6 HBH6 |7 D7 |7 D7 |7 D7 |7 D7 |15 |H13 H|B4D5 4DB|H13 H|15 |7 D7 |7 D7 |7 D7 |7 D7 |6 HBH6 /5 5H5 |3 2DH3BH2D3 |2 D2 5H2 D2 | D4 3H4 D | D4 3H4 D |3H2 2HE2H2 3H|HB4H3E4HBH|HB3H5E3HBH|HB4H3E4HBH|3H2 2HE2H2 3H| D4 3H4 D | D4 3H4 D |2 D2 5H2 D2 |3 2DH3BH2D3 |5 5H5 /15 |15 |5 H3 H5 |5 H3DH5 |15 |2 2H2 EBE2 2H2 |3 D E C E D3 |3 D BC CB D3 |3 D E C E D3 |2 2H2 EBE2 2H2 |15 |5 H3DH5 |5 H3 H5 |15 |15 /15 |15 |15 |5 H3AH5 |4 H5 H4 |3 H3 D3 H3 |3 A3 C3 A3 |3 A DC CD A3 |3 A3 C3 A3 |3 H3 D3 H3 |4 H5 H4 |5 H3AH5 |15 |15 |15 /15 |15 |15 |5 H3AH5 |4 F5 F4 |3 H2 EFE2 H3 |3 A E C E A3 |3 A FC CF A3 |3 A E C E A3 |3 H2 EFE2 H3 |4 F5 F4 |5 H3AH5 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EBE6 |3 A E C E A3 |3 A BC CB A3 |3 A E C E A3 |6 EBE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EFE6 |3 A E C E A3 |3 A FC CF A3 |3 A E C E A3 |6 EFE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |7 D7 |3 A3 C3 A3 |3 A DC CD A3 |3 A3 C3 A3 |7 D7 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EFE6 |3 A E C E A3 |3 A FC CF A3 |3 A E C E A3 |6 EFE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 ABA6 |4 F2 D2 F4 |6 EBE6 |3 A E C E A3 |3 BDBC CBDB3 |3 A E C E A3 |6 EBE6 |4 F2 D2 F4 |6 ABA6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EFE6 |3 A E C E A3 |3 A FC CF A3 |3 A E C E A3 |6 EFE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |7 D7 |3 A3 C3 A3 |3 A DC CD A3 |3 A3 C3 A3 |7 D7 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EFE6 |3 A E C E A3 |3 A FC CF A3 |3 A E C E A3 |6 EFE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EBE6 |3 A E C E A3 |3 A BC CB A3 |3 A E C E A3 |6 EBE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EFE6 |3 A E C E A3 |3 A FC CF A3 |3 A E C E A3 |6 EFE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |7 D7 |3 A3 C3 A3 |3 A DC CD A3 |3 A3 C3 A3 |7 D7 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EFE6 |3 A E C E A3 |3 A FC CF A3 |3 A E C E A3 |6 EFE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 ABA6 |4 F2 D2 F4 |6 EBE6 |3 A E C E A3 |3 BDBC CBDB3 |3 A E C E A3 |6 EBE6 |4 F2 D2 F4 |6 ABA6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EFE6 |3 A E C E A3 |3 A FC CF A3 |3 A E C E A3 |6 EFE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |7 D7 |3 A3 C3 A3 |3 A DC CD A3 |3 A3 C3 A3 |7 D7 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EFE6 |3 A E C E A3 |3 A FC CF A3 |3 A E C E A3 |6 EFE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EBE6 |3 A E C E A3 |3 A BC CB A3 |3 A E C E A3 |6 EBE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EFE6 |3 A E C E A3 |3 A FC CF A3 |3 A E C E A3 |6 EFE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |7 D7 |3 A3 C3 A3 |3 A DC CD A3 |3 A3 C3 A3 |7 D7 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 HBH6 |3 A H C H A3 |3 A BC CB A3 |3 A H C H A3 |6 HBH6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 DBD6 |3 A D C D A3 |3 A BC CB A3 |3 A D C D A3 |6 DBD6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 DBD6 |3 A D C D A3 |3 A BC CB A3 |3 A D C D A3 |6 DBD6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 DBD6 |3 A D C D A3 |3 A BC CB A3 |3 A D C D A3 |6 DBD6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 HBH6 |3 A H C H A3 |3 A BC CB A3 |3 A H C H A3 |6 HBH6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |7 D7 |3 A3 C3 A3 |3 A DC CD A3 |3 A3 C3 A3 |7 D7 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EFE6 |3 A E C E A3 |3 A FC CF A3 |3 A E C E A3 |6 EFE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EBE6 |3 A E C E A3 |3 A BC CB A3 |3 A E C E A3 |6 EBE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EFE6 |3 A E C E A3 |3 A FC CF A3 |3 A E C E A3 |6 EFE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |7 D7 |3 A3 C3 A3 |3 A DC CD A3 |3 A3 C3 A3 |7 D7 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EFE6 |3 A E C E A3 |3 A FC CF A3 |3 A E C E A3 |6 EFE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 ABA6 |4 F2 D2 F4 |6 EBE6 |3 A E C E A3 |3 BDBC CBDB3 |3 A E C E A3 |6 EBE6 |4 F2 D2 F4 |6 ABA6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EFE6 |3 A E C E A3 |3 A FC CF A3 |3 A E C E A3 |6 EFE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |7 D7 |3 A3 C3 A3 |3 A DC CD A3 |3 A3 C3 A3 |7 D7 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EFE6 |3 A E C E A3 |3 A FC CF A3 |3 A E C E A3 |6 EFE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EBE6 |3 A E C E A3 |3 A BC CB A3 |3 A E C E A3 |6 EBE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EFE6 |3 A E C E A3 |3 A FC CF A3 |3 A E C E A3 |6 EFE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |7 D7 |3 A3 C3 A3 |3 A DC CD A3 |3 A3 C3 A3 |7 D7 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EFE6 |3 A E C E A3 |3 A FC CF A3 |3 A E C E A3 |6 EFE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 ABA6 |4 F2 D2 F4 |6 EBE6 |3 A E C E A3 |3 BDBC CBDB3 |3 A E C E A3 |6 EBE6 |4 F2 D2 F4 |6 ABA6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EFE6 |3 A E C E A3 |3 A FC CF A3 |3 A E C E A3 |6 EFE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |7 D7 |3 A3 C3 A3 |3 A DC CD A3 |3 A3 C3 A3 |7 D7 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EFE6 |3 A E C E A3 |3 A FC CF A3 |3 A E C E A3 |6 EFE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |6 3A6 |4 F5 F4 |6 EBE6 |3 A E C E A3 |3 A BC CB A3 |3 A E C E A3 |6 EBE6 |4 F5 F4 |6 3A6 |15 |15 |15 /15 |15 |15 |5 H3AH5 |4 F5 F4 |3 H2 EFE2 H3 |3 A E C E A3 |3 A FC CF A3 |3 A E C E A3 |3 H2 EFE2 H3 |4 F5 F4 |5 H3AH5 |15 |15 |15 /15 |15 |15 |5 H3AH5 |4 H5 H4 |3 H3 D3 H3 |3 A3 C3 A3 |3 A DC CD A3 |3 A3 C3 A3 |3 H3 D3 H3 |4 H5 H4 |5 H3AH5 |15 |15 |15 /15 |15 |5 H3 H5 |5 H3DH5 |15 |2 2H2 EBE2 2H2 |3 D E C E D3 |3 D BC CB D3 |3 D E C E D3 |2 2H2 EBE2 2H2 |15 |5 H3DH5 |5 H3 H5 |15 |15 /5 5H5 |3 2DH3BH2D3 |2 D2 5H2 D2 | D4 3H4 D | D4 3H4 D |3H2 2HE2H2 3H|HB4H3E4HBH|HB3H5E3HBH|HB4H3E4HBH|3H2 2HE2H2 3H| D4 3H4 D | D4 3H4 D |2 D2 5H2 D2 |3 2DH3BH2D3 |5 5H5 /6 H~H6 |7 D7 |7 D7 |7 D7 |7 D7 |15 |H13 H|B4D5 4DB|H13 H|15 |7 D7 |7 D7 |7 D7 |7 D7 |6 HBH6 /5 5H5 |3 2D2HB2H2D3 |2 D2 2HB2H2 D2 | D2 3HB3H2 D | D 3HBHB3H D |6HBHB6H|4H2B3H2B4H|H3B3HB3H3BH|4H2B3H2B4H|6HBHB6H| D 3HBHB3H D | D2 3HB3H2 D |2 D2 2HB2H2 D2 |3 2D2HB2H2D3 |5 5H5 "), kinds: {"A":"glass","B":"gItemPipeBlackPluton","C":"gExofoundryCentral","D":"gFrameNetherite","E":"gExofoundrySecondary","F":"gExofoundryInfiniteCh","H":"gExofoundry","~":"gExoFoundryController"} },
  },
  {
    slug: "dyson-swarm-ground-unit",
    name: "Dyson Swarm Ground Unit",
    title: "Наземная станция роя Дайсона",
    tier: "uiv",
    summary: "Вершина солнечной энергии: до 337 миллиардов EU/t от роя спутников у звезды.",
    story: ["Наземная станция роя Дайсона принимает энергию от роя спутников у ближайшей звезды — до 337 миллиардов EU/t. Больше дают только Глаз гармонии, большой наквадовый реактор на лучшем топливе и матрица аннигиляции.","Спутники запускают отсюда же; чем их больше, тем больше энергии."],
    facts: [{"label":"Размер","value":"16 × 20 × 16"},{"label":"Блоков","value":"922"},{"label":"Ярус в вики","value":"UIV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gtnhintergalactic/tile/multi/TileEntityDysonSwarm.java",
    def: { layers: unpackLayers("16 |16 |16 |16 |16 |16 |16 |16 |16 |16 |16 |2 3t11 |2 3t8 k2 |2 3t7 k k |13 k2 |16 /16 |16 |16 |16 |16 |16 |16 |16 |16 |16 |2 3t11 | 5t10 | 5t7 k2 | 5t6 k k |2 3t8 k2 |16 /16 |16 |16 |16 |16 |16 |16 |16 |16 |16 |2 3t11 | 5t10 | 5t7 k2 | 5t6 k k |2 3t8 k2 |16 /16 |16 |16 |16 |16 |16 |16 |16 |16 |16 |2 3t11 | 5t10 | 5t7 k2 | 5t6 k k |2 3t8 k2 |16 /16 |16 |16 |16 |16 |16 |16 |16 |16 |16 |16 |2 3t11 |2 tst8 k2 |2 3t7 k k |13 k2 |16 /16 |16 |16 |16 |16 |16 |16 |16 |16 |16 |16 |16 |3 s9 k2 |12 k k |13 k2 |16 /16 |16 |16 |16 |16 |10 h5 |16 |16 |16 |16 |2 3t11 | t g t10 | tgsgt7 k2 | t g t6 k k |2 3t8 k2 |16 /16 |16 |16 |16 |16 |10 f5 |16 |16 |16 |16 |16 |16 |3 s9 k2 |12 k k |13 k2 |16 /9 3d4 |8 d3 d3 |7 d5 d2 |6 d7 d |5 d9 d|5 d4 f4 d|5 d9 d|6 d7 d |7 d5 d2 |8 d3 d3 |2 3t4 3d4 | t g t10 | tgsgt6 kmk | t g t6 m m |2 3t7 kmk |16 /16 |9 3d4 |8 5d3 |7 2d3 2d2 |6 2d5 2d |6 2d2 f2 2d |6 2d5 2d |7 2d3 2d2 |8 5d3 |9 3d4 |16 |16 |3 s8 kmk |12 m m |12 kmk |16 /16 |16 |16 |9 3d4 |8 5d3 |8 5d3 |8 5d3 |9 3d4 |16 |16 |2 3t11 | t g t10 | tgsgt6 kmk | t g t6 m m |2 3t7 kmk |16 /16 |16 |16 |16 |9 f f4 |16 |9 f f4 |16 |16 |16 |16 |16 |3 s8 kmk |12 m m |12 kmk |16 /16 |16 |16 |16 |9 f f4 |16 |9 f f4 |16 |16 |16 |2 3t11 | t g t10 | tgsgt6 kmk | t g t6 m m |2 3t7 kmk |16 /16 |16 |16 |16 |9 f f4 |16 |9 f f4 |16 |16 |16 |16 |16 |3 s8 kmk |12 m m |12 kmk |16 /16 |16 |16 |16 |9 f f4 |16 |9 f f4 |16 |16 |16 |16 |16 |3 s8 kmk |12 m m |12 kmk |16 /16 |16 |16 |16 |9 f f4 |16 |9 f f4 |16 |16 |16 |2 3p11 | p3 p10 | p s p6 kmk | p3 p6 m m |2 3p7 kmk |16 /16 |16 |16 |8 5x3 |8 5x3 |8 5x3 |8 5x3 |8 5x3 |16 |7y9 |7y9 |2y3p2y4 5z|2ypyp2y4 5z|2y3p2y4 2zj2z|7y4 5z|7y4 5z/16 |16 |16 |8 x3ex3 |8 e3ce3 |8 e3ce3 |8 e3ce3 |8 x3ex3 |16 |7o9 |o5yo9 |o5yo4 z3iz|o5yo4 i3zi|o5yo4 i3zi|o5yo4 i3zi|7o4 z3iz/16 |16 |16 |8 2x~2x3 |8 5x3 |8 5x3 |8 5x3 |8 5x3 |16 |7y9 |7y9 |7y4 5z|7y4 5z|7y4 5z|7y4 5z|7y4 5z/16b|16b|16b|16b|16b|16b|16b|16b|16b|16b|16b|16b|16b|16b|16b|16b"), kinds: {"b":"gFloorSide","c":"gCoilAwakeneddraconium","d":"gReceiverDishSide","e":"gReceiverCasingSide","f":"gFrameHsss","g":"gFrameTitanium","h":"gTank10","i":"gDeploymentUnitCasing","j":"gDeploymentUnitCoreS","k":"gFrameSuperconductoruhvbase","m":"gDeploymentUnitMagnet","o":"gControlCasingSide","p":"gControlPrimarySide","s":"gControlSecondarySide","t":"gControlToroidSide","x":"gReceiverCasingSide","y":"gControlCasingSide","z":"gDeploymentUnitCasing","~":"gDysonSwarmGroundUnitController"} },
  },
  {
    slug: "antimatter-stabilization-sequencer",
    name: "Semi-Stable Antimatter Stabilization Sequencer",
    title: "Секвенсор стабилизации антиматерии",
    tier: "uiv",
    summary: "Делает антиматерию из протоматерии для матрицы аннигиляции.",
    story: ["Секвенсор стабилизации антиматерии (SSASS) делает антиматерию из протоматерии. Почти вся она идёт в матрицу аннигиляции — на энергию.","Он работает циклами по одной секунде: сначала считывает, сколько жидкости в каждом люке антиматерии, потом выравнивает их. Постройка огромная — кольцо 53 × 53 × 47."],
    facts: [{"label":"Размер","value":"53 × 53 × 47"},{"label":"Блоков","value":"3 570"},{"label":"Ярус в вики","value":"UIV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/goodgenerator/blocks/tileEntity/AntimatterForge.java",
    def: { layers: unpackLayers("53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |24 5D24 |53 |53 |53 |24 5D24 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 D D25 |25 D D25 |25 D D25 |24 2D 2D24 |25 D D25 |25 D D25 |25 D D25 |24 2D 2D24 |25 D D25 |25 D D25 |25 D D25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 D D25 |25 D D25 |25 D D25 |24 2DC2D24 |24 2DC2D24 |24 2DC2D24 |24 2DC2D24 |25 AFA25 |25 AFA25 |25 AFA25 |24 2DC2D24 |24 2DC2D24 |24 2DC2D24 |24 2DC2D24 |25 D D25 |25 D D25 |25 D D25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |25 D D25 |25 D D25 |25 D D25 |24 2DC2D24 |24 2DC2D24 |24 2DC2D24 |25 DAD25 |25 DAD25 |25 DAD25 |24 2DA2D24 |25 DAD25 |25 DAD25 |25 DAD25 |24 2DA2D24 |25 DAD25 |25 DAD25 |25 3D25 |24 2DC2D24 |24 2DC2D24 |24 2DC2D24 |25 D D25 |25 D D25 |25 D D25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |25 D D25 |24 2DC2D24 |24 2DC2D24 |24 2DC2D24 |25 DAD25 |25 DAD25 |25 DAD25 |25 DAD25 |53 |53 |24 5D24 |53 |53 |53 |24 5D24 |53 |53 |25 DAD25 |25 DAD25 |25 DAD25 |25 DAD25 |24 2DC2D24 |24 2DC2D24 |24 2DC2D24 |25 D D25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 /53 |53 |53 |53 |53 |53 |25 D D25 |25 D D25 |25 DCD25 |25 DAD25 |25 DAD25 |25 DAD25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 DAD25 |25 3D25 |25 DCD25 |25 D D25 |25 D D25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 /53 |53 |53 |53 |53 |25 D D25 |25 DCD25 |25 DCD25 |25 DAD25 |25 DAD25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 DAD25 |25 DCD25 |25 DCD25 |25 D D25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 /53 |53 |53 |25 D D25 |25 D D25 |25 DCD25 |25 DAD25 |25 DAD25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 3D25 |25 DCD25 |25 D D25 |25 D D25 |53 |53 |53 |53 |53 |53 |53 |53 |53 /53 |53 |25 D D25 |25 DAD25 |25 DAD25 |25 DAD25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 DAD25 |25 DCD25 |25 DCD25 |25 D D25 |53 |53 |53 |53 |53 |53 |53 |53 /53 |25 D D25 |25 DAD25 |25 DAD25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 3D25 |25 DCD25 |25 D D25 |53 |53 |53 |53 |53 |53 |53 /25 D D25 |25 DAD25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 DCD25 |25 D D25 |53 |53 |53 |53 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 DCD25 |25 D D25 |53 |53 |53 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 3D25 |25 DCD25 |25 D D25 |53 |53 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 DCD25 |25 D D25 |53 |53 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 DCD25 |25 D D25 |53 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 DCD25 |24 2DC2D24 |25 D D25 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |24 2DC2D24 |25 D D25 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |24 2DC2D24 |25 D D25 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |24 2DC2D24 |25 D D25 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |24 2DC2D24 |25 D D25 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |24 2DC2D24 |25 D D25 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 3D25 |24 2DC2D24 |25 D D25 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |24 2DC2D24 |25 D D25 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |24 2DC2D24 |25 D D25 |53 /53 |53 |53 |53 |24 D3 D24 |24 D3 D24 |24 D3 D24 |24 D3 D24 |24 D3 D24 |4 D18 2D3 2D18 D4 |4 D16 2D7 2D16 D4 |4 D14 2D11 2D14 D4 |3 D14 D15 D14 D3 |3 D13 D17 D13 D3 |3 D13 D17 D13 D3 |2 D13 D19 D13 D2 |2 D13 D19 D13 D2 |2 D12 D21 D12 D2 |16D21 16D|53 |53 |53 |16D21 16D|2 D12 D21 D12 D2 |2 D13 D19 D13 D2 |2 D13 D19 D13 D2 |3 D13 D17 D13 D3 |3 D13 D17 D13 D3 |3 D14 D15 D14 D3 |4 D14 2D11 2D14 D4 |4 D16 2D7 2D16 D4 |4 D18 2D3 2D18 D4 |24 D3 D24 |24 D3 D24 |24 D3 D24 |24 D3 D24 |24 D3 D24 |24 D3 D24 |24 D3 D24 |24 D3 D24 |24 D3 D24 |24 D3 D24 |15 3D6 5D6 3D15 |18 3D3 2DA2D3 3D18 |21 5DC5D21 |24 5D24 |24 5D24 /10 D31 D10 |9 2D31 2D9 |8 2D33 2D8 |7 3D33 3D7 |7 2D15 D3 D15 2D7 |6 3D14 7D14 3D6 |5 3D12 3D7C3D12 3D5 |5 3D10 2D2CDC5ACD2C2D10 3D5 |4 3D10 D2CACD7CDCA2CD10 3D4 |3 4D9 DC3AC9DC3ACD9 4D3 |3 3D9 DC2A2C2D E3 E 2D2C2ACD9 3D3 |3 3D8 DC2AC2D11 2DC2ACD8 3D3 |2 3D8 DC2ACD15 DC2ACD8 3D2 |2 3D8 DCACD17 DCACD8 3D2 |2 3D7 DC2ACD17 DC2ACD7 3D2 | 4D7 D3CD19 D3CD7 4D | 3D8 5D19 5D8 3D | 3D7 D3CD21 D3CD7 3D |4D7 DCACDE19 EDCACD7 4D| DAD7 DCACD21 DCACD7 DAD | D12ACD21 DC12AD | DAD7 DCACD21 DCACD7 DAD |4D7 DCACDE19 EDCACD7 4D| 3D7 D3CD21 D3CD7 3D | 3D8 5D19 5D8 3D | 4D7 D3CD19 D3CD7 4D |2 3D7 DC2ACD17 DC2ACD7 3D2 |2 3D8 DCACD17 DCACD8 3D2 |2 3D8 DC2ACD15 DC2ACD8 3D2 |3 3D8 DC2AC2D11 2DC2ACD8 3D3 |3 3D9 DC2A2C2D E3 E 2D2C2ACD9 3D3 |3 4D9 DC3AC9DC3ACD9 4D3 |4 3D10 D2CACD7CDCA2CD10 3D4 |5 3D10 2D2CDC5ACD2C2D10 3D5 |5 4D11 3D3CA3C3D11 4D5 |6 3D14 3DA3D14 3D6 |7 3D16 A16 3D7 |7 4D15 A15 4D7 |8 5D13 A13 5D8 |9 5D12 A12 5D9 |11 5D10 A10 5D11 |12 6D8 A8 6D12 |14 8D4 A4 8D14 |15 11DA11D15 |18 8DC8D18 |21 11D21 |24 D3 D24 /53 |10 A31 A10 |9 A33 A9 |8 2A33 2A8 |8 A15 2D~2D15 A8 |7 CA35 AC7 |6 CA15 7C15 AC6 |6 CA12 3C7B3C12 AC6 |5 CA11 2C3B7C3B2C11 AC5 |4 C2A10 C3B2C7 2C3BC10 2AC4 |4 CA10 C2B2C3 D3 D3 2C2BC10 AC4 |4 CA9 C2BC15 C2BC9 AC4 |3 CA9 C2BC17 C2BC9 AC3 |3 CA9 CBC19 CBC9 AC3 |3 CA8 C2BC19 C2BC8 AC3 |2 C2A8 CBC21 CBC8 2AC2 |2 CA9 CBC21 CBC9 AC2 |2 CA8 CBC23 CBC8 AC2 |D CA8 CBC D19 D CBC8 AC D|2 H9ACBC23 CBC9AH2 |2 H11BC23 C11BH2 |2 H9ACBC23 CBC9AH2 |D CA8 CBC D19 D CBC8 AC D|2 CA8 CBC23 CBC8 AC2 |2 CA9 CBC21 CBC9 AC2 |2 C A8 CBC21 CBC8 A C2 |3 CA8 C2BC19 C2BC8 AC3 |3 CA9 CBC19 CBC9 AC3 |3 CA9 C2BC17 C2BC9 AC3 |4 CA9 C2BC15 C2BC9 AC4 |4 CA10 C2B2C3 D3 D3 2C2BC10 AC4 |4 C A10 C3B2C7 2C3BC10 A C4 |5 CA11 2C3B7C3B2C11 AC5 |6 CA12 3C7B3C12 AC6 |6 C A14 3CB3C14 A C6 |7 CA16 ABA16 AC7 |8 CA15 ABA15 AC8 |8 C A14 ABA14 A C8 |9 2C2A12 ABA12 2A2C9 |11 C A11 ABA11 A C11 |12 2C2A9 ABA9 2A2C12 |14 2C2A7 ABA7 2A2C14 |15 3C4A3 ABA3 4A3C15 |18 3C 3ADBD3A 3C18 |21 4C3H4C21 |53 |24 D3 D24 /10 D31 D10 |9 2D31 2D9 |8 2D33 2D8 |7 3D33 3D7 |7 2D15 D3 D15 2D7 |6 3D14 7D14 3D6 |5 3D12 3D7C3D12 3D5 |5 3D10 2D3C7A3C2D10 3D5 |4 3D10 D2C3A7C3A2CD10 3D4 |3 4D9 DC3A2C7D2C3ACD9 4D3 |3 3D9 DC2A2C2D E3 E 2D2C2ACD9 3D3 |3 3D8 DC2AC2D11 2DC2ACD8 3D3 |2 3D8 DC2ACD15 DC2ACD8 3D2 |2 3D8 DCACD17 DCACD8 3D2 |2 3D7 DC2ACD17 DC2ACD7 3D2 | 4D7 DCACD19 DCACD7 4D | 3D8 DCACD19 DCACD8 3D | 3D7 DCACD21 DCACD7 3D |4D7 DCACDE19 EDCACD7 4D| DAD7 DCACD21 DCACD7 DAD | D12ACD21 DC12AD | DAD7 DCACD21 DCACD7 DAD |4D7 DCACDE19 EDCACD7 4D| 3D7 DCACD21 DCACD7 3D | 3D8 DCACD19 DCACD8 3D | 4D7 DCACD19 DCACD7 4D |2 3D7 DC2ACD17 DC2ACD7 3D2 |2 3D8 DCACD17 DCACD8 3D2 |2 3D8 DC2ACD15 DC2ACD8 3D2 |3 3D8 DC2AC2D11 2DC2ACD8 3D3 |3 3D9 DC2A2C2D E3 E 2D2C2ACD9 3D3 |3 4D9 DC3A2C7D2C3ACD9 4D3 |4 3D10 D2C3A7C3A2CD10 3D4 |5 3D10 2D3C7A3C2D10 3D5 |5 4D11 3D3CA3C3D11 4D5 |6 3D14 3DA3D14 3D6 |7 3D16 A16 3D7 |7 4D15 A15 4D7 |8 5D13 A13 5D8 |9 5D12 A12 5D9 |11 5D10 A10 5D11 |12 6D8 A8 6D12 |14 8D4 A4 8D14 |15 11DA11D15 |18 8DC8D18 |21 11D21 |24 D3 D24 /53 |53 |53 |53 |24 D3 D24 |24 D3 D24 |24 D3 D24 |24 D3 D24 |24 D3 D24 |4 D18 2D3 2D18 D4 |4 D16 2D7 2D16 D4 |4 D14 2D11 2D14 D4 |3 D14 D15 D14 D3 |3 D13 D17 D13 D3 |3 D13 D17 D13 D3 |2 D13 D19 D13 D2 |2 D13 D19 D13 D2 |2 D12 D21 D12 D2 |16D21 16D|15 D21 D15 |15 D21 D15 |15 D21 D15 |16D21 16D|2 D12 D21 D12 D2 |2 D13 D19 D13 D2 |2 D13 D19 D13 D2 |3 D13 D17 D13 D3 |3 D13 D17 D13 D3 |3 D14 D15 D14 D3 |4 D14 2D11 2D14 D4 |4 D16 2D7 2D16 D4 |4 D18 7D18 D4 |24 D3 D24 |24 D3 D24 |24 D3 D24 |24 D3 D24 |24 D3 D24 |24 D3 D24 |24 D3 D24 |24 D3 D24 |24 D3 D24 |24 D3 D24 |15 3D6 5D6 3D15 |18 3D3 2DA2D3 3D18 |21 5DC5D21 |24 2D 2D24 |24 5D24 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |24 2DC2D24 |25 D D25 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |24 2DC2D24 |25 D D25 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 3D25 |24 2DC2D24 |25 D D25 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |24 2DC2D24 |25 D D25 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |24 2DC2D24 |25 D D25 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |24 2DC2D24 |25 D D25 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |24 2DC2D24 |25 D D25 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |24 2DC2D24 |25 D D25 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 3D25 |24 2DC2D24 |25 D D25 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 DCD25 |25 D D25 |53 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 DCD25 |25 D D25 |53 |53 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 3D25 |25 DCD25 |25 D D25 |53 |53 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 DCD25 |25 D D25 |53 |53 |53 |53 |53 |53 /25 D D25 |25 DAD25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 DCD25 |25 D D25 |53 |53 |53 |53 |53 |53 |53 /53 |25 D D25 |25 DAD25 |25 DAD25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 3D25 |25 DCD25 |25 D D25 |53 |53 |53 |53 |53 |53 |53 /53 |53 |25 D D25 |25 DAD25 |25 DAD25 |25 DAD25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 DAD25 |25 DCD25 |25 DCD25 |25 D D25 |53 |53 |53 |53 |53 |53 |53 |53 /53 |53 |53 |25 D D25 |25 D D25 |25 DCD25 |25 DAD25 |25 DAD25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 3D25 |25 DCD25 |25 D D25 |25 D D25 |53 |53 |53 |53 |53 |53 |53 |53 |53 /53 |53 |53 |53 |53 |25 D D25 |25 DCD25 |25 DCD25 |25 DAD25 |25 DAD25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 DAD25 |25 DCD25 |25 DCD25 |25 D D25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 /53 |53 |53 |53 |53 |53 |25 D D25 |25 D D25 |25 DCD25 |25 DAD25 |25 DAD25 |25 DAD25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 DAD25 |25 DAD25 |25 3D25 |25 DCD25 |25 D D25 |25 D D25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |25 D D25 |24 2DC2D24 |24 2DC2D24 |24 2DC2D24 |25 DAD25 |25 DAD25 |25 DAD25 |25 DAD25 |53 |53 |24 5D24 |53 |53 |53 |24 5D24 |53 |53 |25 DAD25 |25 DAD25 |25 DAD25 |25 DAD25 |24 2DC2D24 |24 2DC2D24 |24 2DC2D24 |25 D D25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |25 D D25 |25 D D25 |25 D D25 |24 2DC2D24 |24 2DC2D24 |24 2DC2D24 |25 DAD25 |25 DAD25 |25 DAD25 |24 2DA2D24 |25 DAD25 |25 DAD25 |25 DAD25 |24 2DA2D24 |25 DAD25 |25 DAD25 |25 D D25 |24 2DC2D24 |24 2DC2D24 |24 2DC2D24 |25 D D25 |25 D D25 |25 D D25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 D D25 |25 D D25 |25 D D25 |24 2DC2D24 |24 2DC2D24 |24 2DC2D24 |24 2DC2D24 |25 AFA25 |25 AFA25 |25 AFA25 |24 2DC2D24 |24 2DC2D24 |24 2DC2D24 |24 2DC2D24 |25 D D25 |25 D D25 |25 D D25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |25 D D25 |25 D D25 |25 D D25 |24 2D 2D24 |25 D D25 |25 D D25 |25 D D25 |24 2D 2D24 |25 D D25 |25 D D25 |25 D D25 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 /53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |24 5D24 |53 |53 |53 |24 5D24 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 |53 "), kinds: {"A":"gAntimatterContainment","B":"gProtomatterActivation","C":"gGravityStabilization","D":"gMagneticFlux","F":"gGravityStabilization","E":"gAntimatterContainment","H":"gGravityStabilization","~":"gAntimatterStabilizationSequencerController"} },
  },
  {
    slug: "annihilation-matrix",
    name: "Shielded Lagrangian Annihilation Matrix",
    title: "Экранированная матрица аннигиляции",
    tier: "uiv",
    summary: "Вырабатывает энергию из антиматерии и материи — мощнее почти всего в игре.",
    story: ["Экранированная матрица аннигиляции (SLAM) вырабатывает энергию, сталкивая антиматерию с материей. Антиматерию делает секвенсор стабилизации, материю — плазменная кузница.","Материей может быть расплавленная медь или основа сверхпроводника: чем она лучше, тем выше выработка."],
    facts: [{"label":"Размер","value":"35 × 31 × 35"},{"label":"Блоков","value":"2 693"},{"label":"Ярус в вики","value":"UIV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/goodgenerator/blocks/tileEntity/AntimatterGenerator.java",
    def: { layers: unpackLayers("35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |17 D17 |17 D17 |14 D2 D2 D14 |15 5D15 |15 D3 D15 |12 4D3 4D12 |15 D3 D15 |15 5D15 |14 D2 D2 D14 |17 D17 |17 D17 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |17 D17 |17 D17 |17 D17 |11 D5 D5 D11 |12 D2 2ED2E2 D12 |13 D3ED3ED13 |13 4ED4E13 |12 5ED5E12 |12 11E12 |8 8DEGE8D8 |12 11E12 |12 5ED5E12 |13 4ED4E13 |13 D3ED3ED13 |12 D2 2ED2E2 D12 |11 D5 D5 D11 |17 D17 |17 D17 |17 D17 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |17 D17 |17 D17 |15 2ED2E15 |9 D3 4ED4E3 D9 |10 D6ED6ED10 |10 7ED7E10 |10 5E2 D2 5E10 |9 5E3 D3 5E9 |9 4E D2 D2 D 4E9 |8 4E3 5D3 4E8 |8 4E3 D3ED3 4E8 |6 10DECE10D6 |8 4E3 D3ED3 4E8 |8 4E3 5D3 4E8 |9 4E D2 D2 D 4E9 |9 5E3 D3 5E9 |10 5E2 D2 5E10 |10 7ED7E10 |10 D6ED6ED10 |9 D3 4ED4E3 D9 |15 2ED2E15 |17 D17 |17 D17 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |17 D17 |17 D17 |14 3ED3E14 |12 5ED5E12 |8 D 5E2 D2 5E D8 |9 4E4 D4 4E9 |8 3E6 D6 3E8 |8 2E D5 D5 D 2E8 |7 3E2 D9 D2 3E7 |7 2E4 D7 D4 2E7 |6 3E17 3E6 |6 2E7 D3 D7 2E6 |6 2E8 3E8 2E6 |3 9D4 ECE4 9D3 |6 2E8 3E8 2E6 |6 2E7 D3 D7 2E6 |6 3E17 3E6 |7 2E4 D7 D4 2E7 |7 3E2 D9 D2 3E7 |8 2E D5 D5 D 2E8 |8 3E6 D6 3E8 |9 4E4 D4 4E9 |8 D 5E2 D2 5E D8 |12 5ED5E12 |14 3ED3E14 |17 D17 |17 D17 |17 D17 |35 |35 |35 /35 |35 |17 D17 |17 D17 |16 EDE16 |12 5ED5E12 |10 4E3 D3 4E10 |7 D 3E5 D5 3E D7 |8 2E15 2E8 |7 2ED15 D2E7 |6 2E2 D13 D2 2E6 |6 2E19 2E6 |5 2E21 2E5 |5 2E21 2E5 |5 E23 E5 |5 E9 D3 D9 E5 |4 2E10 3E10 2E4 |2 6D8 ECE8 6D2 |4 2E10 3E10 2E4 |5 E9 D3 D9 E5 |5 E23 E5 |5 2E21 2E5 |5 2E21 2E5 |6 2E19 2E6 |6 2E2 D13 D2 2E6 |7 2ED15 D2E7 |8 2E15 2E8 |7 D 3E5 D5 3E D7 |10 4E3 D3 4E10 |12 5ED5E12 |16 EDE16 |17 D17 |17 D17 |35 |35 /35 |35 |17 D17 |15 2ED2E15 |12 4E D 4E12 |10 2E5 D5 2E10 |9 E15 E9 |7 DE17 ED7 |7 ED17 DE7 |6 E21 E6 |5 E23 E5 |5 E23 E5 |4 E25 E4 |4 E25 E4 |4 E25 E4 |3 2E25 2E3 |3 E12 DED12 E3 |2 4D10 ECE10 4D2 |3 E12 DED12 E3 |3 2E25 2E3 |4 E25 E4 |4 E25 E4 |4 E25 E4 |5 E23 E5 |5 E23 E5 |6 E21 E6 |7 ED17 DE7 |7 DE17 ED7 |9 E15 E9 |10 2E5 D5 2E10 |12 4E D 4E12 |15 2ED2E15 |17 D17 |35 |35 /35 |35 |17 D17 |17 D17 |35 |35 |35 |7 D19 D7 |35 |35 |35 |35 |35 |35 |35 |35 |16 DED16 | 3D12 ECE12 2D2 |16 DED16 |35 |35 |35 |35 |35 |35 |35 |35 |7 D19 D7 |35 |35 |35 |17 D17 |17 D17 |35 |35 /35 |17 D17 |17 D17 |35 |35 |35 |35 |7 D19 D7 |35 |35 |35 |35 |35 |35 |35 |35 |16 DED16 | D14 ECE13 2D |16 DED16 |35 |35 |35 |35 |35 |35 |35 |35 |7 D19 D7 |35 |35 |35 |35 |17 D17 |17 D17 |35 /35 |17 D17 |35 |35 |35 |35 |35 |7 D19 D7 |8 D17 D8 |35 |35 |35 |35 |35 |35 |35 |17 A17 | D14 ACA14 D |17 A17 |35 |35 |35 |35 |35 |35 |35 |8 D17 D8 |7 D19 D7 |35 |35 |35 |35 |35 |17 D17 |35 /35 |17 D17 |35 |35 |35 |35 |35 |7 D19 D7 |8 D17 D8 |35 |35 |35 |35 |35 |35 |35 |17 A17 | D14 ACA14 D |17 A17 |35 |35 |35 |35 |35 |35 |35 |8 D17 D8 |7 D19 D7 |35 |35 |35 |35 |35 |17 D17 |35 /35 |17 D17 |35 |35 |35 |35 |35 |7 D19 D7 |8 D17 D8 |9 D15 D9 |35 |35 |35 |35 |35 |35 |17 A17 | D14 ACA14 D |17 A17 |35 |35 |35 |35 |35 |35 |9 D15 D9 |8 D17 D8 |7 D19 D7 |35 |35 |35 |35 |35 |17 D17 |35 /35 |17 D17 |14 7B14 |11 4B5 4B11 |9 3B11 3B9 |8 2B15 2B8 |6 3B17 3B6 |6 BD19 DB6 |5 2B21 2B5 |4 2B3 D15 D3 2B4 |4 B25 B4 |3 2B25 2B3 |3 B27 B3 |3 B27 B3 |2 2B27 2B2 |2 B29 B2 |2 B29 B2 | DB14 C14 BD |2 B29 B2 |2 B29 B2 |2 2B27 2B2 |3 B27 B3 |3 B27 B3 |3 2B25 2B3 |4 B25 B4 |4 2B3 D15 D3 2B4 |5 2B21 2B5 |6 BD19 DB6 |6 3B17 3B6 |8 2B15 2B8 |9 3B11 3B9 |11 4B5 4B11 |14 7B14 |17 D17 |35 /35 |17 D17 |35 |35 |35 |35 |35 |7 D19 D7 |35 |9 D15 D9 |10 D13 D10 |35 |35 |35 |35 |35 |35 | D15 C15 D |35 |35 |35 |35 |35 |35 |10 D13 D10 |9 D15 D9 |35 |7 D19 D7 |35 |35 |35 |35 |35 |17 D17 |35 /35 |17 D17 |35 |35 |35 |35 |35 |7 D19 D7 |35 |35 |10 D13 D10 |11 D11 D11 |35 |35 |35 |35 |35 | D15 C15 D |35 |35 |35 |35 |35 |11 D11 D11 |10 D13 D10 |35 |35 |7 D19 D7 |35 |35 |35 |35 |35 |17 D17 |35 /17 F17 |16 FDF16 |35 |35 |35 |35 |7 F19 F7 |6 FD19 DF6 |35 |35 |15 5E15 |12 B2E5A2EBD11 |11 BE2A5E2AEB11 |11 EA2E5 2EAE11 |11 EAE7 EAE11 |10 EAE9 EAE10 | F8 EAE4 E4 EAE8 F |FD8 EAE3 ECE3 EAE8 DF| F8 EAE4 E4 EAE8 F |10 EAE9 EAE10 |11 EAE7 EAE11 |11 EA2E5 2EAE11 |11 BE2A5E2AEB11 |12 B2E5A2EBD11 |15 5E15 |35 |35 |6 FD19 DF6 |7 F19 F7 |35 |35 |35 |35 |16 FDF16 |17 F17 /17 F17 |16 FDF16 |35 |35 |35 |35 |7 F19 F7 |6 FD19 DF6 |35 |35 |35 |15 5C15 |13 2C2EC2E2C13 |12 C2E2 C2 2EC12 |12 CE3 C3 EC12 |11 CE4 C4 EC11 | F9 CE3 ECE3 EC9 F |FD9 13C9 DF| F9 CE3 ECE3 EC9 F |11 CE4 C4 EC11 |12 CE3 C3 EC12 |12 C2E2 C2 2EC12 |13 2C2EC2E2C13 |15 5C15 |35 |35 |35 |6 FD19 DF6 |7 F19 F7 |35 |35 |35 |35 |16 FDF16 |17 F17 /17 F17 |16 FDF16 |35 |35 |35 |35 |7 F19 F7 |6 FD19 DF6 |35 |35 |15 5E15 |11 DB2E5A2EBD11 |11 BE2A5E2AEB11 |11 EA2E5 2EAE11 |11 EAE7 EAE11 |10 EAE9 EAE10 | F8 EAE4 E4 EAE8 F |FD8 EAE3 ECE3 EAE8 DF| F8 EAE4 E4 EAE8 F |10 EAE9 EAE10 |11 EAE7 EAE11 |11 EA2E5 2EAE11 |11 BE2A5E2AEB11 |11 DB2E5A2EBD11 |15 5E15 |35 |35 |6 FD19 DF6 |7 F19 F7 |35 |35 |35 |35 |16 FDF16 |17 F17 /35 |17 D17 |35 |35 |35 |35 |35 |7 D19 D7 |35 |35 |10 D13 D10 |11 D11 D11 |35 |35 |35 |35 |35 | D15 C15 D |35 |35 |35 |35 |35 |11 D11 D11 |10 D13 D10 |35 |35 |7 D19 D7 |35 |35 |35 |35 |35 |17 D17 |35 /35 |17 D17 |35 |35 |35 |35 |35 |7 D19 D7 |35 |9 D15 D9 |10 D13 D10 |35 |35 |35 |35 |35 |35 | D15 C15 D |35 |35 |35 |35 |35 |35 |10 D13 D10 |9 D15 D9 |35 |7 D19 D7 |35 |35 |35 |35 |35 |17 D17 |35 /35 |17 D17 |14 7B14 |11 4B5 4B11 |9 3B11 3B9 |8 2B15 2B8 |6 3B17 3B6 |6 BD19 DB6 |5 2B21 2B5 |4 2B3 D15 D3 2B4 |4 B25 B4 |3 2B25 2B3 |3 B27 B3 |3 B27 B3 |2 2B27 2B2 |2 B29 B2 |2 B29 B2 | DB14 C14 BD |2 B29 B2 |2 B29 B2 |2 2B27 2B2 |3 B27 B3 |3 B27 B3 |3 2B25 2B3 |4 B25 B4 |4 2B3 D15 D3 2B4 |5 2B21 2B5 |6 BD19 DB6 |6 3B17 3B6 |8 2B15 2B8 |9 3B11 3B9 |11 4B5 4B11 |14 7B14 |17 D17 |35 /35 |17 D17 |35 |35 |35 |35 |35 |7 D19 D7 |8 D17 D8 |9 D15 D9 |35 |35 |35 |35 |35 |35 |17 A17 | D14 ACA14 D |17 A17 |35 |35 |35 |35 |35 |35 |9 D15 D9 |8 D17 D8 |7 D19 D7 |35 |35 |35 |35 |35 |17 D17 |35 /35 |17 D17 |35 |35 |35 |35 |35 |7 D19 D7 |8 D17 D8 |35 |35 |35 |35 |35 |35 |35 |17 A17 | D14 ACA14 D |17 A17 |35 |35 |35 |35 |35 |35 |35 |8 D17 D8 |7 D19 D7 |35 |35 |35 |35 |35 |17 D17 |35 /35 |17 D17 |35 |35 |35 |35 |35 |7 D19 D7 |8 D17 D8 |35 |35 |35 |35 |35 |35 |35 |17 A17 | D14 ACA14 D |17 A17 |35 |35 |35 |35 |35 |35 |35 |8 D17 D8 |7 D19 D7 |35 |35 |35 |35 |35 |17 D17 |35 /35 |17 D17 |17 D17 |35 |35 |35 |35 |7 D19 D7 |35 |35 |35 |35 |35 |35 |35 |35 |16 DED16 | 2D13 ECE13 2D |16 DED16 |35 |35 |35 |35 |35 |35 |35 |35 |7 D19 D7 |35 |35 |35 |35 |17 D17 |17 D17 |35 /35 |35 |17 D17 |17 D17 |35 |35 |35 |7 D19 D7 |35 |35 |35 |35 |35 |35 |35 |35 |16 DED16 |2 2D12 ECE12 2D2 |16 DED16 |35 |35 |35 |35 |35 |35 |35 |35 |7 D19 D7 |35 |35 |35 |17 D17 |17 D17 |35 |35 /35 |35 |17 D17 |15 2ED2E15 |12 4E D 4E12 |10 2E5 D5 2E10 |9 E15 E9 |7 DE17 ED7 |7 ED17 DE7 |6 E21 E6 |5 E23 E5 |5 E23 E5 |4 E25 E4 |4 E25 E4 |4 E25 E4 |3 2E25 2E3 |3 E12 DED12 E3 |2 4D10 ECE10 4D2 |3 E12 DED12 E3 |3 2E25 2E3 |4 E25 E4 |4 E25 E4 |4 E25 E4 |5 E23 E5 |5 E23 E5 |6 E21 E6 |7 ED17 DE7 |7 DE17 ED7 |9 E15 E9 |10 2E5 D5 2E10 |12 4E D 4E12 |15 2ED2E15 |17 D17 |35 |35 /35 |35 |17 D17 |17 D17 |16 EDE16 |12 5ED5E12 |10 4E3 D3 4E10 |7 D 3E5 D5 3E D7 |8 2E15 2E8 |7 2ED15 D2E7 |6 2E2 D13 D2 2E6 |6 2E19 2E6 |5 2E21 2E5 |5 2E21 2E5 |5 E23 E5 |5 E9 D3 D9 E5 |4 2E10 3E10 2E4 |2 6D8 ECE8 6D2 |4 2E10 3E10 2E4 |5 E9 D3 D9 E5 |5 E23 E5 |5 2E21 2E5 |5 2E21 2E5 |6 2E19 2E6 |6 2E2 D13 D2 2E6 |7 2ED15 D2E7 |8 2E15 2E8 |7 D 3E5 D5 3E D7 |10 4E3 D3 4E10 |12 5ED5E12 |16 EDE16 |17 D17 |17 D17 |35 |35 /35 |35 |35 |35 |17 D17 |17 D17 |14 3ED3E14 |12 5ED5E12 |8 D 5E2 D2 5E D8 |9 4E4 D4 4E9 |8 3E6 D6 3E8 |8 2E D5 D5 D 2E8 |7 3E2 D9 D2 3E7 |7 2E4 D7 D4 2E7 |6 3E17 3E6 |6 2E7 D3 D7 2E6 |6 2E8 E~E8 2E6 |3 9D4 ECE4 9D3 |6 2E8 3E8 2E6 |6 2E7 D3 D7 2E6 |6 3E17 3E6 |7 2E4 D7 D4 2E7 |7 3E2 D9 D2 3E7 |8 2E D5 D5 D 2E8 |8 3E6 D6 3E8 |9 4E4 D4 4E9 |8 D 5E2 D2 5E D8 |12 5ED5E12 |14 3ED3E14 |17 D17 |17 D17 |17 D17 |35 |35 |35 /35 |35 |35 |35 |35 |35 |17 D17 |17 D17 |15 2ED2E15 |9 D3 4ED4E3 D9 |10 D6ED6ED10 |10 7ED7E10 |10 5E2 D2 5E10 |9 5E3 D3 5E9 |9 4E D2 D2 D 4E9 |8 4E3 5D3 4E8 |8 4E3 D3ED3 4E8 |6 10DECE10D6 |8 4E3 D3ED3 4E8 |8 4E3 5D3 4E8 |9 4E D2 D2 D 4E9 |9 5E3 D3 5E9 |10 5E2 D2 5E10 |10 7ED7E10 |10 D6ED6ED10 |9 D3 4ED4E3 D9 |15 2ED2E15 |17 D17 |17 D17 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |17 D17 |17 D17 |17 D17 |11 D5 D5 D11 |12 D2 2ED2E2 D12 |13 D3ED3ED13 |13 4ED4E13 |12 5ED5E12 |12 11E12 |8 8DEGE8D8 |12 11E12 |12 5ED5E12 |13 4ED4E13 |13 D3ED3ED13 |12 D2 2ED2E2 D12 |11 D5 D5 D11 |17 D17 |17 D17 |17 D17 |35 |35 |35 |35 |35 |35 |35 |35 /35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |17 D17 |17 D17 |14 D2 D2 D14 |15 5D15 |15 D3 D15 |12 4D3 4D12 |15 D3 D15 |15 5D15 |14 D2 D2 D14 |17 D17 |17 D17 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 |35 "), kinds: {"F":"gFrameNaquadria","D":"gMagneticFlux","G":"gAntimatterAnnihilatio","B":"gProtomatterActivation","C":"gGravityStabilization","A":"gTranscendentallyReinf","E":"gVentT2","~":"gAnnihilationMatrixController"} },
  },
  {
    slug: "windmill",
    name: "Windmill",
    title: "Ветряная мельница",
    tier: "steam",
    summary: "Мелет руду силой ветра — без пара и без электричества.",
    story: ["Ветряная мельница мелет предметы силой ветра: ей не нужны ни пар, ни электричество. Вики относит её к каменному веку — это самая ранняя постройка, которая умеет дробить.","Основание — из кирпичей, башня — из обожжённой глины, верх — из досок. В блок ротора наверху ставят ротор: от него зависит скорость, и он понемногу изнашивается."],
    facts: [{"label":"Размер","value":"7 × 12 × 7"},{"label":"Блоков","value":"194"},{"label":"Ярус в вики","value":"Stone"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/bartworks/common/tileentities/multis/MTEWindmill.java",
    def: { layers: unpackLayers("7 |7 |7 |3 p3 |7 |7 |7 /7 |7 |2 3p2 |2 p p2 |2 3p2 |7 |7 /7 | 5p | p3 p | p3 p | p3 p | 5p |7 / 5p |p5 p|p5 p|p5 p|p5 p|p5 p| 5p / 2pr2p |p5 p|p5 p|p5 p|p5 p|p5 p| 5p / 5p |p5 p|p5 p|p5 p|p5 p|p5 p| 5p /7 | 5p | p3 p | p3 p | p3 p | 5p |7 /7 |2 3c2 | c3 c | c3 c | c3 c |2 3c2 |7 /7 |2 3c2 | c3 c | c3 c | c3 c |2 cdc2 |7 /7 |2 3c2 | c3 c | c3 c | c3 c |2 3c2 |7 /7 |2 3c2 | c3 c | c3 c | c3 c |2 3c2 |7 / 2b~2b |7b|7b|7b|7b|7b| 5b "), kinds: {"p":"ownPlanks","c":"ownClay","d":"ownClay","b":"ownBricks","r":"gBwrotorBlock","~":"gWindmillController"} },
  },
  {
    slug: "charcoal-pile-igniter",
    name: "Charcoal Pile Igniter",
    title: "Поджигатель угольной ямы",
    tier: "steam",
    summary: "Пережигает кучу брёвен под землёй в древесный уголь.",
    story: ["Поджигатель угольной ямы превращает брёвна под собой в хрупкий древесный уголь. Брёвна кладут кучей: снизу — кирпичи, по бокам и сверху — земля, а сам поджигатель стоит сверху посередине.","Куча может быть разного размера — до 11 × 5 × 11 брёвен. Здесь показана маленькая: три на три и два слоя."],
    facts: [{"label":"Размер","value":"5 × 4 × 5"},{"label":"Блоков","value":"68"},{"label":"Ярус в вики","value":"Steam"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/gregtech/common/tileentities/machines/multi/MTECharcoalPit.java",
    def: { layers: unpackLayers("5 | 3D | D~D | 3D |5 /5D|D3LD|D3LD|D3LD|5D/5D|D3LD|D3LD|D3LD|5D/5 | 3B | 3B | 3B |5 "), kinds: {"D":"ownDirt","L":"ownLog","B":"ownBricks","~":"gCharcoalPileIgniterController"} },
  },
  {
    slug: "mega-apiary",
    name: "Industrial Apicultural Acclimatiser and Drone Domestication Station",
    title: "Мега-пасека",
    tier: "uv",
    summary: "Тысячи пчёл в одной постройке: мёд и соты без сотен ульев.",
    story: ["Мега-пасека (в игре её имя сокращают до IAADDS) держит пчелиных маток внутри контроллера и собирает их продукты — вместо сотен промышленных пасек. Это бережёт сервер.","Постройка — большой купол из стекла, досок и блоков пасеки мода Forestry; внутри — земля, вода и цветы для пчёл. Цветы на сайте не показаны."],
    facts: [{"label":"Размер","value":"15 × 17 × 15"},{"label":"Блоков","value":"1 079"},{"label":"Ярус в вики","value":"UV"}],
    source: "https://github.com/GTNewHorizons/GT5-Unofficial/blob/5.09.54.265/src/main/java/kubatech/tileentity/gregtech/multiblock/MTEMegaIndustrialApiary.java",
    def: { layers: unpackLayers("15 |15 |15 |6 3H6 |4 2H3A2H4 |4 HAPLPAH4 |3 HAP3APAH3 |3 HAL3ALAH3 |3 HAP3APAH3 |4 HAPLPAH4 |4 2H3A2H4 |6 3H6 |15 |15 |15 /15 |15 |6 3G6 |4 2G3 2G4 |3 G7 G3 |3 G7 G3 |2 G9 G2 |2 G9 G2 |2 G9 G2 |3 G7 G3 |3 G7 G3 |4 2G3 2G4 |6 3G6 |15 |15 /15 |6 3H6 |3 3H3 3H3 |2 HG7 GH2 |2 H9 H2 |2 H9 H2 | H11 H | H11 H | H11 H |2 H9 H2 |2 H9 H2 |2 HG7 GH2 |3 3H3 3H3 |6 3H6 |15 /6 3G6 |3 3G3 3G3 |2 G9 G2 | G11 G | G11 G | G11 G |G13 G|G13 G|G13 G| G11 G | G11 G | G11 G |2 G9 G2 |3 3G3 3G3 |6 3G6 /6 3A6 |3 OLA3 ALO3 |2 P9 P2 | O11 O | L11 L | A11 A |A13 A|A13 A|A13 A| A11 A | L11 L | O11 O |2 P9 P2 |3 OLA3 ALO3 |6 3A6 /5 5A5 |3 NA5 AO3 |2 P9 P2 | N11 O | A11 A |A13 A|A5 3I5 A|A5 3I5 A|A5 3I5 A|A13 A| A11 A | N11 N |2 P9 P2 |3 NA5 AN3 |5 5A5 /5 5A5 |3 NA5 AO3 |2 P9 P2 | N11 O | A11 A |A13 A|A5 3J5 A|A5 JKJ5 A|A5 3J5 A|A13 A| A11 A | N11 N |2 P9 P2 |3 NA5 AN3 |5 5A5 /6 3A6 |3 OLA3 ALO3 |2 P9 P2 | O11 O | L11 L | A11 A |A5 3K5 A|A5 3K5 A|A5 3K5 A| A11 A | L11 L | O11 O |2 P9 P2 |3 OLA3 ALO3 |6 3A6 /6 G~G6 |3 3G3B3G3 |2 G2B5 2BG2 | G2B7 2BG | GB9 BG | G11 G |GB4 3K4 BG|GB4 KJK4 BG|GB4 3K4 BG| G11 G | GB9 BG | G2B7 2BG |2 G2B5 2BG2 |3 3G3B3G3 |6 3G6 /6 3H6 |4 2H3B2H4 |2 2H7B2H2 |2 H3B3 3BH2 | H2B7 2BH | H2B 5B2 BH |H2B2 6B 2BH|H2B 7B 2BH|H2B 6B2 2BH| HB2 5B2 BH | H2B3 2B2 2BH |2 H3B4 2BH2 |2 2H7B2H2 |4 2H3B2H4 |6 3H6 /15 |5 5G5 |3 2G5B2G3 |2 G9BG2 |2 G9BG2 | G11BG | G11BG | G11BG | G11BG | G11BG |2 G9BG2 |2 G9BG2 |3 2G5B2G3 |5 5G5 |15 /15 |6 3H6 |4 2H3B2H4 |3 H7BH3 |2 H9BH2 |2 H9BH2 | H11BH | H11BH | H11BH |2 H9BH2 |2 H9BH2 |3 H7BH3 |4 2H3B2H4 |6 3H6 |15 /15 |15 |6 3G6 |4 2G3B2G4 |3 G7BG3 |3 G7BG3 |2 G9BG2 |2 G9BG2 |2 G9BG2 |3 G7BG3 |3 G7BG3 |4 2G3B2G4 |6 3G6 |15 |15 /15 |15 |7 H7 |5 2HB2H5 |4 H5BH4 |3 H7BH3 |3 H7BH3 |2 H9BH2 |3 H7BH3 |3 H7BH3 |4 H5BH4 |5 2HB2H5 |7 H7 |15 |15 /15 |15 |15 |7 G7 |5 2GB2G5 |4 G5BG4 |4 G5BG4 |3 G7BG3 |4 G5BG4 |4 G5BG4 |5 2GB2G5 |7 G7 |15 |15 |15 /15 |15 |15 |15 |6 3H6 |5 5H5 |4 2H3B2H4 |4 2H3B2H4 |4 2H3B2H4 |5 5H5 |6 3H6 |15 |15 |15 |15 /15 |15 |15 |15 |15 |15 |6 3G6 |6 GHG6 |6 3G6 |15 |15 |15 |15 |15 |15 "), kinds: {"A":"glass","B":"ownDirt","G":"gBronzeplatedbricks","H":"ownPlanks","I":"ownPlanks","J":"ownHive","K":"ownHive","L":"ownHive","N":"ownHive","O":"ownHive","P":"ownHive","~":"gMegaApiaryController"} },
  },
];

export const GEN_GUIDES: Readonly<Record<string, Guide>> = {
  "big-barrel-brewery": {
    "wiki": "Big Barrel Brewery",
    "tips": [
      {
        "title": "Для биочана",
        "text": "Главная работа — биомасса и бактерии. Поставьте её рядом с биочаном и подавайте ей сырьё без остановки."
      },
      {
        "title": "Параллели",
        "text": "По 4 рецепта за ярус: чем выше энергетический люк, тем больше варится сразу."
      }
    ]
  },
  "dissection-apparatus": {
    "wiki": "Dissection Apparatus",
    "tips": [
      {
        "title": "Трубные корпуса",
        "text": "Чем лучше предметные трубные корпуса внутри, тем больше параллелей — по 8 за уровень."
      },
      {
        "title": "Скидка",
        "text": "Экстрактор тратит 85 % обычной энергии рецепта и работает втрое быстрее."
      }
    ]
  },
  "microwave-grinder": {
    "wiki": "Microwave Grinder",
    "tips": [
      {
        "title": "Осторожно",
        "text": "Урон получают и игроки. Не стойте внутри и на крыше, пока печь включена."
      },
      {
        "title": "Мощность",
        "text": "Урон растёт с мощностью, но после трёх порогов рост замедляется — лишняя энергия уходит почти впустую."
      }
    ]
  },
  "large-sifter": {
    "wiki": "Large Sifter",
    "tips": [
      {
        "title": "Фоном",
        "text": "Подключите к нему отходы, которые больше никуда не идут, — он будет понемногу давать самоцветы."
      },
      {
        "title": "Скорость",
        "text": "500 % скорости и 75 % энергии от одноблочного, плюс 4 параллели за ярус."
      }
    ]
  },
  "latex": {
    "wiki": "LATEX",
    "tips": [
      {
        "title": "Резина",
        "text": "Каждый уровень трубных корпусов экономит ещё 6,25 % резины."
      },
      {
        "title": "Сингулярность",
        "text": "Эластичная сингулярность в контроллере — вдвое больше параллелей и ещё 25 % резины в запас."
      }
    ]
  },
  "tesla-tower": {
    "wiki": "Tesla Tower",
    "tips": [
      {
        "title": "Потери",
        "text": "Без проводов потери никуда не делись: 1 EU на блок расстояния за ампер. Ставьте башню поближе к машинам."
      },
      {
        "title": "Конденсаторы",
        "text": "Чем больше конденсаторов в люках, тем больше ампер; их ярус задаёт напряжение передачи."
      }
    ]
  },
  "solar-factory": {
    "wiki": "Solar Factory",
    "tips": [
      {
        "title": "Три уровня",
        "text": "Контроллер один, а постройка у каждого уровня своя. Переход на новый уровень — перестройка."
      },
      {
        "title": "Пластины",
        "text": "Выход растёт за каждый уровень пластины выше минимального — на втором уровне на 25 %, на третьем на 50 %."
      }
    ]
  },
  "turbocan-pro": {
    "wiki": "TurboCan Pro",
    "tips": [
      {
        "title": "Два режима",
        "text": "Режим наполнения предметами и режим жидкостей переключают в контроллере."
      },
      {
        "title": "Без улучшений",
        "text": "Корпуса не улучшаются; быстрее его делает только более высокий энергетический люк."
      }
    ]
  },
  "tfft": {
    "wiki": "TFFT",
    "tips": [
      {
        "title": "1/25 на вид",
        "text": "Каждая жидкость занимает не больше 1/25 общего объёма, даже если остальные места пусты."
      },
      {
        "title": "Или YOTTank",
        "text": "Для одной жидкости проще YOTTank: ему не нужны ни энергия, ни обслуживание."
      }
    ]
  },
  "coolant-tower": {
    "wiki": "Coolant Tower",
    "tips": [
      {
        "title": "Круговорот воды",
        "text": "Ставьте её после паровых машин и котлов: вода возвращается в оборот, а не тратится."
      },
      {
        "title": "Только обычный пар",
        "text": "Перегретый и сверхкритический пар сначала охлаждайте в турбине — сама башня их не берёт."
      }
    ]
  },
  "extreme-entity-crusher": {
    "wiki": "Extreme Entity Crusher",
    "tips": [
      {
        "title": "Меч",
        "text": "Меч не обязателен, но с «Добычей» выход больше. Он изнашивается — держите запасной."
      },
      {
        "title": "Без лагов",
        "text": "Мобы не появляются в мире, поэтому дробитель куда легче для сервера, чем обычная ферма."
      }
    ]
  },
  "dissolution-tank": {
    "wiki": "Dissolution Tank",
    "tips": [
      {
        "title": "Точное соотношение",
        "text": "Подавайте жидкости строго в пропорции из NEI, иначе рецепт сгорит."
      },
      {
        "title": "Партиями",
        "text": "Рецепты можно умножать: заливайте сразу кратные порции обеих жидкостей."
      }
    ]
  },
  "large-heat-exchanger": {
    "wiki": "Large Heat Exchanger",
    "tips": [
      {
        "title": "Вода!",
        "text": "Без дистиллированной воды теплообменник взорвётся. Подачу воды делайте с запасом."
      },
      {
        "title": "Перегретый пар",
        "text": "Подавайте горячую жидкость выше порога — получится перегретый пар для турбины высокого давления."
      }
    ]
  },
  "industrial-3d-copying-machine": {
    "wiki": "Industrial 3D Copying Machine",
    "tips": [
      {
        "title": "Как выбрать вариант",
        "text": "Проще всего — шина долота с призрачным предметом нужного варианта."
      },
      {
        "title": "Параллели",
        "text": "16 за ярус: с хорошим энергетическим люком он обрабатывает сундуки блоков за секунды."
      }
    ]
  },
  "industrial-coke-oven": {
    "wiki": "Industrial Coke Oven",
    "tips": [
      {
        "title": "Катушки",
        "text": "Каждый уровень катушек — ещё 2 % экономии энергии."
      },
      {
        "title": "Секции",
        "text": "Печь удлиняют секциями: каждая добавляет 16 параллелей."
      }
    ]
  },
  "large-electric-compressor": {
    "wiki": "Large Electric Compressor",
    "tips": [
      {
        "title": "Скромно",
        "text": "Всего 2 параллели за ярус — это скорее замена нескольких одноблочных компрессоров."
      },
      {
        "title": "Потом",
        "text": "В ZPM переходите на установку горячего изостатического прессования."
      }
    ]
  },
  "large-fluid-extractor": {
    "wiki": "Large Fluid Extractor",
    "tips": [
      {
        "title": "Две катушки",
        "text": "Соленоиды решают число параллелей, нагревательные катушки — скорость и расход."
      },
      {
        "title": "Для металлов",
        "text": "Главное применение — расплавить металл для отлива деталей и сплавов."
      }
    ]
  },
  "industrial-precision-lathe": {
    "wiki": "Industrial Precision Lathe",
    "tips": [
      {
        "title": "Трубные корпуса",
        "text": "Чем лучше предметные трубные корпуса, тем больше рецептов сразу."
      },
      {
        "title": "Скорость",
        "text": "400 % скорости и 80 % энергии от одноблочного станка."
      }
    ]
  },
  "industrial-bending-machine": {
    "wiki": "Industrial Bending Machine",
    "tips": [
      {
        "title": "Разделение входов",
        "text": "С разными схемами в разных шинах включите разделение входов — иначе рецепты перепутаются."
      },
      {
        "title": "Пластины",
        "text": "Самая частая работа — пластины для корпусов и деталей; станок быстро окупается."
      }
    ]
  },
  "industrial-forming-press": {
    "wiki": "Industrial Forming Press",
    "tips": [
      {
        "title": "Формы",
        "text": "Каждую форму держите в своей шине и включите разделение входов."
      },
      {
        "title": "Параллели",
        "text": "6 за ярус — с энергетическим люком повыше пресс заменяет десяток одноблочных."
      }
    ]
  },
  "large-neutralization-engine": {
    "wiki": "Large Neutralization Engine",
    "tips": [
      {
        "title": "Основания",
        "text": "Обязательно подавайте основания: выработка и КПД растут впятеро."
      },
      {
        "title": "Остатки",
        "text": "Следите за токсичными остатками — для этого есть отдельный датчик люка."
      }
    ]
  },
  "large-thermal-refinery": {
    "wiki": "Large Thermal Refinery",
    "tips": [
      {
        "title": "Катушки и соленоиды",
        "text": "Лучшие катушки — скорость и экономия, лучшие соленоиды — больше параллелей."
      },
      {
        "title": "Топливные стержни",
        "text": "Отработанные стержни реакторов тоже перерабатывайте здесь."
      }
    ]
  },
  "ore-washing-plant": {
    "wiki": "Ore Washing Plant",
    "tips": [
      {
        "title": "Два режима",
        "text": "Нужны побочные продукты — обычная промывка, нужна скорость — простая."
      },
      {
        "title": "Вода",
        "text": "Воды уходит много: подключите насос или люк-резервуар."
      }
    ]
  },
  "large-semifluid-burner": {
    "wiki": "Large Semifluid Burner",
    "tips": [
      {
        "title": "Смазка",
        "text": "Без смазки горелка не работает — подавайте её постоянно."
      },
      {
        "title": "Кислород",
        "text": "С кислородом выработка втрое выше, а КПД — 150 %."
      }
    ]
  },
  "solid-oxide-fuel-cell": {
    "wiki": "Solid-Oxide Fuel Cell",
    "tips": [
      {
        "title": "Пар впрок",
        "text": "Пар с топливного элемента подайте в большую паровую турбину — это ещё энергия."
      },
      {
        "title": "Разогрев",
        "text": "Сразу после пуска КПД ниже — элемент выходит на 100 % после разогрева."
      }
    ]
  },
  "amazon-warehousing-depot": {
    "wiki": "Amazon Warehousing Depot",
    "tips": [
      {
        "title": "Два режима",
        "text": "Упаковка и распаковка — одна постройка, режим меняется в контроллере."
      },
      {
        "title": "Разделение входов",
        "text": "С разными схемами в разных шинах включите разделение входов."
      }
    ]
  },
  "boldarnator": {
    "wiki": "Boldarnator",
    "tips": [
      {
        "title": "Бесплатный камень",
        "text": "Булыжник и камень ничего не стоят, кроме энергии — удобно для бетона и строительства."
      },
      {
        "title": "Обсидиан",
        "text": "Каждый обсидиан тратит одну пыль красного камня."
      }
    ]
  },
  "cryogenic-freezer": {
    "wiki": "Cryogenic Freezer",
    "tips": [
      {
        "title": "Криотеум",
        "text": "Следите за подачей криотеума — без него морозильник ломается сразу."
      },
      {
        "title": "Потом",
        "text": "В ZPM его сменяет эндотермический холодильник."
      }
    ]
  },
  "dangote-distillus": {
    "wiki": "Dangote Distillus",
    "tips": [
      {
        "title": "Высота",
        "text": "Слоёв нужно столько, сколько у рецепта выходов, плюс вход."
      },
      {
        "title": "Глушитель",
        "text": "В отличие от обычной колонны ему нужен люк-глушитель."
      }
    ]
  },
  "advanced-assembly-line": {
    "wiki": "Advanced Assembly Line",
    "tips": [
      {
        "title": "Параллели",
        "text": "Сколько твёрдых ингредиентов в рецепте — столько рецептов идёт сразу."
      },
      {
        "title": "Без пропуска ярусов",
        "text": "В отличие от обычной линии ярус рецепта пропустить нельзя."
      }
    ]
  },
  "deep-earth-heating-pump": {
    "wiki": "Deep Earth Heating Pump",
    "tips": [
      {
        "title": "Труба",
        "text": "Как буровая, он опускает трубу вниз — нужны трубы для бурения."
      },
      {
        "title": "Два режима",
        "text": "Пар — для турбины, горячий хладагент — для теплообменника."
      }
    ]
  },
  "decay-warehouse": {
    "wiki": "Decay Warehouse",
    "tips": [
      {
        "title": "Сундук внутри",
        "text": "Ёмкость — это ёмкость сверх- или квантового сундука в центре, делённая на 400."
      },
      {
        "title": "Вода",
        "text": "Внутри постройка залита водой — так в игре."
      }
    ]
  },
  "density-squared": {
    "wiki": "Density^2",
    "tips": [
      {
        "title": "Взрывчатка",
        "text": "Рецепты те же, что у обычного компрессора, — со взрывчаткой."
      },
      {
        "title": "Потом",
        "text": "В UHV переходите на электрический имплозионный компрессор: без взрывчатки."
      }
    ]
  },
  "digester": {
    "wiki": "Digester",
    "tips": [
      {
        "title": "Идеальный разгон",
        "text": "Больше энергии — быстрее без лишних потерь; много дигесторов не нужно."
      },
      {
        "title": "Пара",
        "text": "Ставьте рядом бак растворения: он разбавляет растворы дальше."
      }
    ]
  },
  "drone-centre": {
    "wiki": "Drone Centre",
    "tips": [
      {
        "title": "Модуль связи",
        "text": "Замените люки обслуживания на модули связи с дронами — тогда чинить будут дроны."
      },
      {
        "title": "Запас дронов",
        "text": "Дроны иногда разбиваются — держите во входной шине запасных."
      }
    ]
  },
  "extreme-industrial-greenhouse": {
    "wiki": "Extreme Industrial Greenhouse",
    "tips": [
      {
        "title": "Вода",
        "text": "Без воды растения не растут — подавайте её постоянно."
      },
      {
        "title": "Семена CropsNH",
        "text": "Семена CropsNH здесь не работают — их растят на промышленной ферме."
      }
    ]
  },
  "htgr": {
    "wiki": "High Temperature Gas-Cooled Reactor",
    "tips": [
      {
        "title": "Полная загрузка",
        "text": "Держите реактор полным: так он работает выгоднее всего."
      },
      {
        "title": "Охлаждение",
        "text": "Хладагент и дистиллированная вода сильно ускоряют распад."
      }
    ]
  },
  "industrial-electrolyzer": {
    "wiki": "Industrial Electrolyzer",
    "tips": [
      {
        "title": "Скорость",
        "text": "280 % скорости и 90 % энергии от одноблочного."
      },
      {
        "title": "Параллели",
        "text": "По 4 за ярус: поднимайте ярус энергетического люка."
      }
    ]
  },
  "industrial-extrusion-machine": {
    "wiki": "Industrial Extrusion Machine",
    "tips": [
      {
        "title": "Шины экструзии",
        "text": "Положите форму в призрачный слот шины — она действует только на свою шину."
      },
      {
        "title": "Одна на всё",
        "text": "С несколькими шинами один экструдер заменяет целую комнату одноблочных."
      }
    ]
  },
  "industrial-mixing-machine": {
    "wiki": "Industrial Mixing Machine",
    "tips": [
      {
        "title": "Разделение входов",
        "text": "Для разных схем в разных шинах включите разделение входов."
      },
      {
        "title": "Трубные корпуса",
        "text": "Уровень предметных трубных корпусов влияет на скорость."
      }
    ]
  },
  "industrial-sledgehammer": {
    "wiki": "Industrial Sledgehammer",
    "tips": [
      {
        "title": "Соленоиды",
        "text": "Лучшие соленоиды — больше параллелей."
      },
      {
        "title": "Предел",
        "text": "Больше 1 080 рецептов сразу не бывает."
      }
    ]
  },
  "hyper-intensity-laser-engraver": {
    "wiki": "Hyper-Intensity Laser Engraver",
    "tips": [
      {
        "title": "Лазерный источник",
        "text": "Лазерный люк-источник решает и параллели, и предельный ярус рецепта."
      },
      {
        "title": "Нитинол",
        "text": "Для сборки нужен нитинол 60 из плавильни сплавов."
      }
    ]
  },
  "large-molecular-assembler": {
    "wiki": "Large Molecular Assembler",
    "tips": [
      {
        "title": "Для AE2",
        "text": "Он подключается к сети как обычный молекулярный сборщик, только намного быстрее."
      },
      {
        "title": "Шаблоны",
        "text": "Шаблоны кладут во входную шину или в поставщик шаблонов рядом."
      }
    ]
  },
  "industrial-wire-factory": {
    "wiki": "Industrial Wire Factory",
    "tips": [
      {
        "title": "Разделение входов",
        "text": "Разные схемы в разных шинах — включите разделение входов."
      },
      {
        "title": "Трубные корпуса",
        "text": "Предметные трубные корпуса повышают скорость."
      }
    ]
  },
  "industrial-cutting-factory": {
    "wiki": "Industrial Cutting Factory",
    "tips": [
      {
        "title": "Пила",
        "text": "Лучшая пила в контроллере — больше скорость и выше ярус люков."
      },
      {
        "title": "Пластины",
        "text": "Режет и кремниевые пластины — удобно для схем."
      }
    ]
  },
  "industrial-chemical-bath": {
    "wiki": "Industrial Chemical Bath",
    "tips": [
      {
        "title": "Скорость",
        "text": "500 % скорости от одноблочной ванны."
      },
      {
        "title": "Руды",
        "text": "Через ванну проходят руды с ценными побочными продуктами."
      }
    ]
  },
  "magnetic-flux-exhibitor": {
    "wiki": "Magnetic Flux Exhibitor",
    "tips": [
      {
        "title": "Электромагнит",
        "text": "Лучший электромагнит — больше скорость, экономия и параллели."
      },
      {
        "title": "Два режима",
        "text": "Поляризация и разделение переключаются в контроллере."
      }
    ]
  },
  "lftr": {
    "wiki": "Liquid Fluoride Thorium Reactor",
    "tips": [
      {
        "title": "Топливо",
        "text": "Все три топлива — с завода переработки реакторного топлива."
      },
      {
        "title": "Отходы",
        "text": "Отработанные соли перерабатывайте на заводе по переработке ядерной соли."
      }
    ]
  },
  "nuclear-salt-processing-plant": {
    "wiki": "Nuclear Salt Processing Plant",
    "tips": [
      {
        "title": "Половины",
        "text": "Входы подключайте слева, выходы — справа."
      },
      {
        "title": "Для ЖФТР",
        "text": "Без него отработанные соли реактора копятся без дела."
      }
    ]
  },
  "mass-solidifier": {
    "wiki": "Mass Solidifier",
    "tips": [
      {
        "title": "Без простоя",
        "text": "Скорость копится только в работе — держите его загруженным."
      },
      {
        "title": "Формы",
        "text": "Форма в призрачном слоте люка действует только на свой люк."
      }
    ]
  },
  "reactor-fuel-processing-plant": {
    "wiki": "Reactor Fuel Processing Plant",
    "tips": [
      {
        "title": "Один люк",
        "text": "Энергетический люк — только один: заводов ставят несколько."
      },
      {
        "title": "Короткие рецепты",
        "text": "Для топлива 2 и 3 ищите в NEI более прямые рецепты."
      }
    ]
  },
  "rocketdyne-f1a": {
    "wiki": "Rocketdyne F-1A Engine",
    "tips": [
      {
        "title": "Воздух",
        "text": "Воздух подают только воздухозаборные люки — ставьте их с запасом."
      },
      {
        "title": "Мягкий предел",
        "text": "Много топлива сразу — ниже КПД; ищите баланс."
      }
    ]
  },
  "solar-tower": {
    "wiki": "Solar Tower",
    "tips": [
      {
        "title": "Кольца",
        "text": "Больше колец отражателей — быстрее нагрев."
      },
      {
        "title": "Ночь и дождь",
        "text": "Ночью башня не греет — запасайте горячую соль."
      }
    ]
  },
  "precise-auto-assembler": {
    "wiki": "Precise Auto-Assembler MT-3662",
    "tips": [
      {
        "title": "Корпуса блоков",
        "text": "Уровень корпусов точных электронных блоков решает число параллелей."
      },
      {
        "title": "Без пропуска ярусов",
        "text": "Ярус рецепта пропустить нельзя — нужен люк нужного яруса."
      }
    ]
  },
  "zyngen": {
    "wiki": "Zyngen",
    "tips": [
      {
        "title": "Катушки",
        "text": "Лучшие катушки — и скорость, и параллели, и идеальные разгоны."
      },
      {
        "title": "С нуля",
        "text": "У рецептов печи нет минимального нагрева — идеальные разгоны идут с первых 900 K."
      }
    ]
  },
  "thermal-boiler": {
    "wiki": "Thermal Boiler",
    "tips": [
      {
        "title": "Вода!",
        "text": "Без воды бойлер взрывается — подачу делайте с запасом."
      },
      {
        "title": "Фильтр лавы",
        "text": "Фильтр в контроллере даёт побочные продукты из лавы."
      }
    ]
  },
  "tree-growth-simulator": {
    "wiki": "Tree Growth Simulator",
    "tips": [
      {
        "title": "Инструмент",
        "text": "Пила — брёвна, ножницы — листья, нож — саженцы и фрукты."
      },
      {
        "title": "Без лагов",
        "text": "Деревья не ставятся в мир, так что ферма лёгкая для сервера."
      }
    ]
  },
  "zhuhai-fishing-port": {
    "wiki": "Zhuhai Fishing Port",
    "tips": [
      {
        "title": "Три рецепта",
        "text": "Рыба, мусор или сокровища выбираются схемой."
      },
      {
        "title": "Вода внутри",
        "text": "Внутри постройки — вода, так её строят в игре."
      }
    ]
  },
  "xl-turbo-steam-turbine": {
    "wiki": "XL Turbo Steam Turbine",
    "tips": [
      {
        "title": "Одинаковые турбины",
        "text": "Все 12 турбин должны быть одинаковыми, иначе турбина не запустится."
      },
      {
        "title": "Плотный пар",
        "text": "Плотный пар даёт ту же энергию меньшим объёмом."
      }
    ]
  },
  "thtr": {
    "wiki": "Thorium High Temperature Reactor",
    "tips": [
      {
        "title": "Загрузка",
        "text": "Держите реактор полным: так он выгоднее."
      },
      {
        "title": "Хладагент",
        "text": "Подайте хладагент — горячий хладагент даст энергию в теплообменнике."
      }
    ]
  },
  "yottank": {
    "wiki": "YOTTank",
    "tips": [
      {
        "title": "Одна жидкость",
        "text": "Хранит один вид жидкости; для многих — T.F.F.T."
      },
      {
        "title": "Высота",
        "text": "Бак можно наращивать до 15 слоёв ячеек."
      }
    ]
  },
  "thermic-heating-device": {
    "wiki": "Thermic Heating Device",
    "tips": [
      {
        "title": "Для биосхем",
        "text": "Среды для бактерий и катализаторов греют именно здесь."
      },
      {
        "title": "Параллели",
        "text": "По 8 за ярус: ставьте люк повыше."
      }
    ]
  },
  "universal-chemical-fuel-engine": {
    "wiki": "Universal Chemical Fuel Engine",
    "tips": [
      {
        "title": "Промоутер",
        "text": "Подавайте промоутер — от него зависит КПД."
      },
      {
        "title": "Запас по динамо",
        "text": "Не выжимайте динамо-люк до предела: КПД упадёт."
      }
    ]
  },
  "clarifier-purification-unit": {
    "wiki": "Clarifier Purification Unit",
    "tips": [
      {
        "title": "Фильтры",
        "text": "Наладьте постоянное производство фильтров из активированного угля."
      },
      {
        "title": "Станция",
        "text": "Работает только в связке с водоочистной станцией."
      }
    ]
  },
  "compact-fusion-reactor": {
    "wiki": "Compact Fusion Reactor",
    "tips": [
      {
        "title": "Параллели",
        "text": "Рецептов сразу больше, чем у обычного реактора, — он заменяет несколько реакторов."
      },
      {
        "title": "Пять моделей",
        "text": "MK-I — LuV; модели выше открываются на следующих ярусах."
      }
    ]
  },
  "flotation-cell-regulator": {
    "wiki": "Flotation Cell Regulator",
    "tips": [
      {
        "title": "Одна руда",
        "text": "Первый же рецепт закрепляется навсегда — для каждой руды своя камера."
      },
      {
        "title": "Цепочка",
        "text": "Перед ней стоит мельница IsaMill, после — Утупу-Танури."
      }
    ]
  },
  "extreme-heat-exchanger": {
    "wiki": "Extreme Heat Exchanger",
    "tips": [
      {
        "title": "Плазма",
        "text": "Остывающую плазму из генераторов отправляйте сюда — получится плотный пар."
      },
      {
        "title": "Вода!",
        "text": "Без воды теплообменник взрывается."
      }
    ]
  },
  "industrial-arc-furnace": {
    "wiki": "Industrial Arc Furnace",
    "tips": [
      {
        "title": "Электрод",
        "text": "Лучший электрод — больше скорость и параллели; держите запасные."
      },
      {
        "title": "Переработка",
        "text": "В режиме переработки она разбирает лишние предметы на материалы."
      }
    ]
  },
  "isamill": {
    "wiki": "IsaMill Grinding Machine",
    "tips": [
      {
        "title": "Шары",
        "text": "Размольные шары изнашиваются — пакетный режим продлевает им жизнь."
      },
      {
        "title": "Дальше",
        "text": "Размолотая руда идёт во флотационную камеру."
      }
    ]
  },
  "industrial-autoclave": {
    "wiki": "Industrial Autoclave",
    "tips": [
      {
        "title": "Три улучшения",
        "text": "Катушки — скорость, трубные корпуса — экономия, предметные трубы — параллели."
      },
      {
        "title": "Кристаллы",
        "text": "Удобен для кристаллических чипов: их растят много раз подряд."
      }
    ]
  },
  "molecular-transformer": {
    "wiki": "Molecular Transformer",
    "tips": [
      {
        "title": "Санарий",
        "text": "Светопыль в санарий — самый частый рецепт."
      },
      {
        "title": "Без бонусов",
        "text": "Ярусных бонусов нет: больше энергии — просто быстрее."
      }
    ]
  },
  "ozonation-purification-unit": {
    "wiki": "Ozonation Purification Unit",
    "tips": [
      {
        "title": "Озон",
        "text": "Главное — производство озона с запасом."
      },
      {
        "title": "Цикл",
        "text": "Все установки линии работают циклами по 120 секунд."
      }
    ]
  },
  "planetary-gas-siphon": {
    "wiki": "Planetary Gas Siphon",
    "tips": [
      {
        "title": "Станция",
        "text": "Сифон ставят на космической станции над нужной планетой."
      },
      {
        "title": "Несколько газов",
        "text": "Для разных газов ставят несколько сифонов на одну станцию."
      }
    ]
  },
  "sparge-tower": {
    "wiki": "Sparge Tower",
    "tips": [
      {
        "title": "Соли",
        "text": "Отработанные соли берутся только из реактора ЖФТР."
      },
      {
        "title": "Газы",
        "text": "Из U-соли выходят все благородные газы."
      }
    ]
  },
  "utupu-tanuri": {
    "wiki": "Utupu-Tanuri",
    "tips": [
      {
        "title": "Катушки",
        "text": "Лучшие катушки — больше нагрева, экономии и идеальных разгонов."
      },
      {
        "title": "Пена металлов",
        "text": "Пена из флотационной камеры становится здесь редкими металлами."
      }
    ]
  },
  "whakawhiti-wera-xl": {
    "wiki": "Whakawhiti Wera XL",
    "tips": [
      {
        "title": "Вода!",
        "text": "Без дистиллированной воды теплообменник взрывается."
      },
      {
        "title": "Для турбин",
        "text": "Перегретый пар — для турбины высокого давления."
      }
    ]
  },
  "xl-turbo-gas-turbine": {
    "wiki": "XL Turbo Gas Turbine",
    "tips": [
      {
        "title": "Одинаковые турбины",
        "text": "Все 12 турбин — одинаковые, иначе турбина не запустится."
      },
      {
        "title": "Поток",
        "text": "Держите поток газа близко к оптимальному — штрафы суровые."
      }
    ]
  },
  "water-purification-plant": {
    "wiki": "Water Purification Plant",
    "tips": [
      {
        "title": "Привязка",
        "text": "Каждую установку очистки привязывают к станции."
      },
      {
        "title": "Ступени",
        "text": "Каждая следующая ступень даёт воду чище — она нужна для пластин высших схем."
      }
    ]
  },
  "active-transformer": {
    "wiki": "Active Transformer",
    "tips": [
      {
        "title": "Лазеры",
        "text": "С лазерными люками он раздаёт энергию по всей базе."
      },
      {
        "title": "Потери",
        "text": "Потери крошечные — 0,004 %, но на огромных потоках заметны."
      }
    ]
  },
  "data-bank": {
    "wiki": "Data Bank",
    "tips": [
      {
        "title": "Цепочка",
        "text": "Банки соединяют цепочкой — тогда флешек сколько угодно."
      },
      {
        "title": "Оптоволокно",
        "text": "Сборочные линии подключают оптоволоконными кабелями."
      }
    ]
  },
  "energy-infuser": {
    "wiki": "Energy Infuser",
    "tips": [
      {
        "title": "Зарядка",
        "text": "С лазерными люками заряжает почти мгновенно."
      },
      {
        "title": "UU-материя",
        "text": "Починка тратит UU-материю — держите её в люке."
      }
    ]
  },
  "flocculation-purification-unit": {
    "wiki": "Flocculation Purification Unit",
    "tips": [
      {
        "title": "Точная доза",
        "text": "Подавайте хлорид ровно столько, сколько нужно, — иначе шанс успеха падает."
      },
      {
        "title": "Замкнутый круг",
        "text": "Отходы флокуляции перерабатываются обратно в хлорид."
      }
    ]
  },
  "elemental-duplicator": {
    "wiki": "Elemental Duplicator",
    "tips": [
      {
        "title": "UU-материя",
        "text": "Главное сырьё — UU-материя; рядом обычно стоит фабрикатор материи."
      },
      {
        "title": "Разгон",
        "text": "Разгоны идеальные — больше энергии без потерь."
      }
    ]
  },
  "hot-isostatic-pressurization-unit": {
    "wiki": "Hot Isostatic Pressurization Unit",
    "tips": [
      {
        "title": "Перегрев",
        "text": "Дайте ей остыть — перегретая установка работает медленнее."
      },
      {
        "title": "Сингулярности",
        "text": "Нужна для рецептов, которым мало обычного сжатия."
      }
    ]
  },
  "large-scale-auto-assembler": {
    "wiki": "Large Scale Auto-Assembler v1.01",
    "tips": [
      {
        "title": "Пропуск ярусов",
        "text": "В отличие от точного автосборщика, он ведёт рецепты через ярус."
      },
      {
        "title": "Для массы",
        "text": "Для больших партий выгоднее точный автосборщик."
      }
    ]
  },
  "linear-accelerator": {
    "wiki": "Linear Accelerator",
    "tips": [
      {
        "title": "Длина",
        "text": "Длиннее ускоритель — сильнее разгон пучка."
      },
      {
        "title": "Охлаждение",
        "text": "Ему нужен хладагент — без него ускоритель не работает."
      }
    ]
  },
  "source-chamber": {
    "wiki": "Beam Line",
    "tips": [
      {
        "title": "Сырьё",
        "text": "От сырья зависят все свойства пучка — выбирайте его по рецепту."
      },
      {
        "title": "Линия пучков",
        "text": "Источник → ускоритель → синхротрон → камера мишени."
      }
    ]
  },
  "synchrotron": {
    "wiki": "Synchrotron",
    "tips": [
      {
        "title": "Антенны",
        "text": "Антенные корпуса выше уровнем сохраняют энергию пучка."
      },
      {
        "title": "Фотоны",
        "text": "Все рецепты линии пучков работают на фотонном пучке из синхротрона."
      }
    ]
  },
  "target-chamber": {
    "wiki": "Target Chamber",
    "tips": [
      {
        "title": "Маски",
        "text": "Для гравировки нужны маски во входной шине масок."
      },
      {
        "title": "Лишняя энергия",
        "text": "Больше энергии сверх нужного не помогает — важен пучок."
      }
    ]
  },
  "ph-neutralization-purification-unit": {
    "wiki": "PH Neutralization Purification Unit",
    "tips": [
      {
        "title": "Датчик",
        "text": "Используйте датчик pH и автоматическую подачу щёлочи и кислоты."
      },
      {
        "title": "Ровно 7,0",
        "text": "Рецепт удаётся только при нейтральном pH."
      }
    ]
  },
  "spinmatron-2737": {
    "wiki": "Spinmatron-2737",
    "tips": [
      {
        "title": "Турбины",
        "text": "Ставьте огромные турбины — они дают больше параллелей."
      },
      {
        "title": "Режимы",
        "text": "Есть особые режимы для тяжёлых рецептов центрифуги."
      }
    ]
  },
  "xl-turbo-plasma-turbine": {
    "wiki": "XL Turbo Plasma Turbine",
    "tips": [
      {
        "title": "Одинаковые турбины",
        "text": "Все 12 турбин — одинаковые, иначе не запустится."
      },
      {
        "title": "Плазма",
        "text": "Лучшая плазма — из реакторов синтеза высоких уровней."
      }
    ]
  },
  "void-miner": {
    "wiki": "Void Miner",
    "tips": [
      {
        "title": "Мир решает",
        "text": "Состав руды — как у жил того мира, где он стоит."
      },
      {
        "title": "Газ",
        "text": "Благородные газы ускоряют добычу."
      }
    ]
  },
  "component-assembly-line": {
    "wiki": "Component Assembly Line",
    "tips": [
      {
        "title": "Корпуса",
        "text": "Ярус корпусов сборочной линии деталей решает ярус деталей."
      },
      {
        "title": "Экономия",
        "text": "Рецепты линии заметно дешевле обычной сборки тех же деталей."
      }
    ]
  },
  "beam-mirror": {
    "wiki": "Beam Mirror",
    "tips": [
      {
        "title": "Без потерь",
        "text": "Свойства пучка после зеркала не меняются."
      },
      {
        "title": "Раскладка",
        "text": "Зеркалами линию пучков укладывают в удобную форму."
      }
    ]
  },
  "beam-splitter": {
    "wiki": "Beam Splitter",
    "tips": [
      {
        "title": "Четыре выхода",
        "text": "У каждого выхода свой фильтр частиц."
      },
      {
        "title": "Интенсивность",
        "text": "Интенсивность пучка делится между выходами."
      }
    ]
  },
  "beam-stabilizer": {
    "wiki": "Beam Stabilizer",
    "tips": [
      {
        "title": "Ровный поток",
        "text": "Стабилизатор сглаживает неровную подачу пучка."
      },
      {
        "title": "Настройка",
        "text": "Интенсивность на выходе задаётся в контроллере."
      }
    ]
  },
  "beam-crafter": {
    "wiki": "Beam Crafter",
    "tips": [
      {
        "title": "Запас частиц",
        "text": "Частицы копятся внутри и ждут рецепта."
      },
      {
        "title": "Коллайдер",
        "text": "Редкие частицы для него даёт большой адронный коллайдер."
      }
    ]
  },
  "temperature-fluctuation-purification-unit": {
    "wiki": "Extreme Temperature Fluctuation Purification Unit",
    "tips": [
      {
        "title": "Циклы",
        "text": "Нагрев и охлаждение чередуются — нужна автоматика на датчике температуры."
      },
      {
        "title": "Плазма и хладагент",
        "text": "Обе жидкости подаются в свои люки."
      }
    ]
  },
  "laser-purification-unit": {
    "wiki": "High Energy Laser Purification Unit",
    "tips": [
      {
        "title": "Линзы",
        "text": "Установка просит линзы по очереди — их смену автоматизируют."
      },
      {
        "title": "Набор",
        "text": "Нужен полный набор цветных линз."
      }
    ]
  },
  "large-hadron-collider": {
    "wiki": "Large Hadron Collider",
    "tips": [
      {
        "title": "Два режима",
        "text": "Сначала разгон, потом столкновения."
      },
      {
        "title": "Четыре выхода",
        "text": "Частицы выходят по типу взаимодействия: электромагнитное, слабое, сильное, гравитация."
      }
    ]
  },
  "matter-fabrication-cpu": {
    "wiki": "Matter Fabrication CPU",
    "tips": [
      {
        "title": "Режимы",
        "text": "Усилитель, материя или утиль — режим выбирают в контроллере."
      },
      {
        "title": "Пара",
        "text": "UU-материю дальше тратит элементальный дубликатор."
      }
    ]
  },
  "pcb-factory": {
    "wiki": "PCB Factory",
    "tips": [
      {
        "title": "Наниты",
        "text": "Наниты в контроллере повышают выход плат."
      },
      {
        "title": "Улучшения",
        "text": "Биокамера нужна для биоплат, башня охлаждения — для разгона."
      }
    ]
  },
  "nano-forge": {
    "wiki": "Nano Forge",
    "tips": [
      {
        "title": "Нанит в контроллере",
        "text": "Уровень кузницы задаёт нанит внутри контроллера."
      },
      {
        "title": "Наниты нужны везде",
        "text": "Наниты идут в заводы плат, сборочные линии деталей и Кузницу богов."
      }
    ]
  },
  "research-station": {
    "wiki": "Research Station",
    "tips": [
      {
        "title": "Вычисления",
        "text": "Без квантового компьютера станция не работает."
      },
      {
        "title": "Держатель",
        "text": "Предмет для исследования кладут в держатель в середине."
      }
    ]
  },
  "quantum-computer": {
    "wiki": "Quantum Computer",
    "tips": [
      {
        "title": "Тепло",
        "text": "Следите за нагревом стоек — перегрев сжигает детали."
      },
      {
        "title": "Разгон и напряжение",
        "text": "Параметры разгона и напряжения меняют вычисления и нагрев."
      }
    ]
  },
  "space-elevator": {
    "wiki": "Space Elevator",
    "tips": [
      {
        "title": "Модули",
        "text": "Модули ставят на основание; число мест зависит от уровня моторов."
      },
      {
        "title": "Энергия",
        "text": "Лифт сам раздаёт энергию своим модулям."
      }
    ]
  },
  "concrete-backfiller": {
    "wiki": "Concrete Backfiller",
    "tips": [
      {
        "title": "Под базу",
        "text": "Удобен под большой базой: в пещерах больше не появляются мобы."
      },
      {
        "title": "Бетон",
        "text": "Нужен жидкий бетон во входном люке."
      }
    ]
  },
  "draconic-fusion-crafter": {
    "wiki": "Draconic Evolution Fusion Crafter",
    "tips": [
      {
        "title": "Магия",
        "text": "Без Blood Magic, Botania и Thaumcraft его не построить."
      },
      {
        "title": "Уровни",
        "text": "Корпуса ядра выше уровнем открывают рецепты пробуждённого и хаотического дракония."
      }
    ]
  },
  "integrated-ore-factory": {
    "wiki": "Integrated Ore Factory",
    "tips": [
      {
        "title": "Режимы",
        "text": "Цепочку переработки выбирают режимом в контроллере."
      },
      {
        "title": "После лифта",
        "text": "Руду с модулей космического лифта сразу отправляйте сюда."
      }
    ]
  },
  "miniature-wormhole-generator": {
    "wiki": "Miniature Wormhole Generator",
    "tips": [
      {
        "title": "Пара",
        "text": "Работают парами: два генератора связывают запутанной сингулярностью."
      },
      {
        "title": "Между мирами",
        "text": "Так подают энергию на другие планеты."
      }
    ]
  },
  "naquadah-fuel-refinery": {
    "wiki": "Naquadah Fuel Refinery",
    "tips": [
      {
        "title": "Катушки",
        "text": "Уровень катушек ограничения поля решает, какое топливо доступно."
      },
      {
        "title": "Без разгона",
        "text": "Лишнее напряжение его не ускоряет."
      }
    ]
  },
  "degasser-purification-unit": {
    "wiki": "Residual Decontaminant Degasser Purification Unit",
    "tips": [
      {
        "title": "Сигнал",
        "text": "Автоматика читает управляющий сигнал и подаёт нужную жидкость."
      },
      {
        "title": "Оптика",
        "text": "Без воды седьмой степени не сделать оптические схемы."
      }
    ]
  },
  "baryonic-perfection-purification-unit": {
    "wiki": "Absolute Baryonic Perfection Purification Unit",
    "tips": [
      {
        "title": "Кварки",
        "text": "Нужно угадать сочетание кварков-катализаторов — автоматика перебирает варианты."
      },
      {
        "title": "После кузницы",
        "text": "Строится после плазменной кузницы."
      }
    ]
  },
  "exo-foundry": {
    "wiki": "Exo-Foundry",
    "tips": [
      {
        "title": "Модули",
        "text": "Семь видов модулей: скорость, экономия, параллели и другое."
      },
      {
        "title": "Уровни",
        "text": "Уровень шасси открывает места под модули; третий — в UXV."
      }
    ]
  },
  "dyson-swarm-ground-unit": {
    "wiki": "Dyson Swarm Ground Unit",
    "tips": [
      {
        "title": "Спутники",
        "text": "Выработка растёт с числом модулей роя на орбите."
      },
      {
        "title": "Где ставить",
        "text": "Выработка зависит от звезды и расстояния до неё."
      }
    ]
  },
  "antimatter-stabilization-sequencer": {
    "wiki": "Semi-Stable Antimatter Stabilization Sequencer",
    "tips": [
      {
        "title": "Ровные люки",
        "text": "Чем ровнее заполнены люки антиматерии, тем больше её получается."
      },
      {
        "title": "Пара",
        "text": "Антиматерию тратит матрица аннигиляции."
      }
    ]
  },
  "annihilation-matrix": {
    "wiki": "Shielded Lagrangian Annihilation Matrix",
    "tips": [
      {
        "title": "Материя",
        "text": "Лучшая материя — основы сверхпроводников высших ярусов."
      },
      {
        "title": "Беспроводной ток",
        "text": "Энергия уходит сразу в беспроводную сеть."
      }
    ]
  },
  "windmill": {
    "wiki": "Windmill",
    "tips": [
      {
        "title": "Ротор",
        "text": "Без ротора в блоке ротора мельница стоит; роторы бывают разной прочности."
      },
      {
        "title": "Ветер",
        "text": "Слишком слабый или слишком сильный ветер останавливает мельницу."
      }
    ]
  },
  "charcoal-pile-igniter": {
    "wiki": "Charcoal Pile Igniter",
    "tips": [
      {
        "title": "Поджечь",
        "text": "Яму поджигают огнивом, кликнув по поджигателю."
      },
      {
        "title": "Дым",
        "text": "Пока яма горит, она загрязняет воздух."
      }
    ]
  },
  "mega-apiary": {
    "wiki": "Industrial Apicultural Acclimatiser and Drone Domestication Station",
    "tips": [
      {
        "title": "Матки",
        "text": "Маток кладут и забирают через контроллер в особом режиме."
      },
      {
        "title": "Цветы",
        "text": "Пчёлам нужны их цветы внутри купола — как в обычной пасеке."
      }
    ]
  }
};
