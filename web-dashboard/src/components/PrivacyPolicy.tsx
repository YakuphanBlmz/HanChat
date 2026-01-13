import { X } from 'lucide-react';

interface PrivacyPolicyProps {
    onClose: () => void;
}

export function PrivacyPolicy({ onClose }: PrivacyPolicyProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Gizlilik Politikası</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Son Güncelleme: 13.01.2026</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="overflow-y-auto p-6 space-y-6 text-gray-600 text-xs leading-relaxed font-sans text-justify">

                    {/* 1. Giriş */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">1. Giriş ve Kapsam</h3>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>HanChat ("Platform" veya "Geliştirici"), kullanıcılarının ("Kullanıcı" veya "Siz") gizliliğini korumayı en temel ilke olarak kabul etmiştir.</li>
                            <li>Bu politika, <a href="https://han-chat.vercel.app/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">https://han-chat.vercel.app/</a> web sitesi ve ilgili hizmetler üzerinden toplanan verilerin işlenme esaslarını düzenler.</li>
                            <li>Hizmetlerimizi kullanarak, verilerinizin bu politikada belirtilen şekillerde işlenmesine rıza göstermiş olursunuz.</li>
                        </ul>
                    </section>

                    {/* 2. Toplanan Veriler */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">2. Toplanan Veri Kategorileri</h3>
                        <p className="mb-1">Platform kullanımı sırasında aşağıdaki veriler işlenebilmektedir:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li><span className="font-semibold">Kimlik ve İletişim Verileri:</span> Ad, soyad, e-posta adresi.</li>
                            <li><span className="font-semibold">Kullanıcı İçeriği:</span> Analiz edilmek üzere sisteme yüklenen WhatsApp sohbet dökümleri (.txt dosyaları).</li>
                            <li><span className="font-semibold">Teknik İşlem Verileri:</span> IP adresi, tarayıcı bilgileri, işletim sistemi sürümü, site içi hareketler ve işlem günlükleri (log kayıtları).</li>
                            <li><span className="font-semibold">Analiz Sonuçları:</span> Yüklenen dosyalardan üretilen istatistiksel veriler (kelime sayıları, mesajlaşma saatleri vb.).</li>
                        </ul>
                    </section>

                    {/* 3. Veri Kullanım Amaçları */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">3. Verilerin İşlenme Amaçları</h3>
                        <p className="mb-1">Toplanan veriler, aşağıdaki amaçlarla sınırlı olarak işlenmektedir:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Kullanıcı tarafından talep edilen sohbet analizlerinin gerçekleştirilmesi ve raporlanması.</li>
                            <li>Platformun güvenliğinin sağlanması ve kötüye kullanımın önlenmesi.</li>
                            <li>Teknik destek taleplerinin karşılanması ve hataların giderilmesi.</li>
                            <li>Hizmet kalitesinin ölçülmesi ve kullanıcı deneyiminin iyileştirilmesi.</li>
                            <li>Yasal yükümlülüklerin yerine getirilmesi (log tutma vb.).</li>
                        </ul>
                    </section>

                    {/* 4. Veri Güvenliği ve Sohbet Gizliliği */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">4. Veri Güvenliği ve Sohbet Gizliliği</h3>
                        <div className="bg-gray-50 p-3 border border-gray-100 rounded">
                            <ul className="list-disc pl-4 space-y-2">
                                <li><span className="font-bold">Geçici İşleme Prensibi:</span> Yüklenen sohbet dosyaları, analiz işlemi tamamlandıktan hemen sonra (RAM üzerinden) silinir. Kalıcı veritabanlarına kaydedilmez.</li>
                                <li><span className="font-bold">Şifreleme:</span> Veri transferleri SSL/TLS protokolleri ile şifrelenerek gerçekleştirilir.</li>
                                <li><span className="font-bold">Erişim Kısıtlaması:</span> Kullanıcı verilerine sadece yetkili teknik personel, yalnızca zorunlu hallerde (teknik sorun çözümü vb.) erişebilir.</li>
                            </ul>
                        </div>
                    </section>

                    {/* 5. Veri Paylaşımı */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">5. Veri Paylaşımı ve Üçüncü Taraflar</h3>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Kişisel verileriniz, pazarlama veya reklam amacıyla üçüncü taraflarla kesinlikle paylaşılmamaktadır.</li>
                            <li>Sadece yasal bir zorunluluk (mahkeme kararı vb.) olması durumunda ilgili resmi makamlarla paylaşılabilir.</li>
                            <li>Altyapı sağlayıcıları (sunucu hizmetleri) ile yapılan sözleşmelerde veri gizliliği esas alınır.</li>
                        </ul>
                    </section>

                    {/* 6. Çerezler */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">6. Çerez (Cookie) Kullanımı</h3>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Sitemizde oturum güvenliğini sağlamak ve tercihlerinizi hatırlamak için zorunlu çerezler kullanılmaktadır.</li>
                            <li>Analitik çerezler, site trafiğini anonim olarak ölçmek için kullanılabilir.</li>
                            <li>Tarayıcı ayarlarınızdan çerezleri dilediğiniz zaman engelleyebilirsiniz.</li>
                        </ul>
                    </section>

                    {/* 7. Haklarınız */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">7. Kullanıcı Hakları</h3>
                        <p className="mb-1">KVKK ve ilgili mevzuatlar uyarınca haklarınız:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
                            <li>İşlenen veriler hakkında bilgi talep etme,</li>
                            <li>Verilerin düzeltilmesini veya silinmesini isteme,</li>
                            <li>Veri işlemeye itiraz etme hakkına sahipsiniz.</li>
                        </ul>
                    </section>

                    {/* 8. İletişim */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">8. İletişim</h3>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Bu politika veya verilerinizle ilgili her türlü sorunuz için bizimle iletişime geçebilirsiniz.</li>
                            <li><strong>E-posta:</strong> hanwhatschat@gmail.com</li>
                        </ul>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-400 text-center flex-shrink-0">
                    HanChat Yazılım ve Teknoloji Hizmetleri © 2026
                </div>
            </div>
        </div>
    );
}
