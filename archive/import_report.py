import json
import os
import zipfile

def main():
    print("=== WhatsApp Hesap Bilgileri Raporu İçe Aktarıcı ===")
    print("NOT: WhatsApp'ın 'Hesap Bilgilerini Talep Et' raporu genellikle mesaj içeriklerini BARINDIRMAZ.")
    print("Sadece grup isimleri, ayarlar, profil fotosu vb. teknik verileri içerir.")
    print("Yine de bu verileri analiz etmek isterseniz devam edebilirsiniz.")
    
    file_path = input("\nRapor dosyasının yolu (zip veya json): ").strip().strip('"')
    
    if not os.path.exists(file_path):
        print("Dosya bulunamadı.")
        return

    try:
        data = None
        
        # Handle ZIP
        if file_path.endswith('.zip'):
            with zipfile.ZipFile(file_path, 'r') as z:
                # Look for access.json or similar
                for name in z.namelist():
                    if name.endswith('.json'):
                        with z.open(name) as f:
                            data = json.load(f)
                            print(f"JSON okundu: {name}")
                            break
        # Handle JSON
        elif file_path.endswith('.json'):
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        
        if not data:
            print("Geçerli bir veri bulunamadı.")
            return
            
        # Basic Analysis of the Report
        print("\n--- Rapor Özeti ---")
        
        # This structure varies, but usually has 'connections', 'groups', etc.
        if 'connections' in data:
            print(f"Bağlantılar: {len(data.get('connections', []))}")
            
        if 'groups' in data:
            print(f"Gruplar: {len(data.get('groups', []))}")
            print("Grup İsimleri:")
            for g in data.get('groups', [])[:10]:
                print(f"  - {g.get('subject', 'Bilinmeyen')}")
                
        # ... Add more parsing as needed
        
        print("\nBu raporda maalesef mesaj içerikleri bulunmamaktadır.")
        print("Mesajlar için 'full_scrape.py' veya 'import_data.py' kullanmalısınız.")

    except Exception as e:
        print(f"Hata: {e}")

if __name__ == "__main__":
    main()
