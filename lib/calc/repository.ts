/**
 * Чтение выгрузки рецептов GTNH (data.bin). Формат и разбор — по Repository из калькулятора ShadowTheAge
 * (https://github.com/ShadowTheAge/gtnh, MIT License, Copyright (c) 2025 ShadowTheAge): файл — массив 32-битных чисел,
 * объекты лежат по смещениям, строки — длина и байты UTF-8. Здесь — только то, что нужно нашему калькулятору.
 */

/** Версия формата выгрузки, под которую написан разбор. */
const DATA_VERSION = 7;
/** Сколько чисел занимает одна запись входа или выхода рецепта: тип, товар, слот, количество, шанс. */
const IO_STRIDE = 5;
/** Поле предмета с размером стопки. */
const STACK_FIELD = 15;
/** Поле предмета со ссылкой на «жидкость в ёмкости» (FluidContainer: жидкость, литры, пустая ёмкость). */
const CONTAINER_FIELD = 17;
/** Шанс в выгрузке — в процентах: 100 — всегда. */
const PROBABILITY_SCALE = 100;

export type GoodsKind = "item" | "fluid";

export interface Goods {
  readonly ptr: number;
  readonly kind: GoodsKind;
  /** Имя в игре (английское). */
  readonly name: string;
  readonly mod: string;
  readonly internalName: string;
  readonly damage: number;
  /** Номер значка в атласе: 256 значков в ряду по 32 пикселя. */
  readonly iconId: number;
  /** Сколько штук в стопке; у инструментов — 1. У жидкостей — 0. */
  readonly stackSize: number;
}

export interface RecipeIo {
  /** Подходящие товары: один, а у словаря руд — любой из его предметов. */
  readonly goods: readonly number[];
  readonly kind: GoodsKind;
  readonly amount: number;
  /** Доля от 0 до 1: шанс выхода. Для входов — всегда 1. */
  readonly probability: number;
  /** Вход словаря руд (#ore:…), а не конкретный предмет. */
  readonly isOreDict: boolean;
}

export interface Recipe {
  readonly ptr: number;
  /** Тип рецепта — машина или способ: «Macerator», «Blast Furnace», «Crafting (Shaped)». */
  readonly type: string;
  /** Есть ли у рецепта энергия и время (рецепт машины GregTech). */
  readonly isGt: boolean;
  readonly voltage: number;
  readonly amperage: number;
  readonly ticks: number;
  /** Ярус напряжения рецепта по выгрузке: 0 — LV (рецепты ULV тоже 0), 1 — MV и т. д. */
  readonly tier: number;
  /** Нагрев катушек для печей (COIL_HEAT), 0 — не нужен. */
  readonly heat: number;
  readonly inputs: readonly RecipeIo[];
  readonly outputs: readonly RecipeIo[];
  /** Входы, которые не тратятся (схемы, формы): количество 0. */
  readonly catalysts: readonly RecipeIo[];
  /** Машины, которые ведут рецепт: одноблочные и постройки (имена предметов). */
  readonly singleblocks: readonly string[];
  readonly multiblocks: readonly string[];
}

export class Repository {
  /** Исходный буфер: из него же правила машин ShadowTheAge читают рецепты своим разбором. */
  readonly buffer: ArrayBuffer;
  private readonly elements: Int32Array;
  private readonly bytes: Uint8Array;
  private readonly view: DataView;
  private readonly decoder = new TextDecoder();
  private readonly strings = new Map<number, string>();
  private readonly goodsCache = new Map<number, Goods>();
  private readonly fluidSet: ReadonlySet<number>;
  readonly itemPtrs: Int32Array;
  readonly fluidPtrs: Int32Array;
  readonly recipePtrs: Int32Array;
  readonly circuitTiers: ReadonlyMap<number, string>;

  constructor(buffer: ArrayBuffer) {
    this.buffer = buffer;
    this.elements = new Int32Array(buffer);
    this.bytes = new Uint8Array(buffer);
    this.view = new DataView(buffer);
    const version = this.elements[0];
    if (version !== DATA_VERSION) throw new Error(`Выгрузка версии ${version}, а разбор написан под ${DATA_VERSION}`);
    this.itemPtrs = this.slice(this.elements[1]);
    this.fluidPtrs = this.slice(this.elements[2]);
    this.recipePtrs = this.slice(this.elements[5]);
    this.fluidSet = new Set(this.fluidPtrs);
    const circuitTiers = new Map<number, string>();
    // Универсальная схема помечает ярус всей группы в словаре руд.
    for (const group of this.slice(this.elements[3])) {
      const items = this.slice(this.field(group, 5));
      for (const item of items) {
        const match = /^Any ([A-Z]+) Circuit$/i.exec(this.string(this.field(item, 5)));
        if (!match) continue;
        for (const member of items) circuitTiers.set(member, match[1].toLowerCase());
        break;
      }
    }
    this.circuitTiers = circuitTiers;
  }

