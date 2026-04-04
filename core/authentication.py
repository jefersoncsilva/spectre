from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from .models import Usuario


class SpectreJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        uid = validated_token.get('usuario_id')
        if not uid:
            raise InvalidToken('Token sem usuario_id')
        try:
            usuario = Usuario.objects.get(id=uid, ativo=True)
            usuario.is_authenticated = True  # exigido por IsAuthenticated do DRF
            return usuario
        except Usuario.DoesNotExist:
            raise InvalidToken('Usuário não encontrado')
