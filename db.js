const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'fitness_tracker',
    connectionLimit: 5
});

pool.getConnection()
    .then(conn => {
        console.log('Successfully connected to db');
        conn.release();
    })
    .catch(err => {
        console.error('Error connecting to db', err);
    });

async function getPasswordByEmail(email) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = 'SELECT password FROM users WHERE email = ?';
        const rows = await conn.query(query, [email]);

        if (rows.length > 0) {
            return rows[0].password;
        } else {
            console.log('No user found with this email.');
            return null;
        }
    } catch (err) {
        console.error('Error fetching password by email:', err);
    } finally {
        if (conn) conn.release();
    }
}

async function assignEmailToPass(email) {
    let conn;
    try {
        conn = await pool.getConnection();

        const queryCheckPassword = 'SELECT id, password FROM users WHERE email IS NULL LIMIT 1';
        const passwordRow = await conn.query(queryCheckPassword);

        if (passwordRow.length > 0) {
            const userId = passwordRow[0].id;
            const availablePassword = passwordRow[0].password;

            const queryUpdateEmail = 'UPDATE users SET email = ? WHERE id = ?';
            await conn.query(queryUpdateEmail, [email, userId]);

            console.log(`Email ${email} has been successfully assigned to password: ${availablePassword}`);
        } else {
            console.log('No available password to assign the email.');
        }
    } catch (err) {
        console.error('Error assigning email to the next available password:', err);
    } finally {
        if (conn) conn.release();
    }
}

async function insertBodyData(email, waist, chest, shoulders, biceps, forearms, neck, hips, calves) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO body_data (email, waist, chest, shoulders, biceps, forearms, neck, hips, calves) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await conn.query(query, [email, waist, chest, shoulders, biceps, forearms, neck, hips, calves]);
        console.log(`Body data for ${email} inserted successfully.`);
    } catch (err) {
        console.error('Error inserting body data:', err);
    } finally {
        if (conn) conn.release();
    }
}

async function insertStrengthData(email, benchPressWide, benchPressNarrow, bicepCurl, bentOverOneArmRow, deadlift, squats) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO strength_data (email, bench_press_wide, bench_press_narrow, bicep_curl, 
                        bent_over_one_arm_row, deadlift, squats) 
                       VALUES (?, ?, ?, ?, ?, ?, ?)`;
        await conn.query(query, [email, benchPressWide, benchPressNarrow, bicepCurl, bentOverOneArmRow, deadlift, squats]);
        console.log(`Strength data for ${email} inserted successfully.`);
    } catch (err) {
        console.error('Error inserting strength data:', err);
    } finally {
        if (conn) conn.release();
    }
}


module.exports = {
    pool,
    assignEmailToPass,
    getPasswordByEmail,
    insertBodyData,
    insertStrengthData
};
