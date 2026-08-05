---
name: 21st-dev
description: 21st.dev — catálogo e gerador de componentes UI via MCP (busca de componentes, temas, templates, logos e geração com variantes). Use quando precisar descobrir ou gerar um componente de interface a partir de um catálogo curado, dentro do editor.
license: MIT
metadata:
  author: Gabriel Botelho
  version: "1.0.0"
  verificado-em: "2026-08-05"
  fonte: https://21st.dev/mcp
---

# 21st.dev

Catálogo de componentes React (construídos sobre shadcn/ui + Tailwind) com um **servidor MCP** que expõe busca e geração direto no editor.

O antigo **Magic MCP** foi substituído pelo **21st MCP**, unificado. Chaves de API antigas do Magic foram invalidadas — é preciso gerar uma nova.

## Instalação

```bash
npx @21st-dev/cli@latest init --client claude
```

Ou configuração manual no MCP:

```json
{
  "mcpServers": {
    "21st": {
      "url": "https://21st.dev/api/mcp",
      "headers": { "x-api-key": "SUA_CHAVE_21ST" }
    }
  }
}
```

**Exige chave de API**, obtida em `21st.dev/mcp`.

> Chave é segredo: guarde em variável de ambiente ou no MCP de escopo do usuário, **nunca** em `.mcp.json` versionado no repositório do cliente.

## Ferramentas expostas

| Ferramenta | Para quê |
|---|---|
| `search` | Procurar no catálogo (componentes, temas, templates) |
| `generate` | Gerar um componente novo, com variantes |
| `get_inspiration` | Explorar ideias quando o briefing ainda está vago |
| `search_logo` | Encontrar logotipos |

Frases-gatilho antigas como `/ui` e `/21` **não existem mais** — o servidor é acionado por pedido em linguagem natural.

## Como usar bem

1. **Descreva o contexto, não só o componente.** "Card de imóvel com preço em destaque, entrada e parcela, selo de destaque" traz resultado melhor que "card bonito".
2. **O que vem gerado é ponto de partida.** Ajuste tokens (cores, raio, tipografia) para a identidade do projeto — componente colado sem ajuste é exatamente o que faz um site parecer template.
3. **Confira as dependências** que o componente traz antes de aceitar.
4. **Verifique a fronteira servidor/cliente**: o que veio com estado ou animação precisa de `'use client'` e deve ficar isolado.

## Quando usar 21st.dev e quando não

| Situação | Ferramenta |
|---|---|
| Componente estrutural (dialog, form, table) | `shadcn/ui` direto |
| Efeito visual animado pronto | `react-bits` |
| Micro-elemento CSS sem JS | `uiverse` |
| Não sei o que quero, preciso de referência | `21st.dev` (`get_inspiration`) |
| Componente específico do domínio, com variantes | `21st.dev` (`generate`) |

## Checklist

- [ ] Chave de API fora de arquivo versionado
- [ ] Componente adaptado aos tokens do projeto, não colado cru
- [ ] Dependências novas conferidas
- [ ] `'use client'` só onde precisa, em componente pequeno
