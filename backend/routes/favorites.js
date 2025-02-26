const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const { Assets, Favorite } = require("../db/models");
const { spread } = require("./order");

router.post("/", authenticate, async (req, res) => {
  const { symbol } = req.body;
  try {
    const asset = await Assets.findOne({ where: { symbol: symbol } });
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }
    const fav = await Favorite.findOne({ where: { asset_id: asset.asset_id } });
    if (fav) {
      await Favorite.create({
        user_id: req.userId,
        asset_id: asset.asset_id,
        daily_change: fav.daily_change,
        updated_at: fav.updated_at,
      });
      return res.status(200).json({ message: "Asset added to favorites" });
    }

    const response = await fetch(
      process.env.API_URL +
        "eod" +
        "?access_key=" +
        process.env.API_KEY +
        "&symbols=" +
        symbol +
        "&limit=2"
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
    const current_price = data.data[0]["close"];
    const last_price = data.data[1]["close"];
    const daily_change = ((current_price - last_price) / last_price) * 100;

    await Favorite.create({
      user_id: req.userId,
      asset_id: asset.asset_id,
      daily_change,
      updated_at: data.data[0]["date"],
    });
    return res.status(201).json({ message: "Asset added to favorites" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.delete("/", authenticate, async (req, res) => {
  const { symbol } = req.body;
  try {
    const asset = await Assets.findOne({ where: { symbol: symbol } });
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }
    const fav = await Favorite.findAll({
      where: { user_id: req.userId, asset_id: asset.asset_id },
    });
    if (!fav) {
      return res.status(404).json({ message: "Asset not found in favorites" });
    }
    fav.forEach(async (fav) => {
      await fav.destroy();
    });
    res.status(200).json({ message: "Asset removed from favorites" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    const favs = await Favorite.findAll({
      where: { user_id: req.userId },
      include: { model: Assets },
    });
    const responseData = favs.map((fav) => ({
      title: fav.Asset.name,
      subtitle: fav.Asset.symbol,
      change: fav.daily_change,
      buy: parseFloat((fav.Asset.current_price * (1 + spread)).toFixed(2)),
      sell: fav.Asset.current_price,
    }));
    res.status(200).json(responseData);
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
