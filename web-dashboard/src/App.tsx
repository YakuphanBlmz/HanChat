import { useState, useEffect } from 'react';
import { FunAnalysis } from './components/FunAnalysis';
import { Contact } from './components/Contact';
import { BarChart2, LogOut, Mail, Shield } from 'lucide-react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { AdminPanel } from './components/AdminPanel';

type View = 'fun' | 'agent' | 'flirt' | 'contact' | 'admin';
type AuthState = 'login' | 'register' | 'authenticated' | 'forgot-password' | 'reset-password';

function App() {
  const [currentView, setCurrentView] = useState<View>('fun');
  const [authState, setAuthState] = useState<AuthState>('login');
  const [username, setUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check for token on load
  useEffect(() => {
    // Check if valid reset URL (simple router logic)
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // If URL is /reset-password or has token passed, show reset screen
    if (path === '/reset-password' || params.get('token')) {
      setAuthState('reset-password');
      return;
    }

    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('username');
    if (token && user) {
      setUsername(user);
      setIsAdmin(localStorage.getItem('is_admin') === 'true');
      setAuthState('authenticated');
    }
  }, []);

  const handleLoginSuccess = (token: string, user: string, admin: boolean) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('username', user);
    localStorage.setItem('is_admin', String(admin));
    setUsername(user);
    setIsAdmin(admin);
    setAuthState('authenticated');
    // Clear URL if we were on reset page
    if (window.location.pathname === '/reset-password') {
      window.history.replaceState({}, '', '/');
    }
  };

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('is_admin');
    setUsername(null);
    setIsAdmin(false);
    setAuthState('login');
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  if (authState === 'login') {
    return <Login
      onLoginSuccess={handleLoginSuccess}
      onSwitchToRegister={() => setAuthState('register')}
      onSwitchToForgotPassword={() => setAuthState('forgot-password')}
    />;
  }

  if (authState === 'register') {
    return <Register onRegisterSuccess={() => setAuthState('login')} onSwitchToLogin={() => setAuthState('login')} />;
  }

  if (authState === 'forgot-password') {
    return <ForgotPassword onSwitchToLogin={() => setAuthState('login')} />;
  }

  if (authState === 'reset-password') {
    return <ResetPassword onResetSuccess={() => setAuthState('login')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-12 relative">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="HanChat Logo" className="w-40 h-40 object-contain scale-120" />
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-[#ADE0E1]">HanChat</h1>
                <p className="text-slate-400 text-sm">
                  {currentView === 'fun' ? 'WhatsApp Analiz Modu' :
                    currentView === 'contact' ? 'İletişim & Destek' :
                      currentView === 'agent' ? 'WhatsApp Ajan & Dedektif Modu' :
                        'WhatsApp Flört & Aşk Modu'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden sm:block text-right">
                <div className="text-sm text-slate-400">Hoş geldin,</div>
                <div className="font-medium text-[#ADE0E1]">{username}</div>
              </div>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
                title="Çıkış Yap"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-4 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setCurrentView('fun')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${currentView === 'fun'
                ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/10'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
            >
              <BarChart2 size={18} />
              Analiz Modu
            </button>

            <button
              onClick={() => setCurrentView('contact')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${currentView === 'contact'
                ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/10'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
            >
              <Mail size={18} />
              İletişim
            </button>

            {isAdmin && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${currentView === 'admin'
                  ? 'bg-red-500/20 text-red-300 shadow-lg backdrop-blur-sm border border-red-500/30'
                  : 'text-slate-400 hover:text-red-300 hover:bg-red-500/10'
                  }`}
              >
                <Shield size={18} />
                Yönetim Paneli
              </button>
            )}
          </div>
        </div>
      </div>

      import {Footer} from './components/Footer';

      // ... existing imports ...

      // ... inside App return ...

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 space-y-8 flex-grow w-full z-10">
        {currentView === 'fun' && <FunAnalysis />}
        {currentView === 'contact' && <Contact />}
        {currentView === 'admin' && <AdminPanel />}
      </main>

      <Footer />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <LogOut className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Çıkış Yapılıyor</h3>
              <p className="text-gray-500 text-sm mb-6">Hesabınızdan çıkış yapmak istediğinize emin misiniz?</p>

              <div className="flex gap-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version Indicator */}
      <div className="absolute bottom-2 right-4 text-xs text-slate-400/50">v1.2</div>
    </div>
  );
}

export default App;
