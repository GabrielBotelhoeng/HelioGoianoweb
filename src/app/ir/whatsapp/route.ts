import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buscarConfiguracao } from '@/lib/config'
import { montarLinkWhatsapp } from '@/lib/whatsapp'
import { urlAbsoluta } from '@/lib/seo'

/**
 * Intermediário de todo CTA de WhatsApp que parte de um imóvel — PROJETO.md seção 8:
 * "Incrementar `cliquesWhatsapp` antes de redirecionar. É a métrica que prova o valor
 * do site pro cliente na renovação da mensalidade."
 *
 * Por que uma rota e não um `onClick`: a métrica não pode depender de JavaScript no
 * cliente. Link é link — funciona com JS desligado, em webview de Instagram e quando o
 * 4G derruba o bundle.
 *
 * SEGURANÇA: o destino é montado no servidor a partir do banco. A querystring só
 * informa QUAL imóvel; ela nunca carrega o telefone nem o texto. Aceitar isso do
 * cliente transformaria a rota em redirect aberto — um link do domínio do Hélio levando
 * para qualquer número de WhatsApp.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const imovelId = searchParams.get('imovel')

  const config = await buscarConfiguracao()

  if (!imovelId) {
    return NextResponse.redirect(
      montarLinkWhatsapp(config.telefoneWhatsapp, config.mensagemWhatsappPadrao),
    )
  }

  const imovel = await prisma.imovel.findUnique({
    where: { id: imovelId },
    select: { id: true, codigo: true, titulo: true, slug: true },
  })

  if (!imovel) {
    // Imóvel apagado e link velho ainda circulando no WhatsApp: manda a conversa
    // genérica em vez de erro. O contato vale mais que a precisão da mensagem.
    return NextResponse.redirect(
      montarLinkWhatsapp(config.telefoneWhatsapp, config.mensagemWhatsappPadrao),
    )
  }

  // Falha de contador não pode impedir o redirecionamento: perder a métrica é ruim,
  // perder o lead é inaceitável.
  await prisma.imovel
    .update({ where: { id: imovel.id }, data: { cliquesWhatsapp: { increment: 1 } } })
    .catch((erro) => {
      console.error('Falha ao contabilizar clique de WhatsApp:', erro)
    })

  const destino = montarLinkWhatsapp(config.telefoneWhatsapp, config.mensagemWhatsappPadrao, {
    codigo: imovel.codigo,
    titulo: imovel.titulo,
    link: urlAbsoluta(`/imoveis/${imovel.slug}`),
  })

  return NextResponse.redirect(destino)
}
