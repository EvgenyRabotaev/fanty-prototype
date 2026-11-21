import { localizedMarkup } from '../lib/localize';
import LegacyApp from './LegacyApp';

export default function Home({ lang }: { lang: 'ru' | 'en' }) {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: localizedMarkup(lang) }} />
      <LegacyApp lang={lang} />
    </>
  );
}
