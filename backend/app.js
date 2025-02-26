require("dotenv").config({ path: "./backend/.env" });
const express = require("express");
const app = express();
const authRoutes = require("./routes/auth");
const notificationsRoutes = require("./routes/notifications");
const marketRoutes = require("./routes/markets");
const accountRoutes = require("./routes/account");
const orderRoutes = require("./routes/order");
const userRoutes = require("./routes/user");
const favoritesRoutes = require("./routes/favorites");
const cors = require("cors");

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/markets", marketRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/order", orderRoutes.router);
app.use("/api/user", userRoutes);
app.use("/api/favorites", favoritesRoutes);

module.exports = app;
