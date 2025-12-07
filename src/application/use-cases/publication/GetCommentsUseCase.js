

class GetCommentsUseCase {
  constructor(publicationRepository, commentLikeRepository = null) {
    this.publicationRepository = publicationRepository;
    this.commentLikeRepository = commentLikeRepository;
  }

  /**
   * Obtener comentarios de una publicación
   */
  async execute(publicationId, options = {}) {
    try {
      console.log(`📝 GetCommentsUseCase - Publicación: ${publicationId}`);

      const { currentUserId, hierarchical } = options;

      // 1. Validaciones de entrada
      if (!publicationId) {
        throw new Error('ID de publicación es requerido');
      }

      // 2. Obtener la publicación con comentarios
      const publication = await this.publicationRepository.findById(publicationId);

      if (!publication) {
        throw new Error('Publicación no encontrada');
      }

      // 3. Extraer comentarios del agregado
      const comments = publication.comments || [];

      // 4. Obtener likes del usuario actual para los comentarios
      let userLikesMap = {};
      if (currentUserId && this.commentLikeRepository) {
        const commentIds = comments.map(c => c.id);
        if (commentIds.length > 0) {
          userLikesMap = await this.commentLikeRepository.checkUserLikes(commentIds, currentUserId);
        }
      }

      // 5. Formatear comentarios para respuesta
      const formattedComments = comments.map(comment => ({
        id: comment.id,
        authorId: comment.authorId,
        authorName: comment.authorName, // ✅ Nombre plano
        authorAvatar: comment.authorAvatar, // ✅ Avatar plano
        author: { // ✅ Objeto autor anidado (común en frontends)
          id: comment.authorId,
          display_name: comment.authorName,
          avatar_url: comment.authorAvatar
        },
        content: comment.text, // Mapeando comment.text a content
        parentCommentId: comment.parentCommentId,
        level: comment.level,
        likesCount: comment.likesCount,
        repliesCount: comment.repliesCount,
        isEdited: comment.isEdited,
        isActive: comment.isActive,
        editedAt: comment.editedAt,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        is_liked_by_current_user: !!userLikesMap[comment.id] // ✅ NUEVO
      }));

      // 6. Organizar en estructura jerárquica si se requiere
      let organizedComments = formattedComments;
      if (hierarchical) {
        organizedComments = this._organizeCommentsHierarchically(formattedComments);
      }

      console.log(`✅ Encontrados ${formattedComments.length} comentarios`);

      return {
        success: true,
        publicationId,
        totalComments: formattedComments.length,
        comments: organizedComments,
        publication: {
          id: publication.id.value,
          commentsCount: publication.commentsCount
        }
      };

    } catch (error) {
      console.error(`❌ Error en GetCommentsUseCase:`, error);
      throw new Error(`Error al obtener comentarios: ${error.message}`);
    }
  }

  /**
   * Organizar comentarios en estructura jerárquica
   */
  _organizeCommentsHierarchically(comments) {
    const commentMap = new Map();
    const rootComments = [];

    // Crear mapa de comentarios
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Organizar jerarquía
    comments.forEach(comment => {
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId);
        if (parent) {
          parent.replies.push(commentMap.get(comment.id));
        }
      } else {
        rootComments.push(commentMap.get(comment.id));
      }
    });

    return rootComments;
  }
}

module.exports = GetCommentsUseCase;