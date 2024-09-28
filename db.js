const {Pool} = require('pg')

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'admin',
    port: 5432,
});


pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error connecting to db', err);
    }
    console.log('Successfully connected to db');
    release();
});

module.exports = {pool};