// Modelo Post - ESTRUCTURA EXACTA de la tabla posts (PostgreSQL)
module.exports = (sequelize, DataTypes) => {
  const PublicationModel = sequelize.define('Publication', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('text', 'image', 'video', 'text_image', 'text_video'),
      allowNull: false,
      defaultValue: 'text'
    },
    visibility: {
      type: DataTypes.ENUM('public', 'private', 'friends'),
      allowNull: false,
      defaultValue: 'public'
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    likes_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    comments_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    shares_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'posts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    sync: false
  });

  return PublicationModel;
};