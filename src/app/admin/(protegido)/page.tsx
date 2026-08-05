import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { lerSessao } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Painel',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Dashboard — PROJETO.md seção 12: "Ele achar caro por não ver valor" é um risco
 * listado, e a mitigação é justamente esta tela: cliques no WhatsApp, leads e
 * simulações do mês. É o que sustenta a conversa de renovação da mensalidade.
 */
export default async function PaginaAdmin() {
  const sessao = await lerSessao()

  const inicioDoMes = new Date()
  inicioDoMes.setDate(1)
  inicioDoMes.setHours(0, 0, 0, 0)

  const [publicados, rascunhos, leadsNovos, simulacoesDoMes, cliques] = await Promise.all([
    prisma.imovel.count({ where: { publicadoEm: { not: null }, status: 'DISPONIVEL' } }),
    prisma.imovel.count({ where: { publicadoEm: null } }),
    prisma.lead.count({ where: { status: 'NOVO' } }),
    prisma.simulacao.count({ where: { criadoEm: { gte: inicioDoMes } } }),
    prisma.imovel.aggregate({ _sum: { cliquesWhatsapp: true } }),
  ])

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-carvao-900">
        Olá, {sessao?.nome.split(' ')[0]}
      </h1>
      <p className="mt-1 text-sm text-stone-600">Como está o site este mês.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Indicador valor={cliques._sum.cliquesWhatsapp ?? 0} rotulo="cliques no WhatsApp" destaque />
        <Indicador valor={simulacoesDoMes} rotulo="simulações no mês" />
        <Indicador valor={leadsNovos} rotulo="contatos novos" />
        <Indicador valor={publicados} rotulo="imóveis no ar" />
        <Indicador valor={rascunhos} rotulo="rascunhos" />
      </div>

      <div className="mt-8 rounded-2xl bg-carvao-900 p-6 text-white">
        <h2 className="font-display text-lg font-semibold">Cadastrar um imóvel novo</h2>
        <p className="mt-1 text-sm text-white/60">
          Dá para fazer na frente do imóvel, pelo celular. Só tipo e título são obrigatórios.
        </p>
        <Link
          href="/admin/imoveis/novo"
          className="mt-4 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-carvao-950"
        >
          Cadastrar agora
        </Link>
      </div>
    </div>
  )
}

function Indicador({
  valor,
  rotulo,
  destaque,
}: {
  valor: number
  rotulo: string
  destaque?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        destaque ? 'border-marca-200 bg-marca-50' : 'border-stone-200 bg-white'
      }`}
    >
      <p
        className={`font-display text-3xl font-extrabold ${
          destaque ? 'text-marca-800' : 'text-carvao-900'
        }`}
      >
        {valor}
      </p>
      <p className="mt-0.5 text-xs tracking-wide text-stone-500 uppercase">{rotulo}</p>
    </div>
  )
}
