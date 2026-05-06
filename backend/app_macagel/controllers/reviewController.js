const mongoose = require("mongoose");
const Rating = require("../models/Rating"); 
const User = require("../models/User");

const createResponse = function (res, status, content) {
  res.status(status).json(content);
};

const addRating = async function (req, res) {
  try {
    const { userId } = req.params;
    const { rating, comment } = req.body;
    const reviewerId = req.userId;

    if (!userId || !reviewerId || !rating || !comment) {
      return createResponse(res, 400, { message: "Değerlendirme başarısız oldu" });
    }

    if (rating < 1 || rating > 5) {
      return createResponse(res, 400, { message: "Değerlendirme başarısız oldu" });
    }

    // Username ÖNCE, sonra ID ile user bul
    let user = await User.findOne({ username: userId });
    if (!user) {
      user = await User.findById(userId);
    }

    if (!user) {
      return createResponse(res, 400, { message: "Değerlendirme başarısız oldu" });
    }

    // Kendini değerlendiremezsin kontrolü
    if (user._id.toString() === reviewerId.toString()) {
      return createResponse(res, 400, { message: "Kendini değerlendiremezsin" });
    }

    const newRating = new Rating({
        targetUser: user._id,
        reviewer: reviewerId,
        rating,
        comment
    });

    await newRating.save();

    createResponse(res, 201, { message: "Değerlendirme başarıyla eklendi", rating: newRating });
  } catch (error) {
    console.error("Rating Error:", error.message);
    createResponse(res, 400, { message: "Değerlendirme başarısız oldu" });
  }
};


const getPendingReviews = async function (req, res) {
  try {
    const userId = req.params.userId;
    const Match = require("../models/Match"); 

    // Oynanmış maçları (tarihi geçmiş olanları) bul ve kullanıcının içinde olduğu maçlar
    const pastMatches = await Match.find({ 
      'players.user': userId,
      date: { $lt: new Date() },
      isActive: true 
    }).populate('players.user', 'username');

    // Burada normalde kullanıcının o maçtaki diğer kişileri daha önceden değerlendirip değerlendirmediğine bakılır (Rating modelinden)
    // Şimdilik sadece geçmiş maçları listeliyoruz. Bunu front-end de bir modal veya liste şeklinde gösterebiliriz.
    
    // Aynı takım arkadaşlarından sadece değerlendirilmemişleri dönmek mantıklı ama demo amaçlı
    // sadece pending durumundaki maçlarını/kişilerini döndürüyoruz farz edelim.
    createResponse(res, 200, pastMatches);
  } catch (error) {
    createResponse(res, 400, { message: "Değerlendirilecek maçlar getirilemedi" });
  }
};

const updateRating = async function (req, res) {
  try {
    const { rateId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.userId;

    if (!userId) {
      return createResponse(res, 401, { message: "Yetkilendirme gerekli" });
    }

    const existingRating = await Rating.findById(rateId);
    if (!existingRating) {
      return createResponse(res, 404, { message: "Değerlendirme bulunamadı" });
    }

    if (existingRating.reviewer.toString() !== userId.toString()) {
      return createResponse(res, 403, { message: "Sadece kendi yorumunu güncelleyebilirsin" });
    }

    const updated = await Rating.findByIdAndUpdate(rateId, { rating, comment }, { new: true });
    createResponse(res, 200, { message: "Değerlendirme güncellendi", rating: updated });
  } catch (error) {
    createResponse(res, 400, { message: "Değerlendirme güncellenemedi" });
  }
};

const deleteRating = async function (req, res) {
  try {
    const { rateId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return createResponse(res, 401, { message: "Yetkilendirme gerekli" });
    }

    const existingRating = await Rating.findById(rateId);
    if (!existingRating) {
      return createResponse(res, 404, { message: "Değerlendirme bulunamadı" });
    }

    if (existingRating.reviewer.toString() !== userId.toString()) {
      return createResponse(res, 403, { message: "Sadece kendi yorumunu silebilirsin" });
    }

    await Rating.findByIdAndDelete(rateId);
    createResponse(res, 200, { message: "Değerlendirme silindi" });
  } catch (error) {
    createResponse(res, 400, { message: "Değerlendirme silinemedi" });
  }
};

const getPlayerPreview = async function (req, res) {
  try {
    const { userId } = req.params;
    console.log("🔍 getPlayerPreview - userId param:", userId);
    
    // Username ÖNCE, sonra ID ile user bul
    let user = await User.findOne({ username: userId }).select("username stats");
    if (!user) {
      console.log("🔍 Username ile bulunamadı, ID ile aranıyor...");
      user = await User.findById(userId).select("username stats");
    }
    
    if (!user) {
      console.log("❌ User bulunamadı!");
      return createResponse(res, 404, { message: "Oyuncu bulunamadı" });
    }
    
    console.log("✅ User bulundu:", { _id: user._id.toString(), username: user.username });
    
    const reviews = await Rating.find({ targetUser: user._id }).populate("reviewer", "username");
    
    const response = {
      player: {
        _id: user._id.toString(),
        username: user.username,
        stats: user.stats
      },
      reviews
    };
    
    console.log("📤 Response gönderiliyor:", JSON.stringify(response.player));
    
    createResponse(res, 200, response);
  } catch (error) {
    console.error("❌ getPlayerPreview error:", error);
    createResponse(res, 400, { message: "Oyuncu önizlemesi getirilemedi" });
  }
};

module.exports = {
  addRating,
  updateRating,
  deleteRating,
  getPlayerPreview,
  getPendingReviews
};