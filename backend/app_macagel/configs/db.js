const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // .env dosyasından gizli linkimizi alıp bağlanıyoruz
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Bağlantısı Başarılı! 🚀');
    } catch (error) {
        console.error('MongoDB Bağlantı Hatası:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;