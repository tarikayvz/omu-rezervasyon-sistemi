const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// 1. Cloudinary Ayarları
// Bu ayarları Render panelindeki Environment Variables kısmına eklemeyi unutma!
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Cloudinary Depolama Ayarı
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'omu_haberler', // Cloudinary'de bu isimde klasör açacak
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

module.exports = upload;