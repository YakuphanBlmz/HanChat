import { useState, useEffect } from 'react';
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { API_URL } from '../services/api';

interface ResetPasswordProps {
    onResetSuccess: () => void;
}

export function ResetPassword({ onResetSuccess }: ResetPasswordProps) {
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Extract token from URL query params
        const params = new URLSearchParams(window.location.search);
        const t = params.get('token');
        if (t) {
            setToken(t);
        } else {
            setStatus('error');
            setMessage('Geçersiz veya eksik sıfırlama bağlantısı.');
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setStatus('error');
            setMessage('Şifreler eşleşmiyor.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password: newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Şifre sıfırlama başarısız.');
            }

            setStatus('success');
            setMessage('Şifreniz başarıyla güncellendi! Giriş yapabilirsiniz.');

            // Redirect or switch view after a delay
            setTimeout(() => {
                onResetSuccess();
            }, 3000);

        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Bir hata oluştu.');
        }
    };

    if (status === 'success') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-900">
                <div className="w-full max-w-md p-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 text-center">
                    <div className="mx-auto w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mb-6 border border-green-800">
                        <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Harika! 🎉</h2>
                    <p className="text-slate-300 mb-6">{message}</p>
                    <p className="text-sm text-slate-500">Giriş ekranına yönlendiriliyorsunuz...</p>
                    <button
                        onClick={onResetSuccess}
                        className="mt-6 text-blue-400 hover:text-blue-300 font-medium"
                    >
                        Hemen Giriş Yap
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
                <div className="text-center">
                    <img src="/logo.png" alt="HanChat Logo" className="mx-auto h-24 w-24 object-contain" />
                    <h2 className="mt-6 text-3xl font-bold text-white">Yeni Şifre Belirle</h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Lütfen yeni şifrenizi girin.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {status === 'error' && (
                        <div className="p-3 text-sm text-red-200 bg-red-900/50 border border-red-800 rounded-lg">
                            {message}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="block w-full pl-10 pr-10 py-3 border border-slate-600 rounded-lg bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Yeni Şifre"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full pl-10 pr-10 py-3 border border-slate-600 rounded-lg bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Şifreyi Onayla"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading' || !token}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {status === 'loading' ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                        {!status.startsWith('load') && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
