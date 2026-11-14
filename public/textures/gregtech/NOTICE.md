# Текстуры GregTech

Файлы `*.webp` в этой папке получены из текстур мода
[GT5-Unofficial](https://github.com/GTNewHorizons/GT5-Unofficial)
(коммит `2c5b97e3bc5b5acaeda68cd19bc1c1b3c72c9c30`, папка
`src/main/resources/assets`).

Мод распространяется по лицензии **GNU LGPL 3.0** — её текст лежит рядом,
в файле `LICENSE-LGPL-3.0.txt`. LGPL 3.0 дополняет GNU GPL 3.0, текст которой
доступен на <https://www.gnu.org/licenses/gpl-3.0.txt>. Эти текстуры остаются
под той же лицензией и в этом репозитории.

Ассеты самой игры Minecraft (лава, ванильное стекло и т. п.) в проекте не
используются. Лава в кирпичной домне показана светящимся сердечником, стекло
взято из текстур мода (`bartworks/.../BoronSilicateGlassBlock`).

## Что изменено

Все изменения делает скрипт `scripts/fetch-textures.mjs`:

- формат PNG переведён в WebP без потерь;
- у анимированных текстур взят только первый кадр;
- грани с рисунком (контроллеры, люки, фасады машин) собраны наложением
  слоёв — основа корпуса плюс накладка, как это делает сам мод при отрисовке;
- рама и блок железа — серые текстуры материала (`materialicons/NONE`),
  умноженные на цвет материала из `MaterialsInit.java`, как их красит мод.

### Электрическая доменная печь

| Файл | Из чего собран |
|---|---|
| `casing.webp` | `MACHINE_HEATPROOFCASING` |
| `controller.webp` | корпус + `OVERLAY_FRONT_ELECTRIC_BLAST_FURNACE_ACTIVE` |
| `controller-glow.webp` | `OVERLAY_FRONT_ELECTRIC_BLAST_FURNACE_ACTIVE_GLOW` на чёрном фоне |
| `muffler.webp` | корпус + `OVERLAY_MUFFLER` |
| `maintenance.webp` | корпус + `OVERLAY_MAINTENANCE` |
| `input-bus.webp` | корпус + `OVERLAY_PIPE_IN` + `ITEM_IN_SIGN` |
| `output-bus.webp` | корпус + `OVERLAY_PIPE_OUT` + `ITEM_OUT_SIGN` |
| `input-hatch.webp` | корпус + `OVERLAY_PIPE_IN` + `FLUID_IN_SIGN` |
| `energy.webp` | корпус + `OVERLAY_ENERGY_IN_MULTI_2A_LV` |
| `coil-*.webp` | `MACHINE_COIL_*` |

### Паровая эра

| Файл | Из чего собран |
|---|---|
| `firebrick.webp` | `MACHINE_CASING_DENSEBRICKS` |
| `bbf-controller.webp`, `bbf-controller-glow.webp` | кирпич + `MACHINE_CASING_BRICKEDBLASTFURNACE_ACTIVE` (и `_GLOW`) |
| `coke-brick.webp` | `COKE_OVEN_CASING` |
| `coke-controller.webp`, `coke-controller-glow.webp` | кирпич + `COKE_OVEN_OVERLAY_ACTIVE` (и `_GLOW`) |
| `bronze-bricks.webp` | `MACHINE_BRONZEPLATEDBRICKS` |
| `bronze-gearbox.webp` | `MACHINE_CASING_GEARBOX_BRONZE` |
| `bronze-pipe.webp` | `MACHINE_CASING_PIPE_BRONZE` |
| `bronze-firebox.webp` | `MACHINE_CASING_FIREBOX_BRONZE` |
| `wood.webp` | `PRIMITIVE_WOODEN_CASING_SIDE` |
| `bronze-frame.webp` | `materialicons/NONE/frameGt` × цвет бронзы |
| `iron-block.webp` | `materialicons/NONE/block1` × цвет железа |
| `glass.webp` | `bartworks/textures/blocks/BoronSilicateGlassBlock` |
| `macerator-controller.webp` | бронзовые кирпичи + `OVERLAY_TOP_STEAM_MACERATOR_ACTIVE` |
| `furnace-controller.webp` | бронзовые кирпичи + `OVERLAY_FRONT_STEAM_FURNACE_MULTI_ACTIVE` |
| `compressor-controller.webp` | бронзовые кирпичи + `OVERLAY_FRONT_STEAM_COMPRESSOR_ACTIVE` |
| `smelter-controller.webp` | бронзовые кирпичи + `OVERLAY_FRONT_STEAM_ALLOY_SMELTER_MULTI_ACTIVE` |
| `hammer-controller.webp` | бронзовые кирпичи + `OVERLAY_FRONT_STEAM_FORGE_HAMMER_ACTIVE` |
| `pump-controller.webp` | дерево + `OVERLAY_FRONT_WATER_PUMP_ACTIVE` |
| `hull-{bronze|steel}-{plain|bricked}-{side|top|bottom}.webp` | `MACHINE_BRONZE(BRICKS)_*` / `MACHINE_STEEL(BRICKS)_*` — грани корпуса одноблочных машин |
| `single-bronze-*.webp`, `single-steel-*.webp` | корпус `MACHINE_BRONZE(BRICKS)_SIDE` / `MACHINE_STEEL(BRICKS)_SIDE` + `OVERLAY_FRONT_STEAM_*` |

## Нарисовано для этого проекта

`water-tank.webp` — стенка водяного бака. Сам бак — из мода Railcraft, а его
лицензия разрешает использовать текстуры только в текстурпаках для Railcraft,
поэтому эта текстура **не взята из Railcraft**, а нарисована заново по пикселям
(рисунок и палитра — в `scripts/fetch-textures.mjs` и `lib/config.ts`).
Она распространяется вместе с кодом проекта.

`rc-firebox.webp` и `rc-tank.webp` — топка и бак многоблочного котла Railcraft.
По той же причине они **не взяты из Railcraft**, а нарисованы заново по пикселям
в `scripts/fetch-textures.mjs`.

## Котлы, паровые постройки и LV

Из тех же текстур GT5-Unofficial (LGPL-3.0) тем же скриптом собраны:

- `boiler-*.webp` — фасады и верх одноблочных котлов;
- `separator-controller.webp`, `purifier-controller.webp` — контроллеры паровых построек;
- `hull-lv-*.webp`, `single-lv-*.webp` — корпус LV и грани одноблочных машин
  (корпус + значок из `blocks/basicmachines/<машина>/OVERLAY_*`);
- `gen-*.webp` — грани генераторов LV;
- `air-*.webp` — блоки электрического воздушного фильтра.

## MV

Из тех же текстур GT5-Unofficial (LGPL-3.0) собраны корпус и машины MV
(`hull-mv-*`, `single-mv-*`, `gen-mv-*`) и блоки построек MV: `multi-smelter-*`,
`pyro-*`, `drill-*`, `large-boiler-*`, `solid-steel`, `steel-firebox`, `steel-frame`.

## GT++ и HV

GT++ — дополнение, которое входит в тот же репозиторий GT5-Unofficial под той же
лицензией LGPL-3.0 (папка `assets/miscutils`). Из него взяты значки контроллеров
`chem-plant-controller` и `algae-controller`. Остальные блоки построек GT++ и HV
(`algae-*`, `filter-casing`, `frost-proof`, `inert-casing`, `ptfe-pipe`,
`clean-stainless`, `dt-*`, `cracker-*`, `lcr-*`, `freezer-*`, `implosion-*`,
`turbine-*`, `plascrete`, `cleanroom-*`, рамы) и машины HV (`hull-hv-*`,
`single-hv-*`, `gen-hv-*`) собраны из текстур GregTech тем же скриптом.

## Ярусы EV, IV и ZPM

Корпуса EV, IV и ZPM, грани одноблочных машин и генераторов (плазменный
генератор, наквадовый реактор), блоки и контроллеры построек: большой и
экстремальный дизельные двигатели, большая газовая турбина, рудная буровая,
сборочная линия, реактор синтеза II, большой наквадовый реактор — из
GT5-Unofficial (папка gregtech). Промышленная центрифуга, дробильная башня,
Вулканус и доменная плавильня сплавов — GT++ (папка miscutils).
Лапотронный суперконденсатор — KekzTech (папка kekztech). Корпус удержания поля
и рама с защитой от излучения — GoodGenerator (папка goodgenerator).

Все эти папки лежат в одном репозитории GT5-Unofficial под одной лицензией
LGPL-3.0. Рамы из тефлона и стали Эглин — серая текстура рамы мода, окрашенная
в цвет материала, как это делает сам мод.

## Ярус LuV

Корпус LuV, сверхпроводящая катушка, контроллер реактора синтеза I, блоки
большой плазменной турбины и корпус процессора — GT5-Unofficial (папка gregtech).
Ускоряющая труба активатора нейтронов — GoodGenerator (папка goodgenerator).
Тот же репозиторий и та же лицензия LGPL-3.0. Рама из вольфрамовой стали —
серая текстура рамы мода, окрашенная в цвет материала.

## Ярусы UV и UHV

Корпус UV, корпус и контроллер реактора синтеза III, укреплённый наквадой блок
и контроллер электрического имплозионного компрессора — GT5-Unofficial (папка
gregtech), лицензия LGPL-3.0. Блок нейтрониума и рама из наквады — серые текстуры
мода, окрашенные в цвет материала.

Нейтронный компрессор: нейтрониевые корпуса и контроллер — GT5-Unofficial (gregtech,
LGPL-3.0); рама из наквадового сплава — серая текстура рамы, окрашенная в цвет материала.
Одноблочные машины UV и UHV — корпуса ярусов и значки машин мода.

## Ярусы UEV и UIV

Корпуса UEV и UIV, пространственные корпуса и мост, катушка из пробуждённого
дракония, контроллер плазменной кузницы — GT5-Unofficial (папка gregtech).
Корпуса, катушки и экраны контроллеров реакторов синтеза IV и V — GT++ (папка
miscutils). Тот же репозиторий, лицензия LGPL-3.0.

Комплекс сборки наночипов, компрессор чёрной дыры и модуль Кузницы богов
(корпуса, стекло, катушка из гипогена, контроллеры) — GT5-Unofficial (папки
gregtech, tectech), лицензия LGPL-3.0. Этот же мод стоит в сборке GTNH 2.9
(gregtech-5.09.54.265.jar).

Машины конденсата Бозе-Эйнштейна и Кузница богов (корпуса, катушки, стекло,
модуляторы гравитонов, гравитационная линза, контроллеры) — GT5-Unofficial
(папки gregtech, tectech), лицензия LGPL-3.0.

## Ярусы UMV и UXV

Корпуса UMV и UXV, эндотермический холодильник (корпус, воздуховод, корпус с
бесконечным охлаждением, укреплённый блок из вольфрамовой стали, контроллер) и
Глаз гармонии (корпуса, генераторы полей, экран контроллера) — GT5-Unofficial
(папка gregtech), лицензия LGPL-3.0. Рамы из льда Каллисто и листовой металл из
ледокса — серые текстуры мода, окрашенные в цвет материала.

Корпус MAX и сборщик схем MAX — корпус яруса и значок машины GT5-Unofficial
(папка gregtech), лицензия LGPL-3.0.

## Звёздные врата

Блоки Звёздных врат (кольцо, шеврон, основа, наборное устройство, блок питания)
— GTNH-версия мода SGCraft (github.com/GTNewHorizons/SGCraft), лицензия MIT,
© 2016 gcewing. Узоры кольца, шеврона и основы наложены на гладкий блок врат, как
в модели самого мода; крупные текстуры сведены к 16 × 16.

## Мега-машины и квантовый силовой преобразователь

Корпуса и контроллеры мега химического реактора, мега установки крекинга, мега
ректификационной колонны и экзотермического горна — GT5-Unofficial (папка
gregtech). Корпуса, стекло и контроллер квантового силового преобразователя,
термоизолирующий корпус — GT++ (папка miscutils) и gregtech того же репозитория.
Лицензия LGPL-3.0. Листовой металл из наквады и рама из призматической наквады —
серые текстуры мода, окрашенные в цвет материала.
