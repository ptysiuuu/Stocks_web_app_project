const { DataTypes} = require('sequelize');
const sequelize = require('../config');

const Asset = sequelize.define('Asset', {
  asset_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  symbol: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  market_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Markets',
      key: 'market_id',
    },
    onDelete: 'CASCADE',
  },
  current_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
}, {
  tableName: 'Assets',
  timestamps: false,
});

module.exports = Asset;