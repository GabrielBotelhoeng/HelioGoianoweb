# PROJETO — Site Hélio Goiano Corretor

Âncora de contexto. Leia este arquivo antes de qualquer tarefa no repositório.

---

## 1. Contexto do negócio

**Cliente:** Hélio Goiano da Silva — corretor de imóveis, CRECI 11643, 14+ anos de mercado, escritório físico na Av. Brasília, Alexânia-GO.

**Situação atual:** não tem site nem CRM. Fotografa o imóvel e redigita a mesma informação no Instagram (@heliogoiano_corretor, ~2.6k seguidores), no status do WhatsApp, em portais e no TikTok/Facebook. O link da bio aponta direto pro WhatsApp.

**Carteira real** (levantada dos posts, não dos portais):

| Tipo | Exemplos reais |
|---|---|
| Lote urbano | Jardim Esperança 15x30 (450 m²) — R$ 88 mil; 7,5x30 (225 m²) — R$ 35 mil |
| Loteamento parcelado | Jardim Esperança, Piemonte — entrada facilitada, asfalto/água/energia |
| Casa financiada | Minha Casa Minha Vida / Caixa, foco em "sair do aluguel" |
| Sala comercial | 2 salas + apartamento na Av. Brasília — R$ 1,5 mi |
| Sítio / chácara | ocorrência menor |

**Público:** morador local de Alexânia, ticket predominante R$ 35 mil – R$ 150 mil, comprador de primeiro imóvel, sensível a entrada e parcela. **Não** é o comprador de Brasília de chácara de luxo no Corumbá IV — esse mercado existe em Alexânia mas não é o dele.

### O problema que o produto resolve

Duas dores, nessa ordem de importância:

1. **Simulação manual.** O gancho de conversão dele é "me chame no direct que eu faço sua simulação gratuita". Ele repete isso em quase todo post e executa cada uma na mão.
2. **Perguntas repetidas.** Os comentários dos posts são sempre os mesmos: *"Onde?"*, *"Como que faço pra vê esso"*, *"Valor da entrada?"*, *"Como ir onde podemos se enformar"*. Informação que não cabe no post e que ele responde individualmente.

O site é um **conversor**, não uma vitrine. O tráfego vem do Instagram e do WhatsApp, não do Google — SEO é ganho de médio prazo, não a promessa principal.

### Não-objetivos (v1)

- Gestão de aluguel, contratos, comissões, financeiro
- Integração automática de publicação com Instagram/portais (a API do Instagram exige conta Business, app review e token com refresh — inviável nessa fase). A v1 **gera o texto pronto pra colar**, não publica sozinha.
- Portal multi-corretor. É um corretor só.

---

## 2. Stack

```
Next.js 15 (App Router, TypeScript)
PostgreSQL + Prisma
Tailwind CSS + shadcn/ui
Auth: NextAuth (credentials, usuário único)
Storage de mídia: Cloudflare R2 ou Supabase Storage (S3-compatible)
IA: Anthropic API (geração de descrição e legendas)
Deploy: Vercel + Neon/Supabase
```

Decisões que importam:

- **ISR / SSG** nas páginas públicas de imóvel e loteamento. Elas precisam ser rápidas e indexáveis.
- **Painel admin mobile-first, não desktop-first.** Ele cadastra em pé, na frente do imóvel, com o celular. Se o cadastro der mais trabalho que postar no Instagram, ele abandona o sistema. Esse é o maior risco do projeto.
- Upload de imagem com compressão no cliente antes de subir (conexão de campo é ruim).
- Toda escrita de imóvel invalida o cache da página e regenera o link curto.

---

## 3. Modelo de dados

### Diagrama de relações

```
Loteamento 1──N Imovel N──1 Corretor(config)
                 │
                 ├──N ImovelMidia
                 ├──N Proximidade
                 ├──N PublicacaoGerada
                 ├──N LinkCurto
                 └──N Lead

Simulacao 1──0..1 Lead
Simulacao N──N Imovel (compatibilidade calculada)
```

### Prisma schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ---------- ENUMS ----------

enum TipoImovel {
  LOTE
  CASA
  APARTAMENTO
  SALA_COMERCIAL
  GALPAO
  SITIO
  CHACARA
  FAZENDA
}

