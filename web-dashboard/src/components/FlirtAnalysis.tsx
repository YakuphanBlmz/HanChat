import { useState, type DragEvent } from 'react';
import { Upload, FileText, Heart, Zap, Moon, Smile, Star, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { API_URL } from '../services/api';

export function FlirtAnalysis() {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

            const response = await fetch(`${API_URL}/analyze/flirt`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            setError("Analiz başarısız oldu. Dosya formatını kontrol edin.");
        } finally {
            setLoading(false);
        }
    };

    const renderResults = () => {
        if (!result) return null;
        const { participants, analysis } = result;
        const p1 = participants[0];
        const p2 = participants[1] || "Diğeri";

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Compatibility Score */}
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-8 text-white text-center relative overflow-hidden shadow-lg">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-2">Uyum Skoru</h2>
                        <div className="text-6xl font-black mb-4 flex items-center justify-center gap-4">
                            <span>%{analysis.compatibility_score}</span>
                            <Heart className="fill-white animate-pulse" size={48} />
                        </div>
                        <p className="text-pink-100 text-lg">
                            {analysis.compatibility_score > 80 ? "Ruh Eşisiniz! 💑" :
                                analysis.compatibility_score > 50 ? "Güzel bir uyum var! ✨" :
                                    "Zıt kutuplar birbirini çeker... mi? 🤔"}
                        </p>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <Heart size={300} className="absolute -right-10 -bottom-10" />
                        <Heart size={200} className="absolute -left-10 -top-10" />
                    </div>
                </div>

                {/* Balance of Love */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Activity className="text-pink-500" /> Aşk Terazisi (Mesaj Dengesi)
                    </h3>
                    <div className="flex items-center justify-between mb-2 text-sm font-bold text-gray-600">
                        <span>{p1} (%{analysis.balance[p1]?.msg_percent})</span>
                        <span>{p2} (%{analysis.balance[p2]?.msg_percent})</span>
                    </div>
                    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
                        <div className="h-full bg-blue-400 transition-all duration-1000" style={{ width: `${analysis.balance[p1]?.msg_percent}%` }}></div>
                        <div className="h-full bg-pink-400 transition-all duration-1000" style={{ width: `${analysis.balance[p2]?.msg_percent}%` }}></div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <div className="text-xs text-blue-500">Kelime Sayısı</div>
                            <div className="font-bold text-blue-700">{analysis.balance[p1]?.word_count}</div>
                        </div>
                        <div className="p-3 bg-pink-50 rounded-xl">
                            <div className="text-xs text-pink-500">Kelime Sayısı</div>
                            <div className="font-bold text-pink-700">{analysis.balance[p2]?.word_count}</div>
                        </div>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Eagerness */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Zap className="text-yellow-500" /> Heves Skoru (Cevap Hızı)
                        </h3>
                        <div className="space-y-4">
                            {participants.map((p: string) => (
                                <div key={p} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <span className="font-medium text-gray-700">{p}</span>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900">{analysis.eagerness[p]?.score}</div>
                                        <div className="text-xs text-gray-500">Ort. {analysis.eagerness[p]?.median_response_min} dk</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Night Owls */}
                    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Moon className="text-indigo-400" /> Gece Kuşları
                            </h3>
                            <div className="text-4xl font-bold text-indigo-300 mb-2">{analysis.night_talks}</div>
                            <p className="text-slate-400 text-sm">Gece 00:00 - 05:00 arası atılan mesaj sayısı. Duygusal bağın en yüksek olduğu saatler! 🌙</p>
                        </div>
                        <Moon size={150} className="absolute -right-10 -bottom-10 text-slate-800 opacity-50" />
                    </div>

                    {/* Compliments */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Smile className="text-green-500" /> İltifat Dedektörü
                        </h3>
                        <div className="space-y-4">
                            {participants.map((p: string) => (
                                <div key={p} className="flex justify-between items-center">
                                    <span className="text-gray-600">{p}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500" style={{ width: `${Math.min(100, analysis.compliments[p] * 5)}%` }}></div>
                                        </div>
                                        <span className="font-bold text-gray-900">{analysis.compliments[p]}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Zodiac Guess */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Star className="text-purple-500" /> Burç Tahmini (Element)
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {participants.map((p: string) => (
                                <div key={p} className="text-center p-3 bg-purple-50 rounded-xl">
                                    <div className="font-bold text-gray-900 mb-1">{p}</div>
                                    <div className="text-purple-600 font-medium">{analysis.zodiac_guesses[p]}</div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center italic">Konuşma tarzına göre tahmin edilmiştir.</p>
                    </div>
                </div>

                {/* Heartbeat Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Activity className="text-red-500" /> İlişkinin Kalp Atışı (Duygu Analizi)
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analysis.sentiment_timeline}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" hide />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
                                />
                                <Line type="monotone" dataKey="score" stroke="#ec4899" strokeWidth={3} dot={{ fill: '#ec4899', r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-4">Zaman içindeki pozitif/negatif konuşma dengesi</p>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8 relative">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Flört Modu 💘</h3>
                    <p className="text-sm text-gray-500 mt-1">Aşkın matematiğini çözüyoruz!</p>
                </div>
                <div className="p-2 bg-pink-50 rounded-lg">
                    <Heart className="text-pink-600" size={20} />
                </div>
            </div>

            {!result ? (
                <div className="mt-6 space-y-6">
                    <input
                        type="file"
                        accept=".txt"
                        onChange={handleFileChange}
                        className="hidden"
                        id="flirt-file-upload"
                    />
                    <label
                        htmlFor="flirt-file-upload"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 cursor-pointer transition-all duration-200
                            ${file
                                ? 'border-pink-500 bg-pink-50 scale-[1.02]'
                                : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
                            }`}
                    >
                        {file ? (
                            <>
                                <FileText className="text-pink-600 mb-4" size={48} />
                                <span className="text-gray-900 font-medium text-lg">{file.name}</span>
                                <span className="text-pink-600 text-sm mt-2">Dosya seçildi, değiştirmek için tıklayın</span>
                            </>
                        ) : (
                            <>
                                <Upload className="text-gray-400 mb-4" size={48} />
                                <span className="text-gray-600 font-medium text-lg">Dosya Seç veya Sürükle</span>
                                <span className="text-gray-400 text-sm mt-2">WhatsApp Sohbeti Dışa Aktar &gt; Medyasız (.txt)</span>
                            </>
                        )}
                    </label>

                    <div className="flex justify-center">
                        <button
                            onClick={handleAnalyze}
                            disabled={!file || loading}
                            className={`px-8 py-3 rounded-xl text-white font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 ${!file || loading
                                ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-pink-500/30'
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Aşk Ölçülüyor...
                                </span>
                            ) : (
                                'Analizi Başlat 💘'
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center text-sm font-medium border border-red-100 animate-pulse">
                            {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {renderResults()}

                    <button
                        onClick={() => { setResult(null); setFile(null); }}
                        className="w-full py-4 text-center text-gray-500 hover:text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition-colors border border-dashed border-gray-300 mt-8"
                    >
                        ← Başka Bir Dosya Analiz Et
                    </button>
                </div>
            )}
        </div>
    );
}
