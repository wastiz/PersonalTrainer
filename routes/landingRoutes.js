const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const translations = require(`../locales/${req.language}.json`);

    res.render('index', {
        layout: false,
        translations,
        googleApiKey: process.env.GOOGLE_API_KEY,
        calendarId: process.env.CALENDAR_ID,
    });
});

module.exports = router;
