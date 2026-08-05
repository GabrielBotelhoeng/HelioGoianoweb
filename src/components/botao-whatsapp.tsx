import { IconeWhatsapp } from '@/components/icone-whatsapp'

type Props = {
  /** Quando informado, o clique passa por `/ir/whatsapp` e é contabilizado. */
  imovelId?: string
  /** Destino direto, para CTA sem imóvel associado (header, contato). */
  href?: string
  children?: React.ReactNode
  tamanho?: 'normal' | 'grande'
  className?: string
}

/**
 * CTA de conversa. É o fim do funil inteiro do site (PROJETO.md seção 8): o cliente não
 * digita nada e o Hélio recebe o código do imóvel já na primeira linha da mensagem.
 *
 * Com `imovelId` o link aponta para a rota interna que incrementa `cliquesWhatsapp`
 * antes de redirecionar — sem depender de JavaScript.
 */
export function BotaoWhatsapp({
  imovelId,
  href,
  children = 'Falar no WhatsApp',
  tamanho = 'normal',
  className = '',
}: Props) {
  const destino = imovelId ? `/ir/whatsapp?imovel=${encodeURIComponent(imovelId)}` : (href ?? '#')

  const dimensoes =
    tamanho === 'grande' ? 'px-6 py-4 text-base gap-2.5' : 'px-4 py-2.5 text-sm gap-2'

  return (
    <a
      href={destino}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center rounded-full bg-zap-500 font-semibold text-white shadow-sm transition-colors hover:bg-zap-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zap-600 ${dimensoes} ${className}`}
    >
      <IconeWhatsapp className="h-5 w-5 fill-current" />
      {children}
    </a>
  )
}
