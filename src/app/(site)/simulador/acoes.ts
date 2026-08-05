'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { carregarParametros } from '@/lib/parametros'
import { filtrarCompativeis, simular, type ResultadoSimulacao } from '@/lib/simulador'
import { listarImoveisParaMatching, type ImovelListado } from '@/lib/imoveis'
import { toPlain } from '@/lib/serialize'

/**
 * Server Actions do simulador — PROJETO.md seção 4.
 *
 * Duas ações separadas de propósito: o cálculo roda sozinho e o lead é capturado
 * DEPOIS de mostrar o resultado. "Formulário na frente do valor mata a conversão" é
 * uma regra explícita do documento.
 */

const numeroDoFormulario = z
  .string()
  .trim()
  // Aceita "3.500,00" e "3500.00": o campo é numérico, mas colar valor formatado é comum.
  .transform((texto) => texto.replace(/\./g, '').replace(',', '.'))
  .pipe(z.coerce.number())

const entradaSchema = z.object({
  rendaBrutaFamiliar: numeroDoFormulario.pipe(z.number().positive('Informe a renda familiar.')),
  valorEntrada: numeroDoFormulario.pipe(z.number().nonnegative()).default(0),
  valorFgts: numeroDoFormulario.pipe(z.number().nonnegative()).default(0),
  prazoMeses: z.coerce.number().int().positive(),
  possuiImovel: z.coerce.boolean().default(false),
  dependentes: z.coerce.number().int().min(0).max(20).default(0),
})

export type ValoresFormulario = {
  rendaBrutaFamiliar: string
  valorEntrada: string
  valorFgts: string
  prazoMeses: string
  possuiImovel: boolean
  dependentes: string
}

export type EstadoSimulacao =
  | { status: 'inicial' }
  | { status: 'erro'; mensagem: string; campos: Record<string, string> }
  | {
      status: 'ok'
      simulacaoId: string
      resultado: ResultadoSimulacao
      entrada: { rendaBrutaFamiliar: number; valorEntrada: number; valorFgts: number; prazoMeses: number }
      parametros: { taxaJurosAa: number; comprometimentoMaxPct: number; sistema: string }
      compativeis: ImovelListado[]
      /** Quantos imóveis existem acima do poder de compra — orienta o texto do resultado. */
      totalAvaliado: number
    }

/** Quantos compatíveis mostrar e gravar. Acima disso a lista deixa de ajudar a decidir. */
const LIMITE_COMPATIVEIS = 12

