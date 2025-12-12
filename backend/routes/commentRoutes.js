const express = require('express');
const router = express.Router();
const { Comment, Event } = require('../models');

// 1. Bir etkinliğe ait yorumları getir
router.get('/:eventId', async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { eventId: req.params.eventId },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(comments);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. Yorum Yap
router.post('/', async (req, res) => {
  try {
    const { username, text, rating, eventId } = req.body;
    const newComment = await Comment.create({ username, text, rating, eventId });
    res.status(201).json(newComment);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 3. ADMIN: Tüm Yorumları Getir
router.get('/', async (req, res) => {
  try {
    // Hata ayıklama için terminale yazdıralım
    console.log("Comment Modeli:", !!Comment); // true yazmalı
    console.log("Event Modeli:", !!Event);     // true yazmalı

    if (!Event) throw new Error("Event modeli yüklenemedi! index.js dosyasını kontrol et.");

    const comments = await Comment.findAll({
      include: [{
        model: Event, // Hata veren yer burasıydı, artık dolu gelecek
        attributes: ['title'],
        required: false
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(comments);
  } catch (error) {
    console.error("YORUM ÇEKME HATASI:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. ADMIN: Yorum Sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Comment.destroy({ where: { id } });
    res.status(200).json({ message: 'Yorum silindi.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. ADMIN: Yoruma Cevap Ver (Güncelle)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body; // Adminin yazdığı cevap

    const comment = await Comment.findByPk(id);
    if (!comment) return res.status(404).json({ message: 'Yorum bulunamadı.' });

    comment.reply = reply; // Cevabı kaydet
    await comment.save();

    res.status(200).json({ message: 'Cevap kaydedildi.', comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;