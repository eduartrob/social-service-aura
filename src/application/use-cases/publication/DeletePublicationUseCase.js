/**
 * DeletePublicationUseCase
 * Elimina (archiva) una publicación
 */
class DeletePublicationUseCase {
    constructor(publicationRepository) {
        this.publicationRepository = publicationRepository;
    }

    async execute(publicationId, userId) {
        try {
            console.log(`📝 DeletePublicationUseCase - Publicación: ${publicationId}`);

            if (!publicationId) {
                throw new Error('ID de publicación es requerido');
            }

            if (!userId) {
                throw new Error('ID de usuario es requerido');
            }

            // Obtener la publicación
            const publication = await this.publicationRepository.findById(publicationId);

            if (!publication) {
                throw new Error('Publicación no encontrada');
            }

            // Verificar que el usuario es el autor
            if (publication.authorId !== userId) {
                throw new Error('No tienes permisos para eliminar esta publicación');
            }

            // Eliminar la publicación
            await this.publicationRepository.delete(publicationId);

            console.log(`✅ Publicación eliminada exitosamente`);

            return {
                success: true,
                message: 'Publicación eliminada exitosamente',
                publicationId
            };
        } catch (error) {
            console.error(`❌ Error en DeletePublicationUseCase:`, error);
            throw error;
        }
    }
}

module.exports = DeletePublicationUseCase;
