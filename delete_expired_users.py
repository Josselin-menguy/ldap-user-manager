# delete_expired_users.py
import os
import datetime
from ldap3 import Server, Connection, ALL, MODIFY_DELETE
from dotenv import load_dotenv
from flask import Flask
from flask_mail import Mail

from mail_utils import send_final_deletion_email, send_deferred_deletion_email, get_cn_from_dn

# Charger les variables d'environnement (mêmes que Flask)
dotenv_path = "/var/www/flask_app/flask_app/log_ldap.env"
load_dotenv(dotenv_path)

LDAP_SERVER = os.getenv('SERVER_IP')
LDAP_PORT = int(os.getenv('LDAP_PORT', 636))
LDAP_USER = f"{os.getenv('TESTNAME')}@{os.getenv('DOMAIN')}"
LDAP_PASSWORD = os.getenv('PASSWORD')
BASE_DN = os.getenv('BASE_DN')
MAIL_RECIPIENT = os.getenv('MAIL_RECIPIENT')

LOG_FILE = "suppression_differee.log"

# Initialisation Flask et Flask-Mail pour l'envoi de mail
app = Flask(__name__)
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'true').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')
mail = Mail(app)

def main():
    today = datetime.datetime.now()
    six_months_ago = today - datetime.timedelta(days=180)
    six_months_later = today + datetime.timedelta(days=180)
    today_str = today.strftime("%Y-%m-%d %H:%M")
    server = Server(LDAP_SERVER, port=LDAP_PORT, use_ssl=True, get_info=ALL)
    conn = Connection(server, user=LDAP_USER, password=LDAP_PASSWORD, auto_bind=True)

    # Recherche tous les comptes désactivés avec une date de suppression (future ou passée)
    search_filter = "(&(userAccountControl=514)(extensionAttribute1=*))"
    conn.search(
        BASE_DN,
        search_filter,
        attributes=['distinguishedName', 'extensionAttribute1']
    )

    with open(LOG_FILE, "a", encoding="utf-8") as log, app.app_context():
        log.write(f"\n=== Vérification du {today_str} ===\n")
        for entry in conn.entries:
            dn = str(entry.distinguishedName)
            deletion_date_str = str(entry.extensionAttribute1)
            try:
                # Gère les deux formats : avec ou sans heure
                if len(deletion_date_str.strip()) > 10:
                    deletion_date = datetime.datetime.strptime(deletion_date_str, "%Y-%m-%d %H:%M")
                else:
                    deletion_date = datetime.datetime.strptime(deletion_date_str, "%Y-%m-%d")
            except Exception:
                log.write(f"Format de date invalide pour {dn}: {deletion_date_str}\n")
                continue

            # Comparaison sur la période de 6 mois avant/après
            if six_months_ago <= deletion_date <= six_months_later:
                if deletion_date <= today:
                    log.write(f"Suppression du compte {dn} (date prévue : {deletion_date_str})\n")
                    success = conn.delete(dn)
                    if success:
                        log.write(f"Compte {dn} supprimé.\n")
                        # Envoi du mail de confirmation de suppression définitive
                        user_cn = get_cn_from_dn(dn)
                        send_deferred_deletion_email(mail, MAIL_RECIPIENT, user_cn, today_str)
                    else:
                        log.write(f"Erreur lors de la suppression de {dn}: {conn.result}\n")
                else:
                    log.write(f"Suppression prévue pour {dn} le {deletion_date_str}\n")

    conn.unbind()

if __name__ == "__main__":
    main()