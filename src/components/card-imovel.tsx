import Image from 'next/image'
import Link from 'next/link'
import type { ImovelListado } from '@/lib/imoveis'
import { formatarBRL } from '@/lib/formato'
import {
  imagemDeCapa,
  resumoCaracteristicas,
  resumoDimensoes,
  resumoLocalizacao,
  rotuloTipo,
} from '@/lib/apresentacao'

/**
 * Card da listagem e da home.
 *
 * Hierarquia deliberada: preço grande, e logo abaixo entrada e parcela. O comprador
 * dele decide pela entrada e pela parcela, não pelo valor total nem pelo m²
 * (PROJETO.md seção 1) — inverter isso seria copiar portal imobiliário.
 */
export function CardImovel({ imovel }: { imovel: ImovelListado }) {
  const capa = imagemDeCapa(imovel)
  const dimensoes = resumoDimensoes(imovel)
  const caracteristicas = resumoCaracteristicas(imovel)
  const temVideo = imovel.videos.length > 0

  return (
    <Link
      href={`/imoveis/${imovel.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-marca-900">
        {capa ? (
          <Image
            src={capa.url}
            alt={capa.alt ?? imovel.titulo}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          // Sem foto cadastrada: bloco da marca com o código, em vez de imagem quebrada
          // ou de um ícone genérico de "sem imagem".
          <div className="flex h-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-marca-700 to-marca-900 text-marca-100">
            <span className="text-xs font-medium tracking-widest uppercase opacity-80">
              {rotuloTipo(imovel.tipo)}
            </span>
            <span className="font-mono text-lg font-semibold">{imovel.codigo}</span>
          </div>
        )}

        <div className="absolute top-3 left-3 flex gap-2">
          {imovel.destaque && (
            <span className="rounded-full bg-oferta-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
              Destaque
            </span>
          )}
          {temVideo && (
            <span className="rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
              ▶ Vídeo
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">
            {rotuloTipo(imovel.tipo)} · {resumoLocalizacao(imovel)}
          </p>
          <h3 className="mt-1 line-clamp-2 text-base leading-snug font-semibold text-stone-900">
            {imovel.titulo}
          </h3>
        </div>

        {(dimensoes || caracteristicas) && (
          <p className="text-sm text-stone-600">{[dimensoes, caracteristicas].filter(Boolean).join(' · ')}</p>
        )}

        <div className="mt-auto">
          <p className="text-xl font-bold text-marca-800">
            {imovel.precoSobConsulta ? 'Sob consulta' : formatarBRL(imovel.preco)}
          </p>

          {(imovel.entradaMinima || imovel.valorParcela) && (
            <p className="mt-0.5 text-sm font-medium text-oferta-600">
              {imovel.entradaMinima && `Entrada ${formatarBRL(imovel.entradaMinima)}`}
              {imovel.entradaMinima && imovel.valorParcela && ' · '}
              {imovel.valorParcela &&
                `${imovel.parcelasMax ? `${imovel.parcelasMax}x de ` : 'Parcelas de '}${formatarBRL(imovel.valorParcela)}`}
            </p>
          )}

          {!imovel.valorParcela && imovel.parcelasMax && (
            <p className="mt-0.5 text-sm font-medium text-oferta-600">
              Parcelamento em até {imovel.parcelasMax}x
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {imovel.aceitaMcmv && <Selo>Minha Casa Minha Vida</Selo>}
          {imovel.aceitaFinanciamento && <Selo>Financiamento</Selo>}
          {imovel.aceitaVeiculo && <Selo>Aceita carro</Selo>}
        </div>
      </div>
    </Link>
  )
}

function Selo({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-marca-50 px-2 py-0.5 text-[11px] font-medium text-marca-800">
      {children}
    </span>
  )
}
