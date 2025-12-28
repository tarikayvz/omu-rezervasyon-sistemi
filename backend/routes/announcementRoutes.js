const express = require('express');
const router = express.Router();
const { Announcement } = require('../models');
const upload = require('../middleware/upload'); 

// --- YARDIMCI FONKSİYON: BUFFER -> BASE64 ---
// Bu fonksiyon resmi "data:image/jpeg;base64,..." formatına çevirir
const bufferToBase64 = (file) => {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
};

// 1. Yeni Duyuru Ekle (Base64 Kayıt)
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Resimleri Base64 String formatına çevirip listeye atıyoruz
    let imageList = [];
    if (req.files && req.files.length > 0) {
        imageList = req.files.map(file => bufferToBase64(file));
    }

    const newAnnouncement = await Announcement.create({
      title,
      description,
      // Veritabanına String dizisi olarak kaydet
      image: JSON.stringify(imageList), 
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

// 5. Duyuru Güncelle (Base64)
router.put('/:id', upload.array('images', 5), async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description } = req.body;
  
      const announcement = await Announcement.findByPk(id);
      if (!announcement) return res.status(404).json({ message: 'Duyuru bulunamadı' });
  
      // Mevcut resimleri al (Veritabanında zaten Base64 duruyorlar)
      let currentImages = [];
      try {
        currentImages = announcement.image ? JSON.parse(announcement.image) : [];
        if (!Array.isArray(currentImages)) currentImages = [announcement.image];
      } catch (e) { currentImages = []; }
  
      // Yeni yüklenenleri de Base64'e çevir
      let newImages = [];
      if (req.files && req.files.length > 0) {
          newImages = req.files.map(file => bufferToBase64(file));
      }
  
      // Eskilerle yenileri birleştir
      const updatedImages = [...currentImages, ...newImages];
  
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