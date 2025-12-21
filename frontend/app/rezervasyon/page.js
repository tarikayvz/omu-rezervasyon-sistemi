'use client';

import API_URL from '../../utils/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import { FaUser, FaBuilding, FaPhone, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function RezervasyonPage() {
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    title: '', department: '', organizer: '', email: '', phone: '',
    hall: 'mavi', startDate: '', endDate: '', startTime: '', endTime: '', description: ''
  });
  const [status, setStatus] = useState(null);

  // --- ÇOKLU GÜN İÇİN GÜNCELLENDİ ---
  useEffect(() => {
    // URL'den gelen parametreleri oku
    const urlStartDate = searchParams.get('startDate');
    const urlStartTime = searchParams.get('startTime');
    const urlEndDate = searchParams.get('endDate');
    const urlEndTime = searchParams.get('endTime');
    const urlHall = searchParams.get('hall');

    // Eğer URL'den veri geldiyse formu doldur
    if (urlStartDate && urlStartTime && urlHall) {
        setFormData(prev => ({
            ...prev,
            // Eğer endDate gelmediyse (eski linkler için), startDate ile aynı yap
            startDate: urlStartDate,
            endDate: urlEndDate || urlStartDate, 
            startTime: urlStartTime,
            endTime: urlEndTime || '17:00', // Varsayılan bitiş yoksa
            hall: urlHall
        }));
        
        if(urlEndDate && urlStartDate !== urlEndDate) {
            toast.info(`Çoklu gün seçildi: ${urlStartDate} -> ${urlEndDate}`, { position: "top-center" });
        } else {
            toast.info(`Tarih ve Salon seçildi: ${urlHall.toUpperCase()}`, { position: "top-center" });
        }
    }
  }, [searchParams]);
  // -----------------------------------

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    const now = new Date(); 

    if (startDateTime < now) {
        return toast.warning('Geçmiş bir zamana rezervasyon yapamazsınız! ⏳');
    }

    if (endDateTime <= startDateTime) {
        return toast.warning("Bitiş tarihi/saati başlangıçtan sonra olmalıdır!");
    }
    
    setStatus('loading');

    try {
      await axios.post(`${API_URL}/events`, {
        ...formData, startDate: startDateTime, endDate: endDateTime
      });
      setStatus('success');
      toast.success('Rezervasyon talebiniz başarıyla alındı! 🎉');
      setFormData({ title: '', department: '', organizer: '', email: '', phone: '', hall: 'mavi', startDate: '', endDate: '', startTime: '', endTime: '', description: '' });
    } catch (error) {
      console.error(error);
      if (error.response?.status === 409) toast.warning('Seçilen tarih aralığında salon dolu! ⚠️');
      else if (error.response?.status === 400) toast.error(error.response.data.message); 
      else toast.error('Bir hata oluştu.');
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          
          <div className="bg-gray-900 text-white p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-omu-red/10"></div>
            <h2 className="text-3xl font-extrabold mb-2 relative z-10">Salon Rezervasyon Formu</h2>
            <p className="text-gray-400 relative z-10">Lütfen bilgileri eksiksiz doldurunuz.</p>
          </div>

          <div className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Bölüm 1: Kişisel Bilgiler */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
                    <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span> 
                    Organizasyon Bilgileri
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <InputField label="Ad Soyad" name="organizer" icon={<FaUser/>} value={formData.organizer} onChange={handleChange} placeholder="Örn: Ahmet Yılmaz" />
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Bölüm</label>
                        <div className="relative">
                            <FaBuilding className="absolute left-4 top-4 text-gray-400" />
                            <select required name="department" value={formData.department} onChange={handleChange} className="w-full pl-12 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-omu-red/50 focus:border-omu-red outline-none transition appearance-none">
                                <option value="">Seçiniz</option>
                                <option value="Bilgisayar Müh.">Bilgisayar Mühendisliği</option>
                                <option value="Elektrik-Elektronik Müh.">Elektrik-Elektronik Müh.</option>
                                <option value="Endüstri Müh.">Endüstri Mühendisliği</option>
                                <option value="İnşaat Müh.">İnşaat Mühendisliği</option>
                            </select>
                        </div>
                    </div>
                    <InputField label="E-posta" name="email" type="email" icon={<FaEnvelope/>} value={formData.email} onChange={handleChange} placeholder="ornek@omu.edu.tr" />
                    <InputField label="Telefon" name="phone" type="tel" icon={<FaPhone/>} value={formData.phone} onChange={handleChange} placeholder="0555 555 55 55" />
                </div>
              </div>

              {/* Bölüm 2: Etkinlik Detayları */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
                    <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span> 
                    Etkinlik Detayları
                </h3>
                
                <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Salon Seçimi</label>
                    <div className="grid grid-cols-3 gap-4">
                        {['mavi', 'pembe', 'konferans'].map((hall) => (
                            <label key={hall} className={`cursor-pointer p-4 rounded-xl border-2 text-center transition flex flex-col items-center gap-2 font-bold capitalize
                                ${formData.hall === hall ? 'border-omu-red bg-red-50 text-omu-red' : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'}`}>
                                <input type="radio" name="hall" value={hall} checked={formData.hall === hall} onChange={handleChange} className="hidden" />
                                {hall} Salon
                            </label>
                        ))}
                    </div>
                </div>

                <InputField label="Etkinlik Başlığı" name="title" value={formData.title} onChange={handleChange} placeholder="Örn: Yapay Zeka Semineri" />
                
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Başlangıç</label>
                        <div className="flex gap-2">
                            <input required name="startDate" value={formData.startDate} onChange={handleChange} type="date" className="w-full p-2 rounded-lg border border-gray-300 focus:border-omu-red outline-none" />
                            <input required name="startTime" value={formData.startTime} onChange={handleChange} type="time" className="w-full p-2 rounded-lg border border-gray-300 focus:border-omu-red outline-none" />
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bitiş</label>
                        <div className="flex gap-2">
                            <input required name="endDate" value={formData.endDate} onChange={handleChange} type="date" className="w-full p-2 rounded-lg border border-gray-300 focus:border-omu-red outline-none" />
                            <input required name="endTime" value={formData.endTime} onChange={handleChange} type="time" className="w-full p-2 rounded-lg border border-gray-300 focus:border-omu-red outline-none" />
                        </div>
                    </div>
                </div>

                <div className="mt-6 space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Açıklama</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-omu-red/50 focus:border-omu-red outline-none transition" placeholder="Etkinlik hakkında detaylı bilgi..."></textarea>
                </div>
              </div>

              <button type="submit" disabled={status === 'loading'} className="w-full bg-omu-red text-white font-bold py-4 rounded-xl hover:bg-red-700 transition duration-300 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1">
                {status === 'loading' ? 'İşleniyor...' : 'Rezervasyon Talebi Oluştur'}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, icon, ...props }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
            <div className="relative">
                {icon && <div className="absolute left-4 top-4 text-gray-400">{icon}</div>}
                <input required {...props} className={`w-full ${icon ? 'pl-12' : 'pl-4'} p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-omu-red/50 focus:border-omu-red outline-none transition`} />
            </div>
        </div>
    );
}