'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FaTrash, FaArrowLeft, FaUpload, FaImages, FaPlus, FaEdit, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
// API_URL EKLENDİ (Admin panelinde utils/api.js oluşturduğunu varsayıyoruz)
// Eğer yoksa, oluşturup içine Render linkini koymalısın.
import API_URL from '../../utils/api';

// Resimler için Ana Sunucu Adresi (Sonundaki /api silinir)
const BASE_URL = API_URL.replace('/api', '');

export default function DuyurularPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState([]);
  
  // Form State'leri
  const [editingId, setEditingId] = useState(null); // Düzenleme Modu için
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]); 
  const [previews, setPreviews] = useState([]); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) router.push('/login');
    fetchAnnouncements();
  }, [router]);

  const fetchAnnouncements = async () => {
    try {
      // DÜZELTİLDİ: API_URL kullanıldı
      const res = await axios.get(`${API_URL}/announcements`);
      setAnnouncements(res.data);
    } catch (error) { console.error(error); }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(file => URL.createObjectURL(file)));
  };

  // LİSTEDEN SEÇİP DÜZENLEME MODUNA GEÇME
  const handleEditClick = (ann) => {
    setEditingId(ann.id);
    setTitle(ann.title);
    setDescription(ann.description);
    // Mevcut resimleri göster (BASE_URL ile)
    setPreviews(ann.images ? ann.images.map(img => `${BASE_URL}${img}`) : []);
    setImages([]); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setImages([]);
    setPreviews([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return toast.warning('Eksik alanları doldurun!');
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    images.forEach((img) => formData.append('images', img));

    try {
      if (editingId) {
        // GÜNCELLEME İŞLEMİ (PUT) - API_URL
        await axios.put(`${API_URL}/announcements/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Duyuru güncellendi! ✅');
      } else {
        // YENİ EKLEME İŞLEMİ (POST) - API_URL
        await axios.post(`${API_URL}/announcements`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Duyuru yayınlandı! 🎉');
      }
      handleCancelEdit(); 
      fetchAnnouncements();
    } catch (error) { toast.error('Hata oluştu.'); } 
    finally { setLoading(false); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if(!confirm('Silmek istediğine emin misin?')) return;
    try { 
        // DÜZELTİLDİ: API_URL kullanıldı
        await axios.delete(`${API_URL}/announcements/${id}`); 
        fetchAnnouncements(); 
        toast.info('Silindi.'); 
    } 
    catch (error) { toast.error('Hata.'); }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => router.push('/')} className="bg-white p-4 rounded-full shadow-sm hover:shadow-md text-gray-700 transition"><FaArrowLeft /></button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Duyuru Yönetimi</h1>
            <p className="text-gray-500">Duyuruları ekleyin veya düzenlemek için listeye tıklayın.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Form Alanı */}
          <div className="lg:col-span-5">
            <div className={`p-8 rounded-3xl shadow-lg border sticky top-8 transition-all ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}>
                <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${editingId ? 'text-blue-800' : 'text-gray-800'}`}>
                    {editingId ? <><FaEdit /> Düzenle</> : <><FaPlus /> Yeni Duyuru</>}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Başlık</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-omu-red/20 outline-none transition font-medium" placeholder="Duyuru başlığı..." />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">İçerik</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="5" className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-omu-red/20 outline-none transition font-medium" placeholder="Detaylar..."></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Görseller</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative group bg-white">
                            <input type="file" multiple onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                            <FaImages className="mx-auto text-3xl text-gray-400 mb-2 group-hover:text-omu-red transition" />
                            <p className="text-sm text-gray-500">Fotoğrafları seçmek için tıklayın</p>
                        </div>
                        {previews.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto py-4">
                                {previews.map((src, i) => <img key={i} src={src} className="h-20 w-20 object-cover rounded-xl border border-gray-200 shadow-sm" />)}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex gap-3">
                        {editingId && (
                            <button type="button" onClick={handleCancelEdit} className="flex-1 bg-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-300 transition">İptal</button>
                        )}
                        <button type="submit" disabled={loading} className={`flex-1 text-white font-bold py-4 rounded-xl transition shadow-lg flex justify-center items-center gap-2 ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-black'}`}>
                            {loading ? '...' : editingId ? <><FaSave /> Güncelle</> : <><FaUpload /> Yayınla</>}
                        </button>
                    </div>
                </form>
            </div>
          </div>

          {/* Liste Alanı */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Yayındaki Duyurular</h2>
            {announcements.map((ann) => (
                <div 
                    key={ann.id} 
                    onClick={() => handleEditClick(ann)} 
                    className={`p-5 rounded-2xl shadow-sm border flex gap-5 transition group cursor-pointer ${editingId === ann.id ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' : 'bg-white border-gray-100 hover:shadow-md'}`}
                >
                    <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden relative">
                        {ann.images && ann.images.length > 0 ? (
                            // DÜZELTİLDİ: BASE_URL kullanıldı
                            <img src={`${BASE_URL}${ann.images[0]}`} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                        ) : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Resim Yok</div>}
                    </div>
                    <div className="flex-grow flex flex-col">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{ann.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">{ann.description}</p>
                        <div className="flex justify-between items-center mt-auto">
                            <span className="text-xs font-bold text-gray-400 uppercase">{new Date(ann.date).toLocaleDateString('tr-TR')}</span>
                            <div className="flex gap-2">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Düzenle</span>
                                <button onClick={(e) => handleDelete(e, ann.id)} className="bg-red-50 text-red-600 px-3 py-1 rounded text-xs font-bold hover:bg-red-100 transition flex items-center gap-1"><FaTrash /> Sil</button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}