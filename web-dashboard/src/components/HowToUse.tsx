
import { X, Smartphone, Apple, Monitor } from 'lucide-react';
import { useState } from 'react';

interface HowToUseProps {
    onClose: () => void;
}

export function HowToUse({ onClose }: HowToUseProps) {
    const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>('android');

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Nasıl Kullanılır?</h2>
                        <p className="text-gray-500 text-sm mt-1">WhatsApp sohbetlerinizi nasıl dışarı aktarabilirsiniz?</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('android')}
                        className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'android' ? 'text-green-600 bg-green-50/50' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        {/* Custom Android Icon replacement or generic Smartphone */}
                        <Smartphone size={18} /> Android
                        {activeTab === 'android' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('ios')}
                        className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'ios' ? 'text-gray-900 bg-gray-50/50' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <Apple size={18} /> iPhone (iOS)
                        {activeTab === 'ios' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('desktop')}
                        className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'desktop' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <Monitor size={18} /> Bilgisayar
                        {activeTab === 'desktop' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {activeTab === 'android' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold flex-shrink-0">1</div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Sohbeti Açın</h3>
                                    <p className="text-gray-600 text-sm">Analiz etmek istediğiniz WhatsApp sohbetine veya grubuna girin.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold flex-shrink-0">2</div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Seçenekleri Açın (⋮)</h3>
                                    <p className="text-gray-600 text-sm">Sağ üst köşedeki üç noktaya dokunun ve <strong>"Diğer"</strong> seçeneğini seçin.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold flex-shrink-0">3</div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Sohbeti Dışa Aktar</h3>
                                    <p className="text-gray-600 text-sm"><strong>"Sohbeti dışa aktar"</strong> seçeneğine tıklayın.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold flex-shrink-0">4</div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Medyasız Seçin</h3>
                                    <p className="text-gray-600 text-sm">Karşınıza çıkan soruda <strong>"Medyasız"</strong> seçeneğini işaretleyin. (Medya analizi şu an desteklenmiyor)</p>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-700">
                                💡 <strong>İpucu:</strong> Oluşan `.zip` dosyasını veya içindeki `.txt` dosyasını HanChat'e yükleyebilirsiniz.
                            </div>
                        </div>
                    )}

                    {activeTab === 'ios' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center font-bold flex-shrink-0">1</div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Sohbet Ayarlarına Girin</h3>
                                    <p className="text-gray-600 text-sm">Sohbetin içindeyken üstteki <strong>Kişi İsmine / Grup İsmine</strong> dokunun.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center font-bold flex-shrink-0">2</div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Aşağı Kaydırın</h3>
                                    <p className="text-gray-600 text-sm">Sayfanın en altına doğru inin.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center font-bold flex-shrink-0">3</div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Sohbeti Dışa Aktar</h3>
                                    <p className="text-gray-600 text-sm"><strong>"Sohbeti Dışa Aktar"</strong> seçeneğine dokunun.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center font-bold flex-shrink-0">4</div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Medyasız</h3>
                                    <p className="text-gray-600 text-sm"><strong>"Medya Ekleme"</strong> seçeneğini seçin.</p>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-700">
                                💡 <strong>İpucu:</strong> iPhone'da oluşan `.zip` dosyasını "Dosyalara Kaydet" diyerek kaydedip, HanChat'e yükleyebilirsiniz.
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors shadow-lg shadow-gray-200"
                    >
                        Anladım, Başlayalım
                    </button>
                </div>
            </div>
        </div>
    );
}
