import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AccountSettings = () => {
    const navigate = useNavigate();
    
    // Kullanıcı bilgileri state'i
    const [userInfo, setUserInfo] = useState({
        userName: '',
        email: '',
        phone: ''
    });

    // Şifre değiştirme state'i
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Sayfa yüklendiğinde mevcut bilgileri çekme (Mock veya API çağrısı)
    useEffect(() => {
        // Backend'e bağlanırken burayı açabilirsin (fetch('/api/users/me'))
        // Şimdilik örnek veri gösteriyoruz
        setUserInfo({
            userName: 'halisahacikral',
            email: 'kral@halisaha.com',
            phone: '0555 555 55 55'
        });
    }, []);

    const handleUserInfoChange = (e) => {
        const { name, value } = e.target;
        setUserInfo(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        
        axios.put('/api/updateProfile', userInfo)
        // Profil güncelleme API çağrısı: PUT /api/updateProfile
        console.log("Profil güncelleniyor: ", userInfo);
        alert("Profil başarıyla güncellendi! :D");
    };

    const handleUpdatePassword = (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert("Yeni şifreler uyuşmuyor!");
            return;
        }
        // Şifre değiştirme API çağrısı: PUT /api/passwordChange
        console.log("Şifre değiştiriliyor: ", passwords);
        alert("Şifre başarıyla değiştirildi!");
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const handleDeleteAccount = () => {
        const isConfirmed = window.confirm("Hesabını silmek istediğine emin misin? Bu işlem geri alınamaz!");
        if (isConfirmed) {
            // Hesap silme API çağrısı: DELETE /api/deleteAccount
            console.log("Hesap siliniyor...");
            alert("Hesap başarıyla silindi. Yollarımız ayrıldı :(");
            navigate('/login');
        }
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
                                name="userName"
                                value={userInfo.userName}
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
                                value={userInfo.phone}
                                onChange={handleUserInfoChange}
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
