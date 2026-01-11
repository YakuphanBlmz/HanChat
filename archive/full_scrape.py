from src.scraper import WhatsAppScraper
from src.database import DatabaseManager
import time

def main():
    print("=== WIA-Bot: Tam Tarama Modu ===")
    print("Bu mod, sol taraftaki sohbet listesini gezerek tüm konuşmaları kaydeder.")
    print("Lütfen WhatsApp Web'e giriş yapın ve bekleyin.")
    
    db = DatabaseManager()
    bot = WhatsAppScraper()
    
    try:
        bot.load_whatsapp()
        input("WhatsApp hazır olduğunda ENTER'a basın...")
        
        print("Tarama başlıyor...")
        print("Her sohbetten son 400 mesaj çekilecek...")
        
        def save_msg(msg):
            # Returns True if new, False if duplicate
            return db.save_message(msg)
            
        # Deep scrape False, but limit increased to 400
        bot.scrape_all_chats(save_callback=save_msg, deep_scrape=False, limit_per_chat=400)
        
        print("\n✅ Tam tarama tamamlandı!")
        
    except Exception as e:
        print(f"Hata: {e}")
    finally:
        print("Kapatılıyor...")
        bot.close()

if __name__ == "__main__":
    main()
