const express = require("express");
const router = express.Router();
const {
  OpenPosition,
  Portfolio,
  Transaction,
  Assets,
  UserAssets,
} = require("../db/models");
const authenticate = require("../middleware/authenticate");
const { Op } = require("sequelize");

router.get("/positions", authenticate, async (req, res) => {
  try {
    const whereCondition = {
      user_id: req.userId,
    };

    const positions = await OpenPosition.findAll({
      where: whereCondition,
      include: [
        {
          model: Assets,
          required: true,
        },
      ],
    });
    const responseData = positions.map((position) => ({
      symbol: position.Asset.symbol,
      name: position.Asset.name,
      quantity: position.quantity,
      open_price: position.price,
      market_price: position.Asset.current_price,
      transaction_date: position.transaction_date,
    }));
    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/portfolio", authenticate, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      where: { user_id: req.userId },
    });
    const responseData = {
      balance: +portfolio.balance,
      free_funds: +portfolio.free_funds,
      profit: +portfolio.profit,
    };
    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/transactions", authenticate, async (req, res) => {
  try {
    const { search } = req.query;

    const whereCondition = {
      user_id: req.userId,
    };

    if (search) {
      whereCondition[Op.or] = [
        { "$Asset.symbol$": { [Op.like]: `%${search}%` } },
        { "$Asset.name$": { [Op.like]: `%${search}%` } },
      ];
    }
    const transactions = await Transaction.findAll({
      where: whereCondition,
      include: [
        {
          model: Assets,
          required: true,
        },
      ],
    });
    const responseData = transactions.map((transaction) => ({
      symbol: transaction.Asset.symbol,
      name: transaction.Asset.name,
      quantity: transaction.quantity,
      open_price: transaction.open_price,
      close_price: transaction.close_price,
      transaction_date: transaction.transaction_date,
    }));
    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/userAssets", authenticate, async (req, res) => {
  try {
    const { search } = req.query;

    const whereCondition = {
      user_id: req.userId,
    };

    if (search) {
      whereCondition[Op.or] = [
        { "$Asset.symbol$": { [Op.like]: `%${search}%` } },
        { "$Asset.name$": { [Op.like]: `%${search}%` } },
      ];
    }
    const userAssets = await UserAssets.findAll({
      where: whereCondition,
      include: [
        {
          model: Assets,
          required: true,
        },
      ],
    });
    const responseData = userAssets.map((userAsset) => ({
      symbol: userAsset.Asset.symbol,
      name: userAsset.Asset.name,
      quantity: userAsset.quantity,
      current_price: userAsset.Asset.current_price,
      profit: userAsset.profit,
    }));
    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.put("/addFunds", authenticate, async (req, res) => {
  let { amount } = req.body;
  try {
    amount = parseFloat(amount);
    if (isNaN(amount)) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    const portfolio = await Portfolio.findOne({
      where: { user_id: req.userId },
    });
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }
    portfolio.free_funds = parseFloat(
      (Number(portfolio.free_funds) + amount).toFixed(2)
    );

    await portfolio.save(); // Zapis do bazy danych
    res
      .status(200)
      .json({
        message: "Funds added successfully",
        free_funds: portfolio.free_funds,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/withdrawFunds", authenticate, async (req, res) => {
  let { amount } = req.body;
  try {
    amount = parseFloat(amount);
    if (isNaN(amount)) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    const portfolio = await Portfolio.findOne({
      where: { user_id: req.userId },
    });
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }
    if (portfolio.free_funds < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }
    portfolio.free_funds = parseFloat(
      (Number(portfolio.free_funds) - amount).toFixed(2)
    );

    await portfolio.save();
    res
      .status(200)
      .json({
        message: "Funds withdrawn successfully",
        free_funds: portfolio.free_funds,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
