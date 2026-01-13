export function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
            <div className="bg-white p-8 md:p-16 shadow-sm border border-gray-200">
                {/* Header */}
                <div className="border-b border-gray-200 pb-8 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">GİZLİLİK POLİTİKASI</h1>
                    <p className="text-gray-500 text-sm uppercase tracking-wide">Son Güncelleme: 13 Ocak 2026</p>
                </div>

                {/* Content */}
                <div className="space-y-8 text-gray-800 leading-relaxed font-serif text-lg">
                    {/* Introduction */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-3">1. Genel Bakış</h2>
                        <p>
                            HanChat ("Platform", "Biz"), kullanıcılarımızın ("Siz") gizliliğine ve veri güvenliğine büyük önem vermektedir.
                            Bu Gizlilik Politikası, WhatsApp sohbet analiz hizmetlerimizi kullanırken verilerinizin nasıl toplandığını,
                            kullanıldığını ve korunduğunu açıklamaktadır. Hizmetlerimizi kullanarak bu politikayı kabul etmiş sayılırsınız.
                        </p>
                    </section>

                    {/* Data Collection */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-3">2. Toplanan Veriler</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><span className="font-semibold">WhatsApp Sohbet Dosyaları:</span> Analiz için yüklediğiniz .txt formatındaki sohbet geçmişleri.</li>
                            <li><span className="font-semibold">İletişim Bilgileri:</span> Kayıt olurken veya iletişim formunu kullanırken sağladığınız e-posta adresi ve isim.</li>
                            <li><span className="font-semibold">Kullanım Verileri:</span> Tarayıcı tipi, işlem süreleri ve hata raporları gibi teknik veriler.</li>
                        </ul>
                    </section>

                    {/* Data Usage */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-3">3. Verilerin Kullanımı</h2>
                        <p className="mb-3">Toplanan veriler yalnızca aşağıdaki amaçlarla kullanılır:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Sohbet analizlerini (duygu durumu, kelime sıklığı, vb.) gerçekleştirmek.</li>
                            <li>Hizmet kalitesini artırmak ve teknik sorunları gidermek.</li>
                            <li>Size özel raporlar ve istatistikler oluşturmak.</li>
                            <li>Yasal yükümlülükleri yerine getirmek.</li>
                        </ul>
                    </section>

                    {/* Data Security */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-3">4. Veri Güvenliği ve Saklama</h2>
                        <div className="bg-gray-50 p-4 border-l-4 border-gray-900 text-base">
                            <p className="mb-2">
                                <span className="font-semibold">Otomatik Silinme:</span> Yüklediğiniz sohbet dosyaları, analiz işlemi tamamlandıktan hemen sonra sunucularımızdan
                                otomatik olarak silinmektedir. Sohbet içerikleriniz kalıcı olarak depolanmaz.
                            </p>
                            <p>
                                Verileriniz endüstri standardı şifreleme yöntemleri (SSL/TLS) ile korunmaktadır.
                            </p>
                        </div>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-3">5. İletişim</h2>
                        <p>
                            Gizlilikle ilgili her türlü sorunuz için: <br />
                            <a href="mailto:hanwhatschat@gmail.com" className="text-gray-900 underline hover:text-gray-600 font-medium">hanwhatschat@gmail.com</a>
                        </p>
                    </section>

                    {/* Footer Note */}
                    <div className="pt-8 mt-12 border-t border-gray-100 text-center text-sm text-gray-400">
                        HanChat Analiz Platformu © 2026
                    </div>
                </div>
            </div>
        </div>
    );
}
