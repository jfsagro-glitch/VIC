const { videoQueue, scriptQueue, voiceQueue, musicQueue, assemblyQueue } = require('../config/queue');
const Project = require('../models/Project');
const aiServices = require('../services/aiServices');
const promptBuilder = require('../services/promptBuilder');

// Получаем io из глобального объекта или создаем заглушку
let io = null;
try {
  const serverModule = require('../server');
  io = serverModule.io;
} catch (e) {
  console.warn('Socket.IO not available in worker context');
}

/**
 * Worker для генерации сценария
 */
scriptQueue.process('generate-script', async (job) => {
  const { projectId, parameters } = job.data;
  
  try {
    // Обновляем статус задачи
    await updateTaskStatus(projectId, job.id, 'processing', 10);
    emitProgress(projectId, 'script_generation', 10, 'Generating script...');

    // Генерируем сценарий
    const script = await aiServices.generateScript(parameters);
    
    // Сохраняем сценарий в проект
    await Project.findByIdAndUpdate(projectId, {
      $set: {
        script: script,
        'status': 'generating'
      }
    });

    await updateTaskStatus(projectId, job.id, 'completed', 100, script);
    emitProgress(projectId, 'script_generation', 100, 'Script generated');

    // Запускаем генерацию видео для каждой сцены
    for (let i = 0; i < script.scenes.length; i++) {
      await videoQueue.add('generate-scene', {
        projectId,
        sceneIndex: i,
        scene: script.scenes[i],
        parameters
      });
    }

    return script;
  } catch (error) {
    await updateTaskStatus(projectId, job.id, 'failed', 0, null, error.message);
    emitProgress(projectId, 'script_generation', 0, `Error: ${error.message}`);
    throw error;
  }
});

/**
 * Worker для генерации видео сцены
 */
videoQueue.process('generate-scene', async (job) => {
  const { projectId, sceneIndex, scene, parameters } = job.data;
  
  try {
    await updateTaskStatus(projectId, job.id, 'processing', 0);
    emitProgress(projectId, 'video_generation', 0, `Generating scene ${sceneIndex + 1}...`);

    // Генерируем видео
    const generation = await aiServices.generateVideo(
      scene.prompt,
      parameters.aspectRatio || '16:9',
      parameters.videoType || 'product',
      parameters.style || 'modern'
    );

    // Периодически проверяем статус
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 60; // максимум 5 минут (5 сек * 60)

    while (!videoUrl && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // ждем 5 секунд
      
      const status = await aiServices.checkVideoStatus(generation.generationId);
      const progress = Math.min(20 + (status.progress || 0) * 0.6, 80);
      
      emitProgress(projectId, 'video_generation', progress, `Rendering scene ${sceneIndex + 1}...`);

      if (status.status === 'completed' && status.videoUrl) {
        videoUrl = status.videoUrl;
        break;
      } else if (status.status === 'failed') {
        throw new Error('Video generation failed');
      }

      attempts++;
    }

    if (!videoUrl) {
      throw new Error('Video generation timeout');
    }

    // Сохраняем медиафайл
    await Project.findByIdAndUpdate(projectId, {
      $push: {
        mediaFiles: {
          type: 'video',
          url: videoUrl,
          duration: scene.duration,
          sceneIndex: sceneIndex
        },
        subtitles: {
          text: scene.subtitle,
          startTime: calculateStartTime(projectId, sceneIndex),
          endTime: calculateStartTime(projectId, sceneIndex) + scene.duration,
          sceneIndex: sceneIndex
        }
      }
    });

    await updateTaskStatus(projectId, job.id, 'completed', 100, { videoUrl });
    emitProgress(projectId, 'video_generation', 100, `Scene ${sceneIndex + 1} completed`);

    // Если все сцены готовы, запускаем синтез голоса
    const project = await Project.findById(projectId);
    if (project.mediaFiles.filter(f => f.type === 'video').length === project.script.scenes.length) {
      await voiceQueue.add('synthesize-voice', { projectId, parameters });
    }

    return { videoUrl, sceneIndex };
  } catch (error) {
    await updateTaskStatus(projectId, job.id, 'failed', 0, null, error.message);
    emitProgress(projectId, 'video_generation', 0, `Error: ${error.message}`);
    throw error;
  }
});

/**
 * Worker для синтеза голоса
 */
voiceQueue.process('synthesize-voice', async (job) => {
  const { projectId, parameters } = job.data;
  
  try {
    await updateTaskStatus(projectId, job.id, 'processing', 0);
    emitProgress(projectId, 'voice_synthesis', 0, 'Synthesizing voice...');

    const project = await Project.findById(projectId);
    const voiceId = parameters.voice?.voiceId || 'default';
    
    // Собираем весь текст для озвучки
    const fullText = project.script.scenes.map(s => s.subtitle).join(' ');

    // Генерируем аудио
    const audioBuffer = await aiServices.synthesizeVoice(
      fullText,
      voiceId,
      parameters.voice?.language || 'en'
    );

    // Здесь нужно сохранить аудиофайл (например, в S3 или локально)
    // Для примера используем временное хранилище
    const audioUrl = await saveAudioFile(projectId, audioBuffer);

    await Project.findByIdAndUpdate(projectId, {
      $push: {
        mediaFiles: {
          type: 'audio',
          url: audioUrl
        }
      }
    });

    await updateTaskStatus(projectId, job.id, 'completed', 100, { audioUrl });
    emitProgress(projectId, 'voice_synthesis', 100, 'Voice synthesis completed');

    // Запускаем наложение музыки
    await musicQueue.add('overlay-music', { projectId, parameters });

    return { audioUrl };
  } catch (error) {
    await updateTaskStatus(projectId, job.id, 'failed', 0, null, error.message);
    emitProgress(projectId, 'voice_synthesis', 0, `Error: ${error.message}`);
    throw error;
  }
});

