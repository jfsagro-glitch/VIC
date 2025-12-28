import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import { projectsAPI } from '../services/api';
import TimelineEditor from './TimelineEditor';

function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingSubtitle, setEditingSubtitle] = useState(null);
  const [subtitleText, setSubtitleText] = useState('');
  const [regeneratingScene, setRegeneratingScene] = useState(null);

  useEffect(() => {
    loadProject();
    // Обновляем проект каждые 5 секунд
    const interval = setInterval(loadProject, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const loadProject = async () => {
    try {
      const response = await projectsAPI.getById(id);
      setProject(response.project);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubtitle = (subtitle) => {
    setEditingSubtitle(subtitle);
    setSubtitleText(subtitle.text);
  };

  const handleSaveSubtitle = async () => {
    if (!project || !editingSubtitle) return;

    const updatedSubtitles = project.subtitles.map((sub) =>
      sub.sceneIndex === editingSubtitle.sceneIndex
        ? { ...sub, text: subtitleText }
        : sub
    );

    try {
      await projectsAPI.updateSubtitles(id, updatedSubtitles);
      setProject({ ...project, subtitles: updatedSubtitles });
      setEditingSubtitle(null);
    } catch (error) {
      console.error('Error updating subtitles:', error);
    }
  };

  const handleRegenerateScene = async (sceneIndex) => {
    setRegeneratingScene(sceneIndex);
    try {
      const scene = project.script.scenes[sceneIndex];
      await projectsAPI.regenerateScene(id, sceneIndex, scene.prompt);
      // Обновляем проект через несколько секунд
      setTimeout(loadProject, 3000);
    } catch (error) {
      console.error('Error regenerating scene:', error);
    } finally {
      setRegeneratingScene(null);
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Загрузка...</Typography>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container>
        <Alert severity="error">Проект не найден</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/projects')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">{project.name}</Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
            Финальное видео
          </Typography>
          {project.finalVideoUrl && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                },
              }}
            >
              Скачать
            </Button>
          )}
        </Box>
        {project.finalVideoUrl ? (
          <Box sx={{ mt: 2 }}>
            <video
              controls
              style={{ width: '100%', maxHeight: '600px', borderRadius: '8px' }}
              src={project.finalVideoUrl}
            />
          </Box>
        ) : (
          <Alert severity="info">Видео еще генерируется...</Alert>
        )}
      </Paper>

      {/* Timeline Editor */}
      {project.script && (
        <TimelineEditor project={project} onUpdate={(updatedScene) => {
          // Обновление сцены через API
          console.log('Updating scene:', updatedScene);
        }} />
      )}

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Сцены и субтитры
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {project.script?.scenes?.map((scene, index) => {
            const subtitle = project.subtitles?.find((s) => s.sceneIndex === index);
            const videoFile = project.mediaFiles?.find(
              (f) => f.type === 'video' && f.sceneIndex === index
            );

            return (
              <Grid item xs={12} md={6} key={index}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">Сцена {index + 1}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRegenerateScene(index)}
                        disabled={regeneratingScene === index}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Box>

                    {videoFile && (
                      <Box sx={{ mb: 2 }}>
                        <video
                          controls
                          style={{ width: '100%', maxHeight: '200px' }}
                          src={videoFile.url}
                        />
                      </Box>
                    )}

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Промпт:
                      </Typography>
                      <Typography variant="body2">{scene.prompt}</Typography>
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Субтитры:
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleEditSubtitle(subtitle || { sceneIndex: index, text: '' })}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="body1">
                        {subtitle?.text || 'Нет субтитров'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Диалог редактирования субтитров */}
      <Dialog open={editingSubtitle !== null} onClose={() => setEditingSubtitle(null)}>
        <DialogTitle>Редактировать субтитры</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={subtitleText}
            onChange={(e) => setSubtitleText(e.target.value)}
            label="Текст субтитров"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingSubtitle(null)}>Отмена</Button>
          <Button onClick={handleSaveSubtitle} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ProjectView;

