import { useState, type DragEvent, useMemo } from 'react';
import { Upload, Smile, FileText, X, Info, Award, MessageCircle, Clock, Heart, Zap, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { API_URL } from '../services/api';

export function FunAnalysis({ onAnalysisComplete }: { onAnalysisComplete?: (stats: any) => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTitle, setSelectedTitle] = useState<any | null>(null);

    // New States for Group Analysis
    const [analysisMode, setAnalysisMode] = useState<'person' | 'group'>('person');
    const [groupType, setGroupType] = useState<string>('friend_group');
    const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

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
            if (droppedFile.name.endsWith('.txt') || droppedFile.name.endsWith('.zip')) {
                setFile(droppedFile);
                setError(null);
            } else {
                setError("Lütfen sadece .txt veya .zip dosyası yükleyin.");
            }
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setError("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_URL}/analyze/file`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.dispatchEvent(new Event('auth:unauthorized'));
                    throw new Error("Oturum geçersiz.");
                }
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || `Analysis failed: ${response.status}`);
            }

            const data = await response.json();
            setResult(data);
            if (onAnalysisComplete) {
                onAnalysisComplete(data);
            }

            // Set default selected person if group is large
            if (data.participants.length > 0) {
                setSelectedPerson(data.participants[0]);
            }
        } catch (err: any) {
            console.error(err);
            // Show the actual error message from server if available (e.g. 401 Unauthorized)
            setError(err.message || "Analiz başarısız oldu. Dosya formatını kontrol edin.");
        } finally {
            setLoading(false);
        }
    };

    // Group titles by winner
    const personAwards = useMemo(() => {
        if (!result) return {};
        const grouped: any = {};
        result.participants.forEach((p: string) => grouped[p] = []);

        Object.entries(result.titles).forEach(([title, data]: [string, any]) => {
            if (grouped[data.winner]) {
                grouped[data.winner].push({ title, ...data });
            }
        });
        return grouped;
    }, [result]);

    // Prepare Radar Data (Personality Profile)
    const getRadarData = (stats: any) => {
        const fm = stats.fun_metrics;
        return [
            { subject: 'Mizah', A: Math.min(100, fm.laugh_count * 2), fullMark: 100 },
            { subject: 'Agresif ve Coşkulu', A: Math.min(100, fm.shout_count * 5), fullMark: 100 },
            { subject: 'Merak', A: Math.min(100, fm.question_count * 3), fullMark: 100 },
            { subject: 'Duygusallık', A: Math.min(100, fm.emoji_count), fullMark: 100 },
            { subject: 'Argo', A: Math.min(100, fm.slang_count * 10), fullMark: 100 },
            { subject: 'Medya', A: Math.min(100, fm.media_count), fullMark: 100 },
        ];
    };

    // Prepare Hourly Data
    const getHourlyData = (hourly: number[]) => {
        return hourly.map((count, hour) => ({
            name: `${hour}:00`,
            mesaj: count
        }));
    };

    // Render Person Card
    const renderPersonCard = (person: string, index: number) => {
        const stats = result.stats[person];
        const awards = personAwards[person] || [];
        const radarData = getRadarData(stats);
        const hourlyData = getHourlyData(stats.fun_metrics.hourly_distribution || []);
        const colors = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
        const personColor = colors[index % colors.length];

        return (
            <div key={person} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center gap-4" style={{ backgroundColor: `${personColor}10` }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg" style={{ backgroundColor: personColor }}>
                        {person.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{person}</h2>
                        <div className="flex gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><MessageCircle size={14} /> {stats.message_count} Mesaj</span>
                            <span className="flex items-center gap-1"><Clock size={14} /> {stats.fun_metrics.avg_response_time} dk Cevap</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Awards & Stats (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Awards List */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Award size={16} /> Ödüller
                            </h4>
                            <div className="space-y-3">
                                {awards.length > 0 ? awards.map((award: any) => (
                                    <div
                                        key={award.title}
                                        onClick={() => setSelectedTitle({ title: award.title, data: award })}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-yellow-50 hover:border-yellow-200 cursor-pointer transition-colors group"
                                    >
                                        <span className="text-2xl">🏆</span>
                                        <div className="flex-1">
                                            <div className="font-bold text-gray-800 text-sm group-hover:text-yellow-700">{award.title}</div>
                                            <div className="text-xs text-gray-500">{award.value}</div>
                                        </div>
                                        <Info size={14} className="text-gray-300 group-hover:text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                )) : (
                                    <div className="text-sm text-gray-400 italic p-2">Henüz ödül yok...</div>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Zap size={16} /> İstatistikler
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500">Kelime</div>
                                    <div className="font-bold text-gray-900">{stats.fun_metrics.unique_word_count}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500">Emoji</div>
                                    <div className="font-bold text-gray-900">{stats.fun_metrics.emoji_count}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500">Medya</div>
                                    <div className="font-bold text-gray-900">{stats.fun_metrics.media_count}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500">Silinen</div>
                                    <div className="font-bold text-gray-900">{stats.fun_metrics.deleted_count}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Charts (8 cols) */}
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Radar Chart */}
                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col">
                            <h4 className="text-sm font-bold text-gray-700 mb-2 text-center">Kişilik Profili</h4>
                            <div className="flex-1 min-h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                        <PolarGrid stroke="#e5e7eb" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar name={person} dataKey="A" stroke={personColor} fill={personColor} fillOpacity={0.4} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Bar Chart */}
                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col">
                            <h4 className="text-sm font-bold text-gray-700 mb-2 text-center">Saatlik Aktivite</h4>
                            <div className="flex-1 min-h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={hourlyData} layout="vertical" margin={{ left: 0, right: 20 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={40} tick={{ fontSize: 10 }} interval={0} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f3f4f6' }} />
                                        <Bar dataKey="mesaj" fill={personColor} radius={[0, 4, 4, 0]} barSize={12} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 px-2 mt-2">
                                <span>Az</span>
                                <span>Aktivite Yoğunluğu</span>
                                <span>Çok</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Modal Content Renderer
    const renderModalContent = () => {
        if (!selectedTitle) return null;
        const { title, data } = selectedTitle;
        const details = data.details || {};
        const type = data.detail_type;

        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedTitle(null)}>
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                            <p className="text-pink-600 font-medium">{data.winner}</p>
                        </div>
                        <button onClick={() => setSelectedTitle(null)} className="p-1 hover:bg-gray-100 rounded-full">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <p className="text-gray-700 text-lg font-medium text-center">{data.description}</p>
                    </div>

                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {type === 'slang_words' && details.slang_words && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 mb-2">En Çok Kullanılanlar:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {details.slang_words.map(([word, count]: any) => (
                                        <span key={word} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm">
                                            {word} <span className="text-gray-400 ml-1">{count}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Add other detail types here if needed */}
                        {type === 'shout_examples' && details.shout_examples && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 mb-2">Kahkaha Örnekleri:</h4>
                                <ul className="space-y-2">
                                    {details.shout_examples.map((msg: string, i: number) => (
                                        <li key={i} className="text-sm bg-white p-2 rounded border border-gray-100 italic">"{msg}"</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {type === 'max_msg_content' && details.max_msg_content && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 mb-2">Mesaj İçeriği:</h4>
                                <div className="text-sm bg-white p-3 rounded-lg border border-gray-200 italic text-gray-600">
                                    "{details.max_msg_content}"
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8 relative">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Analiz Modu 🎭</h3>
                    <p className="text-sm text-gray-500 mt-1">Sohbetinizi yükleyin, gerisini bize bırakın!</p>
                </div>
                <div className="p-2 bg-pink-50 rounded-lg">
                    <Smile className="text-pink-600" size={20} />
                </div>
            </div>

            {!result ? (
                <div className="mt-6 space-y-6">
                    {/* Mode Selection */}
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setAnalysisMode('person')}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${analysisMode === 'person' ? 'bg-pink-100 text-pink-700 border-2 border-pink-200' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'}`}
                        >
                            👤 Kişi/İkili Analizi
                        </button>
                        <button
                            onClick={() => setAnalysisMode('group')}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${analysisMode === 'group' ? 'bg-purple-100 text-purple-700 border-2 border-purple-200' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'}`}
                        >
                            👥 Grup Analizi
                        </button>
                    </div>

                    {/* Group Type Selection */}
                    {analysisMode === 'group' && (
                        <div className="max-w-md mx-auto">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Grup Tarzı (Zorunlu)</label>
                            <select
                                value={groupType}
                                onChange={(e) => setGroupType(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                            >
                                <option value="friend_group">Yakın Arkadaş Grubu 🍻</option>
                                <option value="class_group">Sınıf / Okul Grubu 🎓</option>
                                <option value="work_group">İş / Ofis Grubu 💼</option>
                                <option value="family_group">Aile Grubu 🏠</option>
                                <option value="random_group">Geyik / Öylesine Grup 🤪</option>
                                <option value="game_group">Oyun Ekibi 🎮</option>
                            </select>
                        </div>
                    )}

                    {/* File Upload */}
                    <input
                        type="file"
                        accept=".txt,.zip"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                    />
                    <label
                        htmlFor="file-upload"
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
                                <span className="text-pink-600 text-sm mt-2">Dosya seçildi, değiştirmek için tıklayın veya sürükleyin</span>
                            </>
                        ) : (
                            <>
                                <Upload className="text-gray-400 mb-4" size={48} />
                                <span className="text-gray-600 font-medium text-lg">Dosya Seç veya Sürükle (TXT veya ZIP)</span>
                                <span className="text-gray-400 text-sm mt-2">WhatsApp Sohbeti Dışa Aktar &gt; Medyasız (.txt veya .zip)</span>
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
                                    Analiz Yapılıyor...
                                </span>
                            ) : (
                                'Analizi Başlat 🚀'
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
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* AI Analysis Section - Prominent at Top for Groups */}
                    <AIAnalysisSection result={result} groupType={analysisMode === 'group' ? groupType : undefined} />

                    {/* Group Highlights - ONLY for Group Mode */}
                    {analysisMode === 'group' && (
                        <GroupHighlights result={result} />
                    )}

                    {/* Person Sections Logic */}
                    {analysisMode === 'group' && result.participants.length > 5 ? (
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Users size={20} className="text-purple-600" />
                                Kişi Detayları ({result.participants.length} Kişi)
                            </h3>
                            <select
                                value={selectedPerson || ''}
                                onChange={(e) => setSelectedPerson(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-300 mb-6 focus:ring-2 focus:ring-purple-200 outline-none"
                            >
                                {result.participants.map((p: string) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>

                            {selectedPerson && renderPersonCard(selectedPerson, result.participants.indexOf(selectedPerson))}
                        </div>
                    ) : (
                        // Render all cards for small groups or individual mode
                        result.participants.map((person: string, index: number) => renderPersonCard(person, index))
                    )}

                    {/* Detailed Stats Table - Visible in all modes */}
                    <DetailedStatsTable result={result} />

                    <button
                        onClick={() => { setResult(null); setFile(null); }}
                        className="w-full py-4 text-center text-gray-500 hover:text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition-colors border border-dashed border-gray-300"
                    >
                        ← Başka Bir Dosya Analiz Et
                    </button>

                    {/* Modal */}
                    {renderModalContent()}
                </div>
            )}
        </div>
    );
}

function GroupHighlights({ result }: { result: any }) {
    const highlights = useMemo(() => {
        if (!result) return [];

        let maxMsg = { person: '', val: -1 };
        let maxEmoji = { person: '', val: -1 };
        let maxShout = { person: '', val: -1 };
        let minResponse = { person: '', val: 999999 };

        result.participants.forEach((p: string) => {
            const stats = result.stats[p];
            const fm = stats.fun_metrics;

            if (stats.message_count > maxMsg.val) maxMsg = { person: p, val: stats.message_count };
            if (fm.emoji_count > maxEmoji.val) maxEmoji = { person: p, val: fm.emoji_count };
            if (fm.shout_count > maxShout.val) maxShout = { person: p, val: fm.shout_count };
            if (fm.avg_response_time > 0 && fm.avg_response_time < minResponse.val) minResponse = { person: p, val: fm.avg_response_time };
        });

        return [
            {
                title: "Grup Gevezesi",
                person: maxMsg.person,
                val: `${maxMsg.val} Mesaj`,
                icon: MessageCircle,
                cardColor: "bg-sky-50 border-sky-100",
                iconColor: "text-sky-600 bg-sky-100"
            },
            {
                title: "Emoji Canavarı",
                person: maxEmoji.person,
                val: `${maxEmoji.val} Emoji`,
                icon: Smile,
                cardColor: "bg-amber-50 border-amber-100",
                iconColor: "text-amber-600 bg-amber-100"
            },
            {
                title: "En Hızlı Silahşör",
                person: minResponse.person,
                val: `${minResponse.val} dk`,
                icon: Zap,
                cardColor: "bg-emerald-50 border-emerald-100",
                iconColor: "text-emerald-600 bg-emerald-100"
            },
            {
                title: "En Agresif ve Coşkulu",
                person: maxShout.person,
                val: `${maxShout.val} Kez`,
                icon: Heart,
                cardColor: "bg-rose-50 border-rose-100",
                iconColor: "text-rose-600 bg-rose-100"
            },
        ];
    }, [result]);

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Award className="text-purple-600" /> Grubun En'leri
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {highlights.map((h, i) => (
                    <div key={i} className={`p-4 rounded-xl border flex items-center gap-4 transition-transform hover:scale-105 ${h.cardColor}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${h.iconColor}`}>
                            <h.icon size={24} />
                        </div>
                        <div>
                            <div className="text-xs font-bold uppercase tracking-wider opacity-70">{h.title}</div>
                            <div className="text-lg font-bold text-gray-900">{h.person}</div>
                            <div className="text-sm font-medium opacity-80">{h.val}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AIAnalysisSection({ result, groupType }: { result: any, groupType?: string }) {
    const [prompt, setPrompt] = useState("");
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleAIAnalyze = async () => {
        if (!prompt.trim()) {
            setShowConfirmation(true);
            return;
        }
        await performAnalysis();
    };

    const performAnalysis = async () => {
        setShowConfirmation(false);

        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_URL}/analyze/ai`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    stats: result,
                    user_prompt: prompt || (groupType ? `Bu bir ${groupType} grubu.` : "Genel bir arkadaşlık analizi yap."),
                    group_type: groupType
                }),
            });

            if (!response.ok) throw new Error('AI request failed');

            const data = await response.json();
            setInsight(data.insight);
        } catch (e) {
            console.error(e);
            alert("Yapay zeka analizi başarısız oldu. Backend'de API Key tanımlı olduğundan emin olun.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap size={100} />
            </div>



            <div className="relative z-10">
                <h3 className="text-2xl font-bold text-indigo-900 mb-2 flex items-center gap-2">
                    <Zap className="text-indigo-600" /> Yapay Zeka ile {groupType ? 'Grup' : 'İlişki'} Analizi
                </h3>
                <p className="text-indigo-600 mb-6">
                    {groupType ? 'Grubunuzu yapay zekaya yorumlatın!' : 'Bize ilişkinizden biraz bahset, yapay zeka verilerinizi yorumlasın!'}
                </p>

                {!insight ? (
                    <div className="space-y-4">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={groupType ? "Grup hakkında eklemek istediğin bir şey var mı? (Opsiyonel)" : "Örn: Biz üniversiteden tanışıyoruz, samimi bir arkadaşlığımız var..."}
                            className="w-full p-4 rounded-xl border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none min-h-[120px] bg-white/80 backdrop-blur-sm"
                        />

                        <div className="flex items-center justify-end">
                            <button
                                onClick={handleAIAnalyze}
                                disabled={loading}
                                className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 ${loading
                                    ? 'bg-indigo-300 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
                                    }`}
                            >
                                {loading ? 'Analiz Ediliyor... 🤖' : 'Yorumla ✨'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-indigo-100 shadow-sm animate-in fade-in zoom-in duration-500">
                        <div className="prose prose-indigo max-w-none text-gray-800 leading-relaxed">
                            {insight?.split('\n').map((line, i) => (
                                <p key={i} className="mb-2 min-h-[1rem]">
                                    {line.split('**').map((part, index) =>
                                        index % 2 === 1 ? <strong key={index} className="text-indigo-700 font-bold">{part}</strong> : part
                                    )}
                                </p>
                            ))}
                        </div>
                        <button
                            onClick={() => setInsight(null)}
                            className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            Tekrar Analiz Et
                        </button>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 rounded-2xl">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl border border-indigo-100 max-w-sm w-full animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-yellow-50 rounded-full">
                                <Info className="text-yellow-600" size={32} />
                            </div>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 text-center mb-2">Açıklama Girmediniz</h4>
                        <p className="text-gray-600 text-center text-sm mb-6">
                            Yapay zekaya bir bağlam vermeden devam etmek istiyor musunuz? Analiz sadece verilere dayanarak yapılacak.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={performAnalysis}
                                className="flex-1 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                            >
                                Evet, Devam Et
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DetailedStatsTable({ result }: { result: any }) {
    const [isOpen, setIsOpen] = useState(false);

    if (!result) return null;

    const columns = [
        { key: 'message_count', label: 'Mesaj', desc: 'Toplam', color: 'text-blue-600', bg: 'bg-blue-50' },
        { key: 'unique_word_count', label: 'Kelime', desc: 'Farklı', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { key: 'emoji_count', label: 'Emoji', desc: 'Toplam', color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { key: 'laugh_count', label: 'Kahkaha', desc: 'Random/Haha', color: 'text-pink-600', bg: 'bg-pink-50' },
        { key: 'slang_count', label: 'Argo', desc: 'Küfür/Argo', color: 'text-red-600', bg: 'bg-red-50' },
        { key: 'shout_count', label: 'Coşku', desc: 'Caps/Ünlem', color: 'text-orange-600', bg: 'bg-orange-50' },
        { key: 'media_count', label: 'Medya', desc: 'Foto/Video', color: 'text-purple-600', bg: 'bg-purple-50' },
        { key: 'question_count', label: 'Soru', desc: 'Merak', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    ];

    const getTooltipContent = (key: string, stats: any) => {
        const fm = stats.fun_metrics;
        const details = fm.details || {};

        switch (key) {
            case 'unique_word_count':
                return stats.top_words?.slice(0, 3).map((w: any) => `${w.text} (${w.value})`).join(', ');
            case 'emoji_count':
                return stats.top_emojis?.slice(0, 3).map((e: any) => `${e.emoji} (${e.count})`).join(' ');
            case 'slang_count':
                return details.slang_words?.slice(0, 3).map((w: any) => `${w[0]} (${w[1]})`).join(', ');
            case 'shout_count':
                return details.shout_examples?.slice(0, 3).map((msg: string) => `"${msg.substring(0, 20)}${msg.length > 20 ? '...' : ''}"`).join('\n');
            case 'question_count':
                return details.question_examples?.slice(0, 3).map((msg: string) => `"${msg.substring(0, 20)}${msg.length > 20 ? '...' : ''}"`).join('\n');
            default:
                return null;
        }
    };

    return (
        <div className="mt-8">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between hover:bg-gray-50 transition-all group"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                        <FileText className="text-indigo-600" size={24} />
                    </div>
                    <div className="text-left">
                        <h3 className="text-lg font-bold text-gray-900">Detaylı İstatistik Tablosu</h3>
                        <p className="text-sm text-gray-500">Tüm verileri incelemek için tıklayın</p>
                    </div>
                </div>
                {isOpen ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
            </button>

            {isOpen && (
                <div className="mt-4 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-center text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="p-4 font-bold text-gray-700 text-left">Kişi</th>
                                    {columns.map(col => (
                                        <th key={col.key} className="p-4">
                                            <div className="font-bold text-gray-900">{col.label}</div>
                                            <div className="text-xs text-gray-500 font-medium">{col.desc}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {result.participants.map((person: string) => {
                                    const stats = result.stats[person];
                                    const fm = stats.fun_metrics;
                                    const rowData: any = {
                                        message_count: stats.message_count,
                                        unique_word_count: fm.unique_word_count,
                                        emoji_count: fm.emoji_count,
                                        laugh_count: fm.laugh_count,
                                        slang_count: fm.slang_count,
                                        shout_count: fm.shout_count,
                                        media_count: fm.media_count,
                                        question_count: fm.question_count
                                    };

                                    return (
                                        <tr key={person} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="p-4 font-bold text-gray-900 text-left">{person}</td>
                                            {columns.map(col => {
                                                const tooltip = getTooltipContent(col.key, stats);
                                                return (
                                                    <td key={col.key} className="p-4">
                                                        <div className="relative group flex justify-center">
                                                            <span className={`px-2 py-1 rounded-lg font-medium cursor-default ${col.bg} ${col.color}`}>
                                                                {rowData[col.key]}
                                                            </span>
                                                            {tooltip && (
                                                                <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 bg-gray-900/90 backdrop-blur text-white text-xs rounded-lg p-2 z-50 shadow-xl whitespace-pre-wrap">
                                                                    <div className="font-bold mb-1 border-b border-white/20 pb-1">En Çok:</div>
                                                                    {tooltip}
                                                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900/90 rotate-45"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
