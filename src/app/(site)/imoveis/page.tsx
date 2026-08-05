import type { Metadata } from 'next'
import Link from 'next/link'
import { buscarImoveis, lerFiltros, opcoesDeFiltro } from '@/lib/imoveis'
import { toPlain } from '@/lib/serialize'
import { CardImovel } from '@/components/card-imovel'
import { FiltrosImoveis } from '@/components/filtros-imoveis'
import { BotaoWhatsapp } from '@/components/botao-whatsapp'
import { buscarConfiguracao, linkWhatsappDireto } from '@/lib/config'
import { TransicaoPagina } from '@/components/animacao/transicao-pagina'

export const metadata: Metadata = {
  title: 'Imóveis à venda em Alexânia-GO',
  description:
    'Lotes, casas e imóveis comerciais em Alexânia-GO. Filtre por entrada, parcela, ' +
    'bairro e condição de pagamento. Simulação de financiamento gratuita.',
}

/**
 * Listagem com filtros na querystring (SSR).
 *
 * Renderização dinâmica por natureza: o resultado depende dos filtros da URL. As páginas
 * que precisam ser rápidas e indexáveis são a home e a do imóvel — essas ficam estáticas.
 */
export default async function PaginaImoveis({ searchParams }: PageProps<'/imoveis'>) {
  const filtros = lerFiltros(await searchParams)

  const [resultado, opcoes, config] = await Promise.all([
    buscarImoveis(filtros),
    opcoesDeFiltro(),
    buscarConfiguracao(),
  ])

  const itens = toPlain(resultado.itens)

  return (
    <TransicaoPagina>
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-carvao-900 sm:text-4xl">
          Imóveis à venda em Alexânia
        </h1>
        <p className="mt-1 text-stone-600">
          {resultado.total === 0
            ? 'Nenhum imóvel encontrado com esses filtros.'
            : `${resultado.total} ${resultado.total === 1 ? 'imóvel disponível' : 'imóveis disponíveis'}`}
        </p>
      </header>

      <FiltrosImoveis filtros={filtros} opcoes={opcoes} />

      {itens.length > 0 ? (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {itens.map((imovel) => (
              <CardImovel key={imovel.id} imovel={imovel} />
            ))}
          </div>

          <Paginacao
            pagina={resultado.pagina}
            totalPaginas={resultado.totalPaginas}
            filtros={filtros}
          />
        </>
      ) : (
        // Busca vazia é o pior momento para deixar o visitante sozinho: o Hélio tem
        // imóvel que ainda não está no site, então o caminho aqui é a conversa.
        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">
            Não achou o que procurava?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-stone-600">
            A carteira muda toda semana e nem tudo está publicado. Me chame no WhatsApp
            dizendo o que você procura e quanto pode dar de entrada.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <BotaoWhatsapp href={linkWhatsappDireto(config)} tamanho="grande" />
            <Link
              href="/imoveis"
              className="inline-flex items-center rounded-full border border-stone-300 px-6 py-4 text-base font-semibold text-stone-700 hover:bg-stone-50"
            >
              Ver todos os imóveis
            </Link>
          </div>
        </div>
      )}
    </div>
    </TransicaoPagina>
  )
}

/** Monta a URL da página preservando os filtros ativos. */
function urlDaPagina(filtros: Record<string, unknown>, pagina: number): string {
  const parametros = new URLSearchParams()

  for (const [chave, valor] of Object.entries(filtros)) {
    if (chave === 'pagina' || valor === undefined || valor === false) continue
    parametros.set(chave, String(valor))
  }

  if (pagina > 1) parametros.set('pagina', String(pagina))

  const querystring = parametros.toString()
  return querystring ? `/imoveis?${querystring}` : '/imoveis'
}

function Paginacao({
  pagina,
  totalPaginas,
  filtros,
}: {
  pagina: number
  totalPaginas: number
  filtros: Record<string, unknown>
}) {
  if (totalPaginas <= 1) return null

  return (
    <nav aria-label="Paginação" className="mt-10 flex items-center justify-center gap-2">
      {pagina > 1 && (
        <Link
          href={urlDaPagina(filtros, pagina - 1)}
          rel="prev"
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-white"
        >
          Anterior
        </Link>
      )}

      <span className="px-3 text-sm text-stone-600">
        Página {pagina} de {totalPaginas}
      </span>

      {pagina < totalPaginas && (
        <Link
          href={urlDaPagina(filtros, pagina + 1)}
          rel="next"
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-white"
        >
          Próxima
        </Link>
      )}
    </nav>
  )
}
