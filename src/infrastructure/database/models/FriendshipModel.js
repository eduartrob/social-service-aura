// infrastructure/database/models/FriendshipModel.js (PostgreSQL)
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Friendship = sequelize.define('Friendship', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    requester_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'ID del usuario que envía la solicitud'
    },
    addressee_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'ID del usuario que recibe la solicitud'
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'blocked'),
      defaultValue: 'pending',
      comment: 'Estado de la amistad'
    },
    requested_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Fecha de envío de la solicitud'
    },
    responded_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de respuesta a la solicitud'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica si la relación está activa'
    }
  }, {
    tableName: 'friendships',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['requester_id'] },
      { fields: ['addressee_id'] },
      { fields: ['status'] },
      { fields: ['requested_at'] },
      { fields: ['is_active'] },
      {
        fields: ['requester_id', 'addressee_id'],
        unique: true,
        name: 'unique_friendship'
      }
    ],
    validate: {
      notSelfFriendship() {
        if (this.requester_id === this.addressee_id) {
          throw new Error('No puedes enviar una solicitud de amistad a ti mismo');
        }
      }
    }
  });

  return Friendship;
};