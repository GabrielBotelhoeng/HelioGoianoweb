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
     * YouTube (thumbnails dos vídeos, PROJETO.md seção 7) e Supabase Storage (fotos
     * dos imóveis).
     *
     * Host não listado aqui quebra em tempo de execução em vez de servir imagem não
     * otimizada silenciosamente — por isso a lista é explícita.
     */
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' },
      // Fotos dos imóveis. O subdomínio é o ref do projeto, então o curinga é
      // necessário — trocar de projeto no Supabase não deve exigir mexer no build.
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
