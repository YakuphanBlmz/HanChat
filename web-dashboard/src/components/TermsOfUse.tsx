import { X } from 'lucide-react';

interface TermsOfUseProps {
    onClose: () => void;
}

export function TermsOfUse({ onClose }: TermsOfUseProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Kullanım Şartları</h2>
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

                    {/* 1. Kabul */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">1. Şartların Kabulü</h3>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Bu web sitesine erişerek ve HanChat hizmetlerini kullanarak, bu "Kullanım Şartları"nı, tüm geçerli yasaları ve düzenlemeleri kabul etmiş sayılırsınız.</li>
                            <li>Bu şartlardan herhangi birini kabul etmiyorsanız, siteyi kullanmamanız gerekmektedir.</li>
                        </ul>
                    </section>

                    {/* 2. Kullanım Lisansı */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">2. Kullanım Lisansı</h3>
                        <p className="mb-1">Platform size, hizmetleri yalnızca kişisel ve ticari olmayan geçici görüntüleme için kullanma izni verir:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Bu lisans bir hak devri değildir; sadece kullanım iznidir.</li>
                            <li>Materyalleri değiştiremez veya kopyalayamazsınız.</li>
                            <li>Materyalleri ticari amaçla veya halka açık herhangi bir teşhir için kullanamazsınız.</li>
                            <li>HanChat üzerindeki herhangi bir yazılımı tersine mühendislik işlemine tabi tutamazsınız.</li>
                        </ul>
                    </section>

                    {/* 3. Sorumluluk Reddi */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">3. Sorumluluk Reddi</h3>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>HanChat üzerindeki materyaller "olduğu gibi" sağlanmaktadır. Platform, zımni garantiler de dahil olmak üzere hiçbir garanti vermez.</li>
                            <li>Analiz sonuçları sadece bilgilendirme ve eğlence amaçlıdır; kesinlik veya hukuki geçerlilik taahhüt edilmez.</li>
                            <li>Oluşturulan psikolojik veya davranışsal analizlerin profesyonel bir tavsiye niteliği taşımadığını kabul edersiniz.</li>
                        </ul>
                    </section>

                    {/* 4. Sınırlamalar */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">4. Sınırlamalar</h3>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Platform veya tedarikçileri, sitenin kullanımından veya kullanılamamasından kaynaklanan herhangi bir zarardan (veri veya kar kaybı dahil) sorumlu tutulamaz.</li>
                            <li>WhatsApp verilerinizin analizi sırasında ortaya çıkabilecek yanlış yorumlamalardan platform sorumlu değildir.</li>
                        </ul>
                    </section>

                    {/* 5. Revizyonlar ve Hatalar */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">5. Revizyonlar</h3>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Web sitesinde yer alan materyaller teknik, tipografik veya fotoğrafik hatalar içerebilir.</li>
                            <li>HanChat, materyallerin doğru, eksiksiz veya güncel olduğunu garanti etmez ve dilediği zaman değişiklik yapabilir.</li>
                        </ul>
                    </section>

                    {/* 6. Bağlantılar */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">6. Dış Bağlantılar</h3>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>HanChat, web sitesine bağlı sitelerin tümünü incelememiştir ve bu sitelerin içeriğinden sorumlu değildir.</li>
                            <li>Herhangi bir bağlantının dahil edilmesi, sitenin HanChat tarafından onaylandığı anlamına gelmez.</li>
                        </ul>
                    </section>

                    {/* 7. Yönetim Hukuku */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">7. Geçerli Hukuk</h3>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Bu hüküm ve koşullar, Türkiye Cumhuriyeti yasalarına tabidir ve buna göre yorumlanır.</li>
                            <li>Herhangi bir uyuşmazlıkta İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.</li>
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
