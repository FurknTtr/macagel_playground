import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch(`${API_BASE_URL}/maca-gel/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Bir hata oluştu');
                return;
            }

            setMessage('Şifre sıfırlama linki email adresine gönderildi. Lütfen kontrol edin.');
            setEmail('');
            // 3 saniye sonra login'e yönlendir
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError('Sunucuyla iletişim kurulamadı');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-800 rounded-xl p-10">
                <h1 className="text-4xl font-bold text-white mb-2">Hesabını Bul</h1>
                <p className="text-slate-300 text-sm mb-8">E-posta adresini gir.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="email"
                        placeholder="E-posta adresi"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                    />

                    {error && (
                        <p className="text-red-400 text-sm p-3 bg-red-950 border-l-4 border-red-500 rounded">
                            {error}
                        </p>
                    )}
                    
                    {message && (
                        <p className="text-green-400 text-sm p-3 bg-green-950 border-l-4 border-green-500 rounded">
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                            loading
                                ? 'bg-slate-600 cursor-not-allowed opacity-70'
                                : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
                        }`}
                    >
                        {loading ? 'Gönderiliyor...' : 'Bağlantı Gönder'}
                    </button>
                </form>

                <p className="text-slate-400 text-xs text-center mt-6">
                    Güvenlik ve giriş amaçlarıyla bizden e-posta bildirimleri alabilirsin.
                </p>

                <p className="text-center mt-6">
                    <a href="/login" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                        Geri dön
                    </a>
                </p>
            </div>
        </div>
    );
}