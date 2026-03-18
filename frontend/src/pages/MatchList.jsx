import React, { useState } from "react";
import { Link } from "react-router-dom";

function Discover() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // MOCK DATA: Sistemdeki tüm maçlar (Pazar Yeri)
  const [allMatches] = useState([
    { id: 101, title: "Acil Forvet Aranıyor!", location: "Isparta / Işıklar", date: "24 Mart", time: "20:00", capacity: "13/14", price: "150 TL" },
    { id: 102, title: "Şirketler Arası Dostluk Maçı", location: "SDU Doğu Sahası", date: "25 Mart", time: "18:00", capacity: "8/14", price: "Free" },
    { id: 103, title: "Gece Kuşları Kapışıyor", location: "Arena Park", date: "26 Mart", time: "23:00", capacity: "10/14", price: "200 TL" },
    { id: 104, title: "Haftalık Rutin Maç", location: "Eğirdir Sahası", date: "27 Mart", time: "21:00", capacity: "12/14", price: "180 TL" },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-green-100">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white shadow-sm px-10 py-3 flex justify-between items-center sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center gap-10">
          <Link to="/menu" className="text-2xl font-black text-green-600 italic tracking-tighter cursor-pointer">MAÇA GEL</Link>
          <div className="hidden lg:flex items-center bg-gray-100 px-4 py-2 rounded-full w-80 border border-transparent focus-within:border-green-300 transition-all">
            <span className="text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Saha veya şehir ara..." 
              className="bg-transparent border-none focus:outline-none text-xs ml-2 w-full font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <Link to="/menu" className="text-[10px] font-black text-gray-400 hover:text-green-600 transition uppercase tracking-widest">Panelime Dön</Link>
          <div className="relative">
            <button onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <img src="https://ui-avatars.com/api/?name=Furkan+Tatar&background=059669&color=fff" className="w-10 h-10 rounded-full border-2 border-green-500 shadow-md" alt="F" />
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                <Link to="/settings" className="block px-4 py-3 text-[11px] font-black text-gray-700 hover:bg-green-50 transition uppercase tracking-wider">⚙️ Ayarlar</Link>
                <button className="w-full text-left px-4 py-3 text-[11px] font-black text-red-600 hover:bg-red-50 transition uppercase">🚪 Çıkış</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* --- ANA LAYOUT --- */}
      <div className="flex-1 w-full max-w-[1400px] mx-auto flex flex-row p-6 lg:p-12 items-start">
        
        {/* SOL: TÜM MAÇLAR LİSTESİ */}
        <main className="flex-1 max-w-2xl flex flex-col gap-8">
          
          <div className="flex flex-col gap-2 mb-4">
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Saha Bul</h2>
            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">Etrafındaki aktif maçları keşfet ve kadroya gir</p>
          </div>

          <div className="flex flex-col gap-6">
            {allMatches.map((match) => (
              <div key={match.id} className="bg-white rounded-3xl border border-gray-100 p-7 transition-all shadow-sm hover:shadow-xl hover:border-green-300 group">
                
                {/* Üst Satır: Başlık | Konum & Tarih */}
                <div className="flex justify-between items-start mb-10">
                  <div className="max-w-[70%]">
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-green-600 transition-colors uppercase italic">
                      {match.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center justify-end gap-1 font-bold">📍 {match.location}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tighter italic">📅 {match.date}</p>
                  </div>
                </div>

                {/* Alt Satır: Bilgiler (Alt Alta) | Katıl Butonu */}
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-2">
                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest font-bold">Seans: <span className="text-gray-800 ml-1">{match.time}</span></div>
                    <div className="flex items-center gap-3">
                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Kadro: <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg ml-1 font-black">{match.capacity}</span></div>
                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest font-bold">Ücret: <span className="text-gray-800 ml-1 italic">{match.price}</span></div>
                    </div>
                  </div>

                  <Link 
                    to={`/match/${match.id}`}
                    className="bg-green-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black hover:bg-black transition-all shadow-lg shadow-green-100 uppercase tracking-[0.2em] text-center"
                  >
                    ⚽ KADROYA GİR
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* SAĞ: ÖZEL MAÇA KATIL & HIZLI FİLTRE (En sağa yapışık) --- */}
        <aside className="hidden lg:block w-80 h-fit sticky top-28 ml-auto">
          {/* Özel Kod ile Maça Katıl */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl mb-6">
            <h3 className="font-black text-[10px] tracking-[0.25em] uppercase mb-4 text-green-600">Özel Maça Katıl</h3>
            <p className="text-[9px] font-bold text-gray-400 mb-4 tracking-wide uppercase">Arkadaşının gönderdiği 6 haneli kodu gir ve hemen kadroya dahil ol.</p>
            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                maxLength="6"
                placeholder="Örn: X7B9K2"
                className="bg-gray-50 border border-gray-200 text-center text-[12px] font-black w-full p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none uppercase tracking-widest placeholder:tracking-normal"
              />
              <button className="w-full bg-black text-white px-4 py-3 rounded-xl text-[10px] font-black hover:bg-gray-800 transition-all uppercase tracking-widest">
                KOD İLE KATIL
              </button>
            </div>
          </div>

          <div className="bg-black text-white rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="font-black text-[10px] tracking-[0.25em] uppercase mb-8 border-b border-gray-800 pb-5">Hızlı Filtre</h3>
            
            <div className="space-y-6">
                <div>
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">Şehir Seç</label>
                    <select className="bg-gray-900 border-none text-[11px] font-bold w-full p-3 rounded-xl focus:ring-1 focus:ring-green-500">
                        <option>Isparta</option>
                        <option>Kahramanmaraş</option>
                        <option>İstanbul</option>
                    </select>
                </div>

                <div>
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">Saha Tipi</label>
                    <div className="flex flex-wrap gap-2">
                        <button className="bg-green-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter">Açık Saha</button>
                        <button className="bg-gray-800 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter hover:bg-gray-700">Kapalı Saha</button>
                    </div>
                </div>

                <div className="pt-6">
                    <div className="bg-gradient-to-br from-green-600 to-green-800 p-5 rounded-2xl">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1">Haftanın Oyuncusu</p>
                        <p className="text-lg font-black italic tracking-tighter">Furkan Tatar</p>
                        <div className="mt-4 text-[9px] font-bold bg-black/20 p-2 rounded-lg text-center">
                            🔥 12 Maç / 45 Gol
                        </div>
                    </div>
                </div>
            </div>
          </div>

          <div className="mt-6 px-4">
             <p className="text-[9px] font-bold text-gray-400 text-center uppercase tracking-widest">Toplam 142 aktif maç bulundu</p>
          </div>
        </aside>

      </div>
    </div>
  );
}

export default Discover;
