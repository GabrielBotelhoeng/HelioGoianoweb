import { thumbYoutube, urlWatch, urlEmbed, duracaoISO } from '@/lib/youtube'

/**
 * JSON-LD — PROJETO.md seção 9.
 *
 * O `VideoObject` é o item de maior retorno do projeto: o Google mostra miniatura de
 * vídeo no resultado e não existe concorrência disputando vídeo para busca imobiliária
 * em Alexânia.
 *
 * REGRA CRÍTICA: só emitir VideoObject para vídeo `indexavel`. Vídeo não listado no
 * YouTube (o caso da trilha licenciada, seção 7) não é rastreável — marcá-lo geraria
 * JSON-LD apontando para conteúdo inacessível, que o Google penaliza.
 */

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
)

export function urlAbsoluta(caminho: string): string {
  return `${siteUrl}${caminho.startsWith('/') ? caminho : `/${caminho}`}`
}

type Config = {
  nomeExibicao: string
  creci: string
  telefoneWhatsapp: string
  endereco?: string | null
  horarioAtendimento?: string | null
  email?: string | null
  fotoPerfilUrl?: string | null
  instagramUrl?: string | null
  youtubeUrl?: string | null
  facebookUrl?: string | null
  googleMapsUrl?: string | null
}

/**
 * RealEstateAgent (subtipo de LocalBusiness) — vai no rodapé de todo o site.
 * O CRECI entra como identificador: é exigência da profissão para publicidade
 * imobiliária (seção 10) e reforça E-E-A-T.
 */
export function jsonLdCorretor(config: Config) {
  const perfis = [config.instagramUrl, config.youtubeUrl, config.facebookUrl].filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${siteUrl}/#corretor`,
    name: config.nomeExibicao,
    url: siteUrl,
    identifier: `CRECI ${config.creci}`,
    telephone: `+${config.telefoneWhatsapp.replace(/\D/g, '')}`,
    ...(config.email && { email: config.email }),
    ...(config.fotoPerfilUrl && { image: config.fotoPerfilUrl }),
    ...(config.horarioAtendimento && { openingHours: config.horarioAtendimento }),
    ...(config.googleMapsUrl && { hasMap: config.googleMapsUrl }),
    ...(perfis.length > 0 && { sameAs: perfis }),
    address: {
      '@type': 'PostalAddress',
      ...(config.endereco && { streetAddress: config.endereco }),
      addressLocality: 'Alexânia',
      addressRegion: 'GO',
      addressCountry: 'BR',
    },
    areaServed: {
      '@type': 'City',
      name: 'Alexânia',
    },
  }
}

type ImovelSeo = {
  codigo: string
  slug: string
  titulo: string
  descricao?: string | null
  tipo: string
  bairro?: string | null
  cidade: string
  uf: string
  logradouro?: string | null
  cep?: string | null
  latitude?: number | null
  longitude?: number | null
  mostrarEnderecoExato: boolean
  preco?: number | null
  precoSobConsulta: boolean
  areaTerrenoM2?: number | null
  areaConstruidaM2?: number | null
  quartos?: number | null
  banheiros?: number | null
  publicadoEm?: Date | null
  midias: { url: string }[]
}

/** RealEstateListing da página do imóvel. */
export function jsonLdImovel(imovel: ImovelSeo, config: Config) {
  const url = urlAbsoluta(`/imoveis/${imovel.slug}`)
  const area = imovel.areaConstruidaM2 ?? imovel.areaTerrenoM2

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': url,
    url,
    name: imovel.titulo,
    ...(imovel.descricao && { description: imovel.descricao }),
    ...(imovel.publicadoEm && { datePosted: imovel.publicadoEm.toISOString() }),
    ...(imovel.midias.length > 0 && { image: imovel.midias.map((m) => m.url) }),
    about: {
      '@type': 'Accommodation',
      name: imovel.titulo,
      identifier: imovel.codigo,
      address: {
        '@type': 'PostalAddress',
        // Só publicar o logradouro quando o corretor autorizou: às vezes ele
        // divulga apenas a região (campo `mostrarEnderecoExato`).
        ...(imovel.mostrarEnderecoExato && imovel.logradouro && {
          streetAddress: imovel.logradouro,
        }),
        ...(imovel.bairro && { addressLocality: imovel.bairro }),
        addressRegion: imovel.uf,
        addressCountry: 'BR',
        ...(imovel.mostrarEnderecoExato && imovel.cep && { postalCode: imovel.cep }),
      },
      ...(imovel.mostrarEnderecoExato && imovel.latitude && imovel.longitude && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: imovel.latitude,
          longitude: imovel.longitude,
        },
      }),
      ...(area && {
        floorSize: { '@type': 'QuantitativeValue', value: area, unitCode: 'MTK' },
      }),
      ...(imovel.quartos && { numberOfRooms: imovel.quartos }),
      ...(imovel.banheiros && { numberOfBathroomsTotal: imovel.banheiros }),
    },
    // Sem preço não se emite Offer: Offer sem price é marcação inválida.
    ...(!imovel.precoSobConsulta && imovel.preco
      ? {
          offers: {
            '@type': 'Offer',
            price: imovel.preco,
            priceCurrency: 'BRL',
            availability: 'https://schema.org/InStock',
            seller: { '@id': `${siteUrl}/#corretor` },
          },
        }
      : {}),
    provider: { '@id': `${siteUrl}/#corretor` },
  }
}

type VideoSeo = {
  provedor: string
  videoIdExterno: string
  urlThumb?: string | null
  titulo: string
  descricao?: string | null
  transcricao?: string | null
  duracaoSegundos?: number | null
  indexavel: boolean
  publicado: boolean
  publicadoEm?: Date | null
  criadoEm: Date
}

/**
 * VideoObject. Devolve null quando o vídeo não deve ser marcado — o chamador
 * simplesmente não renderiza a tag.
 */
export function jsonLdVideo(video: VideoSeo, paginaUrl: string) {
  // O portão da seção 7: não listado no YouTube não é indexável.
  if (!video.indexavel || !video.publicado) return null
  if (video.provedor !== 'YOUTUBE') return null

  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.titulo,
    description: video.descricao ?? video.transcricao?.slice(0, 500) ?? video.titulo,
    thumbnailUrl: video.urlThumb ?? thumbYoutube(video.videoIdExterno, 'maxres'),
    uploadDate: (video.publicadoEm ?? video.criadoEm).toISOString(),
    ...(duracaoISO(video.duracaoSegundos) && { duration: duracaoISO(video.duracaoSegundos) }),
    contentUrl: urlWatch(video.videoIdExterno),
    embedUrl: urlEmbed(video.videoIdExterno),
    ...(video.transcricao && { transcript: video.transcricao }),
    mainEntityOfPage: paginaUrl,
  }
}

export function jsonLdBreadcrumb(trilha: { nome: string; caminho: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trilha.map((item, indice) => ({
      '@type': 'ListItem',
      position: indice + 1,
      name: item.nome,
      item: urlAbsoluta(item.caminho),
    })),
  }
}
