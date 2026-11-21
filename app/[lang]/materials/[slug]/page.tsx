import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MaterialView } from "@/components/landing/MaterialView";
import { LANGS, isLang, localize, pick } from "@/lib/i18n";
import { MATERIALS, findMaterial } from "@/lib/setups";

type PageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export function generateStaticParams(): { lang: string; slug: string }[] {
  return LANGS.flatMap((lang) => MATERIALS.map((material) => ({ lang, slug: material.slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const found = findMaterial(slug);
  if (!found || !isLang(lang)) return {};
  const material = localize(lang, found);
  return { title: `${material.title} — ${pick(lang, "как получить", "how to make it")}`, description: material.summary };
}

/** Страница главного материала; переключатель источника энергии работает в браузере (MaterialView). */
export default async function MaterialPage({ params }: PageProps) {
  const { lang, slug } = await params;
  if (!isLang(lang) || !findMaterial(slug)) notFound();
  return <MaterialView slug={slug} />;
}
