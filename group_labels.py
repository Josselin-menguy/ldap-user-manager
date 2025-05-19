# group_labels.py

import logging

logger = logging.getLogger(__name__)

"""
Ce fichier contient un dictionnaire Python qui mappe chaque DN LDAP
vers un label plus lisible. À adapter selon vos groupes réels.
Aucune référence à une structure ou organisation spécifique.
"""

group_label_map = {
    # Exemples génériques
    "CN=RH,OU=DIFFUSION,OU=GROUPS,DC=example,DC=com": "Diffusion RH",
    "CN=IT,OU=DIFFUSION,OU=GROUPS,DC=example,DC=com": "Diffusion IT",
    "CN=COMM,OU=DIFFUSION,OU=GROUPS,DC=example,DC=com": "Diffusion Communication",
    "CN=_APP_A,OU=APPLICATIONS,OU=GROUPS,DC=example,DC=com": "Application A",
    "CN=_APP_B,OU=APPLICATIONS,OU=GROUPS,DC=example,DC=com": "Application B",
    "CN=_APP_C,OU=APPLICATIONS,OU=GROUPS,DC=example,DC=com": "Application C",
    # Ajoutez ici d'autres groupes génériques si besoin
}


def get_group_labels_from_dns(dn_list):
    """
    Convertit une liste (ou un set) de DN LDAP en une liste de labels conviviaux.
    Si un DN n'existe pas dans le dictionnaire, on renvoie le DN tel quel.
    """
    logger.debug("=== get_group_labels_from_dns ===")
    logger.debug(f"Liste de DN reçue : {dn_list}")

    labels = []
    for dn in dn_list:
        label = group_label_map.get(dn, dn)
        if label == dn:
            logger.debug(f"[group_labels] DN introuvable dans group_label_map => '{dn}' (fallback = DN)")
        else:
            logger.debug(f"[group_labels] DN matché : '{dn}' => Label : '{label}'")
        labels.append(label)

    logger.debug(f"Labels finaux : {labels}")
    logger.debug("=================================\n")
    return labels
