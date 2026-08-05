---
name: uiverse
description: Uiverse.io — 3000+ elementos de UI em HTML/CSS puro (botões, cards, loaders, toggles, inputs) sob licença MIT. Use quando precisar de um micro-elemento com efeito CSS caprichado sem adicionar dependência JavaScript.
license: MIT
metadata:
  author: Gabriel Botelho
  version: "1.0.0"
  verificado-em: "2026-08-05"
  fonte: https://uiverse.io/elements
---

# Uiverse

Mais de 3000 elementos de interface criados pela comunidade, em **HTML + CSS puro** (parte também em Tailwind). Botões, checkboxes, loaders, toggles, cards, inputs, tooltips.

O diferencial em relação a React Bits e 21st.dev: **não tem JavaScript nenhum**. É CSS. Custa quase nada e funciona em Server Component sem `'use client'`.

## Como usar

Não há CLI nem pacote. O fluxo é:

1. Navegue por `uiverse.io/elements` e filtre por tipo (button, loader, card…)
2. Abra o elemento e copie o HTML e o CSS
3. Converta para JSX: `class` → `className`, `for` → `htmlFor`, estilos inline em objeto
4. Decida onde o CSS vive (ver abaixo)

## Onde colocar o CSS em projeto Tailwind v4

O CSS do Uiverse costuma vir com nomes de classe genéricos (`.button`, `.card`), que colidem fácil. Duas estratégias:

**A — CSS Module (recomendado para elemento isolado):**

```
components/botao-brilho.module.css   ← cola o CSS aqui, escopo garantido
components/botao-brilho.tsx
```

```tsx
import estilos from './botao-brilho.module.css'
export function BotaoBrilho() {
  return <button className={estilos.botao}>Falar no WhatsApp</button>
}
```

**B — Traduzir para utilitários Tailwind**, mantendo só o que é impossível em utilitário (keyframes complexos, `clip-path`, gradientes animados) em `@layer` no `globals.css`.

Nunca cole CSS do Uiverse direto no `globals.css` sem renomear as classes: `.card` global quebra outras partes do site.

## O que vale a pena e o que não

Bom uso:
- Botão com efeito de brilho, borda animada ou preenchimento
- Loader/spinner enquanto uma ação roda
- Toggle e checkbox com personalidade
- Card com borda em gradiente

Mau uso:
- Elemento que reimplementa comportamento nativo sem acessibilidade (checkbox feito de `div`, dropdown sem foco por teclado)
- Empilhar cinco elementos de autores diferentes na mesma tela — cada um tem sua linguagem visual e o resultado vira colcha de retalhos
- Substituir um `<button>` semântico por `<div>` estilizada

**Sempre revise a semântica e o foco por teclado antes de aceitar.** Muitos elementos priorizam o efeito e ignoram acessibilidade: verifique `:focus-visible`, contraste e se leitor de tela entende o controle.

## Licença

MIT — uso, modificação e distribuição livres, inclusive comercial. Atribuição não é exigida legalmente, mas a comunidade valoriza: quando um elemento for usado quase intacto, vale um comentário no arquivo creditando o autor e o Uiverse.

## Checklist

- [ ] CSS em Module ou com classes renomeadas — nunca genérico no global
- [ ] `class` virou `className` no JSX
- [ ] Elemento continua semântico (`button` é `<button>`)
- [ ] `:focus-visible` visível e contraste conferido
- [ ] Movimento respeita `prefers-reduced-motion`
- [ ] Comentário creditando autor/Uiverse quando copiado quase intacto
