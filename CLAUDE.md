# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

SPECTRE — sistema de controle financeiro para projetos de pesquisa (UNISC · PI Módulo III A · 2026). Backend Django REST + MySQL. Frontend single-file HTML (`spectre_app.html`) consumindo a API diretamente via `fetch`.

## Commands

```bash
# Ativar venv (Windows)
venv\Scripts\activate

# Rodar servidor de desenvolvimento
python manage.py runserver

# Aplicar migrações
python manage.py migrate

# Criar migração após alterar models.py
python manage.py makemigrations

# Shell Django (para testar queries ou atualizar dados)
python manage.py shell

# Atualizar um campo de usuário via shell
python manage.py shell -c "from core.models import Usuario; u=Usuario.objects.get(login='jeferson'); u.papel_atividade='Desenvolvedor'; u.save()"

# Resetar senha de usuário via shell
python manage.py shell -c "from django.contrib.auth.hashers import make_password; from core.models import Usuario; u=Usuario.objects.get(login='jeferson'); u.senha_hash=make_password('123456'); u.save()"

# Rodar testes
python manage.py test core

# Rodar um teste específico
python manage.py test core.tests.NomeDaClasse.nome_do_metodo
```

## Architecture

### Backend (`spectre_project/` + `core/`)

Single Django app (`core`) with no Django auth — uses a custom `Usuario` model with `senha_hash` (Django's `make_password`/`check_password`).

**JWT flow**: Login via `POST /api/auth/login/` returns SimpleJWT tokens with custom claims (`usuario_id`, `login`, `nome`). The response also includes `papel_atividade` no objeto `usuario`. All protected endpoints use `SpectreJWTAuthentication` (`core/authentication.py`) which resolves the token's `usuario_id` claim against `Usuario`, sets `usuario.is_authenticated = True`, and returns it — bypassing Django's built-in User model entirely. Token lifetimes: access = 8 hours, refresh = 1 day.

**Trigger audit pattern**: MySQL triggers populate `historico_alteracoes` automatically. Django never writes to that table — `HistoricoAlteracoes` has `managed = False`. Triggers require `SET @usuario_atual_id = %s` before any write; the helper `set_usuario_sessao()` in `views.py` handles this and must be called in every `perform_create`/`perform_update`.

**Dashboard cache**: `GET /api/dashboard/resumo/` aggregates totais + por_categoria + recentes in 3 queries and caches for 5 minutes keyed by `dashboard:{projeto_id}:{mes}:{ano}`. Cache is invalidated by signals in `core/signals.py` on `post_save`/`post_delete` of `Lancamento`. Registered via `CoreConfig.ready()` in `core/apps.py`. The signal invalidates all 6 key permutations (with/without projeto, mes, ano) so any dashboard filter combination stays fresh.

**Router `basename` requirement**: All ViewSets that override `get_queryset()` without a class-level `queryset` attribute must specify `basename` explicitly in `router.register(...)`. Without it, DRF raises `AssertionError` on startup.

**URL layout**:
```
/api/auth/login/          POST  — AllowAny
/api/auth/refresh/        POST  — AllowAny (SimpleJWT TokenRefreshView)
/api/auth/cadastro/       POST  — AllowAny
/api/dashboard/resumo/    GET   — filtros: projeto_id, mes, ano
/api/projetos/            CRUD  — filtro: status, ano
/api/lancamentos/         CRUD  — filtros: projeto_id, status, categoria_id, usuario_id, mes, ano
/api/categorias/          CRUD
/api/usuarios/            CRUD
/api/historico/           read-only — filtros: tabela, registro_id, usuario_id
/api/detalhes/transporte/ CRUD
/api/detalhes/diaria/     CRUD
/api/detalhes/consumo/    CRUD
/api/detalhes/servicos/   CRUD
/api/detalhes/permanente/ CRUD
```

**Pagination**: `PageNumberPagination` com `PAGE_SIZE=10`. List responses return `{count, next, previous, results:[]}`.

**Serializers**:
- `LancamentoSerializer` exposes read-only `projeto_nome` and `categoria_nome` (`StringRelatedField`). Write operations use the FK integer fields `projeto` e `categoria`.
- `UsuarioSerializer` accepts a virtual `senha` write-only field; `create()` and `update()` call `make_password()` and store the result in `senha_hash`. Never send `senha_hash` directly from the frontend.

**Roles** (`papel_atividade`) — controle client-side; backend não impõe restrições por papel:

| Papel | Menu visível | Criar | Editar | Excluir |
|---|---|---|---|---|
| Administrador / Desenvolvedor | Tudo | ✓ | ✓ | ✓ |
| Coordenador | Tudo exceto Configurações | ✓ | ✓ | ✓ |
| Pesquisador | Dashboard, Detalhes, Histórico | Só via Detalhes (REALIZADO) | Só os próprios | ✗ |

Helpers no frontend: `isAdmin()`, `isCoord()`, `isPesquisador()`, `canDelete()`.

### Frontend (`spectre_app.html`)

Single-file SPA (~2800 linhas). Abrir com duplo clique — sem build, sem servidor próprio. Chama `http://127.0.0.1:8000/api/`.

**Inicialização**: após login, `initApp()` chama `loadInitialData()` (carrega `_projetos`, `_categorias`, `_usuarios` em paralelo via `Promise.all`, e auto-seleciona o projeto de maior `id` para o dashboard) e depois `renderPage()`. Nunca chamar `renderPage()` direto após login — os arrays globais ficarão vazios.

**Navegação**: `goTo(page, keepStatus = false)` atualiza `currentPage`, ajusta estados globais, e chama `renderPage()`. O segundo argumento `keepStatus` evita que o filtro de status da tela de Lançamentos seja resetado para `'ORÇADO'` ao navegar (usado quando se volta de Editais sem querer limpar o filtro). Cada página mapeia para `[título, subtítulo, topbarFn, renderFn]` no objeto `pages` dentro de `renderPage()`.

**Status automático de lançamentos**:
- Navegar para `lancamentos` → `lancState.filtStatus = 'ORÇADO'`, `_novoLancStatus = 'ORÇADO'` (a menos que `keepStatus=true`)
- Navegar para qualquer página `detalhes-*` → `_novoLancStatus = 'REALIZADO'`, `_currentDetType` = tipo da página (ex.: `'transporte'`)
- O formulário `renderNovoLancamento` não exibe select de status — usa `_novoLancStatus` diretamente em `salvarLancamento()`.

**Telas de Detalhes**: as 5 telas de detalhes (`detalhes-transporte`, `detalhes-diarias`, etc.) usam `renderDetalhesList()`. Essa função **não** chama os endpoints de detalhe diretamente — ela consulta `/lancamentos/?categoria_id={catId}&status=REALIZADO` usando `findCatId(catName)` para mapear o tipo de tela para o ID da categoria. O botão "Ver" abre o modal de detalhe específico via `verDetalheLancamento(lancId)`, que então chama o endpoint de detalhe com `?lancamento_id=`.

**Padrão de edição**: variáveis `_editUsuarioId`, `_editProjetoId`, `_editCategoriaId` armazenam o ID da entidade em edição (null = criação). Definidas antes de chamar `goTo('novo-usuario')` etc. As funções `renderNovoUsuario`, `renderNovoProjeto`, `renderEditarCategoria` leem essas variáveis para decidir se buscam dados existentes na API.

**Estados globais de filtro/paginação**:
- `lancState` — filtros da tela Lançamentos: `{ filtEdital, filtCat, filtStatus, showInativos, page, pageSize, sortCol, sortDir }`
- `detState` — filtros das telas de Detalhes: `{ filtEdital, page, pageSize }`
- `editaisState` — filtros da tela Editais: `{ filtStatus, filtAno, page, pageSize }`
- `_currentDetType` — tipo atual de detalhe sendo exibido: `'transporte'|'diarias'|'consumo'|'patrimonio'|'servicos'`

**Controle de menu**: `updateMenuByRole()` é chamada em `setTokens()` após login e esconde/mostra itens de nav via `id` no DOM (`nav-lancamentos`, `nav-orcamentos`, `nav-configuracoes`, `nav-label-detalhes`) e classe `.nav-detalhe`. Também redireciona para `dashboard` se `currentPage` for proibido para o papel atual.

**Token refresh**: transparente — o wrapper `api()` retenta com o refresh token no 401 e chama `showLogin()` se o refresh também falhar.

**Exportação CSV**: `abrirModalExport(ctx)` abre o modal de export configurado para o contexto (`'dashboard'|'lancamentos'|'editais'|'transporte'|'diarias'|'consumo'|'patrimonio'|'servicos'`). `confirmarExport()` despacha para a função `_exp*` correspondente. `fetchTodos(path, params)` itera todas as páginas da API até `data.next === null`. O CSV usa UTF-8 BOM (`'\uFEFF'`), separador `;`, e inclui cabeçalho institucional com nome do relatório e filtros ativos.

### Database

MySQL (`spectre` database). Todos os models têm `db_table` explícito (snake_case). `created_by`/`updated_by` são `IntegerField` simples — preenchidos pelos triggers MySQL via `@usuario_atual_id`. Campos `editable=False` calculados por triggers: `DetalhesServTerceiros.valor_retencao`, `valor_liquido` e `DetalhesMaterialPermanente.data_fim_garantia`.

**Queries úteis para inspeção**:
```sql
SELECT id, nome, login, papel_atividade, ativo FROM usuarios ORDER BY nome;

SELECT id, nome, orgao_financiador, numero_edital, ano, valor_total_aprovado, status
FROM projetos WHERE ativo = 1;

SELECT l.id, l.status, l.descricao_item, l.valor_total, l.data_lancamento,
       u.nome AS usuario, c.nome_subcategoria AS categoria, p.nome AS projeto
FROM lancamentos l
JOIN usuarios u ON u.id = l.usuario_id
JOIN categorias c ON c.id = l.categoria_id
JOIN projetos p ON p.id = l.projeto_id
ORDER BY l.data_lancamento DESC;

SELECT h.id, h.tabela, h.operacao, h.registro_id, u.nome AS usuario, h.alterado_em
FROM historico_alteracoes h
LEFT JOIN usuarios u ON u.id = h.usuario_id
ORDER BY h.alterado_em DESC LIMIT 50;
```

### Settings

- `CORS_ALLOW_ALL_ORIGINS = True` (dev only)
- Cache: `LocMemCache` (in-process, resets on server restart)
- Timezone: `America/Sao_Paulo`, language: `pt-br`
- Credentials via `python-decouple` from `.env` — variáveis: `SECRET_KEY`, `DEBUG`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
