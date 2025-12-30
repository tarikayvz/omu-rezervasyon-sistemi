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
  FaImages,
  FaQuoteLeft,
  FaFileDownload,
  FaCommentDots
} from 'react-icons/fa';
import API_URL from '../../../utils/api';

// Base URL
const BASE_URL = API_URL.replace('/api', '');

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Örnek Dökümanlar ve Yorumlar (Gerçek API'den çekilecek)
  const documents = [
    { name: 'Etkinlik Programı.pdf', size: '1.2 MB' },
    { name: 'Katılım Formu.docx', size: '500 KB' },
  ];
  const comments = [
    { user: 'Ahmet Yılmaz', date: '29 Aralık 2025', text: 'Çok faydalı bir etkinlik olacağa benziyor, kesinlikle katılacağım.' },
    { user: 'Ayşe Demir', date: '30 Aralık 2025', text: 'Teşekkürler bilgilendirme için.' },
  ];

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
             <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-600"></div>
             <span className="text-gray-500 font-medium animate-pulse">Yükleniyor...</span>
        </div>
    </div>
  );

  if (!announcement) return <div className="min-h-screen flex items-center justify-center text-gray-500">İçerik bulunamadı.</div>;

  const activeImage = announcement.images && announcement.images.length > 0
                      ? getImageUrl(announcement.images[currentImageIndex])
                      : null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-red-100 selection:text-red-900">
      <Header />

      {/* --- HERO BACKGROUND --- */}
      <div className="relative h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900 via-red-800 to-gray-900">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>
        
        {/* Eğer resim varsa arkada çok silik görünsün */}
        {activeImage && (
             <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl scale-110 mix-blend-overlay"
                  style={{ backgroundImage: `url('${activeImage}')` }}>
             </div>
        )}
        
        {/* Karartma ve Geçiş */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#FDFBF7] to-transparent"></div>
      </div>

      {/* --- ANA İÇERİK KARTI (Animasyonlu) --- */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-80 pb-20 animate-slideUp">

        <button
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-2 text-white/90 hover:text-white transition-all group bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/20 shadow-lg"
        >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform"/>
            <span className="font-medium text-sm">Geri Dön</span>
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden ring-1 ring-gray-100 relative">
            
            {/* Başlık Alanı */}
            <div className="p-8 md:p-14 border-b border-gray-50 bg-gradient-to-b from-white to-gray-50/50">
                <div className="flex flex-wrap items-center gap-3 text-sm font-bold mb-6 tracking-wide">
                    <span className="bg-red-100 text-red-700 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                        <FaCalendarAlt />
                        {new Date(announcement.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-gray-400 flex items-center gap-2 px-2 uppercase text-xs tracking-widest">
                        <FaClock /> 3 dk okuma
                    </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 leading-[1.1] mb-4">
                    {announcement.title}
                </h1>
            </div>

            <div className="p-8 md:p-14">

                {/* --- SİNEMATİK GALERİ --- */}
                {announcement.images && announcement.images.length > 0 && (
                     <div className="mb-14 relative group rounded-3xl overflow-hidden shadow-2xl bg-gray-900 ring-4 ring-white">
                        {/* Arka Plan Blur */}
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-40 blur-2xl scale-125 transition-all duration-700"
                            style={{ backgroundImage: `url('${activeImage}')` }}
                        ></div>

                        {/* Resim Container */}
                        <div className="relative z-10 w-full flex items-center justify-center p-4">
                            {/* Resim Boyutu Sabitlendi: h-[400px] ve object-cover */}
                            <img
                                src={activeImage}
                                alt="Slide"
                                className="w-full h-[400px] object-cover shadow-2xl rounded-lg transition-transform duration-500 hover:scale-[1.02]"
                            />
                        </div>

                        {/* Kontroller */}
                        {announcement.images.length > 1 && (
                            <>
                                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white text-white hover:text-gray-900 rounded-full flex items-center justify-center backdrop-blur-md transition-all z-20 border border-white/20 shadow-lg group-hover:opacity-100 opacity-0">
                                    <FaChevronLeft size={20} />
                                </button>
                                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white text-white hover:text-gray-900 rounded-full flex items-center justify-center backdrop-blur-md transition-all z-20 border border-white/20 shadow-lg group-hover:opacity-100 opacity-0">
                                    <FaChevronRight size={20} />
                                </button>

                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-black/30 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                                    {announcement.images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`}
                                        />
                                    ))}
                                </div>
                                <div className="absolute top-6 right-6 bg-black/40 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-md z-20 flex items-center gap-2 border border-white/10">
                                    <FaImages /> {currentImageIndex + 1} / {announcement.images.length}
                                </div>
                            </>
                        )}
                     </div>
                )}

                {/* --- METİN ALANI (ÖZEL TASARIM) --- */}
                <div className="relative">
                    
                    {/* Arka plan deseni (Noktalı) */}
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none"></div>
                    
                    {/* Metin İçeriği */}
                    <div className="relative z-10 prose prose-lg md:prose-xl prose-slate max-w-none text-gray-700 leading-9">
                        {/* Drop Cap Kaldırıldı */}
                        <p className="whitespace-pre-wrap">{announcement.description}</p>
                    </div>

                    {/* Alt Dekoratif İkon */}
                    <div className="mt-12 flex justify-center opacity-20">
                         <FaQuoteLeft size={40} className="text-gray-400"/>
                    </div>
                </div>

                {/* --- YENİ: İLGİLİ DÖKÜMANLAR --- */}
                {documents.length > 0 && (
                    <div className="mt-12 border-t border-gray-100 pt-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <FaFileDownload className="text-red-600"/> İlgili Dökümanlar
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            {documents.map((doc, index) => (
                                <a key={index} href="#" className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:bg-white hover:shadow-md transition-all group">
                                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                        <FaFileDownload />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{doc.name}</p>
                                        <p className="text-sm text-gray-500">{doc.size}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- YENİ: YORUMLAR --- */}
                <div className="mt-12 border-t border-gray-100 pt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <FaCommentDots className="text-red-600"/> Yorumlar ({comments.length})
                    </h3>
                    
                    {/* Yorum Yapma Formu */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8">
                        <h4 className="font-bold text-gray-700 mb-4">Bir Yorum Bırakın</h4>
                        <div className="grid gap-4 md:grid-cols-2 mb-4">
                            <input type="text" placeholder="Adınız Soyadınız" className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition" />
                            <input type="email" placeholder="E-posta Adresiniz" className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition" />
                        </div>
                        <textarea placeholder="Yorumunuzu buraya yazın..." rows="4" className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition resize-none mb-4"></textarea>
                        <button className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md hover:shadow-lg">Yorumu Gönder</button>
                    </div>

                    {/* Yorum Listesi */}
                    <div className="space-y-6">
                        {comments.map((comment, index) => (
                            <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">{comment.user.charAt(0)}</div>
                                        <div>
                                            <h5 className="font-bold text-gray-900">{comment.user}</h5>
                                            <p className="text-sm text-gray-500">{comment.date}</p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="bg-gray-50/80 backdrop-blur px-8 py-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-red-100">OMÜ</div>
                    <div>
                        <p className="font-bold text-gray-900">Mühendislik Fakültesi</p>
                        <p className="text-gray-500 text-sm">Resmi Duyuru Kanalı</p>
                    </div>
                </div>

                <button className="flex items-center gap-3 px-8 py-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-900 hover:text-white hover:border-gray-900 hover:shadow-xl transition-all font-bold text-gray-700 group">
                    <FaShareAlt className="text-gray-400 group-hover:text-white transition-colors"/>
                    Paylaş
                </button>
            </div>

        </div>
      </div>
      
      {/* Özel Animasyon CSS'i */}
      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}