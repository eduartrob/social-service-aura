/**
 * Repositorio simple para likes de comentarios
 * Usa directamente el LikeModel de Sequelize
 */
const { LikeModel } = require('../database/models');
const { v4: uuidv4 } = require('uuid');

class CommentLikeRepository {
    /**
     * Buscar si existe un like de un usuario en un comentario
     */
    async findLike(commentId, userId) {
        try {
            const like = await LikeModel.findOne({
                where: {
                    likeable_id: commentId,
                    likeable_type: 'comment',
                    user_id: userId
                }
            });
            return like;
        } catch (error) {
            throw new Error(`Error buscando like: ${error.message}`);
        }
    }

    /**
     * Agregar like a un comentario
     */
    async addLike(commentId, userId) {
        try {
            const now = new Date();
            const like = await LikeModel.create({
                id: uuidv4(),
                user_id: userId,
                likeable_id: commentId,
                likeable_type: 'comment',
                type: 'like',
                created_at: now,
                updated_at: now
            });
            return like;
        } catch (error) {
            throw new Error(`Error agregando like: ${error.message}`);
        }
    }

    /**
     * Eliminar like de un comentario
     */
    async removeLike(commentId, userId) {
        try {
            const deleted = await LikeModel.destroy({
                where: {
                    likeable_id: commentId,
                    likeable_type: 'comment',
                    user_id: userId
                }
            });
            return deleted > 0;
        } catch (error) {
            throw new Error(`Error eliminando like: ${error.message}`);
        }
    }

    /**
     * Verificar si un usuario dio like a varios comentarios
     * Útil para mostrar el estado en la UI
     */
    async checkUserLikes(commentIds, userId) {
        try {
            const likes = await LikeModel.findAll({
                where: {
                    likeable_id: commentIds,
                    likeable_type: 'comment',
                    user_id: userId
                },
                attributes: ['likeable_id']
            });

            // Crear un mapa de commentId -> hasLike
            const likedMap = {};
            likes.forEach(like => {
                likedMap[like.likeable_id] = true;
            });
            return likedMap;
        } catch (error) {
            throw new Error(`Error verificando likes: ${error.message}`);
        }
    }
}

module.exports = CommentLikeRepository;
