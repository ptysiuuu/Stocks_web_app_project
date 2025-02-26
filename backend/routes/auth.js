const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { User } = require("../db/models");
const authenticate = require("../middleware/authenticate");
const redisClient = require("../db/redis");

router.post(
  "/register",
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }
    try {
      const userExists = await User.findOne({ where: { username } });
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const { dataValues } = await User.create({
        username,
        password_hash: hashedPassword,
      });

      const token = jwt.sign(
        {
          userId: dataValues.user_id,
          username,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      await redisClient.set(token, dataValues.user_id, "EX", 3600);
      res.status(201).json({ message: "User registered successfully", token });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.post("/login", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user.user_id,
        username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    await redisClient.set(token, user.user_id, "EX", 3600);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", authenticate, async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  try {
    await redisClient.del(token);
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error(
      "Error occurred while deleting token from Redis:",
      err.message
    );
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
