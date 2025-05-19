import logging
import re
import os
from flask_mail import Message
from group_labels import get_group_labels_from_dns
from pdf_utils import generate_pdf_with_logo

logger = logging.getLogger(__name__)

def get_cn_from_dn(dn):
    """
    Extrait la valeur après 'CN=' dans un DN LDAP.
    Si le DN ne correspond pas au format attendu, renvoie le DN complet.
    """
    if not dn:
        return ""
    match = re.match(r'^CN=([^,]+)', dn, re.IGNORECASE)
    if match:
        return match.group(1)
    return dn

def send_creation_email(mail, recipient, user_info, password, all_groups):
    """
    Envoie le mail de création d'utilisateur en HTML,
    avec un tableau pour un alignement parfait et la police Arial,
    et joint un PDF contenant le login et le mot de passe.
    """
    try:
        logger.debug("=== send_creation_email ===")
        logger.debug(f"Destinataire : {recipient}")
        logger.debug(f"user_info : {user_info}")
        logger.debug(f"Mot de passe généré : {password}")
        logger.debug(f"Groupes bruts reçus (DNs) : {all_groups}")

        manager_dn = user_info.get('managerDn', '')
        manager_cn = get_cn_from_dn(manager_dn)
        parsed_groups = get_group_labels_from_dns(all_groups)
        logger.debug(f"Groupes convertis (labels) : {parsed_groups}")

        html_content = f"""
<html>
  <head>
    <style>
      table {{
        font-family: Arial, sans-serif;
        border-collapse: collapse;
      }}
      th, td {{
        padding: 5px 10px;
        text-align: left;
      }}
    </style>
  </head>
  <body style="margin:0; padding:0; font-family:Arial, sans-serif;">
    <p>Bonjour,</p>
    <p>Les informations suivantes ont été créées pour le collaborateur :</p>
    <table border="0" cellspacing="0" cellpadding="0">
      <tr>
        <th>Champs</th>
        <th>Valeurs</th>
      </tr>
      <tr><td>Nom complet</td><td>{user_info['fullName']}</td></tr>
      <tr><td>Prénom</td><td>{user_info['firstName']}</td></tr>
      <tr><td>Nom de famille</td><td>{user_info['lastName']}</td></tr>
      <tr><td>OU de création</td><td>{user_info['new_ou']}</td></tr>
      <tr><td>Description</td><td>{user_info['newDescription'] or 'Non spécifiée'}</td></tr>
      <tr><td>Bureau</td><td>{user_info['newOffice'] or 'Non spécifié'}</td></tr>
      <tr><td>Numéro de téléphone</td><td>{user_info['newPhoneNumber'] or 'Non spécifié'}</td></tr>
      <tr><td>Login</td><td>{user_info['loginName'] + user_info['domain']}</td></tr>
      <tr><td>Manager</td><td>{manager_cn or 'Aucun'}</td></tr>
      <tr><td>Groupes attribués</td><td>{', '.join(parsed_groups) if parsed_groups else 'Aucun'}</td></tr>
      <tr><td>Mot de passe généré</td><td>{password}</td></tr>
    </table>
    <p>Cordialement,<br>L'équipe Infra</p>
  </body>
</html>
"""
        msg = Message(
            subject="Création de personnel réussie",
            recipients=[recipient],
            html=html_content
        )

        # Génération du PDF dans le dossier dédié
        import uuid
        unique_id = str(uuid.uuid4())
        output_pdf = f"/var/www/flask_app/flask_app/pdf_temp/creation_compte_{unique_id}.pdf"
        logo_path = os.path.join(os.path.dirname(__file__), "logo_pdf.png")
        first_name = user_info.get("firstName", "")
        last_name = user_info.get("lastName", "")
        login = user_info.get("loginName", "")
        generate_pdf_with_logo(
            output_filename=output_pdf,
            logo_path=logo_path,
            first_name=first_name,
            last_name=last_name,
            login_name=login,
            password=password
        )

        # Attachement du PDF
        with open(output_pdf, "rb") as fp:
            msg.attach("creation_compte.pdf", "application/pdf", fp.read())

        # Envoi du mail avec le PDF en pièce jointe
        mail.send(msg)
        logger.info("Mail de création envoyé avec succès.")

        return output_pdf
    
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi du mail de création : {e}")

def send_support_email(mail, recipient, user_cn, pdf_path):
    """
    Envoie un mail simple au pôle support avec le PDF des identifiants en pièce jointe.
    """
    try:
        logger.debug("=== send_support_email ===")
        logger.debug(f"Destinataire : {recipient}")
        logger.debug(f"CN utilisateur : {user_cn}")
        logger.debug(f"PDF attaché : {pdf_path}")

        # Message simple
        html_content = f"""
<html>
  <head>
    <style>
      body {{
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }}
    </style>
  </head>
  <body>
    <p>Bonjour,</p>
    <p>L'utilisateur <strong>{user_cn}</strong> a été créé. Vous retrouverez ses identifiants en pièce jointe.</p>
    <p>Cordialement,<br>L'équipe infra</p>
  </body>
</html>
"""

        msg = Message(
            subject=f"Création de l'utilisateur : {user_cn}",
            recipients=[recipient],
            html=html_content
        )

        with open(pdf_path, "rb") as fp:
            msg.attach("creation_compte.pdf", "application/pdf", fp.read())

        mail.send(msg)
        logger.info("Mail de support envoyé avec succès.")

    except Exception as e:
        logger.error(f"Erreur lors de l'envoi du mail au support : {e}")


