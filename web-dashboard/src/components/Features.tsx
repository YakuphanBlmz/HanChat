import { X, BarChart2, MessageSquare, Shield, Lock, Zap, Heart } from 'lucide-react';

interface FeaturesProps {
    onClose: () => void;
}

export function Features({ onClose }: FeaturesProps) {
    const features = [
        {
            icon: <BarChart2 className="w-8 h-8 text-blue-500" />,
            title: "Detaylı Analizler",
            description: "Sohbetlerinizin derinlemesine istatistiklerini çıkarın. Mesaj sayıları, en çok kullanılan kelimeler ve emoji analizleri parmaklarınızın ucunda."
        },
        {
            icon: <MessageSquare className="w-8 h-8 text-purple-500" />,
            title: "Duygu Durumu",
            description: "Yapay zeka destekli duygu analizi ile sohbetin genel modunu, pozitiflik ve negatiflik oranlarını keşfedin."
        },
        {
            icon: <Lock className="w-8 h-8 text-red-500" />,
            title: "Tam Gizlilik",
            description: "Verileriniz bizimle güvende. Sohbet dosyalarınız analiz edildikten hemen sonra sunucularımızdan otomatik olarak silinir."
        },
        {
            icon: <Zap className="w-8 h-8 text-yellow-500" />,
            title: "Hızlı Sonuçlar",
            description: "Saniyeler içinde binlerce mesajı işleyin ve görselleştirilmiş raporlara anında ulaşın."
        },
        {
            icon: <Shield className="w-8 h-8 text-green-500" />,
            title: "Ajan Modu",
            description: "Şüpheli davranışları ve gizli kalıpları tespit edin. Dedektif modu ile satır aralarını okuyun.",
            badge: "Yakında"
        },
        {
            icon: <Heart className="w-8 h-8 text-pink-500" />,
            title: "İlişki Uyumu",
            description: "Flört ve Aşk modu ile partnerinizle olan uyumunuzu test edin, iletişim dilinizi analiz edin.",
            badge: "Yakında"
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">HanChat Özellikleri</h2>
                        <p className="text-sm text-gray-500">Platformun size sunduğu imkanları keşfedin</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content - Scrollable Grid */}
                <div className="overflow-y-auto p-6 md:p-8 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 relative group">
                                <div className="flex-shrink-0 bg-gray-50 p-3 rounded-lg h-fit group-hover:bg-blue-50 transition-colors">
                                    {feature.icon}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-gray-900">{feature.title}</h3>
                                        {feature.badge && (
                                            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wide">
                                                {feature.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA Section */}
                    <div className="mt-8 md:mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 text-center">
                        <h3 className="font-bold text-gray-900 mb-2">Hemen Başlayın</h3>
                        <p className="text-sm text-gray-600 mb-4">Ücretsiz analiz araçlarımızı kullanarak sohbetlerinizi keşfetmeye başlayın.</p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                        >
                            Analize Dön
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
