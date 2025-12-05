// Modelo UserProfile - Mapeo exacto de la tabla user_profiles de la BD (PostgreSQL)
module.exports = (sequelize, DataTypes) => {
  const UserProfileModel = sequelize.define('UserProfile', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      comment: 'ID del usuario (referencia externa)'
    },
    display_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre a mostrar - REQUERIDO'
    },
    bio: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Biografía del usuario - máximo 500 caracteres'
    },
    avatar_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'URL del avatar - REQUERIDO, generado por Cloudinary'
    },
    cover_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL de imagen de portada'
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Ubicación del usuario'
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Sitio web personal'
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Fecha de nacimiento'
    },
    followers_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Número de seguidores'
    },
    following_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Número de usuarios seguidos'
    },
    posts_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Número de publicaciones'
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Cuenta verificada'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Cuenta activa'
    }
  }, {
    tableName: 'user_profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id']
      },
      {
        fields: ['display_name']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['is_verified']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return UserProfileModel;
};