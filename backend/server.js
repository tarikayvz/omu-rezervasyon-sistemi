const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');
const eventRoutes = require('./routes/eventRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();
const PORT = 5000;

// --- AYARLAR (LİMİT ARTIRMA) ---
// Resimler Base64 olacağı için limiti artırıyoruz
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Resim Klasörünü Dışarı Açma (Eski resimler varsa diye kalsın)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotalar
app.use('/api/events', eventRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/comments', commentRoutes);

// Sunucuyu Başlat
db.sequelize.sync({ force: true }).then(() => { 
  console.log('PostgreSQL bağlantısı başarılı.');
  app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor...`);
  });
});