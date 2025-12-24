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

// --- BÜYÜK SLIDER (MANŞET) ---
function AnnouncementSlider({ images, title, link, date }) {
  return (
    <div className="group relative h-[450px] w-full overflow-hidden rounded-3xl shadow-lg bg-gray-900 border border-gray-800">
       
       {images.length > 0 ? (
         <Swiper
           modules={[Navigation, Pagination, Autoplay, EffectFade]}
           spaceBetween={0}
           slidesPerView={1}
           effect={'fade'}
           loop={true}
           autoplay={{
             delay: 6000,
             disableOnInteraction: false,
           }}
           pagination={{ 
             clickable: true,
             dynamicBullets: true 
           }}
           navigation={true}
           className="h-full w-full"
         >
            {images.map((img, index) => (
                <SwiperSlide key={index} className="relative w-full h-full">
                    <Link href={link} className="block w-full h-full">
                        {/* 1. KATMAN: Arka Plan */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center blur-xl opacity-60 scale-110" 
                            style={{ backgroundImage: `url(${getImageUrl(img)})` }}
                        ></div>
                        
                        {/* 2. KATMAN: Ön Plan */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img 
                                src={getImageUrl(img)} 
                                alt={title} 
                                className="relative max-w-full max-h-full object-contain z-10 drop-shadow-2xl" 
                            />
                        </div>
                    </Link>
                </SwiperSlide>
            ))}
         </Swiper>
       ) : (
         <div className="w-full h-full bg-gray-800 flex items-center justify-center"><span className="text-4xl font-bold text-gray-700">OMÜ</span></div>
       )}

       <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-black via-black/60 to-transparent z-20 pointer-events-none">
          <div className="inline-flex items-center gap-2 bg-omu-red text-white text-xs font-bold px-3 py-1 rounded-full mb-3 shadow-lg border border-red-500/50 pointer-events-auto">
             <FaCalendarAlt /> {new Date(date).toLocaleDateString('tr-TR')}
          </div>
          <Link href={link} className="pointer-events-auto block">
            <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2 drop-shadow-md line-clamp-2 hover:text-gray-200 transition">{title}</h3>
          </Link>
          <Link href={link} className="pointer-events-auto text-gray-300 text-sm font-bold flex items-center gap-2 hover:text-white transition w-max">
            Detayları İncele <FaArrowRight className="transform hover:translate-x-1 transition"/>
          </Link>
       </div>
       
       <style jsx global>{`
         .swiper-pagination-bullet { background: rgba(255,255,255,0.5); opacity: 1; }
         .swiper-pagination-bullet-active { background: #E30613 !important; width: 24px; border-radius: 4px; transition: all 0.3s; }
         .swiper-button-next, .swiper-button-prev { color: white; transform: scale(0.6); font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
         .swiper-button-next:hover, .swiper-button-prev:hover { color: #E30613; }
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
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      
      <main className="container mx-auto px-4 py-10">
        
        <div className="grid lg:grid-cols-12 gap-8 mb-16">
            
            {/* SOL TARAF (%66): MANŞET DUYURULAR */}
            <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-l-4 border-omu-red pl-3">
                        Duyurular & Haberler
                    </h2>
                </div>

                {announcements.length > 0 ? (
                    <>
                        {/* 1. BÜYÜK SLIDER (MANŞET) */}
                        <AnnouncementSlider 
                            images={announcements[0].images || []} 
                            title={announcements[0].title} 
                            link={`/duyuru/${announcements[0].id}`}
                            date={announcements[0].date}
                        />
                        
                        {/* 2. KÜÇÜK KARTLAR SLIDER (Burayı Güncelledik) */}
                        {announcements.length > 1 && (
                            <div className="mt-8">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Diğer Duyurular</h3>
                                <Swiper
                                    modules={[Navigation, Pagination]}
                                    spaceBetween={20} // Kartlar arası boşluk
                                    slidesPerView={1} // Mobilde 1 tane
                                    breakpoints={{
                                        640: { slidesPerView: 2 }, // Tablette/PC'de 2 tane
                                    }}
                                    navigation
                                    pagination={{ clickable: true }}
                                    className="pb-10" // Alt noktalar için boşluk
                                >
                                    {/* 1. eleman manşette olduğu için slice(1) ile geri kalanları alıyoruz */}
                                    {announcements.slice(1).map((ann) => (
                                        <SwiperSlide key={ann.id}>
                                            <Link href={`/duyuru/${ann.id}`} className="flex bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition gap-4 border border-gray-100 group items-center h-32">
                                                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative border border-gray-100">
                                                    {/* KÜÇÜK RESİM KONTROLÜ */}
                                                    {ann.images && ann.images[0] ? (
                                                        <img 
                                                            src={getImageUrl(ann.images[0])} 
                                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                            alt={ann.title}
                                                        />
                                                    ) : <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">OMÜ</div>}
                                                </div>
                                                <div className="flex flex-col justify-center min-w-0 h-full">
                                                    <span className="text-xs font-bold text-gray-400 mb-1">{new Date(ann.date).toLocaleDateString('tr-TR')}</span>
                                                    <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 group-hover:text-omu-red transition">{ann.title}</h3>
                                                    <span className="text-xs text-blue-600 font-bold mt-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition transform translate-y-2 group-hover:translate-y-0">Oku <FaArrowRight size={10}/></span>
                                                </div>
                                            </Link>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                                
                                {/* Küçük slider ok tuşları için renk ayarı (Global Style içinde zaten var ama garanti olsun) */}
                                <style jsx global>{`
                                    .swiper-button-next::after, .swiper-button-prev::after { font-size: 18px !important; color: #9CA3AF; }
                                    .swiper-button-next:hover::after, .swiper-button-prev:hover::after { color: #E30613; }
                                `}</style>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-3xl h-64 flex items-center justify-center shadow-sm border border-gray-200">
                        <p className="text-gray-400 font-medium">Henüz duyuru yayınlanmamış.</p>
                    </div>
                )}
            </div>

            {/* SAĞ TARAF (%33): YAKLAŞAN ETKİNLİKLER */}
            <div className="lg:col-span-4">
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

                    <Link href="/takvim" className="mt-6 w-full py-3 rounded-xl bg-gray-900 text-white text-center text-sm font-bold hover:bg-black transition shadow-md flex items-center justify-center gap-2 relative z-10">
                        Tüm Takvimi Görüntüle <FaArrowRight size={12}/>
                    </Link>
                </div>
            </div>
        </div>

        {/* --- SALONLAR --- */}
        <section>
          <div className="text-center mb-10">
            <span className="text-omu-red font-bold text-sm tracking-widest uppercase mb-2 block">Rezervasyon</span>
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