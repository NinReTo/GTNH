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
| `single-bronze-*.webp`, `single-steel-*.webp` | корпус `MACHINE_BRONZE(BRICKS)_SIDE` / `MACHINE_STEEL(BRICKS)_SIDE` + `OVERLAY_FRONT_STEAM_*` |
