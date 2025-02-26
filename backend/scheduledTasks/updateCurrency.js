const Market = require('../db/models/Markets');
require('dotenv').config();

const updateCurrency = async () => {
  try {
    const response = await fetch(process.env.CURRENCY_API_URL)

    if (!response.ok) {
      console.error('Error from Currency API:', response.status);
      return;
    }

    const data = await response.json();

    for (const curr_code of Object.keys(data.conversion_rates)) {
      const markets = await Market.findAll({ where: { currency_code: curr_code } });
      for (const market of markets) {
        market.conversion_rate = data.conversion_rates[curr_code];
        await market.save();
      }
    }
  }
  catch (error) {
    console.error('Error occurred while fetching data:', error.message);
  }
};

module.exports = updateCurrency;