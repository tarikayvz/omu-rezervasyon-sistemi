'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FaTrash, FaArrowLeft, FaUpload, FaImages, FaPlus, FaEdit, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';

// --- AYARLAR ---
// !!! BURAYA Render Dashboard'dan aldığın "https://...onrender.com" linkini yapıştır !!!
const RENDER_BACKEND_URL = " https://omu-backend.onrender.com"; 

const getBaseUrl = () => {
  // Eğer tarayıcıda localhost açıksa, yerel backend'e bağlan
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000"; 
  }
  // Değilse Render adresine bağlan
  return RENDER_BACKEND_URL;
};

const API_URL = `${getBaseUrl()}/api`;
const BACKEND_ROOT = getBaseUrl(); // Resimlerin kök adresi (api'siz)

// --- AKILLI RESİM URL DÜZELTİCİ ---
const getImageUrl = (imageData) => {
    if (!imageData) return "https://placehold.co/100x100?text=Yok";
    
    let url = "";

    // Array kontrolü (Senin backend array yolluyor)
    if (Array.isArray(imageData) && imageData.length > 0) {
        url = imageData[0]; // Cloudinary linki buradadır
    } 
    else if (typeof imageData === 'string') {
        url = imageData;
    }

    // Link "http" içeriyorsa direkt döndür (Backend adresi ekleme!)
    if (url && (url.includes("http") || url.includes("https"))) {
        return url;
    }

    // Yerel yüklemeler için (Eskiden kalanlar)
    return `${BACKEND_ROOT}${url}`;
};

export default function DuyurularPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState([]);
  
  // Form State'leri
  const [editingId, setEditingId] = useState(null); 
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]); 
  const [previews, setPreviews] = useState([]); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(`${API_URL}/announcements`);
      setAnnouncements(res.data);
    } catch (error) { 
        console.error("Hata:", error);
        toast.error("Veri çekilemedi.");
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleEditClick = (ann) => {
    setEditingId(ann.id);
    setTitle(ann.title);
    setDescription(ann.description);
    
    // Resim Önizlemesi
    const rawImages = ann.image || ann.images;
    if (rawImages) {
        // Mevcut resmi gösterirken de fonksiyonumuzu kullanıyoruz
        setPreviews([getImageUrl(rawImages)]);
    } else {
        setPreviews([]);
    }
    
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
    
    // Yeni seçilen resimleri ekle
    images.forEach((img) => formData.append('images', img));

    try {
      if (editingId) {
        await axios.put(`${API_URL}/announcements/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Güncellendi! ✅');
      } else {
        await axios.post(`${API_URL}/announcements`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Yayınlandı! 🎉');
      }
      handleCancelEdit(); 
      fetchAnnouncements();
    } catch (error) { 
        console.error(error);
        toast.error('Hata oluştu.'); 
    } 
    finally { setLoading(false); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if(!confirm('Silmek istediğine emin misin?')) return;
    try { 
        await axios.delete(`${API_URL}/announcements/${id}`); 
        fetchAnnouncements(); 
        toast.info('Silindi.'); 
    } 
    catch (error) { toast.error('Silinemedi.'); }
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
            {announcements.map((ann) => {
                const rawImage = ann.image || ann.images;
                const imgUrl = getImageUrl(rawImage);

                return (
                <div 
                    key={ann.id} 
                    onClick={() => handleEditClick(ann)} 
                    className={`p-5 rounded-2xl shadow-sm border flex gap-5 transition group cursor-pointer ${editingId === ann.id ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' : 'bg-white border-gray-100 hover:shadow-md'}`}
                >
                    <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden relative">
                        <img 
                            src={imgUrl} 
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                            onError={(e) => { e.target.src = "https://placehold.co/100x100?text=Yok"; }}
                        />
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
            )})}
          </div>
        </div>
      </div>
    </div>
  );
}