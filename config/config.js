require('dotenv').config();

console.log('DB USER:', process.env.DB_USER);
console.log("DB_NAME: " + process.env.DB_NAME);

module.exports = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD || null,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: "postgres"
    },
    test: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD || null,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: "postgres"
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD || null,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: "postgres"
    }
};
