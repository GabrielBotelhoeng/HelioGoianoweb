/**
 * Slug e formatação de código — funções puras, SEM dependência do Prisma.
 *
 * Ficam separadas de `codigo.ts` (que consulta o banco para descobrir o próximo
 * código) pelo mesmo motivo que `formatarBRL` saiu de `serialize.ts`: importar o
 * cliente do banco só para montar uma string arrasta o Prisma para onde ele não
 * deveria estar — inclusive para dentro dos testes, que passariam a exigir
 * DATABASE_URL para verificar uma função de texto.
 */

/** Remove acentos e reduz a texto seguro para URL. */
export function paraSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // tira os diacríticos separados pelo NFD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/**
 * Slug único a partir do título, com o código no fim:
 * "lote-15x30-jardim-esperanca-alexania-hg-0142"
 *
 * O código no fim garante unicidade sem sufixo numérico feio e ainda ajuda o Hélio a
 * reconhecer o imóvel pela própria URL.
 */
export function montarSlug(partes: {
  titulo: string
  bairro?: string | null
  cidade?: string | null
  codigo: string
}): string {
  const texto = [partes.titulo, partes.bairro, partes.cidade, partes.codigo]
    .filter(Boolean)
    .map((pedaco) => paraSlug(String(pedaco)))
    .filter((pedaco) => pedaco.length > 0)
    .join('-')

  /**
   * Deduplica PALAVRA a palavra, não bloco a bloco.
   *
   * "Lote 12x25 no Piemonte" + bairro "Piemonte" gerava
   * `lote-12x25-no-piemonte-piemonte-alexania-hg-0006` — o bairro repetido, porque
   * comparar blocos inteiros nunca acusa a colisão. Como o título quase sempre já cita
   * o bairro, isso aconteceria na maioria dos cadastros.
   *
   * Palavras de até dois caracteres ("no", "da") passam sem deduplicação: repetem-se
   * legitimamente e removê-las quebraria a leitura da URL.
   */
  const vistas = new Set<string>()
  const palavras: string[] = []

  for (const palavra of texto.split('-')) {
    if (palavra.length <= 2 || !vistas.has(palavra)) {
      if (palavra.length > 2) vistas.add(palavra)
      palavras.push(palavra)
    }
  }

  return palavras.join('-')
}

/** Formata o número sequencial no padrão que ele fala no WhatsApp: HG-0142. */
export function formatarCodigo(numero: number): string {
  return `HG-${String(numero).padStart(4, '0')}`
}
