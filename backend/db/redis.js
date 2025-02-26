const redis = require("redis");

const client = redis.createClient({
  url: "redis://localhost:6379",
});

client.on("error", (err) => {
  console.error("Redis error:", err);
});

client.on("connect", () => {
  console.log("Connected to Redis");
});

client.connect().catch((err) => {
  console.error("Error connecting to Redis:", err);
});

module.exports = client;
