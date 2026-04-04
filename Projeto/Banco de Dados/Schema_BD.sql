-- ============================================================
--  SPECTRE - Sistema Contabilizador de Custos e Capital
--  Schema MySQL
--  Cada lançamento pertence a um projeto/edital específico.
--  Fuso horário: America/Sao_Paulo (UTC-3 — Brasília/RS)
-- ============================================================

DROP DATABASE IF EXISTS spectre;

CREATE DATABASE spectre
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE spectre;

-- ============================================================
-- 1. USUÁRIOS / EQUIPE
-- ============================================================
CREATE TABLE usuarios (
    id               INT          NOT NULL AUTO_INCREMENT,
    nome             VARCHAR(100) NOT NULL,
    email            VARCHAR(150) NOT NULL,
    senha_hash       VARCHAR(255) NOT NULL,
    cpf              VARCHAR(14)  NOT NULL,
    data_nascimento  DATE         NOT NULL,
    papel_atividade  VARCHAR(100),
    login            VARCHAR(100) NOT NULL,
    ativo            BOOLEAN      NOT NULL DEFAULT 1,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       INT,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by       INT,

    PRIMARY KEY (id),
    CONSTRAINT uq_usuarios_email UNIQUE (email),
    CONSTRAINT uq_usuarios_cpf   UNIQUE (cpf),
    CONSTRAINT uq_usuarios_login UNIQUE (login)
);

-- ============================================================
-- 2. PROJETOS / EDITAIS  ← NOVO NA v5
--    Cada edital financiado (Fapergs, CNPq, CAPES etc.) é um
--    projeto independente. Lançamentos são sempre vinculados
--    a um projeto, evitando mistura de dados entre editais.
--    Apenas administradores criam e gerenciam projetos.
--    Um usuário pode participar de vários projetos.
-- ============================================================
CREATE TABLE projetos (
    id                    INT           NOT NULL AUTO_INCREMENT,
    nome                  VARCHAR(150)  NOT NULL,         -- ex: 'Fapergs 2026 — Edital 01/2026'
    orgao_financiador     VARCHAR(100)  NOT NULL,         -- ex: 'Fapergs', 'CNPq', 'CAPES'
    numero_edital         VARCHAR(50),                    -- ex: '01/2026'
    ano                   YEAR          NOT NULL,
    valor_total_aprovado  DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    data_inicio           DATE,
    data_fim              DATE,
    status                ENUM('Em andamento','Encerrado','Suspenso') NOT NULL DEFAULT 'Em andamento',
    descricao             TEXT,
    ativo                 BOOLEAN       NOT NULL DEFAULT 1,
    created_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by            INT,
    updated_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by            INT,

    PRIMARY KEY (id),
    CONSTRAINT uq_projetos UNIQUE (orgao_financiador, numero_edital, ano),
    CONSTRAINT chk_projetos_datas CHECK (data_fim IS NULL OR data_fim >= data_inicio)
);

-- ============================================================
-- 3. CATEGORIAS
-- ============================================================
CREATE TABLE categorias (
    id                INT          NOT NULL AUTO_INCREMENT,
    tipo_categoria    ENUM('CUSTEIO', 'CAPITAL') NOT NULL,
    nome_subcategoria VARCHAR(100) NOT NULL,
    descricao         VARCHAR(255),
    ativo             BOOLEAN      NOT NULL DEFAULT 1,
    created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by        INT,
    updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by        INT,

    PRIMARY KEY (id),
    CONSTRAINT uq_categorias UNIQUE (tipo_categoria, nome_subcategoria)
);

