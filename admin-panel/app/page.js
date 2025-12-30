'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSignOutAlt, FaSearch, FaFileExcel, FaCalendarAlt } from 'react-icons/fa'; // Gerekli ikonlar
import { useRouter } from 'next/navigation';
import DashboardStats from '../components/DashboardStats';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import API_URL from '../utils/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) router.push('/login');
    else fetchEvents();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredEvents(events);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredEvents(events.filter(e => e.title.toLowerCase().includes(lower) || e.organizer.toLowerCase().includes(lower) || e.hall.toLowerCase().includes(lower)));
    }
  }, [searchTerm, events]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_URL}/events?admin=true`);
      setEvents(response.data);
      setFilteredEvents(response.data);
      setLoading(false);
    } catch (error) { console.error(error); setLoading(false); }
  };

  const handleLogout = () => { localStorage.removeItem('adminToken'); router.push('/login'); };

  const exportToExcel = () => {
    const data = filteredEvents.map(e => ({ 'Başlık': e.title, 'Salon': e.hall, 'Başlangıç': new Date(e.startDate).toLocaleString('tr-TR'), 'Düzenleyen': e.organizer, 'Durum': e.isApproved ? 'Onaylı' : 'Bekliyor' }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rapor");
    XLSX.writeFile(wb, "OMU_Rezervasyon_Rapor.xlsx");
  };

  const handleApprove = async (id) => {
    try { 
        await axios.put(`${API_URL}/events/${id}/approve`); 
        closeModal(); 
        fetchEvents(); 
        toast.success('Etkinlik onaylandı! ✅'); 
    } 
    catch (error) { toast.error('Hata oluştu.'); }
  };

  const handleDelete = async (e, id) => { 
    if (e && e.stopPropagation) e.stopPropagation(); 
    if(!confirm('Silmek istediğine emin misin?')) return;
    try { 
        await axios.delete(`${API_URL}/events/${id}`); 
        closeModal(); 
        fetchEvents(); 
        toast.info('Etkinlik silindi.'); 
    } 
    catch (error) { toast.error('Hata oluştu.'); }
  };

  const openModal = (e) => { setSelectedEvent(e); document.body.style.overflow = 'hidden'; };
  const closeModal = () => { setSelectedEvent(null); document.body.style.overflow = 'unset'; };

  const pendingEvents = filteredEvents.filter(e => !e.isApproved);
  const approvedEvents = filteredEvents.filter(e => e.isApproved);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2 cursor-pointer" onClick={() => router.push('/admin')}>
            <span className="w-8 h-8 bg-omu-red text-white rounded-lg flex items-center justify-center">O</span>
            OMÜ Admin
        </h1>
        <div className="flex gap-3">
            <button onClick={() => router.push('/duyurular')} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-200 transition">Duyurular</button>
            <button onClick={() => router.push('/yorumlar')} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-200 transition">Yorumlar</button>
            <button onClick={() => router.push('/video-yonetimi')} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-200 transition">Video Yönetimi</button>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-sm hover:bg-red-100 transition flex items-center gap-2"><FaSignOutAlt /> Çıkış</button>
        </div>
      </header>

      <div className="container mx-auto p-8 max-w-7xl">
        {!loading && <DashboardStats events={events} />}

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="relative w-full md:w-1/2">
                <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
                <input type="text" placeholder="Hızlı arama yap..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition text-gray-700 font-medium" />
            </div>
            <button onClick={exportToExcel} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition shadow-lg shadow-green-200"><FaFileExcel /> Rapor İndir</button>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div> Onay Bekleyen Talepler
          </h2>
          {pendingEvents.length === 0 ? <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">Bekleyen talep yok.</div> : (
            <div className="grid gap-5">
              {pendingEvents.map(event => (
                <div key={event.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col md:flex-row justify-between items-center group">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wide">{event.hall} Salon</span>
                        <span className="text-sm text-gray-500 flex items-center gap-1 font-medium"><FaCalendarAlt className="text-gray-400"/> {new Date(event.startDate).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">{event.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{event.organizer} • {event.department}</p>
                  </div>
                  <div className="flex gap-3 mt-4 md:mt-0">
                    <button onClick={() => openModal(event)} className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 text-sm">İncele</button>
                    <button onClick={() => handleApprove(event.id)} className="bg-black text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition flex items-center gap-2 text-sm shadow-lg shadow-gray-200">Onayla</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div> Onaylanmış Etkinlikler
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <table className="min-w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                    <tr><th className="px-6 py-4">Tarih</th><th className="px-6 py-4">Salon</th><th className="px-6 py-4">Etkinlik</th><th className="px-6 py-4">Düzenleyen</th><th className="px-6 py-4 text-right">İşlem</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {approvedEvents.map(event => (
                    <tr 
                        key={event.id} 
                        onClick={() => openModal(event)} 
                        className="hover:bg-blue-50 transition cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">{new Date(event.startDate).toLocaleDateString('tr-TR')}</td>
                      <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${event.hall.includes('mavi')?'bg-blue-100 text-blue-700':event.hall.includes('pembe')?'bg-pink-100 text-pink-700':'bg-orange-100 text-orange-700'}`}>{event.hall}</span></td>
                      <td className="px-6 py-4 font-bold text-gray-800">{event.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{event.organizer}</td>
                      <td className="px-6 py-4 text-right">
                          <button 
                            onClick={(e) => handleDelete(e, event.id)} 
                            className="text-red-500 hover:text-red-700 font-bold text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                          >
                            Sil
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="bg-white p-8 border-b border-gray-100 flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2"><FaCalendarAlt className="text-blue-500"/> {new Date(selectedEvent.startDate).toLocaleString('tr-TR')}</p>
                </div>
                <button onClick={closeModal} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition text-gray-500 hover:text-gray-900">✕</button>
            </div>
            <div className="p-8 space-y-6">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Açıklama</p>
                    {/* GÜNCELLEME: break-words ve whitespace-pre-wrap eklendi */}
                    <div className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm max-h-40 overflow-y-auto custom-scrollbar break-words whitespace-pre-wrap">
                        {selectedEvent.description}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                    <button onClick={() => handleDelete(null, selectedEvent.id)} className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition">Sil / Reddet</button>
                    {!selectedEvent.isApproved && (
                        <button onClick={() => handleApprove(selectedEvent.id)} className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition shadow-lg">Onayla</button>
                    )}
                    {selectedEvent.isApproved && (
                        <button onClick={closeModal} className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition">Kapat</button>
                    )}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}