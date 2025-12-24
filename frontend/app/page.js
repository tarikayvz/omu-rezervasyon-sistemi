'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Link from 'next/link';
import { FaChevronRight, FaCalendarAlt, FaMapMarkerAlt, FaArrowRight, FaClock, FaCalendarCheck } from 'react-icons/fa';


// --- NETFLIX STİLİ SLIDER (Resim Sığdırma Çözümü) ---
function AnnouncementSlider({ images, title, link, date }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000); 
    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="group relative h-[450px] w-full overflow-hidden rounded-3xl shadow-lg cursor-pointer bg-gray-900 border border-gray-800">
       <Link href={link} className="block w-full h-full relative">
          {images.length > 0 ? (
            images.map((img, index) => (
                <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center justify-center ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}>
                    {/* 1. KATMAN: Arka Plan (Bulanık ve Dolduran) */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center blur-xl opacity-60 scale-110" 
                        style={{ backgroundImage: `url(http://localhost:5000${img})` }}
                    ></div>
                    
                    {/* 2. KATMAN: Ön Plan (Net ve Sığdırılmış Resim) */}
                    <img 
                        src={`http://localhost:5000${img}`} 
                        alt={title} 
                        className="relative w-full h-full object-contain z-10 drop-shadow-2xl" 
                    />
                </div>
            ))
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center"><span className="text-4xl font-bold text-gray-700">OMÜ</span></div>
          )}
          
          {/* İçerik Yazısı (Altta) */}
          <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-black via-black/60 to-transparent z-20">
             <div className="inline-flex items-center gap-2 bg-omu-red text-white text-xs font-bold px-3 py-1 rounded-full mb-3 shadow-lg border border-red-500/50">
                <FaCalendarAlt /> {new Date(date).toLocaleDateString('tr-TR')}
             </div>
             <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2 drop-shadow-md line-clamp-2">{title}</h3>
             <span className="text-gray-300 text-sm font-bold flex items-center gap-2 group-hover:text-white transition">
                Detayları İncele <FaArrowRight className="transform group-hover:translate-x-1 transition"/>
             </span>
          </div>
       </Link>

       {/* Slayt Noktaları */}
       {images.length > 1 && (
         <div className="absolute bottom-8 right-8 flex gap-2 z-30">
            {images.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-8 bg-omu-red' : 'w-2 bg-white/40'}`}></div>
            ))}
         </div>
       )}
    </div>
  );
}

export default function Home() {
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]); // Sağ taraf (Ajanda) için

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Duyuruları Çek
        const resAnn = await axios.get('http://localhost:5000/api/announcements');
        setAnnouncements(resAnn.data);
        
        // 2. Etkinlikleri Çek (Sağ taraf için)
        const resEvt = await axios.get('http://localhost:5000/api/events');
        
        // Sadece onayı alınmış ve tarihi geçmemiş etkinlikleri filtrele
        const futureEvents = resEvt.data
            .filter(e => e.isApproved && new Date(e.endDate) >= new Date()) // Gelecek ve Onaylı
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))  // Tarihe göre sırala (En yakın en üstte)
            .slice(0, 5); // İlk 5 tanesini al

        setUpcomingEvents(futureEvents);
      } catch (error) { console.error(error); }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      
      <main className="container mx-auto px-4 py-10">
        
        {/* --- İKİYE BÖLÜNMÜŞ ÜST KISIM (Manşet & Ajanda) --- */}
        <div className="grid lg:grid-cols-12 gap-8 mb-16">
            
            {/* SOL TARAFFER (%66): MANŞET DUYURULAR */}
            <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-l-4 border-omu-red pl-3">
                        Duyurular & Haberler
                    </h2>
                </div>

                {announcements.length > 0 ? (
                    <>
                        {/* Büyük Slider */}
                        <AnnouncementSlider 
                            images={announcements[0].images || []} 
                            title={announcements[0].title} 
                            link={`/duyuru/${announcements[0].id}`}
                            date={announcements[0].date}
                        />
                        
                        {/* Altındaki Küçük Kartlar (Varsa) */}
                        {announcements.length > 1 && (
                            <div className="grid md:grid-cols-2 gap-4 mt-6">
                                {announcements.slice(1, 3).map((ann) => (
                                    <Link key={ann.id} href={`/duyuru/${ann.id}`} className="flex bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition gap-4 border border-gray-100 group items-center">
                                        <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative border border-gray-100">
                                            {ann.images && ann.images[0] ? (
                                                <img src={`http://localhost:5000${ann.images[0]}`} className="w-full h-full object-cover group-hover:scale-110 transition duration-500"/>
                                            ) : <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">OMÜ</div>}
                                        </div>
                                        <div className="flex flex-col justify-center min-w-0">
                                            <span className="text-xs font-bold text-gray-400 mb-1">{new Date(ann.date).toLocaleDateString('tr-TR')}</span>
                                            <h3 className="font-bold text-gray-800 text-base leading-snug line-clamp-2 group-hover:text-omu-red transition">{ann.title}</h3>
                                            <span className="text-xs text-blue-600 font-bold mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition transform translate-y-2 group-hover:translate-y-0">Oku <FaArrowRight size={10}/></span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-3xl h-64 flex items-center justify-center shadow-sm border border-gray-200">
                        <p className="text-gray-400 font-medium">Henüz duyuru yayınlanmamış.</p>
                    </div>
                )}
            </div>

            {/* SAĞ TARAF (%33): YAKLAŞAN ETKİNLİKLER (AJANDA) */}
            <div className="lg:col-span-4">
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 h-full flex flex-col relative overflow-hidden">
                    {/* Dekoratif Arka Plan */}
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
                                    {/* Tarih Kutusu */}
                                    <div className="bg-blue-50 text-blue-700 rounded-xl p-2 text-center min-w-[60px] shadow-sm border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition duration-300">
                                        <span className="block text-xl font-extrabold leading-none">{new Date(evt.startDate).getDate()}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wide">{new Date(evt.startDate).toLocaleString('tr-TR', { month: 'short' })}</span>
                                    </div>
                                    
                                    {/* Bilgi */}
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

        {/* --- SALONLAR (Alt Kısım) --- */}
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
                    {/* Hover Border Effect */}
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