'use client'

import { useActionState, useState } from 'react'
import { criarImovel, type EstadoCadastro } from '@/app/admin/(protegido)/imoveis/acoes'
import { ROTULO_TIPO } from '@/lib/apresentacao'

/**
 * Cadastro rápido — PROJETO.md seção 6.
 *
 * Desenhado para ser preenchido em pé, na frente do imóvel, com uma mão. Por isso:
 * campos grandes, teclado numérico onde cabe, e o essencial primeiro. O que é detalhe
 * fica dentro de um bloco recolhido — ele abre no desktop, depois, com calma.
 *
 * Nada além de tipo e título bloqueia o salvamento. Preço em branco vira "sob consulta".
 */
export function FormularioImovel() {
  const [estado, acao, salvando] = useActionState<EstadoCadastro, FormData>(criarImovel, {})
  const [sobConsulta, setSobConsulta] = useState(false)
  const [tipo, setTipo] = useState('LOTE')

  const erros = estado.campos ?? {}
  const ehResidencial = tipo === 'CASA' || tipo === 'APARTAMENTO'

  return (
    <form action={acao} className="space-y-6">
      <Bloco titulo="O essencial">
        <Campo rotulo="Tipo de imóvel" erro={erros.tipo}>
          <select
            name="tipo"
            value={tipo}
            onChange={(evento) => setTipo(evento.target.value)}
            className={ESTILO}
          >
            {Object.entries(ROTULO_TIPO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
        </Campo>

        <Campo
          rotulo="Título"
          dica="Como você anunciaria: “Lote 15x30 no Jardim Esperança”"
          erro={erros.titulo}
        >
          <input name="titulo" required className={ESTILO} autoCapitalize="sentences" />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Bairro">
            <input name="bairro" className={ESTILO} autoCapitalize="words" />
          </Campo>
          <Campo rotulo="Dimensões" dica="Do jeito que o cliente entende: 15x30">
            <input name="dimensoesTexto" className={ESTILO} inputMode="text" />
          </Campo>
        </div>
      </Bloco>

      <Bloco titulo="Valores">
        <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <input
            type="checkbox"
            name="precoSobConsulta"
            checked={sobConsulta}
            onChange={(evento) => setSobConsulta(evento.target.checked)}
            className="h-5 w-5 rounded border-stone-300 text-marca-700"
          />
          Preço sob consulta
        </label>

        {!sobConsulta && (
          <Campo rotulo="Preço (R$)">
            <input name="preco" inputMode="decimal" placeholder="88.000" className={ESTILO} />
          </Campo>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Entrada (R$)">
            <input name="entradaMinima" inputMode="decimal" placeholder="8.800" className={ESTILO} />
          </Campo>
          <Campo rotulo="Parcela (R$)">
            <input name="valorParcela" inputMode="decimal" placeholder="750" className={ESTILO} />
          </Campo>
        </div>

        <Campo rotulo="Número de parcelas">
          <input name="parcelasMax" inputMode="numeric" placeholder="120" className={ESTILO} />
        </Campo>
      </Bloco>

      <Bloco titulo="Como aceita pagamento">
        <div className="grid grid-cols-2 gap-3">
          <Marcador nome="aceitaFinanciamento">Financiamento</Marcador>
          <Marcador nome="aceitaMcmv">Minha Casa Minha Vida</Marcador>
          <Marcador nome="aceitaFgts">FGTS</Marcador>
          <Marcador nome="aceitaVeiculo">Carro na negociação</Marcador>
          <Marcador nome="aceitaPermuta">Permuta</Marcador>
          <Marcador nome="escriturado">Escriturado</Marcador>
          <Marcador nome="prontoParaConstruir">Pronto para construir</Marcador>
        </div>
      </Bloco>

      <Bloco titulo="Vídeo">
        <Campo
          rotulo="Link do YouTube"
          dica="Cole o link do vídeo. Reconhece youtu.be, /shorts/ e watch?v="
        >
          <input
            name="linkVideo"
            inputMode="url"
            placeholder="https://youtube.com/shorts/..."
            className={ESTILO}
          />
        </Campo>
      </Bloco>

      {/* Detalhes ficam recolhidos: no celular, campo a mais é motivo de desistência. */}
      <details className="rounded-2xl border border-stone-200 bg-white">
        <summary className="cursor-pointer px-5 py-4 font-semibold text-stone-800">
          Mais detalhes (opcional)
        </summary>

        <div className="space-y-4 border-t border-stone-100 px-5 py-5">
          {ehResidencial && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo rotulo="Quartos">
                <input name="quartos" inputMode="numeric" className={ESTILO} />
              </Campo>
              <Campo rotulo="Banheiros">
                <input name="banheiros" inputMode="numeric" className={ESTILO} />
              </Campo>
            </div>
          )}

          <Campo rotulo="Área do terreno (m²)">
            <input name="areaTerrenoM2" inputMode="decimal" className={ESTILO} />
          </Campo>

          <Campo rotulo="Ponto de referência" dica="“Próximo ao Colégio 31 de Março”">
            <input name="pontoReferencia" className={ESTILO} />
          </Campo>

          <Campo rotulo="Descrição" dica="Pode deixar em branco — dá para gerar depois.">
            <textarea name="descricao" rows={5} className={ESTILO} />
          </Campo>
        </div>
      </details>

      {estado.erro && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {estado.erro}
        </p>
      )}

      {/* Barra fixa: o botão de salvar não pode exigir rolagem até o fim. */}
      <div className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <label className="flex flex-1 items-center gap-2 text-sm font-medium text-stone-700">
            <input
              type="checkbox"
              name="publicar"
              defaultChecked
              className="h-5 w-5 rounded border-stone-300 text-marca-700"
            />
            Publicar no site
          </label>

          <button
            type="submit"
            disabled={salvando}
            className="rounded-full bg-marca-700 px-8 py-3.5 text-base font-bold text-white disabled:opacity-60"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </form>
  )
}

const ESTILO =
  'w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none focus:border-marca-600 focus:ring-2 focus:ring-marca-100'

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
      <h2 className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
        {titulo}
      </h2>
      {children}
    </section>
  )
}

function Campo({
  rotulo,
  dica,
  erro,
  children,
}: {
  rotulo: string
  dica?: string
  erro?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-stone-700">{rotulo}</span>
      {children}
      {dica && !erro && <span className="mt-1 block text-xs text-stone-500">{dica}</span>}
      {erro && <span className="mt-1 block text-xs font-medium text-red-600">{erro}</span>}
    </label>
  )
}

function Marcador({ nome, children }: { nome: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-3 text-sm text-stone-700">
      <input
        type="checkbox"
        name={nome}
        className="h-5 w-5 shrink-0 rounded border-stone-300 text-marca-700"
      />
      {children}
    </label>
  )
}
