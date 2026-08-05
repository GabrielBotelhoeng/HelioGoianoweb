/**
 * Formatação de exibição — deliberadamente SEM dependência do Prisma.
 *
 * `serialize.ts` importa `Prisma` em runtime (para o `instanceof Decimal`), o que arrasta
 * `node:module` para qualquer bundle que o importe. Um Client Component que só precisa
 * formatar reais não pode pagar esse preço: com `formatarBRL` lá dentro, o simulador
 * quebrava o build do cliente inteiro.
 */

/** Formata BRL para exibição. Centraliza para não espalhar Intl pelo código. */
export function formatarBRL(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return 'Sob consulta'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(valor)
}
