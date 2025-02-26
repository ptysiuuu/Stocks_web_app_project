const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Favorite = sequelize.define('Favorite', {
  favorite_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'user_id'
    },
    onDelete: 'CASCADE'
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Assets',
      key: 'asset_id'
    },
    onDelete: 'CASCADE'
  },
  daily_change: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  added_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
}, {
  tableName: 'Favorites',
  timestamps: false,
  indexes: [
    {
      fields: ['asset_id']
    },
    {
      fields: ['user_id']
    }
  ]
});

module.exports = Favorite;