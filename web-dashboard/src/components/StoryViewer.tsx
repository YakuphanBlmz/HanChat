
import { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';

interface StoryViewerProps {
    stats: any;
    onClose: () => void;
}

export function StoryViewer({ stats, onClose }: StoryViewerProps) {
    console.log("StoryViewer Mounted with stats:", stats);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    // Prepare slides based on stats
    const slides = [
        {
            type: 'intro',
            title: 'Sohbet Analizin Hazır!',
            emoji: '🚀',
            description: 'Bu sohbette neler dönmüş, gel beraber bakalım!',
            bg: 'from-blue-600 via-indigo-600 to-purple-800'
        },
        {
            type: 'stat',
            title: 'En Çok Konuşan',
            emoji: '🗣️',
            data: stats.titles?.['En Gevezesi 📢']?.winner || 'Bilinmiyor',
            sub: stats.titles?.['En Gevezesi 📢']?.value,
            desc: 'Hiç susmamış maşallah!',
            bg: 'from-orange-500 via-red-500 to-pink-600'
        },
        {
            type: 'stat',
            title: 'Gece Kuşu',
            emoji: '🦉',
            data: stats.titles?.['Gece Kuşu 🦉']?.winner || 'Bilinmiyor',
            sub: stats.titles?.['Gece Kuşu 🦉']?.value,
            desc: 'Geceleri uyumak nedir bilmiyor...',
            bg: 'from-slate-800 via-purple-900 to-black'
        },
        {
            type: 'stat',
            title: 'Emoji Canavarı',
            emoji: '😂',
            data: stats.titles?.['Emoji Canavarı 😂']?.winner || 'Bilinmiyor',
            sub: stats.titles?.['Emoji Canavarı 😂']?.value,
            desc: 'Duygularını emojilerle anlatmayı seviyor!',
            bg: 'from-yellow-400 via-orange-500 to-red-500'
        },
        {
            type: 'stat',
            title: 'Hızlı Cevapçı',
            emoji: '⚡',
            data: stats.titles?.['Hızlı Silahşör 🤠']?.winner || 'Bilinmiyor',
            sub: stats.titles?.['Hızlı Silahşör 🤠']?.value,
            desc: 'Yazarken parmakları alev alıyor!',
            bg: 'from-cyan-400 via-blue-500 to-indigo-600'
        },
        {
            type: 'outro',
            title: 'Tüm Detaylar İçin',
            emoji: '📊',
            description: 'Daha fazlası analiz panelinde seni bekliyor.',
            action: 'Devam Et',
            bg: 'from-emerald-500 via-teal-600 to-cyan-700'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((old) => {
                if (old >= 100) {
                    if (currentIndex < slides.length - 1) {
                        setCurrentIndex(prev => prev + 1);
                        return 0;
                    } else {
                        clearInterval(timer);
                        return 100;
                    }
                }
                return old + 1; // 1% every 30ms -> 3000ms total
            });
        }, 30); // 3 seconds per slide

        return () => clearInterval(timer);
    }, [currentIndex, slides.length]);

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setProgress(0);
        } else {
            onClose();
        }
    };

    const currentSlide = slides[currentIndex];

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-0 sm:p-4 backdrop-blur-xl">
            {/* Mobile-like Container */}
            <div className={`relative w-full h-full sm:w-[400px] sm:h-[800px] rounded-none sm:rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${currentSlide.bg} transition-colors duration-700`}>

                {/* Progress Bars */}
                <div className="absolute top-4 left-2 right-2 flex gap-1 z-20">
                    {slides.map((_, idx) => (
                        <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-white transition-all duration-100 ease-linear ${idx < currentIndex ? 'w-full' :
                                    idx === currentIndex ? `w-[${progress}%]` : 'w-0'
                                    }`}
                                style={{ width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header Actions */}
                <div className="absolute top-8 right-4 z-20 flex gap-4">
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={28} />
                    </button>
                </div>

                {/* Content */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                    onClick={handleNext}
                >
                    {/* Dynamic Animation Wrapper */}
                    <div key={currentIndex} className="animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500 w-full flex flex-col items-center">

                        <div className="text-8xl mb-6 drop-shadow-2xl animate-bounce-slow">
                            {currentSlide.emoji}
                        </div>

                        <h2 className="text-4xl font-black text-white mb-2 leading-tight drop-shadow-lg uppercase tracking-tight">
                            {currentSlide.title}
                        </h2>

                        {currentSlide.type === 'stat' && (
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl w-full my-6 transform transition hover:scale-105 duration-300">
                                <div className="text-3xl font-bold text-white mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                    {currentSlide.data}
                                </div>
                                <div className="text-white/90 font-mono text-lg opacity-80">
                                    {currentSlide.sub}
                                </div>
                            </div>
                        )}

                        <p className="text-xl text-white/90 font-medium leading-relaxed max-w-[80%]">
                            {currentSlide.type === 'stat' ? currentSlide.desc : currentSlide.description}
                        </p>

                        {currentSlide.type === 'outro' && (
                            <button
                                onClick={onClose}
                                className="mt-12 bg-white text-black font-bold py-4 px-10 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center gap-2 group"
                            >
                                {currentSlide.action}
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer Hint */}
                {currentSlide.type !== 'outro' && (
                    <div className="absolute bottom-8 w-full text-center text-white/50 text-sm animate-pulse">
                        İlerlemek için dokun
                    </div>
                )}
            </div>
        </div>
    );
}
