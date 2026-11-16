import type { CraftItem, CraftLine as CraftLineData, CraftStep } from "@/lib/crafts";

/** Цвета окна Minecraft: серая панель и утопленные ячейки с тёмной кромкой сверху-слева. */
const panel = "border-2 border-b-[#555] border-l-white border-r-[#555] border-t-white bg-[#c6c6c6] p-3 text-[#404040]";
const slot = "relative flex size-10 items-center justify-center border-2 border-b-white border-l-[#373737] border-r-white border-t-[#373737] bg-[#8b8b8b]";

function Slot({ item, isOutput = false }: { item: CraftItem | null; isOutput?: boolean }) {
  return (
    <div className={isOutput ? `${slot} size-14` : slot} title={item?.label}>
      {item && (
        // Значки 16 × 16 из мода: растягиваем без сглаживания, как в игре.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/textures/gregtech/${item.icon}.webp`} alt={item.label} className="size-8 [image-rendering:pixelated]" />
      )}
      {item?.count && (
        <span className="absolute bottom-0 right-0.5 font-mono text-xs font-bold text-white [text-shadow:1px_1px_#3f3f3f]" aria-hidden="true">
          {item.count}
        </span>
      )}
    </div>
  );
}

function Step({ step, index }: { step: CraftStep; index: number }) {
  const columns = Math.max(...step.grid.map((row) => row.length));
  return (
    <li className={`${panel} max-w-xs`}>
      <p className="font-mono text-xs font-bold uppercase tracking-widest">
        {index + 1}. {step.title}
      </p>
      <p className="text-xs">{step.station}</p>
      <div className="mt-3 flex items-center gap-3">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${columns}, min-content)` }}>
          {step.grid.flatMap((row, y) => row.map((item, x) => <Slot key={`${y}-${x}`} item={item} />))}
        </div>
        <span className="text-2xl font-bold" aria-hidden="true">
          →
        </span>
        <Slot item={step.output} isOutput />
      </div>
      <p className="mt-3 text-xs font-bold">{step.output.label}</p>
      {step.note && <p className="mt-1 text-xs leading-snug">{step.note}</p>}
    </li>
  );
}

/** Цепочка главного металла: шаги по порядку, от сырья до слитка; ячейки — как в окне машины Minecraft. */
export function CraftLine({ line }: { line: CraftLineData }) {
  return (
    <ol className="mt-6 flex flex-wrap items-stretch gap-4">
      {line.steps.map((step, index) => (
        <Step key={`${index}-${step.title}`} step={step} index={index} />
      ))}
    </ol>
  );
}
