'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaLock, FaUserShield, FaArrowRight } from 'react-icons/fa';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [error, setError] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // Basit güvenlik kontrolü
    if (password === '123') { 
      // Giriş başarılıysa tarayıcıya token kaydet
      localStorage.setItem('adminToken', 'giris_basarili_gizli_anahtar');
      router.push('/'); // Ana sayfaya yönlendir
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black font-sans relative overflow-hidden">
      {/* Arka Plan Dekorasyonları (Renkler standart hale getirildi) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-600/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>

      <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-red-600 to-orange-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 transform rotate-3 hover:rotate-0 transition duration-500">
            <FaUserShield className="text-white text-4xl" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Yönetici Girişi</h1>
          <p className="text-gray-400 text-sm">OMÜ Rezervasyon Sistemi Yönetim Paneli</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative group">
            <FaLock className="absolute left-4 top-4 text-gray-400 group-focus-within:text-white transition" />
            <input 
              type="password" 
              placeholder="Yönetici Şifresi" 
              className="w-full bg-gray-900/50 text-white pl-12 pr-4 py-3.5 rounded-xl border border-gray-700 focus:border-red-600 focus:ring-2 focus:ring-red-600/50 outline-none transition placeholder-gray-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95
            ${error ? 'bg-red-600 animate-shake' : 'bg-gradient-to-r from-red-600 to-orange-600 hover:shadow-orange-500/25'}`}
          >
            {error ? 'Hatalı Şifre!' : <>Giriş Yap <FaArrowRight /></>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">&copy; 2025 Ondokuz Mayıs Üniversitesi</p>
        </div>
      </div>
    </div>
  );
}