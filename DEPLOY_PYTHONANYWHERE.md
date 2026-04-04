# Deploy no PythonAnywhere

## Pré-requisitos
- Conta gratuita em pythonanywhere.com (username = `spectreunisc` ou similar)
- MySQL já disponível no painel PythonAnywhere (guia **Databases**)

---

## 1. Upload do código

No **Bash console** do PythonAnywhere:

```bash
# Clone ou suba o ZIP do projeto
git clone https://github.com/SEU_USUARIO/spectre.git ~/spectre
# OU: faça upload pelo Files e descompacte

cd ~/spectre
```

---

## 2. Virtualenv e dependências

```bash
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 3. Arquivo `.env`

Crie `~/spectre/.env`:

```env
SECRET_KEY=gere-uma-chave-segura-aqui
DEBUG=False
DB_NAME=spectreunisc$spectre
DB_USER=spectreunisc
DB_PASSWORD=SENHA_DO_MYSQL_PYTHONANYWHERE
DB_HOST=spectreunisc.mysql.pythonanywhere-services.com
DB_PORT=3306
```

> No painel **Databases**, crie o banco e anote host, usuário e senha.

---

## 4. Banco de dados

```bash
# Ainda no bash do PythonAnywhere, com venv ativo:
python manage.py migrate
python manage.py collectstatic --noinput
```

---

## 5. Configurar Web App

1. Painel → **Web** → **Add a new web app**
2. Escolha **Manual configuration** → Python 3.12
3. Em **Virtualenv**: `/home/spectreunisc/spectre/venv`
4. Em **WSGI configuration file** (clique no link do arquivo), substitua todo o conteúdo por:

```python
import sys
import os

path = '/home/spectreunisc/spectre'
if path not in sys.path:
    sys.path.insert(0, path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'spectre_project.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

5. Em **Static files**:
   - URL: `/static/`  →  Directory: `/home/spectreunisc/spectre/staticfiles`

6. Clique em **Reload**.

---

## 6. Acesso

O sistema estará disponível em:
- **Frontend + API**: `https://spectreunisc.pythonanywhere.com/`
- **API direta**: `https://spectreunisc.pythonanywhere.com/api/`

> O frontend (`spectre_app.html`) é servido pelo Django via `TemplateView` na rota raiz.
> A detecção automática de `API_BASE` já funciona: quando servido pelo Django usa `/api` relativo.

---

## Atualizar após mudanças

```bash
cd ~/spectre
git pull
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
# Painel Web → Reload
```
