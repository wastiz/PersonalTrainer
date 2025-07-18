const express = require('express');
const {pool} = require('../db');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config();

const secretKey = process.env.SECRET_KEY;

//Middleware auth. kontrollimiseks
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

router.post('/', async (req, res) => {
    const { email, password } = req.body;

    console.log('signing...')

    try {
        const query = 'SELECT * FROM users WHERE email = $1 AND password = $2';
        const result = await pool.query(query, [email, password]);

        console.log(result);

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

module.exports = router;