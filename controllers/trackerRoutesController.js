const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
    const translations = require(`../locales/${req.language}-tracker.json`);

    res.render('tracker', {
        layout: 'layout',
        translations
    })
})

router.get('/:section', (req, res) => {
    const translations = require(`../locales/${req.language}-tracker.json`);
    const section = req.params.section;
    res.render(`tracker-sections/${section}`, {
        layout: 'layout',
        activeSection: section,
        translations
    });
});

module.exports = router;