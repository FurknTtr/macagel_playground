import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  const [matchFormat, setMatchFormat] = useState("7v7"); // 6v6 veya 7v7 veya 8v8
  const [teamAFormation6v6, setTeamAFormation6v6] = useState("1-2-2-1"); // 6v6 A Takımı
  const [teamBFormation6v6, setTeamBFormation6v6] = useState("1-2-2-1"); // 6v6 B Takımı
  const [teamAFormation7v7, setTeamAFormation7v7] = useState("1-2-2-2"); // 7v7 A Takımı
  const [teamBFormation7v7, setTeamBFormation7v7] = useState("1-2-2-2"); // 7v7 B Takımı
  const [teamAFormation8v8, setTeamAFormation8v8] = useState("1-3-3-1"); // 8v8 A Takımı
  const [teamBFormation8v8, setTeamBFormation8v8] = useState("1-3-3-1"); // 8v8 B Takımı
  const [positions, setPositions] = useState(initialSevenPositions);

  // Şık Modal ve Popover State'leri
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: "", posId: null, posUser: "", posRole: "" });
  const [activePopover, setActivePopover] = useState(null);

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

  // Format veya formasyon değiştiğinde pozisyonları sıfırla veya yeniden yükle
  useEffect(() => {
    if (matchFormat === "6v6") {
      // A Takımı ve B Takımı için farklı formasyonlar
      const teamAData = getFormationData6v6(teamAFormation6v6);
      const teamBData = getFormationData6v6(teamBFormation6v6);
      
      // A Takımı (id 1-6) ve B Takımı (id 7-12) verilerini birleştir
      const mockSix = [
        ...teamAData.slice(0, 6),
        ...teamBData.slice(6, 12)
      ];
      
      mockSix[0] = { ...mockSix[0], user: "Fatih K.", stats: { matches: 42, rating: '4.9' } };
      mockSix[5] = { ...mockSix[5], user: "Ahmet Y.", stats: { matches: 15, rating: '3.8' } };
      setPositions(mockSix);
    } else if (matchFormat === "7v7") {
      // A Takımı ve B Takımı için farklı formasyonlar
      const teamAData = getFormationData7v7(teamAFormation7v7);
      const teamBData = getFormationData7v7(teamBFormation7v7);
      
      // A Takımı (id 1-7) ve B Takımı (id 8-14) verilerini birleştir
      const mockSeven = [
        ...teamAData.slice(0, 7),
        ...teamBData.slice(7, 14)
      ];
      
      mockSeven[0] = { ...mockSeven[0], user: "Fatih K.", stats: { matches: 42, rating: '4.9' } };
      mockSeven[6] = { ...mockSeven[6], user: "Ahmet Y.", stats: { matches: 15, rating: '3.8' } };
      setPositions(mockSeven);
    } else if (matchFormat === "8v8") {
      const teamAData = getFormationData8v8(teamAFormation8v8);
      const teamBData = getFormationData8v8(teamBFormation8v8);
      const mockEight = [
        ...teamAData.slice(0, 8),
        ...teamBData.slice(8, 16)
      ];
      
      mockEight[0] = { ...mockEight[0], user: "Fatih K.", stats: { matches: 42, rating: '4.9' } };
      mockEight[7] = { ...mockEight[7], user: "Ahmet Y.", stats: { matches: 15, rating: '3.8' } };
      setPositions(mockEight);
    }

    setActivePopover(null);
  }, [matchFormat, teamAFormation6v6, teamBFormation6v6, teamAFormation7v7, teamBFormation7v7, teamAFormation8v8, teamBFormation8v8]);

  const handleJoin = (id) => {
    const targetPos = positions.find(p => p.id === id);
    const userAlreadyInAction = positions.some(p => p.user.includes("Sen") && p.id !== id);

    // Dolu bir oyuncuya (Kendisi veya boş değilse) tıklanırsa popover'ı yönet
    if (targetPos.user !== "Boş" && !targetPos.user.includes("Sen")) {
      // Açık popover'a tekrar tıklandıysa kapat, değilse aç
      setActivePopover(prev => (prev === id ? null : id));
      return;
    }

    // Boş veya kendisine ait bir yere tıklandığında popover açıksa kapat
    if (activePopover) setActivePopover(null);

    // Eğer mevki boşsa
    if (targetPos.user === "Boş") {
      if (userAlreadyInAction) {
        setConfirmModal({ isOpen: true, type: "error", posId: null });
        return;
      }
      setConfirmModal({ isOpen: true, type: "join", posId: id, posRole: targetPos.role });
    } 
    // Eğer kullanıcı bu mevkiyi zaten tutuyor/istek attıysa
    else if (targetPos.user.includes("Sen")) {
      setConfirmModal({ isOpen: true, type: "leave", posId: id, posRole: targetPos.role });
    }
  };

  const confirmAction = () => {
    if (confirmModal.type === "join") {
      setPositions(prev => prev.map(pos => 
        pos.id === confirmModal.posId ? { ...pos, user: "Sen (İstek)" } : pos
      ));
    } else if (confirmModal.type === "leave") {
      setPositions(prev => prev.map(pos => 
        pos.id === confirmModal.posId ? { ...pos, user: "Boş" } : pos
      ));
    }
    setConfirmModal({ isOpen: false, type: "", posId: null });
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
        <Link to="/menu" className="text-[10px] font-black text-gray-400 hover:text-white transition uppercase">Vazgeç ve Dön</Link>
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
            const isRightSide = parseInt(pos.left) > 50;
            const topPercent = parseInt(pos.top);

            let yAlignClass = "-translate-y-1/2"; 
            let arrowAlignClass = "top-1/2 -translate-y-1/2";
            
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
                  ${isRightSide ? "right-full mr-5 sm:mr-7" : "left-full ml-5 sm:ml-7"}
                  ${yAlignClass}`}
                >
                  {/* Baloncuk Oku (Mutlak Konumlandırma) */}
                  <div className={`absolute w-0 h-0 border-y-[8px] border-y-transparent z-[51] drop-shadow-2xl
                    ${isRightSide ? "border-l-[8px] border-l-gray-800 -right-[8px]" : "border-r-[8px] border-r-gray-800 -left-[8px]"} 
                    ${arrowAlignClass}`}>
                  </div>

                  {/* Yatay Tasarımlı Baloncuk İçeriği */}
                  <div className="bg-gray-800 border border-gray-600 rounded-2xl p-4 w-[280px] sm:w-[320px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col gap-3 relative z-50">
                    
                    {/* Üst Bilgi ve Profil (Yan Yana) */}
                    <div className="flex items-center gap-4">
                      <img src={`https://ui-avatars.com/api/?name=${pos.user}&background=059669&color=fff&size=56`} alt="profil" className="w-14 h-14 rounded-full border-2 border-gray-500 shadow-sm flex-shrink-0" />
                      
                      <div className="flex flex-col flex-1">
                        <div className="flex flex-col mb-1:5">
                            <span className="text-white font-black text-sm leading-tight uppercase tracking-tight line-clamp-1">{pos.user}</span>
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

                    {/* Aksiyon Butonları (Yatay Tek Satır) */}
                    <div className="flex gap-2 w-full">
                      <button className="flex-1 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white text-[10px] font-black py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 uppercase tracking-wider">
                        <span>🫂</span> <span className="hidden sm:inline">Ekle</span>
                      </button>
                      <button className="flex-1 bg-blue-900/40 hover:bg-blue-600 active:bg-blue-500 text-blue-100 text-[10px] font-black py-2.5 rounded-xl transition-all shadow-sm outline outline-1 outline-blue-800/50 flex items-center justify-center gap-1.5 uppercase tracking-wider">
                        <span>🔄</span> <span className="hidden sm:inline">Değiş</span>
                      </button>
                      {/* Yönetici Butonu */}
                      <button className="flex-1 bg-red-900/30 hover:bg-red-600 active:bg-red-500 text-red-100 text-[10px] font-black py-2.5 rounded-xl transition-all shadow-sm outline outline-1 outline-red-900/50 flex items-center justify-center gap-1.5 uppercase tracking-wider title-attr" title="Odadan At (Yönetici)">
                        <span>⛔</span> <span className="hidden sm:inline">Kick</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* SAĞ: MAÇ DETAYLARI & AKSİYON */}
        <aside className="w-full lg:w-96 flex flex-col gap-6 sticky top-10">
          <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-xl">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Pazartesi Gecesi</h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Isparta / Merkez - 21:00</p>
            
            {/* ODA YÖNETİCİSİ: FORMAT SEÇİMİ */}
            <div className="mb-6 bg-gray-900 border border-gray-700 rounded-2xl p-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3 text-center">Dizilim Formatı (Yönetici)</label>
              <div className="flex gap-2 bg-gray-800 p-1.5 rounded-xl">
                <button 
                  onClick={() => setMatchFormat("6v6")}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${matchFormat === "6v6" ? "bg-green-600 text-white shadow-md" : "text-gray-400 hover:text-white hover:bg-gray-700"}`}
                >
                  6 vs 6
                </button>
                <button 
                  onClick={() => setMatchFormat("7v7")}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${matchFormat === "7v7" ? "bg-green-600 text-white shadow-md" : "text-gray-400 hover:text-white hover:bg-gray-700"}`}
                >
                  7 vs 7
                </button>
                <button 
                  onClick={() => setMatchFormat("8v8")}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${matchFormat === "8v8" ? "bg-green-600 text-white shadow-md" : "text-gray-400 hover:text-white hover:bg-gray-700"}`}
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
                        key={`teamA6v6-${key}`}
                        onClick={() => setTeamAFormation6v6(key)}
                        className={`p-3 rounded-xl text-xs font-black transition-all ${
                          teamAFormation6v6 === key 
                            ? "bg-red-600 text-white shadow-md" 
                            : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700"
                        }`}
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
                        key={`teamB6v6-${key}`}
                        onClick={() => setTeamBFormation6v6(key)}
                        className={`p-3 rounded-xl text-xs font-black transition-all ${
                          teamBFormation6v6 === key 
                            ? "bg-blue-600 text-white shadow-md" 
                            : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700"
                        }`}
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
                        key={`teamA8v8-${key}`}
                        onClick={() => setTeamAFormation8v8(key)}
                        className={`p-3 rounded-xl text-xs font-black transition-all ${
                          teamAFormation8v8 === key 
                            ? "bg-red-600 text-white shadow-md" 
                            : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700"
                        }`}
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
                        key={`teamB8v8-${key}`}
                        onClick={() => setTeamBFormation8v8(key)}
                        className={`p-3 rounded-xl text-xs font-black transition-all ${
                          teamBFormation8v8 === key 
                            ? "bg-blue-600 text-white shadow-md" 
                            : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700"
                        }`}
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
                        key={`teamA7v7-${key}`}
                        onClick={() => setTeamAFormation7v7(key)}
                        className={`p-3 rounded-xl text-xs font-black transition-all ${
                          teamAFormation7v7 === key 
                            ? "bg-red-600 text-white shadow-md" 
                            : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700"
                        }`}
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
                        key={`teamB7v7-${key}`}
                        onClick={() => setTeamBFormation7v7(key)}
                        className={`p-3 rounded-xl text-xs font-black transition-all ${
                          teamBFormation7v7 === key 
                            ? "bg-blue-600 text-white shadow-md" 
                            : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700"
                        }`}
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
              ) : (
                <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">👋</div>
              )}

              <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                {confirmModal.type === "error" ? "İşlem Başarısız" : 
                 confirmModal.type === "join" ? "Kadroya Katıl" : "Kadrodan Çık"}
              </h3>
              
              <p className="text-xs font-bold text-gray-400 mt-3 leading-relaxed px-2">
                {confirmModal.type === "error" ? "Aynı anda birden fazla mevkiye başvuramazsınız. Başka bir yere geçmek için lütfen önce bulunduğunuz mevkiyi terk edin." : 
                 confirmModal.type === "join" ? <span className="text-white">({confirmModal.posRole})</span> : <span className="text-white">({confirmModal.posRole})</span>}
                <br/>
                {confirmModal.type === "join" && "Bu mevkiye katılma isteği göndermek istediğine emin misin?"}
                {confirmModal.type === "leave" && "Bu mevkiyi terk etmek veya isteğini iptal etmek istediğine emin misin?"}
              </p>
            </div>

            {/* Butonlar */}
            <div className="flex gap-3 justify-center">
              {confirmModal.type === "error" ? (
                <button 
                  onClick={() => setConfirmModal({ isOpen: false, type: "", posId: null })}
                  className="px-8 py-3.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all w-full"
                >
                  ANLADIM
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setConfirmModal({ isOpen: false, type: "", posId: null })}
                    className="flex-1 py-3.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    İPTAL
                  </button>
                  <button 
                    onClick={confirmAction}
                    className={`flex-1 py-3.5 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg 
                      ${confirmModal.type === "join" ? "bg-green-600 hover:bg-green-500 shadow-green-900/40" : "bg-red-600 hover:bg-red-500 shadow-red-900/40"}`}
                  >
                    ONAYLA
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Match;