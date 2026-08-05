import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  buscarLoteamentoPorSlug,
  listarSlugsDeLoteamentos,
  resumoInfraestrutura,
} from '@/lib/loteamentos'
import { buscarImoveis } from '@/lib/imoveis'
import { buscarConfiguracao, linkWhatsappDireto } from '@/lib/config'
import { toPlain } from '@/lib/serialize'
import { formatarBRL } from '@/lib/formato'
import { jsonLdBreadcrumb, jsonLdVideo, urlAbsoluta } from '@/lib/seo'
import { CardImovel } from '@/components/card-imovel'
import { VideoHero } from '@/components/video-hero'
import { BotaoWhatsapp } from '@/components/botao-whatsapp'

/**
 * Página do loteamento — PROJETO.md seção 5: dados do empreendimento, lotes disponíveis
 * e planta. O vídeo (normalmente aéreo de drone) responde "onde fica?" melhor que mapa,
 * porque mostra o entorno (seção 7).
 */
export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await listarSlugsDeLoteamentos()
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/loteamentos/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const loteamento = await buscarLoteamentoPorSlug(slug)

  if (!loteamento) return { title: 'Loteamento não encontrado' }

  const titulo = loteamento.metaTitle ?? `Loteamento ${loteamento.nome} — ${loteamento.cidade}-${loteamento.uf}`
  const descricao =
    loteamento.metaDescription ??
    loteamento.descricao?.slice(0, 160) ??
    `Lotes à venda no ${loteamento.nome}, em ${loteamento.cidade}-${loteamento.uf}.`

  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: `/loteamentos/${loteamento.slug}` },
    openGraph: {
      type: 'website',
      title: titulo,
      description: descricao,
      url: urlAbsoluta(`/loteamentos/${loteamento.slug}`),
      ...(loteamento.capaUrl && { images: [{ url: loteamento.capaUrl, alt: loteamento.nome }] }),
    },
  }
}

export default async function PaginaLoteamento({ params }: PageProps<'/loteamentos/[slug]'>) {
  const { slug } = await params
  const registro = await buscarLoteamentoPorSlug(slug)

  if (!registro || registro.status === 'ESGOTADO') notFound()

  const [resultado, config] = await Promise.all([
    // Reaproveita a busca de imóveis com o filtro de loteamento: mesma regra de
    // publicação e mesma ordenação da listagem geral.
    buscarImoveis({ loteamento: slug, ordem: 'menor-preco', pagina: 1 }),
    buscarConfiguracao(),
  ])

  const loteamento = toPlain(registro)
  const lotes = toPlain(resultado.itens)
  const infra = resumoInfraestrutura(loteamento)
  const url = urlAbsoluta(`/loteamentos/${loteamento.slug}`)

  const video = loteamento.videos.find((v) => v.destaque) ?? loteamento.videos[0] ?? null
  const marcacaoVideo = video ? jsonLdVideo(video, url) : null

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            jsonLdBreadcrumb([
              { nome: 'Início', caminho: '/' },
              { nome: 'Loteamentos', caminho: '/loteamentos' },
              { nome: loteamento.nome, caminho: `/loteamentos/${loteamento.slug}` },
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
        <Link href="/loteamentos" className="hover:text-marca-700">
          Loteamentos
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div>
          {video ? (
            <VideoHero
              provedor={video.provedor}
              videoIdExterno={video.videoIdExterno}
              urlThumb={video.urlThumb}
              titulo={video.titulo}
            />
          ) : loteamento.capaUrl ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-200">
              <Image
                src={loteamento.capaUrl}
                alt={loteamento.nome}
                fill
                sizes="(max-width: 1024px) 100vw, 380px"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="textura-escura flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-3xl bg-carvao-900">
              <span className="text-[10px] font-semibold tracking-[0.22em] text-ouro-400 uppercase">
                Loteamento
              </span>
              <span className="font-display text-xl font-semibold text-white">
                {loteamento.nome}
              </span>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">
            Loteamento · {loteamento.bairro ? `${loteamento.bairro}, ` : ''}
            {loteamento.cidade} - {loteamento.uf}
          </p>
          <h1 className="mt-1 font-display text-3xl leading-tight font-extrabold tracking-tight text-carvao-900 sm:text-4xl">
            {loteamento.nome}
          </h1>

          {loteamento.descricao && (
            <p className="mt-3 leading-relaxed text-stone-700">{loteamento.descricao}</p>
          )}

          {infra && (
            <div className="mt-5">
              <h2 className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
                Infraestrutura entregue
              </h2>
              <p className="mt-1 font-medium text-marca-700">{infra}</p>
            </div>
          )}

          {(loteamento.entradaMinima || loteamento.parcelaApartirDe || loteamento.parcelasMax) && (
            <dl className="mt-5 grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:grid-cols-3">
              {loteamento.entradaMinima && (
                <div>
                  <dt className="text-xs tracking-wide text-stone-500 uppercase">
                    Entrada a partir de
                  </dt>
                  <dd className="mt-0.5 text-lg font-semibold text-oferta-600">
                    {formatarBRL(loteamento.entradaMinima)}
                  </dd>
                </div>
              )}
              {loteamento.parcelaApartirDe && (
                <div>
                  <dt className="text-xs tracking-wide text-stone-500 uppercase">
                    Parcelas a partir de
                  </dt>
                  <dd className="mt-0.5 text-lg font-semibold text-oferta-600">
                    {formatarBRL(loteamento.parcelaApartirDe)}
                  </dd>
                </div>
              )}
              {loteamento.parcelasMax && (
                <div>
                  <dt className="text-xs tracking-wide text-stone-500 uppercase">
                    Parcelamento em até
                  </dt>
                  <dd className="mt-0.5 text-lg font-semibold text-oferta-600">
                    {loteamento.parcelasMax}x
                  </dd>
                </div>
              )}
            </dl>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <BotaoWhatsapp href={linkWhatsappDireto(config)} tamanho="grande">
              Falar sobre o {loteamento.nome}
            </BotaoWhatsapp>
            <Link
              href="/simulador"
              className="inline-flex items-center justify-center rounded-full border border-marca-700 px-6 py-4 text-base font-semibold text-marca-800 hover:bg-marca-50"
            >
              Simular financiamento
            </Link>
          </div>
        </div>
      </div>

      {loteamento.plantaUrl && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-stone-900">Planta do loteamento</h2>
          <div className="relative mt-3 aspect-[16/10] overflow-hidden rounded-2xl bg-white">
            <Image
              src={loteamento.plantaUrl}
              alt={`Planta do loteamento ${loteamento.nome}`}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-contain"
            />
          </div>
        </section>
      )}

      <section className="mt-12">
        {/* "Imóveis" e não "lotes": o loteamento também abriga casas construídas nele. */}
        <h2 className="text-xl font-bold text-stone-900">
          {lotes.length > 0
            ? `${resultado.total} ${resultado.total === 1 ? 'imóvel disponível' : 'imóveis disponíveis'} neste loteamento`
            : 'Sem imóveis publicados no momento'}
        </h2>

        {lotes.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {lotes.map((imovel) => (
              <CardImovel key={imovel.id} imovel={imovel} />
            ))}
          </div>
        ) : (
          <p className="mt-2 max-w-xl text-stone-600">
            A disponibilidade muda toda semana. Me chame no WhatsApp que eu confiro quais
            lotes ainda estão livres neste loteamento.
          </p>
        )}
      </section>
    </div>
  )
}
