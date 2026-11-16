import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MaterialView } from "@/components/landing/MaterialView";
import { MATERIALS, findMaterial } from "@/lib/setups";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams(): { slug: string }[] {
  return MATERIALS.map((material) => ({ slug: material.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const material = findMaterial((await params).slug);
  if (!material) return {};
  return { title: `${material.title} — как получить`, description: material.summary };
}

/** Страница главного материала; переключатель источника энергии работает в браузере (MaterialView). */
export default async function MaterialPage({ params }: PageProps) {
  const { slug } = await params;
  if (!findMaterial(slug)) notFound();
  return <MaterialView slug={slug} />;
}
