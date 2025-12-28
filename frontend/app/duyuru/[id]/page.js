'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import { 
  FaCalendarAlt, 
  FaArrowLeft, 
  FaShareAlt, 
  FaClock, 
  FaChevronLeft, 
  FaChevronRight 
} from 'react-icons/fa';
import API_URL from '../../../utils/api';

const BASE_URL = API_URL.replace('/api', '');

const getImageUrl = (imgData) => {
    if (!imgData) return null; // Resim yoksa null dönelim ki CSS gradient kullansın
    if (imgData.startsWith('data:') || imgData.startsWith('http')) {
        return imgData;
    }
    return `${BASE_URL}${imgData}`;
};

export default function DuyuruDetayPage() {
  const { id } = useParams();
  const router = useRouter();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await axios.get(`${API_URL}/announcements/${id}`);
        setAnnouncement(res.data);
        setLoading(false);
      } catch (error) { console.error(error); setLoading(false); }
    };
    if (id) fetchAnnouncement();
  }, [id]);

  const nextImage = () => {
    if (!announcement?.images) return;
    setCurrentImageIndex((prev) => (prev === announcement.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    if (!announcement?.images) return;
    setCurrentImageIndex((prev) => (prev === 0 ? announcement.images.length - 1 : prev - 1));
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-600"></div>
    </div>
  );

  if (!announcement) return <div className="min-h-screen flex items-center justify-center">İçerik bulunamadı.</div>;

  // --- ARKA PLAN RESMİNİ BELİRLEME ---
  // Duyurunun ilk resmi varsa onu arka plan yap, yoksa null
  const bgImage = announcement.images && announcement.images.length > 0 
                  ? getImageUrl(announcement.images[0]) 
                  : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-red-100 selection:text-red-900">
      <Header />
      
      {/* --- DINAMIK BULANIK HERO ALANI --- */}
      <div className="relative h-[400px] w-full overflow-hidden">
         
         {bgImage ? (
            // DURUM 1: Resim Varsa (Bulanık Efekt)
            <>
                {/* Arka Plan Resmi */}
                <div 
                    className="absolute inset-0 bg-cover bg-center blur-xl scale-110" // scale-110: blur kenarlarını gizlemek için büyütür
                    style={{ backgroundImage: `url('${bgImage}')` }}
                ></div>
                {/* Karartma Katmanı (Yazıların okunması için) */}
                <div className="absolute inset-0 bg-black/50"></div>
            </>
         ) : (
            // DURUM 2: Resim Yoksa (Standart Kırmızı Gradient)
            <div className="absolute inset-0 bg-gradient-to-r from-red-900 via-red-800 to-red-900">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </div>
         )}

         {/* Alt kısımdan beyaza yumuşak geçiş */}
         <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>

      {/* --- ANA İÇERİK KARTI --- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative -mt-52 pb-20">
        
        <button 
            onClick={() => router.back()} 
            className="mb-6 flex items-center gap-2 text-white hover:text-red-100 transition-colors group bg-black/20 backdrop-blur-md px-4 py-2 rounded-full w-fit border border-white/10"
        >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform"/>
            <span className="font-medium text-sm">Geri Dön</span>
        </button>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            
            {/* Kart Başlığı */}
            <div className="p-8 md:p-12 border-b border-gray-100">
                <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-red-600 mb-6 uppercase tracking-wider">
                    <span className="bg-red-50 px-3 py-1 rounded-md border border-red-100 flex items-center gap-2">
                        <FaCalendarAlt />
                        {new Date(announcement.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-gray-400 flex items-center gap-2 normal-case font-medium">
                        <FaClock /> Duyuru
                    </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-[1.2] tracking-tight">
                    {announcement.title}
                </h1>
            </div>

            <div className="p-8 md:p-12">
                
                {/* GALERİ SLIDER (Aynı Kalıyor) */}
                {announcement.images && announcement.images.length > 0 && (
                     <div className="mb-12 relative group rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner h-[350px] md:h-[550px]">
                        <div className="w-full h-full flex items-center justify-center bg-gray-50/50 backdrop-blur-sm">
                            <img 
                                src={getImageUrl(announcement.images[currentImageIndex])} 
                                alt={`Slide-${currentImageIndex}`} 
                                className="w-full h-full object-contain" 
                            />
                        </div>

                        {announcement.images.length > 1 && (
                            <>
                                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10">
                                    <FaChevronLeft size={20} />
                                </button>
                                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10">
                                    <FaChevronRight size={20} />
                                </button>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                    {announcement.images.map((_, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`w-2.5 h-2.5 rounded-full transition-all shadow-sm ${idx === currentImageIndex ? 'bg-red-600 scale-125 w-4' : 'bg-gray-300 hover:bg-white'}`}
                                        />
                                    ))}
                                </div>
                                <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md z-10">
                                    {currentImageIndex + 1} / {announcement.images.length}
                                </div>
                            </>
                        )}
                     </div>
                )}

                {/* İçerik Metni */}
                <div className="prose prose-lg md:prose-xl max-w-none text-gray-700 leading-relaxed">
                    <p className="whitespace-pre-wrap">{announcement.description}</p>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">OMÜ</div>
                    <div className="text-sm">
                        <p className="font-bold text-gray-900">Mühendislik Fakültesi</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 text-gray-700 transition shadow-sm font-medium">
                    <FaShareAlt className="text-red-500"/> Paylaş
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}