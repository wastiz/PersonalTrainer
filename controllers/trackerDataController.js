const express = require('express');
const router = express.Router();

const { pool,
    insertBodyData,
    insertStrengthData,
    getBodyData,
    getStrengthData,
    insertUserCalculations, getCalorieData, getBmi
} = require('../db')


router.post('/get-user-dashboard-data', async (req, res) => {
    const { email } = req.body;

    try {
        const calorieData = await getCalorieData(email);
        const dailyGoal = calorieData.dailyGoal;
        const calorieDataEntries = calorieData.calorieData;

        const weekDaysResult = await pool.query('SELECT * FROM training_days_weekly WHERE email = $1', [email]);
        const weekDays = sortWeekDays(weekDaysResult.rows);

        const totalSessionsHoursResult = await pool.query('SELECT sessions, hours FROM total_trainings WHERE email = $1', [email]);
        const totalSessionsHours = totalSessionsHoursResult.rows[0] || { sessions: 0, hours: 0 };

        const streakResult = await pool.query('SELECT streak FROM users_streaks WHERE email = $1', [email]);
        const streak = streakResult.rows[0] ? streakResult.rows[0].streak : 0;

        const bmiData = await getBmi(email);

        res.json({
            dailyGoal,
            calorieData: calorieDataEntries,
            weekDays,
            totalSessionsHours,
            streak,
            bmi: bmiData.bmi
        });
    } catch (error) {
        console.error('Error retrieving user data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/submit-body-data', async (req, res) => {
    const { email, height, weight, waist, chest, shoulders, biceps, forearms, neck, hips, calves } = req.body;
    await insertBodyData(email, height, weight, waist, chest, shoulders, biceps, forearms, neck, hips, calves);
    res.json({ message: 'Body data submitted successfully.' });
});

router.post('/submit-strength-data', async (req, res) => {
    const { email, bench_press_wide, bench_press_narrow, bicep_curl, bent_over_one_arm_row, deadlift, squats } = req.body;
    await insertStrengthData(email, bench_press_wide, bench_press_narrow, bicep_curl, bent_over_one_arm_row, deadlift, squats);
    res.json({ message: 'Strength data submitted successfully.' });
});

router.post('/get-body-results', async (req, res) => {
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

router.post('/get-strength-results', async (req, res) => {
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

router.post('/get-user-training-data', async (req, res) => {
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


router.post('/mark-training-attended', async (req, res) => {
    const { email, week_day } = req.body;

    console.log(email, week_day)

    try {
        await pool.query(`UPDATE training_days_weekly SET attended = TRUE, to_show = FALSE WHERE email = $1 AND week_day = $2;`, [email, week_day]);

        await pool.query(`
        INSERT INTO users_streaks (email, streak)
        VALUES ($1, 1)
        ON CONFLICT (email) 
        DO UPDATE SET streak = users_streaks.streak + 1;
        `, [email]);

        const result = await pool.query(`SELECT session_duration_hours FROM training_plans WHERE email = $1;`, [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Training plan not found for this email.' });
        }

        const sessionDuration = result.rows[0].session_duration_hours;

        await pool.query(`
        INSERT INTO total_trainings (email, sessions, hours)
        VALUES ($1, 1, $2)
        ON CONFLICT (email) DO UPDATE 
        SET sessions = total_trainings.sessions + 1, hours = total_trainings.hours + EXCLUDED.hours;`, [email, sessionDuration]
        );

        res.status(200).send();
    } catch (error) {
        console.error('Error marking training as attended:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/set-training-plan', async (req, res) => {
    const { email, days, duration } = req.body;
    const daysArray = days.split(',').map(day => day.trim());

    try {
        await pool.query(`DELETE FROM training_plans WHERE email = $1`, [email]);

        for (const day of daysArray) {
            const existingPlan = await pool.query(
                `SELECT * FROM training_plans WHERE email = $1 AND day_of_week = $2`,
                [email, day]
            );

            if (existingPlan.rows.length > 0) {
                await pool.query(
                    `UPDATE training_plans SET session_duration_hours = $1 WHERE email = $2 AND day_of_week = $3`,
                    [duration, email, day]
                );
            } else {
                await pool.query(
                    `INSERT INTO training_plans (email, day_of_week, session_duration_hours) VALUES ($1, $2, $3)`,
                    [email, day, duration]
                );
            }
        }

        const currentDate = new Date();
        const currentWeekDay = currentDate.toLocaleString('en-US', { weekday: 'long' });
        const dayIndex = new Date(`${currentWeekDay} 00:00`).getDay();

        const passedDays = daysArray.filter(day => {
            const targetDayIndex = new Date(`${day} 00:00`).getDay();
            return targetDayIndex < dayIndex;
        });

        await pool.query(`DELETE FROM training_days_weekly WHERE email = $1`, [email]);

        for (const day of daysArray) {
            const attended = false;
            const toShow = !passedDays.includes(day);

            await pool.query(
                `INSERT INTO training_days_weekly (email, week_day, attended, to_show) VALUES ($1, $2, $3, $4)`,
                [email, day, attended, toShow]
            );
        }

        res.status(200).send();
    } catch (error) {
        console.error('Error setting training plan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/set-calorie-plan', async (req, res) => {
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


router.post('/add-calories', async (req, res) => {
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

router.post('/get-calorie-data', async (req, res) => {
    const { email } = req.body;

    try {
        const data = await getCalorieData(email); // Нужно добавить await
        if (data) {
            res.json({
                dailyGoal: data.dailyGoal,
                calorieData: data.calorieData,
            });
        } else {
            res.status(404).json({ message: 'No calorie data found for this user' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/submit-calculations', async (req, res) => {
    const { email, bmi, bmiCategory, calories } = req.body;
    console.log(bmi, calories)
    try {
        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }

        await insertUserCalculations(email, calories, bmi, bmiCategory);
        res.status(200).json({ message: 'Data saved successfully' });
    } catch (err) {
        console.error('Error inserting/updating data:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/get-bmi', async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }

        const data = await getBmi(email);
        res.json({data})
    } catch (e) {
        console.error(e)
    }
})

module.exports = router;