const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const mailService = {
    // Hoşgeldiniz Emaili
    sendWelcomeEmail: (to, userName) => {
        const msg = {
            to: to,
            from: process.env.EMAIL_USER,
            subject: 'Maça Gel - Hoş Geldin!',
            html: `<h2>Merhaba ${userName}!</h2><p>Macagel'e hoş geldin!</p>`
        };
        sgMail.send(msg)
            .then(() => console.log('✅ Welcome email sent'))
            .catch(err => console.error('❌ Welcome email error:', err.message));
    },

    // Şifre Sıfırlama Metodu
    sendForgotPasswordEmail: (to, resetToken) => {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        
        const msg = {
            to: to,
            from: process.env.EMAIL_USER,
            subject: 'Şifre Sıfırlama İsteği',
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Şifre Yenileme Talebi</h2>
                    <p>Şifreni sıfırlamak için butona tıkla:</p>
                    <a href="${resetUrl}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Şifremi Sıfırla</a>
                </div>
            `
        };
        sgMail.send(msg)
            .then(() => console.log('✅ Reset email sent'))
            .catch(err => console.error('❌ Reset email error:', err.message));
    }
};

module.exports = mailService;