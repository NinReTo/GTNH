# Текстуры GregTech

Файлы `*.webp` в этой папке получены из текстур мода
[GT5-Unofficial](https://github.com/GTNewHorizons/GT5-Unofficial)
(коммит `c76e8376cf2f56eddac3526646a9a791785f4b09`, папка
`src/main/resources/assets/gregtech/textures/blocks/iconsets`).

Мод распространяется по лицензии **GNU LGPL 3.0** — её текст лежит рядом,
в файле `LICENSE-LGPL-3.0.txt`. LGPL 3.0 дополняет GNU GPL 3.0, текст которой
доступен на <https://www.gnu.org/licenses/gpl-3.0.txt>. Эти текстуры остаются
под той же лицензией и в этом репозитории.

## Что изменено

Изменения делает скрипт `scripts/fetch-textures.mjs`:

- формат PNG переведён в WebP без потерь;
- у анимированных текстур взят только первый кадр;
- грани люков собраны наложением слоёв, как это делает сам мод при отрисовке:

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

Ассеты самой игры Minecraft в проекте не используются.
