# 🚀 Инструкция по деплою

## Вариант 1: Railway.app (САМЫЙ ПРОСТОЙ - БЕЗ GITHUB!)

1. Перейдите на https://railway.app
2. Нажмите "Start a New Project"
3. Выберите "Deploy from local directory" или "Empty Project"
4. Установите Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```
5. В папке проекта выполните:
   ```bash
   cd /Users/erbolsadibekov/Desktop/utm
   railway login
   railway init
   railway up
   ```
6. Готово! Railway даст вам ссылку типа `https://your-app.railway.app`

## Вариант 2: Render.com (ЧЕРЕЗ GITHUB)

### Шаг 1: Создайте GitHub репозиторий

1. Зайдите на https://github.com/new
2. Repository name: `link-tracker`
3. НЕ ставьте галочки на README, .gitignore
4. Нажмите "Create repository"

### Шаг 2: Запушьте код

GitHub покажет команды, выполните их:

```bash
cd /Users/erbolsadibekov/Desktop/utm
git remote add origin https://github.com/ВАШ_USERNAME/link-tracker.git
git branch -M main
git push -u origin main
```

### Шаг 3: Деплой на Render.com

1. Зайдите на https://render.com
2. Нажмите "New" → "Web Service"
3. Подключите GitHub репозиторий
4. Настройки:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Нажмите "Create Web Service"
6. Подождите 2-3 минуты
7. Готово! Получите ссылку типа `https://link-tracker.onrender.com`

## Вариант 3: Vercel (ЧЕРЕЗ VERCEL CLI)

```bash
cd /Users/erbolsadibekov/Desktop/utm
npx vercel --prod
```

Следуйте инструкциям, логинитесь через браузер.

---

## 🎯 После деплоя

Ваши ссылки будут:
- **Отслеживаемая ссылка**: `https://your-app.com/`
- **Статистика**: `https://your-app.com/stats`

Делитесь первой ссылкой, смотрите статистику во второй!
