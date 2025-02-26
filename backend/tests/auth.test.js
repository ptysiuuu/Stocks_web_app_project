const request = require('supertest');
const app = require('../app');
const { User } = require('../db/models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const http = require('http');
const redisClient = require('../db/redis');

let server;

beforeAll(async () => {
  await User.sequelize.sync({ force: true });
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(resolve));
});

afterAll(async () => {
  await server.close();
  await redisClient.quit();
});

beforeEach(async () => {
  await User.destroy({ where: {} });
});

describe('User registration', () => {
  it('should register a user and find it in the database', async () => {
    const registerResponse = await request(server)
      .post('/api/auth/register')
      .send({
        username: 'newUser',
        password: 'testPassword'
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.message).toBe('User registered successfully');

    const user = await User.findOne({ where: { username: 'newUser' } });
    expect(user).toBeDefined();
    expect(user.username).toBe('newUser');
  });

  it('should return 400 if the user already exists', async () => {

    await request(server)
      .post('/api/auth/register')
      .send({
        username: 'existingUser',
        password: 'testPassword'
      });

    const duplicateRegisterResponse = await request(server)
      .post('/api/auth/register')
      .send({
        username: 'existingUser',
        password: 'testPassword'
      });

    expect(duplicateRegisterResponse.status).toBe(400);
    expect(duplicateRegisterResponse.body.message).toBe('User already exists');
  });
});


describe('User login', () => {
    it('should login a user with correct credentials', async () => {

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

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.token).toBeDefined();
    });

    it('should not login a user with incorrect password', async () => {

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
            password: 'wrongPassword'
          });

        expect(loginResponse.status).toBe(400);
        expect(loginResponse.body.message).toBe('Invalid credentials');
    });
});