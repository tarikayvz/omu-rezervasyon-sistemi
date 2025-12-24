'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Link from 'next/link';
import { FaChevronRight, FaCalendarAlt, FaMapMarkerAlt, FaArrowRight, FaClock, FaCalendarCheck } from 'react-icons/fa';
import API_URL from '../utils/api';

// --- SWIPER İMPORTLARI ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// --- URL AYARLARI ---
const BASE_URL = API_URL.replace('/api', '');

const getImageUrl = (img) => {
    if (!img) return '';
    return img.startsWith('http') ? img : `${BASE_URL}${img}`;
};

// --- YENİ MANŞET SLIDER (Tamamen Sabit Kutu - Bozulmaz) ---
function MainNewsSlider({ announcements }) {
  return (
    // YÜKSEKLİK AYARI: Mobilde 260px, Masaüstünde 480px.
    // Bu boyutlar SABİTTİR. İçerik ne olursa olsun kutu büyüyüp küçülmez.
    <div className="group relative w-full h-[260px] md:h-[480px] overflow-hidden rounded-2xl shadow-md bg-white border border-gray-200">
       
       {announcements.length > 0 ? (
         <Swiper
           modules={[Navigation, Pagination, Autoplay, EffectFade]}
           spaceBetween={0}
           slidesPerView={1}
           effect={'fade'} 
           fadeEffect={{ crossFade: true }}
           loop={true}
           speed={600}
           autoplay={{
             delay: 5000, 
             disableOnInteraction: false,
           }}
           pagination={{ 
             clickable: true,
             dynamicBullets: true 
           }}
           navigation={true} 
           className="h-full w-full"
         >
            {announcements.map((ann) => (
                <SwiperSlide key={ann.id} className="relative w-full h-full bg-gray-100">
                    <Link href={`/duyuru/${ann.id}`} className="block w-full h-full relative">
                        
                        {/* RESİM KATMANI */}
                        {/* object-cover: Resmi kutuya zorla sığdırır, kutuyu esnetmez */}
                        <div className="w-full h-full">
                            {ann.images && ann.images.length > 0 ? (
                                <img 
                                    src={getImageUrl(ann.images[0])} 
                                    alt={ann.title} 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                    <span className="text-gray-400 font-bold text-4xl">OMÜ</span>
                                </div>
                            )}
                            {/* Hafif Karartma */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                        </div>

                        {/* YAZI KATMANI (Sabit Alt Kısım) */}
                        <div className="absolute bottom-0 left-0 w-full p-6 z-20">
                            <div className="inline-flex items-center gap-2 bg-omu-red text-white text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1 rounded-md mb-2 shadow-sm">
                                <FaCalendarAlt /> {new Date(ann.date).toLocaleDateString('tr-TR')}
                            </div>
                            
                            <h3 className="text-lg md:text-3xl font-bold text-white leading-tight mb-1 drop-shadow-md line-clamp-2">
                                {ann.title}
                            </h3>
                            
                            <div className="flex items-center gap-2 text-gray-300 text-xs md:text-sm font-medium mt-2">
                                Detayları Gör <FaChevronRight className="text-omu-red" size={12}/>
                            </div>
                        </div>
                    </Link>
                </SwiperSlide>
            ))}
         </Swiper>
       ) : (
         <div className="w-full h-full bg-gray-100 flex items-center justify-center"><span className="text-4xl font-bold text-gray-300">OMÜ</span></div>
       )}
       
       <style jsx global>{`
         .swiper-pagination-bullet { background: rgba(255,255,255,0.7); width: 6px; height: 6px; opacity: 1; }
         .swiper-pagination-bullet-active { background: #E30613 !important; width: 18px; border-radius: 4px; }
         @media (max-width: 768px) {
            .swiper-button-next, .swiper-button-prev { display: none !important; }
         }
       `}</style>
    </div>
  );
}

export default function Home() {
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resAnn = await axios.get(`${API_URL}/announcements`);
        setAnnouncements(resAnn.data);
        
        const resEvt = await axios.get(`${API_URL}/events`);
        const futureEvents = resEvt.data
            .filter(e => e.isApproved && new Date(e.endDate) >= new Date()) 
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))  
            .slice(0, 5); 

        setUpcomingEvents(futureEvents);
      } catch (error) { console.error(error); }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Header />
      
      {/* CONTAINER AYARI: 
         max-w-7xl ve mx-auto sayesinde içerik asla ekranın tamamına yayılmaz,
         ortada derli toplu durur (Mavi Salon sayfası gibi).
      */}
      <main className="container mx-auto max-w-7xl px-4 py-8 flex-grow">
        
        <div className="grid lg:grid-cols-12 gap-8 mb-12">
            
            {/* SOL TARAF: MANŞET DUYURULAR */}
            <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-4 border-b pb-2 border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-2 h-6 bg-omu-red rounded-sm"></span>
                        Duyurular & Haberler
                    </h2>
                </div>

                {announcements.length > 0 ? (
                    <>
                        {/* 1. MANŞET (Sabit Yükseklik) */}
                        <MainNewsSlider announcements={announcements} />
                        
                        {/* 2. DİĞER DUYURULAR (Kaydırmalı Liste) */}
                        <div className="mt-10">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Tüm Duyurular</h3>
                            <Swiper
                                modules={[Navigation, Pagination]}
                                spaceBetween={15}
                                slidesPerView={1.2} 
                                breakpoints={{
                                    640: { slidesPerView: 2, spaceBetween: 20 },
                                    1024: { slidesPerView: 3, spaceBetween: 20 }, // Masaüstünde 3 tane sığsın
                                }}
                                navigation
                                pagination={{ clickable: true }}
                                className="pb-12"
                            >
                                {announcements.map((ann) => (
                                    <SwiperSlide key={ann.id}>
                                        <Link href={`/duyuru/${ann.id}`} className="block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group h-full">
                                            {/* Küçük Kart Resim Alanı (Sabit Yükseklik) */}
                                            <div className="h-40 w-full relative bg-gray-100">
                                                {ann.images && ann.images[0] ? (
                                                    <img 
                                                        src={getImageUrl(ann.images[0])} 
                                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                                        alt={ann.title}
                                                    />
                                                ) : <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">OMÜ</div>}
                                            </div>
                                            
                                            <div className="p-4">
                                                <span className="text-xs font-bold text-gray-400 block mb-1">{new Date(ann.date).toLocaleDateString('tr-TR')}</span>
                                                <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 group-hover:text-omu-red transition mb-3 h-10">
                                                    {ann.title}
                                                </h3>
                                                <span className="text-xs text-blue-600 font-bold flex items-center gap-1">
                                                    Devamını Oku <FaArrowRight size={10}/>
                                                </span>
                                            </div>
                                        </Link>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                            
                            <style jsx global>{`
                                .swiper-button-next::after, .swiper-button-prev::after { font-size: 16px !important; color: #6B7280; }
                                .swiper-button-next:hover::after, .swiper-button-prev:hover::after { color: #E30613; }
                            `}</style>
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-xl h-64 flex items-center justify-center shadow-sm border border-gray-200">
                        <p className="text-gray-400 font-medium">Henüz duyuru yayınlanmamış.</p>
                    </div>
                )}
            </div>

            {/* SAĞ TARAF: YAKLAŞAN ETKİNLİKLER */}
            <div className="lg:col-span-4">
                <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 h-auto sticky top-4">
                    
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                        <FaCalendarCheck className="text-blue-600"/> Yaklaşan Etkinlikler
                    </h2>

                    <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1 custom-scrollbar">
                        {upcomingEvents.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-400 text-sm">Planlanmış etkinlik yok.</p>
                            </div>
                        ) : (
                            upcomingEvents.map((evt) => (
                                <div key={evt.id} className="group flex gap-3 items-start p-2 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                                    <div className="bg-blue-50 text-blue-700 rounded-lg p-2 text-center min-w-[50px] shadow-sm">
                                        <span className="block text-lg font-bold leading-none">{new Date(evt.startDate).getDate()}</span>
                                        <span className="text-[10px] font-bold uppercase">{new Date(evt.startDate).toLocaleString('tr-TR', { month: 'short' })}</span>
                                    </div>
                                    
                                    <div className="flex-grow pt-0.5">
                                        <h4 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2 mb-1 group-hover:text-blue-600 transition">{evt.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><FaClock size={10}/> {new Date(evt.startDate).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})}</span>
                                            <span className="flex items-center gap-1 bg-gray-100 px-1.5 rounded text-gray-600"><FaMapMarkerAlt size={10}/> {evt.hall}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <Link href="/takvim" className="mt-4 w-full py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-center text-sm font-bold transition flex items-center justify-center gap-2">
                        Tüm Takvim <FaArrowRight size={12}/>
                    </Link>
                </div>
            </div>
        </div>

        {/* --- SALONLAR --- */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b pb-2 border-gray-200">
             <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-6 bg-gray-800 rounded-sm"></span>
                Etkinlik Salonlarımız
             </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-5">
            {[
                { id: 'mavi', name: 'Mavi Salon', color: 'bg-blue-600', icon: 'M', desc: 'Geniş katılımlı konferanslar.' },
                { id: 'pembe', name: 'Pembe Salon', color: 'bg-pink-600', icon: 'P', desc: 'Seminerler ve kulüp etkinlikleri.' },
                { id: 'konferans', name: 'Konferans Salonu', color: 'bg-orange-600', icon: 'K', desc: 'Akademik sunumlar ve toplantılar.' }
            ].map((salon) => (
                <Link key={salon.id} href={`/takvim?salon=${salon.id}`} className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-1 transition duration-300 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full ${salon.color} text-white flex items-center justify-center text-xl font-bold shadow-md`}>
                        {salon.icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition">{salon.name}</h3>
                        <p className="text-gray-500 text-xs">{salon.desc}</p>
                    </div>
                    <FaChevronRight className="ml-auto text-gray-300 group-hover:text-gray-600" />
                </Link>
            ))}
          </div>
        </section>

      </main>
      <footer className="bg-white border-t border-gray-200 text-gray-600 py-8 text-center mt-12">
        <p className="font-medium text-sm">&copy; 2025 Ondokuz Mayıs Üniversitesi - Mühendislik Fakültesi</p>
      </footer>
    </div>
  );
}