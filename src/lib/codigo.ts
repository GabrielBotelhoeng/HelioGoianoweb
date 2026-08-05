import { prisma } from '@/lib/prisma'
import { formatarCodigo } from '@/lib/slug'

/**
 * Código sequencial do imóvel (HG-0142).
 *
 * É a identidade que o Hélio usa fora do site: ele fala esse número no WhatsApp e
 * escreve na legenda do Instagram. Precisa ser curto, sequencial e previsível — nada
 * de UUID na cara do cliente.
 *
 * A montagem de slug vive em `@/lib/slug` porque é função pura; aqui fica só o que
 * depende do banco.
 */
export async function proximoCodigo(): Promise<string> {
  const ultimo = await prisma.imovel.findFirst({
    where: { codigo: { startsWith: 'HG-' } },
    orderBy: { codigo: 'desc' },
    select: { codigo: true },
  })

  // Lê o maior código existente em vez de contar registros: contagem quebraria se um
  // imóvel fosse apagado, reaproveitando um código que já circulou no WhatsApp.
  const numero = ultimo ? Number(ultimo.codigo.replace('HG-', '')) : 0
  const proximo = Number.isFinite(numero) ? numero + 1 : 1

  return formatarCodigo(proximo)
}

export { montarSlug, paraSlug } from '@/lib/slug'
