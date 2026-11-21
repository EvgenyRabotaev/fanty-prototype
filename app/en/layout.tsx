import '../globals.css';
import { SITE } from '../../lib/seo';
export const metadata = {
  title: 'YesYes — say yes to each other',
  robots: { index: false, follow: true },
  alternates: { canonical: SITE + '/' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
