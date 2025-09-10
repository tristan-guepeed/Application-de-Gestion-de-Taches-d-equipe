echo "Création du superuser ..."
python manage.py createsuperuser --noinput --username tristan --email "tristan@example.com" 2>/dev/null
echo "from django.contrib.auth.models import User; user = User.objects.get(username='tristan'); user.set_password('test'); user.save()" | python manage.py shell
echo "Superuser créé."
