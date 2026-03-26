const mongoose = require("mongoose");
const User = require("../models/User"); 

const createResponse = function (res, status, content) {
  res.status(status).json(content);
};

const addFriend = async function (req, res) {
  try {
    // Arkadaş ekleme işlemleri (req.body.userId, req.body.friendId)
  } catch (error) {
    createResponse(res, 400, { message: "Arkadaş eklenemedi" });
  }
};

const getMyFriends = async function (req, res) {
  try {
    // Arkadaşları listeleme işlemleri
  } catch (error) {
    createResponse(res, 400, { message: "Arkadaşlar listelenemedi" });
  }
};

const removeFriend = async function (req, res) {
  try {
    // Arkadaş silme işlemleri (req.query.userId, req.query.friendId)
  } catch (error) {
    createResponse(res, 400, { message: "Arkadaş silinemedi" });
  }
};

module.exports = {
  addFriend,
  getMyFriends,
  removeFriend
};