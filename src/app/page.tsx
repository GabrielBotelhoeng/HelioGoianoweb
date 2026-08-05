import Link from 'next/link'
import { buscarImoveis } from '@/lib/imoveis'
import { listarLoteamentos, resumoInfraestrutura } from '@/lib/loteamentos'
import { buscarConfiguracao, linkWhatsappDireto } from '@/lib/config'
import { toPlain } from '@/lib/serialize'
import { formatarBRL } from '@/lib/formato'
import { CardImovel } from '@/components/card-imovel'
import { BotaoWhatsapp } from '@/components/botao-whatsapp'
import { TextoRevelado } from '@/components/animacao/texto-revelado'
import { NumeroAnimado } from '@/components/animacao/numero-animado'
import { CartaoHolofote } from '@/components/animacao/cartao-holofote'
import {
  CascataAoRolar,
  EntraAoRolar,
  ItemCascata,
} from '@/components/animacao/entra-ao-rolar'

/**
 * Home — PROJETO.md seção 5: destaques, loteamentos e CTA do simulador.
 *
 * O site é conversor, não vitrine (seção 1). A primeira dobra vende a simulação
 * gratuita — o gancho que ele já usa em quase todo post — e não uma barra de busca de
 * portal imobiliário.
 *
 * Ritmo visual: escuro para narrativa, claro para decisão. O visitante lê a promessa
 * sobre fundo escuro e decide preço/entrada/parcela sobre fundo claro.
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

  // A consulta já ordena por `destaque` primeiro, então o topo da lista é o destaque.
  const destaque = imoveis[0] ?? null

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-carvao-950">
        <div className="textura-escura absolute inset-0" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:py-24 lg:grid-cols-[1.15fr_minmax(0,360px)] lg:items-center">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] text-ouro-400 uppercase">
              <span className="h-px w-8 bg-ouro-500" aria-hidden="true" />
              Alexânia-GO · CRECI {config.creci}
            </p>

            <h1 className="mt-6 font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-white sm:text-5xl">
              <TextoRevelado
                texto="Descubra hoje quanto você"
                destaque="já consegue financiar"
                classNameDestaque="bg-gradient-to-r from-ouro-300 to-ouro-500 bg-clip-text text-transparent"
              />
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              Simulação gratuita em menos de um minuto. Você informa a renda e a entrada, e o
              site mostra a parcela e quais imóveis cabem no seu bolso.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/simulador"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-carvao-950 shadow-2xl shadow-black/40 transition-transform hover:scale-[1.02]"
              >
                Fazer minha simulação grátis
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <BotaoWhatsapp href={linkWhatsappDireto(config)} tamanho="grande">
                Falar com o Hélio
              </BotaoWhatsapp>
            </div>

            <p className="mt-5 text-xs text-white/45">
              Estimativa, não é proposta de crédito e não substitui a análise do banco.
            </p>

            {/* Prova de solidez: 14 anos, escritório físico, atuação local. */}
            <dl className="mt-14 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6 border-t border-white/10 pt-8 sm:grid-cols-3">
              <Numero rotulo="anos de mercado">
                <NumeroAnimado valor={14} sufixo="+" />
              </Numero>
              <Numero rotulo="CRECI ativo">{config.creci}</Numero>
              <Numero rotulo="escritório em Alexânia">Av. Brasília</Numero>
            </dl>
          </div>

          {/*
            Vitrine do hero: um imóvel REAL da carteira, com preço real, não um mockup
            decorativo. Preenche a composição e ainda é um caminho a mais para a página do
            imóvel. Escondida no mobile — lá o que importa é o CTA aparecer sem rolagem.
          */}
          {destaque && (
            <CartaoHolofote className="hidden rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-sm transition-colors hover:border-ouro-500/40 lg:block">
              <Link href={`/imoveis/${destaque.slug}`} className="block p-6">
                <span className="text-[10px] font-semibold tracking-[0.22em] text-ouro-400 uppercase">
                  Em destaque
                </span>

                {/* Selo de cartório: o código sempre em mono, aqui, no card e no WhatsApp. */}
                <p className="mt-4 font-mono text-xs tracking-widest text-white/45">
                  {destaque.codigo}
                </p>
                <h2 className="mt-1 font-display text-xl leading-snug font-semibold text-white">
                  {destaque.titulo}
                </h2>

                <p className="mt-4 font-display text-4xl leading-none font-extrabold tracking-tight text-white">
                  {destaque.precoSobConsulta ? 'Sob consulta' : formatarBRL(destaque.preco)}
                </p>

                {destaque.entradaMinima && (
                  <p className="mt-2 text-sm font-semibold text-ouro-300">
                    Entrada a partir de {formatarBRL(destaque.entradaMinima)}
                  </p>
                )}

                <p className="mt-6 flex items-center gap-2 text-sm font-medium text-white/70">
                  Ver este imóvel
                  <span
                    aria-hidden="true"
                    className="text-ouro-400 transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </p>
              </Link>
            </CartaoHolofote>
          )}
        </div>
      </section>

      {/* ---------- AS TRÊS PERGUNTAS DOS COMENTÁRIOS ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <CascataAoRolar className="grid gap-4 sm:grid-cols-3">
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
        </CascataAoRolar>
      </section>

      {/* ---------- IMÓVEIS: superfície clara, é onde se decide ---------- */}
      {imoveis.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-oferta-600 uppercase">
                Carteira atual
              </p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-stone-900">
                Imóveis disponíveis
              </h2>
            </div>
            <Link
              href="/imoveis"
              className="shrink-0 text-sm font-semibold text-marca-700 hover:underline"
            >
              Ver todos ({destaques.total}) →
            </Link>
          </div>

          <CascataAoRolar className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {imoveis.map((imovel) => (
              <ItemCascata key={imovel.id} className="h-full">
                <CardImovel imovel={imovel} />
              </ItemCascata>
            ))}
          </CascataAoRolar>
        </section>
      )}

      {/* ---------- LOTEAMENTOS: volta ao escuro, é narrativa ---------- */}
      {listaLoteamentos.length > 0 && (
        <section className="relative overflow-hidden bg-carvao-900">
          <div className="textura-escura absolute inset-0 opacity-70" aria-hidden="true" />

          <div className="relative mx-auto max-w-6xl px-4 py-16">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-ouro-400 uppercase">
              Terreno próprio
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white">
              Loteamentos em Alexânia
            </h2>
            <p className="mt-2 max-w-xl text-white/60">
              Entrada facilitada e parcelamento direto, com infraestrutura entregue.
            </p>

            <CascataAoRolar className="mt-8 grid gap-5 sm:grid-cols-2">
              {listaLoteamentos.map((loteamento) => {
                const infra = resumoInfraestrutura(loteamento)

                return (
                  <Link
                    key={loteamento.id}
                    href={`/loteamentos/${loteamento.slug}`}
                    className="group block rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-ouro-500/40 hover:bg-white/[0.07]"
                  >
                    <h3 className="font-display text-xl font-semibold text-white">
                      {loteamento.nome}
                    </h3>
                    <p className="mt-1 text-sm text-white/50">
                      {loteamento.bairro ? `${loteamento.bairro}, ` : ''}
                      {loteamento.cidade} - {loteamento.uf}
                    </p>

                    {infra && (
                      <p className="mt-4 text-sm font-medium text-marca-300">{infra}</p>
                    )}

                    {(loteamento.entradaMinima || loteamento.parcelaApartirDe) && (
                      <p className="mt-2 text-sm font-semibold text-ouro-300">
                        {loteamento.entradaMinima &&
                          `Entrada a partir de ${formatarBRL(loteamento.entradaMinima)}`}
                        {loteamento.entradaMinima && loteamento.parcelaApartirDe && ' · '}
                        {loteamento.parcelaApartirDe &&
                          `Parcelas de ${formatarBRL(loteamento.parcelaApartirDe)}`}
                      </p>
                    )}

                    <p className="mt-5 flex items-center gap-2 text-sm text-white/60">
                      {loteamento._count.imoveis > 0
                        ? `${loteamento._count.imoveis} ${loteamento._count.imoveis === 1 ? 'imóvel disponível' : 'imóveis disponíveis'}`
                        : 'Consulte a disponibilidade'}
                      <span
                        aria-hidden="true"
                        className="text-ouro-400 transition-transform group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </p>
                  </Link>
                )
              })}
            </CascataAoRolar>
          </div>
        </section>
      )}

      {/* ---------- CTA FINAL ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <EntraAoRolar className="relative overflow-hidden rounded-3xl bg-carvao-950 p-8 text-center sm:p-14">
          <div className="textura-escura absolute inset-0" aria-hidden="true" />
          <div className="relative">
            <div className="filete-ouro mx-auto h-px w-24" aria-hidden="true" />
            <h2 className="mt-6 font-display text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ainda dá para sair do aluguel este ano
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/65">
              Faça a simulação e descubra a parcela. Se preferir, me mande uma mensagem que
              eu faço para você, sem compromisso.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/simulador"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-base font-bold text-carvao-950 transition-transform hover:scale-[1.02]"
              >
                Simular financiamento
              </Link>
              <BotaoWhatsapp href={linkWhatsappDireto(config)} tamanho="grande" />
            </div>
          </div>
        </EntraAoRolar>
      </section>
    </>
  )
}

function Numero({ children, rotulo }: { children: React.ReactNode; rotulo: string }) {
  return (
    <div>
      <dt className="sr-only">{rotulo}</dt>
      <dd>
        <span className="block font-display text-2xl font-extrabold text-white">{children}</span>
        <span className="mt-1 block text-xs tracking-wide text-white/45 uppercase">{rotulo}</span>
      </dd>
    </div>
  )
}

function CartaoResposta({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <ItemCascata className="h-full rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <h2 className="font-display text-lg font-semibold text-carvao-900">{titulo}</h2>
      <p className="mt-3 text-sm leading-relaxed text-stone-600">{children}</p>
    </ItemCascata>
  )
}
