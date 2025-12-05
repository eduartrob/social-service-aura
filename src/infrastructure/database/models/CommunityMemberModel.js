// infrastructure/database/models/CommunityMemberModel.js (PostgreSQL)
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CommunityMember = sequelize.define('CommunityMember', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    community_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'ID de la comunidad'
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'ID del usuario miembro'
    },
    role: {
      type: DataTypes.ENUM('creator', 'admin', 'moderator', 'member'),
      defaultValue: 'member',
      comment: 'Rol del usuario en la comunidad'
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'community_members',
    timestamps: false,
    indexes: [
      { fields: ['community_id'] },
      { fields: ['user_id'] },
      {
        fields: ['community_id', 'user_id'],
        unique: true,
        name: 'unique_community_member'
      }
    ]
  });

  return CommunityMember;
};