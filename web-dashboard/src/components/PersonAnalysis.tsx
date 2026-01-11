import React, { useState } from 'react';
import { api } from '../services/api';
import { StatsCard } from './StatsCard';
import { HourlyActivityChart } from './Charts';
import { Search, User, MessageSquare, Calendar, AlignLeft, Smile } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PersonStats {
    name: string;
    total_messages: number;
    avg_length: number;
    most_active_day: string;
    top_words: { text: string; value: number }[];
    top_emojis: { emoji: string; count: number }[];
    hourly_activity: { hour: number; count: number }[];
}

export const PersonAnalysis: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState<PersonStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setError(null);
        setStats(null);

        try {
            const data = await api.getSenderAnalysis(searchTerm);
            setStats(data);
        } catch (err) {
            setError('Kişi bulunamadı veya veri yok.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg">
                    <User className="text-indigo-600" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Kişi Analizi</h2>
                    <p className="text-sm text-gray-500">Belirli bir kişi hakkında detaylı rapor al</p>
                </div>
            </div>

            <form onSubmit={handleSearch} className="mb-8 relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="İsim yazın (örn: Ahmet)..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-2 top-2 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Aranıyor...' : 'Analiz Et'}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm mb-6">
                    {error}
                </div>
            )}

            {stats && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatsCard
                            title="Toplam Mesaj"
                            value={stats.total_messages}
                            icon={MessageSquare}
                            color="blue"
                        />
                        <StatsCard
                            title="Ortalama Uzunluk"
                            value={`${Math.round(stats.avg_length)} karakter`}
                            icon={AlignLeft}
                            color="purple"
                        />
                        <StatsCard
                            title="En Aktif Gün"
                            value={stats.most_active_day}
                            icon={Calendar}
                            color="green"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Words */}
                        <div className="bg-gray-50 p-6 rounded-xl">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <AlignLeft size={18} className="text-gray-500" />
                                En Çok Kullanılan Kelimeler
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {stats.top_words.map((word, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700 shadow-sm"
                                        style={{ fontSize: Math.max(0.8, 1 + (10 - idx) * 0.05) + 'rem' }}
                                    >
                                        {word.text} <span className="text-gray-400 text-xs ml-1">{word.value}</span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Top Emojis */}
                        <div className="bg-gray-50 p-6 rounded-xl">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Smile size={18} className="text-gray-500" />
                                Favori Emojiler
                            </h3>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.top_emojis} layout="vertical" margin={{ left: 20 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="emoji" type="category" width={30} tick={{ fontSize: 20 }} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                            {stats.top_emojis.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={['#f472b6', '#fb7185', '#e879f9', '#c084fc', '#a78bfa'][index % 5]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Hourly Activity */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Saatlik Aktivite</h3>
                        <HourlyActivityChart data={stats.hourly_activity} />
                    </div>

                </div>
            )}
        </div>
    );
};
