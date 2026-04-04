from django.db import models


# ── Projetos / Editais ──────────────────────────────────────────
class Projeto(models.Model):
    STATUS_CHOICES = [
        ('Em andamento', 'Em andamento'),
        ('Encerrado',    'Encerrado'),
        ('Suspenso',     'Suspenso'),
    ]

    nome                 = models.CharField(max_length=150)
    orgao_financiador    = models.CharField(max_length=100)
    numero_edital        = models.CharField(max_length=50, blank=True, null=True)
    ano                  = models.PositiveSmallIntegerField()
    valor_total_aprovado = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    data_inicio          = models.DateField(blank=True, null=True)
    data_fim             = models.DateField(blank=True, null=True)
    status               = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Em andamento')
    descricao            = models.TextField(blank=True, null=True)
    ativo                = models.BooleanField(default=True)
    created_at           = models.DateTimeField(auto_now_add=True)
    created_by           = models.IntegerField(null=True, blank=True)
    updated_at           = models.DateTimeField(auto_now=True)
    updated_by           = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'projetos'
        unique_together = ('orgao_financiador', 'numero_edital', 'ano')

    def __str__(self):
        return f'{self.nome} ({self.ano})'

# ── Usuários ────────────────────────────────────────────────────
class Usuario(models.Model):
    nome            = models.CharField(max_length=100)
    email           = models.CharField(max_length=150, unique=True)
    senha_hash      = models.CharField(max_length=255)
    cpf             = models.CharField(max_length=14, unique=True)
    data_nascimento = models.DateField()
    papel_atividade = models.CharField(max_length=100, blank=True, null=True)
    login           = models.CharField(max_length=100, unique=True)
    ativo           = models.BooleanField(default=True)
    lgpd_aceito_em  = models.DateTimeField(null=True, blank=True)
    lgpd_ip         = models.GenericIPAddressField(null=True, blank=True)
    totp_secret     = models.CharField(max_length=32, null=True, blank=True)
    a2f_ativo       = models.BooleanField(default=False)
    created_at      = models.DateTimeField(auto_now_add=True)
    created_by      = models.IntegerField(null=True, blank=True)
    updated_at      = models.DateTimeField(auto_now=True)
    updated_by      = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'usuarios'

    def __str__(self):
        return f'{self.nome} ({self.login})'


# ── Categorias ──────────────────────────────────────────────────
class Categoria(models.Model):
    TIPO_CHOICES = [('CUSTEIO', 'Custeio'), ('CAPITAL', 'Capital')]

    tipo_categoria    = models.CharField(max_length=10, choices=TIPO_CHOICES)
    nome_subcategoria = models.CharField(max_length=100)
    descricao         = models.CharField(max_length=255, blank=True, null=True)
    ativo             = models.BooleanField(default=True)
    created_at        = models.DateTimeField(auto_now_add=True)
    created_by        = models.IntegerField(null=True, blank=True)
    updated_at        = models.DateTimeField(auto_now=True)
    updated_by        = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'categorias'
        unique_together = ('tipo_categoria', 'nome_subcategoria')

    def __str__(self):
        return f'{self.tipo_categoria} — {self.nome_subcategoria}'


