"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Language } from "@/types";
import { getMessages, type Messages } from "@/lib/i18n/messages";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Messages;
  bilingual: boolean;
  setBilingual: (v: boolean) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("tr");
  const [bilingual, setBilingual] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("traderpro-lang") as Language | null;
    if (saved === "tr" || saved === "en") setLangState(saved);
    const bi = localStorage.getItem("traderpro-bilingual");
    if (bi === "true") setBilingual(true);
  }, []);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem("traderpro-lang", l);
  }, []);

  const setBilingualPersist = useCallback((v: boolean) => {
    setBilingual(v);
    localStorage.setItem("traderpro-bilingual", String(v));
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t: getMessages(lang),
        bilingual,
        setBilingual: setBilingualPersist,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export function useSummary(en: string, tr: string) {
  const { lang, bilingual } = useLanguage();
  if (bilingual) return `${tr} / ${en}`;
  return lang === "tr" ? tr : en;
}
