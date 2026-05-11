const mongoose = require("mongoose");
const User = require("../models/User"); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mailService = require("../utils/email");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const createResponse = function (res, status, content) {
  res.status(status).json(content);
};

const registerUser = async function (req, res) {
  try {
    const { username, email, phone, password } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return createResponse(res, 400, { message: "Bu e-posta adresi zaten kullanılıyor" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique friendCode
    let friendCode;
    let isUnique = false;
    while (!isUnique) {
      friendCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingUser = await User.findOne({ friendCode });
      if (!existingUser) {
        isUnique = true;
      }
    }

    user = new User({
      username,
      email,
      phone,
      password: hashedPassword,
      friendCode
    });

    await user.save();

    // Generate basic token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    createResponse(res, 201, { message: "Kayıt başarılı", token, user: { id: user._id, username: user.username, email: user.email, phone: user.phone, friendCode: user.friendCode }});
  } catch (error) {
    createResponse(res, 400, { message: "Geçersiz istek verisi veya sunucu hatası" });
  }
};

const loginUser = async function (req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return createResponse(res, 401, { message: "Hatalı e-posta veya şifre" });
    }

    if (!user.isActive) {
      return createResponse(res, 403, { message: "Hesabınız askıya alınmış veya silinmiş." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return createResponse(res, 401, { message: "Hatalı e-posta veya şifre" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    createResponse(res, 200, { message: "Giriş başarılı", token, user: { id: user._id, username: user.username, email: user.email, phone: user.phone, friendCode: user.friendCode } });
  } catch (error) {
    createResponse(res, 500, { message: "Sunucu hatası" });
  }
};

const forgotPassword = async function (req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return createResponse(res, 404, { message: "Bu e-posta adresine kayıtlı kullanıcı bulunamadı" });
    }
    
    // Reset token oluştur (15 dakika geçerli)
    const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '15m' });
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika
    
    // User'a token'ı kaydet
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();
    
    // Email gönder (arka planda, response bekleme)
    // Mail servisi zaten kendi içinde hatayı yakalayıp logluyor
    mailService.sendForgotPasswordEmail(user.email, resetToken);

    createResponse(res, 200, { 
      message: "Şifre sıfırlama linki e-posta adresinize gönderildi"
    });
  } catch (error) {
    console.error('forgotPassword error:', error);
    createResponse(res, 500, { message: "İşlem başarısız, sunucu hatası" });
  }
};

const verifyResetToken = async function (req, res) {
  try {
    const { token } = req.params;
    
    if (!token) {
      return createResponse(res, 400, { message: "Token bulunamadı" });
    }
    
    // Token payload'ını çöz
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Kullanıcıyı bul ve token'ı kontrol et
    const user = await User.findById(decoded.userId);
    if (!user || user.resetToken !== token) {
      return createResponse(res, 401, { message: "Geçersiz token" });
    }
    
    // Token süresini kontrol et
    if (user.resetTokenExpiry < new Date()) {
      return createResponse(res, 401, { message: "Token süresi dolmuş" });
    }
    
    createResponse(res, 200, { message: "Token geçerli" });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return createResponse(res, 401, { message: "Token süresi dolmuş" });
    }
    createResponse(res, 401, { message: "Geçersiz token" });
  }
};

