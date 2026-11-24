'use client';
import { useEffect } from 'react';
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
export default function RedirectHome() {
  useEffect(() => { window.location.replace(BASE + '/' + window.location.hash); }, []);
  return <p style={{ color: '#fff', padding: 24 }}>Redirecting to <a href={BASE + '/'} style={{ color: '#fff' }}>YesYes</a>…</p>;
}
