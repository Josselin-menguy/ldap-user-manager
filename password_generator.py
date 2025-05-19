# password_generator.py
import random
import string

def generate_password(length=12):
    """
    Génère un mot de passe aléatoire de 'length' caractères contenant au moins :
      - une majuscule,
      - une minuscule,
      - un chiffre,
      - un caractère spécial.
    """
    if length < 4:
        raise ValueError("La longueur minimale doit être de 4 caractères.")

    uppercase = string.ascii_uppercase
    lowercase = string.ascii_lowercase
    digits = string.digits
    special = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`"

    # Assurer au moins un caractère de chaque catégorie
    password_chars = [
        random.choice(uppercase),
        random.choice(lowercase),
        random.choice(digits),
        random.choice(special)
    ]
    combined = uppercase + lowercase + digits + special
    remaining_length = length - len(password_chars)
    password_chars.extend(random.choices(combined, k=remaining_length))
    random.shuffle(password_chars)
    return "".join(password_chars)
