export type Language = 'pt-BR' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'zh' | 'ja' | 'ko' | 'hi';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

const LANG_KEY = 'calorie_app_language';

export function getSavedLanguage(): Language | null {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved && LANGUAGES.some(l => l.code === saved)) {
    return saved as Language;
  }
  return null;
}

export function saveLanguage(lang: Language) {
  localStorage.setItem(LANG_KEY, lang);
}

export function detectDeviceLanguage(): Language {
  const browserLang = navigator.language || (navigator as any).userLanguage || 'en';
  const lower = browserLang.toLowerCase();

  if (lower.startsWith('pt')) return 'pt-BR';
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('fr')) return 'fr';
  if (lower.startsWith('de')) return 'de';
  if (lower.startsWith('it')) return 'it';
  if (lower.startsWith('ru')) return 'ru';
  if (lower.startsWith('zh')) return 'zh';
  if (lower.startsWith('ja')) return 'ja';
  if (lower.startsWith('ko')) return 'ko';
  if (lower.startsWith('ar')) return 'ar';
  if (lower.startsWith('hi')) return 'hi';
  return 'en';
}

// Import all translation files
import translations from '@/i18n';

export { translations };

export function t(key: string, lang: Language, params?: Record<string, string | number>): string {
  const langTranslations = translations[lang];
  const fallback = translations['en'];
  let text = langTranslations?.[key] || fallback?.[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return text;
}
