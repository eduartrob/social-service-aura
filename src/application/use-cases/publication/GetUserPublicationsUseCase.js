/**
 * GetUserPublicationsUseCase
 * Obtiene las publicaciones de un usuario específico
 */
class GetUserPublicationsUseCase {
    constructor(publicationRepository) {
        this.publicationRepository = publicationRepository;
    }

    async execute(userId, options = {}) {
        try {
            console.log(`📝 GetUserPublicationsUseCase - Usuario: ${userId}`);

            if (!userId) {
                throw new Error('ID de usuario es requerido');
            }

            const { page = 1, limit = 10 } = options;

            // findByAuthor returns { publications, total }
            const result = await this.publicationRepository.findByAuthor(userId, {
                page,
                limit
            });

            // Extract publications array from result
            const publications = result.publications || [];
            const total = result.total || 0;

            console.log(`✅ Encontradas ${publications.length} publicaciones del usuario (total: ${total})`);

            return {
                success: true,
                userId,
                publications: publications.map(pub => ({
                    id: pub.id.value,
                    authorId: pub.authorId,
                    content: pub.text.text,
                    type: pub.type,
                    mediaItems: (pub.mediaItems || []).map(m => ({
                        id: m.id,
                        type: m.type,
                        url: m.url,
                        order: m.order
                    })),
                    likesCount: pub.likesCount,
                    commentsCount: pub.commentsCount,
                    visibility: pub.visibility,
                    createdAt: pub.createdAt,
                    updatedAt: pub.updatedAt
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    hasMore: publications.length === limit
                }
            };
        } catch (error) {
            console.error(`❌ Error en GetUserPublicationsUseCase:`, error);
            throw new Error(`Error al obtener publicaciones del usuario: ${error.message}`);
        }
    }
}

module.exports = GetUserPublicationsUseCase;
