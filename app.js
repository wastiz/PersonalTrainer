require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const {trackingFunction} = require('./trackingScript');
const port = process.env.SERVER_PORT;
const {schedule} = require("node-cron");
const landingRoutes = require('./routes/landingRoutes')
const trackerRoutes = require('./routes/trackerRoutes');
const landingController = require('./controllers/landingController');
const trackerLoginController = require('./controllers/trackerLoginController');
const trackerDataController = require('./controllers/trackerDataController');

// Настройка шаблонизатора EJS
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('views', path.join(__dirname, 'views'));

// Middleware для обработки данных формы
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware для обработки языка
app.use((req, res, next) => {
    const cookies = req.headers.cookie;
    const language = cookies?.split('; ')
        .find(row => row.startsWith('language='))
        ?.split('=')[1] || 'et';

    req.language = language;
    next();
});

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Маршруты для лендинга
app.use('/', landingRoutes);
app.use('/', landingController);

// Маршруты для трекера
app.use('/fitness-tracker', trackerRoutes);
app.use('/fitness-tracker/:section', trackerRoutes);

// Маршрут для логина
app.use('/login', trackerLoginController);

//Марщрут для данных
app.use('/tracker-data', trackerDataController);




schedule('0 0 * * *', () => {
    console.log('Running daily streaks and attendance reset...');
    trackingFunction();
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
