# Инструкция по установке и настройке

## Предварительные требования

- Node.js 18+ 
- MongoDB 6+
- Redis 7+
- API ключи:
  - Luma AI API Key
  - OpenAI API Key
  - ElevenLabs API Key

## Установка

### 1. Клонирование и установка зависимостей

```bash
# Установка зависимостей сервера
npm install

# Установка зависимостей клиента
cd client
npm install
cd ..
```

### 2. Настройка MongoDB

#### Локальная установка
```bash
# Установка MongoDB (пример для Ubuntu)
sudo apt-get install mongodb

# Запуск MongoDB
sudo systemctl start mongodb
```

#### Или через Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. Настройка Redis

#### Локальная установка
```bash
# Установка Redis (пример для Ubuntu)
sudo apt-get install redis-server

# Запуск Redis
sudo systemctl start redis
```

#### Или через Docker
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

### 4. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
cp .env.example .env
```

Заполните файл `.env`:

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/ai-video-platform

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# AI Services API Keys
LUMA_API_KEY=your_luma_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### 5. Получение API ключей

#### Luma AI
1. Зарегистрируйтесь на https://lumalabs.ai
2. Перейдите в раздел API
3. Создайте API ключ

#### OpenAI
1. Зарегистрируйтесь на https://platform.openai.com
2. Перейдите в API Keys
3. Создайте новый ключ

#### ElevenLabs
1. Зарегистрируйтесь на https://elevenlabs.io
2. Перейдите в Profile → API Keys
3. Создайте новый ключ

## Запуск

### Режим разработки

#### Вариант 1: Запуск через concurrently (рекомендуется)
```bash
npm run dev
```

Это запустит одновременно сервер и клиент.

#### Вариант 2: Запуск отдельно

Терминал 1 (Сервер):
```bash
npm run server
```

Терминал 2 (Клиент):
```bash
cd client
npm start
```

### Режим продакшена

#### 1. Сборка клиента
```bash
cd client
npm run build
cd ..
```

#### 2. Запуск сервера
```bash
NODE_ENV=production npm run server
```

Или с использованием PM2:
```bash
npm install -g pm2
pm2 start server/index.js --name ai-video-platform
```

## Проверка работы

1. Откройте браузер: http://localhost:3000
2. Создайте тестовый проект
3. Проверьте консоль сервера на наличие ошибок
4. Проверьте MongoDB и Redis подключения

## Структура директорий

```
.
├── server/              # Backend код
│   ├── config/          # Конфигурация (БД, очереди)
│   ├── models/          # Mongoose модели
│   ├── services/        # Бизнес-логика (AI сервисы)
│   ├── workers/         # Workers для очередей
│   ├── routes/          # API endpoints
│   └── server.js        # Express сервер
├── client/              # Frontend код
│   ├── src/
│   │   ├── components/  # React компоненты
│   │   ├── services/    # API клиенты
│   │   └── App.js
│   └── public/
├── uploads/             # Загруженные медиафайлы
└── package.json
```

## Troubleshooting

### MongoDB не подключается
- Проверьте, что MongoDB запущен: `sudo systemctl status mongodb`
- Проверьте URI в `.env`
- Проверьте права доступа

### Redis не подключается
- Проверьте, что Redis запущен: `redis-cli ping` (должен вернуть PONG)
- Проверьте хост и порт в `.env`

### Ошибки API
- Проверьте правильность API ключей
- Проверьте баланс на счетах API сервисов
- Проверьте лимиты API

### Workers не обрабатывают задачи
- Убедитесь, что Redis работает
- Проверьте логи сервера
- Убедитесь, что workers загружены: `require('./workers/videoWorker')`

## Docker Compose (опционально)

Создайте `docker-compose.yml`:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:latest
    ports:
      - "6379:6379"

volumes:
  mongodb_data:
```

Запуск:
```bash
docker-compose up -d
```

## Мониторинг

### Bull Board (для мониторинга очередей)

Установите:
```bash
npm install @bull-board/express @bull-board/ui
```

Добавьте в `server/server.js`:
```javascript
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullAdapter(scriptQueue),
    new BullAdapter(videoQueue),
    // ... другие очереди
  ],
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());
```

Доступ: http://localhost:5000/admin/queues

