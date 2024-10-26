const express = require('express');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const nodemailer = require('nodemailer');
const config = require('./config');
const {urlencoded, json} = require("express");
const bodyParser = require('body-parser');
const app = express();
const {pool, assignEmailToPass, insertBodyData, insertStrengthData, getBodyData, getStrengthData, getTrainingsData,
    getUserWeeks
} = require('./db')
const port = 3002;
const jwt = require('jsonwebtoken');
const secretKey = 'your_secret_key';

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

app.get('/fitness-tracker/:section', async (req, res) => {
    const section = req.params.section;
    res.render(`tracker-sections/${section}`);

});

//Middleware для проверки аунтефикации
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // Извлекаем токен из заголовка

    if (!token) return res.sendStatus(401);

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.post('/fitness-tracker/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const query = 'SELECT * FROM users WHERE email = $1 AND password = $2';
        const result = await pool.query(query, [email, password]);

        if (result.rows.length > 0) {
            const token = jwt.sign({ id: result.rows[0].id, email: result.rows[0].email }, secretKey, { expiresIn: '1h' });
            res.json({ message: 'Login successful', token: token });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error executing query', error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/fitness-tracker/submit-body-data', async (req, res) => {
    const { email, height, weight, waist, chest, shoulders, biceps, forearms, neck, hips, calves } = req.body;
    await insertBodyData(email, height, weight, waist, chest, shoulders, biceps, forearms, neck, hips, calves);
    res.json({ message: 'Body data submitted successfully.' });
});

app.post('/fitness-tracker/submit-strength-data', async (req, res) => {
    const { email, bench_press_wide, bench_press_narrow, bicep_curl, bent_over_one_arm_row, deadlift, squats } = req.body;
    await insertStrengthData(email, bench_press_wide, bench_press_narrow, bicep_curl, bent_over_one_arm_row, deadlift, squats);
    res.json({ message: 'Strength data submitted successfully.' });
});

app.post('/fitness-tracker/get-body-results', async (req, res) => {
    const { email } = req.body;

    try {
        const response = await getBodyData(email);

        if (response) {
            res.json(response);
        } else {
            res.status(404).json({ message: 'No body data found' });
        }
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/fitness-tracker/get-strength-results', async (req, res) => {
    const { email } = req.body;

    try {
        const response = await getStrengthData(email);

        if (response) {
            res.json(response);
        } else {
            res.status(404).json({ message: 'No strength data found' });
        }
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/fitness-tracker/get-trainings-results', async (req, res) => {
    const { email } = req.body;

    console.log(email);

    try {
        const trainingsData = await getTrainingsData(email);
        const userWeeks = await getUserWeeks(email);

        if (trainingsData && userWeeks) {
            res.json({ trainingsData, userWeeks });
        } else {
            res.status(404).json({ message: 'No trainings data found' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
});




app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