  private slice(pointer: number): Int32Array {
    return this.elements.subarray(pointer + 1, pointer + 1 + this.elements[pointer]);
  }

  private string(pointer: number): string {
    if (pointer === -1) return "";
    const cached = this.strings.get(pointer);
    if (cached !== undefined) return cached;
    const begin = pointer * 4 + 4;
    const text = this.decoder.decode(this.bytes.subarray(begin, begin + this.elements[pointer]));
    this.strings.set(pointer, text);
    return text;
  }

  private field(object: number, offset: number): number {
    return this.elements[object + offset];
  }

  goods(ptr: number): Goods {
    const cached = this.goodsCache.get(ptr);
    if (cached) return cached;
    const isFluid = this.fluidSet.has(ptr);
    const goods: Goods = {
      ptr,
      kind: isFluid ? "fluid" : "item",
      name: this.string(this.field(ptr, 5)),
      mod: this.string(this.field(ptr, 6)),
      internalName: this.string(this.field(ptr, 7)),
      damage: isFluid ? 0 : this.field(ptr, 16),
      iconId: this.field(ptr, 9),
      stackSize: isFluid ? 0 : this.field(ptr, STACK_FIELD),
    };
    this.goodsCache.set(ptr, goods);
    return goods;
  }

  /** Все рецепты, разобранные в простые объекты. Долго (сотни тысяч) — вызывать один раз. */
  recipes(): Recipe[] {
    const typeCache = new Map<number, { readonly name: string; readonly singleblocks: readonly string[]; readonly multiblocks: readonly string[] }>();
    const typeOf = (pointer: number) => {
      const cached = typeCache.get(pointer);
      if (cached) return cached;
      const names = (offset: number) => [...this.slice(this.field(pointer, offset))].map((item) => this.goods(item).name);
      const type = { name: this.string(this.field(pointer, 0)), singleblocks: names(5), multiblocks: names(3) };
      typeCache.set(pointer, type);
      return type;
    };
    return [...this.recipePtrs].map((ptr) => this.recipe(ptr, typeOf(this.field(ptr, 6))));
  }

  private recipe(ptr: number, type: { readonly name: string; readonly singleblocks: readonly string[]; readonly multiblocks: readonly string[] }): Recipe {
    const gt = this.field(ptr, 7);
    const io = this.slice(this.field(ptr, 5));
    const inputs: RecipeIo[] = [];
    const outputs: RecipeIo[] = [];
    const catalysts: RecipeIo[] = [];
    for (let index = 0; index < io.length; index += IO_STRIDE) {
      const kindCode = io[index];
      const pointer = io[index + 1];
      const amount = io[index + 3];
      const isOreDict = kindCode === 1;
      const kind: GoodsKind = kindCode === 2 || kindCode === 4 ? "fluid" : "item";
      const goods = isOreDict ? [...this.slice(this.field(pointer, 5))] : [pointer];
      const probability = io[index + 4] / PROBABILITY_SCALE;
      const target = kindCode >= 3 ? outputs : amount > 0 ? inputs : catalysts;
      // Капсула с жидкостью — это жидкость плюс пустая капсула (как в решателе ShadowTheAge).
      const container = !isOreDict && kind === "item" ? this.field(pointer, CONTAINER_FIELD) : -1;
      if (container !== -1 && amount > 0) {
        const fluid = this.elements[container];
        const litres = this.elements[container + 1];
        const empty = this.elements[container + 2];
        target.push({ goods: [fluid], kind: "fluid", amount: amount * litres, probability, isOreDict: false });
        if (empty !== -1) target.push({ goods: [empty], kind: "item", amount, probability, isOreDict: false });
        continue;
      }
      target.push({ goods, kind, amount, probability, isOreDict });
    }
    const heat = gt === -1 ? 0 : this.metadata(this.field(gt, 4), "coil_heat");
    return {
      ptr,
      type: type.name,
      isGt: gt !== -1,
      voltage: gt === -1 ? 0 : this.field(gt, 0),
      ticks: gt === -1 ? 0 : this.field(gt, 1),
      amperage: gt === -1 ? 1 : this.field(gt, 2),
      tier: gt === -1 ? 0 : this.field(gt, 3),
      heat,
      inputs,
      outputs,
      catalysts,
      singleblocks: type.singleblocks,
      multiblocks: type.multiblocks,
    };
  }

  /** Значение из метаданных рецепта GregTech по ключу (без учёта регистра), иначе 0. */
  private metadata(listPointer: number, key: string): number {
    if (listPointer === -1) return 0;
    for (const entry of this.slice(listPointer)) {
      if (this.string(this.field(entry, 0)).toLowerCase().includes(key)) return this.view.getFloat64(4 * (entry + 1), true);
    }
    return 0;
  }
}
