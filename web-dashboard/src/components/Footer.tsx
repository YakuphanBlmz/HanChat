import { Github, Linkedin, Twitter, Mail, Heart } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 py-4 border-t border-slate-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
                    {/* Brand Section */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white font-bold text-lg">H</div>
                            <span className="text-xl font-bold text-white tracking-tight">HanChat</span>
                        </div>
                        <p className="text-[10px] text-slate-400 max-w-xs">
                            Yapay zeka bitirim ikili analizi.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-1">
                        <h3 className="text-[10px] font-bold text-white uppercase tracking-wider">Hızlı Linkler</h3>
                        <ul className="space-y-0.5 text-[10px]">
                            <li><a href="/" className="hover:text-blue-400 transition-colors">Ana Sayfa</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Gizlilik</a></li>
                        </ul>
                    </div>

                    {/* Contact & Social */}
                    <div className="space-y-1">
                        <h3 className="text-[10px] font-bold text-white uppercase tracking-wider">İletişim</h3>
                        <div className="flex gap-2">
                            <a href="https://github.com/YakuphanBlmz" target="_blank" rel="noreferrer" className="bg-slate-800 p-1 rounded-md hover:bg-blue-600 hover:text-white transition-all">
                                <Github size={14} />
                            </a>
                            <a href="https://www.linkedin.com/in/yakuphan-bilmez/" target="_blank" rel="noreferrer" className="bg-slate-800 p-1 rounded-md hover:bg-blue-600 hover:text-white transition-all">
                                <Linkedin size={14} />
                            </a>
                            <a href="mailto:hanwhatschat@gmail.com" className="bg-slate-800 p-1 rounded-md hover:bg-blue-600 hover:text-white transition-all">
                                <Mail size={14} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-2 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-2 text-[10px] font-medium text-slate-500">
                    <p>© 2026 HanChat.</p>
                    <div className="flex items-center gap-1">
                        Made with <Heart size={10} className="text-red-500 fill-current" /> by <span className="text-slate-300">Yakuphan Bilmez</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
