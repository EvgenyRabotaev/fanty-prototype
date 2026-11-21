import '../globals.css';
import { metaFor, viewport as vp } from '../../lib/seo';
export const metadata = metaFor('en');
export const viewport = vp;
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
