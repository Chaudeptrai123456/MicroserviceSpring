const { Kafka, logLevel } = require("kafkajs");
const dotenv = require("dotenv");
const envFile = process.env.NODE_ENV === "docker" ? ".env.docker" : ".env";
dotenv.config({ path: envFile });
console.log("Kafka broker:", process.env.KAFKA_BROKER);
const kafka = new Kafka({
  clientId: "user-service",
  brokers: [process.env.KAFKA_BROKER || "kafka:9092"],
  logLevel: logLevel.INFO,
});
const producer = kafka.producer({
  allowAutoTopicCreation: true,
});

// Tạo consumer
const consumer = kafka.consumer({
  groupId: process.env.KAFKA_CONSUMER_GROUP_ID,
});

// Hàm connect + log
async function connectKafka() {
  try {
    console.log("Connecting to Kafka...");
    await producer.connect();
    await consumer.connect();
    console.log("broker " + process.env.KAFKA_BROKER);
    console.log(" Kafka connected!");
  } catch (error) {
    console.error(" Kafka connection error:", error);
  }
}

module.exports = {
  kafka,
  producer,
  consumer,
  connectKafka,
};
