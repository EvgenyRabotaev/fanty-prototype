'use client';
import { useEffect } from 'react';
// @ts-ignore
import { initApp } from '../lib/legacy-app';
import deck from '../data/deck.json';
import modes from '../data/modes.json';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function LegacyApp({ lang }: { lang: 'ru' | 'en' }) {
  useEffect(() => {
    initApp({ lang, deck, modes, base: BASE });
  }, [lang]);
  return null;
}
