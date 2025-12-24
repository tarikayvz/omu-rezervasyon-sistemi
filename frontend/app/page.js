'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Link from 'next/link';
import { FaChevronRight, FaCalendarAlt, FaMapMarkerAlt, FaArrowRight, FaClock, FaCalendarCheck } from 'react-icons/fa';
import API_URL from '../utils/api';

// --- SWIPER ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const BASE_URL = API_URL.replace('/api', '');
const getImageUrl = (img) => (img ? (img.startsWith('http') ? img : `${BASE_URL}${img}`) : '');

// --- 1. ANA MANŞET KUTUSU (Tamamen İzole Kutu) ---
function MainNewsSlider({ announcements }) {
  return (
    // shadow-2xl ve rounded-3xl ile o istediğin "Kart" görüntüsü
    <div className="w-full h-[300px] md:h-[480px] rounded-3xl overflow-hidden shadow-2xl bg-gray-900 border border-gray-800 relative z-0">
       {announcements.length > 0 ? (
         <Swiper
           modules={[Navigation, Pagination, Autoplay, EffectFade]}
           slidesPerView={1}
           effect={'fade'} 
           fadeEffect={{ crossFade: true }}
           loop={true}
           autoplay={{ delay: 5000, disableOnInteraction: false }}
           pagination={{ clickable: true, dynamicBullets: true }}
           navigation={true} 
           className="h-full w-full"
         >
            {announcements.map((ann) => (
                <SwiperSlide key={ann.id} className="relative w-full h-full bg-gray-900">
                    <Link href={`/duyuru/${ann.id}`} className="block w-full h-full relative">
                        <img 
                            src={getImageUrl(ann.images[0])} 
                            alt={ann.title} 
                            className="w-full h-full object-cover opacity-80" // Hafif koyu yaptım, yazı okunsun
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                        
                        <div className="absolute bottom-0 left-0 w-full p-6 z-20">
                            <div className="inline-flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                                <FaCalendarAlt /> {new Date(ann.date).toLocaleDateString('tr-TR')}
                            </div>
                            <h3 className="text-xl md:text-3xl font-extrabold text-white leading-tight mb-2 line-clamp-2">
                                {ann.title}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-300 text-xs font-bold">
                                Detayları İncele <FaArrowRight/>
                            </div>
                        </div>
                    </Link>
                </SwiperSlide>
            ))}
         </Swiper>
       ) : (
         <div className="w-full h-full flex items-center justify-center bg-gray-900"><span className="text-4xl font-bold text-gray-700">OMÜ</span></div>
       )}
       
       <style jsx global>{`
         .swiper-pagination-bullet { background: rgba(255,255,255,0.5); opacity: 1; }
         .swiper-pagination-bullet-active { background: #DC2626 !important; width: 20px; border-radius: 4px; }
         @media (max-width: 768px) { .swiper-button-next, .swiper-button-prev { display: none !important; } }
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
        const [resAnn, resEvt] = await Promise.all([
            axios.get(`${API_URL}/announcements`),
            axios.get(`${API_URL}/events`)
        ]);
        setAnnouncements(resAnn.data);
        setUpcomingEvents(resEvt.data.filter(e => e.isApproved && new Date(e.endDate) >= new Date()).sort((a, b) => new Date(a.startDate) - new Date(b.startDate)).slice(0, 5));
      } catch (error) { console.error(error); }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col overflow-x-hidden">
      <Header />
      
      {/* DÜZELTME BURADA: px-6 (Hatta mobilde daha belirgin olsun diye).
          Bu sayede kutular ekranın kenarına yapışmaz, ortada "Yüzen Kutu" gibi durur.
      */}
      <main className="container mx-auto max-w-7xl px-6 py-8 flex-grow">
        
        <div className="grid lg:grid-cols-12 gap-10">
            
            {/* SOL TARAF */}
            <div className="lg:col-span-8 space-y-10">
                
                {/* 1. MANŞET (KUTU GÖRÜNÜMÜ) */}
                <section>
                    <div className="flex items-center gap-2 mb-4 border-l-4 border-red-600 pl-3">
                        <h2 className="text-2xl font-extrabold text-gray-900">Duyurular</h2>
                    </div>
                    <MainNewsSlider announcements={announcements} />
                </section>

                {/* 2. DİĞER DUYURULAR (Sırayla Alt Alta veya Yanyana) */}
                {announcements.length > 0 && (
                <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Tüm Duyurular Listesi</h3>
                    
                    {/* SWIPER AYARI: slidesPerView={1} -> Sadece 1 tane gösterir, yarım yamalak göstermez */}
                    <Swiper
                        modules={[Pagination]}
                        spaceBetween={20}
                        slidesPerView={1} 
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 2.5 },
                        }}
                        pagination={{ clickable: true }}
                        className="pb-10"
                    >
                        {announcements.map((ann) => (
                            <SwiperSlide key={ann.id}>
                                <Link href={`/duyuru/${ann.id}`} className="block bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden h-80">
                                    <div className="h-48 w-full bg-gray-200">
                                        {ann.images && ann.images[0] ? (
                                            <img src={getImageUrl(ann.images[0])} className="w-full h-full object-cover" alt={ann.title}/>
                                        ) : null}
                                    </div>
                                    <div className="p-5 flex flex-col h-32 justify-between">
                                        <div>
                                            <span className="text-xs font-bold text-gray-400">{new Date(ann.date).toLocaleDateString('tr-TR')}</span>
                                            <h4 className="font-bold text-gray-800 text-lg leading-tight line-clamp-2 mt-1">{ann.title}</h4>
                                        </div>
                                        <span className="text-sm font-bold text-blue-600 flex items-center gap-1">Oku <FaArrowRight size={12}/></span>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </section>
                )}
            </div>

            {/* SAĞ TARAF (YAN MENÜ) */}
            <div className="lg:col-span-4 space-y-8">
                
                {/* YAKLAŞAN ETKİNLİKLER (KUTU GİBİ) */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 overflow-hidden relative">
                    <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                        <FaCalendarCheck className="text-blue-600"/> Yaklaşan Etkinlikler
                    </h2>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {upcomingEvents.length === 0 ? <p className="text-gray-400 text-center py-4">Etkinlik yok.</p> : 
                            upcomingEvents.map((evt) => (
                                <div key={evt.id} className="flex gap-4 items-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="bg-white text-blue-600 rounded-xl p-2 text-center min-w-[50px] shadow-sm border border-gray-100">
                                        <span className="block text-lg font-extrabold">{new Date(evt.startDate).getDate()}</span>
                                        <span className="text-[10px] font-bold uppercase">{new Date(evt.startDate).toLocaleString('tr-TR', { month: 'short' })}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{evt.title}</h4>
                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                            <FaClock/> {new Date(evt.startDate).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})}
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>

                    {/* BUTON: Bu da kutu gibi olsun istedin */}
                    <Link href="/takvim" className="mt-6 block w-full py-4 rounded-2xl bg-gray-900 text-white text-center text-sm font-bold shadow-lg hover:bg-gray-800 transition">
                        Tüm Takvimi Görüntüle
                    </Link>
                </div>

                {/* SALONLAR */}
                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 ml-1">Hızlı Erişim</h2>
                    <div className="grid gap-3">
                        {[
                            { id: 'mavi', name: 'Mavi Salon', color: 'bg-blue-600', icon: 'M' },
                            { id: 'pembe', name: 'Pembe Salon', color: 'bg-pink-600', icon: 'P' },
                            { id: 'konferans', name: 'Konferans Salonu', color: 'bg-orange-600', icon: 'K' }
                        ].map((salon) => (
                            <Link key={salon.id} href={`/takvim?salon=${salon.id}`} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
                                <div className={`w-10 h-10 rounded-full ${salon.color} text-white flex items-center justify-center font-bold`}>{salon.icon}</div>
                                <span className="font-bold text-gray-700">{salon.name}</span>
                                <FaChevronRight className="ml-auto text-gray-300"/>
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-gray-500 text-sm mt-auto">
        &copy; 2025 Ondokuz Mayıs Üniversitesi
      </footer>
    </div>
  );
}