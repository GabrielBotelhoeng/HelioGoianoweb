'use client'

import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring, useReducedMotion } from 'motion/react'

/**
 * Contador que sobe até o valor quando entra na viewport.
 *
 * O valor final vem renderizado do servidor e só é zerado quando a contagem vai mesmo
 * acontecer. Motivo: com a aba em segundo plano o Chrome congela
 * requestAnimationFrame — o contador zerava e ficava parado em "0+" até a aba voltar
 * ao primeiro plano. Reproduzido no navegador.
 *
 * Usa MotionValue escrevendo direto no DOM: o número muda a cada quadro e passar isso
 * por estado do React re-renderizaria o componente 60 vezes por segundo.
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

  const textoFinal = `${valor.toLocaleString('pt-BR')}${sufixo}`

  useEffect(() => {
    if (naTela) bruto.set(valor)
  }, [naTela, valor, bruto])

  useEffect(() => {
    // Sem animação: o número já está correto no HTML, nada a fazer.
    if (reduzir) return

    const elemento = referencia.current
    if (!elemento) return

    // Só zera quando a página está visível de fato. Zerar com a aba oculta deixaria
    // o contador travado em "0" — o quadro seguinte nunca chegaria.
    if (document.visibilityState !== 'visible') return

    elemento.textContent = `0${sufixo}`

    const cancelar = suavizado.on('change', (atual) => {
      elemento.textContent = `${Math.round(atual).toLocaleString('pt-BR')}${sufixo}`
    })

    // Rede de segurança: se a aba for escondida no meio da contagem, ao voltar o
    // número é fixado no valor final em vez de ficar parado em um passo intermediário.
    const aoVoltar = () => {
      if (document.visibilityState === 'visible' && naTela) {
        elemento.textContent = textoFinal
      }
    }
    document.addEventListener('visibilitychange', aoVoltar)

    return () => {
      cancelar()
      document.removeEventListener('visibilitychange', aoVoltar)
    }
  }, [suavizado, sufixo, reduzir, naTela, textoFinal])

  return (
    <span ref={referencia} className={className}>
      {textoFinal}
    </span>
  )
}
