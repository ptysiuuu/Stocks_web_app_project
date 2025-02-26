const app = require("./app");
const sequelize = require("./db/config");
const cron = require("node-cron");
const updateCurrency = require("./scheduledTasks/updateCurrency");
const updateAssetsPrice = require("./scheduledTasks/updateAssetsPrice");

const PORT = process.env.PORT || 5000;

cron.schedule("49 18 * * *", () => {
  console.log("Running cron job");
  updateCurrency();
  console.log("UpdateCurrency completed");
  updateAssetsPrice();
  console.log("Cron job completed");
});

sequelize
  .sync()
  .then(() => {
    if (process.env.NODE_ENV !== "test") {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
