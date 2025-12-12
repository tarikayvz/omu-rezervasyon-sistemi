'use client';

import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FaCalendarCheck, FaHourglassHalf, FaStar } from 'react-icons/fa';

// Renk Paleti (OMÜ Renkleri ve uyumlu tonlar)
const COLORS = ['#005F87', '#E30613', '#EA580C', '#10B981'];

export default function DashboardStats({ events }) {
  // 1. İstatistikleri Hesapla
  const totalEvents = events.length;
  const pendingCount = events.filter(e => !e.isApproved).length;
  const approvedCount = events.filter(e => e.isApproved).length;

  // 2. Salon Verisini Hazırla (Pasta Grafiği İçin)
  const hallData = [
    { name: 'Mavi', value: events.filter(e => e.hall.includes('mavi')).length },
    { name: 'Pembe', value: events.filter(e => e.hall.includes('pembe')).length },
    { name: 'Konferans', value: events.filter(e => e.hall.includes('konferans')).length },
  ];

  // 3. Bölüm Verisini Hazırla (Sütun Grafiği İçin)
  // Bölümleri gruplayıp sayılarını buluyoruz
  const deptMap = {};
  events.forEach(e => {
    const dept = e.department || 'Diğer';
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });
  
  // Recharts formatına çevir (Array)
  const deptData = Object.keys(deptMap).map(key => ({
    name: key.replace('Mühendisliği', 'Müh.').replace('Müh.', ''), // İsimleri kısaltalım sığsın
    sayi: deptMap[key]
  }));

  return (
    <div className="mb-10 animate-fadeIn">
      
      {/* --- ÜST KARTLAR (Özet Bilgi) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-600 flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-bold uppercase">Toplam Başvuru</p>
                <p className="text-4xl font-bold text-blue-900">{totalEvents}</p>
            </div>
            <FaCalendarCheck className="text-4xl text-blue-100" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500 flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-bold uppercase">Onay Bekleyen</p>
                <p className="text-4xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <FaHourglassHalf className="text-4xl text-yellow-100" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-bold uppercase">Onaylanan</p>
                <p className="text-4xl font-bold text-green-600">{approvedCount}</p>
            </div>
            <FaStar className="text-4xl text-green-100" />
        </div>
      </div>

      {/* --- GRAFİKLER --- */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* 1. Salon Kullanım Oranları (Pasta) */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Salon Kullanım Oranları</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={hallData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label
                        >
                            {hallData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* 2. Bölümlere Göre Başvurular (Bar) */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Bölümlere Göre Dağılım</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} />
                        <YAxis allowDecimals={false} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="sayi" name="Başvuru Sayısı" fill="#E30613" radius={[5, 5, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

      </div>
    </div>
  );
}