'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBars, FaTimes, FaCalendarAlt, FaHome } from 'react-icons/fa';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // "Salon Rezervasyonu" buradan kaldırıldı
  const navLinks = [
    { name: 'Ana Sayfa', href: '/', icon: <FaHome /> },
    { name: 'Takvim & Etkinlikler', href: '/takvim', icon: <FaCalendarAlt /> },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100 font-sans">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          
          {/* --- LOGO ALANI --- */}
          <Link href="/" className="flex items-center gap-3 group">
            <img 
                src="/logo.png" 
                alt="OMÜ Logo" 
                className="h-12 w-auto object-contain group-hover:scale-105 transition duration-300"
            />
            <div className="flex flex-col">
                <span className="text-lg font-extrabold text-gray-900 leading-none tracking-tight">OMÜ</span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mühendislik Fakültesi</span>
            </div>
          </Link>

          {/* Masaüstü Menü */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300
                  ${isActive 
                    ? 'bg-gray-900 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-omu-red'}`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
            
            {/* Sadece bu buton kaldı (Müsaitlik sayfasına gider) */}
            <Link href="/musaitlik" className="ml-4 bg-omu-red text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-red-700 hover:shadow-lg transition transform hover:-translate-y-0.5">
              Rezervasyon Yap
            </Link>
          </nav>

          {/* Mobil Menü Butonu */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-700 text-2xl focus:outline-none">
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobil Menü */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl animate-fadeIn h-screen z-40 left-0">
          <div className="flex flex-col p-4 space-y-2">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className={`p-4 rounded-xl flex items-center gap-3 font-bold transition
                ${pathname === link.href ? 'bg-red-50 text-omu-red' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.name}
              </Link>
            ))}
             {/* Mobil için Rezervasyon Butonu */}
             <Link 
                href="/musaitlik"
                onClick={() => setIsOpen(false)}
                className="mt-4 bg-omu-red text-white p-4 rounded-xl font-bold text-center shadow-md active:scale-95 transition"
             >
                Rezervasyon Yap
             </Link>
          </div>
        </div>
      )}
    </header>
  );
}