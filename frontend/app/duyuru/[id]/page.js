'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
// Header 3 seviye yukarıda olduğu için utils de muhtemelen oradadır
import Header from '../../../components/Header';
import { FaCalendarAlt, FaArrowLeft, FaShareAlt } from 'react-icons/fa';
import API_URL from '../../../utils/api';

// Resimler için Ana Sunucu Adresini ayarla (Sonundaki /api'yi siler)
const BASE_URL = API_URL.replace('/api', '');

export default function DuyuruDetayPage() {
  const { id } = useParams();
  const router = useRouter();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        // DÜZELTİLDİ: API_URL kullanıldı
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

        {/* --- GALERİ (Modern Grid) --- */}
        {announcement.images && announcement.images.length > 0 && (
             <div className="mb-12">
                <div className={`grid gap-4 ${announcement.images.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                    {announcement.images.map((img, idx) => (
                        <div key={idx} className={`relative rounded-2xl overflow-hidden shadow-lg group ${announcement.images.length === 1 ? 'h-[500px]' : 'h-80'}`}>
                             {/* DÜZELTİLDİ: localhost yerine BASE_URL kullanıldı */}
                             <img src={`${BASE_URL}${img}`} alt={`${announcement.title}-${idx}`} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
                        </div>
                    ))}
                </div>
             </div>
        )}

        {/* Metin İçeriği */}
        <div className="prose prose-lg max-w-none text-gray-700 leading-loose">
            <p className="whitespace-pre-wrap">{announcement.description}</p>
        </div>

        {/* Alt Footer */}
        <div className="border-t border-gray-100 mt-12 pt-8 flex justify-between items-center text-gray-500 text-sm">
            <p>OMÜ Mühendislik Fakültesi</p>
            <button className="flex items-center gap-2 hover:text-omu-red transition"><FaShareAlt /> Paylaş</button>
        </div>

      </div>
    </div>
  );
}