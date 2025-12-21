require('dotenv').config();
const nodemailer = require('nodemailer');

// Taşıyıcıyı (Transporter) Oluştur
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // 465 için true, 587 için false
  auth: {
    user: process.env.EMAIL_USER, // Render Environment'dan okuyacak
    pass: process.env.EMAIL_PASS, // Render Environment'dan okuyacak
  },
});

// Mail Gönderme Fonksiyonu
const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: `"OMÜ Rezervasyon Sistemi" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text,
      html: html,
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