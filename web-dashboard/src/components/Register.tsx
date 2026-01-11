import { useState } from 'react';
import { User, Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '../services/api';

interface RegisterProps {
    onRegisterSuccess: () => void;
    onSwitchToLogin: () => void;
}

export function Register({ onRegisterSuccess, onSwitchToLogin }: RegisterProps) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Şifreler eşleşmiyor!');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Şifre en az 6 karakter olmalı!');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Kayıt başarısız');
            }

            // Success
            setSuccess('Kayıt işleminiz başarıyla tamamlanmıştır! Giriş yapabilirsiniz.');
            setTimeout(() => {
                onRegisterSuccess();
            }, 2000); // 2 saniye sonra login'e veya success callback'e git
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="h-8 w-8 text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Hesap Oluştur</h2>
                    <p className="mt-2 text-sm text-slate-400">HanChat dünyasına katılın</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-3 text-sm text-red-200 bg-red-900/50 border border-red-800 rounded-lg">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 text-sm text-green-200 bg-green-900/50 border border-green-500 rounded-lg border-l-4">
                            {success}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Kullanıcı Adı"
                            />
                        </div>

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

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-10 py-3 border border-slate-600 rounded-lg bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Şifre"
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
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full pl-10 pr-10 py-3 border border-slate-600 rounded-lg bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Şifre Tekrar"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                        {!loading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-sm text-slate-400">
                        Zaten hesabınız var mı?{' '}
                        <button
                            onClick={onSwitchToLogin}
                            className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Giriş Yap
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
