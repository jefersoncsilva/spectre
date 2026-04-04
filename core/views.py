from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import connection
from django.db.models import Sum, Count, Q
from django.contrib.auth.hashers import make_password, check_password
from django.core.cache import cache
from django.conf import settings
from django.utils import timezone
import pyotp
import jwt as pyjwt
from datetime import timedelta

from .models import (
    Usuario, Categoria, Lancamento,
    DetalhesTransporte, DetalhesDiaria,
    DetalhesMatConsumo, DetalhesServTerceiros,
    DetalhesMaterialPermanente, HistoricoAlteracoes, Projeto,
)
from .serializers import (
    UsuarioSerializer, CategoriaSerializer, LancamentoSerializer,
    DetalhesTransporteSerializer, DetalhesDiariaSerializer,
    DetalhesMatConsumoSerializer, DetalhesServTerceirosSerializer,
    DetalhesMaterialPermanenteSerializer, HistoricoAlteracoesSerializer,
    ProjetoSerializer,
)


# ── Helper: seta o usuário na sessão MySQL para os triggers ────
def set_usuario_sessao(user_id):
    with connection.cursor() as cursor:
        cursor.execute("SET @usuario_atual_id = %s", [user_id])


# ══════════════════════════════════════════════════════════════
# AUTENTICAÇÃO
# ══════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    login_val = request.data.get('login')
    senha     = request.data.get('senha')

    if not login_val or not senha:
        return Response(
            {'erro': 'Login e senha são obrigatórios.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        usuario = Usuario.objects.get(login=login_val, ativo=True)
    except Usuario.DoesNotExist:
        return Response(
            {'erro': 'Credenciais inválidas.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not check_password(senha, usuario.senha_hash):
        return Response(
            {'erro': 'Credenciais inválidas.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Se A2F ativo, emite pre_token e pede código
    if usuario.a2f_ativo:
        payload = {
            'usuario_id': usuario.id,
            'purpose':    'pre_2fa',
            'exp':        timezone.now() + timedelta(minutes=5),
        }
        pre_token = pyjwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        return Response({'requires_2fa': True, 'pre_token': pre_token})

    refresh = RefreshToken()
    refresh['usuario_id'] = usuario.id
    refresh['login']      = usuario.login
    refresh['nome']       = usuario.nome

    return Response({
        'access':  str(refresh.access_token),
        'refresh': str(refresh),
        'usuario': {
            'id':              usuario.id,
            'nome':            usuario.nome,
            'login':           usuario.login,
            'email':           usuario.email,
            'papel_atividade': usuario.papel_atividade,
            'lgpd_aceito_em':  usuario.lgpd_aceito_em.isoformat() if usuario.lgpd_aceito_em else None,
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def cadastrar_usuario(request):
    data = request.data.copy()
    if 'senha' not in data:
        return Response(
            {'erro': 'Campo senha é obrigatório.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    data['senha_hash'] = make_password(data.pop('senha'))
    serializer = UsuarioSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def lgpd_aceitar(request):
    usuario = request.user
    usuario.lgpd_aceito_em = timezone.now()
    # Captura IP real mesmo atrás de proxy
    ip = (
        request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
        or request.META.get('REMOTE_ADDR')
    )
    usuario.lgpd_ip = ip or None
    usuario.save(update_fields=['lgpd_aceito_em', 'lgpd_ip'])
    return Response({'lgpd_aceito_em': usuario.lgpd_aceito_em.isoformat()})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def a2f_setup(request):
    usuario = request.user
    secret = pyotp.random_base32()
    usuario.totp_secret = secret
    usuario.a2f_ativo   = False   # aguarda confirmação
    usuario.save(update_fields=['totp_secret', 'a2f_ativo'])
    totp = pyotp.TOTP(secret)
    uri  = totp.provisioning_uri(usuario.email, issuer_name='SPECTRE')
    return Response({'uri': uri, 'secret': secret})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def a2f_confirmar_setup(request):
    codigo  = request.data.get('codigo', '')
    usuario = request.user
    if not usuario.totp_secret:
        return Response({'erro': 'Execute /a2f/setup/ primeiro.'}, status=status.HTTP_400_BAD_REQUEST)
    totp = pyotp.TOTP(usuario.totp_secret)
    if not totp.verify(codigo, valid_window=1):
        return Response({'erro': 'Código inválido. Tente novamente.'}, status=status.HTTP_400_BAD_REQUEST)
    usuario.a2f_ativo = True
    usuario.save(update_fields=['a2f_ativo'])
    return Response({'ok': True})


@api_view(['POST'])
@permission_classes([AllowAny])
def a2f_verificar(request):
    pre_token = request.data.get('pre_token', '')
    codigo    = request.data.get('codigo', '')
    try:
        payload = pyjwt.decode(pre_token, settings.SECRET_KEY, algorithms=['HS256'])
        if payload.get('purpose') != 'pre_2fa':
            raise ValueError('purpose inválido')
        usuario = Usuario.objects.get(id=payload['usuario_id'], ativo=True)
    except Exception:
        return Response({'erro': 'Token inválido ou expirado.'}, status=status.HTTP_401_UNAUTHORIZED)

    totp = pyotp.TOTP(usuario.totp_secret)
    if not totp.verify(codigo, valid_window=1):
        return Response({'erro': 'Código inválido.'}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken()
    refresh['usuario_id'] = usuario.id
    refresh['login']      = usuario.login
    refresh['nome']       = usuario.nome

    return Response({
        'access':  str(refresh.access_token),
        'refresh': str(refresh),
        'usuario': {
            'id':              usuario.id,
            'nome':            usuario.nome,
            'login':           usuario.login,
            'email':           usuario.email,
            'papel_atividade': usuario.papel_atividade,
            'lgpd_aceito_em':  usuario.lgpd_aceito_em.isoformat() if usuario.lgpd_aceito_em else None,
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def a2f_desativar(request):
    senha  = request.data.get('senha', '')
    codigo = request.data.get('codigo', '')
    usuario = request.user

    if not check_password(senha, usuario.senha_hash):
        return Response({'erro': 'Senha incorreta.'}, status=status.HTTP_400_BAD_REQUEST)

    if usuario.a2f_ativo:
        totp = pyotp.TOTP(usuario.totp_secret)
        if not totp.verify(codigo, valid_window=1):
            return Response({'erro': 'Código 2FA inválido.'}, status=status.HTTP_400_BAD_REQUEST)

    usuario.a2f_ativo   = False
    usuario.totp_secret = None
    usuario.save(update_fields=['a2f_ativo', 'totp_secret'])
    return Response({'ok': True})


# ══════════════════════════════════════════════════════════════
# DASHBOARD
# ══════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_resumo(request):
    projeto_id = request.query_params.get('projeto_id')
    mes        = request.query_params.get('mes')
    ano        = request.query_params.get('ano', 2026)

    cache_key = f"dashboard:{projeto_id or 'all'}:{mes or 'all'}:{ano}"
    resultado = cache.get(cache_key)

    if resultado is None:
        # Apenas lançamentos ativos
        qs = Lancamento.objects.filter(ativo=True)
        if projeto_id:
            qs = qs.filter(projeto_id=projeto_id)
        if mes:
            qs = qs.filter(data_lancamento__month=mes)
        if ano:
            qs = qs.filter(data_lancamento__year=ano)

        totais = qs.aggregate(
            total_orcado=Sum(
                'valor_total', filter=Q(status='ORÇADO'), default=0
            ),
            total_realizado=Sum(
                'valor_total', filter=Q(status='REALIZADO'), default=0
            ),
            count_orcado=Count('id', filter=Q(status='ORÇADO')),
            count_realizado=Count('id', filter=Q(status='REALIZADO')),
        )

        por_categoria = list(
            qs.values('categoria__nome_subcategoria', 'categoria__tipo_categoria')
            .annotate(
                orcado=Sum('valor_total', filter=Q(status='ORÇADO'), default=0),
                realizado=Sum('valor_total', filter=Q(status='REALIZADO'), default=0),
            )
            .order_by('categoria__tipo_categoria', 'categoria__nome_subcategoria')
        )

        # Lançamentos recentes: apenas REALIZADO e ativos
        qs_recentes = (
            Lancamento.objects
            .filter(ativo=True, status='REALIZADO')
            .select_related('projeto', 'usuario', 'categoria')
        )
        if projeto_id:
            qs_recentes = qs_recentes.filter(projeto_id=projeto_id)
        recentes = list(
            qs_recentes.order_by('-data_lancamento')[:5].values(
                'id', 'descricao_item', 'valor_total', 'status',
                'data_lancamento',
                'categoria__nome_subcategoria',
                'projeto__nome',
            )
        )

        resultado = {
            'totais':        totais,
            'por_categoria': por_categoria,
            'recentes':      recentes,
        }
        cache.set(cache_key, resultado, timeout=300)

    return Response(resultado)


# ══════════════════════════════════════════════════════════════
# VIEWSETS
# ══════════════════════════════════════════════════════════════

class ProjetoViewSet(viewsets.ModelViewSet):
    """
    Projetos/editais de pesquisa.
    Filtros: ?status=Em andamento  ?ano=2026  ?ativo=false
    """
    serializer_class   = ProjetoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Projeto.objects.all()

        # Filtro ativo: padrão True, suporta ?ativo=false
        ativo_p = self.request.query_params.get('ativo')
        if ativo_p is not None:
            qs = qs.filter(ativo=(ativo_p.lower() != 'false'))
        else:
            qs = qs.filter(ativo=True)

        status_p = self.request.query_params.get('status')
        ano_p    = self.request.query_params.get('ano')
        if status_p:
            qs = qs.filter(status=status_p)
        if ano_p:
            qs = qs.filter(ano=ano_p)
        return qs

    def perform_create(self, serializer):
        set_usuario_sessao(self.request.auth.get('usuario_id'))
        serializer.save()

    def perform_update(self, serializer):
        set_usuario_sessao(self.request.auth.get('usuario_id'))
        serializer.save()


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset           = Usuario.objects.all()
    serializer_class   = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        set_usuario_sessao(self.request.auth.get('usuario_id'))
        serializer.save()

    def perform_update(self, serializer):
        set_usuario_sessao(self.request.auth.get('usuario_id'))
        serializer.save()


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset           = Categoria.objects.filter(ativo=True)
    serializer_class   = CategoriaSerializer
    permission_classes = [IsAuthenticated]


class LancamentoViewSet(viewsets.ModelViewSet):
    """
    Lançamentos financeiros.
    Filtros: ?projeto_id=1  ?status=ORÇADO|REALIZADO  ?categoria_id=2
             ?usuario_id=1  ?mes=3  ?ano=2026  ?inativos=true
    """
    serializer_class   = LancamentoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = (
            Lancamento.objects
            .select_related('projeto', 'usuario', 'categoria')
            .order_by('-data_lancamento')
        )

        # Filtro ativo: padrão mostra ativos; ?inativos=true mostra inativos
        inativos = self.request.query_params.get('inativos', '').lower() == 'true'
        qs = qs.filter(ativo=(not inativos))

        projeto_id  = self.request.query_params.get('projeto_id')
        status_p    = self.request.query_params.get('status')
        categoria_p = self.request.query_params.get('categoria_id')
        usuario_p   = self.request.query_params.get('usuario_id')
        mes         = self.request.query_params.get('mes')
        ano         = self.request.query_params.get('ano')

        if projeto_id:
            qs = qs.filter(projeto_id=projeto_id)
        if status_p:
            qs = qs.filter(status=status_p)
        if categoria_p:
            qs = qs.filter(categoria_id=categoria_p)
        if usuario_p:
            qs = qs.filter(usuario_id=usuario_p)
        if ano:
            qs = qs.filter(data_lancamento__year=ano)
        if mes:
            qs = qs.filter(data_lancamento__month=mes)

        return qs

    def perform_create(self, serializer):
        set_usuario_sessao(self.request.auth.get('usuario_id'))
        serializer.save()

    def perform_update(self, serializer):
        set_usuario_sessao(self.request.auth.get('usuario_id'))
        serializer.save()


class DetalhesTransporteViewSet(viewsets.ModelViewSet):
    serializer_class   = DetalhesTransporteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = DetalhesTransporte.objects.select_related(
            'lancamento__projeto', 'lancamento__categoria', 'lancamento__usuario'
        )
        inativos      = self.request.query_params.get('inativos', '').lower() == 'true'
        projeto_id    = self.request.query_params.get('projeto_id')
        lancamento_id = self.request.query_params.get('lancamento_id')

        qs = qs.filter(lancamento__ativo=(not inativos))
        if projeto_id:
            qs = qs.filter(lancamento__projeto_id=projeto_id)
        if lancamento_id:
            qs = qs.filter(lancamento_id=lancamento_id)
        return qs

    def perform_create(self, serializer):
        set_usuario_sessao(self.request.auth.get('usuario_id'))
        serializer.save()

    def perform_update(self, serializer):
        set_usuario_sessao(self.request.auth.get('usuario_id'))
        serializer.save()


class DetalhesDiariaViewSet(viewsets.ModelViewSet):
    serializer_class   = DetalhesDiariaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = DetalhesDiaria.objects.select_related(
            'lancamento__projeto', 'lancamento__categoria', 'lancamento__usuario'
        )
        inativos      = self.request.query_params.get('inativos', '').lower() == 'true'
        projeto_id    = self.request.query_params.get('projeto_id')
        lancamento_id = self.request.query_params.get('lancamento_id')

        qs = qs.filter(lancamento__ativo=(not inativos))
        if projeto_id:
            qs = qs.filter(lancamento__projeto_id=projeto_id)
        if lancamento_id:
            qs = qs.filter(lancamento_id=lancamento_id)
        return qs

    def perform_create(self, serializer):
        set_usuario_sessao(self.request.auth.get('usuario_id'))
        serializer.save()

    def perform_update(self, serializer):
        set_usuario_sessao(self.request.auth.get('usuario_id'))
        serializer.save()


class DetalhesMatConsumoViewSet(viewsets.ModelViewSet):
    serializer_class   = DetalhesMatConsumoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = DetalhesMatConsumo.objects.select_related(
            'lancamento__projeto', 'lancamento__categoria', 'lancamento__usuario'
        )
        inativos      = self.request.query_params.get('inativos', '').lower() == 'true'
        projeto_id    = self.request.query_params.get('projeto_id')
        lancamento_id = self.request.query_params.get('lancamento_id')

        qs = qs.filter(lancamento__ativo=(not inativos))
        if projeto_id:
            qs = qs.filter(lancamento__projeto_id=projeto_id)
        if lancamento_id:
            qs = qs.filter(lancamento_id=lancamento_id)
        return qs

    def perform_create(self, serializer):
        set_usuario_sessao(self.request.auth.get('usuario_id'))
        serializer.save()

    def perform_update(self, serializer):
        set_usuario_sessao(self.request.auth.get('usuario_id'))
        serializer.save()


class DetalhesServTerceirosViewSet(viewsets.ModelViewSet):
    serializer_class   = DetalhesServTerceirosSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = DetalhesServTerceiros.objects.select_related(
            'lancamento__projeto', 'lancamento__categoria', 'lancamento__usuario'
        )
        inativos      = self.request.query_params.get('inativos', '').lower() == 'true'
        projeto_id    = self.request.query_params.get('projeto_id')
        lancamento_id = self.request.query_params.get('lancamento_id')

        qs = qs.filter(lancamento__ativo=(not inativos))
        if projeto_id:
            qs = qs.filter(lancamento__projeto_id=projeto_id)
        if lancamento_id:
            qs = qs.filter(lancamento_id=lancamento_id)
        return qs

    def perform_create(self, serializer):
        set_usuario_sessao(self.request.auth.get('usuario_id'))
        serializer.save()

    def perform_update(self, serializer):
        set_usuario_sessao(self.request.auth.get('usuario_id'))
        serializer.save()


class DetalhesMaterialPermanenteViewSet(viewsets.ModelViewSet):
    serializer_class   = DetalhesMaterialPermanenteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = DetalhesMaterialPermanente.objects.select_related(
            'lancamento__projeto', 'lancamento__categoria', 'lancamento__usuario'
        )
        inativos      = self.request.query_params.get('inativos', '').lower() == 'true'
        projeto_id    = self.request.query_params.get('projeto_id')
        lancamento_id = self.request.query_params.get('lancamento_id')
        estado        = self.request.query_params.get('estado_conservacao')

        qs = qs.filter(lancamento__ativo=(not inativos))
        if projeto_id:
            qs = qs.filter(lancamento__projeto_id=projeto_id)
        if lancamento_id:
            qs = qs.filter(lancamento_id=lancamento_id)
        if estado:
            qs = qs.filter(estado_conservacao=estado)
        return qs

    def perform_create(self, serializer):
        set_usuario_sessao(self.request.auth.get('usuario_id'))
        serializer.save()

    def perform_update(self, serializer):
        set_usuario_sessao(self.request.auth.get('usuario_id'))
        serializer.save()


class HistoricoAlteracoesViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Somente leitura — gerenciado pelos triggers MySQL.
    Filtros: ?tabela=lancamentos  ?registro_id=5  ?usuario_id=1
    """
    serializer_class   = HistoricoAlteracoesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs      = HistoricoAlteracoes.objects.all()
        tabela  = self.request.query_params.get('tabela')
        reg_id  = self.request.query_params.get('registro_id')
        usuario = self.request.query_params.get('usuario_id')
        if tabela:
            qs = qs.filter(tabela=tabela)
        if reg_id:
            qs = qs.filter(registro_id=reg_id)
        if usuario:
            qs = qs.filter(usuario_id=usuario)
        return qs
