import { ViewTransition } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  buscarImovelPorSlug,
  listarSlugsPublicados,
  type ImovelDetalhado,
} from '@/lib/imoveis'
import { buscarConfiguracao } from '@/lib/config'
import { toPlain } from '@/lib/serialize'
import { formatarBRL } from '@/lib/formato'
import {
  formatarArea,
  resumoCaracteristicas,
  resumoDimensoes,
  resumoLocalizacao,
  rotuloTipo,
  selosDeCondicao,
} from '@/lib/apresentacao'
import { jsonLdBreadcrumb, jsonLdImovel, jsonLdVideo, urlAbsoluta } from '@/lib/seo'
import { VideoHero } from '@/components/video-hero'
import { BotaoWhatsapp } from '@/components/botao-whatsapp'
import { TransicaoPagina } from '@/components/animacao/transicao-pagina'

/**
 * Página do imóvel — o destino de todo link que ele manda no WhatsApp e no direct.
 *
 * Estática com revalidação: precisa ser rápida e indexável (PROJETO.md seção 2).
 * Uma hora de janela é aceitável porque toda escrita no admin vai invalidar o caminho
 * explicitamente quando a fase 4 entrar.
 */
export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await listarSlugsPublicados()
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/imoveis/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const imovel = await buscarImovelPorSlug(slug)

  if (!imovel) return { title: 'Imóvel não encontrado' }

  const titulo = imovel.metaTitle ?? `${imovel.titulo} — ${resumoLocalizacao(imovel)}`
  const descricao =
    imovel.metaDescription ?? imovel.descricao?.slice(0, 160) ?? `${imovel.titulo}. Código ${imovel.codigo}.`

  // A capa é o que decide o clique quando o link circula no WhatsApp (seção 9).
  const capa = imovel.midias.find((midia) => midia.isCapa) ?? imovel.midias[0]

  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: `/imoveis/${imovel.slug}` },
    openGraph: {
      type: 'website',
      title: titulo,
      description: descricao,
      url: urlAbsoluta(`/imoveis/${imovel.slug}`),
      ...(capa && { images: [{ url: capa.url, alt: capa.legenda ?? imovel.titulo }] }),
    },
  }
}

