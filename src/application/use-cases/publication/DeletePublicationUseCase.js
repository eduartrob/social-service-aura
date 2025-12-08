/**
 * DeletePublicationUseCase
 * Elimina (archiva) una publicación y sus imágenes de Cloudinary
 */
class DeletePublicationUseCase {
    constructor(publicationRepository, cloudinaryService = null) {
        this.publicationRepository = publicationRepository;
        this.cloudinaryService = cloudinaryService;
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

            // Eliminar imágenes de Cloudinary si el servicio está disponible
            if (this.cloudinaryService && publication.mediaItems && publication.mediaItems.length > 0) {
                console.log(`🗑️ Eliminando ${publication.mediaItems.length} archivos de Cloudinary...`);

                for (const mediaItem of publication.mediaItems) {
                    try {
                        // Intentar obtener el public_id desde diferentes fuentes
                        let publicId = mediaItem.cloudinaryPublicId ||
                            mediaItem.public_id ||
                            mediaItem._cloudinaryPublicId;

                        // Si no hay public_id directo, intentar extraerlo de la URL
                        if (!publicId && mediaItem.url) {
                            publicId = this._extractPublicIdFromUrl(mediaItem.url);
                        }

                        if (publicId) {
                            console.log(`🗑️ Eliminando de Cloudinary: ${publicId}`);
                            const resourceType = mediaItem.type === 'video' ? 'video' : 'image';
                            await this.cloudinaryService.delete(publicId, { resourceType });
                            console.log(`✅ Archivo eliminado de Cloudinary: ${publicId}`);
                        } else {
                            console.log(`⚠️ No se pudo obtener public_id para mediaItem: ${mediaItem.id}`);
                        }
                    } catch (cloudinaryError) {
                        // No fallar toda la operación si un archivo no se puede eliminar
                        console.error(`⚠️ Error eliminando archivo de Cloudinary: ${cloudinaryError.message}`);
                    }
                }
            }

            // Eliminar la publicación de la base de datos
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

    /**
     * Extraer public_id de una URL de Cloudinary
     * URL typical: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
     * public_id sería: folder/filename
     */
    _extractPublicIdFromUrl(url) {
        try {
            if (!url || !url.includes('cloudinary.com')) {
                return null;
            }

            // Buscar el patrón /upload/vXXXX/ o /upload/ y tomar todo después
            const uploadMatch = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
            if (uploadMatch) {
                const publicId = uploadMatch[1];
                console.log(`📍 Extraído public_id de URL: ${publicId}`);
                return publicId;
            }

            return null;
        } catch (e) {
            console.error(`⚠️ Error extrayendo public_id de URL: ${e.message}`);
            return null;
        }
    }
}

module.exports = DeletePublicationUseCase;
