const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'admin',
    database: 'fitness_tracker',
    port: 5432,
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
        const queryCheckPassword = 'SELECT id, password FROM users WHERE email IS NULL LIMIT 1';
        const passwordRow = await client.query(queryCheckPassword);

        if (passwordRow.rows.length > 0) {
            const userId = passwordRow.rows[0].id;
            const availablePassword = passwordRow.rows[0].password;

            const queryUpdateEmail = 'UPDATE users SET email = $1 WHERE id = $2';
            await client.query(queryUpdateEmail, [email, userId]);

            console.log(`Email ${email} has been successfully assigned to password: ${availablePassword}`);
        } else {
            console.log('No available password to assign the email.');
        }
    } catch (err) {
        console.error('Error assigning email to the next available password:', err);
    } finally {
        client.release();
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
        const query = `SELECT * FROM training_sessions WHERE email = $1`;
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
};
