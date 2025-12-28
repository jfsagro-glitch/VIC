# VIC - Video Intelligence Creator

[![GitHub](https://img.shields.io/badge/GitHub-VIC-blue)](https://github.com/jfsagro-glitch/VIC)

**VIC (Video Intelligence Creator)** - No-code веб-платформа для создания бизнес-видео с помощью AI.

Веб-платформа для создания бизнес-видео с помощью AI, использующая Luma Dream Machine, GPT и ElevenLabs.

## Архитектура

### Backend (Node.js + Express)
- **Очереди задач**: Bull + Redis для асинхронной обработки
- **База данных**: MongoDB для хранения проектов и состояния
- **Real-time обновления**: Socket.IO для progress bar
- **AI интеграции**: Luma AI, OpenAI GPT, ElevenLabs

### Frontend (React)
- Пошаговый конструктор: Выбор шаблона → Настройка → Генерация → Редактирование
- Редактор с возможностью изменения субтитров и замены сцен

## Схема Базы Данных

### Project Schema
```javascript
{
  userId: String,
  name: String,
  template: String,
  parameters: {
    videoType: String, // product, promo, tutorial, testimonial, corporate
    text: String,
    style: String, // modern, classic, cinematic, minimalist, dynamic
    voice: { provider, voiceId, language },
    music: { genre, intensity, url },
    duration: Number,
    aspectRatio: String // 16:9, 9:16, 1:1
  },
  script: {
    scenes: [{
      sceneIndex: Number,
      prompt: String,
      duration: Number,
      subtitle: String
    }]
  },
  mediaFiles: [{
    type: String, // video, audio, subtitle
    url: String,
    duration: Number,
    sceneIndex: Number
  }],
  subtitles: [{
    text: String,
    startTime: Number,
    endTime: Number,
    sceneIndex: Number
  }],
  tasks: [{
    taskId: String,
    type: String, // script_generation, video_generation, voice_synthesis, etc.
    status: String, // pending, processing, completed, failed
    progress: Number, // 0-100
    result: Mixed,
    error: String
  }],
  status: String, // draft, generating, ready, editing, completed
  finalVideoUrl: String,
  thumbnailUrl: String
}
```

## Промпт для Luma Dream Machine

Промпт строится автоматически на основе параметров проекта и включает:

1. **Описание сцены** - на основе текста пользователя
2. **Стиль съемки** - кинематография, композиция, освещение
3. **Темп и ритм** - скорость монтажа, паузы, переходы
4. **Акценты** - фокус на продукте, детали, углы обзора
5. **Технические параметры** - формат, разрешение, качество

Пример промпта для продукта:
```
[описание продукта], focus on product details, highlight key features with close-up shots, showcase product from multiple angles, modern cinematography with smooth camera movements, contemporary framing, sleek visual style, moderate pacing with well-timed cuts, balanced rhythm between fast and slow moments, professional product photography style, clean background, emphasis on product quality and design, horizontal widescreen format, high quality, 4K resolution, professional production value
```

## Поэтапная Загрузка (Progress Bar)

Реализовано через Socket.IO:

1. **Frontend подписывается** на обновления проекта через `socket.emit('subscribe-project', projectId)`
2. **Workers отправляют прогресс** через `io.to('project:${projectId}').emit('progress', { taskType, progress, message })`
3. **Frontend обновляет UI** в реальном времени

Этапы:
- Script Generation (0-20%)
- Video Generation (20-80%) - по сценам
- Voice Synthesis (80-90%)
- Music Overlay (90-95%)
- Final Assembly (95-100%)

## Установка и Запуск

### Требования
- Node.js 18+
- MongoDB
- Redis
- API ключи: Luma AI, OpenAI, ElevenLabs

### Установка

```bash
# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env
# Заполните .env файл своими API ключами

# Запуск MongoDB и Redis (локально или через Docker)
# MongoDB: mongod
# Redis: redis-server

# Запуск сервера
npm run server

# В другом терминале - запуск клиента
cd client
npm install
npm start
```

## API Endpoints

### POST /api/projects
Создание проекта и запуск генерации

**Request:**
```json
{
  "userId": "user123",
  "name": "My Video",
  "template": "product",
  "parameters": {
    "videoType": "product",
    "text": "Introducing our new product",
    "style": "modern",
    "voice": {
      "voiceId": "21m00Tcm4TlvDq8ikWAM",
      "language": "en"
    },
    "music": {
      "genre": "corporate",
      "intensity": "medium"
    },
    "duration": 30,
    "aspectRatio": "16:9"
  }
}
```

**Response:**
```json
{
  "success": true,
  "project": {
    "id": "project_id",
    "name": "My Video",
    "status": "draft",
    "taskId": "task_id"
  }
}
```

### GET /api/projects/:id
Получение проекта с текущим статусом

### PATCH /api/projects/:id/subtitles
Обновление субтитров

### POST /api/projects/:id/scenes/:sceneIndex/regenerate
Регенерация отдельной сцены

## Структура Проекта

```
.
├── server/
│   ├── config/
│   │   ├── database.js      # MongoDB подключение
│   │   └── queue.js         # Настройка очередей Bull
│   ├── models/
│   │   └── Project.js       # Схема проекта
│   ├── services/
│   │   ├── promptBuilder.js # Построение промптов
│   │   └── aiServices.js    # Интеграции с AI API
│   ├── workers/
│   │   └── videoWorker.js   # Workers для обработки задач
│   ├── routes/
│   │   └── projects.js      # API endpoints
│   ├── server.js            # Express + Socket.IO сервер
│   └── index.js             # Точка входа
├── client/                   # React приложение
├── uploads/                  # Загруженные медиафайлы
└── package.json
```

## Особенности

- ✅ Асинхронная обработка через очереди
- ✅ Real-time обновления прогресса
- ✅ Редактирование субтитров без перегенерации
- ✅ Замена отдельных сцен
- ✅ Оптимизированные промпты для Luma Dream Machine
- ✅ Масштабируемая архитектура

## Документация

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Детальная архитектура и ответы на технические вопросы
- [EXAMPLES.md](./EXAMPLES.md) - Примеры использования API
- [SETUP.md](./SETUP.md) - Подробная инструкция по установке
- [DEPLOY.md](./DEPLOY.md) - Инструкция по деплою
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Руководство по внесению вклада

## Примечания

- Для продакшена используйте облачное хранилище (S3, Cloudinary) для медиафайлов
- Настройте CORS для вашего домена
- Добавьте аутентификацию пользователей
- Реализуйте обработку ошибок и retry логику
- Добавьте валидацию входных данных

## Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](./LICENSE) для деталей.

## Ссылки

- [Репозиторий на GitHub](https://github.com/jfsagro-glitch/VIC)
- [Issues](https://github.com/jfsagro-glitch/VIC/issues)
- [Pull Requests](https://github.com/jfsagro-glitch/VIC/pulls)

