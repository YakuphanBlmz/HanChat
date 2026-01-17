import { useState, useEffect } from 'react';
import { get, del } from 'idb-keyval'; // IndexedDB helper
import { api } from './services/api';
import { FunAnalysis } from './components/FunAnalysis';
import { Contact } from './components/Contact';
import { BarChart2, LogOut, Mail, Shield } from 'lucide-react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfUse } from './components/TermsOfUse';
import { Features } from './components/Features';
import { StoryViewer } from './components/StoryViewer';
import { HowToUse } from './components/HowToUse';
import { AutoLogoutHandler } from './components/AutoLogoutHandler';

type View = 'fun' | 'agent' | 'flirt' | 'contact' | 'admin';
type AuthState = 'login' | 'register' | 'authenticated' | 'forgot-password' | 'reset-password';

function App() {
  const [currentView, setCurrentView] = useState<View>('fun');
  const [authState, setAuthState] = useState<AuthState>('login');
  const [username, setUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfUse, setShowTermsOfUse] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [analysisStats, setAnalysisStats] = useState<any>(null);
  const [sharedFile, setSharedFile] = useState<File | null>(null);

  const handleAnalysisComplete = (stats: any) => {
    setAnalysisStats(stats);
    setShowStory(true);
  };

  // Check for PWA Shared File
  useEffect(() => {
    const checkSharedFile = async () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('shared_action') === 'true') {
        try {
          const file = await get('shared-file');
          if (file) {
            console.log("Found shared file:", file.name);
            setSharedFile(file);
            setCurrentView('fun');
            // Clean up
            await del('shared-file');
            // Remove query param
            window.history.replaceState({}, '', '/');
          }
        } catch (err) {
          console.error("Error reading shared file:", err);
        }
      }
    };
    checkSharedFile();
  }, []);

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

    // Check for legacy /privacy route
    if (path === '/privacy') {
      setShowPrivacyPolicy(true);
      window.history.replaceState(null, '', '/');
    }

    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('username');

    if (token && user) {
      // Optimistically set auth state
      setUsername(user);
      setIsAdmin(localStorage.getItem('is_admin') === 'true');
      setAuthState('authenticated');

      // Verify with backend immediately
      api.verifySession().catch((err) => {
        console.warn("Session verification failed:", err);
        // Explicitly check for 401 and logout
        if (err.response && err.response.status === 401) {
          handleLogout();
        }
      });
    }

    return () => { };
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

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('token'); // Legacy cleanup

    setIsAdmin(false);
    setUsername(null);
    setAuthState('login');
    setShowLogoutConfirm(false);

    // Also reset view
    setCurrentView('fun');
  };

  const confirmLogout = handleLogout;

  // Listen for global unauthorized events
  useEffect(() => {
    const handleUnauthorized = () => {
      handleLogout();
      alert("Oturumunuzun süresi doldu veya hesabınızla ilgili bir değişiklik yapıldı. Lütfen tekrar giriş yapın.");
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 relative flex flex-col">
      <AutoLogoutHandler
        isActive={authState === 'authenticated'}
        onLogout={confirmLogout}
      />
      {/* Hero Header */}
      {/* Hero Header */}
      <div className="bg-[#0B1120] text-white pb-32 border-b border-white/5 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-white/5 p-0 rounded-2xl border border-white/10 shadow-xl backdrop-blur-sm overflow-hidden w-16 h-16 flex items-center justify-center">
                <img src="/logo.png" alt="HanChat Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                    HanChat
                  </span>
                </h1>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <p className="text-slate-400">
                    {currentView === 'fun' ? 'WhatsApp Analiz Modu' :
                      currentView === 'contact' ? 'İletişim & Destek' :
                        currentView === 'admin' ? 'Yönetim Paneli' :
                          currentView === 'agent' ? 'Ajan & Dedektif Modu' :
                            'Flört & Aşk Modu'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden sm:block text-right">
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Hoş geldin</div>
                <div className="font-bold text-white text-lg leading-none">{username}</div>
              </div>

              <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="group relative p-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all duration-300 border border-white/5 hover:border-red-500/20"
                title="Çıkış Yap"
              >
                <LogOut size={20} className="transition-transform group-hover:-translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            <button
              onClick={() => setCurrentView('fun')}
              className={`flex items-center justify-center w-40 gap-2.5 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 whitespace-nowrap border ${currentView === 'fun'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border-blue-500'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border-white/5 hover:border-white/10'
                }`}
            >
              <BarChart2 size={18} />
              Analiz Modu
            </button>

            <button
              onClick={() => setCurrentView('contact')}
              className={`flex items-center justify-center w-40 gap-2.5 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 whitespace-nowrap border ${currentView === 'contact'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border-purple-500'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border-white/5 hover:border-white/10'
                }`}
            >
              <Mail size={18} />
              İletişim
            </button>

            <button
              onClick={() => setShowHowToUse(true)}
              className="flex items-center justify-center w-40 gap-2.5 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 whitespace-nowrap border bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border-white/5 hover:border-white/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="min-w-[18px]"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
              Nasıl Kullanılır
            </button>

            {isAdmin && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`flex items-center justify-center w-40 gap-2.5 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 whitespace-nowrap border ${currentView === 'admin'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/25 border-red-500'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border-white/5 hover:border-white/10'
                  }`}
              >
                <Shield size={18} />
                Yönetim Paneli
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 space-y-8 flex-grow w-full z-10 mb-8">
        {currentView === 'fun' && <FunAnalysis onAnalysisComplete={handleAnalysisComplete} initialFile={sharedFile} />}
        {currentView === 'contact' && <Contact />}
        {currentView === 'admin' && <AdminPanel />}
      </main>

      <Footer
        onOpenPrivacy={() => setShowPrivacyPolicy(true)}
        onOpenTerms={() => setShowTermsOfUse(true)}
        onOpenFeatures={() => setShowFeatures(true)}
      />

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />
      )}

      {/* Terms of Use Modal */}
      {showTermsOfUse && (
        <TermsOfUse onClose={() => setShowTermsOfUse(false)} />
      )}

      {/* Features Modal */}
      {showFeatures && (
        <Features onClose={() => setShowFeatures(false)} />
      )}

      {/* How To Use Modal */}
      {showHowToUse && (
        <HowToUse onClose={() => setShowHowToUse(false)} />
      )}

      {/* Story Viewer Modal */}
      {showStory && analysisStats && (
        <StoryViewer stats={analysisStats} onClose={() => setShowStory(false)} />
      )}

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

      {/* Version Indicator removed - moved to Footer */}
    </div>
  );
}

export default App;
