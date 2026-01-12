import { Mail, MapPin, Send, Github, Linkedin, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { API_URL } from '../services/api';

// Custom WhatsApp Icon Component
const WhatsAppIcon = ({ size = 24, className = "" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0 .5-.5l1.4-1.4a.5.5 0 0 0 0-.7l-.7-.7a.5.5 0 0 0-.7 0l-1.4 1.4a.5.5 0 0 0-.5.5V10z" opacity="0" /> {/* Stylistic filler, using path simulation */}
    </svg>
);

export function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        subject: 'Genel Soru',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    const confirmSend = async () => {
        setShowConfirm(false);
        setStatus('loading');
        setErrorMessage('');

        try {
            const response = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', surname: '', email: '', subject: 'Genel Soru', message: '' });
            } else {
                const errorText = await response.text();
                let displayError = "Bir hata oluştu. Lütfen tekrar deneyin.";
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.detail) displayError = `Hata: ${errorJson.detail}`;
                } catch {
                    // If not JSON, use default or raw text if short
                    if (errorText.length < 50) displayError = `Hata: ${errorText}`;
                }

                console.error("Contact form failed:", errorText);
                setErrorMessage(displayError);
                setStatus('error');
            }
        } catch (error) {
            console.error(error);
            setErrorMessage("Sunucuya bağlanılamadı.");
            setStatus('error');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-5xl mx-auto relative">
            {/* Unified Main Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                {/* Header Section */}
                <div className="text-center pt-12 pb-8 px-8 border-b border-slate-50">
                    <h2 className="text-3xl font-bold text-slate-900">İletişim</h2>
                    <p className="text-slate-500 mt-2 max-w-lg mx-auto">Sorularınız, önerileriniz veya iş birliği için bize ulaşın.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Left Side: Contact Info */}
                    <div className="p-8 md:p-12 bg-slate-50/50 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-8">İletişim Bilgileri</h3>

                            <div className="space-y-8">
                                <div className="flex items-start gap-5 group">
                                    <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300 text-blue-600">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 mb-1">E-Posta</div>
                                        <a href="mailto:hanwhatschat@gmail.com" className="text-slate-500 hover:text-blue-600 transition-colors">hanwhatschat@gmail.com</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5 group">
                                    <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300 text-green-600">
                                        <WhatsAppIcon size={24} />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 mb-1">WhatsApp</div>
                                        <a href="https://wa.me/905468143710" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-green-600 transition-colors">+90 546 814 37 10</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5 group">
                                    <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300 text-purple-600">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 mb-1">Konum</div>
                                        <p className="text-slate-500">İstanbul, Türkiye</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-200/60">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">SOSYAL MEDYA</h4>
                            <div className="flex gap-4">
                                <a href="https://github.com/YakuphanBlmz" target="_blank" rel="noreferrer" className="p-3 bg-white rounded-xl shadow-sm hover:bg-slate-800 hover:text-white text-slate-600 transition-all hover:-translate-y-1">
                                    <Github size={20} />
                                </a>
                                <a href="https://www.linkedin.com/in/yakuphan-bilmez/" target="_blank" rel="noreferrer" className="p-3 bg-white rounded-xl shadow-sm hover:bg-blue-600 hover:text-white text-slate-600 transition-all hover:-translate-y-1">
                                    <Linkedin size={20} />
                                </a>
                                <a href="https://wa.me/905468143710" target="_blank" rel="noreferrer" className="p-3 bg-white rounded-xl shadow-sm hover:bg-green-500 hover:text-white text-slate-600 transition-all hover:-translate-y-1">
                                    <WhatsAppIcon size={20} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Contact Form */}
                    <div className="p-8 md:p-12 relative">
                        <h3 className="text-lg font-bold text-slate-900 mb-8">Mesaj Gönder</h3>

                        {status === 'success' ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-in fade-in zoom-in">
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle className="text-green-600" size={40} />
                                </div>
                                <h4 className="text-2xl font-bold text-slate-900 mb-3">Mesajınız İletildi!</h4>
                                <p className="text-slate-500 mb-8 max-w-xs mx-auto">Bizimle iletişime geçtiğiniz için teşekkürler. En kısa sürede size dönüş yapacağız.</p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                >
                                    Yeni Mesaj Gönder
                                </button>
                            </div>
                        ) : (
                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Adınız</label>
                                        <input
                                            type="text" name="name" required
                                            value={formData.name} onChange={handleChange}
                                            className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                            placeholder="Adınız"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Soyadınız</label>
                                        <input
                                            type="text" name="surname" required
                                            value={formData.surname} onChange={handleChange}
                                            className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                            placeholder="Soyadınız"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">E-Posta Adresi</label>
                                    <input
                                        type="email" name="email" required
                                        value={formData.email} onChange={handleChange}
                                        className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                        placeholder="ornek@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Konu</label>
                                    <div className="relative">
                                        <select
                                            name="subject" required
                                            value={formData.subject} onChange={handleChange}
                                            className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option>Genel Soru</option>
                                            <option>Teknik Destek</option>
                                            <option>Öneri / Geri Bildirim</option>
                                            <option>İş Birliği</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Mesajınız</label>
                                    <textarea
                                        name="message" required
                                        value={formData.message} onChange={handleChange}
                                        className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all min-h-[140px] placeholder:text-slate-400 resize-none"
                                        placeholder="Size nasıl yardımcı olabiliriz?"
                                    ></textarea>
                                </div>

                                {status === 'error' && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                        <span>{errorMessage || "Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin."}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className={`w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                                >
                                    {status === 'loading' ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Gönder
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                                <Send size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Mesajı Gönder?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Mesajınızı şimdi göndermek istediğinize emin misiniz?
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={confirmSend}
                                    className="flex-1 py-2.5 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                >
                                    Evet, Gönder
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
