export function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
            <div className="bg-white p-8 md:p-16 shadow-sm border border-gray-200">
                {/* Header */}
                <div className="border-b border-gray-200 pb-8 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">GİZLİLİK VE VERİ KORUMA POLİTİKASI</h1>
                    <p className="text-gray-500 text-sm uppercase tracking-wide">Yürürlük Tarihi: 13 Ocak 2026</p>
                </div>

                {/* Content */}
                <div className="space-y-10 text-gray-800 leading-relaxed font-serif text-lg">

                    {/* 1. Giriş */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">1. Giriş ve Kapsam</h2>
                        <ul className="list-disc pl-5 space-y-3">
                            <li>HanChat ("Şirket", "Biz" veya "Platform"), kullanıcılarının ("Kullanıcı" veya "Siz") gizliliğini korumayı en temel ilke olarak kabul etmiştir.</li>
                            <li>Bu politika, www.hanchat.com web sitesi ve ilgili hizmetler üzerinden toplanan verilerin işlenme esaslarını düzenler.</li>
                            <li>Hizmetlerimizi kullanarak, verilerinizin bu politikada belirtilen şekillerde işlenmesine rıza göstermiş olursunuz.</li>
                        </ul>
                    </section>

                    {/* 2. Toplanan Veriler */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">2. Toplanan Veri Kategorileri</h2>
                        <p className="mb-3">Platform kullanımı sırasında aşağıdaki veriler işlenebilmektedir:</p>
                        <ul className="list-disc pl-5 space-y-3">
                            <li><span className="font-semibold">Kimlik ve İletişim Verileri:</span> Ad, soyad, e-posta adresi.</li>
                            <li><span className="font-semibold">Kullanıcı İçeriği:</span> Analiz edilmek üzere sisteme yüklenen WhatsApp sohbet dökümleri (.txt dosyaları).</li>
                            <li><span className="font-semibold">Teknik İşlem Verileri:</span> IP adresi, tarayıcı bilgileri, işletim sistemi sürümü, site içi hareketler ve işlem günlükleri (log kayıtları).</li>
                            <li><span className="font-semibold">Analiz Sonuçları:</span> Yüklenen dosyalardan üretilen istatistiksel veriler (kelime sayıları, mesajlaşma saatleri vb.).</li>
                        </ul>
                    </section>

                    {/* 3. Veri Kullanım Amaçları */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">3. Verilerin İşlenme Amaçları</h2>
                        <p className="mb-3">Toplanan veriler, aşağıdaki amaçlarla sınırlı olarak işlenmektedir:</p>
                        <ul className="list-disc pl-5 space-y-3">
                            <li>Kullanıcı tarafından talep edilen sohbet analizlerinin gerçekleştirilmesi ve raporlanması.</li>
                            <li>Platformun güvenliğinin sağlanması ve kötüye kullanımın önlenmesi.</li>
                            <li>Teknik destek taleplerinin karşılanması ve hataların giderilmesi.</li>
                            <li>Hizmet kalitesinin ölçülmesi ve kullanıcı deneyiminin iyileştirilmesi.</li>
                            <li>Yasal yükümlülüklerin yerine getirilmesi (log tutma vb.).</li>
                        </ul>
                    </section>

                    {/* 4. Veri Güvenliği ve Sohbet Gizliliği */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">4. Veri Güvenliği ve Sohbet Gizliliği</h2>
                        <div className="bg-gray-50 p-6 border border-gray-200">
                            <ul className="list-disc pl-5 space-y-4">
                                <li><span className="font-bold underline">Geçici İşleme Prensibi:</span> Yüklenen sohbet dosyaları, analiz işlemi tamamlandıktan hemen sonra (RAM üzerinden) silinir. Kalıcı veritabanlarına kaydedilmez.</li>
                                <li><span className="font-bold underline">Şifreleme:</span> Veri transferleri SSL/TLS protokolleri ile şifrelenerek gerçekleştirilir.</li>
                                <li><span className="font-bold underline">Erişim Kısıtlaması:</span> Kullanıcı verilerine sadece yetkili teknik personel, yalnızca zorunlu hallerde (teknik sorun çözümü vb.) erişebilir.</li>
                            </ul>
                        </div>
                    </section>

                    {/* 5. Veri Paylaşımı */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">5. Veri Paylaşımı ve Üçüncü Taraflar</h2>
                        <ul className="list-disc pl-5 space-y-3">
                            <li>Kişisel verileriniz, pazarlama veya reklam amacıyla üçüncü taraflarla kesinlikle paylaşılmamaktadır.</li>
                            <li>Sadece yasal bir zorunluluk (mahkeme kararı vb.) olması durumunda ilgili resmi makamlarla paylaşılabilir.</li>
                            <li>Altyapı sağlayıcıları (sunucu hizmetleri) ile yapılan sözleşmelerde veri gizliliği esas alınır.</li>
                        </ul>
                    </section>

                    {/* 6. Çerezler */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">6. Çerez (Cookie) Kullanımı</h2>
                        <ul className="list-disc pl-5 space-y-3">
                            <li>Sitemizde oturum güvenliğini sağlamak ve tercihlerinizi hatırlamak için zorunlu çerezler kullanılmaktadır.</li>
                            <li>Analitik çerezler, site trafiğini anonim olarak ölçmek için kullanılabilir.</li>
                            <li>Tarayıcı ayarlarınızdan çerezleri dilediğiniz zaman engelleyebilirsiniz.</li>
                        </ul>
                    </section>

                    {/* 7. Haklarınız */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">7. Kullanıcı Hakları</h2>
                        <p className="mb-3">KVKK ve ilgili mevzuatlar uyarınca haklarınız:</p>
                        <ul className="list-disc pl-5 space-y-3">
                            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
                            <li>İşlenen veriler hakkında bilgi talep etme,</li>
                            <li>Verilerin düzeltilmesini veya silinmesini isteme,</li>
                            <li>Veri işlemeye itiraz etme hakkına sahipsiniz.</li>
                        </ul>
                    </section>

                    {/* 8. İletişim */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">8. İletişim</h2>
                        <ul className="list-disc pl-5 space-y-3">
                            <li>Bu politika veya verilerinizle ilgili her türlü sorunuz için bizimle iletişime geçebilirsiniz.</li>
                            <li><strong>E-posta:</strong> hanwhatschat@gmail.com</li>
                            <li><strong>Adres:</strong> İstanbul, Türkiye</li>
                        </ul>
                    </section>

                    {/* Footer */}
                    <div className="pt-8 mt-12 border-t-2 border-gray-900 text-sm text-gray-500">
                        <p>HanChat Yazılım ve Teknoloji Hizmetleri</p>
                        <p>Bu belge en son 13.01.2026 tarihinde güncellenmiştir.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
