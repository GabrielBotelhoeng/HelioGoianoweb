import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { paraSlug } from '@/lib/slug'

/**
 * Storage de mídia no Supabase — PROJETO.md seção 2.
 *
 * Só o servidor fala com o storage, e com a SERVICE ROLE KEY. Essa chave ignora RLS e
 * dá poder total sobre o projeto: se ela chegar ao navegador, qualquer pessoa apaga ou
 * substitui as fotos do Hélio. Por isso `server-only` no topo — o build falha se algum
 * componente cliente importar este arquivo por engano.
 *
 * O bucket é PÚBLICO para leitura: são fotos de anúncio, feitas para circular. URL
 * assinada aqui só criaria expiração para imagem que precisa aparecer no Google e no
 * preview do WhatsApp.
 */

const BUCKET = 'imoveis'

function cliente() {
  const url = process.env.SUPABASE_URL
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !chave) {
    throw new Error(
      'SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não configuradas. ' +
        'Crie o projeto no Supabase, um bucket público chamado "imoveis" e preencha o .env.',
    )
  }

  return createClient(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Configurado? Permite a interface avisar em vez de estourar erro na cara do Hélio. */
export function storageConfigurado(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export type ArquivoEnviado = {
  url: string
  caminho: string
  largura?: number
  altura?: number
}

/**
 * Sobe um arquivo e devolve a URL pública.
 *
 * O caminho inclui o código do imóvel e um sufixo aleatório: agrupa as fotos por imóvel
 * (fácil de auditar no painel do Supabase) e impede que dois envios com o mesmo nome de
 * arquivo — "IMG_0001.jpg" sai igual de qualquer celular — sobrescrevam um ao outro.
 */
export async function enviarArquivo(
  arquivo: File,
  opcoes: { codigoImovel: string },
): Promise<ArquivoEnviado> {
  const supabase = cliente()

  const extensao = (arquivo.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const nomeBase = paraSlug(arquivo.name.replace(/\.[^.]+$/, '')).slice(0, 40) || 'foto'
  const sufixo = crypto.randomUUID().slice(0, 8)
  const caminho = `${opcoes.codigoImovel}/${nomeBase}-${sufixo}.${extensao}`

  const { error } = await supabase.storage.from(BUCKET).upload(caminho, arquivo, {
    contentType: arquivo.type || 'image/jpeg',
    // Um ano de cache: a URL é única por upload, então trocar a foto gera outra URL.
    cacheControl: '31536000',
    upsert: false,
  })

  if (error) {
    throw new Error(`Falha ao enviar "${arquivo.name}": ${error.message}`)
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(caminho)

  return { url: data.publicUrl, caminho }
}

/**
 * Remove arquivos do bucket.
 *
 * Não lança: apagar o registro do banco é mais importante que apagar o arquivo. Um
 * arquivo órfão custa centavos; um registro fantasma aparece como foto quebrada no site.
 */
export async function removerArquivos(caminhos: string[]): Promise<void> {
  if (caminhos.length === 0) return

  try {
    const supabase = cliente()
    const { error } = await supabase.storage.from(BUCKET).remove(caminhos)
    if (error) console.error('Falha ao remover arquivos do storage:', error.message)
  } catch (erro) {
    console.error('Storage indisponível ao remover arquivos:', erro)
  }
}

/**
 * Extrai o caminho interno a partir da URL pública salva no banco.
 * Necessário porque `ImovelMidia` guarda a URL, não o caminho do bucket.
 */
export function caminhoDaUrl(url: string): string | null {
  const marcador = `/storage/v1/object/public/${BUCKET}/`
  const posicao = url.indexOf(marcador)

  if (posicao === -1) return null

  return decodeURIComponent(url.slice(posicao + marcador.length))
}
