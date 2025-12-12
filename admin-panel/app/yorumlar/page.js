'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FaTrash, FaArrowLeft, FaStar, FaCommentDots, FaSearch, FaReply, FaTimes, FaCheckCircle, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

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
      const res = await axios.get('http://localhost:5000/api/comments');
      setComments(res.data);
      setFilteredComments(res.data);
      setLoading(false);
    } catch (error) { console.error('Hata:', error); setLoading(false); }
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
        comment.username.toLowerCase().includes(lowerTerm) || 
        comment.text.toLowerCase().includes(lowerTerm) ||     
        (comment.Event && comment.Event.title.toLowerCase().includes(lowerTerm))
      );
      setFilteredComments(filtered);
    }
  }, [searchTerm, comments]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if(!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/comments/${id}`);
      fetchComments();
      if(selectedComment && selectedComment.id === id) closeModal();
      toast.success('Yorum silindi.');
    } catch (error) { toast.error('Silme hatası.'); }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    setReplyLoading(true);
    try {
        await axios.put(`http://localhost:5000/api/comments/${selectedComment.id}`, {
            reply: replyText
        });
        toast.success('Cevap başarıyla kaydedildi! ✅'); // HAVALI BİLDİRİM
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
    <div className="min-h-screen bg-gray-100 font-sans p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="bg-white p-3 rounded-full shadow hover:bg-gray-50 text-omu-red transition"><FaArrowLeft /></button>
            <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><FaCommentDots className="text-blue-600"/> Yorum Yönetimi</h1>
                <p className="text-sm text-gray-500">Kullanıcı yorumlarını inceleyin ve cevaplayın</p>
            </div>
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold shadow-sm">Toplam: {comments.length}</div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex items-center gap-3 border border-gray-200">
            <FaSearch className="text-gray-400 text-lg ml-2" />
            <input type="text" placeholder="Ara... (Kullanıcı, Yorum, Etkinlik)" className="w-full p-2 outline-none text-gray-700 bg-transparent placeholder-gray-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {loading ? <div className="p-10 text-center text-gray-500">Yükleniyor...</div> : filteredComments.length === 0 ? <div className="p-10 text-center text-gray-500 italic">Sonuç yok.</div> : (
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-800 text-white text-left text-xs uppercase font-semibold">
                            <th className="px-5 py-4">Durum</th><th className="px-5 py-4">Tarih</th><th className="px-5 py-4">Kullanıcı</th><th className="px-5 py-4">Etkinlik</th><th className="px-5 py-4">Puan</th><th className="px-5 py-4 w-1/3">Yorum</th><th className="px-5 py-4 text-center">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm">
                        {filteredComments.map((comment) => (
                            <tr key={comment.id} onClick={() => openModal(comment)} className="border-b border-gray-100 hover:bg-blue-50 transition duration-150 cursor-pointer group">
                                <td className="px-5 py-4 text-center">{comment.reply ? <div title="Cevaplandı" className="text-green-500 text-lg"><FaCheckCircle /></div> : <div title="Bekliyor" className="text-gray-300 text-lg"><FaReply /></div>}</td>
                                <td className="px-5 py-4 whitespace-nowrap"><div className="font-bold text-gray-700">{new Date(comment.createdAt).toLocaleDateString('tr-TR')}</div><div className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div></td>
                                <td className="px-5 py-4 font-bold text-gray-800 group-hover:text-blue-600 transition">{comment.username}</td>
                                <td className="px-5 py-4">{comment.Event ? <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">{comment.Event.title}</span> : <span className="text-red-400 italic text-xs">Silinmiş</span>}</td>
                                <td className="px-5 py-4"><div className="flex">{[...Array(5)].map((_, i) => <FaStar key={i} size={14} color={i < comment.rating ? (comment.rating < 3 ? '#ef4444' : comment.rating < 5 ? '#f59e0b' : '#22c55e') : "#e5e7eb"} />)}</div></td>
                                <td className="px-5 py-4"><p className="text-gray-600 italic line-clamp-1">&quot;{comment.text}&quot;</p></td>
                                <td className="px-5 py-4 text-center"><button onClick={(e) => handleDelete(e, comment.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition"><FaTrash /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </div>

      {selectedComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm" onClick={closeModal}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="bg-gray-800 text-white p-5 flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center gap-2"><FaCommentDots /> Yorum Detayı & Cevapla</h2>
                    <button onClick={closeModal} className="hover:bg-gray-700 p-2 rounded-full"><FaTimes /></button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[80vh]">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl"><FaUser /></div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{selectedComment.username}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-2"><FaCalendarAlt /> {new Date(selectedComment.createdAt).toLocaleString('tr-TR')}</p>
                            <div className="mt-1 flex items-center gap-2">
                                <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600">Etkinlik: {selectedComment.Event?.title || 'Silinmiş Etkinlik'}</span>
                                <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <FaStar key={i} size={12} color={i < selectedComment.rating ? "#f59e0b" : "#e5e7eb"} />)}</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">KULLANICI YORUMU</h4>
                        <p className="text-gray-800 text-lg leading-relaxed italic">&quot;{selectedComment.text}&quot;</p>
                    </div>
                    <form onSubmit={handleReplySubmit} className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                        <h4 className="text-sm font-bold text-blue-800 uppercase mb-2 flex items-center gap-2"><FaReply /> Yanıtınız</h4>
                        <textarea rows="4" className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-3" placeholder="Kullanıcıya bir cevap yazın..." value={replyText} onChange={(e) => setReplyText(e.target.value)}></textarea>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-bold hover:bg-gray-300 transition">İptal</button>
                            <button type="submit" disabled={replyLoading} className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition shadow flex items-center gap-2">{replyLoading ? 'Gönderiliyor...' : <><FaReply /> Cevabı Gönder</>}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}