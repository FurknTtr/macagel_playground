import React, { useState } from "react";
import { Link } from "react-router-dom";

function Menu() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

  // VERİLER (Eksiksiz tam kadro)
  const [matches, setMatches] = useState([
    { id: 1, title: "Pazartesi Gecesi Halı Saha", location: "Isparta / Merkez", date: "23 Mart", time: "21:00", capacity: "12/14", isOwner: true, type: "upcoming" },
    { id: 2, title: "SDU Batı Sahası Maçı", location: "SDU Sahaları", date: "25 Mart", time: "19:00", capacity: "10/14", isOwner: false, type: "upcoming" },
    { id: 3, title: "Efsane Cuma Kapışması", location: "Arena Park", date: "10 Mart", time: "22:00", score: "7 - 5", isOwner: false, type: "past" },
  ]);

  const [editingMatch, setEditingMatch] = useState(null);

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setMatches(matches.map((m) => (m.id === editingMatch.id ? editingMatch : m)));
    setEditingMatch(null); // Modalı kapat
  };

  const friends = [
    { name: "Ahmet Yılmaz", status: "online" },
    { name: "Rukiye", status: "online" },
    { name: "Mehmet Demir", status: "offline" },
    { name: "Caner Hoca", status: "online" },
  ];

  const filteredMatches = matches.filter(m => m.type === activeTab);
  const onlineCount = friends.filter(f => f.status === "online").length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-green-100">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white shadow-sm px-10 py-3 flex justify-between items-center sticky top-0 z-50 border-b border-gray-100 font-bold">
        <div className="flex items-center gap-10">
          <div className="text-2xl font-black text-green-600 italic tracking-tighter">MAÇA GEL</div>
          <Link to="/discover" className="hidden lg:block bg-green-50 text-green-700 px-5 py-2 rounded-full text-[10px] font-black hover:bg-green-600 hover:text-white transition-all uppercase tracking-widest border border-green-100 shadow-sm">
            🔍 YENİ MAÇ BUL
          </Link>
        </div>
        
        <div className="relative">
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="focus:outline-none transition-transform active:scale-95">
            <img src="https://ui-avatars.com/api/?name=Furkan+Tatar&background=059669&color=fff" className="w-10 h-10 rounded-full border-2 border-green-500 shadow-md" alt="F" />
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
              <Link to="/account-settings" className="block px-4 py-3 text-[11px] font-black text-gray-700 hover:bg-green-50 transition uppercase tracking-wider">⚙️ HESAP AYARLARI</Link>
              <hr className="border-gray-50" />
              <button className="w-full text-left px-4 py-3 text-[11px] font-black text-red-600 hover:bg-red-50 transition uppercase tracking-wider">🚪 GÜVENLİ ÇIKIŞ</button>
            </div>
          )}
        </div>
      </nav>

      {/* --- ANA LAYOUT (Geniş Konteynır - Esnek Yapı) --- */}
      <div className="flex-1 w-full max-w-[1400px] mx-auto flex flex-row p-6 lg:p-12 items-start">
        
        {/* SOL: MAÇ LİSTESİ (Genişledi, içi aynı) */}
        <main className="flex-1 max-w-4xl flex flex-col gap-10">
          
          <div className="flex gap-10 border-b border-gray-200">
            <button 
              onClick={() => setActiveTab("upcoming")}
              className={`pb-5 text-[11px] font-black tracking-[0.2em] relative transition-colors ${activeTab === "upcoming" ? "text-green-600" : "text-gray-400"}`}
            >
              YAKLAŞANLAR
              {activeTab === "upcoming" && <div className="absolute bottom-0 left-0 w-full h-1 bg-green-600 rounded-full"></div>}
            </button>
            <button 
              onClick={() => setActiveTab("past")}
              className={`pb-5 text-[11px] font-black tracking-[0.2em] relative transition-colors ${activeTab === "past" ? "text-green-600" : "text-gray-400"}`}
            >
              GEÇMİŞ MAÇLARIM
              {activeTab === "past" && <div className="absolute bottom-0 left-0 w-full h-1 bg-green-600 rounded-full"></div>}
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {filteredMatches.map((match) => (
              <div key={match.id} className="bg-white rounded-3xl border border-gray-100 p-7 transition-all shadow-sm hover:shadow-xl hover:border-green-200 group">
                
                {/* Üst Satır */}
                <div className="flex justify-between items-start mb-10">
                  <div className="max-w-[70%]">
                    <h3 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight group-hover:text-green-600 transition-colors">
                      {match.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center justify-end gap-1">📍 {match.location}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase">📅 {match.date}</p>
                  </div>
                </div>

                {/* Alt Satır */}
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-2">
                    {match.type === 'upcoming' ? (
                      <>
                        <div className="text-[10px] font-black text-gray-300 uppercase">SAAT: <span className="text-gray-800 ml-1">{match.time}</span></div>
                        <div className="text-[10px] font-black text-gray-300 uppercase">KADRO: <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg ml-1">{match.capacity}</span></div>
                      </>
                    ) : (
                      <p className="text-4xl font-black text-gray-800 italic tracking-tighter">MS: {match.score}</p>
                    )}
                  </div>

                  <div>
                    {match.isOwner ? (
                      <button onClick={() => setEditingMatch(match)} className="bg-blue-600 text-white px-7 py-3 rounded-2xl text-[10px] font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest inline-block text-center">🛠️ YÖNET</button>
                    ) : match.type === 'upcoming' ? (
                      <Link to={`/match/${match.id}`} className="bg-gray-100 text-gray-600 px-7 py-3 rounded-2xl text-[10px] font-black hover:bg-gray-200 transition-all uppercase inline-block text-center">📄 DETAY</Link>
                    ) : (
                      <button className="bg-green-600 text-white px-7 py-3 rounded-2xl text-[10px] font-black hover:bg-green-700 transition shadow-lg shadow-green-100 uppercase">⭐ PUAN VER</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* SAĞ: ARKADAŞ LİSTESİ (En sağa yapışık - Mıknatıslı) --- */}
        <aside className="hidden lg:block w-80 h-fit sticky top-28 ml-auto">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-5">
              <h3 className="font-black text-gray-800 text-[10px] tracking-[0.25em] uppercase">Saha Arkadaşları</h3>
              <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black text-green-600 uppercase">{onlineCount} Aktif</span>
              </div>
            </div>
            
            <div className="space-y-6">
              {friends.map((f, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer hover:translate-x-1 transition-transform">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src={`https://ui-avatars.com/api/?name=${f.name}&background=random`} className="w-10 h-10 rounded-full border border-gray-50" alt="f" />
                      {f.status === 'online' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                    </div>
                    <span className="text-[11px] font-black text-gray-600 group-hover:text-green-600 transition uppercase tracking-tight">{f.name}</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-10 py-4 bg-gray-50 border-2 border-dashed border-gray-200 text-gray-400 text-[9px] font-black rounded-2xl hover:text-green-600 hover:border-green-200 transition-all uppercase tracking-[0.2em]">
              + YENİ ARKADAŞ BUL
            </button>
          </div>
        </aside>

      </div>

      {/* --- MAÇ DÜZENLEME MODALI --- */}
      {editingMatch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">Maçı Düzenle</h2>
            
            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Maç Adı</label>
                <input 
                  type="text" 
                  value={editingMatch.title} 
                  onChange={(e) => setEditingMatch({...editingMatch, title: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Konum</label>
                <input 
                  type="text" 
                  value={editingMatch.location} 
                  onChange={(e) => setEditingMatch({...editingMatch, location: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Tarih</label>
                  <input 
                    type="text" 
                    value={editingMatch.date} 
                    onChange={(e) => setEditingMatch({...editingMatch, date: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Saat</label>
                  <input 
                    type="text" 
                    value={editingMatch.time} 
                    onChange={(e) => setEditingMatch({...editingMatch, time: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingMatch(null)}
                  className="px-6 py-3 rounded-2xl text-[10px] font-black text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all uppercase tracking-widest"
                >
                  İPTAL
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 rounded-2xl text-[10px] font-black text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest"
                >
                  KAYDET
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Menu;