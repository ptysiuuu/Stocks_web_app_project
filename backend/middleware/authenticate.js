const jwt = require('jsonwebtoken');
const redisClient = require('../db/redis');

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token not found' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    const reply = await redisClient.get(token);
    if (!reply) {
      return res.status(401).json({ message: 'Invalid Token' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

module.exports = authenticate;