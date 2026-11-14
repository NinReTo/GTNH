import { unpackLayers } from "./packed-layers";

/**
 * Мега установка крекинга нефти (MTEMegaOilCracker, GT5-Unofficial, LGPL-3.0): слои сверху вниз, ряды от фасада назад,
 * в сжатом виде (lib/packed-layers.ts). Данные, не код.
 */
export const MEGA_CRACKER_LAYERS = unpackLayers(
  " D9 D | D9 D | D9 D | D9 D | D9 D | D9 D | D9 D | D9 D | D9 D / D9 D |DB9ABD| B9AB | B3A3M3AB | B3F3M3FB | B3A3M3AB | B9AB |DB9ABD| D9 D / D9 D |DB9ABD| A9 A | AE E E E EA | FE E E E EF | AE E E E EA | A9 A |DB9ABD| D9 D / D9 D |DB9ABD| AE E E E EA | L9 R | LE E E E ER | L9 R | AE E E E EA |DB9ABD| D9 D / D9 D |DB9ABD| FE E E E EF | LE E E E ER | L9CR | LE E E E ER | FE E E E EF |DB9ABD| D9 D / D9 D |DB9ABD| AE E E E EA | L9 R | LE E E E ER | L9 R | AE E E E EA |DB9ABD| D9 D / D9 D |DB9ABD| A9 A | AE E E E EA | FE E E E EF | AE E E E EA | A9 A |DB9ABD| D9 D /D5B~5BD|D11BD|D11BD|D11BD|D11BD|D11BD|D11BD|D11BD|D11BD",
);
