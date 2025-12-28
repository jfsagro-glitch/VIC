import React from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, Box } from '@mui/material';

const templates = [
  {
    id: 'product',
    name: 'Продукт',
    description: 'Реклама продукта с акцентом на детали и качество',
    icon: '📦',
  },
  {
    id: 'promo',
    name: 'Промо',
    description: 'Динамичное промо-видео с энергичным ритмом',
    icon: '🎬',
  },
  {
    id: 'tutorial',
    name: 'Обучающее',
    description: 'Пошаговое обучающее видео',
    icon: '📚',
  },
  {
    id: 'testimonial',
    name: 'Отзыв',
    description: 'Видео с отзывами и рекомендациями',
    icon: '💬',
  },
  {
    id: 'corporate',
    name: 'Корпоративное',
    description: 'Профессиональное корпоративное видео',
    icon: '🏢',
  },
];

function TemplateSelection({ selectedTemplate, onSelect }) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Выберите тип видео
      </Typography>
      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card
              sx={{
                cursor: 'pointer',
                height: '100%',
                border: selectedTemplate === template.id ? 3 : 1,
                borderColor: selectedTemplate === template.id
                  ? 'primary.main'
                  : 'rgba(0, 0, 0, 0.08)',
                borderRadius: 3,
                background: selectedTemplate === template.id
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                  : 'white',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  borderColor: selectedTemplate === template.id ? 'primary.main' : 'primary.light',
                },
              }}
              onClick={() => onSelect(template.id)}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography
                  variant="h1"
                  sx={{
                    mb: 2,
                    fontSize: '4rem',
                    filter: selectedTemplate === template.id ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {template.icon}
                </Typography>
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    color: selectedTemplate === template.id ? 'primary.main' : 'text.primary',
                  }}
                >
                  {template.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6 }}
                >
                  {template.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default TemplateSelection;

