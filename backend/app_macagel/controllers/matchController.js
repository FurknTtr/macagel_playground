const mongoose = require("mongoose");
const Match = require("../models/Match"); 

const createResponse = function (res, status, content) {
  res.status(status).json(content);
};

// ========================================
// MAÇLARI GETIRME VE ARAMA
// ========================================

const getAllMatches = async function (req, res) {
  try {
    // Pagination parametreleri al (query string'den)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sadece gelecek maçları getir (marketplace/keşfet için)
    // Tarihi geçmiş maçlar Menu.jsx'de matchHistory endpoint'i ile görülür
    const matches = await Match.find({ 
      isActive: true,
      date: { $gte: new Date() }  // Şu anki tarihten itibaren olan maçlar
    })
      .populate('owner', 'username email _id')
      .populate('players.user', 'username email _id stats')
      .skip(skip)
      .limit(limit)
      .sort('date');  // Tarihe göre artan sırada sırala
    
    // Toplam maç sayısını al (pagination için)
    const totalMatches = await Match.countDocuments({ isActive: true });
    const totalPages = Math.ceil(totalMatches / limit);

    createResponse(res, 200, {
      matches,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalMatches,
        totalPages
      }
    });
  } catch (error) {
    createResponse(res, 400, { message: "Tüm maçlar getirilemedi" });
  }
};

// Maç Arama (isim/lokasyona göre) - Pagination + Şehir + Kapasite + Tarih Filter destekli
const searchMatch = async function (req, res) {
  try {
    const { q, city, capacity, matchDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Eğer tüm filtreler boşsa hata döndür
    if ((!q || q.trim() === "") && (!city || city === "Tüm Şehirler") && !capacity && !matchDate) {
      return createResponse(res, 400, { message: "En az bir filtre gerekli" });
    }

    // Filtre koşulları
    let filterConditions = {
      isActive: true
    };

    // Arama terimi
    if (q && q.trim() !== "") {
      filterConditions.name = { $regex: q, $options: 'i' };
    }

    // Şehir filtrelemesi
    if (city && city !== "Tüm Şehirler") {
      filterConditions.location = { $regex: city, $options: 'i' };
    }

    // Kapasite filtrelemesi (6, 7 veya 8)
    if (capacity) {
      filterConditions.capacity = parseInt(capacity);
    }

    // Tarih filtrelemesi (belirli bir gün içinde veya en az bugünden itibaren)
    let dateCondition = { $gte: new Date() }; // Default: bugünden itibaren
    
    if (matchDate) {
      const selectedDate = new Date(matchDate);
      selectedDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Eğer seçilen tarih bugün veya gelecekse, o günü göster
      if (selectedDate >= today) {
        const endOfDay = new Date(matchDate);
        endOfDay.setHours(23, 59, 59, 999);
        dateCondition = { $gte: selectedDate, $lte: endOfDay };
      }
      // Seçilen tarih geçmiş ise, default (bugünden itibaren) kalır
    }
    
    filterConditions.date = dateCondition;

    // Toplam maç sayısını al
    const totalMatches = await Match.countDocuments(filterConditions);

    // Maçları getir
    const matches = await Match.find(filterConditions)
      .populate('owner', 'username email _id')
      .populate('players.user', 'username email _id stats')
      .skip(skip)
      .limit(limit)
      .sort('date');

    const totalPages = Math.ceil(totalMatches / limit);

    createResponse(res, 200, {
      matches,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalMatches,
        totalPages,
        filtersApplied: {
          searchTerm: q || "",
          cityFilter: city || "Tüm Şehirler",
          capacity: capacity || null,
          matchDate: matchDate || null
        }
      }
    });
  } catch (error) {
    console.error("Arama hatası:", error);
    createResponse(res, 400, { message: "Arama başarısız" });
  }
};

// Şehre göre filtrele (sadece location'a göre)
const filterMatchesByCity = async function (req, res) {
  try {
    const { city } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Şehir parametresi gerekli
    if (!city || city === "Tüm Şehirler") {
      return createResponse(res, 400, { message: "Geçerli bir şehir seçiniz" });
    }

    // Filtre koşulları
    const filterConditions = {
      isActive: true,
      location: { $regex: city, $options: 'i' }
    };

    // Toplam maç sayısını al
    const totalMatches = await Match.countDocuments(filterConditions);

    // Maçları getir
    const matches = await Match.find(filterConditions)
      .populate('owner', 'username email _id')
      .populate('players.user', 'username email _id stats')
      .skip(skip)
      .limit(limit)
      .sort('date');

    const totalPages = Math.ceil(totalMatches / limit);

    createResponse(res, 200, {
      matches,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalMatches,
        totalPages,
        searchTerm: "",
        cityFilter: city
      }
    });
  } catch (error) {
    createResponse(res, 400, { message: "Şehir filtrelemesi başarısız" });
  }
};

// ========================================
// MAÇA KATILMA
// ========================================

// Kod ile Maça Katılma (inviteCode veya code ile) - SADECE DOĞRULAMA, KATILIM YOK
const joinMatchWithCode = async function (req, res) {
  try {
    const { code, userId } = req.body;
    const match = await Match.findOne({ 
      $or: [
        { inviteCode: code },
        { code: code }
      ], 
      isActive: true 
    });
    
    if (!match) return createResponse(res, 404, { message: "Kod bulunamadı veya geçersiz" });
    if (match.players.length >= match.capacity) return createResponse(res, 400, { message: "Maç kapasitesi dolu" });
    
    const isAlreadyIn = match.players.some(p => p.user.toString() === userId);
    if (isAlreadyIn) return createResponse(res, 400, { message: "Zaten bu maçtasınız" });

    // Kod doğruysa sadece Match bilgisini döndür
    // Oyuncu pozisyona eklenecek değil, sadece Match page'ine yönlendirilecek
    createResponse(res, 200, { 
      message: "Kod geçerli, maç sayfasına yönlendiriliyorsunuz",
      match: { _id: match._id }
    });
  } catch (error) {
    createResponse(res, 500, { message: "Sunucu hatası" });
  }
};

