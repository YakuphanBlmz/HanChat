import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

# Configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
MAIL_USERNAME = os.getenv("MAIL_USERNAME", "kullanici@gmail.com")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "")

def send_reset_email(to_email: str, reset_token: str):
    """
    Sends a password reset email containing a reset link.
    In a real app, the link would point to the frontend URL.
    """
    if not MAIL_PASSWORD:
        logging.warning("MAIL_PASSWORD is not set. Email will not be sent.")
        return False

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)

        msg = MIMEMultipart()
        msg['From'] = MAIL_USERNAME
        msg['To'] = to_email
        msg['Subject'] = "HanChat - Şifre Sıfırlama İsteği"

        # Link construction (assuming frontend is at localhost for now, or use an env var for frontend url)
        # We'll use a simple approach: if running in docker-compose, localhost is fine for browser access.
        # The frontend path for reset will handle the query param.
        reset_link = f"http://localhost/reset-password?token={reset_token}"

        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #2c3e50; text-align: center;">Merhaba,</h2>
                    
                    <p>Görünüşe göre <strong>HanChat</strong> hesabına giriş yapmakta biraz zorlandın. Merak etme, bu herkesin başına gelebilir! 😅</p>
                    
                    <p>Hesabına tekrar erişebilmen için sana özel bir bağlantı oluşturduk. Aşağıdaki butona tıklayarak yeni şifreni hemen belirleyebilirsin:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{reset_link}" style="background-color: #3498db; color: white; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);">
                            🔐 Şifremi Yenile
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #7f8c8d;">
                        Güvenliğin için bu bağlantının geçerlilik süresi <strong>24 saattir</strong>. Bu talebi sen oluşturmadıysan, bu e-postayı görmezden gelebilirsin. Hesabın güvende kalmaya devam edecek.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    
                    <p style="text-align: center; font-size: 12px; color: #95a5a6;">
                        Sevgiler,<br/>
                        <strong>HanChat Ekibi</strong> 🚀
                    </p>
                </div>
            </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        server.send_message(msg)
        server.quit()
        logging.info(f"Password reset email sent to {to_email}")
        return True
    except Exception as e:
        logging.error(f"Failed to send email: {e}")
        return False

def send_contact_notification(name: str, surname: str, email: str, subject: str, message: str):
    """
    Sends a notification to the admin when a new contact message is received.
    """
    if not MAIL_PASSWORD:
        logging.warning("MAIL_PASSWORD is not set. Contact email will not be sent.")
        return False

    try:
        print(f"EMAIL DEBUG: Connecting to {SMTP_SERVER}:{SMTP_PORT}...")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        
        print(f"EMAIL DEBUG: Logging in as {MAIL_USERNAME}...")
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        print("EMAIL DEBUG: Login successful.")

        msg = MIMEMultipart()
        msg['From'] = MAIL_USERNAME
        msg['To'] = MAIL_USERNAME # Send to admin (self)
        msg['Subject'] = f"HanChat İletişim: {subject} - {name} {surname}"
        msg['Reply-To'] = email

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
                </div>
            </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        print("EMAIL DEBUG: Sending message...")
        server.send_message(msg)
        server.quit()
        print(f"EMAIL DEBUG: Contact notification SENT from {email}")
        logging.info(f"Contact notification sent from {email}")
        return True
    except Exception as e:
        print(f"EMAIL DEBUG ERROR: {str(e)}")
        logging.error(f"Failed to send contact notification: {e}")
        return False
