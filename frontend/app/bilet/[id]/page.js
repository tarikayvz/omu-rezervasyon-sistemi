'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
// DÜZELTİLEN KISIMLAR (Dosya yolları 3 seviye yukarı çıkmalı):
import API_URL from '../../../utils/api'; 
import Header from '../../../components/Header'; 
// -------------------------------------------------------------
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaCheckCircle, FaPrint, FaArrowLeft } from 'react-icons/fa';
import { QRCodeCanvas } from 'qrcode.react'; // Eğer bu paket yoksa 'npm install qrcode.react' yapman gerekebilir, yoksa bu satırı silip aşağıdan QR kısmını kaldırabilirsin.

export default function BiletPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const ticketRef = useRef();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`${API_URL}/events`);
        // ID'ye göre doğru etkinliği bul (Backend'de tekil getirme endpointi varsa o da kullanılabilir)
        const foundEvent = res.data.find(e => e.id.toString() === id);
        setEvent(foundEvent);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Bilet yükleniyor...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Bilet bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-gray-100 font-sans print:bg-white">
      <div className="print:hidden">
        <Header />
      </div>

      <div className="container mx-auto px-4 py-10 flex flex-col items-center justify-center">
        
        {/* Geri Dön Butonu (Yazdırırken gizlenir) */}
        <div className="w-full max-w-3xl mb-6 flex justify-between items-center print:hidden">
            <button onClick={() => router.push('/takvim')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-bold transition">
                <FaArrowLeft /> Takvime Dön
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-xl font-bold hover:bg-black transition shadow-lg">
                <FaPrint /> Yazdır / PDF İndir
            </button>
        </div>

        {/* BİLET KARTI */}
        <div ref={ticketRef} className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-200 print:shadow-none print:border-2 print:border-black">
            
            {/* Sol Taraf (Detaylar) */}
            <div className="flex-grow p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-omu-red/10 rounded-bl-full -mr-10 -mt-10"></div>
                
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-omu-red text-white rounded-xl flex items-center justify-center text-2xl font-bold">O</div>
                    <div>
                        <h1 className="text-sm font-bold text-gray-400 uppercase tracking-widest">GİRİŞ BİLETİ</h1>
                        <p className="text-xs text-gray-400">OMÜ Mühendislik Fakültesi</p>
                    </div>
                </div>

                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 leading-tight">{event.title}</h2>

                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><FaUser/> Düzenleyen</p>
                        <p className="font-bold text-gray-800">{event.organizer}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><FaMapMarkerAlt/> Salon</p>
                        <p className="font-bold text-gray-800 uppercase">{event.hall} Salon</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><FaCalendarAlt/> Tarih</p>
                        <p className="font-bold text-gray-800">{new Date(event.startDate).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><FaClock/> Saat</p>
                        <p className="font-bold text-gray-800">
                            {new Date(event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                            {new Date(event.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                    <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-lg w-max">
                        <FaCheckCircle /> Rezervasyon Onaylandı
                    </div>
                </div>
            </div>

            {/* Sağ Taraf (QR Kod Kısmı) - Kesikli Çizgi ile Ayrılmış */}
            <div className="bg-gray-50 p-8 md:w-80 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l-2 border-dashed border-gray-300 relative print:bg-white">
                {/* Çentikler (Süsleme) */}
                <div className="absolute -left-3 top-0 bottom-0 m-auto w-6 h-6 bg-gray-100 rounded-full md:block hidden"></div>
                <div className="absolute -right-3 top-0 bottom-0 m-auto w-6 h-6 bg-gray-100 rounded-full md:block hidden"></div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4">
                     {/* QR Kod Bileşeni - Basitçe ID'yi gömer */}
                     <QRCodeCanvas value={`OMU-EVENT-${event.id}`} size={120} />
                </div>
                
                <p className="text-center text-xs text-gray-500 mb-1">Bilet No</p>
                <p className="text-center font-mono font-bold text-lg tracking-widest text-gray-800">#{event.id.toString().padStart(6, '0')}</p>
                
                <p className="text-center text-[10px] text-gray-400 mt-6 px-4">
                    Bu QR kodu etkinlik girişinde görevliye okutunuz.
                </p>
            </div>
        </div>

        <p className="mt-8 text-gray-400 text-sm print:hidden">© 2025 Ondokuz Mayıs Üniversitesi</p>
      </div>
    </div>
  );
}