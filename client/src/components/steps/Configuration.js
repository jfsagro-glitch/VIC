import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  Slider,
} from '@mui/material';

function Configuration({ parameters, onChange }) {
  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      onChange({
        ...parameters,
        [parent]: {
          ...parameters[parent],
          [child]: value,
        },
      });
    } else {
      onChange({
        ...parameters,
        [field]: value,
      });
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Настройка параметров
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Текст для видео"
            multiline
            rows={4}
            value={parameters.text}
            onChange={(e) => handleChange('text', e.target.value)}
            placeholder="Опишите, что должно быть в видео..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: 'primary.light',
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Стиль</InputLabel>
            <Select
              value={parameters.style}
              label="Стиль"
              onChange={(e) => handleChange('style', e.target.value)}
            >
              <MenuItem value="modern">Современный</MenuItem>
              <MenuItem value="classic">Классический</MenuItem>
              <MenuItem value="cinematic">Кинематографический</MenuItem>
              <MenuItem value="minimalist">Минималистичный</MenuItem>
              <MenuItem value="dynamic">Динамичный</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Формат</InputLabel>
            <Select
              value={parameters.aspectRatio}
              label="Формат"
              onChange={(e) => handleChange('aspectRatio', e.target.value)}
            >
              <MenuItem value="16:9">Горизонтальный (16:9)</MenuItem>
              <MenuItem value="9:16">Вертикальный (9:16)</MenuItem>
              <MenuItem value="1:1">Квадратный (1:1)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Typography gutterBottom>Длительность: {parameters.duration} секунд</Typography>
          <Slider
            value={parameters.duration}
            onChange={(e, value) => handleChange('duration', value)}
            min={15}
            max={120}
            step={5}
            marks
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Жанр музыки</InputLabel>
            <Select
              value={parameters.music.genre}
              label="Жанр музыки"
              onChange={(e) => handleChange('music.genre', e.target.value)}
            >
              <MenuItem value="corporate">Корпоративная</MenuItem>
              <MenuItem value="energetic">Энергичная</MenuItem>
              <MenuItem value="calm">Спокойная</MenuItem>
              <MenuItem value="upbeat">Жизнерадостная</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Интенсивность музыки</InputLabel>
            <Select
              value={parameters.music.intensity}
              label="Интенсивность музыки"
              onChange={(e) => handleChange('music.intensity', e.target.value)}
            >
              <MenuItem value="low">Низкая</MenuItem>
              <MenuItem value="medium">Средняя</MenuItem>
              <MenuItem value="high">Высокая</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Configuration;

