const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Portfolio = sequelize.define('Portfolio', {
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
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  free_funds: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
  },
  profit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
  },
}, {
  tableName: 'Portfolios',
  timestamps: false,
});

module.exports = Portfolio;