export async function executarSimulacao(
  _estadoAnterior: EstadoSimulacao,
  formData: FormData,
): Promise<EstadoSimulacao> {
  const parametros = await carregarParametros()

  const analise = entradaSchema.safeParse({
    rendaBrutaFamiliar: formData.get('rendaBrutaFamiliar') ?? '',
    valorEntrada: formData.get('valorEntrada') ?? '0',
    valorFgts: formData.get('valorFgts') ?? '0',
    prazoMeses: formData.get('prazoMeses') ?? String(parametros.prazoPadraoMeses),
    possuiImovel: formData.get('possuiImovel') === 'on',
    dependentes: formData.get('dependentes') ?? '0',
  })

  if (!analise.success) {
    const campos: Record<string, string> = {}
    for (const problema of analise.error.issues) {
      const campo = String(problema.path[0] ?? 'formulario')
      campos[campo] ??= problema.message
    }
    return {
      status: 'erro',
      mensagem: 'Confira os valores informados para continuar.',
      campos,
    }
  }

  const entrada = analise.data

  if (entrada.prazoMeses > parametros.prazoMaxMeses) {
    return {
      status: 'erro',
      mensagem: `O prazo máximo disponível é de ${parametros.prazoMaxMeses} meses.`,
      campos: { prazoMeses: 'Prazo acima do permitido.' },
    }
  }

  const resultado = simular(entrada, parametros)

  const universo = toPlain(await listarImoveisParaMatching())
  const compatibilidades = filtrarCompativeis(
    universo.map((imovel) => ({
      id: imovel.id,
      preco: imovel.preco,
      precoSobConsulta: imovel.precoSobConsulta,
      aceitaFinanciamento: imovel.aceitaFinanciamento,
    })),
    resultado,
    entrada,
  ).slice(0, LIMITE_COMPATIVEIS)

  const porId = new Map(universo.map((imovel) => [imovel.id, imovel]))
  const compativeis = compatibilidades
    .map((compatibilidade) => porId.get(compatibilidade.imovelId))
    .filter((imovel): imovel is ImovelListado => imovel !== undefined)

  /**
   * Os parâmetros vão congelados dentro do registro: "se a taxa mudar amanhã, a
   * simulação de ontem tem que continuar explicável" (seção 4).
   */
  const simulacao = await prisma.simulacao.create({
    data: {
      rendaBrutaFamiliar: entrada.rendaBrutaFamiliar,
      valorEntrada: entrada.valorEntrada,
      valorFgts: entrada.valorFgts,
      possuiImovel: entrada.possuiImovel,
      dependentes: entrada.dependentes,
      prazoMeses: entrada.prazoMeses,
      sistema: parametros.sistema,
      taxaJurosAa: parametros.taxaJurosAa,
      comprometimentoMaxPct: parametros.comprometimentoMaxPct,
      parcelaMaxima: resultado.parcelaMaxima,
      valorFinanciavel: resultado.valorFinanciavel,
      poderDeCompra: resultado.poderDeCompra,
      primeiraParcela: resultado.primeiraParcela,
      ultimaParcela: resultado.ultimaParcela,
      compativeis: {
        create: compatibilidades.map((compatibilidade) => ({
          imovelId: compatibilidade.imovelId,
          folga: compatibilidade.folga,
        })),
      },
    },
    select: { id: true },
  })

  return {
    status: 'ok',
    simulacaoId: simulacao.id,
    resultado,
    entrada: {
      rendaBrutaFamiliar: entrada.rendaBrutaFamiliar,
      valorEntrada: entrada.valorEntrada,
      valorFgts: entrada.valorFgts,
      prazoMeses: entrada.prazoMeses,
    },
    parametros: {
      taxaJurosAa: parametros.taxaJurosAa,
      comprometimentoMaxPct: parametros.comprometimentoMaxPct,
      sistema: parametros.sistema,
    },
    compativeis,
    totalAvaliado: universo.length,
  }
}

// ---------- LEAD ----------

const leadSchema = z.object({
  simulacaoId: z.string().min(1),
  nome: z.string().trim().min(2, 'Informe seu nome.'),
  telefone: z
    .string()
    .trim()
    .transform((texto) => texto.replace(/\D/g, ''))
    .pipe(z.string().min(10, 'Informe um telefone com DDD.').max(13)),
  consentimentoLgpd: z.literal(true, { message: 'É necessário aceitar o contato para enviar.' }),
})

export type EstadoLead =
  | { status: 'inicial' }
  | { status: 'erro'; mensagem: string }
  | { status: 'ok' }

/**
 * Vincula um lead à simulação já calculada. O Hélio recebe renda, entrada e os imóveis
 * compatíveis junto com o contato — a pessoa se autoqualificou sozinha (seção 4).
 *
 * LGPD (seção 10): sem consentimento explícito não grava.
 */
export async function registrarLeadDaSimulacao(
  _estadoAnterior: EstadoLead,
  formData: FormData,
): Promise<EstadoLead> {
  const analise = leadSchema.safeParse({
    simulacaoId: formData.get('simulacaoId') ?? '',
    nome: formData.get('nome') ?? '',
    telefone: formData.get('telefone') ?? '',
    consentimentoLgpd: formData.get('consentimentoLgpd') === 'on',
  })

  if (!analise.success) {
    return {
      status: 'erro',
      mensagem: analise.error.issues[0]?.message ?? 'Confira os dados informados.',
    }
  }

  const { simulacaoId, nome, telefone } = analise.data

  const simulacao = await prisma.simulacao.findUnique({
    where: { id: simulacaoId },
    select: { id: true, leadId: true },
  })

  if (!simulacao) {
    return { status: 'erro', mensagem: 'Simulação não encontrada. Refaça o cálculo.' }
  }

  // Reenvio do mesmo formulário não pode gerar dois leads para a mesma simulação.
  if (simulacao.leadId) return { status: 'ok' }

  const lead = await prisma.lead.create({
    data: {
      nome,
      telefone,
      origem: 'SIMULADOR',
      consentimentoLgpd: true,
    },
    select: { id: true },
  })

  await prisma.simulacao.update({
    where: { id: simulacao.id },
    data: { leadId: lead.id },
  })

  return { status: 'ok' }
}
