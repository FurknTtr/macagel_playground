const nodemailer = require('nodemailer');

// SendGrid Yapılandırması
const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net", // SendGrid için sabit
    port: 587,                 // TLS portu
    secure: false,
    auth: {
        user: "apikey", // BURASI DEĞİŞMEZ, aynen "apikey" yazılacak
        pass: process.env.SENDGRID_API_KEY, // Railway'deki SG... anahtarın
    },
    // Railway'deki IPv6 bağlantı hatasını önlemek için IPv4 zorlaması
    dnsLookup: (hostname, options, callback) => {
        require('dns').lookup(hostname, { family: 4 }, callback);
    },
});

// Mail gönderme işlemini arka plana atan yardımcı fonksiyon
const sendMailAsync = (mailOptions) => {
    // await KULLANILMIYOR: Express sunucun mailin gitmesini beklemeden 200 OK döner.
    transporter.sendMail(mailOptions)
        .then(info => console.log(`E-posta gönderildi: ${info.messageId}`))
        .catch(err => {
            console.error("E-posta Hatası Detayı:", err);
            if (err.code === 'EAUTH') {
                console.error("HATA: SendGrid API Key veya 'apikey' kullanıcı adı hatalı!");
            }
        });
};

const mailService = {
    // Hoşgeldiniz Emaili
    sendWelcomeEmail: (to, userName) => {
        sendMailAsync({
            from: `"Macagel" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'Maça Gel - Hoş Geldin!',
            html: `
                <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px; max-width: 600px;">
                    <h2 style="color: #28a745;">Hoş Geldin ${userName}! ⚽️</h2>
                    <p>Macagel topluluğuna katıldığın için teşekkürler. Artık maçlara kolayca katılım sağlayabilirsin.</p>
                </div>
            `
        });
    },

    // Şifre Sıfırlama Metodu
    sendForgotPasswordEmail: (to, resetToken) => {
        // Senin belirttiğin FRONTEND_URL üzerinden link oluşturuluyor
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        
        sendMailAsync({
            from: `"Macagel Destek" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'Şifre Sıfırlama İsteği',
            html: `
                <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px; max-width: 600px;">
                    <h2 style="border-bottom: 1px solid #ddd; padding-bottom: 10px;">Şifre Yenileme Talebi</h2>
                    <p>Hesabının şifresini sıfırlamak için aşağıdaki butona tıkla:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Şifremi Sıfırla</a>
                    </div>
                    <p style="color: #777; font-size: 12px;">Bu link 1 saat geçerlidir. Eğer bu isteği sen yapmadıysan bu maili görmezden gelebilirsin.</p>
                </div>
            `
        });
    }
};

module.exports = mailService;