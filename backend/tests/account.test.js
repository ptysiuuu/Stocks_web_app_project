const request = require('supertest');
const app = require('../app');
const { User, UserAssets, Assets, OpenPosition, Portfolio, Market, Transaction } = require('../db/models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const http = require('http');
const redisClient = require('../db/redis');

let server;

beforeAll(async () => {
    await User.sequelize.sync({ force: true });
    await Assets.sequelize.sync({ force: true });
    await OpenPosition.sequelize.sync({ force: true });
    await Portfolio.sequelize.sync({ force: true });
    await Market.sequelize.sync({ force: true });
    await Transaction.sequelize.sync({ force: true });
    await UserAssets.sequelize.sync({ force: true });
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(resolve));
});

afterAll(async () => {
    await server.close();
    await redisClient.quit();
});

beforeEach(async () => {
    await User.destroy({ where: {} });
    await Assets.destroy({ where: {} });
    await OpenPosition.destroy({ where: {} });
    await Portfolio.destroy({ where: {} });
    await Market.destroy({ where: {} });
    await Transaction.destroy({ where: {} });
    await UserAssets.destroy({ where: {} });
});

describe('GET api/account/positions', () => {
    it('should return positions of the user', async() => {
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
        if (!user) {
            throw new Error('User not found');
        }
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

        const response = await request(server)
        .get('/api/account/positions')
        .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toMatchObject({
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 10,
        open_price: 150,
        market_price: 150,
        });
    })
});

describe('GET /api/account/portfolio', () => {
    it('should return the portfolio of the user', async () => {
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


        const user = await User.findOne({ where: { username: 'loginUser' } });
        if (!user) {
            throw new Error('User not found');
        }
        await Portfolio.create({
        user_id: user.user_id,
        balance: 5000,
        free_funds: 3000,
        profit: 2000
        });

        const response = await request(server)
        .get('/api/account/portfolio')
        .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
        balance: 5000,
        free_funds: 3000,
        profit: 2000
        });
    })
});

describe('GET /api/account/transactions', () => {
    it('should return transactions of the user', async () => {
        // Rejestracja użytkownika
        await request(server)
            .post('/api/auth/register')
            .send({
            username: 'loginUser',
            password: 'testPassword'
            });

        // Logowanie użytkownika
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

        // Dodanie aktywa do bazy danych
        const asset = await Assets.create({
            symbol: 'AAPL',
            name: 'Apple Inc.',
            current_price: 150,
            market_id: market.market_id
        });
        // Dodanie portfolio dla użytkownika
        const user = await User.findOne({ where: { username: 'loginUser' } });
        if (!user) {
        throw new Error('User not found');
        }
        await Portfolio.create({
        user_id: user.user_id,
        balance: 0,
        free_funds: 10000,
        profit: 0
        });

        // Dodanie transakcji
        await Transaction.create({
        user_id: user.user_id,
        asset_id: asset.asset_id,
        quantity: 10,
        open_price: 150,
        close_price: 160,
        transaction_date: new Date()
        });

        // Pobranie transakcji użytkownika
        const response = await request(server)
        .get('/api/account/transactions')
        .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toMatchObject({
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 10,
        open_price: 150,
        close_price: 160,
        });
    });
});

describe('GET /api/account/userAssets', () => {
    it('should return user assets', async () => {
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
        if (!user) {
        throw new Error('User not found');
        }
        await Portfolio.create({
        user_id: user.user_id,
        balance: 0,
        free_funds: 10000,
        profit: 0
        });

        await UserAssets.create({
        user_id: user.user_id,
        asset_id: asset.asset_id,
        quantity: 10,
        profit: 500
        });

        const response = await request(server)
        .get('/api/account/userAssets')
        .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toMatchObject({
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 10,
        current_price: 150,
        profit: 500
        });
    });
});

describe('PUT /api/account/addFunds', () => {
    it('should add funds to the user portfolio', async () => {
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

        const user = await User.findOne({ where: { username: 'loginUser' } });
        if (!user) {
            throw new Error('User not found');
        }
        await Portfolio.create({
            user_id: user.user_id,
            balance: 0,
            free_funds: 1000,
            profit: 0
        });

        const response = await request(server)
        .put('/api/account/addFunds')
        .send({ amount: 500 })
        .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Funds added successfully');
        expect(response.body.free_funds).toBe(1500);

        const updatedPortfolio = await Portfolio.findOne({ where: { user_id: user.user_id } });
        expect(updatedPortfolio.free_funds).toBe(1500);
    });

    it('should return 400 if the amount is invalid', async () => {
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

        const user = await User.findOne({ where: { username: 'loginUser' } });
        if (!user) {
          throw new Error('User not found');
        }
        await Portfolio.create({
          user_id: user.user_id,
          balance: 0,
          free_funds: 1000,
          profit: 0
        });

        const response = await request(server)
          .put('/api/account/addFunds')
          .send({ amount: 'invalid' })
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid amount');
    });
});

describe('PUT /api/account/withdrawFunds', () => {
    it('should withdraw funds from the user portfolio', async () => {
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

        const user = await User.findOne({ where: { username: 'loginUser' } });
        if (!user) {
            throw new Error('User not found');
        }
        await Portfolio.create({
            user_id: user.user_id,
            balance: 0,
            free_funds: 1000,
            profit: 0
        });
        const response = await request(server)
        .put('/api/account/withdrawFunds')
        .send({ amount: 500 })
        .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Funds withdrawn successfully');
        expect(response.body.free_funds).toBe(500);

        const updatedPortfolio = await Portfolio.findOne({ where: { user_id: user.user_id } });
        expect(updatedPortfolio.free_funds).toBe(500);
    });

    it('should return 400 if the amount exceeds available funds', async () => {

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

        const user = await User.findOne({ where: { username: 'loginUser' } });
        if (!user) {
          throw new Error('User not found');
        }
        await Portfolio.create({
          user_id: user.user_id,
          balance: 0,
          free_funds: 1000,
          profit: 0
        });

        const response = await request(server)
          .put('/api/account/withdrawFunds')
          .send({ amount: 1500 })
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Insufficient funds');
    });

    it('should return 400 if the amount is invalid', async () => {
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

        const user = await User.findOne({ where: { username: 'loginUser' } });
        if (!user) {
          throw new Error('User not found');
        }
        await Portfolio.create({
          user_id: user.user_id,
          balance: 0,
          free_funds: 1000,
          profit: 0
        });

        const response = await request(server)
          .put('/api/account/withdrawFunds')
          .send({ amount: 'invalid' })
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid amount');
      });
});