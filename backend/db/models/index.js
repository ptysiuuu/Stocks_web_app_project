const sequelize = require('../config');

const User = require('./User');
const Market = require('./Markets');
const Assets = require('./Assets');
const OpenPosition = require('./OpenPositions');
const Portfolio = require('./Portfolio');
const Transaction = require('./Transactions');
const UserAssets = require('./UserAssets');
const Favorite = require('./Favorites');
const Notification = require('./Notifications');

User.hasOne(Portfolio, { foreignKey: 'user_id' });
Portfolio.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(UserAssets, { foreignKey: 'user_id' });
UserAssets.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(OpenPosition, { foreignKey: 'user_id' });
OpenPosition.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Transaction, { foreignKey: 'user_id' });
Transaction.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Favorite, { foreignKey: 'user_id' });
Favorite.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

Assets.hasMany(UserAssets, { foreignKey: 'asset_id' });
UserAssets.belongsTo(Assets, { foreignKey: 'asset_id' });

Assets.hasMany(OpenPosition, { foreignKey: 'asset_id' });
OpenPosition.belongsTo(Assets, { foreignKey: 'asset_id' });

Assets.hasMany(Transaction, { foreignKey: 'asset_id' });
Transaction.belongsTo(Assets, { foreignKey: 'asset_id' });

Market.hasMany(Assets, { foreignKey: 'market_id' });
Assets.belongsTo(Market, { foreignKey: 'market_id' });

Assets.hasMany(Favorite, { foreignKey: 'asset_id' });
Favorite.belongsTo(Assets, { foreignKey: 'asset_id' });

module.exports = {
    sequelize,
    User,
    Market,
    Assets,
    OpenPosition,
    Portfolio,
    Transaction,
    UserAssets,
    Favorite,
    Notification,
};