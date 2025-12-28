'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import { FaCalendarAlt, FaArrowLeft, FaShareAlt } from 'react-icons/fa';
import API_URL from '../../../utils/api';

// Base URL
const BASE_URL = API_URL.replace('/api', '');

// --- AKILLI RESİM URL DÜZELTİCİ ---
const getImageUrl = (imgData) => {
    if (!imgData) return "https://placehold.co/600x400?text=Resim+Yok";
    
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

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-omu-red"></div></div>;
  if (!announcement) return <div className="min-h-screen flex items-center justify-center text-gray-500">İçerik bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-10">
        
        {/* Navigasyon */}
        <div className="flex justify-between items-center mb-8">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition font-medium group">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition"><FaArrowLeft size={12}/></div>
                Geri Dön
            </button>
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Duyuru Detayı</span>
        </div>

        {/* Başlık Alanı */}
        <div className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-omu-red font-bold mb-4 bg-red-50 px-4 py-1.5 rounded-full text-sm">
              <FaCalendarAlt />
              {new Date(announcement.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">{announcement.title}</h1>
        </div>

        {/* --- GALERİ (Düzeltildi: Yükseklik Sınırı ve Ortalama) --- */}
        {announcement.images && announcement.images.length > 0 && (
             <div className="mb-12 space-y-8">
                {announcement.images.map((img, idx) => (
                    <div key={idx} className="rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-gray-50 flex justify-center p-2">
                         {/* GÜNCELLEME:
                            1. max-h-[500px]: Resim boyu en fazla 500px olur, ekranı kaplamaz.
                            2. w-auto: Genişlik resmin oranına göre otomatik ayarlanır.
                            3. mx-auto: Resim kutunun ortasında durur.
                            4. object-contain: Resim asla kesilmez.
                         */}
                         <img 
                            src={getImageUrl(img)} 
                            alt={`${announcement.title}-${idx}`} 
                            className="w-auto h-auto max-w-full max-h-[500px] object-contain mx-auto block" 
                         />
                    </div>
                ))}
             </div>
        )}

        {/* Metin İçeriği */}
        <div className="bg-gray-50 p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm">
            <div className="prose prose-lg max-w-none text-gray-700 leading-loose">
                <p className="whitespace-pre-wrap">{announcement.description}</p>
            </div>
        </div>

        {/* Alt Footer */}
        <div className="mt-12 pt-4 flex justify-between items-center text-gray-500 text-sm px-2">
            <p>OMÜ Mühendislik Fakültesi</p>
            <button className="flex items-center gap-2 hover:text-omu-red transition"><FaShareAlt /> Paylaş</button>
        </div>

      </div>
    </div>
  );
}