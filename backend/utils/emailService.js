require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // 587 (TLS) kullanıyoruz
  secure: false, // 587 için false olmak ZORUNDA
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: 'SSLv3', // Şifreleme algoritmasını esnetiyoruz
    rejectUnauthorized: false // Sertifika hatalarını yoksay
  },
  connectionTimeout: 10000, // 10 saniye içinde bağlanamazsa hata ver (Sonsuza kadar beklemesin)
  greetingTimeout: 5000,    // Selamlaşma süresi
  socketTimeout: 10000,     // Soket zaman aşımı
  logger: true,
  debug: true
});

const sendEmail = async (to, subject, htmlContent) => {
  try {
    console.log(`⏳ Mail sunucusuna bağlanılıyor (Port 587): ${to}`);
    
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