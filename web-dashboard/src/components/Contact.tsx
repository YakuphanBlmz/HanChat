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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

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
                setStatus('error');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white">İletişim</h2>
                <p className="text-slate-300 mt-2">Sorularınız, önerileriniz veya iş birliği için bize ulaşın.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Info Card */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-6">İletişim Bilgileri</h3>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 rounded-xl">
                                    <Mail className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">E-Posta</div>
                                    <a href="mailto:hanwhatschat@gmail.com" className="text-gray-500 hover:text-blue-600 transition-colors">hanwhatschat@gmail.com</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-green-50 rounded-xl">
                                    <WhatsAppIcon className="text-green-600" size={24} />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">WhatsApp</div>
                                    <a href="https://wa.me/905468143710" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-green-600 transition-colors">+90 546 814 37 10</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-purple-50 rounded-xl">
                                    <MapPin className="text-purple-600" size={24} />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">Konum</div>
                                    <p className="text-gray-500">İstanbul, Türkiye</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Sosyal Medya</h4>
                        <div className="flex gap-4">
                            <a href="https://github.com/YakuphanBlmz" target="_blank" rel="noreferrer" className="p-3 bg-gray-50 rounded-xl hover:bg-gray-800 hover:text-white text-gray-600 transition-colors">
                                <Github size={20} />
                            </a>
                            <a href="https://www.linkedin.com/in/yakuphan-bilmez/" target="_blank" rel="noreferrer" className="p-3 bg-gray-50 rounded-xl hover:bg-blue-600 hover:text-white text-gray-600 transition-colors">
                                <Linkedin size={20} />
                            </a>
                            <a href="https://wa.me/905468143710" target="_blank" rel="noreferrer" className="p-3 bg-gray-50 rounded-xl hover:bg-green-500 hover:text-white text-gray-600 transition-colors">
                                <WhatsAppIcon size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Mesaj Gönder</h3>

                    {status === 'success' ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-in fade-in zoom-in">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="text-green-600" size={32} />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">Mesajınız İletildi!</h4>
                            <p className="text-gray-500 mb-6">Bizimle iletişime geçtiğiniz için teşekkürler. En kısa sürede size dönüş yapacağız.</p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="text-indigo-600 font-medium hover:text-indigo-800"
                            >
                                Yeni Mesaj Gönder
                            </button>
                        </div>
                    ) : (
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Adınız</label>
                                    <input
                                        type="text" name="name" required
                                        value={formData.name} onChange={handleChange}
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                                        placeholder="Adınız"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Soyadınız</label>
                                    <input
                                        type="text" name="surname" required
                                        value={formData.surname} onChange={handleChange}
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                                        placeholder="Soyadınız"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta Adresi</label>
                                <input
                                    type="email" name="email" required
                                    value={formData.email} onChange={handleChange}
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                                    placeholder="ornek@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Konu</label>
                                <select
                                    name="subject" required
                                    value={formData.subject} onChange={handleChange}
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                                >
                                    <option>Genel Soru</option>
                                    <option>Teknik Destek</option>
                                    <option>Öneri / Geri Bildirim</option>
                                    <option>İş Birliği</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mesajınız</label>
                                <textarea
                                    name="message" required
                                    value={formData.message} onChange={handleChange}
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all min-h-[120px]"
                                    placeholder="Size nasıl yardımcı olabiliriz?"
                                ></textarea>
                            </div>

                            {status === 'error' && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    Bir hata oluştu, lütfen tekrar deneyin.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className={`w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
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
    );
}
