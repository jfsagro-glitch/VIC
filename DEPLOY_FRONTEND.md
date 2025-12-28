# Деплой Frontend на Vercel или Netlify

## Вариант 1: Деплой на Vercel (Рекомендуется)

### Шаг 1: Подготовка

1. Убедитесь, что у вас установлен Vercel CLI:
```bash
npm install -g vercel
```

2. Войдите в Vercel:
```bash
vercel login
```

### Шаг 2: Деплой

```bash
cd client
vercel
```

Или через веб-интерфейс:
1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите "New Project"
3. Импортируйте репозиторий GitHub
4. Укажите:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### Шаг 3: Настройка переменных окружения

В настройках проекта Vercel добавьте:
- `REACT_APP_API_URL` - URL вашего backend API (например: `https://your-api.vercel.app/api`)

### Шаг 4: Автоматический деплой

После подключения GitHub репозитория, каждый push в main ветку будет автоматически деплоить проект.

## Вариант 2: Деплой на Netlify

### Шаг 1: Подготовка

1. Установите Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Войдите в Netlify:
```bash
netlify login
```

### Шаг 2: Деплой

```bash
cd client
netlify deploy --prod
```

Или через веб-интерфейс:
1. Перейдите на [netlify.com](https://netlify.com)
2. Нажмите "Add new site" → "Import an existing project"
3. Подключите GitHub репозиторий
4. Настройки:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/build`

### Шаг 3: Настройка переменных окружения

В настройках сайта → Environment variables добавьте:
- `REACT_APP_API_URL` - URL вашего backend API

## Вариант 3: Деплой на GitHub Pages

### Шаг 1: Установите gh-pages

```bash
cd client
npm install --save-dev gh-pages
```

### Шаг 2: Обновите package.json

Добавьте в `scripts`:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d build"
```

И добавьте:
```json
"homepage": "https://jfsagro-glitch.github.io/VIC"
```

### Шаг 3: Деплой

```bash
npm run deploy
```

## Настройка API URL

После деплоя frontend, обновите `REACT_APP_API_URL` в настройках платформы на URL вашего backend.

Если backend еще не задеплоен, вы можете:
1. Задеплоить backend на Railway, Render, или Heroku
2. Или использовать локальный backend с ngrok для тестирования

## Проверка деплоя

После деплоя проверьте:
1. ✅ Сайт открывается
2. ✅ Все стили загружаются
3. ✅ API запросы работают (проверьте Network tab в DevTools)
4. ✅ Роутинг работает (попробуйте перейти на разные страницы)

## Troubleshooting

### Проблема: Белый экран после деплоя
- Проверьте консоль браузера на ошибки
- Убедитесь, что `REACT_APP_API_URL` настроен правильно
- Проверьте, что все пути к ресурсам относительные

### Проблема: 404 на роутах
- Убедитесь, что настроены redirects (см. `netlify.toml` или `vercel.json`)
- Для SPA все маршруты должны перенаправляться на `index.html`

### Проблема: API запросы не работают
- Проверьте CORS настройки на backend
- Убедитесь, что `REACT_APP_API_URL` указывает на правильный URL
- Проверьте, что backend доступен публично

