const mongoose = require('mongoose');
const User = require('../User');   // Dosya yollarÄ±nÄ± kontrol et!
const Match = require('../Match');
const Rating = require('../Rating');

// Kendi connection string'ini buraya yapÄ±ÅŸtÄ±r
const DB_URI = 'mongodb+srv://MacaGel_DB_Project:3gys0KAeCwX6FYrm@macageldb.id6jog0.mongodb.net/MacaGelDB';

const seedData = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log("ğŸš€ DB BaÄŸlantÄ±sÄ± baÅŸarÄ±lÄ±. Tohumlama baÅŸlÄ±yor...");

        // Temizlik (Eski verileri silmek istemiyorsan bu 3 satÄ±rÄ± yorum satÄ±rÄ± yap)
        await User.deleteMany({});
        await Match.deleteMany({});
        await Rating.deleteMany({});

        // 1. KullanÄ±cÄ±larÄ± Ekle
        const users = await User.insertMany([
            { username: "Furkan Tatar", email: "furkan@mail.com", password: "123", stats: { averageRating: 5 } },
            { username: "Fatih Åahin", email: "fatih@mail.com", password: "123", stats: { averageRating: 4.8 } },
            { username: "Erkutay Halil", email: "erkutay@mail.com", password: "123", stats: { averageRating: 4.5 } },
            { username: "Mustafa Tuluk", email: "mustafa@mail.com", password: "123", stats: { averageRating: 4.7 } }
        ]);
        console.log("âœ… 4 KullanÄ±cÄ± oluÅŸturuldu.");

        // 2. MaÃ§ KartlarÄ±nÄ± OluÅŸtur (Herkes kendi maÃ§Ä±nÄ±n sahibi)
        const matches = await Match.insertMany([
            {
                name: "Furkan'Ä±n Derbisi",
                location: "KadÄ±kÃ¶y HalÄ± Saha",
                date: new Date(),
                capacity: 14,
                owner: users[0]._id,
                players: [{ user: users[0]._id, position: "Forvet" }],
                inviteCode: "FRK123"
            },
            {
                name: "Fatih'in AkÅŸam Grubu",
                location: "BeÅŸiktaÅŸ Belediye SahasÄ±",
                date: new Date(),
                capacity: 12,
                owner: users[1]._id,
                players: [{ user: users[1]._id, position: "Defans" }],
                inviteCode: "FTH456"
            },
            {
                name: "Erkutay Teknik KapÄ±ÅŸma",
                location: "ÃœskÃ¼dar Spor Tesisi",
                date: new Date(),
                capacity: 14,
                owner: users[2]._id,
                players: [{ user: users[2]._id, position: "Orta Saha" }],
                inviteCode: "ERK789"
            },
            {
                name: "Mustafa Tuluk Invitational",
                location: "Florya Metin Oktay",
                date: new Date(),
                capacity: 10,
                owner: users[3]._id,
                players: [{ user: users[3]._id, position: "Kaleci" }],
                inviteCode: "MST000"
            }
        ]);
        console.log("âœ… 4 MaÃ§ kartÄ± oluÅŸturuldu.");

        // 3. BirkaÃ§ Ã–rnek Rating Ekle
        await Rating.create({
            reviewer: users[0]._id,   // Furkan
            targetUser: users[1]._id, // Fatih'e puan veriyor
            rating: 5,
            comment: "Fatih harika defans yapÄ±yor, geÃ§it vermedi!"
        });

        console.log("âœ¨ Veri ekleme iÅŸlemi baÅŸarÄ±yla tamamlandÄ±!");
        process.exit();
    } catch (error) {
        console.error("âŒ Hata:", error);
        process.exit(1);
    }
};

seedData();