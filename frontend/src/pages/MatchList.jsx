import React, { useState } from "react";
import { Link } from "react-router-dom";

function Discover() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Tüm Şehirler");

  const cities = ["Tüm Şehirler", "Isparta", "İstanbul", "Ankara", "İzmir", "Antalya", "Bursa"];

  // MOCK DATA: Sistemdeki tüm maçlar (Pazar Yeri)
  const [allMatches] = useState([
    { id: 101, title: "Acil Forvet Aranıyor!", manager: "Furkan Tatar", location: "Isparta / Batıkent Halısaha", date: "24 Mart", time: "20:00", capacity: "13/14", price: "150 TL" },
    { id: 102, title: "Şirketler Arası Dostluk Maçı", manager: "Deniz Yılmaz", location: "Isparta / SDÜ Halı Saha", date: "25 Mart", time: "18:00", capacity: "8/14", price: "Free" },
    { id: 103, title: "Gece Kuşları Kapışıyor", manager: "Sibel Aksoy", location: "Isparta / Fatih Halısaha ", date: "26 Mart", time: "23:00", capacity: "10/14", price: "200 TL" },
    { id: 104, title: "Haftalık Rutin Maç", manager: "Murat Çelik", location: "Isparta / Algida Halı Saha", date: "27 Mart", time: "21:00", capacity: "12/14", price: "180 TL" },
    { id: 105, title: "Isparta Antrenman Maçı", manager: "Esra Kaya", location: "Isparta / Süleyman Demirel Stadyumu Halı Saha", date: "28 Mart", time: "19:00", capacity: "5/12", price: "120 TL" },
    { id: 106, title: "Kadınlar Dostluk Turnuvası", manager: "Gizem Öz", location: "Isparta / Kılıçarslan Halı Saha", date: "29 Mart", time: "17:30", capacity: "9/14", price: "Free" },
    { id: 107, title: "Hafta Sonu 6v6 Eğlence", manager: "Ali Yıldız", location: "Isparta / Karacaören Halı Saha", date: "30 Mart", time: "16:00", capacity: "6/12", price: "100 TL" },
    { id: 108, title: "Akşam Çim Ligi", manager: "Leyla Demir", location: "İzmir / Sorkun Halı Saha", date: "31 Mart", time: "21:00", capacity: "11/14", price: "140 TL" },
  ]);

  const filteredMatches = allMatches.filter(match => {
    const matchesSearch = match.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          match.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === "Tüm Şehirler" || match.location.includes(selectedCity);
    return matchesSearch && matchesCity;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-green-100">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white shadow-sm px-10 py-3 flex justify-between items-center sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center gap-10">
          <Link to="/menu" className="text-2xl font-black text-green-600 italic tracking-tighter cursor-pointer">MAÇA GEL</Link>
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full w-80 border border-transparent focus-within:border-green-300 transition-all relative">
              <span className="text-gray-400">🔍</span>
              <input 
                type="text" 
                placeholder="Saha veya şehir ara..." 
                className="bg-transparent border-none focus:outline-none text-xs ml-2 w-full font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {/* Filtre Butonu */}
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`ml-2 text-xs p-1.5 rounded-full transition-all ${selectedCity !== "Tüm Şehirler" ? "bg-green-200 text-green-800" : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"}`}
                title="Şehir Filtresi"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                </svg>
              </button>

              {/* Filtre Dropdown */}
              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-3 w-48 bg-white border border-gray-100 shadow-2xl rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2 mt-1">Şehir Seç</p>
                  <div className="flex flex-col max-h-48 overflow-y-auto">
                    {cities.map(city => (
                      <button
                        key={city}
                        onClick={() => {
                          setSelectedCity(city);
                          setIsFilterOpen(false);
                        }}
                        className={`text-left px-3 py-2 text-xs font-bold rounded-xl transition-all ${selectedCity === city ? "bg-green-50 text-green-700" : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center bg-gray-100 p-1 rounded-full border border-gray-200">
              <input 
                  type="text" 
                  maxLength="6"
                  placeholder="KOD: X7B9"
                  className="bg-transparent text-center text-[11px] font-black w-24 focus:outline-none uppercase tracking-widest placeholder:tracking-normal px-2 text-gray-700"
              />
              <button className="bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-black hover:bg-gray-800 transition-all uppercase tracking-widest">
                KATIL
              </button>
            </div>
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
                <Link to="/account-settings" className="block px-4 py-3 text-[11px] font-black text-gray-700 hover:bg-green-50 transition uppercase tracking-wider">⚙️ Ayarlar</Link>
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
            {filteredMatches.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Bu kriterlere uygun maç bulunamadı.</p>
              </div>
            ) : (
              filteredMatches.map((match) => (
                <div key={match.id} className="bg-white rounded-3xl border border-gray-100 p-7 transition-all shadow-sm hover:shadow-xl hover:border-green-300 group">
                  
                  {/* Üst Satır: Başlık | Yönetici | Konum & Tarih */}
                  <div className="flex justify-between items-start mb-10">
                    <div className="max-w-[70%]">
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-green-600 transition-colors uppercase italic">
                        {match.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">Yönetici: {match.manager}</p>
                    </div>
                    <div className="text-right">
                      <Link
                        to={`/location/${match.id}?q=${encodeURIComponent(match.location)}`}
                        className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center justify-end gap-1 font-bold hover:underline"
                      >
                        📍 {match.location}
                      </Link>
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
              ))
            )}
          </div>
        </main>

        {/* SAĞ: HIZLI FİLTRE (En sağa yapışık) --- */}
        <aside className="hidden lg:block w-80 h-fit sticky top-28 ml-auto">
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
