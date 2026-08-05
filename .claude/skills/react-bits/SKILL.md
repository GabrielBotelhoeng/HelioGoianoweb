---
name: react-bits
description: Catálogo React Bits — 165+ componentes React animados (texto, fundos, cards, cursores) instaláveis por CLI. Use quando a interface precisa de um efeito visual pronto (texto que revela, fundo animado, card com brilho) e você não quer implementá-lo do zero.
license: MIT
metadata:
  author: Gabriel Botelho
  version: "1.0.0"
  verificado-em: "2026-08-05"
  fonte: https://reactbits.dev
---

# React Bits

Biblioteca com mais de 165 componentes React animados, dividida em três famílias: **Text Animations**, **Backgrounds** e **Components** (cards, cursores, menus, carrosséis).

Não é um pacote npm que se importa: **o código é copiado para dentro do projeto**, como no shadcn/ui. Você fica dono do arquivo e pode editar.

## Instalação de um componente

```bash
npx shadcn@latest add @react-bits/<Componente>-<Linguagem>-<Estilo>
```

As quatro variantes de cada componente:

| Sufixo | Significado |
|---|---|
| `-TS-TW` | TypeScript + Tailwind ← **use esta em projeto Next + Tailwind** |
| `-TS-CSS` | TypeScript + CSS puro |
| `-JS-TW` | JavaScript + Tailwind |
| `-JS-CSS` | JavaScript + CSS puro |

Exemplo real:

```bash
npx shadcn@latest add @react-bits/BlurText-TS-TW
```

Também há suporte a `jsrepo`, e sempre existe a opção de copiar o código manualmente pelo site depois de escolher a stack.

## Como escolher o componente certo

O site (reactbits.dev) tem preview ao vivo de cada item — **veja o efeito antes de instalar**, porque os nomes não descrevem bem o resultado. Famílias úteis:

- **Text Animations** — `BlurText`, `SplitText`, `ShinyText`, `CountUp`, `DecryptedText`, `TextType`. Servem para manchete de hero e números de prova social.
- **Backgrounds** — `Aurora`, `Beams`, `Particles`, `Threads`, `Dither`. São pesados: muitos usam WebGL/canvas rodando continuamente.
- **Components** — `SpotlightCard`, `TiltedCard`, `Dock`, `Carousel`, `ClickSpark`.

## Cuidados antes de sair instalando

1. **Todo componente é client-side.** Vem com `'use client'`, então o pedaço da árvore onde ele entra sai do Server Component. Isole em componente pequeno.
2. **Fundos animados custam caro.** `Particles`, `Aurora` e afins rodam animação contínua em canvas ou WebGL — em celular de entrada isso derruba o FPS e come bateria. Um fundo animado por página, no máximo, e nunca em página de conversão que precisa carregar rápido.
3. **Dependências extras.** Vários componentes dependem de `motion`, `gsap` ou `three`/`ogl`. Confira o que a CLI adicionou ao `package.json` depois de instalar — três componentes podem trazer três bibliotecas de animação diferentes.
4. **Respeite `prefers-reduced-motion`.** Os componentes nem sempre tratam isso; depois de instalar, o arquivo é seu — adicione o tratamento.
5. **Não deixe texto essencial dentro de animação de entrada** sem estado visível de fallback: se o JS falhar, o título some.

## Licença

MIT + Commons Clause: livre para uso pessoal e comercial. A Commons Clause impede vender o próprio catálogo como produto — usar os componentes em um site de cliente está coberto.

## Checklist

- [ ] Vi o preview no site antes de instalar
- [ ] Instalei a variante `-TS-TW`
- [ ] Conferi que dependências entraram no `package.json`
- [ ] Isolei em componente cliente pequeno
- [ ] Tratei `prefers-reduced-motion`
- [ ] Medi o impacto no carregamento (fundo animado é o suspeito número um)
