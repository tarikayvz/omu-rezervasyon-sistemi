'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FaTrash, FaArrowLeft, FaUpload, FaImages, FaPlus, FaEdit, FaTimes, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function DuyurularPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState([]);
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
      const res = await axios.get('http://localhost:5000/api/announcements');
      setAnnouncements(res.data);
    } catch (error) { console.error(error); }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(file => URL.createObjectURL(file)));
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
      await axios.post('http://localhost:5000/api/announcements', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setTitle(''); setDescription(''); setImages([]); setPreviews([]);
      fetchAnnouncements();
      toast.success('Duyuru yayınlandı!');
    } catch (error) { toast.error('Hata oluştu.'); } 
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if(!confirm('Silmek istediğine emin misin?')) return;
    try { await axios.delete(`http://localhost:5000/api/announcements/${id}`); fetchAnnouncements(); toast.info('Silindi.'); } 
    catch (error) { toast.error('Hata.'); }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => router.push('/')} className="bg-white p-4 rounded-full shadow-sm hover:shadow-md text-gray-700 transition"><FaArrowLeft /></button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Duyuru Yönetimi</h1>
            <p className="text-gray-500">Web sitesinde görünecek haberleri yönetin</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Form Alanı */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 sticky top-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800"><span className="bg-omu-red text-white p-2 rounded-lg"><FaPlus size={14}/></span> Yeni Duyuru</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Başlık</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-omu-red/20 focus:border-omu-red outline-none transition font-medium" placeholder="Duyuru başlığı..." />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">İçerik</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="5" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-omu-red/20 focus:border-omu-red outline-none transition font-medium" placeholder="Detaylar..."></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Görseller</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative group">
                            <input type="file" multiple onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                            <FaImages className="mx-auto text-3xl text-gray-400 mb-2 group-hover:text-omu-red transition" />
                            <p className="text-sm text-gray-500 group-hover:text-gray-700">Fotoğrafları seçmek için tıklayın</p>
                        </div>
                        {previews.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto py-4">
                                {previews.map((src, i) => <img key={i} src={src} className="h-20 w-20 object-cover rounded-xl border border-gray-200 shadow-sm" />)}
                            </div>
                        )}
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition shadow-lg disabled:opacity-50 flex justify-center items-center gap-2">
                        {loading ? 'Yükleniyor...' : <><FaUpload /> Yayınla</>}
                    </button>
                </form>
            </div>
          </div>

          {/* Liste Alanı */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Yayındaki Duyurular</h2>
            {announcements.map((ann) => (
                <div key={ann.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-5 hover:shadow-md transition group">
                    <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden relative">
                        {ann.images && ann.images.length > 0 ? (
                            <img src={`http://localhost:5000${ann.images[0]}`} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                        ) : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Resim Yok</div>}
                    </div>
                    <div className="flex-grow flex flex-col">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{ann.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">{ann.description}</p>
                        <div className="flex justify-between items-center mt-auto">
                            <span className="text-xs font-bold text-gray-400 uppercase">{new Date(ann.date).toLocaleDateString('tr-TR')}</span>
                            <button onClick={() => handleDelete(ann.id)} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition flex items-center gap-2"><FaTrash /> Sil</button>
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