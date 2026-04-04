from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_projeto_lancamento_projeto'),
    ]

    operations = [
        migrations.AddField(
            model_name='lancamento',
            name='ativo',
            field=models.BooleanField(default=True),
        ),
    ]
