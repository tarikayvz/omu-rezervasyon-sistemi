'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Header from '../../components/Header'; // Header yolunu kendi projene göre ayarla
import { FaCalendarAlt, FaSearch, FaArrowRight, FaBullhorn } from 'react-icons/fa';

// API AYARLARI (Senin utils/api.js dosyan varsa oradan çekebilirsin)
const RENDER_BACKEND_URL = "https://omu-backend.onrender.com"; 
const getBaseUrl = () => {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000"; 
  }
  return RENDER_BACKEND_URL;
};
const API_URL = `${getBaseUrl()}/api`;

// RESİM ÇÖZÜCÜ
const getImageUrl = (imgData) => {
    if (!imgData) return null;
    if (Array.isArray(imgData)) imgData = imgData[0];
    if (imgData.startsWith('data:') || imgData.startsWith('http')) return imgData;
    return `${getBaseUrl()}${imgData}`;
};

export default function TumDuyurularPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(`${API_URL}/announcements`);
        // En yeniden en eskiye sırala
        const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAnnouncements(sorted);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  // Arama filtresi
  const filteredAnnouncements = announcements.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-red-100 selection:text-red-900">
      <Header />

      {/* --- HERO ALANI (SABİT KIRMIZI) --- */}
      <div className="relative bg-gradient-to-r from-red-900 via-red-800 to-red-900 h-[300px] w-full flex flex-col items-center justify-center text-center px-4">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
         
         <div className="relative z-10 max-w-2xl mt-4">
             <span className="inline-block py-1 px-3 rounded-full bg-red-800/50 border border-red-700 text-red-100 text-xs font-bold tracking-widest uppercase mb-3 backdrop-blur-sm">
                Güncel Haberler
             </span>
             <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg mb-4">
                Tüm Duyurular
             </h1>
             {/* Arama Kutusu */}
             <div className="relative max-w-md mx-auto">
                <input 
                    type="text" 
                    placeholder="Duyurularda ara..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-red-200 focus:outline-none focus:bg-white/20 focus:border-white transition backdrop-blur-md shadow-lg"
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-red-200" />
             </div>
         </div>
         
         <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>

      {/* --- LİSTE ALANI --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 -mt-10 relative z-20">
        
        {loading ? (
             <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-600"></div>
             </div>
        ) : filteredAnnouncements.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                <FaBullhorn className="text-gray-200 text-6xl mx-auto mb-4"/>
                <p className="text-gray-500 font-medium">Aradığınız kriterlere uygun duyuru bulunamadı.</p>
             </div>
        ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredAnnouncements.map((item) => {
                    const imgUrl = getImageUrl(item.images || item.image);

                    return (
                        <Link 
                           href={`/duyuru/${item._id || item.id}`} 
                           key={item._id || item.id}
                           className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                        >
                            {/* Resim Alanı */}
                            <div className="h-56 overflow-hidden bg-gray-100 relative">
                                {imgUrl ? (
                                    <img 
                                        src={imgUrl} 
                                        alt={item.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                                        <FaBullhorn className="text-red-200 text-5xl" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-red-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                                    <FaCalendarAlt />
                                    {new Date(item.date).toLocaleDateString('tr-TR')}
                                </div>
                            </div>

                            {/* İçerik */}
                            <div className="p-6 flex flex-col flex-grow">
                                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-700 transition-colors">
                                    {item.title}
                                </h2>
                                <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                                    {item.description}
                                </p>
                                <div className="flex items-center text-red-600 font-semibold text-sm group-hover:gap-2 transition-all mt-auto pt-4 border-t border-gray-50">
                                    Detayları İncele <FaArrowRight className="ml-1 text-xs transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
             </div>
        )}

      </div>
    </div>
  );
}