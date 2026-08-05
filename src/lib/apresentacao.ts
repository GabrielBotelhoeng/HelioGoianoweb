import { thumbYoutube } from '@/lib/youtube'

/**
 * Regras de exibição compartilhadas entre card, listagem e página do imóvel.
 *
 * Vive fora dos componentes porque o admin (fase 4) e os textos gerados por IA (fase 5)
 * vão precisar das mesmas frases — "15x30 · 450 m²" tem que sair igual no site e no
 * post que ele cola no Instagram.
 */

export const ROTULO_TIPO: Record<string, string> = {
  LOTE: 'Lote',
  CASA: 'Casa',
  APARTAMENTO: 'Apartamento',
  SALA_COMERCIAL: 'Sala comercial',
  GALPAO: 'Galpão',
  SITIO: 'Sítio',
  CHACARA: 'Chácara',
  FAZENDA: 'Fazenda',
}

export function rotuloTipo(tipo: string): string {
  return ROTULO_TIPO[tipo] ?? tipo
}

/** Área em m² com separador de milhar e sem casas decimais inúteis ("450 m²"). */
export function formatarArea(area: number | null | undefined): string | null {
  if (area === null || area === undefined) return null
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(area)} m²`
}

type Dimensoes = {
  dimensoesTexto?: string | null
  areaTerrenoM2?: number | null
  areaConstruidaM2?: number | null
}

/**
 * PROJETO.md seção 5: "`dimensoesTexto` importa mais que m² pro público dele".
 * Por isso "15x30" vem primeiro e o m² entra como complemento, não como manchete.
 */
export function resumoDimensoes(imovel: Dimensoes): string | null {
  const partes: string[] = []

  if (imovel.dimensoesTexto) partes.push(imovel.dimensoesTexto)

  const terreno = formatarArea(imovel.areaTerrenoM2)
  if (terreno) partes.push(imovel.dimensoesTexto ? terreno : `Terreno ${terreno}`)

  const construida = formatarArea(imovel.areaConstruidaM2)
  if (construida) partes.push(`${construida} construídos`)

  return partes.length > 0 ? partes.join(' · ') : null
}

type Caracteristicas = {
  quartos?: number | null
  banheiros?: number | null
  vagas?: number | null
}

/** Só devolve o que existe: lote não tem quarto, e "0 quartos" polui o card. */
export function resumoCaracteristicas(imovel: Caracteristicas): string | null {
  const partes: string[] = []

  if (imovel.quartos) partes.push(`${imovel.quartos} ${imovel.quartos === 1 ? 'quarto' : 'quartos'}`)
  if (imovel.banheiros)
    partes.push(`${imovel.banheiros} ${imovel.banheiros === 1 ? 'banheiro' : 'banheiros'}`)
  if (imovel.vagas) partes.push(`${imovel.vagas} ${imovel.vagas === 1 ? 'vaga' : 'vagas'}`)

  return partes.length > 0 ? partes.join(' · ') : null
}

type Localizacao = {
  bairro?: string | null
  cidade: string
  uf?: string | null
}

export function resumoLocalizacao(imovel: Localizacao): string {
  const cidadeUf = imovel.uf ? `${imovel.cidade} - ${imovel.uf}` : imovel.cidade
  return imovel.bairro ? `${imovel.bairro}, ${cidadeUf}` : cidadeUf
}

type FonteDeImagem = {
  midias?: { url: string; urlThumb?: string | null; legenda?: string | null }[]
  videos?: { provedor: string; videoIdExterno: string; urlThumb?: string | null }[]
}

/**
 * Imagem de abertura do card.
 *
 * Ordem: foto de capa > thumb do vídeo > thumb gerada pelo YouTube. Devolve null quando
 * não há nada — o chamador desenha o placeholder em vez de renderizar `<img>` quebrada.
 * Enquanto o Hélio não cadastra fotos, o caso null é o caminho normal, não a exceção.
 */
export function imagemDeCapa(imovel: FonteDeImagem): { url: string; alt: string | null } | null {
  const capa = imovel.midias?.[0]
  if (capa) return { url: capa.urlThumb ?? capa.url, alt: capa.legenda ?? null }

  const video = imovel.videos?.[0]
  if (video) {
    if (video.urlThumb) return { url: video.urlThumb, alt: null }
    if (video.provedor === 'YOUTUBE') return { url: thumbYoutube(video.videoIdExterno), alt: null }
  }

  return null
}

type Condicoes = {
  aceitaFinanciamento?: boolean
  aceitaMcmv?: boolean
  aceitaFgts?: boolean
  aceitaPermuta?: boolean
  aceitaVeiculo?: boolean
  escriturado?: boolean
  prontoParaConstruir?: boolean
}

/**
 * Selos de condição, na ordem em que o público dele decide: primeiro como paga,
 * depois a situação do documento. "Aceita carro" é argumento real de venda aqui,
 * não curiosidade (PROJETO.md seção 1).
 */
export function selosDeCondicao(imovel: Condicoes): string[] {
  const selos: string[] = []

  if (imovel.aceitaMcmv) selos.push('Minha Casa Minha Vida')
  if (imovel.aceitaFinanciamento) selos.push('Aceita financiamento')
  if (imovel.aceitaFgts) selos.push('Aceita FGTS')
  if (imovel.aceitaVeiculo) selos.push('Aceita carro na negociação')
  if (imovel.aceitaPermuta) selos.push('Aceita permuta')
  if (imovel.prontoParaConstruir) selos.push('Pronto para construir')
  if (imovel.escriturado) selos.push('Escriturado')

  return selos
}
