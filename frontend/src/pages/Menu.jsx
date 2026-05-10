import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

function Menu() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [currentUser, setCurrentUser] = useState({ username: "Giriş Yapılmadı" });
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [addFriendCode, setAddFriendCode] = useState("");
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [friendTab, setFriendTab] = useState("friends"); // arkadaşlarım / requests
  const [pendingFriendRequests, setPendingFriendRequests] = useState([]);

  // VERİLER (Backend'den Gelecek)
  const [matches, setMatches] = useState([]);

  const [pendingReviews, setPendingReviews] = useState([]);
  const [friends, setFriends] = useState([]);
  
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  // Fetch fonksiyonlarını useEffect'ten ÖNCE tanımla
  const fetchUpcomingMatches = async () => {
    try {
      setIsLoadingMatches(true);
      const userStr = localStorage.getItem("user");
      if(!userStr) return;
      
      const user = JSON.parse(userStr);
      
      // Backend'den kullanıcının yaklaşan maçlarını çek (bugün ve sonrası)
      const response = await fetch(`${API_BASE_URL}/maca-gel/upcomingMatch/${user.id}`);
      if(response.ok) {
        const matchesData = await response.json();
        
        // Backend'den gelen maçları frontend formatına dönüştür
        const mappedData = matchesData.map(m => {
          const ownerId = typeof m.owner === 'object' ? m.owner._id : m.owner;
          const matchDate = new Date(m.date);
          
          return {
            id: m._id,
            title: m.name,
            date: matchDate.toLocaleDateString('tr-TR'),
            time: matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            location: m.location,
            capacity: `${m.players.length}/${m.capacity}`,
            isOwner: ownerId === user.id,
            type: "upcoming",
            score: "",
            inviteCode: m.inviteCode
          };
        });
        
        setMatches(mappedData);
      }
    } catch (error) {
      console.error("Yaklaşan maçlar çekilemedi", error);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const fetchPastMatches = async () => {
    try {
      setIsLoadingMatches(true);
      const token = localStorage.getItem("token");
      if(!token) return;
      
      // Backend'den kullanıcının geçmiş maçlarını çek (şu an öncesi)
      const response = await fetch(`${API_BASE_URL}/maca-gel/matchHistory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(response.ok) {
        const matchesData = await response.json();
        
        // Backend'den gelen maçları frontend formatına dönüştür
        const mappedData = matchesData.map(m => {
          const ownerId = typeof m.owner === 'object' ? m.owner._id : m.owner;
          const matchDate = new Date(m.date);
          
          return {
            id: m._id,
            title: m.name,
            date: matchDate.toLocaleDateString('tr-TR'),
            time: matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            location: m.location,
            capacity: `${m.players.length}/${m.capacity}`,
            isOwner: ownerId === user.id,
            type: "past",
            score: "",
            inviteCode: m.inviteCode
          };
        });
        
        setMatches(mappedData);
        
        // Geçmiş maçlarda pending reviews'ı da çek (değerlendirilmemiş maçlar)
        fetchPendingReviews();
      }
    } catch (error) {
      console.error("Geçmiş maçlar çekilemedi", error);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const fetchPendingReviews = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if(!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch(`${API_BASE_URL}/maca-gel/pendingReviews/${user.id}`);
      if(response.ok) {
        const data = await response.json();
        // Geçmişteki maçlardan henüz değerlendirilmemişleri set ediyoruz
        setPendingReviews(data);
      }
    } catch (error) {
      console.error("Değerlendirme bekleyen maçlar çekilemedi", error);
    }
  };

  const fetchFriends = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if(!userStr) return;
      const user = JSON.parse(userStr);
      
      const response = await fetch(`${API_BASE_URL}/maca-gel/myFriends?userId=${user.id}`);
      if(response.ok) {
         const data = await response.json();
         // Backend'den gelen arkadaş listesini UI formatına çevir
         const mappedFriends = data.map(f => ({
            id: f._id,
            name: f.username,
            status: "online" // Demo - gerçek uygulamada socket.io ile dinamik olabilir
         }));
         setFriends(mappedFriends);
      } else {
        console.error("Arkadaşlar getirilemedi:", response.status);
        setFriends([]); // Hata durumunda boş liste
      }
    } catch (error) {
      console.error("Arkadaşlar çekilemedi", error);
      setFriends([]); // Hata durumunda boş liste
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setPendingFriendRequests([]);
        return;
      }
      const user = JSON.parse(userStr);
      
      const response = await fetch(`${API_BASE_URL}/maca-gel/getPendingRequests?userId=${user.id}`);
      if(response.ok) {
         const data = await response.json();
         const mappedRequests = data.map(r => ({
           id: r._id,
           name: r.username,
           email: r.email
         }));
         setPendingFriendRequests(mappedRequests);
      } else {
        console.error("İstekler getirilemedi:", response.status);
        setPendingFriendRequests([]);
      }
    } catch (err) {
      console.error("İstekler çekilemedi", err);
      setPendingFriendRequests([]);
    }
  };

  const handleAcceptFriendRequest = async (requesterId) => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch(`${API_BASE_URL}/maca-gel/acceptFriendRequest`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          friendId: requesterId
        })
      });

      if (response.ok) {
        alert("Arkadaş isteği kabul edildi!");
        fetchPendingRequests();
        fetchFriends();
      } else {
        const data = await response.json();
        alert(data.message || "İstek kabul edilemedi");
      }
    } catch (err) {
      console.error("Hata oluştu", err);
      alert("Hata oluştu");
    }
  };

  const handleRejectFriendRequest = async (requesterId) => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch(`${API_BASE_URL}/maca-gel/rejectFriendRequest`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          friendId: requesterId
        })
      });

      if (response.ok) {
        alert("Arkadaş isteği reddedildi");
        fetchPendingRequests();
      } else {
        const data = await response.json();
        alert(data.message || "İstek reddedilemedi");
      }
    } catch (err) {
      console.error("Hata oluştu", err);
      alert("Hata oluştu");
    }
  };

  const addFriend = async (e) => {
    e.preventDefault();
    if (!addFriendCode.trim()) {
      alert("Lütfen arkadaş kodunu giriniz");
      return;
    }

    setIsAddingFriend(true);
    try {
      const userStr = localStorage.getItem("user");
      if(!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch(`${API_BASE_URL}/maca-gel/addFriend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          friendCode: addFriendCode.toUpperCase()
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert("Arkadaş başarıyla eklendi!");
        setAddFriendCode("");
        setIsAddFriendModalOpen(false);
        fetchFriends(); // Arkadaş listesini yenile
      } else {
        alert(data.message || "Arkadaş eklenemedi");
      }
    } catch (error) {
      console.error(error);
      alert("Sunucuya bağlanılamıyor");
    } finally {
      setIsAddingFriend(false);
    }
  };
  
  // Komponent yüklendiğinde verileri çekecek metodlar
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    
    fetchFriends();
    // İlk açılışta yaklaşan maçları çek
    fetchUpcomingMatches();
  }, []); // Sadece ilk mount'te çalış

  // Tab değiştiğinde (tıklandığında) uygun fetch'i çağır
  useEffect(() => {
    if (activeTab === "upcoming") {
      fetchUpcomingMatches();
    } else {
      fetchPastMatches();
    }
  }, [activeTab]);;

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

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    // Tarihi backend için ISO formatına çevirmeye çalışalım. 
    // dd.mm.yyyy ss:dd formatındaysa:
    let dateObj;
    try {
      let dParts = editingMatch.date.split(/[./-]/);
      if(dParts.length === 3) {
        let day = dParts[0].padStart(2, '0');
        let month = dParts[1].padStart(2, '0');
        let year = dParts[2].length === 2 ? `20${dParts[2]}` : dParts[2];
        let isoStr = `${year}-${month}-${day}T${editingMatch.time}:00`;
        dateObj = new Date(isoStr);
      }
    } catch(err) {
      console.warn("Tarih dönüştürülemedi:", err);
    }

    const payload = {
      matchId: editingMatch.id,
      name: editingMatch.title,
      location: editingMatch.location,
    };
    
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Lütfen önce giriş yapın");
      return;
    }
    
    if (dateObj && !isNaN(dateObj)) {
      payload.date = dateObj.toISOString();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/maca-gel/updateMatch`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setMatches(matches.map((m) => (m.id === editingMatch.id ? editingMatch : m)));
        setEditingMatch(null); // Modalı kapat
        alert("Maç başarıyla güncellendi");
      } else {
        alert(data.message || "Maç güncellenemedi!");
      }
    } catch (err) {
      console.error(err);
      alert("Bir hata oluştu!");
    }
  };

  const handleRemoveMatchClick = (matchId) => {
    setDeleteConfirmModal({ isOpen: true, matchId });
  };

  const confirmRemoveMatch = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Lütfen önce giriş yapın");
        return;
      }

      const payload = {
        matchId: deleteConfirmModal.matchId
      };

      const response = await fetch(`${API_BASE_URL}/maca-gel/deleteMatch`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setMatches((prev) => prev.filter((m) => m.id !== deleteConfirmModal.matchId));
        alert("Maç başarıyla iptal edildi");
      } else {
        alert(data.message || "Maç iptal edilemedi!");
      }
    } catch(err) {
      console.error(err);
      alert("Hata oluştu");
    } finally {
      setDeleteConfirmModal({ isOpen: false, matchId: null });
    }
  };

  const handleRemoveFriendClick = (friend) => {
    setFriendDeleteModal({ isOpen: true, friendName: friend.name, friendId: friend.id });
    setActiveFriendId(null);
  };

  const confirmRemoveFriend = async () => {
    try {
      const token = localStorage.getItem("token");
      if(!token) return;
      const response = await fetch(`${API_BASE_URL}/maca-gel/myFriends?friendId=${friendDeleteModal.friendId}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setFriends(friends.filter(f => f.id !== friendDeleteModal.friendId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFriendDeleteModal({ isOpen: false, friendName: "", friendId: null });
    }
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
          <span className="hidden sm:block text-[11px] font-black text-gray-700 uppercase tracking-widest mt-0.5">{currentUser.username}</span>
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="focus:outline-none transition-transform active:scale-95">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=059669&color=fff`} className="w-10 h-10 rounded-full border-2 border-green-500 shadow-md" alt="Profil" />
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
              <Link to="/account-settings" className="block px-4 py-3 text-[11px] font-black text-gray-700 hover:bg-green-50 transition uppercase tracking-wider">⚙️ HESAP AYARLARI</Link>
              <hr className="border-gray-50" />
              <button 
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
                className="w-full text-left px-4 py-3 text-[11px] font-black text-red-600 hover:bg-red-50 transition uppercase tracking-wider">🚪 GÜVENLİ ÇIKIŞ
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* --- ANA LAYOUT (Geniş Konteynır - Esnek Yapı) --- */}
      <div className="flex-1 w-full max-w-[1400px] mx-auto flex flex-row p-6 lg:p-12 items-start">
        
        {/* SOL: MAÇ LİSTESİ (Genişledi, içi aynı) */}
        <main className="flex-1 max-w-4xl flex flex-col gap-10">
          
          <div className="flex gap-10 border-b border-gray-200">
            {pendingReviews.length > 0 && (
               <div className="mb-4 bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center justify-between">
                 <div className="text-[11px] font-black text-orange-600 uppercase tracking-wide">
                   ⚠️ Değerlendirilmemiş {pendingReviews.length} Maçınız Var!
                 </div>
               </div>
            )}
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
              <div 
                key={match.id} 
                onClick={() => setSelectedMatch(match)}
                className="bg-white rounded-3xl border border-gray-100 p-7 transition-all shadow-sm hover:shadow-xl hover:border-green-200 group cursor-pointer"
              >
                
                {/* Üst Satır */}
                <div className="flex justify-between items-start mb-10">
                  <div className="max-w-[70%]">
                    <h3 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight group-hover:text-green-600 transition-colors">
                      {match.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-500">📍 {match.location}</div>
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
                    {match.type === 'upcoming' && (
                      <Link to={`/match/${match.id}`} className="bg-green-600 text-white px-7 py-3 rounded-2xl text-[10px] font-black hover:bg-green-700 transition-all shadow-lg shadow-green-100 uppercase inline-block text-center">📋 DETAY</Link>
                    )}
                    {match.type === 'past' && (
                      <button className="bg-green-600 text-white px-7 py-3 rounded-2xl text-[10px] font-black hover:bg-green-700 transition shadow-lg shadow-green-100 uppercase">⭐ PUAN VER</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* SAĞ: ARKADAŞ LİSTESİ */}
        <aside className="hidden lg:block w-80 h-fit sticky top-28 ml-auto">
          {/* ARKADAŞ LİSTESİ */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
            {/* SEKMELERİ */}
            <div className="flex gap-3 mb-6 border-b border-gray-100 justify-center">
              <button
                onClick={() => {
                  setFriendTab("friends");
                  fetchFriends();
                }}
                className={`pb-4 px-4 text-[10px] font-black uppercase tracking-widest transition-all text-center ${
                  friendTab === "friends"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Arkadaşlarım ({friends.length})
              </button>
              <button
                onClick={() => {
                  setFriendTab("requests");
                  fetchPendingRequests();
                }}
                className={`pb-4 px-4 text-[10px] font-black uppercase tracking-widest transition-all relative text-center ${
                  friendTab === "requests"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                İstekler
                {pendingFriendRequests.length > 0 && (
                  <span className="absolute -top-3 -right-2 bg-red-500 text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {pendingFriendRequests.length}
                  </span>
                )}
              </button>
            </div>

            {/* ARKADAŞLARIMI SEKMESİ */}
            {friendTab === "friends" && (
              <div>
                <div className="flex items-center justify-between mb-6 pb-5">
                  <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black text-green-600 uppercase">{friends.length} Arkadaş</span>
                  </div>
                  <button
                    onClick={() => fetchFriends()}
                    className="text-gray-400 hover:text-green-600 transition-colors p-1.5 rounded-lg hover:bg-gray-50"
                    title="Arkadaş listesini yenile"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-6">
                  {friends.map((f, i) => (
                <div key={i} className="flex items-center justify-between group relative">
                  <div 
                    className="flex items-center gap-4 cursor-pointer hover:translate-x-1 transition-transform w-full"
                    onClick={() => setActiveFriendId(activeFriendId === i ? null : i)}
                  >
                    <div className="relative">
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(f.name)}&background=random`} className="w-10 h-10 rounded-full border border-gray-50" alt="f" />
                      {f.status === 'online' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                    </div>
                    <span className="text-[11px] font-black text-gray-600 group-hover:text-green-600 transition uppercase tracking-tight">{f.name}</span>
                  </div>
                  
                  {/* Arkadaş Silme Menüsü */}
                  {activeFriendId === i && (
                    <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-gray-100 z-10 w-40 overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
                      <Link 
                        to={`/player/${encodeURIComponent(f.name)}`}
                        onClick={() => setActiveFriendId(null)}
                        className="w-full text-left px-4 py-3 text-[10px] font-black text-blue-600 hover:bg-blue-50 transition uppercase tracking-widest flex items-center gap-2 border-b border-gray-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        PROFİL
                      </Link>
                      <button 
                        onClick={() => handleRemoveFriendClick(f)}
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
              </div>
            )}

            {/* İSTEKLER SEKMESİ */}
            {friendTab === "requests" && (
              <div>
                {pendingFriendRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-[10px] font-black uppercase">Henüz arkadaş isteği yok</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingFriendRequests.map((req, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(req.name)}&background=random`} className="w-10 h-10 rounded-full border border-gray-200" alt={req.name} />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-800 uppercase">{req.name}</span>
                            <span className="text-[8px] text-gray-400">{req.email}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptFriendRequest(req.id)}
                            className="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all flex items-center justify-center text-lg"
                            title="Kabul Et"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleRejectFriendRequest(req.id)}
                            className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all flex items-center justify-center text-lg"
                            title="Reddet"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button 
              onClick={() => setIsAddFriendModalOpen(true)}
              className="w-full mt-10 py-4 bg-gray-50 border-2 border-dashed border-gray-200 text-gray-400 text-[9px] font-black rounded-2xl hover:text-green-600 hover:border-green-200 transition-all uppercase tracking-[0.2em]">
              + YENİ ARKADAŞ BUL
            </button>
          </div>
        </aside>

      </div>

      {/* --- ARKADAŞ EKLEME MODALI --- */}
      {isAddFriendModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Arkadaş Ekle</h2>
              <button
                onClick={() => {
                  setIsAddFriendModalOpen(false);
                  setAddFriendCode("");
                }}
                className="text-gray-400 hover:text-gray-600 transition text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={addFriend} className="space-y-4">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Arkadaşınızın Kodunu Giriniz</label>
                <input
                  type="text"
                  maxLength="6"
                  value={addFriendCode}
                  onChange={(e) => setAddFriendCode(e.target.value.toUpperCase())}
                  placeholder="Örn: ABC123"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-lg font-black text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all uppercase"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddFriendModalOpen(false);
                    setAddFriendCode("");
                  }}
                  className="flex-1 px-6 py-3 rounded-xl text-[10px] font-black text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all uppercase tracking-widest"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isAddingFriend}
                  className={`flex-1 px-6 py-3 rounded-xl text-[10px] font-black text-white transition-all shadow-lg uppercase tracking-widest ${
                    isAddingFriend ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isAddingFriend ? "Ekleniyor..." : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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