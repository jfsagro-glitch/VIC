import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import socketService from '../../services/socket';
import { projectsAPI } from '../../services/api';

function Generation({ projectId, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [status, setStatus] = useState('generating');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!projectId) return;

    // Подписываемся на обновления прогресса
    const unsubscribe = socketService.subscribeToProject(projectId, (data) => {
      const { taskType, progress: taskProgress, message } = data;
      
      // Маппинг типов задач на общий прогресс
      const progressMap = {
        script_generation: { min: 0, max: 20 },
        video_generation: { min: 20, max: 80 },
        voice_synthesis: { min: 80, max: 90 },
        music_overlay: { min: 90, max: 95 },
        final_assembly: { min: 95, max: 100 },
      };

      const taskRange = progressMap[taskType] || { min: 0, max: 100 };
      const overallProgress = taskRange.min + (taskProgress / 100) * (taskRange.max - taskRange.min);
      
      setProgress(Math.round(overallProgress));
      setCurrentTask(message || taskType);

      if (taskType === 'final_assembly' && taskProgress === 100) {
        setStatus('completed');
      }
    });

    // Периодически проверяем статус проекта
    const checkStatus = async () => {
      try {
        const response = await projectsAPI.getById(projectId);
        if (response.project.status === 'ready') {
          setStatus('completed');
          setProgress(100);
        }
      } catch (err) {
        console.error('Error checking status:', err);
      }
    };

    const interval = setInterval(checkStatus, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [projectId]);

  const handleViewProject = () => {
    if (projectId) {
      navigate(`/projects/${projectId}`);
    }
  };

  if (error) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Генерация видео
      </Typography>

      {status === 'generating' && (
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            px: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          }}
        >
          <Box sx={{ maxWidth: 500, mx: 'auto' }}>
            <CircularProgress
              size={80}
              thickness={4}
              sx={{
                color: 'primary.main',
                mb: 3,
              }}
            />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              {currentTask || 'Инициализация...'}
            </Typography>
            <Box sx={{ mt: 3, mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  },
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  mt: 2,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {progress}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              Это может занять несколько минут. Пожалуйста, не закрывайте страницу.
            </Typography>
          </Box>
        </Box>
      )}

      {status === 'completed' && (
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            px: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            🎉 Видео готово!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Ваше видео успешно сгенерировано. Теперь вы можете просмотреть и отредактировать его.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleViewProject}
            sx={{
              minWidth: 250,
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Перейти к просмотру и редактированию
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default Generation;

