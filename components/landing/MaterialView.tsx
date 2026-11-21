"use client";

import { useState } from "react";
import Link from "next/link";
import { CraftLine } from "@/components/landing/CraftLine";
import { MachineDiagram } from "@/components/landing/MachineDiagram";
import { FactList, SectionHeading } from "@/components/landing/ui";
import { SceneSection } from "@/components/scene/SceneSection";
import { craftLinesOf } from "@/lib/crafts";
import { findMaterial } from "@/lib/setups";
import { findTier } from "@/lib/tiers";
import { href, localize, pick } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";

const prose = "mt-6 max-w-xl text-base leading-relaxed text-text2";
const link = "text-text1 underline decoration-accent underline-offset-4 hover:text-accent";

/**
 * Страница главного материала: трёхмерная линия производства, переключатель источника пара или энергии
 * (только тех, что есть на ярусе) и что в линии стоит. При смене источника меняются сцена, числа и разбор.
 */
export function MaterialView({ slug }: { slug: string }) {
  const [chosen, setChosen] = useState(0);
  const lang = useLang();
  const t = (ru: string, en: string) => pick(lang, ru, en);
  const found = findMaterial(slug);
  if (!found) return null;
  const material = localize(lang, found);
  const tier = localize(lang, findTier(material.tier));
  const option = material.options[chosen] ?? material.options[0];
  const kicker = material.tier === "steam" ? t("Источник пара", "Steam source") : t("Источник энергии", "Power source");
  // Ветки дерева в порядке первого появления: у стали LV сначала «Без электричества», потом печь.
  const groups = [...new Set(material.options.map((candidate) => candidate.group))];
  const chain = localize(lang, craftLinesOf(material.tier).find((line) => line.material === material.slug));

  return (
    <>
      {/* Своя сцена на каждый вариант: при смене источника постройка собирается заново. */}
      <SceneSection key={option.setup.slug} slug={option.setup.slug}>
        <p className="font-mono text-xs uppercase tracking-[0.3em]" style={{ color: tier?.color }}>
          {tier?.title} · {t("главный металл", "main metal")}
        </p>
        <h1 className="mt-4 max-w-3xl font-mono text-4xl font-bold uppercase leading-none tracking-tight text-text1 sm:text-6xl">
          {material.title}
        </h1>
        <p className="mt-6 max-w-md text-base text-text2">{material.summary}</p>
      </SceneSection>

      <main className="relative bg-bg">
        {material.options.length > 1 && (
          <section className="mx-auto max-w-6xl px-6 pt-16 sm:px-12" aria-label={kicker}>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-text3">{kicker}</p>
            {/* Дерево: материал → чем делают (ветка) → источник и чем он кормится. */}
            <p className="mt-4 font-mono text-sm uppercase tracking-[0.1em] text-text1">{material.title}</p>
            <ul className="ml-2 mt-2 border-l border-line">
              {groups.map((group) => (
                <li key={group} className="relative pl-6 pt-4">
                  <span className="absolute left-0 top-[1.6rem] h-px w-5 bg-line" aria-hidden="true" />
                  <p className="font-mono text-xs uppercase tracking-[0.15em] text-text2">{group}</p>
                  <ul className="ml-2 mt-2 border-l border-line" role="group" aria-label={group}>
                    {material.options.map((candidate, index) => {
                      if (candidate.group !== group) return null;
                      const isChosen = candidate.id === option.id;
                      return (
                        <li key={candidate.id} className="relative flex flex-wrap items-center gap-x-4 gap-y-1 pl-6 pt-3">
                          <span className="absolute left-0 top-[1.75rem] h-px w-5 bg-line" aria-hidden="true" />
                          <button
                            type="button"
                            aria-pressed={isChosen}
                            onClick={() => setChosen(index)}
                            className={`border px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
                              isChosen ? "border-accent bg-accent text-bg" : "border-line text-text2 hover:border-accent hover:text-accent"
                            }`}
                          >
                            {candidate.label}
                          </button>
                          <span className="text-sm text-text3">← {candidate.via}</span>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:px-12 lg:grid-cols-2 lg:py-32">
          <div>
            <SectionHeading index="01" kicker={t("Как получить", "How to make it")} title={option.setup.title} />
            {option.story.map((paragraph) => (
              <p key={paragraph} className={prose}>
                {paragraph}
              </p>
            ))}
          </div>
          <div className="grid content-start gap-8">
            <FactList facts={option.facts} />
            <ol className="grid content-start gap-4">
              {option.parts.map((part, index) => (
                <li key={part.title} className="border-l-2 border-line pl-4">
                  <p className="font-mono text-sm uppercase tracking-[0.1em] text-text1">
                    {index + 1}. {part.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-text2">{part.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {chain && (
          <section className="border-t border-line">
            <div className="mx-auto max-w-6xl px-6 py-24 sm:px-12 lg:py-32">
              <SectionHeading index="02" kicker={t("От сырья до слитка", "From raw materials to the ingot")} title={t("Цепочка", "The chain")} />
              <p className={prose}>{t("Все шаги по порядку и машины, в которых они идут. Последние шаги — это сама линия выше.", "All the steps in order and the machines that do them. The last steps are the line above.")}</p>
              <CraftLine line={chain} />
            </div>
          </section>
        )}

        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-24 sm:px-12 lg:py-32">
            <SectionHeading index={chain ? "03" : "02"} kicker={t("Структура", "Structure")} title={t("Из чего сложена", "What it is built from")} />
            <div className="mt-12">
              <MachineDiagram key={option.setup.slug} slug={option.setup.slug} />
            </div>
          </div>
        </section>

        <nav className="border-t border-line" aria-label={t("Назад", "Back")}>
          <div className="mx-auto max-w-6xl px-6 py-16 sm:px-12">
            <Link href={href(lang, `/tiers/${material.tier}`)} className={`${link} font-mono text-sm uppercase tracking-[0.2em]`}>
              ← {tier?.title}
            </Link>
          </div>
        </nav>
      </main>
    </>
  );
}
