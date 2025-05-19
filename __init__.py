import os
import jwt
import datetime
import random
import string
import logging
import sys
import re
from functools import wraps
from contextlib import contextmanager

from flask import Flask, request, jsonify, session, send_from_directory, make_response
from flask_cors import CORS
from flask_mail import Mail
from ldap3 import Server, Connection, ALL, MODIFY_ADD, MODIFY_DELETE, MODIFY_REPLACE
from ldap3.core.exceptions import LDAPException, LDAPBindError
from ldap3.utils.conv import escape_filter_chars
from dotenv import load_dotenv

# Import des fonctions d'envoi de mail et PDF (supposées déjà présentes)
from mail_utils import (
    send_creation_email,
    send_deletion_email,
    send_deferred_deletion_email,
    send_modification_email,
    send_support_email,
    get_cn_from_dn
)

# Chargement des variables d'environnement
dotenv_path = os.getenv("DOTENV_PATH", "./.env")
load_dotenv(dotenv_path)

# Initialisation de l'application Flask
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": os.getenv("CORS_ORIGINS", "*")}}, supports_credentials=True)
app.secret_key = os.getenv('SECRET_KEY', 'changeme')
app.config['SECRET_KEY'] = app.secret_key

# Configuration Flask-Mail
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'true').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')
mail = Mail(app)

# Configuration du logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.propagate = False

# Variables d'environnement LDAP
LDAP_SERVER = os.getenv('SERVER_IP')
LDAP_PORT = int(os.getenv('LDAP_PORT', 636))
LDAP_USER = f"{os.getenv('TESTNAME')}@{os.getenv('DOMAIN')}"
LDAP_PASSWORD = os.getenv('PASSWORD')
BASE_DN = os.getenv('BASE_DN')
MAIL_RECIPIENT = os.getenv('MAIL_RECIPIENT')
MAIL_SUPPORT_RECIPIENT = os.getenv('MAIL_SUPPORT_RECIPIENT')

# ------------------ GESTIONNAIRES DE CONTEXTE LDAP ------------------

def connect_ldap_admin():
    try:
        ldap_server = Server(LDAP_SERVER, port=LDAP_PORT, use_ssl=True, get_info=ALL)
        connection = Connection(ldap_server, user=LDAP_USER, password=LDAP_PASSWORD, auto_bind=True)
        if connection.bound:
            logger.info("Connexion LDAP admin réussie.")
            return connection
        else:
            logger.error("Échec de la connexion LDAP admin.")
            return None
    except LDAPException as e:
        logger.exception(f"Erreur de connexion LDAP admin : {e}")
        return None

def connect_user_ldap(user_email, user_password):
    try:
        ldap_server = Server(LDAP_SERVER, port=LDAP_PORT, use_ssl=True, get_info=ALL)
        connection = Connection(ldap_server, user=user_email, password=user_password, auto_bind=True)
        if connection.bound:
            logger.info(f"Connexion LDAP réussie pour {user_email}.")
            return connection
        else:
            logger.error(f"Connexion LDAP échouée pour {user_email}.")
            return None
    except LDAPException as e:
        logger.error(f"Erreur lors de la connexion LDAP : {e}")
        return None

@contextmanager
def ldap_admin_connection_context():
    connection = connect_ldap_admin()
    try:
        if connection is None:
            raise Exception("Impossible d'établir une connexion LDAP admin")
        yield connection
    finally:
        if connection:
            connection.unbind()

@contextmanager
def ldap_user_connection_context(user_email, user_password):
    connection = connect_user_ldap(user_email, user_password)
    try:
        if connection is None:
            raise Exception("Impossible d'établir une connexion LDAP utilisateur")
        yield connection
    finally:
        if connection:
            connection.unbind()

# ------------------ AUTHENTIFICATION & JWT ------------------

def create_jwt_token(username):
    payload = {
        "sub": username,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm="HS256")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('authToken')
        if not token:
            return jsonify({"error": "Accès refusé, token manquant"}), 401
        try:
            decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            request.user = decoded_token["sub"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expiré"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token invalide"}), 401
        return f(*args, **kwargs)
    return decorated

