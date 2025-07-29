const { Pool } = require('pg');
const client = require("express");

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

pool.connect()
    .then(client => {
        console.log('Successfully connected to db');
        client.release();
    })
    .catch(err => {
        console.error('Error connecting to db', err);
    });

async function getPasswordByEmail(email) {
    const client = await pool.connect();
    try {
        const query = 'SELECT password FROM users WHERE email = $1';
        const res = await client.query(query, [email]);

        if (res.rows.length > 0) {
            return res.rows[0].password;
        } else {
            console.log('No user found with this email.');
            return null;
        }
    } catch (err) {
        console.error('Error fetching password by email:', err);
    } finally {
        client.release();
    }
}

async function assignEmailToPass(email) {
    const client = await pool.connect();
    try {
        const queryExistingEmail = 'SELECT 1 FROM users WHERE email = $1';
        const existingEmailResult = await client.query(queryExistingEmail, [email]);

        if (existingEmailResult.rows.length > 0) {
            return false;
        }

        const queryCheckPassword = 'SELECT id, password FROM users WHERE email IS NULL LIMIT 1';
        const passwordRow = await client.query(queryCheckPassword);

        if (passwordRow.rows.length > 0) {
            const userId = passwordRow.rows[0].id;

            const queryUpdateEmail = 'UPDATE users SET email = $1 WHERE id = $2';
            await client.query(queryUpdateEmail, [email, userId]);

            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.error('viga emaili kirjutamisel:', err);
        throw err;
    } finally {
        client.release();
    }
}

async function getUserOverallData(email) {
    const query = `
        SELECT
            COALESCE(SUM(ce.calories), 0) AS calories_consumed,
            COALESCE(cp.daily_calorie_goal, 0) - COALESCE(SUM(ce.calories), 0) AS calories_remaining,
            uc.bmi
        FROM
            calorie_entries ce
            LEFT JOIN calorie_plans cp ON ce.email = cp.email
            LEFT JOIN user_calculations uc ON ce.email = uc.email
        WHERE
            ce.entry_date = CURRENT_DATE
            AND ce.email = $1
        GROUP BY
            cp.daily_calorie_goal,
            uc.bmi
    `;

    const result = await pool.query(query, [email]);

    if (result.rows.length > 0) {
        return result.rows[0];
    } else {
        return null;
    }
}

async function insertBodyData(email, height, weight, waist, chest, shoulders, biceps, forearms, neck, hips, calves) {
    const client = await pool.connect();
    try {
        const query = `INSERT INTO body_data (email, height, weight, waist, chest, shoulders, biceps, forearms, neck, hips, calves) 
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;
        await client.query(query, [email, height, weight, waist, chest, shoulders, biceps, forearms, neck, hips, calves]);
        console.log(`Body data for ${email} inserted successfully.`);
    } catch (err) {
        console.error('Error inserting body data:', err);
    } finally {
        client.release();
    }
}

async function insertStrengthData(email, benchPressWide, benchPressNarrow, bicepCurl, bentOverOneArmRow, deadlift, squats) {
    const client = await pool.connect();
    try {
        const query = `INSERT INTO strength_data (email, bench_press_wide, bench_press_narrow, bicep_curl, 
                        bent_over_one_arm_row, deadlift, squats) 
                       VALUES ($1, $2, $3, $4, $5, $6, $7)`;
        await client.query(query, [email, benchPressWide, benchPressNarrow, bicepCurl, bentOverOneArmRow, deadlift, squats]);
        console.log(`Strength data for ${email} inserted successfully.`);
    } catch (err) {
        console.error('Error inserting strength data:', err);
    } finally {
        client.release();
    }
}

async function getBodyData(email) {
    const client = await pool.connect();
    try {
        const query = `SELECT * FROM body_data WHERE email = $1`;
        const res = await client.query(query, [email]);

        if (res.rows.length > 0) {
            console.log(`Body data for ${email} retrieved successfully:`);
            return res.rows;
        } else {
            console.log(`No body data found for ${email}.`);
            return null;
        }
    } catch (err) {
        console.error('Error retrieving body data:', err);
        throw err;
    } finally {
        client.release();
    }
}


async function getStrengthData(email) {
    const client = await pool.connect();
    try {
        const query = `SELECT * FROM strength_data WHERE email = $1`;
        const res = await client.query(query, [email]);

        if (res.rows.length > 0) {
            console.log(`Strength data for ${email} retrieved successfully:`);
            return res.rows;
        } else {
            console.log(`No strength data found for ${email}.`);
            return null;
        }
    } catch (err) {
        console.error('Error retrieving strength data:', err);
        throw err;
    } finally {
        client.release();
    }
}

async function getUserWeeks (email) {
    const client = await pool.connect();
    try {
        const query = `SELECT * FROM training_days WHERE email = $1`;
        const res = await client.query(query, [email]);
        if (res.rows.length > 0) {
            return res.rows;
        } else {
            return null;
        }
    } catch (e) {
        console.error(e)
    } finally {
        client.release();
    }
}

async function getTrainingsData(email) {
    const client = await pool.connect();
    try {
        const query = `SELECT * FROM attendance_streaks WHERE email = $1`;
        const res = await client.query(query, [email]);

        if (res.rows.length > 0) {
            console.log(`Traingings data for ${email} retrieved successfully:`);
            return res.rows;
        } else {
            console.log(`No trainings data found for ${email}.`);
            return null;
        }
    } catch (err) {
        console.error('Error retrieving trainings data:', err);
        throw err;
    } finally {
        client.release();
    }
}

async function getCalorieData(email) {
    const client = await pool.connect();

    try {
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

        return {
            dailyGoal: dailyGoal,
            calorieData: entriesResult.rows
        };
    } catch (e) {
        console.error('Cannot get calorie data for ${email}.', e);
    } finally {
        client.release();
    }
}

async function insertUserCalculations(email, calories = null, bmi = null, bmiCategory = null) {
    const client = await pool.connect();
    try {
        const query = `
            INSERT INTO user_calculations (email, calorie_needs, bmi, bmi_category)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email)
            DO UPDATE SET 
                calorie_needs = COALESCE(EXCLUDED.calorie_needs, user_calculations.calorie_needs),
                bmi = COALESCE(EXCLUDED.bmi, user_calculations.bmi),
                bmi_category = COALESCE(EXCLUDED.bmi_category, user_calculations.bmi_category)
        `;
        await client.query(query, [email, calories, bmi, bmiCategory]);
        console.log(`Calculations for ${email} inserted/updated successfully.`);
    } catch (err) {
        console.error('Error inserting/updating user calculations:', err);
    } finally {
        client.release();
    }
}

async function getBmi(email) {
    const client = await pool.connect();
    try {
        const query = `SELECT bmi FROM user_calculations WHERE email = $1`;
        const result = await client.query(query, [email]);

        if (result.rows.length > 0) {
            return { bmi: result.rows[0].bmi };
        } else {
            return { bmi: null };
        }
    } catch (e) {
        console.error('Error fetching BMI:', e);
        throw e;
    } finally {
        client.release();
    }
}



module.exports = {
    pool,
    assignEmailToPass,
    getPasswordByEmail,
    insertBodyData,
    insertStrengthData,
    getBodyData,
    getStrengthData,
    getUserWeeks,
    getTrainingsData,
    getCalorieData,
    insertUserCalculations,
    getBmi
};
