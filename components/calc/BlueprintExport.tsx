"use client";

import { useState } from "react";
import { encodeBlueprint } from "@/lib/calc/blueprint";
import type { Machine } from "@/lib/machines";

export function BlueprintExport({ machine, title, t }: {
  readonly machine: Machine;
  readonly title: string;
  readonly t: (ru: string, en: string) => string;
}) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const copy = async () => {
    setBusy(true);
    setStatus("");
    try {
      const next = code || await encodeBlueprint(machine, title);
      setCode(next);
      try {
        await navigator.clipboard.writeText(next);
        setStatus(t("Код скопирован.", "Code copied."));
      } catch {
        setStatus(t("Скопируйте код из поля.", "Copy the code from the field."));
      }
    } catch {
      setStatus(t("Не удалось создать код чертежа.", "Could not create the blueprint code."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-4">
      <button type="button" disabled={busy} onClick={copy} className="border border-accent px-3 py-2 text-sm text-accent">
        {t("Скопировать код чертежа", "Copy blueprint code")}
      </button>
      {status && <p role="status" className="mt-2 text-sm">{status}</p>}
      {code && <textarea readOnly value={code} aria-label={t("Код чертежа", "Blueprint code")}
        onFocus={(event) => event.currentTarget.select()} className="mt-2 block w-full border border-line bg-bg p-2 font-mono text-sm" />}
    </div>
  );
}
