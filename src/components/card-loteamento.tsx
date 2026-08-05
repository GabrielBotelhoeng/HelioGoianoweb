import Link from 'next/link'
import type { LoteamentoListado } from '@/lib/loteamentos'
import { resumoInfraestrutura } from '@/lib/loteamentos'
import { formatarBRL } from '@/lib/formato'

const ROTULO_STATUS: Record<string, string> = {
  LANCAMENTO: 'Lançamento',
  EM_VENDAS: 'Em vendas',
  ESGOTADO: 'Esgotado',
}

/**
 * Card de loteamento. A infraestrutura entregue (asfalto, água, energia) fica em
 * evidência porque é o argumento que ele repete nos posts — quem compra lote em
 * Alexânia quer saber se dá para construir já.
 */
export function CardLoteamento({ loteamento }: { loteamento: LoteamentoListado }) {
  const infra = resumoInfraestrutura(loteamento)

  return (
    <Link
      href={`/loteamentos/${loteamento.slug}`}
      className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">{loteamento.nome}</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            {loteamento.bairro ? `${loteamento.bairro}, ` : ''}
            {loteamento.cidade} - {loteamento.uf}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-marca-50 px-2.5 py-1 text-[11px] font-semibold text-marca-800">
          {ROTULO_STATUS[loteamento.status] ?? loteamento.status}
        </span>
      </div>

      {loteamento.descricao && (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-stone-600">
          {loteamento.descricao}
        </p>
      )}

      {infra && <p className="mt-3 text-sm font-medium text-marca-700">{infra}</p>}

      {(loteamento.entradaMinima || loteamento.parcelaApartirDe) && (
        <p className="mt-2 text-sm font-semibold text-oferta-600">
          {loteamento.entradaMinima && `Entrada a partir de ${formatarBRL(loteamento.entradaMinima)}`}
          {loteamento.entradaMinima && loteamento.parcelaApartirDe && ' · '}
          {loteamento.parcelaApartirDe && `Parcelas de ${formatarBRL(loteamento.parcelaApartirDe)}`}
        </p>
      )}

      <p className="mt-4 text-sm text-stone-600">
        {loteamento._count.imoveis > 0
          ? `${loteamento._count.imoveis} ${loteamento._count.imoveis === 1 ? 'imóvel disponível' : 'imóveis disponíveis'}`
          : 'Consulte a disponibilidade'}
      </p>
    </Link>
  )
}
