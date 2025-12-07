/**
 * UpdatePublicationUseCase
 * Actualiza el contenido de texto de una publicación
 */
class UpdatePublicationUseCase {
    constructor(publicationRepository) {
        this.publicationRepository = publicationRepository;
    }

    async execute(publicationId, userId, newContent) {
        try {
            console.log(`📝 UpdatePublicationUseCase - Publicación: ${publicationId}`);

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
                throw new Error('No tienes permisos para editar esta publicación');
            }

            // Actualizar el texto
            publication.updateText(newContent);

            // Guardar cambios
            await this.publicationRepository.save(publication);

            console.log(`✅ Publicación actualizada exitosamente`);

            return {
                success: true,
                publication: {
                    id: publication.id.value,
                    authorId: publication.authorId,
                    content: publication.text.text,
                    type: publication.type,
                    updatedAt: publication.updatedAt
                }
            };
        } catch (error) {
            console.error(`❌ Error en UpdatePublicationUseCase:`, error);
            throw error;
        }
    }
}

module.exports = UpdatePublicationUseCase;
