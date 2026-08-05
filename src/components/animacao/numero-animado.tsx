'use client'

import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring, useReducedMotion } from 'motion/react'

/**
 * Contador que sobe até o valor quando entra na viewport.
 *
 * Usa MotionValue escrevendo direto no DOM via ref: o número muda 60 vezes por segundo
 * e passar isso por estado do React re-renderizaria o componente a cada quadro.
 */
export function NumeroAnimado({
  valor,
  sufixo = '',
  className = '',
}: {
  valor: number
  sufixo?: string
  className?: string
}) {
  const referencia = useRef<HTMLSpanElement>(null)
  const naTela = useInView(referencia, { once: true, margin: '-80px' })
  const reduzir = useReducedMotion()

  const bruto = useMotionValue(0)
  const suavizado = useSpring(bruto, { duration: 1400, bounce: 0 })

  useEffect(() => {
    if (naTela) bruto.set(valor)
  }, [naTela, valor, bruto])

  useEffect(() => {
    // O valor final já está no HTML renderizado no servidor: é conteúdo, não enfeite.
    // Quem tem "reduzir movimento" ligado — ou está sem JS — lê o número direto.
    if (reduzir) return

    // Zera só depois de montado, para a contagem começar do zero sem alterar o HTML
    // inicial (mexer nele causaria divergência de hidratação).
    if (referencia.current) referencia.current.textContent = `0${sufixo}`

    return suavizado.on('change', (atual) => {
      if (referencia.current) {
        referencia.current.textContent = `${Math.round(atual).toLocaleString('pt-BR')}${sufixo}`
      }
    })
  }, [suavizado, sufixo, reduzir])

  return (
    <span ref={referencia} className={className}>
      {`${valor.toLocaleString('pt-BR')}${sufixo}`}
    </span>
  )
}
