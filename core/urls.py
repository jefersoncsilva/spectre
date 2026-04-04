from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register('usuarios',               views.UsuarioViewSet,                    basename='usuario')
router.register('categorias',             views.CategoriaViewSet,                  basename='categoria')
router.register('lancamentos',            views.LancamentoViewSet,                 basename='lancamento')
router.register('detalhes/transporte',    views.DetalhesTransporteViewSet,         basename='detalhes-transporte')
router.register('detalhes/diaria',        views.DetalhesDiariaViewSet,             basename='detalhes-diaria')
router.register('detalhes/consumo',       views.DetalhesMatConsumoViewSet,         basename='detalhes-consumo')
router.register('detalhes/servicos',      views.DetalhesServTerceirosViewSet,      basename='detalhes-servicos')
router.register('detalhes/permanente',    views.DetalhesMaterialPermanenteViewSet, basename='detalhes-permanente')
router.register('historico',              views.HistoricoAlteracoesViewSet,        basename='historico')
router.register('projetos',               views.ProjetoViewSet,                    basename='projeto')


urlpatterns = [
    path('auth/login/',          views.login,                name='login'),
    path('auth/refresh/',        TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/cadastro/',       views.cadastrar_usuario,    name='cadastro'),
    path('auth/lgpd/aceitar/',   views.lgpd_aceitar,         name='lgpd_aceitar'),
    path('auth/a2f/setup/',      views.a2f_setup,            name='a2f_setup'),
    path('auth/a2f/confirmar/',  views.a2f_confirmar_setup,  name='a2f_confirmar'),
    path('auth/a2f/verificar/',  views.a2f_verificar,        name='a2f_verificar'),
    path('auth/a2f/desativar/',  views.a2f_desativar,        name='a2f_desativar'),
    path('dashboard/resumo/',    views.dashboard_resumo,     name='dashboard_resumo'),
    path('',                     include(router.urls)),
]