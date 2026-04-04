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
| **Jéferson C. Silva** | Configuração do projeto Django, `models.py`, autenticação JWT, endpoints da API REST, banco de dados MySQL, triggers de auditoria, LGPD, A2F (autenticação em duas etapas), deploy no PythonAnywhere |
| **Erick Meurer** | Wireframes (wireframe.cc), front-end HTML/CSS/JS, validações de formulário, integração das telas com a API, exportação de relatórios CSV e PDF |

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

1. `POST /api/auth/login/` — valida `login` + `senha` via `check_password()` (hash PBKDF2)
2. Se A2F estiver ativo: retorna `{requires_2fa: true, pre_token}` (token temporário de 5 min)
3. Caso contrário: retorna `access_token` (8 horas) e `refresh_token` (1 dia)
4. O token carrega claims customizados: `usuario_id`, `login`, `nome`
5. `POST /api/auth/refresh/` — renova o access token silenciosamente

**Classe de autenticação customizada (`SpectreJWTAuthentication`):**

```python
class SpectreJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        uid = validated_token.get('usuario_id')
        usuario = Usuario.objects.get(id=uid, ativo=True)
        usuario.is_authenticated = True
        return usuario
```

O front-end implementa refresh transparente: toda requisição que retornar HTTP 401 automaticamente tenta renovar o token antes de redirecionar para o login. Os tokens são armazenados em memória (variáveis JS) — sem `localStorage` para reduzir superfície de ataque XSS.

### 2.3 Endpoints da API REST

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/login/` | Login e geração de tokens | Pública |
| POST | `/api/auth/refresh/` | Renovação do access token | Pública |
| POST | `/api/auth/cadastro/` | Cadastro de novo usuário | Pública |
| POST | `/api/auth/lgpd/aceitar/` | Registro de consentimento LGPD | JWT |
| POST | `/api/auth/a2f/setup/` | Gera secret TOTP e URI para QR code | JWT |
| POST | `/api/auth/a2f/confirmar/` | Confirma código e ativa A2F | JWT |
| POST | `/api/auth/a2f/verificar/` | Verifica código no login com A2F | Pública |
| POST | `/api/auth/a2f/desativar/` | Desativa A2F com senha + código | JWT |
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
# LancamentoSerializer
# - Expõe projeto_nome e categoria_nome (read-only via StringRelatedField)
# - Campos de escrita usam FK inteiros (projeto, categoria)

# UsuarioSerializer
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
0001_initial.py                          — Criação das tabelas base
0002_detalhesmaterialpermanente.py       — Tabela de material permanente
0003_projeto_lancamento_projeto.py       — Relacionamento projeto↔lançamento
0004_lancamento_ativo.py                 — Campo de soft-delete
0005_usuario_lgpd_a2f.py                 — Campos LGPD e A2F no modelo Usuario
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

O sistema conta com **12 telas/seções** implementadas:

| Tela | Descrição |
|------|-----------|
| **Login** | Autenticação com validação visual, toggle de senha visível, feedback de erro, suporte a A2F |
| **Dashboard** | Métricas executivas, gráfico de barras (Orçado × Realizado), gráfico de rosca (distribuição), lançamentos recentes |
| **Lançamentos** | Listagem paginada com filtros por edital, categoria, status e período |
| **Editais** | Cards de projetos com orçamento, período e status; ações de editar e finalizar |
| **Transporte** | Listagem e cadastro detalhado de despesas com transporte |
| **Diárias** | Listagem e cadastro de diárias com cálculo automático de total |
| **Consumo** | Cadastro multi-item de material de consumo |
| **Patrimônio** | Cadastro de material permanente com campos de garantia e conservação |
| **Serviços** | Cadastro de serviços de terceiros com cálculo de retenção fiscal |
| **Histórico** | Log de auditoria com todas as alterações do banco de dados |
| **Configurações** | Gestão de usuários, categorias e segurança (A2F e LGPD) |

---

## 5. Atividade 5 — Frontend e Validações (20%)

### 5.1 Arquitetura Frontend

O front-end é uma **Single Page Application (SPA) em arquivo único** (`spectre_app.html`) sem nenhum framework externo — HTML, CSS e JavaScript puros. A detecção de ambiente é automática:

```javascript
const API_BASE = window.location.protocol === 'file:'
    ? 'http://127.0.0.1:8000/api'   // desenvolvimento local
    : '/api';                         // produção (servidor web)
