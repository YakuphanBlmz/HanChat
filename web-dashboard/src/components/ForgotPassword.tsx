import { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { API_URL } from '../services/api';

interface ForgotPasswordProps {
    onSwitchToLogin: () => void;
}

export function ForgotPassword({ onSwitchToLogin }: ForgotPasswordProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            // For security, even if failed (user not found), we might show success or generic msg.
            // But if 500, it's an error.
            if (!response.ok && response.status !== 500) {
                // Usually API returns 200 even if user not found for security, 
                // unless it's a validation error.
                throw new Error(data.detail || 'İşlem başarısız');
            }

            setStatus('success');
            setMessage('Eğer bu adrese kayıtlı bir hesabımız varsa, şifre sıfırlama bağlantısını içeren bir e-posta gönderdik. Lütfen kutunuzu (ve spam klasörünü) kontrol edin.');

        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Bir hata oluştu.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
                <div className="text-center">
                    <img src="/logo.png" alt="HanChat Logo" className="mx-auto h-24 w-24 object-contain" />
                    <h2 className="mt-6 text-3xl font-bold text-white">Şifremi Unuttum</h2>
                    <p className="mt-2 text-sm text-slate-400">
                        E-posta adresinizi girin, size sıfırlama bağlantısı gönderelim.
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-green-900/50 border border-green-800 rounded-lg text-green-200 text-sm">
                            {message}
                        </div>
                        <button
                            onClick={onSwitchToLogin}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-slate-700 hover:bg-slate-600 transition-all"
                        >
                            Giriş Ekranına Dön
                        </button>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {status === 'error' && (
                            <div className="p-3 text-sm text-red-200 bg-red-900/50 border border-red-800 rounded-lg">
                                {message}
                            </div>
                        )}

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="E-posta Adresi"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {status === 'loading' ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
                            {!status.startsWith('load') && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={onSwitchToLogin}
                                className="flex items-center justify-center gap-2 mx-auto text-sm font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Giriş Yap'a Dön
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
