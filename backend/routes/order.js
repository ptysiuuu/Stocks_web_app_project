const express = require('express');
const router = express.Router();
const { Assets, OpenPosition, Portfolio, Transaction } = require('../db/models');
const authenticate = require('../middleware/authenticate');

const spread = 0.005;

router.post('/buy', authenticate, async (req, res) => {
  const { symbol, quantity } = req.body;
  const userId = req.userId;

  try {
    const portfolio = await Portfolio.findByPk(userId);
    const asset = await Assets.findOne({ where: { symbol } });

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    // case when someone tries to buy asset before enter the symbol website
    if (asset.current_price === 0) {
      return res.status(400).json({ message: 'Asset price not available' });
    }
    if (quantity * asset.current_price > portfolio.free_funds) {
      return res.status(400).json({ message: 'Not enough funds' });
    }

    const buy_price = parseFloat(asset.current_price) + parseFloat(asset.current_price) * spread;
    const rounded_price = parseFloat(buy_price.toFixed(2));
    await OpenPosition.create({
      user_id: userId,
      asset_id: asset.asset_id,
      quantity,
      price: rounded_price,
      created_at: new Date()
    });

    res.status(200).json({ message: 'Purchase completed' });

  } catch (error) {
    console.error('Error occurred while fetching data:', error.message);
    res.status(500).json({ message: 'Server error, unable to fetch data', error: error.message });
  }
});

router.post('/sell', authenticate, async (req, res) => {
  const { symbol, quantity } = req.body;
  const userId = req.userId;

  try {
    const asset = await Assets.findOne({ where: { symbol } });

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    const openPositions = await OpenPosition.findAll({
      where: { user_id: userId, asset_id: asset.asset_id },
      order: [['date_transaction', 'ASC']]
    });

    const totalQuantity = openPositions.reduce((acc, position) => parseFloat(acc) + parseFloat(position.quantity), 0);
    if (parseFloat(totalQuantity) < parseFloat(quantity)) {
      return res.status(400).json({ message: 'Not enough quantity' });
    }

    let quantityLeft = quantity;
    for (const position of openPositions) {
      await Transaction.create({
        user_id: userId,
        asset_id: asset.asset_id,
        quantity: Math.min(position.quantity, quantityLeft),
        date_transaction: new Date(),
        open_price: position.price,
        close_price: asset.current_price
      });
      quantityLeft -= position.quantity;
      if (quantityLeft <= 0) {
        break;
      }
    }

    res.status(200).json({ message: 'Sale completed' });

  } catch (error) {
    console.error('Error occurred while fetching data:', error.message);
    res.status(500).json({ message: 'Server error, unable to fetch data', error: error.message });
  }
});

module.exports = { router, spread };