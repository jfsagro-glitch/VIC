import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';

function TimelineEditor({ project, onUpdate }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [editingScene, setEditingScene] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const totalDuration = project?.script?.scenes?.reduce((sum, scene) => sum + (scene.duration || 5), 0) || 0;

  const handleEditScene = (scene, index) => {
    setEditingScene({ ...scene, index });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingScene && onUpdate) {
      onUpdate(editingScene);
    }
    setEditDialogOpen(false);
    setEditingScene(null);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Временная шкала
          </Typography>
          <Box>
            <IconButton
              color="primary"
              onClick={() => setPlaying(!playing)}
              sx={{ mr: 1 }}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              size="small"
            >
              Добавить сцену
            </Button>
          </Box>
        </Box>

        {/* Timeline */}
        <Box
          sx={{
            position: 'relative',
            height: '120px',
            background: 'linear-gradient(to right, #f0f0f0 0%, #e0e0e0 100%)',
            borderRadius: 1,
            p: 2,
            mb: 2,
          }}
        >
          {project?.script?.scenes?.map((scene, index) => {
            const startTime = project.script.scenes
              .slice(0, index)
              .reduce((sum, s) => sum + (s.duration || 5), 0);
            const width = ((scene.duration || 5) / totalDuration) * 100;

            return (
              <Box
                key={index}
                sx={{
                  position: 'absolute',
                  left: `${(startTime / totalDuration) * 100}%`,
                  width: `${width}%`,
                  height: '80px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 1,
                  p: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  },
                  transition: 'all 0.2s',
                }}
                onClick={() => handleEditScene(scene, index)}
              >
                <Typography
                  variant="caption"
                  sx={{ color: 'white', fontWeight: 600, fontSize: '0.7rem' }}
                >
                  Сцена {index + 1}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'white', fontSize: '0.6rem', opacity: 0.9 }}
                >
                  {scene.duration || 5}с
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Scenes List */}
        <Box>
          {project?.script?.scenes?.map((scene, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                '&:hover': {
                  boxShadow: 4,
                },
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Сцена {index + 1}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {scene.prompt}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Длительность: {scene.duration || 5} секунд
                </Typography>
              </Box>
              <Box>
                <IconButton
                  color="primary"
                  onClick={() => handleEditScene(scene, index)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Редактировать сцену</DialogTitle>
        <DialogContent>
          {editingScene && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Описание сцены"
                multiline
                rows={4}
                value={editingScene.prompt || ''}
                onChange={(e) =>
                  setEditingScene({ ...editingScene, prompt: e.target.value })
                }
                sx={{ mb: 3 }}
              />
              <Typography gutterBottom>Длительность: {editingScene.duration || 5} секунд</Typography>
              <Slider
                value={editingScene.duration || 5}
                onChange={(e, value) =>
                  setEditingScene({ ...editingScene, duration: value })
                }
                min={3}
                max={15}
                step={1}
                marks
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TimelineEditor;

