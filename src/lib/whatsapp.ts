/**
 * Deep link de WhatsApp com contexto — PROJETO.md seção 8.
 *
 * Todo CTA do site cai no WhatsApp com a mensagem já preenchida. É o funil inteiro:
 * o cliente não digita nada, e o Hélio recebe o código do imóvel já na primeira linha.
 */

/** Placeholders aceitos em `ConfiguracaoSite.mensagemWhatsappPadrao`. */
export type ContextoMensagem = {
  codigo?: string
  titulo?: string
  link?: string
}

/**
 * Reduz o telefone a dígitos e garante o DDI 55.
 * Aceita "(62) 9 9999-9999", "62999999999", "+55 62 99999-9999".
 */
export function normalizarTelefone(telefone: string): string {
  const digitos = telefone.replace(/\D/g, '')
  if (digitos.startsWith('55')) return digitos
  return `55${digitos}`
}

/**
 * Interpola o template da configuração. Placeholder sem valor correspondente é
 * removido junto com espaço adjacente, para não sobrar "{link}" cru na mensagem.
 */
export function montarMensagem(template: string, contexto: ContextoMensagem): string {
  return template
    .replace(/\{codigo\}/g, contexto.codigo ?? '')
    .replace(/\{titulo\}/g, contexto.titulo ?? '')
    .replace(/\{link\}/g, contexto.link ?? '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/**
 * Monta a URL final do wa.me.
 *
 * NOTA: este link é o destino. Quem incrementa `cliquesWhatsapp` é a rota que
 * intercepta o clique — a métrica é o que prova o valor do site na renovação
 * da mensalidade (PROJETO.md seção 8), então não pode depender de JS no cliente.
 */
export function montarLinkWhatsapp(
  telefone: string,
  template: string,
  contexto: ContextoMensagem = {},
): string {
  const numero = normalizarTelefone(telefone)
  const texto = montarMensagem(template, contexto)
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
}
