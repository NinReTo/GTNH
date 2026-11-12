import { TierBanner } from "@/components/landing/TierBanner";
import { VoltageLadder } from "@/components/landing/VoltageLadder";
import { SectionHeading } from "@/components/landing/ui";
import { SceneSection } from "@/components/scene/SceneSection";
import { ASSETS } from "@/lib/config";
import { TIERS } from "@/lib/tiers";

const MOD_SOURCE = `https://github.com/GTNewHorizons/GT5-Unofficial/tree/${ASSETS.gregtechCommit}`;
const prose = "mt-6 max-w-xl text-base leading-relaxed text-text2";
const link = "text-text1 underline decoration-accent underline-offset-4 hover:text-accent";

export default function Home() {
  return (
    <>
      <SceneSection>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">GregTech New Horizons · Minecraft 1.7.10</p>
        <h1 className="mt-4 max-w-3xl font-mono text-4xl font-bold uppercase leading-none tracking-tight text-text1 sm:text-7xl">
          Машины GregTech
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-text2">
          Постройки из настоящих блоков мода. Тяните мышкой — цех повернётся, наведите на блоки — они раздвинутся.
        </p>
      </SceneSection>

      <main className="relative bg-bg">
        {/* 01 — мини-шапки напряжений, стопкой */}
        <section className="mx-auto max-w-6xl px-6 py-20 sm:px-12 lg:py-28">
          <SectionHeading index="01" kicker="Напряжения" title="С чего начинается завод" />
          <p className={prose}>
            В GregTech всё делится на ярусы напряжения: каждый следующий мощнее, и машины одного яруса нужны, чтобы
            собрать машины следующего. Выберите ярус.
          </p>
          <div className="mt-12 grid gap-6">
            {TIERS.map((tier) => (
              <TierBanner key={tier.id} tier={tier} />
            ))}
          </div>
        </section>

        {/* 02 — схема слева, текст справа */}
        <section className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:px-12 lg:grid-cols-2 lg:py-28">
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

        <footer className="border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-16 font-mono text-xs leading-loose text-text3 sm:px-12">
            <p>
              Текстуры блоков — из{" "}
              <a className={link} href={MOD_SOURCE} target="_blank" rel="noopener noreferrer">
                GT5-Unofficial
              </a>{" "}
              (лицензия LGPL-3.0); стенка водяного бака нарисована для сайта.
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
