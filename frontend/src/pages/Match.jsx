import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import SixPosition, { 
  initialSixPositions,
  formation_1_2_2_1,
  formation_1_1_3_1,
  formation_1_1_2_2,
  formation_1_2_1_2,
  formationDefinitions as sixFormationDefinitions
} from "../components/PositionBoxes/sixPosition";
import SevenPosition, { 
  initialSevenPositions,
  formationDefinitions as sevenFormationDefinitions,
  formation_1_3_2_1,
  formation_1_2_3_1,
  formation_1_2_2_2,
  formation_1_1_4_1
} from "../components/PositionBoxes/sevenPosition";
import EightPosition, {
  initialEightPositions,
  eightFormationDefinitions,
  formation_1_3_3_1,
  formation_1_3_2_2,
  formation_1_2_3_2,
  formation_1_2_2_3
} from "../components/PositionBoxes/eightPosition";

function Match() {
  const { matchId } = useParams(); // URL'den match ID'sini al
  const [matchFormat, setMatchFormat] = useState("7v7"); // 6v6 veya 7v7 veya 8v8
  const [teamAFormation6v6, setTeamAFormation6v6] = useState("1-2-2-1"); // 6v6 A Takımı
  const [teamBFormation6v6, setTeamBFormation6v6] = useState("1-2-2-1"); // 6v6 B Takımı
  const [teamAFormation7v7, setTeamAFormation7v7] = useState("1-2-2-2"); // 7v7 A Takımı
  const [teamBFormation7v7, setTeamBFormation7v7] = useState("1-2-2-2"); // 7v7 B Takımı
  const [teamAFormation8v8, setTeamAFormation8v8] = useState("1-3-3-1"); // 8v8 A Takımı
  const [teamBFormation8v8, setTeamBFormation8v8] = useState("1-3-3-1"); // 8v8 B Takımı
  const [positions, setPositions] = useState(initialSevenPositions);

  // Şık Modal ve Popover State'leri
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: "", posId: null, posUser: "", posRole: "", posUserId: null });
  const [activePopover, setActivePopover] = useState(null);
  const [matchOwner, setMatchOwner] = useState(null); // Maç yöneticisi
  const [matchData, setMatchData] = useState(null); // Backend'den gelen maç verileri
  const [currentUser, setCurrentUser] = useState(null); // Güncel kullanıcı
  
  // Kopyalama Toast State'i
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(matchData?.inviteCode || "X7B9K2");
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  // 6v6 Formasyon seçimine göre pozisyon datasını getir
  const getFormationData6v6 = (formation) => {
    switch(formation) {
      case "1-1-3-1":
        return formation_1_1_3_1;
      case "1-1-2-2":
        return formation_1_1_2_2;
      case "1-2-1-2":
        return formation_1_2_1_2;
      default: // 1-2-2-1
        return formation_1_2_2_1;
    }
  };

  // 7v7 Formasyon seçimine göre pozisyon datasını getir
  const getFormationData7v7 = (formation) => {
    switch(formation) {
      case "1-3-2-1":
        return formation_1_3_2_1;
      case "1-2-3-1":
        return formation_1_2_3_1;
      case "1-1-4-1":
        return formation_1_1_4_1;
      default: // 1-2-2-2
        return formation_1_2_2_2;
    }
  };

  // 8v8 Formasyon seçimine göre pozisyon datasını getir
  const getFormationData8v8 = (formation) => {
    switch(formation) {
      case "1-3-2-2":
        return formation_1_3_2_2;
      case "1-2-3-2":
        return formation_1_2_3_2;
      case "1-2-2-3":
        return formation_1_2_2_3;
      default: // 1-3-3-1
        return formation_1_3_3_1;
    }
  };

  // Format veya formasyon değiştiğinde (veya sayfa ilk açıldığında) backendden oyuncu verisini çekip pozisyonlara yerleştir
  useEffect(() => {
    fetchMatchDetailsAndPlayers();
  }, [matchFormat, teamAFormation6v6, teamBFormation6v6, teamAFormation7v7, teamBFormation7v7, teamAFormation8v8, teamBFormation8v8]);

  const fetchMatchDetailsAndPlayers = async () => {
    try {
      if (!matchId) {
        console.error("matchId bulunamadı");
        return;
      }

      // Güncel user bilgisini al
      const userStr = localStorage.getItem("user");
      const currentUserData = userStr ? JSON.parse(userStr) : null;
      setCurrentUser(currentUserData);

      // Backend'den match detaylarını ve oyuncuları çek
      const response = await fetch(`${API_BASE_URL}/maca-gel/getMatch/${matchId}`);
      
      if (!response.ok) {
        console.error("Match getirilemedi:", response.status);
        return;
      }

      const matchDataResponse = await response.json();
      setMatchData(matchDataResponse);
      
      // Maç yöneticisini set et (matchDataResponse'den oku, state'den değil!)
      const ownerId = typeof matchDataResponse.owner === 'object' ? matchDataResponse.owner._id : matchDataResponse.owner;
      setMatchOwner(ownerId);
      
      const players = matchDataResponse.players || [];

      // Format'a göre pozisyon templatesi al
      let teamAData, teamBData;
      
      if (matchFormat === "6v6") {
        teamAData = getFormationData6v6(teamAFormation6v6);
        teamBData = getFormationData6v6(teamBFormation6v6);
        const mockSix = [...teamAData.slice(0, 6), ...teamBData.slice(6, 12)];
        
        // Backend'den gelen oyuncuları positionId'ye göre positions array'e yerleştir
        players.forEach(player => {
          if (player.positionId > 0 && player.positionId <= 12) {
            // Güncel user'sa "(Sen)" ekle
            const username = player.user?.username || "Boş";
            const displayName = currentUserData && player.user?._id === currentUserData.id ? `${username} (Sen)` : username;
            
            mockSix[player.positionId - 1] = {
              ...mockSix[player.positionId - 1],
              user: displayName,
              stats: player.user?.stats || {},
              userId: player.user?._id
            };
          }
        });
        
        setPositions(mockSix);
      } else if (matchFormat === "7v7") {
        teamAData = getFormationData7v7(teamAFormation7v7);
        teamBData = getFormationData7v7(teamBFormation7v7);
        const mockSeven = [...teamAData.slice(0, 7), ...teamBData.slice(7, 14)];
        
        players.forEach(player => {
          if (player.positionId > 0 && player.positionId <= 14) {
            // Güncel user'sa "(Sen)" ekle
            const username = player.user?.username || "Boş";
            const displayName = currentUserData && player.user?._id === currentUserData.id ? `${username} (Sen)` : username;
            
            mockSeven[player.positionId - 1] = {
              ...mockSeven[player.positionId - 1],
              user: displayName,
              stats: player.user?.stats || {},
              userId: player.user?._id
            };
          }
        });
        
        setPositions(mockSeven);
      } else if (matchFormat === "8v8") {
        teamAData = getFormationData8v8(teamAFormation8v8);
        teamBData = getFormationData8v8(teamBFormation8v8);
        const mockEight = [...teamAData.slice(0, 8), ...teamBData.slice(8, 16)];
        
        players.forEach(player => {
          if (player.positionId > 0 && player.positionId <= 16) {
            // Güncel user'sa "(Sen)" ekle
            const username = player.user?.username || "Boş";
            const displayName = currentUserData && player.user?._id === currentUserData.id ? `${username} (Sen)` : username;
            
            mockEight[player.positionId - 1] = {
              ...mockEight[player.positionId - 1],
              user: displayName,
              stats: player.user?.stats || {},
              userId: player.user?._id
            };
          }
        });
        
        setPositions(mockEight);
      }
    } catch (error) {
      console.error("Match detayları getirirken hata oluştu:", error);
    }
    
    setActivePopover(null);
  };

  const handleJoin = (id) => {
    const targetPos = positions.find(p => p.id === id);
    
    // Aynı pozisyona tıklandıysa popover'ı kapat, yoksa aç
    if (activePopover === id) {
      setActivePopover(null);
    } else {
      setActivePopover(id);
    }
  };

  const handleJoinPosition = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id) return alert("Önce giriş yapmalısınız");

      // Kullanıcı zaten başka bir pozisyonda varsa kontrol et
      const userAlreadyInPosition = positions.find(
        pos => pos.userId === user.id && pos.id !== confirmModal.posId
      );
      
      if (userAlreadyInPosition) {
        alert("Birden fazla pozisyona katılamazsın");
        setConfirmModal({ isOpen: false, type: "", posId: null, posUserId: null });
        return;
      }

      // Backend'e mevkiye katılma isteği yolla
      const response = await fetch(`${API_BASE_URL}/maca-gel/joinPosition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: matchId,
          userId: user.id,
          positionId: confirmModal.posId,
          position: confirmModal.posRole
        })
      });

      if (response.ok) {
        setPositions(prev => prev.map(pos => 
          pos.id === confirmModal.posId ? { ...pos, user: user.username } : pos
        ));
      } else {
        alert("Mevkiye katılırken hata oluştu!");
      }
    } catch (err) {
      console.error(err);
      alert("İşlem gerçekleştirilemedi");
    } finally {
      setConfirmModal({ isOpen: false, type: "", posId: null, posUserId: null });
    }
  };

  const handleLeavePosition = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id) return alert("Önce giriş yapmalısınız");

      // Backend'e maçtan ayrılma isteği yolla
      const response = await fetch(`${API_BASE_URL}/maca-gel/leave/${user.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: matchId })
      });

      if (response.ok) {
        setPositions(prev => prev.map(pos => 
          pos.id === confirmModal.posId ? { ...pos, user: "Boş" } : pos
        ));
      } else {
        alert("Maçtan ayrılırken hata oluştu!");
      }
    } catch (err) {
      console.error(err);
      alert("İşlem gerçekleştirilemedi");
    } finally {
      setConfirmModal({ isOpen: false, type: "", posId: null, posUserId: null });
    }
  };

  const handleKickPlayer = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id) return alert("Önce giriş yapmalısınız");

      // Backend'e oyuncu atma isteği yolla (sadece yönetici yapabilir)
      const response = await fetch(`${API_BASE_URL}/maca-gel/leave/${confirmModal.posUserId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: matchId, operationType: "kick", requesterId: user.id })
      });

      if (response.ok) {
        setPositions(prev => prev.map(pos => 
          pos.id === confirmModal.posId ? { ...pos, user: "Boş", userId: null } : pos
        ));
      } else {
        alert("Oyuncu atılırken hata oluştu!");
      }
    } catch (err) {
      console.error(err);
      alert("İşlem gerçekleştirilemedi");
    } finally {
      setConfirmModal({ isOpen: false, type: "", posId: null, posUserId: null });
    }
  };

  const confirmAction = async () => {
    if (confirmModal.type === "join") {
      await handleJoinPosition();
    } else if (confirmModal.type === "leave") {
      await handleLeavePosition();
    } else if (confirmModal.type === "kick") {
      await handleKickPlayer();
    }
  };

  const totalPlayers = matchFormat === "6v6" ? 12 : matchFormat === "7v7" ? 14 : 16;
  const emptySpots = positions.filter(p => p.user === "Boş").length;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-gray-800 px-10 py-3 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center gap-6">
          <Link to="/menu" className="text-xl font-black text-green-500 italic uppercase">MAÇA GEL</Link>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Kadro Seçimi</span>
        </div>
        <Link to="/discover" className="text-[10px] font-black text-gray-400 hover:text-white transition uppercase">Vazgeç ve Dön</Link>
      </nav>

      {/* --- ANA ALAN --- */}
      <div className="flex-1 flex flex-col lg:flex-row p-6 lg:p-12 gap-12 max-w-[1400px] mx-auto w-full items-start justify-center">

        {/* SOL: SAHA GÖRÜNÜMÜ */}
        <div className="relative w-full max-w-2xl aspect-[2/3] lg:aspect-[3/4] bg-green-700 rounded-3xl border-4 border-white/20 shadow-2xl flex-shrink-0">
          
          {/* Saha Çizgileri (Taşıp Dışarı Çıkmaması İçin Gizleyici Sarıcı) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[1.3rem]">
            <div className="absolute top-0 left-0 w-full h-full border-2 border-white/10 m-2 rounded-2xl"></div>
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/10 rounded-full"></div>
            
            {/* Ceza Sahaları */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/6 border-2 border-white/10 border-t-0"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1/6 border-2 border-white/10 border-b-0"></div>
          </div>

          {/* Pozisyonlar / Formalar */}
          {matchFormat === "6v6" 
            ? <SixPosition positions={positions} handleJoin={handleJoin} />
            : matchFormat === "7v7"
              ? <SevenPosition positions={positions} handleJoin={handleJoin} />
              : <EightPosition positions={positions} handleJoin={handleJoin} />
          }

          {/* --- AKTİF POPOVER (Mesaj Baloncuğu) --- */}
          {activePopover && (() => {
            const pos = positions.find(p => p.id === activePopover);
            if (!pos) return null;
            
            const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
            const isOwnPosition = pos.user.includes("(Sen)");
            const isOwner = currentUser.id === matchOwner;
            const isEmptyPosition = pos.user === "Boş";
            
            const isRightSide = parseInt(pos.left) > 50;
            const posLeft = parseInt(pos.left);
            const isCenter = posLeft === 50;
            const topPercent = parseInt(pos.top);

            let yAlignClass = "-translate-y-1/2"; 
            let arrowAlignClass = "top-1/2 -translate-y-1/2";
            let xPositionClass = isCenter ? "-translate-x-1/2 left-1/2" : (isRightSide ? "right-full mr-5 sm:mr-7" : "left-full ml-5 sm:ml-7");
            
            if (topPercent <= 20) {
                yAlignClass = "top-0 -mt-4"; 
                arrowAlignClass = "top-4"; 
            } else if (topPercent >= 80) {
                yAlignClass = "bottom-0 -mb-4"; 
                arrowAlignClass = "bottom-4"; 
            }

            return (
              <div 
                key={`popover-${pos.id}`}
                className="absolute z-50 flex pointer-events-none"
                style={{ top: pos.top, left: pos.left }}
              >
                <div className={`pointer-events-auto absolute flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200
                  ${xPositionClass}
                  ${yAlignClass}`}
                >
                  {/* Baloncuk Oku (Mutlak Konumlandırma) */}
                  <div className={`absolute w-0 h-0 border-y-[8px] border-y-transparent z-[51] drop-shadow-2xl
                    ${isCenter ? "hidden" : isRightSide ? "border-l-[8px] border-l-gray-800 -right-[8px]" : "border-r-[8px] border-r-gray-800 -left-[8px]"} 
                    ${arrowAlignClass}`}>
                  </div>

                  {/* Yatay Tasarımlı Baloncuk İçeriği */}
                  <div className="bg-gray-800 border border-gray-600 rounded-2xl p-4 w-[280px] sm:w-[320px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col gap-3 relative z-50">
                    
                    {isEmptyPosition ? (
                      /* Boş Pozisyon İçin Popover */
                      <>
                        <div className="flex items-center justify-center flex-col gap-3">
                          <div className="w-20 h-20 bg-gray-700/50 rounded-full border-4 border-dashed border-gray-600 flex items-center justify-center">
                            <span className="text-4xl">+</span>
                          </div>
                          <div className="text-center">
                            <span className="text-white font-black text-sm uppercase tracking-tight">BOŞ POZİSYON</span>
                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mt-1">{pos.role}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            const userAlreadyHasPosition = positions.some(p => p.user.includes("Sen"));
                            if (userAlreadyHasPosition) {
                              alert("Zaten bir pozisyondadasınız. Önce o pozisyondan çıkın.");
                              return;
                            }
                            setConfirmModal({ isOpen: true, type: "join", posId: pos.id, posRole: pos.role });
                            setActivePopover(null);
                          }}
                          className="w-full bg-green-600 hover:bg-green-500 active:bg-green-400 text-white text-[10px] font-black py-3 rounded-xl transition-all shadow-lg shadow-green-900/40 flex items-center justify-center gap-1.5 uppercase tracking-wider">
                          <span>➕</span> <span>Pozisyona Katıl</span>
                        </button>
                      </>
                    ) : (
                      /* Dolu Pozisyon İçin Popover */
                      <>
                        {/* Üst Bilgi ve Profil (Yan Yana) */}
                        <div className="flex items-center gap-4">
                          <img src={`https://ui-avatars.com/api/?name=${pos.user.replace(" (Sen)", "")}&background=059669&color=fff&size=56`} alt="profil" className="w-14 h-14 rounded-full border-2 border-gray-500 shadow-sm flex-shrink-0" />
                          
                          <div className="flex flex-col flex-1">
                            <div className="flex flex-col mb-1:5">
                                <span className="text-white font-black text-sm leading-tight uppercase tracking-tight line-clamp-1">{pos.user.replace(" (Sen)", "")}</span>
                                <span className="text-green-400 text-[10px] font-bold uppercase tracking-widest leading-none">{pos.role}</span>
                            </div>
                            
                            {/* İstatistikler */}
                            <div className="flex gap-4 bg-gray-900/60 rounded-lg p-2 border border-gray-700/50 mt-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Maç</span>
                                <span className="text-white font-black text-xs">{pos.stats?.matches || 15}</span>
                              </div>
                          <div className="w-px h-3.5 bg-gray-600/50 self-center"></div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Puan</span>
                            <span className="text-yellow-500 font-black text-xs">{pos.stats?.rating || '4.2'}★</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Aksiyon Butonları - Koşullu Gösterim */}
                    <div className="flex gap-2 w-full flex-wrap">
                      {/* Arkadaş Ekle - Her zaman göster */}
                      <button 
                        onClick={async () => {
                          try {
                            const user = JSON.parse(localStorage.getItem("user") || "{}");
                            if (!user.id) {
                              alert("Önce giriş yapmalısınız");
                              return;
                            }

                            const response = await fetch(`${API_BASE_URL}/maca-gel/addFriend`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                userId: user.id,
                                friendId: pos.userId
                              })
                            });

                            const data = await response.json();
                            if (response.ok) {
                              alert("Arkadaş başarıyla eklendi!");
                              setActivePopover(null);
                            } else {
                              alert(data.message || "Arkadaş eklenemedi");
                            }
                          } catch (err) {
                            console.error(err);
                            alert("Sunucuya bağlanılamıyor");
                          }
                        }}
                        className="flex-1 min-w-[50px] bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white text-[10px] font-black py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 uppercase tracking-wider">
                        <span>🫂</span> <span className="hidden sm:inline">Ekle</span>
                      </button>

                      {/* Profili Gör - Her zaman göster */}
                      <Link to={`/player/${encodeURIComponent(pos.user.replace(" (Sen)", ""))}`} className="flex-1 min-w-[50px] bg-teal-500 hover:bg-teal-400 active:bg-teal-300 text-white text-[10px] font-black py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 uppercase tracking-wider">
                        <span>👤</span> <span className="hidden sm:inline">Profili</span>
                      </Link>

                      {/* LEAVE Butonu - Kendi pozisyonu ise (herkes için) */}
                      {isOwnPosition && (
                        <button 
                          onClick={() => {
                            setConfirmModal({ 
                              isOpen: true, 
                              type: "leave", 
                              posId: pos.id, 
                              posRole: pos.role,
                              posUserId: null 
                            });
                            setActivePopover(null);
                          }}
                          className="flex-1 min-w-[50px] bg-red-600/40 hover:bg-red-600 active:bg-red-500 text-red-100 text-[10px] font-black py-2.5 rounded-xl transition-all shadow-sm outline outline-1 outline-red-900/50 flex items-center justify-center gap-1.5 uppercase tracking-wider">
                          <span>👋</span> <span className="hidden sm:inline">Ayrıl</span>
                        </button>
                      )}

                      {/* KICK Butonu - Başkasının pozisyonu ve owner ise */}
                      {!isOwnPosition && isOwner && (
                        <button 
                          onClick={() => {
                            setConfirmModal({ 
                              isOpen: true, 
                              type: "kick", 
                              posId: pos.id, 
                              posRole: pos.role,
                              posUser: pos.user,
                              posUserId: pos.userId
                            });
                            setActivePopover(null);
                          }}
                          className="flex-1 min-w-[50px] bg-orange-600/40 hover:bg-orange-600 active:bg-orange-500 text-orange-100 text-[10px] font-black py-2.5 rounded-xl transition-all shadow-sm outline outline-1 outline-orange-900/50 flex items-center justify-center gap-1.5 uppercase tracking-wider">
                          <span>⛔</span> <span className="hidden sm:inline">Kick</span>
                        </button>
                      )}
                    </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* SAĞ: MAÇ DETAYLARI & AKSİYON */}
        <aside className="w-full lg:w-96 flex flex-col gap-6 sticky top-10">
          <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-xl relative">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2 pr-28">{matchData?.name || "Maç Adı"}</h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">{matchData?.location || "Konum"} - {matchData?.date ? new Date(matchData.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : "Saat"}</p>

            {/* Maç Kodu */}
            <div 
              className="absolute top-8 right-8 bg-black/50 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg backdrop-blur-sm cursor-pointer hover:bg-black hover:border-green-500/50 transition-all active:scale-95" 
              title="Kodu Kopyala"
              onClick={handleCopyCode}
            >
              <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">KOD:</span>
              <span className="text-sm font-black tracking-widest">{matchData?.inviteCode || "X7B9K2"}</span>
            </div>
            
            {/* ODA YÖNETİCİSİNE ÖZEL: FORMAT SEÇİMİ */}
            <div className="mb-6 bg-gray-900 border border-gray-700 rounded-2xl p-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3 text-center">Dizilim Formatı {!currentUser || currentUser.id !== matchOwner ? "(Sadece Yönetici)" : ""}</label>
              <div className="flex gap-2 bg-gray-800 p-1.5 rounded-xl">
                <button 
                  disabled={!currentUser || currentUser.id !== matchOwner}
                  onClick={() => setMatchFormat("6v6")}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${matchFormat === "6v6" ? "bg-green-600 text-white shadow-md" : "text-gray-400 hover:text-white hover:bg-gray-700"} ${!currentUser || currentUser.id !== matchOwner ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  6 vs 6
                </button>
                <button 
                  disabled={!currentUser || currentUser.id !== matchOwner}
                  onClick={() => setMatchFormat("7v7")}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${matchFormat === "7v7" ? "bg-green-600 text-white shadow-md" : "text-gray-400 hover:text-white hover:bg-gray-700"} ${!currentUser || currentUser.id !== matchOwner ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  7 vs 7
                </button>
                <button 
                  disabled={!currentUser || currentUser.id !== matchOwner}
                  onClick={() => setMatchFormat("8v8")}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${matchFormat === "8v8" ? "bg-green-600 text-white shadow-md" : "text-gray-400 hover:text-white hover:bg-gray-700"} ${!currentUser || currentUser.id !== matchOwner ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  8 vs 8
                </button>
              </div>
            </div>

            {/* ODA YÖNETİCİSİ: 6v6 FORMASYON SEÇİMİ - A TAKIMI */}
            {matchFormat === "6v6" && (
              <>
                <div className="mb-6 bg-gray-900 border border-red-900/50 rounded-2xl p-4">
                  <label className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-3 text-center">🔴 A TAKIMI - Formasyon Seç</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(sixFormationDefinitions).map(([key, formation]) => (
                      <button
                        disabled={!currentUser || currentUser.id !== matchOwner}
                        key={`teamA6v6-${key}`}
                        onClick={() => setTeamAFormation6v6(key)}
                        className={`p-3 rounded-xl text-xs font-black transition-all ${
                          teamAFormation6v6 === key 
                            ? "bg-red-600 text-white shadow-md" 
                            : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700"
                        } ${!currentUser || currentUser.id !== matchOwner ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="text-center font-black">{key}</div>
                        <div className="text-[8px] text-opacity-80">{formation.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6 bg-gray-900 border border-blue-900/50 rounded-2xl p-4">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-3 text-center">🔵 B TAKIMI - Formasyon Seç</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(sixFormationDefinitions).map(([key, formation]) => (
                      <button
                        disabled={!currentUser || currentUser.id !== matchOwner}
                        key={`teamB6v6-${key}`}
                        onClick={() => setTeamBFormation6v6(key)}
                        className={`p-3 rounded-xl text-xs font-black transition-all ${
                          teamBFormation6v6 === key 
                            ? "bg-blue-600 text-white shadow-md" 
                            : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700"
                        } ${!currentUser || currentUser.id !== matchOwner ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="text-center font-black">{key}</div>
                        <div className="text-[8px] text-opacity-80">{formation.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ODA YÖNETİCİSİ: 8v8 FORMASYON SEÇİMİ - A TAKIMI */}
            {matchFormat === "8v8" && (
              <>
                <div className="mb-6 bg-gray-900 border border-red-900/50 rounded-2xl p-4">
                  <label className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-3 text-center">🔴 A TAKIMI - 8v8 Formasyon Seç</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(eightFormationDefinitions).map(([key, formation]) => (
                      <button
                        disabled={!currentUser || currentUser.id !== matchOwner}
                        key={`teamA8v8-${key}`}
                        onClick={() => setTeamAFormation8v8(key)}
                        className={`p-3 rounded-xl text-xs font-black transition-all ${
                          teamAFormation8v8 === key 
                            ? "bg-red-600 text-white shadow-md" 
                            : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700"
                        } ${!currentUser || currentUser.id !== matchOwner ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="text-center font-black">{key}</div>
                        <div className="text-[8px] text-opacity-80">{formation.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6 bg-gray-900 border border-blue-900/50 rounded-2xl p-4">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-3 text-center">🔵 B TAKIMI - 8v8 Formasyon Seç</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(eightFormationDefinitions).map(([key, formation]) => (
                      <button
                        disabled={!currentUser || currentUser.id !== matchOwner}
                        key={`teamB8v8-${key}`}
                        onClick={() => setTeamBFormation8v8(key)}
                        className={`p-3 rounded-xl text-xs font-black transition-all ${
                          teamBFormation8v8 === key 
                            ? "bg-blue-600 text-white shadow-md" 
                            : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700"
                        } ${!currentUser || currentUser.id !== matchOwner ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="text-center font-black">{key}</div>
                        <div className="text-[8px] text-opacity-80">{formation.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ODA YÖNETİCİSİ: 7v7 FORMASYON SEÇİMİ - A TAKIMI */}
            {matchFormat === "7v7" && (
              <>
                <div className="mb-6 bg-gray-900 border border-red-900/50 rounded-2xl p-4">
                  <label className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-3 text-center">🔴 A TAKIMI - Formasyon Seç</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(sevenFormationDefinitions).map(([key, formation]) => (
                      <button
                        disabled={!currentUser || currentUser.id !== matchOwner}
                        key={`teamA7v7-${key}`}
                        onClick={() => setTeamAFormation7v7(key)}
                        className={`p-3 rounded-xl text-xs font-black transition-all ${
                          teamAFormation7v7 === key 
                            ? "bg-red-600 text-white shadow-md" 
                            : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700"
                        } ${!currentUser || currentUser.id !== matchOwner ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="text-center font-black">{key}</div>
                        <div className="text-[8px] text-opacity-80">{formation.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6 bg-gray-900 border border-blue-900/50 rounded-2xl p-4">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-3 text-center">🔵 B TAKIMI - Formasyon Seç</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(sevenFormationDefinitions).map(([key, formation]) => (
                      <button
                        disabled={!currentUser || currentUser.id !== matchOwner}
                        key={`teamB7v7-${key}`}
                        onClick={() => setTeamBFormation7v7(key)}
                        className={`p-3 rounded-xl text-xs font-black transition-all ${
                          teamBFormation7v7 === key 
                            ? "bg-blue-600 text-white shadow-md" 
                            : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700"
                        } ${!currentUser || currentUser.id !== matchOwner ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="text-center font-black">{key}</div>
                        <div className="text-[8px] text-opacity-80">{formation.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-4 mb-8">
               <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-[10px] font-black text-gray-500 uppercase">Toplam Kadro</span>
                  <span className="text-sm font-black">{totalPlayers} Kişi</span>
               </div>
               <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-[10px] font-black text-gray-500 uppercase">Boş Yer</span>
                  <span className="text-sm font-black text-green-500">{emptySpots} Mevki</span>
               </div>
               <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-500 uppercase">Saha Ücreti (Kişi Başı)</span>
                    <span className="text-[8px] font-bold text-gray-600 mt-1">Ödemeler halı sahada elden yapılır.</span>
                  </div>
                  <span className="text-sm font-black text-yellow-500">150 TL</span>
               </div>
            </div>

            <button className="w-full py-4 bg-green-600 hover:bg-green-500 text-white text-[11px] font-black rounded-2xl transition-all shadow-lg shadow-green-900/20 uppercase tracking-[0.2em]">
              KADROYU ONAYLA
            </button>
          </div>

          <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4">
            <p className="text-[9px] font-bold text-blue-400 uppercase leading-relaxed text-center">
              💡 Bir mevkiye tıkladığında adın o pozisyona yazılır. Maç saatine kadar mevkini değiştirebilirsin.
            </p>
          </div>
        </aside>

      </div>

      {/* --- ŞIK ONAY MODALI --- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-gray-800 border border-gray-700 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center">
            
            {/* Modal İkon / Başlık */}
            <div className="mb-6">
              {confirmModal.type === "error" ? (
                <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🚫</div>
              ) : confirmModal.type === "join" ? (
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🎯</div>
              ) : confirmModal.type === "leave" ? (
                <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">👋</div>
              ) : (
                <div className="w-16 h-16 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🚪</div>
              )}

              <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                {confirmModal.type === "error" ? "İşlem Başarısız" : 
                 confirmModal.type === "join" ? "Kadroya Katıl" : 
                 confirmModal.type === "leave" ? "Kadrodan Çık" : "Oyuncu At"}
              </h3>
              
              <p className="text-xs font-bold text-gray-400 mt-3 leading-relaxed px-2">
                {confirmModal.type === "error" ? "Aynı anda birden fazla mevkiye başvuramazsınız. Başka bir yere geçmek için lütfen önce bulunduğunuz mevkiyi terk edin." : 
                 confirmModal.type === "join" ? <span className="text-white">({confirmModal.posRole})</span> : <span className="text-white">({confirmModal.posRole})</span>}
                <br/>
                {confirmModal.type === "join" && "Bu mevkiye katılma isteği göndermek istediğine emin misin?"}
                {confirmModal.type === "leave" && "Bu mevkiyi terk etmek veya isteğini iptal etmek istediğine emin misin?"}
                {confirmModal.type === "kick" && `${confirmModal.posUser} oyuncusunu attan çıkarmak istediğine emin misin?`}
              </p>
            </div>

            {/* Butonlar */}
            <div className="flex gap-3 justify-center">
              {confirmModal.type === "error" ? (
                <button 
                  onClick={() => setConfirmModal({ isOpen: false, type: "", posId: null, posUserId: null })}
                  className="px-8 py-3.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all w-full"
                >
                  ANLADIM
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setConfirmModal({ isOpen: false, type: "", posId: null, posUserId: null })}
                    className="flex-1 py-3.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    İPTAL
                  </button>
                  <button 
                    onClick={confirmAction}
                    className={`flex-1 py-3.5 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg 
                      ${confirmModal.type === "join" ? "bg-green-600 hover:bg-green-500 shadow-green-900/40" : confirmModal.type === "leave" ? "bg-red-600 hover:bg-red-500 shadow-red-900/40" : "bg-orange-600 hover:bg-orange-500 shadow-orange-900/40"}`}
                  >
                    ONAYLA
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- KOPYALAMA TOAST BİLDİRİMİ --- */}
      {copied && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 border border-green-500/50 text-white pl-5 pr-14 py-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 overflow-hidden min-w-[300px]">
          <div className="relative z-10 font-black text-xs tracking-widest uppercase flex items-center justify-between gap-3 text-green-400">
            <span className="flex items-center gap-2">
              <span className="text-lg bg-green-500 text-black rounded-full w-5 h-5 flex items-center justify-center font-bold">✓</span>
              KOD KOPYALANDI!
            </span>
          </div>
          {/* Progress bar */}
          <div 
            className="absolute bottom-0 left-0 h-1 bg-green-500" 
            style={{ 
              animation: 'shrink 2.5s linear forwards' 
            }}
          ></div>
        </div>
      )}

      {/* Animasyon Keyframe (Tailwind ile yapılamayan özel animasyon) */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

export default Match;