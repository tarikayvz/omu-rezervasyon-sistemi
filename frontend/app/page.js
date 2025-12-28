"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Header from "../components/Header"
import Link from "next/link"
import { FaChevronRight, FaCalendarAlt, FaMapMarkerAlt, FaArrowRight, FaClock, FaCalendarCheck } from "react-icons/fa"

// --- AYARLAR ---
const RENDER_BACKEND_URL = "https://omu-backend.onrender.com"; 

const getBaseUrl = () => {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000"; 
  }
  return RENDER_BACKEND_URL;
};

const API_URL = `${getBaseUrl()}/api`;

// --- SWIPER ---
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/effect-fade"

// --- AKILLI RESİM ÇÖZÜCÜ ---
const getImageUrl = (imageData) => {
    if (!imageData) return "https://placehold.co/100x100?text=Resim+Yok";
    let url = "";

    if (Array.isArray(imageData) && imageData.length > 0) {
        url = imageData[0]; 
    } 
    else if (typeof imageData === 'string') {
        if (imageData.startsWith('[')) {
            try {
                const parsed = JSON.parse(imageData);
                url = parsed[0];
            } catch (e) {
                url = imageData;
            }
        } else {
            url = imageData;
        }
    }

    if (url && (url.startsWith('data:') || url.startsWith('http'))) {
        return url;
    }
    return "https://placehold.co/100x100?text=Hata";
};

// --- 1. MANŞET SLIDER ---
function MainNewsSlider({ announcements }) {
  const shouldLoop = announcements.length > 1;

  return (
    <div className="w-full max-w-full h-[320px] md:h-[480px] rounded-[30px] overflow-hidden shadow-2xl bg-black border border-gray-800 relative z-0">
      {announcements.length > 0 ? (
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          slidesPerView={1}
          effect={"fade"}
          fadeEffect={{ crossFade: true }}
          loop={shouldLoop} 
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true, dynamicBullets: true }}
          navigation={true}
          className="h-full w-full"
        >
          {announcements.map((ann) => {
             const rawImage = ann.image || ann.images;
             const imgUrl = getImageUrl(rawImage);

             return (
            <SwiperSlide key={ann.id} className="relative w-full h-full bg-black flex items-center justify-center">
              <Link href={`/duyuru/${ann.id}`} className="block w-full h-full relative">
                <img
                  src={imgUrl}
                  alt={ann.title}
                  className="w-full h-full object-contain opacity-90" 
                  onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = "https://placehold.co/600x400?text=Yuklenemedi";
                  }}
                />
                <div className="absolute bottom-0 left-0 w-full p-6 z-20 bg-gradient-to-t from-black/90 to-transparent pt-20">
                  <div className="inline-flex items-center gap-2 bg-[#E30613] text-white text-[10px] font-bold px-3 py-1 rounded-full mb-2 shadow-lg">
                    <FaCalendarAlt /> {new Date(ann.date).toLocaleDateString("tr-TR")}
                  </div>
                  <h3 className="text-xl md:text-3xl font-extrabold text-white leading-tight mb-2 line-clamp-2 drop-shadow-md">
                    {ann.title}
                  </h3>
                  <div className="flex items-center gap-2 text-white text-xs font-bold mt-1">
                    Detayları İncele <FaArrowRight className="text-[#E30613]" />
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          )})}
        </Swiper>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <span className="text-4xl font-black text-gray-800 tracking-tighter">OMÜ</span>
        </div>
      )}
      <style jsx global>{`
          .swiper-pagination-bullet { background: rgba(255,255,255,0.4); opacity: 1; }
          .swiper-pagination-bullet-active { background: #E30613 !important; width: 20px; border-radius: 4px; transition: all 0.3s; }
          @media (max-width: 768px) { .swiper-button-next, .swiper-button-prev { display: none !important; } }
        `}</style>
    </div>
  )
}

