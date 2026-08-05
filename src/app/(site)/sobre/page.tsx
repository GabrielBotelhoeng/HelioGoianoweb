import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { buscarConfiguracao, linkWhatsappDireto } from '@/lib/config'
import { BotaoWhatsapp } from '@/components/botao-whatsapp'

export const metadata: Metadata = {
  title: 'Sobre o Hélio Goiano — Corretor em Alexânia-GO',
  description:
    'Hélio Goiano, corretor de imóveis em Alexânia-GO, CRECI 11643, com mais de 14 anos ' +
    'de mercado. Lotes, casas financiadas e imóveis comerciais.',
}

export const revalidate = 3600

/**
 * `/sobre` — E-E-A-T e prova social (PROJETO.md seções 9 e 10).
 *
 * O rosto dele é a marca (seção 7): quem chega aqui vindo do Instagram já viu a cara e a
 * voz do Hélio em dezenas de vídeos. A página existe para confirmar que é a mesma pessoa,
 * com CRECI e endereço reais.
 */
export default async function PaginaSobre() {
  const [config, depoimentos] = await Promise.all([
    buscarConfiguracao(),
    prisma.depoimento.findMany({
      where: { publicado: true },
      orderBy: { ordem: 'asc' },
    }),
  ])

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {config.fotoPerfilUrl && (
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full bg-stone-200">
            <Image
              src={config.fotoPerfilUrl}
              alt={config.nomeExibicao}
              fill
              sizes="128px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-carvao-900 sm:text-4xl">
            {config.nomeExibicao}
          </h1>
          <p className="mt-1 font-medium text-marca-700">
            Corretor de imóveis · CRECI {config.creci}
          </p>
          {config.endereco && <p className="mt-1 text-stone-600">{config.endereco}</p>}
        </div>
      </div>

      {config.sobreTexto && (
        <p className="mt-8 max-w-2xl text-lg leading-relaxed whitespace-pre-line text-stone-700">
          {config.sobreTexto}
        </p>
      )}

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <Destaque titulo="Atendimento local">
          Escritório físico em Alexânia, com atendimento presencial e visita agendada aos
          imóveis.
        </Destaque>
        <Destaque titulo="Simulação gratuita">
          Análise de renda, entrada e FGTS para descobrir a parcela antes de você ir ao
          banco.
        </Destaque>
        <Destaque titulo="Financiamento e MCMV">
          Acompanhamento de casas financiadas pela Caixa e pelo Minha Casa Minha Vida.
        </Destaque>
      </section>

      {(config.horarioAtendimento || config.email) && (
        <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">Atendimento</h2>
          <ul className="mt-3 space-y-1 text-stone-700">
            {config.horarioAtendimento && <li>{config.horarioAtendimento}</li>}
            {config.endereco && <li>{config.endereco}</li>}
            {config.email && <li>{config.email}</li>}
          </ul>
          {config.googleMapsUrl && (
            <a
              href={config.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-marca-700 hover:underline"
            >
              Ver no Google Maps →
            </a>
          )}
        </section>
      )}

      {depoimentos.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-stone-900">O que dizem os clientes</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {depoimentos.map((depoimento) => (
              <figure
                key={depoimento.id}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <blockquote className="leading-relaxed text-stone-700">
                  “{depoimento.texto}”
                </blockquote>
                <figcaption className="mt-3 text-sm font-medium text-stone-900">
                  {depoimento.nome}
                  {depoimento.cidade && (
                    <span className="font-normal text-stone-500"> · {depoimento.cidade}</span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 rounded-2xl bg-marca-800 p-6 text-center text-white sm:p-10">
        <h2 className="text-xl font-bold sm:text-2xl">Vamos conversar sobre o seu imóvel?</h2>
        <p className="mx-auto mt-2 max-w-lg text-marca-100">
          Me chame no WhatsApp ou faça sua simulação gratuita agora mesmo.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <BotaoWhatsapp href={linkWhatsappDireto(config)} tamanho="grande" />
          <Link
            href="/simulador"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-4 text-base font-bold text-marca-900"
          >
            Simular financiamento
          </Link>
        </div>
      </section>
    </div>
  )
}

function Destaque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-marca-800">{titulo}</h2>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">{children}</p>
    </div>
  )
}
