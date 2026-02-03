const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');

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
    fs.writeFileSync(DATA_FILE, JSON.stringify({ links: {} }, null, 2));
}

// Функция для чтения данных
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { links: {} };
    }
}

// Функция для записи данных
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Генерация короткого ID
function generateShortId() {
    return crypto.randomBytes(4).toString('hex');
}

// API: Создать новую ссылку
app.post('/api/create', (req, res) => {
    try {
        const { targetUrl, customAlias } = req.body;
        
        if (!targetUrl) {
            return res.status(400).json({ success: false, error: 'URL обязателен' });
        }
        
        const data = readData();
        const shortId = customAlias || generateShortId();
        
        // Проверка существования alias
        if (data.links[shortId]) {
            return res.status(400).json({ success: false, error: 'Этот alias уже занят' });
        }
        
        data.links[shortId] = {
            targetUrl,
            createdAt: new Date().toISOString(),
            clicks: 0,
            history: []
        };
        
        writeData(data);
        
        res.json({ 
            success: true, 
            shortId,
            shortUrl: `${req.protocol}://${req.get('host')}/${shortId}`,
            statsUrl: `${req.protocol}://${req.get('host')}/stats/${shortId}`
        });
    } catch (error) {
        console.error('Error creating link:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API: Получить все ссылки
app.get('/api/links', (req, res) => {
    const data = readData();
    const links = Object.entries(data.links).map(([id, link]) => ({
        id,
        ...link
    }));
    res.json({ success: true, links });
});

// API: Получить статистику по конкретной ссылке
app.get('/api/stats/:shortId', (req, res) => {
    const { shortId } = req.params;
    const data = readData();
    
    if (!data.links[shortId]) {
        return res.status(404).json({ success: false, error: 'Ссылка не найдена' });
    }
    
    res.json({ success: true, ...data.links[shortId] });
});

// API: Записать клик
app.post('/api/track/:shortId', (req, res) => {
    try {
        const { shortId } = req.params;
        const clickData = req.body;
        const data = readData();
        
        if (!data.links[shortId]) {
            return res.status(404).json({ success: false, error: 'Ссылка не найдена' });
        }
        
        data.links[shortId].clicks++;
        data.links[shortId].history.push({
            ...clickData,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' }),
            serverTime: new Date().toISOString()
        });
        
        writeData(data);
        
        res.json({ success: true, totalClicks: data.links[shortId].clicks });
    } catch (error) {
        console.error('Error tracking click:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API: Удалить ссылку
app.delete('/api/links/:shortId', (req, res) => {
    const { shortId } = req.params;
    const data = readData();
    
    if (!data.links[shortId]) {
        return res.status(404).json({ success: false, error: 'Ссылка не найдена' });
    }
    
    delete data.links[shortId];
    writeData(data);
    
    res.json({ success: true, message: 'Ссылка удалена' });
});

// Главная страница - генератор ссылок
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Страница общей статистики всех ссылок
app.get('/stats', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'stats.html'));
});

// Страница статистики конкретной ссылки
app.get('/stats/:shortId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'link-stats.html'));
});

// Редирект по короткой ссылке
app.get('/:shortId', (req, res) => {
    const { shortId } = req.params;
    const data = readData();
    
    if (!data.links[shortId]) {
        return res.status(404).send('Ссылка не найдена');
    }
    
    // Отправляем страницу редиректа с данными
    res.send(`
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Переадресация...</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
        }
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 4px solid white;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <h2>Переадресация...</h2>
        <p>Подождите немного</p>
    </div>
    <script>
        const TARGET_URL = '${data.links[shortId].targetUrl}';
        const SHORT_ID = '${shortId}';
        const API_URL = '/api/track/' + SHORT_ID;
        
        function getDeviceType() {
            const ua = navigator.userAgent;
            if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return '📱 Планшет';
            if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return '📱 Телефон';
            return '💻 Компьютер';
        }
        
        function getBrowserInfo() {
            const ua = navigator.userAgent;
            if (ua.indexOf('Firefox') > -1) return '🦊 Firefox';
            else if (ua.indexOf('SamsungBrowser') > -1) return '📱 Samsung Browser';
            else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return '🎭 Opera';
            else if (ua.indexOf('Trident') > -1) return '🌐 IE';
            else if (ua.indexOf('Edge') > -1) return '🌀 Edge';
            else if (ua.indexOf('Chrome') > -1) return '🌐 Chrome';
            else if (ua.indexOf('Safari') > -1) return '🧭 Safari';
            return 'Неизвестный';
        }
        
        function getOS() {
            const ua = navigator.userAgent;
            if (ua.indexOf('Win') > -1) return '🪟 Windows';
            if (ua.indexOf('Mac') > -1) return '🍎 macOS';
            if (ua.indexOf('Linux') > -1) return '🐧 Linux';
            if (ua.indexOf('Android') > -1) return '🤖 Android';
            if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) return '📱 iOS';
            return '❓ Неизвестная';
        }
        
        async function trackClick() {
            try {
                const clickData = {
                    referrer: document.referrer || 'Прямой переход',
                    referrerDomain: document.referrer ? new URL(document.referrer).hostname : 'Нет',
                    device: getDeviceType(),
                    browser: getBrowserInfo(),
                    os: getOS(),
                    screenResolution: screen.width + 'x' + screen.height,
                    windowSize: window.innerWidth + 'x' + window.innerHeight,
                    language: navigator.language || navigator.userLanguage,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    onlineStatus: navigator.onLine ? '🟢 Онлайн' : '🔴 Оффлайн',
                    cookiesEnabled: navigator.cookieEnabled ? '✅ Да' : '❌ Нет',
                    urlParams: window.location.search,
                    userAgent: navigator.userAgent
                };
                
                await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(clickData)
                });
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        trackClick();
        setTimeout(() => { window.location.href = TARGET_URL; }, 1000);
    </script>
</body>
</html>
    `);
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📊 Статистика: http://localhost:${PORT}/stats`);
});
