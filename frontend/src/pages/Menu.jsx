import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Menu() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

  // VERİLER (Backend'den Gelecek)
  const [matches, setMatches] = useState([]);

  // Komponent yüklendiğinde verileri çekecek metodlar
  useEffect(() => {
    fetchMyMatches();
    fetchFriends();
  }, []);

  const fetchMyMatches = async () => {
    /* 
      TODO: BACKEND BAĞLANTISI (MAÇLAR)
      1. İstek: GET /api/matches/my-matches (veya uygun endpoint)
      2. Gönderilecek: Header'da kullanıcı token'ı (JWT)
      3. Beklenen Yanıt: Kullanıcının içinde bulunduğu veya sahibi olduğu maçların listesi
      4. İşlem: Gelen veriler formatlanıp setMatches(data) ile state'e kaydedilecek.
         Gelen verideki tarihe göre 'type' alanı 'upcoming' veya 'past' olarak ayarlanabilir.
         örn:
         const response = await fetch('/api/matches/my-matches', { ...headers });
         const data = await response.json();
         setMatches(data);
    */
  };

  const fetchFriends = async () => {
    /* 
      TODO: BACKEND BAĞLANTISI (ARKADAŞLAR)
      1. İstek: GET /api/users/me/friends
      2. Gönderilecek: Header'da kullanıcı token'ı (JWT)
      3. Beklenen Yanıt: [{ name: "Ahmet", status: "online", _id: "..." }, ...]
      4. İşlem: setFriends(data)
    */
  };

  const [editingMatch, setEditingMatch] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false, matchId: null });
  const [friendDeleteModal, setFriendDeleteModal] = useState({ isOpen: false, friendName: "" });
  const [activeFriendId, setActiveFriendId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.matchId && location.state?.selectedLocation) {
      const matchId = location.state.matchId;
      const selectedLocation = location.state.selectedLocation;

      setMatches((prev) => prev.map((m) =>
        m.id === matchId ? { ...m, location: selectedLocation } : m
      ));

      setEditingMatch((prev) =>
        prev && prev.id === matchId ? { ...prev, location: selectedLocation } : prev
      );

      // state temizle
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, navigate, location.pathname]);

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setMatches(matches.map((m) => (m.id === editingMatch.id ? editingMatch : m)));
    setEditingMatch(null); // Modalı kapat
  };

  const handleRemoveMatchClick = (matchId) => {
    setDeleteConfirmModal({ isOpen: true, matchId });
  };

  const confirmRemoveMatch = async () => {
    /*
      TODO: MAÇ SİLME
      1. İstek: DELETE /api/matches/${deleteConfirmModal.matchId}
      2. İşlem: Başarılı olursa frontend state'ini güncelle:
         setMatches((prev) => prev.filter((m) => m.id !== deleteConfirmModal.matchId));
    */
    // Şimdilik sadece state'ten siliyoruz (optimistic update gibi)
    setMatches((prev) => prev.filter((m) => m.id !== deleteConfirmModal.matchId));
    setDeleteConfirmModal({ isOpen: false, matchId: null });
  };

  const [friends, setFriends] = useState([]);

  const handleRemoveFriendClick = (name) => {
    setFriendDeleteModal({ isOpen: true, friendName: name });
    setActiveFriendId(null);
  };

  const confirmRemoveFriend = () => {
    setFriends(friends.filter(f => f.name !== friendDeleteModal.friendName));
    setFriendDeleteModal({ isOpen: false, friendName: "" });
  };

  const filteredMatches = matches.filter(m => m.type === activeTab);
  const onlineCount = friends.filter(f => f.status === "online").length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-green-100">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white shadow-sm px-10 py-3 flex justify-between items-center sticky top-0 z-50 border-b border-gray-100 font-bold">
        <div className="flex items-center gap-10">
          <div className="text-2xl font-black text-green-600 italic tracking-tighter">MAÇA GEL</div>
          <Link to="/discover" className="hidden lg:block bg-green-50 text-green-700 px-5 py-2 rounded-full text-[10px] font-black hover:bg-green-600 hover:text-white transition-all uppercase tracking-widest border border-green-100 shadow-sm">
            🔍 MAÇ BUL
          </Link>
          <Link to="/create-match" className="hidden lg:block bg-blue-600 text-white px-5 py-2 rounded-full text-[10px] font-black hover:bg-blue-700 transition-all uppercase tracking-widest border border-blue-700 shadow-sm">
            ➕ MAÇ OLUŞTUR
          </Link>
        </div>
        
        <div className="relative flex items-center gap-3">
          <span className="hidden sm:block text-[11px] font-black text-gray-700 uppercase tracking-widest mt-0.5">Furkan Tatar</span>
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="focus:outline-none transition-transform active:scale-95">
            <img src="https://ui-avatars.com/api/?name=Furkan+Tatar&background=059669&color=fff" className="w-10 h-10 rounded-full border-2 border-green-500 shadow-md" alt="F" />
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
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
                    <p className="text-xs text-gray-400 mt-1">Yönetici: {match.manager}</p>
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

                  <div className="flex gap-2 justify-end">
                    {match.isOwner && (
                      <button
                        onClick={() => handleRemoveMatchClick(match.id)}
                        className="bg-red-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black hover:bg-red-700 transition-all shadow-lg shadow-red-100 uppercase tracking-widest"
                      >
                        🗑️ MAÇI KALDIR
                      </button>
                    )}
                    {match.isOwner && (
                      <button
                        onClick={() => navigate(`/location?matchId=${match.id}&q=${encodeURIComponent(match.location)}`)}
                        className="bg-gray-100 text-gray-600 px-4 py-3 rounded-2xl text-[10px] font-black hover:bg-gray-200 transition-all uppercase tracking-widest"
                      >
                        🗺️ HARİTA
                      </button>
                    )}
                    {match.isOwner && (
                      <button
                        onClick={() => setEditingMatch(match)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest"
                      >
                        🛠️ YÖNET
                      </button>
                    )}
                    {match.isOwner ? null : match.type === 'upcoming' ? (
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
                <div key={i} className="flex items-center justify-between group relative">
                  <div 
                    className="flex items-center gap-4 cursor-pointer hover:translate-x-1 transition-transform w-full"
                    onClick={() => setActiveFriendId(activeFriendId === i ? null : i)}
                  >
                    <div className="relative">
                      <img src={`https://ui-avatars.com/api/?name=${f.name}&background=random`} className="w-10 h-10 rounded-full border border-gray-50" alt="f" />
                      {f.status === 'online' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                    </div>
                    <span className="text-[11px] font-black text-gray-600 group-hover:text-green-600 transition uppercase tracking-tight">{f.name}</span>
                  </div>
                  
                  {/* Arkadaş Silme Menüsü */}
                  {activeFriendId === i && (
                    <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-gray-100 z-10 w-28 overflow-hidden animate-in fade-in zoom-in duration-200">
                      <button 
                        onClick={() => handleRemoveFriendClick(f.name)}
                        className="w-full text-left px-4 py-3 text-[10px] font-black text-red-600 hover:bg-red-50 transition uppercase tracking-widest flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        SİL
                      </button>
                    </div>
                  )}
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

      {/* --- MAÇ SİLME ONAY MODALI --- */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Maçı Kaldır</h2>
            <p className="text-sm font-bold text-gray-500 mb-6">Bu maçı kaldırmak istediğinize emin misiniz? Bu işlem geri alınamaz!</p>
            
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setDeleteConfirmModal({ isOpen: false, matchId: null })}
                className="px-6 py-3 rounded-2xl text-[10px] font-black text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all uppercase tracking-widest w-full"
              >
                VAZGEÇ
              </button>
              <button 
                onClick={confirmRemoveMatch}
                className="px-6 py-3 rounded-2xl text-[10px] font-black text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-100 uppercase tracking-widest w-full"
              >
                EVET, KALDIR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ARKADAŞ SİLME ONAY MODALI --- */}
      {friendDeleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Arkadaşı Sil</h2>
            <p className="text-sm font-bold text-gray-500 mb-6">
              <span className="text-gray-800 font-black">{friendDeleteModal.friendName}</span> adlı kullanıcıyı arkadaş listenden çıkarmak istediğine emin misin?
            </p>
            
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setFriendDeleteModal({ isOpen: false, friendName: "" })}
                className="px-6 py-3 rounded-2xl text-[10px] font-black text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all uppercase tracking-widest w-full"
              >
                VAZGEÇ
              </button>
              <button 
                onClick={confirmRemoveFriend}
                className="px-6 py-3 rounded-2xl text-[10px] font-black text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-100 uppercase tracking-widest w-full"
              >
                EVET, SİL
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Menu;