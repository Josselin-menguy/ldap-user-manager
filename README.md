# Gestion de Mouvements de Personnel (Flask + React)

Ce projet est une application web permettant de gérer les entrées, sorties et modifications des collaborateurs dans un annuaire LDAP (Active Directory). Il intègre également des envois d'e-mails automatiques avec génération de PDF, ainsi qu'une interface utilisateur ergonomique construite avec React.

## Technologies utilisées

### Backend (API)

* Python (3.10+)
* Flask
* Flask-CORS
* Flask-Mail
* ldap3
* python-dotenv
* PyJWT

### Frontend

* React (avec Vite ou Create React App)
* Tailwind CSS
* Formik
* React Router
* Dark mode intégré

## Fonctionnalités

### Backend

* Connexion LDAP sécurisée (admin et utilisateur)
* Création, suppression et modification d’utilisateurs
* Attribution et retrait de groupes LDAP
* Authentification via JWT
* Envoi de mails avec pièce jointe PDF
* Routes sécurisées avec vérification d'autorisation

### Frontend

* Formulaire d’entrée de collaborateur
* Formulaire de sortie (suppression immédiate ou différée)
* Modification de compte (mouvement interne)
* Sélection dynamique de l'OU et des groupes LDAP
* Authentification sécurisée avec JWT
* Interface responsive avec support du dark mode

## Structure des fichiers

### Backend (`flask_app/`)

* `__init__.py` : point d'entrée de l'API Flask, gère les routes, la configuration, l'authentification, les interactions LDAP
* `mail_utils.py` : envoie d'emails HTML avec pièces jointes (PDF)
* `group_labels.py` : correspondance entre les DN LDAP des groupes et leurs noms lisibles
* `pdf_utils.py` : génération de fichiers PDF avec les identifiants du collaborateur
* `.env` : fichier de configuration des variables sensibles (non versionné)

### Frontend (`frontend/`)

* `App.js` : configuration des routes React et de l'authentification
* `AuthContext.js` : gestion du contexte d'authentification JWT
* `login.jsx` : page de connexion de l'application
* `Components/` : composants du formulaire (entrée, sortie, mouvement, etc.)

## Exemple de fichier `.env`

Crée un fichier `.env` dans le dossier `flask_app/` :

```
SECRET_KEY=your-secret-key
DOMAIN=@example.com
BASE_DN=DC=example,DC=com
SERVER_IP=ldap.example.com
LDAP_PORT=636
MAIL_SERVER=smtp.example.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_DEFAULT_SENDER=admin@example.com
MAIL_RECIPIENT=admin@example.com
MAIL_SUPPORT_RECIPIENT=support@example.com
LDAP_REQUIRED_GROUP_DN=CN=group,OU=Groups,DC=example,DC=com
```

## Arborescence simplifiée

```
├── flask_app/
│   ├── __init__.py
│   ├── mail_utils.py
│   ├── group_labels.py
│   ├── pdf_utils.py
│   └── .env
├── frontend/
│   ├── App.js
│   ├── AuthContext.js
│   ├── login.jsx
│   └── Components/
├── README.md
└── .gitignore
```

## Sécurité

* Toutes les informations sensibles sont externalisées dans un fichier `.env` (non versionné)
* Le JWT est stocké dans un cookie `HttpOnly` sécurisé
* Les routes critiques sont protégées par des décorateurs
* Les DN, emails et domaines sont génériques pour publication
* L’historique Git a été volontairement réinitialisé pour éviter toute fuite de données confidentielles.


## Licence

Ce projet est mis à disposition sous licence MIT.
