import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import type { ParametrosSimulacao, SistemaAmortizacao } from '@/lib/simulador'

/**
 * Leitura de `ParametroSimulador` — PROJETO.md seção 4, regra não-negociável:
 * "Nada de taxa, prazo ou faixa de programa habitacional hardcodado."
 *
 * Não existe valor padrão neste arquivo de propósito. Se uma chave sumir do banco, o
 * simulador falha alto em vez de calcular com uma taxa inventada — número errado aqui
 * vira expectativa errada de crédito, que é o risco listado na seção 12.
 */

export type ParametrosSimulador = ParametrosSimulacao & {
  prazoMaxMeses: number
  prazoPadraoMeses: number
  disclaimer: string
}

const CHAVES = {
  taxa: 'taxa_juros_aa',
  comprometimento: 'comprometimento_max_pct',
  prazoMax: 'prazo_max_meses',
  prazoPadrao: 'prazo_padrao_meses',
  sistema: 'sistema_padrao',
  disclaimer: 'disclaimer_simulacao',
} as const

export const carregarParametros = cache(async (): Promise<ParametrosSimulador> => {
  const linhas = await prisma.parametroSimulador.findMany()
  const valores = new Map(linhas.map((linha) => [linha.chave, linha.valor]))

  const ler = (chave: string): string => {
    const valor = valores.get(chave)
    if (valor === undefined || valor.trim() === '') {
      throw new Error(
        `Parâmetro "${chave}" ausente em ParametroSimulador. ` +
          'Cadastre-o no admin ou rode `npm run db:seed` — o simulador não usa valor padrão.',
      )
    }
    return valor
  }

  const lerNumero = (chave: string): number => {
    const numero = Number(ler(chave))
    if (!Number.isFinite(numero)) {
      throw new Error(`Parâmetro "${chave}" não é um número válido em ParametroSimulador.`)
    }
    return numero
  }

  const sistema = ler(CHAVES.sistema).toUpperCase()
  if (sistema !== 'SAC' && sistema !== 'PRICE') {
    throw new Error(`Parâmetro "${CHAVES.sistema}" deve ser SAC ou PRICE. Valor atual: ${sistema}`)
  }

  return {
    taxaJurosAa: lerNumero(CHAVES.taxa),
    comprometimentoMaxPct: lerNumero(CHAVES.comprometimento),
    sistema: sistema as SistemaAmortizacao,
    prazoMaxMeses: Math.trunc(lerNumero(CHAVES.prazoMax)),
    prazoPadraoMeses: Math.trunc(lerNumero(CHAVES.prazoPadrao)),
    disclaimer: ler(CHAVES.disclaimer),
  }
})

/** Prazos oferecidos no formulário, limitados ao máximo configurado. */
export function prazosDisponiveis(prazoMaxMeses: number): number[] {
  return [120, 180, 240, 300, 360, 420].filter((meses) => meses <= prazoMaxMeses)
}
