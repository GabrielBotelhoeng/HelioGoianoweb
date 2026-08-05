import Link from 'next/link'
import { buscarImoveis } from '@/lib/imoveis'
import { listarLoteamentos, resumoInfraestrutura } from '@/lib/loteamentos'
import { buscarConfiguracao, linkWhatsappDireto } from '@/lib/config'
import { toPlain } from '@/lib/serialize'
import { formatarBRL } from '@/lib/formato'
import { CardImovel } from '@/components/card-imovel'
import { BotaoWhatsapp } from '@/components/botao-whatsapp'

/**
 * Home — PROJETO.md seção 5: destaques, loteamentos e CTA do simulador.
 *
 * O site é conversor, não vitrine (seção 1). Por isso a primeira dobra vende a
 * simulação gratuita — o gancho que ele já usa em quase todo post — e não uma barra de
 * busca de portal imobiliário.
 */
export const revalidate = 3600

export default async function Home() {
  const [destaques, loteamentos, config] = await Promise.all([
    buscarImoveis({ ordem: 'recentes', pagina: 1 }),
    listarLoteamentos(),
    buscarConfiguracao(),
  ])

  const imoveis = toPlain(destaques.itens).slice(0, 6)
  const listaLoteamentos = toPlain(loteamentos)

  return (
    <>
      <section className="bg-gradient-to-br from-marca-800 to-marca-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <p className="text-sm font-semibold tracking-widest text-marca-200 uppercase">
            Alexânia-GO · CRECI {config.creci} · 14 anos de mercado
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl leading-tight font-bold sm:text-5xl">
            Descubra hoje quanto você já consegue financiar
          </h1>
          <p className="mt-4 max-w-xl text-lg text-marca-100">
            Simulação gratuita em menos de um minuto. Você informa a renda e a entrada, e o
            site mostra a parcela e quais imóveis cabem no seu bolso.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/simulador"
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-base font-bold text-marca-900 shadow-lg transition-transform hover:scale-[1.02]"
            >
              Fazer minha simulação grátis
            </Link>
            <BotaoWhatsapp href={linkWhatsappDireto(config)} tamanho="grande">
              Falar com o Hélio
            </BotaoWhatsapp>
          </div>

          <p className="mt-4 text-xs text-marca-200">
            A simulação é uma estimativa e não substitui a análise do banco.
          </p>
        </div>
      </section>

      {/* As três perguntas que se repetem nos comentários dos posts (seção 1). */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          <CartaoResposta titulo="Onde fica?">
            Cada imóvel tem vídeo, referências do bairro e o que tem por perto — escola,
            comércio, fórum.
          </CartaoResposta>
          <CartaoResposta titulo="Qual a entrada?">
            Entrada e parcela aparecem em todos os anúncios, e dá para filtrar por quanto
            você pode dar de entrada.
          </CartaoResposta>
          <CartaoResposta titulo="Como faço para ver?">
            Um toque no WhatsApp já chega com o código do imóvel. Escritório na Av. Brasília,
            em Alexânia.
          </CartaoResposta>
        </div>
      </section>

      {imoveis.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-stone-900">Imóveis disponíveis</h2>
            <Link
              href="/imoveis"
              className="shrink-0 text-sm font-semibold text-marca-700 hover:underline"
            >
              Ver todos ({destaques.total}) →
            </Link>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {imoveis.map((imovel) => (
              <CardImovel key={imovel.id} imovel={imovel} />
            ))}
          </div>
        </section>
      )}

      {listaLoteamentos.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <h2 className="text-2xl font-bold text-stone-900">Loteamentos em Alexânia</h2>
          <p className="mt-1 text-stone-600">
            Entrada facilitada e parcelamento direto, com infraestrutura entregue.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {listaLoteamentos.map((loteamento) => {
              const infra = resumoInfraestrutura(loteamento)

              return (
                <Link
                  key={loteamento.id}
                  href={`/loteamentos/${loteamento.slug}`}
                  className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold text-stone-900">{loteamento.nome}</h3>
                  <p className="mt-0.5 text-sm text-stone-500">
                    {loteamento.bairro ? `${loteamento.bairro}, ` : ''}
                    {loteamento.cidade} - {loteamento.uf}
                  </p>

                  {infra && <p className="mt-3 text-sm font-medium text-marca-700">{infra}</p>}

                  {(loteamento.entradaMinima || loteamento.parcelaApartirDe) && (
                    <p className="mt-2 text-sm font-semibold text-oferta-600">
                      {loteamento.entradaMinima &&
                        `Entrada a partir de ${formatarBRL(loteamento.entradaMinima)}`}
                      {loteamento.entradaMinima && loteamento.parcelaApartirDe && ' · '}
                      {loteamento.parcelaApartirDe &&
                        `Parcelas de ${formatarBRL(loteamento.parcelaApartirDe)}`}
                    </p>
                  )}

                  <p className="mt-3 text-sm text-stone-600">
                    {loteamento._count.imoveis > 0
                      ? `${loteamento._count.imoveis} ${loteamento._count.imoveis === 1 ? 'imóvel disponível' : 'imóveis disponíveis'}`
                      : 'Consulte a disponibilidade'}
                  </p>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-2xl bg-marca-800 p-6 text-center text-white sm:p-10">
          <h2 className="text-xl font-bold sm:text-2xl">Ainda dá para sair do aluguel este ano</h2>
          <p className="mx-auto mt-2 max-w-xl text-marca-100">
            Faça a simulação e descubra a parcela. Se preferir, me mande uma mensagem que eu
            faço para você, sem compromisso.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/simulador"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-4 text-base font-bold text-marca-900"
            >
              Simular financiamento
            </Link>
            <BotaoWhatsapp href={linkWhatsappDireto(config)} tamanho="grande" />
          </div>
        </div>
      </section>
    </>
  )
}

function CartaoResposta({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-marca-800">{titulo}</h2>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">{children}</p>
    </div>
  )
}