```

**Bibliotecas externas (via CDN):**
- `Chart.js 4.4.0` — gráficos de barras e rosca no dashboard
- `jsPDF 2.5.1 + AutoTable 3.8.2` — geração de PDF (carregado sob demanda)
- `qrcode.js` — QR code para setup do A2F (carregado sob demanda)
- `Google Fonts` — DM Sans, DM Mono, Playfair Display

### 5.2 Sistema de Navegação

A navegação é controlada pela função `goTo(page, keepStatus)` que:
1. Atualiza `currentPage`
2. Ajusta estados (filtros, status padrão de novo lançamento)
3. Chama `renderPage()` que despacha para a função de renderização correta

Cada página está mapeada para `[título, subtítulo, topbarFn, renderFn]`:

```javascript
'lancamentos': ['Lançamentos', '/ Todos os registros', renderTopbarLanc, renderLancamentos]
'dashboard':   ['Dashboard',   '/ Visão geral',        renderTopbarDash, renderDashboard]
```

### 5.3 Validações Implementadas

**Validações no formulário de login:**
- Campos obrigatórios com feedback visual (borda vermelha + mensagem)
- Indicador de carregamento no botão
- Mensagem de erro da API exibida inline
- Fluxo de segunda etapa (modal A2F) quando ativado

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
POST /api/auth/login/    → { access, refresh, usuario: {id, nome, login, papel, lgpd_aceito_em} }
POST /api/auth/refresh/  → { access }
```

### 6.b) Cadastro de Itens de Custeio e Capital

**Custeio implementado:**
- **Diárias** — cidade destino, quantidade, valor unitário, datas, motivo
- **Transporte** — meio (Voo, Ônibus, Carro próprio, Aplicativo, Táxi), origem/destino, datas, horários, custos discriminados
- **Material de Consumo** — cadastro multi-item com tipo, descrição, quantidade, unidade, valor, fornecedor e NF
- **Serviços de Terceiros** — tipo de serviço, prestador (PF/PJ), CPF/CNPJ, contrato, valor bruto, % retenção, valor líquido calculado automaticamente

**Capital implementado:**
- **Material Permanente** — descrição, marca, modelo, nº série, nº patrimônio, fornecedor, CNPJ, NF, garantia (meses), data de fim de garantia calculada automaticamente pelo trigger MySQL, estado de conservação, localização, responsável

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
- Paginação com 10 itens por página

### 6.e) Implantação

O sistema foi preparado e configurado para deploy no **PythonAnywhere**, com as seguintes adaptações realizadas no código:

**Configurações implementadas:**
```python
# settings.py
TEMPLATES = [{'DIRS': [BASE_DIR], ...}]  # serve o HTML como template Django
STATIC_ROOT = BASE_DIR / 'staticfiles'

# urls.py
path('', TemplateView.as_view(template_name='spectre_app.html'))  # rota raiz

# spectre_app.html
const API_BASE = window.location.protocol === 'file:'
    ? 'http://127.0.0.1:8000/api'
    : '/api';  # detecção automática do ambiente
```

**Situação do deploy:**
O deploy no PythonAnywhere foi parcialmente realizado. O código foi publicado no GitHub (`github.com/jefersoncsilva/spectre`) e clonado com sucesso no servidor. As dependências foram instaladas com Python 3.12.

A conclusão do deploy está pendente pela questão do banco de dados: o plano gratuito do PythonAnywhere não inclui MySQL nem permite conexões de saída na porta 3306 (necessária para bancos externos). A solução requer o upgrade para o plano pago (USD 5/mês — Hacker), que inclui MySQL integrado.

**Checklist de deploy:**
- [x] Repositório publicado no GitHub
- [x] Código clonado no PythonAnywhere
- [x] Virtualenv Python 3.12 criado
- [x] Dependências instaladas (`pip install -r requirements.txt`)
- [x] Arquivo `.env` configurado no servidor
- [ ] Banco MySQL ativo (pendente — requer plano pago)
- [ ] `python manage.py migrate` executado no servidor
- [ ] Arquivo WSGI configurado no painel PythonAnywhere
- [ ] Triggers de auditoria importados via phpMyAdmin

### 6.f) Extras e Melhorias

#### API REST

A API REST está completamente implementada, seguindo os padrões:
- Respostas JSON padronizadas com `{count, next, previous, results}`
- Códigos HTTP corretos (200, 201, 204, 400, 401, 403, 404)
- Proteção JWT em todos os endpoints privados

#### Exportação de Relatórios — CSV e PDF

Sistema completo de exportação em **dois formatos** implementado em todas as telas. O usuário escolhe o formato (CSV ou PDF) no modal de exportação antes de gerar o arquivo.

**Cobertura por tela:**

| Tela | Arquivo CSV gerado | Arquivo PDF gerado |
|------|-------------------|-------------------|
| Dashboard | `spectre_dashboard_YYYY-MM-DD.csv` | `spectre_dashboard_YYYY-MM-DD.pdf` |
| Lançamentos | `spectre_lancamentos_YYYY-MM-DD.csv` | `spectre_lancamentos_YYYY-MM-DD.pdf` |
| Editais | `spectre_editais_YYYY-MM-DD.csv` | `spectre_editais_YYYY-MM-DD.pdf` |
| Transporte | `spectre_transporte_YYYY-MM-DD.csv` | `spectre_transporte_YYYY-MM-DD.pdf` |
| Diárias | `spectre_diarias_YYYY-MM-DD.csv` | `spectre_diarias_YYYY-MM-DD.pdf` |
| Consumo | `spectre_consumo_YYYY-MM-DD.csv` | `spectre_consumo_YYYY-MM-DD.pdf` |
| Patrimônio | `spectre_patrimonio_YYYY-MM-DD.csv` | `spectre_patrimonio_YYYY-MM-DD.pdf` |
| Serviços | `spectre_servicos_YYYY-MM-DD.csv` | `spectre_servicos_YYYY-MM-DD.pdf` |

