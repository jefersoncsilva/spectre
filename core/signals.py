"""
core/signals.py

Invalida o cache do dashboard sempre que um lançamento for criado,
atualizado ou excluído. Sem isso o dashboard ficaria desatualizado
até o timeout de 5 minutos expirar.

Registrado em core/apps.py via CoreConfig.ready().
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache

from .models import Lancamento


def _chaves_cache(lancamento):
    """Retorna todas as chaves de cache que podem conter este lançamento."""
    pid  = lancamento.projeto_id
    ano  = lancamento.data_lancamento.year
    mes  = lancamento.data_lancamento.month
    return [
        # Combinações específicas
        f"dashboard:{pid}:{mes}:{ano}",
        f"dashboard:{pid}:all:{ano}",
        f"dashboard:{pid}:all:all",
        # Visão global (sem projeto selecionado)
        f"dashboard:all:{mes}:{ano}",
        f"dashboard:all:all:{ano}",
        f"dashboard:all:all:all",
    ]


@receiver(post_save, sender=Lancamento)
def invalidar_cache_ao_salvar(sender, instance, **kwargs):
    cache.delete_many(_chaves_cache(instance))


@receiver(post_delete, sender=Lancamento)
def invalidar_cache_ao_deletar(sender, instance, **kwargs):
    cache.delete_many(_chaves_cache(instance))