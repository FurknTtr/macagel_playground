const mongoose = require("mongoose");
const Rating = require("../models/Rating"); 
const User = require("../models/User");

const createResponse = function (res, status, content) {
  res.status(status).json(content);
};

const addRating = async function (req, res) {
  try {
    // Kullanıcıya yıldız/yorum atma işlemleri (req.params.userId, req.body)
  } catch (error) {
    createResponse(res, 400, { message: "Değerlendirme yapılamadı" });
  }
};

const updateRating = async function (req, res) {
  try {
    // Yıldız/yorum güncelleme işlemleri (req.params.rateId, req.body)
  } catch (error) {
    createResponse(res, 400, { message: "Değerlendirme güncellenemedi" });
  }
};

const deleteRating = async function (req, res) {
  try {
    // Yıldız/yorum silme işlemleri (req.params.rateId)
  } catch (error) {
    createResponse(res, 400, { message: "Değerlendirme silinemedi" });
  }
};

const getPlayerPreview = async function (req, res) {
  try {
    // Oyuncu önizlemesini (puanı, maç sayısı vb.) getirme işlemleri (req.params.userId)
  } catch (error) {
    createResponse(res, 400, { message: "Oyuncu önizlemesi getirilemedi" });
  }
};

module.exports = {
  addRating,
  updateRating,
  deleteRating,
  getPlayerPreview
};