enum Finalidade {
  VENDA
  ALUGUEL
  VENDA_E_ALUGUEL
}

enum StatusImovel {
  DISPONIVEL
  RESERVADO
  VENDIDO
  ALUGADO
  INATIVO
}

enum StatusLoteamento {
  LANCAMENTO
  EM_VENDAS
  ESGOTADO
}

enum TipoMidia {
  FOTO
  PLANTA
  TOUR_360
  AEREA
}

enum ProvedorVideo {
  YOUTUBE
  INSTAGRAM
  TIKTOK
  ARQUIVO
}

enum TipoVideo {
  TOUR            // ele andando pelo imóvel narrando
  AEREO_DRONE
  DEPOIMENTO
  EDUCATIVO       // "o primeiro imóvel é estratégia", "sair do aluguel"
  INSTITUCIONAL
}

enum TipoProximidade {
  ESCOLA
  SAUDE
  COMERCIO
  LAZER
  TRANSPORTE
  PUBLICO
  RELIGIOSO
}

enum OrigemLead {
  PAGINA_IMOVEL
  PAGINA_LOTEAMENTO
  SIMULADOR
  FORM_CONTATO
  BOTAO_WHATSAPP
  LINK_CURTO
}

enum StatusLead {
  NOVO
  EM_ATENDIMENTO
  QUALIFICADO
  VISITA_AGENDADA
  PROPOSTA
  GANHO
  PERDIDO
}

enum CanalPublicacao {
  INSTAGRAM
  WHATSAPP_STATUS
  TIKTOK
  FACEBOOK
  PORTAL
}

enum SistemaAmortizacao {
  SAC
  PRICE
}

// ---------- IMÓVEIS ----------

model Loteamento {
  id           String            @id @default(cuid())
  slug         String            @unique
  nome         String
  descricao    String?           @db.Text
  status       StatusLoteamento  @default(EM_VENDAS)

  // localização
  bairro       String?
  cidade       String            @default("Alexânia")
  uf           String            @default("GO")
  latitude     Float?
  longitude    Float?

  // infraestrutura entregue — argumento de venda recorrente
  temAsfalto   Boolean           @default(false)
  temAgua      Boolean           @default(false)
  temEnergia   Boolean           @default(false)
  temEsgoto    Boolean           @default(false)
  temIluminacao Boolean          @default(false)

  // condições comerciais do loteamento
  entradaMinima     Decimal?     @db.Decimal(12, 2)
  parcelasMax       Int?
  parcelaApartirDe  Decimal?     @db.Decimal(12, 2)

  plantaUrl    String?
  capaUrl      String?
  destaque     Boolean           @default(false)

  metaTitle       String?
  metaDescription String?

  imoveis      Imovel[]
  leads        Lead[]
  videos       Video[]

  criadoEm     DateTime          @default(now())
  atualizadoEm DateTime          @updatedAt

  @@index([status, destaque])
}

