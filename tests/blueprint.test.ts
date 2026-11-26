import { writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { expect, test } from "vitest";
import { BLUEPRINT_PREFIX, blueprintData, encodeBlueprint } from "@/lib/calc/blueprint";
import { findMachine, structureOf } from "@/lib/machines";
import { keyOf, toMachine, type Grid } from "@/lib/layout";
import { FACES } from "@/lib/structure";

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

test("чертёж передаёт только подключённую сторону трубы и подпись входного сундука", () => {
  const machine = findMachine("electric-blast-furnace")!;
  const grid: Grid = new Map([
    [keyOf([0, 0, 0]), { kind: "waterPipe", links: ["px"], pipeOutputs: ["px", "py"] }],
    [keyOf([1, 0, 0]), { kind: "ownChest", supplies: ["Железная руда"] }],
    [keyOf([2, 0, 0]), { kind: "heatproof", itemOutput: "px", fluidOutput: "nz" }],
  ]);
  const { blocks, details } = blueprintData(toMachine(grid, { ...machine, slug: "blueprint-test-supplies" }, {}), "Проверка");
  expect(details[blocks.findIndex(([x]) => x === 0)]).toMatchObject({ outputs: 1 << FACES.indexOf("px") });
  expect(details[blocks.findIndex(([x]) => x === 1)]).toMatchObject({ supplies: ["Железная руда"] });
  expect(details[blocks.findIndex(([x]) => x === 2)]).toMatchObject({
    itemOutput: 1 << FACES.indexOf("px"), fluidOutput: 1 << FACES.indexOf("nz"),
  });
});
