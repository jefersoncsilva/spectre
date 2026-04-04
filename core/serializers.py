from rest_framework import serializers
from .models import (
    Projeto, Usuario, Categoria, Lancamento,
    DetalhesTransporte, DetalhesDiaria,
    DetalhesMatConsumo, DetalhesServTerceiros,
    DetalhesMaterialPermanente, HistoricoAlteracoes,
)


class UsuarioSerializer(serializers.ModelSerializer):
    senha = serializers.CharField(write_only=True, required=False)

    class Meta:
        model  = Usuario
        fields = '__all__'
        extra_kwargs = {'senha_hash': {'write_only': True, 'required': False}}

    def validate(self, data):
        if not self.instance and not data.get('senha'):
            raise serializers.ValidationError({'senha': 'A senha é obrigatória para novos usuários.'})
        return data

    def create(self, validated_data):
        from django.contrib.auth.hashers import make_password
        senha = validated_data.pop('senha', None)
        if senha:
            validated_data['senha_hash'] = make_password(senha)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        from django.contrib.auth.hashers import make_password
        senha = validated_data.pop('senha', None)
        if senha:
            validated_data['senha_hash'] = make_password(senha)
        return super().update(instance, validated_data)


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Categoria
        fields = '__all__'


class LancamentoSerializer(serializers.ModelSerializer):
    projeto_nome   = serializers.StringRelatedField(source='projeto',   read_only=True)
    categoria_nome = serializers.StringRelatedField(source='categoria', read_only=True)

    class Meta:
        model  = Lancamento
        fields = '__all__'


class DetalhesTransporteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = DetalhesTransporte
        fields = '__all__'


class DetalhesDiariaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = DetalhesDiaria
        fields = '__all__'


class DetalhesMatConsumoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = DetalhesMatConsumo
        fields = '__all__'


class DetalhesServTerceirosSerializer(serializers.ModelSerializer):
    class Meta:
        model  = DetalhesServTerceiros
        fields = '__all__'


class DetalhesMaterialPermanenteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = DetalhesMaterialPermanente
        fields = '__all__'


class HistoricoAlteracoesSerializer(serializers.ModelSerializer):
    class Meta:
        model  = HistoricoAlteracoes
        fields = '__all__'

class ProjetoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Projeto
        fields = '__all__'