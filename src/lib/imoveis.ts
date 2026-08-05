import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma/client'

/**
 * Busca de imóveis — PROJETO.md seção 5.
 *
 * Os filtros vêm da carteira REAL do Hélio, não de um portal imobiliário genérico.
 * Por isso existem `aceitaVeiculo` ("aceitamos carro no negócio"), `entradaAte` e
 * `parcelaAte` — o público dele decide pela entrada e pela parcela, não pelo m².
 * E por isso `quartos` só se aplica a CASA/APARTAMENTO: não existe quarto em lote.
 */

const booleanoDaQuerystring = z
  .enum(['true', 'false', '1', '0'])
  .transform((v) => v === 'true' || v === '1')

export const filtrosSchema = z.object({
  tipo: z
    .enum(['LOTE', 'CASA', 'APARTAMENTO', 'SALA_COMERCIAL', 'GALPAO', 'SITIO', 'CHACARA', 'FAZENDA'])
    .optional(),
  bairro: z.string().trim().min(1).optional(),
  loteamento: z.string().trim().min(1).optional(),

  precoMin: z.coerce.number().nonnegative().optional(),
  precoMax: z.coerce.number().positive().optional(),
  areaMin: z.coerce.number().nonnegative().optional(),
  areaMax: z.coerce.number().positive().optional(),

  // O que realmente decide a compra no público dele
  entradaAte: z.coerce.number().positive().optional(),
  parcelaAte: z.coerce.number().positive().optional(),

  aceitaFinanciamento: booleanoDaQuerystring.optional(),
  aceitaMcmv: booleanoDaQuerystring.optional(),
  aceitaVeiculo: booleanoDaQuerystring.optional(),
  aceitaPermuta: booleanoDaQuerystring.optional(),
  escriturado: booleanoDaQuerystring.optional(),
  prontoParaConstruir: booleanoDaQuerystring.optional(),

  quartos: z.coerce.number().int().min(1).max(10).optional(),

  ordem: z.enum(['recentes', 'menor-preco', 'maior-preco']).default('recentes'),
  pagina: z.coerce.number().int().min(1).default(1),
})

export type FiltrosImovel = z.infer<typeof filtrosSchema>

/** Tipos onde perguntar por quartos faz sentido. */
const TIPOS_COM_QUARTOS = new Set(['CASA', 'APARTAMENTO'])

export function tipoTemQuartos(tipo?: string): boolean {
  return tipo !== undefined && TIPOS_COM_QUARTOS.has(tipo)
}

/**
 * Lê os filtros da querystring com tolerância: parâmetro inválido é ignorado em vez
 * de derrubar a página. Um link velho circulando no WhatsApp não pode dar erro 500.
 */
export function lerFiltros(searchParams: Record<string, string | string[] | undefined>): FiltrosImovel {
  const normalizado: Record<string, string> = {}
  for (const [chave, valor] of Object.entries(searchParams)) {
    const primeiro = Array.isArray(valor) ? valor[0] : valor
    if (primeiro !== undefined && primeiro !== '') normalizado[chave] = primeiro
  }

  const resultado = filtrosSchema.safeParse(normalizado)
  if (resultado.success) return resultado.data

  // Descarta só as chaves que falharam e tenta de novo.
  const chavesRuins = new Set(resultado.error.issues.map((i) => String(i.path[0])))
  for (const chave of chavesRuins) delete normalizado[chave]

  const segundaTentativa = filtrosSchema.safeParse(normalizado)
  return segundaTentativa.success
    ? segundaTentativa.data
    : { ordem: 'recentes' as const, pagina: 1 }
}

const POR_PAGINA = 12

export function montarWhere(filtros: FiltrosImovel): Prisma.ImovelWhereInput {
  const where: Prisma.ImovelWhereInput = {
    status: 'DISPONIVEL',
    publicadoEm: { not: null },
  }

  if (filtros.tipo) where.tipo = filtros.tipo
  if (filtros.bairro) where.bairro = { equals: filtros.bairro, mode: 'insensitive' }
  if (filtros.loteamento) where.loteamento = { slug: filtros.loteamento }

  if (filtros.precoMin !== undefined || filtros.precoMax !== undefined) {
    where.preco = {
      ...(filtros.precoMin !== undefined && { gte: filtros.precoMin }),
      ...(filtros.precoMax !== undefined && { lte: filtros.precoMax }),
    }
  }

  if (filtros.areaMin !== undefined || filtros.areaMax !== undefined) {
    where.areaTerrenoM2 = {
      ...(filtros.areaMin !== undefined && { gte: filtros.areaMin }),
      ...(filtros.areaMax !== undefined && { lte: filtros.areaMax }),
    }
  }

  if (filtros.entradaAte !== undefined) where.entradaMinima = { lte: filtros.entradaAte }
  if (filtros.parcelaAte !== undefined) where.valorParcela = { lte: filtros.parcelaAte }

  // Booleanos só entram quando marcados: `false` aqui significaria "quero imóvel que
  // NÃO aceita financiamento", que ninguém quer filtrar.
  if (filtros.aceitaFinanciamento) where.aceitaFinanciamento = true
  if (filtros.aceitaMcmv) where.aceitaMcmv = true
  if (filtros.aceitaVeiculo) where.aceitaVeiculo = true
  if (filtros.aceitaPermuta) where.aceitaPermuta = true
  if (filtros.escriturado) where.escriturado = true
  if (filtros.prontoParaConstruir) where.prontoParaConstruir = true

  // Ignora `quartos` em tipo que não tem quarto, em vez de devolver lista vazia.
  if (filtros.quartos !== undefined && tipoTemQuartos(filtros.tipo)) {
    where.quartos = { gte: filtros.quartos }
  }

  return where
}

