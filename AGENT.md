# PROJECT: WhatsApp Personal Insight & Monitoring System (WPIMS)

## 1. MEMORY BANK & USER CONTEXT

**Bu bölüm projenin kalbidir. Her kodlama oturumunda buradaki hedefler hatırlanmalıdır.**

### 1.1. Kullanıcı Profili: Yakuphan

* **Kimlik:** Yazılım ve Veri odaklı bir mühendis.
* **Beklenti:** "Kurumsal" veya "Akademik" terimlerden (KPI, Churn, Process Mining vb.) arındırılmış, **insani ve psikolojik** çıktılar.
* **Proje Amacı:**
  1. **Ayna (Self-Reflection):** "Ben kimim? Nasıl konuşuyorum? Agresif miyim, neşeli miyim? Hangi kelimelere takıntılıyım?" sorularına veriyle cevap vermek.
  2. **Gözlem Kulesi (Monitoring):** Arkadaşların çevrimiçi olma alışkanlıklarını yakalamak ve seçilen kişilerle olan ilişki derinliğini analiz etmek.
  3. **Görsellik:** Terminal çıktıları değil; **Grafikler, Isı Haritaları (Heatmaps), Kelime Bulutları ve İnteraktif Tablolar** içeren bir Dashboard.

## 2. FUNCTIONAL REQUIREMENTS (Özellikler)

### A. Kendini Tanı (Self-Analysis) Module

Bu modül, kullanıcının (Yakuphan) tüm sohbet geçmişini tarayarak şunları çıkarmalıdır:

1. **Kişilik & Ton Analizi:**
   * "Genelde resmi mi yoksa samimi mi konuşuyorum?"
   * "Agresiflik veya sabırsızlık belirtilerim var mı?" (Sentiment Analysis).

2. **Davranışsal Metrikler:**
   * **Zaman Haritası:** "Günün hangi saatlerinde 'çenebazım', hangi saatlerde sessizim?" (Heatmap).
   * **Kelime Takıntıları:** En çok kullanılan kelimeler, emojiler ve kalıplar (WordCloud).
   * **Yanıt Hızı:** "Mesajlara ne kadar sürede dönüyorum?"

### B. Arkadaş Analizi & Takip (Contact Monitoring) Module

Seçilen belirli kişiler (Target List) için özelleşmiş analizler:

1. **Online Tracker (Casus Modu):**
   * Hedef kişi ne zaman çevrimiçi oldu?
   * Ne kadar süre çevrimiçi kaldı?
   * Bu veriyi zaman çizelgesinde (Timeline) görselleştir.

2. **İlişki Derinliği:**
   * "X kişisiyle konuşmalarımız daha çok 'bilgi alışverişi' mi yoksa 'geyik' mi?"
   * O kişiyle ortak kullanılan kelimeler neler?

3. **Manuel Profilleme:**
   * Kullanıcının o kişi hakkında girdiği notları (örn: "Çabuk alınır", "Sabahları huysuzdur") analizlere entegre etme.

### C. Otomasyon (Automation) Module

* **Zamanlı Mesaj:** Belirlenen tarihte/saatte otomatik mesaj gönderme.
* **Toplu Mesaj (Özelleştirilmiş):** Seçilen listeye isme özel (f-string) mesajlar atma.

## 3. TECHNICAL ARCHITECTURE & STACK

### 3.1. Tech Stack

* **Core:** Python 3.10+
* **Veri Toplama (Scraping):** `Selenium` (WhatsApp Web DOM manipülasyonu için).
* **Veri İşleme:** `Pandas` (Dataframe manipülasyonu), `NLTK` veya `Spacy` (NLP işlemleri için).
* **Görselleştirme (UI):** **`Streamlit`** (Bu proje için zorunludur. Hızlı ve interaktif dashboard için).
* **Grafikler:** `Plotly` veya `Altair` (İnteraktif grafikler için).
* **Veritabanı:** `SQLite` (Yerel ve hafif depolama için).

### 3.2. Project Structure

text
📂 WPIMS/
├── 📂 data/               # SQLite db ve ham loglar
├── 📂 src/
│   ├── driver.py         # Selenium WebDriver yönetimi
│   ├── scraper.py        # Mesajları ve Online durumunu çeken modül
│   ├── analyzer.py       # İstatistik, NLP ve Kişilik analizi motoru
│   ├── automation.py     # Mesaj gönderme ve zamanlayıcı
│   └── models.py         # Veritabanı modelleri
├── dashboard.py          # Streamlit arayüz kodları (MAIN ENTRY POINT)
├── requirements.txt
└── AGENT.md              # Context File

## 4. VISUALIZATION GUIDELINES (Görselleştirme Kuralları)

AI Asistanı, Dashboard oluştururken şu kurallara uymalıdır:

### Ana Sayfa: Genel özet (Toplam mesaj, En aktif gün, Ruh hali ibresi).

### Sekme 1: Benim Dünyam:

Haftalık Aktivite Isı Haritası (GitHub contribution graph benzeri).

Duygu Durum Değişimi Grafiği (Zamanla neşeli/üzgün değişimi).

### Sekme 2: Arkadaşlar:

Kişi seçmeli Dropdown menü.

Seçilen kişinin "Online Olma" saatlerini gösteren Bar Chart.

İkiniz arasındaki mesajlaşma dengesini gösteren Pie Chart (Sen %60 - O %40).


## 5. DEVELOPMENT ROADMAP (Sıralı Görevler)

[ ] Phase 1: İskelet & Bağlantı: Selenium ile WhatsApp Web'i aç, QR login'i bir kere yap ve session'ı kaydet (user-data-dir kullanarak).

[ ] Phase 2: Veri Madencisi: Seçilen sohbetin geçmişini scroll ederek çeken ve SQLite'a kaydeden fonksiyonu yaz.

[ ] Phase 3: Analiz Motoru: Pandas ile veriyi temizle. NLP kütüphaneleri ile "Sentiment" ve "Kelime Frekansı" çıkar.

[ ] Phase 4: Dashboard (Streamlit): Veritabanından veriyi okuyup Plotly grafiklerine döken arayüzü hazırla.

[ ] Phase 5: Canlı Takip: Arka planda çalışıp "Online" yazısını yakalayan ve DB'ye loglayan "Daemon" modülünü ekle.