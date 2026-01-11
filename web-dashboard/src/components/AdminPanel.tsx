import { useState, useEffect } from 'react';
import { FileText, Trash2, Shield, ShieldAlert, User, MessageCircle, X, Users, Activity } from 'lucide-react';
import { API_URL } from '../services/api';

interface UserData {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
    created_at: string;
}

interface MessageData {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
}

interface UploadData {
    id: number;
    filename: string;
    username: string;
    email: string;
    upload_time: string;
}

export function AdminPanel() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [uploads, setUploads] = useState<UploadData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Message Viewer State
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [messages, setMessages] = useState<MessageData[]>([]);
    const [msgLoading, setMsgLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([fetchUsers(), fetchUploads()]);
            setLoading(false);
        };
        fetchData();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                setError('Yetkisiz erişim veya sunucu hatası.');
            }
        } catch (err) {
            setError('Sunucuya bağlanılamadı.');
        }
    };

    const fetchUploads = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_URL}/admin/uploads`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setUploads(data);
            }
        } catch (err) {
            console.error("Failed to fetch uploads", err);
        }
    };

    const fetchMessages = async (user: UserData) => {
        setSelectedUser(user);
        setMsgLoading(true);
        setMessages([]);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_URL}/admin/users/${user.id}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (e) {
            console.error("Failed to fetch messages");
        } finally {
            setMsgLoading(false);
        }
    };

    const handleDelete = async (userId: number) => {
        if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setUsers(users.filter(u => u.id !== userId));
            } else {
                alert('Silinemedi');
            }
        } catch (e) {
            alert('Hata oluştu');
        }
    };

    if (loading) return <div className="text-white text-center p-10">Yükleniyor...</div>;
    if (error) return <div className="text-red-400 text-center p-10 flex flex-col items-center gap-2"><ShieldAlert size={48} />{error}</div>;

    return (
        <div className="max-w-6xl mx-auto mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-8">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <Shield className="text-indigo-600" size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Yönetim Paneli</h2>
                        <p className="text-gray-500 text-sm">Sistem durumu ve kullanıcı yönetimi</p>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-4 min-w-[180px]">
                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Users size={24} /></div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
                            <div className="text-xs text-gray-500">Toplam Kullanıcı</div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-4 min-w-[180px]">
                        <div className="p-3 bg-purple-100 rounded-lg text-purple-600"><Shield size={24} /></div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{users.filter(u => u.is_admin).length}</div>
                            <div className="text-xs text-gray-500">Yönetici</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* User List */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/20 ring-1 ring-black/5">
                <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Activity size={18} className="text-indigo-400" />
                        Kayıtlı Kullanıcılar
                    </h3>
                    <div className="text-xs text-slate-400 font-mono bg-black/30 px-3 py-1 rounded-full border border-white/5">
                        Tablo: users
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/30 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="p-4 pl-6">Kullanıcı</th>
                                <th className="p-4">Rol</th>
                                <th className="p-4">Kayıt Tarihi</th>
                                <th className="p-4 pr-6 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-200 divide-y divide-white/5">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                                                {user.username.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{user.username}</div>
                                                <div className="text-sm text-gray-300">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {user.is_admin ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                                                <Shield size={12} /> ADMIN
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/20 text-slate-400 text-xs font-bold border border-slate-500/30">
                                                <User size={12} /> USER
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm text-gray-300">
                                        {new Date(user.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => fetchMessages(user)}
                                                className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                                                title="Mesajları Gör"
                                            >
                                                <MessageCircle size={18} />
                                            </button>
                                            {!user.is_admin && (
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                                    title="Kullanıcıyı Sil"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Upload History Table */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-900 text-white backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10 ring-1 ring-black/5 mt-8">
                <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <FileText size={18} className="text-pink-400" />
                        Son Yüklenen Sohbet Dosyaları
                    </h3>
                    <div className="text-xs text-slate-400 font-mono bg-black/30 px-3 py-1 rounded-full border border-white/5">
                        Tablo: file_uploads
                    </div>
                </div>
                <div className="overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-black/30 text-slate-400 text-xs uppercase tracking-wider font-semibold sticky top-0 backdrop-blur-md">
                            <tr>
                                <th className="p-4 pl-6">Kullanıcı</th>
                                <th className="p-4">Dosya Adı</th>
                                <th className="p-4 text-right pr-6">Yükleme Tarihi</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-200 divide-y divide-white/5">
                            {uploads.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-slate-500">
                                        Henüz yüklenmiş dosya yok.
                                    </td>
                                </tr>
                            ) : (
                                uploads.map(file => (
                                    <tr key={file.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm">{file.username || 'Bilinmeyen'}</div>
                                                    <div className="text-xs text-slate-400">{file.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm font-mono text-indigo-200">
                                            {file.filename}
                                        </td>
                                        <td className="p-4 text-sm text-slate-300 text-right pr-6">
                                            {new Date(file.upload_time).toLocaleString('tr-TR')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Message Viewer Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                    <MessageCircle size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{selectedUser.username}</h3>
                                    <p className="text-xs text-slate-400">Sohbet Geçmişi</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
                            {msgLoading ? (
                                <div className="text-center py-10 text-gray-500">Mesajlar yükleniyor...</div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 flex flex-col items-center gap-2">
                                    <MessageCircle size={40} className="opacity-20" />
                                    <p>Bu kullanıcıya ait kaydedilmiş mesaj bulunamadı.</p>
                                </div>
                            ) : (
                                messages.map((msg, i) => (
                                    <div key={i} className={`flex flex-col ${msg.sender === selectedUser.username ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === selectedUser.username
                                            ? 'bg-emerald-600 text-white rounded-tr-none'
                                            : 'bg-slate-700 text-gray-200 rounded-tl-none'
                                            }`}>
                                            <div className="text-xs opacity-50 mb-1 font-bold">{msg.sender}</div>
                                            {msg.content}
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-1 px-1">
                                            {new Date(msg.timestamp).toLocaleString('tr-TR')}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
