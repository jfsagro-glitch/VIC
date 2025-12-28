# Инструкция по деплою

## Подготовка к деплою

### 1. Переменные окружения

Убедитесь, что все переменные окружения настроены в `.env`:

```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://...
REDIS_HOST=your-redis-host
REDIS_PORT=6379
LUMA_API_KEY=...
OPENAI_API_KEY=...
ELEVENLABS_API_KEY=...
```

### 2. Сборка клиента

```bash
cd client
npm install
npm run build
cd ..
```

### 3. Установка зависимостей сервера

```bash
npm install --production
```

## Варианты деплоя

### Heroku

1. Установите Heroku CLI
2. Создайте приложение:
```bash
heroku create your-app-name
```

3. Добавьте переменные окружения:
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=...
# и т.д.
```

4. Добавьте buildpacks:
```bash
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add heroku/redis
```

5. Деплой:
```bash
git push heroku main
```

### Railway

1. Подключите репозиторий к Railway
2. Настройте переменные окружения в панели
3. Railway автоматически определит Node.js проект
4. Добавьте MongoDB и Redis как сервисы

### Vercel (только Frontend) + отдельный Backend

**Frontend на Vercel:**
```bash
cd client
npm install -g vercel
vercel
```

**Backend на отдельном сервере:**
- Используйте PM2 или Docker
- Настройте reverse proxy (nginx)

### Docker

Создайте `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY server ./server
COPY client/build ./client/build

EXPOSE 5000

CMD ["node", "server/index.js"]
```

И `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/ai-video-platform
      - REDIS_HOST=redis
    depends_on:
      - mongodb
      - redis

  mongodb:
    image: mongo:latest
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:latest

volumes:
  mongodb_data:
```

Запуск:
```bash
docker-compose up -d
```

## Настройка для продакшена

### 1. Облачное хранилище

Замените локальное хранилище на S3/Cloudinary в `server/workers/videoWorker.js`:

```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

async function saveAudioFile(projectId, buffer) {
  const key = `audio/${projectId}/${Date.now()}.mp3`;
  await s3.putObject({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'audio/mpeg'
  }).promise();
  return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`;
}
```

### 2. CDN

Настройте CDN для раздачи статики и медиафайлов:
- CloudFront (AWS)
- Cloudflare
- BunnyCDN

### 3. Мониторинг

- **Логи**: Winston или Pino
- **Метрики**: Prometheus + Grafana
- **APM**: New Relic или Datadog
- **Ошибки**: Sentry

### 4. Безопасность

- Включите HTTPS (Let's Encrypt)
- Настройте CORS правильно
- Добавьте rate limiting
- Используйте helmet.js
- Настройте аутентификацию (JWT)

### 5. Масштабирование

- Запустите несколько worker процессов
- Используйте Redis Cluster
- Настройте MongoDB Replica Set
- Используйте load balancer

## PM2 для продакшена

```bash
npm install -g pm2

# Запуск
pm2 start server/index.js --name vic-api

# Автозапуск
pm2 startup
pm2 save

# Мониторинг
pm2 monit
```

## Nginx конфигурация

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

