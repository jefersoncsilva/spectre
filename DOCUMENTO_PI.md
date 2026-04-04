# SPECTRE — Sistema de Controle Financeiro de Projetos de Pesquisa

**Documento de Especificação do Projeto Integrador — Módulo III A**
**Professor:** Gilson A. Helfer
**Data de entrega final:** 27/04/2026
**Curso:** Análise e Desenvolvimento de Sistemas — EAD

**Integrantes:**
- Erick Meurer
- Jéferson Corrêa da Silva

---

## Versionamento

| Versão | Data | Responsável | Observações |
|--------|------|-------------|-------------|
| 1.4 | 27/04/2026 | Time de estudantes | Entrega final — documento completo + ZIP + vídeo (50% da nota) |
| 1.3 | 13/04/2026 | Time de estudantes | Apresentação das Atividades 2, 3, 4 e 5 (10% da nota) |
| 1.2 | 06/04/2026 | Time de estudantes | Entrega parcial — Atividades 1, 2, 3 e 4 (40% da nota) |
| 1.1 | 23/03/2026 | Time de estudantes | Apresentação da Atividade 1 |
| 1.0 | 09/03/2026 | Prof. Gilson Helfer | Apresentação da especificação do PI |

---

## Sumário

1. [Atividade 1 — Contextualização e Modelagem (10%)](#1-atividade-1--contextualização-e-modelagem-10)
2. [Atividade 2 — Backend e Autenticação (25%)](#2-atividade-2--backend-e-autenticação-25)
3. [Atividade 3 — Banco de Dados (10%)](#3-atividade-3--banco-de-dados-10)
4. [Atividade 4 — Interfaces (10%)](#4-atividade-4--interfaces-10)
5. [Atividade 5 — Frontend e Validações (20%)](#5-atividade-5--frontend-e-validações-20)
6. [Atividade 6 — Sistema Completo e Deploy (25%)](#6-atividade-6--sistema-completo-e-deploy-25)

---

## 1. Atividade 1 — Contextualização e Modelagem (10%)

### 1.1 Contextualização

O **SPECTRE** (_Sistema de Controle Financeiro de Projetos de Pesquisa_) é uma plataforma web voltada ao monitoramento e controle financeiro de projetos submetidos a editais de fomento à pesquisa. O sistema foi desenvolvido para a UNISC no contexto do PI Módulo III A (2026).

**Objetivo principal:** permitir o acompanhamento detalhado das despesas ao longo da execução de um projeto de pesquisa, comparando valores orçados com realizados, garantindo transparência e apoio à prestação de contas junto a agências financiadoras (CNPq, FAPERGS, CAPES, etc.).

O nome _Spectre_ remete à ideia de "espectro" — uma visão ampla e completa das finanças do projeto, enxergando cada dimensão do orçamento de forma clara.

**Categorias de despesa suportadas:**

| Tipo | Subcategorias |
|------|--------------|
| **Custeio** | Diárias, Transporte, Material de Consumo, Serviços de Terceiros |
| **Capital** | Material Permanente (equipamentos e bens duráveis) |

**Papéis de usuário:**

| Papel | Permissões |
|-------|-----------|
| Administrador / Desenvolvedor | Acesso total — CRUD em todas as entidades |
| Coordenador | Acesso total exceto configurações de sistema |
| Pesquisador | Visualização e cadastro apenas de lançamentos próprios (status REALIZADO) |

### 1.2 Modelo de Dados

O Modelo Entidade-Relacionamento (ER) foi projetado de forma modular, com rastreabilidade completa via triggers MySQL. Compõe-se de **10 tabelas principais**:

```
usuarios            — Cadastro e autenticação de usuários
projetos            — Editais e projetos de pesquisa
categorias          — Subcategorias de custeio e capital
lancamentos         — Registro central (orçado/realizado)
detalhes_transporte — Detalhamento de despesas de transporte
detalhes_diaria     — Detalhamento de diárias
detalhes_material_consumo    — Itens de material de consumo
detalhes_servicos_terceiros  — Serviços de pessoa física/jurídica
detalhes_material_permanente — Equipamentos e bens permanentes
historico_alteracoes         — Auditoria automática (via triggers)
```

**Diagrama ER completo (PDF):**
https://drive.google.com/file/d/1OaQwawppDsJ6utZ4o3rf7Ck2JzhSTPxs/view?usp=sharing

**Diagrama de Classes (PDF):**
https://drive.google.com/file/d/1q825WohvQYjM9-6_NNur6K5mk-l0zBtk/view?usp=sharing

### 1.3 Divisão dos Trabalhos

| Integrante | Responsabilidades |
|------------|-------------------|
| **Jéferson C. Silva** | Configuração do projeto Django, `models.py`, autenticação JWT, endpoints da API REST, banco de dados MySQL, triggers de auditoria, deploy no PythonAnywhere |
| **Erick Meurer** | Wireframes (wireframe.cc), front-end HTML/CSS/JS, validações de formulário, integração das telas com a API, exportação de relatórios CSV |

---

## 2. Atividade 2 — Backend e Autenticação (25%)

### 2.1 Stack e Arquitetura

O back-end foi implementado em **Python com Django 6.0.3** seguindo a arquitetura REST. O banco de dados utilizado é **MySQL**, e a comunicação com o front-end ocorre exclusivamente via API JSON.

```
spectre_project/        — Configurações do projeto Django
├── settings.py         — Configurações gerais, CORS, cache, JWT
├── urls.py             — Roteamento principal
core/                   — Aplicação principal
├── models.py           — Modelos de dados (10 entidades)
├── serializers.py      — Serialização e validação dos dados
├── views.py            — ViewSets CRUD + endpoints customizados
├── urls.py             — Rotas da API REST
└── authentication.py   — Autenticação JWT customizada
```

### 2.2 Autenticação JWT

O sistema utiliza **SimpleJWT** com um modelo de usuário completamente customizado (`Usuario`), sem utilizar o sistema de autenticação padrão do Django. O fluxo é:

1. `POST /api/auth/login/` — valida `login` + `senha` via `check_password()` (hash bcrypt/PBKDF2)
2. Retorna `access_token` (curta duração) e `refresh_token` (longa duração)
3. O token carrega claims customizados: `usuario_id`, `login`, `nome`
4. `POST /api/auth/refresh/` — renova o access token silenciosamente

**Classe de autenticação customizada (`SpectreJWTAuthentication`):**

```python
class SpectreJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        uid = validated_token.get('usuario_id')
        usuario = Usuario.objects.get(id=uid, ativo=True)
        usuario.is_authenticated = True
        return usuario
```

O front-end implementa refresh transparente: toda requisição que retornar HTTP 401 automaticamente tenta renovar o token antes de redirecionar para o login.

### 2.3 Endpoints da API REST

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/login/` | Login e geração de tokens | Pública |
| POST | `/api/auth/refresh/` | Renovação do access token | Pública |
| POST | `/api/auth/cadastro/` | Cadastro de novo usuário | Pública |
| GET/POST | `/api/usuarios/` | Listagem e cadastro de usuários | JWT |
| GET/PUT/DELETE | `/api/usuarios/{id}/` | Detalhe, edição, exclusão | JWT |
| GET/POST | `/api/projetos/` | Listagem e cadastro de editais | JWT |
| GET/PUT/DELETE | `/api/projetos/{id}/` | Detalhe, edição, exclusão | JWT |
| GET/POST | `/api/lancamentos/` | Listagem e cadastro de lançamentos | JWT |
| GET/PUT/DELETE | `/api/lancamentos/{id}/` | Detalhe, edição, exclusão | JWT |
| GET/POST | `/api/categorias/` | Categorias de custeio/capital | JWT |
| GET | `/api/dashboard/resumo/` | Métricas agregadas com cache | JWT |
| GET/POST | `/api/detalhes/transporte/` | Detalhes de transporte | JWT |
| GET/POST | `/api/detalhes/diaria/` | Detalhes de diárias | JWT |
| GET/POST | `/api/detalhes/consumo/` | Detalhes de material de consumo | JWT |
| GET/POST | `/api/detalhes/servicos/` | Detalhes de serviços de terceiros | JWT |
| GET/POST | `/api/detalhes/permanente/` | Detalhes de material permanente | JWT |
| GET | `/api/historico/` | Auditoria de alterações | JWT |

**Filtros disponíveis em `/api/lancamentos/`:**
`projeto_id`, `status`, `categoria_id`, `usuario_id`, `mes`, `ano`, `inativos`

### 2.4 Serializers e Validações

```python
# Exemplo: LancamentoSerializer
# - Expõe projeto_nome e categoria_nome (read-only via StringRelatedField)
# - Campos de escrita usam FK inteiros (projeto, categoria)

# Exemplo: UsuarioSerializer
# - Campo virtual senha (write-only)
# - create() e update() aplicam make_password() automaticamente
# - senha_hash nunca é exposta na resposta
```

### 2.5 Paginação e Cache

- **Paginação:** `PageNumberPagination` com `PAGE_SIZE=10`. Respostas seguem o padrão `{count, next, previous, results:[]}`.
- **Cache do dashboard:** Respostas de `/api/dashboard/resumo/` são cacheadas por **5 minutos** com chave `dashboard:{projeto_id}:{mes}:{ano}`. O cache é invalidado automaticamente via `post_save`/`post_delete` de `Lancamento` através de signals Django registrados em `CoreConfig.ready()`.

---

## 3. Atividade 3 — Banco de Dados (10%)

### 3.1 Configuração MySQL

O banco de dados **MySQL** (`spectre`) foi configurado com credenciais via `python-decouple` (arquivo `.env`), separando as configurações sensíveis do código-fonte:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='3306'),
    }
}
```

### 3.2 Script SQL e Migrações

O banco foi criado e estruturado através das migrações Django, com um script SQL completo gerado a partir da estrutura final:

**Script SQL completo (Google Drive):**
https://drive.google.com/file/d/1A8CLttJXHKpnq2BglCKyvu0YiMxCfSKw/view?usp=drive_link

**Migrações aplicadas:**
```
0001_initial.py              — Criação das tabelas base
0002_detalhesmaterialpermanente.py — Tabela de material permanente
0003_projeto_lancamento_projeto.py — Relacionamento projeto↔lançamento
0004_lancamento_ativo.py     — Campo de soft-delete
```

### 3.3 Triggers de Auditoria

O sistema implementa **18 triggers MySQL** que populam automaticamente a tabela `historico_alteracoes` após qualquer operação de INSERT, UPDATE ou DELETE nas tabelas principais. O Django **nunca escreve diretamente** nessa tabela — ela tem `managed = False` no model.

O padrão de rastreabilidade exige que, antes de qualquer escrita, o Django execute:
```sql
SET @usuario_atual_id = {id_do_usuario_logado};
```

Isso é feito pelo helper `set_usuario_sessao()` chamado em todo `perform_create()` e `perform_update()` dos ViewSets.

**Tabelas monitoradas pelos triggers:**
`projetos`, `usuarios`, `categorias`, `lancamentos`, `detalhes_transporte`, `detalhes_diaria`, `detalhes_material_consumo`, `detalhes_servicos_terceiros`, `detalhes_material_permanente`

### 3.4 Campos calculados por triggers

Alguns campos dos modelos de detalhe são calculados automaticamente pelo MySQL, nunca pelo Django:

| Tabela | Campo calculado |
|--------|-----------------|
| `detalhes_servicos_terceiros` | `valor_retencao`, `valor_liquido` |
| `detalhes_material_permanente` | `data_fim_garantia` |

---

## 4. Atividade 4 — Interfaces (10%)

### 4.1 Wireframes

Os wireframes foram desenvolvidos por Erick Meurer utilizando a plataforma **wireframe.cc**, contemplando todas as telas do sistema antes da implementação.

### 4.2 Telas Implementadas

O sistema conta com **11 telas/seções** implementadas:

| Tela | Descrição |
|------|-----------|
| **Login** | Autenticação com validação visual, toggle de senha visível, feedback de erro |
| **Dashboard** | Métricas executivas, gráfico de barras (Orçado × Realizado), gráfico de rosca (distribuição), lançamentos recentes |
| **Lançamentos** | Listagem paginada com filtros por edital, categoria, status e período |
| **Editais** | Cards de projetos com orçamento, período e status; ações de editar e finalizar |
| **Transporte** | Listagem e cadastro detalhado de despesas com transporte |
| **Diárias** | Listagem e cadastro de diárias com cálculo automático de total |
| **Consumo** | Cadastro multi-item de material de consumo |
| **Patrimônio** | Cadastro de material permanente com campos de garantia e conservação |
| **Serviços** | Cadastro de serviços de terceiros com cálculo de retenção fiscal |
| **Histórico** | Log de auditoria com todas as alterações do banco de dados |
| **Configurações** | Gestão de usuários e categorias (exclusivo Administrador/Desenvolvedor) |

---

## 5. Atividade 5 — Frontend e Validações (20%)

### 5.1 Arquitetura Frontend

O front-end é uma **Single Page Application (SPA) em arquivo único** (`spectre_app.html`) sem nenhum framework externo — HTML, CSS e JavaScript puros. A aplicação é aberta diretamente no navegador e consome a API Django em `http://127.0.0.1:8000/api/`.

**Bibliotecas externas (via CDN):**
- `Chart.js 4.4.0` — gráficos de barras e rosca no dashboard
- `Google Fonts` — DM Sans, DM Mono, Playfair Display

### 5.2 Sistema de Navegação

A navegação é controlada pela função `goTo(page, keepStatus)` que:
1. Atualiza `currentPage`
2. Ajusta estados (filtros, status padrão de novo lançamento)
3. Chama `renderPage()` que despacha para a função de renderização correta

Cada página está mapeada para `[título, subtítulo, topbarFn, renderFn]`:

```javascript
'lancamentos': ['Lançamentos', '/ Todos os registros', renderTopbarLanc, renderLancamentos]
'dashboard':   ['Dashboard',   '/ Visão geral',         renderTopbarDash, renderDashboard]
// ...
```

### 5.3 Validações Implementadas

**Validações no formulário de login:**
- Campos obrigatórios com feedback visual (borda vermelha + mensagem)
- Indicador de carregamento no botão
- Mensagem de erro da API exibida inline

**Validações nos formulários de cadastro:**
- Campos obrigatórios marcados com `*` e verificados antes do envio
- Feedback de erro específico por campo
- Confirmação de sucesso com redirecionamento automático
- Senha mascarada com toggle de visualização

**Validações nos modais de detalhe:**
- Campos obrigatórios verificados antes do POST
- Cálculo automático de totais (diárias: `qtd × valor_unitário`; serviços: `valor_bruto - retenção`)
- Seletor de meio de transporte exibe/oculta campos condicionalmente

**Controle de acesso client-side:**

```javascript
function isAdmin()       { return ['Administrador','Desenvolvedor'].includes(...) }
function isPesquisador() { return papel === 'Pesquisador' }
function canDelete()     { return isAdmin() || isCoord() }
```

- Menu oculta itens não permitidos por papel
- Pesquisador não vê botões de exclusão
- Redirecionamento automático ao tentar acessar página proibida

### 5.4 Identidade Visual

O sistema adota um design **minimalista e profissional**, inspirado em ferramentas financeiras empresariais:

| Elemento | Escolha |
|----------|---------|
| Fonte primária | DM Sans (300/400/500/600) |
| Fonte mono | DM Mono — valores financeiros, códigos |
| Fonte display | Playfair Display Italic — tagline do login |
| Cor primária | `#1A4DC2` (azul corporativo) |
| Cor sucesso | `#097D78` (teal) |
| Cor alerta | `#B7891A` (gold) |
| Cor erro | `#C0392B` (vermelho) |
| Fundo | `#F7F9FC` (cinza suave) |
| Cards/modal | `#FFFFFF` com borda `#DDE3EC` |

### 5.5 Componentes Reutilizáveis

- **`filter-bar`** — barra de filtros padrão com selects estilizados
- **`kpi-card`** — card de indicador financeiro com barra de progresso
- **`tbl-wrap`** — tabela paginada com ordenação
- **`badge`** — badges coloridos por status (ORÇADO: gold, REALIZADO: green)
- **`modal-overlay`** — sistema de modais com fechamento por overlay e botão ✕

---

## 6. Atividade 6 — Sistema Completo e Deploy (25%)

### 6.a) Autenticação de Usuário

**Implementado:** Login com `login` + `senha`, geração de JWT com claims customizados, refresh token transparente, logout com limpeza de tokens.

```
POST /api/auth/login/    → { access, refresh, usuario: {id, nome, login, papel} }
POST /api/auth/refresh/  → { access }
```

O front-end armazena tokens em memória (variáveis JS) — sem `localStorage` para reduzir superfície de ataque XSS.

### 6.b) Cadastro de Itens de Custeio e Capital

**Custeio implementado:**
- **Diárias** — cidade destino, quantidade, valor unitário, datas, motivo
- **Transporte** — meio (Voo, Ônibus, Carro próprio, Aplicativo, Táxi), origem/destino, datas, horários, custos discriminados
- **Material de Consumo** — cadastro multi-item com tipo, descrição, quantidade, unidade, valor, fornecedor e NF
- **Serviços de Terceiros** — tipo de serviço, prestador (PF/PJ), CPF/CNPJ, contrato, valor bruto, % retenção, valor líquido calculado automaticamente

**Capital implementado:**
- **Material Permanente** — descrição, marca, modelo, nº série, nº patrimônio, fornecedor, CNPJ, NF, garantia (meses), data de início de garantia calculada automaticamente pelo trigger MySQL, estado de conservação, localização, responsável

Todos os cadastros de detalhe criam simultaneamente um `Lancamento` (status `REALIZADO`) e o registro específico de detalhe, vinculados por `OneToOneField` (exceto consumo, que usa `ForeignKey` para suportar múltiplos itens por lançamento).

### 6.c) Cálculo de Métricas (Dashboard)

O endpoint `/api/dashboard/resumo/` executa **3 queries otimizadas** e retorna:

```json
{
  "totais": {
    "total_orcado": 50000.00,
    "total_realizado": 11550.00,
    "count_orcado": 5,
    "count_realizado": 2
  },
  "por_categoria": [
    { "categoria__nome_subcategoria": "Transporte",
      "orcado": 10000.00, "realizado": 500.00 },
    ...
  ],
  "recentes": [ /* últimos 5 lançamentos */ ]
}
```

**Cálculos apresentados:**
- Total orçado vs. realizado
- Saldo disponível (`orçado - realizado`)
- Taxa de execução em percentual
- Distribuição por categoria (gráfico de barras e rosca)
- Contagem de lançamentos por status

### 6.d) Dashboard dos Itens Orçados/Realizados

**Filtros disponíveis:** Edital (projeto), Mês, Ano

**Visualizações:**
- 4 KPI cards: Total Orçado, Total Realizado, Saldo Disponível, Qtd. Lançamentos
- Gráfico de barras agrupado: Orçado × Realizado por categoria (Chart.js)
- Gráfico de rosca: distribuição percentual do realizado por categoria
- Tabela de lançamentos recentes com link "Ver todos"

**Listagem completa de lançamentos** (tela Lançamentos):
- Filtros: edital, categoria, status, período
- Status padrão ao entrar pelo menu: `ORÇADO` (mostra o que está planejado)
- Status padrão ao entrar de um edital: `Todos`
- Paginação com 10 itens por página

### 6.e) Implantação

O sistema está configurado para deploy no **PythonAnywhere**:

**Configurações de produção necessárias:**
```python
DEBUG = False
ALLOWED_HOSTS = ['usuario.pythonanywhere.com']
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = ['https://usuario.pythonanywhere.com']
```

**Checklist de deploy:**
- [ ] Conta no PythonAnywhere criada
- [ ] Banco MySQL configurado no painel PythonAnywhere
- [ ] Arquivo `.env` com credenciais do banco de produção
- [ ] `pip install -r requirements.txt` no ambiente virtual
- [ ] `python manage.py migrate` executado
- [ ] Arquivo WSGI configurado apontando para `spectre_project.wsgi`
- [ ] URL do front-end atualizada para `https://usuario.pythonanywhere.com/api/`

**Dependências (`requirements.txt`):**
```
Django==6.0.3
djangorestframework
djangorestframework-simplejwt
django-cors-headers
mysqlclient
python-decouple
```

### 6.f) Extras e Melhorias

#### API REST

A API REST está completamente implementada e documentada, seguindo os padrões:
- Respostas JSON padronizadas com `{count, next, previous, results}`
- Códigos HTTP corretos (200, 201, 204, 400, 401, 403, 404)
- CORS configurado para desenvolvimento (`CORS_ALLOW_ALL_ORIGINS = True`)
- Proteção JWT em todos os endpoints privados

#### Exportação de Relatórios CSV

Sistema completo de exportação implementado em todas as telas:

| Tela | Arquivo gerado | Filtros disponíveis |
|------|---------------|---------------------|
| Dashboard | `spectre_dashboard_YYYY-MM-DD.csv` | Edital, Mês, Ano, Seções |
| Lançamentos | `spectre_lancamentos_YYYY-MM-DD.csv` | Edital, Categoria, Status, Período |
| Editais | `spectre_editais_YYYY-MM-DD.csv` | Status, Ano |
| Transporte | `spectre_transporte_YYYY-MM-DD.csv` | Edital, Período |
| Diárias | `spectre_diarias_YYYY-MM-DD.csv` | Edital, Período |
| Consumo | `spectre_consumo_YYYY-MM-DD.csv` | Edital, Período |
| Patrimônio | `spectre_patrimonio_YYYY-MM-DD.csv` | Edital, Período |
| Serviços | `spectre_servicos_YYYY-MM-DD.csv` | Edital, Período |

**Formato do arquivo CSV:**
- Codificação: **UTF-8 com BOM** (compatível com Microsoft Excel, LibreOffice Calc, Google Sheets)
- Separador: `;` (ponto e vírgula — padrão brasileiro)
- Cabeçalho institucional com nome do sistema, data/hora de geração, usuário e filtros aplicados
- Seções separadas com linha em branco
- Linha de totais ao final de cada seção

**Estrutura do arquivo (exemplo — Dashboard):**
```
SPECTRE — Sistema de Controle Financeiro de Projetos de Pesquisa
Universidade de Santa Cruz do Sul — UNISC · PI Módulo III A · 2026

Relatório:;Dashboard — Resumo Executivo
Gerado em:;03/04/2026 às 14:30
Usuário:;Jéferson Corrêa da Silva
Filtros aplicados:;Edital: Projeto X | Mês: abril | Ano: 2026

RESUMO EXECUTIVO

Indicador;Valor
Total Orçado;R$ 50.000,00
Total Realizado;R$ 11.550,00
Saldo Disponível;R$ 38.450,00
Taxa de Execução;23,1%
Lançamentos Orçados (qtd);5
Lançamentos Realizados (qtd);2

ORÇADO × REALIZADO POR CATEGORIA

Categoria;Orçado (R$);Realizado (R$);Saldo (R$);% Executado
Diária;R$ 10.000,00;R$ 1.050,00;R$ 8.950,00;10,5%
Transporte;R$ 10.000,00;R$ 500,00;R$ 9.500,00;5,0%
...
TOTAL;R$ 50.000,00;R$ 11.550,00;R$ 38.450,00;23,1%
```

#### Rastreabilidade e Auditoria (LGPD)

O sistema implementa rastreabilidade completa de todas as alterações via triggers MySQL, registrando automaticamente quem fez, o quê e quando em cada operação. A tabela `historico_alteracoes` é acessível na tela **Histórico** e exportável. Isso atende parcialmente os requisitos de rastreabilidade da LGPD (Lei Geral de Proteção de Dados — Lei nº 13.709/2018).

---

## Considerações Finais

O sistema SPECTRE foi desenvolvido com foco em três pilares:

1. **Funcionalidade completa** — Cobre todo o ciclo de vida financeiro de um projeto de pesquisa: orçamento, execução, controle e prestação de contas.

2. **Qualidade técnica** — API REST bem estruturada, autenticação por token JWT, auditoria automática via triggers MySQL, cache de dashboard, design responsivo e validações client-side robustas.

3. **Usabilidade** — Interface minimalista e intuitiva, com controle de acesso por papel, filtros contextuais, exportação de relatórios organizados e feedback visual em todas as ações.

O código-fonte completo está disponível no arquivo ZIP entregue junto a este documento, contendo:
- `spectre_project/` — Configuração Django
- `core/` — Aplicação principal (models, views, serializers, urls)
- `spectre_app.html` — Front-end SPA completo
- `requirements.txt` — Dependências Python
- `.env.example` — Exemplo de configuração de ambiente
- Script SQL de criação do banco de dados
