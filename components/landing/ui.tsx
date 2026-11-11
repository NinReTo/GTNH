import type { ReactNode } from "react";
import { DIAGRAM } from "@/lib/config";

/** Число в русской записи: пробелы между разрядами, запятая в дробях. */
export function formatNumber(value: number, fractionDigits = 0): string {
  return value.toLocaleString("ru-RU", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

type SectionHeadingProps = {
  index: string;
  kicker: string;
  title: string;
};

export function SectionHeading({ index, kicker, title }: SectionHeadingProps) {
  return (
    <header>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
        {index} · {kicker}
      </p>
      <h2 className="mt-4 font-mono text-3xl font-bold uppercase leading-tight tracking-tight text-text1 sm:text-5xl">
        {title}
      </h2>
    </header>
  );
}

type SliderProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  display: string;
  onChange: (value: number) => void;
};

export function Slider({ label, value, min = 0, max = 1, display, onChange }: SliderProps) {
  return (
    <label className="block font-mono text-xs uppercase tracking-[0.2em] text-text2">
      <span className="flex items-baseline justify-between gap-4">
        <span>{label}</span>
        <span className="text-base text-text1">{display}</span>
      </span>
      <input
        type="range"
        className="mt-3"
        min={min}
        max={max}
        step={DIAGRAM.sliderStep}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

type FigureProps = {
  caption: string;
  children: ReactNode;
};

/** Рамка схемы с подписью: что именно здесь считается и откуда. */
export function Figure({ caption, children }: FigureProps) {
  return (
    <figure className="border border-line">
      <div className="p-4 sm:p-6">{children}</div>
      <figcaption className="border-t border-line px-4 py-3 font-mono text-xs leading-relaxed text-text3 sm:px-6">
        {caption}
      </figcaption>
    </figure>
  );
}
