const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Пути к файлам данных
const DATA_DIR = path.join(__dirname, '../data');
const EMPLOYEES_FILE = path.join(DATA_DIR, 'employees.json');
const TIME_DATA_FILE = path.join(DATA_DIR, 'timeData.json');

// Инициализация файлов данных, если их нет
async function initDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Начальные данные сотрудников (из вашего app.js)
    const initialEmployees = [
      { id:'sem', name:'Семёнцов Александр', role:'дизайнер', days:['Пн','Вт','Ср','Чт','Пт'], from:'10:00', to:'18:00', hours:'8:00', tg:'safon', tgLinked:true },
      { id:'vel', name:'Великанов Виктор', role:'дизайнер', days:['Пн','Вт','Ср','Чт','Пт'], from:'10:00', to:'18:00', hours:'8:00', tg:'safon', tgLinked:true },
      // ... остальные сотрудники
    ];
    
    const initialTimeData = {
      plan: {},
      fact: {}
    };
    
    if (!await fileExists(EMPLOYEES_FILE)) {
      await fs.writeFile(EMPLOYEES_FILE, JSON.stringify(initialEmployees, null, 2));
      console.log('Создан файл employees.json');
    }
    
    if (!await fileExists(TIME_DATA_FILE)) {
      await fs.writeFile(TIME_DATA_FILE, JSON.stringify(initialTimeData, null, 2));
      console.log('Создан файл timeData.json');
    }
  } catch (error) {
    console.error('Ошибка инициализации данных:', error);
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// API для сотрудников
app.get('/api/employees', async (req, res) => {
  try {
    const data = await fs.readFile(EMPLOYEES_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Ошибка чтения сотрудников:', error);
    res.status(500).json({ error: 'Ошибка чтения данных' });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const employees = req.body;
    await fs.writeFile(EMPLOYEES_FILE, JSON.stringify(employees, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка сохранения сотрудников:', error);
    res.status(500).json({ error: 'Ошибка сохранения данных' });
  }
});

// API для данных времени
app.get('/api/time-data', async (req, res) => {
  try {
    const data = await fs.readFile(TIME_DATA_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Ошибка чтения данных времени:', error);
    res.status(500).json({ error: 'Ошибка чтения данных' });
  }
});

app.post('/api/time-data', async (req, res) => {
  try {
    const timeData = req.body;
    await fs.writeFile(TIME_DATA_FILE, JSON.stringify(timeData, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка сохранения данных времени:', error);
    res.status(500).json({ error: 'Ошибка сохранения данных' });
  }
});

// Обновление данных для определенной даты
app.post('/api/time-data/:dateKey', async (req, res) => {
  try {
    const { dateKey } = req.params;
    const { employeeId, plan, fact } = req.body;
    
    const data = JSON.parse(await fs.readFile(TIME_DATA_FILE, 'utf8'));
    
    if (!data.plan[dateKey]) data.plan[dateKey] = {};
    if (!data.fact[dateKey]) data.fact[dateKey] = {};
    
    if (plan !== undefined) data.plan[dateKey][employeeId] = plan;
    if (fact !== undefined) data.fact[dateKey][employeeId] = fact;
    
    await fs.writeFile(TIME_DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления данных времени:', error);
    res.status(500).json({ error: 'Ошибка обновления данных' });
  }
});

// Обслуживание index.html для всех маршрутов (для SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Запуск сервера
async function startServer() {
  await initDataFiles();
  
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📁 Данные хранятся в папке: ${DATA_DIR}`);
  });
}

startServer();