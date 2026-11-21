import type { MetadataRoute } from 'next';
import { SITE } from '../lib/seo';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE + '/', alternates: { languages: { en: SITE + '/', ru: SITE + '/ru/' } } },
    { url: SITE + '/ru/', alternates: { languages: { en: SITE + '/', ru: SITE + '/ru/' } } },
  ];
}
