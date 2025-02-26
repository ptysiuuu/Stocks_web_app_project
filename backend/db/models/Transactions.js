const { DataTypes} = require('sequelize');
const sequelize = require('../config');

const Transactions = sequelize.define('Transaction', {
  transaction_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'user_id',
    },
    onDelete: 'CASCADE',
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Assets',
      key: 'asset_id',
    },
    onDelete: 'CASCADE',
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  transaction_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  open_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  close_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'Transactions',
  timestamps: false,
});

module.exports = Transactions;