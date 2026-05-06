const express = require('express');
const router = express.Router();

// 1. Controller dosyalarımızı içeri aktarıyoruz (Dosya yollarını projene göre ayarlarsın)
const accountController = require('../controllers/accountController');
const matchController = require('../controllers/matchController');
const matchActionController = require('../controllers/matchActionController');
const reviewController = require('../controllers/reviewController');
const friendController = require('../controllers/friendController');
const authMiddleware = require('../middleware/authMiddleware');

// ==========================================
// HESABIM (ACCOUNT) ROTALARI
// ==========================================
router.post('/register', accountController.registerUser);
router.post('/login', accountController.loginUser);
router.post('/forgot-password', accountController.forgotPassword);
router.get('/verify-reset-token/:token', accountController.verifyResetToken);
router.post('/reset-password', accountController.resetPassword);
router.put('/passwordChange', authMiddleware, accountController.changePassword);
router.get('/users/me', authMiddleware, accountController.getMyProfile);
router.put('/updateProfile', accountController.updateProfile);
router.delete('/deleteAccount', accountController.deleteAccount);

// ==========================================
// MAÇ YÖNETİMİ (MATCH MANAGEMENT) ROTALARI
// ==========================================

// Maç Listeleme ve Arama
router.get('/getAllMatches', matchController.getAllMatches);      // Tüm maçları sayfalı getir
router.get('/searchMatch', matchController.searchMatch);          // Maçları isim/lokasyona göre ara
router.get('/filterMatchesByCity', matchController.filterMatchesByCity);  // Maçları sadece şehre göre filtrele

// Maç Detayları
router.get('/getMatch/:matchId', matchController.getMatch);       // Maç detayları + oyuncuları (positionId ile)
router.get('/upcomingMatch/:userId', matchController.getUpcomingMatches);  // Kullanıcının yaklaşan maçları
router.get('/matchHistory/:userId', matchController.getMatchHistory);      // Kullanıcının geçmiş maçları

// Maç Yönetimi (Oluştur, Güncelle, Sil)
router.post('/createMatch', matchController.createMatch);         // Yeni maç oluştur
router.put('/updateMatch', matchController.updateMatch);          // Maç bilgilerini güncelle
router.delete('/deleteMatch', matchController.deleteMatch);       // Maç iptal et (soft-delete)

// Maça Katılma
router.put('/inviteCode', matchController.joinMatchWithCode);     // Kod ile maça katıl

// ==========================================
// MAÇ AKSİYONLARI (MATCH ACTIONS) ROTALARI
// ==========================================
router.delete('/leave/:userId', matchActionController.leaveOrKickPlayer);
router.post('/joinPosition', matchActionController.joinPosition);

// ==========================================
// ÖNİZLEME VE DEĞERLENDİRME (REVIEW) ROTALARI
// ==========================================
router.get('/pendingReviews/:userId', reviewController.getPendingReviews);
router.post('/rating/:userId', authMiddleware, reviewController.addRating);
router.put('/rating/:rateId', authMiddleware, reviewController.updateRating);
router.delete('/rating/:rateId', authMiddleware, reviewController.deleteRating);
router.get('/playerPreview/:userId', reviewController.getPlayerPreview);

// ==========================================
// ARKADAŞLAR (FRIENDS) ROTALARI
// ==========================================
router.post('/addFriend', authMiddleware, friendController.addFriend);
router.get('/myFriends', friendController.getMyFriends);
router.delete('/myFriends', friendController.removeFriend);
router.get('/getPendingRequests', friendController.getPendingRequests);
router.put('/acceptFriendRequest', friendController.acceptFriendRequest);
router.put('/rejectFriendRequest', friendController.rejectFriendRequest);

// Son olarak bu haritayı dışa aktarıyoruz
module.exports = router;