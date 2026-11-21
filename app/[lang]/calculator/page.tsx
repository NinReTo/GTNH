import type { Metadata } from "next";
import { Calculator } from "@/components/calc/Calculator";
import { isLang, pick } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/calculator">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return {
    title: pick(lang, "Калькулятор фабрики — GregTech New Horizons", "Factory calculator — GregTech New Horizons"),
    description: pick(
      lang,
      "Цепочка машин GTNH от сырья до нужного товара и фабрика из неё в 3D.",
      "The GTNH machine chain from raw materials to the item you need, and a 3D factory built from it.",
    ),
  };
}

export default function CalculatorPage() {
  return <Calculator />;
}
