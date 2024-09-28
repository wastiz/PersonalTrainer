const express = require('express');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const nodemailer = require('nodemailer');
const config = require('./config');
const {urlencoded, json} = require("express");
const bodyParser = require('body-parser');
const app = express();
const {pool} = require('./db')
const port = 3002;

// Настройка шаблонизатора EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware для обработки данных формы
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Настройка Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.emailUser,
        pass: config.emailPass
    }
});

// Главная страница
app.get('/', (req, res) => {
    const lang = req.query.lang || 'et';
    const translations = require(`./locales/${lang}.json`);

    res.render('index', {
        translations,
        googleApiKey: config.apiKeys.googleApiKey,
        calendarId: config.calendarId
    });
});

// Обработка отправки формы
app.post('/send', (req, res) => {
    const { name, email, message } = req.body;

    const mailOptions = {
        from: email,
        to: config.emailUser,
        subject: `Message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send('Error occurred: ' + error.message);
        }
        res.status(200).send('Message sent successfully!');
    });
});

app.get('/fitness-tracker', (req, res) => {
    res.render('tracker')
})

app.get('/fitness-tracker/:section', (req, res) => {
    const section = req.params.section;
    res.render(`tracker-sections/${section}`);
});

app.post('/fitness-tracker/login', async (req, res) => {
    const data = req.body
    console.log(data)

    try {
        const result = await pool.query('SELECT * FROM users_passwords WHERE email = $1 AND password = $2', [data.email, data.pass]);

        if (result.rows.length > 0) {
            res.json({ message: 'Login successful', user: result.rows[0] });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error executing query', error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
