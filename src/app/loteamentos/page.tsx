import type { Metadata } from 'next'
import { listarLoteamentos } from '@/lib/loteamentos'
import { toPlain } from '@/lib/serialize'
import { CardLoteamento } from '@/components/card-loteamento'
import { BotaoWhatsapp } from '@/components/botao-whatsapp'
import { buscarConfiguracao, linkWhatsappDireto } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Loteamentos em Alexânia-GO',
  description:
    'Loteamentos em Alexânia com infraestrutura entregue, entrada facilitada e ' +
    'parcelamento direto. Jardim Esperança, Piemonte e outros.',
}

export const revalidate = 3600

export default async function PaginaLoteamentos() {
  const [registros, config] = await Promise.all([listarLoteamentos(), buscarConfiguracao()])
  const loteamentos = toPlain(registros)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
          Loteamentos em Alexânia
        </h1>
        <p className="mt-2 text-stone-600">
          Terreno próprio com entrada facilitada e parcelamento direto, em bairros com
          asfalto, água e energia já entregues.
        </p>
      </header>

      {loteamentos.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {loteamentos.map((loteamento) => (
            <CardLoteamento key={loteamento.id} loteamento={loteamento} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">
            Nenhum loteamento publicado no momento
          </h2>
          <p className="mx-auto mt-2 max-w-md text-stone-600">
            Me chame no WhatsApp que eu falo sobre os lotes disponíveis agora.
          </p>
          <div className="mt-5 flex justify-center">
            <BotaoWhatsapp href={linkWhatsappDireto(config)} tamanho="grande" />
          </div>
        </div>
      )}
    </div>
  )
}
