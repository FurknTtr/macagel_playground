// models/Rating.js
const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    // Yorumu YAPAN kişi
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    
    // Yorumu ALAN kişi
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    
    // Puan (YAML dosyasında min 1 max 5 demiştik)
    rating: { type: Number, required: true, min: 1, max: 5 },
    
    // Yorum metni
    comment: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('Rating', ratingSchema);