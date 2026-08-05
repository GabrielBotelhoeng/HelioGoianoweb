import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { montarSlug, paraSlug } from './slug'

describe('paraSlug', () => {
  it('remove acentos e cedilha', () => {
    assert.equal(paraSlug('Jardim Esperança'), 'jardim-esperanca')
    assert.equal(paraSlug('Alexânia'), 'alexania')
    assert.equal(paraSlug('São João do Óleo'), 'sao-joao-do-oleo')
  })

  it('colapsa separadores e apara as pontas', () => {
    assert.equal(paraSlug('  Lote   15x30 —  Centro  '), 'lote-15x30-centro')
  })

  it('preserva dimensões, que o público usa para reconhecer o imóvel', () => {
    assert.ok(paraSlug('Lote 7,5x30').includes('7-5x30'))
  })
})

describe('montarSlug', () => {
  it('junta título, bairro, cidade e código', () => {
    assert.equal(
      montarSlug({
        titulo: 'Lote 15x30',
        bairro: 'Jardim Esperança',
        cidade: 'Alexânia',
        codigo: 'HG-0001',
      }),
      'lote-15x30-jardim-esperanca-alexania-hg-0001',
    )
  })

  it('não repete o bairro quando o título já o cita', () => {
    // Caso real: o cadastro HG-0006 gerou "piemonte-piemonte" antes desta regra.
    const slug = montarSlug({
      titulo: 'Lote 12x25 no Piemonte',
      bairro: 'Piemonte',
      cidade: 'Alexânia',
      codigo: 'HG-0006',
    })

    assert.equal(slug, 'lote-12x25-no-piemonte-alexania-hg-0006')
    assert.equal(slug.match(/piemonte/g)?.length, 1)
  })

  it('funciona sem bairro', () => {
    assert.equal(
      montarSlug({ titulo: 'Chácara', cidade: 'Alexânia', codigo: 'HG-0005' }),
      'chacara-alexania-hg-0005',
    )
  })

  it('mantém palavras curtas repetidas, que dão sentido à frase', () => {
    const slug = montarSlug({
      titulo: 'Casa no centro de Alexânia',
      bairro: 'Centro',
      cidade: 'Alexânia',
      codigo: 'HG-0010',
    })

    // "de" e "no" permanecem; "centro" e "alexania" não se repetem.
    assert.equal(slug.match(/centro/g)?.length, 1)
    assert.equal(slug.match(/alexania/g)?.length, 1)
  })

  it('termina sempre com o código, que é como ele identifica o imóvel', () => {
    const slug = montarSlug({ titulo: 'Qualquer', codigo: 'HG-0142' })
    assert.ok(slug.endsWith('hg-0142'))
  })
})