-- ============================================================
-- 4. LANÇAMENTOS FINANCEIROS
--    projeto_id vincula cada lançamento ao seu edital.
--    Sem projeto_id não é possível criar um lançamento.
-- ============================================================
CREATE TABLE lancamentos (
    id               INT            NOT NULL AUTO_INCREMENT,
    projeto_id       INT            NOT NULL,             -- ← NOVO: qual edital
    usuario_id       INT            NOT NULL,
    categoria_id     INT            NOT NULL,
    status           ENUM('ORÇADO', 'REALIZADO') NOT NULL,
    descricao_item   VARCHAR(255),
    valor_total      DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    data_lancamento  DATE           NOT NULL,
    observacoes      TEXT,
    created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       INT,
    updated_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by       INT,

    PRIMARY KEY (id),
    CONSTRAINT fk_lanc_projeto  FOREIGN KEY (projeto_id)  REFERENCES projetos   (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_lanc_usuario  FOREIGN KEY (usuario_id)  REFERENCES usuarios   (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_lanc_categ    FOREIGN KEY (categoria_id) REFERENCES categorias (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================
-- 5. DETALHES DE TRANSPORTE / VIAGEM
-- ============================================================
CREATE TABLE detalhes_transporte (
    id                    INT            NOT NULL AUTO_INCREMENT,
    lancamento_id         INT            NOT NULL,
    meio_transporte       ENUM('Voo','Ônibus','Aplicativo','Táxi','Carro próprio','Aluguel de carro') NOT NULL,
    local_origem          VARCHAR(150),
    local_destino         VARCHAR(150),
    data_saida            DATE,
    data_chegada          DATE,
    horario_saida         TIME,
    horario_chegada       TIME,
    distancia_km          DECIMAL(8,  2),
    custo_passagem        DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    custo_abastecimento   DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    custo_aplicativo_taxi DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    custo_alimentacao     DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at            DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by            INT,
    updated_at            DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by            INT,

    PRIMARY KEY (id),
    CONSTRAINT fk_transp_lanc   FOREIGN KEY (lancamento_id) REFERENCES lancamentos (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_transp_datas CHECK (data_chegada IS NULL OR data_chegada >= data_saida)
);

-- ============================================================
-- 6. DETALHES DE DIÁRIA
-- ============================================================
CREATE TABLE detalhes_diaria (
    id              INT            NOT NULL AUTO_INCREMENT,
    lancamento_id   INT            NOT NULL,
    num_diarias     INT            NOT NULL DEFAULT 1,
    valor_unitario  DECIMAL(10, 2) NOT NULL,
    cidade_destino  VARCHAR(150),
    motivo          VARCHAR(255),
    data_inicio     DATE,
    data_fim        DATE,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      INT,
    updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by      INT,

    PRIMARY KEY (id),
    CONSTRAINT fk_diaria_lanc   FOREIGN KEY (lancamento_id) REFERENCES lancamentos (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_diaria_datas CHECK (data_fim IS NULL OR data_fim >= data_inicio)
);

-- ============================================================
-- 7. DETALHES DE MATERIAL DE CONSUMO
-- ============================================================
CREATE TABLE detalhes_material_consumo (
    id              INT            NOT NULL AUTO_INCREMENT,
    lancamento_id   INT            NOT NULL,
    tipo_material   ENUM(
                      'Papelaria',
                      'Informática',
                      'Material de escritório',
                      'Material de laboratório',
                      'Outros'
                    ) NOT NULL,
    descricao_item  VARCHAR(255)   NOT NULL,
    quantidade      DECIMAL(10, 3) NOT NULL DEFAULT 1.000,
    unidade_medida  VARCHAR(20)    NOT NULL DEFAULT 'un',
    valor_unitario  DECIMAL(10, 2) NOT NULL,
    fornecedor      VARCHAR(150),
    cnpj_fornecedor VARCHAR(18),
    numero_nf       VARCHAR(20),
    data_compra     DATE,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      INT,
    updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by      INT,

    PRIMARY KEY (id),
    CONSTRAINT fk_matcons_lanc FOREIGN KEY (lancamento_id) REFERENCES lancamentos (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_matcons_qtd CHECK (quantidade > 0)
);

-- ============================================================
-- 8. DETALHES DE SERVIÇOS DE TERCEIROS
-- ============================================================
CREATE TABLE detalhes_servicos_terceiros (
    id                  INT            NOT NULL AUTO_INCREMENT,
    lancamento_id       INT            NOT NULL,
    tipo_servico        ENUM(
                          'Divulgação',
                          'Revisão de texto',
                          'Gráfica / impressão',
                          'Tradução',
                          'Consultoria',
                          'Desenvolvimento de software',
                          'Outros'
                        ) NOT NULL,
    tipo_pessoa         ENUM('PF', 'PJ') NOT NULL,
    nome_prestador      VARCHAR(150)   NOT NULL,
    cpf_cnpj            VARCHAR(18)    NOT NULL,
    descricao_servico   VARCHAR(500)   NOT NULL,
    numero_contrato     VARCHAR(50),
    numero_nf_rpa       VARCHAR(20),
    data_inicio         DATE,
    data_conclusao      DATE,
    valor_bruto         DECIMAL(10, 2) NOT NULL,
    percentual_retencao DECIMAL(5,  2) NOT NULL DEFAULT 0.00,
    valor_retencao      DECIMAL(10, 2) GENERATED ALWAYS AS
                          (ROUND(valor_bruto * percentual_retencao / 100, 2)) STORED,
    valor_liquido       DECIMAL(10, 2) GENERATED ALWAYS AS
                          (ROUND(valor_bruto - (valor_bruto * percentual_retencao / 100), 2)) STORED,
    created_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          INT,
    updated_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by          INT,

    PRIMARY KEY (id),
    CONSTRAINT fk_servterc_lanc  FOREIGN KEY (lancamento_id) REFERENCES lancamentos (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_servterc_data CHECK (data_conclusao IS NULL OR data_conclusao >= data_inicio),
    CONSTRAINT chk_servterc_ret  CHECK (percentual_retencao >= 0 AND percentual_retencao <= 100)
);

-- ============================================================
-- 9. DETALHES DE MATERIAL PERMANENTE
-- ============================================================
CREATE TABLE detalhes_material_permanente (
    id                  INT            NOT NULL AUTO_INCREMENT,
    lancamento_id       INT            NOT NULL,
    descricao_bem       VARCHAR(255)   NOT NULL,
    marca               VARCHAR(100),
    modelo              VARCHAR(100),
    numero_serie        VARCHAR(100),
    numero_patrimonio   VARCHAR(50),
    numero_nf           VARCHAR(20),
    fornecedor          VARCHAR(150),
    cnpj_fornecedor     VARCHAR(18),
    data_aquisicao      DATE,
    garantia_meses      INT            NOT NULL DEFAULT 12,
    data_fim_garantia   DATE           GENERATED ALWAYS AS
                          (DATE_ADD(data_aquisicao, INTERVAL garantia_meses MONTH)) STORED,
    estado_conservacao  ENUM(
                          'Novo',
                          'Bom',
                          'Regular',
                          'Necessita manutenção',
                          'Inativo'
                        ) NOT NULL DEFAULT 'Novo',
    localizacao         VARCHAR(150),
    responsavel_bem     VARCHAR(100),
    observacoes         TEXT,
    created_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          INT,
    updated_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by          INT,

    PRIMARY KEY (id),
    CONSTRAINT fk_matperm_lanc  FOREIGN KEY (lancamento_id) REFERENCES lancamentos (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_matperm_gar  CHECK (garantia_meses >= 0)
);

-- ============================================================
-- 10. HISTÓRICO DE ALTERAÇÕES (AUDITORIA)
-- ============================================================
CREATE TABLE historico_alteracoes (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    tabela        VARCHAR(60)  NOT NULL,
    registro_id   INT          NOT NULL,
    operacao      ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    usuario_id    INT,
    dados_antes   JSON,
    dados_depois  JSON,
    alterado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_hist_tabela  (tabela, registro_id),
    INDEX idx_hist_usuario (usuario_id),
    INDEX idx_hist_data    (alterado_em)
);

-- ============================================================
-- TRIGGERS DE AUDITORIA
-- ============================================================

DELIMITER $$

-- ── USUARIOS ────────────────────────────────────────────────
CREATE TRIGGER trg_usuarios_after_insert
AFTER INSERT ON usuarios FOR EACH ROW
BEGIN
  INSERT INTO historico_alteracoes (tabela, registro_id, operacao, usuario_id, dados_depois)
  VALUES ('usuarios', NEW.id, 'INSERT', @usuario_atual_id,
    JSON_OBJECT('nome', NEW.nome, 'email', NEW.email, 'login', NEW.login,
                'papel_atividade', NEW.papel_atividade, 'ativo', NEW.ativo));
END$$

CREATE TRIGGER trg_usuarios_after_update
AFTER UPDATE ON usuarios FOR EACH ROW
BEGIN
  INSERT INTO historico_alteracoes (tabela, registro_id, operacao, usuario_id, dados_antes, dados_depois)
  VALUES ('usuarios', NEW.id, 'UPDATE', @usuario_atual_id,
    JSON_OBJECT('nome', OLD.nome, 'email', OLD.email, 'login', OLD.login,
                'papel_atividade', OLD.papel_atividade, 'ativo', OLD.ativo),
    JSON_OBJECT('nome', NEW.nome, 'email', NEW.email, 'login', NEW.login,
                'papel_atividade', NEW.papel_atividade, 'ativo', NEW.ativo));
END$$

CREATE TRIGGER trg_usuarios_after_delete
AFTER DELETE ON usuarios FOR EACH ROW
BEGIN
  INSERT INTO historico_alteracoes (tabela, registro_id, operacao, usuario_id, dados_antes)
  VALUES ('usuarios', OLD.id, 'DELETE', @usuario_atual_id,
    JSON_OBJECT('nome', OLD.nome, 'email', OLD.email, 'login', OLD.login,
                'papel_atividade', OLD.papel_atividade, 'ativo', OLD.ativo));
END$$

-- ── PROJETOS ─────────────────────────────────────────────────
CREATE TRIGGER trg_projetos_after_insert
AFTER INSERT ON projetos FOR EACH ROW
BEGIN
  INSERT INTO historico_alteracoes (tabela, registro_id, operacao, usuario_id, dados_depois)
  VALUES ('projetos', NEW.id, 'INSERT', @usuario_atual_id,
    JSON_OBJECT('nome', NEW.nome, 'orgao_financiador', NEW.orgao_financiador,
                'numero_edital', NEW.numero_edital, 'ano', NEW.ano,
                'valor_total_aprovado', NEW.valor_total_aprovado, 'status', NEW.status));
END$$

CREATE TRIGGER trg_projetos_after_update
AFTER UPDATE ON projetos FOR EACH ROW
BEGIN
  INSERT INTO historico_alteracoes (tabela, registro_id, operacao, usuario_id, dados_antes, dados_depois)
  VALUES ('projetos', NEW.id, 'UPDATE', @usuario_atual_id,
    JSON_OBJECT('nome', OLD.nome, 'orgao_financiador', OLD.orgao_financiador,
                'numero_edital', OLD.numero_edital, 'ano', OLD.ano,
                'valor_total_aprovado', OLD.valor_total_aprovado, 'status', OLD.status),
    JSON_OBJECT('nome', NEW.nome, 'orgao_financiador', NEW.orgao_financiador,
                'numero_edital', NEW.numero_edital, 'ano', NEW.ano,
                'valor_total_aprovado', NEW.valor_total_aprovado, 'status', NEW.status));
END$$

CREATE TRIGGER trg_projetos_after_delete
AFTER DELETE ON projetos FOR EACH ROW
BEGIN
  INSERT INTO historico_alteracoes (tabela, registro_id, operacao, usuario_id, dados_antes)
  VALUES ('projetos', OLD.id, 'DELETE', @usuario_atual_id,
    JSON_OBJECT('nome', OLD.nome, 'orgao_financiador', OLD.orgao_financiador,
                'numero_edital', OLD.numero_edital, 'ano', OLD.ano,
                'valor_total_aprovado', OLD.valor_total_aprovado, 'status', OLD.status));
END$$

-- ── LANCAMENTOS ─────────────────────────────────────────────
CREATE TRIGGER trg_lancamentos_after_insert
AFTER INSERT ON lancamentos FOR EACH ROW
BEGIN
  INSERT INTO historico_alteracoes (tabela, registro_id, operacao, usuario_id, dados_depois)
  VALUES ('lancamentos', NEW.id, 'INSERT', @usuario_atual_id,
    JSON_OBJECT('projeto_id', NEW.projeto_id, 'usuario_id', NEW.usuario_id,
                'categoria_id', NEW.categoria_id, 'status', NEW.status,
                'valor_total', NEW.valor_total, 'data_lancamento', NEW.data_lancamento,
                'descricao_item', NEW.descricao_item));
END$$

CREATE TRIGGER trg_lancamentos_after_update
AFTER UPDATE ON lancamentos FOR EACH ROW
BEGIN
  INSERT INTO historico_alteracoes (tabela, registro_id, operacao, usuario_id, dados_antes, dados_depois)
  VALUES ('lancamentos', NEW.id, 'UPDATE', @usuario_atual_id,
    JSON_OBJECT('projeto_id', OLD.projeto_id, 'usuario_id', OLD.usuario_id,
                'categoria_id', OLD.categoria_id, 'status', OLD.status,
                'valor_total', OLD.valor_total, 'data_lancamento', OLD.data_lancamento,
                'descricao_item', OLD.descricao_item),
    JSON_OBJECT('projeto_id', NEW.projeto_id, 'usuario_id', NEW.usuario_id,
                'categoria_id', NEW.categoria_id, 'status', NEW.status,
                'valor_total', NEW.valor_total, 'data_lancamento', NEW.data_lancamento,
                'descricao_item', NEW.descricao_item));
END$$

CREATE TRIGGER trg_lancamentos_after_delete
AFTER DELETE ON lancamentos FOR EACH ROW
BEGIN
  INSERT INTO historico_alteracoes (tabela, registro_id, operacao, usuario_id, dados_antes)
  VALUES ('lancamentos', OLD.id, 'DELETE', @usuario_atual_id,
    JSON_OBJECT('projeto_id', OLD.projeto_id, 'usuario_id', OLD.usuario_id,
                'categoria_id', OLD.categoria_id, 'status', OLD.status,
                'valor_total', OLD.valor_total, 'data_lancamento', OLD.data_lancamento,
                'descricao_item', OLD.descricao_item));
END$$

-- ── DETALHES_MATERIAL_CONSUMO ────────────────────────────────
CREATE TRIGGER trg_matcons_after_insert
AFTER INSERT ON detalhes_material_consumo FOR EACH ROW
BEGIN
  INSERT INTO historico_alteracoes (tabela, registro_id, operacao, usuario_id, dados_depois)
  VALUES ('detalhes_material_consumo', NEW.id, 'INSERT', @usuario_atual_id,
    JSON_OBJECT('lancamento_id', NEW.lancamento_id, 'tipo_material', NEW.tipo_material,
                'descricao_item', NEW.descricao_item, 'quantidade', NEW.quantidade,
                'valor_unitario', NEW.valor_unitario, 'fornecedor', NEW.fornecedor,
                'numero_nf', NEW.numero_nf));
END$$

CREATE TRIGGER trg_matcons_after_update
AFTER UPDATE ON detalhes_material_consumo FOR EACH ROW
BEGIN
  INSERT INTO historico_alteracoes (tabela, registro_id, operacao, usuario_id, dados_antes, dados_depois)
  VALUES ('detalhes_material_consumo', NEW.id, 'UPDATE', @usuario_atual_id,
    JSON_OBJECT('lancamento_id', OLD.lancamento_id, 'tipo_material', OLD.tipo_material,
                'descricao_item', OLD.descricao_item, 'quantidade', OLD.quantidade,
                'valor_unitario', OLD.valor_unitario, 'fornecedor', OLD.fornecedor,
                'numero_nf', OLD.numero_nf),
    JSON_OBJECT('lancamento_id', NEW.lancamento_id, 'tipo_material', NEW.tipo_material,
                'descricao_item', NEW.descricao_item, 'quantidade', NEW.quantidade,
                'valor_unitario', NEW.valor_unitario, 'fornecedor', NEW.fornecedor,
                'numero_nf', NEW.numero_nf));
END$$

CREATE TRIGGER trg_matcons_after_delete
AFTER DELETE ON detalhes_material_consumo FOR EACH ROW
BEGIN
  INSERT INTO historico_alteracoes (tabela, registro_id, operacao, usuario_id, dados_antes)
  VALUES ('detalhes_material_consumo', OLD.id, 'DELETE', @usuario_atual_id,
    JSON_OBJECT('lancamento_id', OLD.lancamento_id, 'tipo_material', OLD.tipo_material,
                'descricao_item', OLD.descricao_item, 'quantidade', OLD.quantidade,
                'valor_unitario', OLD.valor_unitario, 'fornecedor', OLD.fornecedor,
                'numero_nf', OLD.numero_nf));
END$$

-- ── DETALHES_SERVICOS_TERCEIROS ──────────────────────────────
CREATE TRIGGER trg_servterc_after_insert
AFTER INSERT ON detalhes_servicos_terceiros FOR EACH ROW
BEGIN
  INSERT INTO historico_alteracoes (tabela, registro_id, operacao, usuario_id, dados_depois)
  VALUES ('detalhes_servicos_terceiros', NEW.id, 'INSERT', @usuario_atual_id,
    JSON_OBJECT('lancamento_id', NEW.lancamento_id, 'tipo_servico', NEW.tipo_servico,
                'tipo_pessoa', NEW.tipo_pessoa, 'nome_prestador', NEW.nome_prestador,
                'cpf_cnpj', NEW.cpf_cnpj, 'valor_bruto', NEW.valor_bruto,
                'percentual_retencao', NEW.percentual_retencao, 'numero_contrato', NEW.numero_contrato));
END$$

CREATE TRIGGER trg_servterc_after_update
AFTER UPDATE ON detalhes_servicos_terceiros FOR EACH ROW
BEGIN
  INSERT INTO historico_alteracoes (tabela, registro_id, operacao, usuario_id, dados_antes, dados_depois)
  VALUES ('detalhes_servicos_terceiros', NEW.id, 'UPDATE', @usuario_atual_id,
    JSON_OBJECT('lancamento_id', OLD.lancamento_id, 'tipo_servico', OLD.tipo_servico,
                'tipo_pessoa', OLD.tipo_pessoa, 'nome_prestador', OLD.nome_prestador,
                'cpf_cnpj', OLD.cpf_cnpj, 'valor_bruto', OLD.valor_bruto,
                'percentual_retencao', OLD.percentual_retencao, 'numero_contrato', OLD.numero_contrato),
    JSON_OBJECT('lancamento_id', NEW.lancamento_id, 'tipo_servico', NEW.tipo_servico,
                'tipo_pessoa', NEW.tipo_pessoa, 'nome_prestador', NEW.nome_prestador,
                'cpf_cnpj', NEW.cpf_cnpj, 'valor_bruto', NEW.valor_bruto,
                'percentual_retencao', NEW.percentual_retencao, 'numero_contrato', NEW.numero_contrato));
END$$

CREATE TRIGGER trg_servterc_after_delete
AFTER DELETE ON detalhes_servicos_terceiros FOR EACH ROW
BEGIN
  INSERT INTO historico_alteracoes (tabela, registro_id, operacao, usuario_id, dados_antes)
  VALUES ('detalhes_servicos_terceiros', OLD.id, 'DELETE', @usuario_atual_id,
    JSON_OBJECT('lancamento_id', OLD.lancamento_id, 'tipo_servico', OLD.tipo_servico,
                'tipo_pessoa', OLD.tipo_pessoa, 'nome_prestador', OLD.nome_prestador,
                'cpf_cnpj', OLD.cpf_cnpj, 'valor_bruto', OLD.valor_bruto,
                'percentual_retencao', OLD.percentual_retencao, 'numero_contrato', OLD.numero_contrato));
END$$

-- ── DETALHES_MATERIAL_PERMANENTE ─────────────────────────────
CREATE TRIGGER trg_matperm_after_insert
AFTER INSERT ON detalhes_material_permanente FOR EACH ROW
BEGIN
  INSERT INTO historico_alteracoes (tabela, registro_id, operacao, usuario_id, dados_depois)
  VALUES ('detalhes_material_permanente', NEW.id, 'INSERT', @usuario_atual_id,
    JSON_OBJECT('lancamento_id', NEW.lancamento_id, 'descricao_bem', NEW.descricao_bem,
                'marca', NEW.marca, 'modelo', NEW.modelo, 'numero_serie', NEW.numero_serie,
                'numero_patrimonio', NEW.numero_patrimonio, 'numero_nf', NEW.numero_nf,
                'fornecedor', NEW.fornecedor, 'data_aquisicao', NEW.data_aquisicao,
                'garantia_meses', NEW.garantia_meses, 'estado_conservacao', NEW.estado_conservacao,
                'localizacao', NEW.localizacao));
END$$

CREATE TRIGGER trg_matperm_after_update
AFTER UPDATE ON detalhes_material_permanente FOR EACH ROW
BEGIN
  INSERT INTO historico_alteracoes (tabela, registro_id, operacao, usuario_id, dados_antes, dados_depois)
  VALUES ('detalhes_material_permanente', NEW.id, 'UPDATE', @usuario_atual_id,
    JSON_OBJECT('lancamento_id', OLD.lancamento_id, 'descricao_bem', OLD.descricao_bem,
                'marca', OLD.marca, 'modelo', OLD.modelo, 'numero_serie', OLD.numero_serie,
                'numero_patrimonio', OLD.numero_patrimonio, 'numero_nf', OLD.numero_nf,
                'fornecedor', OLD.fornecedor, 'data_aquisicao', OLD.data_aquisicao,
                'garantia_meses', OLD.garantia_meses, 'estado_conservacao', OLD.estado_conservacao,
                'localizacao', OLD.localizacao),
    JSON_OBJECT('lancamento_id', NEW.lancamento_id, 'descricao_bem', NEW.descricao_bem,
                'marca', NEW.marca, 'modelo', NEW.modelo, 'numero_serie', NEW.numero_serie,
                'numero_patrimonio', NEW.numero_patrimonio, 'numero_nf', NEW.numero_nf,
                'fornecedor', NEW.fornecedor, 'data_aquisicao', NEW.data_aquisicao,
                'garantia_meses', NEW.garantia_meses, 'estado_conservacao', NEW.estado_conservacao,
                'localizacao', NEW.localizacao));
END$$

CREATE TRIGGER trg_matperm_after_delete
AFTER DELETE ON detalhes_material_permanente FOR EACH ROW
BEGIN
  INSERT INTO historico_alteracoes (tabela, registro_id, operacao, usuario_id, dados_antes)
  VALUES ('detalhes_material_permanente', OLD.id, 'DELETE', @usuario_atual_id,
    JSON_OBJECT('lancamento_id', OLD.lancamento_id, 'descricao_bem', OLD.descricao_bem,
                'marca', OLD.marca, 'modelo', OLD.modelo, 'numero_serie', OLD.numero_serie,
                'numero_patrimonio', OLD.numero_patrimonio, 'numero_nf', OLD.numero_nf,
                'fornecedor', OLD.fornecedor, 'data_aquisicao', OLD.data_aquisicao,
                'garantia_meses', OLD.garantia_meses, 'estado_conservacao', OLD.estado_conservacao,
                'localizacao', OLD.localizacao));
END$$

DELIMITER ;

-- ============================================================
-- DADOS INICIAIS — Categorias padrão
-- ============================================================
INSERT INTO categorias (tipo_categoria, nome_subcategoria, descricao) VALUES
('CUSTEIO', 'Diária',               'Diárias de viagem para atividades do projeto'),
('CUSTEIO', 'Transporte',           'Passagens, combustível e locação de veículos'),
('CUSTEIO', 'Material de Consumo',  'Itens de papelaria, informática e similares'),
('CUSTEIO', 'Serviços de Terceiros','Contratação de PF ou PJ para serviços pontuais'),
('CAPITAL', 'Material Permanente',  'Equipamentos e bens de uso duradouro');

-- Projeto de exemplo
INSERT INTO projetos (nome, orgao_financiador, numero_edital, ano, valor_total_aprovado, status, descricao)
VALUES ('Fapergs 2026 — Edital 01/2026', 'Fapergs', '01/2026', 2026, 48500.00, 'Em andamento',
        'Projeto de pesquisa financiado pelo edital 01/2026 da Fapergs.');

-- ============================================================
-- RESUMO DO SCHEMA v5
-- ============================================================
-- Tabelas de domínio  : usuarios, projetos, categorias
-- Tabela central      : lancamentos         
-- Tabelas de detalhe  : detalhes_transporte        (1:1 — CASCADE)
--                       detalhes_diaria             (1:1 — CASCADE)
--                       detalhes_material_consumo   (1:N — CASCADE)
--                       detalhes_servicos_terceiros (1:1 — CASCADE)
--                       detalhes_material_permanente(1:1 — CASCADE)
-- Auditoria           : historico_alteracoes        (18 triggers)
-- Triggers totais     : 18 (3 × 6 tabelas auditadas)
-- ============================================================

-- ============================================================
-- INTEGRAÇÃO COM DJANGO
-- ============================================================
-- Antes de qualquer DML execute:
--   cursor.execute("SET @usuario_atual_id = %s", [request.user.id])
-- ============================================================

-- lancamentos: as 3 colunas mais filtradas
USE spectre;

ALTER TABLE lancamentos ADD INDEX idx_lanc_projeto_status (projeto_id, status);
ALTER TABLE lancamentos ADD INDEX idx_lanc_data (data_lancamento);
ALTER TABLE lancamentos ADD INDEX idx_lanc_projeto_data (projeto_id, data_lancamento);

-- historico_alteracoes: consultas por tabela e período
-- (já tem no schema v5, confirmar que estão criados)
-- INDEX idx_hist_tabela (tabela, registro_id)
-- INDEX idx_hist_data   (alterado_em)