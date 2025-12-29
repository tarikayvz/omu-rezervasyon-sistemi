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
  FaChevronRight,
  FaImages
} from 'react-icons/fa';
import API_URL from '../../../utils/api';

// Base URL
const BASE_URL = API_URL.replace('/api', '');

// --- AKILLI RESİM URL DÜZELTİCİ ---
const getImageUrl = (imgData) => {
    if (!imgData) return null;
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
  
  // --- GALERİ STATE ---
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

  // --- GALERİ FONKSİYONLARI ---
  const nextImage = () => {
    if (!announcement?.images) return;
    setCurrentImageIndex((prev) => (prev === announcement.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    if (!announcement?.images) return;
    setCurrentImageIndex((prev) => (prev === 0 ? announcement.images.length - 1 : prev - 1));
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-600"></div>
    </div>
  );

  if (!announcement) return <div className="min-h-screen flex items-center justify-center text-gray-500">İçerik bulunamadı.</div>;

  // Aktif resmi al
  const activeImage = announcement.images && announcement.images.length > 0 
                      ? getImageUrl(announcement.images[currentImageIndex]) 
                      : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-red-100 selection:text-red-900">
      <Header />
      
      {/* --- 1. HERO BACKGROUND (DİNAMİK BULANIK ARKA PLAN) --- */}
      <div className="relative h-[450px] w-full overflow-hidden">
         {/* Arka plan: Eğer resim varsa o resmin bulanık hali, yoksa kırmızı gradient */}
         {activeImage ? (
            <div className="absolute inset-0">
                <div 
                    className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 transition-all duration-700 ease-in-out"
                    style={{ backgroundImage: `url('${activeImage}')` }}
                ></div>
                <div className="absolute inset-0 bg-black/60"></div> {/* Karartma */}
            </div>
         ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-red-900 via-red-800 to-red-900">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            </div>
         )}
         
         <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>

      {/* --- 2. ANA İÇERİK KARTI --- */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-64 pb-20">
        
        {/* Geri Dön Butonu */}
        <button 
            onClick={() => router.back()} 
            className="mb-8 flex items-center gap-2 text-white hover:text-red-100 transition-colors group bg-black/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10"
        >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform"/>
            <span className="font-medium text-sm">Geri Dön</span>
        </button>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            
            {/* Başlık ve Bilgiler */}
            <div className="p-8 md:p-12 border-b border-gray-100">
                <div className="flex flex-wrap items-center gap-3 text-sm font-semibold mb-6">
                    <span className="bg-red-50 text-red-700 px-3 py-1 rounded-lg border border-red-100 flex items-center gap-2">
                        <FaCalendarAlt />
                        {new Date(announcement.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-gray-400 flex items-center gap-2 px-2">
                        <FaClock /> Duyuru Detayı
                    </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
                    {announcement.title}
                </h1>
            </div>

            <div className="p-8 md:p-12">
                
                {/* --- 3. SABİT BOYUTLU SİNEMATİK GALERİ --- */}
                {announcement.images && announcement.images.length > 0 && (
                     <div className="mb-12 relative group rounded-2xl overflow-hidden shadow-lg bg-black h-[400px] md:h-[500px]">
                        
                        {/* A. Arka Plan Katmanı (Bulanık Dolgu) */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center opacity-50 blur-xl scale-110 transition-all duration-500"
                            style={{ backgroundImage: `url('${activeImage}')` }}
                        ></div>

                        {/* B. Ön Plan Resmi (Kesilmeden Sığdırılmış - Contain) */}
                        <div className="relative z-10 w-full h-full flex items-center justify-center backdrop-blur-sm bg-black/10">
                            <img 
                                src={activeImage} 
                                alt="Slide" 
                                className="max-h-full max-w-full object-contain shadow-2xl transition-transform duration-500" 
                            />
                        </div>

                        {/* Kontroller (Sadece birden fazla resim varsa) */}
                        {announcement.images.length > 1 && (
                            <>
                                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all z-20 hover:scale-110">
                                    <FaChevronLeft size={20} />
                                </button>
                                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all z-20 hover:scale-110">
                                    <FaChevronRight size={20} />
                                </button>

                                {/* Alt Gösterge */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
                                    {announcement.images.map((_, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/80'}`}
                                        />
                                    ))}
                                </div>
                                
                                <div className="absolute top-4 right-4 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-md z-20 flex items-center gap-2">
                                    <FaImages /> {currentImageIndex + 1} / {announcement.images.length}
                                </div>
                            </>
                        )}
                     </div>
                )}

                {/* --- 4. METİN İÇERİĞİ --- */}
                <div className="prose prose-lg prose-slate max-w-none text-gray-700 leading-8">
                    <p className="whitespace-pre-wrap">{announcement.description}</p>
                </div>

            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">OMÜ</div>
                    <div>
                        <p className="font-bold text-gray-900 text-sm">Mühendislik Fakültesi</p>
                        <p className="text-gray-500 text-xs">Kurumsal İletişim</p>
                    </div>
                </div>

                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-700 transition-all shadow-sm font-semibold text-sm group">
                    <FaShareAlt className="text-gray-400 group-hover:text-red-500 transition-colors"/> 
                    Paylaş
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}