import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import TemplateSelection from './steps/TemplateSelection';
import Configuration from './steps/Configuration';
import Generation from './steps/Generation';
import { projectsAPI } from '../services/api';

const steps = ['Выбор шаблона', 'Настройка', 'Генерация', 'Просмотр и редактирование'];

function VideoCreator() {
  const [activeStep, setActiveStep] = useState(0);
  const [projectData, setProjectData] = useState({
    userId: 'user123', // В продакшене получать из аутентификации
    name: '',
    template: '',
    parameters: {
      videoType: 'product',
      text: '',
      style: 'modern',
      voice: {
        voiceId: '21m00Tcm4TlvDq8ikWAM',
        language: 'en',
      },
      music: {
        genre: 'corporate',
        intensity: 'medium',
      },
      duration: 30,
      aspectRatio: '16:9',
    },
  });
  const [projectId, setProjectId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleNext = () => {
    if (activeStep === 1) {
      // Перед генерацией создаем проект
      handleCreateProject();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleCreateProject = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await projectsAPI.create(projectData);
      setProjectId(response.project.id);
      setActiveStep(2); // Переходим к шагу генерации
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при создании проекта');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectReady = () => {
    if (projectId) {
      navigate(`/projects/${projectId}`);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <TemplateSelection
            selectedTemplate={projectData.template}
            onSelect={(template) =>
              setProjectData((prev) => ({ ...prev, template, parameters: { ...prev.parameters, videoType: template } }))
            }
          />
        );
      case 1:
        return (
          <Configuration
            parameters={projectData.parameters}
            onChange={(parameters) =>
              setProjectData((prev) => ({ ...prev, parameters }))
            }
          />
        );
      case 2:
        return (
          <Generation
            projectId={projectId}
            onComplete={handleProjectReady}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 6 },
          background: 'white',
          borderRadius: 3,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Создание бизнес-видео
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Создайте профессиональное видео за несколько минут с помощью AI
          </Typography>
        </Box>

        <Stepper
          activeStep={activeStep}
          sx={{
            mt: 4,
            mb: 6,
            '& .MuiStepLabel-root .Mui-completed': {
              color: '#10b981',
            },
            '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel': {
              color: '#10b981',
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    fontWeight: 500,
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            minHeight: '400px',
            mb: 4,
            p: { xs: 2, md: 4 },
            borderRadius: 2,
            backgroundColor: 'rgba(99, 102, 241, 0.02)',
          }}
        >
          {renderStepContent(activeStep)}
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Button
            variant="outlined"
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
            sx={{
              minWidth: 120,
              borderColor: '#cbd5e1',
              '&:hover': {
                borderColor: '#94a3b8',
                backgroundColor: 'rgba(99, 102, 241, 0.04)',
              },
            }}
          >
            Назад
          </Button>
          {activeStep < steps.length - 1 && (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading || (activeStep === 0 && !projectData.template)}
              sx={{
                minWidth: 120,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                },
                '&:disabled': {
                  background: '#cbd5e1',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Далее'}
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default VideoCreator;

