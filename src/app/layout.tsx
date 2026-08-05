import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { siteUrl } from '@/lib/seo'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Hélio Goiano Corretor — Imóveis em Alexânia-GO',
    // As páginas internas preenchem só a parte específica.
    template: '%s | Hélio Goiano Corretor',
  },
  description:
    'Lotes, casas e imóveis comerciais em Alexânia-GO com entrada facilitada, ' +
    'financiamento e simulação gratuita. CRECI 11643.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Hélio Goiano Corretor',
  },
  // O site é conversor de tráfego de Instagram e WhatsApp, mas as páginas de imóvel
  // precisam indexar: SEO é o ganho de médio prazo (PROJETO.md seção 1).
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[#faf9f7] font-sans text-stone-900">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
