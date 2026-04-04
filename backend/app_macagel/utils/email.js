const nodemailer = require('nodemailer');
const dns = require('dns');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // IPv4'e zorla (Railway'deki IPv6 sorunu)
    dnsLookup: (hostname, options, callback) => {
        dns.lookup(hostname, { family: 4 }, callback);
    }
});

const mailService = {
    // Hoşgeldiniz Emaili
    sendWelcomeEmail: (to, userName) => {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: 'Maça Gel - Hoş Geldin!',
            html: `<h2>Merhaba ${userName}!</h2><p>Macagel'e hoş geldin!</p>`
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('❌ Welcome email error:', err.message);
            } else {
                console.log('✅ Welcome email sent:', info.messageId);
            }
        });
    },

    // Şifre Sıfırlama Metodu
    sendForgotPasswordEmail: (to, resetToken) => {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: 'Şifre Sıfırlama İsteği',
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Şifre Yenileme Talebi</h2>
                    <p>Şifreni sıfırlamak için butona tıkla:</p>
                    <a href="${resetUrl}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Şifremi Sıfırla</a>
                </div>
            `
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('❌ Reset email error:', err.message);
            } else {
                console.log('✅ Reset email sent:', info.messageId);
            }
        });
    }
};

module.exports = mailService;