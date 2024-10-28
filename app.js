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
const {trackingFunction} = require('./trackingScript');
const port = 3002;
const jwt = require('jsonwebtoken');
const {schedule} = require("node-cron");
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

function sortWeekDays(weekDays) {
    const daysOrder = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday'
    ];

    return weekDays.sort((a, b) => {
        const indexA = daysOrder.indexOf(a.week_day.toLowerCase());
        const indexB = daysOrder.indexOf(b.week_day.toLowerCase());
        return indexA - indexB;
    });
}

app.post('/get-user-training-data', async (req, res) => {
    const { email } = req.body;
    try {
        const weekDaysResult = await pool.query(`SELECT * FROM training_days_weekly WHERE email = $1`, [email]);
        const weekDays = sortWeekDays(weekDaysResult.rows);


        const totalSessionsHoursResult = await pool.query(`SELECT sessions, hours FROM total_trainings WHERE email = $1`, [email]);
        const totalSessionsHours = totalSessionsHoursResult.rows[0] || { sessions: 0, hours: 0 };

        const streakResult = await pool.query(`SELECT streak FROM users_streaks WHERE email = $1`, [email]);
        const streak = streakResult.rows[0] ? streakResult.rows[0].streak : 0;

        if (weekDays.length === 0) {
            return res.json({
                weekDays: [],
                totalSessionsHours,
                streak,
                message: 'You have not set a training plan yet. Please create one.'
            });
        }

        res.json({ weekDays, totalSessionsHours, streak });
    } catch (error) {
        console.error('Error retrieving training data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/mark-training-attended', async (req, res) => {
    const { email, week_day } = req.body;

    console.log(email, week_day)

    try {
        await pool.query(`UPDATE training_days_weekly SET attended = TRUE, to_show = FALSE WHERE email = $1 AND week_day = $2;`, [email, week_day]);

        await pool.query(`UPDATE users_streaks SET streak = streak + 1 WHERE email = $1;`, [email]);

        const result = await pool.query(`SELECT session_duration_hours FROM training_plans WHERE email = $1;`, [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Training plan not found for this email.' });
        }

        const sessionDuration = result.rows[0].session_duration_hours;

        await pool.query(`
            INSERT INTO total_trainings (email, sessions, hours)
            VALUES ($1, 1, $2)
            ON CONFLICT (email) DO UPDATE 
            SET sessions = total_trainings.sessions + 1,
                hours = total_trainings.hours + $2;`,
            [email, sessionDuration]
        );

        res.status(200).send();
    } catch (error) {
        console.error('Error marking training as attended:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/set-training-plan', async (req, res) => {
    const { email, days, duration } = req.body;
    const daysArray = days.split(',').map(day => day.trim());
    console.log(email, days, duration)
    try {
        await pool.query(`DELETE FROM training_plans WHERE email = $1`, [email]);
        const insertPromises = daysArray.map(day => {
            return pool.query(`INSERT INTO training_plans (email, day_of_week, session_duration_hours) VALUES ($1, $2, $3)`, [email, day, duration]);
        });
        await Promise.all(insertPromises);

        const currentDate = new Date();
        const currentWeekDay = currentDate.toLocaleString('en-US', { weekday: 'long' });

        const passedDays = daysArray.filter(day => {
            const dayIndex = new Date(`${currentWeekDay} 00:00`).getDay();
            const targetDayIndex = new Date(`${day} 00:00`).getDay();
            return targetDayIndex < dayIndex;
        });

        for (const day of daysArray) {
            const attended = false;
            const toShow = !passedDays.includes(day);

            await pool.query(`INSERT INTO training_days_weekly (email, week_day, attended, to_show) VALUES ($1, $2, $3, $4)`, [email, day, attended, toShow]);
        }

        await pool.query(`INSERT INTO users_streaks (email, streak) VALUES ($1, $2)`, [email, 0]);


        res.status(200).send();
    } catch (error) {
        console.error('Error setting training plan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/set-calorie-plan', async (req, res) => {
    const { email, daily_calorie_goal } = req.body;
    const client = await pool.connect();

    try {
        await client.query(
            `INSERT INTO calorie_plans (email, daily_calorie_goal) 
             VALUES ($1, $2)
             ON CONFLICT (email)
             DO UPDATE SET daily_calorie_goal = EXCLUDED.daily_calorie_goal, updated_at = CURRENT_TIMESTAMP`,
            [email, daily_calorie_goal]
        );
        res.status(200).json({ message: 'Calorie plan updated successfully' });
    } catch (error) {
        console.error('Error inserting/updating calorie plan:', error);
        res.status(500).json({ message: 'Error updating calorie plan' });
    } finally {
        client.release();
    }
});


app.post('/add-calories', async (req, res) => {
    const { email, calories } = req.body;

    try {
        const client = await pool.connect();
        const query = `
            INSERT INTO calorie_entries (email, calories) 
            VALUES ($1, $2)
        `;
        await client.query(query, [email, calories]);
        client.release();
        res.json({ message: 'Calorie entry added successfully.' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/get-calorie-data', async (req, res) => {
    const { email } = req.body;

    try {
        const client = await pool.connect();

        const planQuery = `SELECT daily_calorie_goal FROM calorie_plans WHERE email = $1`;
        const planResult = await client.query(planQuery, [email]);
        const dailyGoal = planResult.rows[0]?.daily_calorie_goal || 0;

        const entriesQuery = `
            SELECT entry_date, SUM(calories) AS calories 
            FROM calorie_entries 
            WHERE email = $1 
            GROUP BY entry_date 
            ORDER BY entry_date
        `;
        const entriesResult = await client.query(entriesQuery, [email]);

        client.release();
        res.json({
            dailyGoal,
            calorieData: entriesResult.rows
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
});

schedule('0 0 * * *', () => {
    console.log('Running daily streaks and attendance reset...');
    trackingFunction();
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
