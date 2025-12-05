const rateLimit = require('express-rate-limit');

// Rate limiting general para todas las rutas
const generalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10000, // Máximo 10000 requests por hora
  message: {
    success: false,
    message: 'Demasiadas solicitudes, intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Saltar rate limiting para health check
    return req.path === '/health';
  }
});

// Rate limiting estricto para crear publicaciones
const createPublicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 1000, // Máximo 1000 publicaciones por hora
  message: {
    success: false,
    message: 'Has alcanzado el límite de publicaciones por hora. Intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para likes (más permisivo)
const likeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5000, // Máximo 5000 likes por hora
  message: {
    success: false,
    message: 'Demasiados likes en poco tiempo. Espera un momento.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para comentarios
const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3000, // Máximo 3000 comentarios por hora
  message: {
    success: false,
    message: 'Demasiados comentarios en poco tiempo. Espera un momento.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para acciones sociales (agregar amigos, bloquear)
const socialActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 1000, // Máximo 1000 acciones sociales por hora
  message: {
    success: false,
    message: 'Demasiadas acciones sociales en poco tiempo. Espera un momento.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para búsquedas
const searchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 2000, // Máximo 2000 búsquedas por hora
  message: {
    success: false,
    message: 'Demasiadas búsquedas. Espera un momento.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  createPublicationLimiter,
  likeLimiter,
  commentLimiter,
  socialActionLimiter,
  searchLimiter
};