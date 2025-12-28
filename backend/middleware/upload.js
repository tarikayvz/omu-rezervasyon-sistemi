const multer = require('multer');

// Resmi diske değil, geçici olarak RAM'e (Memory) alıyoruz.
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // En fazla 5MB resim izni
});

module.exports = upload;