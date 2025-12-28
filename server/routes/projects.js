const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { scriptQueue } = require('../config/queue');

/**
 * POST /api/projects
 * Создание нового проекта и запуск генерации
 */
router.post('/', async (req, res) => {
  try {
    const { userId, name, template, parameters } = req.body;

    // Валидация параметров
    if (!userId || !template || !parameters || !parameters.videoType) {
      return res.status(400).json({
        error: 'Missing required fields: userId, template, parameters.videoType'
      });
    }

    // Создаем проект
    const project = new Project({
      userId,
      name: name || 'Untitled Project',
      template,
      parameters,
      status: 'draft'
    });

    await project.save();

    // Создаем задачу генерации сценария
    const scriptJob = await scriptQueue.add('generate-script', {
      projectId: project._id.toString(),
      parameters
    }, {
      jobId: `script_${project._id}_${Date.now()}`
    });

    // Сохраняем ID задачи в проект
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
      },
      message: 'Project created and generation started'
    });
  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({
      error: 'Failed to create project',
      message: error.message
    });
  }
});

/**
 * GET /api/projects/:id
 * Получение проекта по ID
 */
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Project fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch project',
      message: error.message
    });
  }
});

/**
 * GET /api/projects/user/:userId
 * Получение всех проектов пользователя
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .select('name status template createdAt updatedAt finalVideoUrl thumbnailUrl');

    res.json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('Projects fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch projects',
      message: error.message
    });
  }
});

/**
 * PATCH /api/projects/:id/subtitles
 * Обновление субтитров
 */
router.patch('/:id/subtitles', async (req, res) => {
  try {
    const { subtitles } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    project.subtitles = subtitles;
    project.status = 'editing';
    await project.save();

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Subtitle update error:', error);
    res.status(500).json({
      error: 'Failed to update subtitles',
      message: error.message
    });
  }
});

/**
 * POST /api/projects/:id/scenes/:sceneIndex/regenerate
 * Регенерация отдельной сцены
 */
router.post('/:id/scenes/:sceneIndex/regenerate', async (req, res) => {
  try {
    const { sceneIndex } = req.params;
    const { prompt } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Удаляем старую сцену
    project.mediaFiles = project.mediaFiles.filter(
      f => !(f.type === 'video' && f.sceneIndex === parseInt(sceneIndex))
    );

    // Запускаем регенерацию
    const { videoQueue } = require('../config/queue');
    const job = await videoQueue.add('generate-scene', {
      projectId: project._id.toString(),
      sceneIndex: parseInt(sceneIndex),
      scene: { prompt, duration: 5 },
      parameters: project.parameters
    });

    res.json({
      success: true,
      message: 'Scene regeneration started',
      taskId: job.id
    });
  } catch (error) {
    console.error('Scene regeneration error:', error);
    res.status(500).json({
      error: 'Failed to regenerate scene',
      message: error.message
    });
  }
});

/**
 * DELETE /api/projects/:id
 * Удаление проекта
 */
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      success: true,
      message: 'Project deleted'
    });
  } catch (error) {
    console.error('Project deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete project',
      message: error.message
    });
  }
});

module.exports = router;

