const { Market } = require('../db/models');
require('dotenv').config();
const fetch = require('node-fetch');

const addMarket = async () => {
  try {
    const response = await fetch(
      process.env.API_URL + 'exchanges' + '?access_key=' + process.env.API_KEY
    );

    if (!response.ok) {
      console.error('Error from Marketstack API:', response.status);
      return;
    }

    const data = await response.json();

    for (const item of data.data) {
      let market = await Market.findOne({ where: { name: item.name } });
      if (!market) {
        market = await Market.create({
          name: item.name,
          country: item.country,
          currency_code: item.currency['code'],
          conversion_rate: 0.00,
          mic: item.mic
        });
      }
    }
  }
  catch (error) {
    console.error('Error occurred while fetching data:', error.message);
  }
};

module.exports = addMarket;