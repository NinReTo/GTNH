"use client";

import { useParams } from "next/navigation";
import { isLang, type Lang } from "./lang";

/** Язык страницы для компонентов в браузере — из адреса (/ru/…, /en/…). */
export function useLang(): Lang {
  const { lang } = useParams<{ lang?: string }>();
  return lang && isLang(lang) ? lang : "ru";
}
