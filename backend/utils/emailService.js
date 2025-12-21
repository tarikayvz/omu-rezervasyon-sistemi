require('dotenv').config();
const nodemailer = require('nodemailer');

// 'gmail' servisini kullanarak port/host ayarlarını otomatiğe bırakıyoruz.
// debug: true ekledik, böylece bağlantı detaylarını loglarda göreceğiz.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true, // Logları detaylı göster
  debug: true   // Hata ayıklama modunu aç
});

// Mail Gönderme Fonksiyonu
const sendEmail = async (to, subject, htmlContent) => {
  try {
    console.log(`⏳ Mail sunucusuna bağlanılıyor: ${to}`);
    
    const mailOptions = {
      from: `"OMÜ Rezervasyon Sistemi" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Mail başarıyla gönderildi! ID: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Mail gönderme hatası (Detaylı):', error);
    return false;
  }
};

module.exports = sendEmail;