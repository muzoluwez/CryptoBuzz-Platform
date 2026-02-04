// emailer/config/queue.js
const IORedis = require('ioredis');
require('dotenv').config();

const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null,
  username: process.env.REDIS_USERNAME || 'default',
  maxRetriesPerRequest: null
});

const queueName = 'criptobuzz-email-queue';

module.exports = {
  redisConnection,
  queueName
};