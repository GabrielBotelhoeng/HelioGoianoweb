import { Prisma } from '@/generated/prisma/client'

/**
 * Fronteira RSC -> Client Component.
 *
 * O PROBLEMA: campos `Decimal` do Prisma (preço, entrada, parcela, renda) voltam do
 * banco como instâncias de Decimal.js. O serializador do React Flight não atravessa
 * instâncias de classe — passar um `Imovel` cru de um Server Component para um Client
 * Component explode com "Only plain objects can be passed to Client Components".
 *
 * Como praticamente todo model deste projeto tem Decimal, qualquer dado que chegue a um
 * componente interativo (filtros, simulador, formulários do admin) precisa passar por aqui.
 *
 * PRECISÃO: Decimal -> number é seguro nesta faixa. Valores monetários em centavos vão
 * até ~10^12; inteiros são exatos em double até 2^53 (~9×10^15). Não use este conversor
 * para acumular juros em laço — os cálculos do simulador ficam em Decimal no servidor e
 * só o resultado final é convertido.
 */

export type Plain<T> = T extends Prisma.Decimal
  ? number
  : T extends Date
    ? Date
    : T extends Array<infer U>
      ? Plain<U>[]
      : T extends object
        ? { [K in keyof T]: Plain<T[K]> }
        : T

function isDecimal(value: unknown): value is Prisma.Decimal {
  return value instanceof Prisma.Decimal
}

/**
 * Converte recursivamente Decimal -> number, preservando Date (que o Flight serializa
 * nativamente), null e undefined.
 */
export function toPlain<T>(value: T): Plain<T> {
  if (value === null || value === undefined) {
    return value as Plain<T>
  }

  if (isDecimal(value)) {
    return value.toNumber() as Plain<T>
  }

  // Date atravessa a fronteira sem tratamento — não desmontar em objeto.
  if (value instanceof Date) {
    return value as Plain<T>
  }

  if (Array.isArray(value)) {
    return value.map((item) => toPlain(item)) as Plain<T>
  }

  if (typeof value === 'object') {
    const output: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value)) {
      output[key] = toPlain(item)
    }
    return output as Plain<T>
  }

  return value as Plain<T>
}

/** Formata BRL para exibição. Centraliza para não espalhar Intl pelo código. */
export function formatarBRL(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return 'Sob consulta'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(valor)
}
