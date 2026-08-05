import Link from 'next/link'
import { buscarConfiguracao, linkWhatsappDireto } from '@/lib/config'

const NAVEGACAO = [
  { href: '/imoveis', rotulo: 'Imóveis' },
  { href: '/loteamentos', rotulo: 'Loteamentos' },
  { href: '/simulador', rotulo: 'Simulador' },
  { href: '/sobre', rotulo: 'Sobre' },
]

/**
 * Header fixo. O CTA de WhatsApp fica visível em qualquer largura — o tráfego vem do
 * Instagram e do WhatsApp (PROJETO.md seção 1), então falar com o Hélio nunca pode
 * exigir rolagem ou abrir um menu.
 *
 * Sem menu hamburguer: quatro itens cabem em uma faixa rolável horizontal, e cada
 * interação a menos é um abandono a menos no 4G da cidade.
 */
export async function SiteHeader() {
  const config = await buscarConfiguracao()

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex min-w-0 shrink-0 flex-col leading-tight">
          <span className="truncate text-base font-bold text-marca-800 sm:text-lg">
            {config.nomeExibicao}
          </span>
          <span className="text-[11px] font-medium tracking-wide text-stone-500 uppercase">
            CRECI {config.creci} · Alexânia-GO
          </span>
        </Link>

        <nav
          aria-label="Principal"
          className="ml-auto hidden items-center gap-1 md:flex"
        >
          {NAVEGACAO.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-marca-50 hover:text-marca-800"
            >
              {item.rotulo}
            </Link>
          ))}
        </nav>

        <a
          href={linkWhatsappDireto(config)}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto shrink-0 rounded-full bg-zap-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zap-600 md:ml-0"
        >
          WhatsApp
        </a>
      </div>

      {/* Faixa de navegação do mobile: rolagem horizontal em vez de menu escondido. */}
      <nav
        aria-label="Principal (mobile)"
        className="flex gap-1 overflow-x-auto border-t border-stone-100 px-4 py-2 md:hidden [scrollbar-width:none]"
      >
        {NAVEGACAO.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-stone-700"
          >
            {item.rotulo}
          </Link>
        ))}
      </nav>
    </header>
  )
}
