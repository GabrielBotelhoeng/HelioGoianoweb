/**
 * Simulador de financiamento — PROJETO.md seção 4.
 *
 * É o recurso central do produto: substitui a simulação que o Hélio faz à mão no direct.
 *
 * REGRA INEGOCIÁVEL: nenhuma taxa, prazo ou faixa de programa habitacional aparece
 * neste arquivo. Tudo entra por `ParametrosSimulacao`, que vem da tabela
 * `ParametroSimulador` — editável no admin. As regras do MCMV e as taxas da Caixa
 * mudam com frequência.
 *
 * PRECISÃO: os cálculos rodam em `number` (double). A conta é uma exponenciação
 * fechada, não um acúmulo iterativo de juros, e double tem ~15 dígitos significativos
 * contra os ~9 necessários aqui. O resultado é uma estimativa com disclaimer
 * obrigatório, não uma proposta de crédito.
 */

export type SistemaAmortizacao = 'SAC' | 'PRICE'

export type EntradaSimulacao = {
  /** Renda bruta familiar MENSAL. */
  rendaBrutaFamiliar: number
  valorEntrada: number
  valorFgts: number
  prazoMeses: number
}

export type ParametrosSimulacao = {
  /** Taxa nominal ao ano em decimal. 0.1049 = 10,49% a.a. */
  taxaJurosAa: number
  /** Fração da renda comprometida com a parcela. 0.30 = 30%. */
  comprometimentoMaxPct: number
  sistema: SistemaAmortizacao
}

export type ResultadoSimulacao = {
  parcelaMaxima: number
  valorFinanciavel: number
  /** financiável + entrada + FGTS */
  poderDeCompra: number
  primeiraParcela: number
  /** null no PRICE (parcela fixa); no SAC é a menor. */
  ultimaParcela: number | null
  /** Taxa mensal efetivamente aplicada, para exibir e auditar. */
  taxaMensal: number
}

function arredondar(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}

/**
 * Converte taxa anual em mensal por equivalência composta, como manda o PROJETO.md:
 * i = (1 + taxaAa)^(1/12) - 1
 *
 * Não é taxaAa/12 — isso subestimaria a parcela e geraria expectativa errada de crédito,
 * que é exatamente o risco listado na seção 12 do documento.
 */
export function taxaMensal(taxaJurosAa: number): number {
  return Math.pow(1 + taxaJurosAa, 1 / 12) - 1
}

// ---------- PRICE (parcela fixa) ----------

/** PMT = PV × i / (1 - (1+i)^-n) */
export function pmtPrice(pv: number, i: number, n: number): number {
  if (n <= 0) return 0
  if (i === 0) return pv / n
  return (pv * i) / (1 - Math.pow(1 + i, -n))
}

/** PV = PMT × (1 - (1+i)^-n) / i — a inversão que dá o valor financiável. */
export function pvPrice(pmt: number, i: number, n: number): number {
  if (n <= 0) return 0
  if (i === 0) return pmt * n
  return (pmt * (1 - Math.pow(1 + i, -n))) / i
}

// ---------- SAC (parcela decrescente) ----------

/**
 * PV = parcelaMaxima / (1/n + i)
 *
 * No SAC a PRIMEIRA parcela é a maior, então é ela que precisa caber no
 * comprometimento de renda. Dimensionar pela parcela média aprovaria um valor
 * que o cliente não consegue pagar no primeiro mês.
 */
export function pvSac(parcelaMaxima: number, i: number, n: number): number {
  if (n <= 0) return 0
  return parcelaMaxima / (1 / n + i)
}

/** primeiraParcela = amortizacao + (PV × i) */
export function primeiraParcelaSac(pv: number, i: number, n: number): number {
  if (n <= 0) return 0
  return pv / n + pv * i
}

/** ultimaParcela = amortizacao + (amortizacao × i) */
export function ultimaParcelaSac(pv: number, i: number, n: number): number {
  if (n <= 0) return 0
  const amortizacao = pv / n
  return amortizacao + amortizacao * i
}

// ---------- ORQUESTRAÇÃO ----------

/**
 * Executa a simulação completa (passos 1 a 3 do PROJETO.md seção 4).
 * O passo 4 (imóveis compatíveis) vive em `filtrarCompativeis`, porque depende do banco.
 */
export function simular(
  entrada: EntradaSimulacao,
  parametros: ParametrosSimulacao,
): ResultadoSimulacao {
  const i = taxaMensal(parametros.taxaJurosAa)
  const n = entrada.prazoMeses

  // 1. quanto da renda pode virar parcela
  const parcelaMaxima = entrada.rendaBrutaFamiliar * parametros.comprometimentoMaxPct

  // 2. inverter a fórmula de amortização a partir da parcela máxima
  const valorFinanciavel =
    parametros.sistema === 'SAC' ? pvSac(parcelaMaxima, i, n) : pvPrice(parcelaMaxima, i, n)

  // 3. poder de compra = financiável + entrada + FGTS
  const poderDeCompra = valorFinanciavel + entrada.valorEntrada + entrada.valorFgts

  const primeiraParcela =
    parametros.sistema === 'SAC'
      ? primeiraParcelaSac(valorFinanciavel, i, n)
      : pmtPrice(valorFinanciavel, i, n)

  const ultimaParcela =
    parametros.sistema === 'SAC' ? ultimaParcelaSac(valorFinanciavel, i, n) : null

  return {
    parcelaMaxima: arredondar(parcelaMaxima),
    valorFinanciavel: arredondar(valorFinanciavel),
    poderDeCompra: arredondar(poderDeCompra),
    primeiraParcela: arredondar(primeiraParcela),
    ultimaParcela: ultimaParcela === null ? null : arredondar(ultimaParcela),
    taxaMensal: i,
  }
}

/** Recorte mínimo de imóvel que o matching precisa — evita acoplar ao model do Prisma. */
export type ImovelCompativel = {
  id: string
  preco: number | null
  precoSobConsulta: boolean
  aceitaFinanciamento: boolean
}

export type Compatibilidade = {
  imovelId: string
  /** poderDeCompra - preço. Quanto menor, mais próximo do teto do cliente. */
  folga: number
}

/**
 * Passo 4-5 do PROJETO.md seção 4.
 *
 * Imóvel que aceita financiamento é comparado ao poder de compra inteiro.
 * Imóvel que NÃO aceita só entra se couber em entrada + FGTS, porque o cliente
 * teria que pagar à vista.
 *
 * Ordena por folga crescente: o mais próximo do teto aparece primeiro, que é o
 * melhor imóvel que a pessoa consegue comprar.
 */
export function filtrarCompativeis(
  imoveis: ImovelCompativel[],
  resultado: ResultadoSimulacao,
  entrada: EntradaSimulacao,
): Compatibilidade[] {
  const aVista = entrada.valorEntrada + entrada.valorFgts

  return imoveis
    .filter((imovel) => !imovel.precoSobConsulta && imovel.preco !== null)
    .map((imovel) => {
      const teto = imovel.aceitaFinanciamento ? resultado.poderDeCompra : aVista
      return { imovelId: imovel.id, folga: arredondar(teto - imovel.preco!) }
    })
    .filter((c) => c.folga >= 0)
    .sort((a, b) => a.folga - b.folga)
}
