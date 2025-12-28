const mongoose = require('mongoose');

const MediaFileSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['video', 'audio', 'subtitle'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  duration: Number,
  sceneIndex: Number, // для видео - индекс сцены
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SubtitleSchema = new mongoose.Schema({
  text: String,
  startTime: Number,
  endTime: Number,
  sceneIndex: Number
});

const TaskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['script_generation', 'video_generation', 'voice_synthesis', 'music_overlay', 'final_assembly'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  result: mongoose.Schema.Types.Mixed,
  error: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

const ProjectSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    default: 'Untitled Project'
  },
  template: {
    type: String,
    required: true
  },
  parameters: {
    videoType: {
      type: String,
      enum: ['product', 'promo', 'tutorial', 'testimonial', 'corporate'],
      required: true
    },
    text: String,
    style: {
      type: String,
      enum: ['modern', 'classic', 'cinematic', 'minimalist', 'dynamic']
    },
    voice: {
      provider: String,
      voiceId: String,
      language: String
    },
    music: {
      genre: String,
      intensity: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      url: String
    },
    duration: Number, // в секундах
    aspectRatio: {
      type: String,
      enum: ['16:9', '9:16', '1:1'],
      default: '16:9'
    }
  },
  script: {
    scenes: [{
      sceneIndex: Number,
      prompt: String,
      duration: Number,
      subtitle: String
    }]
  },
  mediaFiles: [MediaFileSchema],
  subtitles: [SubtitleSchema],
  tasks: [TaskSchema],
  status: {
    type: String,
    enum: ['draft', 'generating', 'ready', 'editing', 'completed'],
    default: 'draft'
  },
  finalVideoUrl: String,
  thumbnailUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ProjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);

