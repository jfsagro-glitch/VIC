# Инструкция по деплою через GitHub Actions

## Настройка GitHub Secrets

Перед первым деплоем нужно настроить секреты в GitHub:

1. Перейдите в репозиторий: https://github.com/jfsagro-glitch/VIC
2. Откройте **Settings** → **Secrets and variables** → **Actions**
3. Добавьте следующие секреты:

### Обязательные секреты для Vercel:

- `VERCEL_TOKEN` - токен Vercel (получить на https://vercel.com/account/tokens)
- `VERCEL_ORG_ID` - ID организации Vercel
- `VERCEL_PROJECT_ID` - ID проекта Vercel

### Опциональные:

- `REACT_APP_API_URL` - URL вашего backend API (по умолчанию: http://localhost:5000/api)

## Как получить Vercel токены:

1. Зарегистрируйтесь на [vercel.com](https://vercel.com)
2. Перейдите в **Settings** → **Tokens**
3. Создайте новый токен
4. Скопируйте токен в `VERCEL_TOKEN`

Для получения `VERCEL_ORG_ID` и `VERCEL_PROJECT_ID`:
1. Создайте проект на Vercel вручную один раз
2. В настройках проекта найдите эти ID
3. Или используйте Vercel CLI: `vercel link`

## Альтернатива: Деплой без Vercel

Если не хотите использовать Vercel, можно:

1. Удалить шаг "Deploy to Vercel" из `.github/workflows/deploy.yml`
2. Использовать другой хостинг (Netlify, GitHub Pages, etc.)
3. Или деплоить вручную через другие сервисы

## Ручной деплой через GitHub Pages:

Добавьте в workflow:

```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./client/build
```

## Проверка деплоя:

После push в main ветку:
1. Перейдите в **Actions** вкладку репозитория
2. Увидите запущенный workflow
3. После успешного выполнения проект будет задеплоен

## Troubleshooting:

- Если деплой не запускается, проверьте что workflow файл находится в `.github/workflows/`
- Проверьте что все секреты настроены правильно
- Убедитесь что ветка называется `main` или `master`

