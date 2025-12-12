const { Event } = require('../models');
const { Op } = require('sequelize');
const sendEmail = require('../utils/emailService');
const { format } = require('date-fns');

// 1. Sadece ONAYLI etkinlikleri getir (Takvim Sayfası İçin)
exports.getAllEvents = async (req, res) => {
  try {
    const isAdmin = req.query.admin === 'true';
    const whereCondition = isAdmin ? {} : { isApproved: true };

    const events = await Event.findAll({
      where: whereCondition,
      order: [['startDate', 'ASC']]
    });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Yeni Etkinlik Oluştur (Çakışma Kontrolü + Geçmiş Tarih Engeli)
exports.createEvent = async (req, res) => {
  try {
    const { title, hall, description, startDate, endDate, organizer, department, email, phone } = req.body;

    // --- 1. GEÇMİŞ TARİH KONTROLÜ (YENİ EKLENDİ) ---
    if (new Date(startDate) < new Date()) {
        return res.status(400).json({ message: 'Geçmiş bir tarihe rezervasyon oluşturulamaz.' });
    }

    // --- 2. ÇAKIŞMA KONTROLÜ ---
    const conflict = await Event.findOne({
      where: {
        hall: hall,
        [Op.or]: [
          { startDate: { [Op.between]: [startDate, endDate] } },
          { endDate: { [Op.between]: [startDate, endDate] } },
          { [Op.and]: [ { startDate: { [Op.lte]: startDate } }, { endDate: { [Op.gte]: endDate } } ] }
        ]
      }
    });

    if (conflict) {
      return res.status(409).json({ message: 'Seçilen tarih ve saat aralığında bu salon dolu.' });
    }

    // --- 3. KAYIT OLUŞTURMA ---
    const newEvent = await Event.create({ 
      title, hall, description, startDate, endDate, organizer, department, email, phone,
      isApproved: false 
    });

    console.log(`📨 Başvuru maili gönderiliyor: ${email}`);

    // --- 4. BAŞVURU ALINDI MAİLİ ---
    const mailSubject = 'Rezervasyon Talebiniz Alındı';
    const mailContent = `
      <h2>Merhaba ${organizer},</h2>
      <p><strong>${title}</strong> etkinliği için rezervasyon talebiniz başarıyla alınmıştır.</p>
      <p><strong>Salon:</strong> ${hall.toUpperCase()} Salon</p>
      <p><strong>Tarih:</strong> ${new Date(startDate).toLocaleString('tr-TR')}</p>
      <br/>
      <p>Talebiniz yönetici tarafından incelendikten sonra onay durumu hakkında bilgilendirileceksiniz.</p>
      <p><em>OMÜ Mühendislik Fakültesi Rezervasyon Sistemi</em></p>
    `;

    sendEmail(email, mailSubject, mailContent).catch(err => console.error("Mail gönderme hatası:", err));
    
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Create Event Hatası:", error);
    res.status(500).json({ error: error.message });
  }
};

// 3. Etkinlik Sil
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await Event.destroy({ where: { id } });
    res.status(200).json({ message: 'Etkinlik silindi.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Etkinliği Onayla (Admin Paneli İçin)
exports.approveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Etkinliği bul
    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }

    // 2. Onay durumunu güncelle
    event.isApproved = true;
    await event.save();
    
    console.log(`📨 Onay maili gönderiliyor: ${event.email}`);

    // 3. ONAY MAİLİ GÖNDER (DİJİTAL BİLET LİNKİ EKLENDİ)
    const ticketLink = `http://localhost:3000/bilet/${event.id}`;

    const mailSubject = 'Rezervasyonunuz Onaylandı! 🎫';
    const mailContent = `
      <h2>Merhaba ${event.organizer},</h2>
      <p>Tebrikler! <strong>${event.title}</strong> başlıklı rezervasyon talebiniz yönetici tarafından onaylanmıştır.</p>
      
      <div style="background-color: #f0fdf4; border-left: 5px solid #22c55e; padding: 15px; margin: 20px 0;">
        <p><strong>Salon:</strong> ${event.hall.toUpperCase()} Salon</p>
        <p><strong>Başlangıç:</strong> ${new Date(event.startDate).toLocaleString('tr-TR')}</p>
        <p><strong>Bitiş:</strong> ${new Date(event.endDate).toLocaleString('tr-TR')}</p>
      </div>

      <p>Etkinlik günü giriş yapabilmek için aşağıdaki butona tıklayarak Dijital Biletinizi oluşturunuz:</p>
      
      <a href="${ticketLink}" style="display: inline-block; background-color: #E30613; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">
         🎫 Biletimi Görüntüle
      </a>

      <p style="margin-top:20px; font-size: 12px; color: #666;">Eğer butona tıklayamazsanız: ${ticketLink}</p>
      <p><em>OMÜ Mühendislik Fakültesi</em></p>
    `;

    sendEmail(event.email, mailSubject, mailContent).catch(err => console.error("Mail hatası:", err));

    return res.status(200).json({ message: 'Etkinlik onaylandı ve mail gönderildi.', event });

  } catch (error) {
    console.error("Approve Event Hatası:", error);
    res.status(500).json({ error: error.message });
  }
};