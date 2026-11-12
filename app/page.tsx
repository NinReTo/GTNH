import Link from "next/link";
import { PerfChart } from "@/components/landing/PerfChart";
import { ScrollDiagram } from "@/components/landing/ScrollDiagram";
import { VoltageLadder } from "@/components/landing/VoltageLadder";
import { SectionHeading, formatNumber } from "@/components/landing/ui";
import { SceneSection } from "@/components/scene/SceneSection";
import { ASSETS, DIAGRAM, GAME, PERF, SCROLL } from "@/lib/config";
import { GROUP_TITLES, KINDS, MACHINES, SINGLE_BLOCKS, findMachine, structureOf, type Machine } from "@/lib/machines";

const HERO_SLUG = "bricked-blast-furnace";
const MOD_SOURCE = `https://github.com/GTNewHorizons/GT5-Unofficial/tree/${ASSETS.gregtechCommit}`;
const TEXTURES = "/textures/gregtech";

const prose = "mt-6 max-w-xl text-base leading-relaxed text-text2";
const link = "text-text1 underline decoration-accent underline-offset-4 hover:text-accent";
const columnHead = "px-3 py-3 text-left font-mono text-xs font-normal uppercase tracking-[0.2em] text-text3";

/** Значок 16×16 из текстур мода, увеличенный без сглаживания. */
function Pixel({ file, size }: { file: string; size: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- текстуру 16×16 нельзя сглаживать, оптимизатор картинок её размоет
    <img src={`${TEXTURES}/${file}.webp`} alt="" width={size} height={size} className="pixelated shrink-0" />
  );
}

function controllerTexture(machine: Machine): string {
  return KINDS[machine.def.kinds["~"]].texture;
}

function MachineCard({ machine }: { machine: Machine }) {
  const { size, blocks } = structureOf(machine);
  return (
    <Link
      href={`/machines/${machine.slug}`}
      className="group flex gap-5 border border-line p-5 transition-colors hover:border-accent"
    >
      <Pixel file={controllerTexture(machine)} size={DIAGRAM.catalog.cardIcon} />
      <span className="min-w-0">
        <span className="block font-mono text-xs uppercase tracking-[0.2em] text-text3">
          {size.join(" × ")} · {blocks.length} блоков
        </span>
        <span className="mt-1 block font-mono text-xl uppercase text-text1 transition-colors group-hover:text-accent">
          {machine.title}
        </span>
        <span className="mt-2 block text-sm leading-relaxed text-text2">{machine.summary}</span>
      </span>
    </Link>
  );
}

