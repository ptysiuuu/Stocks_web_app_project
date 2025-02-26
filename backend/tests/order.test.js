const request = require('supertest');
const app = require('../app');
const { User, Assets, Transaction, OpenPosition, Portfolio, Market} = require('../db/models');
const http = require('http');
const redisClient = require('../db/redis');

let server;

beforeAll(async () => {
    await User.sequelize.sync({ force: true });
    await Assets.sequelize.sync({ force: true });
    await OpenPosition.sequelize.sync({ force: true });
    await Portfolio.sequelize.sync({ force: true });
    await Market.sequelize.sync({ force: true });
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(resolve));
});

afterAll(async () => {
    await server.close();
    await redisClient.quit();
});

beforeEach(async () => {
    await Market.destroy({ where: {} });
    await Assets.destroy({ where: {} });
    await OpenPosition.destroy({ where: {} });
    await Portfolio.destroy({ where: {} });
    await User.destroy({ where: {} });
});

describe('POST /api/order/buy', () => {
    it('should buy an asset and add it to the open positions', async () => {

        await request(server)
            .post('/api/auth/register')
            .send({
                username: 'loginUser',
                password: 'testPassword'
            });

        const loginResponse = await request(server)
            .post('/api/auth/login')
            .send({
                username: 'loginUser',
                password: 'testPassword'
            });
        const token = loginResponse.body.token;

        const market = await Market.create({
            mic: 'XNAS',
            name: 'NASDAQ',
            country: 'USA',
            currency_code: 'USD',
            conversion_rate: 1.00
            });

        const asset = await Assets.create({
            symbol: 'AAPL',
            name: 'Apple Inc.',
            current_price: 150,
            market_id: market.market_id
            });

        const user = await User.findOne({ where: { username: 'loginUser' } });
        await Portfolio.create({
            user_id: user.user_id,
            balance: 0,
            free_funds: 10000,
            profit: 0
        });

        const buyResponse = await request(server)
        .post('/api/order/buy')
        .set('Authorization', `Bearer ${token}`)
        .send({
            symbol: 'AAPL',
            quantity: 10
        });

        expect(buyResponse.status).toBe(200);
        expect(buyResponse.body.message).toBe('Purchase completed');

        const openPosition = await OpenPosition.findOne({ where: { user_id: user.user_id, asset_id: asset.asset_id } });
        expect(openPosition).toBeDefined();
        expect(openPosition.quantity).toBe(10);
    });

    it('should not buy an asset if the user does not have enough funds', async () => {

        await request(server)
          .post('/api/auth/register')
          .send({
            username: 'loginUser',
            password: 'testPassword'
          });

        const loginResponse = await request(server)
          .post('/api/auth/login')
          .send({
            username: 'loginUser',
            password: 'testPassword'
          });

        const token = loginResponse.body.token;

        const market = await Market.create({
          mic: 'XNAS',
          name: 'NASDAQ',
          country: 'USA',
          currency_code: 'USD',
          conversion_rate: 1.00
        });

        const asset = await Assets.create({
          symbol: 'AAPL',
          name: 'Apple Inc.',
          current_price: 150,
          market_id: market.market_id
        });

        const user = await User.findOne({ where: { username: 'loginUser' } });
        await Portfolio.create({
        user_id: user.user_id,
        balance: 0,
        free_funds: 100, // Niewystarczające środki
        profit: 0
        });

        const buyResponse = await request(server)
        .post('/api/order/buy')
        .set('Authorization', `Bearer ${token}`)
        .send({
            symbol: 'AAPL',
            quantity: 10
        });

        expect(buyResponse.status).toBe(400);
        expect(buyResponse.body.message).toBe('Not enough funds');
    });

    it('should not buy an asset if the asset does not exist', async () => {

        await request(server)
          .post('/api/auth/register')
          .send({
            username: 'loginUser',
            password: 'testPassword'
          });

        const loginResponse = await request(server)
          .post('/api/auth/login')
          .send({
            username: 'loginUser',
            password: 'testPassword'
          });

        const token = loginResponse.body.token;

        const buyResponse = await request(server)
        .post('/api/order/buy')
        .set('Authorization', `Bearer ${token}`)
        .send({
            symbol: 'AAPL',
            quantity: 10
        });

        expect(buyResponse.status).toBe(404);
        expect(buyResponse.body.message).toBe('Asset not found');
    });
});

