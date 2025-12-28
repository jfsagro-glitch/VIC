# Примеры использования API

## Создание проекта и запуск генерации

### Запрос
```bash
POST http://localhost:5000/api/projects
Content-Type: application/json

{
  "userId": "user123",
  "name": "Реклама нового продукта",
  "template": "product",
  "parameters": {
    "videoType": "product",
    "text": "Представляем наш новый смартфон с революционными возможностями",
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

### Ответ
```json
{
  "success": true,
  "project": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Реклама нового продукта",
    "status": "draft",
    "taskId": "script_65a1b2c3d4e5f6g7h8i9j0k1_1704067200000"
  },
  "message": "Project created and generation started"
}
```

## Получение статуса проекта

### Запрос
```bash
GET http://localhost:5000/api/projects/65a1b2c3d4e5f6g7h8i9j0k1
```

### Ответ
```json
{
  "success": true,
  "project": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "userId": "user123",
    "name": "Реклама нового продукта",
    "status": "generating",
    "parameters": { ... },
    "script": {
      "scenes": [
        {
          "sceneIndex": 0,
          "prompt": "Close-up shot of a modern smartphone...",
          "duration": 5,
          "subtitle": "Представляем наш новый смартфон"
        }
      ]
    },
    "tasks": [
      {
        "taskId": "script_...",
        "type": "script_generation",
        "status": "completed",
        "progress": 100
      },
      {
        "taskId": "video_...",
        "type": "video_generation",
        "status": "processing",
        "progress": 45
      }
    ],
    "mediaFiles": [
      {
        "type": "video",
        "url": "https://...",
        "sceneIndex": 0
      }
    ]
  }
}
```

## Обновление субтитров

### Запрос
```bash
PATCH http://localhost:5000/api/projects/65a1b2c3d4e5f6g7h8i9j0k1/subtitles
Content-Type: application/json

{
  "subtitles": [
    {
      "text": "Обновленный текст субтитров",
      "startTime": 0,
      "endTime": 5,
      "sceneIndex": 0
    }
  ]
}
```

## Регенерация отдельной сцены

### Запрос
```bash
POST http://localhost:5000/api/projects/65a1b2c3d4e5f6g7h8i9j0k1/scenes/0/regenerate
Content-Type: application/json

{
  "prompt": "Новое описание сцены для регенерации"
}
```

### Ответ
```json
{
  "success": true,
  "message": "Scene regeneration started",
  "taskId": "video_scene_0_1704067300000"
}
```

## WebSocket подключение для прогресса

### JavaScript (клиент)
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Подписка на обновления проекта
socket.emit('subscribe-project', '65a1b2c3d4e5f6g7h8i9j0k1');

// Получение обновлений прогресса
socket.on('progress', (data) => {
  console.log('Task:', data.taskType);
  console.log('Progress:', data.progress + '%');
  console.log('Message:', data.message);
  
  // Обновление UI
  updateProgressBar(data.progress);
  updateStatusMessage(data.message);
});
```

## Примеры промптов для разных типов видео

### Product (Продукт)
```
Modern smartphone with sleek design, focus on product details, highlight key features with close-up shots, showcase product from multiple angles, modern cinematography with smooth camera movements, contemporary framing, sleek visual style, moderate pacing with well-timed cuts, balanced rhythm between fast and slow moments, professional product photography style, clean background, emphasis on product quality and design, horizontal widescreen format, high quality, 4K resolution, professional production value
```

### Promo (Промо)
```
Dynamic action sequences showcasing product benefits, energetic movement, highlight benefits and value proposition, engaging visuals that capture attention, vibrant colors, compelling narrative flow, dynamic camera work with quick movements, varied angles, energetic framing, fast-paced editing with quick cuts, high energy, rapid visual rhythm, horizontal widescreen format, high quality, 4K resolution, professional production value
```

### Corporate (Корпоративное)
```
Professional business environment, team collaboration, business excellence, polished corporate aesthetic, modern office setting, confident body language, classic filmmaking approach, traditional composition, timeless aesthetic, deliberate pacing, allowing moments to breathe, elegant transitions, horizontal widescreen format, high quality, 4K resolution, professional production value
```

## Структура очередей задач

### 1. Script Generation Queue
- **Тип**: `script_generation`
- **Входные данные**: `{ projectId, parameters }`
- **Выходные данные**: Сценарий со сценами
- **Следующий шаг**: Запуск генерации видео для каждой сцены

### 2. Video Generation Queue
- **Тип**: `video_generation`
- **Входные данные**: `{ projectId, sceneIndex, scene, parameters }`
- **Выходные данные**: URL сгенерированного видео
- **Следующий шаг**: После всех сцен → Voice Synthesis

### 3. Voice Synthesis Queue
- **Тип**: `voice_synthesis`
- **Входные данные**: `{ projectId, parameters }`
- **Выходные данные**: URL аудиофайла
- **Следующий шаг**: Music Overlay

### 4. Music Overlay Queue
- **Тип**: `music_overlay`
- **Входные данные**: `{ projectId, parameters }`
- **Выходные данные**: URL финального аудио
- **Следующий шаг**: Final Assembly

### 5. Final Assembly Queue
- **Тип**: `final_assembly`
- **Входные данные**: `{ projectId }`
- **Выходные данные**: URL финального видео
- **Результат**: Проект готов (`status: 'ready'`)

## Обработка ошибок

Все workers имеют встроенную обработку ошибок:
- Автоматический retry (3 попытки)
- Экспоненциальная задержка между попытками
- Сохранение ошибки в поле `tasks[].error`
- Отправка ошибки через Socket.IO

## Масштабирование

Для продакшена рекомендуется:
1. Запуск нескольких worker процессов
2. Использование Redis Cluster
3. Хранение медиафайлов в S3/Cloudinary
4. CDN для раздачи статики
5. Мониторинг через Bull Board или аналоги

