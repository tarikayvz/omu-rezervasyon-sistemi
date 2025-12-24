const express = require('express');
const router = express.Router();
const { Announcement } = require('../models');
// DÜZELTME 1: Artık multer ayarlarını buradan yapmıyoruz, middleware'den çağırıyoruz.
const upload = require('../middleware/upload'); 

// --- ROTALAR ---

// 1. Yeni Duyuru Ekle (Çoklu Resim)
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // DÜZELTME 2: Cloudinary bize direkt tam linki (file.path) verir.
    // Artık başına '/uploads/' koymamıza gerek yok.
    const imagePaths = req.files ? req.files.map(file => file.path) : [];

    const newAnnouncement = await Announcement.create({
      title,
      description,
      // Veritabanına Cloudinary linklerini JSON array string olarak kaydediyoruz
      image: JSON.stringify(imagePaths), 
      date: new Date()
    });

    res.status(201).json(newAnnouncement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Tüm Duyuruları Getir
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      order: [['date', 'DESC']]
    });
    
    const parsedAnnouncements = announcements.map(ann => {
        let images = [];
        try {
            // Eski format veya yeni format kontrolü
            images = ann.image.startsWith('[') ? JSON.parse(ann.image) : [ann.image];
        } catch (e) { images = []; }
        
        return {
            ...ann.dataValues,
            images: images
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

// 5. Duyuru Güncelle
router.put('/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const announcement = await Announcement.findByPk(id);
    if (!announcement) return res.status(404).json({ message: 'Duyuru bulunamadı' });

    let currentImages = [];
    try {
      currentImages = announcement.image ? JSON.parse(announcement.image) : [];
      if (!Array.isArray(currentImages)) currentImages = [announcement.image];
    } catch (e) { currentImages = []; }

    // DÜZELTME 3: Yeni yüklenenler de Cloudinary linki (file.path) olarak gelir
    const newImagePaths = req.files ? req.files.map(file => file.path) : [];
    const updatedImages = [...currentImages, ...newImagePaths];

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