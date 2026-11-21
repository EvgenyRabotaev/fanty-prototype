import type { MetadataRoute } from 'next';
import { SITE } from '../lib/seo';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE + '/', alternates: { languages: { ru: SITE + '/', en: SITE + '/en/' } } },
    { url: SITE + '/en/', alternates: { languages: { ru: SITE + '/', en: SITE + '/en/' } } },
  ];
}
