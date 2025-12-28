'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../utils/api';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaArrowRight, FaHistory, FaStar, FaCommentDots, FaUser, FaReplyAll, FaTimes, FaChevronUp } from 'react-icons/fa';
import { format, isSameDay, parseISO, isPast, isFuture, isToday } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'react-toastify';

// Saat Slotları (09:00 - 17:00 arası)
const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

// --- YILDIZ BİLEŞENİ ---
const StarRating = ({ rating, setRating, hoverRating, setHoverRating }) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={index} className="cursor-pointer">
            <input type="radio" className="hidden" onClick={() => setRating(ratingValue)} />
            <FaStar 
              size={24} 
              className="transition-colors duration-200"
              color={ratingValue <= (hoverRating || rating) ? "#ffc107" : "#e5e7eb"} 
              onMouseEnter={() => setHoverRating(ratingValue)}
              onMouseLeave={() => setHoverRating(0)}
            />
          </label>
        );
      })}
    </div>
  );
};

export default function HallScheduler() {
  // --- STATE'LER ---
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedHall, setSelectedHall] = useState('mavi'); // Varsayılan Mavi Salon
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal & Yorum State'leri
  const [selectedEvent, setSelectedEvent] = useState(null); // Detay için
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ username: '', text: '', rating: 0 });
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // --- VERİ ÇEKME ---
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_URL}/events`);
      setEvents(response.data);
      setLoading(false);
    } catch (error) { console.error(error); setLoading(false); }
  };

  const fetchComments = async (eventId) => {
    try {
      const res = await axios.get(`${API_URL}/comments/${eventId}`);
      setComments(res.data);
    } catch (error) { console.error(error); }
  };

  // --- YARDIMCI FONKSİYONLAR ---
  
  // Seçilen gün ve salondaki rezervasyonu bulur
  const getBookingForSlot = (time) => {
    return events.find(event => {
      // 1. Salon kontrolü
      if (!event.hall.includes(selectedHall)) return false;
      
      // 2. Tarih kontrolü
      const eventStart = parseISO(event.startDate);
      const currentSelected = parseISO(selectedDate);
      if (!isSameDay(eventStart, currentSelected)) return false;

      // 3. Saat kontrolü (Slot saati, başlangıç saatiyle eşleşiyor mu?)
      // Not: Daha gelişmiş kontrol için saat aralığına bakılabilir.
      const slotHour = parseInt(time.split(':')[0]);
      const eventHour = eventStart.getHours();
      
      // Basitçe: Etkinlik o saatte başlıyorsa veya o saati kapsıyorsa
      const eventEndHour = parseISO(event.endDate).getHours();
      return slotHour >= eventHour && slotHour < eventEndHour;
    });
  };

  const handleSlotClick = (time, booking) => {
    if (booking) {
      // Dolu ise detaylarını aç
      openModal(booking);
    } else {
      // Boş ise seçim yap
      setSelectedSlot(time === selectedSlot ? null : time);
    }
  };

  // --- MODAL İŞLEMLERİ ---
  const openModal = (event) => {
    setSelectedEvent(event);
    fetchComments(event.id);
    setShowCommentForm(false);
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    setSelectedEvent(null);
    document.body.style.overflow = 'unset';
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.username || !newComment.text || newComment.rating === 0) return toast.warning('Eksik bilgi girdiniz.');
    
    try {
      await axios.post(`${API_URL}/comments`, { ...newComment, eventId: selectedEvent.id });
      fetchComments(selectedEvent.id);
      setNewComment({ username: '', text: '', rating: 0 });
      toast.success('Yorum gönderildi!');
    } catch (error) { toast.error('Hata oluştu.'); }
  };

  // --- RENDER ---
  const pastEvents = events.filter(e => isPast(parseISO(e.endDate)) && !isToday(parseISO(e.endDate)) && e.hall.includes(selectedHall));

  return (
    <div className="max-w-5xl mx-auto">
      
      {/* 1. FİLTRELER (Salon ve Tarih) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Salon Seçimi Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {['mavi', 'pembe', 'konferans'].map((hall) => (
              <button
                key={hall}
                onClick={() => { setSelectedHall(hall); setSelectedSlot(null); }}
                className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                  selectedHall === hall ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {hall}
              </button>
            ))}
          </div>

          {/* Tarih Seçimi */}
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
            <FaCalendarAlt className="text-gray-400" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-bold text-gray-700 outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 2. ZAMAN ÇİZELGESİ (GRID) */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-12">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${selectedHall==='mavi'?'bg-blue-600':selectedHall==='pembe'?'bg-pink-500':'bg-orange-500'}`}></span>
                {selectedHall.toUpperCase()} SALON - {format(parseISO(selectedDate), 'd MMMM yyyy', { locale: tr })} Programı
            </h3>
        </div>

        {loading ? <div className="p-10 text-center text-gray-500">Yükleniyor...</div> : (
        <div className="grid grid-cols-1 divide-y divide-gray-100">
          {timeSlots.map((time, index) => {
            const booking = getBookingForSlot(time); // Doluluk kontrolü
            const isSelected = selectedSlot === time;

            return (
              <div 
                key={index} 
                onClick={() => handleSlotClick(time, booking)}
                className={`
                  relative flex flex-col md:flex-row md:items-center p-6 transition-all duration-300 group
                  ${booking 
                    ? 'bg-red-50/30 cursor-pointer hover:bg-red-50' // Dolu
                    : isSelected 
                      ? 'bg-blue-50 border-l-4 border-blue-600' // Seçili
                      : 'bg-white hover:bg-gray-50 cursor-pointer border-l-4 border-transparent' // Boş
                  }
                `}
              >
                {/* Saat */}
                <div className="w-24 flex-shrink-0 flex items-center gap-2 text-lg font-bold text-gray-700 mb-2 md:mb-0">
                  <FaClock className={booking ? 'text-red-300' : 'text-blue-500'} />
                  {time}
                </div>

                {/* İçerik */}
                <div className="flex-grow">
                  {booking ? (
                    // DOLU DURUMU (API'den Gelen Veri)
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">DOLU</span>
                            <div>
                                <h4 className="text-gray-900 font-bold text-sm">{booking.title}</h4>
                                <p className="text-gray-500 text-xs">{booking.organizer || 'Organizatör Bilgisi Yok'}</p>
                            </div>
                        </div>
                        <span className="text-xs text-gray-400 flex items-center gap-1 group-hover:text-red-500 transition">Detay <FaArrowRight/></span>
                    </div>
                  ) : (
                    // BOŞ DURUMU
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                           <span className="text-blue-700 font-bold text-sm flex items-center gap-2"><FaCheckCircle /> Seçildi</span>
                        ) : (
                           <span className="text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition">Müsait</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* 3. GEÇMİŞ ETKİNLİKLER (Yorum Yapabilmek İçin) */}
      {pastEvents.length > 0 && (
        <div className="mt-12 pt-10 border-t-2 border-dashed border-gray-200">
            <h2 className="text-xl font-bold text-gray-500 mb-6 flex items-center gap-2"><FaHistory /> Bu Salondaki Geçmiş Etkinlikler</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastEvents.map(event => (
                    <div key={event.id} onClick={() => openModal(event)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition opacity-75 hover:opacity-100">
                        <h4 className="font-bold text-gray-800 mb-1">{event.title}</h4>
                        <p className="text-xs text-gray-500">{format(parseISO(event.startDate), 'd MMMM yyyy', { locale: tr })}</p>
                        <div className="mt-2 text-xs text-blue-600 font-bold">Değerlendir & Yorumla →</div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* 4. REZERVASYON BUTONU (Alt Bar) */}
      <div className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform duration-500 transform z-40 ${selectedSlot ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="container mx-auto max-w-5xl flex justify-between items-center">
            <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">Seçilen Rezervasyon</p>
                <p className="text-xl font-black text-gray-900">{selectedHall.toUpperCase()} / {format(parseISO(selectedDate), 'd MMMM')} / {selectedSlot}</p>
            </div>
            {/* Burada rezervasyon sayfasına yönlendirme yapılabilir */}
            <button className="bg-[#E30613] text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg flex items-center gap-2">
                Devam Et <FaArrowRight />
            </button>
        </div>
      </div>

      {/* --- DETAY & YORUM MODALI --- */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
             {/* Modal Header */}
             <div className="bg-gray-900 text-white p-6 flex justify-between items-center sticky top-0 z-10">
                <div>
                    <h2 className="text-xl font-bold">{selectedEvent.title}</h2>
                    <p className="text-sm text-gray-400">{selectedEvent.organizer}</p>
                </div>
                <button onClick={closeModal} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><FaTimes /></button>
             </div>

             <div className="p-6">
                <p className="text-gray-700 mb-6 leading-relaxed">{selectedEvent.description}</p>
                
                {/* Yorumlar Bölümü */}
                <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2"><FaCommentDots className="text-red-500"/> Değerlendirmeler ({comments.length})</h3>
                        <button onClick={() => setShowCommentForm(!showCommentForm)} className="text-xs bg-gray-100 px-3 py-1 rounded-lg font-bold hover:bg-gray-200">
                             {showCommentForm ? 'Vazgeç' : 'Yorum Yap'}
                        </button>
                    </div>

                    {showCommentForm && (
                        <form onSubmit={submitComment} className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-200">
                            <div className="flex justify-center mb-3"><StarRating rating={newComment.rating} setRating={(v) => setNewComment({...newComment, rating: v})} hoverRating={hoverRating} setHoverRating={setHoverRating}/></div>
                            <input type="text" placeholder="Adınız" className="w-full p-2 mb-2 border rounded" value={newComment.username} onChange={e=>setNewComment({...newComment, username: e.target.value})}/>
                            <textarea placeholder="Yorumunuz..." className="w-full p-2 mb-2 border rounded" rows="2" value={newComment.text} onChange={e=>setNewComment({...newComment, text: e.target.value})}></textarea>
                            <button className="w-full bg-red-600 text-white py-2 rounded font-bold text-sm">Gönder</button>
                        </form>
                    )}

                    <div className="space-y-4 max-h-60 overflow-y-auto">
                        {comments.length===0 ? <p className="text-gray-400 text-sm text-center">Henüz yorum yok.</p> : comments.map(c => (
                            <div key={c.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                                <div className="flex justify-between font-bold text-gray-800">
                                    <span>{c.username}</span>
                                    <span className="text-yellow-500 flex items-center gap-1"><FaStar/> {c.rating}</span>
                                </div>
                                <p className="text-gray-600 mt-1">{c.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}