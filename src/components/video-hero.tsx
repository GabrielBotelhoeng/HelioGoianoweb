'use client'

import { useState } from 'react'
import Image from 'next/image'
import { thumbYoutube, urlEmbed } from '@/lib/youtube'

type Props = {
  provedor: string
  videoIdExterno: string
  urlThumb?: string | null
  titulo: string
}

/**
 * Fachada de vídeo — PROJETO.md seção 7.
 *
 * Duas regras que o documento trata como inegociáveis:
 *
 * 1. **Vertical, sempre.** Ele edita no CapCut e exporta 9:16. Player 16:9 com tarja
 *    preta em cima e embaixo é o erro clássico aqui.
 * 2. **Iframe só no clique.** Iframe do YouTube carregado de largada destrói o LCP no
 *    celular, e o público inteiro assiste em 4G de cidade pequena.
 *
 * Também não sobrepomos legenda: elas já vêm queimadas no vídeo pelo CapCut.
 */
export function VideoHero({ provedor, videoIdExterno, urlThumb, titulo }: Props) {
  const [tocando, setTocando] = useState(false)

  // Provedor não-YouTube ainda não tem player próprio (Instagram/TikTok são espelho,
  // não canal canônico). Sem embed confiável, não renderiza player nenhum.
  if (provedor !== 'YOUTUBE') return null

  const thumb = urlThumb ?? thumbYoutube(videoIdExterno, 'maxres')

  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-2xl bg-black shadow-lg">
      {tocando ? (
        <iframe
          src={urlEmbed(videoIdExterno)}
          title={titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setTocando(true)}
          aria-label={`Assistir ao vídeo: ${titulo}`}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          <Image
            src={thumb}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 384px"
            className="object-cover"
            priority
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-xl transition-transform group-hover:scale-110">
              <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-marca-800" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
          <span className="absolute right-4 bottom-4 left-4 text-left text-sm font-medium text-white drop-shadow">
            {titulo}
          </span>
        </button>
      )}
    </div>
  )
}
