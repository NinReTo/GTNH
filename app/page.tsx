import type { ReactNode } from "react";
import { IconStageLoader } from "@/components/icons/IconStageLoader";
import { MachineIcon, SingleBlockIcon } from "@/components/icons/MachineIcon";
import { PerfChart } from "@/components/landing/PerfChart";
import { ScrollDiagram } from "@/components/landing/ScrollDiagram";
import { VoltageLadder } from "@/components/landing/VoltageLadder";
import { SectionHeading, formatNumber } from "@/components/landing/ui";
import { SceneSection } from "@/components/scene/SceneSection";
import { ASSETS, GAME, PERF, SCROLL } from "@/lib/config";
import { MACHINES, SINGLE_BLOCKS } from "@/lib/machines";

const MOD_SOURCE = `https://github.com/GTNewHorizons/GT5-Unofficial/tree/${ASSETS.gregtechCommit}`;

const prose = "mt-6 max-w-xl text-base leading-relaxed text-text2";
const link = "text-text1 underline decoration-accent underline-offset-4 hover:text-accent";
const columnHead = "font-mono text-[11px] uppercase tracking-[0.2em] text-text3";
/** Сетка лестницы: название машины, бронзовая, стальная, многоблочная. Без горизонтальной прокрутки — значки рисуются поверх страницы и вылезли бы за обрезанный край. */
const ladderGrid = "grid grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))] items-center gap-3 sm:gap-6";
/** Значок в ячейке лестницы не шире этого, иначе строки вытягиваются в высоту. */
const cell = "block w-full max-w-40";

function Missing() {
  return <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-text3">нет</span>;
}

type StepProps = {
  number: string;
  title: string;
  children: ReactNode;
  aside?: ReactNode;
};

/** Одна ступень лестницы: номер и рассказ слева, значки справа. */
function Step({ number, title, children, aside }: StepProps) {
  return (
    <div className="grid gap-6 border-t border-line py-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12">
      <div>
        <p className="font-mono text-5xl text-accent">{number}</p>
        <h3 className="mt-3 font-mono text-xl uppercase tracking-[0.1em] text-text1">{title}</h3>
        <div className="mt-3 max-w-md text-sm leading-relaxed text-text2">{children}</div>
      </div>
      {aside}
    </div>
  );
}

