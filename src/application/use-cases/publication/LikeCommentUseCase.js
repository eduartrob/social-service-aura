/**
 * LikeCommentUseCase - Dar like a un comentario
 */
class LikeCommentUseCase {
    constructor(publicationRepository, commentLikeRepository) {
        this.publicationRepository = publicationRepository;
        this.commentLikeRepository = commentLikeRepository;
    }

    async execute(data) {
        try {
            const { publicationId, commentId, userId } = data;

            // Validar entrada
            if (!publicationId) throw new Error('ID de publicación es requerido');
            if (!commentId) throw new Error('ID de comentario es requerido');
            if (!userId) throw new Error('ID de usuario es requerido');

            // Obtener la publicación
            const publication = await this.publicationRepository.findById(publicationId);
            if (!publication) {
                throw new Error('Publicación no encontrada');
            }

            // Buscar el comentario
            const comment = publication.getCommentById(commentId);
            if (!comment) {
                throw new Error('Comentario no encontrado');
            }

            // Verificar si ya tiene like
            const existingLike = await this.commentLikeRepository.findLike(commentId, userId);
            if (existingLike) {
                throw new Error('Ya has dado like a este comentario');
            }

            // Incrementar contador en el comentario
            comment.incrementLikes();

            // Guardar el like
            await this.commentLikeRepository.addLike(commentId, userId);

            // Persistir cambios en la publicación
            await this.publicationRepository.save(publication);

            return {
                success: true,
                comment: {
                    id: commentId,
                    likesCount: comment.likesCount,
                    hasLikedByUser: true
                }
            };

        } catch (error) {
            throw new Error(`Error al dar like al comentario: ${error.message}`);
        }
    }
}

/**
 * UnlikeCommentUseCase - Quitar like de un comentario
 */
class UnlikeCommentUseCase {
    constructor(publicationRepository, commentLikeRepository) {
        this.publicationRepository = publicationRepository;
        this.commentLikeRepository = commentLikeRepository;
    }

    async execute(data) {
        try {
            const { publicationId, commentId, userId } = data;

            // Validar entrada
            if (!publicationId) throw new Error('ID de publicación es requerido');
            if (!commentId) throw new Error('ID de comentario es requerido');
            if (!userId) throw new Error('ID de usuario es requerido');

            // Obtener la publicación
            const publication = await this.publicationRepository.findById(publicationId);
            if (!publication) {
                throw new Error('Publicación no encontrada');
            }

            // Buscar el comentario
            const comment = publication.getCommentById(commentId);
            if (!comment) {
                throw new Error('Comentario no encontrado');
            }

            // Verificar si tiene like
            const existingLike = await this.commentLikeRepository.findLike(commentId, userId);
            if (!existingLike) {
                throw new Error('No has dado like a este comentario');
            }

            // Decrementar contador
            comment.decrementLikes();

            // Eliminar el like
            await this.commentLikeRepository.removeLike(commentId, userId);

            // Persistir cambios
            await this.publicationRepository.save(publication);

            return {
                success: true,
                comment: {
                    id: commentId,
                    likesCount: comment.likesCount,
                    hasLikedByUser: false
                }
            };

        } catch (error) {
            throw new Error(`Error al quitar like del comentario: ${error.message}`);
        }
    }
}

module.exports = {
    LikeCommentUseCase,
    UnlikeCommentUseCase
};
