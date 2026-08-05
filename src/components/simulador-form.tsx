'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import {
  executarSimulacao,
  registrarLeadDaSimulacao,
  type EstadoLead,
  type EstadoSimulacao,
} from '@/app/(site)/simulador/acoes'
import { CardImovel } from '@/components/card-imovel'
import { BotaoWhatsapp } from '@/components/botao-whatsapp'
import { formatarBRL } from '@/lib/formato'

type Props = {
  prazos: number[]
  prazoPadraoMeses: number
  disclaimer: string
  linkWhatsapp: string
}

/**
 * Formulário do simulador — PROJETO.md seção 4.
 *
 * Ordem da tela, que é o coração da conversão:
 *   1. três campos e um botão
 *   2. resultado com disclaimer visível
 *   3. imóveis que cabem no bolso
 *   4. SÓ ENTÃO o pedido de contato
 *
 * Pedir nome e telefone antes do número mata a conversão — o documento é explícito.
 */
export function SimuladorForm({ prazos, prazoPadraoMeses, disclaimer, linkWhatsapp }: Props) {
  const [estado, acao, calculando] = useActionState<EstadoSimulacao, FormData>(executarSimulacao, {
    status: 'inicial',
  })

  /**
   * Campos controlados de propósito: o React reseta formulários não controlados depois
   * de uma action, e aqui isso apagaria a renda e a entrada que a pessoa acabou de
   * digitar. Simular de novo mexendo em um valor só é o uso normal desta tela.
   */
  const [renda, setRenda] = useState('')
  const [entrada, setEntrada] = useState('0')
  const [fgts, setFgts] = useState('0')
  const [prazo, setPrazo] = useState(String(prazoPadraoMeses))

  const erros = estado.status === 'erro' ? estado.campos : {}

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-start">
      <form
        action={acao}
        className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:sticky lg:top-24"
      >
        <h2 className="text-lg font-semibold text-stone-900">Seus dados</h2>
        <p className="mt-1 text-sm text-stone-600">
          Nenhum contato é pedido para ver o resultado.
        </p>

        <div className="mt-5 space-y-4">
          <Campo
            nome="rendaBrutaFamiliar"
            rotulo="Renda familiar por mês (R$)"
            dica="Some a renda de quem vai compor o financiamento."
            erro={erros.rendaBrutaFamiliar}
            valor={renda}
            aoMudar={setRenda}
            obrigatorio
          />
          <Campo
            nome="valorEntrada"
            rotulo="Quanto você tem de entrada (R$)"
            erro={erros.valorEntrada}
            valor={entrada}
            aoMudar={setEntrada}
          />
          <Campo
            nome="valorFgts"
            rotulo="Saldo de FGTS (R$)"
            dica="Deixe zero se não for usar."
            erro={erros.valorFgts}
            valor={fgts}
            aoMudar={setFgts}
          />

          <label className="block">
            <span className="mb-1 block text-xs font-semibold tracking-wide text-stone-500 uppercase">
              Prazo do financiamento
            </span>
            <select
              name="prazoMeses"
              value={prazo}
              onChange={(evento) => setPrazo(evento.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-base"
            >
              {prazos.map((meses) => (
                <option key={meses} value={meses}>
                  {meses / 12} anos ({meses} meses)
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-start gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              name="possuiImovel"
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-marca-700"
            />
            Já tenho um imóvel no meu nome
          </label>
        </div>

        {estado.status === 'erro' && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {estado.mensagem}
          </p>
        )}

        <button
          type="submit"
          disabled={calculando}
          className="mt-5 w-full rounded-full bg-marca-700 px-6 py-4 text-base font-bold text-white transition-colors hover:bg-marca-800 disabled:opacity-60"
        >
          {calculando ? 'Calculando...' : 'Ver quanto eu consigo'}
        </button>
      </form>

      <div>
        {estado.status === 'ok' ? (
          <Resultado estado={estado} disclaimer={disclaimer} linkWhatsapp={linkWhatsapp} />
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center">
            <h2 className="text-lg font-semibold text-stone-900">
              O resultado aparece aqui
            </h2>
            <p className="mx-auto mt-2 max-w-md text-stone-600">
              Você vai ver o valor que consegue financiar, a parcela estimada e quais imóveis
              da carteira cabem no seu bolso.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function Resultado({
  estado,
  disclaimer,
  linkWhatsapp,
}: {
  estado: Extract<EstadoSimulacao, { status: 'ok' }>
  disclaimer: string
  linkWhatsapp: string
}) {
  const { resultado, compativeis, parametros } = estado

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-marca-800 p-6 text-white">
        <p className="text-sm font-medium text-marca-200">Seu poder de compra estimado</p>
        <p className="mt-1 text-4xl font-bold">{formatarBRL(resultado.poderDeCompra)}</p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs tracking-wide text-marca-200 uppercase">Financiamento</dt>
            <dd className="mt-0.5 text-lg font-semibold">
              {formatarBRL(resultado.valorFinanciavel)}
            </dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-marca-200 uppercase">
              {resultado.ultimaParcela === null ? 'Parcela fixa' : 'Primeira parcela'}
            </dt>
            <dd className="mt-0.5 text-lg font-semibold">
              {formatarBRL(resultado.primeiraParcela)}
            </dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-marca-200 uppercase">
              {resultado.ultimaParcela === null ? 'Parcela máxima' : 'Última parcela'}
            </dt>
            <dd className="mt-0.5 text-lg font-semibold">
              {formatarBRL(resultado.ultimaParcela ?? resultado.parcelaMaxima)}
            </dd>
          </div>
        </dl>

        <p className="mt-5 text-xs leading-relaxed text-marca-100">
          Cálculo pelo sistema {parametros.sistema}, com{' '}
          {(parametros.comprometimentoMaxPct * 100).toFixed(0)}% da renda comprometida e taxa
          de {(parametros.taxaJurosAa * 100).toFixed(2).replace('.', ',')}% ao ano.
        </p>
      </section>

      {/* Disclaimer obrigatório e visível — seções 4 e 10. */}
      <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
        {disclaimer}
      </p>

      <section>
        <h2 className="text-xl font-bold text-stone-900">
          {compativeis.length > 0
            ? `${compativeis.length} ${compativeis.length === 1 ? 'imóvel cabe' : 'imóveis cabem'} no seu bolso`
            : 'Ainda não há imóvel publicado nessa faixa'}
        </h2>

        {compativeis.length > 0 ? (
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {compativeis.map((imovel) => (
              <CardImovel key={imovel.id} imovel={imovel} />
            ))}
          </div>
        ) : (
          <p className="mt-2 text-stone-600">
            A carteira muda toda semana e nem tudo está publicado. Me chame no WhatsApp com o
            resultado da sua simulação que eu procuro uma opção para você.
          </p>
        )}
      </section>

      <FormularioLead simulacaoId={estado.simulacaoId} linkWhatsapp={linkWhatsapp} />
    </div>
  )
}

/** Captura do lead: depois do resultado, nunca antes. */
function FormularioLead({
  simulacaoId,
  linkWhatsapp,
}: {
  simulacaoId: string
  linkWhatsapp: string
}) {
  const [estado, acao, enviando] = useActionState<EstadoLead, FormData>(
    registrarLeadDaSimulacao,
    { status: 'inicial' },
  )

  if (estado.status === 'ok') {
    return (
      <section className="rounded-2xl border border-marca-200 bg-marca-50 p-6">
        <h2 className="text-lg font-semibold text-marca-900">Recebido. O Hélio já vai te chamar.</h2>
        <p className="mt-2 text-marca-800">
          Se preferir adiantar, me mande uma mensagem agora — sua simulação já está salva.
        </p>
        <div className="mt-4">
          <BotaoWhatsapp href={linkWhatsapp} tamanho="grande" />
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">
        Quer que o Hélio confira essa simulação com você?
      </h2>
      <p className="mt-1 text-sm text-stone-600">
        Ele analisa seu caso e busca as condições reais com o banco. Sem compromisso.
      </p>

      <form action={acao} className="mt-4 space-y-4">
        <input type="hidden" name="simulacaoId" value={simulacaoId} />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold tracking-wide text-stone-500 uppercase">
              Seu nome
            </span>
            <input
              name="nome"
              required
              autoComplete="name"
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-base"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold tracking-wide text-stone-500 uppercase">
              WhatsApp com DDD
            </span>
            <input
              name="telefone"
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(62) 99999-9999"
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-base"
            />
          </label>
        </div>

        {/* LGPD seção 10: consentimento explícito, sem caixa pré-marcada. */}
        <label className="flex items-start gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            name="consentimentoLgpd"
            required
            className="mt-0.5 h-4 w-4 rounded border-stone-300 text-marca-700"
          />
          <span>
            Autorizo o contato por WhatsApp sobre esta simulação e concordo com o uso dos meus
            dados para esse fim.
          </span>
        </label>

        {estado.status === 'erro' && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{estado.mensagem}</p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={enviando}
            className="rounded-full bg-marca-700 px-6 py-3 text-base font-semibold text-white hover:bg-marca-800 disabled:opacity-60"
          >
            {enviando ? 'Enviando...' : 'Quero falar com o Hélio'}
          </button>
          <Link href="/imoveis" className="text-sm font-medium text-stone-500 hover:text-stone-800">
            Prefiro só olhar os imóveis
          </Link>
        </div>
      </form>
    </section>
  )
}

function Campo({
  nome,
  rotulo,
  dica,
  erro,
  valor,
  aoMudar,
  obrigatorio,
}: {
  nome: string
  rotulo: string
  dica?: string
  erro?: string
  valor: string
  aoMudar: (valor: string) => void
  obrigatorio?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold tracking-wide text-stone-500 uppercase">
        {rotulo}
      </span>
      <input
        name={nome}
        required={obrigatorio}
        type="number"
        inputMode="numeric"
        min={0}
        step={100}
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
        className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-base"
      />
      {dica && !erro && <span className="mt-1 block text-xs text-stone-500">{dica}</span>}
      {erro && <span className="mt-1 block text-xs font-medium text-red-600">{erro}</span>}
    </label>
  )
}
