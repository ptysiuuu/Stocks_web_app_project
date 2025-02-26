const { OpenPosition, Favorite, Assets, Market, Notification } = require('../db/models');

require('dotenv').config();

const updateAssetsPrice = async () => {
  const openPositions = await OpenPosition.findAll();
  const favorites = await Favorite.findAll();

  const asset_ids = new Set();
  for (const openPosition of openPositions) {
    asset_ids.add(openPosition.asset_id);
  }
  for (const fav of favorites) {
    asset_ids.add(fav.asset_id);
  }

  for (asset_id of asset_ids) {
    const asset = await Assets.findByPk(asset_id);
    try {
      const response = await fetch(
        process.env.API_URL + 'eod' + '?access_key=' + process.env.API_KEY + '&symbols=' + asset.symbol + '&limit=2'
      );

      if (!response.ok) {
        console.error('Error from Assets API:', response.status);
        return;
      }

      const data = await response.json();
      const market = await Market.findByPk(asset.market_id);

      asset.current_price = data.data[0]['close'] / market.conversion_rate;
      await asset.save();
      const old_price = data.data[1]['close'] / market.conversion_rate;

      const favorites = await Favorite.findAll({ where: { asset_id } });
      if (favorites.length === 0) {
        continue; // skip if asset has no favorites
      }

      const fav_sample = favorites[0]; // there is no need to make calc for each favorite, only difference is user_id
      const updatedAtDate = new Date(fav_sample.updated_at);
      const currentDateFromApi = new Date(data.data[0]['date']);

      if (updatedAtDate.toDateString() === currentDateFromApi.toDateString()) {
        continue; // skip if asset was already updated today
      }
      const daily_change = ((asset.current_price - old_price) / old_price) * 100;
      const raised_or_fell = daily_change > 0 ? 'rose' : 'fell';
      const message = `The price of ${asset.symbol} ${raised_or_fell} by ${daily_change.toFixed(2)}% on ${currentDateFromApi.toDateString()}`;


      for (const fav of favorites) {
        fav.daily_change = daily_change
        fav.updated_at = data.data[0]['date'];
        await fav.save();

        if (Math.abs(daily_change) < 2.5) {
          continue; // skip if daily change is less than 2.5%, then no need to send notification, only save it
        }
        await Notification.create({
          user_id: fav.user_id,
          message: message,
          created_at: new Date()
        });
      }
    } catch (error) {
      console.error('Error occurred while fetching data:', error.message);
    }
  }
};

module.exports = updateAssetsPrice;