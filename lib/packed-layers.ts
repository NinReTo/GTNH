/**
 * Схемы огромных построек хранятся сжатыми: у комплекса сборки наночипов
 * 63 × 80 × 63 — триста тысяч знаков, и без сжатия они попали бы в код
 * каждой страницы. Сжатие простое: повтор одного знака пишется числом перед
 * ним («5C» — пять «C»), ряды разделены «|», слои — «/». Цифр, «|» и «/» в
 * схемах мода нет.
 */
export function packLayers(layers: readonly (readonly string[])[]): string {
  return layers.map((rows) => rows.map((row) => row.replace(/(.)\1*/g, (run, symbol: string) => (run.length > 1 ? run.length : "") + symbol)).join("|")).join("/");
}

export function unpackLayers(packed: string): readonly (readonly string[])[] {
  return packed.split("/").map((layer) => layer.split("|").map((row) => row.replace(/(\d+)(.)/g, (_, count: string, symbol: string) => symbol.repeat(Number(count)))));
}