model Imovel {
  id           String       @id @default(cuid())
  codigo       String       @unique          // "HG-0142" — ele referencia isso no WhatsApp
  slug         String       @unique
  titulo       String
  descricao    String?      @db.Text
  descricaoGeradaPorIA Boolean @default(false)

  tipo         TipoImovel
  finalidade   Finalidade   @default(VENDA)
  status       StatusImovel @default(DISPONIVEL)

  loteamentoId String?
  loteamento   Loteamento?  @relation(fields: [loteamentoId], references: [id], onDelete: SetNull)

  // localização
  logradouro   String?
  numero       String?
  bairro       String?
  cidade       String       @default("Alexânia")
  uf           String       @default("GO")
  cep          String?
  pontoReferencia String?
  latitude     Float?
  longitude    Float?
  mostrarEnderecoExato Boolean @default(false)  // corretor às vezes só mostra a região

  // dimensões
  areaTerrenoM2   Decimal?  @db.Decimal(12, 2)
  areaConstruidaM2 Decimal? @db.Decimal(12, 2)
  frenteM         Decimal?  @db.Decimal(8, 2)
  fundoM          Decimal?  @db.Decimal(8, 2)
  dimensoesTexto  String?                     // "15x30" — formato que ele usa e o cliente entende

  // características
  quartos      Int?
  suites       Int?
  banheiros    Int?
  vagas        Int?
  andares      Int?
  mobiliado    Boolean      @default(false)

  // preço
  preco           Decimal?  @db.Decimal(12, 2)
  precoSobConsulta Boolean  @default(false)
  valorIptu       Decimal?  @db.Decimal(12, 2)
  valorCondominio Decimal?  @db.Decimal(12, 2)

  // condições de pagamento — núcleo do negócio dele
  aceitaFinanciamento Boolean @default(false)
  aceitaMcmv          Boolean @default(false)
  aceitaFgts          Boolean @default(false)
  aceitaPermuta       Boolean @default(false)
  aceitaVeiculo       Boolean @default(false)   // "aceitamos carro no negócio"
  entradaMinima       Decimal? @db.Decimal(12, 2)
  parcelasMax         Int?
  valorParcela        Decimal? @db.Decimal(12, 2)

  // situação documental
  escriturado     Boolean   @default(false)
  registrado      Boolean   @default(false)
  matricula       String?
  temHabiteSe     Boolean   @default(false)
  situacaoTexto   String?

  // infraestrutura (relevante para lote)
  temAsfalto           Boolean @default(false)
  temAgua              Boolean @default(false)
  temEnergia           Boolean @default(false)
  prontoParaConstruir  Boolean @default(false)

  destaque     Boolean      @default(false)
  ordem        Int          @default(0)

  metaTitle       String?
  metaDescription String?

  visualizacoes    Int      @default(0)
  cliquesWhatsapp  Int      @default(0)

  // vídeo é o formato principal dele — o hero da página é o vídeo, não a foto
  videoPrincipalId String? @unique

  midias       ImovelMidia[]
  videos       Video[]
  proximidades Proximidade[]
  publicacoes  PublicacaoGerada[]
  linksCurtos  LinkCurto[]
  leads        Lead[]
  simulacoes   SimulacaoImovel[]

  publicadoEm  DateTime?
  criadoEm     DateTime     @default(now())
  atualizadoEm DateTime     @updatedAt

  @@index([status, tipo, destaque])
  @@index([cidade, bairro])
  @@index([preco])
  @@index([loteamentoId])
}

model ImovelMidia {
  id        String    @id @default(cuid())
  imovelId  String
  imovel    Imovel    @relation(fields: [imovelId], references: [id], onDelete: Cascade)

  tipo      TipoMidia @default(FOTO)
  url       String
  urlThumb  String?
  legenda   String?
  ordem     Int       @default(0)
  isCapa    Boolean   @default(false)
  largura   Int?
  altura    Int?

  criadoEm  DateTime  @default(now())

  @@index([imovelId, ordem])
}

/// "Próximo ao novo Colégio 31 de Março", "Próximo ao Fórum" — ele vende localização
/// por referência, não por endereço. Isso é conteúdo de venda, não decoração.
model Proximidade {
  id         String          @id @default(cuid())
  imovelId   String
  imovel     Imovel          @relation(fields: [imovelId], references: [id], onDelete: Cascade)

  nome       String
  tipo       TipoProximidade
  distanciaM Int?

  @@index([imovelId])
}

/// Vídeo é o formato dominante do Hélio, não um anexo.
/// NÃO hospedamos o arquivo: guardamos o ID do provedor. O YouTube dele já é o CDN —
/// entrega adaptativa em 4G ruim, custo zero e o vídeo ainda indexa no Google.
model Video {
  id             String        @id @default(cuid())
  provedor       ProvedorVideo @default(YOUTUBE)
  videoIdExterno String                        // ID no provedor, não a URL inteira
  urlOriginal    String?
  urlThumb       String?                       // thumb própria; a do YouTube é fallback

  titulo         String
  descricao      String?       @db.Text
  tipo           TipoVideo     @default(TOUR)
  duracaoSegundos Int?

  /// Transcrição do áudio. É o que transforma um reel em página indexável —
  /// ele fala o bairro, o preço, a entrada e a referência dentro do vídeo,
  /// e nada disso existe como texto hoje.
  transcricao          String?  @db.Text
  transcricaoGeradaPorIA Boolean @default(false)

  imovelId       String?
  imovel         Imovel?       @relation(fields: [imovelId], references: [id], onDelete: SetNull)
  loteamentoId   String?
  loteamento     Loteamento?   @relation(fields: [loteamentoId], references: [id], onDelete: SetNull)
  artigoId       String?
  artigo         Artigo?       @relation(fields: [artigoId], references: [id], onDelete: SetNull)

  ordem          Int           @default(0)
  destaque       Boolean       @default(false)
  publicado      Boolean       @default(true)
  /// false quando o vídeo está como "não listado" no YouTube (trilha licenciada).
  /// Só emitir JSON-LD VideoObject quando true.
  indexavel      Boolean       @default(true)
  visualizacoes  Int           @default(0)

  publicadoEm    DateTime?
  criadoEm       DateTime      @default(now())
  atualizadoEm   DateTime      @updatedAt

  @@unique([provedor, videoIdExterno])
  @@index([imovelId, ordem])
  @@index([tipo, destaque])
}

