# pdf_utils.py

from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader

def generate_pdf_with_logo(output_filename, logo_path, first_name, last_name, login_name, password):
    pdf = canvas.Canvas(output_filename, pagesize=A4)
    width, height = A4

    # Charger le logo
    logo = ImageReader(logo_path)
    logo_width_cm = 4.0
    logo_height_cm = 4.0
    logo_width_pt = logo_width_cm * cm
    logo_height_pt = logo_height_cm * cm

    x_logo = 2 * cm
    y_logo = height - 2 * cm - logo_height_pt

    pdf.drawImage(logo, x_logo, y_logo, width=logo_width_pt, height=logo_height_pt, preserveAspectRatio=True, mask='auto')

    # Titre
    text_start_y = y_logo - 1.5 * cm
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(2 * cm, text_start_y, "Création de compte")

    # Contenu
    content_start_y = text_start_y - 2 * cm
    line_height = 0.7 * cm
    pdf.setFont("Helvetica", 12)

    pdf.drawString(2 * cm, content_start_y, "Nom :")
    pdf.drawString(2 * cm, content_start_y - line_height, "Prénom :")
    pdf.drawString(2 * cm, content_start_y - 2 * line_height, "Identifiant :")
    pdf.drawString(2 * cm, content_start_y - 3 * line_height, "Mot de passe :")

    x_value = 6 * cm
    pdf.drawString(x_value, content_start_y, last_name)
    pdf.drawString(x_value, content_start_y - line_height, first_name)
    pdf.drawString(x_value, content_start_y - 2 * line_height, login_name)
    pdf.drawString(x_value, content_start_y - 3 * line_height, password)

    # Fermeture
    pdf.showPage()
    pdf.save()
