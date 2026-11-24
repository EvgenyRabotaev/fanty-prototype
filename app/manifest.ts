import type { MetadataRoute } from 'next';
import { SITE } from '../lib/seo';
export const dynamic = 'force-static';
export default function manifest(): MetadataRoute.Manifest {
  return { name: 'YesYes — a couples game 18+', short_name: 'YesYes', lang: 'en', start_url: SITE + '/', scope: SITE + '/', display: 'standalone',
    background_color: '#0d0610', theme_color: '#0d0610',
    icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }] };
}
