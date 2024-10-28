const {pool} = require('./db')

async function trackingFunction() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Получаем текущую дату и день недели
        const currentDate = new Date();
        const currentWeekDay = currentDate.toLocaleString('en-US', { weekday: 'long' });

        // Определяем предыдущий день недели
        const previousWeekDay = getPreviousWeekDay(currentWeekDay);

        // Получаем всех пользователей
        const usersRes = await client.query(`SELECT DISTINCT email FROM users`);

        // Проверяем посещения у каждого пользователя за день раньше
        for (const user of usersRes.rows) {
            const email = user.email;
            // Получаем статус посещения на день раньше
            const trainingDaysRes = await client.query(
                `SELECT attended FROM training_days_weekly WHERE email = $1 AND week_day = $2`,
                [email, previousWeekDay]
            );

            // Проверяем, посещал ли пользователь этот день
            const attended = trainingDaysRes.rows.length > 0 && trainingDaysRes.rows[0].attended;

            // Сбрасываем стрик, если не посещал
            if (!attended) {
                await client.query(`UPDATE users_streaks SET streak = 0 WHERE email = $1`, [email]);
            }

            await client.query(`UPDATE training_days_weekly SET to_show = FALSE WHERE email = $1 AND week_day = $2;`, [email, previousWeekDay]);
        }

        // Если понедельник, сбрасываем посещения для всех пользователей
        if (currentWeekDay === 'Monday') {
            for (const user of usersRes.rows) {
                const email = user.email;
                await client.query(`UPDATE training_days_weekly SET attended = FALSE, to_show = TRUE WHERE email = $1`, [email]);
            }
        }

        await client.query('COMMIT');
        console.log('Streaks updated and attendance reset successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating streaks and resetting attendance:', error);
    } finally {
        client.release();
    }
}

function getPreviousWeekDay(currentDay) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const index = days.indexOf(currentDay);
    return index === 0 ? days[6] : days[index - 1];
}


module.exports = {
    trackingFunction
};