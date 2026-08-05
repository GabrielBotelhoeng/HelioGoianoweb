import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

/**
 * Seed de desenvolvimento.
 *
 * PROCEDÊNCIA DOS DADOS — leia antes de confiar em qualquer número daqui:
 *
 *   [REAL]  extraído do PROJETO.md, que por sua vez veio dos posts do Instagram dele.
 *   [DEMO]  inventado só para dar volume ao ambiente de desenvolvimento.
 *           TEM QUE SER SUBSTITUÍDO por imóvel real antes de mostrar ao Hélio.
 *   [CONFIRMAR] valor que muda no mundo real (taxa, prazo, regra de programa
 *           habitacional) e que o PROJETO.md manda validar com o Hélio (seção 4).
 *
 * Nada aqui deve ser tratado como informação comercial válida.
 */

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

async function main() {
  console.log('Limpando dados anteriores...')
  // Ordem importa: filhos antes dos pais onde não há cascade.
  await prisma.simulacaoImovel.deleteMany()
  await prisma.simulacao.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.publicacaoGerada.deleteMany()
  await prisma.linkCurto.deleteMany()
  await prisma.proximidade.deleteMany()
  await prisma.imovelMidia.deleteMany()
  await prisma.video.deleteMany()
  await prisma.imovel.deleteMany()
  await prisma.loteamento.deleteMany()
  await prisma.artigo.deleteMany()
  await prisma.depoimento.deleteMany()
  await prisma.parametroSimulador.deleteMany()
  await prisma.configuracaoSite.deleteMany()

  // ---------- CONFIGURAÇÃO DO SITE ----------
  // [REAL] CRECI, cidade e handles vêm do PROJETO.md.
  // [CONFIRMAR] telefone: o documento nunca informa o número. Placeholder proposital —
  // um número errado aqui manda lead para desconhecido.
  console.log('Configuração do site...')
  await prisma.configuracaoSite.create({
    data: {
      id: 'default',
      nomeExibicao: 'Hélio Goiano Corretor',
      creci: '11643',
      telefoneWhatsapp: '5562000000000', // [CONFIRMAR] substituir pelo WhatsApp real
      mensagemWhatsappPadrao:
        'Olá Hélio, tenho interesse no imóvel {codigo} — {titulo}. {link}',
      endereco: 'Av. Brasília, Alexânia - GO', // [REAL]
      horarioAtendimento: 'Segunda a sexta, 8h às 18h · Sábado, 8h às 12h', // [CONFIRMAR]
      sobreTexto:
        'Corretor de imóveis em Alexânia-GO com mais de 14 anos de mercado. ' +
        'Atuação em lotes, casas financiadas pelo Minha Casa Minha Vida e imóveis comerciais. ' +
        'Simulação de financiamento gratuita.', // [REAL] derivado do PROJETO.md
      instagramUrl: 'https://instagram.com/heliogoiano_corretor', // [REAL]
      youtubeUrl: 'https://www.youtube.com/@heliogoianocorretor', // [REAL]
    },
  })

  // ---------- PARÂMETROS DO SIMULADOR ----------
  // PROJETO.md seção 4: "Nada de taxa, prazo ou faixa hardcodado" e
  // "confirme os valores vigentes com o Hélio antes de popular o seed".
  // Os valores abaixo são conservadores e servem só para o simulador rodar em dev.
  console.log('Parâmetros do simulador...')
  await prisma.parametroSimulador.createMany({
    data: [
      {
        chave: 'taxa_juros_aa',
        valor: '0.1049',
        descricao:
          '[CONFIRMAR] Taxa de juros nominal ao ano, em decimal (0.1049 = 10,49% a.a.). ' +
          'Validar com o Hélio a taxa vigente da Caixa antes de ir ao ar.',
      },
      {
        chave: 'comprometimento_max_pct',
        valor: '0.30',
        descricao:
          '[CONFIRMAR] Percentual máximo da renda bruta familiar comprometido com a parcela. ' +
          '30% é o teto usual de mercado.',
      },
      {
        chave: 'prazo_max_meses',
        valor: '420',
        descricao: '[CONFIRMAR] Prazo máximo de financiamento em meses (420 = 35 anos).',
      },
      {
        chave: 'prazo_padrao_meses',
        valor: '360',
        descricao: 'Prazo pré-selecionado no formulário do simulador (360 = 30 anos).',
      },
      {
        chave: 'sistema_padrao',
        valor: 'SAC',
        descricao:
          'Sistema de amortização padrão. SAC ou PRICE. No SAC a primeira parcela é a maior, ' +
          'e é ela que precisa caber no comprometimento.',
      },
      {
        chave: 'disclaimer_simulacao',
        valor:
          'Esta é uma estimativa, não é proposta de crédito e não substitui a análise do banco. ' +
          'Valores sujeitos a aprovação, alteração de taxa e conferência de documentação.',
        descricao: 'Texto obrigatório exibido junto ao resultado (PROJETO.md seção 4 e 10).',
      },
    ],
  })

  // ---------- LOTEAMENTOS ----------
  // [REAL] Jardim Esperança e Piemonte são citados no PROJETO.md, com
  // "entrada facilitada, asfalto/água/energia".
  console.log('Loteamentos...')
  const jardimEsperanca = await prisma.loteamento.create({
    data: {
      slug: 'jardim-esperanca-alexania',
      nome: 'Jardim Esperança',
      descricao:
        'Loteamento em Alexânia com infraestrutura entregue: asfalto, água e energia. ' +
        'Entrada facilitada e parcelamento direto.',
      status: 'EM_VENDAS',
      bairro: 'Jardim Esperança',
      temAsfalto: true,
      temAgua: true,
      temEnergia: true,
      destaque: true,
    },
  })

  const piemonte = await prisma.loteamento.create({
    data: {
      slug: 'piemonte-alexania',
      nome: 'Piemonte',
      descricao: 'Loteamento em Alexânia com entrada facilitada e parcelamento direto.',
      status: 'EM_VENDAS',
      bairro: 'Piemonte',
      temAsfalto: true,
      temAgua: true,
      temEnergia: true,
    },
  })

  // ---------- IMÓVEIS ----------
  console.log('Imóveis...')

  // [REAL] "Jardim Esperança 15x30 (450 m²) — R$ 88 mil"
  const lote15x30 = await prisma.imovel.create({
    data: {
      codigo: 'HG-0001',
      slug: 'lote-15x30-jardim-esperanca-alexania-hg-0001',
      titulo: 'Lote 15x30 no Jardim Esperança',
      descricao:
        'Lote de 450 m² (15x30) no Jardim Esperança, em Alexânia. Rua asfaltada, ' +
        'água e energia na porta, pronto para construir. Entrada facilitada e ' +
        'parcelamento direto com o proprietário.',
      tipo: 'LOTE',
      finalidade: 'VENDA',
      status: 'DISPONIVEL',
      loteamentoId: jardimEsperanca.id,
      bairro: 'Jardim Esperança',
      areaTerrenoM2: '450.00',
      frenteM: '15.00',
      fundoM: '30.00',
      dimensoesTexto: '15x30',
      preco: '88000.00',
      aceitaFinanciamento: true,
      aceitaFgts: true,
      aceitaPermuta: true,
      aceitaVeiculo: true, // [REAL] "aceitamos carro no negócio"
      entradaMinima: '8800.00', // [DEMO] proporção plausível, confirmar
      parcelasMax: 120,
      escriturado: true,
      registrado: true,
      temAsfalto: true,
      temAgua: true,
      temEnergia: true,
      prontoParaConstruir: true,
      destaque: true,
      ordem: 1,
      metaTitle: 'Lote 15x30 no Jardim Esperança, Alexânia - GO | R$ 88.000',
      metaDescription:
        'Lote de 450 m² no Jardim Esperança em Alexânia. Asfalto, água e energia. ' +
        'Entrada facilitada, aceita financiamento, FGTS e veículo na negociação.',
      publicadoEm: new Date(),
      proximidades: {
        create: [
          // [REAL] referências citadas no PROJETO.md
          { nome: 'Colégio 31 de Março', tipo: 'ESCOLA' },
          { nome: 'Fórum de Alexânia', tipo: 'PUBLICO' },
        ],
      },
    },
  })

  // [REAL] "7,5x30 (225 m²) — R$ 35 mil"
  const lote7x30 = await prisma.imovel.create({
    data: {
      codigo: 'HG-0002',
      slug: 'lote-7-5x30-jardim-esperanca-alexania-hg-0002',
      titulo: 'Lote 7,5x30 no Jardim Esperança',
      descricao:
        'Lote de 225 m² (7,5x30) no Jardim Esperança, em Alexânia. ' +
        'Opção de menor entrada para quem quer sair do aluguel e começar a construir.',
      tipo: 'LOTE',
      finalidade: 'VENDA',
      status: 'DISPONIVEL',
      loteamentoId: jardimEsperanca.id,
      bairro: 'Jardim Esperança',
      areaTerrenoM2: '225.00',
      frenteM: '7.50',
      fundoM: '30.00',
      dimensoesTexto: '7,5x30',
      preco: '35000.00',
      aceitaFinanciamento: true,
      aceitaFgts: true,
      aceitaPermuta: true,
      aceitaVeiculo: true,
      entradaMinima: '3500.00', // [DEMO]
      parcelasMax: 100,
      escriturado: true,
      registrado: true,
      temAsfalto: true,
      temAgua: true,
      temEnergia: true,
      prontoParaConstruir: true,
      destaque: true,
      ordem: 2,
      metaTitle: 'Lote 7,5x30 no Jardim Esperança, Alexânia - GO | R$ 35.000',
      metaDescription:
        'Lote de 225 m² no Jardim Esperança em Alexânia por R$ 35 mil. ' +
        'Entrada facilitada e parcelamento direto. Pronto para construir.',
      publicadoEm: new Date(),
      proximidades: {
        create: [{ nome: 'Colégio 31 de Março', tipo: 'ESCOLA' }],
      },
    },
  })

  // [REAL] "2 salas comerciais + apartamento na Av. Brasília — R$ 1,5 mi"
  const salaComercial = await prisma.imovel.create({
    data: {
      codigo: 'HG-0003',
      slug: 'salas-comerciais-apartamento-av-brasilia-alexania-hg-0003',
      titulo: 'Duas salas comerciais com apartamento na Av. Brasília',
      descricao:
        'Imóvel comercial na Av. Brasília, principal avenida de Alexânia: duas salas ' +
        'comerciais no térreo e um apartamento no pavimento superior. Ponto de alto fluxo, ' +
        'ideal para renda.',
      tipo: 'SALA_COMERCIAL',
      finalidade: 'VENDA',
      status: 'DISPONIVEL',
      logradouro: 'Av. Brasília',
      bairro: 'Centro',
      preco: '1500000.00',
      aceitaPermuta: true,
      escriturado: true,
      registrado: true,
      temHabiteSe: true,
      ordem: 3,
      metaTitle: 'Salas comerciais e apartamento na Av. Brasília, Alexânia - GO',
      metaDescription:
        'Duas salas comerciais com apartamento na Av. Brasília, Alexânia. ' +
        'Ponto de alto fluxo, ideal para investimento e renda.',
      publicadoEm: new Date(),
      proximidades: {
        create: [{ nome: 'Fórum de Alexânia', tipo: 'PUBLICO' }],
      },
    },
  })

  // [DEMO] O PROJETO.md cita "casa financiada MCMV / foco em sair do aluguel" como
  // categoria da carteira, mas não traz nenhum imóvel concreto. Este registro existe
  // só para exercitar filtros de quartos/banheiros e o matching do simulador.
  const casaMcmv = await prisma.imovel.create({
    data: {
      codigo: 'HG-0004',
      slug: 'casa-2-quartos-alexania-hg-0004',
      titulo: '[DEMO] Casa de 2 quartos com financiamento Minha Casa Minha Vida',
      descricao:
        'REGISTRO DEMONSTRATIVO — substituir por imóvel real. ' +
        'Casa de 2 quartos em Alexânia, aceita financiamento pelo Minha Casa Minha Vida. ' +
        'Saia do aluguel com entrada facilitada e use seu FGTS.',
      tipo: 'CASA',
      finalidade: 'VENDA',
      status: 'DISPONIVEL',
      bairro: 'Jardim Esperança',
      loteamentoId: jardimEsperanca.id,
      areaTerrenoM2: '200.00',
      areaConstruidaM2: '60.00',
      quartos: 2,
      banheiros: 1,
      vagas: 1,
      preco: '185000.00',
      aceitaFinanciamento: true,
      aceitaMcmv: true,
      aceitaFgts: true,
      entradaMinima: '18500.00',
      parcelasMax: 360,
      escriturado: true,
      registrado: true,
      temHabiteSe: true,
      temAsfalto: true,
      temAgua: true,
      temEnergia: true,
      ordem: 4,
      publicadoEm: new Date(),
    },
  })

  // [DEMO] mesma observação: "sítio/chácara — ocorrência menor" é categoria, não imóvel.
  const chacara = await prisma.imovel.create({
    data: {
      codigo: 'HG-0005',
      slug: 'chacara-alexania-hg-0005',
      titulo: '[DEMO] Chácara em Alexânia',
      descricao:
        'REGISTRO DEMONSTRATIVO — substituir por imóvel real. ' +
        'Chácara em Alexânia com água e energia, boa topografia.',
      tipo: 'CHACARA',
      finalidade: 'VENDA',
      status: 'DISPONIVEL',
      loteamentoId: piemonte.id,
      bairro: 'Zona rural',
      areaTerrenoM2: '20000.00',
      preco: '320000.00',
      aceitaPermuta: true,
      aceitaVeiculo: true,
      escriturado: true,
      temAgua: true,
      temEnergia: true,
      ordem: 5,
      publicadoEm: new Date(),
    },
  })

  console.log(
    `  ${[lote15x30, lote7x30, salaComercial, casaMcmv, chacara].length} imóveis criados`,
  )

  // ---------- VÍDEO ----------
  // O PROJETO.md dá o ID do CANAL (UClYwSehU-cxFb5DJ2JtlLTw) mas nenhum ID de vídeo.
  // Não invento ID: um ID falso renderiza player quebrado e mascara bug real.
  // A ingestão pelo feed RSS (seção 7) preenche isso de verdade.
  console.log('Vídeos: nenhum semeado — IDs reais virão do feed RSS do canal.')

  // ---------- DEPOIMENTOS ----------
  console.log('Depoimentos: nenhum semeado — precisam vir de clientes reais.')

  console.log('\nSeed concluído.')
  console.log('ATENÇÃO: revisar itens marcados [CONFIRMAR] e [DEMO] antes de qualquer demo.')
}

main()
  .catch((error) => {
    console.error('Seed falhou:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
