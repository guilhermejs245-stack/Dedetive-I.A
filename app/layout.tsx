import type { Metadata } from 'next';
import './globals.css';
import { plusJakarta } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'Detetive de Problemas IA',
  description:
    'Descubra imediatamente o que está ocasionando seu problema cotidiano e exatamente o que mudar para resolver.',
  openGraph: {
    title: 'Detetive de Problemas IA',
    description:
      'Descubra imediatamente o que está ocasionando seu problema cotidiano e exatamente o que mudar para resolver.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Detetive de Problemas IA',
    description:
      'Descubra imediatamente o que está ocasionando seu problema cotidiano e exatamente o que mudar para resolver.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${plusJakarta.className} min-h-screen bg-[#05070B] text-[#E0F2FE] antialiased selection:bg-sky-500/30 selection:text-sky-100`}
      >
        {children}
      </body>
    </html>
  );
}
