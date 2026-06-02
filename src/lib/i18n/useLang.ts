"use client";
import { useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

export type Lang = "en" | "zh";

// Module-level subscriber list — shared across all useLang instances
let _listeners: (() => void)[] = [];

function _subscribe(fn: () => void) {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((f) => f !== fn);
  };
}

function _notify() {
  _listeners.forEach((fn) => fn());
}

function _readCookie(): Lang | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;)\s*lang=([^;]*)/);
  if (!match) return null;
  const v = match[1];
  return v === "zh" ? "zh" : v === "en" ? "en" : null;
}

export function useLang(defaultLang: Lang = "en"): [Lang, (l: Lang) => void] {
  const router = useRouter();

  const lang = useSyncExternalStore(
    _subscribe,
    () => _readCookie() ?? defaultLang,
    () => defaultLang
  );

  const setLang = useCallback(
    (l: Lang) => {
      document.cookie = `lang=${l};path=/;max-age=31536000`;
      _notify();
      router.refresh();
    },
    [router]
  );

  return [lang, setLang];
}
