// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // --- TEMEL BİLGİLER (user tablosu) ---
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashlenmiş olarak tutulacak
    phone: { type: String },
    friendCode: { type: String, unique: true }, // Arkadaş ekleme için kod (bir kere set edilir)

    // --- DETAYLAR (userDetail tablosu) ---
    // Arkadaş listesi (Sadece diğer kullanıcıların ID'lerini referans olarak tutarız)
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    // Bekleme Halindeki Arkadaş İstekleri (kim beni eklemeye çalışıyor)
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // --- ÖNİZLEME/İSTATİSTİK (userPreview tablosu) ---
    // Her profil çekildiğinde veritabanını yormamak için bu verileri burada hesaplanmış tutarız
    stats: {
        averageRating: { type: Number, default: 0 },
        totalMatches: { type: Number, default: 0 },
        totalRatings: { type: Number, default: 0 }
    },

    // Şifre Sıfırlama için Token
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },

    // Kağıda aldığın harika not: Soft Delete mantığı!
    isActive: { type: Boolean, default: true } 
    
}, { timestamps: true }); // createdAt ve updatedAt sütunlarını otomatik ekler

module.exports = mongoose.model('User', userSchema);