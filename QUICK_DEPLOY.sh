#!/bin/bash

echo "🚀 Быстрый деплой на Render.com"
echo ""
echo "Шаг 1: Создайте репозиторий на GitHub"
echo "Откройте: https://github.com/new"
echo "Repository name: link-tracker"
echo "НЕ ставьте галочки!"
echo ""
read -p "Создали репозиторий? Введите ваш GitHub username: " username
echo ""
echo "Шаг 2: Пушим код на GitHub"
echo ""

cd /Users/erbolsadibekov/Desktop/utm

git remote add origin "https://github.com/$username/link-tracker.git"
git branch -M main
git push -u origin main

echo ""
echo "✅ Код загружен на GitHub!"
echo ""
echo "Шаг 3: Деплой на Render.com"
echo "1. Откройте: https://dashboard.render.com/"
echo "2. Нажмите 'New' → 'Web Service'"
echo "3. Подключите GitHub репозиторий 'link-tracker'"
echo "4. Настройки:"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "5. Нажмите 'Create Web Service'"
echo ""
echo "🎉 Готово! Через 2-3 минуты получите ссылку!"
