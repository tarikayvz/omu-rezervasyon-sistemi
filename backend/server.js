const express = require('express');
const cors = require('cors');
const path = require('path'); // EKLENDİ
const db = require('./models');
const eventRoutes = require('./routes/eventRoutes');
const announcementRoutes = require('./routes/announcementRoutes'); // EKLENDİ
const commentRoutes = require('./routes/commentRoutes'); // Eklendi

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Resim Klasörünü Dışarı Açma (EKLENDİ)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotalar
app.use('/api/events', eventRoutes);
app.use('/api/announcements', announcementRoutes); // EKLENDİ
app.use('/api/comments', commentRoutes);


// PostgreSQL'e tabloları sıfırdan kuruyoruz
db.sequelize.sync().then(() => { 
  console.log('PostgreSQL bağlantısı başarılı ve tablolar oluşturuldu.');
  app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor...`);
  });
});