import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  taxaMensal,
  pmtPrice,
  pvPrice,
  pvSac,
  primeiraParcelaSac,
  ultimaParcelaSac,
  simular,
  filtrarCompativeis,
  type EntradaSimulacao,
  type ParametrosSimulacao,
} from './simulador'

/** Comparação com tolerância — ponto flutuante não fecha na casa exata. */
function perto(atual: number, esperado: number, tolerancia = 0.01) {
  assert.ok(
    Math.abs(atual - esperado) <= tolerancia,
    `esperava ~${esperado}, recebeu ${atual} (diferença ${Math.abs(atual - esperado)})`,
  )
}

const PARAMS: ParametrosSimulacao = {
  taxaJurosAa: 0.1049,
  comprometimentoMaxPct: 0.3,
  sistema: 'SAC',
}

const ENTRADA: EntradaSimulacao = {
  rendaBrutaFamiliar: 5000,
  valorEntrada: 20000,
  valorFgts: 15000,
  prazoMeses: 360,
}

describe('taxaMensal', () => {
  test('usa equivalência composta, não divisão por 12', () => {
    const i = taxaMensal(0.1049)
    perto(i, 0.0083484, 0.000001)
    // A conta ingênua daria 0.00874. Se alguém "simplificar" para taxaAa/12,
    // este teste quebra — e é para quebrar mesmo.
    assert.notEqual(Math.round(i * 1e6), Math.round((0.1049 / 12) * 1e6))
  })

  test('taxa zero devolve zero', () => {
    perto(taxaMensal(0), 0, 1e-12)
  })
})

describe('PRICE', () => {
  test('pvPrice inverte pmtPrice', () => {
    const i = taxaMensal(0.1049)
    const pv = 200000
    const pmt = pmtPrice(pv, i, 360)
    perto(pvPrice(pmt, i, 360), pv, 0.01)
  })

  test('sem juros, parcela é o principal dividido pelo prazo', () => {
    perto(pmtPrice(120000, 0, 120), 1000)
    perto(pvPrice(1000, 0, 120), 120000)
  })

  test('prazo zero não divide por zero', () => {
    assert.equal(pmtPrice(100000, 0.01, 0), 0)
    assert.equal(pvPrice(1000, 0.01, 0), 0)
  })
})

describe('SAC', () => {
  test('a primeira parcela do PV calculado bate com a parcela máxima', () => {
    // É a propriedade que garante que o cliente consegue pagar o primeiro mês,
    // que é o mês mais caro no SAC.
    const i = taxaMensal(0.1049)
    const parcelaMaxima = 1500
    const pv = pvSac(parcelaMaxima, i, 360)
    perto(primeiraParcelaSac(pv, i, 360), parcelaMaxima, 0.01)
  })

  test('a última parcela é menor que a primeira', () => {
    const i = taxaMensal(0.1049)
    const pv = pvSac(1500, i, 360)
    assert.ok(ultimaParcelaSac(pv, i, 360) < primeiraParcelaSac(pv, i, 360))
  })

  test('prazo zero não divide por zero', () => {
    assert.equal(pvSac(1500, 0.01, 0), 0)
    assert.equal(primeiraParcelaSac(100000, 0.01, 0), 0)
    assert.equal(ultimaParcelaSac(100000, 0.01, 0), 0)
  })
})

describe('simular', () => {
  test('parcela máxima é a fração configurada da renda', () => {
    const r = simular(ENTRADA, PARAMS)
    perto(r.parcelaMaxima, 1500)
  })

  test('poder de compra soma financiável, entrada e FGTS', () => {
    const r = simular(ENTRADA, PARAMS)
    perto(r.poderDeCompra, r.valorFinanciavel + 20000 + 15000, 0.02)
  })

  test('SAC devolve última parcela; PRICE não', () => {
    const sac = simular(ENTRADA, { ...PARAMS, sistema: 'SAC' })
    const price = simular(ENTRADA, { ...PARAMS, sistema: 'PRICE' })
    assert.notEqual(sac.ultimaParcela, null)
    assert.equal(price.ultimaParcela, null)
  })

  test('no PRICE a primeira parcela é a própria parcela máxima', () => {
    const r = simular(ENTRADA, { ...PARAMS, sistema: 'PRICE' })
    perto(r.primeiraParcela, r.parcelaMaxima, 0.02)
  })

  test('SAC financia menos que PRICE para a mesma parcela', () => {
    // Consequência de dimensionar pela primeira parcela, que é a maior.
    const sac = simular(ENTRADA, { ...PARAMS, sistema: 'SAC' })
    const price = simular(ENTRADA, { ...PARAMS, sistema: 'PRICE' })
    assert.ok(sac.valorFinanciavel < price.valorFinanciavel)
  })

  test('renda maior financia mais', () => {
    const menor = simular({ ...ENTRADA, rendaBrutaFamiliar: 3000 }, PARAMS)
    const maior = simular({ ...ENTRADA, rendaBrutaFamiliar: 9000 }, PARAMS)
    assert.ok(maior.valorFinanciavel > menor.valorFinanciavel)
  })

  test('nenhum parâmetro está hardcodado: mudar a taxa muda o resultado', () => {
    const a = simular(ENTRADA, { ...PARAMS, taxaJurosAa: 0.08 })
    const b = simular(ENTRADA, { ...PARAMS, taxaJurosAa: 0.14 })
    assert.ok(a.valorFinanciavel > b.valorFinanciavel)
  })
})

describe('filtrarCompativeis', () => {
  const resultado = simular(ENTRADA, PARAMS)

  const imoveis = [
    { id: 'caro', preco: 999999999, precoSobConsulta: false, aceitaFinanciamento: true },
    { id: 'barato', preco: 35000, precoSobConsulta: false, aceitaFinanciamento: true },
    { id: 'no-teto', preco: resultado.poderDeCompra - 100, precoSobConsulta: false, aceitaFinanciamento: true },
    { id: 'sob-consulta', preco: null, precoSobConsulta: true, aceitaFinanciamento: true },
    { id: 'so-a-vista', preco: 30000, precoSobConsulta: false, aceitaFinanciamento: false },
    { id: 'a-vista-caro', preco: 100000, precoSobConsulta: false, aceitaFinanciamento: false },
  ]

  test('ordena por folga crescente — o mais próximo do teto primeiro', () => {
    const r = filtrarCompativeis(imoveis, resultado, ENTRADA)
    assert.equal(r[0].imovelId, 'no-teto')
    perto(r[0].folga, 100, 1)
  })

  test('descarta o que passa do poder de compra', () => {
    const r = filtrarCompativeis(imoveis, resultado, ENTRADA)
    assert.ok(!r.some((c) => c.imovelId === 'caro'))
  })

  test('descarta preço sob consulta', () => {
    const r = filtrarCompativeis(imoveis, resultado, ENTRADA)
    assert.ok(!r.some((c) => c.imovelId === 'sob-consulta'))
  })

  test('imóvel sem financiamento é medido contra entrada + FGTS, não contra o poder de compra', () => {
    const r = filtrarCompativeis(imoveis, resultado, ENTRADA)
    // entrada + FGTS = 35.000: o de 30 mil cabe, o de 100 mil não.
    assert.ok(r.some((c) => c.imovelId === 'so-a-vista'))
    assert.ok(!r.some((c) => c.imovelId === 'a-vista-caro'))
  })

  test('lista vazia devolve lista vazia', () => {
    assert.deepEqual(filtrarCompativeis([], resultado, ENTRADA), [])
  })
})
