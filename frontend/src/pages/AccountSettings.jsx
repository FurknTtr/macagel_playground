import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const AccountSettings = () => {
    const navigate = useNavigate();
    
    // Kullanıcı bilgileri state'i
    const [userInfo, setUserInfo] = useState({
        userId: '',
        username: '',
        email: '',
        phone: '',
        friendCode: ''
    });

    // Copy toast state
    const [copied, setCopied] = useState(false);

    // Şifre değiştirme state'i
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Sayfa yüklendiğinde mevcut bilgileri çekme
    useEffect(() => {
        const fetchProfile = async () => {
            const userStr = localStorage.getItem("user");
            const token = localStorage.getItem("token");
            if (!userStr) {
                navigate("/login");
                return;
            }
            if (!token) {
                navigate("/login");
                return;
            }
            const user = JSON.parse(userStr);
            try {
                const response = await fetch(`${API_BASE_URL}/maca-gel/users/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserInfo({
                        userId: data._id,
                        username: data.username,
                        email: data.email,
                        phone: data.phone || '',
                        friendCode: data.friendCode || ''
                    });
                }
            } catch (err) {
                console.error("Profil yüklenemedi", err);
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleUserInfoChange = (e) => {
        const { name, value } = e.target;
        setUserInfo(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/maca-gel/updateProfile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userInfo)
            });
            const data = await response.json();
            if (response.ok) {
                alert("Profil başarıyla güncellendi!");
                localStorage.setItem("user", JSON.stringify({
                    id: data.user._id,
                    username: data.user.username,
                    email: data.user.email,
                    phone: data.user.phone,
                    friendCode: data.user.friendCode
                }));
            } else {
                alert(data.message || "Güncelleme başarısız.");
            }
        } catch (err) {
            alert("Sunucu hatası.");
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert("Yeni şifreler uyuşmuyor!");
            return;
        }
        
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/maca-gel/passwordChange`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword
                })
            });
            const data = await response.json();
            if (response.ok) {
                alert("Şifre başarıyla değiştirildi!");
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                alert(data.message || "Şifre değiştirilemedi.");
            }
        } catch (err) {
            alert("Sunucu hatası.");
        }
    };

    const handleDeleteAccount = async () => {
        const isConfirmed = window.confirm("Hesabını silmek istediğine emin misin? Bu işlem geri alınamaz!");
        if (!isConfirmed) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/maca-gel/deleteAccount`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: userInfo.userId })
            });
            const data = await response.json();
            
            if (response.ok) {
                alert("Hesabın silindi. Yollarımız ayrıldı :(");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate('/login');
            } else {
                // Eğer hata varsa (maçlardan çıkılması gerekiyorsa)
                alert(data.message || "Hesap silinemedi.");
            }
        } catch (err) {
            alert("Sunucu hatası.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            {/* Header / Navbar */}
            <header className="bg-gray-800 p-4 shadow-md flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/menu')} 
                        className="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Menü
                    </button>
                    <h1 className="text-xl font-bold text-lime-400">Hesap Ayarları</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-4 md:p-6 space-y-8 mt-6">
                
                {/* Arkadaş Kodu */}
                <section className="bg-gradient-to-br from-lime-900 to-lime-800 rounded-xl p-6 shadow-lg border border-lime-700">
                    <h2 className="text-2xl font-semibold mb-4 text-lime-200 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Arkadaş Kodu
                    </h2>
                    <p className="text-gray-300 text-sm mb-4">
                        Arkadaşlarınızı kullanıcı kodunuzu paylaşarak ekliyebilirsiniz. Koda tıklayarak kopyalayabilirsiniz.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            navigator.clipboard.writeText(userInfo.friendCode);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        }}
                        className="w-full bg-lime-600 hover:bg-lime-500 active:bg-lime-400 text-white font-black px-6 py-4 rounded-lg transition-all shadow-lg shadow-lime-900/40 uppercase tracking-widest text-center cursor-pointer flex items-center justify-center gap-3"
                    >
                        <span className="text-xl">🔗</span>
                        <span>{userInfo.friendCode || 'Kod Yükleniyor...'}</span>
                        {copied && <span className="text-sm ml-auto animate-pulse">✓ Kopyalandı!</span>}
                    </button>
                </section>

                {/* Profil Bilgileri Formu */}
                <section className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                    <h2 className="text-2xl font-semibold mb-6 text-lime-400 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profil Bilgileri
                    </h2>
                    
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Kullanıcı Adı</label>
                            <input
                                type="text"
                                name="username"
                                value={userInfo.username}
                                onChange={handleUserInfoChange}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">E-posta Adresi</label>
                            <input
                                type="email"
                                name="email"
                                value={userInfo.email}
                                onChange={handleUserInfoChange}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Telefon Numarası</label>
                            <input
                                type="tel"
                                name="phone"
                                value={userInfo.phone || ''}
                                onChange={handleUserInfoChange}
                                placeholder="05XX XXX XXXX"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full sm:w-auto bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold px-6 py-2.5 rounded-lg transition-colors"
                            >
                                Düzenle (Kaydet)
                            </button>
                        </div>
                    </form>
                </section>

                {/* Şifre Değiştirme Formu */}
                <section className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                    <h2 className="text-2xl font-semibold mb-6 text-lime-400 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Şifre Değiştir
                    </h2>
                    
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Mevcut Şifre</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwords.currentPassword}
                                onChange={handlePasswordChange}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Yeni Şifre</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwords.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Yeni Şifre (Tekrar)</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwords.confirmPassword}
                                onChange={handlePasswordChange}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
                                required
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full sm:w-auto bg-gray-600 hover:bg-gray-500 text-white font-bold px-6 py-2.5 rounded-lg transition-colors border border-gray-500"
                            >
                                Şifreyi Güncelle
                            </button>
                        </div>
                    </form>
                </section>

                {/* Oturum Yönetimi */}
                <section className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                    <h2 className="text-2xl font-semibold mb-6 text-lime-400 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Oturum
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Oturumunu kapatmak istersen bu butona tıkla. Tekrar giriş yapmak için şifren gerekecek.
                    </p>
                    <button
                        onClick={handleLogout}
                        className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Çıkış Yap
                    </button>
                </section>

                {/* Tehlikeli Alan - Hesap Silme */}
                <section className="bg-red-900/20 rounded-xl p-6 shadow-lg border border-red-900/50 mt-8">
                    <h2 className="text-xl font-semibold mb-4 text-red-400 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Tehlikeli Alan
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Hesabını kalıcı olarak silmek istediğinde bu butonu kullanabilirsin. Bu işlem geri döndürülemez ve tüm takım/maç geçmişin silinir.
                    </p>
                    <button
                        onClick={handleDeleteAccount}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Hesabımı Kalıcı Olarak Sil
                    </button>
                </section>

            </main>
        </div>
    );
};

export default AccountSettings;
