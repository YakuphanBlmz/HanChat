import { Shield, Lock, Eye, FileText, Server, AlertCircle } from 'lucide-react';

export function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 text-slate-300">
            <div className="text-center mb-12">
                <Shield className="w-16 h-16 text-[#ADE0E1] mx-auto mb-4" />
                <h1 className="text-4xl font-bold text-white mb-4">Gizlilik Politikası</h1>
                <p className="text-slate-400">Son Güncelleme: 13 Ocak 2026</p>
            </div>

            <div className="space-y-12">
                {/* Introduction */}
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <FileText className="text-blue-500" />
                        1. Genel Bakış
                    </h2>
                    <p className="leading-relaxed">
                        HanChat ("Platform", "Biz"), kullanıcılarımızın ("Siz") gizliliğine ve veri güvenliğine büyük önem vermektedir.
                        Bu Gizlilik Politikası, WhatsApp sohbet analiz hizmetlerimizi kullanırken verilerinizin nasıl toplandığını,
                        kullanıldığını ve korunduğunu açıklamaktadır. Hizmetlerimizi kullanarak bu politikayı kabul etmiş sayılırsınız.
                    </p>
                </section>

                {/* Data Collection */}
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <Eye className="text-purple-500" />
                        2. Toplanan Veriler
                    </h2>
                    <ul className="list-disc leading-relaxed pl-5 space-y-2">
                        <li><strong>WhatsApp Sohbet Dosyaları:</strong> Analiz için yüklediğiniz .txt formatındaki sohbet geçmişleri.</li>
                        <li><strong>İletişim Bilgileri:</strong> Kayıt olurken veya iletişim formunu kullanırken sağladığınız e-posta adresi ve isim.</li>
                        <li><strong>Kullanım Verileri:</strong> Tarayıcı tipi, işlem süreleri ve hata raporları gibi teknik veriler.</li>
                    </ul>
                </section>

                {/* Data Usage */}
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <Server className="text-green-500" />
                        3. Verilerin Kullanımı
                    </h2>
                    <p className="leading-relaxed mb-4">
                        Toplanan veriler yalnızca aşağıdaki amaçlarla kullanılır:
                    </p>
                    <ul className="list-disc leading-relaxed pl-5 space-y-2">
                        <li>Sohbet analizlerini (duygu durumu, kelime sıklığı, vb.) gerçekleştirmek.</li>
                        <li>Hizmet kalitesini artırmak ve teknik sorunları gidermek.</li>
                        <li>Size özel raporlar ve istatistikler oluşturmak.</li>
                        <li>Yasal yükümlülükleri yerine getirmek.</li>
                    </ul>
                </section>

                {/* Data Security & Retention */}
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <Lock className="text-red-500" />
                        4. Veri Güvenliği ve Saklama
                    </h2>
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <p className="leading-relaxed mb-4">
                            <strong>Analiz Dosyaları:</strong> Yüklediğiniz sohbet dosyaları, analiz işlemi tamamlandıktan hemen sonra sunucularımızdan
                            <span className="text-red-400 font-bold"> otomatik olarak silinmektedir</span>. Sohbet içerikleriniz kalıcı olarak
                            depolanmaz, üçüncü şahıslarla paylaşılmaz veya reklam amacıyla kullanılmaz.
                        </p>
                        <p className="leading-relaxed">
                            Verileriniz endüstri standardı şifreleme yöntemleri (SSL/TLS) ile korunmaktadır. Ancak, internet üzerinden
                            yapılan hiçbir veri iletiminin %100 güvenli olmadığını hatırlatırız.
                        </p>
                    </div>
                </section>

                {/* User Rights */}
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="text-yellow-500" />
                        5. Haklarınız
                    </h2>
                    <p className="leading-relaxed">
                        Kullanıcı olarak; verilerinize erişme, düzeltme talep etme, silinmesini isteme ve veri işlemeye itiraz etme
                        hakkına sahipsiniz. Bu talepleriniz için <a href="mailto:hanwhatschat@gmail.com" className="text-blue-400 hover:text-blue-300 underline">hanwhatschat@gmail.com</a> adresinden
                        bizimle iletişime geçebilirsiniz.
                    </p>
                </section>
            </div>
        </div>
    );
}
