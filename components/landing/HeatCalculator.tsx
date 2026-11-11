"use client";

import { useState } from "react";
import { DIAGRAM, GAME } from "@/lib/config";
import { coilHeat, heatBonuses, heatCapacity, voltageHeatBonus } from "@/lib/heat";
import { formatNumber } from "./ui";

/** Ярусы, на которых у печи есть рецепты: от MV и выше. */
const VOLTAGE_CHOICES = GAME.voltageTiers
  .map((tier, index) => ({ ...tier, index }))
  .filter((tier) => tier.index >= GAME.heatBonusBaseTier);

function choiceClass(isActive: boolean): string {
  const base = "border px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors";
  return isActive
    ? `${base} border-accent bg-accent text-bg`
    : `${base} border-line text-text2 hover:border-text3 hover:text-text1`;
}

export function HeatCalculator() {
  const [coilId, setCoilId] = useState<string>(GAME.coils[0].id);
  const [voltageTier, setVoltageTier] = useState<number>(GAME.heatBonusBaseTier);
  const coil = GAME.coils.find((candidate) => candidate.id === coilId) ?? GAME.coils[0];
  // Те же формулы, что в исходниках мода: lib/heat.ts.
  const capacity = heatCapacity(coil.ordinal, voltageTier);

  return (
    <div className="border border-line">
      <div className="grid gap-px bg-line lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="bg-bg p-4 sm:p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text3">Катушки</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {GAME.coils.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                aria-pressed={candidate.id === coilId}
                className={`${choiceClass(candidate.id === coilId)} flex items-center gap-2`}
                onClick={() => setCoilId(candidate.id)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- текстуру 16×16 нельзя сглаживать */}
                <img
                  src={`/textures/gregtech/coil-${candidate.id}.webp`}
                  alt=""
                  width={DIAGRAM.calculator.swatch}
                  height={DIAGRAM.calculator.swatch}
                  className="pixelated"
                />
                {candidate.name}
              </button>
            ))}
          </div>

          <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-text3">Напряжение</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {VOLTAGE_CHOICES.map((tier) => (
              <button
                key={tier.name}
                type="button"
                aria-pressed={tier.index === voltageTier}
                className={choiceClass(tier.index === voltageTier)}
                onClick={() => setVoltageTier(tier.index)}
              >
                {tier.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center bg-bg p-4 sm:p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text3">Нагрев печи</p>
          <p className="mt-2 font-mono text-5xl font-bold text-accent sm:text-6xl">
            {formatNumber(capacity)}
            <span className="ml-2 text-2xl text-text2">K</span>
          </p>
          <p className="mt-3 font-mono text-xs text-text3">
            {formatNumber(coilHeat(coil.ordinal))} катушки + {formatNumber(voltageHeatBonus(voltageTier))} напряжение
          </p>
        </div>
      </div>

      <table className="w-full border-t border-line text-left text-sm">
        <thead className="font-mono text-xs uppercase tracking-[0.2em] text-text3">
          <tr>
            <th className="px-4 py-3 font-normal sm:px-6">Рецепт</th>
            <th className="px-4 py-3 font-normal">Нужно</th>
            <th className="px-4 py-3 font-normal">Что даёт запас</th>
          </tr>
        </thead>
        <tbody>
          {GAME.recipes.map((recipe) => {
            const bonus = heatBonuses(capacity, recipe.heat);
            const saving = (1 - bonus.energyFactor) * DIAGRAM.calculator.percent;
            return (
              <tr key={recipe.name} className="border-t border-line">
                <td className="px-4 py-3 text-text1 sm:px-6">{recipe.name}</td>
                <td className="px-4 py-3 font-mono text-text2">{formatNumber(recipe.heat)} K</td>
                <td className={`px-4 py-3 font-mono ${bonus.canRun ? "text-text1" : "text-text3"}`}>
                  {bonus.canRun
                    ? `−${formatNumber(saving, 1)} % энергии · идеальных разгонов: ${bonus.perfectOverclocks}`
                    : `не хватает ${formatNumber(recipe.heat - capacity)} K`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
