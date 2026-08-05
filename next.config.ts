import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
