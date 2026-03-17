// models/Match.js
const mongoose = require('mongoose');

// Alt Şema: Sadece maçın içindeki oyuncu dizisinde kullanılacak yapı (MatchPlayersPosition)
const playerPositionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    position: { type: String, required: true } // Örn: 'Forvet', 'Defans', 'Kale' vb.
}, { _id: false }); // Alt şemanın kendi _id'si olmasına gerek yok, kalabalık yapmasın

const matchSchema = new mongoose.Schema({
    // --- TEMEL MAÇ KARTI BİLGİLERİ ---
    name: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    capacity: { type: Number, required: true },
    inviteCode: { type: String, unique: true, sparse: true }, // YAML'daki davet kodu için
    
    // Kağıttaki "Maçtan At" senaryosu için maçın sahibini bilmemiz lazım!
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // --- POZİSYONLAR VE OYUNCULAR ---
    // Kimin hangi pozisyonda olduğu direkt maç belgesinin içinde durur
    players: [playerPositionSchema],

    // Maç iptal edilirse veya silinirse diye soft delete
    isActive: { type: Boolean, default: true }

}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);