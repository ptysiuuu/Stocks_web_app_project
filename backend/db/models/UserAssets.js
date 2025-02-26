const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const UserAsset = sequelize.define(
  'UserAsset',
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Users',
        key: 'user_id',
      },
      onDelete: 'CASCADE',
    },
    asset_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Assets',
        key: 'asset_id',
      },
      onDelete: 'CASCADE',
    },
    quantity: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    profit: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.0,
    },
  },
  {
    tableName: 'UserAssets',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'asset_id'],
      },
    ],
  }
);

module.exports = UserAsset;
