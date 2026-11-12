import { existsSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { EBF, EXPLODE, HOVER } from "@/lib/config";
import { KINDS, MACHINES, SINGLE_BLOCKS, findMachine, structureOf, type KindId } from "@/lib/machines";
import { approach, countByKind, cursorWeight, explodedPosition, type BlockKind, type Vec3 } from "@/lib/structure";

const machine = (slug: string) => {
  const found = findMachine(slug);
  if (!found) throw new Error(`нет машины ${slug}`);
  return found;
};
const counts = (slug: string) => countByKind(structureOf(machine(slug)).blocks);
const SIDE = EBF.blockSize * EBF.blockScale;

/** Наибольшее расстояние между центрами по одной из осей: кубы не пересекаются, если оно не меньше стороны куба. */
function gap(first: Vec3, second: Vec3): number {
  return Math.max(...first.map((value, axis) => Math.abs(value - second[axis])));
}

describe("электрическая доменная печь", () => {
  test("состоит из 34 блоков: 3×3×4 без двух блоков воздуха внутри", () => {
    const structure = structureOf(machine("electric-blast-furnace"));
    expect(structure.blocks).toHaveLength(34);
    expect(structure.size).toEqual([3, 4, 3]);
    expect(structure.hollow).toHaveLength(2);
  });

  test("содержит 16 катушек, один контроллер и один глушитель, как требует мод", () => {
    expect(counts("electric-blast-furnace")).toMatchObject({ coil: 16, ebfController: 1, muffler: 1, maintenance: 1 });
  });

  test("корпусов не больше 12", () => {
    expect(counts("electric-blast-furnace").heatproof).toBeLessThanOrEqual(12);
  });

  test("контроллер стоит спереди внизу по центру и смотрит вперёд", () => {
    const controller = structureOf(machine("electric-blast-furnace")).blocks.find((block) => block.kind === "ebfController");
    expect(controller?.grid).toEqual([0, 0, 1]);
    expect(controller?.face).toBe("pz");
  });

  test("глушитель стоит в центре верхнего слоя и смотрит вверх", () => {
    const muffler = structureOf(machine("electric-blast-furnace")).blocks.find((block) => block.kind === "muffler");
    expect(muffler?.grid).toEqual([0, 3, 0]);
    expect(muffler?.face).toBe("py");
  });

  test("каждый люк смотрит наружу, а не внутрь печи", () => {
    const outward = { px: [1, 0], nx: [-1, 0], pz: [0, 1], nz: [0, -1] } as const;
    for (const block of structureOf(machine("electric-blast-furnace")).blocks) {
      if (!block.face || block.face === "py" || block.face === "ny") continue;
      const [dx, dz] = outward[block.face];
      expect(dx !== 0 ? block.grid[0] === dx : block.grid[2] === dz, block.id).toBe(true);
    }
  });

  test("свет стоит посередине полости, между слоями катушек", () => {
    expect(structureOf(machine("electric-blast-furnace")).lightPosition).toEqual([0, 2, 0]);
  });
});

describe("постройки паровой эры — числа блоков совпадают с подсказками мода", () => {
  test("кирпичная домна: 32 огнеупорных кирпича и контроллер во втором слое снизу", () => {
    const structure = structureOf(machine("bricked-blast-furnace"));
    expect(counts("bricked-blast-furnace")).toEqual({ firebrick: 32, bbfController: 1 });
    expect(structure.blocks.find((block) => block.kind === "bbfController")?.grid).toEqual([0, 1, 1]);
    expect(structure.size).toEqual([3, 4, 3]);
  });

  test("кирпичная домна: в крыше дыра, под ней два блока лавы", () => {
    const { hollow, blocks } = structureOf(machine("bricked-blast-furnace"));
    expect(hollow).toHaveLength(3);
    expect(blocks.some((block) => block.grid[0] === 0 && block.grid[2] === 0 && block.grid[1] > 0)).toBe(false);
  });

  test("коксовая печь: куб 3×3×3 из 25 кирпичей с контроллером и пустой серединой", () => {
    expect(counts("coke-oven")).toEqual({ cokeBrick: 25, cokeController: 1 });
    expect(structureOf(machine("coke-oven")).hollow).toEqual([[0, 1.5, 0]]);
  });

  test("паровая печь: 4 редуктора, 4 трубных корпуса, 3 топки", () => {
    expect(counts("steam-furnace")).toMatchObject({ bronzeGearbox: 4, bronzePipe: 4, bronzeFirebox: 3, furnaceController: 1 });
  });

  test("плавильня сплавов: 4 стекла и 2 трубных корпуса, глубина 4", () => {
    expect(counts("steam-alloy-smelter")).toMatchObject({ glass: 4, bronzePipe: 2, smelterController: 1 });
    expect(structureOf(machine("steam-alloy-smelter")).size).toEqual([3, 3, 4]);
  });

  test("дробилка: 8 рам и 1 редуктор", () => {
    expect(counts("steam-macerator")).toMatchObject({ bronzeFrame: 8, bronzeGearbox: 1, maceratorController: 1 });
    expect(structureOf(machine("steam-macerator")).size).toEqual([3, 4, 3]);
  });

  test("компрессор: 10 трубных корпусов и 6 блоков железа, глубина 7", () => {
    expect(counts("steam-compressor")).toMatchObject({ bronzePipe: 10, ironBlock: 6, compressorController: 1 });
    expect(structureOf(machine("steam-compressor")).size).toEqual([3, 3, 7]);
  });

  test("молот: 2 трубных корпуса и 2 блока железа, размер 5×7×5", () => {
    expect(counts("steam-forge-hammer")).toMatchObject({ bronzePipe: 2, ironBlock: 2, hammerController: 1 });
    expect(structureOf(machine("steam-forge-hammer")).size).toEqual([5, 7, 5]);
  });

  test("насос: 10 рам, контроллер спереди внизу по центру", () => {
    const structure = structureOf(machine("steam-water-pump"));
    expect(counts("steam-water-pump")).toMatchObject({ bronzeFrame: 10, pumpController: 1 });
    expect(structure.blocks.find((block) => block.kind === "pumpController")?.grid[1]).toBe(0);
    expect(structure.size).toEqual([3, 3, 4]);
  });
});

describe.each(MACHINES.map((entry) => [entry.title, entry] as const))("любая постройка: %s", (_title, entry) => {
  const { blocks, size } = structureOf(entry);

  test("у неё ровно один контроллер, и он смотрит на фасад", () => {
    const controllers = blocks.filter((block) => block.kind === entry.def.kinds["~"]);
    expect(controllers).toHaveLength(1);
    expect(controllers[0].face).toBe("pz");
    expect(controllers[0].grid[2]).toBeGreaterThan(0);
  });

  test("стоит на полу и не выходит за свои габариты", () => {
    expect(Math.min(...blocks.map((block) => block.grid[1]))).toBe(0);
    for (const block of blocks) {
      expect(Math.abs(block.grid[0])).toBeLessThanOrEqual((size[0] - 1) / 2);
      expect(block.grid[1]).toBeLessThan(size[1]);
      expect(Math.abs(block.grid[2])).toBeLessThanOrEqual((size[2] - 1) / 2);
    }
  });

  test("без раздвижения блоки стоят вплотную по сетке в один метр", () => {
    for (const block of blocks) {
      expect(explodedPosition(block, 0)).toEqual(block.home);
      expect(block.home).toEqual([block.grid[0], block.grid[1] + 0.5, block.grid[2]]);
    }
  });

  test("блок уходит только от оси и вверх, никогда внутрь и вниз", () => {
    for (const block of blocks) {
      expect([0, Math.sign(block.grid[0])]).toContain(block.push[0]);
      expect([0, 1]).toContain(block.push[1]);
      expect([0, Math.sign(block.grid[2])]).toContain(block.push[2]);
    }
  });

  test("хотя бы часть блоков раздвигается — иначе наводить мышку незачем", () => {
    expect(blocks.filter((block) => block.push.some((step) => step !== 0)).length).toBeGreaterThan(blocks.length / 2);
  });

  test("как бы ни раздвинулись любые два блока, они не въезжают друг в друга", () => {
    const steps = [0, 0.5, 1];
    for (let first = 0; first < blocks.length; first += 1) {
      for (let second = first + 1; second < blocks.length; second += 1) {
        for (const firstWeight of steps) {
          for (const secondWeight of steps) {
            const distance = gap(explodedPosition(blocks[first], firstWeight), explodedPosition(blocks[second], secondWeight));
            expect(distance, `${blocks[first].id} и ${blocks[second].id}`).toBeGreaterThanOrEqual(SIDE - 1e-9);
          }
        }
      }
    }
  });

  test("у каждого вида блока есть файл текстуры", () => {
    for (const id of new Set(blocks.map((block) => block.kind))) {
      const kind: BlockKind = KINDS[id as KindId];
      const files = [kind.texture, kind.face?.base, kind.glow].filter((name): name is string => Boolean(name));
      for (const file of files) expect(existsSync(`public/textures/gregtech/${file}.webp`), file).toBe(true);
    }
  });

  test("у неё есть рассказ, факты и ссылка на исходник", () => {
    expect(entry.story.length).toBeGreaterThanOrEqual(2);
    expect(entry.facts.length).toBeGreaterThanOrEqual(3);
    expect(entry.source).toMatch(/\.java$/);
  });
});

describe("каталог", () => {
  test("адресные имена машин не повторяются", () => {
    expect(new Set(MACHINES.map((entry) => entry.slug)).size).toBe(MACHINES.length);
  });

  test("в нём восемь построек паровой эры и одна электрическая", () => {
    expect(MACHINES.filter((entry) => entry.group !== "electric")).toHaveLength(8);
    expect(MACHINES.filter((entry) => entry.group === "electric")).toHaveLength(1);
  });

  test("неизвестной машины нет", () => {
    expect(findMachine("нет-такой")).toBeUndefined();
  });

  test("у каждой одноблочной машины есть значки обоих ярусов, а ссылка на постройку ведёт на существующую", () => {
    for (const single of SINGLE_BLOCKS) {
      for (const tier of ["bronze", "steel"]) {
        expect(existsSync(`public/textures/gregtech/single-${tier}-${single.id}.webp`), single.id).toBe(true);
      }
      if (single.multiSlug) expect(findMachine(single.multiSlug)).toBeDefined();
    }
  });
});

describe("раскладка", () => {
  const furnace = structureOf(machine("electric-blast-furnace")).blocks;
  const at = (x: number, y: number, z: number) => {
    const block = furnace.find((candidate) => candidate.id === [x, y, z].join(":"));
    if (!block) throw new Error("нет блока");
    return block;
  };

  test("блок стены отходит от оси на заданное расстояние", () => {
    expect(explodedPosition(at(1, 1, 0), 1)[0]).toBeCloseTo(1 + EXPLODE.radialSpread);
  });

  test("поднимается только крышка: блоки под ней остаются на своей высоте", () => {
    expect(explodedPosition(at(0, 3, 1), 1)[1]).toBeCloseTo(3.5 + EXPLODE.lidLift);
    expect(explodedPosition(at(0, 2, 1), 1)[1]).toBeCloseTo(2.5);
    expect(explodedPosition(at(1, 0, 1), 1)[1]).toBeCloseTo(0.5);
  });

  test("блок движется без возвратов", () => {
    let previous = explodedPosition(at(1, 3, 1), 0);
    for (let step = 1; step <= 20; step += 1) {
      const current = explodedPosition(at(1, 3, 1), step / 20);
      current.forEach((value, axis) => expect(value).toBeGreaterThanOrEqual(previous[axis]));
      previous = current;
    }
  });

  test("за пределами отрезка 0…1 раздвижение не растёт", () => {
    expect(explodedPosition(at(1, 2, 1), 5)).toEqual(explodedPosition(at(1, 2, 1), 1));
    expect(explodedPosition(at(1, 2, 1), -5)).toEqual(explodedPosition(at(1, 2, 1), 0));
  });
});

describe("раздвижение у курсора", () => {
  test("блок прямо под курсором раздвигается полностью", () => {
    expect(cursorWeight(0)).toBe(1);
  });

  test("блок на краю радиуса и дальше стоит на месте", () => {
    expect(cursorWeight(HOVER.radius)).toBe(0);
    expect(cursorWeight(HOVER.radius * 3)).toBe(0);
  });

  test("чем ближе курсор, тем сильнее раздвижение", () => {
    expect(cursorWeight(HOVER.radius / 4)).toBeGreaterThan(cursorWeight(HOVER.radius / 2));
    expect(cursorWeight(HOVER.radius / 2)).toBeCloseTo(0.5);
  });

  test("бессмысленное расстояние ничего не двигает", () => {
    expect(cursorWeight(Number.NaN)).toBe(0);
    expect(cursorWeight(-1)).toBe(0);
  });
});

describe("плавное движение блока", () => {
  test("идёт к цели и не перелетает её", () => {
    const next = approach(0, 1, 0.016);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(1);
  });

  test("возвращается назад, когда курсор ушёл", () => {
    expect(approach(0.8, 0, 0.016)).toBeLessThan(0.8);
  });

  test("в конце концов доезжает ровно до цели — анимация заканчивается", () => {
    let weight = 0;
    let frames = 0;
    while (weight !== 1 && frames < 1000) {
      weight = approach(weight, 1, 0.016);
      frames += 1;
    }
    expect(weight).toBe(1);
    expect(frames).toBeLessThan(120);
  });

  test("на месте стоит неподвижно", () => {
    expect(approach(0, 0, 0.016)).toBe(0);
    expect(approach(1, 1, 0.016)).toBe(1);
  });

  test("после долгого простоя кадр не перебрасывает блок одним скачком", () => {
    expect(approach(0, 1, 30)).toBe(approach(0, 1, HOVER.maxStep));
    expect(approach(0, 1, 30)).toBeLessThan(0.5);
  });

  test("отрицательное время ничего не двигает", () => {
    expect(approach(0.4, 1, -1)).toBe(0.4);
  });
});
