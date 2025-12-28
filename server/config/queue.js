const Queue = require('bull');
const Redis = require('redis');

// Настройка Redis для очередей
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

// Создание очередей для разных типов задач
const videoQueue = new Queue('video generation', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600, // хранить завершенные задачи 1 час
      count: 1000,
    },
  },
});

const scriptQueue = new Queue('script generation', { redis: redisConfig });
const voiceQueue = new Queue('voice synthesis', { redis: redisConfig });
const musicQueue = new Queue('music overlay', { redis: redisConfig });
const assemblyQueue = new Queue('final assembly', { redis: redisConfig });

module.exports = {
  videoQueue,
  scriptQueue,
  voiceQueue,
  musicQueue,
  assemblyQueue,
};

