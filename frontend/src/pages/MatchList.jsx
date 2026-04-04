import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SEHIRLER } from "../components/Sehirler";

function Discover() {
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Tüm Şehirler");
  const [inviteCode, setInviteCode] = useState("");
  const [pitchType, setPitchType] = useState("all");

  // Filtre State'leri
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Şehir listesi
  const citiesList = ["Tüm Şehirler", ...SEHIRLER];

  // Keşfet sayfası (getAllMatches)
  const [allMatches, setAllMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalMatches: 0,
    totalPages: 1
  });

  // Arama İşlemi (searchMatch)
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchPagination, setSearchPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalMatches: 0,
    totalPages: 1,
    searchTerm: ""
  });

  // Komponent yüklendiğinde user'ı localStorage'dan yükle ve maçları çek
  React.useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    fetchDiscoverMatches(pagination.currentPage);
  }, []);

  const fetchDiscoverMatches = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:3000/maca-gel/getAllMatches?page=${page}&limit=10`);
      
      if (!response.ok) throw new Error("Maçlar çekilemedi");
      
      const data = await response.json();
      
      // Backend'den gelen matches'i frontend formatına çevir
      const mappedMatches = data.matches.map(m => ({
        id: m._id,
        title: m.name,
        manager: m.owner.username,
        location: m.location,
        date: new Date(m.date).toLocaleDateString('tr-TR'),
        time: new Date(m.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        capacity: `${m.players.length}/${m.capacity}`,
        price: "150₺",
        pitchType: "closed"
      }));
      
      setAllMatches(mappedMatches);
      setPagination(data.pagination);
      setIsLoading(false);
    } catch (error) {
      console.error("Hata:", error);
      setIsLoading(false);
    }
  };

  // Backend'den arama yapıp sonuçları getir
  const fetchSearchResults = async (query, page = 1) => {
    try {
      setIsSearchLoading(true);
      
      // Query parametrelerini dinamik olarak oluştur
      let queryParams = `q=${encodeURIComponent(query || "")}&page=${page}&limit=10`;
      
      if (selectedCity && selectedCity !== "Tüm Şehirler") {
        queryParams += `&city=${encodeURIComponent(selectedCity)}`;
      }
      if (selectedCapacity) {
        // 6vs6 = 12, 7vs7 = 14, 8vs8 = 16
        const actualCapacity = selectedCapacity * 2;
        queryParams += `&capacity=${actualCapacity}`;
      }
      if (selectedDate) {
        queryParams += `&matchDate=${selectedDate}`;
      }

      const response = await fetch(`http://localhost:3000/maca-gel/searchMatch?${queryParams}`);
      
      if (!response.ok) throw new Error("Arama başarısız");
      
      const data = await response.json();
      
      // Arama sonuçlarını formatla
      const mappedMatches = data.matches.map(m => ({
        id: m._id,
        title: m.name,
        manager: m.owner.username,
        location: m.location,
        date: new Date(m.date).toLocaleDateString('tr-TR'),
        time: new Date(m.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        capacity: `${m.players.length}/${m.capacity}`,
        price: "150₺",
        pitchType: "closed"
      }));
      
      setSearchResults(mappedMatches);
      setSearchPagination(data.pagination);
      setIsSearching(true);
      setIsSearchLoading(false);
    } catch (error) {
      console.error("Hata:", error);
      setIsSearchLoading(false);
    }
  };

  // Sadece şehre göre filtrele (+ opsiyonel kapasite ve tarih)
  const fetchFilterByCity = async (city, page = 1) => {
    if (!city || city === "Tüm Şehirler") {
      return;
    }

    try {
      setIsSearchLoading(true);
      
      // Query parametrelerini oluştur
      let queryParams = `city=${encodeURIComponent(city)}&page=${page}&limit=10`;
      
      if (selectedCapacity) {
        queryParams += `&capacity=${selectedCapacity}`;
      }
      if (selectedDate) {
        queryParams += `&matchDate=${selectedDate}`;
      }

      const response = await fetch(`http://localhost:3000/maca-gel/filterMatchesByCity?${queryParams}`);
      
      if (!response.ok) throw new Error("Filtrele başarısız");
      
      const data = await response.json();
      
      // Sonuçları formatla
      const mappedMatches = data.matches.map(m => ({
        id: m._id,
        title: m.name,
        manager: m.owner.username,
        location: m.location,
        date: new Date(m.date).toLocaleDateString('tr-TR'),
        time: new Date(m.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        capacity: `${m.players.length}/${m.capacity}`,
        price: "150₺",
        pitchType: "closed"
      }));
      
      setSearchResults(mappedMatches);
      setSearchPagination(data.pagination);
      setIsSearching(true);
      setIsSearchLoading(false);
    } catch (error) {
      console.error("Hata:", error);
      setIsSearchLoading(false);
    }
  };

  // ARA butonuna basıldığında
  const handleSearchClick = () => {
    const hasSearchTerm = searchTerm.trim();
    const hasCity = selectedCity && selectedCity !== "Tüm Şehirler";
    const hasCapacity = selectedCapacity;
    const hasDate = selectedDate;

    // Herhangi bir filtre varsa ARA yap (searchMatch endpoint'i tüm kombinasyonları handle ediyor)
    if (hasSearchTerm || hasCity || hasCapacity || hasDate) {
      fetchSearchResults(searchTerm, 1);
    }
  };

  // Arama sonuçlarından vazgeç (Tüm Maçlara dön)
  const handleClearSearch = () => {
    setIsSearching(false);
    setSearchResults([]);
    setSearchTerm("");
    setSelectedCapacity("");
    setSelectedDate("");
    setSearchPagination({ ...searchPagination, currentPage: 1 });
    setPagination({ ...pagination, currentPage: 1 });
  };

  // Gösterilecek veri (arama yapıldıysa searchResults, değilse allMatches)
  const displayMatches = isSearching ? searchResults : allMatches;
  const displayPagination = isSearching ? searchPagination : pagination;
  const displayLoading = isSearching ? isSearchLoading : isLoading;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-green-100">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white shadow-sm px-10 py-3 flex justify-between items-center sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center gap-10">
          <Link to="/menu" className="text-2xl font-black text-green-600 italic tracking-tighter cursor-pointer">MAÇA GEL</Link>
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full border border-transparent focus-within:border-green-300 transition-all relative">
              <span className="text-gray-400">🔍</span>
              <input 
                type="text" 
                placeholder="Maç adı ile ara..." 
                className="bg-transparent border-none focus:outline-none text-xs ml-2 font-bold"
                style={{ width: "200px" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearchClick()}
              />
              <button
                onClick={handleSearchClick}
                disabled={!searchTerm.trim() && (!selectedCity || selectedCity === "Tüm Şehirler") && !selectedCapacity && !selectedDate}
                className="ml-2 bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-black hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed uppercase"
              >
                ARA
              </button>

              {/* Filtre Butonu */}
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`ml-2 text-xs p-1.5 rounded-full transition-all ${
                  selectedCity !== "Tüm Şehirler" || selectedCapacity || selectedDate
                    ? "bg-green-200 text-green-800" 
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                }`}
                title="Filtreler"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                </svg>
              </button>

              {/* Filtre Dropdown */}
              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-3 w-64 bg-white border border-gray-100 shadow-2xl rounded-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                  {/* Şehir Seç */}
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2 mt-1">Şehir Seç</p>
                  <div className="flex flex-col max-h-32 overflow-y-auto mb-3">
                    {citiesList.map(city => (
                      <button
                        key={city}
                        onClick={() => setSelectedCity(city)}
                        className={`text-left px-2 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedCity === city ? "bg-green-50 text-green-700" : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>

                  {/* Kapasite Seç */}
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2">Kapasite Seç</p>
                  <div className="flex flex-col gap-1 mb-3">
                    {["6", "7", "8"].map(cap => (
                      <button
                        key={cap}
                        onClick={() => setSelectedCapacity(selectedCapacity === cap ? "" : cap)}
                        className={`text-left px-2 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedCapacity === cap ? "bg-green-50 text-green-700" : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        {cap}vs{cap}
                      </button>
                    ))}
                  </div>

                  {/* Tarih Seç */}
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 mb-1">Tarih Seç</p>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center bg-gray-100 p-1 rounded-full border border-gray-200">
              <input 
                  type="text" 
                  maxLength="6"
                  placeholder="KOD: X7B9"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="bg-transparent text-center text-[11px] font-black w-24 focus:outline-none uppercase tracking-widest placeholder:tracking-normal px-2 text-gray-700"
              />
              <button 
                onClick={async () => {
                  if(inviteCode.length >= 4) {
                    try {
                      const userStr = localStorage.getItem("user");
                      if(!userStr) {
                        alert("Lütfen önce giriş yapın");
                        return;
                      }
                      const user = JSON.parse(userStr);

                      const response = await fetch(`http://localhost:3000/maca-gel/inviteCode`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          code: inviteCode,
                          userId: user.id
                        })
                      });

                      const data = await response.json();

                      if(response.ok) {
                        alert("Maça başarıyla katılındınız!");
                        setInviteCode("");
                        // Maç detay sayfasına yönlendir
                        window.location.href = `/match/${data.match._id}`;
                      } else {
                        alert(data.message || "Maçaya katılma başarısız");
                      }
                    } catch(error) {
                      console.error("Hata:", error);
                      alert("Sunucuya bağlanılamıyor");
                    }
                  }
                }}
                className="bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-black hover:bg-gray-800 transition-all uppercase tracking-widest"
              >
                KATIL
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <Link to="/menu" className="text-[10px] font-black text-gray-400 hover:text-green-600 transition uppercase tracking-widest">Panelime Dön</Link>
          <div className="relative">
            <button onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.username || "User"}&background=059669&color=fff`}
                className="w-10 h-10 rounded-full border-2 border-green-500 shadow-md" 
                alt={user?.username?.charAt(0) || "U"} 
              />
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                <Link to="/account-settings" className="block px-4 py-3 text-[11px] font-black text-gray-700 hover:bg-green-50 transition uppercase tracking-wider">⚙️ Ayarlar</Link>
                <button 
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                  }}
                  className="w-full text-left px-4 py-3 text-[11px] font-black text-red-600 hover:bg-red-50 transition uppercase">🚪 Çıkış
                </button>
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
            {isSearching ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Arama Sonuçları</h2>
                  <button
                    onClick={handleClearSearch}
                    className="text-xs font-black bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg transition"
                  >
                    ← Tüm Maçlara Dön
                  </button>
                </div>
                <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">"{searchPagination.searchTerm}" için {searchPagination.totalMatches} sonuç bulundu</p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Saha Bul</h2>
                <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">Etrafındaki aktif maçları keşfet ve kadroya gir</p>
              </>
            )}
          </div>

          <div className="flex flex-col gap-6">
            {displayLoading ? (
              <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm animate-pulse">Maçlar Yükleniyor...</p>
              </div>
            ) : displayMatches.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Bu kriterlere uygun maç bulunamadı.</p>
              </div>
            ) : (
              <>
                {displayMatches.map((match) => (
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
              ))}
                
                {/* Pagination Controls */}
                <div className="flex items-center justify-center gap-3 mt-8 pb-6">
                  <button 
                    onClick={() => {
                      if (isSearching && displayPagination.currentPage > 1) {
                        // searchTerm varsa searchResults, yoksa sadece şehir filtrelemesi
                        if (searchTerm.trim()) {
                          fetchSearchResults(searchTerm, displayPagination.currentPage - 1);
                        } else {
                          fetchFilterByCity(selectedCity, displayPagination.currentPage - 1);
                        }
                      } else if (!isSearching && displayPagination.currentPage > 1) {
                        fetchDiscoverMatches(displayPagination.currentPage - 1);
                      }
                    }}
                    disabled={displayPagination.currentPage === 1}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-[10px] font-black uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition"
                  >
                    ← ÖNCEKİ
                  </button>
                  
                  <div className="text-center">
                    <p className="text-[11px] font-black text-gray-700 uppercase">
                      Sayfa {displayPagination.currentPage} / {displayPagination.totalPages}
                    </p>
                    <p className="text-[9px] text-gray-500">Toplam {displayPagination.totalMatches} maç</p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (isSearching && displayPagination.currentPage < displayPagination.totalPages) {
                        // searchTerm varsa searchResults, yoksa sadece şehir filtrelemesi
                        if (searchTerm.trim()) {
                          fetchSearchResults(searchTerm, displayPagination.currentPage + 1);
                        } else {
                          fetchFilterByCity(selectedCity, displayPagination.currentPage + 1);
                        }
                      } else if (!isSearching && displayPagination.currentPage < displayPagination.totalPages) {
                        fetchDiscoverMatches(displayPagination.currentPage + 1);
                      }
                    }}
                    disabled={displayPagination.currentPage >= displayPagination.totalPages}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-[10px] font-black uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition"
                  >
                    SONRAKI →
                  </button>
                </div>
              </>
            )}
          </div>
        </main>

      </div>
    </div>
  );
}

export default Discover;
