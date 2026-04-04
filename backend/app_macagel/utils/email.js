const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // smtp.gmail.com
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER, // mac4gel@gmail.com
        pass: process.env.EMAIL_PASS, // Gmail Uygulama Şifren
    },
    // Railway'deki IPv6 bağlantı sorununu çözen kritik kısım
    dnsLookup: (hostname, options, callback) => {
        require('dns').lookup(hostname, { family: 4 }, callback);
    },
});

// Maili arka planda gönderen fonksiyon (Express'i bekletmez)
const sendMailAsync = (mailOptions) => {
    transporter.sendMail(mailOptions)
        .then(info => console.log(`E-posta başarıyla gitti: ${info.messageId}`))
        .catch(err => {
            console.error("GMAİL HATASI:", err);
        });
};

const mailService = {
    // Hoşgeldiniz Emaili
    sendWelcomeEmail: (to, userName) => {
        sendMailAsync({
            from: `"Macagel" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'Maça Gel - Hoş Geldin!',
            html: `<h2>Merhaba ${userName}!</h2><p>Macagel'e hoş geldin!</p>`
        });
    },

    // Şifre Sıfırlama Metodu
    sendForgotPasswordEmail: (to, resetToken) => {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        
        sendMailAsync({
            from: `"Macagel Destek" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'Şifre Sıfırlama İsteği',
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Şifre Yenileme Talebi</h2>
                    <p>Şifreni sıfırlamak için butona tıkla:</p>
                    <a href="${resetUrl}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Şifremi Sıfırla</a>
                </div>
            `
        });
    }
};

module.exports = mailService;