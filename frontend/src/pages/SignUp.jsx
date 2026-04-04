import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

function SignUp() {
  const navigate = useNavigate();
  // Kullanıcıdan alacağımız 4 temel bilgi için state'ler
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  // Hata yönetimi
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Basit doğrulama: Hepsi dolu mu?
    if (!username || !email || !phone || !password) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/maca-gel/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/menu");
      } else {
        setError(data.message || "Kayıt başarısız.");
      }
    } catch (err) {
      setError("Bağlantı hatası: Sunucuya ulaşılamadı.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Ekranı tam kaplayan, ortalanmış, hafif gri arkaplan
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      
      {/* Beyaz, gölgeli form kartı */}
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
        
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Aramıza Katıl</h2>
        <p className="text-gray-500 mb-6">Maça Gel'de yerini ayırtmak için kayıt ol.</p>

        {/* Hata Mesajı Kutusu */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-6 text-sm text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col">
          
          {/* Kullanıcı Adı Alanı */}
          <div className="mb-4 text-left">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kullanıcı Adı:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="KralGokhan10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              required
            />
          </div>

          {/* E-Posta Alanı */}
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

          {/* Telefon Alanı */}
          <div className="mb-4 text-left">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon Numarası:
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05XX XXX XX XX"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              required
            />
          </div>

          {/* Şifre Alanı */}
          <div className="mb-6 text-left">
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

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${isLoading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'} text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-300 transition duration-300 shadow-md`}
          >
            {isLoading ? "Kayıt Olunuyor..." : "Kayıt Ol"}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          <span>Zaten hesabın var mı? </span>
          <Link to="/login" className="text-green-600 hover:text-green-800 font-bold transition ml-1">
            Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignUp;