import markup from './markup';
// @ts-ignore
import { T } from './i18n';

const en: Record<string, string> = (T as any).en;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** Server-side: render the shared markup in the requested language (text of [data-i], placeholders of [data-ph]). */
export function localizedMarkup(lang: 'ru' | 'en'): string {
  if (lang === 'ru') return markup;
  return markup
    .replace(/(<[a-z0-9]+\b[^>]*\bdata-i="([^"]+)"[^>]*>)([^<]*)/g, (m, open, key, text) =>
      en[key] ? open + esc(en[key]) : m)
    .replace(/placeholder="[^"]*"([^>]*data-ph="([^"]+)")/g, (m, rest, key) =>
      en[key] ? `placeholder="${en[key].replace(/"/g, '&quot;')}"${rest}` : m)
    .replace(/(<span id="brand2">)[^<]*/, '$1YesYes')
    .replace(/RU \/ EN(?=<\/button>)/, 'EN / RU');
}
