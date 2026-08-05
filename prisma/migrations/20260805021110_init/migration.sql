-- CreateEnum
CREATE TYPE "TipoImovel" AS ENUM ('LOTE', 'CASA', 'APARTAMENTO', 'SALA_COMERCIAL', 'GALPAO', 'SITIO', 'CHACARA', 'FAZENDA');

-- CreateEnum
CREATE TYPE "Finalidade" AS ENUM ('VENDA', 'ALUGUEL', 'VENDA_E_ALUGUEL');

-- CreateEnum
CREATE TYPE "StatusImovel" AS ENUM ('DISPONIVEL', 'RESERVADO', 'VENDIDO', 'ALUGADO', 'INATIVO');

-- CreateEnum
CREATE TYPE "StatusLoteamento" AS ENUM ('LANCAMENTO', 'EM_VENDAS', 'ESGOTADO');

-- CreateEnum
CREATE TYPE "TipoMidia" AS ENUM ('FOTO', 'PLANTA', 'TOUR_360', 'AEREA');

-- CreateEnum
CREATE TYPE "ProvedorVideo" AS ENUM ('YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'ARQUIVO');

-- CreateEnum
CREATE TYPE "TipoVideo" AS ENUM ('TOUR', 'AEREO_DRONE', 'DEPOIMENTO', 'EDUCATIVO', 'INSTITUCIONAL');

-- CreateEnum
CREATE TYPE "TipoProximidade" AS ENUM ('ESCOLA', 'SAUDE', 'COMERCIO', 'LAZER', 'TRANSPORTE', 'PUBLICO', 'RELIGIOSO');

-- CreateEnum
CREATE TYPE "OrigemLead" AS ENUM ('PAGINA_IMOVEL', 'PAGINA_LOTEAMENTO', 'SIMULADOR', 'FORM_CONTATO', 'BOTAO_WHATSAPP', 'LINK_CURTO');

-- CreateEnum
CREATE TYPE "StatusLead" AS ENUM ('NOVO', 'EM_ATENDIMENTO', 'QUALIFICADO', 'VISITA_AGENDADA', 'PROPOSTA', 'GANHO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "CanalPublicacao" AS ENUM ('INSTAGRAM', 'WHATSAPP_STATUS', 'TIKTOK', 'FACEBOOK', 'PORTAL');

-- CreateEnum
CREATE TYPE "SistemaAmortizacao" AS ENUM ('SAC', 'PRICE');

-- CreateTable
CREATE TABLE "Loteamento" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "status" "StatusLoteamento" NOT NULL DEFAULT 'EM_VENDAS',
    "bairro" TEXT,
    "cidade" TEXT NOT NULL DEFAULT 'Alexânia',
    "uf" TEXT NOT NULL DEFAULT 'GO',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "temAsfalto" BOOLEAN NOT NULL DEFAULT false,
    "temAgua" BOOLEAN NOT NULL DEFAULT false,
    "temEnergia" BOOLEAN NOT NULL DEFAULT false,
    "temEsgoto" BOOLEAN NOT NULL DEFAULT false,
    "temIluminacao" BOOLEAN NOT NULL DEFAULT false,
    "entradaMinima" DECIMAL(12,2),
    "parcelasMax" INTEGER,
    "parcelaApartirDe" DECIMAL(12,2),
    "plantaUrl" TEXT,
    "capaUrl" TEXT,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loteamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Imovel" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "descricaoGeradaPorIA" BOOLEAN NOT NULL DEFAULT false,
    "tipo" "TipoImovel" NOT NULL,
    "finalidade" "Finalidade" NOT NULL DEFAULT 'VENDA',
    "status" "StatusImovel" NOT NULL DEFAULT 'DISPONIVEL',
    "loteamentoId" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "cidade" TEXT NOT NULL DEFAULT 'Alexânia',
    "uf" TEXT NOT NULL DEFAULT 'GO',
    "cep" TEXT,
    "pontoReferencia" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "mostrarEnderecoExato" BOOLEAN NOT NULL DEFAULT false,
    "areaTerrenoM2" DECIMAL(12,2),
    "areaConstruidaM2" DECIMAL(12,2),
    "frenteM" DECIMAL(8,2),
    "fundoM" DECIMAL(8,2),
    "dimensoesTexto" TEXT,
    "quartos" INTEGER,
    "suites" INTEGER,
    "banheiros" INTEGER,
    "vagas" INTEGER,
    "andares" INTEGER,
    "mobiliado" BOOLEAN NOT NULL DEFAULT false,
    "preco" DECIMAL(12,2),
    "precoSobConsulta" BOOLEAN NOT NULL DEFAULT false,
    "valorIptu" DECIMAL(12,2),
    "valorCondominio" DECIMAL(12,2),
    "aceitaFinanciamento" BOOLEAN NOT NULL DEFAULT false,
    "aceitaMcmv" BOOLEAN NOT NULL DEFAULT false,
    "aceitaFgts" BOOLEAN NOT NULL DEFAULT false,
    "aceitaPermuta" BOOLEAN NOT NULL DEFAULT false,
    "aceitaVeiculo" BOOLEAN NOT NULL DEFAULT false,
    "entradaMinima" DECIMAL(12,2),
    "parcelasMax" INTEGER,
    "valorParcela" DECIMAL(12,2),
    "escriturado" BOOLEAN NOT NULL DEFAULT false,
    "registrado" BOOLEAN NOT NULL DEFAULT false,
    "matricula" TEXT,
    "temHabiteSe" BOOLEAN NOT NULL DEFAULT false,
    "situacaoTexto" TEXT,
    "temAsfalto" BOOLEAN NOT NULL DEFAULT false,
    "temAgua" BOOLEAN NOT NULL DEFAULT false,
    "temEnergia" BOOLEAN NOT NULL DEFAULT false,
    "prontoParaConstruir" BOOLEAN NOT NULL DEFAULT false,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "visualizacoes" INTEGER NOT NULL DEFAULT 0,
    "cliquesWhatsapp" INTEGER NOT NULL DEFAULT 0,
    "publicadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Imovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImovelMidia" (
    "id" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "tipo" "TipoMidia" NOT NULL DEFAULT 'FOTO',
    "url" TEXT NOT NULL,
    "urlThumb" TEXT,
    "legenda" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "isCapa" BOOLEAN NOT NULL DEFAULT false,
    "largura" INTEGER,
    "altura" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImovelMidia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proximidade" (
    "id" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoProximidade" NOT NULL,
    "distanciaM" INTEGER,

    CONSTRAINT "Proximidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "provedor" "ProvedorVideo" NOT NULL DEFAULT 'YOUTUBE',
    "videoIdExterno" TEXT NOT NULL,
    "urlOriginal" TEXT,
    "urlThumb" TEXT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "TipoVideo" NOT NULL DEFAULT 'TOUR',
    "duracaoSegundos" INTEGER,
    "transcricao" TEXT,
    "transcricaoGeradaPorIA" BOOLEAN NOT NULL DEFAULT false,
    "imovelId" TEXT,
    "loteamentoId" TEXT,
    "artigoId" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "publicado" BOOLEAN NOT NULL DEFAULT true,
    "indexavel" BOOLEAN NOT NULL DEFAULT true,
    "visualizacoes" INTEGER NOT NULL DEFAULT 0,
    "publicadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "mensagem" TEXT,
    "origem" "OrigemLead" NOT NULL,
    "status" "StatusLead" NOT NULL DEFAULT 'NOVO',
    "imovelId" TEXT,
    "loteamentoId" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "linkCurtoId" TEXT,
    "consentimentoLgpd" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimaInteracao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Simulacao" (
    "id" TEXT NOT NULL,
    "rendaBrutaFamiliar" DECIMAL(12,2) NOT NULL,
    "valorEntrada" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "valorFgts" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "possuiImovel" BOOLEAN NOT NULL DEFAULT false,
    "dependentes" INTEGER NOT NULL DEFAULT 0,
    "prazoMeses" INTEGER NOT NULL,
    "sistema" "SistemaAmortizacao" NOT NULL DEFAULT 'SAC',
    "taxaJurosAa" DECIMAL(6,4) NOT NULL,
    "comprometimentoMaxPct" DECIMAL(5,2) NOT NULL,
    "parcelaMaxima" DECIMAL(12,2) NOT NULL,
    "valorFinanciavel" DECIMAL(12,2) NOT NULL,
    "poderDeCompra" DECIMAL(12,2) NOT NULL,
    "primeiraParcela" DECIMAL(12,2) NOT NULL,
    "ultimaParcela" DECIMAL(12,2),
    "leadId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Simulacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulacaoImovel" (
    "simulacaoId" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "folga" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "SimulacaoImovel_pkey" PRIMARY KEY ("simulacaoId","imovelId")
);

-- CreateTable
CREATE TABLE "ParametroSimulador" (
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descricao" TEXT,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParametroSimulador_pkey" PRIMARY KEY ("chave")
);

-- CreateTable
CREATE TABLE "PublicacaoGerada" (
    "id" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "canal" "CanalPublicacao" NOT NULL,
    "legenda" TEXT NOT NULL,
    "hashtags" TEXT,
    "linkCurtoId" TEXT,
    "geradoPorIa" BOOLEAN NOT NULL DEFAULT true,
    "editado" BOOLEAN NOT NULL DEFAULT false,
    "copiadoEm" TIMESTAMP(3),
    "publicadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicacaoGerada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkCurto" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "destinoUrl" TEXT NOT NULL,
    "canal" "CanalPublicacao",
    "imovelId" TEXT,
    "cliques" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkCurto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artigo" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "resumo" TEXT,
    "corpoMd" TEXT NOT NULL,
    "capaUrl" TEXT,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "publicadoEm" TIMESTAMP(3),
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artigo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Depoimento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "cidade" TEXT,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Depoimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracaoSite" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "nomeExibicao" TEXT NOT NULL DEFAULT 'Hélio Goiano Corretor',
    "creci" TEXT NOT NULL DEFAULT '11643',
    "telefoneWhatsapp" TEXT NOT NULL,
    "mensagemWhatsappPadrao" TEXT NOT NULL DEFAULT 'Olá Hélio, tenho interesse no imóvel {codigo} — {titulo}. {link}',
    "email" TEXT,
    "endereco" TEXT,
    "horarioAtendimento" TEXT,
    "sobreTexto" TEXT,
    "fotoPerfilUrl" TEXT,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "youtubeUrl" TEXT,
    "facebookUrl" TEXT,
    "googleMapsUrl" TEXT,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracaoSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Loteamento_slug_key" ON "Loteamento"("slug");

-- CreateIndex
CREATE INDEX "Loteamento_status_destaque_idx" ON "Loteamento"("status", "destaque");

-- CreateIndex
CREATE UNIQUE INDEX "Imovel_codigo_key" ON "Imovel"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Imovel_slug_key" ON "Imovel"("slug");

-- CreateIndex
CREATE INDEX "Imovel_status_tipo_destaque_idx" ON "Imovel"("status", "tipo", "destaque");

-- CreateIndex
CREATE INDEX "Imovel_cidade_bairro_idx" ON "Imovel"("cidade", "bairro");

-- CreateIndex
CREATE INDEX "Imovel_preco_idx" ON "Imovel"("preco");

-- CreateIndex
CREATE INDEX "Imovel_loteamentoId_idx" ON "Imovel"("loteamentoId");

-- CreateIndex
CREATE INDEX "ImovelMidia_imovelId_ordem_idx" ON "ImovelMidia"("imovelId", "ordem");

-- CreateIndex
CREATE INDEX "Proximidade_imovelId_idx" ON "Proximidade"("imovelId");

-- CreateIndex
CREATE INDEX "Video_imovelId_ordem_idx" ON "Video"("imovelId", "ordem");

-- CreateIndex
CREATE INDEX "Video_tipo_destaque_idx" ON "Video"("tipo", "destaque");

-- CreateIndex
CREATE UNIQUE INDEX "Video_provedor_videoIdExterno_key" ON "Video"("provedor", "videoIdExterno");

-- CreateIndex
CREATE INDEX "Lead_status_criadoEm_idx" ON "Lead"("status", "criadoEm");

-- CreateIndex
CREATE INDEX "Lead_imovelId_idx" ON "Lead"("imovelId");

-- CreateIndex
CREATE UNIQUE INDEX "Simulacao_leadId_key" ON "Simulacao"("leadId");

-- CreateIndex
CREATE INDEX "Simulacao_criadoEm_idx" ON "Simulacao"("criadoEm");

-- CreateIndex
CREATE INDEX "PublicacaoGerada_imovelId_canal_idx" ON "PublicacaoGerada"("imovelId", "canal");

-- CreateIndex
CREATE UNIQUE INDEX "LinkCurto_codigo_key" ON "LinkCurto"("codigo");

-- CreateIndex
CREATE INDEX "LinkCurto_codigo_idx" ON "LinkCurto"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Artigo_slug_key" ON "Artigo"("slug");

-- CreateIndex
CREATE INDEX "Artigo_publicado_publicadoEm_idx" ON "Artigo"("publicado", "publicadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_loteamentoId_fkey" FOREIGN KEY ("loteamentoId") REFERENCES "Loteamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImovelMidia" ADD CONSTRAINT "ImovelMidia_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proximidade" ADD CONSTRAINT "Proximidade_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_loteamentoId_fkey" FOREIGN KEY ("loteamentoId") REFERENCES "Loteamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_artigoId_fkey" FOREIGN KEY ("artigoId") REFERENCES "Artigo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_loteamentoId_fkey" FOREIGN KEY ("loteamentoId") REFERENCES "Loteamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_linkCurtoId_fkey" FOREIGN KEY ("linkCurtoId") REFERENCES "LinkCurto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulacao" ADD CONSTRAINT "Simulacao_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulacaoImovel" ADD CONSTRAINT "SimulacaoImovel_simulacaoId_fkey" FOREIGN KEY ("simulacaoId") REFERENCES "Simulacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulacaoImovel" ADD CONSTRAINT "SimulacaoImovel_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicacaoGerada" ADD CONSTRAINT "PublicacaoGerada_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkCurto" ADD CONSTRAINT "LinkCurto_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
