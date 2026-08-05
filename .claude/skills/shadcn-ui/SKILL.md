---
name: shadcn-ui
description: shadcn/ui — componentes React acessíveis (Radix + Tailwind) copiados para dentro do projeto pela CLI, não instalados como dependência. Use ao precisar de componente estrutural (dialog, select, form, table, tabs) ou ao adicionar um registry externo como React Bits.
license: MIT
metadata:
  author: Gabriel Botelho
  version: "1.0.0"
  verificado-em: "2026-08-05"
  cli: shadcn@4
  fonte: https://github.com/shadcn-ui/ui
---

# shadcn/ui

Não é biblioteca de componentes: é um **catálogo de código que a CLI copia para o seu projeto**. Você fica dono dos arquivos, edita à vontade e não herda decisões de API de ninguém. Por baixo, Radix UI (acessibilidade e comportamento) + Tailwind (estilo).

## Comandos

```bash
npx shadcn@latest init          # prepara o projeto (components.json, utils, tokens)
npx shadcn@latest add button    # adiciona um componente
npx shadcn@latest add dialog form select
```

`init` cria `components.json`, que registra onde os componentes moram, qual o alias de import e se o projeto usa Tailwind v4 e React Server Components. Sem esse arquivo, `add` não sabe onde escrever.

## Registries: é assim que React Bits entra

A CLI aceita registries de terceiros com a sintaxe `@registry/item`:

```bash
npx shadcn@latest add @react-bits/BlurText-TS-TW
```

Ou seja: **a mesma CLI serve para shadcn e para outros catálogos**. Não precisa de ferramenta nova para cada biblioteca.

## Como decidir se usa aqui

shadcn resolve **comportamento e acessibilidade**, não estética. Vale muito para:

- Dialog, popover, dropdown, tooltip — foco preso, Escape, ARIA correto. Fazer isso à mão dá errado.
- Select, combobox, date picker — teclado e leitor de tela.
- Form com validação (react-hook-form + zod).
- Table com ordenação e paginação.

Não vale para:
- Card, badge, botão simples — uma `<div>` com classes Tailwind resolve, e a dependência do Radix não se paga.
- Componente onde o valor é o efeito visual (aí é React Bits ou Uiverse).

**Se o projeto já tem um sistema de tokens próprio**, ajuste os componentes recém-adicionados a ele imediatamente. Componente shadcn colado sem ajuste é a origem mais comum do site com "cara de template" — é o mesmo visual padrão que milhares de projetos usam.

## Em Next.js App Router

- Componentes interativos vêm com `'use client'`. Mantenha-os nas folhas da árvore.
- `form` do shadcn é client-side; conviva com Server Actions passando a action ao `<form>` e usando o componente só para estado de campo e erro.

## Checklist

- [ ] `components.json` existe e aponta para os aliases certos
- [ ] Componente adicionado foi ajustado aos tokens do projeto (cor, raio, tipografia)
- [ ] Não adicionei shadcn para algo que uma div com Tailwind resolvia
- [ ] Interativo isolado em componente cliente pequeno
