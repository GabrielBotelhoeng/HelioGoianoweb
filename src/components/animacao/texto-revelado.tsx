import { Fragment } from 'react'

/**
 * Manchete revelada palavra por palavra por trás de uma máscara.
 *
 * SERVER COMPONENT, de propósito — nem 'use client', nem JavaScript. A animação é
 * CSS (`.palavra-revelada` em globals.css), com o atraso de cada palavra vindo da
 * variável `--indice`.
 *
 * POR QUE NÃO MOTION AQUI: esta é a manchete do hero, ou seja, o LCP da página. Com
 * Motion, o estado inicial era `translateY(110%)` aplicado por JavaScript — se o
 * script demorasse, falhasse, ou a aba abrisse em segundo plano (o Chrome congela
 * requestAnimationFrame nesse caso), o visitante via o título cortado pela metade.
 * Reproduzido no navegador: as palavras congelaram em translateY(26px) e (53px).
 *
 * Em CSS, sem animação o texto simplesmente aparece. É a diferença entre um efeito
 * que enfeita e um efeito que esconde a promessa da página.
 */
export function TextoRevelado({
  texto,
  destaque,
  className = '',
  classNameDestaque = '',
}: {
  texto: string
  /** Trecho final que recebe tratamento próprio (o dourado da manchete). */
  destaque?: string
  className?: string
  classNameDestaque?: string
}) {
  const palavras = texto.split(' ')
  const palavrasDestaque = destaque ? destaque.split(' ') : []

  return (
    <span className={className}>
      {palavras.map((palavra, indice) => (
        <Palavra key={`base-${indice}`} indice={indice}>
          {palavra}
        </Palavra>
      ))}
      {palavrasDestaque.map((palavra, indice) => (
        <Palavra
          key={`destaque-${indice}`}
          indice={palavras.length + indice}
          className={classNameDestaque}
        >
          {palavra}
        </Palavra>
      ))}
    </span>
  )
}

function Palavra({
  children,
  indice,
  className = '',
}: {
  children: string
  indice: number
  className?: string
}) {
  return (
    <Fragment>
      {/* `overflow-hidden` é a máscara; o span interno desliza por trás dela. */}
      <span className="inline-block overflow-hidden pb-[0.14em] align-bottom">
        <span
          className={`palavra-revelada inline-block ${className}`}
          style={{ '--indice': indice } as React.CSSProperties}
        >
          {children}
        </span>
      </span>{' '}
    </Fragment>
  )
}
