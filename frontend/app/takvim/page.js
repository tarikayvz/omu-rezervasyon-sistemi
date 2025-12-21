'use client';

// API Yolu Düzeltilmiş Hali
import API_URL from '../../utils/api';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Header from '../../components/Header';
import { format, isPast, isFuture, isToday } from 'date-fns';
import { tr } from 'date-fns/locale';
import { FaClock, FaHistory, FaTimes, FaStar, FaCommentDots, FaChevronUp, FaUser, FaReplyAll } from 'react-icons/fa';
import { toast } from 'react-toastify';

// --- ÖZEL YILDIZ BİLEŞENİ ---
const StarRating = ({ rating, setRating, hoverRating, setHoverRating }) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={index} className="cursor-pointer">
            <input 
              type="radio" 
              name="rating" 
              value={ratingValue} 
              onClick={() => setRating(ratingValue)}
              className="hidden"
            />
            <FaStar 
              className="transition-colors duration-200" 
              size={24} 
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

function TakvimContent() {
  const searchParams = useSearchParams();
  const salonParam = searchParams.get('salon');

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHall, setSelectedHall] = useState(salonParam || 'tumu');
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ username: '', text: '', rating: 0 });
  const [hoverRating, setHoverRating] = useState(0);
  const [commentLoading, setCommentLoading] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);

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

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.username || !newComment.text || newComment.rating === 0) {
        return toast.warning('Lütfen adınızı, yorumunuzu ve puanınızı girin.');
    }
    
    setCommentLoading(true);
    try {
      await axios.post(`${API_URL}/comments`, {
        ...newComment,
        eventId: selectedEvent.id
      });
      
      fetchComments(selectedEvent.id);
      setNewComment({ username: '', text: '', rating: 0 });
      setHoverRating(0);
      toast.success('Yorumunuz başarıyla gönderildi! 🎉');
    } catch (error) { 
        toast.error('Yorum gönderilirken bir hata oluştu.');
    } 
    finally { setCommentLoading(false); }
  };

  const openModal = (event) => { 
      setSelectedEvent(event); 
      fetchComments(event.id); 
      setShowCommentForm(false); 
      document.body.style.overflow = 'hidden'; 
  };
  const closeModal = () => { setSelectedEvent(null); document.body.style.overflow = 'unset'; };

  const hallFilteredEvents = events.filter(event => selectedHall === 'tumu' ? true : event.hall.includes(selectedHall));
  const upcomingEvents = hallFilteredEvents.filter(event => isFuture(new Date(event.endDate)) || isToday(new Date(event.endDate)));
  const pastEvents = hallFilteredEvents.filter(event => isPast(new Date(event.endDate)) && !isToday(new Date(event.endDate)));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filtreler */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        {['tumu', 'mavi', 'pembe', 'konferans'].map(hall => (
            <button key={hall} onClick={() => setSelectedHall(hall)} className={`px-6 py-2 rounded-full font-bold transition capitalize ${selectedHall === hall ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'}`}>{hall} Salon</button>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-omu-dark mb-6 border-l-4 border-omu-red pl-4">Güncel Takvim</h2>
      
      {loading ? <p className="text-center text-gray-500">Yükleniyor...</p> : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
            {upcomingEvents.length === 0 ? <p className="text-gray-500 col-span-3 text-center">Planlanmış etkinlik yok.</p> : 
             upcomingEvents.map(event => <EventCard key={event.id} event={event} onClick={() => openModal(event)} />)}
        </div>
      )}

      {pastEvents.length > 0 && (
        <div className="mt-12 pt-10 border-t-2 border-dashed border-gray-300">
            <h2 className="text-xl font-bold text-gray-500 mb-6 flex items-center gap-2"><FaHistory /> Geçmiş Etkinlikler</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 opacity-75 grayscale hover:grayscale-0 transition duration-500">
                {pastEvents.map(event => <EventCard key={event.id} event={event} onClick={() => openModal(event)} />)}
            </div>
        </div>
      )}

      {/* --- MODAL --- */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
             <div className="bg-gray-900 text-white p-6 flex justify-between items-center sticky top-0 z-10">
                <div>
                    <h2 className="text-xl font-bold leading-tight">{selectedEvent.title}</h2>
                    <p className="text-sm text-gray-300 mt-1 flex items-center gap-2"><FaClock size={14}/> {format(new Date(selectedEvent.startDate), 'd MMMM yyyy', { locale: tr })}</p>
                </div>
                <button onClick={closeModal} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition"><FaTimes size={20} /></button>
             </div>
             
             <div className="p-6 md:p-8">
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-2 ls-wider">Etkinlik Detayı</h3>
                    <p className="text-gray-700 text-lg leading-relaxed">{selectedEvent.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-100 text-sm mb-8">
                    <div>
                        <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Başlangıç</span>
                        <span className="font-bold text-gray-800 text-base">{format(new Date(selectedEvent.startDate), 'HH:mm')}</span>
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Bitiş</span>
                        <span className="font-bold text-gray-800 text-base">{format(new Date(selectedEvent.endDate), 'HH:mm')}</span>
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Düzenleyen</span>
                        <span className="font-semibold text-gray-800">{selectedEvent.organizer}</span>
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Bölüm</span>
                        <span className="font-semibold text-gray-800">{selectedEvent.department}</span>
                    </div>
                </div>

                {isPast(new Date(selectedEvent.endDate)) && (
                    <div className="border-t border-gray-100 pt-8">
                        
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                <FaCommentDots className="text-omu-red"/> 
                                Değerlendirmeler 
                                <span className="text-sm font-normal text-gray-500">({comments.length})</span>
                            </h3>
                            <button 
                                onClick={() => setShowCommentForm(!showCommentForm)} 
                                className="text-sm bg-gray-900 text-white px-5 py-2.5 rounded-full font-bold hover:bg-gray-800 transition flex items-center gap-2 shadow-sm"
                            >
                                {showCommentForm ? <><FaChevronUp/> Vazgeç</> : <><FaStar className="text-yellow-400"/> Değerlendir</>}
                            </button>
                        </div>
                        
                        {showCommentForm && (
                            <form onSubmit={submitComment} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 animate-fadeIn shadow-sm">
                                <h4 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wider text-center">Puanınız</h4>
                                <div className="mb-6 flex justify-center">
                                    <StarRating rating={newComment.rating} setRating={(val) => setNewComment({...newComment, rating: val})} hoverRating={hoverRating} setHoverRating={setHoverRating}/>
                                </div>
                                <div className="space-y-4">
                                    <input type="text" placeholder="Adınız Soyadınız" className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-omu-red/20 focus:border-omu-red outline-none transition" value={newComment.username} onChange={e => setNewComment({...newComment, username: e.target.value})}/>
                                    <textarea placeholder="Bu etkinlik nasıldı?" className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-omu-red/20 focus:border-omu-red outline-none transition resize-none" rows="3" value={newComment.text} onChange={e => setNewComment({...newComment, text: e.target.value})}></textarea>
                                    <button type="submit" disabled={commentLoading} className="w-full bg-omu-red text-white py-3 rounded-lg font-bold hover:bg-red-700 transition flex justify-center items-center gap-2 shadow-md active:scale-[0.99]">{commentLoading ? 'Gönderiliyor...' : 'Yorumu Gönder'}</button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {comments.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                                    <FaCommentDots className="mx-auto text-gray-300 text-4xl mb-3" />
                                    <p className="text-gray-500 font-medium">Henüz bir değerlendirme yapılmamış.</p>
                                    <p className="text-sm text-gray-400">İlk yorumu siz yapın!</p>
                                </div>
                            ) : comments.map(comment => (
                                <div key={comment.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition hover:shadow-md">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 border border-gray-200 shadow-sm">
                                                <FaUser size={16} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 leading-tight">{comment.username}</h4>
                                                <span className="text-xs font-medium text-gray-500">
                                                    {format(new Date(comment.createdAt), 'd MMMM yyyy', { locale: tr })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex text-yellow-400 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
                                            {[...Array(5)].map((_, i) => <FaStar key={i} size={14} color={i < comment.rating ? "#f59e0b" : "#e5e7eb"} />)}
                                        </div>
                                    </div>
                                    <div className="pl-14">
                                        <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                                    </div>
                                    {comment.reply && (
                                        <div className="mt-4 pl-14">
                                            <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 relative">
                                                <FaReplyAll className="absolute top-4 left-[-12px] text-omu-red bg-white rounded-full p-1 shadow-sm border border-red-100 text-xl" />
                                                <h5 className="text-xs font-bold text-omu-red uppercase tracking-wider mb-2">Yönetici Yanıtı</h5>
                                                {/* BURASI DÜZELTİLDİ: Tırnak işaretleri escaped edildi */}
                                                <p className="text-gray-800 italic text-sm leading-relaxed">&quot;{comment.reply}&quot;</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({ event, onClick }) {
    return (
        <div onClick={onClick} className="bg-white p-5 rounded-xl shadow-md border-t-4 border-omu-blue cursor-pointer hover:shadow-xl hover:-translate-y-1 transition duration-300 group">
            <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-omu-blue transition">{event.title}</h3>
            <div className="flex justify-between items-end">
                <p className="text-sm text-gray-500 flex items-center gap-1"><FaClock /> {format(new Date(event.startDate), 'd MMM HH:mm', { locale: tr })}</p>
                <span className={`text-xs px-2 py-1 rounded text-white font-bold shadow-sm ${event.hall.includes('mavi') ? 'bg-blue-600' : event.hall.includes('pembe') ? 'bg-pink-500' : 'bg-orange-600'}`}>{event.hall.toUpperCase()}</span>
            </div>
        </div>
    )
}

export default function TakvimPage() {
  return (
    <div className="min-h-screen bg-omu-gray flex flex-col font-sans">
      <Header />
      <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-500 font-bold">Yükleniyor...</div>}><TakvimContent /></Suspense>
    </div>
  );
}