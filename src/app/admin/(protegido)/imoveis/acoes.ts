'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { lerSessao } from '@/lib/auth'
import { montarSlug, proximoCodigo } from '@/lib/codigo'
import { extrairVideoId } from '@/lib/youtube'

/**
 * Cadastro de imóvel — PROJETO.md seção 6, o ponto crítico do produto.
 *
 * REGRA QUE MANDA AQUI: "Não bloqueie o salvamento por campo faltando — ele desiste."
 * Só `tipo` e `titulo` são exigidos. Preço pode ficar em branco (vira "sob consulta"),
 * bairro pode faltar, foto pode não existir. O que estiver faltando ele completa
 * depois, no desktop, com calma.
 */

/**
 * Aceita "88.000", "88000,50" e "88000" — ele digita como fala, não como o banco quer.
 * Campo vazio vira `undefined` em vez de erro: nada aqui bloqueia o salvamento.
 */
const dinheiro = z
  .string()
  .trim()
  .transform((texto) => {
    if (texto === '') return undefined
    const numero = Number(texto.replace(/\./g, '').replace(',', '.'))
    return Number.isFinite(numero) && numero >= 0 ? numero : undefined
  })

const inteiro = z
  .string()
  .trim()
  .transform((texto) => {
    if (texto === '') return undefined
    const numero = Number.parseInt(texto.replace(/\D/g, ''), 10)
    return Number.isFinite(numero) && numero >= 0 ? numero : undefined
  })

const imovelSchema = z.object({
  tipo: z.enum([
    'LOTE',
    'CASA',
    'APARTAMENTO',
    'SALA_COMERCIAL',
    'GALPAO',
    'SITIO',
    'CHACARA',
    'FAZENDA',
  ]),
  titulo: z.string().trim().min(3, 'Dê um título ao imóvel.'),

  bairro: z.string().trim().optional(),
  dimensoesTexto: z.string().trim().optional(),
  descricao: z.string().trim().optional(),
  pontoReferencia: z.string().trim().optional(),

  preco: dinheiro,
  entradaMinima: dinheiro,
  valorParcela: dinheiro,
  areaTerrenoM2: dinheiro,
  parcelasMax: inteiro,
  quartos: inteiro,
  banheiros: inteiro,

  precoSobConsulta: z.coerce.boolean().default(false),
  aceitaFinanciamento: z.coerce.boolean().default(false),
  aceitaMcmv: z.coerce.boolean().default(false),
  aceitaFgts: z.coerce.boolean().default(false),
  aceitaPermuta: z.coerce.boolean().default(false),
  aceitaVeiculo: z.coerce.boolean().default(false),
  escriturado: z.coerce.boolean().default(false),
  prontoParaConstruir: z.coerce.boolean().default(false),

  /** Link do YouTube colado do celular; guardamos só o ID. */
  linkVideo: z.string().trim().optional(),
  publicar: z.coerce.boolean().default(false),
})

export type EstadoCadastro = {
  erro?: string
  campos?: Record<string, string>
}

function lerFormulario(formData: FormData) {
  const marcado = (nome: string) => formData.get(nome) === 'on'

  return {
    tipo: formData.get('tipo') ?? 'LOTE',
    titulo: formData.get('titulo') ?? '',
    bairro: formData.get('bairro') ?? '',
    dimensoesTexto: formData.get('dimensoesTexto') ?? '',
    descricao: formData.get('descricao') ?? '',
    pontoReferencia: formData.get('pontoReferencia') ?? '',
    preco: formData.get('preco') ?? '',
    entradaMinima: formData.get('entradaMinima') ?? '',
    valorParcela: formData.get('valorParcela') ?? '',
    areaTerrenoM2: formData.get('areaTerrenoM2') ?? '',
    parcelasMax: formData.get('parcelasMax') ?? '',
    quartos: formData.get('quartos') ?? '',
    banheiros: formData.get('banheiros') ?? '',
    precoSobConsulta: marcado('precoSobConsulta'),
    aceitaFinanciamento: marcado('aceitaFinanciamento'),
    aceitaMcmv: marcado('aceitaMcmv'),
    aceitaFgts: marcado('aceitaFgts'),
    aceitaPermuta: marcado('aceitaPermuta'),
    aceitaVeiculo: marcado('aceitaVeiculo'),
    escriturado: marcado('escriturado'),
    prontoParaConstruir: marcado('prontoParaConstruir'),
    linkVideo: formData.get('linkVideo') ?? '',
    publicar: marcado('publicar'),
  }
}

