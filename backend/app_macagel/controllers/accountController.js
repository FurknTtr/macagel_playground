const mongoose = require("mongoose");
const User = require("../models/User"); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
    
    // Gerçek bir sistemde Nodemailer vb. ile e-posta gönderilir.
    // Şimdilik demo amaçlı bir token dönüyoruz.
    const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '15m' });

    createResponse(res, 200, { 
      message: "Şifre sıfırlama talimatları e-posta adresinize gönderildi (Simülasyon)",
      resetToken 
    });
  } catch (error) {
    createResponse(res, 500, { message: "İşlem başarısız, sunucu hatası" });
  }
};

const changePassword = async function (req, res) {
  try {
    const { userId, currentPassword, newPassword } = req.body;

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
    const { userId } = req.query; // frontend'den gelen userId
    
    if (!userId) {
      return createResponse(res, 400, { message: "userId parametresi gerekli" });
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
    const { userId, username, email, phone } = req.body;
    const user = await User.findByIdAndUpdate(userId, { username, email, phone }, { new: true }).select("-password");
    createResponse(res, 200, { message: "Profil güncellendi", user });
  } catch (error) {
    createResponse(res, 400, { message: "Profil güncellenemedi" });
  }
};

const deleteAccount = async function (req, res) {
  try {
    const { userId } = req.body;
    
    // İleri tarihli katıldığı maçları kontrol et
    const Match = require('../models/Match');
    const upcomingMatches = await Match.find({
      isActive: true,
      date: { $gte: new Date() },
      'players.user': userId
    });
    
    // Eğer ileri tarihli maç varsa, silinemesin
    if (upcomingMatches.length > 0) {
      return createResponse(res, 400, { 
        message: "Hesabını silmeden önce katıldığın bütün maçlardan çıkmalısın!" 
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
  changePassword,
  getMyProfile,
  updateProfile,
  deleteAccount
};