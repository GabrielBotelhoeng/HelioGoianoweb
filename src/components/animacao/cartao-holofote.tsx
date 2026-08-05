'use client'

import { useRef } from 'react'
import { useMotionValue, useMotionTemplate, LazyMotion, domAnimation, m } from 'motion/react'

/**
 * Holofote que segue o cursor sobre uma superfície escura.
 *
 * É o hover "com intenção" que a direção pede: um gesto forte no elemento que decide
 * (o card do imóvel em destaque), em vez de micro-animação espalhada por toda a tela.
 *
 * A posição do mouse vai para MotionValues e daí direto para o gradiente via
 * `useMotionTemplate` — nenhum estado do React, nenhum re-render por movimento.
 * Em toque não há hover, então o efeito simplesmente não aparece: nada quebra.
 */
export function CartaoHolofote({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const referencia = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const fundo = useMotionTemplate`radial-gradient(320px circle at ${x}px ${y}px, rgba(227,189,92,0.16), transparent 70%)`

  return (
    <LazyMotion features={domAnimation}>
      <div
        ref={referencia}
        onMouseMove={(evento) => {
          const area = referencia.current?.getBoundingClientRect()
          if (!area) return
          x.set(evento.clientX - area.left)
          y.set(evento.clientY - area.top)
        }}
        className={`group relative overflow-hidden ${className}`}
      >
        <m.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: fundo }}
        />
        <div className="relative">{children}</div>
      </div>
    </LazyMotion>
  )
}