# ── Lançamentos ─────────────────────────────────────────────────
class Lancamento(models.Model):
    STATUS_CHOICES = [('ORÇADO', 'Orçado'), ('REALIZADO', 'Realizado')]

    usuario         = models.ForeignKey(Usuario,   on_delete=models.PROTECT, db_column='usuario_id')
    categoria       = models.ForeignKey(Categoria, on_delete=models.PROTECT, db_column='categoria_id')
    status          = models.CharField(max_length=10, choices=STATUS_CHOICES)
    descricao_item  = models.CharField(max_length=255, blank=True, null=True)
    valor_total     = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    data_lancamento = models.DateField()
    observacoes     = models.TextField(blank=True, null=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    created_by      = models.IntegerField(null=True, blank=True)
    updated_at      = models.DateTimeField(auto_now=True)
    updated_by      = models.IntegerField(null=True, blank=True)
    projeto  = models.ForeignKey(Projeto,   on_delete=models.PROTECT, db_column='projeto_id')
    ativo    = models.BooleanField(default=True)

    class Meta:
        db_table = 'lancamentos'

    def __str__(self):
        return f'#{self.id} {self.status} R${self.valor_total}'


# ── Detalhes: Transporte ────────────────────────────────────────
class DetalhesTransporte(models.Model):
    MEIO_CHOICES = [
        ('Voo',            'Voo'),
        ('Ônibus',         'Ônibus'),
        ('Aplicativo',     'Aplicativo'),
        ('Táxi',           'Táxi'),
        ('Carro próprio',  'Carro próprio'),
        ('Aluguel de carro','Aluguel de carro'),
    ]

    lancamento            = models.OneToOneField(Lancamento, on_delete=models.CASCADE, db_column='lancamento_id')
    meio_transporte       = models.CharField(max_length=20, choices=MEIO_CHOICES)
    local_origem          = models.CharField(max_length=150, blank=True, null=True)
    local_destino         = models.CharField(max_length=150, blank=True, null=True)
    data_saida            = models.DateField(blank=True, null=True)
    data_chegada          = models.DateField(blank=True, null=True)
    horario_saida         = models.TimeField(blank=True, null=True)
    horario_chegada       = models.TimeField(blank=True, null=True)
    distancia_km          = models.DecimalField(max_digits=8,  decimal_places=2, null=True, blank=True)
    custo_passagem        = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    custo_abastecimento   = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    custo_aplicativo_taxi = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    custo_alimentacao     = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at            = models.DateTimeField(auto_now_add=True)
    created_by            = models.IntegerField(null=True, blank=True)
    updated_at            = models.DateTimeField(auto_now=True)
    updated_by            = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'detalhes_transporte'

    def calcular_custo_total(self):
        return (self.custo_passagem + self.custo_abastecimento +
                self.custo_aplicativo_taxi + self.custo_alimentacao)

    def __str__(self):
        return f'Transporte #{self.lancamento_id} — {self.meio_transporte}'


# ── Detalhes: Diária ────────────────────────────────────────────
class DetalhesDiaria(models.Model):
    lancamento     = models.OneToOneField(Lancamento, on_delete=models.CASCADE, db_column='lancamento_id')
    num_diarias    = models.IntegerField(default=1)
    valor_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    cidade_destino = models.CharField(max_length=150, blank=True, null=True)
    motivo         = models.CharField(max_length=255, blank=True, null=True)
    data_inicio    = models.DateField(blank=True, null=True)
    data_fim       = models.DateField(blank=True, null=True)
    created_at     = models.DateTimeField(auto_now_add=True)
    created_by     = models.IntegerField(null=True, blank=True)
    updated_at     = models.DateTimeField(auto_now=True)
    updated_by     = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'detalhes_diaria'

    def calcular_valor_total(self):
        return self.num_diarias * self.valor_unitario

    def __str__(self):
        return f'Diária #{self.lancamento_id} — {self.num_diarias}x R${self.valor_unitario}'


# ── Detalhes: Material de Consumo ───────────────────────────────
class DetalhesMatConsumo(models.Model):
    TIPO_CHOICES = [
        ('Papelaria',              'Papelaria'),
        ('Informática',            'Informática'),
        ('Material de escritório', 'Material de escritório'),
        ('Material de laboratório','Material de laboratório'),
        ('Outros',                 'Outros'),
    ]

    lancamento      = models.ForeignKey(Lancamento, on_delete=models.CASCADE, db_column='lancamento_id')
    tipo_material   = models.CharField(max_length=30, choices=TIPO_CHOICES)
    descricao_item  = models.CharField(max_length=255)
    quantidade      = models.DecimalField(max_digits=10, decimal_places=3, default=1)
    unidade_medida  = models.CharField(max_length=20, default='un')
    valor_unitario  = models.DecimalField(max_digits=10, decimal_places=2)
    fornecedor      = models.CharField(max_length=150, blank=True, null=True)
    cnpj_fornecedor = models.CharField(max_length=18,  blank=True, null=True)
    numero_nf       = models.CharField(max_length=20,  blank=True, null=True)
    data_compra     = models.DateField(blank=True, null=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    created_by      = models.IntegerField(null=True, blank=True)
    updated_at      = models.DateTimeField(auto_now=True)
    updated_by      = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'detalhes_material_consumo'

    def calcular_subtotal(self):
        return self.quantidade * self.valor_unitario

    def __str__(self):
        return f'{self.descricao_item} ({self.quantidade} {self.unidade_medida})'


# ── Detalhes: Serviços de Terceiros ─────────────────────────────
class DetalhesServTerceiros(models.Model):
    SERVICO_CHOICES = [
        ('Divulgação',               'Divulgação'),
        ('Revisão de texto',         'Revisão de texto'),
        ('Gráfica / impressão',      'Gráfica / impressão'),
        ('Tradução',                 'Tradução'),
        ('Consultoria',              'Consultoria'),
        ('Desenvolvimento de software','Desenvolvimento de software'),
        ('Outros',                   'Outros'),
    ]
    PESSOA_CHOICES = [('PF', 'Pessoa Física'), ('PJ', 'Pessoa Jurídica')]

    lancamento          = models.OneToOneField(Lancamento, on_delete=models.CASCADE, db_column='lancamento_id')
    tipo_servico        = models.CharField(max_length=30, choices=SERVICO_CHOICES)
    tipo_pessoa         = models.CharField(max_length=2,  choices=PESSOA_CHOICES)
    nome_prestador      = models.CharField(max_length=150)
    cpf_cnpj            = models.CharField(max_length=18)
    descricao_servico   = models.CharField(max_length=500)
    numero_contrato     = models.CharField(max_length=50,  blank=True, null=True)
    numero_nf_rpa       = models.CharField(max_length=20,  blank=True, null=True)
    data_inicio         = models.DateField(blank=True, null=True)
    data_conclusao      = models.DateField(blank=True, null=True)
    valor_bruto         = models.DecimalField(max_digits=10, decimal_places=2)
    percentual_retencao = models.DecimalField(max_digits=5,  decimal_places=2, default=0)
    # gerados pelo MySQL — somente leitura no Django
    valor_retencao      = models.DecimalField(max_digits=10, decimal_places=2, editable=False, default=0)
    valor_liquido       = models.DecimalField(max_digits=10, decimal_places=2, editable=False, default=0)
    created_at          = models.DateTimeField(auto_now_add=True)
    created_by          = models.IntegerField(null=True, blank=True)
    updated_at          = models.DateTimeField(auto_now=True)
    updated_by          = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'detalhes_servicos_terceiros'

    def __str__(self):
        return f'{self.nome_prestador} — R${self.valor_bruto}'


# ── Histórico de Alterações (somente leitura) ───────────────────
class HistoricoAlteracoes(models.Model):
    OPERACAO_CHOICES = [
        ('INSERT', 'Insert'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
    ]

    tabela       = models.CharField(max_length=60)
    registro_id  = models.IntegerField()
    operacao     = models.CharField(max_length=6, choices=OPERACAO_CHOICES)
    usuario_id   = models.IntegerField(null=True, blank=True)
    dados_antes  = models.JSONField(null=True, blank=True)
    dados_depois = models.JSONField(null=True, blank=True)
    alterado_em  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table  = 'historico_alteracoes'
        managed   = False   # Django não cria nem altera esta tabela — só lê
        ordering  = ['-alterado_em']

    def __str__(self):
        return f'{self.operacao} em {self.tabela} #{self.registro_id}'
    
    # ── Detalhes: Material Permanente ───────────────────────────────
class DetalhesMaterialPermanente(models.Model):
    ESTADO_CHOICES = [
        ('Novo',                  'Novo'),
        ('Bom',                   'Bom'),
        ('Regular',               'Regular'),
        ('Necessita manutenção',  'Necessita manutenção'),
        ('Inativo',               'Inativo'),
    ]

    lancamento        = models.OneToOneField(Lancamento, on_delete=models.CASCADE, db_column='lancamento_id')
    descricao_bem     = models.CharField(max_length=255)
    marca             = models.CharField(max_length=100, blank=True, null=True)
    modelo            = models.CharField(max_length=100, blank=True, null=True)
    numero_serie      = models.CharField(max_length=100, blank=True, null=True)
    numero_patrimonio = models.CharField(max_length=50,  blank=True, null=True)
    numero_nf         = models.CharField(max_length=20,  blank=True, null=True)
    fornecedor        = models.CharField(max_length=150, blank=True, null=True)
    cnpj_fornecedor   = models.CharField(max_length=18,  blank=True, null=True)
    data_aquisicao    = models.DateField(blank=True, null=True)
    garantia_meses    = models.IntegerField(default=12)
    # gerado pelo MySQL — somente leitura no Django
    data_fim_garantia = models.DateField(editable=False, null=True, blank=True)
    estado_conservacao = models.CharField(max_length=25, choices=ESTADO_CHOICES, default='Novo')
    localizacao       = models.CharField(max_length=150, blank=True, null=True)
    responsavel_bem   = models.CharField(max_length=100, blank=True, null=True)
    observacoes       = models.TextField(blank=True, null=True)
    created_at        = models.DateTimeField(auto_now_add=True)
    created_by        = models.IntegerField(null=True, blank=True)
    updated_at        = models.DateTimeField(auto_now=True)
    updated_by        = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'detalhes_material_permanente'

    def __str__(self):
        return f'{self.descricao_bem} — {self.marca or ""} {self.modelo or ""}'.strip()