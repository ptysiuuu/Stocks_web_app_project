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

describe('Database operations', () => {
  it('should create a user', async () => {
    const hashedPassword = await bcrypt.hash('testPassword', 10);
    const user = await User.create({
      username: 'testUser',
      password_hash: hashedPassword
    });

    expect(user).toBeDefined();
    expect(user.username).toBe('testUser');
  });

  it('should read a user', async () => {
    const hashedPassword = await bcrypt.hash('testPassword', 10);
    const user = await User.create({
      username: 'testUser',
      password_hash: hashedPassword
    });

    const foundUser = await User.findByPk(user.user_id);
    expect(foundUser).toBeDefined();
    expect(foundUser.username).toBe('testUser');
  });

  it('should update a user', async () => {
    const hashedPassword = await bcrypt.hash('testPassword', 10);
    const user = await User.create({
      username: 'testUser',
      password_hash: hashedPassword
    });

    user.username = 'updatedUser';
    await user.save();

    const updatedUser = await User.findByPk(user.user_id);
    expect(updatedUser.username).toBe('updatedUser');
  });

  it('should delete a user', async () => {
    const hashedPassword = await bcrypt.hash('testPassword', 10);
    const user = await User.create({
      username: 'testUser',
      password_hash: hashedPassword
    });

    await user.destroy();

    const deletedUser = await User.findByPk(user.user_id);
    expect(deletedUser).toBeNull();
  });
});


describe('PUT /api/user/profile', () => {
  it('should update the username if the old username is correct', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({
        username: 'oldUsername',
        password: 'testPassword'
      });

    const loginResponse = await request(server)
      .post('/api/auth/login')
      .send({
        username: 'oldUsername',
        password: 'testPassword'
      });

    const token = loginResponse.body.token;

    const response = await request(server)
      .put('/api/user/profile')
      .send({
        usernames: ['oldUsername', 'newUsername'],
        passwords: ['testPassword', 'newTestPassword']
      })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Profile updated successfully');

    const updatedUser = await User.findOne({ where: { username: 'newUsername' } });
    expect(updatedUser).toBeDefined();
    expect(updatedUser.username).toBe('newUsername');
  });

  it('should return 401 if the user does not exist', async () => {

    const token = generateTestToken(999);

    const response = await request(server)
      .put('/api/user/profile')
      .send({
        usernames: ['nonexistentUser', 'newUsername'],
        passwords: ['testPassword', 'newTestPassword']
      })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid Token');
  });
});


const generateTestToken = (userId) => {
  const payload = { userId };
  const secret = process.env.JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn: '1h' });
};