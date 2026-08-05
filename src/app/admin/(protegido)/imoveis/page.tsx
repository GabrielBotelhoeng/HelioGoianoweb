import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { toPlain } from '@/lib/serialize'
import { formatarBRL } from '@/lib/formato'
import { rotuloTipo } from '@/lib/apresentacao'
import { BotaoPublicar } from '@/components/admin/botao-publicar'

export const metadata: Metadata = {
  title: 'Imóveis',
  robots: { index: false, follow: false },
}

/** A lista precisa refletir o que ele acabou de salvar, sem cache no caminho. */
export const dynamic = 'force-dynamic'

export default async function PaginaAdminImoveis() {
  const registros = await prisma.imovel.findMany({
    orderBy: [{ criadoEm: 'desc' }],
    select: {
      id: true,
      codigo: true,
      slug: true,
      titulo: true,
      tipo: true,
      bairro: true,
      preco: true,
      precoSobConsulta: true,
      publicadoEm: true,
      status: true,
      cliquesWhatsapp: true,
      visualizacoes: true,
    },
  })

  const imoveis = toPlain(registros)

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-carvao-900">
          Imóveis
        </h1>
        <Link
          href="/admin/imoveis/novo"
          className="shrink-0 rounded-full bg-marca-700 px-4 py-2 text-sm font-semibold text-white"
        >
          + Cadastrar
        </Link>
      </div>

      {imoveis.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-600">
          Nenhum imóvel cadastrado ainda.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {imoveis.map((imovel) => {
            const publicado = imovel.publicadoEm !== null

            return (
              <li
                key={imovel.id}
                className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-stone-500">{imovel.codigo}</p>
                    <Link
                      href={`/admin/imoveis/${imovel.id}`}
                      className="mt-0.5 block truncate font-semibold text-carvao-900 hover:underline"
                    >
                      {imovel.titulo}
                    </Link>
                    <p className="mt-0.5 text-sm text-stone-500">
                      {rotuloTipo(imovel.tipo)}
                      {imovel.bairro ? ` · ${imovel.bairro}` : ''} ·{' '}
                      {imovel.precoSobConsulta ? 'Sob consulta' : formatarBRL(imovel.preco)}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      publicado
                        ? 'bg-marca-50 text-marca-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {publicado ? 'No ar' : 'Rascunho'}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <BotaoPublicar imovelId={imovel.id} publicado={publicado} />

                  {publicado && (
                    <Link
                      href={`/imoveis/${imovel.slug}`}
                      target="_blank"
                      className="rounded-full border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700"
                    >
                      Ver no site
                    </Link>
                  )}

                  {/* A métrica que prova o valor do site na renovação (seção 8). */}
                  <span className="ml-auto text-xs text-stone-500">
                    {imovel.cliquesWhatsapp} no WhatsApp
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
