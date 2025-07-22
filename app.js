const express = require('express');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const {urlencoded, json} = require("express");
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();
const expressLayouts = require('express-ejs-layouts');
const {trackingFunction} = require('./trackingScript');
const port = process.env.SERVER_PORT || 3003;
const jwt = require('jsonwebtoken');
const {schedule} = require("node-cron");
const landingController = require('./controllers/landingController');
const trackerRoutesController = require('./controllers/trackerRoutesController');
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
app.use('/', landingController);
app.use('/book-form-send', landingController);

// Маршруты для трекера
app.use('/fitness-tracker', trackerRoutesController);
app.use('/fitness-tracker/:section', trackerRoutesController);

// Маршрут для логина
app.use('/login', trackerLoginController);

//Марщрут для данных
app.use('/', trackerDataController);




schedule('0 0 * * *', () => {
    console.log('Running daily streaks and attendance reset...');
    trackingFunction();
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