def check_logged_in(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return jsonify({"error": "Accès refusé, utilisateur non connecté"}), 401
        return f(*args, **kwargs)
    return decorated_function

def generate_password(length=12):
    if length < 3:
        raise ValueError("La longueur du mot de passe doit être au moins 3.")
    password_chars = [
        random.choice(string.ascii_uppercase),
        random.choice(string.ascii_lowercase),
        random.choice(string.digits),
    ]
    all_chars = string.ascii_letters + string.digits
    password_chars += random.choices(all_chars, k=length - 3)
    random.shuffle(password_chars)
    return "".join(password_chars)

# ------------------ ROUTES FLASK ------------------

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user_principal_name = data.get('username', '').strip()
        user_password = data.get('password', '').strip()
        if not user_principal_name or not user_password:
            return jsonify({"error": "Nom d'utilisateur et mot de passe requis"}), 400

        with ldap_admin_connection_context() as ldap_connection_admin:
            upn_escaped = escape_filter_chars(user_principal_name)
            search_filter = f"(userPrincipalName={upn_escaped})"
            ldap_connection_admin.search(
                BASE_DN,
                search_filter,
                attributes=['distinguishedName', 'memberof']
            )
            if len(ldap_connection_admin.entries) < 1:
                return jsonify({"error": "Identifiants invalides"}), 401
            user_entry = ldap_connection_admin.entries[0]
            user_dn = str(user_entry.distinguishedName)
            memberof_values = user_entry['memberof'].values if 'memberof' in user_entry else []

        try:
            with Connection(Server(LDAP_SERVER, use_ssl=True),
                            user=user_dn, password=user_password, auto_bind=True):
                pass
        except LDAPBindError:
            return jsonify({"error": "Identifiants invalides"}), 401

        required_group_dn = os.getenv('LDAP_REQUIRED_GROUP_DN', '').lower().strip()
        if required_group_dn and required_group_dn not in [g.lower().strip() for g in memberof_values]:
            return jsonify({"error": "Vous n'êtes pas autorisé à rentrer sur cette page"}), 403

        token = create_jwt_token(user_principal_name)
        response = make_response(jsonify({"message": "Connexion réussie"}))
        response.set_cookie('authToken', token, httponly=True, secure=True, samesite='Lax')
        return response, 200

    except Exception as e:
        logger.exception("Erreur interne lors de la connexion")
        return jsonify({"error": "Erreur interne", "details": str(e)}), 500

@app.route('/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({"message": "Déconnexion réussie"}))
    response.set_cookie('authToken', '', httponly=True, secure=True, samesite='Lax',
                        expires=0, max_age=0)
    return response, 200

@app.route('/check_auth', methods=['GET'])
@token_required
def check_auth():
    return jsonify({"authenticated": True, "user": request.user}), 200

@app.route('/search_user')
@token_required
def search_user():
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify([]), 200
    try:
        with ldap_admin_connection_context() as ldap_connection:
            escaped_query = escape_filter_chars(query)
            search_filter = f"(cn=*{escaped_query}*)"
            ldap_connection.search(
                BASE_DN,
                search_filter,
                attributes=['distinguishedName']
            )
            users = [{'dn': str(entry.distinguishedName)} for entry in ldap_connection.entries]
            return jsonify(users), 200
    except LDAPException as e:
        logger.exception(f"Erreur lors de la recherche LDAP : {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/search_manager')
@token_required
def search_manager():
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify({"managers": []}), 200
    try:
        with ldap_admin_connection_context() as ldap_connection:
            escaped_query = escape_filter_chars(query)
            search_filter = f"(cn=*{escaped_query}*)"
            ldap_connection.search(
                BASE_DN,
                search_filter,
                attributes=['distinguishedName', 'cn']
            )
            managers = [{'dn': str(entry.distinguishedName), 'cn': str(entry.cn)} for entry in ldap_connection.entries]
            return jsonify({"managers": managers}), 200
    except Exception as e:
        return jsonify({"error": str(e), "managers": []}), 500

@app.route('/search_group')
@token_required
def search_group():
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify({"groups": []}), 200
    try:
        with ldap_admin_connection_context() as ldap_connection:
            escaped_query = escape_filter_chars(query)
            search_filter = f"(cn=*{escaped_query}*)"
            ldap_connection.search(
                BASE_DN,
                search_filter,
                attributes=['distinguishedName', 'cn']
            )
            groups = [{'dn': str(entry.distinguishedName), 'cn': str(entry.cn)} for entry in ldap_connection.entries]
            return jsonify({"groups": groups}), 200
    except Exception as e:
        return jsonify({"error": str(e), "groups": []}), 500

@app.route('/create_user', methods=['POST'])
@token_required
def create_user():
    try:
        data = request.get_json()
        fullName = data.get('fullName', '').strip()
        firstName = data.get('firstName', '').strip()
        lastName = data.get('lastName', '').strip()
        new_ou = data.get('new_ou', '').strip()
        newDescription = data.get('newDescription', '').strip()
        newOffice = data.get('newOffice', '').strip()
        newPhoneNumber = data.get('newPhoneNumber', '').strip()
        loginName = data.get('loginName', '').strip()
        domain = data.get('domain', '').strip()
        managerDn = data.get('managerDn', '').strip()
        memberOf = data.get('memberOf', [])

        if not fullName or not firstName or not lastName or not new_ou:
            return jsonify({"error": "Les champs fullName, firstName, lastName et new_ou sont obligatoires."}), 400

        if not loginName:
            loginName = firstName[0].lower() + lastName.lower()

        with ldap_admin_connection_context() as ldap_connection:
            i = 1
            unique_login = loginName
            while True:
                escaped_login = escape_filter_chars(unique_login)
                ldap_connection.search(
                    BASE_DN,
                    f"(sAMAccountName={escaped_login})",
                    attributes=['sAMAccountName']
                )
                if not ldap_connection.entries:
                    break
                i += 1
                if i <= len(firstName):
                    unique_login = firstName[:i].lower() + lastName.lower()
                else:
                    unique_login = firstName.lower() + lastName.lower() + str(random.randint(0, 9))
            loginName = unique_login

        password = generate_password(12)
        new_dn = f"CN={fullName},OU={new_ou},{BASE_DN}"

        attributes = {
            "objectClass": ["top", "person", "organizationalPerson", "user"],
            "cn": fullName,
            "sn": lastName,
            "givenName": firstName,
            "displayName": fullName,
            "userPrincipalName": loginName + domain,
            "sAMAccountName": loginName,
            "mail": loginName + domain,
            "unicodePwd": f'"{password}"'.encode('utf-16-le'),
            "userAccountControl": 512
        }
        if newDescription:
            attributes["description"] = newDescription
        if newOffice:
            attributes["physicalDeliveryOfficeName"] = newOffice
        if newPhoneNumber:
            attributes["telephoneNumber"] = newPhoneNumber
            attributes["homePhone"] = newPhoneNumber
        if managerDn:
            attributes["manager"] = managerDn

        default_groups = [
            os.getenv("DEFAULT_GROUP_1", ""),
            os.getenv("DEFAULT_GROUP_2", "")
        ]
        memberOf_dns = [g["dn"] if isinstance(g, dict) else g for g in memberOf]
        all_groups = set(memberOf_dns + default_groups)

        with ldap_admin_connection_context() as ldap_connection:
            success = ldap_connection.add(new_dn, attributes=attributes)
            if not success:
                error_details = ldap_connection.result
                return jsonify({"error": "Échec de la création de l'utilisateur", "details": error_details}), 500
            for group_dn in all_groups:
                if group_dn:
                    ldap_connection.modify(group_dn, {'member': [(MODIFY_ADD, [new_dn])]})

        recipient = MAIL_RECIPIENT
        user_info = {
            'fullName': fullName,
            'firstName': firstName,
            'lastName': lastName,
            'new_ou': new_ou,
            'newDescription': newDescription,
            'newOffice': newOffice,
            'newPhoneNumber': newPhoneNumber,
            'loginName': loginName,
            'domain': domain,
            'managerDn': managerDn
        }
        output_pdf = send_creation_email(mail, recipient, user_info, password, all_groups)
        support_recipient = MAIL_SUPPORT_RECIPIENT
        send_support_email(mail, support_recipient, loginName, output_pdf)
        if os.path.exists(output_pdf):
            os.remove(output_pdf)

        return jsonify({
            "message": "Création de l'utilisateur réussie",
            "password": password,
            "loginName": loginName
        }), 200

    except Exception as e:
        logger.exception("Erreur inattendue dans /create_user")
        return jsonify({"error": "Erreur inattendue", "details": str(e)}), 500

@app.route('/delete_user', methods=['POST'])
@token_required
def delete_user():
    try:
        data = request.get_json()
        dn = data.get('dn', '').strip()
        fullName = data.get('fullName', '').strip()
        retention_days = data.get('retention_days', 0)
        retention_minutes = data.get('retention_minutes', 0)

        if not dn:
            return jsonify({"error": "Le champ 'dn' est obligatoire."}), 400

        try:
            retention_days = int(retention_days) if retention_days else 0
            retention_minutes = int(retention_minutes) if retention_minutes else 0
        except ValueError:
            return jsonify({"error": "'retention_days' et 'retention_minutes' doivent être des entiers."}), 400

        recipient = MAIL_RECIPIENT

        with ldap_admin_connection_context() as ldap_connection:
            if retention_days == 0 and retention_minutes == 0:
                success = ldap_connection.delete(dn)
                if not success:
                    error_details = ldap_connection.result
                    return jsonify({"error": "Échec de la suppression immédiate", "details": error_details}), 500
                send_deletion_email(mail, recipient, fullName)
                return jsonify({"message": "L'utilisateur a été supprimé immédiatement."}), 200
            else:
                deletion_datetime = datetime.datetime.now() + datetime.timedelta(days=retention_days, minutes=retention_minutes)
                deletion_date_str = deletion_datetime.strftime("%Y-%m-%d %H:%M")
                modifications = {
                    "userAccountControl": [(MODIFY_REPLACE, ['514'])],
                    "extensionAttribute1": [(MODIFY_REPLACE, [deletion_date_str])]
                }
                success = ldap_connection.modify(dn, modifications)
                if not success:
                    error_details = ldap_connection.result
                    return jsonify({"error": "Échec de la désactivation du compte", "details": error_details}), 500
                send_deferred_deletion_email(mail, recipient, fullName, deletion_date_str)
                return jsonify({
                    "message": f"L'utilisateur sera définitivement supprimé le {deletion_date_str}. "
                               f"En attendant, le compte a été désactivé."
                }), 200

    except Exception as e:
        logger.exception("Erreur inattendue dans /delete_user")
        return jsonify({"error": "Erreur inattendue", "details": str(e)}), 500

@app.route('/apply_changes', methods=['POST'])
@token_required
def apply_changes():
    try:
        data = request.json
        dn = data.get('dn', '').strip()
        fullName = data.get('fullName', '').strip()
        firstName = data.get('firstName', '').strip()
        lastName = data.get('lastName', '').strip()
        new_ou = data.get('new_ou', '').strip()
        main_ou = data.get('main_ou', '').strip()
        new_description = data.get('newDescription', '').strip()
        new_office = data.get('newOffice', '').strip()
        new_phone_number = data.get('newPhoneNumber', '').strip()
        login_name = data.get('loginName', '').strip()
        domain = data.get('domain', '').strip()
        manager_dn = data.get('managerDn', '').strip()
        member_of = data.get('memberOf', [])

        if not dn or not new_ou or not main_ou:
            return jsonify({"error": "DN, new OU et main OU requis"}), 400

        # Logique de modification LDAP à compléter selon besoins

        # Envoi du mail de modification
        send_modification_email(mail, MAIL_RECIPIENT, fullName, data, member_of)
        return jsonify({"message": "Modifications appliquées avec succès"}), 200

    except LDAPException as e:
        logger.exception("LDAP error during apply_changes")
        return jsonify({"error": "Erreur LDAP", "details": str(e)}), 500
    except Exception as e:
        logger.exception("Unexpected error during apply_changes")
        return jsonify({"error": "Erreur inattendue", "details": str(e)}), 500

# ------------------ ROUTES CATCH-ALL ET ERREURS ------------------

@app.route('/<path:path>')
def catch_all(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return jsonify({"error": "Cette route n'existe pas"}), 404

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Cette route n'existe pas"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Erreur interne du serveur"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
