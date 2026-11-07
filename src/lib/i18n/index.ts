import { useSyncExternalStore } from 'react';
import messages from './messages.json';
export type Language = 'uz' | 'ru' | 'en';
const valid = (value: unknown): value is Language => ['uz','ru','en'].includes(value as string);
function initial(): Language { try { const saved = localStorage.getItem('techhome.language'); return valid(saved) ? saved : 'uz'; } catch { return 'uz'; } }
let language: Language = initial();
const listeners = new Set<() => void>();
export function setLanguage(next: Language) {
  if (!valid(next)) return;
  language = next;
  try { localStorage.setItem('techhome.language', next); } catch { /* Language remains usable without storage. */ }
  document.documentElement.lang = next;
  listeners.forEach(listener => listener());
}
export const getLanguage = () => language;
export function translate(key: string, params: Record<string, string | number> = {}, lang = language): string {
  const value = (messages as Record<string, Record<Language, string>>)[key]?.[lang] ?? key;
  return value.replace(/\{\{(\w+)\}\}/g, (_, token: string) => String(params[token] ?? ''));
}
export const localeFor = (lang: Language) => ({ uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' })[lang];
export function errorMessage(error: unknown): string {
  const value = error as { response?: { data?: { code?: unknown } }; code?: unknown; message?: unknown };
  const code = value?.response?.data?.code ?? value?.code;
  if (typeof code === 'string' && Object.hasOwn(messages, `error.${code}`)) return translate(`error.${code}`);
  // Local UI validation may use a translation key. Raw transport/DB messages are never shown.
  if (typeof value?.message === 'string' && Object.hasOwn(messages, value.message)) return translate(value.message);
  return translate('error.REQUEST_FAILED');
}
export function useI18n() {
  const lang = useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, getLanguage, () => 'uz' as Language);
  return { language: lang, setLanguage, t: (key: string, params?: Record<string, string | number>) => translate(key, params, lang),
    date: (value: string) => new Intl.DateTimeFormat(localeFor(lang), { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value)),
    money: (value: number) => new Intl.NumberFormat(localeFor(lang), { style: 'currency', currency: 'USD' }).format(value) };
}
if (typeof document !== 'undefined') document.documentElement.lang = language;
