const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const authMiddleware = (req, res, next) => {
  try {
    // Authorization header'dan token al
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token bulunamadı" });
    }

    // "Bearer TOKEN" şeklindeki stringten TOKEN'ı çıkar
    const token = authHeader.split(" ")[1];

    // Token'ı doğrula
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Token payload'ındaki userId'yi req.userId'ye ekle
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    // Token geçersiz veya süresi dolmuş
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token süresi dolmuş" });
    }
    return res.status(401).json({ message: "Geçersiz token" });
  }
};

module.exports = authMiddleware;