export default function Home() {
  const primitive = MACHINES.filter((machine) => machine.group === "primitive");
  const electric = MACHINES.filter((machine) => machine.group === "electric");

  return (
    <>
      <IconStageLoader />

      <SceneSection>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">GregTech New Horizons · Minecraft 1.7.10</p>
        <h1 className="mt-4 max-w-3xl font-mono text-4xl font-bold uppercase leading-none tracking-tight text-text1 sm:text-7xl">
          Паровая эра
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-text2">
          Паровой цех из настоящих блоков мода: домна, коксовые печи, водяной бак и паровые машины. Тяните мышкой —
          цех повернётся, наведите на блоки — они раздвинутся. Ниже все машины выстроены лестницей.
        </p>
      </SceneSection>

      <main className="landing relative z-10 bg-bg pt-16 lg:pt-24">
        {/* 01 — лестница: ступени сверху вниз, значки справа */}
        <section className="mx-auto max-w-6xl px-6 pb-24 sm:px-12 lg:pb-36">
          <Step
            number="0"
            title="Без энергии"
            aside={
              <div className="grid max-w-xl grid-cols-3 gap-4">
                {primitive.map((machine) => (
                  <MachineIcon key={machine.slug} slug={machine.slug} />
                ))}
              </div>
            }
          >
            Самое начало. Ни пара, ни электричества: коксовая печь пережигает уголь в кокс, кирпичная домна на этом
            коксе выплавляет первую сталь, а водяной бак собирает из воздуха воду для будущих котлов.
          </Step>

          <Step number="1 → 3" title="Пар: от одного блока к постройке">
            <p>
              Каждая машина паровой эры проходит три ступени. Читайте строку слева направо: бронзовая тратит на рецепт
              в {GAME.steam.bronzeDuration} раза больше времени, чем положено; стальная («высокого давления»)
              работает с обычной скоростью, но ест в {GAME.steam.steelSteam} раза больше пара; многоблочная ведёт
              сразу {GAME.steam.multiParallel} рецептов.
            </p>
          </Step>

          <div className={`${ladderGrid} border-b border-line pb-3`}>
            <span className={columnHead}>Машина</span>
            <span className={columnHead}>1 · Бронза</span>
            <span className={columnHead}>2 · Сталь</span>
            <span className={columnHead}>3 · Многоблочная</span>
          </div>
          {SINGLE_BLOCKS.map((single) => (
            <div key={single.id} className={`${ladderGrid} border-b border-line py-4`}>
              <span>
                <span className="block font-mono text-sm uppercase tracking-[0.15em] text-text1">{single.title}</span>
                <span className="text-sm text-text2">{single.does}</span>
              </span>
              {(["bronze", "steel"] as const).map((tier) =>
                single.isMultiOnly ? (
                  <Missing key={tier} />
                ) : (
                  <span key={tier} className={cell}>
                    <SingleBlockIcon id={single.id} tier={tier} hull={single.hull} title={single.title} />
                  </span>
                ),
              )}
              {single.multiSlug ? (
                <span className={cell}>
                  <MachineIcon slug={single.multiSlug} />
                </span>
              ) : (
                <Missing />
              )}
            </div>
          ))}
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-text3">
            Пар для всех этих машин дают котлы — угольный, солнечный и лавовый, тоже в бронзовом и стальном
            исполнении. Одноблочные машины — это один куб: наведите на него, чтобы покрутить. Своих страниц у них нет —
            разбирать в кубе нечего.
          </p>

          <Step
            number="4"
            title="Потом приходит электричество"
            aside={
              <div className="grid max-w-md grid-cols-2 gap-4">
                {electric.map((machine) => (
                  <MachineIcon key={machine.slug} slug={machine.slug} />
                ))}
              </div>
            }
          >
            Паровая эра заканчивается, когда появляется первая электрическая машина. Первая большая из них —
            электрическая доменная печь: она плавит то, что кирпичной домне не по силам.
          </Step>
        </section>

        {/* 02 — схема слева, текст справа */}
        <section className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:px-12 lg:grid-cols-2 lg:py-36">
            <VoltageLadder />
            <div>
              <SectionHeading index="02" kicker="Электричество" title="Ярусы напряжения" />
              <p className={prose}>
                После пара всё в моде измеряется ярусами напряжения. Каждый следующий вчетверо мощнее предыдущего, а
                машина, получившая напряжение не своего яруса, взрывается.
              </p>
            </div>
          </div>
        </section>

        {/* 03 — заголовок и шкала в узкой колонке */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-4xl px-6 py-24 sm:px-12 lg:py-36">
            <SectionHeading index="03" kicker="Как сделан сайт" title="Куда уходит прокрутка" />
            <p className={prose}>
              На странице каждой машины постройку вертят и разбирают мышкой, а прокрутке осталось одно дело — плавно
              залить кадр цветом страницы. Блок со сценой высотой в {SCROLL.sceneScreens} экрана, и страница наезжает
              на его хвост. Нахлёст съедает прокрутку с конца, поэтому заливка считается от оставшейся части и всегда
              заканчивается ровно к приходу страницы.
            </p>
            <div className="mt-12">
              <ScrollDiagram />
            </div>
          </div>
        </section>

        {/* 04 — две колонки: вывод слева, замеры справа */}
        <section className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:px-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:py-36">
            <div>
              <SectionHeading index="04" kicker="Скорость" title="Сколько стоит красота" />
              <p className={prose}>
                Все значки на этой странице нарисованы на одном общем холсте: у браузера ограничено число трёхмерных
                холстов, а один на всех — дешевле. Кадр рисуется только когда что-то меняется: вы крутите страницу
                или наводите мышку на значок.
              </p>
              <p className={prose}>
                На страницах машин главный рычаг — пиксели, а не полигоны: каждый эффект обрабатывает весь экран.
                Поэтому холст ограничен {formatNumber(PERF.maxPixels / PERF.megapixel)} мегапикселями. Самым дорогим
                оказался не эффект, а тени — теперь они обновляются только когда блоки двигаются.
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
              (лицензия LGPL-3.0). Схемы построек и формулы — оттуда же, из исходного кода.
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
