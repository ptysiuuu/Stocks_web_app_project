const express = require("express");
const router = express.Router();
const { Notification } = require("../db/models");
const authenticate = require("../middleware/authenticate");

router.get("/", authenticate, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.userId },
    });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:notificationId/read", authenticate, async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.is_read = !notification.is_read;
    await notification.save();

    res.status(200).json({ message: "Notification updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:notificationId", authenticate, async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.destroy();

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