export default async function PaginaImovel({ params }: PageProps<'/imoveis/[slug]'>) {
  const { slug } = await params
  const [registro, config] = await Promise.all([buscarImovelPorSlug(slug), buscarConfiguracao()])

  // Imóvel vendido ou despublicado sai do ar: manter no ar gera lead para o que não existe.
  if (!registro || registro.status !== 'DISPONIVEL' || !registro.publicadoEm) notFound()

  const imovel = toPlain(registro)
  const url = urlAbsoluta(`/imoveis/${imovel.slug}`)

  // O hero é o vídeo (seção 7). Sem `videoPrincipalId` no schema, o destaque manda.
  const video = imovel.videos.find((v) => v.destaque) ?? imovel.videos[0] ?? null
  const fotos = imovel.midias.filter((midia) => midia.tipo === 'FOTO')
  const plantas = imovel.midias.filter((midia) => midia.tipo === 'PLANTA')
  const capa = fotos.find((foto) => foto.isCapa) ?? fotos[0] ?? null

  const dimensoes = resumoDimensoes(imovel)
  const caracteristicas = resumoCaracteristicas(imovel)
  const selos = selosDeCondicao(imovel)

  const marcacaoVideo = video
    ? jsonLdVideo({ ...video, criadoEm: video.criadoEm }, url)
    : null

  return (
    <TransicaoPagina>
    <article className="mx-auto max-w-6xl px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdImovel(imovel)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            jsonLdBreadcrumb([
              { nome: 'Início', caminho: '/' },
              { nome: 'Imóveis', caminho: '/imoveis' },
              { nome: imovel.titulo, caminho: `/imoveis/${imovel.slug}` },
            ]),
          ),
        }}
      />
      {marcacaoVideo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(marcacaoVideo) }}
        />
      )}

      <nav aria-label="Trilha" className="mb-4 text-sm text-stone-500">
        <Link href="/" className="hover:text-marca-700">
          Início
        </Link>
        <span className="mx-1.5">/</span>
        <Link
          href="/imoveis"
          transitionTypes={['nav-back']}
          className="hover:text-marca-700"
        >
          Imóveis
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-stone-700">{rotuloTipo(imovel.tipo)}</span>
      </nav>

      {/* HERO: vídeo vertical à esquerda, dados e CTA à direita. Nunca 16:9. */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr]">
        {/*
          Outro lado do elemento compartilhado: o mesmo `name` usado no card da listagem.
          O navegador liga os dois e interpola — a capa do card cresce e vira este hero.
        */}
        <ViewTransition name={`capa-${imovel.id}`} share="morph">
        <div>
          {video ? (
            <VideoHero
              provedor={video.provedor}
              videoIdExterno={video.videoIdExterno}
              urlThumb={video.urlThumb}
              titulo={video.titulo}
            />
          ) : capa ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-200">
              <Image
                src={capa.url}
                alt={capa.legenda ?? imovel.titulo}
                fill
                sizes="(max-width: 1024px) 100vw, 380px"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="textura-escura flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-3xl bg-carvao-900">
              <span className="text-[10px] font-semibold tracking-[0.22em] text-ouro-400 uppercase">
                {rotuloTipo(imovel.tipo)}
              </span>
              <span className="font-mono text-2xl font-semibold text-white/85">
                {imovel.codigo}
              </span>
              <span className="mt-2 text-xs text-white/40">Fotos e vídeo em breve</span>
            </div>
          )}
        </div>
        </ViewTransition>

        <div>
          <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">
            {rotuloTipo(imovel.tipo)} · {resumoLocalizacao(imovel)} · Código {imovel.codigo}
          </p>
          <h1 className="mt-1 font-display text-3xl leading-tight font-extrabold tracking-tight text-carvao-900 sm:text-4xl">
            {imovel.titulo}
          </h1>

          {(dimensoes || caracteristicas) && (
            <p className="mt-3 text-stone-600">
              {[dimensoes, caracteristicas].filter(Boolean).join(' · ')}
            </p>
          )}

          <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="font-display text-3xl font-extrabold tracking-tight text-carvao-900 sm:text-4xl">
              {imovel.precoSobConsulta ? 'Preço sob consulta' : formatarBRL(imovel.preco)}
            </p>

            {(imovel.entradaMinima || imovel.valorParcela || imovel.parcelasMax) && (
              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                {imovel.entradaMinima && (
                  <Indicador rotulo="Entrada a partir de">
                    {formatarBRL(imovel.entradaMinima)}
                  </Indicador>
                )}
                {imovel.valorParcela && (
                  <Indicador rotulo="Parcela">{formatarBRL(imovel.valorParcela)}</Indicador>
                )}
                {imovel.parcelasMax && (
                  <Indicador rotulo="Parcelamento em até">{imovel.parcelasMax}x</Indicador>
                )}
              </dl>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <BotaoWhatsapp imovelId={imovel.id} tamanho="grande" className="flex-1">
                Tenho interesse
              </BotaoWhatsapp>
              <Link
                href="/simulador"
                className="inline-flex flex-1 items-center justify-center rounded-full border border-marca-700 px-6 py-4 text-base font-semibold text-marca-800 transition-colors hover:bg-marca-50"
              >
                Simular financiamento
              </Link>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-stone-500">
              Atendimento com {config.nomeExibicao} · CRECI {config.creci}. Valores e condições
              sujeitos a alteração sem aviso prévio.
            </p>
          </div>

          {selos.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {selos.map((selo) => (
                <li
                  key={selo}
                  className="rounded-full bg-marca-50 px-3 py-1 text-sm font-medium text-marca-800"
                >
                  {selo}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {imovel.descricao && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-900">Sobre o imóvel</h2>
          <p className="mt-3 max-w-3xl leading-relaxed whitespace-pre-line text-stone-700">
            {imovel.descricao}
          </p>
        </section>
      )}

      {imovel.proximidades.length > 0 && (
        // "Próximo ao Colégio 31 de Março" responde ao "onde?" dos comentários melhor
        // que endereço — ele vende localização por referência (schema, model Proximidade).
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-stone-900">O que tem por perto</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {imovel.proximidades.map((proximidade) => (
              <li
                key={proximidade.id}
                className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700"
              >
                {proximidade.nome}
                {proximidade.distanciaM && (
                  <span className="ml-1.5 text-stone-500">
                    · {proximidade.distanciaM >= 1000
                      ? `${(proximidade.distanciaM / 1000).toLocaleString('pt-BR')} km`
                      : `${proximidade.distanciaM} m`}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {imovel.pontoReferencia && (
            <p className="mt-3 text-stone-700">Referência: {imovel.pontoReferencia}</p>
          )}
        </section>
      )}

      <FichaTecnica imovel={imovel} />

      {fotos.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-stone-900">Fotos</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fotos.map((foto) => (
              <div
                key={foto.id}
                className="relative aspect-[4/3] overflow-hidden rounded-xl bg-stone-200"
              >
                <Image
                  src={foto.url}
                  alt={foto.legenda ?? imovel.titulo}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {plantas.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-stone-900">Planta</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {plantas.map((planta) => (
              <div
                key={planta.id}
                className="relative aspect-[4/3] overflow-hidden rounded-xl bg-white"
              >
                <Image
                  src={planta.url}
                  alt={planta.legenda ?? `Planta — ${imovel.titulo}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {video?.transcricao && (
        // Transcrição visível, não escondida: é conteúdo real, é acessibilidade e é o
        // que torna o reel indexável (PROJETO.md seção 7).
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-stone-900">O que o Hélio fala no vídeo</h2>
          <p className="mt-3 max-w-3xl leading-relaxed whitespace-pre-line text-stone-700">
            {video.transcricao}
          </p>
        </section>
      )}

      {imovel.loteamento && (
        <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">
            Loteamento {imovel.loteamento.nome}
          </h2>
          {imovel.loteamento.descricao && (
            <p className="mt-2 text-stone-700">{imovel.loteamento.descricao}</p>
          )}
          <Link
            href={`/loteamentos/${imovel.loteamento.slug}`}
            className="mt-3 inline-block text-sm font-semibold text-marca-700 hover:underline"
          >
            Ver o loteamento e os lotes disponíveis →
          </Link>
        </section>
      )}

      <section className="mt-12 rounded-2xl bg-marca-800 p-6 text-center text-white sm:p-10">
        <h2 className="text-xl font-bold sm:text-2xl">Quer visitar ou negociar a entrada?</h2>
        <p className="mx-auto mt-2 max-w-lg text-marca-100">
          Me chame no WhatsApp que eu já respondo com as condições e faço sua simulação
          gratuita.
        </p>
        <div className="mt-6 flex justify-center">
          <BotaoWhatsapp imovelId={imovel.id} tamanho="grande">
            Falar sobre o {imovel.codigo}
          </BotaoWhatsapp>
        </div>
      </section>
    </article>
    </TransicaoPagina>
  )
}

function Indicador({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-stone-500 uppercase">{rotulo}</dt>
      <dd className="mt-0.5 text-lg font-semibold text-oferta-600">{children}</dd>
    </div>
  )
}

/** Só entra na ficha o que está preenchido — linha vazia é ruído, não informação. */
function FichaTecnica({ imovel }: { imovel: ImovelDetalhado }) {
  const linhas: { rotulo: string; valor: string }[] = []

  const adicionar = (rotulo: string, valor: string | null | undefined) => {
    if (valor) linhas.push({ rotulo, valor })
  }

  adicionar('Tipo', rotuloTipo(imovel.tipo))
  adicionar('Dimensões', imovel.dimensoesTexto)
  adicionar('Área do terreno', formatarArea(imovel.areaTerrenoM2))
  adicionar('Área construída', formatarArea(imovel.areaConstruidaM2))
  adicionar('Quartos', imovel.quartos ? String(imovel.quartos) : null)
  adicionar('Suítes', imovel.suites ? String(imovel.suites) : null)
  adicionar('Banheiros', imovel.banheiros ? String(imovel.banheiros) : null)
  adicionar('Vagas', imovel.vagas ? String(imovel.vagas) : null)
  adicionar('Bairro', imovel.bairro)
  adicionar('Cidade', `${imovel.cidade} - ${imovel.uf}`)
  adicionar('Matrícula', imovel.matricula)
  adicionar('Situação', imovel.situacaoTexto)
  adicionar('IPTU', imovel.valorIptu ? formatarBRL(imovel.valorIptu) : null)
  adicionar('Condomínio', imovel.valorCondominio ? formatarBRL(imovel.valorCondominio) : null)

  const infraestrutura = [
    imovel.temAsfalto && 'Asfalto',
    imovel.temAgua && 'Água',
    imovel.temEnergia && 'Energia',
  ].filter(Boolean) as string[]

  if (infraestrutura.length > 0) adicionar('Infraestrutura', infraestrutura.join(' · '))

  if (linhas.length === 0) return null

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-stone-900">Ficha técnica</h2>
      <dl className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {linhas.map((linha) => (
          <div key={linha.rotulo} className="flex justify-between border-b border-stone-200 pb-2">
            <dt className="text-sm text-stone-500">{linha.rotulo}</dt>
            <dd className="text-sm font-medium text-stone-900">{linha.valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
