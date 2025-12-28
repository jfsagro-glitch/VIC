const axios = require('axios');

/**
 * Сервисы для интеграции с AI API
 */

class AIServices {
  constructor() {
    this.lumaApiKey = process.env.LUMA_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
    
    this.lumaBaseUrl = 'https://api.lumalabs.ai/v1';
    this.openaiBaseUrl = 'https://api.openai.com/v1';
    this.elevenlabsBaseUrl = 'https://api.elevenlabs.io/v1';
  }

  /**
   * Генерация сценария через GPT
   */
  async generateScript(params) {
    try {
      const promptBuilder = require('./promptBuilder');
      const prompt = promptBuilder.buildScriptPrompt(params);

      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a professional video scriptwriter specializing in business and marketing videos. Always return valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const script = JSON.parse(response.data.choices[0].message.content);
      return script;
    } catch (error) {
      console.error('Script generation error:', error);
      throw new Error(`Failed to generate script: ${error.message}`);
    }
  }

  /**
   * Генерация видео через Luma Dream Machine
   */
  async generateVideo(prompt, aspectRatio = '16:9', videoType = 'product', style = 'modern') {
    try {
      const promptBuilder = require('./promptBuilder');
      const fullPrompt = promptBuilder.buildLumaPrompt({
        text: prompt,
        videoType: videoType,
        style: style,
        aspectRatio
      });

      // Запуск генерации видео
      const response = await axios.post(
        `${this.lumaBaseUrl}/generations`,
        {
          prompt: fullPrompt,
          aspect_ratio: aspectRatio,
          model: 'dream-machine',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.lumaApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        generationId: response.data.id,
        status: response.data.status,
        prompt: fullPrompt
      };
    } catch (error) {
      console.error('Video generation error:', error);
      throw new Error(`Failed to generate video: ${error.message}`);
    }
  }

  /**
   * Проверка статуса генерации видео
   */
  async checkVideoStatus(generationId) {
    try {
      const response = await axios.get(
        `${this.lumaBaseUrl}/generations/${generationId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.lumaApiKey}`
          }
        }
      );

      return {
        status: response.data.status,
        videoUrl: response.data.video_url,
        progress: response.data.progress || 0
      };
    } catch (error) {
      console.error('Video status check error:', error);
      throw new Error(`Failed to check video status: ${error.message}`);
    }
  }

  /**
   * Синтез голоса через ElevenLabs
   */
  async synthesizeVoice(text, voiceId, language = 'en') {
    try {
      const response = await axios.post(
        `${this.elevenlabsBaseUrl}/text-to-speech/${voiceId}`,
        {
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.elevenlabsApiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Voice synthesis error:', error);
      throw new Error(`Failed to synthesize voice: ${error.message}`);
    }
  }
}

module.exports = new AIServices();

