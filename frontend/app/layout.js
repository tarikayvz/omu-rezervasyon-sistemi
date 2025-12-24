import { Inter } from "next/font/google";
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css'; 
import { ToastContainer } from 'react-toastify';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "OMÜ Rezervasyon Sistemi",
  description: "OMÜ Mühendislik Fakültesi Rezervasyon Sistemi",
};

// STANDART VIEWPORT AYARI (Yaylanma efektinin çalışması için bu lazım)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  // maximumScale ve userScalable satırlarını kaldırdık.
  // Artık tarayıcının doğal davranışı (o yaylanma hissi) geri gelecek.
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {children}
        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  );
}