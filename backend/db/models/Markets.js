const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Market = sequelize.define('Market', {
  market_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  country: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  currency_code: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  conversion_rate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  mic: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'Markets',
  timestamps: false
});

module.exports = Market;
