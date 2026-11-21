import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HOME } from "@/lib/config";
import { href, isLang, pick } from "@/lib/i18n";

/** Картинка шапки есть, только если её уже нарисовали (public/images/home/…); иначе — тёмный фон. */
const hasImage = existsSync(path.join(process.cwd(), "public", HOME.image));

const SECTIONS = [
  {
    path: "/machines",
    ru: { title: "Машины", text: "Все постройки и машины по эрам — от паровых котлов до UXV, в 3D из настоящих блоков мода." },
    en: { title: "Machines", text: "Every multiblock and machine by era — from steam boilers to UXV, in 3D from the real mod blocks." },
  },
  {
    path: "/calculator",
    ru: { title: "Калькулятор", text: "Цепочка машин от руды до нужного товара и готовая фабрика из неё в 3D." },
    en: { title: "Calculator", text: "The machine chain from ore to the item you need, and a ready 3D factory built from it." },
  },
] as const;

/** Стартовая страница: картинка-шапка «от пара до Звёздных врат» и два входа — машины и калькулятор. */
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = (ru: string, en: string) => pick(lang, ru, en);
  return (
    <>
      <section className="hero relative w-full overflow-hidden bg-bg" aria-label={t("Шапка", "Header")}>
        {hasImage && (
          // eslint-disable-next-line @next/next/no-img-element -- одна большая картинка на всю шапку, без оптимизатора
          <img
            src={HOME.image}
            alt={t(
              "Человек идёт к Звёздным вратам сквозь все эры GregTech и по пути становится роботом",
              "A person walks toward the Stargate through every GregTech era and turns into a robot on the way",
            )}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl p-6 sm:p-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">GregTech New Horizons · Minecraft 1.7.10</p>
          <h1 className="mt-4 max-w-3xl font-mono text-4xl font-bold uppercase leading-none tracking-tight text-text1 sm:text-6xl">
            {t("От пара до Звёздных врат", "From steam to the Stargate")}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-text2">
            {t(
              "Путеводитель по машинам сборки GT New Horizons и калькулятор фабрики — на всём пути от первого котла до врат.",
              "A guide to the machines of the GT New Horizons modpack and a factory calculator — all the way from the first boiler to the gate.",
            )}
          </p>
        </div>
      </section>

      <main className="relative bg-bg">
        <nav className="mx-auto grid max-w-6xl gap-px border-y border-line bg-line sm:grid-cols-2" aria-label={t("Разделы", "Sections")}>
          {SECTIONS.map((section) => {
            const text = section[lang];
            return (
              <Link key={section.path} href={href(lang, section.path)} className="group bg-bg p-8 transition-colors hover:bg-line/40 sm:p-12">
                <span className="font-mono text-2xl uppercase tracking-tight text-text1 transition-colors group-hover:text-accent">
                  {text.title} →
                </span>
                <span className="mt-3 block max-w-sm text-sm leading-relaxed text-text2">{text.text}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </>
  );
}
