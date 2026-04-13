#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
python manage.py shell -c "from django.contrib.auth.hashers import make_password; from core.models import Usuario; u=Usuario.objects.get(login='jeferson'); u.senha_hash=make_password('123456'); u.save(); print('Senha redefinida OK')"