const resetPassword = async function (req, res) {
  try {
    const { token, password, passwordConfirm } = req.body;
    
    // Validasyon
    if (!token || !password || !passwordConfirm) {
      return createResponse(res, 400, { message: "Eksik bilgi" });
    }
    
    if (password !== passwordConfirm) {
      return createResponse(res, 400, { message: "Şifreler eşleşmiyor" });
    }
    
    if (password.length < 6) {
      return createResponse(res, 400, { message: "Şifre en az 6 karakter olmalı" });
    }
    
    // Token'ı çöz
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Kullanıcıyı bul
    const user = await User.findById(decoded.userId);
    if (!user) {
      return createResponse(res, 404, { message: "Kullanıcı bulunamadı" });
    }
    
    // Token kontrolü
    if (user.resetToken !== token) {
      return createResponse(res, 401, { message: "Geçersiz token" });
    }
    
    // Token süresini kontrol et
    if (user.resetTokenExpiry < new Date()) {
      return createResponse(res, 401, { message: "Token süresi dolmuş, lütfen yeniden deneyin" });
    }
    
    // Şifre hash'le
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Şifreyi güncelle ve token'ı temizle
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();
    
    // Onay emaili gönder (opsiyonel)
    try {
      await mailService.sendWelcomeEmail(user.email, user.username);
    } catch (emailError) {
      console.error('Onay emaili gönderme hatası:', emailError);
    }
    
    createResponse(res, 200, { message: "Şifreniz başarıyla güncellendi" });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return createResponse(res, 401, { message: "Token süresi dolmuş" });
    }
    if (error.name === 'JsonWebTokenError') {
      return createResponse(res, 401, { message: "Geçersiz token" });
    }
    createResponse(res, 500, { message: "Şifre güncellenemedi" });
  }
};

const changePassword = async function (req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!userId) {
      return createResponse(res, 401, { message: "Yetkilendirme gerekli" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return createResponse(res, 404, { message: "Kullanıcı bulunamadı" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        return createResponse(res, 400, { message: "Mevcut şifreniz yanlış" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    createResponse(res, 200, { message: "Şifreniz başarıyla değiştirildi" });
  } catch (error) {
    createResponse(res, 500, { message: "Şifre değiştirilemedi" });
  }
};

const getMyProfile = async function (req, res) {
  try {
    const userId = req.userId;

    if (!userId) {
      return createResponse(res, 401, { message: "Yetkilendirme gerekli" });
    }

    const user = await User.findById(userId).select("username email phone friendCode _id");
    
    if (!user) {
      return createResponse(res, 404, { message: "Kullanıcı bulunamadı" });
    }

    createResponse(res, 200, {
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone || "",
      friendCode: user.friendCode || ""
    });
  } catch (error) {
    createResponse(res, 400, { message: "Profil getirilemedi" });
  }
};

const updateProfile = async function (req, res) {
  try {
    const { username, email, phone } = req.body;
    const userId = req.userId; 
    const user = await User.findByIdAndUpdate(userId, { username, email, phone }, { new: true }).select("-password");
    createResponse(res, 200, { message: "Profil güncellendi", user });
  } catch (error) {
    createResponse(res, 400, { message: "Profil güncellenemedi" });
  }
};

const deleteAccount = async function (req, res) {
  try {
    const userId = req.userId;
    
    const Match = require('../models/Match');
    
    // 1. İleri tarihli katıldığı maçları kontrol et
    const upcomingMatches = await Match.find({
      isActive: true,
      date: { $gte: new Date() },
      'players.user': userId
    });
    
    if (upcomingMatches.length > 0) {
      return createResponse(res, 400, { 
        message: "Hesabını silmeden önce katıldığın bütün maçlardan çıkmalısın!" 
      });
    }
    
    // 2. Sahip olduğu (owner) maçları kontrol et
    const ownedMatches = await Match.find({
      isActive: true,
      date: { $gte: new Date() },
      owner: userId
    });
    
    if (ownedMatches.length > 0) {
      return createResponse(res, 400, { 
        message: "Hesabını silmeden önce oluşturduğun tüm maçları iptal etmelisin!" 
      });
    }
    
    // Maç yoksa, hesabı pasife al
    await User.findByIdAndUpdate(userId, { isActive: false });
    createResponse(res, 200, { message: "Hesabın silindi" });
  } catch (error) {
    createResponse(res, 400, { message: "Hesap silinemedi" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  changePassword,
  getMyProfile,
  updateProfile,
  deleteAccount
};