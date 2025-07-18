const express = require('express');
const router = express.Router();

const {assignEmailToPass, getPasswordByEmail} = require("../db");
const {sendMail} = require("../mail-service");


router.post('/book-form-send', async (req, res) => {
    const { name, email, phone, type, date, time } = req.body;

    try {
        const assigned = await assignEmailToPass(email);
        const password = await getPasswordByEmail(email);
        const text = `New booking request:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nType: ${type}\nDate: ${date}\nTime: ${time}\nPassword: ${password}`;
        await sendMail(text);
        if (!assigned) {
            res.json({ message: 'E-mail on juba registreeritud'})
        } else {
            res.json({ message: 'Saadetud' });
        }
    } catch (error) {
        console.error('Error processing the form:', error);
        res.status(500).json({ error: 'Error processing the form' });
    }
});

module.exports = router;

