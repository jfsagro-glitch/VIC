# Архитектура платформы

## Ответы на технические вопросы

### 1. Схема БД для хранения состояния проекта

Схема реализована в `server/models/Project.js`. Основные компоненты:

**Project Document:**
- `userId` - идентификатор пользователя
- `parameters` - все параметры генерации (тип видео, текст, стиль, голос, музыка)
- `script` - сгенерированный сценарий со сценами
- `mediaFiles[]` - массив ссылок на сгенерированные медиафайлы (видео, аудио)
- `tasks[]` - массив задач с их статусами и ID в очереди
- `status` - общий статус проекта (draft, generating, ready, editing, completed)
- `finalVideoUrl` - ссылка на финальное видео

**Преимущества такой схемы:**
- Все данные проекта в одном документе (быстрый доступ)
- Массив `tasks` позволяет отслеживать прогресс каждой задачи
- `mediaFiles` с `sceneIndex` позволяет легко заменять отдельные сцены
- `subtitles` хранятся отдельно для удобного редактирования

### 2. Структура промпта для Luma Dream Machine API

Промпт строится в `server/services/promptBuilder.js` и включает:

1. **Описание сцены** - на основе текста пользователя
2. **Стиль съемки** - кинематография, композиция, освещение
3. **Темп и ритм** - скорость монтажа, паузы, переходы
4. **Акценты** - фокус на продукте, детали, углы обзора
5. **Технические параметры** - формат, разрешение, качество

**Пример промпта для продукта:**
```
[описание продукта], focus on product details, highlight key features with close-up shots, showcase product from multiple angles, modern cinematography with smooth camera movements, contemporary framing, sleek visual style, moderate pacing with well-timed cuts, balanced rhythm between fast and slow moments, professional product photography style, clean background, emphasis on product quality and design, horizontal widescreen format, high quality, 4K resolution, professional production value
```

### 3. Поэтапная загрузка (Progress Bar)

Реализовано через **Socket.IO**:

1. **Frontend** подписывается на обновления проекта:
   ```javascript
   socket.emit('subscribe-project', projectId)
   ```

2. **Workers** отправляют прогресс через:
   ```javascript
   io.to(`project:${projectId}`).emit('progress', {
     taskType: 'video_generation',
     progress: 45,
     message: 'Rendering scene 2...'
   })
   ```

3. **Frontend** обновляет UI в реальном времени

**Этапы прогресса:**
- Script Generation: 0-20%
- Video Generation: 20-80% (прогресс по сценам)
- Voice Synthesis: 80-90%
- Music Overlay: 90-95%
- Final Assembly: 95-100%

### 4. Пример кода API endpoint

Реализовано в `server/routes/projects.js`:

```javascript
router.post('/', async (req, res) => {
  try {
    const { userId, name, template, parameters } = req.body;

    // Создаем проект
    const project = new Project({
      userId,
      name: name || 'Untitled Project',
      template,
      parameters,
      status: 'draft'
    });
    await project.save();

    // Ставим задачу в очередь
    const scriptJob = await scriptQueue.add('generate-script', {
      projectId: project._id.toString(),
      parameters
    }, {
      jobId: `script_${project._id}_${Date.now()}`
    });

    // Сохраняем ID задачи
    project.tasks.push({
      taskId: scriptJob.id,
      type: 'script_generation',
      status: 'pending'
    });
    await project.save();

    res.status(201).json({
      success: true,
      project: {
        id: project._id,
        name: project.name,
        status: project.status,
        taskId: scriptJob.id
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Пайплайн обработки

```
1. POST /api/projects
   ↓
2. Создание проекта в БД
   ↓
3. scriptQueue.add() → Worker генерирует сценарий через GPT
   ↓
4. Для каждой сцены: videoQueue.add() → Worker генерирует видео через Luma
   ↓
5. voiceQueue.add() → Worker синтезирует голос через ElevenLabs
   ↓
6. musicQueue.add() → Worker накладывает музыку
   ↓
7. assemblyQueue.add() → Worker собирает финальное видео
   ↓
8. Обновление проекта: status = 'ready', finalVideoUrl = ...
```

## Масштабирование

- **Горизонтальное масштабирование**: Запуск нескольких worker процессов
- **Redis Cluster**: Для распределенных очередей
- **MongoDB Replica Set**: Для высокой доступности БД
- **CDN**: Для раздачи медиафайлов
- **Облачное хранилище**: S3/Cloudinary для медиафайлов

