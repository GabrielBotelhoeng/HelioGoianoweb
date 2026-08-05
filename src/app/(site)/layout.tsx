import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ProvedorMotion } from '@/components/animacao/provedor-motion'

/**
 * Moldura do site público: header, rodapé e configuração de movimento.
 *
 * POR QUE ESTE GRUPO EXISTE: antes o layout raiz aplicava header e rodapé a TODAS as
 * rotas — inclusive `/admin`, que aparecia com o menu do site e o rodapé com CRECI em
 * volta do painel. O route group `(site)` não altera as URLs (`/imoveis` continua
 * `/imoveis`), mas separa o que é público do que é ferramenta interna.
 */
export default function LayoutSite({ children }: { children: React.ReactNode }) {
  return (
    <ProvedorMotion>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </ProvedorMotion>
  )
}