**Especificações do CSV:**
- Codificação: UTF-8 com BOM (compatível com Excel, LibreOffice, Google Sheets)
- Separador: `;` (padrão brasileiro)
- Cabeçalho institucional com nome do sistema, data/hora, usuário e filtros aplicados
- Linha de totais ao final de cada seção

**Especificações do PDF:**
- Gerado no navegador via biblioteca `jsPDF + AutoTable` (sem dependência de servidor)
- Layout A4 — retrato para Dashboard, paisagem para tabelas
- Cabeçalho escuro com nome do relatório e filtros aplicados
- Tabelas zebradas com linha de total em destaque
- Rodapé com número de página em todas as folhas
- Cores de status: ORÇADO (dourado), REALIZADO (verde)

#### Proteção de Dados — LGPD

O sistema implementa conformidade com a **Lei Geral de Proteção de Dados Pessoais** (Lei nº 13.709/2018):

**Campos adicionados ao modelo `Usuario`:**
```python
lgpd_aceito_em = models.DateTimeField(null=True, blank=True)
lgpd_ip        = models.GenericIPAddressField(null=True, blank=True)
```

**Funcionalidades implementadas:**
- Modal de consentimento LGPD exibido após o primeiro login (bloqueante — impede uso do sistema até o aceite)
- Texto completo com direitos do titular (Art. 18), base legal (Art. 7º), finalidade e controlador
- Registro da data/hora e IP do aceite no banco de dados
- Endpoint `POST /api/auth/lgpd/aceitar/` que persiste o consentimento
- Aba "Segurança" em Configurações exibe status e data do consentimento

**Rastreabilidade automática:**
Adicionalmente, os 18 triggers MySQL registram automaticamente todas as alterações na tabela `historico_alteracoes`, atendendo ao princípio de rastreabilidade e responsabilização da LGPD.

#### Autenticação em Duas Etapas — A2F (TOTP)

O sistema implementa autenticação em duas etapas baseada em **TOTP** (Time-based One-Time Password), compatível com Google Authenticator e Authy, utilizando a biblioteca `pyotp`.

**Campos adicionados ao modelo `Usuario`:**
```python
totp_secret = models.CharField(max_length=32, null=True, blank=True)
a2f_ativo   = models.BooleanField(default=False)
```

**Fluxo de login com A2F ativo:**
```
1. POST /api/auth/login/  → { requires_2fa: true, pre_token }  (JWT 5 min)
2. Usuário insere código TOTP de 6 dígitos no modal
3. POST /api/auth/a2f/verificar/  → { access, refresh, usuario }
4. Sistema continua normalmente
```

**Fluxo de ativação (aba Segurança → Configurações):**
```
1. POST /api/auth/a2f/setup/     → { uri, secret }
2. Frontend gera QR code via qrcode.js (sem enviar o secret a servidores externos)
3. Usuário escaneia com autenticador
4. POST /api/auth/a2f/confirmar/ → valida código e ativa A2F
```

**Desativação:**
- Requer confirmação com senha + código TOTP atual
- `POST /api/auth/a2f/desativar/`

---

## Considerações Finais

O sistema SPECTRE foi desenvolvido com foco em três pilares:

1. **Funcionalidade completa** — Cobre todo o ciclo de vida financeiro de um projeto de pesquisa: orçamento, execução, controle e prestação de contas.

2. **Qualidade técnica** — API REST bem estruturada, autenticação JWT com suporte a A2F/TOTP, conformidade LGPD, auditoria automática via triggers MySQL, cache de dashboard, exportação em CSV e PDF, design responsivo e validações client-side robustas.

3. **Usabilidade** — Interface minimalista e intuitiva, com controle de acesso por papel, filtros contextuais, relatórios prontos para uso sem ajuste de colunas, e feedback visual em todas as ações.

O código-fonte completo está disponível no repositório GitHub (`github.com/jefersoncsilva/spectre`) e no arquivo ZIP entregue junto a este documento, contendo:
- `spectre_project/` — Configuração Django
- `core/` — Aplicação principal (models, views, serializers, urls, authentication, signals)
- `spectre_app.html` — Front-end SPA completo
- `requirements.txt` — Dependências Python
- `DEPLOY_PYTHONANYWHERE.md` — Guia de deploy
- Script SQL de criação do banco de dados e triggers
