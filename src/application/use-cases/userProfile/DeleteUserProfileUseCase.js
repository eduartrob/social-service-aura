class DeleteUserProfileUseCase {
    constructor(userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    async execute(userId) {
        if (!userId) {
            throw new Error('UserId es requerido');
        }

        // Verificar si existe el perfil antes de intentar borrarlo
        const exists = await this.userProfileRepository.exists(userId);
        if (!exists) {
            throw new Error('Perfil no encontrado para eliminar');
        }

        await this.userProfileRepository.delete(userId);
        return { success: true, message: 'Perfil eliminado correctamente' };
    }
}

module.exports = DeleteUserProfileUseCase;
