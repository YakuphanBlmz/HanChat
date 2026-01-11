import { useState } from 'react';
import { User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '../services/api';

interface LoginProps {
    onLoginSuccess: (token: string, username: string, isAdmin: boolean) => void;
    onSwitchToRegister: () => void;
    onSwitchToForgotPassword: () => void;
}

export function Login({ onLoginSuccess, onSwitchToRegister, onSwitchToForgotPassword }: LoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Giriş başarısız');
            }

            onLoginSuccess(data.access_token, data.username, data.is_admin);
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
                    <img src="/logo.png" alt="HanChat Logo" className="mx-auto h-24 w-24 object-contain" />
                    <h2 className="mt-6 text-3xl font-bold text-white">Hoş Geldiniz</h2>
                    <p className="mt-2 text-sm text-slate-400">Devam etmek için giriş yapın</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit} autoComplete="off">
                    {error && (
                        <div className="p-3 text-sm text-red-200 bg-red-900/50 border border-red-800 rounded-lg">
                            {error}
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
                                autoComplete="off"
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
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-slate-700"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-slate-400">
                                Beni hatırla
                            </label>
                        </div>
                        <button
                            type="button"
                            onClick={onSwitchToForgotPassword}
                            className="font-medium text-blue-400 hover:text-blue-300"
                        >
                            Şifremi unuttum
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                        {!loading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-sm text-slate-400">
                        Hesabınız yok mu?{' '}
                        <button
                            onClick={onSwitchToRegister}
                            className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Kayıt Olun
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
