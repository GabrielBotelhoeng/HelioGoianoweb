'use client'

import { MotionConfig } from 'motion/react'

/**
 * Configuração global do Motion.
 *
 * `reducedMotion="user"` faz o Motion desligar sozinho as animações de posição e escala
 * para quem marcou "reduzir movimento" no sistema, mantendo as de opacidade.
 *
 * POR QUE ISSO EM VEZ DE `if (useReducedMotion()) return <versão sem animação>`:
 * a preferência só é conhecida no cliente. Bifurcar a árvore com base nela faz o
 * servidor renderizar um HTML e o cliente outro — erro de hidratação, que foi
 * exatamente o que aconteceu aqui. Com `MotionConfig`, a árvore é sempre a mesma e só
 * o comportamento da animação muda.
 *
 * É um Client Component que envolve `children`, mas os filhos continuam sendo Server
 * Components: eles chegam prontos como slot, sem virar cliente.
 */
export function ProvedorMotion({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
