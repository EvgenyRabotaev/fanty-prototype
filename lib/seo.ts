import type { Metadata, Viewport } from 'next';
export const SITE = 'https://yesyesgame.app';
const copy = {
  ru: {
    title: 'YesYes — скажите «да» друг другу. Игра для пар 18+',
    description: 'YesYes — игра для пар 18+: тайный опрос на двух телефонах, в колоду попадает только то, на что вы оба сказали «да». Карточки-фанты — нежно, чувственно, без пошлости.',
    og: 'Скажите «да» друг другу. Тайный опрос желаний, колода из совпадений, карточки-фанты для пар.',
    locale: 'ru_RU', path: '/',
  },
  en: {
    title: 'YesYes — say yes to each other. A couples game 18+',
    description: 'YesYes is a game for couples 18+: a secret survey on two phones; only what you both said "yes" to goes into the deck. Dare-style cards — gentle, sensual, never crude.',
    og: 'Say yes to each other. A secret desire survey, a deck made of your matches, dare cards for couples.',
    locale: 'en_US', path: '/en/',
  },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#0d0610' };
export function metaFor(lang: 'ru' | 'en'): Metadata {
  const c = copy[lang];
  return {
    metadataBase: new URL(SITE + '/'),
    title: c.title,
    description: c.description,
    manifest: '/manifest.webmanifest',
    icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
    other: { rating: 'adult' },
    alternates: { canonical: SITE + c.path, languages: { ru: SITE + '/', en: SITE + '/en/', 'x-default': SITE + '/' } },
    openGraph: { type: 'website', title: c.title, siteName: 'YesYes', description: c.og, locale: c.locale,
      alternateLocale: lang === 'ru' ? 'en_US' : 'ru_RU', url: SITE + c.path, images: [SITE + '/favicon.svg'] },
  };
}
