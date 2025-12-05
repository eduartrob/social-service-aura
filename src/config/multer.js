const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../infrastructure/config/cloudinary');

// =============================================
// CONFIGURACIÓN DE CLOUDINARY PARA PUBLICACIONES
// =============================================

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'social-service/publications', // Carpeta específica para publicaciones
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'webm'],
        resource_type: 'auto', // Permite imágenes y videos
        transformation: [
            {
                quality: 'auto:good',
                fetch_format: 'auto'
            }
        ],
        public_id: (req, file) => {
            // Generar nombre único usando timestamp
            const timestamp = Date.now();
            const random = Math.round(Math.random() * 1E9);
            return `pub-${timestamp}-${random}`;
        }
    }
});

// Filtro de archivos (imágenes y videos)
const fileFilter = (req, file, cb) => {
    console.log('🔍 Validando archivo:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype
    });

    const allowedMimes = [
        // Imágenes
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        // Videos
        'video/mp4',
        'video/avi',
        'video/mov',
        'video/webm',
        'video/quicktime'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        console.log('✅ Archivo válido:', file.fieldname);
        return cb(null, true);
    } else {
        console.log('❌ Tipo de archivo no permitido:', file.mimetype);
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp) o videos (mp4, avi, mov, webm)'));
    }
};

// Configurar multer con Cloudinary
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB máximo
    }
});

console.log('✅ Multer configurado con Cloudinary para publicaciones');

module.exports = upload;