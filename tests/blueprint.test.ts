import { writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { expect, test } from "vitest";
import { BLUEPRINT_PREFIX, blueprintData, encodeBlueprint } from "@/lib/calc/blueprint";
import { findMachine, structureOf } from "@/lib/machines";

test("код чертежа сохраняет блоки, грани и размеры без клеток полости", async () => {
  const machine = findMachine("electric-blast-furnace")!;
  const code = await encodeBlueprint(machine, "Электрическая доменная печь");
  expect(code.startsWith(BLUEPRINT_PREFIX)).toBe(true);
  const json = gunzipSync(Buffer.from(code.slice(BLUEPRINT_PREFIX.length), "base64url")).toString("utf8");
  const decoded = JSON.parse(json);
  expect(decoded).toEqual(JSON.parse(JSON.stringify(blueprintData(machine, "Электрическая доменная печь"))));
  expect(decoded.blocks).toHaveLength(structureOf(machine).blocks.length);
  expect(decoded.blocks.every((block: number[]) => decoded.size.every((side: number, axis: number) =>
    block[axis] >= 0 && block[axis] < side))).toBe(true);
  if (process.env.BLUEPRINT_TEST_OUTPUT) writeFileSync(process.env.BLUEPRINT_TEST_OUTPUT, code);
});
