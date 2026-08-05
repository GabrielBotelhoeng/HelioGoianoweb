import Link from 'next/link'
import { buscarConfiguracao, linkWhatsappDireto } from '@/lib/config'

const NAVEGACAO = [
  { href: '/imoveis', rotulo: 'Imóveis' },
  { href: '/loteamentos', rotulo: 'Loteamentos' },
  { href: '/simulador', rotulo: 'Simulador' },
  { href: '/sobre', rotulo: 'Sobre' },
]

/**
 * Header escuro, fixo — a moldura da direção "moderno premium".
 *
 * O CTA de WhatsApp fica visível em qualquer largura: o tráfego vem do Instagram e do
 * WhatsApp (PROJETO.md seção 1), então falar com o Hélio nunca pode exigir rolagem ou
 * abrir um menu. Sem hamburguer — quatro itens cabem em uma faixa rolável, e cada
 * interação a menos é um abandono a menos no 4G.
 */
export async function SiteHeader() {
  const config = await buscarConfiguracao()

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-carvao-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex min-w-0 shrink-0 flex-col leading-tight">
          <span className="truncate font-display text-base font-extrabold tracking-tight text-white sm:text-lg">
            {config.nomeExibicao}
          </span>
          <span className="text-[10px] font-medium tracking-[0.18em] text-ouro-400 uppercase">
            CRECI {config.creci} · Alexânia-GO
          </span>
        </Link>

        <nav aria-label="Principal" className="ml-auto hidden items-center gap-1 md:flex">
          {NAVEGACAO.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
            >
              {item.rotulo}
            </Link>
          ))}
        </nav>

        <a
          href={linkWhatsappDireto(config)}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto shrink-0 rounded-full bg-zap-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-zap-500/20 transition-colors hover:bg-zap-600 md:ml-0"
        >
          WhatsApp
        </a>
      </div>

      {/* Navegação do mobile: rolagem horizontal em vez de menu escondido. */}
      <nav
        aria-label="Principal (mobile)"
        className="flex gap-1 overflow-x-auto border-t border-white/10 px-4 py-2 md:hidden [scrollbar-width:none]"
      >
        {NAVEGACAO.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-white/75"
          >
            {item.rotulo}
          </Link>
        ))}
      </nav>
    </header>
  )
}
