import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Token'ı kontrol et sayfa yüklendiğinde
    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3000/maca-gel/verify-reset-token/${token}`
                );
                
                if (response.ok) {
                    setTokenValid(true);
                } else {
                    setTokenValid(false);
                    setError('Bu link geçersiz veya süresi dolmuş. Lütfen yeniden deneyin.');
                }
            } catch (err) {
                setTokenValid(false);
                setError('Token doğrulanırken bir hata oluştu');
            }
        };

        if (token) {
            verifyToken();
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Validasyon
        if (password !== passwordConfirm) {
            setError('Şifreler eşleşmiyor');
            return;
        }

        if (password.length < 6) {
            setError('Şifre en az 6 karakter olmalı');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/maca-gel/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password,
                    passwordConfirm,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Şifre sıfırlanırken bir hata oluştu');
                return;
            }

            setMessage('Şifreniz başarıyla güncellendi! Login sayfasına yönlendiriliyorsunuz...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError('Sunucuyla iletişim kurulamadı');
        } finally {
            setLoading(false);
        }
    };

    if (tokenValid === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                <p className="text-white text-lg">Kontrol ediliyor...</p>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-slate-800 rounded-xl p-10">
                    <h2 className="text-3xl font-bold text-white mb-4">Şifre Sıfırlama</h2>
                    <p className="text-red-400 text-sm mb-6">{error}</p>
                    <a href="/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                        Yeniden deneyin
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-800 rounded-xl p-10">
                <h1 className="text-4xl font-bold text-white mb-6">Yeni Şifre Belirle</h1>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            placeholder="Yeni Şifre"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder="Şifre Tekrar"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                        />
                    </div>

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
                        {loading ? 'Güncelleniyor...' : 'Şifre Güncelle'}
                    </button>
                </form>
            </div>
        </div>
    );
}