export async function criarImovel(
  _anterior: EstadoCadastro,
  formData: FormData,
): Promise<EstadoCadastro> {
  // Server Action é um endpoint HTTP: sem esta linha, qualquer pessoa poderia publicar
  // imóvel no site do Hélio sem passar pela tela de login.
  const sessao = await lerSessao()
  if (!sessao) return { erro: 'Sessão expirada. Entre novamente.' }

  const analise = imovelSchema.safeParse(lerFormulario(formData))

  if (!analise.success) {
    const campos: Record<string, string> = {}
    for (const problema of analise.error.issues) {
      const campo = String(problema.path[0] ?? 'formulario')
      campos[campo] ??= problema.message
    }
    return { erro: 'Confira os campos destacados.', campos }
  }

  const dados = analise.data
  const codigo = await proximoCodigo()
  const slug = montarSlug({
    titulo: dados.titulo,
    bairro: dados.bairro,
    cidade: 'Alexânia',
    codigo,
  })

  const videoId = dados.linkVideo ? extrairVideoId(dados.linkVideo) : null

  // Link colado errado não pode derrubar o cadastro inteiro: o imóvel é salvo mesmo
  // assim e o aviso aparece na edição.
  const imovel = await prisma.imovel.create({
    data: {
      codigo,
      slug,
      titulo: dados.titulo,
      tipo: dados.tipo,
      descricao: dados.descricao || null,
      bairro: dados.bairro || null,
      pontoReferencia: dados.pontoReferencia || null,
      dimensoesTexto: dados.dimensoesTexto || null,
      areaTerrenoM2: dados.areaTerrenoM2 ?? null,
      preco: dados.precoSobConsulta ? null : (dados.preco ?? null),
      precoSobConsulta: dados.precoSobConsulta,
      entradaMinima: dados.entradaMinima ?? null,
      valorParcela: dados.valorParcela ?? null,
      parcelasMax: dados.parcelasMax ?? null,
      quartos: dados.quartos ?? null,
      banheiros: dados.banheiros ?? null,
      aceitaFinanciamento: dados.aceitaFinanciamento,
      aceitaMcmv: dados.aceitaMcmv,
      aceitaFgts: dados.aceitaFgts,
      aceitaPermuta: dados.aceitaPermuta,
      aceitaVeiculo: dados.aceitaVeiculo,
      escriturado: dados.escriturado,
      prontoParaConstruir: dados.prontoParaConstruir,
      publicadoEm: dados.publicar ? new Date() : null,
      ...(videoId && {
        videos: {
          create: {
            provedor: 'YOUTUBE',
            videoIdExterno: videoId,
            urlOriginal: dados.linkVideo,
            titulo: dados.titulo,
            destaque: true,
            publicado: true,
          },
        },
      }),
    },
    select: { id: true, slug: true },
  })

  // Sem isto, o imóvel novo só apareceria no site depois de a hora de ISR vencer.
  revalidatePath('/')
  revalidatePath('/imoveis')
  revalidatePath(`/imoveis/${imovel.slug}`)

  redirect(`/admin/imoveis/${imovel.id}?criado=1`)
}

/** Publica ou despublica sem abrir a edição — é o botão mais usado depois do cadastro. */
export async function alternarPublicacao(imovelId: string, publicar: boolean): Promise<void> {
  const sessao = await lerSessao()
  if (!sessao) redirect('/admin/login')

  const imovel = await prisma.imovel.update({
    where: { id: imovelId },
    data: { publicadoEm: publicar ? new Date() : null },
    select: { slug: true },
  })

  revalidatePath('/')
  revalidatePath('/imoveis')
  revalidatePath(`/imoveis/${imovel.slug}`)
  revalidatePath('/admin/imoveis')
}
