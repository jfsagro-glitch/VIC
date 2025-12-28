/**
 * Сервис для построения промптов для Luma Dream Machine API
 * Оптимизирован для создания рекламных бизнес-видео
 */

class PromptBuilder {
  /**
   * Строит промпт для Luma Dream Machine на основе параметров проекта
   * @param {Object} params - Параметры проекта
   * @returns {String} - Готовый промпт для Luma API
   */
  buildLumaPrompt(params) {
    const { videoType, text, style, aspectRatio } = params;
    
    // Базовые настройки в зависимости от типа видео
    const typeConfig = this.getTypeConfig(videoType);
    
    // Настройки стиля съемки
    const styleConfig = this.getStyleConfig(style);
    
    // Построение промпта
    const prompt = [
      // Основная сцена
      this.buildSceneDescription(text, typeConfig),
      
      // Стиль съемки
      styleConfig.cinematography,
      
      // Темп и ритм
      styleConfig.pacing,
      
      // Акценты и фокус
      typeConfig.focus,
      
      // Технические параметры
      this.buildTechnicalSpecs(aspectRatio, styleConfig),
      
      // Дополнительные детали
      typeConfig.additionalDetails
    ].filter(Boolean).join(', ');

    return prompt;
  }

  getTypeConfig(videoType) {
    const configs = {
      product: {
        focus: 'focus on product details, highlight key features with close-up shots, showcase product from multiple angles',
        additionalDetails: 'professional product photography style, clean background, emphasis on product quality and design',
      },
      promo: {
        focus: 'dynamic action sequences, energetic movement, highlight benefits and value proposition',
        additionalDetails: 'engaging visuals that capture attention, vibrant colors, compelling narrative flow',
      },
      tutorial: {
        focus: 'clear step-by-step demonstration, easy to follow, instructional clarity',
        additionalDetails: 'educational format, well-lit environment, clear visual hierarchy',
      },
      testimonial: {
        focus: 'authentic human connection, emotional resonance, trust-building visuals',
        additionalDetails: 'warm atmosphere, natural lighting, genuine expressions',
      },
      corporate: {
        focus: 'professional environment, team collaboration, business excellence',
        additionalDetails: 'polished corporate aesthetic, modern office setting, confident body language',
      },
    };

    return configs[videoType] || configs.product;
  }

  getStyleConfig(style) {
    const configs = {
      modern: {
        cinematography: 'modern cinematography with smooth camera movements, contemporary framing, sleek visual style',
        pacing: 'moderate pacing with well-timed cuts, balanced rhythm between fast and slow moments',
      },
      classic: {
        cinematography: 'classic filmmaking approach, traditional composition, timeless aesthetic',
        pacing: 'deliberate pacing, allowing moments to breathe, elegant transitions',
      },
      cinematic: {
        cinematography: 'cinematic quality with dramatic lighting, depth of field, film-like color grading',
        pacing: 'cinematic pacing with dramatic pauses, epic scale, emotional beats',
      },
      minimalist: {
        cinematography: 'minimalist composition, clean lines, negative space, simple elegance',
        pacing: 'slow and contemplative pacing, minimal cuts, focus on essential elements',
      },
      dynamic: {
        cinematography: 'dynamic camera work with quick movements, varied angles, energetic framing',
        pacing: 'fast-paced editing with quick cuts, high energy, rapid visual rhythm',
      },
    };

    return configs[style] || configs.modern;
  }

  buildSceneDescription(text, typeConfig) {
    // Извлекаем ключевые элементы из текста
    const sceneBase = text || 'professional business video';
    
    return `${sceneBase}, ${typeConfig.focus}`;
  }

  buildTechnicalSpecs(aspectRatio, styleConfig) {
    const specs = [];
    
    if (aspectRatio === '9:16') {
      specs.push('vertical format optimized for mobile viewing');
    } else if (aspectRatio === '1:1') {
      specs.push('square format for social media');
    } else {
      specs.push('horizontal widescreen format');
    }
    
    specs.push('high quality, 4K resolution, professional production value');
    
    return specs.join(', ');
  }

  /**
   * Строит промпт для GPT для генерации сценария
   */
  buildScriptPrompt(params) {
    const { videoType, text, duration } = params;
    
    return `Create a professional video script for a ${videoType} video.

Requirements:
- Duration: approximately ${duration || 30} seconds
- Type: ${videoType}
- Main message: ${text}

The script should include:
1. Scene-by-scene breakdown with visual descriptions
2. Timing for each scene
3. Subtitle text for each scene
4. Visual prompts optimized for AI video generation

Format the response as JSON with the following structure:
{
  "scenes": [
    {
      "sceneIndex": 1,
      "prompt": "detailed visual description for AI video generation",
      "duration": 5,
      "subtitle": "text to display as subtitle"
    }
  ]
}`;
  }
}

module.exports = new PromptBuilder();

