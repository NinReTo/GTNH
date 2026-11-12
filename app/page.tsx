import { HeatCalculator } from "@/components/landing/HeatCalculator";
import { PerfChart } from "@/components/landing/PerfChart";
import { ScrollDiagram } from "@/components/landing/ScrollDiagram";
import { StructureDiagram } from "@/components/landing/StructureDiagram";
import { VoltageLadder } from "@/components/landing/VoltageLadder";
import { SectionHeading, formatNumber } from "@/components/landing/ui";
import { SceneSection } from "@/components/scene/SceneSection";
import { ASSETS, DIAGRAM, GAME, PERF, SCROLL } from "@/lib/config";
import { BLOCKS, countByType } from "@/lib/ebf";
import { coilHeat } from "@/lib/heat";

const COUNTS = countByType();
const FIRST_COIL = GAME.coils[0];
const MOD_SOURCE = `https://github.com/GTNewHorizons/GT5-Unofficial/tree/${ASSETS.gregtechCommit}`;

const prose = "mt-6 max-w-xl text-base leading-relaxed text-text2";
const link = "text-text1 underline decoration-accent underline-offset-4 hover:text-accent";

export default function Home() {
  return (
    <>
      <SceneSection />

      <main className="landing relative z-10 bg-bg">
        {/* 01 — текст слева, схема справа */}
        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:px-12 lg:grid-cols-2 lg:py-36">
          <div>
            <SectionHeading index="01" kicker="Мод" title="Завод вместо верстака" />
            <p className={prose}>
              GregTech превращает Minecraft в долгую инженерную цепочку. Здесь нельзя просто переплавить руду в
              слиток: сначала дробилка, потом промывка, потом печь — и на каждую машину нужны детали, которые
              делает предыдущая.
            </p>
            <p className={prose}>
              Для версии 1.7.10 мод живёт под именем GT5-Unofficial — его развивает команда сборки GT New
              Horizons. Всё измеряется ярусами напряжения: чем выше ярус, тем мощнее станки и тем дороже
              ошибка — машина, получившая напряжение не своего яруса, взрывается.
            </p>
          </div>
          <VoltageLadder />
        </section>

        {/* 02 — схема во всю ширину, заголовок над ней в две колонки */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-24 sm:px-12 lg:py-36">
            <div className="grid gap-8 lg:grid-cols-2">
              <SectionHeading index="02" kicker="Структура" title="Три на три на четыре" />
              <p className="max-w-xl self-end text-base leading-relaxed text-text2">
                Печь — это не один блок, а постройка из {BLOCKS.length} блоков. Низ и верх — жаропрочный корпус,
                в который врезаны люки. Середина — два кольца нагревательных катушек, всего {COUNTS.coil}. Внутри
                обязательно пусто: если туда попадёт хоть один блок, печь не соберётся.
              </p>
            </div>
            <div className="mt-12">
              <StructureDiagram />
            </div>
            <div className="mt-12 grid gap-8 text-sm leading-relaxed text-text2 sm:grid-cols-3">
              <p>
                <strong className="block font-mono text-xs uppercase tracking-[0.2em] text-text1">Низ</strong>
                Контроллер — строго спереди по центру. На остальные восемь мест можно ставить люки в любом порядке:
                энергию, обслуживание, вход и выход.
              </p>
              <p>
                <strong className="block font-mono text-xs uppercase tracking-[0.2em] text-text1">Середина</strong>
                Все катушки должны быть одного яруса. Смешаете купроникель с канталом — печь не заработает.
              </p>
              <p>
                <strong className="block font-mono text-xs uppercase tracking-[0.2em] text-text1">Верх</strong>
                Глушитель — только в центре крыши, и над ним должно быть свободно: через него выходит дым,{" "}
                {GAME.pollutionPerSecond} единиц загрязнения в секунду.
              </p>
            </div>
          </div>
        </section>

        {/* 03 — узкая колонка текста и калькулятор во всю ширину */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-24 sm:px-12 lg:py-36">
            <SectionHeading index="03" kicker="Нагрев" title="Катушки решают, что можно плавить" />
            <p className={prose}>
              У каждого рецепта есть минимальная температура. Катушки из купроникеля дают{" "}
              {formatNumber(coilHeat(FIRST_COIL.ordinal))} K — хватит на сталь и алюминий. Каждый следующий ярус
              катушек добавляет ещё {GAME.coilHeatStep} K, а каждый ярус напряжения выше MV — ещё{" "}
              {GAME.heatPerVoltageTier} K.
            </p>
            <p className={prose}>
              Запас нагрева не пропадает: каждые {GAME.heatDiscountThreshold} K сверх рецепта экономят{" "}
              {formatNumber((1 - GAME.heatDiscountFactor) * DIAGRAM.calculator.percent)} % энергии,
              а каждые {formatNumber(GAME.heatOverclockThreshold)} K делают один разгон «идеальным» — вчетверо
              быстрее за те же деньги вместо вдвое.
            </p>
            <div className="mt-12">
              <HeatCalculator />
            </div>
          </div>
        </section>

        {/* 05 — заголовок по центру, шкала под ним */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-4xl px-6 py-24 sm:px-12 lg:py-36">
            <SectionHeading index="04" kicker="Прокрутка" title="Куда уходит прокрутка" />
            <p className={prose}>
              Печь наверху вертят и разбирают мышкой, а прокрутке осталось одно дело — плавно залить кадр цветом
              страницы. Блок со сценой высотой в {SCROLL.sceneScreens} экрана, и эта страница наезжает на его хвост.
              Нахлёст съедает прокрутку с конца, поэтому заливка считается от оставшейся части и всегда
              заканчивается ровно к приходу страницы.
            </p>
            <div className="mt-12">
              <ScrollDiagram />
            </div>
          </div>
        </section>

        {/* 06 — две колонки: вывод слева, замеры справа */}
        <section className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:px-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:py-36">
            <div>
              <SectionHeading index="05" kicker="Скорость" title="Сколько стоит красота" />
              <p className={prose}>
                В сцене всего {BLOCKS.length} куба — полигоны здесь ничего не стоят. Стоят пиксели: каждый эффект
                обрабатывает весь экран. Поэтому холст ограничен {formatNumber(PERF.maxPixels / PERF.megapixel)}{" "}
                мегапикселями, а на экранах с высокой плотностью картинка рисуется чуть мельче.
              </p>
              <p className={prose}>
                Замеры справа сняты на слабой встроенной видеокарте. Самым дорогим оказался не эффект, а тени:
                свет внутри печи светит во все шесть сторон, и каждую сторону надо нарисовать заново. Пока тени
                обновлялись на каждом кадре, сцена тормозила; теперь они обновляются только когда блоки
                двигаются, а их карта вчетверо меньше. Интуиция указывала на свечение — поэтому и нужно мерить.
              </p>
              <p className={prose}>
                И ещё: кадр рисуется только когда что-то меняется — вы двигаете мышку, вертите печь или крутите
                страницу. Пока всё стоит, видеокарта отдыхает.
              </p>
            </div>
            <PerfChart />
          </div>
        </section>

        <footer className="border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-16 font-mono text-xs leading-loose text-text3 sm:px-12">
            <p>
              Текстуры блоков — из{" "}
              <a className={link} href={MOD_SOURCE} target="_blank" rel="noopener noreferrer">
                GT5-Unofficial
              </a>{" "}
              (лицензия LGPL-3.0). Структура печи и формулы нагрева — оттуда же, из исходного кода.
            </p>
            <p>
              Бетон и карта окружения —{" "}
              <a className={link} href="https://polyhaven.com" target="_blank" rel="noopener noreferrer">
                Poly Haven
              </a>
              , рельеф металла —{" "}
              <a className={link} href="https://ambientcg.com" target="_blank" rel="noopener noreferrer">
                ambientCG
              </a>{" "}
              (обе — CC0).
            </p>
            <p>Сайт не связан с Mojang, Microsoft и авторами GregTech. Minecraft — товарный знак Mojang AB.</p>
          </div>
        </footer>
      </main>
    </>
  );
}
