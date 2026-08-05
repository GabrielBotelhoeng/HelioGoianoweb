'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { lerSessao } from '@/lib/auth'
import { caminhoDaUrl, enviarArquivo, removerArquivos } from '@/lib/storage'

/**
 * Fotos do imóvel — PROJETO.md seção 6, passo 2.
 *
 * As imagens chegam JÁ COMPRIMIDAS pelo navegador (ver `upload-fotos.tsx`). O servidor
 * não redimensiona: o documento é explícito que a compressão acontece no cliente,
 * porque a conexão de campo é ruim e subir 4 MB de foto original pelo 4G de Alexânia
 * é o que faria ele desistir do cadastro.
 */

const TAMANHO_MAXIMO = 3 * 1024 * 1024 // 3 MB por foto, já comprimida
const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp']

export type EstadoUpload = { erro?: string; enviadas?: number }

export async function enviarFotos(
  _anterior: EstadoUpload,
  formData: FormData,
): Promise<EstadoUpload> {
  const sessao = await lerSessao()
  if (!sessao) return { erro: 'Sessão expirada. Entre novamente.' }

  const imovelId = String(formData.get('imovelId') ?? '')
  const arquivos = formData.getAll('fotos').filter((item): item is File => item instanceof File)

  if (!imovelId) return { erro: 'Imóvel não informado.' }
  if (arquivos.length === 0) return { erro: 'Selecione pelo menos uma foto.' }

  const imovel = await prisma.imovel.findUnique({
    where: { id: imovelId },
    select: { id: true, codigo: true, slug: true, _count: { select: { midias: true } } },
  })

  if (!imovel) return { erro: 'Imóvel não encontrado.' }

  let ordem = imovel._count.midias
  let enviadas = 0

  for (const arquivo of arquivos) {
    if (arquivo.size === 0) continue

    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      return { erro: `"${arquivo.name}" não é uma imagem aceita (use JPG, PNG ou WEBP).` }
    }

    if (arquivo.size > TAMANHO_MAXIMO) {
      return {
        erro: `"${arquivo.name}" ficou grande demais mesmo depois de comprimida. Tente outra foto.`,
      }
    }

    try {
      const enviado = await enviarArquivo(arquivo, { codigoImovel: imovel.codigo })

      await prisma.imovelMidia.create({
        data: {
          imovelId: imovel.id,
          url: enviado.url,
          tipo: 'FOTO',
          ordem,
          // A primeira foto do imóvel vira capa sozinha: é ela que aparece no card e no
          // preview do WhatsApp, e ele não deveria precisar escolher para publicar.
          isCapa: ordem === 0,
        },
      })

      ordem += 1
      enviadas += 1
    } catch (erro) {
      // Falha no meio de um lote não descarta o que já subiu.
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao enviar a foto.'
      revalidarTudo(imovel.slug)
      return { erro: mensagem, enviadas }
    }
  }

  revalidarTudo(imovel.slug)
  return { enviadas }
}

export async function definirCapa(midiaId: string): Promise<void> {
  const sessao = await lerSessao()
  if (!sessao) return

  const midia = await prisma.imovelMidia.findUnique({
    where: { id: midiaId },
    select: { imovelId: true, imovel: { select: { slug: true } } },
  })

  if (!midia) return

  // Transação: por um instante duas fotos seriam capa, e a listagem pega `take: 1`.
  await prisma.$transaction([
    prisma.imovelMidia.updateMany({
      where: { imovelId: midia.imovelId },
      data: { isCapa: false },
    }),
    prisma.imovelMidia.update({ where: { id: midiaId }, data: { isCapa: true } }),
  ])

  revalidarTudo(midia.imovel.slug)
}

export async function removerFoto(midiaId: string): Promise<void> {
  const sessao = await lerSessao()
  if (!sessao) return

  const midia = await prisma.imovelMidia.findUnique({
    where: { id: midiaId },
    select: { id: true, url: true, isCapa: true, imovelId: true, imovel: { select: { slug: true } } },
  })

  if (!midia) return

  await prisma.imovelMidia.delete({ where: { id: midia.id } })

  const caminho = caminhoDaUrl(midia.url)
  if (caminho) await removerArquivos([caminho])

  // Apagar a capa não pode deixar o imóvel sem capa: promove a próxima foto.
  if (midia.isCapa) {
    const proxima = await prisma.imovelMidia.findFirst({
      where: { imovelId: midia.imovelId },
      orderBy: { ordem: 'asc' },
      select: { id: true },
    })

    if (proxima) {
      await prisma.imovelMidia.update({ where: { id: proxima.id }, data: { isCapa: true } })
    }
  }

  revalidarTudo(midia.imovel.slug)
}

function revalidarTudo(slug: string) {
  revalidatePath('/')
  revalidatePath('/imoveis')
  revalidatePath(`/imoveis/${slug}`)
  revalidatePath('/admin/imoveis')
}
