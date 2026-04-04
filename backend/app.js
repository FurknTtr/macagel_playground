require('dotenv').config(); // 1. Önce gizli ayarlar yüklenmeli
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors'); // CORS EKLENDI


const connectDB = require('./app_macagel/configs/db'); 
connectDB(); // 2. Veritabanını ayağa kaldırıyoruz

// Router'lar
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const macaGelRouter = require('./app_macagel/routes/index.js');

const app = express();

// Middleware'ler
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://macagel.vercel.app'
    : ['http://localhost:3000', 'http://localhost:5173'], // Vite port
  credentials: true
};
app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Rotalar (Routes)
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/maca-gel', macaGelRouter);

module.exports = app;