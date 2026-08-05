import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /**
   * View Transitions não precisam de flag no Next 16: o App Router já usa o canary do
   * React, que traz `<ViewTransition>` (confirmado em
   * `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`).
   * O `experimental.viewTransition` de versões anteriores não existe mais.
   */
  images: {
    /**
     * Só o YouTube por enquanto: os vídeos são hospedados lá (PROJETO.md seção 7) e as
     * thumbnails vêm de `i.ytimg.com`.
     *
     * O storage das fotos (Cloudflare R2 ou Supabase Storage) ainda não foi escolhido —
     * quando for, o host entra aqui. Até lá não existe mídia própria cadastrada, e uma
     * URL de host não listado quebra em tempo de execução em vez de silenciosamente
     * servir imagem não otimizada.
     */
    remotePatterns: [{ protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' }],
  },
}

export default nextConfig
