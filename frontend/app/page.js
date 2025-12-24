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

// --- 1. MANŞET SLIDER (Kenarlardan Boşluklu Kutu) ---
function MainNewsSlider({ announcements }) {
  return (
    // "rounded-3xl" ile köşeleri iyice yuvarladık.
    // "shadow-xl" ile kutu havada duruyormuş gibi gölge verdik.
    <div className="group relative w-full h-[300px] md:h-[480px] rounded-3xl overflow-hidden shadow-xl bg-gray-900 border border-gray-800 z-0">
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
                            className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                        
                        <div className="absolute bottom-0 left-0 w-full p-6 z-20">
                            <div className="inline-flex items-center gap-2 bg-omu-red text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full mb-3 shadow-lg border border-red-500/50">
                                <FaCalendarAlt /> {new Date(ann.date).toLocaleDateString('tr-TR')}
                            </div>
                            <h3 className="text-xl md:text-3xl font-extrabold text-white leading-tight mb-2 drop-shadow-md line-clamp-2">
                                {ann.title}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-200 text-xs md:text-sm font-bold group-hover:text-white transition">
                                Detayları İncele <FaArrowRight className="text-omu-red"/>
                            </div>
                        </div>
                    </Link>
                </SwiperSlide>
            ))}
         </Swiper>
       ) : (
         <div className="w-full h-full flex items-center justify-center bg-gray-800"><span className="text-4xl font-bold text-gray-600">OMÜ</span></div>
       )}
       <style jsx global>{`
         .swiper-pagination-bullet { background: rgba(255,255,255,0.6); opacity: 1; }
         .swiper-pagination-bullet-active { background: #E30613 !important; width: 20px; border-radius: 4px; }
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
    <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden flex flex-col">
      <Header />
      
      {/* BURASI DEĞİŞTİ: px-6 (veya px-5) mobilde kenarlardan ciddi boşluk bırakır. 
          Kutu "sonsuz" gibi görünmez, ortada net bir dikdörtgen olarak durur. */}
      <main className="container mx-auto max-w-7xl px-5 py-8 flex-grow">
        
        <div className="grid lg:grid-cols-12 gap-10 mb-16">
            
            {/* --- SOL TARAFFER --- */}
            <div className="lg:col-span-8 space-y-12">
                
                {/* 1. Manşet Bölümü */}
                <section>
                    <div className="flex items-center justify-between mb-5 pl-2 border-l-4 border-omu-red">
                        <h2 className="text-2xl font-extrabold text-gray-900">Duyurular & Haberler</h2>
                    </div>
                    {/* Bu slider artık kenarlara yapışmayacak */}
                    <MainNewsSlider announcements={announcements} />
                </section>

                {/* 2. Diğer Duyurular (SENİN İSTEDİĞİN GİBİ NET KARTLAR) */}
                {announcements.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5 pl-2">Tüm Duyurular Listesi</h3>
                    <Swiper
                        modules={[Navigation, Pagination]}
                        spaceBetween={20} 
                        // DİKKAT: slidesPerView={1} yaptık. Yan tarafta yarım kart ASLA görünmeyecek.
                        slidesPerView={1} 
                        breakpoints={{
                            640: { slidesPerView: 2 }, 
                            1024: { slidesPerView: 2.5 }, 
                        }}
                        navigation
                        pagination={{ clickable: true }}
                        className="pb-12"
                    >
                        {announcements.map((ann) => (
                            <SwiperSlide key={ann.id}>
                                <Link href={`/duyuru/${ann.id}`} className="group block bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                                    <div className="flex p-4 gap-4 h-36 items-center">
                                        {/* Küçük Resim Kutusu */}
                                        <div className="w-28 h-28 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner">
                                            {ann.images && ann.images[0] ? (
                                                <img 
                                                    src={getImageUrl(ann.images[0])} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                    alt={ann.title}
                                                />
                                            ) : <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">OMÜ</div>}
                                        </div>
                                        {/* Yazı Alanı */}
                                        <div className="flex flex-col justify-center min-w-0 h-full py-1">
                                            <span className="text-xs font-bold text-gray-400 mb-1">{new Date(ann.date).toLocaleDateString('tr-TR')}</span>
                                            <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-3 group-hover:text-omu-red transition mb-auto">
                                                {ann.title}
                                            </h3>
                                            <span className="text-xs text-white bg-gray-900 px-3 py-1.5 rounded-lg font-bold mt-2 w-max group-hover:bg-omu-red transition flex items-center gap-1 shadow-sm">
                                                Oku <FaArrowRight size={10}/>
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <style jsx global>{`
                        .swiper-button-next::after, .swiper-button-prev::after { font-size: 16px !important; color: #6B7280; }
                        .swiper-button-next:hover::after, .swiper-button-prev:hover::after { color: #E30613; }
                    `}</style>
                </section>
                )}
            </div>

            {/* --- SAĞ TARAFFER (YAN MENÜ) --- */}
            <div className="lg:col-span-4 space-y-8">
                {/* YAKLAŞAN ETKİNLİKLER KUTUSU */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 h-full flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0"></div>
                    
                    <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2 relative z-10">
                        <FaCalendarCheck className="text-blue-600"/> Yaklaşan Etkinlikler
                    </h2>

                    <div className="flex-grow space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar relative z-10">
                        {upcomingEvents.length === 0 ? (
                            <div className="text-center py-10 flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-3"><FaCalendarAlt size={24}/></div>
                                <p className="text-gray-500 font-medium text-sm">Planlanmış etkinlik yok.</p>
                            </div>
                        ) : (
                            upcomingEvents.map((evt) => (
                                <div key={evt.id} className="group flex gap-4 items-start border-b border-gray-50 last:border-0 pb-4 last:pb-0 hover:bg-gray-50/50 p-2 rounded-xl transition cursor-default">
                                    <div className="bg-blue-50 text-blue-700 rounded-xl p-2 text-center min-w-[60px] shadow-sm border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition duration-300">
                                        <span className="block text-xl font-extrabold leading-none">{new Date(evt.startDate).getDate()}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wide">{new Date(evt.startDate).toLocaleString('tr-TR', { month: 'short' })}</span>
                                    </div>
                                    <div className="flex-grow pt-1">
                                        <h4 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 mb-1 group-hover:text-blue-600 transition">{evt.title}</h4>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                            <span className="flex items-center gap-1"><FaClock size={10}/> {new Date(evt.startDate).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})}</span>
                                            <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-gray-600"><FaMapMarkerAlt size={10}/> {evt.hall}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* BUTON GÜNCELLEMESİ: Sen bunu da "kutu" gibi istemiştin */}
                    <Link href="/takvim" className="mt-6 w-full py-4 rounded-2xl bg-gray-900 text-white text-center text-sm font-bold hover:bg-omu-red transition shadow-lg flex items-center justify-center gap-2 relative z-10 border border-gray-700">
                        Tüm Takvimi Görüntüle <FaArrowRight size={12}/>
                    </Link>
                </div>
            </div>
        </div>

        {/* --- SALONLAR --- */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Etkinlik Salonlarımız</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
                { id: 'mavi', name: 'Mavi Salon', color: 'bg-gradient-to-br from-blue-500 to-blue-700', icon: 'M', desc: 'Geniş katılımlı konferanslar.' },
                { id: 'pembe', name: 'Pembe Salon', color: 'bg-gradient-to-br from-pink-500 to-pink-700', icon: 'P', desc: 'Seminerler ve kulüp etkinlikleri.' },
                { id: 'konferans', name: 'Konferans Salonu', color: 'bg-gradient-to-br from-orange-500 to-orange-700', icon: 'K', desc: 'Akademik sunumlar ve toplantılar.' }
            ].map((salon) => (
                <Link key={salon.id} href={`/takvim?salon=${salon.id}`} className="group relative bg-white rounded-3xl p-1 overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 hover:-translate-y-1">
                    <div className="bg-white rounded-[20px] p-8 h-full flex flex-col items-center text-center relative z-10">
                        <div className={`w-16 h-16 rounded-2xl ${salon.color} text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-lg transform group-hover:rotate-6 transition duration-300`}>
                            {salon.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{salon.name}</h3>
                        <p className="text-gray-500 text-sm mb-6">{salon.desc}</p>
                        <span className="mt-auto text-sm font-bold text-gray-400 group-hover:text-gray-900 transition flex items-center gap-1">Takvimi Gör <FaChevronRight size={10}/></span>
                    </div>
                    <div className={`absolute inset-0 ${salon.color} opacity-0 group-hover:opacity-10 transition duration-300`}></div>
                </Link>
            ))}
          </div>
        </section>

      </main>
      
      <footer className="bg-gray-900 text-white py-8 text-center mt-20 border-t-4 border-omu-red">
        <p className="font-medium opacity-80">&copy; 2025 Ondokuz Mayıs Üniversitesi - Mühendislik Fakültesi</p>
      </footer>
    </div>
  );
}