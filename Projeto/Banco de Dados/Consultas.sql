USE spectre;

 -- Usuários
  SELECT id, nome, login, email, papel_atividade, ativo
  FROM usuarios
  ORDER BY nome;

  -- Projetos
  SELECT id, nome, orgao_financiador, numero_edital, ano,
         valor_total_aprovado, status
  FROM projetos
  WHERE ativo = 1
  ORDER BY ano DESC;

  -- Lançamentos com joins (visão completa)
  SELECT
      l.id,
      l.status,
      l.descricao_item,
      l.valor_total,
      l.data_lancamento,
      u.nome        AS usuario,
      c.nome_subcategoria AS categoria,
      p.nome        AS projeto
  FROM lancamentos l
  JOIN usuarios   u ON u.id = l.usuario_id
  JOIN categorias c ON c.id = l.categoria_id
  JOIN projetos   p ON p.id = l.projeto_id
  ORDER BY l.data_lancamento DESC;

  -- Lançamentos de um usuário específico (troque o ID)
  SELECT l.id, l.status, l.descricao_item, l.valor_total, l.data_lancamento,
         c.nome_subcategoria, p.nome AS projeto
  FROM lancamentos l
  JOIN categorias c ON c.id = l.categoria_id
  JOIN projetos   p ON p.id = l.projeto_id
  WHERE l.usuario_id = 1
  ORDER BY l.data_lancamento DESC;

  -- Histórico de auditoria (últimas 50 alterações)
  SELECT h.id, h.tabela, h.operacao, h.registro_id,
         u.nome AS usuario, h.alterado_em
  FROM historico_alteracoes h
  LEFT JOIN usuarios u ON u.id = h.usuario_id
  ORDER BY h.alterado_em DESC
  LIMIT 50;

  -- Totais por categoria e projeto
  SELECT p.nome AS projeto, c.nome_subcategoria AS categoria,
         SUM(CASE WHEN l.status='ORÇADO'    THEN l.valor_total ELSE 0 END) AS orcado,
         SUM(CASE WHEN l.status='REALIZADO' THEN l.valor_total ELSE 0 END) AS realizado
  FROM lancamentos l
  JOIN projetos   p ON p.id = l.projeto_id
  JOIN categorias c ON c.id = l.categoria_id
  GROUP BY p.nome, c.nome_subcategoria
  ORDER BY p.nome, c.nome_subcategoria;