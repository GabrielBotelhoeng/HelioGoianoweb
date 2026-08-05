'use client'

import { useRef } from 'react'
import { LazyMotion, domAnimation, m, useScroll, useTransform } from 'motion/react'

/**
 * Camada de textura do hero com parallax.
 *
 * A textura sobe mais devagar que o conteúdo e perde opacidade — dá profundidade sem
 * mexer em nada legível. O texto e os CTAs não se movem: parallax em texto atrapalha
 * a leitura e é o erro mais comum desse efeito.
 *
 * `useScroll` + `useTransform` devolvem MotionValues, que escrevem direto no estilo
 * sem re-renderizar o React a cada quadro. Só `transform` e `opacity` são animados,
 * então tudo roda no compositor.
 */
export function HeroParallax() {
  const referencia = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: referencia,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '35%'])
  const opacidade = useTransform(scrollYProgress, [0, 0.8], [1, 0.25])

  return (
    <div ref={referencia} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <LazyMotion features={domAnimation}>
        <m.div className="textura-escura absolute inset-0" style={{ y, opacity: opacidade }} />
      </LazyMotion>
    </div>
  )
}
