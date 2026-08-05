import Link from 'next/link'
import { buscarConfiguracao, linkWhatsappDireto } from '@/lib/config'
import { jsonLdCorretor } from '@/lib/seo'

/**
 * Rodapé — carrega as obrigações legais da seção 10 do PROJETO.md:
 * CRECI visível, aviso de preços sujeitos a alteração e link para a política.
 * Também é onde vive o JSON-LD `RealEstateAgent` (LocalBusiness), presente em todo o site.
 */
export async function SiteFooter() {
  const config = await buscarConfiguracao()

  const redes = [
    { url: config.instagramUrl, rotulo: 'Instagram' },
    { url: config.youtubeUrl, rotulo: 'YouTube' },
    { url: config.facebookUrl, rotulo: 'Facebook' },
    { url: config.tiktokUrl, rotulo: 'TikTok' },
  ].filter((rede): rede is { url: string; rotulo: string } => Boolean(rede.url))

  return (
    <footer className="relative mt-12 overflow-hidden bg-carvao-950 text-white/70">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCorretor(config)) }}
      />

      <div className="textura-escura absolute inset-0 opacity-60" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-display text-base font-extrabold text-white">{config.nomeExibicao}</p>
          <p className="mt-1 text-xs font-semibold tracking-[0.18em] text-ouro-400 uppercase">
            CRECI {config.creci}
          </p>
          {config.sobreTexto && (
            <p className="mt-4 text-sm leading-relaxed text-white/55">{config.sobreTexto}</p>
          )}
        </div>

        <div>
          <h2 className="text-xs font-semibold tracking-[0.18em] text-white/40 uppercase">
            Atendimento
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {config.endereco && <li>{config.endereco}</li>}
            {config.horarioAtendimento && <li>{config.horarioAtendimento}</li>}
            {config.email && (
              <li>
                <a className="transition-colors hover:text-ouro-300" href={`mailto:${config.email}`}>
                  {config.email}
                </a>
              </li>
            )}
            <li>
              <a
                href={linkWhatsappDireto(config)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-zap-500 transition-colors hover:text-zap-600"
              >
                Falar no WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold tracking-[0.18em] text-white/40 uppercase">
            Navegar
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>
              <Link className="transition-colors hover:text-ouro-300" href="/imoveis">
                Imóveis
              </Link>
            </li>
            <li>
              <Link className="transition-colors hover:text-ouro-300" href="/loteamentos">
                Loteamentos
              </Link>
            </li>
            <li>
              <Link className="transition-colors hover:text-ouro-300" href="/simulador">
                Simulador de financiamento
              </Link>
            </li>
            <li>
              <Link className="transition-colors hover:text-ouro-300" href="/sobre">
                Sobre o Hélio
              </Link>
            </li>
          </ul>
        </div>

        {redes.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold tracking-[0.18em] text-white/40 uppercase">
              Redes
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {redes.map((rede) => (
                <li key={rede.rotulo}>
                  <a
                    className="transition-colors hover:text-ouro-300"
                    href={rede.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {rede.rotulo}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="relative border-t border-white/10 px-4 py-6">
        <div className="mx-auto max-w-6xl space-y-2 text-xs leading-relaxed text-white/40">
          <p>
            Preços, condições de pagamento e disponibilidade sujeitos a alteração sem aviso
            prévio. As simulações apresentadas são estimativas e não constituem proposta de
            crédito.
          </p>
          <p>
            © {new Date().getFullYear()} {config.nomeExibicao} · CRECI {config.creci}
          </p>
        </div>
      </div>
    </footer>
  )
}
