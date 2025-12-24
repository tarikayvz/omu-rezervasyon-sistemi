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
  FaCalendarCheck,
} from 'react-icons/fa';
import API_URL from '../utils/api';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const BASE_URL = API_URL.replace('/api', '');
const getImageUrl = (img) =>
  img ? (img.startsWith('http') ? img : `${BASE_URL}${img}`) : '';

/* ---------------- MAIN SLIDER ---------------- */
function MainNewsSlider({ announcements }) {
  return (
    <div className="w-full h-[300px] sm:h-[340px] md:h-[480px] rounded-[2rem] overflow-hidden shadow-2xl bg-gray-900 border border-gray-800">
      {announcements.length > 0 ? (
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          slidesPerView={1}
          effect="fade"
          loop
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          className="h-full w-full"
        >
          {announcements.map((ann) => (
            <SwiperSlide key={ann.id}>
              <Link href={`/duyuru/${ann.id}`} className="block w-full h-full">
                <img
                  src={getImageUrl(ann.images?.[0])}
                  alt={ann.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
                  <div className="inline-flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                    <FaCalendarAlt />
                    {new Date(ann.date).toLocaleDateString('tr-TR')}
                  </div>
                  <h3 className="text-xl md:text-4xl font-extrabold text-white mb-3 line-clamp-2">
                    {ann.title}
                  </h3>
                  <span className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold">
                    Detayları İncele <FaArrowRight />
                  </span>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500 text-5xl font-black">
          OMÜ
        </div>
      )}
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function Home() {
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [resAnn, resEvt] = await Promise.all([
        axios.get(`${API_URL}/announcements`),
        axios.get(`${API_URL}/events`),
      ]);

      setAnnouncements(resAnn.data);
      setUpcomingEvents(
        resEvt.data
          .filter(
            (e) => e.isApproved && new Date(e.endDate) >= new Date()
          )
          .sort(
            (a, b) =>
              new Date(a.startDate) - new Date(b.startDate)
          )
          .slice(0, 5)
      );
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />

      {/* MOBİL FULL WIDTH */}
      <main className="container mx-auto max-w-7xl px-0 md:px-6 py-4 flex-grow overflow-x-hidden">
        <div className="grid lg:grid-cols-12 gap-8 mb-16">
          {/* SOL */}
          <div className="lg:col-span-8 space-y-10">
            {/* SLIDER */}
            <section className="-mx-4 md:mx-0">
              <div className="flex items-center gap-3 mb-4 pl-4 md:pl-1">
                <span className="w-1.5 h-8 bg-red-600 rounded-full" />
                <h2 className="text-2xl font-extrabold">
                  Duyurular & Haberler
                </h2>
              </div>
              <MainNewsSlider announcements={announcements} />
            </section>

            {/* TÜM DUYURULAR */}
            {announcements.length > 0 && (
              <section className="-mx-4 md:mx-0">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 pl-4 md:pl-1">
                  Tüm Duyurular
                </h3>

                <Swiper
                  modules={[Pagination]}
                  spaceBetween={12}
                  slidesPerView={1}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 2.5 },
                  }}
                  pagination={{ clickable: true }}
                  className="pb-10 px-4 md:px-0"
                >
                  {announcements.map((ann) => (
                    <SwiperSlide key={ann.id}>
                      <Link
                        href={`/duyuru/${ann.id}`}
                        className="flex bg-white p-3 rounded-2xl shadow border gap-4 h-28"
                      >
                        <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden">
                          {ann.images?.[0] ? (
                            <img
                              src={getImageUrl(ann.images[0])}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              OMÜ
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] text-gray-400 font-bold">
                            {new Date(ann.date).toLocaleDateString(
                              'tr-TR'
                            )}
                          </span>
                          <h4 className="font-bold text-sm line-clamp-2">
                            {ann.title}
                          </h4>
                          <span className="text-xs text-blue-600 font-bold mt-auto">
                            Oku →
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
          <div className="lg:col-span-4 px-4 md:px-0">
            <div className="bg-white rounded-[2rem] shadow-xl border p-4 md:p-6 w-full">
              <h2 className="text-xl font-extrabold mb-6 flex items-center gap-3">
                <FaCalendarCheck className="text-blue-600" />
                Yaklaşan Etkinlikler
              </h2>

              <div className="space-y-3 max-h-none md:max-h-[400px] overflow-visible md:overflow-y-auto">
                {upcomingEvents.length === 0 ? (
                  <p className="text-gray-400 text-center">
                    Etkinlik yok
                  </p>
                ) : (
                  upcomingEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="flex gap-4 items-center p-3 bg-gray-50 rounded-2xl"
                    >
                      <div className="bg-white rounded-xl p-2 text-center min-w-[55px]">
                        <span className="block font-black">
                          {new Date(evt.startDate).getDate()}
                        </span>
                        <span className="text-[10px] uppercase">
                          {new Date(
                            evt.startDate
                          ).toLocaleString('tr-TR', {
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-sm line-clamp-1">
                          {evt.title}
                        </h4>
                        <div className="flex gap-2 text-xs text-gray-500">
                          <span>
                            <FaClock />{' '}
                            {new Date(
                              evt.startDate
                            ).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>
                            <FaMapMarkerAlt /> {evt.hall}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Link
                href="/takvim"
                className="block mt-6 w-full text-center bg-gray-900 text-white py-4 rounded-2xl font-bold"
              >
                Tüm Takvimi Gör
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t py-8 text-center font-bold">
        © 2025 Ondokuz Mayıs Üniversitesi
      </footer>
    </div>
  );
}
