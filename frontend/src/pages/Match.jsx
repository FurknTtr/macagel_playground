import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SixPosition, { initialSixPositions } from "../components/PositionBoxes/sixPosition";
import SevenPosition, { initialSevenPositions } from "../components/PositionBoxes/sevenPosition";

function Match() {
  const [matchFormat, setMatchFormat] = useState("7v7"); // 6v6 veya 7v7
  const [positions, setPositions] = useState(initialSevenPositions);

  // Şık Modal State'leri
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: "", posId: null, posUser: "", posRole: "" });

  // Format değiştiğinde pozisyonları sıfırla veya yeniden yükle
  useEffect(() => {
    if (matchFormat === "6v6") {
      setPositions(initialSixPositions);
    } else {
      setPositions(initialSevenPositions);
    }
  }, [matchFormat]);

  const handleJoin = (id) => {
    const targetPos = positions.find(p => p.id === id);
    const userAlreadyInAction = positions.some(p => p.user.includes("Sen") && p.id !== id);

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

  const totalPlayers = matchFormat === "6v6" ? 12 : 14;
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
        <div className="relative w-full max-w-2xl aspect-[2/3] lg:aspect-[3/4] bg-green-700 rounded-3xl border-4 border-white/20 shadow-2xl overflow-hidden flex-shrink-0">
          
          {/* Saha Çizgileri (CSS ile basit saha tasarımı) */}
          <div className="absolute top-0 left-0 w-full h-full border-2 border-white/10 m-2 rounded-2xl pointer-events-none"></div>
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/10 rounded-full pointer-events-none"></div>
          
          {/* Ceza Sahaları */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/6 border-2 border-white/10 border-t-0 pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1/6 border-2 border-white/10 border-b-0 pointer-events-none"></div>

          {/* Pozisyonlar / Formalar */}
          {matchFormat === "6v6" 
            ? <SixPosition positions={positions} handleJoin={handleJoin} />
            : <SevenPosition positions={positions} handleJoin={handleJoin} />
          }
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
              </div>
            </div>

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