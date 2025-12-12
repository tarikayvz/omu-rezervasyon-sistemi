const nodemailer = require('nodemailer');

// Taşıyıcı (Postacı) Ayarları
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tbafb1907@gmail.com', // <-- BURAYI DEĞİŞTİR
    pass: 'qack svgc kmxq mawl'       // <-- BURAYI DEĞİŞTİR (Boşluksuz yaz)
  }
});

// Mail Gönderme Fonksiyonu
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: '"OMÜ Rezervasyon Sistemi" <no-reply@omu.edu.tr>', // Gönderen adı
      to: to, // Kime gidecek
      subject: subject, // Konu
      html: htmlContent // İçerik (HTML formatında)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-posta gönderildi: ' + info.response);
    return true;
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    return false;
  }
};

module.exports = sendEmail;