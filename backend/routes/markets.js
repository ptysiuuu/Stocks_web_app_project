const express = require("express");
const router = express.Router();
require("dotenv").config();
const { Assets, Market, OpenPosition } = require("../db/models");
const authenticate = require("../middleware/authenticate");
const { spread } = require("./order");

router.get("/SearchAsset/:search", authenticate, async (req, res) => {
  // Return Name and Symbol from API search request
  // Create new Asset because ony in API search request API returns name of company

  const { search } = req.params;
  try {
    const response = await fetch(
      process.env.API_URL +
        "tickers?access_key=" +
        process.env.API_KEY +
        "&search=" +
        search +
        "&limit=50"
    );

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ message: "Error from Marketstack API" });
    }

    const data = await response.json();

    if (data.data.length === 0) {
      return res.status(404).json({ message: "Asset not found" });
    }

    for (const item of data.data) {
      const Asset = await Assets.findOne({ where: { symbol: item.symbol } });
      if (!Asset) {
        const market = await Market.findOne({
          where: { mic: item.stock_exchange["mic"] },
        });
        await Assets.create({
          symbol: item.symbol,
          name: item.name,
          current_price: 0,
          market_id: market.market_id,
        });
      }
    }
    return res.json(data);
  } catch (error) {
    console.error("Error occured while fetching data:", error.message);
    res.status(500).json({ message: "Server error, unable to fetch data" });
  }
});

router.get("/Asset/:symbol", authenticate, async (req, res) => {
  // Return max 1000 daily records of historical data for a given symbol
  // convert close price to $ and return data
  // Update current price of asset in database
  const { symbol } = req.params;

  try {
    const response = await fetch(
      process.env.API_URL +
        "eod" +
        "?access_key=" +
        process.env.API_KEY +
        "&symbols=" +
        symbol +
        "&limit=5000"
    );
    if (!response.ok) {
      return res.status(response.status).json({
        message: "Error from Marketstack API",
        status: response.status,
      });
    }

    const data = await response.json();
    if (data.data.length === 0) {
      return res.status(404).json({ message: "Asset not found" });
    }
    const market = await Market.findOne({
      where: { mic: data.data[0]["exchange"] },
    });
    const filteredData = data.data.map(({ date, close }) => ({
      date,
      price_usd: parseFloat((close / market.conversion_rate).toFixed(2)),
    }));

    const Asset = await Assets.findOne({ where: { symbol } });
    const openPositions = await OpenPosition.findAll({
      where: { user_id: req.userId, asset_id: Asset.asset_id },
    });

    const positions = openPositions.map(
      ({ quantity, price, date_transaction }) => ({
        quantity,
        price,
        date_transaction,
      })
    );

    const buyPrice =
      parseFloat(filteredData[0]["price_usd"]) +
      parseFloat(filteredData[0]["price_usd"]) * spread;
    const responseData = {
      buyPrice: parseFloat(buyPrice.toFixed(2)),
      companyName: Asset.name,
      symbol: Asset.symbol,
      openPositions: positions,
      data: filteredData,
    };
    if (Asset) {
      Asset.current_price = filteredData[0]["price_usd"];
      await Asset.save();
    } else {
      return res.status(404).json({ message: "Asset not in database" });
    }
    return res.json(responseData);
  } catch (error) {
    console.error("Error occurred while fetching data:", error.message);
    res.status(500).json({ message: "Server error, unable to fetch data" });
  }
});

router.get("/", authenticate, async (req, res) => {
  // Return all Markets from database
  try {
    const markets = await Market.findAll();
    const responseData = markets.map((market) => ({
      name: market.name,
      country: market.country,
      currency_code: market.currency_code,
      mic: market.mic,
    }));
    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/AssetList", authenticate, async (req, res) => {
  // Return Asset list based on market from API
  // one page has 100 assets
  // Backend returns AllAssets / 100 so frontend knows how many pages to display
  // When User clicks on market, frontend sends request to backend with market_mic and page default 1
  // example how to call http://localhost:3000/api/markets/AssetList?market_mic=XWAR&page=3
  try {
    const { market_mic, page } = req.query;
    offset = (page - 1) * 100;
    const response = await fetch(
      process.env.API_URL +
        "tickers?access_key=" +
        process.env.API_KEY +
        "&exchange=" +
        market_mic +
        "&limit=100" +
        "&offset=" +
        offset
    );

    if (!response.ok) {
      return res.status(response.status).json({
        message: "Error from Marketstack API",
        error: response.status,
      });
    }

    const data = await response.json();

    if (data.data.length === 0) {
      return res.status(404).json({ message: "Asset not found" });
    }

    pageCount = Math.ceil(data.pagination.total / 100);
    const responseData = data.data.map((item) => ({
      pages: pageCount,
      symbol: item.symbol,
      name: item.name,
      stock_exchange: item.stock_exchange["name"],
    }));

    res.json(responseData);

    for (const item of data.data) {
      const Asset = await Assets.findOne({ where: { symbol: item.symbol } });
      if (!Asset) {
        const market = await Market.findOne({
          where: { mic: item.stock_exchange["mic"] },
        });
        if (item.name === null) {
          item.name = item.symbol;
        }
        await Assets.create({
          symbol: item.symbol,
          name: item.name,
          current_price: 0,
          market_id: market.market_id,
        });
      }
    }

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log(error.message);
  }
});

module.exports = router;