export default function Home() {
  const [announcements, setAnnouncements] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resAnn, resEvt] = await Promise.all([
          axios.get(`${API_URL}/announcements`), 
          axios.get(`${API_URL}/events`),
        ])
        
        setAnnouncements(resAnn.data)
        setUpcomingEvents(
          resEvt.data
            .filter((e) => e.isApproved && new Date(e.endDate) >= new Date())
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
            .slice(0, 5),
        )
      } catch (error) {
        console.error("Veri Çekme Hatası:", error)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col overflow-x-hidden">
      <Header />

      {/* --- GÜNCELLENMİŞ HERO ALANI (DAHA KÜÇÜK) --- */}
      {/* Yükseklik h-[250px] md:h-[300px] olarak ayarlandı */}
      <div className="relative bg-gradient-to-r from-red-900 via-red-800 to-red-900 h-[250px] md:h-[300px] w-full overflow-hidden flex flex-col items-center justify-center text-center px-4">
         
         {/* Desen */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
         
         {/* Işık Efekti */}
         <div className="absolute top-0 left-1/4 w-80 h-80 bg-red-600 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-pulse"></div>
         <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-orange-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

         {/* Yazılar (Boyutlar ve boşluklar küçültüldü) */}
         <div className="relative z-10 max-w-3xl space-y-3 mt-2">
             <span className="inline-block py-0.5 px-2.5 rounded-full bg-red-800/50 border border-red-700 text-red-100 text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1 backdrop-blur-sm">
                Mühendislik Fakültesi
             </span>
             {/* Başlık boyutu küçültüldü: text-2xl md:text-4xl */}
             <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-lg">
                Duyurular ve Etkinlikler
             </h1>
             {/* Alt metin boyutu küçültüldü: text-sm md:text-base */}
             <p className="text-sm md:text-base text-red-100/90 max-w-xl mx-auto font-light leading-relaxed">
                Fakültemizden en güncel akademik haberlere, etkinliklere ve duyurulara buradan ulaşabilirsiniz.
             </p>
         </div>

         {/* Alt Geçiş (Yükseklik h-16 olarak ayarlandı) */}
         <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>
      {/* --- HERO SONU --- */}

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 py-6 flex-grow overflow-x-hidden -mt-8 relative z-20">
        <div className="grid lg:grid-cols-12 gap-8 md:gap-10 mb-16">
          
          {/* SOL TARAF */}
          <div className="lg:col-span-8 space-y-8 overflow-hidden">
            <section className="overflow-hidden">
              <div className="flex items-center gap-2 mb-3 pl-1">
                <span className="w-1.5 h-6 bg-[#E30613] rounded-full"></span>
                <h2 className="text-xl font-extrabold text-gray-900">Öne Çıkanlar</h2>
              </div>
              <MainNewsSlider announcements={announcements} />
            </section>

            {/* DİĞER DUYURULAR */}
            {announcements.length > 0 && (
              <section className="overflow-hidden max-w-full">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">
                  Tüm Duyurular Listesi
                </h3>

                <Swiper
                  modules={[Pagination]}
                  spaceBetween={16}
                  slidesPerView={1}
                  breakpoints={{
                    640: { slidesPerView: 2, spaceBetween: 20 },
                    1024: { slidesPerView: 2, spaceBetween: 20 },
                  }}
                  pagination={{ clickable: true }}
                  className="pb-8 !overflow-visible"
                  style={{ overflow: "hidden" }}
                >
                  {announcements.map((ann) => {
                    const rawImage = ann.image || ann.images;
                    const imgUrl = getImageUrl(rawImage);
                    
                    return (
                    <SwiperSlide key={ann.id} className="!w-full">
                      <Link
                        href={`/duyuru/${ann.id}`}
                        className="flex bg-white p-3 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition gap-3 items-center h-24"
                      >
                        <div className="w-20 h-20 bg-black rounded-xl overflow-hidden flex-shrink-0 relative border border-gray-200">
                           <img
                             src={imgUrl}
                             className="w-full h-full object-contain"
                             alt={ann.title}
                             onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Resim+Yok" }}
                           />
                        </div>
                        <div className="flex flex-col justify-center h-full py-1 min-w-0">
                          <span className="text-[10px] font-bold text-gray-400 mb-0.5">
                            {new Date(ann.date).toLocaleDateString("tr-TR")}
                          </span>
                          <h4 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2">{ann.title}</h4>
                          <span className="text-[10px] text-blue-600 font-bold mt-auto flex items-center gap-1">
                            Oku <FaArrowRight size={8} />
                          </span>
                        </div>
                      </Link>
                    </SwiperSlide>
                  )})}
                </Swiper>
              </section>
            )}
          </div>

          {/* SAĞ TARAF */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[24px] shadow-lg border border-gray-100 p-5 relative overflow-hidden">
              <h2 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2 relative z-10">
                <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">
                  <FaCalendarCheck size={14} />
                </span>
                Yaklaşan Etkinlikler
              </h2>

              <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar relative z-10">
                {upcomingEvents.length === 0 ? (
                  <p className="text-gray-400 text-center py-4 text-sm">Etkinlik yok.</p>
                ) : (
                  upcomingEvents.map((evt) => (
                    <div key={evt.id} className="flex gap-3 items-center p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="bg-white text-blue-700 rounded-lg p-1.5 text-center min-w-[50px] shadow-sm border border-gray-100">
                        <span className="block text-base font-black leading-none">
                          {new Date(evt.startDate).getDate()}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wide">
                          {new Date(evt.startDate).toLocaleString("tr-TR", { month: "short" })}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-gray-900 text-xs line-clamp-1 mb-0.5">{evt.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                          <span className="flex items-center gap-1">
                            <FaClock className="text-blue-400" />{" "}
                            {new Date(evt.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded shadow-sm border">
                            <FaMapMarkerAlt className="text-red-400" /> {evt.hall}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Link href="/takvim" className="mt-4 block w-full py-3 rounded-xl bg-gray-900 text-white text-center text-xs font-bold shadow-md hover:bg-[#E30613] transition duration-300 relative z-10">
                Tüm Takvimi Görüntüle
              </Link>
            </div>
          </div>
        </div>

        {/* SALONLAR */}
        <section className="mb-8">
          <div className="text-center mb-6">
            <span className="text-[#E30613] font-bold text-xs tracking-widest uppercase mb-1 block">Rezervasyon</span>
            <h2 className="text-2xl font-extrabold text-gray-900">Etkinlik Salonlarımız</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { id: "mavi", name: "Mavi Salon", color: "bg-gradient-to-br from-blue-600 to-blue-800", icon: "M", desc: "Geniş katılımlı konferanslar." },
              { id: "pembe", name: "Pembe Salon", color: "bg-gradient-to-br from-pink-500 to-pink-700", icon: "P", desc: "Seminerler ve kulüp etkinlikleri." },
              { id: "konferans", name: "Konferans Salonu", color: "bg-gradient-to-br from-orange-500 to-orange-700", icon: "K", desc: "Akademik sunumlar ve toplantılar." },
            ].map((salon) => (
              <Link key={salon.id} href={`/takvim?salon=${salon.id}`} className="group relative bg-white rounded-[20px] p-1 overflow-hidden shadow-md hover:shadow-xl transition duration-500 hover:-translate-y-1">
                <div className="bg-white rounded-[16px] p-6 h-full flex flex-col items-center text-center relative z-10">
                  <div className={`w-12 h-12 rounded-2xl ${salon.color} text-white flex items-center justify-center text-xl font-bold mb-3 shadow-lg transform group-hover:rotate-6 transition duration-500`}>{salon.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-[#E30613] transition">{salon.name}</h3>
                  <p className="text-gray-500 text-xs mb-4 leading-relaxed">{salon.desc}</p>
                  <span className="mt-auto text-xs font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-lg group-hover:bg-gray-900 group-hover:text-white transition flex items-center gap-2">Takvimi Gör <FaChevronRight size={10} /></span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <footer className="bg-white border-t border-gray-200 py-6 text-center">
        <p className="font-bold text-gray-800 text-sm">&copy; 2025 Ondokuz Mayıs Üniversitesi</p>
      </footer>
    </div>
  )
}