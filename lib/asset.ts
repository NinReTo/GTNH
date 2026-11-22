/** Адрес файла из public с учётом подпапки GitHub Pages. */
export function asset(path: string): string {
  return (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + path;
}

export const WORKSHOP_HDR = asset("/hdri/workshop_1k.hdr");
