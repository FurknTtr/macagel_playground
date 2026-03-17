var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 1. İstersen default gelen bu iki satırı silebilirsin, ya da dursun zararı yok.
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
require('dotenv').config();
const connectDB = require('./app_macagel/config/db'); 

connectDB(); // Veritabanına bağlanma işlemini başlattık!

var express = require('express');
var path = require('path');

// 2. İŞTE BİZİM EKLEDİĞİMİZ SATIR: Kendi router dosyamızı içeri alıyoruz.
// (Dosya adını ne koyduysan onu yaz, ben macaGelRoutes.js varsaydım)
var macaGelRouter = require('./app_macagel/routes/macaGelRoutes');

var app = express();

app.use(logger('dev'));
app.use(express.json()); // Bu req.body'yi okumamızı sağlar! Çok önemli.
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Default rotalar (İstersen silebilirsin)
app.use('/', indexRouter);
app.use('/users', usersRouter);

// 3. İŞTE BİZİM BAĞLANTI NOKTAMIZ:
// "Eğer url /maca-gel ile başlıyorsa, macaGelRouter haritasına git" diyoruz.
app.use('/maca-gel', macaGelRouter);

// En alttaki dışa aktarma kısmı DOKUNULMADAN kalıyor.
module.exports = app;