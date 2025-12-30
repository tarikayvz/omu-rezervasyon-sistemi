'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSave, FaYoutube, FaPlayCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API_URL from '../../utils/api';

export default function VideoYonetimiPage() {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewId, setPreviewId] = useState(null);

  // Admin kontrolü ve mevcut videoyu çekme
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) router.push('/login');
    
    fetchCurrentVideo();
  }, []);

  const fetchCurrentVideo = async () => {
    try {
        // Backend'inde bu ayarı saklayan bir endpoint olmalı (örn: /settings/video)
        // Şimdilik localStorage'dan çekiyor gibi simüle ediyorum:
        // const res = await axios.get(`${API_URL}/settings/video`);
        // setVideoUrl(res.data.url);
        
        // Simülasyon:
        const savedUrl = localStorage.getItem('homeVideoUrl') || '';
        setVideoUrl(savedUrl);
        if(savedUrl) extractVideoId(savedUrl);
    } catch (error) {
        console.error("Video getirilemedi", error);
    }
  };

  const extractVideoId = (url) => {
    // Basit YouTube ID ayıklayıcı
    let videoId = null;
    if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1];
    }
    setPreviewId(videoId);
    return videoId;
  };

  const handleUrlChange = (e) => {
      setVideoUrl(e.target.value);
      extractVideoId(e.target.value);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        // Backend'e kaydetme isteği (örn: /settings/video)
        // await axios.post(`${API_URL}/settings/video`, { url: videoUrl });
        
        // Simülasyon: LocalStorage'a kaydet (Anasayfa buradan okuyacak)
        localStorage.setItem('homeVideoUrl', videoUrl);

        toast.success('Video başarıyla güncellendi! Anasayfada yayında. 🎥');
    } catch (error) {
        toast.error('Video kaydedilirken hata oluştu.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-8 flex items-center justify-between">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition font-bold">
                <FaArrowLeft /> Yönetim Paneline Dön
            </button>
            <h1 className="text-2xl font-extrabold text-gray-900">Tanıtım Videosu Yönetimi</h1>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                        <FaYoutube />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Anasayfa Videosu</h2>
                        <p className="text-sm text-gray-500">"Salonlarımızı Keşfet" alanında görünecek YouTube videosunu buradan ayarlayabilirsiniz.</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">YouTube Video Linki</label>
                        <input 
                            type="text" 
                            value={videoUrl}
                            onChange={handleUrlChange}
                            placeholder="Örn: https://www.youtube.com/watch?v=..." 
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition font-medium"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-70"
                    >
                        {loading ? 'Kaydediliyor...' : <><FaSave /> Kaydet ve Yayınla</>}
                    </button>
                </form>
            </div>

            {/* Önizleme Alanı */}
            <div className="p-8 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Canlı Önizleme</h3>
                {previewId ? (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md bg-black">
                        <iframe 
                            width="100%" 
                            height="100%" 
                            src={`https://www.youtube.com/embed/${previewId}`} 
                            title="Video Önizleme" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    </div>
                ) : (
                    <div className="aspect-video w-full rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 gap-2">
                        <FaPlayCircle size={40} className="opacity-50"/>
                        <span className="font-medium">Geçerli bir YouTube linki girin</span>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}