const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');
require('dotenv').config();

// Импорт роутов
const projectsRouter = require('./routes/projects');

// Импорт workers
require('./workers/videoWorker');

const app = express();
const server = http.createServer(app);

// Настройка Socket.IO для real-time обновлений
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Сохраняем io для использования в workers
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы для загруженных медиа
app.use('/uploads', express.static('uploads'));

// Роуты
app.use('/api/projects', projectsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Socket.IO подключения
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Подписка на обновления проекта
  socket.on('subscribe-project', (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`Client ${socket.id} subscribed to project ${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Экспорт io для использования в workers
module.exports.io = io;

const PORT = process.env.PORT || 5000;

// Запуск сервера
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = { app, server, io };

