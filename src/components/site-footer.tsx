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
    <footer className="mt-12 border-t border-stone-200 bg-stone-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCorretor(config)) }}
      />

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-base font-bold text-marca-800">{config.nomeExibicao}</p>
          <p className="mt-1 text-sm font-medium text-stone-600">CRECI {config.creci}</p>
          {config.sobreTexto && (
            <p className="mt-3 text-sm leading-relaxed text-stone-600">{config.sobreTexto}</p>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-stone-900">Atendimento</h2>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            {config.endereco && <li>{config.endereco}</li>}
            {config.horarioAtendimento && <li>{config.horarioAtendimento}</li>}
            {config.email && (
              <li>
                <a className="hover:text-marca-700" href={`mailto:${config.email}`}>
                  {config.email}
                </a>
              </li>
            )}
            <li>
              <a
                href={linkWhatsappDireto(config)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-marca-700 hover:underline"
              >
                Falar no WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-stone-900">Navegar</h2>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li>
              <Link className="hover:text-marca-700" href="/imoveis">
                Imóveis
              </Link>
            </li>
            <li>
              <Link className="hover:text-marca-700" href="/loteamentos">
                Loteamentos
              </Link>
            </li>
            <li>
              <Link className="hover:text-marca-700" href="/simulador">
                Simulador de financiamento
              </Link>
            </li>
            <li>
              <Link className="hover:text-marca-700" href="/sobre">
                Sobre o Hélio
              </Link>
            </li>
          </ul>
        </div>

        {redes.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-stone-900">Redes</h2>
            <ul className="mt-3 space-y-2 text-sm text-stone-600">
              {redes.map((rede) => (
                <li key={rede.rotulo}>
                  <a
                    className="hover:text-marca-700"
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

      <div className="border-t border-stone-200 px-4 py-6">
        <div className="mx-auto max-w-6xl space-y-2 text-xs leading-relaxed text-stone-500">
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