function montarOrdenacao(ordem: FiltrosImovel['ordem']): Prisma.ImovelOrderByWithRelationInput[] {
  switch (ordem) {
    case 'menor-preco':
      return [{ preco: 'asc' }, { ordem: 'asc' }]
    case 'maior-preco':
      return [{ preco: 'desc' }, { ordem: 'asc' }]
    default:
      return [{ destaque: 'desc' }, { ordem: 'asc' }, { publicadoEm: 'desc' }]
  }
}

/** Campos necessários para renderizar um card na listagem. Nada além disso. */
const SELECAO_CARD = {
  id: true,
  codigo: true,
  slug: true,
  titulo: true,
  tipo: true,
  bairro: true,
  cidade: true,
  preco: true,
  precoSobConsulta: true,
  entradaMinima: true,
  valorParcela: true,
  parcelasMax: true,
  dimensoesTexto: true,
  areaTerrenoM2: true,
  areaConstruidaM2: true,
  quartos: true,
  banheiros: true,
  vagas: true,
  aceitaFinanciamento: true,
  aceitaMcmv: true,
  aceitaVeiculo: true,
  destaque: true,
  midias: {
    where: { isCapa: true },
    take: 1,
    select: { url: true, urlThumb: true, legenda: true },
  },
  videos: {
    where: { publicado: true },
    orderBy: [{ destaque: 'desc' as const }, { ordem: 'asc' as const }],
    take: 1,
    select: { provedor: true, videoIdExterno: true, urlThumb: true, titulo: true },
  },
} satisfies Prisma.ImovelSelect

export async function buscarImoveis(filtros: FiltrosImovel) {
  const where = montarWhere(filtros)

  const [itens, total] = await Promise.all([
    prisma.imovel.findMany({
      where,
      select: SELECAO_CARD,
      orderBy: montarOrdenacao(filtros.ordem),
      skip: (filtros.pagina - 1) * POR_PAGINA,
      take: POR_PAGINA,
    }),
    prisma.imovel.count({ where }),
  ])

  return {
    itens,
    total,
    pagina: filtros.pagina,
    totalPaginas: Math.max(1, Math.ceil(total / POR_PAGINA)),
  }
}

/** Página do imóvel: traz tudo que o hero, a galeria e o JSON-LD precisam. */
export async function buscarImovelPorSlug(slug: string) {
  return prisma.imovel.findUnique({
    where: { slug },
    include: {
      loteamento: true,
      proximidades: { orderBy: { distanciaM: 'asc' } },
      midias: { orderBy: { ordem: 'asc' } },
      videos: {
        where: { publicado: true },
        orderBy: [{ destaque: 'desc' }, { ordem: 'asc' }],
      },
    },
  })
}

/** Slugs publicados, para `generateStaticParams` e para o sitemap. */
export async function listarSlugsPublicados() {
  return prisma.imovel.findMany({
    where: { status: 'DISPONIVEL', publicadoEm: { not: null } },
    select: { slug: true, atualizadoEm: true },
  })
}

/** Opções reais para os selects do filtro — só o que existe na carteira. */
export async function opcoesDeFiltro() {
  const [bairros, loteamentos] = await Promise.all([
    prisma.imovel.findMany({
      where: { status: 'DISPONIVEL', publicadoEm: { not: null }, bairro: { not: null } },
      select: { bairro: true },
      distinct: ['bairro'],
      orderBy: { bairro: 'asc' },
    }),
    prisma.loteamento.findMany({
      where: { status: { in: ['LANCAMENTO', 'EM_VENDAS'] } },
      select: { slug: true, nome: true },
      orderBy: { nome: 'asc' },
    }),
  ])

  return {
    bairros: bairros.map((b) => b.bairro!).filter(Boolean),
    loteamentos,
  }
}
