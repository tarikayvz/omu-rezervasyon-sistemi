'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Link from 'next/link';
import {
  FaChevronRight,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaArrowRight,
  FaClock,
  FaCalendarCheck
} from 'react-icons/fa';
import API_URL from '../utils/api';

// --- SWIPER ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const BASE_URL = API_URL.replace('/api', '');
const getImageUrl = (img) =>
  img ? (img.startsWith('http') ? img : `${BASE_URL}${img}`) : '';

// --- MANŞET SLIDER ---
function MainNewsSlider({ announcements }) {
  return (
    <div className="w-full h-[340px] md:h-[480px] rounded-[2rem] overflow-hidden shadow-2xl bg-gray-900 border border-gray-800 relative">
      {announcements.length > 0 ? (
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          slidesPerView={1}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          loop
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true, dynamicBullets: true }}
          navigation
          className="h-full w-full"
        >
          {announcements.map((ann) => (
            <SwiperSlide key={ann.id} className="relative w-full h-full">
              <Link href={`/duyuru/${ann.id}`} className="block w-full h-full">
                <img
                  src={getImageUrl(ann.images?.[0])}
                  alt={ann.title}
                  className="w-full h-full object-cover opacity-90"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-8">
                  <div className="inline-flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                    <FaCalendarAlt />
                    {new Date(ann.date).toLocaleDateString('tr-TR')}
                  </div>

                  <h3 className="text-2xl md:text-4xl font-extrabold text-white mb-3 line-clamp-2">
                    {ann.title}
                  </h3>

                  <div className="flex items-center gap-2 text-white/90 text-sm font-bold bg-white/20 w-max px-4 py-2 rounded-xl backdrop-blur-md hover:bg-white hover:text-red-600 transition">
                    Detayları İncele <FaArrowRight />
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
          <span className="text-5xl font-black opacity-20">OMÜ</span>
        </div>
      )}

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background: #dc2626 !important;
          width: 24px;
          border-radius: 4px;
        }
        @media (max-width: 768px) {
          .swiper-button-next,
          .swiper-button-prev {
            display: none !important;
          }
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
        const [resAnn, resEvt] = await Promise.all([
          axios.get(`${API_URL}/announcements`),
          axios.get(`${API_URL}/events`)
        ]);

        setAnnouncements(resAnn.data);
        setUpcomingEvents(
          resEvt.data
            .filter(
              (e) =>
                e.isApproved && new Date(e.endDate) >= new Date()
            )
            .sort(
              (a, b) =>
                new Date(a.startDate) - new Date(b.startDate)
            )
            .slice(0, 5)
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
      <Header />

      <main className="container mx-auto max-w-7xl px-6 py-6 flex-grow">
        <div className="grid lg:grid-cols-12 gap-10 mb-16">
          {/* SOL */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-1.5 h-8 bg-red-600 rounded-full" />
                <h2 className="text-2xl font-extrabold">
                  Duyurular & Haberler
                </h2>
              </div>

              <MainNewsSlider announcements={announcements} />
            </section>

            {announcements.length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-gray-400 mb-4">
                  Tüm Duyurular
                </h3>

                <Swiper
                  modules={[Pagination]}
                  spaceBetween={15}
                  slidesPerView={1.2}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 2.5 }
                  }}
                  pagination={{ clickable: true }}
                  className="pb-10"
                >
                  {announcements.map((ann) => (
                    <SwiperSlide key={ann.id}>
                      <Link
                        href={`/duyuru/${ann.id}`}
                        className="flex bg-white p-3 rounded-2xl shadow border gap-4 items-center h-28"
                      >
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                          {ann.images?.[0] ? (
                            <img
                              src={getImageUrl(ann.images[0])}
                              className="w-full h-full object-cover"
                              alt={ann.title}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">
                              OMÜ
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-bold text-gray-400">
                            {new Date(
                              ann.date
                            ).toLocaleDateString('tr-TR')}
                          </span>

                          <h4 className="font-bold text-sm line-clamp-2">
                            {ann.title}
                          </h4>

                          <span className="text-xs text-blue-600 font-bold mt-auto flex items-center gap-1">
                            Oku <FaArrowRight size={10} />
                          </span>
                        </div>
                      </Link>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </section>
            )}
          </div>

          {/* SAĞ */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[2rem] shadow-xl p-6">
              <h2 className="text-xl font-extrabold mb-6 flex items-center gap-3">
                <FaCalendarCheck className="text-blue-600" />
                Yaklaşan Etkinlikler
              </h2>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {upcomingEvents.length === 0 ? (
                  <p className="text-gray-400 text-center">
                    Henüz etkinlik yok.
                  </p>
                ) : (
                  upcomingEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="flex gap-4 items-center p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="bg-white text-blue-700 rounded-xl p-2 min-w-[55px] text-center">
                        <span className="block text-lg font-black">
                          {new Date(
                            evt.startDate
                          ).getDate()}
                        </span>
                        <span className="text-[10px] uppercase">
                          {new Date(
                            evt.startDate
                          ).toLocaleString('tr-TR', {
                            month: 'short'
                          })}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm">
                          {evt.title}
                        </h4>
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaClock />
                            {new Date(
                              evt.startDate
                            ).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaMapMarkerAlt />
                            {evt.hall}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Link
                href="/takvim"
                className="block mt-6 bg-gray-900 text-white text-center py-3 rounded-xl font-bold hover:bg-red-600"
              >
                Tüm Takvimi Görüntüle
              </Link>
            </div>
          </div>
        </div>

        {/* SALONLAR */}
        <section>
          <div className="text-center mb-10">
            <span className="text-red-600 font-bold text-sm uppercase">
              Rezervasyon
            </span>
            <h2 className="text-3xl font-extrabold">
              Etkinlik Salonlarımız
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                id: 'mavi',
                name: 'Mavi Salon',
                color: 'from-blue-600 to-blue-800',
                desc: 'Geniş katılımlı konferanslar.'
              },
              {
                id: 'pembe',
                name: 'Pembe Salon',
                color: 'from-pink-500 to-pink-700',
                desc: 'Seminerler ve kulüp etkinlikleri.'
              },
              {
                id: 'konferans',
                name: 'Konferans Salonu',
                color: 'from-orange-500 to-orange-700',
                desc: 'Akademik sunumlar.'
              }
            ].map((salon) => (
              <Link
                key={salon.id}
                href={`/takvim?salon=${salon.id}`}
                className="group bg-white rounded-[2rem] p-8 text-center shadow hover:shadow-xl transition"
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-3xl bg-gradient-to-br ${salon.color} text-white flex items-center justify-center text-xl font-bold`}
                >
                  {salon.name[0]}
                </div>

                <h3 className="text-xl font-bold">
                  {salon.name}
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  {salon.desc}
                </p>

                <span className="inline-flex items-center gap-2 font-bold">
                  Takvimi Gör <FaChevronRight size={10} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-white border-t py-10 text-center">
        <p className="font-bold">
          © 2025 Ondokuz Mayıs Üniversitesi
        </p>
      </footer>
    </div>
  );
}
