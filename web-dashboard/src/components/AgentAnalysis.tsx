import { useState, type DragEvent } from 'react';
import { Upload, FileText, Moon, Heart, AlertTriangle, Search, Fingerprint, Globe, Siren } from 'lucide-react';
import { API_URL } from '../services/api';

export function AgentAnalysis() {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Ultimate Agent Inputs
    const [suspectName, setSuspectName] = useState("");
    const [instagram, setInstagram] = useState("");
    const [twitter, setTwitter] = useState("");
    const [linkedin, setLinkedin] = useState("");



    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.txt')) {
                setFile(droppedFile);
                setError(null);
            } else {
                setError("Lütfen sadece .txt dosyası yükleyin.");
            }
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Append Ultimate Params
            formData.append('name', suspectName || "Unknown Subject");
            if (instagram) formData.append('instagram', instagram);
            if (twitter) formData.append('twitter', twitter);
            if (linkedin) formData.append('linkedin', linkedin);

            const endpoint = (suspectName || instagram || twitter || linkedin)
                ? `${API_URL}/analyze/ultimate`
                : `${API_URL}/analyze/agent`;

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Analysis failed');
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Analiz operasyonu başarısız. Dosya veya sunucu hatası.");
        } finally {
            setLoading(false);
        }
    };



    const renderPersonAnalysis = (person: string, data: any) => {
        return (
            <div key={person} className="relative bg-[#f4f1ea] rounded-xl shadow-lg border-2 border-[#d3d0c9] overflow-hidden mb-12 p-8 font-mono">
                {/* Top Secret Stamp */}
                <div className="absolute top-4 right-4 border-4 border-red-700 text-red-700 font-black text-xl px-4 py-2 opacity-30 transform rotate-12 pointer-events-none select-none">
                    GİZLİ / CONFIDENTIAL
                </div>

                {/* Header */}
                <div className="flex items-center gap-6 border-b-2 border-[#d3d0c9] pb-6 mb-8">
                    <div className="w-20 h-20 bg-gray-800 rounded-md flex items-center justify-center text-[#f4f1ea] font-bold text-3xl shadow-md">
                        {person.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-wider uppercase">DOSYA: {person}</h2>
                        <div className="text-sm text-gray-600 mt-1 uppercase tracking-widest">Hedef Analiz Raporu</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Chat Intelligence */}
                    <div className="space-y-6">
                        {/* Sleep Intel */}
                        <div className="bg-[#fffdf9] p-4 rounded border border-[#d3d0c9] shadow-sm">
                            <h3 className="text-gray-800 font-bold flex items-center gap-2 mb-3 border-b border-gray-200 pb-2 uppercase text-sm tracking-wide">
                                <Moon size={16} /> Uyku İstihbaratı
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-gray-500 text-xs">Tahmini Uyku Aralığı</span>
                                    <span className="font-bold text-gray-800">{data.sleep_pattern.avg_bed} - {data.sleep_pattern.avg_wake}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-xs">Tutarlılık</span>
                                    <span className="font-bold text-gray-800">{data.sleep_pattern.consistency}</span>
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-600 italic border-l-2 border-indigo-200 pl-2">
                                "{data.sleep_pattern.report}"
                            </div>
                        </div>

                        {/* Interest & Tone */}
                        <div className="bg-[#fffdf9] p-4 rounded border border-[#d3d0c9] shadow-sm">
                            <h3 className="text-gray-800 font-bold flex items-center gap-2 mb-3 border-b border-gray-200 pb-2 uppercase text-sm tracking-wide">
                                <Heart size={16} /> Duygusal Profil
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-gray-500 text-xs">İlgi Seviyesi</span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full">
                                            <div className="h-2 bg-pink-600 rounded-full" style={{ width: `${data.interest.score}%` }} />
                                        </div>
                                        <span className="font-bold text-pink-700">{data.interest.level}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-xs">Duygu Durumu</span>
                                    <span className="font-bold text-indigo-700">{data.emotional_tone.tone}</span>
                                </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                                <div className="bg-gray-50 p-1.5 rounded text-center">Başlatma: %{data.interest.initiation_rate}</div>
                                <div className="bg-gray-50 p-1.5 rounded text-center">Cevap Hızı: {data.interest.stats.split('|')[1].split(':')[1]}</div>
                            </div>
                        </div>

                        {/* Psychological Analysis */}
                        <div className="bg-[#fffdf9] p-4 rounded border border-[#d3d0c9] shadow-sm">
                            <h3 className="text-gray-800 font-bold flex items-center gap-2 mb-3 border-b border-gray-200 pb-2 uppercase text-sm tracking-wide">
                                <AlertTriangle size={16} /> Davranış Analizi
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Pasif Agresiflik:</span>
                                    <span className={`font-bold ${data.passive_aggressive.score > 20 ? 'text-orange-600' : 'text-green-600'}`}>
                                        {data.passive_aggressive.level} (%{data.passive_aggressive.score})
                                    </span>
                                </div>
                                {data.passive_aggressive.examples.length > 0 && (
                                    <div className="text-xs italic text-gray-500 bg-gray-50 p-2 rounded">
                                        Son vukuat: "{data.passive_aggressive.examples[0]}"
                                    </div>
                                )}
                                <div className="flex justify-between border-t border-gray-100 pt-2">
                                    <span className="text-gray-600">Hayalet Riski:</span>
                                    <span className={`font-bold ${data.ghosting.risk_score > 40 ? 'text-red-600' : 'text-green-600'}`}>
                                        %{data.ghosting.risk_score}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Cross-Reference & Digital Identity */}
                    <div className="space-y-6">
                        {/* Digital Identity (OSINT) */}
                        {result.digital_identity && (
                            <div className="bg-gray-800 text-green-400 p-4 rounded border-2 border-gray-700 shadow-inner font-mono text-xs">
                                <h3 className="text-green-500 font-bold flex items-center gap-2 mb-3 border-b border-gray-700 pb-2 uppercase tracking-wide">
                                    <Globe size={16} /> OSINT Raporu (Açık Kaynak)
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <span className="text-gray-500 w-20">ÖZET:</span>
                                        <span className="flex-1 text-white">{result.digital_identity.summary}</span>
                                    </div>
                                    {result.digital_identity.career && result.digital_identity.career.length > 0 && (
                                        <div className="flex gap-2">
                                            <span className="text-gray-500 w-20">KARİYER:</span>
                                            <span className="flex-1">{result.digital_identity.career.join(', ')}</span>
                                        </div>
                                    )}
                                    {result.digital_identity.interests && result.digital_identity.interests.length > 0 && (
                                        <div className="flex gap-2">
                                            <span className="text-gray-500 w-20">İLGİLER:</span>
                                            <span className="flex-1">{result.digital_identity.interests.join(', ')}</span>
                                        </div>
                                    )}
                                    <div className="mt-2 pt-2 border-t border-gray-700 flex gap-4 text-[10px] text-gray-500 uppercase">
                                        <span>LinkedIn: {result.digital_identity.social_media.linkedin ? 'TESPİT EDİLDİ' : 'YOK'}</span>
                                        <span>Twitter: {result.digital_identity.social_media.twitter ? 'TESPİT EDİLDİ' : 'YOK'}</span>
                                        <span>Instagram: {result.digital_identity.social_media.instagram ? 'TESPİT EDİLDİ' : 'YOK'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FUSION ENGINE: CROSS-REFERENCE */}
                        {data.cross_reference && data.cross_reference.length > 0 ? (
                            <div className="bg-red-50 p-4 rounded border-2 border-red-200 shadow-sm animate-pulse">
                                <h3 className="text-red-700 font-bold flex items-center gap-2 mb-3 border-b border-red-200 pb-2 uppercase text-sm tracking-wide">
                                    <Siren size={16} /> KRİTİK ÇELİŞKİ TESPİTİ
                                </h3>
                                <div className="space-y-3">
                                    {data.cross_reference.map((ref: any, idx: number) => (
                                        <div key={idx} className="bg-white p-3 border-l-4 border-red-500 shadow-sm">
                                            <div className="text-xs font-bold text-red-600 uppercase mb-1">{ref.type}</div>
                                            <div className="text-sm text-gray-800">{ref.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#fffdf9] p-4 rounded border border-[#d3d0c9] flex items-center justify-center text-center text-gray-400 text-sm italic">
                                <Fingerprint className="mr-2" /> Dijital ayak izi ile sohbet arasında belirgin çelişki bulunamadı.
                            </div>
                        )}

                        {/* Inconsistencies (Chat Only) */}
                        <div className="bg-[#fffdf9] p-4 rounded border border-[#d3d0c9] shadow-sm">
                            <h3 className="text-gray-800 font-bold flex items-center gap-2 mb-3 border-b border-gray-200 pb-2 uppercase text-sm tracking-wide">
                                <Search size={16} /> Sohbet Tutarsızlıkları
                            </h3>
                            {data.inconsistency.paradoxes.length > 0 ? (
                                <div className="space-y-2">
                                    {data.inconsistency.paradoxes.map((p: any, i: number) => (
                                        <div key={i} className="text-xs bg-white p-2 border border-gray-200">
                                            <span className="text-red-500 font-bold">[{p.time}]</span> "{p.statement}" <br />
                                            <span className="text-gray-500">→ {p.contradiction}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : <span className="text-xs text-green-600">Temiz.</span>}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8 relative">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        🕵️‍♂️ HanChat: Ajan Modu <span className="text-xs bg-black text-white px-2 py-0.5 rounded">ULTIMATE</span>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Chat Analizi + Online Takip + OSINT İstihbaratı</p>
                </div>
            </div>

            {!result ? (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Digital Identity Form */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Fingerprint className="text-indigo-600" /> Hedef Profili Oluştur
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Hedef Kişi Adı (Tam İsim)</label>
                                <input
                                    type="text"
                                    placeholder="Örn: Ahmet Yılmaz"
                                    value={suspectName}
                                    onChange={(e) => setSuspectName(e.target.value)}
                                    className="w-full p-2 rounded border border-gray-300 focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Instagram Kullanıcı Adı (Opsiyonel)</label>
                                <input
                                    type="text"
                                    placeholder="@kullanici"
                                    value={instagram}
                                    onChange={(e) => setInstagram(e.target.value)}
                                    className="w-full p-2 rounded border border-gray-300 focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Twitter/X Kullanıcı Adı (Opsiyonel)</label>
                                <input
                                    type="text"
                                    placeholder="@kullanici"
                                    value={twitter}
                                    onChange={(e) => setTwitter(e.target.value)}
                                    className="w-full p-2 rounded border border-gray-300 focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">LinkedIn Başlığı / Anahtar Kelimeler</label>
                                <input
                                    type="text"
                                    placeholder="Örn: Yazılım Mühendisi, İstanbul"
                                    value={linkedin}
                                    onChange={(e) => setLinkedin(e.target.value)}
                                    className="w-full p-2 rounded border border-gray-300 focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: File Upload */}
                    <div className="flex flex-col h-full">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FileText className="text-indigo-600" /> Delil Dosyası
                        </h4>
                        <input
                            type="file"
                            accept=".txt"
                            onChange={handleFileChange}
                            className="hidden"
                            id="agent-file-upload"
                        />
                        <label
                            htmlFor="agent-file-upload"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200
                                ${file
                                    ? 'border-indigo-500 bg-indigo-50 scale-[1.02]'
                                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
                                }`}
                        >
                            {file ? (
                                <>
                                    <FileText className="text-indigo-600 mb-4" size={48} />
                                    <span className="text-gray-900 font-medium text-lg">{file.name}</span>
                                    <span className="text-indigo-600 text-sm mt-2">Dosya seçildi</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="text-gray-400 mb-4" size={48} />
                                    <span className="text-gray-600 font-medium text-center">Sohbeti Sürükle (.txt)</span>
                                </>
                            )}
                        </label>

                        <button
                            onClick={handleAnalyze}
                            disabled={!file || loading}
                            className={`mt-4 w-full py-4 rounded-xl text-white font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${!file || loading
                                ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                : 'bg-gray-900 hover:bg-black shadow-gray-500/30'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>OPERASYON BAŞLATILIYOR...</span>
                                </>
                            ) : (
                                '🔍 GİZLİ DOSYAYI OLUŞTUR'
                            )}
                        </button>
                        {loading && (
                            <p className="text-xs text-yellow-600/80 text-center mt-2 animate-pulse font-mono">
                                Not: Sunucu uyku modundaysa ilk işlem 50-60 saniye sürebilir. Lütfen bekleyiniz...
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="col-span-1 md:col-span-2 p-4 bg-red-50 text-red-600 rounded-lg text-center text-sm font-medium border border-red-100 animate-pulse">
                            {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="text-center mb-8">
                        <div className="inline-block px-4 py-1 bg-gray-900 text-white text-xs font-mono tracking-widest mb-2">CLASSIFIED DOCUMENT</div>
                        <h1 className="text-2xl font-black text-gray-800 uppercase tracking-widest">SORUŞTURMA RAPORU</h1>
                        <div className="text-xs text-gray-500 font-mono mt-1">ID: #AG-{Math.floor(Math.random() * 10000)} | DATE: {new Date().toLocaleDateString()}</div>
                    </div>

                    {result.participants.map((p: string) => renderPersonAnalysis(p, result.analysis[p]))}

                    <button
                        onClick={() => { setResult(null); setFile(null); }}
                        className="w-full py-4 text-center text-gray-500 hover:text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition-colors border-2 border-dashed border-gray-300 uppercase tracking-widest text-sm"
                    >
                        ← Yeni Operasyon Başlat
                    </button>

                    <div className="text-center mt-8 opacity-20">
                        <img src="/placeholder-logo.png" className="w-16 mx-auto grayscale" alt="" />
                    </div>
                </div>
            )}
        </div>
    );
}