// ---------- LEADS E SIMULAÇÃO ----------

model Lead {
  id            String     @id @default(cuid())
  nome          String
  telefone      String
  email         String?
  mensagem      String?    @db.Text

  origem        OrigemLead
  status        StatusLead @default(NOVO)

  imovelId      String?
  imovel        Imovel?     @relation(fields: [imovelId], references: [id], onDelete: SetNull)
  loteamentoId  String?
  loteamento    Loteamento? @relation(fields: [loteamentoId], references: [id], onDelete: SetNull)
  simulacao     Simulacao?

  // de onde veio: status do WhatsApp converte mais que Instagram? isso responde.
  utmSource     String?
  utmMedium     String?
  utmCampaign   String?
  linkCurtoId   String?
  linkCurto     LinkCurto?  @relation(fields: [linkCurtoId], references: [id], onDelete: SetNull)

  consentimentoLgpd Boolean @default(false)
  observacoes       String? @db.Text

  criadoEm         DateTime @default(now())
  ultimaInteracao  DateTime @default(now())

  @@index([status, criadoEm])
  @@index([imovelId])
}

/// O recurso central. Substitui a simulação manual que ele faz no direct.
/// A pessoa se autoqualifica e o lead chega com renda, entrada e imóvel de interesse.
model Simulacao {
  id                  String   @id @default(cuid())

  // entrada do usuário
  rendaBrutaFamiliar  Decimal  @db.Decimal(12, 2)
  valorEntrada        Decimal  @db.Decimal(12, 2) @default(0)
  valorFgts           Decimal  @db.Decimal(12, 2) @default(0)
  possuiImovel        Boolean  @default(false)   // critério de elegibilidade de programa habitacional
  dependentes         Int      @default(0)
  prazoMeses          Int

  // parâmetros aplicados no momento do cálculo (congelados para auditoria)
  sistema             SistemaAmortizacao @default(SAC)
  taxaJurosAa         Decimal  @db.Decimal(6, 4)
  comprometimentoMaxPct Decimal @db.Decimal(5, 2)

  // resultado
  parcelaMaxima       Decimal  @db.Decimal(12, 2)
  valorFinanciavel    Decimal  @db.Decimal(12, 2)
  poderDeCompra       Decimal  @db.Decimal(12, 2)  // financiável + entrada + FGTS
  primeiraParcela     Decimal  @db.Decimal(12, 2)
  ultimaParcela       Decimal? @db.Decimal(12, 2)  // SAC: decrescente

  leadId              String?  @unique
  lead                Lead?    @relation(fields: [leadId], references: [id], onDelete: SetNull)

  compatíveis         SimulacaoImovel[]

  criadoEm            DateTime @default(now())

  @@index([criadoEm])
}

model SimulacaoImovel {
  simulacaoId String
  simulacao   Simulacao @relation(fields: [simulacaoId], references: [id], onDelete: Cascade)
  imovelId    String
  imovel      Imovel    @relation(fields: [imovelId], references: [id], onDelete: Cascade)
  folga       Decimal   @db.Decimal(12, 2)  // poderDeCompra - preço

  @@id([simulacaoId, imovelId])
}

/// Taxa de juros, prazo e regras de programa habitacional mudam.
/// NUNCA hardcodar no código — tudo vem daqui, editável no admin.
model ParametroSimulador {
  chave       String   @id
  valor       String
  descricao   String?
  atualizadoEm DateTime @updatedAt
}

// ---------- DISTRIBUIÇÃO ----------

