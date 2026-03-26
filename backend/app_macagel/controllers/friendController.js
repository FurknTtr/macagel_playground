const mongoose = require("mongoose");
const User = require("../models/User"); 

const createResponse = function (res, status, content) {
  res.status(status).json(content);
};

const addFriend = async function (req, res) {
  try {
    const { userId, friendCode, friendId } = req.body;
    
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
    
    // Zaten arkadaş mı kontrol et
    if (user.friends.includes(actualFriendId)) {
      return createResponse(res, 400, { message: "Bu kişi zaten arkadaşın" });
    }

    user.friends.push(actualFriendId);
    await user.save();

    createResponse(res, 200, { message: "Arkadaş eklendi", friends: user.friends });
  } catch (error) {
    createResponse(res, 400, { message: "Arkadaş eklenemedi" });
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
    user.friends = user.friends.filter(f => f.toString() !== friendId);
    await user.save();

    createResponse(res, 200, { message: "Arkadaş silindi" });
  } catch (error) {
    createResponse(res, 400, { message: "Arkadaş silinemedi" });
  }
};

module.exports = {
  addFriend,
  getMyFriends,
  removeFriend
};