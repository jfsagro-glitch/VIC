import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  VideoLibrary as VideoIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { projectsAPI } from '../services/api';

function AIVideoGenerator() {
  const [activeTab, setActiveTab] = useState(0);
  const [inputType, setInputType] = useState('text'); // text, script, image
  const [textInput, setTextInput] = useState('');
  const [scriptInput, setScriptInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [generating, setGenerating] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const navigate = useNavigate();

  const handleCreateVideo = async () => {
    if (!textInput && !scriptInput && !selectedImage) {
      alert('Пожалуйста, введите текст, скрипт или загрузите изображение');
      return;
    }

    setGenerating(true);

    try {
      const projectData = {
        userId: 'user123',
        name: 'AI Generated Video',
        template: 'product',
        parameters: {
          videoType: 'product',
          text: textInput || scriptInput,
          style: 'modern',
          aspectRatio: aspectRatio,
          duration: 30,
          inputType: inputType,
          imageUrl: selectedImage,
        },
      };

      const response = await projectsAPI.create(projectData);
      setProjectId(response.project.id);
      
      // Переходим к редактору после создания
      setTimeout(() => {
        navigate(`/projects/${response.project.id}`);
      }, 1000);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Ошибка при создании проекта');
    } finally {
      setGenerating(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6, color: 'white' }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 700,
              mb: 2,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          >
            Видео следующего поколения.
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.5rem', md: '2.5rem' },
              fontWeight: 600,
              mb: 4,
              opacity: 0.9,
            }}
          >
            Создано с помощью ИИ.
          </Typography>
        </Box>

        {/* Main Content */}
        <Paper
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            background: 'white',
          }}
        >
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  minHeight: 64,
                },
              }}
            >
              <Tab
                icon={<TextIcon />}
                iconPosition="start"
                label="Текст в видео"
                onClick={() => setInputType('text')}
              />
              <Tab
                icon={<EditIcon />}
                iconPosition="start"
                label="Скрипт"
                onClick={() => setInputType('script')}
              />
              <Tab
                icon={<ImageIcon />}
                iconPosition="start"
                label="Изображение в видео"
                onClick={() => setInputType('image')}
              />
            </Tabs>
          </Box>

          <Box sx={{ p: 4 }}>
            {/* Text Input */}
            {inputType === 'text' && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Опишите ваше видео
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="Например: Создай видео о новом смартфоне с современным дизайном, покажи его функции и преимущества..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: '1.1rem',
                    },
                  }}
                />
              </Box>
            )}

            {/* Script Input */}
            {inputType === 'script' && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Введите подробный скрипт
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={10}
                  placeholder="Сцена 1: Крупный план смартфона, плавное вращение, демонстрация дизайна...&#10;Сцена 2: Показ функций, быстрое переключение между приложениями...&#10;Сцена 3: Финальный кадр с логотипом бренда..."
                  value={scriptInput}
                  onChange={(e) => setScriptInput(e.target.value)}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: '1rem',
                      fontFamily: 'monospace',
                    },
                  }}
                />
              </Box>
            )}

            {/* Image Upload */}
            {inputType === 'image' && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Загрузите изображение
                </Typography>
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    mb: 3,
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: 'rgba(99, 102, 241, 0.05)',
                    },
                  }}
                  onClick={() => document.getElementById('image-upload').click()}
                >
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                  {selectedImage ? (
                    <Box>
                      <img
                        src={selectedImage}
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '300px',
                          borderRadius: '8px',
                          marginBottom: '16px',
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Изображение загружено. Нажмите, чтобы изменить.
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <ImageIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                      <Typography variant="body1" gutterBottom>
                        Перетащите изображение сюда или нажмите для выбора
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Поддерживаются форматы: JPG, PNG, WebP
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Aspect Ratio Selection */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Формат видео
              </Typography>
              <Grid container spacing={2}>
                {[
                  { ratio: '16:9', label: 'Горизонтальный (YouTube, Facebook)', icon: '📺' },
                  { ratio: '9:16', label: 'Вертикальный (TikTok, Instagram)', icon: '📱' },
                  { ratio: '1:1', label: 'Квадратный (Instagram)', icon: '⬜' },
                ].map((format) => (
                  <Grid item xs={12} sm={4} key={format.ratio}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: aspectRatio === format.ratio ? 2 : 1,
                        borderColor:
                          aspectRatio === format.ratio ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.2s',
                      }}
                      onClick={() => setAspectRatio(format.ratio)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h4" sx={{ mb: 1 }}>
                          {format.icon}
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {format.ratio}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format.label}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Generate Button */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleCreateVideo}
              disabled={generating || (!textInput && !scriptInput && !selectedImage)}
              sx={{
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {generating ? 'Генерация...' : 'Создать ИИ видео'}
            </Button>

            {generating && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    },
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  ИИ создает ваше видео... Это может занять несколько минут
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Features */}
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {[
            {
              title: 'Множество ИИ моделей',
              description: 'Google Veo, OpenAI Sora, Minimax Hailuo и другие',
              icon: '🤖',
            },
            {
              title: 'Редактирование сцен',
              description: 'Редактируйте каждую сцену на временной шкале',
              icon: '✂️',
            },
            {
              title: 'Разные форматы',
              description: '16:9, 9:16, 1:1 для любой платформы',
              icon: '📐',
            },
            {
              title: 'HD и 4K',
              description: 'Экспорт в высоком качестве',
              icon: '🎬',
            },
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  height: '100%',
                }}
              >
                <Typography variant="h2" sx={{ mb: 2 }}>
                  {feature.icon}
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default AIVideoGenerator;