/// Texto pronto para colar em cada canal. Gerado por IA a partir do imóvel, editável.
model PublicacaoGerada {
  id          String          @id @default(cuid())
  imovelId    String
  imovel      Imovel          @relation(fields: [imovelId], references: [id], onDelete: Cascade)

  canal       CanalPublicacao
  legenda     String          @db.Text
  hashtags    String?
  linkCurtoId String?

  geradoPorIa Boolean         @default(true)
  editado     Boolean         @default(false)
  copiadoEm   DateTime?
  publicadoEm DateTime?

  criadoEm    DateTime        @default(now())

  @@index([imovelId, canal])
}

/// Rastreia qual canal converte. Um link por canal, não um link só.
model LinkCurto {
  id          String           @id @default(cuid())
  codigo      String           @unique   // /l/abc123
  destinoUrl  String
  canal       CanalPublicacao?
  imovelId    String?
  imovel      Imovel?          @relation(fields: [imovelId], references: [id], onDelete: Cascade)

  cliques     Int              @default(0)
  leads       Lead[]

  criadoEm    DateTime         @default(now())

  @@index([codigo])
}

// ---------- CONTEÚDO E CONFIGURAÇÃO ----------

/// Ele já produz conteúdo educativo forte ("o primeiro imóvel é estratégia",
/// "sair do aluguel"). É o combustível de SEO do projeto.
model Artigo {
  id          String   @id @default(cuid())
  slug        String   @unique
  titulo      String
  resumo      String?
  corpoMd     String   @db.Text
  capaUrl     String?
  videos      Video[]              // um reel educativo dele vira um artigo
  publicado   Boolean  @default(false)
  publicadoEm DateTime?

  metaTitle       String?
  metaDescription String?

  criadoEm    DateTime @default(now())
  atualizadoEm DateTime @updatedAt

  @@index([publicado, publicadoEm])
}

model Depoimento {
  id         String   @id @default(cuid())
  nome       String
  texto      String   @db.Text
  fotoUrl    String?
  cidade     String?
  publicado  Boolean  @default(false)
  ordem      Int      @default(0)
  criadoEm   DateTime @default(now())
}

/// Registro único (id fixo = "default")
model ConfiguracaoSite {
  id                     String  @id @default("default")
  nomeExibicao           String  @default("Hélio Goiano Corretor")
  creci                  String  @default("11643")
  telefoneWhatsapp       String
  mensagemWhatsappPadrao String  @default("Olá Hélio, tenho interesse no imóvel {codigo} — {titulo}. {link}")
  email                  String?
  endereco               String?
  horarioAtendimento     String?
  sobreTexto             String? @db.Text
  fotoPerfilUrl          String?
  instagramUrl           String?
  tiktokUrl              String?
  youtubeUrl             String?
  facebookUrl            String?
  googleMapsUrl          String?
  atualizadoEm           DateTime @updatedAt
}

model Usuario {
  id           String   @id @default(cuid())
  email        String   @unique
  senhaHash    String
  nome         String
  criadoEm     DateTime @default(now())
}
```

---

## 4. Simulador de financiamento

### Lógica

```
1. parcelaMaxima = rendaBrutaFamiliar × comprometimentoMaxPct
2. valorFinanciavel = inverter a fórmula de amortização a partir da parcelaMaxima
3. poderDeCompra = valorFinanciavel + valorEntrada + valorFgts
4. compatíveis = imóveis DISPONIVEL com preco <= poderDeCompra
                 (se aceitaFinanciamento, ou preco <= entrada+fgts se não aceita)
