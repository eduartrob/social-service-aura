const rateLimit = require('express-rate-limit');

// 🔥 Rate limiting DESHABILITADO para desarrollo
// En producción, usar límites razonables

// Rate limiting general para todas las rutas
const generalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 100000, // 🔥 Aumentado: 100,000 requests por hora (prácticamente sin límite)
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
  max: 10000, // 🔥 Aumentado
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
  max: 50000, // 🔥 Aumentado
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
  max: 30000, // 🔥 Aumentado
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
  max: 10000, // 🔥 Aumentado
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
  max: 20000, // 🔥 Aumentado
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