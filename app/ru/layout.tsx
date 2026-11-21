import '../globals.css';
import { metaFor, viewport as vp } from '../../lib/seo';
export const metadata = metaFor('ru');
export const viewport = vp;
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="ru"><body>{children}</body></html>);
}