5. ordenar por folga crescente (o mais próximo do teto primeiro)
```

**PRICE** — parcela fixa:
```
i = taxaAnual convertida para mensal: (1 + taxaAa)^(1/12) - 1
PMT = PV × i / (1 - (1+i)^-n)
PV  = PMT × (1 - (1+i)^-n) / i
```

**SAC** — primeira parcela é a maior; é ela que precisa caber no comprometimento:
```
amortizacao   = PV / n
primeiraParcela = amortizacao + (PV × i)
=> PV = parcelaMaxima / (1/n + i)
ultimaParcela = amortizacao + (amortizacao × i)
```

### Regras não-negociáveis

- **Nada de taxa, prazo ou faixa de programa habitacional hardcodado.** Tudo em `ParametroSimulador`. As regras do MCMV e as taxas da Caixa mudam com frequência — confirme os valores vigentes com o Hélio antes de popular o seed, e deixe ele editando pelo admin.
- Congelar os parâmetros usados dentro do registro de `Simulacao`. Se a taxa mudar amanhã, a simulação de ontem tem que continuar explicável.
- **Disclaimer obrigatório e visível no resultado:** é estimativa, não é proposta de crédito, não substitui a análise do banco, sujeito a aprovação. Isso protege o Hélio e você.
- Capturar o lead **depois** de mostrar o resultado, não antes. Formulário na frente do valor mata a conversão.

---

## 5. Rotas

### Público
```
/                          home — destaques, loteamentos, CTA simulador
/imoveis                   busca com filtros (SSR, filtros na querystring)
/imoveis/[slug]            página do imóvel
/loteamentos               lista
/loteamentos/[slug]        loteamento + lotes disponíveis + planta
/simulador                 simulador de financiamento
/conteudo                  artigos
/conteudo/[slug]           artigo
/sobre                     Hélio, CRECI, trajetória, depoimentos
/contato
/l/[codigo]                redirect do link curto (registra clique + UTM)
/sitemap.xml  /robots.txt  /feed.xml
```

### Filtros de `/imoveis`

Derivados da carteira real — não use o filtro genérico de portal imobiliário:

`tipo` · `precoMin/precoMax` · `bairro` · `loteamento` · `areaMin/areaMax` · `aceitaFinanciamento` · `aceitaMcmv` · `aceitaVeiculo` · `aceitaPermuta` · `entradaAte` · `parcelaAte` · `escriturado` · `prontoParaConstruir` · `quartos` (só aparece para CASA/APARTAMENTO)

O filtro precisa se adaptar ao tipo: quartos e banheiros não fazem sentido em lote, e `dimensoesTexto` importa mais que m² pro público dele.

### Admin
```
/admin                     dashboard: leads novos, simulações, imóveis publicados
/admin/imoveis             lista + busca
/admin/imoveis/novo        cadastro mobile-first
/admin/imoveis/[id]        edição + aba "publicar" com os textos gerados
/admin/loteamentos
/admin/leads               kanban por StatusLead
/admin/simulacoes
/admin/artigos
/admin/configuracao        dados do site, WhatsApp, parâmetros do simulador
```

---

## 6. Fluxo de cadastro (o ponto crítico do produto)

```
1. Ele abre /admin/imoveis/novo no celular, na frente do imóvel
2. Tira ou seleciona as fotos → upload com compressão no cliente
3. Preenche o mínimo: tipo, dimensões ("15x30"), preço, entrada, bairro
4. Botão "gerar descrição" → Anthropic API monta o texto a partir dos campos
5. Ele revisa e salva
6. O sistema gera automaticamente:
   - página pública + slug + código (HG-0142)
   - legenda de Instagram + hashtags
   - texto curto pro status do WhatsApp
   - texto pro portal
   - um link curto por canal