/**
 * Worker для наложения музыки
 */
musicQueue.process('overlay-music', async (job) => {
  const { projectId, parameters } = job.data;
  
  try {
    await updateTaskStatus(projectId, job.id, 'processing', 0);
    emitProgress(projectId, 'music_overlay', 0, 'Adding music...');

    // Здесь должна быть логика наложения музыки
    // Используем библиотеку типа ffmpeg для сведения аудио
    const musicUrl = parameters.music?.url || null;

    if (musicUrl) {
      // Процесс наложения музыки (упрощенный пример)
      const finalAudioUrl = await overlayMusic(projectId, musicUrl);

      await Project.findByIdAndUpdate(projectId, {
        $set: {
          'parameters.music.url': finalAudioUrl
        }
      });
    }

    await updateTaskStatus(projectId, job.id, 'completed', 100);
    emitProgress(projectId, 'music_overlay', 100, 'Music added');

    // Запускаем финальную сборку
    await assemblyQueue.add('assemble-final', { projectId });

    return { success: true };
  } catch (error) {
    await updateTaskStatus(projectId, job.id, 'failed', 0, null, error.message);
    emitProgress(projectId, 'music_overlay', 0, `Error: ${error.message}`);
    throw error;
  }
});

/**
 * Worker для финальной сборки видео
 */
assemblyQueue.process('assemble-final', async (job) => {
  const { projectId } = job.data;
  
  try {
    await updateTaskStatus(projectId, job.id, 'processing', 0);
    emitProgress(projectId, 'final_assembly', 0, 'Assembling final video...');

    const project = await Project.findById(projectId);
    
    // Собираем все видео сцены, добавляем аудио и субтитры
    // Используем ffmpeg для финальной сборки
    const finalVideoUrl = await assembleVideo(project);

    await Project.findByIdAndUpdate(projectId, {
      $set: {
        finalVideoUrl: finalVideoUrl,
        status: 'ready'
      }
    });

    await updateTaskStatus(projectId, job.id, 'completed', 100, { finalVideoUrl });
    emitProgress(projectId, 'final_assembly', 100, 'Video ready!');

    return { finalVideoUrl };
  } catch (error) {
    await updateTaskStatus(projectId, job.id, 'failed', 0, null, error.message);
    emitProgress(projectId, 'final_assembly', 0, `Error: ${error.message}`);
    throw error;
  }
});

// Вспомогательные функции
async function updateTaskStatus(projectId, taskId, status, progress, result = null, error = null) {
  await Project.findOneAndUpdate(
    { _id: projectId, 'tasks.taskId': taskId },
    {
      $set: {
        'tasks.$.status': status,
        'tasks.$.progress': progress,
        'tasks.$.result': result,
        'tasks.$.error': error,
        'tasks.$.completedAt': status === 'completed' ? new Date() : undefined
      }
    }
  );
}

function emitProgress(projectId, taskType, progress, message) {
  if (io) {
    io.to(`project:${projectId}`).emit('progress', {
      taskType,
      progress,
      message,
      timestamp: new Date()
    });
  }
}

function calculateStartTime(projectId, sceneIndex) {
  // Здесь должна быть логика расчета времени начала сцены
  // Упрощенная версия - нужно получать данные из проекта
  return sceneIndex * 5; // пример: каждая сцена 5 секунд
}

async function saveAudioFile(projectId, buffer) {
  // Реализация сохранения аудиофайла
  // В продакшене используйте S3, Cloudinary и т.д.
  const fs = require('fs').promises;
  const path = require('path');
  const uploadsDir = path.join(__dirname, '../../uploads');
  await fs.mkdir(uploadsDir, { recursive: true });
  
  const filename = `audio_${projectId}_${Date.now()}.mp3`;
  const filepath = path.join(uploadsDir, filename);
  await fs.writeFile(filepath, buffer);
  
  return `/uploads/${filename}`;
}

async function overlayMusic(projectId, musicUrl) {
  // Реализация наложения музыки через ffmpeg
  // Упрощенная версия
  return musicUrl;
}

async function assembleVideo(project) {
  // Реализация сборки финального видео через ffmpeg
  // Объединяет все сцены, добавляет аудио и субтитры
  const videoUrl = `/uploads/final_${project._id}_${Date.now()}.mp4`;
  return videoUrl;
}

module.exports = {
  scriptQueue,
  videoQueue,
  voiceQueue,
  musicQueue,
  assemblyQueue
};

