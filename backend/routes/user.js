const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../db/models");
const authenticate = require("../middleware/authenticate");

router.put("/profile", authenticate, async (req, res) => {
  try {
    const { usernames, passwords } = req.body;
    if (
      !usernames ||
      !passwords ||
      !Array.isArray(usernames) ||
      !Array.isArray(passwords) ||
      usernames.length !== 2 ||
      passwords.length !== 2
    ) {
      return res.status(400).json({ message: "Invalid request format" });
    }
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const [oldUsername, newUsername] = usernames;
    const [oldPassword, newPassword] = passwords;
    let isUpdated = false;
    if (newUsername && newUsername !== oldUsername) {
      const existingUser = await User.findOne({
        where: { username: newUsername },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      user.username = newUsername;
      isUpdated = true;
    }
    if (newPassword && newPassword !== oldPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password does not match" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password_hash = hashedPassword;
      isUpdated = true;
    }
    if (isUpdated) {
      await user.save();
      return res.status(200).json({ message: "Profile updated successfully" });
    } else {
      return res.status(200).json({ message: "No changes detected" });
    }
  } catch (error) {
    console.error("Profile Update Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
