require('dotenv').config();
const nodemailer = require('nodemailer');

// Taşıyıcıyı (Transporter) Oluştur
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // 465 yerine 587 kullanıyoruz (Daha kararlı)
  secure: false, // 587 için false olmalı (STARTTLS kullanır)
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
  tls: {
    rejectUnauthorized: false // Bazen sertifika hatası verirse bunu yoksayması için
  }
});

// Mail Gönderme Fonksiyonu
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: `"OMÜ Rezervasyon Sistemi" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent, // HTML içerik gönderiyoruz
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Mail başarıyla gönderildi: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Mail gönderme hatası:', error);
    return false;
  }
};

module.exports = sendEmail;