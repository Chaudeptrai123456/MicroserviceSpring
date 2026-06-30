const redis = require("redis");
const dotenv = require("dotenv");
const envFile = process.env.NODE_ENV === "docker" ? ".env.docker" : ".env";
dotenv.config({ path: envFile });
console.log("Redis URL:", process.env.REDIS_URL);
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://redis:6379",
});

redisClient
  .connect()
  .then(() => console.log("✅ Redis connected"))
  .catch((err) => console.error("❌ Redis connection error:", err));

module.exports = redisClient;
