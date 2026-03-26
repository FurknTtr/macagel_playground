import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";

function PlayerProfile() {
  const { id } = useParams();
  
  // Örnek Oyuncu Verisi
  const [player, setPlayer] = useState({
    name: id || "Kullanıcı",
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(id || "Kullanıcı")}&background=random&color=fff&size=128`,
    matchesPlayed: 42,
    rating: 4.5,
    roles: ["Forvet", "Ortasaha"],
    comments: [
      { id: 1, author: "Ali Yılmaz", rating: 5, text: "Harika takım oyunu, pasları çok iyi.", date: "12 Mart 2026", isOwnComment: false },
      { id: 2, author: "Ayşe Demir", rating: 4, text: "Agresif oynuyor ama bitiriciliği mükemmel.", date: "20 Mart 2026", isOwnComment: false },
      { id: 3, author: "Furkan Tatar", rating: 5, text: "Benim kadromdaydı, efsane oynadı.", date: "25 Mart 2026", isOwnComment: true } // Bu yorumu giriş yapmış kişi atmış gibi simüle edelim.
    ]
  });

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false, commentId: null });
  const [editingCommentId, setEditingCommentId] = useState(null);

  const handleRateSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (editingCommentId) {
      // Yorum güncelleme
      setPlayer(prev => ({
        ...prev,
        comments: prev.comments.map(c => 
          c.id === editingCommentId 
            ? { ...c, rating: newRating, text: newComment, date: "Bugün (Düzenlendi)" } 
            : c
        )
      }));
    } else {
      // Yeni yorum ekleme
      const newCommentObj = {
        id: Date.now(),
        author: "Furkan Tatar", // Şu an giriş yapan kullanıcı varsayımı
        rating: newRating,
        text: newComment,
        date: "Bugün",
        isOwnComment: true
      };

      setPlayer(prev => ({
        ...prev,
        comments: [newCommentObj, ...prev.comments]
      }));
    }
    
    setIsRatingModalOpen(false);
    setNewComment("");
    setNewRating(5);
    setEditingCommentId(null);
  };

  const openNewRatingModal = () => {
    setEditingCommentId(null);
    setNewRating(5);
    setNewComment("");
    setIsRatingModalOpen(true);
  };

  const handleEditCommentClick = (comment) => {
    setEditingCommentId(comment.id);
    setNewRating(comment.rating);
    setNewComment(comment.text);
    setIsRatingModalOpen(true);
  };

  const handleDeleteCommentClick = (commentId) => {
    setDeleteConfirmModal({ isOpen: true, commentId });
  };

  const confirmDeleteComment = () => {
    setPlayer(prev => ({
      ...prev,
      comments: prev.comments.filter(c => c.id !== deleteConfirmModal.commentId)
    }));
    setDeleteConfirmModal({ isOpen: false, commentId: null });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white shadow-sm px-10 py-3 flex justify-between items-center sticky top-0 z-50 border-b border-gray-100 font-bold">
        <Link to="/menu" className="text-2xl font-black text-green-600 italic tracking-tighter">MAÇA GEL</Link>
        <Link to={-1} className="text-[10px] font-black text-gray-500 hover:text-green-600 transition-all uppercase tracking-widest bg-gray-100 px-4 py-2 rounded-xl">
          GERİ DÖN
        </Link>
      </nav>

      {/* --- ANA ALAN --- */}
      <div className="flex-1 w-full max-w-[1000px] mx-auto p-6 lg:p-12">
        
        {/* PROFİL KARTI */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
          {/* Arkaplan Süsü */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          
          <img src={player.avatar} alt={player.name} className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl relative z-10" />
          
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left z-10 w-full">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter mb-2">{player.name}</h1>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
              {player.roles.map((role, idx) => (
                <span key={idx} className="bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">
                  {role}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-6 mb-8 w-full justify-center md:justify-start">
              <div className="text-center md:text-left">
                <div className="text-3xl font-black text-gray-800 tracking-tighter">{player.matchesPlayed}</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Maç</div>
              </div>
              <div className="w-px h-10 bg-gray-200"></div>
              <div className="text-center md:text-left">
                <div className="text-3xl font-black text-yellow-500 tracking-tighter flex items-center gap-1">
                  {player.rating} <span className="text-2xl mt-1">★</span>
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Yıldız Puanı</div>
              </div>
            </div>

            <button 
              onClick={openNewRatingModal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[12px] uppercase tracking-widest px-10 py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/30 w-full md:w-auto"
            >
              ⭐ OYUNCUYU DEĞERLENDİR
            </button>
          </div>
        </div>

        {/* YORUMLAR LİSTESİ */}
        <div className="mt-12 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
          <h2 className="text-sm font-black text-gray-900 tracking-[0.2em] uppercase mb-8 pb-4 border-b border-gray-100">Hakkındaki Yorumlar</h2>
          
          {player.comments.length > 0 ? (
            <div className="space-y-6">
              {player.comments.map(c => (
                <div key={c.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 relative group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm uppercase text-gray-800 tracking-tight block">{c.author}</span>
                        {c.isOwnComment && (
                          <span className="bg-blue-100 text-blue-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-md">Senin Yorumun</span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{c.date}</span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 flex items-center gap-1 mb-1">
                         <span className="text-yellow-400 font-black text-sm">★</span>
                         <span className="text-gray-800 font-black text-xs">{c.rating}</span>
                      </div>
                      {c.isOwnComment && (
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditCommentClick(c)}
                            className="text-blue-500 hover:text-blue-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Düzenle
                          </button>
                          <button 
                            onClick={() => handleDeleteCommentClick(c.id)}
                            className="text-red-500 hover:text-red-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Sil
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-600 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm font-bold text-gray-400 text-center py-8">Bu oyuncu hakkında henüz yorum yapılmamış.</p>
          )}
        </div>

      </div>

      {/* --- DEĞERLENDİRME MODALI --- */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative">
            
            <button 
              onClick={() => setIsRatingModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
            >
              ✕
            </button>

            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-2">
              {editingCommentId ? "Değerlendirmeyi Düzenle" : "Oyuncuyu Değerlendir"}
            </h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-8">{player.name} hakkında düşüncelerini paylaş.</p>

            <form onSubmit={handleRateSubmit} className="flex flex-col gap-6">
              
              {/* Yıldız Seçimi */}
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Yıldız Ver</label>
                <div className="flex gap-2 justify-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className={`text-4xl transition-transform hover:scale-110 ${newRating >= star ? "text-yellow-400" : "text-gray-300"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div className="text-center mt-2 text-xs font-black text-gray-600 uppercase">{newRating} Yıldız Cansın!</div>
              </div>

              {/* Yorum Girdisi */}
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Yorumunuz</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Kardeşim bu adama dikkat kaleye füzeler atıyor..."
                  rows="4"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none placeholder:text-gray-400 font-sans"
                  required
                ></textarea>
              </div>

              <div className="flex gap-3 mt-2">
                <button 
                  type="button"
                  onClick={() => setIsRatingModalOpen(false)}
                  className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black text-[12px] uppercase tracking-widest py-4 rounded-xl transition-all"
                >
                  VAZGEÇ
                </button>
                <button 
                  type="submit"
                  className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-black text-[12px] uppercase tracking-widest py-4 rounded-xl transition-all shadow-xl shadow-blue-600/30"
                >
                  {editingCommentId ? "GÜNCELLE" : "GÖNDER GELSİN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- YORUM SİLME ONAY MODALI --- */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Yorumu Sil</h2>
            <p className="text-sm font-bold text-gray-500 mb-6">
              Bu oyuncuya yaptığın değerlendirmeyi silmek istediğine emin misin?
            </p>
            
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setDeleteConfirmModal({ isOpen: false, commentId: null })}
                className="px-6 py-3 rounded-2xl text-[10px] font-black text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all uppercase tracking-widest w-full"
              >
                VAZGEÇ
              </button>
              <button 
                onClick={confirmDeleteComment}
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

export default PlayerProfile;