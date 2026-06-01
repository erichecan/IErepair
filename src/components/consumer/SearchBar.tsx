"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n/useLang";
import { useConsumerT } from "@/lib/i18n/consumer";

interface SearchBarProps {
  initialQ?: string;
  initialEircode?: string;
  compact?: boolean;
}

export default function SearchBar({ initialQ = "", initialEircode = "", compact = false }: SearchBarProps) {
  const [q, setQ] = useState(initialQ);
  const [eircode, setEircode] = useState(initialEircode);
  const router = useRouter();
  const [lang] = useLang("en");
  const t = useConsumerT(lang);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (eircode) params.set("eircode", eircode);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <>
      <form onSubmit={handleSubmit} style={compact ? styles.formCompact : styles.form}>
        <input
          type="text"
          placeholder={t.searchKeywordPlaceholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={compact ? styles.inputCompact : styles.input}
        />
        <input
          type="text"
          placeholder={t.searchEircodePlaceholder}
          value={eircode}
          onChange={(e) => setEircode(e.target.value)}
          style={compact ? styles.inputCompact : styles.input}
        />
        <button type="submit" style={compact ? styles.btnCompact : styles.btn}>
          {t.searchBtn}
        </button>
      </form>
      <style jsx>{`
        input::placeholder { color: #aaa; }
        input:focus { outline: 2px solid #146345; }
      `}</style>
    </>
  );
}

const styles = {
  form: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap" as const,
  },
  formCompact: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
  },
  input: {
    flex: 1,
    minWidth: 180,
    padding: "14px 18px",
    borderRadius: 40,
    border: "1.5px solid #e0e0e0",
    fontSize: 15,
    fontFamily: "inherit",
    background: "#fff",
  },
  inputCompact: {
    flex: 1,
    minWidth: 140,
    padding: "10px 14px",
    borderRadius: 40,
    border: "1.5px solid #e0e0e0",
    fontSize: 14,
    fontFamily: "inherit",
    background: "#fff",
  },
  btn: {
    padding: "14px 32px",
    borderRadius: 40,
    background: "#1d1d1f",
    color: "#17db66",
    border: "none",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap" as const,
  },
  btnCompact: {
    padding: "10px 22px",
    borderRadius: 40,
    background: "#1d1d1f",
    color: "#17db66",
    border: "none",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap" as const,
  },
};
