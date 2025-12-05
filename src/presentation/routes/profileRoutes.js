const express = require('express');
const router = express.Router();

// Middlewares
const { authMiddleware } = require('../../infrastructure/middleware/authMiddleware');
const { uploadAvatar } = require('../../infrastructure/middleware/uploadMiddleware');
const {
  validateMultipartContentType,
  validateProfileData
} = require('../../infrastructure/middleware/profileValidationMiddleware');

// Controlle r
const UserProfileController = require('../controllers/UserProfileController');

// Importar caso de uso que funciona
const CreateUserProfileUseCase = require('../../application/use-cases/userProfile/CreateUserProfileUseCase');
const DeleteUserProfileUseCase = require('../../application/use-cases/userProfile/DeleteUserProfileUseCase');


// Instanciar repositorio
const SequelizeUserProfileRepository = require('../../infrastructure/repositories/SequelizeUserProfileRepository');
const userProfileRepository = new SequelizeUserProfileRepository();

// Instanciar servicio de cloudinary
const CloudinaryServiceImpl = require('../../infrastructure/services/CloudinaryServiceImpl');
const cloudinaryService = new CloudinaryServiceImpl();

// Instanciar caso de uso de eliminación
const deleteUserProfileUseCase = new DeleteUserProfileUseCase(userProfileRepository);

// Instanciar controlador con dependencias
const userProfileController = new UserProfileController(
  new CreateUserProfileUseCase(), // createUserProfileUseCase 
  null, // updateProfileUseCase - no usado por ahora
  null, // updateInterestsUseCase
  null, // addFriendUseCase
  null, // removeFriendUseCase
  null, // blockUserUseCase
  null,  // unblockUserUseCase
  deleteUserProfileUseCase, // deleteUserProfileUseCase
  userProfileRepository,
  cloudinaryService
);

// Debug: log all middlewares and controller for POST /profiles
console.log('DEBUG /profiles middlewares:', {
  authMiddleware: typeof authMiddleware,
  validateMultipartContentType: typeof validateMultipartContentType,
  uploadAvatar: typeof uploadAvatar,
  validateProfileData: Array.isArray(validateProfileData) ? validateProfileData.map(fn => typeof fn) : typeof validateProfileData,
  userProfileController_createProfile: typeof userProfileController.createProfile
});

/**
 * POST /profiles
 * Crear perfil de usuario con avatar
 * 
 * Middleware chain:
 * 1. authMiddleware - Validar JWT y extraer user_id
 * 2. validateMultipartContentType - Verificar Content-Type
 * 3. uploadAvatar - Procesar archivo avatar con Multer/Cloudinary
 * 4. validateProfileData - Validar todos los campos del perfil
 * 5. userProfileController.createProfile - Crear perfil en BD
 */
router.post('/profiles',
  authMiddleware,
  validateMultipartContentType,
  uploadAvatar,
  ...validateProfileData,
  userProfileController.createProfile
);

/**
 * PUT /profiles/:id
 * Actualizar perfil existente (para futuras implementaciones)
 */
router.put('/profiles/:id',
  authMiddleware,
  userProfileController.updateProfile
);

/**
 * GET /profiles/:id
 * Obtener perfil por ID (para futuras implementaciones)
 */
router.get('/profiles/:id', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Endpoint no implementado aún'
  });
});

/**
 * DELETE /profiles/:id
 * Eliminar perfil (para futuras implementaciones)
 */
router.delete('/profiles/:id',
  authMiddleware,
  userProfileController.deleteProfile
);

module.exports = router;