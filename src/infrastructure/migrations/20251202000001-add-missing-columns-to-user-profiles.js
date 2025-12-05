'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        console.log('➕ Agregando columnas faltantes a user_profiles...');

        try {
            const tableDescription = await queryInterface.describeTable('user_profiles');

            if (!tableDescription.gender) {
                await queryInterface.addColumn('user_profiles', 'gender', {
                    type: Sequelize.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
                    allowNull: true,
                    comment: 'Género'
                });
                console.log('✅ Columna gender agregada');
            }

            if (!tableDescription.privacy_settings) {
                await queryInterface.addColumn('user_profiles', 'privacy_settings', {
                    type: Sequelize.JSON,
                    allowNull: true,
                    comment: 'Configuraciones de privacidad'
                });
                console.log('✅ Columna privacy_settings agregada');
            }

            if (!tableDescription.preferences) {
                await queryInterface.addColumn('user_profiles', 'preferences', {
                    type: Sequelize.JSON,
                    allowNull: true,
                    comment: 'Preferencias del usuario'
                });
                console.log('✅ Columna preferences agregada');
            }

            if (!tableDescription.last_active_at) {
                await queryInterface.addColumn('user_profiles', 'last_active_at', {
                    type: Sequelize.DATE,
                    allowNull: true,
                    comment: 'Última actividad'
                });
                console.log('✅ Columna last_active_at agregada');
            }

        } catch (error) {
            console.error('❌ Error durante la migración:', error.message);
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        console.log('⬇️ Revirtiendo cambios en user_profiles...');
        try {
            await queryInterface.removeColumn('user_profiles', 'gender');
            await queryInterface.removeColumn('user_profiles', 'privacy_settings');
            await queryInterface.removeColumn('user_profiles', 'preferences');
            await queryInterface.removeColumn('user_profiles', 'last_active_at');
        } catch (error) {
            console.error('❌ Error durante rollback:', error.message);
        }
    }
};
