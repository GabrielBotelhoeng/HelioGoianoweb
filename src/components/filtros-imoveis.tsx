import Link from 'next/link'
import type { FiltrosImovel } from '@/lib/imoveis'
import { tipoTemQuartos } from '@/lib/imoveis'
import { ROTULO_TIPO } from '@/lib/apresentacao'

type Props = {
  filtros: FiltrosImovel
  opcoes: {
    bairros: string[]
    loteamentos: { slug: string; nome: string }[]
  }
}

/**
 * Filtros de `/imoveis` — PROJETO.md seção 5.
 *
 * É um `<form method="get">` renderizado no servidor, não um painel controlado por
 * JavaScript. Três consequências que importam para este público: funciona na webview do
 * Instagram, funciona antes do JS carregar no 4G, e o estado do filtro fica na URL —
 * então o Hélio consegue mandar "todos os lotes até 50 mil" como link no WhatsApp.
 *
 * Os campos vêm da carteira real: entrada e parcela, aceita carro, escriturado. Não é o
 * filtro genérico de portal imobiliário.
 */
export function FiltrosImoveis({ filtros, opcoes }: Props) {
  const mostrarQuartos = tipoTemQuartos(filtros.tipo)

  return (
    <form
      method="get"
      action="/imoveis"
      className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Campo rotulo="Tipo de imóvel">
          <select name="tipo" defaultValue={filtros.tipo ?? ''} className={ESTILO_CONTROLE}>
            <option value="">Todos</option>
            {Object.entries(ROTULO_TIPO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
        </Campo>

        <Campo rotulo="Bairro">
          <select name="bairro" defaultValue={filtros.bairro ?? ''} className={ESTILO_CONTROLE}>
            <option value="">Todos</option>
            {opcoes.bairros.map((bairro) => (
              <option key={bairro} value={bairro}>
                {bairro}
              </option>
            ))}
          </select>
        </Campo>

        <Campo rotulo="Loteamento">
          <select
            name="loteamento"
            defaultValue={filtros.loteamento ?? ''}
            className={ESTILO_CONTROLE}
          >
            <option value="">Todos</option>
            {opcoes.loteamentos.map((loteamento) => (
              <option key={loteamento.slug} value={loteamento.slug}>
                {loteamento.nome}
              </option>
            ))}
          </select>
        </Campo>

        <Campo rotulo="Ordenar por">
          <select name="ordem" defaultValue={filtros.ordem} className={ESTILO_CONTROLE}>
            <option value="recentes">Mais recentes</option>
            <option value="menor-preco">Menor preço</option>
            <option value="maior-preco">Maior preço</option>
          </select>
        </Campo>

        {/* Entrada e parcela primeiro: é por elas que o comprador decide. */}
        <Campo rotulo="Entrada até (R$)">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={500}
            name="entradaAte"
            defaultValue={filtros.entradaAte ?? ''}
            placeholder="Ex.: 5.000"
            className={ESTILO_CONTROLE}
          />
        </Campo>

        <Campo rotulo="Parcela até (R$)">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={50}
            name="parcelaAte"
            defaultValue={filtros.parcelaAte ?? ''}
            placeholder="Ex.: 800"
            className={ESTILO_CONTROLE}
          />
        </Campo>

        <Campo rotulo="Preço mínimo (R$)">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            name="precoMin"
            defaultValue={filtros.precoMin ?? ''}
            className={ESTILO_CONTROLE}
          />
        </Campo>

        <Campo rotulo="Preço máximo (R$)">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            name="precoMax"
            defaultValue={filtros.precoMax ?? ''}
            className={ESTILO_CONTROLE}
          />
        </Campo>

        {/* Quarto só existe em casa e apartamento — em lote o campo seria ruído. */}
        {mostrarQuartos && (
          <Campo rotulo="Quartos (mínimo)">
            <select name="quartos" defaultValue={filtros.quartos ?? ''} className={ESTILO_CONTROLE}>
              <option value="">Qualquer</option>
              {[1, 2, 3, 4].map((quantidade) => (
                <option key={quantidade} value={quantidade}>
                  {quantidade}+
                </option>
              ))}
            </select>
          </Campo>
        )}
      </div>

      <fieldset className="mt-4">
        <legend className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
          Condições
        </legend>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
          <Marcador nome="aceitaFinanciamento" marcado={filtros.aceitaFinanciamento}>
            Aceita financiamento
          </Marcador>
          <Marcador nome="aceitaMcmv" marcado={filtros.aceitaMcmv}>
            Minha Casa Minha Vida
          </Marcador>
          <Marcador nome="aceitaVeiculo" marcado={filtros.aceitaVeiculo}>
            Aceita carro
          </Marcador>
          <Marcador nome="aceitaPermuta" marcado={filtros.aceitaPermuta}>
            Aceita permuta
          </Marcador>
          <Marcador nome="escriturado" marcado={filtros.escriturado}>
            Escriturado
          </Marcador>
          <Marcador nome="prontoParaConstruir" marcado={filtros.prontoParaConstruir}>
            Pronto para construir
          </Marcador>
        </div>
      </fieldset>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          className="rounded-full bg-marca-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-marca-800"
        >
          Filtrar
        </button>
        <Link href="/imoveis" className="text-sm font-medium text-stone-500 hover:text-stone-800">
          Limpar filtros
        </Link>
      </div>
    </form>
  )
}

const ESTILO_CONTROLE =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none focus:border-marca-600 focus:ring-2 focus:ring-marca-100'

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold tracking-wide text-stone-500 uppercase">
        {rotulo}
      </span>
      {children}
    </label>
  )
}

/**
 * Checkbox com `value="true"`: desmarcado simplesmente não vai na querystring, que é o
 * comportamento esperado por `montarWhere` — filtrar por "não aceita financiamento"
 * não faz sentido para ninguém.
 */
function Marcador({
  nome,
  marcado,
  children,
}: {
  nome: string
  marcado?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-stone-700">
      <input
        type="checkbox"
        name={nome}
        value="true"
        defaultChecked={marcado}
        className="h-4 w-4 rounded border-stone-300 text-marca-700 focus:ring-marca-600"
      />
      {children}
    </label>
  )
}
