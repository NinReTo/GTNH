import type { Metadata } from "next";
import { Calculator } from "@/components/calc/Calculator";

export const metadata: Metadata = {
  title: "Калькулятор фабрики — GregTech New Horizons",
  description: "Цепочка машин GTNH от сырья до нужного товара и фабрика из неё в 3D.",
};

export default function CalculatorPage() {
  return <Calculator />;
}
