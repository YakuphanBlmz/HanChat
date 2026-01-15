import os
import logging
import requests
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configuration
BREVO_API_KEY = os.getenv("BREVO_API_KEY")
BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"
MAIL_USERNAME = os.getenv("MAIL_USERNAME", "hanwhatschat@gmail.com")

def send_brevo_email(to_email: str, subject: str, html_content: str, sender_name: str = "HanChat"):
    """
    Sends an email using the Brevo (Sendinblue) REST API.
    """
    print(f"DEBUG: Entering send_brevo_email. To: {to_email}, Subject: {subject}")
    
    if not BREVO_API_KEY:
        print("DEBUG ERROR: BREVO_API_KEY is missing/empty!")
        logging.warning("BREVO_API_KEY is not set. Email will not be sent.")
        return False

    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }

    payload = {
        "sender": {"name": sender_name, "email": MAIL_USERNAME},
        "to": [{"email": to_email}],
        "subject": subject,
        "htmlContent": html_content
    }
    
    print(f"DEBUG: Sending POST to {BREVO_API_URL}...")

    try:
        response = requests.post(BREVO_API_URL, headers=headers, json=payload, timeout=10)
        print(f"DEBUG: Brevo Response Code: {response.status_code}")
        print(f"DEBUG: Brevo Response Body: {response.text}")
        
        if response.status_code in [201, 200]:
            logging.info(f"Email sent successfully to {to_email} via Brevo.")
            return True
        else:
            logging.error(f"Brevo API Error: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"DEBUG EXCEPTION: {e}")
        logging.error(f"Failed to connect to Brevo API: {e}")
        return False

def send_reset_email(to_email: str, reset_token: str):
    """
    Sends a password reset email via Brevo.
    """
    reset_link = f"https://hanchat.vercel.app/reset-password?token={reset_token}"
    
    subject = "HanChat Şifre Sıfırlama"
    body = f"""
    <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Şifre Sıfırlama Talebi</h2>
            <p>Hesabınız için şifre sıfırlama talebinde bulundunuz.</p>
            <p>Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:</p>
            <a href="{reset_link}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Şifremi Sıfırla</a>
            <p>Bu link 24 saat geçerlidir.</p>
        </body>
    </html>
    """
    
    return send_brevo_email(to_email, subject, body)

def send_contact_notification(name: str, surname: str, email: str, subject: str, message: str):
    """
    Sends a contact notification to the admin via Brevo.
    """
    
    # We send this email TO OURSELVES (Admin)
    to_email = MAIL_USERNAME 
    email_subject = f"HanChat İletişim: {subject} - {name} {surname}"
    
    body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2c3e50; text-align: center;">Yeni İletişim Mesajı</h2>
                
                <p><strong>Gönderen:</strong> {name} {surname}</p>
                <p><strong>E-Posta:</strong> {email}</p>
                <p><strong>Konu:</strong> {subject}</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0; font-style: italic;">"{message}"</p>
                </div>
                
                <p style="font-size: 12px; color: #888;">Bu mesaj Brevo API kullanılarak gönderilmiştir.</p>
            </div>
        </body>
    </html>
    """
    
    return send_brevo_email(to_email, email_subject, body, sender_name="HanChat Contact Form")
