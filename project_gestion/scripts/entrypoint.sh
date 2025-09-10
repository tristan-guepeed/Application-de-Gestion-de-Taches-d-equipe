#!/bin/sh
# entrypoint.sh

# Lancer le serveur Django en arrière-plan
python manage.py migrate && python manage.py runserver 0.0.0.0:8000
