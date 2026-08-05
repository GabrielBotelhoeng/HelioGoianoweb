import type { Metadata } from 'next'
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { siteUrl } from '@/lib/seo'

/**
 * Tipografia da direção "Cerrado Noir".
 *
 * Geist saiu de cena: é a fonte padrão do template do Next e carrega exatamente a
 * neutralidade que faz um site parecer gerado. As três abaixo têm função distinta e
 * nenhuma é escolha default.
 */

/** Display: grotesca variável de contraste alto. Carrega preço e manchete. */
const bricolage = Bricolage_Grotesque({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
})

/** Corpo: humanista discreta, legível em parágrafo longo sem competir com a display. */
const instrument = Instrument_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})

/**
 * Mono: só para o código do imóvel (HG-0001). É a âncora de identidade — o código
 * aparece no card, na página e na mensagem de WhatsApp, sempre com a mesma cara de
 * selo de cartório.
 */
const jetbrains = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['500'],
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
    <html
      lang="pt-BR"
      className={`${instrument.variable} ${bricolage.variable} ${jetbrains.variable} h-full antialiased`}
    >
      {/*
        Só o esqueleto: fontes, tokens e metadados. Header e rodapé vivem em
        `(site)/layout.tsx`, senão apareceriam em volta do painel do admin também.
      */}
      <body className="flex min-h-full flex-col bg-[#faf9f7] font-sans text-stone-900">
        {children}
      </body>
    </html>
  )
}
