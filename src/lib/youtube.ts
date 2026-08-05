/**
 * YouTube como CDN de vídeo — PROJETO.md seção 7.
 *
 * Não hospedamos arquivo de vídeo. Guardamos `videoIdExterno` e montamos as URLs
 * aqui. Três razões no documento: custo zero de banda, entrega adaptativa (o público
 * dele assiste em 4G de cidade pequena) e o vídeo passa a existir na busca do Google.
 */

/** Canal do Hélio (PROJETO.md seção 7). Usado pela ingestão via feed RSS. */
export const CANAL_ID = 'UClYwSehU-cxFb5DJ2JtlLTw'

/** Feed público do canal: sem API key, sem cota, sem app review. */
export const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CANAL_ID}`

/**
 * Extrai o ID de vídeo das formas que o Hélio vai colar no admin.
 * Cobre watch?v=, youtu.be/, /shorts/ e /embed/. Retorna null se não reconhecer —
 * o admin mostra erro em vez de salvar lixo.
 */
export function extrairVideoId(entrada: string): string | null {
  const texto = entrada.trim()

  // Já é um ID puro (11 caracteres do alfabeto do YouTube).
  if (/^[\w-]{11}$/.test(texto)) return texto

  const padroes = [
    /[?&]v=([\w-]{11})/, // youtube.com/watch?v=ID
    /youtu\.be\/([\w-]{11})/, // youtu.be/ID
    /\/shorts\/([\w-]{11})/, // youtube.com/shorts/ID  <- formato vertical dele
    /\/embed\/([\w-]{11})/, // youtube.com/embed/ID
    /\/live\/([\w-]{11})/, // youtube.com/live/ID
  ]

  for (const padrao of padroes) {
    const encontrado = texto.match(padrao)
    if (encontrado) return encontrado[1]
  }

  return null
}

/**
 * Thumbnail do YouTube. Serve de fallback quando `Video.urlThumb` está vazio.
 * `maxresdefault` nem sempre existe; `hqdefault` existe sempre.
 */
export function thumbYoutube(videoId: string, qualidade: 'hq' | 'maxres' = 'hq'): string {
  const arquivo = qualidade === 'maxres' ? 'maxresdefault' : 'hqdefault'
  return `https://i.ytimg.com/vi/${videoId}/${arquivo}.jpg`
}

/**
 * URL de embed usada pela fachada.
 *
 * IMPORTANTE (PROJETO.md seção 7): o iframe só é injetado no clique. Iframe direto
 * destrói o LCP no celular, e performance aqui não é vaidade — é o público inteiro em 4G.
 * Por isso `autoplay=1`: quando este URL é usado, o usuário JÁ clicou.
 * Domínio nocookie para não plantar cookie de tracking antes do consentimento.
 */
export function urlEmbed(videoId: string): string {
  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0', // não sugerir vídeo de terceiro no fim
    modestbranding: '1',
    playsinline: '1', // não estourar em fullscreen no iOS
  })
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`
}

/** URL canônica para JSON-LD e compartilhamento. */
export function urlWatch(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

/** Converte segundos para duração ISO 8601 (PT1M30S), exigida pelo VideoObject. */
export function duracaoISO(segundos: number | null | undefined): string | undefined {
  if (!segundos || segundos <= 0) return undefined
  const horas = Math.floor(segundos / 3600)
  const minutos = Math.floor((segundos % 3600) / 60)
  const resto = segundos % 60
  return `PT${horas ? `${horas}H` : ''}${minutos ? `${minutos}M` : ''}${resto ? `${resto}S` : ''}`
}
