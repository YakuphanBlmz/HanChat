import { Shield, Lock } from 'lucide-react';

export function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header Section */}
                <div className="bg-slate-900 px-8 py-12 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                    <Shield className="w-16 h-16 text-slate-200 mx-auto mb-6 opacity-90" strokeWidth={1.5} />
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Gizlilik Politikası</h1>
                    <p className="text-slate-400 font-medium">Son Güncelleme: 13 Ocak 2026</p>
                </div>

                {/* Content Section */}
                <div className="px-8 py-12 md:px-12 space-y-10 text-slate-700 leading-relaxed">
                    {/* Introduction */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">
                            1. Genel Bakış
                        </h2>
                        <p>
                            HanChat ("Platform", "Biz"), kullanıcılarımızın ("Siz") gizliliğine ve veri güvenliğine büyük önem vermektedir.
                            Bu Gizlilik Politikası, WhatsApp sohbet analiz hizmetlerimizi kullanırken verilerinizin nasıl toplandığını,
                            kullanıldığını ve korunduğunu açıklamaktadır. Hizmetlerimizi kullanarak bu politikayı kabul etmiş sayılırsınız.
                        </p>
                    </section>

                    {/* Data Collection */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">
                            2. Toplanan Veriler
                        </h2>
                        <ul className="list-disc pl-5 space-y-3 marker:text-slate-400">
                            <li><strong className="text-slate-900">WhatsApp Sohbet Dosyaları:</strong> Analiz için yüklediğiniz .txt formatındaki sohbet geçmişleri.</li>
                            <li><strong className="text-slate-900">İletişim Bilgileri:</strong> Kayıt olurken veya iletişim formunu kullanırken sağladığınız e-posta adresi ve isim.</li>
                            <li><strong className="text-slate-900">Kullanım Verileri:</strong> Tarayıcı tipi, işlem süreleri ve hata raporları gibi teknik veriler.</li>
                        </ul>
                    </section>

                    {/* Data Usage */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">
                            3. Verilerin Kullanımı
                        </h2>
                        <p className="mb-4">
                            Toplanan veriler yalnızca aşağıdaki amaçlarla kullanılır:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-slate-400">
                            <li>Sohbet analizlerini (duygu durumu, kelime sıklığı, vb.) gerçekleştirmek.</li>
                            <li>Hizmet kalitesini artırmak ve teknik sorunları gidermek.</li>
                            <li>Size özel raporlar ve istatistikler oluşturmak.</li>
                            <li>Yasal yükümlülükleri yerine getirmek.</li>
                        </ul>
                    </section>

                    {/* Data Security & Retention */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">
                            4. Veri Güvenliği ve Saklama
                        </h2>
                        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                            <div className="flex items-start gap-3">
                                <Lock className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                                <div className="space-y-4">
                                    <p>
                                        <strong className="text-slate-900">Otomatik Silinme:</strong> Yüklediğiniz sohbet dosyaları, analiz işlemi tamamlandıktan hemen sonra sunucularımızdan
                                        otomatik olarak silinmektedir. Sohbet içerikleriniz kalıcı olarak depolanmaz.
                                    </p>
                                    <p>
                                        Verileriniz endüstri standardı şifreleme yöntemleri (SSL/TLS) ile korunmaktadır.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* User Rights */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">
                            5. Haklarınız
                        </h2>
                        <p>
                            Kullanıcı olarak; verilerinize erişme, düzeltme talep etme, silinmesini isteme ve veri işlemeye itiraz etme
                            hakkına sahipsiniz. Bu talepleriniz için <a href="mailto:hanwhatschat@gmail.com" className="text-blue-600 hover:text-blue-800 font-medium underline decoration-blue-200 hover:decoration-blue-800 transition-all">hanwhatschat@gmail.com</a> adresinden
                            bizimle iletişime geçebilirsiniz.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