// ========================================
// MAÇ YÖNETIMI (CRUD)
// ========================================

// Yeni Maç Oluştur
const createMatch = async function (req, res) {
  try {
    const { name, location, date, capacity, owner, inviteCode } = req.body;
    
    // inviteCode ve code field'larını generat et
    const generatedCode = inviteCode || Math.random().toString(36).substring(2, 8).toUpperCase();
    const generatedInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newMatch = new Match({
      name,
      location,
      date,
      capacity,
      owner,
      inviteCode: generatedInviteCode,
      code: generatedCode
    });
    
    // Kurucu otomatik olarak maça eklenir (positionId: 1 ile)
    newMatch.players.push({ 
      user: owner, 
      positionId: 1,
      position: 'Kurucu' 
    });
    await newMatch.save();

    createResponse(res, 201, { message: "Maç başarıyla oluşturuldu", match: newMatch });
  } catch (error) {
    createResponse(res, 400, { message: "Maç oluşturulamadı", error });
  }
};

// Maç Bilgilerini Güncelle (ad, lokasyon, tarih, kapasite)
const updateMatch = async function (req, res) {
  try {
    const { matchId, userId } = req.body; // Body'den al matchId ve userId
    
    if (!matchId) {
      return createResponse(res, 400, { message: "Maç ID gerekli" });
    }
    
    // Maçı bul ve sahibi kontrol et
    const match = await Match.findById(matchId);
    if (!match) {
      return createResponse(res, 404, { message: "Maç bulunamadı" });
    }
    
    // Sadece maç sahibi güncelleyebilir
    if (match.owner.toString() !== userId) {
      return createResponse(res, 403, { message: "Sadece maç yöneticisi güncelleyebilir" });
    }
    
    // Güncellenecek fieldler (matchId ve userId hariç)
    const { matchId: _, userId: __, ...updateData } = req.body;
    const updatedMatch = await Match.findByIdAndUpdate(matchId, updateData, { new: true });
    createResponse(res, 200, updatedMatch);
  } catch (error) {
    createResponse(res, 400, { message: "Maç güncellenemedi" });
  }
};

// Maç İptal Et (Soft-Delete: isActive = false)
const deleteMatch = async function (req, res) {
  try {
    const { matchId, userId } = req.body; // Body'den al
    
    if (!matchId) {
      return createResponse(res, 400, { message: "Maç ID gerekli" });
    }
    
    // Maçı bul ve sahibi kontrol et
    const match = await Match.findById(matchId);
    if (!match) {
      return createResponse(res, 404, { message: "Maç bulunamadı" });
    }
    
    // Sadece maç sahibi silebilir
    if (match.owner.toString() !== userId) {
      return createResponse(res, 403, { message: "Sadece maç yöneticisi maçı iptal edebilir" });
    }
    
    await Match.findByIdAndUpdate(matchId, { isActive: false });
    createResponse(res, 200, { message: "Maç iptal edildi" });
  } catch (error) {
    createResponse(res, 400, { message: "Maç silinemedi" });
  }
};

// ========================================
// MAÇ DETAYLARI
// ========================================

// Maç Detayları Al (tüm oyuncuları positionId ile)
const getMatch = async function (req, res) {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId)
      .populate('owner', 'username email _id')
      .populate('players.user', 'username email _id stats');

    if (!match) return createResponse(res, 404, { message: "Maç bulunamadı" });

    // Match'ı return et, players içindeki positionId, position, user info dahil
    createResponse(res, 200, {
      _id: match._id,
      name: match.name,
      location: match.location,
      date: match.date,
      capacity: match.capacity,
      inviteCode: match.inviteCode,
      code: match.code,
      owner: match.owner,
      players: match.players.map(p => ({
        _id: p._id,
        user: p.user,
        positionId: p.positionId,
        position: p.position
      })),
      isActive: match.isActive,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt
    });
  } catch (error) {
    createResponse(res, 400, { message: "Maç detayları getirilemedi" });
  }
};

// Yaklaşan Maçlar (kullanıcının, bugün ve sonrası)
const getUpcomingMatches = async function (req, res) {
  try {
    const { userId } = req.params;
    
    // Saat farklarından (TZ) dolayı bugünün maçları kaybolmasın diye gece yarısını baz alalım
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    const matches = await Match.find({ 
      'players.user': userId,
      date: { $gte: today },
      isActive: true 
    }).sort('date');
    
    createResponse(res, 200, matches);
  } catch (error) {
    createResponse(res, 400, { message: "Yaklaşan maçlar getirilemedi" });
  }
};

// Maç Geçmişi (kullanıcının, bitmiş maçlar)
const getMatchHistory = async function (req, res) {
  try {
    const { userId } = req.params;
    const matches = await Match.find({ 
      'players.user': userId,
      date: { $lt: new Date() }
    }).sort('-date');
    createResponse(res, 200, matches);
  } catch (error) {
    createResponse(res, 400, { message: "Maç geçmişi getirilemedi" });
  }
};

module.exports = {
  // Maç Listeleme
  getAllMatches,
  searchMatch,
  filterMatchesByCity,
  
  // Maç Detayları
  getMatch,
  getUpcomingMatches,
  getMatchHistory,
  
  // Maç Yönetimi
  createMatch,
  joinMatchWithCode,
  updateMatch,
  deleteMatch
};