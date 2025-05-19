#!/usr/bin/env python3
import sys
import logging
import os
from pathlib import Path

# Forcer l'encodage de stdout et stderr en UTF-8
if sys.stdout.encoding is None or sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)
if sys.stderr.encoding is None or sys.stderr.encoding.lower() != 'utf-8':
    sys.stderr = open(sys.stderr.fileno(), mode='w', encoding='utf-8', buffering=1)

# Configurer un fichier de log en plus de stderr, avec encodage UTF-8
log_file = '/var/log/flask_app/wsgi_errors.log'
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s %(levelname)s: %(message)s',
    handlers=[
        logging.FileHandler(log_file, encoding='utf-8'),
        logging.StreamHandler(sys.stderr)
    ]
)

logging.debug("Démarrage du fichier WSGI...")

# Ajouter le répertoire principal au chemin (générique)
app_path = '/var/www/flask_app'
sys.path.insert(0, app_path)
logging.debug(f"Chemin ajouté à sys.path : {app_path}")
logging.debug(f"sys.path actuel : {sys.path}")

# Activation de l'environnement virtuel (générique)
venv_path = '/var/www/flask_app/venv'
venv_site = os.path.join(venv_path, 'lib', 'python3.11', 'site-packages')
if os.path.isdir(venv_site):
    sys.path.insert(0, venv_site)
    logging.debug(f"Répertoire site-packages ajouté : {venv_site}")
else:
    logging.error(f"Répertoire site-packages introuvable dans {venv_path}")

# Charger l'application Flask (aucune référence spécifique)
try:
    from flask_app import app as application
    application.secret_key = 'something super SUPER secret'
    logging.debug("Le chargement du module Flask a réussi.")
except Exception as e:
    logging.exception("Erreur lors du chargement du module Flask : %s", str(e))
    raise
