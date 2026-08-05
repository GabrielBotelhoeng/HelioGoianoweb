---
name: motion-animations
description: Animação em React com a biblioteca Motion (ex-Framer Motion) — scroll-driven, gestos, layout, springs e transições de página. Use ao adicionar movimento a uma interface React/Next.js, ao decidir entre CSS e JS para uma animação, ou ao investigar animação travada, LCP ruim por causa de animação, ou hidratação quebrada em Server Components.
license: MIT
metadata:
  author: Gabriel Botelho
  version: "1.0.0"
  verificado-em: "2026-08-05"
  pacote: motion@13
---

# Motion (ex-Framer Motion)

**O nome mudou.** `framer-motion` virou `motion`. Instalação e import:

```bash
npm install motion
```

```tsx
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react'
```

Importar de `framer-motion` ainda resolve, mas é o nome antigo — em projeto novo use `motion/react`.

## A regra que evita 90% dos bugs em Next.js App Router

Todo componente que usa `motion` precisa de `'use client'`. Motion depende de estado, efeitos e refs — nada disso existe em Server Component.

Isso tem um custo real: marcar uma página inteira como cliente para animar um título joga fora o RSC daquela árvore. **Isole a animação em um componente cliente pequeno** e mantenha a página como Server Component:

```tsx
// ✅ components/titulo-animado.tsx
'use client'
import { motion } from 'motion/react'

export function TituloAnimado({ children }: { children: React.ReactNode }) {
  return (
    <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
      {children}
    </motion.h1>
  )
}

// ✅ app/page.tsx continua Server Component
import { TituloAnimado } from '@/components/titulo-animado'
export default async function Page() {
  const dados = await buscarDados()   // continua no servidor
  return <TituloAnimado>{dados.titulo}</TituloAnimado>
}
```

Um componente cliente **pode receber Server Components como `children`** — use isso para envolver conteúdo pesado em um wrapper animado sem arrastá-lo para o cliente.

## Antes de instalar: isto precisa mesmo de JS?

Motion custa ~34 KB gzip (o import completo). Muita animação de site institucional já é possível sem JS nenhum:

| Efeito | CSS puro resolve? |
|---|---|
| Fade/rise ao entrar na viewport | **Sim** — `animation-timeline: view()` |
| Barra de progresso do scroll | **Sim** — `animation-timeline: scroll()` |
| Hover, foco, transição de cor | **Sim** |
| Transição entre páginas | **Sim** — View Transitions API |
| Parallax simples | **Sim** — `animation-timeline: scroll()` |
| Reordenação com layout animado | Não — use `layout` do Motion |
| Arrastar, gesto, física de mola | Não — use Motion |
| Orquestração encadeada com estado | Não — use Motion |
| Sair da árvore com animação (unmount) | Não — use `AnimatePresence` |

**Scroll-driven animations em CSS têm suporte amplo em navegadores modernos** e custam zero KB. Quando o alvo é público em rede lenta, comece por elas e traga o Motion só para o que a lista acima marca como "não".

Para reduzir o peso quando o Motion é necessário, use `LazyMotion` com features carregadas sob demanda:

```tsx
import { LazyMotion, domAnimation, m } from 'motion/react'

// `m` no lugar de `motion` + domAnimation ≈ 6 KB em vez de ~34 KB
<LazyMotion features={domAnimation}>
  <m.div animate={{ opacity: 1 }} />
</LazyMotion>
```

## Padrões que valem a pena

### Revelar ao entrar na viewport

```tsx
<motion.section
  initial={{ opacity: 0, y: 32 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}   // once: não repete ao voltar
  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
/>
```

`once: true` quase sempre é o que se quer: animação que repete a cada rolagem cansa.

### Cascata (stagger) em lista

```tsx
const container = {
  hidden: {},
  visivel: { transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  visivel: { opacity: 1, y: 0 },
}

<motion.ul variants={container} initial="hidden" whileInView="visivel" viewport={{ once: true }}>
  {itens.map((i) => <motion.li key={i.id} variants={item} />)}
</motion.ul>
```

Passe `variants` no pai e os filhos herdam o estado — não repita `initial`/`animate` em cada filho.

### Parallax e efeitos ligados ao scroll

```tsx
const alvo = useRef<HTMLDivElement>(null)
const { scrollYProgress } = useScroll({ target: alvo, offset: ['start end', 'end start'] })
const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

<motion.div ref={alvo} style={{ y }} />
```

`useScroll` + `useTransform` devolvem MotionValues: mudam **fora** do ciclo de render do React, sem re-renderizar o componente. Nunca faça `scrollYProgress.get()` dentro do render para calcular estilo — isso perde a otimização inteira.

### Layout animado

```tsx
<motion.div layout />                    // anima mudança de posição/tamanho
<motion.div layoutId="card-1" />         // transição compartilhada entre telas
```

`layout` é caro: usa transform para simular mudança de layout. Use em poucos elementos por vez.

### Sair da árvore

```tsx
<AnimatePresence mode="wait">
  {aberto && <motion.div key="modal" exit={{ opacity: 0 }} />}
</AnimatePresence>
```

Filho direto precisa de `key` estável, senão a saída não dispara.

## Performance — o que não negociar

1. **Anime apenas `transform` e `opacity`.** `width`, `height`, `top`, `left`, `margin` disparam layout a cada quadro e derrubam o FPS no celular. Para mudar tamanho, use `scale`.
2. **Não anime nada acima da dobra no primeiro paint.** Elemento com `initial={{ opacity: 0 }}` no hero atrasa o LCP e, se o JS falhar, o conteúdo nunca aparece. Para o hero, prefira CSS ou anime só o que não é o LCP.
3. **`will-change` só durante a animação.** Deixar fixo consome memória de GPU à toa.
4. **Meça no aparelho real**, não no desktop com throttling.

## Acessibilidade — obrigatório, não opcional

```tsx
import { useReducedMotion } from 'motion/react'

const reduzir = useReducedMotion()
<motion.div animate={{ x: reduzir ? 0 : 100 }} transition={{ duration: reduzir ? 0 : 0.5 }} />
```

Quem marcou "reduzir movimento" no sistema pode ter distúrbio vestibular: parallax e movimento grande causam enjoo real. `useReducedMotion` lê a preferência; respeite-a desligando deslocamento e mantendo no máximo o fade.

## Transições de página

Em Next.js App Router, prefira **View Transitions API** (nativa, sem JS de biblioteca) a recriar transições com `AnimatePresence` — que no App Router exige contornar o roteador. A skill `react-view-transitions` cobre isso.

## Checklist antes de dar por pronto

- [ ] Cada arquivo com `motion` tem `'use client'` e é o menor componente possível
- [ ] Animações só de `transform`/`opacity`
- [ ] `viewport={{ once: true }}` no que revela ao rolar
- [ ] `useReducedMotion` respeitado
- [ ] Nada essencial depende de JS para ficar visível
- [ ] Testado em celular real, não só no desktop
