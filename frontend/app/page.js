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

// --- 1. MANŞET SLIDER (REFERANS GÖRSEL GİBİ) ---
function MainNewsSlider({ announcements }) {
  return (
    // h-[340px]: Mobilde görseldeki gibi biraz yüksek, karemsi kutu.
    // rounded-[2rem]: Köşeler iyice yuvarlak (görseldeki gibi).
    <div className="w-full h-[340px] md:h-[480px] rounded-[2rem] overflow-hidden shadow-2xl bg-gray-900 border border-gray-800 relative z-0">
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
                            className="w-full h-full object-cover opacity-90" 
                        />
                        {/* Karartma */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                        
                        {/* Yazı Alanı */}
                        <div className="absolute bottom-0 left-0 w-full p-8 z-20">
                            <div className="inline-flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 shadow-md">
                                <FaCalendarAlt /> {new Date(ann.date).toLocaleDateString('tr-TR')}
                            </div>
                            <h3 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-3 line-clamp-2 drop-shadow-xl">
                                {ann.title}
                            </h3>
                            <div className="flex items-center gap-2 text-white/90 text-sm font-bold bg-white/20 w-max px-4 py-2 rounded-xl backdrop-blur-md hover:bg-white hover:text-red-600 transition border border-white/10">
                                Detayları İncele <FaArrowRight/>
                            </div>
                        </div>
                    </Link>
                </SwiperSlide>
            ))}
         </Swiper>
       ) : (
         // VERİ YOKSA GÖZÜKECEK OLAN (Görseldeki "OMÜ" yazan gri ekran)
         <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
             <span className="text-5xl font-black tracking-tighter opacity-20">OMÜ</span>
         </div>
       )}
       
       <style jsx global>{`
         .swiper-pagination-bullet { background: rgba(255,255,255,0.5); opacity: 1; }
         .swiper-pagination-bullet-active { background: #DC2626 !important; width: 24px; border-radius: 4px; transition: all 0.3s; }
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
      
      {/* !!! İŞTE ÇÖZÜM BURADA !!!
         px-6: Sağdan ve soldan yaklaşık 24px boşluk bırakır.
         Bu sayede içerideki kutu asla kenara yapışmaz, ortada "yüzen kart" gibi durur.
         Attığın referans görseldeki boşluğu bu sağlıyor.
      */}
      <main className="container mx-auto max-w-7xl px-6 py-6 flex-grow">
        
        <div className="grid lg:grid-cols-12 gap-8 md:gap-10 mb-16">
            
            {/* SOL TARAF */}
            <div className="lg:col-span-8 space-y-10">
                
                {/* 1. MANŞET (REFERANS GÖRSELDEKİ GİBİ ORTALI) */}
                <section>
                    <div className="flex items-center gap-3 mb-4 pl-1">
                        <span className="w-1.5 h-8 bg-red-600 rounded-full"></span>
                        <h2 className="text-2xl font-extrabold text-gray-900">Duyurular & Haberler</h2>
                    </div>
                    <MainNewsSlider announcements={announcements} />
                </section>

                {/* 2. DİĞER DUYURULAR LİSTESİ */}
                {announcements.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 pl-1">Tüm Duyurular Listesi</h3>
                    
                    <Swiper
                        modules={[Pagination]}
                        spaceBetween={15}
                        // slidesPerView={1.2}: Yandakinin ucu hafif görünsün (Modern mobil hissi)
                        // İstemezsen burayı 1 yapabilirsin.
                        slidesPerView={1.2} 
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 2.5 },
                        }}
                        pagination={{ clickable: true }}
                        className="pb-10"
                    >
                        {announcements.map((ann) => (
                            <SwiperSlide key={ann.id}>
                                <Link href={`/duyuru/${ann.id}`} className="flex bg-white p-3 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition gap-4 items-center h-28">
                                    <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative border border-gray-200">
                                        {ann.images && ann.images[0] ? (
                                            <img 
                                                src={getImageUrl(ann.images[0])} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                alt={ann.title}
                                            />
                                        ) : <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">OMÜ</div>}
                                    </div>
                                    <div className="flex flex-col justify-center h-full py-1 min-w-0">
                                        <span className="text-[10px] font-bold text-gray-400 mb-1">{new Date(ann.date).toLocaleDateString('tr-TR')}</span>
                                        <h4 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2">
                                            {ann.title}
                                        </h4>
                                        <span className="text-xs text-blue-600 font-bold mt-auto flex items-center gap-1">
                                            Oku <FaArrowRight size={10}/>
                                        </span>
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
                
                {/* YAKLAŞAN ETKİNLİKLER */}
                <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 opacity-50"></div>
                    
                    <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-3 relative z-10">
                        <span className="bg-blue-100 text-blue-600 p-2 rounded-lg"><FaCalendarCheck/></span>
                        Yaklaşan Etkinlikler
                    </h2>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar relative z-10">
                        {upcomingEvents.length === 0 ? <p className="text-gray-400 text-center py-6">Henüz planlanmış etkinlik yok.</p> : 
                            upcomingEvents.map((evt) => (
                                <div key={evt.id} className="flex gap-4 items-center p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-md transition duration-300">
                                    <div className="bg-white text-blue-700 rounded-xl p-2 text-center min-w-[55px] shadow-sm border border-gray-100">
                                        <span className="block text-lg font-black leading-none">{new Date(evt.startDate).getDate()}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wide">{new Date(evt.startDate).toLocaleString('tr-TR', { month: 'short' })}</span>
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">{evt.title}</h4>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                            <span className="flex items-center gap-1"><FaClock className="text-blue-400"/> {new Date(evt.startDate).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})}</span>
                                            <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded shadow-sm border"><FaMapMarkerAlt className="text-red-400"/> {evt.hall}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>

                    <Link href="/takvim" className="mt-6 block w-full py-4 rounded-2xl bg-gray-900 text-white text-center text-sm font-bold shadow-lg hover:bg-red-600 transition duration-300 relative z-10">
                        Tüm Takvimi Görüntüle
                    </Link>
                </div>
            </div>
        </div>

        {/* --- SALONLAR (KARTLAR) --- */}
        <section className="mb-8">
          <div className="text-center mb-10">
            <span className="text-red-600 font-bold text-sm tracking-widest uppercase mb-2 block">Rezervasyon</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Etkinlik Salonlarımız</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
                { id: 'mavi', name: 'Mavi Salon', color: 'bg-gradient-to-br from-blue-600 to-blue-800', icon: 'M', desc: 'Geniş katılımlı konferanslar.' },
                { id: 'pembe', name: 'Pembe Salon', color: 'bg-gradient-to-br from-pink-500 to-pink-700', icon: 'P', desc: 'Seminerler ve kulüp etkinlikleri.' },
                { id: 'konferans', name: 'Konferans Salonu', color: 'bg-gradient-to-br from-orange-500 to-orange-700', icon: 'K', desc: 'Akademik sunumlar ve toplantılar.' }
            ].map((salon) => (
                <Link key={salon.id} href={`/takvim?salon=${salon.id}`} className="group relative bg-white rounded-[2rem] p-1 overflow-hidden shadow-lg hover:shadow-2xl transition duration-500 hover:-translate-y-2">
                    <div className="bg-white rounded-[1.8rem] p-8 h-full flex flex-col items-center text-center relative z-10">
                        <div className={`w-16 h-16 rounded-3xl ${salon.color} text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-lg transform group-hover:rotate-12 transition duration-500`}>
                            {salon.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-red-600 transition">{salon.name}</h3>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">{salon.desc}</p>
                        
                        <span className="mt-auto text-sm font-bold text-gray-900 bg-gray-100 px-5 py-2.5 rounded-xl group-hover:bg-gray-900 group-hover:text-white transition flex items-center gap-2">
                            Takvimi Gör <FaChevronRight size={10}/>
                        </span>
                    </div>
                </Link>
            ))}
          </div>
        </section>

      </main>
      
      <footer className="bg-white border-t border-gray-200 py-10 text-center">
        <p className="font-bold text-gray-800">&copy; 2025 Ondokuz Mayıs Üniversitesi</p>
      </footer>
    </div>
  );
}