const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Путь к файлу с данными
const DATA_FILE = path.join(__dirname, 'data.json');

// Инициализация файла данных
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ clicks: 0, history: [] }, null, 2));
}

// Функция для чтения данных
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { clicks: 0, history: [] };
    }
}

// Функция для записи данных
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API: Получить статистику
app.get('/api/stats', (req, res) => {
    const data = readData();
    res.json(data);
});

// API: Записать клик
app.post('/api/track', (req, res) => {
    try {
        const clickData = req.body;
        const data = readData();
        
        data.clicks++;
        data.history.push({
            ...clickData,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' }),
            serverTime: new Date().toISOString()
        });
        
        writeData(data);
        
        res.json({ success: true, totalClicks: data.clicks });
    } catch (error) {
        console.error('Error tracking click:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API: Очистить статистику
app.post('/api/reset', (req, res) => {
    writeData({ clicks: 0, history: [] });
    res.json({ success: true, message: 'Stats reset' });
});

// Главная страница - редирект
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'redirect.html'));
});

// Страница статистики
app.get('/stats', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'stats.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📊 Статистика: http://localhost:${PORT}/stats`);
});
