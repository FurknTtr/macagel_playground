const mongoose = require("mongoose");
const Match = require("../models/Match"); 

const createResponse = function (res, status, content) {
  res.status(status).json(content);
};

// ========================================
// MAÇ AKSİYONLARI
// ========================================

// Oyuncu Atma / Maçtan Ayrılma
// Yönetici OR kendisi = oyuncu çıkarılır
const leaveOrKickPlayer = async function (req, res) {
  try {
    const { userId } = req.params;
    const { matchId, operationType, requesterId } = req.body;

    const match = await Match.findById(matchId);
    if (!match) return createResponse(res, 404, { message: "Maç bulunamadı" });

    // Eğer kick işlemiyse, requester'ın match owner olması gerekir
    if (operationType === "kick") {
      const ownerId = typeof match.owner === 'object' ? match.owner._id : match.owner;
      if (requesterId.toString() !== ownerId.toString()) {
        return createResponse(res, 403, { message: "Sadece maç yöneticisi oyuncu atabilir" });
      }
    }

    match.players = match.players.filter(p => p.user.toString() !== userId);
    await match.save();

    createResponse(res, 200, { message: "Kullanıcı maçtan ayrıldı/atıldı", match });
  } catch (error) {
    createResponse(res, 400, { message: "İşlem başarısız" });
  }
};

// Pozisyona Katılma / Pozisyon Değiştirme
// Body: { matchId, userId, positionId, position }
// Yeni oyuncu eklenir veya mevcut oyuncunun pozisyonu güncellenir
const joinPosition = async function (req, res) {
  try {
    const { matchId, userId, positionId, position } = req.body;
    
    const match = await Match.findById(matchId);
    if (!match) return createResponse(res, 404, { message: "Maç bulunamadı" });

    if (match.players.length >= match.capacity) {
        return createResponse(res, 400, { message: "Maç kapasitesi dolu" });
    }

    const existingUser = match.players.find(p => p.user.toString() === userId);
    if (existingUser) {
        // Pozisyon ve positionId güncelle
        existingUser.position = position || existingUser.position;
        existingUser.positionId = positionId || existingUser.positionId;
    } else {
        // Yeni oyuncu ekle
        const nextPositionId = positionId || (match.players.length + 1);
        match.players.push({ 
          user: userId, 
          positionId: nextPositionId,
          position: position || 'Oyuncu'
        });
    }

    await match.save();

    createResponse(res, 200, { message: "Pozisyona başarıyla geçildi", match });
  } catch (error) {
    createResponse(res, 400, { message: "Pozisyona katılma başarısız" });
  }
};

module.exports = {
  leaveOrKickPlayer,
  joinPosition
};