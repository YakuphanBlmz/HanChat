from src.scraper import WhatsAppScraper
from src.database import DatabaseManager
from src.analyzer import ChatAnalyzer
import time

def main():
    print("=== WhatsApp Intelligence & Automation Bot (WIA-Bot) ===")
    
    while True:
        print("\nSeçenekler:")
        print("1. Veri Çek (Scrape)")
        print("2. Analiz Et (Analyze)")
        print("3. Çıkış")
        
        choice = input("Seçiminiz (1/2/3): ")
        
        if choice == '1':
            run_scraper()
        elif choice == '2':
            run_analyzer()
        elif choice == '3':
            print("Çıkış yapılıyor...")
            break
        else:
            print("Geçersiz seçim.")

def run_scraper():
    db = DatabaseManager()
    bot = WhatsAppScraper()
    
    try:
        bot.load_whatsapp()
        print("WhatsApp yüklendi.")
        
        contact_name = input("Analiz edilecek kişi/grup adı: ")
        if bot.open_chat(contact_name):
            print(f"{contact_name} sohbeti açıldı.")
            
            # Ask for Deep Scan
            print("\nSeçenekler:")
            print("1. Hızlı Tarama (Son mesajlar)")
            print("2. Derin Tarama (Tüm Geçmiş - Uzun sürer)")
            scan_choice = input("Seçiminiz (1/2): ")
            
            if scan_choice == '2':
                # Recursive Scrape (Iterative)
                messages = bot.recursive_scrape(limit=None)
            else:
                print("Geçmiş mesajlar yükleniyor (Kısa Scroll)...")
                bot.scroll_up(num_scrolls=5)
                print("Mesajlar çekiliyor...")
                messages = bot.scrape_visible_messages(limit=100)
            
            print(f"{len(messages)} mesaj bulundu.")
            
            for msg in messages:
                db.save_message(msg)
                
            print("Veriler kaydedildi.")
        else:
            print("Sohbet açılamadı.")
            
    except Exception as e:
        print(f"Hata: {e}")
    finally:
        bot.close()

def run_analyzer():
    analyzer = ChatAnalyzer()
    print("Veriler yükleniyor...")
    
    if analyzer.load_data():
        stats = analyzer.get_basic_stats()
        print("\n--- TEMEL İSTATİSTİKLER ---")
        print(f"Toplam Mesaj: {stats['total_messages']}")
        print(f"En Aktif Gün: {stats['most_active_day']}")
        print("Gönderici Dağılımı:")
        for sender, count in stats['senders'].items():
            print(f"  - {sender}: {count}")
            
        print("\n--- EN ÇOK KULLANILAN KELİMELER ---")
        top_words = analyzer.get_top_words(limit=10)
        for word, count in top_words:
            print(f"  {word}: {count}")
            
        print("\n--- EMOJİ ANALİZİ ---")
        top_emojis = analyzer.get_emoji_stats(limit=5)
        for char, count in top_emojis:
            print(f"  {char}: {count}")
            
    else:
        print("Analiz edilecek veri bulunamadı.")

if __name__ == "__main__":
    main()
