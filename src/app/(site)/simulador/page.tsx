import type { Metadata } from 'next'
import { carregarParametros, prazosDisponiveis } from '@/lib/parametros'
import { buscarConfiguracao, linkWhatsappDireto } from '@/lib/config'
import { SimuladorForm } from '@/components/simulador-form'

export const metadata: Metadata = {
  title: 'Simulador de financiamento gratuito',
  description:
    'Descubra em um minuto quanto você consegue financiar, qual a parcela estimada e ' +
    'quais imóveis em Alexânia-GO cabem no seu bolso. Simulação gratuita, sem cadastro.',
}

/**
 * `/simulador` — o recurso central do produto (PROJETO.md seções 1 e 4).
 *
 * Substitui a simulação que o Hélio faz à mão no direct do Instagram. Os parâmetros são
 * lidos do banco a cada requisição: quando ele corrigir a taxa no admin, o simulador
 * muda na hora, sem deploy e sem cache velho decidindo crédito de ninguém.
 */
export const dynamic = 'force-dynamic'

export default async function PaginaSimulador() {
  const [parametros, config] = await Promise.all([carregarParametros(), buscarConfiguracao()])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-carvao-900 sm:text-4xl">
          Simulador de financiamento
        </h1>
        <p className="mt-2 text-stone-600">
          Informe sua renda e o que você tem de entrada. Em um minuto você vê a parcela
          estimada e os imóveis que cabem no seu bolso — sem cadastro e sem custo.
        </p>
      </header>

      <div className="mt-8">
        <SimuladorForm
          prazos={prazosDisponiveis(parametros.prazoMaxMeses)}
          prazoPadraoMeses={parametros.prazoPadraoMeses}
          disclaimer={parametros.disclaimer}
          linkWhatsapp={linkWhatsappDireto(config)}
        />
      </div>
    </div>
  )
}
