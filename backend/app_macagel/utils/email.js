const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS.trim(),
    },
});


const mailService = {
    // Hoşgeldiniz Emaili (Kayıt sonrası)
    sendWelcomeEmail: async (to, userName) => {
        return await transporter.sendMail({
            from: `"Macagel" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'Hoş Geldiniz!',
            html: `
                <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px;">
                    <h2>Hoş Geldiniz!</h2>
                    <p>Merhaba <strong>${userName}</strong>, Macagel'e hoş geldiniz!</p>
                </div>
            `
        });
    },

    // Giriş Bildirimi Metodu
    sendLoginAlertEmail: async (to, deviceDetails) => {
        return await transporter.sendMail({
            from: `"Macagel Güvenlik" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'Yeni Giriş Yapıldı',
            html: `
                <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px;">
                    <p>Hesabınıza yeni bir cihazdan giriş yapıldı: <strong>${deviceDetails}</strong></p>
                </div>
            `
        });
    },

    // Şifre Sıfırlama Metodu
    sendForgotPasswordEmail: async (to, resetToken) => {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        
        return await transporter.sendMail({
            from: `"Macagel Destek" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'Şifre Sıfırlama İsteği',
            html: `
                <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px;">
                    <h2>Şifre Yenileme Talebi</h2>
                    <p>Macagel hesabınızın şifresini sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
                    <a href="${resetUrl}" style="background: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">Şifremi Sıfırla</a>
                    <p>Bu bağlantı 1 saat geçerlidir.</p>
                </div>
            `
        });
    }
};

module.exports = mailService;