export default function Home() {
  const hero = findMachine(HERO_SLUG);
  const primitive = MACHINES.filter((machine) => machine.group === "primitive");
  const steam = MACHINES.filter((machine) => machine.group === "steam");
  const electric = MACHINES.filter((machine) => machine.group === "electric");

  return (
    <>
      <SceneSection slug={HERO_SLUG}>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">GregTech New Horizons · Minecraft 1.7.10</p>
        <h1 className="mt-4 max-w-3xl font-mono text-4xl font-bold uppercase leading-none tracking-tight text-text1 sm:text-6xl">
          Паровая эра
        </h1>
        <p className="mt-6 max-w-md text-base text-text2">
          Первые машины мода — до электричества. Перед вами {hero?.title.toLowerCase()}: тяните мышкой, чтобы повернуть,
          наведите на блоки, чтобы раздвинуть.
        </p>
      </SceneSection>

      <main className="landing relative z-10 bg-bg">
        {/* 01 — текст слева, три ступени справа */}
        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:px-12 lg:grid-cols-2 lg:py-36">
          <div>
            <SectionHeading index="01" kicker="Мод" title="Завод вместо верстака" />
            <p className={prose}>
              GregTech превращает Minecraft в долгую инженерную цепочку. Здесь нельзя просто переплавить руду в
              слиток: сначала дробилка, потом печь — и на каждую машину нужны детали, которые делает предыдущая.
            </p>
            <p className={prose}>
              Паровая эра — самое начало этой цепочки. Электричества ещё нет: машины работают на пару из котлов, а
              первые большие печи — вообще на одном угле.
            </p>
          </div>
          <ol className="self-center border border-line">
            {[
              ["Одноблочные бронзовые", "Одна машина — один блок. Делают всё то же, что потом будут делать большие, но по одному предмету и не спеша."],
              ["Улучшенные стальные", "Те же машины «высокого давления». Работают вдвое быстрее и тратят вдвое больше пара."],
              ["Многоблочные", `Постройки из десятков блоков. Каждая обрабатывает до ${GAME.steam.multiParallel} предметов за раз.`],
            ].map(([title, text], index) => (
              <li key={title} className="flex gap-5 border-b border-line p-5 last:border-b-0">
                <span className="font-mono text-3xl text-accent">{index + 1}</span>
                <span>
                  <span className="block font-mono text-sm uppercase tracking-[0.15em] text-text1">{title}</span>
                  <span className="mt-2 block text-sm leading-relaxed text-text2">{text}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* 02 — таблица во всю ширину: каждая строка — путь одной машины по трём ступеням */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-24 sm:px-12 lg:py-36">
            <div className="grid gap-8 lg:grid-cols-2">
              <SectionHeading index="02" kicker="Иерархия" title="От одного блока к постройке" />
              <p className="max-w-xl self-end text-base leading-relaxed text-text2">
                Читайте строку слева направо: бронзовая машина тратит на рецепт в {GAME.steam.bronzeDuration} раза
                больше времени, чем положено; стальная работает с обычной скоростью, но ест в {GAME.steam.steelSteam}{" "}
                раза больше пара; многоблочная ведёт сразу {GAME.steam.multiParallel} рецептов.
              </p>
            </div>
            <div className="mt-12 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse">
                <thead>
                  <tr className="border-b border-line">
                    <th className={columnHead}>Что делает</th>
                    <th className={columnHead}>1 · Бронзовая</th>
                    <th className={columnHead}>2 · Стальная</th>
                    <th className={columnHead}>3 · Многоблочная</th>
                  </tr>
                </thead>
                <tbody>
                  {SINGLE_BLOCKS.map((single) => {
                    const multi = single.multiSlug ? findMachine(single.multiSlug) : undefined;
                    return (
                      <tr key={single.id} className="border-b border-line">
                        <th scope="row" className="px-3 py-4 text-left font-normal">
                          <span className="block font-mono text-sm uppercase tracking-[0.15em] text-text1">{single.title}</span>
                          <span className="text-sm text-text2">{single.does}</span>
                        </th>
                        <td className="px-3 py-4">
                          <Pixel file={`single-bronze-${single.id}`} size={DIAGRAM.catalog.tierIcon} />
                        </td>
                        <td className="px-3 py-4">
                          <Pixel file={`single-steel-${single.id}`} size={DIAGRAM.catalog.tierIcon} />
                        </td>
                        <td className="px-3 py-4">
                          {multi ? (
                            <Link href={`/machines/${multi.slug}`} className="group flex items-center gap-4">
                              <Pixel file={controllerTexture(multi)} size={DIAGRAM.catalog.tierIcon} />
                              <span className="font-mono text-sm uppercase tracking-[0.15em] text-text1 underline decoration-accent underline-offset-4 group-hover:text-accent">
                                {structureOf(multi).size.join(" × ")} →
                              </span>
                            </Link>
                          ) : (
                            <span className="font-mono text-xs uppercase tracking-[0.2em] text-text3">нет</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-text3">
              Пар для всех этих машин дают котлы — угольный, солнечный и лавовый, тоже в бронзовом и стальном
              исполнении. Котлы и одноблочные машины — это один куб, разбирать в них нечего, поэтому трёхмерных
              страниц у них нет.
            </p>
          </div>
        </section>

        {/* 03 — каталог построек плиткой */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-24 sm:px-12 lg:py-36">
            <SectionHeading index="03" kicker="Постройки" title="Восемь машин, которые можно покрутить" />
            <p className={prose}>
              У каждой постройки своя страница: трёхмерная модель из настоящих блоков мода, состав по блокам и
              короткий рассказ, зачем она нужна.
            </p>
            {[primitive, steam].map((group) => (
              <div key={group[0].group} className="mt-12">
                <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{GROUP_TITLES[group[0].group]}</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {group.map((machine) => (
                    <MachineCard key={machine.slug} machine={machine} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 04 — зеркально первой: схема слева, текст справа */}
        <section className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:px-12 lg:grid-cols-2 lg:py-36">
            <VoltageLadder />
            <div>
              <SectionHeading index="04" kicker={GROUP_TITLES.electric} title="Потом приходит электричество" />
              <p className={prose}>
                Паровая эра заканчивается, когда появляется первая электрическая машина. Дальше всё измеряется
                ярусами напряжения: каждый следующий вчетверо мощнее, а машина, получившая напряжение не своего
                яруса, взрывается.
              </p>
              <div className="mt-8 grid gap-4">
                {electric.map((machine) => (
                  <MachineCard key={machine.slug} machine={machine} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 05 — заголовок и шкала в узкой колонке */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-4xl px-6 py-24 sm:px-12 lg:py-36">
            <SectionHeading index="05" kicker="Как сделан сайт" title="Куда уходит прокрутка" />
            <p className={prose}>
              Постройки вертят и разбирают мышкой, а прокрутке осталось одно дело — плавно залить кадр цветом
              страницы. Блок со сценой высотой в {SCROLL.sceneScreens} экрана, и страница наезжает на его хвост.
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
              <SectionHeading index="06" kicker="Скорость" title="Сколько стоит красота" />
              <p className={prose}>
                В сцене несколько десятков кубов — полигоны здесь ничего не стоят. Стоят пиксели: каждый эффект
                обрабатывает весь экран. Поэтому холст ограничен {formatNumber(PERF.maxPixels / PERF.megapixel)}{" "}
                мегапикселями, а на экранах с высокой плотностью картинка рисуется чуть мельче.
              </p>
              <p className={prose}>
                Самым дорогим оказался не эффект, а тени: свет внутри постройки светит во все шесть сторон, и каждую
                сторону надо нарисовать заново. Теперь тени обновляются только когда блоки двигаются. А пока всё
                стоит, кадр не рисуется вовсе — видеокарта отдыхает.
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
