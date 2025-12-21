'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import API_URL from '../../utils/api';
import { startOfWeek, addDays, format, addWeeks, subWeeks, isSameDay, parseISO, setHours, setMinutes, isBefore, isAfter } from 'date-fns';
import { tr } from 'date-fns/locale';
import { FaChevronLeft, FaChevronRight, FaCircle, FaCheck, FaTimes, FaCalendarCheck, FaClock, FaUser, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function MusaitlikPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedHall, setSelectedHall] = useState('mavi'); 
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selection, setSelection] = useState(null); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [viewEvent, setViewEvent] = useState(null); 

  const [formLoading, setFormLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', department: '', organizer: '', email: '', phone: '', description: ''
  });

  const timeSlots = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); 
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  useEffect(() => {
    fetchEvents();
    setSelection(null); 
  }, [currentDate, selectedHall]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/events`);
      // Tüm etkinlikleri çekiyoruz (Onaylı/Onaysız hepsi)
      const filtered = res.data.filter(e => e.hall.toLowerCase() === selectedHall.toLowerCase());
      setEvents(filtered);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const getSlotStatus = (day, hour) => {
    const slotStart = setHours(setMinutes(day, 0), hour);
    const slotEnd = setHours(setMinutes(day, 0), hour + 1);

    // SADECE ONAYLI OLANLARI 'FULL' OLARAK İŞARETLE
    const approvedEvent = events.find(e => {
      // Eğer onaylanmamışsa görmezden gel (yani boş say)
      if (!e.isApproved) return false;

      const eStart = parseISO(e.startDate);
      const eEnd = parseISO(e.endDate);
      return (eStart < slotEnd && eEnd > slotStart);
    });

    if (approvedEvent) return { status: 'full', event: approvedEvent };
    
    if (slotStart < new Date()) return { status: 'past', event: null };
    
    // Onay bekleyenler de 'empty' (seçilebilir) döner
    return { status: 'empty', event: null };
  };

  const handleSlotClick = (day, hour, status, event) => {
    
    // Sadece ONAYLI (Kırmızı) olanlara tıklayınca detay göster
    if (status === 'full' && event) {
        setViewEvent(event);
        return;
    }

    if (status === 'past') return;

    if (!selection) {
        setSelection({ day, hour });
        toast.info('Şimdi bitiş saatini seçiniz 👇', { autoClose: 2000, theme: "dark" });
        return;
    }

    let startDateTime = setHours(setMinutes(selection.day, 0), selection.hour);
    let endDateTime = setHours(setMinutes(day, 0), hour + 1);

    if (isBefore(endDateTime, startDateTime)) {
       startDateTime = setHours(setMinutes(day, 0), hour); 
       endDateTime = setHours(setMinutes(selection.day, 0), selection.hour + 1); 
    }

    // ÇAKIŞMA KONTROLÜ: Sadece ONAYLI etkinliklerle çakışıyor mu?
    const hasConflict = events.some(e => {
        if (!e.isApproved) return false; // Onaysızları atla

        const eStart = parseISO(e.startDate);
        const eEnd = parseISO(e.endDate);
        return (isBefore(eStart, endDateTime) && isAfter(eEnd, startDateTime));
    });

    if (hasConflict) {
        toast.error('Seçilen aralıkta ONAYLI bir etkinlik var!');
        setSelection(null);
        return;
    }

    setModalData({ start: startDateTime, end: endDateTime });
    setIsModalOpen(true);
    setSelection(null); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      await axios.post(`${API_URL}/events`, {
        ...formData,
        hall: selectedHall,
        startDate: modalData.start,
        endDate: modalData.end
      });
      
      toast.success('Rezervasyon talebiniz alındı! Yönetici onayı bekleniyor.');
      setIsModalOpen(false);
      setFormData({ title: '', department: '', organizer: '', email: '', phone: '', description: '' });
      fetchEvents(); 
    } catch (error) {
      console.error(error);
      toast.error('Bir hata oluştu.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const halls = [
      { id: 'mavi', name: 'Mavi Salon', color: 'from-blue-600 to-blue-800' },
      { id: 'pembe', name: 'Pembe Salon', color: 'from-pink-600 to-pink-800' },
      { id: 'konferans', name: 'Konferans', color: 'from-orange-600 to-orange-800' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        
        {/* ÜST PANEL */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6 mb-8 relative overflow-hidden">
            <div className="relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Rezervasyon Takvimi</h1>
                    <p className="text-gray-500 mt-2">Müsait saatleri seçip talep oluşturabilirsiniz.</p>
                </div>

                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    {halls.map(hall => (
                        <button 
                            key={hall.id}
                            onClick={() => setSelectedHall(hall.id)}
                            className={`group relative px-8 py-4 rounded-2xl font-bold transition-all duration-300 overflow-hidden shadow-md hover:shadow-lg hover:-translate-y-1
                            ${selectedHall === hall.id 
                                ? `bg-gradient-to-r ${hall.color} text-white ring-4 ring-white` 
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <FaMapMarkerAlt /> {hall.name}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex justify-between items-center bg-gray-50/80 backdrop-blur p-2 rounded-2xl border border-gray-200 max-w-xl mx-auto">
                    <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="p-4 bg-white rounded-xl shadow-sm text-gray-600 hover:text-omu-red hover:bg-red-50 transition"><FaChevronLeft /></button>
                    <div className="text-center px-4">
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">HAFTA</span>
                        <span className="text-lg font-extrabold text-gray-800">
                            {format(weekDays[0], 'd MMM', { locale: tr })} — {format(weekDays[6], 'd MMM yyyy', { locale: tr })}
                        </span>
                    </div>
                    <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="p-4 bg-white rounded-xl shadow-sm text-gray-600 hover:text-omu-red hover:bg-red-50 transition"><FaChevronRight /></button>
                </div>
                
                {/* Renk Açıklamaları (SADELEŞTİRİLDİ) */}
                <div className="flex justify-center gap-4 mt-6 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <div className="flex items-center gap-2"><FaCircle className="text-green-500"/> Müsait (Talep Edilebilir)</div>
                    <div className="flex items-center gap-2"><FaCircle className="text-red-500"/> Dolu (Onaylanmış)</div>
                </div>
            </div>
        </div>

        {/* TAKVİM GRİD */}
        <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-gray-100 overflow-x-auto custom-scrollbar">
            <div className="min-w-[900px]">
                {/* Gün Başlıkları */}
                <div className="grid grid-cols-8 gap-4 mb-4">
                    <div className="flex items-end justify-center pb-2 text-gray-400 font-bold text-xs">SAAT</div>
                    {weekDays.map((day, i) => {
                        const isTodayDay = isSameDay(day, new Date());
                        return (
                            <div key={i} className={`text-center p-3 rounded-2xl transition ${isTodayDay ? 'bg-red-50 ring-2 ring-red-100' : ''}`}>
                                <div className={`text-xs font-bold uppercase mb-1 ${isTodayDay ? 'text-omu-red' : 'text-gray-400'}`}>
                                    {format(day, 'EEEE', { locale: tr })}
                                </div>
                                <div className={`text-2xl font-extrabold ${isTodayDay ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Saat Dilimleri */}
                <div className="space-y-3">
                    {timeSlots.map(hour => (
                        <div key={hour} className="grid grid-cols-8 gap-4 items-center">
                            <div className="text-center font-bold text-gray-400 text-sm bg-gray-50 rounded-xl py-4 border border-gray-100">
                                {hour.toString().padStart(2, '0')}:00
                            </div>

                            {weekDays.map((day, i) => {
                                const { status, event } = getSlotStatus(day, hour);
                                const isSelectionStart = selection && isSameDay(selection.day, day) && selection.hour === hour;

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleSlotClick(day, hour, status, event)}
                                        disabled={status === 'past'}
                                        className={`relative h-14 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-200 border-2
                                            ${
                                                isSelectionStart 
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105 z-10' 
                                                : status === 'empty' 
                                                    ? 'bg-white border-green-100 text-green-600 hover:border-green-400 hover:bg-green-50 hover:shadow-md hover:scale-105 active:scale-95' 
                                                    : status === 'full'
                                                        ? 'bg-red-50 border-red-200 text-red-400 hover:bg-red-100 hover:scale-105 cursor-pointer' // Dolu
                                                        : 'bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed opacity-60' 
                                            }`}
                                    >
                                        {isSelectionStart ? <FaCheck className="animate-bounce" /> : 
                                         status === 'empty' ? <span className="opacity-0 hover:opacity-100 text-xs">Seç</span> : 
                                         status === 'full' ? <FaInfoCircle size={14} /> : 
                                         <FaCircle size={6} />}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* --- 1. REZERVASYON MODALI --- */}
        {isModalOpen && modalData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn" onClick={e => e.stopPropagation()}>
                    <div className="bg-gray-900 text-white p-8 flex justify-between items-start">
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold flex items-center gap-3"><FaCalendarCheck className="text-green-400"/> Rezervasyon Talebi</h2>
                            <p className="text-gray-400 text-sm mt-2">Bilgileri doldurun.</p>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition z-10"><FaTimes /></button>
                    </div>
                    <div className="p-8">
                        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-8 flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-sm border border-blue-100 text-xl"><FaClock /></div>
                                <div>
                                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">BAŞLANGIÇ</p>
                                    <p className="font-bold text-gray-800 text-lg">{format(modalData.start, 'd MMM, HH:mm', { locale: tr })}</p>
                                </div>
                            </div>
                            <div className="hidden md:block w-px h-12 bg-blue-200"></div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">BİTİŞ</p>
                                    <p className="font-bold text-gray-800 text-lg">{format(modalData.end, 'd MMM, HH:mm', { locale: tr })}</p>
                                </div>
                                <div className="w-12 h-12 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-sm border border-blue-100 text-xl"><FaClock /></div>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid md:grid-cols-2 gap-5">
                                <InputField label="Ad Soyad" name="organizer" icon={<FaUser/>} value={formData.organizer} onChange={handleInputChange} placeholder="Örn: Ahmet Yılmaz" />
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Bölüm</label>
                                    <div className="relative">
                                        <FaBuilding className="absolute left-4 top-4 text-gray-400" />
                                        <select required name="department" value={formData.department} onChange={handleInputChange} className="w-full pl-12 p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none font-medium text-gray-700">
                                            <option value="">Seçiniz</option>
                                            <option value="Bilgisayar Müh.">Bilgisayar Mühendisliği</option>
                                            <option value="Elektrik-Elektronik Müh.">Elektrik-Elektronik Müh.</option>
                                            <option value="Endüstri Müh.">Endüstri Mühendisliği</option>
                                            <option value="İnşaat Müh.">İnşaat Mühendisliği</option>
                                        </select>
                                    </div>
                                </div>
                                <InputField label="E-posta" name="email" type="email" icon={<FaEnvelope/>} value={formData.email} onChange={handleInputChange} placeholder="ornek@omu.edu.tr" />
                                <InputField label="Telefon" name="phone" type="tel" icon={<FaPhone/>} value={formData.phone} onChange={handleInputChange} placeholder="0555 555 55 55" />
                            </div>
                            <InputField label="Etkinlik Başlığı" name="title" value={formData.title} onChange={handleInputChange} placeholder="Örn: Yapay Zeka Semineri" />
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Açıklama</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none font-medium text-gray-700" placeholder="Etkinlik hakkında detaylı bilgi..."></textarea>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/3 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition">İptal</button>
                                <button type="submit" disabled={formLoading} className="w-2/3 py-4 bg-gradient-to-r from-omu-red to-red-700 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition transform flex justify-center items-center gap-2">
                                    {formLoading ? 'Gönderiliyor...' : <><FaCheck /> Talebi Gönder</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}

        {/* --- 2. DETAY MODALI --- */}
        {viewEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm" onClick={() => setViewEvent(null)}>
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn relative" onClick={e => e.stopPropagation()}>
                    
                    <button onClick={() => setViewEvent(null)} className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition z-10 text-gray-600"><FaTimes /></button>

                    <div className="p-8 pb-4">
                        <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-red-100">
                            <FaCircle size={8} /> Dolu / Rezerve
                        </div>
                        
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 leading-tight">{viewEvent.title}</h2>
                        <p className="text-gray-500 text-sm font-medium">{viewEvent.department}</p>
                    </div>

                    <div className="px-8 py-2">
                        <div className="grid gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-400 shadow-sm"><FaUser size={12}/></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">DÜZENLEYEN</p>
                                    <p className="text-sm font-bold text-gray-800">{viewEvent.organizer}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-400 shadow-sm"><FaCalendarAlt size={12}/></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">TARİH</p>
                                    <p className="text-sm font-bold text-gray-800">
                                        {format(parseISO(viewEvent.startDate), 'd MMMM yyyy', { locale: tr })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-400 shadow-sm"><FaClock size={12}/></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">SAAT</p>
                                    <p className="text-sm font-bold text-gray-800">
                                        {format(parseISO(viewEvent.startDate), 'HH:mm')} - {format(parseISO(viewEvent.endDate), 'HH:mm')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {viewEvent.description && (
                        <div className="p-8 pt-4">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">AÇIKLAMA</p>
                            <p className="text-gray-600 text-sm leading-relaxed">{viewEvent.description}</p>
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>
    </div>
  );
}

function InputField({ label, icon, ...props }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase">{label}</label>
            <div className="relative group">
                {icon && <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-500 transition">{icon}</div>}
                <input required {...props} className={`w-full ${icon ? 'pl-12' : 'pl-4'} p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-medium text-gray-700 placeholder-gray-400`} />
            </div>
        </div>
    );
}