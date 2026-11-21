'use client';
import { useEffect } from 'react';
export default function RedirectHome() {
  useEffect(() => { window.location.replace('/' + window.location.hash); }, []);
  return <p style={{ color: '#fff', padding: 24 }}>Redirecting to <a href="/" style={{ color: '#fff' }}>yesyesgame.app</a>…</p>;
}
