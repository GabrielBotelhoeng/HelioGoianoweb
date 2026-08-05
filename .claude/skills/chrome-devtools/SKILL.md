---
name: chrome-devtools
description: chrome-devtools-mcp — controla o Chrome DevTools por MCP para medir performance real (Core Web Vitals, trace de CPU), inspecionar rede e depurar. Use ao investigar página lenta, LCP ruim, animação travando, ou para provar com número que uma otimização funcionou.
license: MIT
metadata:
  author: Gabriel Botelho
  version: "1.0.0"
  verificado-em: "2026-08-05"
  pacote: chrome-devtools-mcp@1
  fonte: https://github.com/ChromeDevTools/chrome-devtools-mcp
---

# Chrome DevTools MCP

Servidor MCP oficial do time do Chrome DevTools. Diferente da automação de browser comum (que clica e tira print), este **abre o DevTools de verdade**: grava trace de performance, mede Core Web Vitals, lista requisições e emula rede lenta e CPU fraca.

É a ferramenta que fecha o ciclo "otimizei" → "provei que melhorou".

## Instalação

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

Coloque em `.mcp.json` na raiz do projeto (escopo do projeto) ou no MCP do usuário. Reinicie o Claude Code depois. Requer Node 22+ e Chrome instalado.

## O que dá para fazer

| Categoria | Uso |
|---|---|
| **Performance** | Gravar trace, extrair LCP/CLS/INP, ver o que bloqueou a thread principal |
| **Rede** | Listar requisições, ver tamanho, cabeçalhos, cache, o que atrasou o carregamento |
| **Emulação** | Simular 3G/4G lento e CPU 4x/6x mais devagar |
| **Depuração** | Console, execução de script, inspeção do DOM |
| **Interação** | Navegar, clicar, preencher formulário |

## O fluxo que importa: medir → mudar → medir de novo

1. Grave um trace da página **antes** de mexer
2. Anote LCP, CLS e INP
3. Faça a mudança
4. Grave de novo **nas mesmas condições** (mesma emulação de rede e CPU)
5. Compare os números

Sem o passo 1, "ficou mais rápido" é opinião.

## Emulação não é luxo — é o teste que vale

Medir no desktop com fibra mede a sua máquina, não o usuário. Quando o público acessa por celular em rede ruim, **sempre** emule antes de concluir:

- Rede: `Slow 4G`
- CPU: 4x ou 6x mais lenta

Uma página que abre em 1s no seu desktop pode levar 8s no aparelho de quem vai comprar.

## O que investigar quando o número está ruim

**LCP alto** — qual elemento é o LCP? Costuma ser imagem do hero sem `priority`, fonte bloqueando o render, ou conteúdo escondido esperando JS de animação.

**CLS alto** — imagem sem dimensão declarada, fonte trocando (`font-display`), banner injetado depois do primeiro paint.

**INP alto** — JavaScript longo bloqueando a thread. Veja no trace qual função segurou.

**Animação travando** — grave enquanto rola a página. Animação de `width`/`top`/`margin` aparece como layout a cada quadro; só `transform`/`opacity` roda no compositor.

## Cuidados

- O servidor controla um Chrome real: **não use em página autenticada com dados sensíveis** sem pensar no que fica exposto no trace.
- Trace é pesado. Grave o trecho que interessa (carregamento, ou a rolagem específica), não a sessão inteira.
- Números variam entre execuções. Diferença de 5% não é melhoria — repita antes de comemorar.

## Checklist

- [ ] Medi antes de mudar
- [ ] Emulei rede e CPU compatíveis com o público real
- [ ] Comparei nas mesmas condições
- [ ] Identifiquei o elemento LCP concreto, não só o número
