const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Announcement } = require('../models');

// --- MULTER AYARLARI ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Benzersiz isim
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- ROTALAR ---

// 1. Yeni Duyuru Ekle (Çoklu Resim)
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Yüklenen dosyaların yollarını listeye çevir
    const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const newAnnouncement = await Announcement.create({
      title,
      description,
      // Veritabanına JSON string olarak kaydediyoruz (SQLite array desteklemez, biz string yapıp saklarız)
      image: JSON.stringify(imagePaths), 
      date: new Date()
    });

    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Tüm Duyuruları Getir
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      order: [['date', 'DESC']]
    });
    
    // Veritabanından gelen string veriyi tekrar listeye (array) çevirip gönderelim
    const parsedAnnouncements = announcements.map(ann => {
        let images = [];
        try {
            // Eğer eski veri varsa (tek string) onu da array yap, yeniyse parse et
            images = ann.image.startsWith('[') ? JSON.parse(ann.image) : [ann.image];
        } catch (e) { images = []; }
        
        return {
            ...ann.dataValues,
            images: images // Artık frontend'e 'images' dizisi gidecek
        };
    });

    res.status(200).json(parsedAnnouncements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Tek Duyuru Getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByPk(id);
    if (!announcement) return res.status(404).json({ message: 'Bulunamadı' });

    let images = [];
    try {
        images = announcement.image.startsWith('[') ? JSON.parse(announcement.image) : [announcement.image];
    } catch (e) { images = []; }

    res.status(200).json({ ...announcement.dataValues, images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Announcement.destroy({ where: { id } });
    res.status(200).json({ message: 'Silindi.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Duyuru Güncelle (Başlık, Açıklama ve Yeni Resim Ekleme)
router.put('/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    // Önce mevcut duyuruyu bul
    const announcement = await Announcement.findByPk(id);
    if (!announcement) return res.status(404).json({ message: 'Duyuru bulunamadı' });

    // Eski resim listesini al
    let currentImages = [];
    try {
      currentImages = announcement.image ? JSON.parse(announcement.image) : [];
      // Eğer eski formatta tek string kaldıysa onu diziye çevir
      if (!Array.isArray(currentImages)) currentImages = [announcement.image];
    } catch (e) { currentImages = []; }

    // Yeni yüklenen resimler varsa listeye ekle
    const newImagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    const updatedImages = [...currentImages, ...newImagePaths];

    // Güncelle
    announcement.title = title;
    announcement.description = description;
    announcement.image = JSON.stringify(updatedImages);
    
    await announcement.save();

    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;