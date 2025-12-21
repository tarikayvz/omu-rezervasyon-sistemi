const { Event } = require('../models');
const { Op } = require('sequelize');
const sendEmail = require('../utils/emailService');
const { format } = require('date-fns');

// 1. Get All Events (For Calendar Page)
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

// 2. Create New Event (Conflict Check + Past Date Check)
// 2. Yeni Etkinlik Oluştur (DÜZELTİLMİŞ)
exports.createEvent = async (req, res) => {
  try {
    const { title, hall, description, startDate, endDate, organizer, department, email, phone } = req.body;

    // --- 1. GEÇMİŞ TARİH KONTROLÜ ---
    if (new Date(startDate) < new Date()) {
        return res.status(400).json({ message: 'Geçmiş bir tarihe rezervasyon oluşturulamaz.' });
    }

    // --- 2. ÇAKIŞMA KONTROLÜ (KRİTİK DÜZELTME BURADA) ---
    // isApproved: true ekledik. Artık sadece ONAYLANMIŞ etkinlik varsa hata verecek.
    // Onay bekleyen varsa, yeni kayıt oluşturmaya izin verecek.
    const conflict = await Event.findOne({
      where: {
        hall: hall,
        isApproved: true, // <--- BURASI ÇOK ÖNEMLİ! Sadece onaylıysa dolu say.
        [Op.or]: [
          { startDate: { [Op.between]: [startDate, endDate] } },
          { endDate: { [Op.between]: [startDate, endDate] } },
          { [Op.and]: [ { startDate: { [Op.lte]: startDate } }, { endDate: { [Op.gte]: endDate } } ] }
        ]
      }
    });

    if (conflict) {
      // Eğer 409 dönerse, demek ki bu saatte ONAYLI bir etkinlik var.
      return res.status(409).json({ message: 'Bu saatte ONAYLANMIŞ bir etkinlik var! Başka bir saat seçiniz.' });
    }

    // --- 3. KAYIT OLUŞTURMA ---
    const newEvent = await Event.create({ 
      title, hall, description, startDate, endDate, organizer, department, email, phone,
      isApproved: false // Varsayılan olarak onaysız başlar
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
      <p>Aynı saat için başka talepler de olabilir, sistem öncelik tanımaz; yönetici onayı esastır.</p>
      <p><em>OMÜ Mühendislik Fakültesi Rezervasyon Sistemi</em></p>
    `;

    sendEmail(email, mailSubject, mailContent).catch(err => console.error("Mail gönderme hatası:", err));
    
    res.status(201).json(newEvent);

  } catch (error) {
    console.error("Create Event Hatası:", error);
    res.status(500).json({ error: error.message });
  }
};

// 3. Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await Event.destroy({ where: { id } });
    res.status(200).json({ message: 'Etkinlik silindi.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Approve Event (For Admin Panel)
exports.approveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Find the event
    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }

    // --- CONFLICT CHECK BEFORE APPROVAL (NEW) ---
    // Before approving, check if another APPROVED event already exists in this slot.
    // This prevents approving two overlapping requests by mistake.
    const conflict = await Event.findOne({
        where: {
            hall: event.hall,
            isApproved: true,
            id: { [Op.ne]: event.id }, // Exclude current event
            [Op.or]: [
                { startDate: { [Op.between]: [event.startDate, event.endDate] } },
                { endDate: { [Op.between]: [event.startDate, event.endDate] } },
                { [Op.and]: [ { startDate: { [Op.lte]: event.startDate } }, { endDate: { [Op.gte]: event.endDate } } ] }
            ]
        }
    });

    if (conflict) {
        return res.status(409).json({ message: 'Bu saatte zaten onaylanmış başka bir etkinlik var! Önce onu iptal etmelisiniz.' });
    }

    // 2. Update approval status
    event.isApproved = true;
    await event.save();
    
    console.log(`📨 Onay maili gönderiliyor: ${event.email}`);

    // 3. SEND APPROVAL EMAIL (WITH TICKET LINK)
    // IMPORTANT: Change localhost to your actual Render URL for production
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const ticketLink = `${baseUrl}/bilet/${event.id}`;

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
}