'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../utils/api';
import { FaCalendarAlt, FaClock, FaUser, FaCheckCircle, FaBuilding, FaAlignLeft, FaHourglassHalf } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { format, addHours, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

// Müsait Saat Başlangıçları
const startTimes = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
const durations = [1, 2, 3, 4, 5]; // Saat cinsinden süreler

export default function ReservationWizard() {
  const router = useRouter();
  
  // --- FORM STATE ---
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    organizer: '', // Kullanıcı adı vs.
    hall: 'mavi',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    duration: 1
  });

  // Hesaplanan Bitiş Saati
  const getEndTime = () => {
    if (!formData.startTime) return '--:--';
    const [hours, minutes] = formData.startTime.split(':').map(Number);
    const endHour = hours + formData.duration;
    return `${endHour < 10 ? '0'+endHour : endHour}:${minutes < 10 ? '0'+minutes : minutes}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.organizer || !formData.startTime) {
      return toast.warning("Lütfen tüm zorunlu alanları doldurun.");
    }

    setLoading(true);
    
    // Tarih ve Saati birleştirip ISO formatına çeviriyoruz
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = addHours(startDateTime, formData.duration);

    const payload = {
      title: formData.title,
      description: formData.description,
      organizer: formData.organizer,
      hall: formData.hall,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      isApproved: false // Onay bekliyor
    };

    try {
      await axios.post(`${API_URL}/events`, payload);
      toast.success("Rezervasyon talebiniz alındı! Onay bekleniyor.");
      router.push('/takvim'); // Başarılı olunca takvime at
    } catch (error) {
      console.error(error);
      toast.error("Bir hata oluştu. Lütfen saati kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* SOL TARAFTA: SİHİRBAZ ADIMLARI (Grid 8/12) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Adım Göstergesi (Stepper) */}
        <div className="flex items-center justify-between mb-8 px-4">
            {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${step >= s ? 'bg-[#E30613] text-white shadow-lg shadow-red-200' : 'bg-gray-200 text-gray-400'}`}>
                        {s}
                    </div>
                    <span className={`text-sm font-bold ${step >= s ? 'text-gray-800' : 'text-gray-400'}`}>
                        {s === 1 ? 'Detaylar' : s === 2 ? 'Zaman & Yer' : 'Onay'}
                    </span>
                    {s !== 3 && <div className="w-12 h-1 bg-gray-100 mx-2 rounded-full"></div>}
                </div>
            ))}
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 min-h-[500px] relative">
            
            {/* ADIM 1: TEMEL BİLGİLER */}
            {step === 1 && (
                <div className="animate-fadeIn">
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                        <FaAlignLeft className="text-blue-500"/> Etkinlik Detayları
                    </h2>
                    
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Etkinlik Başlığı <span className="text-red-500">*</span></label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Örn: Yapay Zeka Semineri" 
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-medium" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Düzenleyen Kişi / Kulüp <span className="text-red-500">*</span></label>
                            <input type="text" name="organizer" value={formData.organizer} onChange={handleChange} placeholder="Örn: Ahmet Yılmaz veya IEEE Kulübü" 
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-medium" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Açıklama</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Etkinlik hakkında kısa bilgi..." 
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-medium resize-none"></textarea>
                        </div>
                    </div>
                </div>
            )}

            {/* ADIM 2: ZAMAN VE MEKAN (Pro Görünüm) */}
            {step === 2 && (
                <div className="animate-fadeIn">
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                        <FaClock className="text-blue-500"/> Zaman ve Mekan
                    </h2>

                    {/* Salon Seçimi */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-3">Salon Seçimi</label>
                        <div className="grid grid-cols-3 gap-4">
                            {['mavi', 'pembe', 'konferans'].map((h) => (
                                <button key={h} onClick={() => setFormData({...formData, hall: h})}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 capitalize font-bold ${formData.hall === h ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-300'}`}>
                                    <FaBuilding size={20}/> {h} Salon
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Tarih */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tarih</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} 
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        
                        {/* Süre */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tahmini Süre</label>
                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                                {durations.map(d => (
                                    <button key={d} onClick={() => setFormData({...formData, duration: d})}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${formData.duration === d ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}>
                                        {d} Sa.
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SAAT SEÇİMİ (GRID YAPISI) */}
                    <div className="mt-6">
                        <label className="block text-sm font-bold text-gray-700 mb-3">Başlangıç Saati</label>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                            {startTimes.map((time) => (
                                <button key={time} onClick={() => setFormData({...formData, startTime: time})}
                                    className={`py-3 rounded-lg text-sm font-bold transition border ${formData.startTime === time ? 'bg-[#E30613] text-white border-[#E30613] shadow-lg transform scale-105' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                                    {time}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><FaHourglassHalf/> Bitiş saati otomatik hesaplanır: <strong>{getEndTime()}</strong></p>
                    </div>
                </div>
            )}

            {/* ADIM 3: ÖZET VE GÖNDER */}
            {step === 3 && (
                <div className="animate-fadeIn text-center py-10">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
                        <FaCheckCircle />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Her Şey Hazır!</h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        Rezervasyon bilgilerinizi sağ taraftaki karttan kontrol edip onaylayabilirsiniz.
                        Yönetici onayı sonrası takvimde görünecektir.
                    </p>
                </div>
            )}

            {/* BUTONLAR (ALTA SABİT) */}
            <div className="absolute bottom-8 left-8 right-8 flex justify-between">
                {step > 1 ? (
                    <button onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition">Geri</button>
                ) : <div></div>}

                {step < 3 ? (
                    <button onClick={() => setStep(step + 1)} className="px-8 py-3 rounded-xl font-bold text-white bg-gray-900 hover:bg-black transition shadow-lg">İleri</button>
                ) : (
                    <button onClick={handleSubmit} disabled={loading} className="px-10 py-3 rounded-xl font-bold text-white bg-[#E30613] hover:bg-red-700 transition shadow-lg shadow-red-500/30 flex items-center gap-2">
                        {loading ? 'İşleniyor...' : 'Rezervasyonu Tamamla'}
                    </button>
                )}
            </div>

        </div>
      </div>

      {/* SAĞ TARAFTA: CANLI BİLET ÖNİZLEMESİ (Grid 4/12) */}
      <div className="lg:col-span-4">
        <div className="sticky top-10">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Önizleme</h3>
            
            {/* BİLET KARTI TASARIMI */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 relative group">
                {/* Üst Kısım (Renkli) */}
                <div className={`h-32 p-6 flex flex-col justify-between relative overflow-hidden transition-colors duration-500 ${formData.hall === 'mavi' ? 'bg-blue-600' : formData.hall === 'pembe' ? 'bg-pink-500' : 'bg-orange-600'}`}>
                    <div className="relative z-10">
                        <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-white/10">
                            {formData.hall || '...'} Salon
                        </span>
                    </div>
                    <div className="relative z-10 text-white">
                        <p className="text-xs opacity-80 uppercase font-bold">Düzenleyen</p>
                        <p className="font-bold text-lg truncate">{formData.organizer || 'İsim Girilmedi'}</p>
                    </div>
                    {/* Arka Plan Deseni */}
                    <div className="absolute -right-4 -bottom-8 text-white/10 text-9xl transform rotate-12 pointer-events-none">
                        <FaBuilding />
                    </div>
                </div>

                {/* Bilet Gövdesi */}
                <div className="p-6 space-y-6 relative bg-white">
                    {/* Delik Efekti (Ticket Punch) */}
                    <div className="absolute -top-3 -left-3 w-6 h-6 bg-gray-50 rounded-full"></div>
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-gray-50 rounded-full"></div>

                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Etkinlik</p>
                        <h3 className="text-xl font-black text-gray-800 leading-tight">
                            {formData.title || 'Etkinlik Başlığı...'}
                        </h3>
                    </div>

                    <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-4">
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Tarih</p>
                            <div className="flex items-center gap-2 text-gray-800 font-bold">
                                <FaCalendarAlt className="text-[#E30613]" />
                                {formData.date ? format(parseISO(formData.date), 'd MMM yyyy', { locale: tr }) : '...'}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Saat</p>
                            <div className="flex items-center gap-2 text-gray-800 font-bold">
                                <FaClock className="text-[#E30613]" />
                                {formData.startTime || '--:--'} - {getEndTime()}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                        <p className="text-xs text-gray-400">Tahmini Süre</p>
                        <p className="text-sm font-bold text-gray-700">{formData.duration} Saat</p>
                    </div>
                </div>

                {/* Alt Kısım (Barkod Efekti) */}
                <div className="bg-gray-100 p-4 border-t border-dashed border-gray-300 flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                       <div className="h-1 w-24 bg-gray-300"></div>
                       <div className="h-1 w-20 bg-gray-300"></div>
                       <div className="h-1 w-24 bg-gray-300"></div>
                    </div>
                    <span className="text-xs font-bold text-gray-400">OMU-Ticket</span>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
}