def send_deletion_email(mail, recipient, user_full_name):
    """
    Envoie le mail de suppression immédiate en HTML,
    avec la police Arial, affichant uniquement le message :
    "Le collaborateur [Nom] a été supprimé."
    """
    try:
        logger.debug("=== send_deletion_email ===")
        logger.debug(f"Destinataire : {recipient}")
        logger.debug(f"Nom complet : {user_full_name}")

        display_name = user_full_name.strip() if user_full_name.strip() else "Inconnu"

        html_content = f"""
<html>
  <head>
    <style>
      table {{
        font-family: Arial, sans-serif;
        border-collapse: collapse;
      }}
      th, td {{
        padding: 5px 10px;
        text-align: left;
      }}
    </style>
  </head>
  <body style="margin:0; padding:0; font-family:Arial, sans-serif;">
    <p>Le collaborateur <strong>{display_name}</strong> a été supprimé.</p>
  </body>
</html>
"""
        msg = Message(
            subject="Suppression immédiate de collaborateur",
            recipients=[recipient],
            html=html_content
        )
        mail.send(msg)
        logger.info("Mail de suppression immédiate envoyé avec succès.")
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi du mail de suppression immédiate : {e}")

def send_deferred_deletion_email(mail, recipient, user_full_name, deletion_date_str):
    """
    Envoie le mail indiquant une planification de suppression en HTML,
    avec la police Arial, affichant uniquement le message :
    "Le collaborateur [Nom] sera définitivement supprimé le [date]."
    """
    try:
        logger.debug("=== send_deferred_deletion_email ===")
        logger.debug(f"Destinataire : {recipient}")
        logger.debug(f"Nom complet : {user_full_name}")
        logger.debug(f"Date de suppression planifiée : {deletion_date_str}")

        display_name = user_full_name.strip() if user_full_name.strip() else "Inconnu"

        html_content = f"""
<html>
  <head>
    <style>
      table {{
        font-family: Arial, sans-serif;
        border-collapse: collapse;
      }}
      th, td {{
        padding: 5px 10px;
        text-align: left;
      }}
    </style>
  </head>
  <body style="margin:0; padding:0; font-family:Arial, sans-serif;">
    <p>Le collaborateur <strong>{display_name}</strong> sera définitivement supprimé le <strong>{deletion_date_str}</strong>.</p>
  </body>
</html>
"""
        msg = Message(
            subject="Planification de suppression de collaborateur",
            recipients=[recipient],
            html=html_content
        )
        mail.send(msg)
        logger.info("Mail de suppression différée envoyé avec succès.")
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi du mail de suppression différée : {e}")

def send_modification_email(mail, recipient, user_full_name, data, all_groups):
    """
    Envoie le mail récapitulatif pour la modification d'un collaborateur en HTML,
    avec la police Arial, en s'appuyant sur le nom complet et la liste de groupes.
    Le mapping des DN vers des libellés conviviaux est effectué via group_labels.py.
    """
    try:
        logger.debug("=== send_modification_email ===")
        logger.debug(f"Destinataire : {recipient}")
        logger.debug(f"Nom complet : {user_full_name}")
        logger.debug(f"Data : {data}")
        logger.debug(f"Groupes bruts reçus (DNs) : {all_groups}")

        new_description = data.get('newDescription', '').strip()
        new_office = data.get('newOffice', '').strip()
        new_phone_number = data.get('newPhoneNumber', '').strip()
        login_name = data.get('loginName', '').strip()
        domain = data.get('domain', '').strip()

        manager_cn = get_cn_from_dn(data.get('managerDn', ''))
        parsed_groups = get_group_labels_from_dns(all_groups)
        logger.debug(f"Groupes convertis (labels) : {parsed_groups}")

        # Préparation des champs pour générer le tableau
        fields = [
            ("Collaborateur", user_full_name),
            ("Description", new_description or "Non modifiée"),
            ("Bureau", new_office or "Non modifié"),
            ("Numéro de téléphone", new_phone_number or "Non modifié"),
            ("Login", (login_name + domain) if login_name else "Non modifié"),
            ("Manager", manager_cn or "Aucun"),
            ("Groupes attribués", ", ".join(parsed_groups) if parsed_groups else "Aucun")
        ]
        table_rows = ""
        for key, value in fields:
            table_rows += f"<tr><td style='padding:5px 10px;'>{key}</td><td style='padding:5px 10px;'>{value}</td></tr>"

        html_content = f"""
<html>
  <head>
    <style>
      table {{
        font-family: Arial, sans-serif;
        border-collapse: collapse;
      }}
      th, td {{
        padding: 5px 10px;
        text-align: left;
      }}
    </style>
  </head>
  <body style="margin:0; padding:0; font-family:Arial, sans-serif;">
    <p>Bonjour,</p>
    <p>Les informations suivantes ont été modifiées pour le collaborateur :</p>
    <table border="0" cellspacing="0" cellpadding="0">
      <tr>
        <th>Champs</th>
        <th>Valeurs</th>
      </tr>
      {table_rows}
    </table>
    <p>Cordialement,<br>L'équipe IT</p>
  </body>
</html>
"""
        msg = Message(
            subject="Modification de collaborateur réussie",
            recipients=[recipient],
            html=html_content
        )
        mail.send(msg)
        logger.info("Mail de modification envoyé avec succès.")
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi du mail de modification : {e}")
