import { Inter } from "next/font/google";
import "./globals.css";
// --- YENİ EKLENENLER ---
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Stil dosyası şart!

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "OMÜ Rezervasyon",
  description: "Mühendislik Fakültesi Rezervasyon Sistemi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {children}
        {/* Bildirim Kutusu (Her sayfada çalışsın diye buraya koyduk) */}
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </body>
    </html>
  );
}