describe('POST /api/order/sell', () => {
  it('should sell an asset and remove it from the open positions', async () => {

      await request(server)
          .post('/api/auth/register')
          .send({
              username: 'loginUser',
              password: 'testPassword'
          });

      const loginResponse = await request(server)
          .post('/api/auth/login')
          .send({
              username: 'loginUser',
              password: 'testPassword'
          });
      const token = loginResponse.body.token;

      const market = await Market.create({
          mic: 'XNAS',
          name: 'NASDAQ',
          country: 'USA',
          currency_code: 'USD',
          conversion_rate: 1.00
          });

      const asset = await Assets.create({
          symbol: 'AAPL',
          name: 'Apple Inc.',
          current_price: 150,
          market_id: market.market_id
          });

      const user = await User.findOne({ where: { username: 'loginUser' } });
      await Portfolio.create({
          user_id: user.user_id,
          balance: 0,
          free_funds: 10000,
          profit: 0
      });

      await OpenPosition.create({
          user_id: user.user_id,
          asset_id: asset.asset_id,
          quantity: 10,
          price: 150,
          date_transaction: new Date()
      });

      const sellResponse = await request(server)
      .post('/api/order/sell')
      .set('Authorization', `Bearer ${token}`)
      .send({
          symbol: 'AAPL',
          quantity: 10
      });

      expect(sellResponse.status).toBe(200);
      expect(sellResponse.body.message).toBe('Sale completed');

      const transaction = await Transaction.findOne({ where: { user_id: user.user_id, asset_id: asset.asset_id } });
      expect(transaction).toBeDefined();
      expect(transaction.quantity).toBe(10);
      expect(transaction.open_price).toBe(150);
  });
  it('should not sell an asset if the user does not have enough quantity', async () => {

      await request(server)
        .post('/api/auth/register')
        .send({
          username: 'loginUser',
          password: 'testPassword'
        });

      const loginResponse = await request(server)
        .post('/api/auth/login')
        .send({
          username: 'loginUser',
          password: 'testPassword'
        });

      const token = loginResponse.body.token;

      const market = await Market.create({
        mic: 'XNAS',
        name: 'NASDAQ',
        country: 'USA',
        currency_code: 'USD',
        conversion_rate: 1.00
      });

      const asset = await Assets.create({
        symbol: 'AAPL',
        name: 'Apple Inc.',
        current_price: 150,
        market_id: market.market_id
      });

      const user = await User.findOne({ where: { username: 'loginUser' } });
      await Portfolio.create({
      user_id: user.user_id,
      balance: 0,
      free_funds: 10000,
      profit: 0
      });

      await OpenPosition.create({
        user_id: user.user_id,
        asset_id: asset.asset_id,
        quantity: 5, // Niewystarczająca ilość
        price: 150,
        date_transaction: new Date()
      });

      const sellResponse = await request(server)
      .post('/api/order/sell')
      .set('Authorization', `Bearer ${token}`)
      .send({
          symbol: 'AAPL',
          quantity: 10
      });

      expect(sellResponse.status).toBe(400);
      expect(sellResponse.body.message).toBe('Not enough quantity');
  });
  it('shoud not sell an asset if the asset does not exist', async () => {

      await request(server)
        .post('/api/auth/register')
        .send({
          username: 'loginUser',
          password: 'testPassword'
        });

      const loginResponse = await request(server)
        .post('/api/auth/login')
        .send({
          username: 'loginUser',
          password: 'testPassword'
        });

      const token = loginResponse.body.token;

      const sellResponse = await request(server)
      .post('/api/order/sell')
      .set('Authorization', `Bearer ${token}`)
      .send({
          symbol: 'AAPL',
          quantity: 10
      });

      expect(sellResponse.status).toBe(404);
      expect(sellResponse.body.message).toBe('Asset not found');
  });
});

