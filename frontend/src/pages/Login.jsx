import React, { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    // Şimdilik sadece konsola yazdırıyoruz, yakında backend'e bağlayacağız
    console.log("Backend'e giden veri:", { email, password });
    alert("Giriş denemesi başarılı! (Veriler konsola yazdırıldı)");
  };

  return (
    // Ekranı tam kaplayan, ortalanmış, hafif gri arkaplan
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      
      {/* Beyaz, gölgeli, köşeleri yuvarlatılmış form kartı */}
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
        
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Maça Gel</h2>
        <p className="text-gray-500 mb-8">Sahaya çıkmak için giriş yap!</p>

        {/* Hata Mesajı Kutusu */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-6 text-sm text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col">
          
          {/* E-Posta Alanı (Dümdüz içeri gömülü) */}
          <div className="mb-4 text-left">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-Posta:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              required
            />
          </div>

          {/* Şifre Alanı (Dümdüz içeri gömülü) */}
          <div className="mb-4 text-left">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şifre:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              required
            />
          </div>

          <div className="text-right mt-1 mb-6">
            <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-800 font-semibold transition">
              Şifreni mi unuttun?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition duration-300 shadow-md hover:shadow-lg"
          >
            Giriş Yap
          </button>
        </form>

        <div className="mt-8 text-sm text-gray-600">
          <span>Hesabın yok mu? </span>
          <Link to="/register" className="text-green-600 hover:text-green-800 font-bold transition ml-1">
            Hemen Kayıt Ol
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;