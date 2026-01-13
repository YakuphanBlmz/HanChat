import { Github, Heart } from 'lucide-react';

export function Footer() {
    return (
        <footer className="w-full bg-slate-900 border-t border-slate-800 mt-auto py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200 tracking-tight">HanChat</span>
                    <span className="text-xs text-slate-500">© 2026</span>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-500">
                    <span>Made with</span>
                    <Heart size={10} className="text-red-500 fill-current" />
                    <span>by Yakuphan Bilmez</span>
                </div>

                <div className="flex gap-4">
                    <a href="https://github.com/YakuphanBlmz" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                        <Github size={16} />
                    </a>
                </div>
            </div>
        </footer>
    );
}
