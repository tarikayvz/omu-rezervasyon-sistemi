'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FaTrash, FaArrowLeft, FaStar, FaCommentDots, FaSearch, FaReply, FaTimes, FaCheckCircle, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
// API_URL EKLENDİ (Admin panelinde utils/api.js yoksa oluşturun veya direkt link kullanın)
// Eğer utils/api.js varsa:
import API_URL from '../../utils/api';
// Eğer yoksa (Render linkini direkt kullanmak istersen bu satırı aç):
// const API_URL = "https://omu-backend-xyz.onrender.com/api"; 

export default function YorumlarPage() {
  const router = useRouter();
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedComment, setSelectedComment] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchComments = async () => {
    try {
      // DÜZELTİLDİ: API_URL kullanıldı
      const res = await axios.get(`${API_URL}/comments`);
      // Hata kontrolü ve boş veri güvenliği
      const data = Array.isArray(res.data) ? res.data : [];
      setComments(data);
      setFilteredComments(data);
      setLoading(false);
    } catch (error) { 
      console.error('Hata:', error); 
      setLoading(false);
      // Hata durumunda boş liste gösterip kullanıcının deneyimini bozma
      setComments([]);
      setFilteredComments([]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) router.push('/login');
    fetchComments();
  }, [router]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredComments(comments);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = comments.filter(comment => 
        comment.username?.toLowerCase().includes(lowerTerm) || 
        comment.text?.toLowerCase().includes(lowerTerm) ||     
        (comment.Event && comment.Event.title?.toLowerCase().includes(lowerTerm))
      );
      setFilteredComments(filtered);
    }
  }, [searchTerm, comments]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if(!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    try {
      // DÜZELTİLDİ: API_URL kullanıldı
      await axios.delete(`${API_URL}/comments/${id}`);
      fetchComments();
      if(selectedComment && selectedComment.id === id) closeModal();
      toast.info('Yorum silindi.');
    } catch (error) { toast.error('Silme hatası.'); }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    setReplyLoading(true);
    try {
        // DÜZELTİLDİ: API_URL kullanıldı
        await axios.put(`${API_URL}/comments/${selectedComment.id}`, {
            reply: replyText
        });
        toast.success('Cevap başarıyla kaydedildi! ✅');
        fetchComments();
        closeModal();
    } catch (error) {
        toast.error('Cevap gönderilemedi.');
        console.error(error);
    } finally {
        setReplyLoading(false);
    }
  };

  const openModal = (comment) => {
      setSelectedComment(comment);
      setReplyText(comment.reply || '');
      document.body.style.overflow = 'hidden';
  };
  
  const closeModal = () => {
      setSelectedComment(null);
      setReplyText('');
      document.body.style.overflow = 'unset';
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="bg-white p-4 rounded-full shadow-sm hover:shadow-md text-gray-700 transition"><FaArrowLeft /></button>
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">Yorum Yönetimi</h1>
                <p className="text-gray-500">Kullanıcı geri bildirimleri ve cevaplar</p>
            </div>
          </div>
          <div className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-blue-200">Toplam: {comments.length}</div>
        </div>

        {/* Arama */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8 flex items-center gap-3">
            <FaSearch className="text-gray-400 text-lg ml-2" />
            <input type="text" placeholder="Yorumlarda ara... (İsim, Mesaj, Etkinlik)" className="w-full p-2 outline-none text-gray-700 bg-transparent placeholder-gray-400 font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {/* Tablo */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            {loading ? <div className="p-10 text-center text-gray-500 animate-pulse">Yükleniyor...</div> : filteredComments.length === 0 ? <div className="p-12 text-center text-gray-400 italic bg-gray-50">Henüz yorum yapılmamış veya arama sonucu yok.</div> : (
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-left text-xs uppercase font-bold tracking-wider">
                            <th className="px-6 py-4">Durum</th><th className="px-6 py-4">Tarih</th><th className="px-6 py-4">Kullanıcı</th><th className="px-6 py-4">Etkinlik</th><th className="px-6 py-4">Puan</th><th className="px-6 py-4 w-1/3">Yorum</th><th className="px-6 py-4 text-center">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredComments.map((comment) => (
                            <tr key={comment.id} onClick={() => openModal(comment)} className="hover:bg-blue-50/50 transition cursor-pointer group">
                                <td className="px-6 py-4 text-center">{comment.reply ? <div className="text-green-500 text-xl" title="Cevaplandı"><FaCheckCircle /></div> : <div className="text-gray-300 text-xl" title="Bekliyor"><FaReply /></div>}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><div className="font-bold text-gray-800">{new Date(comment.createdAt).toLocaleDateString('tr-TR')}</div><div className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div></td>
                                <td className="px-6 py-4 font-bold text-gray-900 group-hover:text-blue-600 transition">{comment.username}</td>
                                <td className="px-6 py-4">{comment.Event ? <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{comment.Event.title}</span> : <span className="text-red-300 italic text-xs">Silinmiş</span>}</td>
                                <td className="px-6 py-4"><div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <FaStar key={i} size={14} color={i < comment.rating ? "#f59e0b" : "#e5e7eb"} />)}</div></td>
                                <td className="px-6 py-4"><p className="text-gray-600 italic text-sm line-clamp-1">"{comment.text}"</p></td>
                                <td className="px-6 py-4 text-center"><button onClick={(e) => handleDelete(e, comment.id)} className="bg-white border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 p-2 rounded-xl transition shadow-sm"><FaTrash /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </div>

      {/* MODAL */}
      {selectedComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" onClick={closeModal}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FaCommentDots className="text-blue-600"/> Detay & Cevapla</h2>
                    <button onClick={closeModal} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition"><FaTimes /></button>
                </div>
                <div className="p-8 overflow-y-auto max-h-[80vh]">
                    
                    {/* Kullanıcı Bilgisi */}
                    <div className="flex items-start gap-5 mb-8">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl border border-blue-100"><FaUser /></div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">{selectedComment.username}</h3>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-gray-500 flex items-center gap-1"><FaCalendarAlt /> {new Date(selectedComment.createdAt).toLocaleString('tr-TR')}</span>
                                <div className="flex text-yellow-400 text-sm">{[...Array(5)].map((_, i) => <FaStar key={i} color={i < selectedComment.rating ? "#f59e0b" : "#e5e7eb"} />)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Yorum Metni */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8 relative">
                        <div className="absolute top-[-10px] left-8 w-4 h-4 bg-gray-50 border-t border-l border-gray-100 transform rotate-45"></div>
                        <p className="text-gray-700 text-lg leading-relaxed italic">"{selectedComment.text}"</p>
                    </div>

                    {/* Cevap Formu */}
                    <form onSubmit={handleReplySubmit}>
                        <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2"><FaReply className="text-blue-600"/> Yanıtınız</label>
                        <textarea rows="4" className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-gray-700 resize-none" placeholder="Kullanıcıya nazik bir cevap yazın..." value={replyText} onChange={(e) => setReplyText(e.target.value)}></textarea>
                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={closeModal} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition">İptal</button>
                            <button type="submit" disabled={replyLoading} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2">{replyLoading ? '...' : 'Cevabı Gönder'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}