import { useState, useEffect } from 'react';
import { Trash2, Shield, ShieldAlert, User, CheckCircle } from 'lucide-react';
import { API_URL } from '../services/api';

interface UserData {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
    created_at: string;
}

export function AdminPanel() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_URL}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                setError('Yetkisiz erişim veya sunucu hatası.');
            }
        } catch (err) {
            setError('Sunucuya bağlanılamadı.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: number) => {
        if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setUsers(users.filter(u => u.id !== userId));
            } else {
                const err = await response.json();
                alert(err.detail || 'Silinemedi');
            }
        } catch (e) {
            alert('Hata oluştu');
        }
    };

    if (loading) return <div className="text-white text-center p-10">Yükleniyor...</div>;
    if (error) return <div className="text-red-400 text-center p-10 flex flex-col items-center gap-2"><ShieldAlert size={48} />{error}</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center gap-3 mb-8">
                <Shield className="text-indigo-400" size={32} />
                <h2 className="text-3xl font-bold text-white">Yönetim Paneli</h2>
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/10 text-gray-300">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Kullanıcı Adı</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Rol</th>
                            <th className="p-4">Kayıt Tarihi</th>
                            <th className="p-4">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-200 divide-y divide-white/10">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-mono text-sm text-gray-400">#{user.id}</td>
                                <td className="p-4 font-bold flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs text-white">
                                        {user.username.substring(0, 2).toUpperCase()}
                                    </div>
                                    {user.username}
                                </td>
                                <td className="p-4 text-gray-400">{user.email}</td>
                                <td className="p-4">
                                    {user.is_admin ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                                            <Shield size={12} /> ADMIN
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-500/20 text-gray-400 text-xs font-bold border border-gray-500/30">
                                            <User size={12} /> USER
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-sm text-gray-500">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    {!user.is_admin && (
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                            title="Kullanıcıyı Sil"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        Kullanıcı bulunamadı.
                    </div>
                )}
            </div>
        </div>
    );
}
