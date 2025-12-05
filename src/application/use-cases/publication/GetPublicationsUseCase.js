
class GetPublicationsUseCase {
  constructor(publicationRepository) {
    this.publicationRepository = publicationRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Object>}
   */
  async execute(options = {}) {
    try {
      console.log('📖 GetPublicationsUseCase - Opciones:', options);

      // VERSIÓN SIMPLIFICADA - Query directo con Sequelize
      const { PublicationModel, UserProfileModel, MediaItemModel, LikeModel } = require('../../../infrastructure/database/models');
      const { Op } = require('sequelize');

      const {
        page = 1,
        limit = 10,
        userId = null,
        currentUserId = null, // Usuario que hace la petición
        visibility = 'all'
      } = options;

      const offset = (page - 1) * limit;

      // Construir filtros base
      let where = {
        is_active: true
      };

      // Si se especifica un usuario específico
      if (userId) {
        where.user_id = userId;
      }

      // ✅ LÓGICA CORRECTA DE VISIBILIDAD
      if (currentUserId) {
        console.log('🔒 Aplicando filtros de visibilidad para usuario:', currentUserId);

        // Obtener amigos del usuario actual
        let friendIds = [];
        try {
          const userProfile = await UserProfileModel.findByPk(currentUserId);
          if (userProfile && userProfile.friends) {
            friendIds = JSON.parse(userProfile.friends || '[]');
          }
        } catch (e) {
          console.log('⚠️ No se pudieron obtener amigos del usuario, usando array vacío');
        }

        console.log('👥 Amigos del usuario:', friendIds);

        // Crear condiciones de visibilidad
        const visibilityConditions = [
          // 1. Publicaciones públicas - todos pueden ver
          { visibility: 'public' },

          // 2. Publicaciones privadas - solo el autor puede ver
          {
            visibility: 'private',
            user_id: currentUserId
          }
        ];

        // 3. Publicaciones de amigos - solo si tiene amigos
        if (friendIds.length > 0) {
          visibilityConditions.push({
            visibility: 'friends',
            user_id: { [Op.in]: friendIds }
          });
        }

        // 4. Sus propias publicaciones de amigos
        visibilityConditions.push({
          visibility: 'friends',
          user_id: currentUserId
        });

        where = {
          ...where,
          [Op.or]: visibilityConditions
        };

        console.log('🔍 Filtros de visibilidad aplicados:', JSON.stringify(where, null, 2));
      } else {
        // Si no hay usuario autenticado, solo mostrar públicas
        where.visibility = 'public';
        console.log('🌍 Usuario no autenticado - solo publicaciones públicas');
      }

      // Ejecutar consulta con includes para media items y autor
      const result = await PublicationModel.findAndCountAll({
        where,
        include: [
          {
            model: MediaItemModel,
            as: 'mediaItems',
            attributes: ['id', 'type', 'url', 'original_name', 'size', 'order_position', 'width', 'height'], // ✅ CORREGIDO: usar original_name
            required: false,
            order: [['order_position', 'ASC']]
          },
          {
            model: UserProfileModel,
            as: 'author',
            attributes: ['id', 'display_name', 'avatar_url', 'username'],
            required: false
          },
          // ✅ NUEVO: Incluir likes para verificar si el usuario actual le dio like
          {
            model: LikeModel,
            as: 'likes',
            attributes: ['id', 'user_id'],
            required: false,
            where: currentUserId ? { user_id: currentUserId } : undefined
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: [
          'id', 'user_id', 'content', 'type', 'visibility',
          'likes_count', 'comments_count', 'shares_count',
          'metadata', 'created_at', 'updated_at'
        ],
        distinct: true
      });

      const publications = result.rows.map(pub => ({
        id: pub.id,
        user_id: pub.user_id,
        content: pub.content,
        type: pub.type,
        visibility: pub.visibility,
        likes_count: pub.likes_count,
        comments_count: pub.comments_count,
        shares_count: pub.shares_count,
        metadata: pub.metadata,
        created_at: pub.created_at,
        updated_at: pub.updated_at,
        // ✅ Incluir media items (imágenes/videos)
        mediaItems: pub.mediaItems ? pub.mediaItems.map(media => ({
          id: media.id,
          type: media.type,
          url: media.url,
          filename: media.original_name, // ✅ CORREGIDO: mapear desde original_name
          size: media.size,
          order: media.order_position,
          width: media.width,
          height: media.height
        })) : [],
        // ✅ Incluir información del autor
        author: pub.author ? {
          id: pub.author.id,
          display_name: pub.author.display_name,
          avatar_url: pub.author.avatar_url,
          username: pub.author.username
        } : null,
        // ✅ NUEVO: Indicar si el usuario actual le dio like
        is_liked_by_current_user: pub.likes && pub.likes.length > 0
      }));

      console.log(`✅ Encontradas ${result.count} publicaciones (después de filtros de visibilidad)`);

      return {
        publications,
        pagination: {
          total: result.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(result.count / limit)
        }
      };

    } catch (error) {
      console.error('❌ Error en GetPublicationsUseCase:', error);
      throw new Error(`Error al obtener publicaciones: ${error.message}`);
    }
  }
}

module.exports = GetPublicationsUseCase;