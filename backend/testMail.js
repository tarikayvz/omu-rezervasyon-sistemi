require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function main() {
  console.log('⏳ Mail gönderiliyor...');
  console.log(`Gönderen: ${process.env.EMAIL_USER}`);
  
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Kendi kendine mail at
      subject: "Test Maili",
      text: "Bu bir test mailidir. Sistem çalışıyor!",
    });

    console.log("✅ BAŞARILI! Mail ID:", info.messageId);
  } catch (error) {
    console.error("❌ HATA OLUŞTU!");
    console.error(error);
  }
}

main();