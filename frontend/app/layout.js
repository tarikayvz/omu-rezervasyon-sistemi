import { Inter } from "next/font/google";
import "./globals.css";
// Toastify CSS (Bildirimler için)
import 'react-toastify/dist/ReactToastify.css'; 
import { ToastContainer } from 'react-toastify';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "OMÜ Rezervasyon Sistemi",
  description: "OMÜ Mühendislik Fakültesi Rezervasyon Sistemi",
};

// İŞTE SENİN İSTEDİĞİN AYAR BURASI! 
// Bu ayar mobilde elle büyütmeyi/küçültmeyi (zoom) ENGELLER.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // "Kullanıcı ölçekleyemesin" komutu
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {children}
        {/* Toast Bildirim Kutusu */}
        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  );
}