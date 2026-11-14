import { existsSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { EBF, EXPLODE, HOVER } from "@/lib/config";
import { KINDS, MACHINES, SINGLE_BLOCKS, STEAM_TIERS, findMachine, structureOf, type KindId } from "@/lib/machines";
import { TIERS, findTier } from "@/lib/tiers";
import {
  approach,
  countByKind,
  cursorWeight,
  explodedPosition,
  hoverRadius,
  domeLayout,
  domePosition,
  domeScale,
  domeWeights,
  createBlockPicker,
  type BlockKind,
  type Vec3,
} from "@/lib/structure";

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

/**
 * Первая пара кубов разных блоков, которые налезают друг на друга, или null.
 * Кубы раскладываются по сетке с шагом в сторону куба: налезть могут только
 * кубы из соседних ячеек — так не приходится сравнивать каждый с каждым
 * (у плазменной кузницы больше пяти тысяч блоков).
 */
function findOverlap(points: readonly { readonly owner: string; readonly position: Vec3 }[]): string | null {
  const cells = new Map<string, number[]>();
  const cellOf = (position: Vec3) => position.map((value) => Math.floor(value / SIDE));
  points.forEach((point, index) => {
    const key = cellOf(point.position).join(":");
    cells.set(key, [...(cells.get(key) ?? []), index]);
  });
  const shifts = [-1, 0, 1];
  for (const [index, point] of points.entries()) {
    const [cx, cy, cz] = cellOf(point.position);
    for (const dx of shifts) for (const dy of shifts) for (const dz of shifts) {
      for (const other of cells.get([cx + dx, cy + dy, cz + dz].join(":")) ?? []) {
        if (other <= index || points[other].owner === point.owner) continue;
        if (gap(point.position, points[other].position) < SIDE - 1e-9) return `${point.owner} и ${points[other].owner}`;
      }
    }
  }
  return null;
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

  test("водяной бак: полый куб из 26 стенок, без контроллера, внутри вода", () => {
    const structure = structureOf(machine("water-tank"));
    expect(counts("water-tank")).toEqual({ waterTankSiding: 26 });
    expect(structure.hollow).toEqual([[0, 1.5, 0]]);
    expect(structure.interior).toBe("water");
  });

  test("у остальных построек внутри огонь", () => {
    expect(structureOf(machine("bricked-blast-furnace")).interior).toBe("fire");
    expect(structureOf(machine("coke-oven")).interior).toBe("fire");
  });

  test("без полости огня внутри нет — свет не просачивается на пол (реактор синтеза, наквадовый реактор)", () => {
    for (const slug of ["fusion-reactor-1", "fusion-reactor-2", "large-naquadah-reactor"]) {
      expect(structureOf(machine(slug)).interior, slug).toBe("none");
    }
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

  test("если у неё есть контроллер, он один и смотрит на фасад", () => {
    if (!entry.def.kinds["~"]) return;
    const controllers = blocks.filter((block) => block.kind === entry.def.kinds["~"]);
    expect(controllers).toHaveLength(1);
    expect(controllers[0].face).toBe("pz");
    // У реактора синтеза контроллер во внутренней стенке кольца и смотрит в его центр (MTEFusionComputer),
    // у плазменной кузницы и комплекса наночипов — в середине постройки (MTEPlasmaForge, MTENanochipAssemblyComplex),
    // у Звёздных врат перед основой стоит наборное устройство.
    if (entry.slug.startsWith("fusion-reactor-") || ["plasma-forge", "nanochip-assembly-complex", "bec-containment-field", "stargate"].includes(entry.slug)) return;
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
    // Огромные постройки раздвигаются куполом (domeLayout), остальные — по своим свободным осям.
    const moving = blocks.length >= HOVER.hugeBlocks
      ? domeLayout(blocks, size).filter((dome) => dome.axis !== null).length
      : blocks.filter((block) => block.push.some((step) => step !== 0)).length;
    expect(moving).toBeGreaterThan(blocks.length / 2);
  });

  test("как бы ни раздвинулись любые два блока, они не въезжают друг в друга", () => {
    // Каждый блок — в трёх положениях сразу: любые два блока могут быть раздвинуты по-разному.
    const steps = [0, 0.5, 1];
    const points = blocks.flatMap((block) => steps.map((weight) => ({ owner: block.id, position: explodedPosition(block, weight) })));
    expect(findOverlap(points)).toBeNull();
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
    expect(entry.source).toMatch(/^https:\/\/(github\.com\/GTNewHorizons\/(GT5-Unofficial|SGCraft)\/blob\/.+\.java|wiki\.gtnewhorizons\.com\/wiki\/.+)$/);
  });
});

describe("каталог", () => {
  test("адресные имена машин не повторяются", () => {
    expect(new Set(MACHINES.map((entry) => entry.slug)).size).toBe(MACHINES.length);
  });

  test("каждая машина стоит на существующем ярусе напряжения", () => {
    for (const entry of MACHINES) expect(findTier(entry.tier), entry.slug).toBeDefined();
  });

  test("на паре — тринадцать построек, на LV — доменная печь и воздушный фильтр", () => {
    expect(MACHINES.filter((entry) => entry.tier === "steam")).toHaveLength(13);
    expect(MACHINES.filter((entry) => entry.tier === "lv").map((entry) => entry.slug)).toEqual([
      "electric-blast-furnace",
      "electric-air-filter",
    ]);
  });

  test("мини-шапка каждого яруса показывает то, что на нём есть", () => {
    for (const tier of TIERS) {
      if (tier.scene.kind !== "machine") continue;
      expect(findMachine(tier.scene.slug)?.tier).toBe(tier.id);
    }
  });

  test("у каждой эры есть значок вкладки из текстур мода", () => {
    for (const tier of TIERS) expect(existsSync(`public/textures/gregtech/${tier.icon}.webp`), tier.icon).toBe(true);
  });

  test("у ярусов разные цвета, записанные как #rrggbb", () => {
    expect(new Set(TIERS.map((tier) => tier.color)).size).toBe(TIERS.length);
    for (const tier of TIERS) expect(tier.color).toMatch(/^#[0-9a-f]{6}$/);
  });

  test("неизвестной машины нет", () => {
    expect(findMachine("нет-такой")).toBeUndefined();
  });

  test("у каждой одноблочной машины есть значки обоих ярусов, а ссылка на постройку ведёт на существующую", () => {
    for (const single of SINGLE_BLOCKS) {
      for (const tier of STEAM_TIERS) {
        expect(existsSync(`public/textures/gregtech/single-${tier}-${single.id}.webp`), single.id).toBe(true);
        for (const side of ["side", "top", "bottom"]) {
          const hull = `public/textures/gregtech/hull-${tier}-${single.hull}-${side}.webp`;
          expect(existsSync(hull), hull).toBe(true);
        }
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
  });

  test("купол: блок выходит по ближайшей грани габарита — сбоку вбок, сверху вверх", () => {
    const size: Vec3 = [11, 11, 11];
    const [side, top, middle] = domeLayout([{ home: [5, 5.5, 1] }, { home: [1, 10.5, 2] }, { home: [0, 5.5, 0] }], size);
    expect(side).toMatchObject({ axis: 0, sign: 1, reach: 5 });
    expect(top).toMatchObject({ axis: 1, sign: 1, reach: 5 });
    expect(middle.axis).toBeNull();
    expect(domePosition([5, 5.5, 1], side, 1)).toEqual([5 + EXPLODE.domePush, 5.5, 1]);
    expect(domePosition([1, 10.5, 2], top, 1)).toEqual([1, 10.5 + EXPLODE.domePush, 2]);
    expect(domePosition([0, 5.5, 0], middle, 1)).toEqual([0, 5.5, 0]);
  });

  test("первый блок под курсором: настоящий блок, а не стенка габарита", () => {
    // Посреди пустого поля 9 × 1 × 9 стоят два блока на одной линии.
    const homes: Vec3[] = [[0, 0.5, 0], [0, 0.5, -2], [4, 0.5, 4], [-4, 0.5, -4]];
    const pick = createBlockPicker(homes);
    // Смотрим сверху-спереди прямо на блок в центре: попадаем в ближний из двух.
    expect(pick([0, 0.5, 20], [0, 0, -1])).toEqual([0, 0.5, 0]);
    // Сбоку от блоков, через пустоту, — мимо.
    expect(pick([2, 0.5, 20], [0, 0, -1])).toBeNull();
    // Сверху вниз на угловой блок.
    expect(pick([4, 30, 4], [0, -1, 0])).toEqual([4, 0.5, 4]);
    // Совсем мимо габарита.
    expect(pick([100, 100, 100], [1, 0, 0])).toBeNull();
  });

  test("комплекс наночипов: под курсором на башне блоки башни двигаются", () => {
    const { blocks, size } = structureOf(machine("nanochip-assembly-complex"));
    const homes = blocks.map((block) => block.home);
    const hit = createBlockPicker(homes)([0, size[1] / 2, 200], [0, 0, -1]);
    expect(hit).not.toBeNull();
    const weights = domeWeights(domeLayout(blocks, size), homes, hit ?? [0, 0, 0], hoverRadius(blocks.length));
    expect(weights.filter((weight) => weight > 0.5).length).toBeGreaterThan(10);
  });

  test("комплекс наночипов: луч в середину башни находит блок башни, а не воздух", () => {
    const { blocks, size } = structureOf(machine("nanochip-assembly-complex"));
    const pick = createBlockPicker(blocks.map((block) => block.home));
    const found = pick([0, size[1] / 2, 200], [0, 0, -1]);
    expect(found).not.toBeNull();
    // Найденный блок — ближайший к камере на этой линии.
    const sameLine = blocks.filter((block) => block.home[0] === 0 && block.home[1] === found?.[1]);
    expect(found?.[2]).toBe(Math.max(...sameLine.map((block) => block.home[2])));
  });

  test("купол: нижние блоки выходят вбок, а не под пол", () => {
    const [bottom] = domeLayout([{ home: [1, 0.5, 2] }], [11, 11, 11]);
    expect(bottom.axis).toBe(2);
    expect(domePosition([1, 0.5, 2], bottom, 1)[1]).toBe(0.5);
  });

  test("купол: вся линия насквозь берёт силу наружного блока, а дальняя сторона не двигается", () => {
    const size: Vec3 = [11, 11, 11];
    const blocks = [{ home: [5, 5.5, 0] as Vec3 }, { home: [4, 5.5, 0] as Vec3 }, { home: [-5, 5.5, 0] as Vec3 }];
    const layout = domeLayout(blocks, size);
    expect(layout[1].line).toBe(layout[0].line);
    const [outer, inner, far] = domeWeights(layout, blocks.map((block) => block.home), [5, 5.5, 0], 4.5);
    expect(inner).toBe(outer);
    expect(outer).toBe(1);
    expect(far).toBe(0);
  });

  test.each(["mega-alloy-blast-smelter", "neutronium-compressor", "plasma-forge", "nanochip-assembly-complex", "black-hole-compressor", "forge-of-the-gods", "bec-observation-array"])("купол у «%s»: блоки никогда не налезают друг на друга", (slug) => {
    const { blocks, size } = structureOf(machine(slug));
    const layout = domeLayout(blocks, size);
    const scale = domeScale(size);
    const radius = hoverRadius(blocks.length) * scale;
    const top = size[1];
    const half = size[0] / 2;
    // Курсор на середине фасада, на углу, у основания, на крыше и на краю крыши.
    const hits: Vec3[] = [[0, top / 2, half], [half, top / 2, half], [half / 2, 1, half], [0, top, 0], [half, top, 1]];
    for (const hit of hits) {
      const weights = domeWeights(layout, blocks.map((block) => block.home), hit, radius);
      const moved = blocks.map((block, index) => domePosition(block.home, layout[index], weights[index], scale));
      // Ни один блок не уходит ниже своего места — значит, и под пол.
      moved.forEach((position, index) => expect(position[1]).toBeGreaterThanOrEqual(blocks[index].home[1]));
      expect(findOverlap(moved.map((position, index) => ({ owner: blocks[index].id, position })))).toBeNull();
    }
  });

  test("у построек от 500 блоков радиус втрое шире, у остальных — обычный", () => {
    expect(hoverRadius(982)).toBe(HOVER.radius * 3);
    expect(hoverRadius(HOVER.hugeBlocks)).toBe(HOVER.radius * 3);
    expect(hoverRadius(HOVER.hugeBlocks - 1)).toBe(HOVER.radius);
    expect(cursorWeight(HOVER.radius * 2, hoverRadius(982))).toBeGreaterThan(0);
    expect(cursorWeight(-1)).toBe(0);
  });

  test("купол длинной постройки крупнее во столько раз, во сколько она длиннее", () => {
    expect(domeScale([EXPLODE.domeReferenceSide, 1, 1])).toBe(1);
    expect(domeScale([1, 1, 1])).toBe(1);
    expect(domeScale([1, 1, EXPLODE.domeReferenceSide * 4])).toBe(4);
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
