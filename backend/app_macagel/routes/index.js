const express = require('express');
const router = express.Router();

// 1. Controller dosyalarımızı içeri aktarıyoruz (Dosya yollarını projene göre ayarlarsın)
const accountController = require('../controllers/accountController');
const matchController = require('../controllers/matchController');
const matchActionController = require('../controllers/matchActionController');
const reviewController = require('../controllers/reviewController');
const friendController = require('../controllers/friendController');

// ==========================================
// HESABIM (ACCOUNT) ROTALARI
// ==========================================
router.post('/register', accountController.registerUser);
router.post('/login', accountController.loginUser);
router.post('/isForgotPassword', accountController.forgotPassword);
router.put('/passwordChange', accountController.changePassword);
router.get('/users/me', accountController.getMyProfile);
router.put('/updateProfile', accountController.updateProfile);
router.delete('/deleteAccount', accountController.deleteAccount);

// ==========================================
// MAÇ YÖNETİMİ (MATCH MANAGEMENT) ROTALARI
// ==========================================
router.get('/getMatches', matchController.getMatches);
router.get('/searchMatch', matchController.searchMatch);
router.put('/inviteCode', matchController.joinMatchWithCode);
router.post('/createMatch', matchController.createMatch);
router.put('/updateMatch', matchController.updateMatch);
router.delete('/deleteMatch', matchController.deleteMatch);

// DİKKAT: YAML'daki süslü parantezli {matchId} path parametresi, Express'te iki nokta (:) ile yazılır!
router.get('/getMatchPlayers/:matchId', matchController.getMatchPlayers); 
router.get('/upcomingMatch/:userId', matchController.getUpcomingMatches);
router.get('/matchHistory/:userId', matchController.getMatchHistory);

// ==========================================
// MAÇ AKSİYONLARI (MATCH ACTIONS) ROTALARI
// ==========================================
router.delete('/leave/:userId', matchActionController.leaveOrKickPlayer);
router.post('/joinPosition', matchActionController.joinPosition);

// ==========================================
// ÖNİZLEME VE DEĞERLENDİRME (REVIEW) ROTALARI
// ==========================================
router.post('/rating/:userId', reviewController.addRating);
router.put('/rating/:rateId', reviewController.updateRating);
router.delete('/rating/:rateId', reviewController.deleteRating);
router.get('/playerPreview/:userId', reviewController.getPlayerPreview);

// ==========================================
// ARKADAŞLAR (FRIENDS) ROTALARI
// ==========================================
router.post('/addFriend', friendController.addFriend);
router.get('/myFriends', friendController.getMyFriends);
router.delete('/myFriends', friendController.removeFriend);

// Son olarak bu haritayı dışa aktarıyoruz
module.exports = router;