7. Ele copia, cola, posta
```

Campos obrigatórios no cadastro rápido: `tipo`, `titulo`, `bairro`, `preco` (ou sob consulta), uma foto. O resto é opcional e pode ser completado depois no desktop. **Não bloqueie o salvamento por campo faltando** — ele desiste.

### Prompt de geração (contrato)

Entrada: os campos do imóvel + `ConfiguracaoSite`.
Saída: JSON com `descricao`, `legendaInstagram`, `hashtags[]`, `textoWhatsappStatus`, `metaTitle`, `metaDescription`.

Tom: direto, popular, mesmo registro que ele usa ("sair do aluguel", "entrada facilitada", "aceitamos carro no negócio"). Não inventar característica que não está nos campos — nunca afirmar escritura, habite-se ou infraestrutura que não esteja marcada como `true`.

---

## 7. Vídeo

Vídeo é o formato principal do Hélio, não um complemento. Quase todo post é reel: ele na frente do imóvel narrando, ou imagem de drone. Os reels fazem centenas ou milhares de curtidas enquanto os posts estáticos fazem unidades. O site tem que respeitar isso.

### Formato: vertical, sempre

Ele edita no CapCut e exporta 9:16. **Não construa player 16:9.** O hero da página do imóvel é um container vertical; no desktop, vídeo à esquerda e dados/CTA à direita, nunca vídeo widescreen com tarja preta. No mobile o vídeo ocupa a largura toda.

As legendas já vêm queimadas no vídeo pelo CapCut — não sobrepor legenda própria por cima. E o CapCut gera legenda automática: se ele conseguir exportar o SRT no mesmo fluxo, o campo `transcricao` é preenchido sem custo de Whisper.

### Direitos de áudio — restrição de migração

Parte dos posts usa áudio original (narração dele) e parte usa faixa musical licenciada do catálogo da Meta. No Instagram isso é coberto; no YouTube, faixa licenciada tende a acionar Content ID — bloqueio, reivindicação ou silenciamento.

Regra prática:
- Vídeos novos destinados ao site: narração própria ou biblioteca livre de direitos do CapCut.
- Acervo antigo com música licenciada: subir como não listado, ou aceitar que fica só no Instagram.
- O campo `provedor` existe justamente pra isso: um vídeo que não pode ir pro YouTube ainda pode ser referenciado como `INSTAGRAM`.

### Visibilidade: público vs não listado

**Vídeo não listado não é indexado pelo Google.** Isso significa que não dá pra ter ao mesmo tempo o escudo contra Content ID e o ganho de `VideoObject` na busca. São dois níveis distintos:

| Situação | Visibilidade | Consequência |
|---|---|---|
| Áudio original (narração dele) | Público | Indexa, entra no `VideoObject`, aparece no Google |
| Trilha licenciada | Não listado | Funciona como player no site, invisível pra busca |

Adicionar ao model `Video` a distinção, ou derivar de `provedor` + um booleano `indexavel`, e só emitir JSON-LD `VideoObject` para vídeos públicos. Emitir para vídeo não listado gera marcação apontando pra conteúdo inacessível.

### Ingestão automática pelo feed RSS

Canal do Hélio: `UClYwSehU-cxFb5DJ2JtlLTw` (handle `@heliogoianocorretor`, parado há ~6 meses — irrelevante, o canal aqui é hospedagem e não audiência).

Todo canal expõe um feed público sem autenticação:

```
https://www.youtube.com/feeds/videos.xml?channel_id=UClYwSehU-cxFb5DJ2JtlLTw
```

Sem API key, sem cota, sem app review — ao contrário da API do Instagram. Um job periódico lê o feed, cria registros `Video` para IDs ainda não conhecidos e deixa no admin como "não vinculado". O Hélio sobe no YouTube e o vídeo aparece pronto pra anexar a um imóvel, sem colar link.

Duas limitações: o feed só lista vídeos **públicos** (mais um motivo para os dois níveis acima) e retorna apenas os mais recentes. Vídeo não listado continua entrando por colagem manual de link. Validar o acesso ao feed a partir do servidor de produção antes de depender dele — o YouTube barra parte dos clientes automatizados.

### Hospedagem

**Não subir arquivo de vídeo para o storage próprio.** Ele já mantém canal no YouTube — use o YouTube como CDN e guarde só o `videoIdExterno`. Três razões: custo zero de banda, entrega adaptativa (o público dele assiste em 4G de cidade pequena) e o vídeo passa a existir na busca do Google, não só no Instagram.

Embed de Instagram e TikTok fica como opção secundária: são frágeis, pesados e podem quebrar sem aviso. YouTube é o canal canônico; os outros são espelho.

### Layout

- Na página do imóvel, o **hero é o vídeo**, com as fotos abaixo. Inverter isso é lutar contra o hábito da audiência dele.
- Nunca autoplay com som. Iframe do YouTube com carregamento por fachada: mostra a thumbnail própria e só injeta o iframe no clique. Iframe direto destrói o LCP no celular — e performance aqui não é vaidade, é o público inteiro em 4G.
- Vídeo de drone responde "onde?" melhor que mapa, porque mostra o entorno. Mas o mapa continua obrigatório: a pergunta pede as duas coisas.
- Ele aparece em quase todo vídeo. O rosto dele é a marca — o site deve reforçar isso, não esconder atrás de um layout genérico de imobiliária.

### Transcrição — o motor de SEO sem trabalho novo

Ele tem 118 posts. Dentro dos vídeos ele já fala bairro, preço, entrada, referência e condição de pagamento. Nada disso existe como texto em lugar nenhum, então nada disso é indexável hoje.

```
vídeo → transcrição (Whisper ou similar) → campo `transcricao`
      → IA extrai: bairro, preço, entrada, referências, condições
      → vira descrição do imóvel OU artigo com o vídeo embutido
