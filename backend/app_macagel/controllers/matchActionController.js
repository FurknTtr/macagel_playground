const mongoose = require("mongoose");
const Match = mongoose.model("Match"); 

const createResponse = function (res, status, content) {
  res.status(status).json(content);
};

const leaveOrKickPlayer = async function (req, res) {
  try {
    // Maçtan ayrılma veya oyuncu atma işlemleri (req.params.userId)
  } catch (error) {
    createResponse(res, 400, { message: "İşlem başarısız" });
  }
};

const joinPosition = async function (req, res) {
  try {
    // Maçtaki belirli bir pozisyona katılma işlemleri (req.body üzerinden userId, matchId, position)
  } catch (error) {
    createResponse(res, 400, { message: "Pozisyona katılma başarısız" });
  }
};

module.exports = {
  leaveOrKickPlayer,
  joinPosition
};