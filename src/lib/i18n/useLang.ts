"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export type Lang = "en" | "zh";

export function useLang(defaultLang: Lang = "en"): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof document === "undefined") return defaultLang;
    const match = document.cookie.match(/(?:^|;)\s*lang=([^;]*)/);
    if (!match) return defaultLang;
    const v = match[1];
    return v === "zh" ? "zh" : v === "en" ? "en" : defaultLang;
  });
  const router = useRouter();

  const setLang = useCallback(
    (l: Lang) => {
      document.cookie = `lang=${l};path=/;max-age=31536000`;
      setLangState(l);
      router.refresh();
    },
    [router]
  );

  return [lang, setLang];
}
