import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { I18nManager, Platform } from "react-native";
import { reloadAppAsync } from "expo";
import { type Language, type Translations, translations } from "@/lib/i18n";

const LANG_KEY = "umove_language";
const DEFAULT_LANG: Language = "ar";

type LanguageContextValue = {
  language: Language;
  t: Translations;
  isRTL: boolean;
  setLanguage: (lang: Language) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Language>(DEFAULT_LANG);

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((stored) => {
      const lang = (stored as Language) || DEFAULT_LANG;
      setLang(lang);
      const shouldRTL = lang === "ar";
      if (Platform.OS !== "web" && I18nManager.isRTL !== shouldRTL) {
        I18nManager.allowRTL(shouldRTL);
        I18nManager.forceRTL(shouldRTL);
      }
    });
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    await AsyncStorage.setItem(LANG_KEY, lang);
    setLang(lang);
    const shouldRTL = lang === "ar";
    if (Platform.OS !== "web") {
      I18nManager.allowRTL(shouldRTL);
      I18nManager.forceRTL(shouldRTL);
      await reloadAppAsync();
    }
  }, []);

  const isRTL = language === "ar";

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      t: translations[language],
      isRTL,
      setLanguage,
    }),
    [language, isRTL, setLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
