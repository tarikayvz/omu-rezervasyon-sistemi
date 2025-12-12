'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react'; 
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaCheckCircle, FaPrint } from 'react-icons/fa';
import Header from '../../../components/Header';

export default function BiletPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/events`);
        const found = res.data.find(e => e.id.toString() === id);
        setEvent(found);
        setLoading(false);
      } catch (error) { console.error(error); setLoading(false); }
    };
    if (id) fetchEvent();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center font-bold text-gray-500">Bilet hazırlanıyor...</div>;
  if (!event) return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-red-500">Bilet bulunamadı!</div>;

  return (
    <div className="min-h-screen bg-gray-200 font-sans print:bg-white py-10 px-4">
      <div className="print:hidden mb-8"><Header /></div>
      
      <div className="max-w-sm mx-auto relative drop-shadow-2xl">
        {/* Üst Kısım - Delikli Kenar */}
        <div className="bg-gray-900 text-white p-8 rounded-t-3xl relative overflow-hidden">
             {/* Dekoratif Daireler */}
             <div className="absolute top-[-40px] right-[-40px] w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
             
             <div className="text-center">
                 <p className="text-xs font-bold tracking-[0.3em] text-gray-400 mb-2 uppercase">Giriş Bileti</p>
                 <h1 className="text-2xl font-extrabold leading-tight mb-4">{event.title}</h1>
                 <div className="inline-block bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/30">
                    <FaCheckCircle className="inline mr-1" /> REZERVASYON ONAYLANDI
                 </div>
             </div>
        </div>

        {/* Orta Kısım - Beyaz ve Detaylar */}
        <div className="bg-white p-8 relative">
             {/* Sol ve Sağdaki Yarım Daire Kesikler (Bilet Efekti) */}
             <div className="absolute top-[-10px] left-[-10px] w-5 h-5 bg-gray-200 rounded-full"></div>
             <div className="absolute top-[-10px] right-[-10px] w-5 h-5 bg-gray-200 rounded-full"></div>

             <div className="space-y-6">
                <div className="flex justify-between border-b border-dashed border-gray-200 pb-4">
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Tarih</p>
                        <p className="text-gray-900 font-bold text-lg flex items-center gap-2"><FaCalendarAlt className="text-omu-red"/> {new Date(event.startDate).getDate()} {new Date(event.startDate).toLocaleString('tr-TR', { month: 'short' })}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Saat</p>
                        <p className="text-gray-900 font-bold text-lg flex items-center gap-2">{new Date(event.startDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} <FaClock className="text-gray-400"/></p>
                    </div>
                </div>
                
                <div>
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Salon & Konum</p>
                    <p className="text-xl font-bold text-gray-800 uppercase flex items-center gap-2"><FaMapMarkerAlt className="text-blue-600"/> {event.hall} Salon</p>
                    <p className="text-xs text-gray-500 mt-1 pl-6">Mühendislik Fakültesi, 1. Kat</p>
                </div>

                <div>
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Ziyaretçi</p>
                    <p className="font-bold text-gray-800 flex items-center gap-2"><FaUser className="bg-gray-100 p-1 rounded-full text-gray-500 box-content"/> {event.organizer}</p>
                </div>
             </div>
        </div>

        {/* Alt Kısım - QR Kod */}
        <div className="bg-gray-50 p-8 rounded-b-3xl border-t border-dashed border-gray-300 relative flex flex-col items-center">
             <div className="absolute top-[-10px] left-[-10px] w-5 h-5 bg-gray-200 rounded-full"></div>
             <div className="absolute top-[-10px] right-[-10px] w-5 h-5 bg-gray-200 rounded-full"></div>

             <div className="bg-white p-3 rounded-xl shadow-sm mb-4">
                <QRCodeSVG value={`OMU-${event.id}-${event.startDate}`} size={140} />
             </div>
             <p className="text-[10px] text-gray-400 font-mono tracking-widest">ID: {event.id}-2025-REZ</p>
        </div>
      </div>

      <div className="text-center mt-8 print:hidden">
        <button onClick={() => window.print()} className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-black transition flex items-center gap-2 mx-auto">
            <FaPrint /> Bileti Yazdır
        </button>
      </div>
    </div>
  );
}