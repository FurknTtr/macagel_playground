const mongoose = require("mongoose");
const User = require("../models/User"); 

const createResponse = function (res, status, content) {
  res.status(status).json(content);
};

const addFriend = async function (req, res) {
  try {
    const userId = req.userId;
    const { friendCode, friendId } = req.body;

    if (!userId) {
      return createResponse(res, 401, { message: "Yetkilendirme gerekli" });
    }
    
    if (!friendCode && !friendId) {
      return createResponse(res, 400, { message: "Arkadaş kodu veya ID gerekli" });
    }

    let actualFriendId = friendId;

    // Eğer friendCode gelirse, onu userId'sine çevir
    if (friendCode && !friendId) {
      const friendUser = await User.findOne({ friendCode: friendCode.toUpperCase() });
      if (!friendUser) {
        return createResponse(res, 404, { message: "Bu kodu kullanan kullanıcı bulunamadı" });
      }
      actualFriendId = friendUser._id.toString();
    }
    
    if (userId === actualFriendId) {
      return createResponse(res, 400, { message: "Kendini ekleyemezsin" });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(actualFriendId);

    if (!targetUser) {
      return createResponse(res, 404, { message: "Hedef kullanıcı bulunamadı" });
    }
    
    // Zaten arkadaş mı kontrol et
    if (user.friends.includes(actualFriendId)) {
      return createResponse(res, 400, { message: "Bu kişi zaten arkadaşın" });
    }

    // Zaten istek göndermiş mi?
    if (targetUser.friendRequests.includes(userId)) {
      return createResponse(res, 400, { message: "Bu kişiye zaten istek gönderdin" });
    }

    // Karşılıklı istek mi? (hedef user zaten bana istek atmış mı?)
    if (user.friendRequests.includes(actualFriendId)) {
      // Otomatik kabul et - her iki tarafta da arkadaş yap
      user.friends.push(actualFriendId);
      targetUser.friends.push(userId);
      
      // İsteği sil
      user.friendRequests = user.friendRequests.filter(f => f.toString() !== actualFriendId);
      
      await user.save();
      await targetUser.save();

      return createResponse(res, 200, { 
        message: "Karşılıklı istek otomatik kabul edildi, arkadaş oldunuz!",
        friends: user.friends
      });
    }

    // Normal istek gönder (hedef user'ın friendRequests'ine ekle)
    targetUser.friendRequests.push(userId);
    await targetUser.save();

    createResponse(res, 200, { 
      message: "Arkadaş isteği gönderildi",
      friendRequests: targetUser.friendRequests
    });
  } catch (error) {
    createResponse(res, 400, { message: "Arkadaş isteği gönderilemedi" });
  }
};


const getMyFriends = async function (req, res) {
  try {
    const { userId } = req.query;
    
    // Validasyon
    if (!userId) {
      return createResponse(res, 400, { message: "userId parametresi gerekli" });
    }

    // İstek atan kişinin (userId) arkadaşlarını getir
    const user = await User.findById(userId).populate("friends", "username _id isActive");
    
    if (!user) {
      return createResponse(res, 404, { message: "Kullanıcı bulunamadı" });
    }

    // Sadece aktif arkadaşları filtrele
    const activeFriends = user.friends.filter(friend => friend.isActive !== false);
    
    // Arkadaş listesini listele
    createResponse(res, 200, activeFriends);
  } catch (error) {
    createResponse(res, 400, { message: "Arkadaşlar listelenemedi" });
  }
};

const removeFriend = async function (req, res) {
  try {
    const { userId, friendId } = req.query;
    
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return createResponse(res, 404, { message: "Kullanıcı bulunamadı" });
    }

    // Her iki tarafta da arkadaş listesinden sil
    user.friends = user.friends.filter(f => f.toString() !== friendId);
    friend.friends = friend.friends.filter(f => f.toString() !== userId);
    
    await user.save();
    await friend.save();

    createResponse(res, 200, { message: "Arkadaş silindi" });
  } catch (error) {
    createResponse(res, 400, { message: "Arkadaş silinemedi" });
  }
};


// Beklemede olan arkadaş istekleri
const getPendingRequests = async function (req, res) {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return createResponse(res, 400, { message: "userId parametresi gerekli" });
    }

    const user = await User.findById(userId).populate("friendRequests", "username _id email");
    
    if (!user) {
      return createResponse(res, 404, { message: "Kullanıcı bulunamadı" });
    }

    createResponse(res, 200, user.friendRequests);
  } catch (error) {
    createResponse(res, 400, { message: "İstekler getirilemedi" });
  }
};

// Arkadaş isteğini kabul et
const acceptFriendRequest = async function (req, res) {
  try {
    const { userId, friendId } = req.body;
    
    if (!userId || !friendId) {
      return createResponse(res, 400, { message: "userId ve friendId gerekli" });
    }

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return createResponse(res, 404, { message: "Kullanıcı bulunamadı" });
    }

    // İstek var mı kontrol et
    if (!user.friendRequests.includes(friendId)) {
      return createResponse(res, 400, { message: "Bu kişiden istek yok" });
    }

    // Her iki tarafta da arkadaş olarak ekle
    user.friends.push(friendId);
    friend.friends.push(userId);
    
    // İsteği sil
    user.friendRequests = user.friendRequests.filter(f => f.toString() !== friendId);
    
    await user.save();
    await friend.save();

    createResponse(res, 200, { 
      message: "Arkadaş isteği kabul edildi",
      friends: user.friends
    });
  } catch (error) {
    createResponse(res, 400, { message: "İstek kabul edilemedi" });
  }
};

// Arkadaş isteğini reddet
const rejectFriendRequest = async function (req, res) {
  try {
    const { userId, friendId } = req.body;
    
    if (!userId || !friendId) {
      return createResponse(res, 400, { message: "userId ve friendId gerekli" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return createResponse(res, 404, { message: "Kullanıcı bulunamadı" });
    }

    // İsteği sil
    user.friendRequests = user.friendRequests.filter(f => f.toString() !== friendId);
    await user.save();

    createResponse(res, 200, { 
      message: "Arkadaş isteği reddedildi",
      friendRequests: user.friendRequests
    });
  } catch (error) {
    createResponse(res, 400, { message: "İstek reddedilemedi" });
  }
};

module.exports = {
  addFriend,
  getMyFriends,
  removeFriend,
  getPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest
};