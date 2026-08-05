import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { montarLinkWhatsapp, type ContextoMensagem } from '@/lib/whatsapp'

/**
 * `ConfiguracaoSite` é registro único (id "default") e aparece em toda página:
 * telefone no header, CRECI no rodapé, JSON-LD do corretor.
 *
 * `cache` do React deduplica a leitura dentro de um mesmo render — layout, página e
 * rodapé pedem a configuração e o banco é consultado uma vez só.
 */
export const buscarConfiguracao = cache(async () => {
  const config = await prisma.configuracaoSite.findUnique({ where: { id: 'default' } })

  if (!config) {
    // Sem configuração não há telefone para o CTA nem CRECI para o rodapé — e CRECI
    // visível é exigência legal (PROJETO.md seção 10). Falhar alto é melhor que
    // publicar página irregular com campos vazios.
    throw new Error(
      'ConfiguracaoSite "default" não encontrada. Rode `npm run db:seed` ou crie o registro no admin.',
    )
  }

  return config
})

export type Configuracao = Awaited<ReturnType<typeof buscarConfiguracao>>

/**
 * Link de WhatsApp já interpolado com o template da configuração.
 *
 * Para CTA de imóvel prefira `/ir/whatsapp` (route handler), que contabiliza o clique
 * antes de redirecionar. Este atalho serve aos CTAs sem imóvel associado — header,
 * rodapé, página de contato — onde não há contador a incrementar.
 */
export function linkWhatsappDireto(config: Configuracao, contexto: ContextoMensagem = {}) {
  return montarLinkWhatsapp(config.telefoneWhatsapp, config.mensagemWhatsappPadrao, contexto)
}
