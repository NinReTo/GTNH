import { notFound } from "next/navigation";
import { VoltageLadder } from "@/components/landing/VoltageLadder";
import { SectionHeading } from "@/components/landing/ui";
import { SceneSection } from "@/components/scene/SceneSection";
import { ASSETS } from "@/lib/config";
import { isLang, pick } from "@/lib/i18n";

const MOD_SOURCE = `https://github.com/GTNewHorizons/GT5-Unofficial/tree/${ASSETS.gregtechCommit}`;
const prose = "mt-6 max-w-xl text-base leading-relaxed text-text2";
const link = "text-text1 underline decoration-accent underline-offset-4 hover:text-accent";

function ExternalLink({ url, children }: { url: string; children: string }) {
  return (
    <a className={link} href={url} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

/** Раздел «Машины»: паровой цех в шапке, лестница напряжений; эры — во вкладках сверху. */
export default async function MachinesPage({ params }: PageProps<"/[lang]/machines">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = (ru: string, en: string) => pick(lang, ru, en);
  return (
    <>
      <SceneSection>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">GregTech New Horizons · Minecraft 1.7.10</p>
        <h1 className="mt-4 max-w-3xl font-mono text-4xl font-bold uppercase leading-none tracking-tight text-text1 sm:text-6xl">
          {t("Машины GregTech", "GregTech machines")}
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-text2">
          {t(
            "Постройки из настоящих блоков мода, по эрам и ярусам напряжения. Выберите эру во вкладках сверху.",
            "Multiblocks built from the real mod blocks, by era and voltage tier. Pick an era in the tabs above.",
          )}
        </p>
      </SceneSection>

      <main className="relative bg-bg">
        {/* 01 — схема слева, текст справа */}
        <section>
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:px-12 lg:grid-cols-2 lg:py-28">
            <VoltageLadder />
            <div>
              <SectionHeading index="01" kicker={t("Электричество", "Electricity")} title={t("Ярусы напряжения", "Voltage tiers")} />
              <p className={prose}>
                {t(
                  "После пара всё в моде измеряется ярусами напряжения. Каждый следующий вчетверо мощнее предыдущего, а машина, получившая напряжение не своего яруса, взрывается.",
                  "After steam, everything in the mod is measured in voltage tiers. Each tier is four times stronger than the one before, and a machine that gets a voltage above its own tier explodes.",
                )}
              </p>
            </div>
          </div>
        </section>

        <footer className="border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-16 font-mono text-xs leading-loose text-text3 sm:px-12">
            {lang === "ru" ? (
              <>
                <p>
                  Текстуры блоков — из <ExternalLink url={MOD_SOURCE}>GT5-Unofficial</ExternalLink> (лицензия LGPL-3.0); стенка
                  водяного бака нарисована для сайта.
                </p>
                <p>
                  Бетон и карта окружения — <ExternalLink url="https://polyhaven.com">Poly Haven</ExternalLink>, рельеф металла —{" "}
                  <ExternalLink url="https://ambientcg.com">ambientCG</ExternalLink> (обе — CC0).
                </p>
                <p>
                  Названия предметов и машин — из файлов перевода сборки GT New Horizons. Сайт не связан с Mojang, Microsoft,
                  авторами GregTech и командой GT New Horizons. Minecraft — товарный знак Mojang AB.
                </p>
              </>
            ) : (
              <>
                <p>
                  Block textures are from <ExternalLink url={MOD_SOURCE}>GT5-Unofficial</ExternalLink> (LGPL-3.0 license); the
                  water tank wall was drawn for this site.
                </p>
                <p>
                  Concrete and the environment map — <ExternalLink url="https://polyhaven.com">Poly Haven</ExternalLink>, metal
                  bump — <ExternalLink url="https://ambientcg.com">ambientCG</ExternalLink> (both CC0).
                </p>
                <p>
                  Item and machine names are from the GT New Horizons language files. This site is not affiliated with Mojang,
                  Microsoft, the GregTech authors or the GT New Horizons team. Minecraft is a trademark of Mojang AB.
                </p>
              </>
            )}
          </div>
        </footer>
      </main>
    </>
  );
}
