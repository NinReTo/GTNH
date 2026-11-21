import { NextResponse, type NextRequest } from "next/server";
import { LANGS, type Lang } from "@/lib/lang";

/**
 * Адрес без языка («/», «/machines/x») ведёт на версию сайта по языку браузера: русский в Accept-Language раньше
 * английского — /ru, иначе /en. Файлы (текстуры, выгрузка калькулятора) и служебные пути Next не трогаем.
 */
function preferred(header: string | null): Lang {
  const tags = (header ?? "")
    .split(",")
    .map((part) => {
      const [tag, quality] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), quality: quality === undefined ? 1 : Number(quality) };
    })
    .sort((a, b) => b.quality - a.quality);
  const first = tags.find(({ tag }) => LANGS.some((lang) => tag === lang || tag.startsWith(`${lang}-`)));
  return first?.tag.startsWith("ru") ? "ru" : "en";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (LANGS.some((lang) => pathname === `/${lang}` || pathname.startsWith(`/${lang}/`))) return;
  const url = request.nextUrl.clone();
  url.pathname = `/${preferred(request.headers.get("accept-language"))}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Всё, кроме служебного _next и файлов с расширением (картинки, текстуры, data.bin).
  matcher: ["/((?!_next|.*\\.[a-zA-Z0-9]+$).*)"],
};
