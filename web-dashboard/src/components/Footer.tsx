import { Github, Linkedin, Mail, Heart } from 'lucide-react';

export function Footer() {
    return (
        <footer className="w-full bg-slate-950 text-slate-300 py-8 border-t border-slate-800/50 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-900/20">H</div>
                            <span className="text-xl font-bold text-white tracking-tight">HanChat</span>
                        </div>
                        <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                            Yapay zeka gücüyle WhatsApp sohbetlerinizi analiz edin, gizli kalmış detayları ve duygusal ipuçlarını keşfedin.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Platform</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/" className="hover:text-blue-400 transition-colors flex items-center gap-2">Ana Sayfa</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2">Özellikler</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2">Gizlilik Politikası</a></li>
                        </ul>
                    </div>

                    {/* Contact & Social */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bağlantıda Kalın</h3>
                        <div className="flex gap-3">
                            <a href="https://github.com/YakuphanBlmz" target="_blank" rel="noreferrer" className="bg-slate-900 p-2.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all border border-slate-800 group">
                                <Github size={18} className="group-hover:scale-110 transition-transform" />
                            </a>
                            <a href="https://www.linkedin.com/in/yakuphan-bilmez/" target="_blank" rel="noreferrer" className="bg-slate-900 p-2.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all border border-slate-800 group">
                                <Linkedin size={18} className="group-hover:scale-110 transition-transform" />
                            </a>
                            <a href="mailto:hanwhatschat@gmail.com" className="bg-slate-900 p-2.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all border border-slate-800 group">
                                <Mail size={18} className="group-hover:scale-110 transition-transform" />
                            </a>
                        </div>
                        <p className="text-xs text-slate-500">
                            İstanbul, Türkiye
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
                    <p>© 2026 HanChat. Tüm hakları saklıdır.</p>
                    <div className="flex items-center gap-1.5 bg-slate-900 py-1.5 px-3 rounded-full border border-slate-800">
                        <span>Made with</span>
                        <Heart size={10} className="text-red-500 fill-current animate-pulse" />
                        <span>by <span className="text-slate-300 font-semibold">Yakuphan Bilmez</span></span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
