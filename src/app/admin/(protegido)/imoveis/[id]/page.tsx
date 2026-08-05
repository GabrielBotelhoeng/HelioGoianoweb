import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { toPlain } from '@/lib/serialize'
import { formatarBRL } from '@/lib/formato'
import { rotuloTipo, selosDeCondicao } from '@/lib/apresentacao'
import { BotaoPublicar } from '@/components/admin/botao-publicar'
import { UploadFotos } from '@/components/admin/upload-fotos'
import { storageConfigurado } from '@/lib/storage'

export const metadata: Metadata = {
  title: 'Imóvel',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Detalhe do imóvel no painel.
 *
 * Ainda é leitura: a edição campo a campo e a aba "publicar" com os textos gerados por
 * IA são a fase 5. O que existe aqui é o que ele precisa logo depois de salvar —
 * confirmar que ficou certo, publicar, e abrir a página pública.
 */
export default async function PaginaAdminImovel({
  params,
  searchParams,
}: PageProps<'/admin/imoveis/[id]'>) {
  const { id } = await params
  const { criado } = await searchParams

  const registro = await prisma.imovel.findUnique({
    where: { id },
    include: { videos: true, midias: true },
  })

  if (!registro) notFound()

  const imovel = toPlain(registro)
  const publicado = imovel.publicadoEm !== null
  const selos = selosDeCondicao(imovel)

  return (
    <div>
      {criado && (
        <p className="mb-5 rounded-xl border border-marca-200 bg-marca-50 px-4 py-3 text-sm font-medium text-marca-900">
          Imóvel cadastrado com o código {imovel.codigo}.
        </p>
      )}

      <p className="font-mono text-xs text-stone-500">{imovel.codigo}</p>
      <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-carvao-900">
        {imovel.titulo}
      </h1>
      <p className="mt-1 text-sm text-stone-600">
        {rotuloTipo(imovel.tipo)}
        {imovel.bairro ? ` · ${imovel.bairro}` : ''} · {imovel.cidade}-{imovel.uf}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <BotaoPublicar imovelId={imovel.id} publicado={publicado} />
        {publicado && (
          <Link
            href={`/imoveis/${imovel.slug}`}
            target="_blank"
            className="rounded-full border border-stone-300 px-4 py-1.5 text-sm font-medium text-stone-700"
          >
            Ver no site
          </Link>
        )}
      </div>

      <dl className="mt-6 grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-3">
        <Dado rotulo="Preço">
          {imovel.precoSobConsulta ? 'Sob consulta' : formatarBRL(imovel.preco)}
        </Dado>
        <Dado rotulo="Entrada">
          {imovel.entradaMinima ? formatarBRL(imovel.entradaMinima) : '—'}
        </Dado>
        <Dado rotulo="Parcela">
          {imovel.valorParcela ? formatarBRL(imovel.valorParcela) : '—'}
          {imovel.parcelasMax ? ` (${imovel.parcelasMax}x)` : ''}
        </Dado>
        <Dado rotulo="Dimensões">{imovel.dimensoesTexto ?? '—'}</Dado>
        <Dado rotulo="Vídeo">{imovel.videos.length > 0 ? 'Vinculado' : 'Nenhum'}</Dado>
        <Dado rotulo="Fotos">{imovel.midias.length}</Dado>
      </dl>

      {selos.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {selos.map((selo) => (
            <li
              key={selo}
              className="rounded-full bg-marca-50 px-3 py-1 text-sm text-marca-800"
            >
              {selo}
            </li>
          ))}
        </ul>
      )}

      <section className="mt-8">
        <h2 className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
          Fotos
        </h2>
        <div className="mt-3">
          <UploadFotos
            imovelId={imovel.id}
            storageConfigurado={storageConfigurado()}
            fotos={imovel.midias
              .filter((midia) => midia.tipo === 'FOTO')
              .sort((a, b) => a.ordem - b.ordem)
              .map((midia) => ({
                id: midia.id,
                url: midia.url,
                isCapa: midia.isCapa,
                legenda: midia.legenda,
              }))}
          />
        </div>
      </section>

      {imovel.descricao && (
        <section className="mt-6">
          <h2 className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
            Descrição
          </h2>
          <p className="mt-2 whitespace-pre-line text-stone-700">{imovel.descricao}</p>
        </section>
      )}

      {/* Sinaliza o que a fase 5 vai preencher, para o Hélio não achar que falta algo quebrado. */}
      <p className="mt-8 rounded-xl border border-dashed border-stone-300 px-4 py-3 text-sm text-stone-500">
        Edição campo a campo e geração de legenda para Instagram e WhatsApp entram na
        próxima etapa.
      </p>
    </div>
  )
}

function Dado({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs tracking-wide text-stone-500 uppercase">{rotulo}</dt>
      <dd className="mt-0.5 font-semibold text-carvao-900">{children}</dd>
    </div>
  )
}