```

Isso resolve dois problemas de uma vez: alimenta o cadastro (ele não precisa digitar o que já falou) e transforma o acervo existente em páginas indexáveis, sem exigir que ele escreva uma linha. Os reels educativos — "o primeiro imóvel é estratégia", "sair do aluguel" — viram artigos direto.

Exibir a transcrição na página como texto legível, não escondida: é conteúdo real e acessibilidade.

### Impacto no cadastro

No fluxo mobile, adicionar o passo: colar o link do YouTube (ou selecionar de uma lista de vídeos recentes do canal). Idealmente ele grava, sobe no YouTube como não listado, cola o link, e o resto o sistema preenche a partir da transcrição.

---

## 8. WhatsApp

Todo CTA gera deep link com contexto:

```
https://wa.me/55{telefone}?text={mensagemWhatsappPadrao interpolada}
```

Renderizado: `Olá Hélio, tenho interesse no imóvel HG-0142 — Lote 15x30 Jardim Esperança. https://site/l/abc123`

Incrementar `cliquesWhatsapp` antes de redirecionar. É a métrica que prova o valor do site pro cliente na renovação da mensalidade.

---

## 9. SEO

- JSON-LD: `RealEstateListing` nas páginas de imóvel, `VideoObject` em toda página com vídeo, `LocalBusiness` no rodapé (endereço da Av. Brasília + horário), `Article` nos artigos, `BreadcrumbList`.
- `VideoObject` é a maior oportunidade barata do projeto: o Google mostra miniatura de vídeo no resultado, e não existe concorrência nenhuma disputando vídeo para busca imobiliária em Alexânia. Exige `thumbnailUrl`, `uploadDate`, `duration` e `contentUrl`/`embedUrl` — todos já estão no model `Video`.
- Slug: `lote-15x30-jardim-esperanca-alexania-hg-0142`
- Sitemap dinâmico incluindo imóveis, loteamentos e artigos publicados.
- Open Graph por imóvel usando a foto de capa — importante porque o link vai circular no WhatsApp, onde o preview é o que decide o clique.
- Meta description gerada junto com a descrição, editável.

---

## 10. Requisitos legais

- **CRECI 11643 visível** no rodapé e nas páginas de imóvel. É exigência da profissão para publicidade imobiliária.
- LGPD: checkbox de consentimento nos formulários de lead e simulação, política de privacidade, e uma rota de exclusão de dados no admin.
- Disclaimer de simulação (ver seção 4).
- Preço e condições com aviso de que estão sujeitos a alteração sem aviso prévio.

---

## 11. Ordem de construção sugerida

1. Schema + migrations + seed com 5 imóveis reais do Instagram dele
2. Páginas públicas de imóvel e listagem com filtros, com vídeo no hero
3. Simulador (é o diferencial — não deixe pro final)
4. Admin de cadastro mobile-first, com colar link de vídeo
5. Geração de textos por IA + links curtos
6. Transcrição de vídeo alimentando cadastro e artigos
7. Loteamentos
8. Leads e kanban
9. Artigos + SEO + VideoObject
10. Configuração e polimento

O corte mínimo pra mostrar pro Hélio e fechar: **1, 2, 3, 4.** Com isso ele já para de fazer simulação manual e já tem link pra mandar quando perguntarem "onde?".

---

## 12. Riscos

| Risco | Mitigação |
|---|---|
| Ele não usa o painel e volta pro Instagram | Cadastro em menos de 2 minutos no celular, campos mínimos, sem validação bloqueante |
| Simulação gerar expectativa errada de crédito | Disclaimer visível, parâmetros conservadores, texto "estimativa" no resultado |
| Site sem tráfego no lançamento | Vender como conversor, não como fonte de tráfego. Trocar o link da bio e o campo "Site" do Google |
| Regras de financiamento desatualizadas | `ParametroSimulador` editável, sem hardcode, revisão combinada com o cliente |
| Ele achar caro por não ver valor | Dashboard mostrando cliques no WhatsApp, leads e simulações do mês |
