import { prisma } from '@/lib/prisma'
import type { Plain } from '@/lib/serialize'

/**
 * Loteamentos — Jardim Esperança e Piemonte são os nomes que aparecem nos posts dele.
 * A infraestrutura entregue (asfalto, água, energia) é argumento de venda recorrente,
 * por isso vem junto na consulta de listagem e não só no detalhe.
 */

const SELECAO_CARD = {
  id: true,
  slug: true,
  nome: true,
  descricao: true,
  status: true,
  bairro: true,
  cidade: true,
  uf: true,
  capaUrl: true,
  entradaMinima: true,
  parcelasMax: true,
  parcelaApartirDe: true,
  temAsfalto: true,
  temAgua: true,
  temEnergia: true,
  temEsgoto: true,
  temIluminacao: true,
  _count: { select: { imoveis: { where: { status: 'DISPONIVEL' as const, publicadoEm: { not: null } } } } },
} as const

/** Loteamentos em comercialização, com a contagem de lotes ainda disponíveis. */
export async function listarLoteamentos() {
  return prisma.loteamento.findMany({
    where: { status: { in: ['LANCAMENTO', 'EM_VENDAS'] } },
    select: SELECAO_CARD,
    orderBy: [{ destaque: 'desc' }, { nome: 'asc' }],
  })
}

export type LoteamentoListado = Plain<Awaited<ReturnType<typeof listarLoteamentos>>[number]>

/** Página do loteamento: dados, vídeos e os lotes ainda disponíveis. */
export async function buscarLoteamentoPorSlug(slug: string) {
  return prisma.loteamento.findUnique({
    where: { slug },
    include: {
      videos: {
        where: { publicado: true },
        orderBy: [{ destaque: 'desc' }, { ordem: 'asc' }],
      },
    },
  })
}

/** Slugs para `generateStaticParams` e para o sitemap. */
export async function listarSlugsDeLoteamentos() {
  return prisma.loteamento.findMany({
    where: { status: { in: ['LANCAMENTO', 'EM_VENDAS'] } },
    select: { slug: true, atualizadoEm: true },
  })
}

/** Infraestrutura entregue, em texto — "Asfalto · Água · Energia". */
export function resumoInfraestrutura(loteamento: {
  temAsfalto: boolean
  temAgua: boolean
  temEnergia: boolean
  temEsgoto?: boolean
  temIluminacao?: boolean
}): string | null {
  const itens = [
    loteamento.temAsfalto && 'Asfalto',
    loteamento.temAgua && 'Água',
    loteamento.temEnergia && 'Energia',
    loteamento.temEsgoto && 'Esgoto',
    loteamento.temIluminacao && 'Iluminação',
  ].filter((item): item is string => typeof item === 'string')

  return itens.length > 0 ? itens.join(' · ') : null
}
