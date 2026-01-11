import { useState, useEffect, useRef } from 'react';
import { Siren, Activity, CheckCircle, Clock, AlertTriangle, Play, Loader2, StopCircle, Trash2 } from 'lucide-react';
import { API_URL } from '../../services/api';

export function RealTimeAnalysis() {
    // Tracking State
    const [trackingPhone, setTrackingPhone] = useState("");
    const [startTime, setStartTime] = useState(() => {
        const now = new Date();
        return now.toTimeString().slice(0, 5);
    });
    const [endTime, setEndTime] = useState(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 15);
        return now.toTimeString().slice(0, 5);
    });
    const [trackingConfirmed, setTrackingConfirmed] = useState(false);
    const [selfOnlineConfirmed, setSelfOnlineConfirmed] = useState(false);
    const [trackingHistory, setTrackingHistory] = useState<any[]>([]);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [activeTracking, setActiveTracking] = useState<any>(null);
    const [expandedRecord, setExpandedRecord] = useState<number | null>(null);
    const [notifyOnOnline, setNotifyOnOnline] = useState(false);

    // Notification Permission Handler
    const handleNotifyChange = (checked: boolean) => {
        setNotifyOnOnline(checked);
        if (checked && Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    };

    const lastNotifiedState = useRef<string>("OFFLINE");

    // Poll for Active Tracking Status
    useEffect(() => {
        // Initial fetch
        fetchTrackingHistory();

        const interval = setInterval(async () => {
            try {
                const response = await fetch(`${API_URL}/track/status`);
                if (response.ok) {
                    const status = await response.json();

                    if (['running', 'waiting', 'initializing', 'preparing', 'planned', 'completed'].includes(status.state)) {
                        setActiveTracking(status);

                        // Notification Logic
                        if (notifyOnOnline && status.sub_state && status.sub_state !== 'OFFLINE' && lastNotifiedState.current === 'OFFLINE') {
                            if (Notification.permission === "granted") {
                                const msg = status.sub_state === 'TYPING' ? 'Yazıyor...' :
                                    status.sub_state === 'RECORDING' ? 'Ses Kaydediyor...' : 'Çevrimiçi!';
                                new Notification(`Hedef ${msg}`, {
                                    body: `${status.contact_name || status.phone_number} şu an aktif!`,
                                    icon: '/icon.png'
                                });
                            }
                        }
                        if (status.sub_state) lastNotifiedState.current = status.sub_state;

                    } else {
                        setActiveTracking(null);
                    }
                }
            } catch (e) { }
        }, 2000);
        return () => clearInterval(interval);
    }, [notifyOnOnline]);

    const fetchTrackingHistory = async () => {
        try {
            const response = await fetch(`${API_URL}/track/history`);
            if (response.ok) {
                const data = await response.json();
                // Sort by id desc
                setTrackingHistory(data.sort((a: any, b: any) => b.id - a.id));
            }
        } catch (error) { console.error("History fetch error:", error); }
    };

    const handleDeleteRecord = async (id: number) => {
        if (!window.confirm("Bu kaydı silmek istiyor musunuz?")) return;
        try {
            const res = await fetch(`${API_URL}/track/history/${id}`, { method: 'DELETE' });
            if (res.ok) fetchTrackingHistory();
        } catch (e) { alert("Silinemedi"); }
    }

    const handleStartTracking = async () => {
        if (!trackingPhone || !trackingConfirmed || !selfOnlineConfirmed) return;
        setTrackingLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        try {
            const response = await fetch(`${API_URL}/track/start?phone=${trackingPhone}&start_time=${startTime}&end_time=${endTime}`, {
                method: 'POST', signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                alert("Takip planlandı! Arka planda çalışıyor.");
                fetchTrackingHistory();
            } else {
                const err = await response.json();
                if (response.status === 409) {
                    alert("Zaten aktif bir takip görevi var.");
                    fetchTrackingStatus();
                } else {
                    alert(err.detail || "Takip başlatılamadı.");
                }
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log("Request timed out, checking status...");
                try {
                    const statusRes = await fetch(`${API_URL}/track/status`);
                    const statusData = await statusRes.json();
                    if (['preparing', 'initializing', 'running', 'waiting', 'planned'].includes(statusData.state)) {
                        alert("Takip başlatıldı! (Arka plan hazırlığı sürüyor...)");
                        fetchTrackingHistory();
                    } else {
                        alert("Zaman aşımı. Bot yanıt vermedi, lütfen tekrar deneyin.");
                    }
                } catch (e) {
                    alert("Sunucuya ulaşılamıyor.");
                }
            } else {
                console.error(error);
                alert("Sunucu hatası. Botun açık olduğundan emin olun.");
            }
        } finally { setTrackingLoading(false); }
    };

    const handleStopTracking = async () => {
        if (window.confirm("Takibi iptal etmek istediğinize emin misiniz?")) {
            try {
                await fetch(`${API_URL}/track/stop`, { method: 'POST' });
                setActiveTracking(null);
            } catch (e) {
                alert("İptal edilemedi.");
            }
        }
    };

    const handleDismiss = async () => {
        await fetch(`${API_URL}/track/dismiss`, { method: 'POST' });
        setActiveTracking(null);
    }

    // Helper to fetch status manually
    const fetchTrackingStatus = async () => {
        try {
            const response = await fetch(`${API_URL}/track/status`);
            if (response.ok) {
                const status = await response.json();
                setActiveTracking(status);
            }
        } catch (e) { console.error(e); }
    }

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">

            {/* Main Card Container */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
                {/* Header Inside Card */}
                <div className="flex flex-col items-center text-center mb-10 pb-6 border-b border-gray-100 relative">
                    {/* Top Right Icon */}
                    <div className="absolute top-0 right-0 p-2 bg-red-50 rounded-lg animate-pulse">
                        <Activity className="text-red-600" size={20} />
                    </div>

                    <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Gerçek Zamanlı Takip</h3>
                    <p className="text-gray-500 text-base max-w-4xl mx-auto whitespace-nowrap">
                        Hedef kişinin çevrimiçi durumunu anlık olarak izleyin ve raporlayın. Arka planda çalışır, tarayıcıyı yormaz.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: ACTIVE STATUS & CONTROLS */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Active Monitor Card - Adjusted for inner layout */}
                        <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden relative">
                            {/* Status Bar */}
                            <div className={`p-4 flex items-center justify-between ${activeTracking ? (activeTracking.state === 'completed' ? 'bg-blue-600' : 'bg-green-600') : 'bg-gray-800'} text-white transition-colors duration-500`}>
                                <div className="flex items-center gap-3">
                                    {activeTracking ? (
                                        activeTracking.state === 'completed' ? <CheckCircle className="text-white" /> : <Activity className="animate-pulse text-white" />
                                    ) : <Siren className="text-gray-400" />}

                                    <span className="font-bold tracking-wide uppercase text-sm">
                                        {activeTracking ? 'Sistem Aktif' : 'Beklemede'}
                                    </span>
                                </div>
                                {activeTracking && (
                                    <div className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded">
                                        PID: {Math.floor(Math.random() * 9000) + 1000}
                                    </div>
                                )}
                            </div>

                            {/* Monitor Content */}
                            <div className="p-8">
                                {activeTracking ? (
                                    <div className="text-center space-y-6">
                                        <div className="relative inline-block">
                                            <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 shadow-inner ${activeTracking.state === 'completed' ? 'border-blue-200 bg-white' : 'border-green-200 bg-white animate-pulse'}`}>
                                                <span className={`text-4xl font-black ${activeTracking.state === 'completed' ? 'text-blue-600' : 'text-green-600'}`}>
                                                    {activeTracking.state === 'completed' ? '100%' : 'ON'}
                                                </span>
                                            </div>
                                            {activeTracking.state !== 'completed' && (
                                                <div className="absolute top-0 right-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-ping"></div>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">
                                                {activeTracking.contact_name || activeTracking.phone_number || "Bilinmeyen Hedef"}
                                            </h3>
                                            <div className={`text-lg font-medium mt-1 ${activeTracking.state === 'completed' ? 'text-blue-600' : 'text-green-600'}`}>
                                                {activeTracking.state === 'waiting' && (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <Clock className="animate-pulse" size={20} /> Analiz Bekleniyor...
                                                    </span>
                                                )}
                                                {activeTracking.state === 'initializing' && '🚀 Sistem Başlatılıyor...'}
                                                {activeTracking.state === 'preparing' && (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <Loader2 className="animate-spin" size={20} /> WhatsApp Hazırlanıyor...
                                                    </span>
                                                )}
                                                {activeTracking.state === 'running' && (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <Activity className="animate-pulse" size={20} /> Şu An İzleniyor
                                                    </span>
                                                )}
                                                {activeTracking.state === 'completed' && (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <CheckCircle size={20} /> Takip Tamamlandı
                                                    </span>
                                                )}
                                            </div>

                                            {/* Start/End Time Display */}
                                            {activeTracking.start_time && activeTracking.end_time && (
                                                <div className="flex gap-3 justify-center mt-2 text-xs text-gray-500 bg-gray-100/50 py-1.5 px-4 rounded-full inline-flex border border-gray-100">
                                                    <span>Başlangıç: <strong>{activeTracking.start_time}</strong></span>
                                                    <span className="text-gray-300">|</span>
                                                    <span>Bitiş: <strong>{activeTracking.end_time}</strong></span>
                                                </div>
                                            )}

                                            <p className="text-gray-500 mt-2 text-sm">{activeTracking.message}</p>
                                        </div>

                                        {activeTracking.state !== 'completed' && (
                                            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                                                <div>
                                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                                                        {(activeTracking.state === 'waiting' || activeTracking.state === 'planned') ? 'İZLENMEYE KALAN SÜRE' : 'KALAN SÜRE'}
                                                    </div>
                                                    <div className="text-xl font-mono text-gray-800">
                                                        {(activeTracking.state === 'preparing' || activeTracking.state === 'initializing') ? (
                                                            <span className="text-sm italic text-gray-400">Hazırlanıyor...</span>
                                                        ) : (
                                                            <>
                                                                {Math.floor(Math.max(0, activeTracking.remaining) / 60)}m {String(Math.floor(Math.max(0, activeTracking.remaining) % 60)).padStart(2, '0')}s
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Durum</div>
                                                    <div className={`text-xl font-bold ${activeTracking.state === 'waiting' || activeTracking.state === 'planned' ? 'text-yellow-500' :
                                                        (activeTracking.state === 'preparing' || activeTracking.state === 'initializing') ? 'text-blue-500' :
                                                            activeTracking.sub_state === 'ONLINE' ? 'text-green-500' :
                                                                activeTracking.sub_state === 'TYPING' ? 'text-green-600' :
                                                                    activeTracking.sub_state === 'RECORDING' ? 'text-blue-600' :
                                                                        'text-gray-400'}`}>
                                                        {
                                                            (activeTracking.state === 'waiting' || activeTracking.state === 'planned') ? 'Bekleniyor' :
                                                                (activeTracking.state === 'preparing' || activeTracking.state === 'initializing') ? 'Açılıyor' :
                                                                    activeTracking.sub_state || 'Çevrimdışı'
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-gray-200">
                                            {activeTracking.state === 'completed' ? (
                                                <button
                                                    onClick={handleDismiss}
                                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow-lg shadow-blue-200"
                                                >
                                                    Raporu Kapat & Sıfırla
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleStopTracking}
                                                    className="flex items-center gap-2 mx-auto px-6 py-2 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 rounded-lg font-bold transition-colors"
                                                >
                                                    <StopCircle size={18} /> Takibi İptal Et
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                            <Siren size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Aktif Takip Yok</h3>
                                        <p className="text-gray-500 mt-2 max-w-sm mx-auto text-sm">
                                            Sistem şu an boşta. Aşağıdaki panelden yeni bir takip görevi başlatabilirsiniz.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* New Task Form */}
                        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-indigo-100 transition-colors">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Play className="text-indigo-600 fill-indigo-600" size={20} /> Yeni Görev Başlat
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Hedef Telefon Numarası</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={trackingPhone}
                                            onChange={(e) => setTrackingPhone(e.target.value)}
                                            placeholder="905551234567"
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-lg"
                                        />
                                        <span className="absolute left-4 top-3.5 text-gray-400 font-bold">+</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                        <AlertTriangle size={12} /> Rehbere kayıtlı olmasa bile izlenebilir. (Ülke kodu zorunlu)
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Başlangıç</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Bitiş</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <input
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input type="checkbox" className="mt-1 w-4 h-4 text-indigo-600 rounded" checked={trackingConfirmed} onChange={e => setTrackingConfirmed(e.target.checked)} />
                                        <span className="text-sm text-indigo-900 leading-snug">Hedefin <strong>Son Görülme / Çevrimiçi</strong> bilgisi açık olmalı.</span>
                                    </label>
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input type="checkbox" className="mt-1 w-4 h-4 text-indigo-600 rounded" checked={selfOnlineConfirmed} onChange={e => setSelfOnlineConfirmed(e.target.checked)} />
                                        <span className="text-sm text-indigo-900 leading-snug">Kendi WhatsApp'ınızda <strong>Çevrimiçi</strong> durumunuz açık olmalı.</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-indigo-100">
                                        <div className="relative flex items-center">
                                            <input type="checkbox" className="peer sr-only" checked={notifyOnOnline} onChange={e => handleNotifyChange(e.target.checked)} />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                        </div>
                                        <span className={`text-sm font-bold ${notifyOnOnline ? 'text-purple-700' : 'text-gray-500'}`}>
                                            Hedef Çevrimiçi Olunca Bana Haber Ver 🔔
                                        </span>
                                    </label>
                                </div>

                                <button
                                    onClick={handleStartTracking}
                                    disabled={!trackingPhone || !trackingConfirmed || !selfOnlineConfirmed || trackingLoading || (!!activeTracking && ['initializing', 'preparing', 'planned', 'running', 'waiting'].includes(activeTracking.state))}
                                    className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2
                                        ${!trackingPhone || !trackingConfirmed || !selfOnlineConfirmed || trackingLoading || (!!activeTracking && ['initializing', 'preparing', 'planned', 'running', 'waiting'].includes(activeTracking.state))
                                            ? 'bg-gray-400 cursor-not-allowed shadow-none'
                                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                                        }`}
                                >
                                    {trackingLoading ? <Loader2 className="animate-spin" /> :
                                        activeTracking?.state === 'preparing' || activeTracking?.state === 'initializing' ? <Loader2 className="animate-spin" /> :
                                            activeTracking?.state === 'planned' || activeTracking?.state === 'waiting' ? <Clock className="animate-pulse" /> :
                                                activeTracking?.state === 'running' ? <Activity className="animate-pulse" /> :
                                                    <Activity />}

                                    {trackingLoading ? 'BAŞLATILIYOR...' :
                                        activeTracking?.state === 'preparing' || activeTracking?.state === 'initializing' ? 'HAZIRLANIYOR (SOHBET AÇILIYOR)...' :
                                            activeTracking?.state === 'planned' || activeTracking?.state === 'waiting' ? `ANALİZ BEKLENİYOR (${activeTracking.remaining}sn)...` :
                                                activeTracking?.state === 'running' ? 'TAKİP EDİLİYOR...' :
                                                    'TAKİBİ BAŞLAT'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: HISTORY */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 h-full max-h-[800px] overflow-y-auto">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
                                <span>Geçmiş Kayıtlar</span>
                                <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-full text-gray-500">{trackingHistory.length}</span>
                            </h3>

                            {trackingHistory.length === 0 ? (
                                <div className="text-center text-gray-400 py-8 text-sm">
                                    Henüz kayıt yok.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {trackingHistory.map((record) => (
                                        <div
                                            key={record.id}
                                            onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                                            className="group bg-white hover:bg-blue-50/50 p-4 rounded-xl border border-gray-200 hover:border-blue-200 transition-all shadow-sm relative cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold text-gray-900 text-lg">
                                                        {record.contact_name || record.phone_number}
                                                    </div>
                                                    {record.contact_name && <div className="text-sm text-gray-500 font-mono mt-1">{record.phone_number}</div>}
                                                </div>

                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${record.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        record.status === 'running' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {record.status}
                                                    </span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteRecord(record.id); }}
                                                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                        title="Kaydı Sil"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="text-xs text-gray-500 space-y-1 mt-3">
                                                <div className="flex justify-between">
                                                    <span>Başlangıç:</span>
                                                    <span className="font-medium text-gray-700">{new Date(record.start_time).toLocaleTimeString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Bitiş:</span>
                                                    <span className="font-medium text-gray-700">{record.end_time ? new Date(record.end_time).toLocaleTimeString() : '-'}</span>
                                                </div>
                                                <div className="flex justify-between pt-2 border-t border-gray-100 mt-2">
                                                    <span>Toplam Çevrimiçi Süre:</span>
                                                    <span className="font-bold text-indigo-600">
                                                        {record.duration_seconds
                                                            ? `${Math.floor(record.duration_seconds / 60)} dk ${record.duration_seconds % 60} sn`
                                                            : (record.duration_minutes ? `${record.duration_minutes} dk` : '0 dk')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* EXPANDED DETAILS: Interval List */}
                                            {expandedRecord === record.id && record.online_intervals && record.online_intervals.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-blue-100 animate-in slide-in-from-top-2">
                                                    <h4 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-2">
                                                        <Clock size={12} /> Çevrimiçi Hareketleri
                                                    </h4>
                                                    <div className="space-y-1 bg-blue-50 p-2 rounded-lg">
                                                        {record.online_intervals.map((interval: any, idx: number) => {
                                                            const start = new Date(interval.start);
                                                            const end = interval.end ? new Date(interval.end) : null;
                                                            const diffMs = end ? end.getTime() - start.getTime() : 0;
                                                            const diffSec = Math.floor(diffMs / 1000);

                                                            return (
                                                                <div key={idx} className="flex justify-between text-xs text-blue-900 border-b border-blue-100 last:border-0 pb-1 last:pb-0">
                                                                    <span className="font-mono">{start.toLocaleTimeString()} - {end ? end.toLocaleTimeString() : '...'}</span>
                                                                    <span className="font-bold opacity-70">
                                                                        {diffSec > 60 ? `${Math.floor(diffSec / 60)}dk ${diffSec % 60}sn` : `${diffSec}sn`}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
